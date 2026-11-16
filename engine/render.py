"""Edit the Short: scene clips -> concat -> channel tag + captions + voice + music -> final MP4."""
from __future__ import annotations

import hashlib
import json
import random
import shutil
from pathlib import Path

from . import graphics, subs
from .common import FINAL, ROOT, load_config, log, probe_duration, read_json, run_ffmpeg, write_json

W, H, FPS = 1080, 1920, 30
ENC = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "19", "-pix_fmt", "yuv420p", "-r", str(FPS), "-an"]


def _hash(obj) -> str:
    return hashlib.md5(json.dumps(obj, sort_keys=True).encode()).hexdigest()[:12]


def _zoom_chain(cfg, dur: float, punch: bool) -> str:
    """Slow push-in for the whole scene + a quick 'punch' right after the cut (retention trick)."""
    p = cfg["style"].get("punch_zoom", 0.06) if punch else 0.0
    push = cfg["style"].get("push_in", 0.045)
    z = f"(1+{p}*exp(-t/0.09)+{push}*t/{max(dur, 0.5):.3f})"
    return (f",scale=w='trunc({W}*{z}/2)*2':h='trunc({H}*{z}/2)*2':eval=frame,crop={W}:{H}")


def render_scene(cfg, ep: Path, i: int, sc: dict, dur: float, out: Path, static_intro: bool = False) -> None:
    """static_intro: no intro animation (first scene of a loop must look 'mid-video' on frame 0)."""
    from . import anim, globe
    build = ep / "build"
    vis = sc.get("visual", {})
    kind = "map" if vis.get("type") == "map" else (
        vis.get("_kind") or ("graphic" if vis.get("type") == "graphic" else "none"))
    tmp = build / "tmp"
    tmp.mkdir(exist_ok=True)
    frames = max(int(round(dur * FPS)), 1)
    look = "eq=contrast=1.06:saturation=1.12,setsar=1"
    punch = not static_intro

    inputs, fc = [], []
    if kind == "video":
        asset = ep / "assets" / vis["_asset"]
        clip_len = probe_duration(asset)
        start = vis.get("start", 1.0 if clip_len > dur + 2.5 else 0.0)
        inputs += ["-stream_loop", "-1", "-ss", f"{start:.2f}", "-i", str(asset)]
        fc.append(f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},{look}"
                  f"{_zoom_chain(cfg, dur, punch)}[base]")
    elif kind == "image":
        asset = ep / "assets" / vis["_asset"]
        bw, bh = int(W * 1.2), int(H * 1.2)
        direction = vis.get("pan", ["lr", "rl", "tb", "bt"][i % 4])
        x = {"lr": f"(iw-{W})*t/{dur:.3f}", "rl": f"(iw-{W})*(1-t/{dur:.3f})"}.get(direction, f"(iw-{W})/2")
        y = {"tb": f"(ih-{H})*t/{dur:.3f}", "bt": f"(ih-{H})*(1-t/{dur:.3f})"}.get(direction, f"(ih-{H})/2")
        inputs += ["-loop", "1", "-framerate", str(FPS), "-i", str(asset)]
        fc.append(f"[0:v]scale={bw}:{bh}:force_original_aspect_ratio=increase,crop={bw}:{bh},"
                  f"crop={W}:{H}:x='{x}':y='{y}',{look}{_zoom_chain(cfg, dur, punch)}[base]")
    elif kind == "map":
        mapclip = tmp / f"map{i:02d}.mp4"
        globe.render(cfg, vis, dur, mapclip, static=static_intro)
        inputs += ["-i", str(mapclip)]
        push = f",scale=w='trunc({W}*(1+0.03*t/{max(dur, 0.5):.3f})/2)*2':h='trunc({H}*(1+0.03*t/{max(dur, 0.5):.3f})/2)*2'" \
               f":eval=frame,crop={W}:{H}" if vis.get("zoom") == "none" else ""
        fc.append(f"[0:v]setsar=1{push}[base]")
    else:  # last resort when no picture exists at all: a slow globe shot (never a flat colour card)
        spec = dict(vis.get("map") or {})
        spec.update({"type": "map", "zoom": "none"})
        if sc.get("overlay"):
            spec.setdefault("headline", sc["overlay"].get("text") or sc["overlay"].get("value") or "")
            sc = {**sc, "overlay": None}
        mapclip = tmp / f"map{i:02d}.mp4"
        globe.render(cfg, spec, dur, mapclip, static=static_intro)
        inputs += ["-i", str(mapclip)]
        fc.append("[0:v]setsar=1[base]")

    last = "base"
    if sc.get("overlay"):
        ov = anim.render_layer(cfg, sc["overlay"], dur, tmp / f"o{i:02d}.mov", full=False, static=static_intro)
        idx = len([a for a in inputs if a == "-i"])
        inputs += ["-i", str(ov)]
        fc.append(f"[{idx}:v]format=rgba[ov]")
        fc.append(f"[{last}][ov]overlay=0:0:format=auto[withov]")
        last = "withov"
    fc.append(f"[{last}]format=yuv420p[v]")
    run_ffmpeg([*inputs, "-filter_complex", ";".join(fc), "-map", "[v]", "-t", f"{dur:.3f}", *ENC, str(out)])


def _split(src: Path, start_frame: int, end_frame: int | None, out: Path) -> None:
    trim = f"trim=start_frame={start_frame}" + (f":end_frame={end_frame}" if end_frame is not None else "")
    run_ffmpeg(["-i", str(src), "-vf", f"{trim},setpts=PTS-STARTPTS", *ENC, str(out)])


def _add_whooshes(cfg: dict, build: Path, starts: list[float], total: float) -> None:
    """Transition sound on cuts, ONLY from real recorded SFX files in assets/sfx (whoosh*.wav/mp3).
    No file -> no SFX (the synthesised noise whoosh sounded cheap). None at t=0: the loop seam stays invisible."""
    sfx = cfg.get("sfx", {})
    files = sorted(p for p in (ROOT / "assets" / "sfx").glob("whoosh*") if p.suffix.lower() in (".wav", ".mp3", ".ogg"))
    cuts = [s for s in starts[1:] if 0.3 < s < total - 0.2]
    if not sfx.get("whoosh", False) or not cuts or not files:
        return
    every = max(int(sfx.get("every_nth_cut", 2)), 1)   # not on every cut: subtle, not cheesy
    cuts = cuts[::every]
    shutil.copy(files[0], build / ("whoosh" + files[0].suffix.lower()))
    wfile = "whoosh" + files[0].suffix.lower()
    ins, fc = ["-i", "mix.wav"], []
    for k, c in enumerate(cuts, 1):
        ins += ["-i", wfile]
        ms = max(int((c - 0.2) * 1000), 0)
        fc.append(f"[{k}:a]aresample=44100,aformat=channel_layouts=stereo,adelay={ms}|{ms},"
                  f"volume={sfx.get('volume', 0.22)}[w{k}]")
    fc.append("[0:a]" + "".join(f"[w{k}]" for k in range(1, len(cuts) + 1)) +
              f"amix=inputs={len(cuts) + 1}:duration=first:normalize=0[a]")
    run_ffmpeg([*ins, "-filter_complex", ";".join(fc), "-map", "[a]", "-ar", "44100", "mix_sfx.wav"], cwd=build)
    (build / "mix_sfx.wav").replace(build / "mix.wav")


def _loudnorm_two_pass(src: Path, out: Path) -> None:
    """Static (linear) loudness normalisation to -14 LUFS. Dynamic loudnorm would change the gain over
    time, so the end and the start of a loop would not match in level."""
    import re
    import subprocess
    from .common import ffmpeg_bin
    res = subprocess.run([ffmpeg_bin(), "-hide_banner", "-i", str(src), "-af",
                          "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                         capture_output=True, text=True)
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", res.stderr, re.S)
    if not m:
        shutil.copy(src, out)
        return
    j = json.loads(m.group(0))
    if j["input_i"] in ("-inf", "inf"):  # silent track (dry test run)
        shutil.copy(src, out)
        return
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
          f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:"
          f"linear=true,aresample=44100")
    run_ffmpeg(["-i", str(src), "-af", af, "-ar", "44100", "-ac", "2", str(out)])


def run(ep: Path, only: set[int] | None = None) -> Path:
    cfg = load_config()
    script = read_json(ep / "script.json")
    build = ep / "build"
    t = read_json(build / "timings.json")
    scene_dir = build / "scenes"
    scene_dir.mkdir(parents=True, exist_ok=True)
    scenes = script["scenes"]
    n = len(scenes)
    loop = bool(t.get("loop"))
    last = n - 1
    # Loop "continuous shot": the last scene shows the shot that LEADS INTO scene 1, so when the video
    # restarts, the picture keeps moving instead of cutting.
    cont = loop and n >= 2 and scenes[last].get("visual", {}).get("type", "loop") == "loop"

    # never a blank card and never a wrong picture: a scene without fitting media shows the story's place on the
    # globe (calm, no headline) when the script has a map; otherwise it borrows the nearest scene's picture
    maps_ = [sc["visual"] for sc in scenes if sc.get("visual", {}).get("type") == "map"]
    have = [i for i, sc in enumerate(scenes) if sc.get("visual", {}).get("_asset")]
    for i, sc in enumerate(scenes):
        v = sc.get("visual", {})
        if v.get("type") in ("map", "loop") or v.get("_asset"):
            continue
        if maps_:
            from .globe import anchor_point
            prev = [sc2["visual"] for sc2 in scenes[:i] if sc2.get("visual", {}).get("type") == "map"]
            ordered = list(reversed(prev)) + maps_
            center = next((q for q in (anchor_point(m) for m in ordered) if q), None)
            # a calm view of the story's place: no labels/pins/lines, so the scene's own overlay never collides
            spec = {"type": "map", "zoom": "none", "_fallback": True, "labels": False, "scalebar": False}
            if center:
                spec["center"] = [center[0], center[1]]
            sc["visual"] = spec
            continue
        if not have:
            continue
        j = min(have, key=lambda k: (abs(k - i), k > i))
        nv = dict(scenes[j]["visual"])
        nv["pan"] = ["rl", "lr", "bt", "tb"][i % 4]
        nv["start"] = 3.0
        sc["visual"] = {**v, "_asset": nv["_asset"], "_kind": nv["_kind"], "pan": nv["pan"], "start": nv["start"]}

    # 1) scene clips (cached: only re-rendered when the scene spec or timing changes)
    parts = []
    for i, (sc, tm) in enumerate(zip(scenes, t["scenes"])):
        dur = tm["end"] - tm["start"]
        out = scene_dir / f"s{i:02d}.mp4"
        meta = scene_dir / f"s{i:02d}.json"
        key = {"sc": sc, "dur": round(dur, 3), "style": cfg["style"], "loop": loop, "cont": cont}
        if cont and i in (0, last):
            key["pair"] = [scenes[0], round(t["scenes"][0]["end"] - t["scenes"][0]["start"], 3),
                           round(t["scenes"][last]["end"] - t["scenes"][last]["start"], 3)]
        h = _hash(key)
        cached = out.exists() and (read_json(meta, {}) or {}).get("hash") == h
        if (only is None and not cached) or (only is not None and i in only):
            if cont and i in (0, last):
                if i == 0:  # rendered together with the last scene below
                    parts.append(out)
                    continue
            else:
                log(f"render scene {i} ({dur:.2f}s, {sc.get('visual', {}).get('_kind') or sc.get('visual', {}).get('type')})")
                render_scene(cfg, ep, i, sc, dur, out, static_intro=(loop and i == 0))
                write_json(meta, {"hash": h})
        parts.append(out)

    if cont:
        d0 = t["scenes"][0]["end"] - t["scenes"][0]["start"]
        dl = t["scenes"][last]["end"] - t["scenes"][last]["start"]
        h0 = read_json(scene_dir / "s00.json", {}) or {}
        hl = read_json(scene_dir / f"s{last:02d}.json", {}) or {}
        key = _hash({"pair": [scenes[0], round(d0, 3), round(dl, 3)], "style": cfg["style"]})
        need = only is not None and (0 in only or last in only)
        need = need or not (scene_dir / "s00.mp4").exists() or h0.get("pair") != key or hl.get("pair") != key
        if need:
            log(f"render loop shot: last scene ({dl:.2f}s) flows into scene 0 ({d0:.2f}s)")
            combined = build / "tmp" / "loopshot.mp4"
            (build / "tmp").mkdir(exist_ok=True)
            render_scene(cfg, ep, 0, scenes[0], dl + d0, combined)  # animations play during the bridge, so the seam is continuous
            nl = int(round(dl * FPS))
            _split(combined, 0, nl, scene_dir / f"s{last:02d}.mp4")
            _split(combined, nl, None, scene_dir / "s00.mp4")
            write_json(scene_dir / "s00.json", {"pair": key})
            write_json(scene_dir / f"s{last:02d}.json", {"pair": key})

    concat = build / "concat.txt"
    concat.write_text("".join(f"file 'scenes/{p.name}'\n" for p in parts), encoding="utf-8")
    run_ffmpeg(["-f", "concat", "-safe", "0", "-i", "concat.txt", "-c", "copy", "video_only.mp4"], cwd=build)

    # 2) captions, channel tag, fonts for libass
    subs.build_ass(cfg, build / "words.json", build / "subs.ass",
                   scene_starts=[tm["start"] for tm in t["scenes"]], script_text=[sc["text"] for sc in scenes])
    graphics.header_png(cfg, build / "header.png")
    fonts = build / "fonts"
    fonts.mkdir(exist_ok=True)
    for f in (ROOT / "assets" / "fonts").glob("*.[ot]tf"):
        shutil.copy(f, fonts / f.name)

    # 3) audio: voice + music bed
    total = sum(tm["end"] - tm["start"] for tm in t["scenes"])
    music_dir = ROOT / cfg["music"].get("dir", "assets/music")
    tracks = [p for p in music_dir.glob("*") if p.suffix.lower() in (".mp3", ".wav", ".m4a", ".ogg")]
    vol = cfg["music"].get("volume", 0.18)
    ain = ["-i", "voice.wav"]
    if tracks and script.get("music", True):
        track = random.Random(ep.name).choice(tracks)
        log(f"music: {track.name}")
        ain += ["-stream_loop", "-1", "-i", str(track)]
        if loop:
            # seamless music bed: the bed's last moment continues into its first moment.
            # (built from a pre-cut segment read 3 times, to avoid huge filter buffering)
            x = min(2.0, total / 4)
            run_ffmpeg(["-stream_loop", "-1", "-i", str(track), "-af",
                        f"aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo,volume={vol}",
                        "-t", f"{total + x:.3f}", "-ar", "44100", "music_seg.wav"], cwd=build)
            run_ffmpeg(["-i", "music_seg.wav", "-i", "music_seg.wav", "-i", "music_seg.wav", "-filter_complex",
                        f"[0:a]atrim={x:.3f}:{total:.3f},asetpts=PTS-STARTPTS[body];"
                        f"[1:a]atrim=0:{x:.3f},asetpts=PTS-STARTPTS,afade=t=in:d={x:.3f}:curve=qsin[hin];"
                        f"[2:a]atrim={total:.3f}:{total + x:.3f},asetpts=PTS-STARTPTS,"
                        f"afade=t=out:d={x:.3f}:curve=qsin[tout];"
                        f"[hin][tout]amix=inputs=2:normalize=0[head];[head][body]concat=n=2:v=0:a=1[mu]",
                        "-map", "[mu]", "-ar", "44100", "music_bed.wav"], cwd=build)
            ain = ["-i", "voice.wav", "-i", "music_bed.wav"]
            af = ("[0:a]aresample=44100,aformat=channel_layouts=stereo[vo];"
                  "[1:a]aresample=44100,aformat=channel_layouts=stereo[mu];"
                  "[vo][mu]amix=inputs=2:duration=longest:normalize=0[a]")
        else:
            af = (f"[0:a]aresample=44100,aformat=channel_layouts=stereo,apad,asplit=2[vo][sc];"
                  f"[1:a]aresample=44100,aformat=channel_layouts=stereo,volume={vol}[mu];"
                  f"[mu][sc]sidechaincompress=threshold=0.04:ratio=6:attack=15:release=350[duck];"
                  f"[vo][duck]amix=inputs=2:duration=first:normalize=0[a]")
    else:
        af = "[0:a]aresample=44100,aformat=channel_layouts=stereo,apad[a]"
    run_ffmpeg([*ain, "-filter_complex", af, "-map", "[a]", "-t", f"{total:.3f}", "-ar", "44100",
                "mix.wav"], cwd=build)
    _add_whooshes(cfg, build, [tm["start"] for tm in t["scenes"]], total)
    _loudnorm_two_pass(build / "mix.wav", build / "mix_norm.wav")

    # 4) final
    FINAL.mkdir(exist_ok=True)
    out = FINAL / f"{ep.name}.mp4"
    run_ffmpeg(["-i", "video_only.mp4", "-i", "header.png", "-i", "mix_norm.wav", "-filter_complex",
                "[0:v][1:v]overlay=0:0[hv];[hv]ass=subs.ass:fontsdir=fonts[v]", "-map", "[v]", "-map", "2:a",
                "-t", f"{total:.3f}", "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
                "-r", str(FPS), "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-movflags", "+faststart",
                str(out.resolve())], cwd=build)
    log(f"FINAL -> {out}{'  (seamless loop)' if loop else ''}")
    return out
