"""Machine check of the voice files: transcribe each line (faster-whisper) and compare with the script.

This is a machine check, not a human listening review. Thai ASR makes its own mistakes, so a low
character error rate is evidence the words are there, not proof the pronunciation sounds natural.
"""
from __future__ import annotations

import difflib
import re
import subprocess

import numpy as np

from .common import ep_dir, load, save, step_set


_NUM = [("2,500", "สองพันห้าร้อย"), ("2500", "สองพันห้าร้อย"), ("๔๕", "สี่สิบห้า"), ("45", "สี่สิบห้า"),
        ("50", "ห้าสิบ"), ("3", "สาม"), ("off-fit", "ออฟฟิศ"), ("office", "ออฟฟิศ"), ("q", "คิว"),
        ("เร็วๆ", "เร็วเร็ว")]


def _norm(s: str) -> str:
    s = s.lower()
    for a, b in _NUM:                      # longest numbers first, so 2500 is not read as 25 + 00
        s = s.replace(a, b)
    return re.sub(r"[\s\W_]+", "", s)


def cer(ref: str, hyp: str) -> float:
    r, h = _norm(ref), _norm(hyp)
    sm = difflib.SequenceMatcher(None, r, h)
    match = sum(b.size for b in sm.get_matching_blocks())
    return round(1 - match / max(len(r), 1), 3)


def run(ep: str, model_name="small") -> dict:
    from faster_whisper import WhisperModel
    d = ep_dir(ep)
    script = load(d / "script.json")
    vm = load(d / "audio" / "voice_manifest.json")
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    rows = []
    for ln in script["dialogue"]:
        did = ln["dialogue_id"]
        if did not in vm:
            rows.append(dict(dialogue_id=did, speaker=ln["character_id"], script=ln["text"], asr="", cer=1.0,
                             flag="NO_AUDIO"))
            continue
        f = d / vm[did]["file"]
        pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(f), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                             capture_output=True, check=True).stdout
        segs, info = model.transcribe(np.frombuffer(pcm, np.float32), language="th", beam_size=5, vad_filter=False)
        hyp = "".join(s.text for s in segs).strip()
        c = cer(ln["text"], hyp)
        rows.append(dict(dialogue_id=did, speaker=ln["character_id"], script=ln["text"], asr=hyp, cer=c,
                         flag="CHECK" if c > 0.25 else "OK"))
        print(f"{did} cer={c:.2f} | {ln['text']} | {hyp}")
    rep = dict(model=f"faster-whisper {model_name} int8", kind="machine ASR check (not a human listening review)",
               lines=rows, mean_cer=round(sum(r["cer"] for r in rows) / len(rows), 3),
               flagged=[r["dialogue_id"] for r in rows if r["flag"] != "OK"])
    save(d / "audio" / "asr_report.json", rep)
    step_set(ep, "asr", "READY", mean_cer=rep["mean_cer"], flagged=rep["flagged"])
    return rep


def rescore(ep: str) -> dict:
    """Recompute CER from the stored transcripts (after a normalisation fix), without re-running ASR."""
    d = ep_dir(ep)
    rep = load(d / "audio" / "asr_report.json")
    for r in rep["lines"]:
        r["cer"] = cer(r["script"], r["asr"])
        r["flag"] = "CHECK" if r["cer"] > 0.25 else "OK"
    rep["mean_cer"] = round(sum(r["cer"] for r in rep["lines"]) / len(rep["lines"]), 3)
    rep["flagged"] = [r["dialogue_id"] for r in rep["lines"] if r["flag"] != "OK"]
    save(d / "audio" / "asr_report.json", rep)
    step_set(ep, "asr", "READY", mean_cer=rep["mean_cer"], flagged=rep["flagged"])
    return rep
