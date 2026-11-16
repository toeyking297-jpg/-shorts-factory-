"""Toon kit: code-drawn flat 2D characters, scenes and props (identical every episode, no AI drawing).

Everything is drawn at SS x resolution and downsampled (smooth edges). Characters/props become cached sprites."""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).resolve().parent
FONTS = HERE.parent.parent / "assets" / "fonts"
W, H, SS = 1080, 1920, 3
CHAR_DY = 0   # scenes push the cast down so captions sit above their heads


def F(size, w="Bold"):
    return ImageFont.truetype(str(FONTS / f"Kanit-{w}.ttf"), int(size * SS))


def shade(c, k):
    return tuple(max(0, min(255, int(v * k))) for v in c[:3])


def mix(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


class Canvas:
    def __init__(self, bg=(20, 24, 38), size=(W, H)):
        self.w, self.h = size
        self.img = Image.new("RGBA", (self.w * SS, self.h * SS), (0, 0, 0, 0) if bg is None else bg + (255,))
        self.d = ImageDraw.Draw(self.img)

    def layer(self):
        return Image.new("RGBA", self.img.size, (0, 0, 0, 0))

    def comp(self, lay):
        self.img = Image.alpha_composite(self.img, lay)
        self.d = ImageDraw.Draw(self.img)

    def S(self, *v):
        return [x * SS for x in v]

    def save(self, path, size=(W, H)):
        self.img.resize(size, Image.LANCZOS).convert("RGB").save(path, quality=92)

    def image(self) -> Image.Image:
        return self.img.resize((self.w, self.h), Image.LANCZOS)


# ---------------------------------------------------------------- characters
CAST = {
    "max": {"name": "MAX", "th": "แม็กซ์", "skin": (241, 194, 160), "hair": (35, 30, 38), "hair_style": "messy",
            "top": (255, 122, 48), "top2": (255, 168, 90), "pants": (44, 62, 102), "shoes": (226, 59, 64),
            "h": 1.0, "w": 1.0, "acc": ["hood"], "age": 17,
            "bio": "17, curious and reckless. Always presses the button.", "line": "What could go wrong?"},
    "nora": {"name": "NORA", "th": "นอร่า", "skin": (198, 142, 104), "hair": (64, 38, 28), "hair_style": "bun",
             "top": (26, 168, 160), "top2": (90, 214, 200), "pants": (38, 42, 58), "shoes": (240, 240, 240),
             "h": 0.96, "w": 0.92, "acc": ["glasses", "bag"], "age": 28,
             "bio": "28, ex-paramedic. Calm, knows the real rules.", "line": "Rule one: don't panic."},
    "gus": {"name": "GUS", "th": "กัส", "skin": (232, 178, 140), "hair": (150, 150, 158), "hair_style": "buzz",
            "top": (250, 200, 40), "top2": (255, 226, 120), "pants": (52, 86, 140), "shoes": (70, 50, 40),
            "h": 1.05, "w": 1.32, "acc": ["mustache"], "age": 45,
            "bio": "45, mechanic. Big heart, bigger worries.", "line": "I've got a bad feeling about this."},
}


def character(c: Canvas, spec: dict, x: float, y: float, scale: float = 1.0, pose: str = "stand",
              mood: str = "neutral", style: str = "paper", rim=None, look: float = 0.0):
    """Feet at (x, y) in 1x px. Full height ~ 540*scale px."""
    y = y + CHAR_DY
    s = SS * scale
    X, Y = x * SS, y * SS
    Hh = 540 * s * spec.get("h", 1)
    wf = spec.get("w", 1)
    lay = c.layer()
    d = ImageDraw.Draw(lay)
    sil = style == "silhouette"
    dark = (22, 26, 42)

    def col(cc):
        return dark if sil else cc

    head_r = 0.16 * Hh if style != "bean" else 0.2 * Hh
    hip_y = Y - 0.42 * Hh
    sh_y = Y - 0.70 * Hh
    head_cy = sh_y - head_r * 1.05
    tw = 0.12 * Hh * wf
    hw = 0.10 * Hh * wf
    limb = 0.06 * Hh * (0.9 + 0.15 * wf)

    if style == "bean":
        # one capsule body + head on top: chunky, cute
        bw = 0.32 * Hh * wf
        d.rounded_rectangle((X - bw / 2, Y - 0.62 * Hh, X + bw / 2, Y - 0.08 * Hh), bw / 2, fill=spec["top"])
        d.rounded_rectangle((X + bw * 0.05, Y - 0.62 * Hh, X + bw / 2, Y - 0.08 * Hh), bw / 2, fill=shade(spec["top"], 0.86))
        for k in (-1, 1):
            d.rounded_rectangle((X + k * bw * 0.22 - limb / 2, Y - 0.14 * Hh, X + k * bw * 0.22 + limb / 2, Y), limb / 2,
                                fill=spec["pants"])
            d.ellipse((X + k * bw * 0.22 - limb * 0.9, Y - limb * 0.6, X + k * bw * 0.22 + limb * 0.9, Y + limb * 0.4),
                      fill=spec["shoes"])
        head_cy = Y - 0.62 * Hh - head_r * 0.55
    else:
        # legs
        stride = {"run": 0.16, "run_b": -0.16, "walk": 0.09, "walk_b": -0.09, "stand": 0.0, "point": 0.03,
                  "scared": 0.05, "carry": 0.05, "wave": 0.0}.get(pose, 0) * Hh
        for k, sgn in ((-1, 1), (1, -1)):
            hx = X + k * hw * 0.45
            fx = hx + sgn * stride
            d.line([(hx, hip_y), (fx, Y - limb * 0.4)], fill=col(spec["pants"]), width=int(limb * 1.15))
            d.ellipse((fx - limb * 0.8 + (limb * 0.25 if k > 0 else -limb * 0.25), Y - limb * 0.6,
                       fx + limb * 0.8 + (limb * 0.25 if k > 0 else -limb * 0.25), Y + limb * 0.3), fill=col(spec["shoes"]))
        # torso (trapezoid with round corners)
        top = [(X - tw, sh_y), (X + tw, sh_y), (X + hw, hip_y + limb * 0.4), (X - hw, hip_y + limb * 0.4)]
        d.polygon(top, fill=col(spec["top"]))
        d.ellipse((X - tw - limb * 0.5, sh_y - limb * 0.5, X - tw + limb * 0.5, sh_y + limb * 0.5), fill=col(spec["top"]))
        d.ellipse((X + tw - limb * 0.5, sh_y - limb * 0.5, X + tw + limb * 0.5, sh_y + limb * 0.5), fill=col(spec["top"]))
        if not sil:
            d.polygon([(X + tw * 0.15, sh_y), (X + tw, sh_y), (X + hw, hip_y + limb * 0.4), (X + hw * 0.15, hip_y + limb * 0.4)],
                      fill=shade(spec["top"], 0.88))
            if "hood" in spec.get("acc", []):
                d.polygon([(X - tw * 0.55, sh_y - limb * 0.2), (X + tw * 0.55, sh_y - limb * 0.2), (X, sh_y + 0.12 * Hh)],
                          fill=spec["top2"])
                d.line([(X - tw * 0.18, sh_y + 0.02 * Hh), (X - tw * 0.22, sh_y + 0.16 * Hh)], fill=(250, 250, 250), width=int(SS * 3 * scale))
                d.line([(X + tw * 0.18, sh_y + 0.02 * Hh), (X + tw * 0.22, sh_y + 0.16 * Hh)], fill=(250, 250, 250), width=int(SS * 3 * scale))
            if "bag" in spec.get("acc", []):
                d.line([(X - tw * 0.8, sh_y), (X + hw * 0.9, hip_y)], fill=(120, 70, 40), width=int(limb * 0.35))
            if spec.get("name") == "GUS":   # overalls bib
                d.rounded_rectangle((X - tw * 0.5, sh_y + 0.08 * Hh, X + tw * 0.5, hip_y + limb * 0.4), int(limb * 0.3),
                                    fill=spec["pants"])
                for k in (-1, 1):
                    d.line([(X + k * tw * 0.42, sh_y + 0.09 * Hh), (X + k * tw * 0.6, sh_y)], fill=spec["pants"], width=int(limb * 0.35))
        # arms: (upper-arm angle, forearm angle) in degrees, 270 = straight down; mirrored for the right arm
        ang = {"stand": (255, 268), "run": (220, 300), "run_b": (300, 230), "walk": (240, 280), "walk_b": (290, 260),
               "point": (250, 265), "scared": (200, 120), "wave": (255, 268), "carry": (300, 0)}[pose]
        right = {"stand": (285, 272), "run": (320, 240), "run_b": (240, 300), "walk": (300, 260), "walk_b": (250, 280),
                 "point": (350, 355), "scared": (340, 60), "wave": (40, 95), "carry": (240, 180)}[pose]
        L1, L2 = 0.15 * Hh, 0.14 * Hh
        for k, (a1, a2) in ((-1, ang), (1, right)):
            sx = X + k * (tw - limb * 0.2)
            ra1, ra2 = math.radians(a1), math.radians(a2)
            ex, ey = sx + math.cos(ra1) * L1, sh_y + limb * 0.2 - math.sin(ra1) * L1
            hx2, hy2 = ex + math.cos(ra2) * L2, ey - math.sin(ra2) * L2
            colr = col(spec["top"] if k < 0 else shade(spec["top"], 0.9))
            d.line([(sx, sh_y + limb * 0.2), (ex, ey), (hx2, hy2)], fill=colr, width=int(limb), joint="curve")
            for px, py in ((sx, sh_y + limb * 0.2), (ex, ey)):
                d.ellipse((px - limb / 2, py - limb / 2, px + limb / 2, py + limb / 2), fill=colr)
            d.ellipse((hx2 - limb * 0.58, hy2 - limb * 0.58, hx2 + limb * 0.58, hy2 + limb * 0.58), fill=col(spec["skin"]))
        # neck
        d.rectangle((X - limb * 0.45, head_cy + head_r * 0.6, X + limb * 0.45, sh_y + limb * 0.2), fill=col(shade(spec["skin"], 0.9)))

    # head
    hx = X + look * head_r * 0.25
    d.ellipse((hx - head_r, head_cy - head_r, hx + head_r, head_cy + head_r), fill=col(spec["skin"]))
    if not sil:
        d.ellipse((hx - head_r * 1.08, head_cy - head_r * 0.12, hx - head_r * 0.82, head_cy + head_r * 0.22), fill=shade(spec["skin"], 0.92))
        d.ellipse((hx + head_r * 0.82, head_cy - head_r * 0.12, hx + head_r * 1.08, head_cy + head_r * 0.22), fill=shade(spec["skin"], 0.92))
    _hair(d, spec, hx, head_cy, head_r, col)
    # face
    ex_off = head_r * 0.36
    ey = head_cy + head_r * 0.05
    er = head_r * (0.2 if style == "bean" else 0.15)
    pr = er * (0.42 if mood == "scared" else 0.6)
    for k in (-1, 1):
        cx = hx + k * ex_off + look * head_r * 0.15
        if sil:
            gl = Image.new("RGBA", lay.size, (0, 0, 0, 0))
            ImageDraw.Draw(gl).ellipse((cx - er * 1.6, ey - er * 1.6, cx + er * 1.6, ey + er * 1.6), fill=(rim or (255, 220, 120)) + (150,))
            lay.alpha_composite(gl.filter(ImageFilter.GaussianBlur(er * 0.9)))
            d = ImageDraw.Draw(lay)
            d.ellipse((cx - er * 0.55, ey - er * 0.55, cx + er * 0.55, ey + er * 0.55), fill=(255, 250, 235))
            continue
        if mood == "blink":
            d.arc((cx - er, ey - er * 0.6, cx + er, ey + er * 0.6), 20, 160, fill=(40, 34, 44), width=int(er * 0.35))
            continue
        d.ellipse((cx - er, ey - er * 1.08, cx + er, ey + er * 1.08), fill=(255, 255, 255))
        px = cx + look * er * 0.4
        d.ellipse((px - pr, ey - pr, px + pr, ey + pr), fill=(28, 26, 34))
        d.ellipse((px - pr * 0.15 - pr * 0.35, ey - pr * 0.75, px - pr * 0.15 + pr * 0.25, ey - pr * 0.15), fill=(255, 255, 255))
        # brows
        by = ey - er * 1.55
        tilt = {"scared": -0.35, "angry": 0.35, "determined": 0.25}.get(mood, 0.0) * k
        d.line([(cx - er * 0.9, by + tilt * er * -1), (cx + er * 0.9, by + tilt * er)], fill=shade(spec["hair"], 0.9),
               width=int(er * 0.38))
    if not sil:
        my = head_cy + head_r * 0.5
        if mood == "scared":
            d.ellipse((hx - head_r * 0.12, my - head_r * 0.1, hx + head_r * 0.12, my + head_r * 0.16), fill=(90, 30, 40))
        elif mood == "smile":
            d.arc((hx - head_r * 0.3, my - head_r * 0.25, hx + head_r * 0.3, my + head_r * 0.15), 20, 160,
                  fill=(90, 30, 40), width=int(head_r * 0.08))
        else:
            d.line([(hx - head_r * 0.18, my), (hx + head_r * 0.18, my)], fill=(110, 50, 55), width=int(head_r * 0.07))
        if "mustache" in spec.get("acc", []):
            d.chord((hx - head_r * 0.42, my - head_r * 0.3, hx + head_r * 0.42, my + head_r * 0.12), 180, 360,
                    fill=spec["hair"])
        if "glasses" in spec.get("acc", []):
            for k in (-1, 1):
                cx = hx + k * ex_off + look * head_r * 0.15
                d.ellipse((cx - er * 1.45, ey - er * 1.35, cx + er * 1.45, ey + er * 1.35), outline=(40, 40, 52),
                          width=int(er * 0.28))
            d.line([(hx - ex_off + er * 1.45, ey), (hx + ex_off - er * 1.45, ey)], fill=(40, 40, 52), width=int(er * 0.25))
        # cheeks
        for k in (-1, 1):
            d.ellipse((hx + k * head_r * 0.55 - head_r * 0.12, head_cy + head_r * 0.32, hx + k * head_r * 0.55 + head_r * 0.12,
                       head_cy + head_r * 0.46), fill=shade(spec["skin"], 0.93) + (255,))
    if sil and rim:
        a = lay.getchannel("A")
        edge = a.filter(ImageFilter.MaxFilter(int(SS * 3) * 2 + 1))
        rl = Image.new("RGBA", lay.size, rim + (0,))
        rl.putalpha(Image.eval(Image.composite(edge, Image.new("L", edge.size, 0), edge), lambda v: v))
        rl2 = Image.new("RGBA", lay.size, (0, 0, 0, 0))
        rl2.paste(rl, (int(SS * 4), 0))
        rl2.putalpha(Image.composite(rl2.getchannel("A"), Image.new("L", a.size, 0), Image.eval(a, lambda v: 255 - v)))
        lay = Image.alpha_composite(rl2.filter(ImageFilter.GaussianBlur(SS * 1.5)), lay)
    # soft ground shadow
    sh = c.layer()
    ImageDraw.Draw(sh).ellipse((X - 0.22 * Hh * wf, Y - 0.02 * Hh, X + 0.22 * Hh * wf, Y + 0.03 * Hh), fill=(0, 0, 0, 90))
    c.comp(sh.filter(ImageFilter.GaussianBlur(SS * 6)))
    c.comp(lay)


def _hair(d, spec, hx, cy, r, col):
    hc = col(spec["hair"])
    st = spec.get("hair_style")
    if st == "messy":
        d.chord((hx - r * 1.04, cy - r * 1.08, hx + r * 1.04, cy + r * 0.6), 180, 360, fill=hc)
        pts = []
        for k in range(9):
            a = math.pi + k * math.pi / 8
            rr = r * (1.28 if k % 2 else 0.98)
            pts.append((hx + math.cos(a) * rr, cy - r * 0.2 + math.sin(a) * rr))
        d.polygon(pts + [(hx + r, cy - r * 0.1), (hx - r, cy - r * 0.1)], fill=hc)
        d.polygon([(hx - r * 0.9, cy - r * 0.35), (hx - r * 0.2, cy - r * 0.55), (hx - r * 0.55, cy - r * 0.05)], fill=hc)
    elif st == "bun":
        d.chord((hx - r * 1.05, cy - r * 1.05, hx + r * 1.05, cy + r * 0.7), 180, 360, fill=hc)
        d.ellipse((hx - r * 0.42, cy - r * 1.62, hx + r * 0.42, cy - r * 0.8), fill=hc)
        d.pieslice((hx - r * 1.05, cy - r * 1.05, hx + r * 0.2, cy + r * 0.9), 150, 270, fill=hc)
    elif st == "buzz":
        d.chord((hx - r * 1.02, cy - r * 1.04, hx + r * 1.02, cy + r * 0.25), 190, 350, fill=hc)
    elif st == "long":
        d.chord((hx - r * 1.08, cy - r * 1.1, hx + r * 1.08, cy + r * 0.7), 180, 360, fill=hc)
        d.rectangle((hx - r * 1.08, cy - r * 0.2, hx - r * 0.75, cy + r * 1.3), fill=hc)
        d.rectangle((hx + r * 0.75, cy - r * 0.2, hx + r * 1.08, cy + r * 1.3), fill=hc)


def zip_drone(c: Canvas, x, y, scale=1.0, beam_to=None, color=(64, 224, 255)):
    """ZIP: the channel's rule-drone mascot. One big screen eye, two rotors. Optional light beam down to beam_to (x,y)."""
    s = SS * scale
    X, Y = x * SS, y * SS
    if beam_to:
        b = c.layer()
        bx, by = beam_to[0] * SS, beam_to[1] * SS
        ImageDraw.Draw(b).polygon([(X - 18 * s, Y + 30 * s), (X + 18 * s, Y + 30 * s), (bx + 260 * SS, by), (bx - 260 * SS, by)],
                                  fill=color + (40,))
        c.comp(b.filter(ImageFilter.GaussianBlur(10 * SS)))
    lay = c.layer()
    d = ImageDraw.Draw(lay)
    for k in (-1, 1):
        d.line([(X + k * 40 * s, Y - 10 * s), (X + k * 70 * s, Y - 34 * s)], fill=(60, 66, 86), width=int(7 * s))
        d.ellipse((X + k * 70 * s - 46 * s, Y - 42 * s, X + k * 70 * s + 46 * s, Y - 28 * s), fill=(200, 210, 230, 160))
    d.ellipse((X - 52 * s, Y - 46 * s, X + 52 * s, Y + 46 * s), fill=(236, 240, 248))
    d.chord((X - 52 * s, Y - 46 * s, X + 52 * s, Y + 46 * s), 20, 160, fill=(200, 208, 224))
    d.rounded_rectangle((X - 34 * s, Y - 24 * s, X + 34 * s, Y + 14 * s), int(14 * s), fill=(18, 22, 36))
    gl = c.layer()
    ImageDraw.Draw(gl).ellipse((X - 16 * s, Y - 18 * s, X + 16 * s, Y + 8 * s), fill=color + (230,))
    lay.alpha_composite(gl.filter(ImageFilter.GaussianBlur(4 * s)))
    d = ImageDraw.Draw(lay)
    d.ellipse((X - 9 * s, Y - 12 * s, X + 9 * s, Y + 2 * s), fill=(235, 252, 255))
    d.ellipse((X - 5 * s, Y + 30 * s, X + 5 * s, Y + 40 * s), fill=(255, 80, 90))
    c.comp(lay)


# ---------------------------------------------------------------- props (the channel's signature UI)
def rule_card(c: Canvas, cx, cy, number, text, color=(64, 224, 255), lang="en", width=860):
    """Hologram rule projected by ZIP: glowing edge, scanlines, big rule text. Diegetic, not a caption box."""
    f_small, f_big = F(30, "SemiBold"), F(66 if lang == "en" else 70, "Bold")
    lines = _wrap(text, f_big, width - 120)
    h = 120 + len(lines) * (82 if lang == "en" else 92) + 30
    x0, y0, x1, y1 = (cx - width / 2) * SS, (cy - h / 2) * SS, (cx + width / 2) * SS, (cy + h / 2) * SS
    glow = c.layer()
    ImageDraw.Draw(glow).rounded_rectangle((x0, y0, x1, y1), 26 * SS, outline=color + (200,), width=10 * SS)
    c.comp(glow.filter(ImageFilter.GaussianBlur(14 * SS)))
    lay = c.layer()
    d = ImageDraw.Draw(lay)
    d.rounded_rectangle((x0, y0, x1, y1), 26 * SS, fill=(8, 22, 36, 205), outline=color + (255,), width=3 * SS)
    for yy in range(int(y0), int(y1), 7 * SS):
        d.line([(x0 + 10 * SS, yy), (x1 - 10 * SS, yy)], fill=color + (14,), width=SS)
    lab = (f"RULE #{number}" if lang == "en" else f"กฎข้อ {number}")
    d.text(((cx - width / 2 + 44) * SS, y0 + 30 * SS), lab, font=f_small, fill=color + (255,))
    d.ellipse(((cx + width / 2 - 70) * SS, y0 + 40 * SS, (cx + width / 2 - 46) * SS, y0 + 64 * SS), fill=(255, 80, 90, 255))
    ty = y0 + 92 * SS
    for ln in lines:
        d.text(((cx - width / 2 + 44) * SS, ty), ln, font=f_big, fill=(240, 252, 255, 255))
        ty += (82 if lang == "en" else 92) * SS
    c.comp(lay)


def countdown(c: Canvas, cx, cy, t, label, color=(255, 80, 90)):
    f = F(84, "Bold")
    fl = F(26, "SemiBold")
    lay = c.layer()
    d = ImageDraw.Draw(lay)
    w = d.textlength(t, font=f) / SS + 60
    x0, y0 = (cx - w / 2) * SS, (cy - 62) * SS
    d.rounded_rectangle((x0, y0, x0 + w * SS, y0 + 124 * SS), 22 * SS, fill=(14, 16, 24, 225), outline=color + (255,), width=3 * SS)
    d.text((cx * SS, (cy - 16) * SS), t, font=f, fill=color + (255,), anchor="mm")
    d.text((cx * SS, (cy + 40) * SS), label, font=fl, fill=(230, 232, 240, 230), anchor="mm")
    c.comp(lay)


def danger_meter(c: Canvas, x, y, level, label, n=8):
    lay = c.layer()
    d = ImageDraw.Draw(lay)
    fl = F(24, "SemiBold")
    d.text((x * SS, (y - 34) * SS), label, font=fl, fill=(240, 240, 245, 230))
    for k in range(n):
        col = mix((80, 220, 120), (255, 70, 80), k / (n - 1))
        on = k < level
        hh = 24 + k * 9
        d.rounded_rectangle(((x + k * 26) * SS, (y + 100 - hh) * SS, (x + k * 26 + 18) * SS, (y + 100) * SS), 5 * SS,
                            fill=col + ((255,) if on else (60,)))
    c.comp(lay)


def caption(c: Canvas, words: list[str], hi: int, y=1300, lang="en", accent=(255, 214, 10)):
    f = F(78 if lang == "en" else 84, "Bold")
    lay = c.layer()
    d = ImageDraw.Draw(lay)
    sep = " " if lang == "en" else ""
    full = sep.join(words)
    tw = d.textlength(full, font=f)
    while tw > 900 * SS:
        f = ImageFont.truetype(f.path, int(f.size * 0.92))
        tw = d.textlength(full, font=f)
    x = W * SS / 2 - tw / 2
    for i, wd in enumerate(words):
        colr = accent if i == hi else (255, 255, 255)
        d.text((x + 4 * SS, y * SS + 6 * SS), wd, font=f, fill=(0, 0, 0, 160), anchor="lm", stroke_width=8 * SS,
               stroke_fill=(0, 0, 0, 160))
        d.text((x, y * SS), wd, font=f, fill=colr + (255,), anchor="lm", stroke_width=7 * SS, stroke_fill=(14, 14, 20, 255))
        x += d.textlength(wd + sep, font=f)
    c.comp(lay)


def title_tag(c: Canvas, series, episode, color=(255, 214, 10)):
    lay = c.layer()
    d = ImageDraw.Draw(lay)
    d.text((W * SS / 2, 160 * SS), series, font=F(30, "SemiBold"), fill=color + (255,), anchor="mm")
    d.text((W * SS / 2, 216 * SS), episode, font=F(58, "Bold"), fill=(255, 255, 255, 255), anchor="mm",
           stroke_width=5 * SS, stroke_fill=(10, 10, 16, 255))
    c.comp(lay)


def _wrap(text, f, maxw):
    d = ImageDraw.Draw(Image.new("L", (10, 10)))
    words = text.split(" ")
    lines, cur = [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) <= maxw * SS:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


# ---------------------------------------------------------------- scenes
def sky(c: Canvas, top, bottom, y0=0, y1=H):
    lay = c.layer()
    d = ImageDraw.Draw(lay)
    for yy in range(y0 * SS, y1 * SS, SS * 2):
        t = (yy / SS - y0) / max(y1 - y0, 1)
        d.line([(0, yy), (W * SS, yy)], fill=mix(top, bottom, t) + (255,), width=SS * 2)
    c.comp(lay)


def buildings(c: Canvas, base_y, color, rnd, n=7, hmin=400, hmax=900, lit=0.25, win=(255, 214, 120), wmin=120, wmax=220):
    lay = c.layer()
    d = ImageDraw.Draw(lay)
    x = -40
    while x < W + 40:
        bw = rnd.randint(wmin, wmax)
        bh = rnd.randint(hmin, hmax)
        d.rectangle((x * SS, (base_y - bh) * SS, (x + bw) * SS, base_y * SS), fill=color + (255,))
        d.rectangle(((x + bw - 18) * SS, (base_y - bh) * SS, (x + bw) * SS, base_y * SS), fill=shade(color, 0.85) + (255,))
        for wy in range(base_y - bh + 40, base_y - 60, 70):
            for wx in range(x + 22, x + bw - 40, 46):
                on = rnd.random() < lit
                d.rectangle((wx * SS, wy * SS, (wx + 24) * SS, (wy + 34) * SS),
                            fill=(win if on else shade(color, 0.78)) + (255,))
        x += bw + rnd.randint(-10, 14)
    c.comp(lay)


def glow_spot(c: Canvas, x, y, r, color, a=120):
    g = c.layer()
    ImageDraw.Draw(g).ellipse(((x - r) * SS, (y - r) * SS, (x + r) * SS, (y + r) * SS), fill=color + (a,))
    c.comp(g.filter(ImageFilter.GaussianBlur(r * SS * 0.45)))


def vignette(c: Canvas, k=0.55):
    v = Image.new("L", c.img.size, 0)
    ImageDraw.Draw(v).ellipse((-W * SS * 0.3, -H * SS * 0.15, W * SS * 1.3, H * SS * 1.15), fill=255)
    v = v.filter(ImageFilter.GaussianBlur(150 * SS))
    dark = Image.new("RGBA", c.img.size, (0, 0, 0, 255))
    c.img = Image.composite(c.img, Image.blend(c.img, dark, k), v)
    c.d = ImageDraw.Draw(c.img)


def rain(c: Canvas, rnd, n=500, color=(170, 190, 230)):
    lay = c.layer()
    d = ImageDraw.Draw(lay)
    for _ in range(n):
        x, y = rnd.randint(0, W), rnd.randint(0, H)
        d.line([(x * SS, y * SS), ((x - 8) * SS, (y + 34) * SS)], fill=color + (rnd.randint(40, 110),), width=SS * 2)
    c.comp(lay)


# ---------------------------------------------------------------- sprites (draw once, paste every frame)
_SPRITES: dict = {}


def sprite(key, draw_fn, size=(W, H), anchor=(W / 2, H)):
    """Run draw_fn(canvas) on a transparent canvas, crop to content, downsample. Returns (img, ax, ay):
    paste at (x - ax, y - ay) to put the drawing's anchor point at (x, y)."""
    if key in _SPRITES:
        return _SPRITES[key]
    c = Canvas(None, size)
    draw_fn(c)
    small = c.image()
    bbox = small.getchannel("A").getbbox() or (0, 0, 1, 1)
    out = (small.crop(bbox), anchor[0] - bbox[0], anchor[1] - bbox[1])
    _SPRITES[key] = out
    return out


def char_sprite(who: str, pose="stand", mood="neutral", look=0.0, scale=1.0, style="paper", rim=None, spec=None):
    sp = spec or CAST[who]
    key = ("char", who, pose, mood, round(look, 2), round(scale, 3), style, rim)
    return sprite(key, lambda c: character(c, sp, W / 2, H - 60, scale, pose=pose, mood=mood, style=style, rim=rim,
                                           look=look), anchor=(W / 2, H - 60))
