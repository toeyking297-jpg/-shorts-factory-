import sys, pathlib, numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2]))
from rodkit import audio as A
SR = A.SR
starts = {}; t = 0
for name, d in [("wake", 8.0), ("idle", 3.2), ("talk", 4.0), ("laugh", 3.4), ("walk", 6.0), ("toward", 3.6), ("away", 3.6), ("run", 2.8), ("startle", 2.4), ("fall", 3.4), ("sit", 10.0), ("give", 2.8), ("hug", 3.2)]:
    starts[name] = t; t += d
D = t + 0.3; out = np.zeros(int(D * SR))
def mono(x): return x.mean(axis=1) if x.ndim == 2 else x
def put(x, at, g=1.0):
    i = int(at * SR); n = min(len(x), len(out) - i)
    if n > 0 and i >= 0: out[i:i + n] += g * x[:n]
def thud(seed, g=1.0, f=90, dec=40):
    r = np.random.default_rng(abs(int(seed))); n = int(0.14 * SR); tt = np.arange(n) / SR
    x = r.standard_normal(n) * np.exp(-tt * 55)
    for _ in range(4): x = np.convolve(x, np.ones(9) / 9, "same")
    return (x * 1.8 + np.sin(2 * np.pi * f * tt) * np.exp(-tt * dec) * 0.7) * g
def beep(at, dur=0.09, fr=2100):
    tt = np.arange(int(dur * SR)) / SR; put(np.sin(2 * np.pi * fr * tt) * np.minimum(1, np.minimum(tt, dur - tt) * 200) * 0.35, at)
m = mono(A.music(D, "morning")); put(m * 0.45, 0)
for k in range(0, int(D), 4): put(mono(A.sfx("room")), k, 0.6)
put(mono(A.sfx("birds")), 0.2, 0.7); put(mono(A.sfx("birds")), 4.5, 0.6)
# นาฬิกาปลุก
tb = 1.6
while tb < 3.1:
    beep(tb); beep(tb + 0.13); tb += 0.5
# ก้าวเท้า: จำลองตำแหน่ง/เฟส
E = {"linear": lambda u: u, "in": lambda u: u * u, "out": lambda u: 1 - (1 - u) ** 2, "inout": lambda u: 2 * u * u if u < .5 else 1 - (-2 * u + 2) ** 2 / 2}
def kf(keys, tt):
    if tt <= keys[0][0]: return keys[0][1]
    for i in range(1, len(keys)):
        t1, v1 = keys[i][0], keys[i][1]; e = keys[i][2] if len(keys[i]) > 2 else "inout"
        if tt <= t1:
            t0, v0 = keys[i - 1][0], keys[i - 1][1]; return v0 + (v1 - v0) * E[e]((tt - t0) / (t1 - t0))
    return keys[-1][1]
def steps(keys, base, stride, dur, g=0.8, f=90, minspd=0.25):
    prev = None; tt = 0
    while tt <= dur:
        v = abs(kf(keys, tt)); spd = abs(kf(keys, tt + 0.01) - kf(keys, tt - 0.01)) / 0.02
        c = int(v // (stride / 2))
        if prev is not None and c != prev and spd > minspd * stride: put(thud(c + base * 100, g, f), base + tt)
        prev = c; tt += 0.002
SW = 520 * 0.62 * 1.06
steps([[0, -430], [0.75, -430], [1.75, -290, "in"], [4.4, 330, "linear"], [5.4, 460, "out"]], starts["walk"], SW, 6.0)
steps([[0, 120], [0.7, 120], [3.5, 410, "linear"]], starts["toward"], SW * 0.32, 3.6, 0.7)
steps([[0, 410], [0.7, 410], [3.5, 120, "linear"]], starts["away"], SW * 0.32, 3.6, 0.55)
steps([[0, -950], [2.8, 1350, "linear"]], starts["run"], SW * 1.75, 2.8, 1.0, 110)
w = mono(A.sfx("whoosh"))
for at in [starts["walk"] + 0.3, starts["toward"] + 0.25, starts["away"] + 0.25]: put(w, at, 0.35)
put(w, starts["run"], 0.5)
put(w, starts["startle"] + 0.6, 0.6); put(thud(5, 1.2, 70), starts["startle"] + 1.4); put(mono(A.sfx("pop")), starts["startle"] + 0.72, 0.6)
put(w, starts["fall"] + 0.5, 0.7); put(thud(9, 1.6, 60, 25), starts["fall"] + 0.88); put(mono(A.sfx("sparkle")), starts["fall"] + 1.2, 0.5)
s0 = starts["sit"]
put(thud(11, 0.5, 140), s0 + 1.55)
for at in [2.3, 3.85]: put(mono(A.sfx("cup")), s0 + at, 0.35)
put(mono(A.sfx("cup")), s0 + 4.62, 0.6); put(mono(A.sfx("cup")), s0 + 6.42, 0.5)
put(mono(A.sfx("typing"))[:int(1.4 * SR)], s0 + 6.8, 0.5); put(thud(12, 0.5, 140), s0 + 9.6)
put(mono(A.sfx("pop")), starts["give"] + 1.0, 0.5)
put(mono(A.sfx("sparkle")), starts["hug"] + 1.3, 0.6); put(mono(A.sfx("chime")), starts["hug"] + 1.5, 0.5)
k = int(0.6 * SR); out[-k:] *= np.linspace(1, 0, k)
out /= np.abs(out).max() / 0.85
A.save_wav(pathlib.Path(sys.argv[1]), out)
print("ok", round(D, 2))
