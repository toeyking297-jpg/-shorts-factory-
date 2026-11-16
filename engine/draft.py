"""Draft QC: check every scene on ONE still frame before the slow full render.

For each scene we build the frame the viewer will see once the animations have settled (picture + overlay or
map + channel tag + a caption sample), measure every text box (deterministic collision check) and let Gemini
look at all frames at once for pictures that contradict the narration. Problems are returned per scene so only
those scenes get repaired.
"""
from __future__ import annotations

import io
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw

from . import anim, brain, globe, graphics, typo
from .check import issue
from .common import ffmpeg_bin, load_config, log, probe_duration, read_json, write_json

W, H = 1080, 1920


def _grab(path: Path, at: float) -> Image.Image | None:
    """One frame of a video (or the photo), cover-cropped to 9:16."""
    try:
        if path.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"):
            im = Image.open(path).convert("RGB")
        else:
            res = subprocess.run([ffmpeg_bin(), "-v", "error", "-ss", f"{at:.2f}", "-i", str(path), "-frames:v", "1",
                                  "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True)
            if res.returncode != 0 or not res.stdout:
                return None
            im = Image.open(io.BytesIO(res.stdout)).convert("RGB")
    except Exception:
        return None
    s = max(W / im.width, H / im.height)
    im = im.resize((int(im.width * s + 0.5), int(im.height * s + 0.5)), Image.LANCZOS)
    x, y = (im.width - W) // 2, (im.height - H) // 2
    return im.crop((x, y, x + W, y + H)).convert("RGBA")


def _caption(img: Image.Image, text: str) -> None:
    """Rough caption sample in the caption band (to see what competes with it)."""
    words = re.sub(r"[^\w' ,.-]", "", text).upper().split()[:3]
    if not words:
        return
    line = " ".join(words)
    size, _ = typo.fit_lines(line, 820, 88, 40, 1)
    sp = typo.sprite(line, size, (255, 255, 255), "bold", 7, 0, True)
    typo.paste(img, sp, W / 2, 1310)


def keyframes(ep: Path) -> tuple[list[Image.Image], list[dict]]:
    cfg = load_config()
    script = read_json(ep / "script.json")
    t = read_json(ep / "build" / "timings.json")
    hdr = graphics.Painter(cfg).header(cfg["channel_name"])
    frames, issues = [], []
    for i, (sc, tm) in enumerate(zip(script["scenes"], t["scenes"])):
        dur = tm["end"] - tm["start"]
        v = sc.get("visual", {})
        img = None
        if v.get("type") == "map" or v.get("_kind") == "none" and not v.get("_asset"):
            spec = v if v.get("type") == "map" else {"type": "map", "zoom": "none"}
            img, rep = globe.still(cfg, spec, dur)
            for it in rep.get("issues", []):
                issues.append(issue("visual", f"scene {i}: map text layout: {it}", i, None if "left out" in it else
                                    "script", blocking="left out" not in it))
        elif v.get("_asset"):
            asset = ep / "assets" / v["_asset"]
            start = v.get("start", 1.0 if probe_duration(asset) > dur + 2.5 else 0.0)
            img = _grab(asset, start + dur * 0.6)
        if img is None:
            img = Image.new("RGBA", (W, H), (20, 20, 24, 255))
        if sc.get("overlay"):
            ov, rep = anim.still(cfg, sc["overlay"], dur)
            img.alpha_composite(ov)
            for it in rep.get("issues", []):
                issues.append(issue("visual", f"scene {i}: overlay text layout: {it}", i, "script"))
        img.alpha_composite(hdr)
        if v.get("type") != "loop":
            _caption(img, sc["text"])
        frames.append(img.convert("RGB"))
    return frames, issues


def sheet(frames: list[Image.Image], out: Path, cols: int = 4) -> Path:
    tw, th = 270, 480
    rows = (len(frames) + cols - 1) // cols
    sh = Image.new("RGB", (cols * tw, rows * (th + 28)), (12, 12, 14))
    d = ImageDraw.Draw(sh)
    for k, f in enumerate(frames):
        x, y = (k % cols) * tw, (k // cols) * (th + 28)
        sh.paste(f.resize((tw, th), Image.LANCZOS), (x, y + 28))
        d.text((x + 8, y + 6), f"SCENE {k}", fill=(255, 210, 0))
    sh.save(out, quality=86)
    return out


def review(ep: Path) -> list[dict]:
    """Deterministic layout issues + one Gemini look at all scene frames. Returns per-scene issues."""
    script = read_json(ep / "script.json")
    frames, issues = keyframes(ep)
    out = sheet(frames, ep / "build" / "draft.jpg")
    if brain.available():
        lines = "\n".join(f"SCENE {i}: \"{sc['text']}\"" + (f"  (must show: {', '.join(sc['visual'].get('must_show', []))}"
                          f"; must not show: {', '.join(sc['visual'].get('must_not_show', []))})"
                          if sc.get("visual", {}).get("must_show") or sc.get("visual", {}).get("must_not_show") else "")
                          for i, sc in enumerate(script["scenes"]))
        try:
            res, _ = brain.ask_json([
                "You are the picture editor of a factual YouTube Short. The image shows one still per scene (labelled "
                "SCENE n, top-left). Narration per scene:\n" + lines +
                "\nFor each scene decide if the PICTURE fits the narration: it must show what is said, must not "
                "contradict it (e.g. a beach when the narration says open ocean far from land, a cropped part when "
                "the narration names the whole object, the wrong country/climate/era), must not look AI-generated "
                "for a real subject, and on-screen text must be readable and must not overlap other text. Ignore "
                "the caption line near the bottom. Be strict but fair: generic but correct stock footage is OK.\n"
                "Return JSON {\"scenes\": [{\"scene\": n, \"ok\": true|false, \"problem\": \"few words\", "
                "\"fix\": \"new_picture\"|\"text\"|\"none\"}]}", out.read_bytes()])
            for s in res.get("scenes", []):
                try:
                    i = int(s.get("scene"))
                except (TypeError, ValueError):
                    continue
                if s.get("ok") is False and 0 <= i < len(script["scenes"]):
                    fix = "refetch" if s.get("fix") == "new_picture" else ("script" if s.get("fix") == "text" else None)
                    if script["scenes"][i].get("visual", {}).get("type") not in ("footage", "image") and fix == "refetch":
                        fix = None
                    issues.append(issue("visual", f"scene {i}: draft review: {s.get('problem', '')}", i, fix,
                                        blocking=fix is not None))
        except Exception as e:  # noqa: BLE001
            log(f"draft review skipped: {e}")
    write_json(ep / "build" / "draft_report.json", issues)
    log(f"draft QC: {len(issues)} issue(s)" + "".join(f"\n  - {i['msg']}" for i in issues))
    return issues
