"""Real-audio timeline: trim and level each line, place it with its pause, then resolve shots, SFX,
subtitles (ASS + SRT), the audio mix, shotlist.json/csv and continuity_matrix.csv.
"""
from __future__ import annotations

import csv
import json
import re
import subprocess

import numpy as np

from .common import ASSETS, FPS, ep_dir, load, resolve, save, sha, step_set
from . import subs

SR = 48000
LEAD_IN = 0.12


def _decode(path) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def _trim(x: np.ndarray, thr_db=-45.0, pad=0.03):
    win = int(0.01 * SR)
    n = len(x) // win
    e = 20 * np.log10(np.sqrt((x[:n * win].reshape(n, win) ** 2).mean(1)) + 1e-9)
    on = np.nonzero(e > thr_db)[0]
    if len(on) == 0:
        return x, 0.0, 0.0
    a = max(0, on[0] * win - int(pad * SR))
    b = min(len(x), (on[-1] + 1) * win + int(pad * SR))
    return x[a:b], a / SR, (len(x) - b) / SR


def _level(x: np.ndarray, target_db=-20.0):
    win = int(0.02 * SR)
    n = len(x) // win
    r = np.sqrt((x[:n * win].reshape(n, win) ** 2).mean(1))
    act = r[r > r.max() * 0.1] if n else r
    rms = np.sqrt((act ** 2).mean()) if len(act) else 1e-3
    g = 10 ** (target_db / 20) / max(rms, 1e-6)
    y = x * g
    pk = np.abs(y).max()
    return (y / pk * 0.89 if pk > 0.89 else y), float(round(float(20 * np.log10(g)), 2))


def _env(x: np.ndarray):
    hop = SR // FPS
    n = int(np.ceil(len(x) / hop))
    e = np.array([np.sqrt(np.mean(x[k * hop:(k + 1) * hop] ** 2)) if k * hop < len(x) else 0 for k in range(n)])
    ref = np.percentile(e, 95) if len(e) else 1
    return [round(float(v), 3) for v in np.clip(e / max(ref, 1e-6), 0, 1.5)]


# ------------------------------------------------------------------ SFX (synthesised, no licences needed)
def sfx(name: str) -> np.ndarray:
    t = np.arange(int(SR * {"ding": 0.9, "whoosh": 0.35, "dun": 1.0}[name])) / SR
    rng = np.random.default_rng(7)
    if name == "ding":
        y = (np.sin(2 * np.pi * 1318 * t) + 0.6 * np.sin(2 * np.pi * 1760 * t)) * np.exp(-t * 5)
        return y * 10 ** (-17 / 20)
    if name == "whoosh":
        n = rng.standard_normal(len(t))
        k = np.exp(-((t - 0.15) / 0.07) ** 2)
        sm = np.convolve(n, np.ones(12) / 12, "same")
        return sm * k * 10 ** (-12 / 20)
    if name == "dun":
        y = np.sin(2 * np.pi * (70 - 15 * t) * t) * np.exp(-t * 3.2) + 0.4 * np.sin(2 * np.pi * 140 * t) * np.exp(-t * 6)
        return y * 10 ** (-9 / 20)
    raise KeyError(name)


def _bed(n: int) -> np.ndarray:
    """Quiet street room tone so pauses are not dead digital silence."""
    rng = np.random.default_rng(3)
    b = np.cumsum(rng.standard_normal(n)) * 0.02
    b = b - np.convolve(b, np.ones(4801) / 4801, "same")
    b /= np.sqrt(np.mean(b ** 2)) + 1e-9
    return b * 10 ** (-50 / 20)          # RMS -50 dBFS before loudness normalisation


def build(ep: str) -> dict:
    d = ep_dir(ep)
    script = load(d / "script.json")
    vm = load(d / "audio" / "voice_manifest.json")
    src = load(d / "shotlist_src.json")
    man = load(ASSETS / "manifest.json")
    linedir = d / "audio" / "lines"
    linedir.mkdir(parents=True, exist_ok=True)
    lines, t, audio = {}, LEAD_IN, {}
    for ln in script["dialogue"]:
        did = ln["dialogue_id"]
        x = _decode(d / vm[did]["file"])
        raw_dur = len(x) / SR
        x, cut_a, cut_b = _trim(x)
        x, gain = _level(x)
        audio[did] = x
        dur = len(x) / SR
        lines[did] = dict(dialogue_id=did, speaker=ln["character_id"], start=round(t, 3), end=round(t + dur, 3),
                          dur=round(dur, 3), raw_dur=round(raw_dur, 3), trimmed_head=round(cut_a, 3),
                          trimmed_tail=round(cut_b, 3), gain_db=gain, pause_after=ln["pause_after_ms"] / 1000,
                          est=ln["estimated_duration_sec"], env=_env(x), source=vm[did]["source"])
        t += dur + ln["pause_after_ms"] / 1000
    total = round(resolve(src["end"], lines), 3)
    # shots
    shots = []
    for i, s in enumerate(src["shots"]):
        st = resolve(s["start"], lines)
        shots.append(dict(s, start_sec=round(max(0.0, st), 3)))
    for i, s in enumerate(shots):
        s["end_sec"] = shots[i + 1]["start_sec"] if i + 1 < len(shots) else total
        s["duration"] = round(s["end_sec"] - s["start_sec"], 3)
    problems = [f"{s['shot_id']} duration {s['duration']}" for s in shots if s["duration"] < 0.5]
    for s in shots:
        for did in s["dialogue_ids"]:
            L = lines[did]
            if not (s["start_sec"] - 0.01 <= L["start"] and L["end"] <= s["end_sec"] + 0.25):
                problems.append(f"{s['shot_id']}: {did} ({L['start']}-{L['end']}) outside shot {s['start_sec']}-{s['end_sec']}")
    # sfx events
    events = []
    for s in shots:
        for name, anc in s.get("sfx", []):
            events.append(dict(name=name, t=round(resolve(anc, lines, s["start_sec"]), 3), shot_id=s["shot_id"]))
    # mix
    n = int((total + 0.1) * SR)
    voice = np.zeros(n, np.float32)
    for did, x in audio.items():
        a = int(lines[did]["start"] * SR)
        voice[a:a + len(x)] += x[: n - a]
    fx = np.zeros(n, np.float32)
    for ev in events:
        y = sfx(ev["name"])
        a = int(ev["t"] * SR)
        fx[a:a + len(y)] += y[: n - a].astype(np.float32)
    mix = voice + fx + _bed(n).astype(np.float32)
    fade = int(0.25 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)
    pre = d / "audio" / "mix_pre.wav"
    _write_wav(pre, mix)
    out = d / "audio" / "mix.wav"
    _loudnorm(pre, out)
    # subtitles
    cues = subs.cues(script, lines)
    subs.write_ass(cues, d / "subtitles" / "subtitle.ass")
    subs.write_srt(cues, d / "subtitles" / "subtitle.srt")
    # shotlist outputs
    by_id = {ln["dialogue_id"]: ln for ln in script["dialogue"]}
    rows = []
    for s in shots:
        imgs = [l["asset"] for l in s["layers"] if "asset" in l]
        spk = [lines[x]["speaker"] for x in s["dialogue_ids"]]
        chars = sorted({man[a]["character_id"] for a in imgs if a in man and "character_id" in man[a]})
        rows.append(dict(
            shot_id=s["shot_id"], start_sec=s["start_sec"], end_sec=s["end_sec"], dialogue_ids=s["dialogue_ids"],
            speaker_id=spk, shot_size=s["shot_size"], camera_angle=s["camera_angle"], characters=chars,
            action=s["action"], emotion=s["emotion"], background_id=s["background_id"], image_asset=imgs,
            mouth_anchor={a: man[a]["mouth_anchor"] for a in imgs if man.get(a, {}).get("kind") == "pose"},
            motion=dict(camera=s["camera"], layer_keys={l.get("asset", l.get("text")): l["keys"] for l in s["layers"] if "keys" in l}),
            subtitle_text=[by_id[x]["subtitle"].replace("|", " / ") for x in s["dialogue_ids"]],
            sfx=[f"{e['name']}@{e['t']}" for e in events if e["shot_id"] == s["shot_id"]],
            continuity_notes=s.get("continuity_notes", "")))
    save(d / "shotlist.json", dict(episode_id=ep, total_sec=total, shots=rows, render_spec=shots))
    with open(d / "shotlist.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        for r in rows:
            w.writerow({k: (json.dumps(v, ensure_ascii=False) if isinstance(v, (list, dict)) else v) for k, v in r.items()})
    _continuity(d, shots, man)
    tl = dict(episode_id=ep, total_sec=total, lead_in=LEAD_IN, lines=lines, sfx=events, problems=problems,
              audio=dict(mix="audio/mix.wav", sample_rate=SR),
              input_hash=sha(d / "script.json", d / "shotlist_src.json", d / "audio" / "voice_manifest.json"))
    save(d / "timeline.json", tl)
    step_set(ep, "timeline", "READY" if not problems else "QA_FAILED", total_sec=total, problems=problems)
    print(f"timeline: {total:.2f}s, {len(shots)} shots, problems={problems}")
    return tl


def _write_wav(path, x):
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-ac", "2", str(path)], input=pcm, check=True)


def _loudnorm(src, dst, I=-15.0, TP=-1.5, LRA=11):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(src), "-af",
                        f"loudnorm=I={I}:TP={TP}:LRA={LRA}:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr, re.S).group(0))
    af = (f"loudnorm=I={I}:TP={TP}:LRA={LRA}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-af", af, "-ar", str(SR), str(dst)], check=True)


def _continuity(d, shots, man):
    rows = []
    for s in shots:
        for l in s["layers"]:
            a = l.get("asset")
            rec = man.get(a or "", {})
            if rec.get("kind") != "pose":
                continue
            cid = rec["character_id"]
            props = {"C01": "P01 silver bags" + (" + P02 ticket" if s["shot_id"] in ("SH01",) else ""),
                     "C02": "P03 fan" + (" + P02 ticket" if s["shot_id"] >= "SH09" else ""),
                     "C03": "P04 bag stack on counter" if s["shot_id"] >= "SH10" else "-"}[cid]
            x = l["at"][0] / 1188
            pos = "close-up centre" if "bust" in a else ("left" if x < 0.45 else "centre" if x < 0.7 else "right (behind counter)")
            rows.append(dict(shot_id=s["shot_id"], character_id=cid, outfit=_outfit(cid), prop=props, position=pos,
                             gaze="screen-right" if rec["facing"] > 0 else "screen-left", expression=rec["expression"],
                             asset=a))
    with open(d / "continuity_matrix.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)


def _outfit(cid):
    return {"C01": "mustard hoodie #E3A21A / grey slacks #7A7F87 / white sneakers / round black glasses",
            "C02": "coral floral blouse #D6453D / navy trousers #2B2F4A / brown sandals / gold chain",
            "C03": "white tee / teal apron #2A9D8F / dark grey trousers / silver hoops"}[cid]
