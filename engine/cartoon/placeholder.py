"""PLACEHOLDER art drawn in code, for the animatic only.

Every image follows the same canvas spec as the real asset it stands in for (assets/manifest.json),
so a real PNG can be dropped in later without touching the shotlist. These are NOT final art.
"""
from __future__ import annotations

import math

from PIL import Image, ImageDraw, ImageFilter

from .common import BIBLE, PLACEHOLDER, STAGE_W, STAGE_H, hex_rgb, load

SS = 2                      # supersampling
LINE = hex_rgb("#23203A")


def _bible():
    b = load(BIBLE / "character_bible.json")
    return {c["character_id"]: c for c in b["characters"]}


def _c(cb, *path):
    d = cb["outfit_lock"]
    for k in path:
        d = d[k]
    return hex_rgb(d)


class Pen:
    def __init__(self, w, h, unit):
        self.im = Image.new("RGBA", (w * SS, h * SS), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.im)
        self.u = unit * SS          # pixels per unit (unit = character height)
        self.lw = max(2, int(0.0085 * self.u))

    def P(self, x, y):
        return (x * self.u, y * self.u)

    def ell(self, cx, cy, rx, ry, fill, outline=True):
        u = self.u
        self.d.ellipse((( cx - rx) * u, (cy - ry) * u, (cx + rx) * u, (cy + ry) * u), fill=fill,
                       outline=LINE if outline else None, width=self.lw if outline else 0)

    def rr(self, x0, y0, x1, y1, r, fill, outline=True):
        u = self.u
        self.d.rounded_rectangle((x0 * u, y0 * u, x1 * u, y1 * u), radius=r * u, fill=fill,
                                 outline=LINE if outline else None, width=self.lw if outline else 0)

    def limb(self, x0, y0, x1, y1, w, fill):
        u = self.u
        self.d.line((x0 * u, y0 * u, x1 * u, y1 * u), fill=LINE, width=int((w + 0.017) * u))
        self.d.line((x0 * u, y0 * u, x1 * u, y1 * u), fill=fill, width=int(w * u))
        for (x, y) in ((x0, y0), (x1, y1)):
            r = w / 2
            self.d.ellipse(((x - r) * u, (y - r) * u, (x + r) * u, (y + r) * u), fill=fill)

    def line(self, pts, w=None, fill=LINE):
        self.d.line([self.P(*p) for p in pts], fill=fill, width=int((w or 0.009) * self.u), joint="curve")

    def poly(self, pts, fill, outline=True):
        self.d.polygon([self.P(*p) for p in pts], fill=fill, outline=LINE if outline else None,
                       width=self.lw if outline else 0)

    def done(self):
        return self.im.resize((self.im.width // SS, self.im.height // SS), Image.LANCZOS)


# ------------------------------------------------------------------ characters
POSES = {
    # hand positions (screen space, unit = character height, cx = 0.45)
    "neutral": {"L": (0.24, 0.70), "R": (0.66, 0.70)},
    "gesture": {"L": (0.24, 0.70), "R": (0.86, 0.50), "palm": "R"},
    "bossy": {"L": (0.27, 0.58), "R": (0.70, 0.30), "fan": "R"},
    "ticket": {"L": (0.18, 0.22), "R": (0.68, 0.66), "fan": "R", "ticket": "L"},
    "sheepish": {"L": (0.12, 0.52), "R": (0.66, 0.68), "fan": "R", "ticket": "L"},
    "shocked": {"L": (0.30, 0.34), "R": (0.62, 0.34), "fan": "R", "ticket": "L"},
    "cheerful": {"L": (0.24, 0.70), "R": (0.74, 0.34), "palm": "R"},
    "bags": {"L": (0.22, 0.56), "R": (0.68, 0.56), "bags": True},
}

EXPR = {
    # brows: (inner_dy, outer_dy) relative; eyes: dot | lid | wide | closed ; dx gaze
    "neutral_deadpan": dict(brow=(0.0, 0.0), eyes="lid"),
    "tiny_smile": dict(brow=(0.005, -0.004), eyes="lid", smile=True),
    "bossy": dict(brow=(0.018, -0.012), eyes="dot"),
    "smug": dict(brow=(-0.004, -0.02), eyes="lid"),
    "proud": dict(brow=(-0.012, -0.012), eyes="closedup"),
    "greedy": dict(brow=(0.014, -0.014), eyes="wide"),
    "impatient": dict(brow=(0.02, -0.01), eyes="dot"),
    "shocked": dict(brow=(-0.03, -0.03), eyes="wide"),
    "sheepish": dict(brow=(-0.022, 0.012), eyes="dot"),
    "cheerful": dict(brow=(-0.01, -0.01), eyes="happy"),
}


def draw_character(cid: str, expr: str, pose: str, H: int, facing: float, blink=False):
    """Returns (RGBA image, mouth_anchor(x,y), mouth_scale). Canvas = 0.9H x 1.04H, feet at 1.0H."""
    cb = _bible()[cid]
    W, Hc = int(0.9 * H), int(1.04 * H)
    p = Pen(W, Hc, H)
    cx = 0.45
    skin = _c(cb, "skin", "hex")
    cheek = _c(cb, "skin", "cheek_hex")
    pz = POSES[pose]
    wide = 1.12 if cid == "C02" else (0.92 if cid == "C03" else 1.0)
    tw = 0.165 * wide
    # legs + shoes
    pants = _c(cb, "pants", "hex")
    for s in (-1, 1):
        p.rr(cx + s * 0.075 - 0.045, 0.70, cx + s * 0.075 + 0.045, 0.975, 0.03, pants)
    shoe = _c(cb, "shoes", "hex") if "shoes" in cb["outfit_lock"] else hex_rgb("#222222")
    for s in (-1, 1):
        p.ell(cx + s * 0.08 + 0.02 * facing, 0.98, 0.065, 0.028, shoe)
    # torso
    top = _c(cb, "top", "hex")
    p.rr(cx - tw, 0.40, cx + tw, 0.76, 0.075, top)
    if cid == "C01":   # hood collar + drawstrings
        p.ell(cx, 0.415, 0.12, 0.035, hex_rgb("#C98A12"))
        acc = _c(cb, "top", "accent_hex")
        for s in (-1, 1):
            p.line([(cx + s * 0.03, 0.43), (cx + s * 0.035, 0.53)], 0.008, acc)
        p.rr(cx - 0.09, 0.60, cx + 0.09, 0.68, 0.02, hex_rgb("#C98A12"))      # kangaroo pocket
    if cid == "C02":   # floral dots + gold chain
        white = _c(cb, "top", "accent_hex")
        for i, (fx, fy) in enumerate([(-0.11, 0.48), (0.06, 0.46), (-0.03, 0.58), (0.12, 0.6), (-0.12, 0.68),
                                      (0.04, 0.70), (0.13, 0.52), (-0.06, 0.52)]):
            for a in range(5):
                ang = a * 2 * math.pi / 5 + i
                p.ell(cx + fx + 0.016 * math.cos(ang), fy + 0.016 * math.sin(ang), 0.011, 0.011, white, False)
            p.ell(cx + fx, fy, 0.007, 0.007, hex_rgb("#F2C14E"), False)
        p.d.arc(((cx - 0.08) * p.u, 0.36 * p.u, (cx + 0.08) * p.u, 0.47 * p.u), 20, 160,
                fill=_c(cb, "necklace", "hex"), width=int(0.012 * p.u))
    if cid == "C03":   # apron
        ap = _c(cb, "apron", "hex")
        p.rr(cx - tw * 0.8, 0.47, cx + tw * 0.8, 0.78, 0.03, ap)
        p.rr(cx - 0.06, 0.60, cx + 0.06, 0.67, 0.015, _c(cb, "apron", "accent_hex"))
        p.line([(cx - tw * 0.8, 0.47), (cx - 0.05, 0.41)], 0.01, ap)
        p.line([(cx + tw * 0.8, 0.47), (cx + 0.05, 0.41)], 0.01, ap)
    # arms (sleeve colour = top) + hands
    for side in ("L", "R"):
        sx = cx - tw + 0.03 if side == "L" else cx + tw - 0.03
        hx, hy = pz[side]
        sleeve = top
        mid = ((sx + hx) / 2 + (0.02 if side == "R" else -0.02), (0.45 + hy) / 2 + 0.03)
        p.limb(sx, 0.45, mid[0], mid[1], 0.07, sleeve)
        p.limb(mid[0], mid[1], hx, hy, 0.062, sleeve)
        p.ell(hx, hy, 0.038, 0.036, skin)
        if pz.get("palm") == side:
            p.ell(hx + 0.02, hy - 0.01, 0.045, 0.03, skin)
        if pz.get("fan") == side:
            fan = hex_rgb("#F28C6B")
            u = p.u
            p.d.pieslice(((hx - 0.13) * u, (hy - 0.15) * u, (hx + 0.13) * u, (hy + 0.11) * u), 200, 340,
                         fill=fan, outline=LINE, width=p.lw)
            for k in range(6):
                a = math.radians(200 + k * 28)
                p.line([(hx, hy - 0.02), (hx + 0.12 * math.cos(a), hy - 0.02 + 0.12 * math.sin(a))], 0.004,
                       hex_rgb("#F6E7C8"))
        if pz.get("ticket") == side:
            p.rr(hx - 0.04, hy - 0.11, hx + 0.04, hy - 0.01, 0.006, hex_rgb("#FFF4D6"))
            p.rr(hx - 0.035, hy - 0.02, hx + 0.035, hy + 0.12, 0.004, hex_rgb("#FFFFFF"))
    if cid == "C01":   # silver insulated bags on the shoulder (P01)
        bag = hex_rgb("#C9CED6")
        for k in range(4, -1, -1):
            p.rr(cx - tw - 0.06 + k * 0.006, 0.47 + k * 0.012, cx - tw + 0.07 + k * 0.006, 0.66 + k * 0.012, 0.012, bag)
        p.line([(cx - tw + 0.0, 0.48), (cx - 0.05, 0.41)], 0.014, hex_rgb("#9AA1AB"))
    # head
    hx0 = cx + 0.012 * facing
    hr = (0.235 * (1.04 if cid == "C02" else 1.0), 0.205)
    hair = hex_rgb("#1A1A20") if cid == "C01" else _c(cb, "hair", "hex")
    if cid == "C03":   # bob behind face
        p.rr(hx0 - hr[0] - 0.03, 0.03, hx0 + hr[0] + 0.03, 0.36, 0.12, hair)
    if cid == "C02":   # curls behind
        for k in range(14):
            a = math.pi + k * math.pi / 13
            p.ell(hx0 + 0.25 * math.cos(a), 0.21 + 0.15 * math.sin(a), 0.055, 0.05, hair)
    p.ell(hx0, 0.215, hr[0], hr[1], skin)
    if cid == "C01":
        u = p.u
        p.d.chord(((hx0 - hr[0]) * u, 0.01 * u, (hx0 + hr[0]) * u, 0.30 * u), 180, 360, fill=hair, outline=LINE, width=p.lw)
        for k in range(5):
            x = hx0 - 0.17 + k * 0.085
            p.poly([(x - 0.03, 0.10), (x + 0.01, 0.05), (x + 0.04, 0.115)], hair, False)
        p.line([(hx0 + 0.01, 0.03), (hx0 + 0.03, 0.006), (hx0 + 0.06, 0.012)], 0.01)
    if cid == "C02":
        for k in range(9):
            a = math.pi + 0.15 + k * (math.pi - 0.3) / 8
            p.ell(hx0 + 0.2 * math.cos(a), 0.145 + 0.095 * math.sin(a), 0.05, 0.045, hair, False)
    if cid == "C03":
        u = p.u
        p.d.chord(((hx0 - hr[0] - 0.01) * u, 0.0 * u, (hx0 + hr[0] + 0.01) * u, 0.30 * u), 180, 360, fill=hair, outline=LINE, width=p.lw)
        p.rr(hx0 - hr[0] + 0.02, 0.06, hx0 + hr[0] - 0.02, 0.135, 0.01, hair, False)
        for s in (-1, 1):
            p.ell(hx0 + s * (hr[0] - 0.005), 0.29, 0.012, 0.012, hex_rgb("#C0C4CC"), False)
    # face
    fx = hx0 + 0.035 * facing
    e = EXPR[expr]
    ey = 0.215
    for s in (-1, 1):
        x = fx + s * 0.075
        p.ell(x + 0.02 * s * -0.0, ey + 0.065, 0.03, 0.017, cheek, False)        # cheeks
        kind = "closed" if blink else e["eyes"]
        if kind in ("dot", "lid"):
            p.ell(x, ey, 0.02, 0.022, LINE, False)
            p.ell(x + 0.006, ey - 0.008, 0.006, 0.006, (255, 255, 255, 255), False)
            if kind == "lid":
                u = p.u
                p.d.chord(((x - 0.03) * u, (ey - 0.034) * u, (x + 0.03) * u, (ey + 0.022) * u), 180, 360, fill=skin)
                p.line([(x - 0.03, ey - 0.004), (x + 0.03, ey - 0.004)], 0.008)
        elif kind == "wide":
            p.ell(x, ey, 0.036, 0.04, (255, 255, 255, 255))
            p.ell(x + 0.006 * facing, ey + 0.004, 0.012, 0.012, LINE, False)
        elif kind in ("happy", "closedup"):
            u = p.u
            p.d.arc(((x - 0.025) * u, (ey - 0.012) * u, (x + 0.025) * u, (ey + 0.03) * u), 200, 340, fill=LINE,
                    width=int(0.009 * u))
        else:   # closed (blink)
            p.line([(x - 0.026, ey + 0.004), (x + 0.026, ey + 0.004)], 0.008)
        bi, bo = e["brow"]
        inner, outer = x - s * 0.028, x + s * 0.03
        p.line([(inner, ey - 0.06 + bi), (outer, ey - 0.06 + bo)], 0.014)
    if cid == "C01":   # round glasses
        for s in (-1, 1):
            x = fx + s * 0.075
            u = p.u
            p.d.ellipse(((x - 0.05) * u, (ey - 0.045) * u, (x + 0.05) * u, (ey + 0.045) * u),
                        outline=hex_rgb("#1E1E24"), width=int(0.011 * u))
        p.line([(fx - 0.025, ey - 0.01), (fx + 0.025, ey - 0.01)], 0.008)
    if pz.get("bags"):
        for r in range(3):
            for k in range(4):
                bx = cx - 0.22 + k * 0.11 + (r % 2) * 0.03
                by = 0.62 - r * 0.075
                p.rr(bx, by, bx + 0.1, by + 0.075, 0.012, hex_rgb("#FFFFFF"))
                p.line([(bx + 0.03, by), (bx + 0.05, by - 0.02), (bx + 0.07, by)], 0.004)
    img = p.done()
    anchor = (int(fx * H), int((ey + 0.095) * H))
    return img, anchor, H / 1000.0


MOUTH_CANVAS = (170, 110)    # at H=1000


def draw_mouth(cid: str, shape: str):
    p = Pen(*MOUTH_CANVAS, 1000)
    cx, cy = 0.085, 0.055
    dark, tongue, teeth = hex_rgb("#5A1E2A"), hex_rgb("#E0707A"), (255, 255, 255, 255)
    k = 1.15 if cid == "C02" else 1.0
    if shape == "rest":
        u = p.u
        p.d.arc(((cx - 0.03 * k) * u, (cy - 0.02) * u, (cx + 0.03 * k) * u, (cy + 0.012) * u), 20, 160, fill=LINE,
                width=int(0.009 * u))
    elif shape == "open":
        p.ell(cx, cy + 0.004, 0.026 * k, 0.017, dark)
        p.ell(cx, cy + 0.013, 0.014 * k, 0.006, tongue, False)
    elif shape == "wide":
        p.ell(cx, cy + 0.008, 0.042 * k, 0.03, dark)
        p.rr(cx - 0.03 * k, cy - 0.018, cx + 0.03 * k, cy - 0.006, 0.004, teeth, False)
        p.ell(cx, cy + 0.024, 0.022 * k, 0.009, tongue, False)
    elif shape == "round":
        p.ell(cx, cy + 0.006, 0.016 * k, 0.019, dark)
    elif shape == "smile":
        u = p.u
        p.d.arc(((cx - 0.032 * k) * u, (cy - 0.03) * u, (cx + 0.032 * k) * u, (cy + 0.012) * u), 25, 155, fill=LINE,
                width=int(0.009 * u))
    return p.done()


# ------------------------------------------------------------------ backgrounds
def _shopfront(W, H, zoom=1.0, focus=(0.5, 0.5), fg_only=False):
    """Vector shopfront in normalised scene coords, rendered with a zoom about `focus`."""
    p = Pen(W, H, 1)
    p.u = 1 * SS

    def T(x, y):     # scene (0..1, 0..1 of a W x H frame) -> pixels with zoom
        X = ((x - focus[0]) * zoom + 0.5) * W
        Y = ((y - focus[1]) * zoom + 0.5) * H
        return X * SS, Y * SS

    def rect(x0, y0, x1, y1, fill, r=0.0, outline=True):
        a, b = T(x0, y0)
        c, d = T(x1, y1)
        p.d.rounded_rectangle((a, b, c, d), radius=r * W * zoom * SS, fill=fill,
                              outline=LINE if outline else None, width=int(4 * zoom * SS) if outline else 0)

    def ell(x, y, rx, ry, fill, outline=True):
        a, b = T(x - rx, y - ry)
        c, d = T(x + rx, y + ry)
        p.d.ellipse((a, b, c, d), fill=fill, outline=LINE if outline else None, width=int(4 * zoom * SS) if outline else 0)

    if not fg_only:
        rect(-1, -1, 2, 2, hex_rgb("#F3E6CC"), outline=False)                    # wall
        rect(-1, 0.80, 2, 2, hex_rgb("#CFC6B4"), outline=False)                 # pavement
        for k in range(-6, 14):
            rect(k * 0.12, 0.80, k * 0.12 + 0.118, 2, hex_rgb("#D8D0BF"), outline=False)
        rect(-1, 0.795, 2, 0.81, hex_rgb("#B9AF9C"), outline=False)
        rect(0.30, 0.25, 0.62, 0.80, hex_rgb("#5B6370"))                         # rolling door opening
        rect(0.30, 0.25, 0.62, 0.40, hex_rgb("#9AA1AB"))                         # half-open shutter
        for k in range(8):
            y = 0.26 + k * 0.018
            a, b = T(0.30, y)
            c, d = T(0.62, y)
            p.d.line((a, b, c, d), fill=hex_rgb("#7E8693"), width=int(3 * zoom * SS))
        rect(0.34, 0.60, 0.58, 0.64, hex_rgb("#B8BEC6"))                         # tables inside
        rect(0.36, 0.64, 0.38, 0.74, hex_rgb("#8E949C"))
        rect(0.54, 0.64, 0.56, 0.74, hex_rgb("#8E949C"))
        rect(0.05, 0.30, 0.25, 0.50, hex_rgb("#B07A4A"), 0.01)                   # blank menu board
        rect(0.065, 0.315, 0.235, 0.485, hex_rgb("#C9945F"), 0.006, outline=False)
        rect(0.0, 0.66, 0.07, 0.80, hex_rgb("#C46A3E"), 0.01)                    # plant pot
        for k in range(6):
            ell(0.035 + 0.03 * math.cos(k), 0.60 - 0.02 * k % 0.08, 0.05, 0.035, hex_rgb("#5E9E6E"))
        for k in range(10):                                                       # awning stripes
            col = hex_rgb("#F6E7C8") if k % 2 == 0 else hex_rgb("#2A9D8F")
            rect(-0.1 + k * 0.13, 0.0, 0.03 + k * 0.13, 0.16, col, outline=False)
        for k in range(10):
            a, b = T(-0.1 + k * 0.13, 0.16)
            ell(-0.035 + k * 0.13, 0.16, 0.065, 0.025, hex_rgb("#F6E7C8") if k % 2 == 0 else hex_rgb("#2A9D8F"), False)
        a, b = T(-1, 0.185)
        c, d = T(2, 0.185)
        p.d.line((a, b, c, d), fill=hex_rgb("#E2D3B5"), width=int(6 * zoom * SS))
        # steamer pot + hanging chickens behind the counter
        rect(0.70, 0.30, 0.98, 0.32, hex_rgb("#9AA1AB"))
        for k in range(3):
            ell(0.74 + k * 0.09, 0.38, 0.032, 0.05, hex_rgb("#F1C27D"))
            a, b = T(0.74 + k * 0.09, 0.32)
            c, d = T(0.74 + k * 0.09, 0.335)
            p.d.line((a, b, c, d), fill=LINE, width=int(3 * zoom * SS))
        rect(0.86, 0.43, 0.98, 0.54, hex_rgb("#C9CED6"), 0.01)
        ell(0.92, 0.43, 0.06, 0.012, hex_rgb("#DDE1E6"))
    # counter (foreground layer)
    rect(0.62, 0.53, 1.06, 0.57, hex_rgb("#DDE1E6"))
    rect(0.64, 0.57, 1.04, 0.80, hex_rgb("#B8BEC6"))
    rect(0.66, 0.60, 1.02, 0.66, hex_rgb("#C9EAF0"), outline=True)               # glass case
    for k in range(3):
        ell(0.70 + k * 0.1, 0.81, 0.025, 0.025, hex_rgb("#3C3F46"))
    return p.done()


def background(bid: str):
    W, H = STAGE_W, STAGE_H
    if bid == "BG01":
        return _shopfront(W, H)
    if bid == "BG01_FG":
        return _shopfront(W, H, fg_only=True)
    if bid == "BG01M":
        return _shopfront(W, H, zoom=1.7, focus=(0.42, 0.52))
    if bid == "BG01M_FG":
        return _shopfront(W, H, zoom=1.7, focus=(0.42, 0.52), fg_only=True)
    if bid == "BG02":     # counter-side close background (behind C03), blurred
        im = _shopfront(W, H, zoom=2.4, focus=(0.84, 0.42))
        return im.filter(ImageFilter.GaussianBlur(9))
    if bid == "BG03":     # queue side close background (behind C01/C02), blurred
        im = _shopfront(W, H, zoom=2.2, focus=(0.18, 0.50))
        return im.filter(ImageFilter.GaussianBlur(9))
    if bid == "INS01":
        im = _shopfront(W, H, zoom=3.0, focus=(0.30, 0.78)).filter(ImageFilter.GaussianBlur(14))
        p = Pen(W, H, 1)
        p.u = SS
        d = p.d
        # his hand from bottom-left, mustard sleeve
        d.line((-100 * SS, 2300 * SS, 520 * SS, 1350 * SS), fill=LINE, width=330 * SS)
        d.line((-100 * SS, 2300 * SS, 520 * SS, 1350 * SS), fill=hex_rgb("#E3A21A"), width=300 * SS)
        d.ellipse((430 * SS, 1180 * SS, 690 * SS, 1420 * SS), fill=hex_rgb("#F1C7A0"), outline=LINE, width=8 * SS)
        im.alpha_composite(p.done())
        return im
    raise KeyError(bid)


def prop(pid: str):
    if pid == "PROP_TICKET":            # insert-scale ticket + stapled order slip (canvas 520x900)
        p = Pen(520, 900, 1)
        p.u = SS
        p.d.rounded_rectangle((60 * SS, 40 * SS, 460 * SS, 420 * SS), radius=18 * SS, fill=hex_rgb("#FFF4D6"),
                              outline=LINE, width=8 * SS)
        p.d.rectangle((90 * SS, 330 * SS, 430 * SS, 880 * SS), fill=(255, 255, 255, 255), outline=LINE, width=6 * SS)
        for k in range(10):
            p.d.line((120 * SS, (440 + k * 42) * SS, (400 - (k % 3) * 50) * SS, (440 + k * 42) * SS),
                     fill=hex_rgb("#B9B9C4"), width=10 * SS)
        p.d.line((230 * SS, 330 * SS, 290 * SS, 330 * SS), fill=hex_rgb("#7E8693"), width=10 * SS)   # staple
        return p.done()
    if pid == "HAND_C02":                # her hand + floral sleeve reaching from the right (canvas 900x600)
        p = Pen(900, 600, 1)
        p.u = SS
        p.d.line((260 * SS, 300 * SS, 960 * SS, 260 * SS), fill=LINE, width=300 * SS)
        p.d.line((260 * SS, 300 * SS, 960 * SS, 260 * SS), fill=hex_rgb("#D6453D"), width=270 * SS)
        for k in range(6):
            x = 400 + k * 95
            p.d.ellipse(((x - 22) * SS, (250 + (k % 2) * 60) * SS, (x + 22) * SS, (294 + (k % 2) * 60) * SS),
                        fill=(255, 255, 255, 255))
        p.d.ellipse((60 * SS, 160 * SS, 330 * SS, 430 * SS), fill=hex_rgb("#E8B48C"), outline=LINE, width=8 * SS)
        return p.done()
    if pid == "PROP_BAGS_WIDE":          # 50 boxed rice bags piled on the counter (stage overlay)
        p = Pen(STAGE_W, STAGE_H, 1)
        p.u = SS
        for r in range(4):
            for k in range(6 - r):
                x = 760 + k * 66 + r * 33
                y = 1060 - r * 52
                p.d.rounded_rectangle((x * SS, y * SS, (x + 62) * SS, (y + 56) * SS), radius=8 * SS,
                                      fill=(255, 255, 255, 255), outline=LINE, width=4 * SS)
        return p.done()
    raise KeyError(pid)
