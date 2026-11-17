"""rodkit produce: ทำคลิปเต็ม (เสียงพากย์ + ซับ + ปากขยับ + เสียงประกอบ + ดนตรี) จากไฟล์ตอน

python -m rodkit.produce rodkit/episodes/DP001.ep.json            ทำเสียง → จัดเวลา → เรนเดอร์ → rodkit/build/<id>/<id>.mp4
python -m rodkit.produce <ep> --dry                                 ไม่เรียก TTS (เสียงเงียบตามความยาวประมาณ) ใช้ทดสอบ

ในไฟล์ตอน แต่ละช็อตใส่:
  "say":  [{"who": "phum", "text": "..."}, ...]      พูดเรียงกันในช็อต (ช็อตยืดตามความยาวเสียงอัตโนมัติ)
  "sfx":  [{"name": "chime", "at": 0.2} | {"name": "cup", "line": 1, "prompt": "ceramic cup clink"}]
ระดับตอน: "music": "morning" | "comedy" | "family", "ambience": "room"

เสียงพากย์: ElevenLabs (ELEVENLABS_API_KEY) ตาม DNA ใน rodkit/cast.json — ถ้ายังไม่มี voice_id จะเลือกจากบัญชีแล้วล็อกลงไฟล์
ถ้าไม่มีคีย์/เรียกไม่ได้ → Edge TTS ภาษาไทย (ฟรี) ปรับโทนเสียงแยกตัวละคร
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import pathlib
import subprocess
import sys
import wave

import numpy as np

from . import audio as AU

ROOT = pathlib.Path(__file__).resolve().parent
CAST = ROOT / "cast.json"

# สำรอง (Edge TTS ภาษาไทย มี 3 เสียง: ปรับ pitch/rate ให้แต่ละตัวต่างกัน)
EDGE = {
    "narrator": ("th-TH-PremwadeeNeural", "-6%", "+0Hz"),
    "phum": ("th-TH-NiwatNeural", "+0%", "+0Hz"),
    "hero": ("th-TH-NiwatNeural", "+4%", "+6Hz"),
    "big": ("th-TH-NiwatNeural", "-4%", "-8Hz"),
    "boss": ("th-TH-NiwatNeural", "-8%", "-14Hz"),
    "fah": ("th-TH-AcharaNeural", "+6%", "+8Hz"),
    "prang": ("th-TH-PremwadeeNeural", "+0%", "+6Hz"),
    "mind": ("th-TH-AcharaNeural", "+8%", "+0Hz"),
    "jaew": ("th-TH-AcharaNeural", "+0%", "-6Hz"),
    "yai": ("th-TH-PremwadeeNeural", "-14%", "-12Hz"),
    "khaotu": ("th-TH-AcharaNeural", "+6%", "+28Hz"),
}


def log(*a):
    print(*a, flush=True)


def dur_of(path: pathlib.Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(path)], capture_output=True, text=True)
    return float(out.stdout.strip() or 0)


def to_np(path: pathlib.Path) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "2", "-ar", str(AU.SR), "-"], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


# ---------- ElevenLabs ----------
class Eleven:
    def __init__(self):
        self.key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
        self.ok = bool(self.key)
        self.cast = json.loads(CAST.read_text("utf-8"))
        self.dirty = False
        self._voices = None

    def _req(self, method, url, **kw):
        import requests
        r = requests.request(method, url, headers={"xi-api-key": self.key, **kw.pop("headers", {})}, timeout=180, **kw)
        r.raise_for_status()
        return r

    def voices(self):
        if self._voices is None:
            self._voices = self._req("GET", "https://api.elevenlabs.io/v1/voices").json().get("voices", [])
        return self._voices

    def voice_for(self, who: str) -> dict:
        ch = self.cast["characters"].get(who) or self.cast["characters"].setdefault(who, {"name": who, "voice": {"gender": "female", "age": "30s", "voice_id": ""}})
        v = ch["voice"]
        if not v.get("voice_id"):
            used = {c["voice"].get("voice_id") for c in self.cast["characters"].values() if c["voice"].get("voice_id")}
            g = v.get("gender", "").split()[0]
            want_age = "young" if ("child" in v.get("gender", "") or "20s" in v.get("age", "")) else ("old" if any(x in v.get("age", "") for x in ("60", "70", "old")) else "middle")
            best, bs = None, -9
            for vo in self.voices():
                lb = vo.get("labels") or {}
                sc = (3 if lb.get("gender") == g else -3) + (2 if want_age in (lb.get("age") or "") else 0) - (5 if vo["voice_id"] in used else 0)
                if sc > bs:
                    best, bs = vo, sc
            if best:
                v["voice_id"] = best["voice_id"]; v["voice_name"] = best.get("name", "")
                self.dirty = True
                log(f"  ล็อกเสียง {who} → {best.get('name')} ({best['voice_id']})")
        return v

    def tts(self, who: str, text: str, out: pathlib.Path):
        v = self.voice_for(who)
        body = {"text": text, "model_id": self.cast.get("model", "eleven_v3"),
                "voice_settings": {"stability": v.get("stability", 0.5), "similarity_boost": 0.8, "style": v.get("style", 0.35)}}
        try:
            r = self._req("POST", f"https://api.elevenlabs.io/v1/text-to-speech/{v['voice_id']}", params={"output_format": "mp3_44100_128"}, json=body)
        except Exception as e:  # รุ่นโมเดลไม่รองรับ → ลอง multilingual
            log(f"  eleven {body['model_id']} ไม่ผ่าน ({e}) ลอง eleven_multilingual_v2")
            body["model_id"] = "eleven_multilingual_v2"
            r = self._req("POST", f"https://api.elevenlabs.io/v1/text-to-speech/{v['voice_id']}", params={"output_format": "mp3_44100_128"}, json=body)
        out.write_bytes(r.content)

    def sound(self, prompt: str, seconds: float, out: pathlib.Path):
        r = self._req("POST", "https://api.elevenlabs.io/v1/sound-generation", json={"text": prompt, "duration_seconds": max(0.5, min(22, seconds)), "prompt_influence": 0.5})
        out.write_bytes(r.content)

    def save(self):
        if self.dirty:
            CAST.write_text(json.dumps(self.cast, ensure_ascii=False, indent=2) + "\n", "utf-8")


def edge_tts(who: str, text: str, out: pathlib.Path):
    import asyncio
    import edge_tts as E
    voice, rate, pitch = EDGE.get(who, EDGE["narrator"])
    async def go():
        await E.Communicate(text, voice, rate=rate, pitch=pitch).save(str(out))
    asyncio.run(asyncio.wait_for(go(), timeout=90))


# ---------- main ----------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--dry", action="store_true")
    ap.add_argument("--no-render", action="store_true")
    a = ap.parse_args()
    ep = json.loads(pathlib.Path(a.episode).read_text("utf-8"))
    eid = ep["id"]
    out = ROOT / "build" / eid
    vdir = out / "voice"; vdir.mkdir(parents=True, exist_ok=True)
    EL = Eleven() if not a.dry else None
    engine = "dry" if a.dry else ("elevenlabs" if EL.ok else "edge")
    log(f"เสียงพากย์: {engine}")

    def synth(who, text):
        h = hashlib.md5(f"{engine}|{who}|{text}".encode()).hexdigest()[:12]
        p = vdir / f"{who}_{h}.mp3"
        if p.exists() and p.stat().st_size > 500:
            return p
        nonlocal_engine = engine
        if nonlocal_engine == "elevenlabs":
            try:
                EL.tts(who, text, p); return p
            except Exception as e:  # noqa: BLE001
                log(f"  ElevenLabs ใช้ไม่ได้ ({e}) → Edge TTS")
        if nonlocal_engine in ("elevenlabs", "edge"):
            try:
                edge_tts(who, text, p); return p
            except Exception as e:  # noqa: BLE001
                log(f"  Edge TTS ใช้ไม่ได้ ({e}) → เงียบ")
        sec = 0.6 + len(text) * 0.085
        AU.save_wav(p.with_suffix(".wav"), np.zeros(int(sec * AU.SR)))
        return p.with_suffix(".wav")

    # 1) เสียงพากย์ + เวลา
    T, voices, sfx_events, LEAD, GAP, TAIL = 0.0, [], [], 0.35, 0.28, 0.55
    for S in ep["shots"]:
        t = LEAD
        subs, talks = [], {}
        line_t = []
        for L in S.get("say", []):
            p = synth(L["who"], L["text"])
            d = dur_of(p)
            voices.append((T + t, p, L.get("gain", 1.0)))
            subs.append([round(t, 3), round(t + d, 3), L.get("sub", L["text"])])
            talks.setdefault(L["who"], []).append((t, t + d))
            line_t.append(t)
            t += d + L.get("pause", GAP)
        if S.get("say"):
            S["dur"] = round(max(S.get("dur", 0), t - GAP + TAIL), 3)
            S["subs"] = S.get("subs", []) + subs
        for A in S.get("actors", []):
            w = A.get("who")
            if w in talks:
                kf = [[0, 0]]
                for (s0, s1) in talks[w]:
                    kf += [[max(0, s0 - 0.01), 0], [s0, 1], [s1, 1], [s1 + 0.01, 0]]
                A["talk"] = kf
        for X in S.get("sfx", []):
            at = X.get("at", 0) if "line" not in X else line_t[min(X["line"], len(line_t) - 1)] + X.get("at", 0) if line_t else X.get("at", 0)
            sfx_events.append((T + at, X))
        T += S["dur"]
    total = T
    log(f"ความยาวคลิป {total:.1f} วินาที · เสียงพูด {len(voices)} ประโยค")

    # 2) มิกซ์
    n = int((total + 0.5) * AU.SR)
    vbus = np.zeros((n, 2), np.float32); fbus = np.zeros((n, 2), np.float32)
    for at, p, g in voices:
        x = to_np(p); i = int(at * AU.SR); k = min(len(x), n - i)
        if k > 0: vbus[i:i + k] += x[:k] * g
    sdir = out / "sfx"; sdir.mkdir(exist_ok=True)
    for at, X in sfx_events:
        name = X["name"]
        x = None
        if EL and EL.ok and X.get("prompt"):
            sp = sdir / f"{hashlib.md5(X['prompt'].encode()).hexdigest()[:10]}.mp3"
            try:
                if not sp.exists(): EL.sound(X["prompt"], X.get("len", 1.5), sp)
                x = to_np(sp)
            except Exception as e:  # noqa: BLE001
                log(f"  เสียงประกอบ ElevenLabs ใช้ไม่ได้ ({e}) ใช้เสียงสำรอง")
        if x is None:
            y = AU.sfx(name); x = np.stack([y, y], 1) if y.ndim == 1 else y
        i = int(at * AU.SR); k = min(len(x), n - i)
        if k > 0: fbus[i:i + k] += x[:k] * X.get("gain", 0.8)
    mus = AU.music(total + 0.5, ep.get("music", "morning"))[:n]
    mbus = np.zeros((n, 2), np.float32); mbus[: len(mus)] = mus
    # ลดเสียงดนตรีตอนมีคนพูด
    env = np.abs(vbus).max(1)
    win = int(0.25 * AU.SR); env = np.convolve(env, np.ones(win) / win, mode="same")
    duck = 1 - 0.6 * np.clip(env / (env.max() + 1e-6) * 3, 0, 1)
    mix = vbus * 1.0 + fbus * 0.9 + mbus * (0.32 * duck)[:, None]
    if ep.get("ambience"):
        amb = AU.sfx(ep["ambience"]); reps = int(np.ceil(n / len(amb)))
        mix += np.tile(amb, reps)[:n, None] * 0.6
    mix = mix / max(1.0, np.abs(mix).max() / 0.95)
    wav = out / f"{eid}_mix.wav"
    AU.save_wav(wav, mix)
    if EL: EL.save()

    # 3) ไฟล์ตอนที่จัดเวลาแล้ว → เรนเดอร์
    ep["audio"] = str(wav)
    res = out / f"{eid}.resolved.json"
    res.write_text(json.dumps(ep, ensure_ascii=False, indent=1), "utf-8")
    log(f"ไฟล์ตอนจัดเวลาแล้ว: {res}")
    if not a.no_render:
        subprocess.run([sys.executable, "-m", "rodkit.make", str(res)], check=True)


if __name__ == "__main__":
    main()
