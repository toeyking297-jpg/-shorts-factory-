"""Render a toon episode: script (scenes with narration + shot spec) -> voice -> animated frames -> captions -> MP4.

Script (toon/series/<series>/<episode>_<lang>.json):
  {"series": "SURVIVE DAY 1", "episode": "Blackout · Night 1", "lang": "en",
   "voice": {"engine": "edge", "edge_voice": "en-US-AndrewMultilingualNeural", "rate": "+4%"},
   "end_card": {"kicker": "NEXT EPISODE", "title": "DAY 2: NO WATER"},
   "facts": [...], "meta": {...},
   "scenes": [{"text": "narration", "shot": {...}}]}

Shot keys: set, cast[{who,x,to,pose,mood,look,scale,style}], props[{kind,...}], zip{x,y,from}, card{n,text,at},
counter{value,label,source,x,y,at}, meter{from,to,label}, fx[lights_out|shake|flicker|dim], cam push|pan|still, title.
"""
from __future__ import annotations

import json
import math
import random
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

from ..common import FINAL, ROOT, ffmpeg_bin, log, probe_duration, read_json, run_ffmpeg, write_json
from . import draw, sets
from .draw import CAST, H, SS, W, Canvas, char_sprite, sprite

FPS = 30
CHAR_DY = 200            # cast stands low, captions sit above their heads
END_CARD = 1.8
CAPTION_MARGIN_V = 930   # caption baseline ~y 1080: below the rule card, above the cast's heads
ACCENT = (255, 214, 10)
RULE_COLORS = {"en": (64, 224, 255), "th": (64, 224, 255)}


def ease(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def back(x):
    x = max(0.0, min(1.0, x))
    c1, c3 = 1.70158, 2.70158
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2


def paste(img, spr, x, y, alpha=1.0, scale=1.0):
    im, ax, ay = spr
    if scale != 1.0:
        im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.BILINEAR)
        ax, ay = ax * scale, ay * scale
    if alpha < 1:
        im = im.copy()
        im.putalpha(im.getchannel("A").point(lambda v: int(v * max(alpha, 0))))
    img.alpha_composite(im, (int(x - ax), int(y - ay))) if _inside(img, im, x - ax, y - ay) else \
        img.paste(im, (int(x - ax), int(y - ay)), im)


def _inside(img, im, x, y):
    return x >= 0 and y >= 0 and x + im.width <= img.width and y + im.height <= img.height


# ---------------------------------------------------------------- cached overlay sprites
def card_sprite(n, text, lang):
    return sprite(("card", n, text, lang), lambda c: draw.rule_card(c, W / 2, 900, n, text, RULE_COLORS[lang], lang),
                  anchor=(W / 2, 900))


def counter_sprite(value, label, color=(255, 80, 90)):
    return sprite(("counter", value, label, color), lambda c: draw.countdown(c, W / 2, 400, value, label, color),
                  anchor=(W / 2, 400))


def title_sprite(series, episode):
    return sprite(("title", series, episode), lambda c: draw.title_tag(c, series, episode), anchor=(W / 2, 0))


def zip_sprite():
    return sprite(("zip",), lambda c: draw.zip_drone(c, W / 2, 400, 1.0), anchor=(W / 2, 400))


def source_sprite(txt):
    def d(c):
        c.d.text((W / 2 * SS, 400 * SS), txt, font=draw.F(24, "Medium"), fill=(220, 224, 236, 230), anchor="mm")
    return sprite(("src", txt), d, anchor=(W / 2, 400))


def puff_sprite():
    def d(c):
        lay = c.layer()
        ImageDraw.Draw(lay).ellipse([v * SS for v in (440, 300, 640, 480)], fill=(190, 196, 204, 150))
        c.comp(lay.filter(ImageFilter.GaussianBlur(26 * SS)))
    return sprite(("puff",), d, anchor=(W / 2, 400))


def beam_sprite():
    def d(c):
        lay = c.layer()
        ImageDraw.Draw(lay).polygon([v * SS for v in (0, 0, 900, -220, 900, 260)], fill=(255, 246, 200, 120))
        c.comp(lay)
    def d2(c):
        lay = c.layer()
        ImageDraw.Draw(lay).polygon([v * SS for v in (0, 600, 900, 380, 900, 860)], fill=(255, 246, 200, 110))
        c.comp(lay.filter(ImageFilter.GaussianBlur(18 * SS)))
    return sprite(("beam",), d2, size=(W, 1200), anchor=(0, 600))


def end_card_sprite(kicker, title):
    def d(c):
        c.d.text((W / 2 * SS, 860 * SS), kicker, font=draw.F(40, "SemiBold"), fill=ACCENT + (255,), anchor="mm")
        f = draw.F(92, "Black")
        for j, ln in enumerate(draw._wrap(title, f, 900)):
            c.d.text((W / 2 * SS, (960 + j * 110) * SS), ln, font=f, fill=(255, 255, 255, 255), anchor="mm")
    return sprite(("end", kicker, title), d, anchor=(W / 2, 0))


def meter_layer(level, label):
    c = Canvas(None, (300, 160))
    draw.danger_meter(c, 20, 40, level, label)
    return c.image()


# ---------------------------------------------------------------- one frame
class Scene:
    def __init__(self, ep: dict, shot: dict, dur: float, idx: int, lang: str):
        self.ep, self.s, self.dur, self.i, self.lang = ep, shot, dur, idx, lang
        name = shot.get("set", "city")
        self.bg = sets.SETS.get(name, sets.SETS["city"])()
        self.bg_dark = sets.SETS["city_dark"]() if "lights_out" in shot.get("fx", []) else None
        rnd = random.Random(idx)
        self.cols = [(x, rnd.uniform(0.05, 0.75)) for x in range(0, W, 60)]
        self.rnd = rnd

    def frame(self, t: float) -> Image.Image:
        s, dur = self.s, self.dur
        k = t / max(dur, 0.01)
        img = self.bg.copy()
        if self.bg_dark is not None:   # windows across the city switch off column by column
            m = Image.new("L", (W, H), 0)
            md = ImageDraw.Draw(m)
            for x, ts in self.cols:
                if k > ts:
                    md.rectangle((x, 0, x + 60, 1500), fill=255)
            img = Image.composite(self.bg_dark, img, m)
        if self.s.get("set") not in ("city",) and not s.get("bright"):
            img.alpha_composite(night_overlay(int(t * 30) % 90, self.i))
        for p in s.get("props", []):
            self._prop(img, p, t, k)
        for j, a in enumerate(s.get("cast", [])):
            self._actor(img, a, t, k, j)
        for p in s.get("props", []):
            if p.get("kind") in ("gas", "beam"):
                self._prop(img, p, t, k, front=True)
        z = s.get("zip")
        if z:
            fx, fy = z.get("from", [z["x"] + 300, z["y"] - 200])
            q = ease(t / 0.6)
            x = fx + (z["x"] - fx) * q
            y = fy + (z["y"] - fy) * q + math.sin(t * 3.2) * 10
            paste(img, zip_sprite(), x, y, scale=z.get("scale", 0.9))
        c = s.get("counter")
        if c:
            a = ease((t - c.get("at", 0.0) * dur) / 0.25)
            if a > 0:
                paste(img, counter_sprite(c["value"], c.get("label", ""), tuple(c.get("color", (255, 80, 90)))),
                      c.get("x", 820), c.get("y", 470), alpha=a, scale=0.85 + 0.15 * back(a))
                if c.get("source"):
                    paste(img, source_sprite(("SOURCE: " if self.lang == "en" else "ที่มา: ") + c["source"]),
                          c.get("x", 820), c.get("y", 470) + 92, alpha=a)
        m = s.get("meter")
        if m:
            lvl = int(round(m.get("from", 1) + (m.get("to", 7) - m.get("from", 1)) * ease(k / 0.8)))
            ml = meter_layer(lvl, m.get("label", ""))
            img.alpha_composite(ml, (int(m.get("x", 60)), int(m.get("y", 380))))
        cd = s.get("card")
        if cd:
            a = (t - cd.get("at", 0.15) * dur) / 0.3
            if a > 0:
                paste(img, card_sprite(cd["n"], cd["text"], self.lang), W / 2, cd.get("y", 640),
                      alpha=ease(a), scale=0.8 + 0.2 * back(a))
        if s.get("title"):
            a = 1 - ease((t - min(2.6, dur * 0.8)) / 0.4)
            if a > 0:
                paste(img, title_sprite(self.ep["series"], self.ep["episode"]), W / 2, 0, alpha=a)
        if "flicker" in s.get("fx", []):
            f = 0.9 + 0.1 * math.sin(t * 23) * math.sin(t * 7.3)
            img = Image.blend(Image.new("RGBA", img.size, (0, 0, 0, 255)), img, max(0.0, min(1.0, f)))
        return self._camera(img, t)

    def _camera(self, img, t):
        cam = self.s.get("cam", "push")
        z = 1.0 + 0.035 * math.exp(-t / 0.12)
        if cam == "push":
            z += 0.06 * ease(t / max(self.dur, 0.1))
        dx = dy = 0.0
        if cam == "pan":
            dx = -40 + 80 * ease(t / max(self.dur, 0.1))
            z += 0.04
        if "shake" in self.s.get("fx", []):
            r = random.Random(int(t * 30))
            dx += r.uniform(-7, 7)
            dy += r.uniform(-7, 7)
        if z == 1.0 and dx == 0 and dy == 0:
            return img
        cw, ch = W / z, H / z
        x0 = (W - cw) / 2 + dx
        y0 = (H - ch) * 0.55 + dy
        x0 = max(0, min(W - cw, x0))
        y0 = max(0, min(H - ch, y0))
        return img.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + cw, y0 + ch))

    def _actor(self, img, a, t, k, j):
        who = a["who"]
        x0, x1 = a.get("x", 540), a.get("to", a.get("x", 540))
        move_end = a.get("move_end", 0.7)
        q = ease(min(k / move_end, 1.0)) if x1 != x0 else 1.0
        x = x0 + (x1 - x0) * q
        moving = x1 != x0 and k < move_end
        pose = a.get("pose", "stand")
        if moving:
            step = int(t / 0.17) % 2
            pose = ("run", "run_b")[step] if a.get("run") else ("walk", "walk_b")[step]
        mood = a.get("mood", "neutral")
        if a.get("mood_at") and k > a["mood_at"][0]:
            mood = a["mood_at"][1]
        blink_t = (t + j * 1.3) % 3.2
        if blink_t < 0.12 and mood not in ("scared",) and a.get("style", "paper") != "silhouette":
            mood = "blink"
        look = a.get("look", 0.0) if not moving else (1.0 if x1 > x0 else -1.0)
        bob = math.sin(t * 2 * math.pi * 0.7 + j) * 3 if not moving else -abs(math.sin(t * math.pi / 0.17)) * 8
        rim = tuple(a["rim"]) if a.get("rim") else None
        spr = char_sprite(who, pose, mood, look, a.get("scale", 1.22), a.get("style", "paper"), rim)
        paste(img, spr, x, sets.FLOOR + CHAR_DY + a.get("dy", 0) + bob)
        if a.get("carry") == "generator":
            paste(img, sets.generator(), x + 150 * (1 if x1 >= x0 else -1), sets.FLOOR + CHAR_DY + bob, scale=0.8)

    def _prop(self, img, p, t, k, front=False):
        kind = p.get("kind")
        if front != (kind in ("gas", "beam")):
            return
        if kind == "fridge":
            open_ = p.get("open_at") is not None and k >= p["open_at"] and not (p.get("close_at") and k >= p["close_at"])
            spr = sets.fridge(open_)
            paste(img, spr, p.get("x", 0), p.get("y", 200))
        elif kind == "generator":
            x0, x1 = p.get("x", 800), p.get("to", p.get("x", 800))
            x = x0 + (x1 - x0) * ease(k / 0.7)
            paste(img, sets.generator(), x, p.get("y", sets.FLOOR + CHAR_DY - 40), scale=p.get("scale", 0.9))
        elif kind == "gas":
            for n in range(7):
                ph = (t * 0.25 + n / 7) % 1.0
                x = p.get("x", 760) + math.sin(n * 2.1 + t) * 120 - ph * 200
                y = p.get("y", 1500) - ph * 900
                paste(img, puff_sprite(), x, y, alpha=0.55 * math.sin(ph * math.pi), scale=0.8 + ph * 1.6)
        elif kind == "candle":
            x, y = p.get("x", 820), p.get("y", 1250)
            dd = ImageDraw.Draw(img)
            dd.rectangle((x - 14, y - 70, x + 14, y), fill=(240, 236, 220, 255))
            fl = 1 + 0.15 * math.sin(t * 19) + 0.08 * math.sin(t * 7)
            glow = Image.new("RGBA", (360, 360), (0, 0, 0, 0))
            ImageDraw.Draw(glow).ellipse((60, 60, 300, 300), fill=(255, 170, 60, int(90 * fl)))
            glow = glow.filter(ImageFilter.GaussianBlur(40))
            img.alpha_composite(glow, (int(x - 180), int(y - 270)))
            dd = ImageDraw.Draw(img)
            dd.ellipse((x - 9 * fl, y - 110 * fl, x + 9 * fl, y - 72), fill=(255, 200, 80, 255))
            dd.ellipse((x - 4, y - 95, x + 4, y - 76), fill=(255, 250, 220, 255))
        elif kind == "beam":
            a = ease((k - p.get("at", 0.0)) / 0.15)
            if a > 0:
                paste(img, beam_sprite(), p.get("x", 380), p.get("y", 1420), alpha=a)
        elif kind == "drip":
            x, y = p.get("x", 680), p.get("y", 1060)
            if k < p.get("stop_at", 0.6):
                ph = (t * 1.6) % 1.0
                ImageDraw.Draw(img).ellipse((x - 7, y + ph * 170, x + 7, y + 22 + ph * 170), fill=(140, 200, 255, 230))
        elif kind == "arrow":
            d = ImageDraw.Draw(img)
            x0, x1, y = p["x0"], p["x1"], p["y"]
            a = ease(k / 0.4)
            xe = x0 + (x1 - x0) * a
            d.line((x0, y, xe, y), fill=ACCENT + (255,), width=8)
            d.polygon([(xe, y - 18), (xe + 26, y), (xe, y + 18)], fill=ACCENT + (255,))
            if a > 0.9 and p.get("label"):
                paste(img, sprite(("lbl", p["label"]), lambda c: c.d.text((W / 2 * SS, 400 * SS), p["label"],
                      font=draw.F(54, "Black"), fill=ACCENT + (255,), anchor="mm", stroke_width=5 * SS,
                      stroke_fill=(10, 10, 16, 255)), anchor=(W / 2, 400)), (x0 + x1) / 2, y - 50)


_NIGHT: dict = {}


def night_overlay(phase: int, seed: int) -> Image.Image:
    """Blackout mood: dark corners + a soft moonlight pool that drifts slowly (cached per phase)."""
    key = (phase // 3, seed % 3)
    if key in _NIGHT:
        return _NIGHT[key]
    lay = Image.new("RGBA", (W // 4, H // 4), (4, 6, 16, 0))
    d = ImageDraw.Draw(lay)
    a = Image.new("L", lay.size, 150)
    ad = ImageDraw.Draw(a)
    cx = W / 8 + math.sin((phase / 90) * 2 * math.pi + seed) * 30
    ad.ellipse((cx - 130, H / 8 - 80, cx + 130, H / 8 + 260), fill=0)
    a = a.filter(ImageFilter.GaussianBlur(40))
    lay.putalpha(a)
    lay = lay.resize((W, H), Image.BILINEAR)
    _NIGHT[key] = lay
    return lay


# ---------------------------------------------------------------- captions (ASS, Kanit, Thai-aware)
def insert_pauses(work: Path, ep: dict, t: dict, words: list[dict]):
    """Breathing room: silence after a scene ("pause_after" seconds) so the viewer can read a rule card and think.
    Shifts the voice, the scene timings and the word timings together."""
    import wave
    import numpy as np
    pauses = [float(sc.get("pause_after", 0) or 0) for sc in ep["scenes"]]
    if not any(pauses[:-1]):
        return t, words
    with wave.open(str(work / "build" / "voice.wav"), "rb") as w:
        sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth()
        pcm = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, ch)
    scenes = [dict(x) for x in t["scenes"]]
    orig = [x["start"] for x in t["scenes"]]
    # energy per 10 ms: silence is only ever inserted where the voice is already quiet (never inside a word)
    mono = np.abs(pcm.astype(np.float32).mean(axis=1))
    hop = sr // 100
    env = np.array([mono[k:k + hop].mean() for k in range(0, len(mono), hop)]) if len(mono) else np.zeros(1)
    quiet = max(env.max() * 0.04, 1.0)
    pieces, last, shift = [], 0, 0.0
    for i in range(len(scenes) - 1):
        p = pauses[i]
        if p <= 0:
            continue
        b0 = orig[i + 1]
        lo, hi = max(int((b0 - 0.45) * 100), last // hop + 1), min(int((b0 + 0.45) * 100), len(env) - 1)
        if hi <= lo:
            continue
        k = lo + int(np.argmin(env[lo:hi]))
        if env[k] > quiet:      # no gap between words here: skip the pause rather than cut speech
            log(f"pause after scene {i} skipped: no silent gap near {b0:.2f}s")
            continue
        # centre of that quiet stretch
        a_, z_ = k, k
        while a_ > lo and env[a_ - 1] <= quiet:
            a_ -= 1
        while z_ < hi and env[z_ + 1] <= quiet:
            z_ += 1
        b = (a_ + z_) / 2 / 100
        delta = b - b0                       # move the scene boundary onto the gap
        scenes[i]["end"] = round(scenes[i]["end"] + delta, 3)
        scenes[i + 1]["start"] = round(scenes[i + 1]["start"] + delta, 3)
        cut = int(b * sr)
        pieces += [pcm[last:cut], np.zeros((int(p * sr), ch), np.int16)]
        last = cut
        scenes[i]["end"] = round(scenes[i]["end"] + p, 3)
        for k in range(i + 1, len(scenes)):
            scenes[k]["start"] = round(scenes[k]["start"] + p, 3)
            scenes[k]["end"] = round(scenes[k]["end"] + p, 3)
        for w_ in words:
            if w_.get("_o", w_["start"]) >= b - 1e-6:
                w_.setdefault("_o", w_["start"])
                w_["start"] = round(w_["start"] + p, 3)
                w_["end"] = round(w_["end"] + p, 3)
            else:
                w_.setdefault("_o", w_["start"])
        shift += p
    for w_ in words:
        w_.pop("_o", None)
    pieces.append(pcm[last:])
    out = np.concatenate(pieces)
    with wave.open(str(work / "build" / "voice.wav"), "wb") as w:
        w.setnchannels(ch)
        w.setsampwidth(sw)
        w.setframerate(sr)
        w.writeframes(out.astype(np.int16).tobytes())
    for sc in scenes:
        sc.pop("_orig_start", None)
    t = {**t, "scenes": scenes, "audio_duration": round(len(out) / sr, 3)}
    write_json(work / "build" / "timings.json", t)
    return t, words


def _phrase_ends(texts: list[str], lang: str) -> set[int]:
    """Character offsets (letters/digits only) where a caption may end: punctuation, the script's spaces (Thai
    phrases), every ~3 English words."""
    import re as _re
    ends, pos = set(), 0
    for txt in texts:
        if lang == "th":
            parts = [x for x in txt.split(" ") if x]
            for ph in parts:
                n = len(_re.sub(r"[\W_]", "", ph))
                if n > 16:   # long phrase: allow a break in the middle
                    ends.add(pos + n // 2)
                pos += n
                ends.add(pos)
        else:
            k = 0
            for wd in txt.split():
                pos += len(_re.sub(r"[\W_]", "", wd))
                k += 1
                if wd.endswith((".", ",", "?", "!", ":")) or k >= 3:
                    ends.add(pos)
                    k = 0
            ends.add(pos)
    return ends


def build_ass(words: list[dict], out: Path, lang: str, scene_starts: list[float], texts: list[str] | None = None):
    from ..subs import _ass_color, _clean, _t
    hi = _ass_color("#FFD60A")
    size = 82 if lang == "en" else 88
    lines = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920", "WrapStyle: 0",
             "ScaledBorderAndShadow: yes", "", "[V4+ Styles]",
             "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, "
             "Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, "
             "MarginR, MarginV, Encoding",
             f"Style: Sub,Kanit,{size},&H00FFFFFF,&H000000FF,&H00140E0E,&H78000000,-1,0,0,0,100,100,0,0,1,7,3,2,90,90,{CAPTION_MARGIN_V},1",
             "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    sep = " " if lang == "en" else ""
    maxw, maxc = (3, 18) if lang == "en" else (4, 16)
    breaks = {next((i for i, w in enumerate(words) if w["start"] >= s), None) for s in scene_starts[1:]}
    import re as _re
    ends = set(_phrase_ends(texts, lang)) if texts else set()
    chunks, cur, pos = [], [], 0
    for i, w in enumerate(words):
        if cur and (i in breaks or len(cur) >= maxw + 2 or (not ends and (len(cur) >= maxw or
                    sum(len(x["w"]) for x in cur) + len(w["w"]) > maxc))):
            chunks.append(cur)
            cur = []
        cur.append(w)
        pos += len(_re.sub(r"[\W_]", "", w["w"]))
        hit = False
        if ends:
            passed = [e for e in ends if e <= pos]
            if passed:
                hit = True
                ends -= set(passed)
        if hit or (not ends and not texts and w["w"].endswith((".", "!", "?", ","))):
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    for ci, ch in enumerate(chunks):
        nxt = chunks[ci + 1][0]["start"] if ci + 1 < len(chunks) else ch[-1]["end"] + 0.4
        for wi, w in enumerate(ch):
            st = w["start"]
            en = ch[wi + 1]["start"] if wi + 1 < len(ch) else min(ch[-1]["end"] + 0.25, nxt)
            if en <= st:
                continue
            parts = [(f"{{\\c{hi}}}{_clean(x['w'].upper())}{{\\r}}" if k == wi else _clean(x["w"].upper()))
                     for k, x in enumerate(ch)]
            lines.append(f"Dialogue: 0,{_t(st)},{_t(en)},Sub,,0,0,0,,{sep.join(parts)}")
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")


# ---------------------------------------------------------------- whole episode
def render_episode(script_path: Path) -> Path:
    from .. import tts
    ep = json.loads(Path(script_path).read_text(encoding="utf-8"))
    lang = ep.get("lang", "en")
    slug = Path(script_path).stem
    work = ROOT / "toon_build" / slug
    if work.exists():
        shutil.rmtree(work)
    (work / "build").mkdir(parents=True)
    write_json(work / "script.json", {**ep, "loop": False})
    tts.run(work)
    t = read_json(work / "build" / "timings.json")
    words = read_json(work / "build" / "words.json", [])
    if lang == "th":
        words = [{**w, "w": w["w"].strip()} for w in words if w["w"].strip()]
    t, words = insert_pauses(work, ep, t, words)
    scenes = [Scene(ep, sc.get("shot", {}), tm["end"] - tm["start"], i, lang)
              for i, (sc, tm) in enumerate(zip(ep["scenes"], t["scenes"]))]
    total = t["scenes"][-1]["end"] + END_CARD
    video = work / "video.mp4"
    proc = subprocess.Popen([ffmpeg_bin(), "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt",
                             "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset",
                             "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", str(video)], stdin=subprocess.PIPE)
    n = int(round(total * FPS))
    last = None
    ec = ep.get("end_card") or {}
    for f in range(n):
        tt = f / FPS
        idx = next((i for i, tm in enumerate(t["scenes"]) if tm["start"] <= tt < tm["end"]), len(scenes) - 1)
        sc = scenes[idx]
        local = tt - t["scenes"][idx]["start"]
        img = sc.frame(min(local, sc.dur + END_CARD))
        if tt >= t["scenes"][-1]["end"] and ec:
            a = ease((tt - t["scenes"][-1]["end"]) / 0.35)
            img = Image.blend(img, Image.new("RGBA", img.size, (6, 8, 14, 255)), 0.82 * a)
            paste(img, end_card_sprite(ec.get("kicker", ""), ec.get("title", "")), W / 2, 0, alpha=a)
        if not (sc.s.get("title") and local < min(2.6, sc.dur * 0.8) + 0.4):
            img.alpha_composite(header_tag(ep))
        proc.stdin.write(img.convert("RGB").tobytes())
        if f % 150 == 0:
            log(f"toon {slug}: frame {f}/{n}")
    proc.stdin.close()
    proc.wait()
    build_ass(words, work / "subs.ass", lang, [tm["start"] for tm in t["scenes"]], [sc["text"] for sc in ep["scenes"]])
    fonts = work / "fonts"
    fonts.mkdir(exist_ok=True)
    for p in (ROOT / "assets" / "fonts").glob("Kanit-*.ttf"):
        shutil.copy(p, fonts / p.name)
    FINAL.mkdir(exist_ok=True)
    out = FINAL / f"toon_{slug}.mp4"
    events = []
    for i, (sc, tm) in enumerate(zip(ep["scenes"], t["scenes"])):
        shot, d0 = sc.get("shot", {}), tm["start"]
        if "lights_out" in shot.get("fx", []):
            events.append((d0 + 0.25, "power_down"))
        if shot.get("card"):
            events.append((d0 + shot["card"].get("at", 0.15) * (tm["end"] - tm["start"]), "chirp"))
        if shot.get("zip") and i > 0 and not shot.get("card"):
            events.append((d0 + 0.2, "chirp"))
    mix_sfx(work, events, total)
    run_ffmpeg(["-i", "video.mp4", "-i", "build/voice.wav", "-i", "sfx.wav", "-filter_complex",
                f"[1:a]aresample=44100,aformat=channel_layouts=stereo,apad[vo];"
                f"[2:a]aresample=44100,aformat=channel_layouts=stereo[fx];"
                f"[vo][fx]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a];"
                f"[0:v]ass=subs.ass:fontsdir=fonts[v]", "-map", "[v]", "-map", "[a]", "-t", f"{total:.3f}",
                "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-r", str(FPS),
                "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out.resolve())], cwd=work)
    log(f"TOON -> {out} ({total:.1f}s)")
    return out


def mix_sfx(work: Path, events: list[tuple[float, str]], total: float) -> None:
    """Soft tension bed + designed sounds (power-down thump, ZIP's two-tone chirp). All synthesised, licence-free."""
    sr = 44100
    import numpy as np
    n = int((total + 0.5) * sr)
    tt = np.arange(n) / sr
    bed = (np.sin(2 * np.pi * 55 * tt) * 0.5 + np.sin(2 * np.pi * 82.4 * tt) * 0.35 + np.sin(2 * np.pi * 110 * tt) * 0.15)
    bed *= (0.55 + 0.45 * np.sin(2 * np.pi * 0.11 * tt)) * 0.035
    bed *= np.clip(tt / 1.5, 0, 1) * np.clip((total - tt) / 1.0, 0, 1)
    out = bed.copy()
    for t0, kind in events:
        i0 = int(t0 * sr)
        if kind == "power_down":
            d = int(0.9 * sr)
            x = np.arange(d) / sr
            f = 140 * np.exp(-x * 2.2) + 35
            ph = 2 * np.pi * np.cumsum(f) / sr
            sig = (np.sin(ph) + 0.3 * np.sin(2 * ph)) * np.exp(-x * 3.0) * 0.45
        elif kind == "chirp":
            d = int(0.26 * sr)
            x = np.arange(d) / sr
            f = np.where(x < 0.11, 1320, 1760)
            env = np.where(x < 0.11, np.sin(np.pi * x / 0.11), np.sin(np.pi * (x - 0.13) / 0.13).clip(0))
            sig = np.sin(2 * np.pi * f * x) * env * 0.12
        else:
            continue
        j = min(n, i0 + len(sig))
        if i0 < n:
            out[i0:j] += sig[: j - i0]
    pcm = (np.clip(out, -1, 1) * 32767).astype(np.int16)
    import wave
    with wave.open(str(work / "sfx.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())


_HDR: dict = {}


def header_tag(ep):
    key = ("hdr", ep.get("channel", ""))
    if key in _HDR:
        return _HDR[key]
    def d(c):
        c.d.text((W / 2 * SS, 118 * SS), ep.get("channel", "").upper(), font=draw.F(26, "SemiBold"),
                 fill=(255, 255, 255, 190), anchor="mm")
    im, ax, ay = sprite(key, d, anchor=(0, 0))
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    layer.alpha_composite(im, (int(-ax), int(-ay)))
    _HDR[key] = layer
    return layer
