"""Limited-animation renderer: layered stills + per-speaker mouth flap + blinks + slow camera, cut on the
real-audio timeline. Frames are composed on a 1188x2112 stage and only ever scaled DOWN to the output.

  preview -> episodes/EPxxx/preview/{animatic_}preview.mp4  (540x960)
  full    -> episodes/EPxxx/preview/{animatic_}full.mp4     (1080x1920, placeholders allowed, labelled)
  final   -> episodes/EPxxx/export/final.mp4                (1080x1920, refused while any asset is a placeholder)
"""
from __future__ import annotations

import hashlib
import subprocess
import time

from PIL import Image, ImageDraw, ImageFont

from .common import (ASSETS, FONT, FONT_BOLD, FONT_DIR, FPS, OUT_H, OUT_W, STAGE_H, STAGE_W, ep_dir, hex_rgb, load,
                     resolve, save, step_set)
from .assets import open_asset

TALK_BOB = {"C01": 0, "C02": 7, "C03": 3}      # px at scale 1 (deadpan C01 never bobs)


def _ease(u):
    u = min(max(u, 0.0), 1.0)
    return u * u * (3 - 2 * u)


def _keys(keys, t, lines, s0):
    pts = [(resolve(k[0], lines, s0), *k[1:]) for k in keys]
    if t <= pts[0][0]:
        return pts[0][1:]
    for a, b in zip(pts, pts[1:]):
        if t <= b[0]:
            u = _ease((t - a[0]) / max(b[0] - a[0], 1e-6))
            return tuple(x + (y - x) * u for x, y in zip(a[1:], b[1:]))
    return pts[-1][1:]


def _paste(base, im, x, y):
    x, y = int(round(x)), int(round(y))
    l, t = max(0, -x), max(0, -y)
    r, b = min(im.width, base.width - x), min(im.height, base.height - y)
    if r <= l or b <= t:
        return
    base.alpha_composite(im.crop((l, t, r, b)) if (l, t, r, b) != (0, 0, im.width, im.height) else im,
                         (x + l, y + t))


def _blinks(seed: str, s0: float, s1: float):
    h = int(hashlib.md5(seed.encode()).hexdigest()[:8], 16)
    out, t = [], s0 + 0.8 + (h % 100) / 100
    k = 0
    while t < s1 - 0.2:
        out.append(t)
        k += 1
        t += 2.4 + ((h >> (k % 24)) % 180) / 100
    return out


class Episode:
    def __init__(self, ep):
        self.d = ep_dir(ep)
        self.ep = ep
        self.tl = load(self.d / "timeline.json")
        self.sl = load(self.d / "shotlist.json")
        self.man = load(ASSETS / "manifest.json")
        self.lines = self.tl["lines"]
        self._img, self._scaled = {}, {}
        self.used = set()
        self.mouth_log = []

    def img(self, aid):
        if aid not in self._img:
            im, st = open_asset(self.man, aid)
            self._img[aid] = im
            self.used.add((aid, st))
        return self._img[aid]

    def scaled(self, aid, s):
        k = (aid, round(s, 4))
        if k not in self._scaled:
            im = self.img(aid)
            self._scaled[k] = im if abs(s - 1) < 1e-4 else im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
        return self._scaled[k]

    def speaking(self, cid, t):
        for did, L in self.lines.items():
            if L["speaker"] == cid and L["start"] <= t < L["end"]:
                return did, L
        return None, None

    def mouth(self, cid, rest, t):
        did, L = self.speaking(cid, t)
        if not L:
            return rest, False
        k = int((t - L["start"]) * FPS) // 2 * 2
        env = L["env"]
        lvl = (env[k] if k < len(env) else 0) * 0.5 + (env[k + 1] if k + 1 < len(env) else 0) * 0.5
        if L["end"] - t < 0.05 or lvl < 0.15:
            return rest if rest != "smile" else "rest", True
        if lvl < 0.5:
            return ("round" if (hash((did, k)) % 5 == 0) else "open"), True
        return "wide", True

    def frame(self, shot, t, font_cache):
        s0, s1 = shot["start_sec"], shot["end_sec"]
        stage = self.img(shot["background_id"]).copy()
        for li, L in enumerate(shot["layers"]):
            dx, dy = _keys(L["keys"], t, self.lines, s0) if "keys" in L else (0, 0)
            if "text" in L:
                f = font_cache.setdefault(L["size"], ImageFont.truetype(str(FONT_BOLD), L["size"]))
                ImageDraw.Draw(stage).text((L["at"][0] + dx, L["at"][1] + dy), L["text"], font=f,
                                           fill=hex_rgb(L["color"]), anchor="mm")
                continue
            aid = L["asset"]
            rec = self.man[aid]
            s = L.get("scale", 1.0)
            if rec["kind"] != "pose":
                im = self.scaled(aid, s)
                _paste(stage, im, L["at"][0] + dx, L["at"][1] + dy)
                continue
            cid = rec["character_id"]
            bl = [resolve(b, self.lines, s0) for b in L.get("blink_at", [])] or _blinks(shot["shot_id"] + aid, s0, s1)
            blink = any(b <= t < b + 3 / FPS for b in bl)
            if blink and self.man[aid + "_blink"]["status"] != self.man[aid]["status"]:
                blink = False          # blink frames are optional: never mix real art with a placeholder blink
            shape, talking = self.mouth(cid, rec["rest_mouth"], t)
            bob = 0.0
            if talking:
                import math
                bob = -abs(math.sin(2 * math.pi * 2.1 * (t - s0))) * TALK_BOB[cid] * s
            im = self.scaled(aid + ("_blink" if blink else ""), s)
            x0 = L["at"][0] + dx - im.width / 2
            y0 = L["at"][1] + dy - im.height + bob
            _paste(stage, im, x0, y0)
            ax, ay = rec["mouth_anchor"]
            ms = self.scaled(f"{cid}_mouth_{shape}", rec["mouth_scale"] * s)
            _paste(stage, ms, x0 + ax * s - ms.width / 2, y0 + ay * s - ms.height / 2)
            self.mouth_log.append((shot["shot_id"], cid, shape != rec["rest_mouth"] and shape not in ("rest", "smile"),
                                   talking))
        cx, cy, z = _keys(shot["camera"], t, self.lines, s0)
        z = min(max(z, 1.0), STAGE_W / OUT_W)
        w, h = STAGE_W / z, STAGE_H / z
        x = min(max(cx * STAGE_W - w / 2, 0), STAGE_W - w)
        y = min(max(cy * STAGE_H - h / 2, 0), STAGE_H - h)
        return stage, (x, y, x + w, y + h)


def render(ep: str, mode="preview", dry=False):
    E = Episode(ep)
    d = E.d
    total = E.tl["total_sec"]
    shots = E.sl["render_spec"]
    needed = set()
    for s in shots:
        needed.add(s["background_id"])
        for L in s["layers"]:
            if "asset" in L:
                needed.add(L["asset"])
                if E.man[L["asset"]]["kind"] == "pose":
                    for m in ("rest", "open", "wide", "round", "smile"):
                        needed.add(f"{E.man[L['asset']]['character_id']}_mouth_{m}")
    missing = sorted(a for a in needed if E.man[a]["status"] != "READY")
    placeholder = bool(missing)
    if mode == "final" and placeholder:
        step_set(ep, "final", "WAITING_FOR_ASSET", missing=missing)
        print(f"final: REFUSED - {len(missing)} assets are still placeholders (see prompts/asset_requests.json)")
        return None
    W, H = (540, 960) if mode == "preview" else (OUT_W, OUT_H)
    name = {"preview": "preview.mp4", "full": "full.mp4", "final": "final.mp4"}[mode]
    out = (d / "export" if mode == "final" else d / "preview") / (("animatic_" if placeholder else "") + name)
    if dry:
        print(f"[dry-run] {mode}: {len(shots)} shots, {total:.2f}s, {W}x{H}, placeholders={len(missing)} -> {out}")
        return out
    out.parent.mkdir(parents=True, exist_ok=True)
    step_set(ep, mode, "RENDERING")
    ass = d / "subtitles" / "subtitle.ass"
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-", "-i", str(d / "audio" / "mix.wav"),
           "-vf", f"ass={ass}:fontsdir={FONT_DIR}", "-map", "0:v", "-map", "1:a",
           "-c:v", "libx264", "-preset", "medium", "-crf", "23" if mode == "preview" else "18", "-pix_fmt", "yuv420p",
           "-r", str(FPS), "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart",
           "-t", f"{total:.3f}", str(out)]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    fonts = {}
    lab = ImageFont.truetype(str(FONT), 30 if W == OUT_W else 16)
    n = int(round(total * FPS))
    si = 0
    t0 = time.time()
    for k in range(n):
        t = k / FPS
        while si + 1 < len(shots) and t >= shots[si + 1]["start_sec"]:
            si += 1
        stage, box = E.frame(shots[si], t, fonts)
        fr = stage.resize((W, H), Image.BICUBIC, box=box).convert("RGB")
        if placeholder:
            dr = ImageDraw.Draw(fr, "RGBA")
            bh = int(H * 0.036)
            dr.rectangle((0, 0, W, bh), fill=(20, 16, 30, 170))
            dr.text((W // 2, bh // 2), f"ANIMATIC · ภาพชั่วคราว (PLACEHOLDER) · {shots[si]['shot_id']}",
                    font=lab, fill=(255, 220, 90), anchor="mm")
        p.stdin.write(fr.tobytes())
    p.stdin.close()
    rc = p.wait()
    took = round(time.time() - t0, 1)
    wrong = sum(1 for _, _, moved, talking in E.mouth_log if moved and not talking)
    log = dict(mode=mode, output=str(out.relative_to(d)), frames=n, size=[W, H], seconds=took, placeholder=placeholder,
               missing_assets=missing, assets_used=sorted(a for a, _ in E.used),
               non_speaker_mouth_frames=wrong, ffmpeg_rc=rc)
    save(d / "preview" / f"render_{mode}.json", log)
    step_set(ep, mode, "READY" if rc == 0 else "QA_FAILED", output=log["output"], placeholder=placeholder,
             seconds=took)
    print(f"{mode}: {out} ({n} frames, {took}s) placeholder={placeholder} rc={rc}")
    return out


def still(ep: str, t: float, out, W=OUT_W, H=OUT_H):
    """Single frame without subtitles (thumbnail candidates, QA)."""
    E = Episode(ep)
    shots = E.sl["render_spec"]
    s = [x for x in shots if x["start_sec"] <= t][-1]
    stage, box = E.frame(s, t, {})
    stage.resize((W, H), Image.LANCZOS, box=box).convert("RGB").save(out, quality=92)
    return out
