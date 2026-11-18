"""rodkit audio: ดนตรีประกอบสังเคราะห์ (ไม่ติดลิขสิทธิ์) + เสียงประกอบสำรอง (ใช้เมื่อไม่มี ElevenLabs)

ทุกอย่างสร้างด้วย numpy เป็น WAV 44.1 kHz stereo
"""
from __future__ import annotations

import math
import wave
from pathlib import Path

import numpy as np

SR = 44100


def save_wav(path: Path, x: np.ndarray):
    x = np.asarray(x, dtype=np.float32)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    x = np.clip(x, -1, 1)
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())


def _midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def pluck(freq, dur, bright=0.5, seed=0):
    """Karplus-Strong: เสียงดีดคล้ายอูคูเลเล่/กีตาร์ไนลอน"""
    n = int(dur * SR)
    p = max(2, int(SR / freq))
    rng = np.random.default_rng(seed)
    buf = rng.uniform(-1, 1, p) * 0.6
    buf = np.convolve(buf, np.ones(3) / 3, mode="same") if bright < 0.5 else buf
    out = np.zeros(n, dtype=np.float32)
    damp = 0.996 - 0.006 * (1 - bright)
    i = 0
    while i < n:
        k = min(p, n - i)
        out[i:i + k] = buf[:k]
        nb = damp * 0.5 * (buf + np.roll(buf, -1))
        buf = nb
        i += k
    env = np.minimum(1, np.arange(n) / (0.004 * SR))
    return out * env


def bell(freq, dur, amp=0.25):
    t = np.arange(int(dur * SR)) / SR
    x = sum(a * np.sin(2 * np.pi * freq * m * t) * np.exp(-t * d) for m, a, d in [(1, 1, 3.2), (2.76, 0.4, 5), (5.4, 0.2, 8)])
    return amp * x * np.minimum(1, t / 0.003)


def soft_kick(dur=0.35):
    t = np.arange(int(dur * SR)) / SR
    f = 110 * np.exp(-t * 18) + 45
    return 0.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def shaker(dur=0.09, seed=1):
    t = np.arange(int(dur * SR)) / SR
    n = np.random.default_rng(seed).uniform(-1, 1, t.size)
    n = n - np.convolve(n, np.ones(6) / 6, mode="same")
    return 0.12 * n * np.exp(-t * 45)


def _place(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i >= buf.shape[0]:
        return
    k = min(x.shape[0], buf.shape[0] - i)
    buf[i:i + k] += gain * x[:k]


def _reverb(x, mix=0.18):
    y = x.copy()
    for d, g in [(0.029, 0.5), (0.037, 0.45), (0.041, 0.4), (0.053, 0.35)]:
        k = int(d * SR)
        z = np.zeros_like(x)
        for rep in range(1, 7):
            if k * rep < x.size:
                z[k * rep:] += (g ** rep) * x[: x.size - k * rep]
        y += mix * z / 2
    return y


MOODS = {
    # ความรู้สึกของเพลง: คอร์ด (รากเป็น MIDI), จังหวะ, ความสว่างของเสียงดีด
    "morning": {"bpm": 96, "chords": [(60, "maj"), (67, "maj"), (69, "min"), (65, "maj")], "bright": 0.7, "bells": True, "kick": False},
    "comedy": {"bpm": 118, "chords": [(62, "maj"), (66, "min"), (67, "maj"), (69, "maj")], "bright": 0.8, "bells": False, "kick": True},
    "family": {"bpm": 84, "chords": [(65, "maj"), (69, "min"), (70, "maj"), (60, "maj")], "bright": 0.45, "bells": True, "kick": False},
}


def music(seconds: float, mood: str = "morning", seed: int = 7) -> np.ndarray:
    M = MOODS.get(mood, MOODS["morning"])
    beat = 60 / M["bpm"]
    n = int((seconds + 2) * SR)
    L = np.zeros(n, dtype=np.float32); R = np.zeros(n, dtype=np.float32)
    rng = np.random.default_rng(seed)
    bar = 4 * beat
    t, ci = 0.0, 0
    strum = [0, 1, 1.5, 2, 3, 3.5]  # ดีดแบบเกาะจังหวะ
    while t < seconds + 1:
        root, q = M["chords"][ci % len(M["chords"])]
        notes = [root, root + (4 if q == "maj" else 3), root + 7, root + 12]
        for j, b in enumerate(strum):
            at = t + b * beat
            g = 0.16 if b == int(b) else 0.1
            for k, nn in enumerate(notes):
                x = pluck(_midi(nn), 1.4, M["bright"], seed=int(at * 100) + k)
                _place(L if k % 2 else R, x, at + k * 0.012, g)
                _place(R if k % 2 else L, x, at + k * 0.012, g * 0.6)
        # เบสนุ่ม
        tt = np.arange(int(bar * SR)) / SR
        bass = 0.16 * np.sin(2 * np.pi * _midi(root - 24) * tt) * np.exp(-tt * 1.2)
        _place(L, bass, t); _place(R, bass, t)
        if M["bells"] and ci % 2 == 1:
            for b in (0.5, 1.5, 2.5):
                nn = notes[int(rng.integers(1, 4))] + 12
                x = bell(_midi(nn), 1.2, 0.07)
                _place(L, x, t + b * beat); _place(R, x, t + b * beat + 0.01)
        for b in range(8):
            s = shaker(seed=ci * 8 + b)
            _place(R, s, t + b * beat / 2, 0.8 if b % 2 else 0.5)
        if M["kick"]:
            for b in (0, 2):
                k = soft_kick(); _place(L, k, t + b * beat, 0.5); _place(R, k, t + b * beat, 0.5)
        t += bar; ci += 1
    x = np.stack([_reverb(L), _reverb(R)], axis=1)[: int(seconds * SR)]
    fade_in, fade_out = int(0.8 * SR), int(2.2 * SR)
    x[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
    x[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None]
    return x / (np.abs(x).max() + 1e-6) * 0.8


# ---------- เสียงประกอบสำรอง ----------
def sfx(name: str) -> np.ndarray:
    t = lambda d: np.arange(int(d * SR)) / SR
    rng = np.random.default_rng(abs(hash(name)) % 2**32)
    if name in ("chime", "sparkle"):
        x = sum(bell(_midi(n), 1.4, 0.18) * 1 for n in ([84, 88, 91] if name == "chime" else [96, 100, 103, 108]))
        return x
    if name == "pop":
        tt = t(0.12); return 0.6 * np.sin(2 * np.pi * (900 - 4000 * tt) * tt) * np.exp(-tt * 40)
    if name == "whoosh":
        tt = t(0.6); n = rng.uniform(-1, 1, tt.size); env = np.sin(np.pi * tt / 0.6) ** 2
        n = np.convolve(n, np.ones(12) / 12, mode="same"); return 0.5 * n * env
    if name == "cup":
        return bell(1800, 0.5, 0.25) + np.pad(bell(2600, 0.4, 0.12), (0, int(0.1 * SR)))
    if name == "typing":
        out = np.zeros(int(1.6 * SR))
        for i in range(18):
            k = rng.uniform(-1, 1, 260) * np.exp(-np.arange(260) / 40)
            _place(out, k * 0.25, i * 0.085 + rng.uniform(0, 0.03))
        return out
    if name == "door":
        tt = t(0.5); return 0.4 * np.sin(2 * np.pi * 120 * tt) * np.exp(-tt * 10) + 0.2 * rng.uniform(-1, 1, tt.size) * np.exp(-tt * 30)
    if name == "steps":
        out = np.zeros(int(1.8 * SR))
        for i in range(4):
            tt = t(0.12); _place(out, 0.35 * np.sin(2 * np.pi * 90 * tt) * np.exp(-tt * 35) + 0.08 * rng.uniform(-1, 1, tt.size) * np.exp(-tt * 50), i * 0.45)
        return out
    if name == "birds":
        out = np.zeros(int(2.5 * SR))
        for i in range(6):
            tt = t(0.18); f0 = rng.uniform(2800, 4200)
            _place(out, 0.12 * np.sin(2 * np.pi * (f0 + 900 * np.sin(2 * np.pi * 14 * tt)) * tt) * np.sin(np.pi * tt / 0.18), i * 0.35 + rng.uniform(0, 0.1))
        return out
    if name == "room":
        n = rng.uniform(-1, 1, int(4 * SR)); n = np.convolve(n, np.ones(60) / 60, mode="same"); return 0.05 * n
    tt = t(0.2); return 0.3 * np.sin(2 * np.pi * 660 * tt) * np.exp(-tt * 12)
