"""Quality control in 5 separate categories + a ready / needs_review status.

  technical  resolution, fps, length, loudness, silence, audio/video sync
  factual    every on-screen number comes from the facts registry, every fact has a real source
  visual     text collisions (measured boxes), missing/borrowed pictures, repeated pictures, AI frame review
  rights     every picture has a licence we may use + credit line, music/icons/map credits
  editorial  hook length, 2-5 word headlines, no narration on screen, scene pacing, loop seam, title length

Each issue: {"cat", "scene", "msg", "fix", "blocking"}. fix = "refetch" (new picture for that scene),
"script" (rewrite text), "render" (re-render that scene) or None. Anything blocking -> needs_review.
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
from pathlib import Path

from . import facts as factsmod
from .common import FINAL, ROOT, log, probe_duration, probe_size, read_json, run_ffmpeg, write_json

CATS = ["technical", "factual", "visual", "rights", "editorial"]
CAT_TH = {"technical": "เทคนิค", "factual": "ข้อเท็จจริง", "visual": "ภาพ/ตัวหนังสือ", "rights": "ลิขสิทธิ์",
          "editorial": "บท/การเล่า"}
OK_LICENSE = re.compile(r"(pixabay|pexels|public domain|nasa|cc0|cc[ -]by|pd)", re.I)


def issue(cat, msg, scene=None, fix=None, blocking=True) -> dict:
    return {"cat": cat, "scene": scene, "msg": msg, "fix": fix, "blocking": blocking}


def _mean_volume(path: Path) -> float | None:
    exe = shutil.which("ffmpeg") or "ffmpeg"
    res = subprocess.run([exe, "-hide_banner", "-i", str(path), "-af", "volumedetect", "-f", "null", "-"],
                         capture_output=True, text=True)
    m = re.search(r"mean_volume:\s*(-?[\d.]+) dB", res.stderr)
    return float(m.group(1)) if m else None


def _loudness(path: Path) -> float | None:
    exe = shutil.which("ffmpeg") or "ffmpeg"
    res = subprocess.run([exe, "-hide_banner", "-i", str(path), "-af", "ebur128", "-f", "null", "-"],
                         capture_output=True, text=True)
    m = re.findall(r"I:\s*(-?[\d.]+) LUFS", res.stderr)
    return float(m[-1]) if m else None


def _fps(path: Path) -> float:
    exe = shutil.which("ffprobe") or "ffprobe"
    res = subprocess.run([exe, "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate",
                          "-of", "csv=p=0", str(path)], capture_output=True, text=True)
    try:
        a, b = res.stdout.strip().split("/")
        return float(a) / float(b)
    except ValueError:
        return 0.0


def _stream_dur(path: Path, sel: str) -> float:
    exe = shutil.which("ffprobe") or "ffprobe"
    res = subprocess.run([exe, "-v", "error", "-select_streams", sel, "-show_entries", "stream=duration",
                          "-of", "csv=p=0", str(path)], capture_output=True, text=True)
    try:
        return float(res.stdout.strip().split("\n")[0])
    except ValueError:
        return 0.0


def contact_sheet(final: Path, build: Path, n: int = 9) -> Path:
    dur = probe_duration(final)
    sheet = build / "check.jpg"
    tmp = build / "tmp"
    tmp.mkdir(exist_ok=True)
    frames = []
    for k in range(n):
        ts = dur * (k + 0.5) / n
        fp = tmp / f"chk{k}.png"
        run_ffmpeg(["-ss", f"{ts:.2f}", "-i", str(final), "-frames:v", "1", "-vf", "scale=360:-2", str(fp)])
        frames.append(fp)
    args = []
    for fp in frames:
        args += ["-i", str(fp)]
    layout = "|".join(f"{(k % 3) * 360}_{(k // 3) * 640}" for k in range(n))
    run_ffmpeg([*args, "-filter_complex", f"xstack=inputs={n}:layout={layout}", "-frames:v", "1", str(sheet)])
    return sheet


def editorial(script: dict, t: dict | None = None) -> list[dict]:
    from .typo import shorten_headline
    out = []
    scenes = script.get("scenes", [])
    if scenes:
        hook = scenes[0]["text"].split()
        if len(hook) > 9:
            out.append(issue("editorial", f"hook is {len(hook)} words; keep it under 8", 0, "script",
                             blocking=len(hook) > 13))
    words = sum(len(s["text"].split()) for s in scenes)
    if words > 150 or words < 80:
        out.append(issue("editorial", f"script is {words} words; aim for 90-140", None, "script",
                         blocking=words > 165 or words < 65))
    for i, sc in enumerate(scenes):
        n = len(sc["text"].split())
        last_loop = script.get("loop") and i == len(scenes) - 1
        if n > 18:
            out.append(issue("editorial", f"scene {i} has {n} words; split it", i, "script"))
        ov = sc.get("overlay") or {}
        txt = ov.get("text") if ov.get("type") in ("label", "title") else None
        if txt:
            if len(txt.split()) > 6:
                out.append(issue("editorial", f"scene {i} on-screen headline has {len(txt.split())} words (max 5)",
                                 i, "script"))
            a, b = re.sub(r"\W+", " ", txt.lower()).split(), re.sub(r"\W+", " ", sc["text"].lower()).split()
            if len(a) >= 5 and " ".join(a) in " ".join(b):
                out.append(issue("editorial", f"scene {i} shows the narration sentence as a headline", i, "script"))
        v = sc.get("visual", {})
        if v.get("type") == "map":
            head = v.get("headline") or v.get("title") or ""
            if len(str(head).split()) > 6:
                out.append(issue("editorial", f"scene {i} map headline too long", i, "script"))
        if last_loop:
            continue
    kinds = [sc.get("visual", {}).get("type") for sc in scenes]
    run = 0
    for k in kinds:
        run = run + 1 if k == "map" else 0
        if run > 2:
            out.append(issue("editorial", "more than 2 map scenes in a row; put footage between them", None, "script"))
            break
    title = script.get("meta", {}).get("title", "")
    if not (25 <= len(title) <= 80):
        out.append(issue("editorial", f"title is {len(title)} characters (aim 40-70)", None, "script", False))
    if t:
        for i, tm in enumerate(t.get("scenes", [])):
            d = tm["end"] - tm["start"]
            if d > 6.5:
                out.append(issue("editorial", f"scene {i} is {d:.1f}s long; the picture should change every <=5s",
                                 i, "script", False))
            if d < 0.8 and not (t.get("loop") and i == len(t["scenes"]) - 1):
                out.append(issue("editorial", f"scene {i} is only {d:.1f}s; merge it with a neighbour", i, "script",
                                 False))
    return out


def layout_issues(build: Path) -> list[dict]:
    out = []
    for p in sorted((build / "tmp").glob("*.layout.json")):
        m = re.match(r"(?:o|map)(\d+)", p.stem)
        scene = int(m.group(1)) if m else None
        try:
            rep = json.loads(p.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        for it in rep.get("issues", []):
            soft = "left out" in it   # a label that could not be placed was dropped: nothing overlaps
            out.append(issue("visual", f"scene {scene}: text layout: {it}", scene, "render" if not soft else None,
                             blocking=not soft))
    return out


def rights(ep: Path, script: dict) -> list[dict]:
    out = []
    credits = {c["scene"]: c for c in read_json(ep / "build" / "credits.json", [])}
    for i, sc in enumerate(script.get("scenes", [])):
        v = sc.get("visual", {})
        if v.get("_asset") and not v.get("file") and v.get("type") in ("footage", "image"):
            c = credits.get(i)
            if not c:
                out.append(issue("rights", f"scene {i}: picture has no credit/licence record", i, "refetch"))
            elif not OK_LICENSE.search(c.get("license", "")):
                out.append(issue("rights", f"scene {i}: licence '{c.get('license')}' not on the allowed list", i,
                                 "refetch"))
    music = [p for p in (ROOT / "assets" / "music").glob("*") if p.suffix.lower() in (".mp3", ".wav", ".m4a", ".ogg")]
    if music and not (ROOT / "assets" / "music" / "LICENSES.md").exists():
        out.append(issue("rights", "music tracks have no assets/music/LICENSES.md (where each track came from)",
                         None, None, False))
    return out


def run(ep: Path, extra: list[dict] | None = None, allowed_urls: list[str] | None = None) -> dict:
    final = FINAL / f"{ep.name}.mp4"
    build = ep / "build"
    script = read_json(ep / "script.json")
    t = read_json(build / "timings.json")
    dur = probe_duration(final)
    w, h = probe_size(final)
    sheet = contact_sheet(final, build)
    issues: list[dict] = []

    # ---------------- technical
    fps = _fps(final)
    if (w, h) != (1080, 1920):
        issues.append(issue("technical", f"resolution is {w}x{h}, expected 1080x1920"))
    if abs(fps - 30) > 0.5:
        issues.append(issue("technical", f"frame rate {fps:.2f}, expected 30"))
    if dur > 60:
        issues.append(issue("technical", f"duration {dur:.1f}s > 60s", None, "script"))
    if dur < 15:
        issues.append(issue("technical", f"duration {dur:.1f}s is very short", None, "script"))
    nwords = sum(len(sc["text"].split()) for sc in script["scenes"])
    wps = nwords / max(t.get("audio_duration", dur), 0.1)
    if wps > 3.6 or wps < 1.6:
        issues.append(issue("technical", f"narration is {t.get('audio_duration', dur):.1f}s for {nwords} words "
                            f"({wps:.1f} words/s): speech was cut or timed wrong", None, None))
    voice = build / "voice.wav"
    vol = _mean_volume(voice if voice.exists() else final)
    if vol is None or vol < -35:
        issues.append(issue("technical", f"narration looks silent (mean volume {vol})"))
    lufs = _loudness(final)
    if lufs is not None and not (-16.5 <= lufs <= -12.0):
        issues.append(issue("technical", f"loudness {lufs:.1f} LUFS (target -14)", None, None, False))
    av = abs(_stream_dur(final, "v:0") - _stream_dur(final, "a:0"))
    if av > 0.15:
        issues.append(issue("technical", f"audio and video lengths differ by {av:.2f}s"))
    seam = None
    if t.get("loop"):
        tmp = build / "tmp"
        a, b = tmp / "seam_end.png", tmp / "seam_start.png"
        run_ffmpeg(["-sseof", "-0.1", "-i", str(final), "-update", "1", "-vf", "scale=360:-2", str(a)])
        run_ffmpeg(["-i", str(final), "-frames:v", "1", "-vf", "scale=360:-2", str(b)])
        seam = build / "loop_seam.jpg"
        run_ffmpeg(["-i", str(a), "-i", str(b), "-filter_complex", "hstack=inputs=2", "-frames:v", "1", str(seam)])
        words = read_json(build / "words.json", [])
        if words:
            gap = words[0]["start"] + (t["audio_duration"] - words[-1]["end"])
            if gap > 0.5:
                issues.append(issue("editorial", f"loop seam has {gap:.2f}s of silence; the bridge does not flow",
                                    len(script["scenes"]) - 1, "script", False))

    # ---------------- factual
    for m in factsmod.check(script, allowed_urls):
        issues.append(issue("factual", m, None, "script"))
    for m in script.get("qc_audit", []) or []:
        sc = re.match(r"scene (\d+)", m)
        issues.append(issue("factual", f"claim audit: {m}", int(sc.group(1)) if sc else None, "script"))

    # ---------------- visual
    issues += layout_issues(build)
    seen = {}
    for i, sc in enumerate(script["scenes"]):
        v = sc.get("visual", {})
        if v.get("_kind") == "none":
            mapped = any(sc2.get("visual", {}).get("type") == "map" for sc2 in script["scenes"])
            issues.append(issue("visual", f"scene {i}: no fitting picture was found " +
                                ("(shows the map instead)" if mapped else "(borrowed another scene's picture)"),
                                i, None if mapped else "refetch", blocking=not mapped))
        mid = v.get("_media_id")
        if mid:
            if mid in seen:
                issues.append(issue("visual", f"scene {i} repeats the picture of scene {seen[mid]}", i, "refetch"))
            seen[mid] = i
    shown = sum(1 for sc in script["scenes"] if sc.get("visual", {}).get("type") == "map" or sc.get("overlay"))
    if shown < max(2, len(script["scenes"]) // 3):
        issues.append(issue("visual", f"only {shown} scenes carry our own graphics/maps (aim >= 1/3)", None, "script",
                            False))

    # ---------------- rights + editorial
    issues += rights(ep, script)
    issues += editorial(script, t)
    issues += extra or []

    blocking = [i for i in issues if i.get("blocking", True)]
    cats = {c: [i["msg"] for i in issues if i["cat"] == c] for c in CATS}
    status = "ready" if not blocking else "needs_review"
    reasons_th = [f"[{CAT_TH[i['cat']]}] {i['msg']}" for i in blocking][:8]
    report = {"episode": ep.name, "final": str(final), "duration": round(dur, 2), "size": f"{w}x{h}",
              "fps": round(fps, 2), "loudness_lufs": lufs, "mean_volume_db": vol, "scenes": len(script["scenes"]),
              "contact_sheet": str(sheet), "loop_seam": str(seam) if seam else None,
              "issues": [f"[{i['cat']}] {i['msg']}" for i in issues], "issue_list": issues, "categories": cats,
              "status": status, "status_th": "พร้อมลง" if status == "ready" else "ต้องดูก่อน",
              "reasons_th": reasons_th, "ok": status == "ready"}
    write_json(build / "report.json", report)
    log(f"QC: {status.upper()} | {dur:.1f}s | " + ", ".join(f"{c} {len(v)}" for c, v in cats.items()))
    for it in issues:
        log(f"  - [{it['cat']}{'' if it.get('blocking', True) else ', note'}] {it['msg']}")
    return report
