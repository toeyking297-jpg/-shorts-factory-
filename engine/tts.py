"""Voiceover + word timings.

Engines (config voice.engine, or script.json "voice_engine"):
  edge        free Microsoft neural voices via the edge-tts package (default)
  elevenlabs  your ElevenLabs voice (needs ELEVENLABS_API_KEY in .env)
  dry         silent track with estimated timings (for testing the pipeline offline)

Outputs in <episode>/build/: voice.mp3, words.json, timings.json
"""
from __future__ import annotations

import asyncio
import base64
import os
import re
from pathlib import Path

from .common import load_config, log, probe_duration, read_json, run_ffmpeg, write_json


def _norm(s: str) -> str:
    """Letters and digits only (any script: Thai has no spaces and must keep its characters)."""
    return re.sub(r"[\W_]", "", s.lower())


# ---------------------------------------------------------------- engines
def _edge(text: str, out_mp3: Path, vcfg: dict) -> list[dict]:
    import edge_tts  # pip install edge-tts

    voice = vcfg.get("edge_voice", "en-US-AndrewMultilingualNeural")
    rate = vcfg.get("rate", "+0%")
    pitch = vcfg.get("pitch", "+0Hz")

    async def go():
        try:
            com = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
        except TypeError:  # older edge-tts versions emit word boundaries by default
            com = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
        words = []
        with open(out_mp3, "wb") as f:
            async for chunk in com.stream():
                if chunk["type"] == "audio":
                    f.write(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    st = chunk["offset"] / 1e7
                    words.append({"w": chunk["text"], "start": st, "end": st + chunk["duration"] / 1e7})
        return words

    last_err = None
    for attempt in range(1, 4):  # the free Edge service sometimes stalls: time out and retry
        try:
            log(f"edge-tts voice={voice} (attempt {attempt}/3)")
            return asyncio.run(asyncio.wait_for(go(), timeout=90))
        except Exception as e:  # noqa: BLE001
            last_err = e
            log(f"edge-tts failed: {type(e).__name__}: {e}")
    raise SystemExit("Edge TTS did not respond 3 times. Check the internet connection / VPN / firewall, "
                     "or set voice.engine to \"elevenlabs\" in config/channel.json. Last error: " + str(last_err))


def _elevenlabs(text: str, out_mp3: Path, vcfg: dict) -> list[dict]:
    import requests

    key = os.environ.get("ELEVENLABS_API_KEY")
    vid = vcfg.get("elevenlabs_voice_id")
    if not key or not vid:
        raise SystemExit("ElevenLabs needs ELEVENLABS_API_KEY in .env and voice.elevenlabs_voice_id in config.")
    r = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps",
        params={"output_format": "mp3_44100_128"},
        headers={"xi-api-key": key, "Content-Type": "application/json"},
        json={
            "text": text,
            "model_id": vcfg.get("elevenlabs_model", "eleven_multilingual_v2"),
            "voice_settings": vcfg.get("elevenlabs_settings",
                                       {"stability": 0.45, "similarity_boost": 0.8, "style": 0.3}),
        },
        timeout=180,
    )
    r.raise_for_status()
    data = r.json()
    out_mp3.write_bytes(base64.b64decode(data["audio_base64"]))
    al = data.get("alignment") or data.get("normalized_alignment") or {}
    chars = al.get("characters", [])
    starts = al.get("character_start_times_seconds", [])
    ends = al.get("character_end_times_seconds", [])
    words, cur, cs, ce = [], "", None, None
    for ch, s, e in zip(chars, starts, ends):
        if ch.isspace():
            if cur:
                words.append({"w": cur, "start": cs, "end": ce})
            cur, cs = "", None
            continue
        if cs is None:
            cs = s
        cur += ch
        ce = e
    if cur:
        words.append({"w": cur, "start": cs, "end": ce})
    return words


def _piper(text: str, out_mp3: Path, vcfg: dict) -> list[dict]:
    """Offline open-source voice (pip install piper-tts). No word timings -> estimated later."""
    import subprocess
    import sys
    model = Path(vcfg.get("piper_model", "assets/voices/en_US-ryan-high.onnx"))
    if not model.is_absolute():
        from .common import ROOT
        model = ROOT / model
    if not model.exists():
        raise RuntimeError(f"Piper voice model not found: {model}")
    wav = out_mp3.with_suffix(".piper.wav")
    res = None
    for flag in ("--output_file", "--output-file"):  # flag name differs between piper versions
        res = subprocess.run([sys.executable, "-m", "piper", "--model", str(model), flag, str(wav)],
                             input=text, text=True, capture_output=True)
        if res.returncode == 0 and wav.exists():
            break
    if res is None or res.returncode != 0 or not wav.exists():
        raise RuntimeError("Piper failed: " + res.stderr[-800:])
    run_ffmpeg(["-i", str(wav), "-c:a", "libmp3lame", "-b:a", "160k", str(out_mp3)])
    return []


def _kokoro(text: str, out_mp3: Path, vcfg: dict) -> list[dict]:
    """Kokoro-82M (Apache-2.0, runs on the GitHub runner's CPU, free). pip install kokoro soundfile"""
    import numpy as np
    import soundfile as sf
    from kokoro import KPipeline
    voice = vcfg.get("kokoro_voice", "am_michael")
    speed = float(vcfg.get("kokoro_speed", 1.05))
    log(f"kokoro voice={voice} speed={speed}")
    pipe = KPipeline(lang_code="a")  # American English
    chunks, words, offset = [], [], 0.0
    for res in pipe(text, voice=voice, speed=speed, split_pattern=r"\n+"):
        audio = res.audio
        if audio is None:
            continue
        a = audio.detach().cpu().numpy() if hasattr(audio, "detach") else np.asarray(audio)
        for tok in getattr(res, "tokens", None) or []:
            st, en = getattr(tok, "start_ts", None), getattr(tok, "end_ts", None)
            if st is None or en is None or not re.search(r"[0-9A-Za-z]", tok.text or ""):
                continue
            words.append({"w": tok.text, "start": offset + float(st), "end": offset + float(en)})
        chunks.append(a)
        offset += len(a) / 24000
    if not chunks:
        raise RuntimeError("Kokoro produced no audio")
    wav = out_mp3.with_suffix(".kokoro.wav")
    sf.write(str(wav), np.concatenate(chunks), 24000)
    run_ffmpeg(["-i", str(wav), "-c:a", "libmp3lame", "-b:a", "192k", str(out_mp3)])
    return words


def _dry(text: str, out_mp3: Path, vcfg: dict) -> list[dict]:
    toks = text.split()
    wps = 2.7
    dur = len(toks) / wps + 0.3
    run_ffmpeg(["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", f"{dur:.2f}",
                "-c:a", "libmp3lame", "-b:a", "128k", str(out_mp3)])
    return []


def _estimate(text: str, duration: float) -> list[dict]:
    toks = text.split()
    weights = [max(len(_norm(t)), 1) + 1.5 for t in toks]
    total = sum(weights)
    t, out = 0.15, []
    span = max(duration - 0.3, 0.5)
    for tok, w in zip(toks, weights):
        d = span * w / total
        out.append({"w": tok, "start": t, "end": t + d * 0.92})
        t += d
    return out


ENGINES = {"edge": _edge, "elevenlabs": _elevenlabs, "piper": _piper, "kokoro": _kokoro, "dry": _dry}


def voice_samples(out_dir: Path, text: str) -> list[Path]:
    """Same sentence in every free voice we can use, for the owner to choose by ear (dashboard)."""
    cfg = load_config()
    out_dir.mkdir(parents=True, exist_ok=True)
    made = []
    tests = [("edge", {"edge_voice": v, "rate": "+6%"}) for v in
             ("en-US-AndrewMultilingualNeural", "en-US-BrianMultilingualNeural", "en-US-ChristopherNeural",
              "en-US-GuyNeural")]
    tests += [("kokoro", {"kokoro_voice": v, "kokoro_speed": 1.05}) for v in ("am_michael", "am_fenrir", "am_puck",
                                                                               "am_onyx")]
    for eng, vc in tests:
        name = vc.get("edge_voice") or vc.get("kokoro_voice")
        short = name.replace("en-US-", "").replace("MultilingualNeural", "").replace("Neural", "")
        out = out_dir / f"voice_{eng}_{short}.mp3"
        try:
            ENGINES[eng](text, out, {**cfg["voice"], **vc})
            made.append(out)
            log(f"voice sample ok: {out.name}")
        except (SystemExit, Exception) as e:  # noqa: BLE001
            log(f"voice sample failed {eng}/{name}: {e}")
    return made


# ---------------------------------------------------------------- timing
def scene_timings(scenes: list[dict], words: list[dict], audio_dur: float, tail: float) -> list[dict]:
    """Map each scene's narration to [start, end] using character alignment."""
    scene_starts_chars, pos = [], 0
    for sc in scenes:
        scene_starts_chars.append(pos)
        pos += len(_norm(sc["text"]))
    word_char_pos, pos = [], 0
    for w in words:
        word_char_pos.append(pos)
        pos += len(_norm(w["w"]))

    starts = []
    for i, sc_char in enumerate(scene_starts_chars):
        if i == 0:
            starts.append(0.0)
            continue
        t = None
        for wp, w in zip(word_char_pos, words):
            if wp >= sc_char:
                t = w["start"]
                break
        starts.append(t if t is not None else audio_dur)
    # cut a hair before the first word of the scene so the picture leads the voice
    starts = [0.0] + [max(s - 0.08, 0.0) for s in starts[1:]]
    end_total = audio_dur + tail
    out = []
    for i, s in enumerate(starts):
        e = starts[i + 1] if i + 1 < len(starts) else end_total
        out.append({"start": round(s, 3), "end": round(max(e, s + 0.5), 3)})
    return out


def is_loop(cfg: dict, script: dict) -> bool:
    return bool(script.get("loop", cfg["video"].get("loop", True))) and len(script["scenes"]) >= 2


def run(ep: Path) -> None:
    cfg = load_config()
    script = read_json(ep / "script.json")
    build = ep / "build"
    build.mkdir(exist_ok=True)
    scenes = script["scenes"]
    text = " ".join(s["text"].strip() for s in scenes)
    vcfg = dict(cfg["voice"])
    vcfg.update(script.get("voice", {}))
    engine = script.get("voice_engine") or vcfg.get("engine", "edge")
    loop = is_loop(cfg, script)

    # Seamless-loop trick: voice the script PLUS the first scene again, so the last line is spoken
    # with "the sentence continues" intonation; then cut exactly where the repeat begins.
    tts_text = f"{text} {scenes[0]['text'].strip()}" if loop else text
    raw = build / "voice_raw.mp3"
    log(f"TTS engine={engine}, {len(text.split())} words, loop={'on' if loop else 'off'}")
    try:
        words = ENGINES[engine](tts_text, raw, vcfg)
    except (SystemExit, Exception) as e:  # main voice down -> the other free voice, then offline Piper
        if engine not in ("edge", "kokoro"):
            raise
        other = "edge" if engine == "kokoro" else "kokoro"
        log(f"{engine} TTS unavailable ({e}); trying {other}")
        try:
            words = ENGINES[other](tts_text, raw, vcfg)
        except (SystemExit, Exception) as e2:
            log(f"{other} TTS unavailable ({e2}); trying offline Piper voice")
            words = _piper(tts_text, raw, vcfg)
    raw_dur = probe_duration(raw)
    n_events = len(words)
    if len(words) < len(tts_text.split()) * 0.6:
        log("word timings missing/short -> estimating from text length")
        words = _estimate(tts_text, raw_dur)
    elif words[-1]["end"] < 0.75 * raw_dur or words[-1]["end"] > raw_dur + 0.5:
        log(f"word timings end at {words[-1]['end']:.1f}s but the audio is {raw_dur:.1f}s -> estimating instead")
        words = _estimate(tts_text, raw_dur)

    if loop:
        lead = 0.04
        cut_chars, pos, rep = len(_norm(text)), 0, None
        for k, w in enumerate(words):
            if pos >= cut_chars:
                rep = k
                break
            pos += len(_norm(w["w"]))
        if rep is None or rep == 0:
            rep = len(words)
            end = min(words[-1]["end"] + 0.15, raw_dur)
        else:
            end = words[rep]["start"] - lead
        expected = raw_dur * cut_chars / max(len(_norm(tts_text)), 1)
        if end < 0.85 * expected or end > 1.15 * expected:   # timings disagree with the audio: never cut speech
            log(f"loop cut at {end:.1f}s looks wrong (expected ~{expected:.1f}s) -> using proportional timings")
            words = _estimate(tts_text, raw_dur)
            pos, rep = 0, len(words)
            for k, w in enumerate(words):
                if pos >= cut_chars:
                    rep = k
                    break
                pos += len(_norm(w["w"]))
            end = words[rep]["start"] - lead if rep < len(words) else raw_dur
        start = max(words[0]["start"] - lead, 0.0)
        words = [{"w": w["w"], "start": round(w["start"] - start, 3), "end": round(min(w["end"], end) - start, 3)}
                 for w in words[:rep]]
        tail = 0.0
    else:
        start, end, tail = 0.0, raw_dur, cfg["video"].get("tail", 0.5)
    # trim to the loop window and store as WAV (no MP3 encoder padding = sample-accurate seam)
    run_ffmpeg(["-i", str(raw), "-af",
                f"atrim=start={start:.3f}:end={end:.3f},asetpts=PTS-STARTPTS,"
                f"afade=t=in:d=0.008,areverse,afade=t=in:d=0.008,areverse",
                "-ar", "44100", "-ac", "2", str(build / "voice.wav")])
    dur = end - start
    write_json(build / "words.json", words)
    timings = scene_timings(scenes, words, dur, tail)
    write_json(build / "timings.json", {"audio_duration": round(dur, 3), "loop": loop, "scenes": timings,
                                        "tts": {"engine": engine, "raw_seconds": round(raw_dur, 2),
                                                "word_events": n_events, "words": len(text.split())}})
    log(f"voice {dur:.1f}s -> {len(timings)} scenes timed")
    if dur > cfg["video"]["max_seconds"]:
        log(f"WARNING: narration {dur:.1f}s is longer than max_seconds={cfg['video']['max_seconds']}. Shorten the script.")
