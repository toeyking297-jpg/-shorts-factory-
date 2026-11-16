"""Backgrounds and props for toon episodes. Every set is drawn once (cached) and reused across episodes.

A set returns a 1080x1920 RGBA image. Props are sprites. Lighting variants ("dark") give the blackout look.
"""
from __future__ import annotations

import functools
import random

from PIL import Image, ImageDraw, ImageFilter

from .draw import (CAST, SS, Canvas, H, W, buildings, glow_spot, mix, shade, sky, sprite, vignette)

FLOOR = 1560   # where the cast stands (feet line, before CHAR_DY)


def _rect(c, box, color, a=255, r=0):
    lay = c.layer()
    d = ImageDraw.Draw(lay)
    b = [v * SS for v in box]
    if r:
        d.rounded_rectangle(b, r * SS, fill=color + (a,))
    else:
        d.rectangle(b, fill=color + (a,))
    c.comp(lay)


def _poly(c, pts, color, a=255):
    lay = c.layer()
    ImageDraw.Draw(lay).polygon([v * SS for v in pts], fill=color + (a,))
    c.comp(lay)


def _dim(img: Image.Image, k: float, tint=(20, 30, 70)) -> Image.Image:
    """Night/blackout grade: darken and push toward blue."""
    over = Image.new("RGBA", img.size, tint + (255,))
    return Image.blend(img, over, k)


# ---------------------------------------------------------------- city
@functools.lru_cache(maxsize=8)
def city(lit: float = 0.3, seed: int = 11) -> Image.Image:
    c = Canvas()
    rnd = random.Random(seed)
    sky(c, (10, 14, 30), (44, 32, 58))
    for _ in range(160):
        x, y = rnd.randint(0, W), rnd.randint(0, 760)
        _rect(c, (x, y, x + 2, y + 2), (220, 220, 255), rnd.randint(60, 200))
    glow_spot(c, 820, 330, 90, (240, 240, 255), 90)
    _rect(c, (780, 290, 860, 370), (236, 236, 248), 255, 40)
    buildings(c, 1430, (30, 34, 56), random.Random(seed + 1), hmin=600, hmax=1050, lit=lit * 0.8)
    buildings(c, 1480, (44, 48, 76), random.Random(seed + 2), hmin=350, hmax=700, lit=lit, win=(255, 200, 120),
              wmin=160, wmax=260)
    _rect(c, (0, 1480, W, H), (28, 30, 44))
    _rect(c, (0, 1480, W, 1500), (60, 62, 84))
    for x in range(40, W, 180):
        _rect(c, (x, 1760, x + 90, 1772), (90, 92, 110))
    for x in (120, 760):    # street lamps
        _rect(c, (x, 1080, x + 12, 1490), (50, 54, 72))
        _rect(c, (x - 40, 1070, x + 30, 1090), (50, 54, 72), 255, 8)
        if lit > 0.1:
            glow_spot(c, x - 5, 1100, 150, (255, 210, 140), 70)
    return c.image()


# ---------------------------------------------------------------- kitchen
@functools.lru_cache(maxsize=8)
def kitchen(dark: bool = True) -> Image.Image:
    c = Canvas((70, 76, 92))
    _rect(c, (0, 0, W, 1480), (86, 92, 110))
    for y in range(980, 1480, 60):    # tiles
        for x in range(0, W, 60):
            _rect(c, (x + 2, y + 2, x + 58, y + 58), (98, 104, 122))
    _rect(c, (600, 300, 1000, 760), (16, 22, 44), 255, 8)   # window: dark city
    rnd = random.Random(4)
    for _ in range(30):
        x, y = rnd.randint(620, 980), rnd.randint(520, 740)
        _rect(c, (x, y, x + 10, y + 14), (30, 36, 60))
    _rect(c, (796, 300, 804, 760), (60, 64, 80))
    _rect(c, (600, 526, 1000, 534), (60, 64, 80))
    _rect(c, (480, 1060, W, 1480), (120, 84, 58))    # counter
    _rect(c, (480, 1040, W, 1080), (170, 170, 180))
    for x in (540, 760, 980):
        _rect(c, (x, 1160, x + 140, 1440), (108, 74, 50), 255, 6)
        _rect(c, (x + 60, 1290, x + 80, 1300), (190, 190, 200), 255, 4)
    # upper cabinets, pendant lamp, wall clock, kettle, plant
    _rect(c, (0, 120, 520, 520), (108, 74, 50), 255, 6)
    for x in (10, 180, 350):
        _rect(c, (x, 130, x + 160, 510), (122, 84, 58), 255, 6)
        _rect(c, (x + 120, 300, x + 132, 360), (190, 190, 200), 255, 4)
    _rect(c, (790, 0, 800, 180), (40, 40, 48))
    _poly(c, (720, 260, 870, 260, 830, 180, 760, 180), (60, 62, 74))
    c.d.ellipse([v * SS for v in (110, 600, 250, 740)], fill=(236, 236, 240, 255))
    c.d.ellipse([v * SS for v in (118, 608, 242, 732)], outline=(60, 60, 70, 255), width=5 * SS)
    c.d.line([v * SS for v in (180, 670, 180, 625)], fill=(40, 40, 50, 255), width=6 * SS)
    c.d.line([v * SS for v in (180, 670, 215, 670)], fill=(40, 40, 50, 255), width=6 * SS)
    _rect(c, (860, 930, 960, 1040), (200, 70, 60), 255, 24)
    _rect(c, (600, 960, 660, 1040), (150, 110, 80), 255, 6)
    for k in range(5):
        c.d.ellipse([v * SS for v in (600 + k * 9 - 30, 880 + (k % 2) * 20, 600 + k * 9 + 30, 960)], fill=(70, 150, 90, 255))
    _rect(c, (0, 1480, W, H), (58, 52, 56))
    _rect(c, (0, 1480, W, 1492), (40, 36, 40))
    img = c.image()
    return _dim(img, 0.55) if dark else img


def fridge(open_: bool = False):
    def draw(c):
        _rect(c, (100, 760, 460, 1560), (214, 220, 230), 255, 22)
        _rect(c, (100, 1060, 460, 1072), (170, 176, 188))
        _rect(c, (410, 860, 426, 1010), (150, 156, 170), 255, 8)
        _rect(c, (410, 1110, 426, 1300), (150, 156, 170), 255, 8)
        if open_:
            glow_spot(c, 280, 1200, 360, (220, 240, 255), 140)
            _rect(c, (120, 780, 440, 1540), (236, 246, 255), 255, 14)
            for y in (920, 1080, 1240, 1400):
                _rect(c, (130, y, 430, y + 10), (190, 206, 220))
            for x, y, col in ((150, 860, (230, 80, 70)), (250, 1010, (250, 200, 60)), (330, 1180, (90, 190, 110)),
                              (180, 1340, (240, 240, 240))):
                _rect(c, (x, y, x + 70, y + 60), col, 255, 10)
            _poly(c, (460, 760, 600, 820, 600, 1500, 460, 1560), (190, 196, 208))
    return sprite(("fridge", open_), draw, anchor=(0, 0))


# ---------------------------------------------------------------- garage / driveway
@functools.lru_cache(maxsize=8)
def garage(dark: bool = True) -> Image.Image:
    c = Canvas((60, 62, 70))
    _rect(c, (0, 0, W, 1480), (74, 76, 86))
    for x in range(0, W, 120):
        _rect(c, (x, 0, x + 6, 1480), (66, 68, 78))
    _rect(c, (60, 520, 440, 540), (110, 82, 58))      # shelves
    _rect(c, (60, 760, 440, 780), (110, 82, 58))
    for x, y, col in ((80, 450, (200, 60, 60)), (180, 470, (70, 130, 200)), (300, 440, (230, 190, 60)),
                      (100, 690, (120, 120, 130)), (260, 700, (60, 160, 120))):
        _rect(c, (x, y, x + 80, 520 if y < 600 else 760), col, 255, 6)
    _rect(c, (560, 360, 1040, 1480), (34, 40, 62))   # open garage door -> night outside
    _rect(c, (560, 340, 1040, 380), (120, 124, 136))
    for y in range(380, 520, 28):
        _rect(c, (560, y, 1040, y + 22), (150, 154, 166))
    _rect(c, (60, 900, 440, 1240), (120, 96, 70), 255, 4)     # pegboard with tools
    for y in range(930, 1230, 40):
        for x in range(80, 430, 40):
            c.d.ellipse([v * SS for v in (x, y, x + 6, y + 6)], fill=(90, 70, 50, 255))
    for x, h_ in ((110, 200), (190, 150), (270, 230), (350, 170)):
        _rect(c, (x, 960, x + 18, 960 + h_), (180, 184, 196), 255, 6)
        _rect(c, (x - 18, 950, x + 36, 980), (200, 70, 60), 255, 8)
    for x in range(600, 1040, 90):                              # stars + street outside
        c.d.ellipse([v * SS for v in (x, 600 + (x % 7) * 20, x + 4, 604 + (x % 7) * 20)], fill=(220, 220, 255, 200))
    _rect(c, (560, 1300, 1040, 1480), (26, 30, 46))
    _rect(c, (0, 1480, W, H), (96, 96, 104))
    _rect(c, (560, 1480, W, H), (70, 72, 82))
    for x in range(20, 560, 140):
        _rect(c, (x, 1640, x + 90, 1650), (110, 110, 118))
    img = c.image()
    return _dim(img, 0.5) if dark else img


def generator():
    def draw(c):
        _rect(c, (0, 40, 300, 240), (212, 60, 52), 255, 18)
        _rect(c, (30, 70, 270, 150), (40, 40, 48), 255, 10)
        for x in range(50, 260, 24):
            _rect(c, (x, 80, x + 12, 140), (70, 70, 80), 255, 4)
        _rect(c, (20, 0, 280, 50), (60, 60, 70), 255, 14)
        _rect(c, (300, 170, 340, 190), (80, 80, 90))     # exhaust pipe
        c.d.ellipse([v * SS for v in (10, 220, 80, 290)], fill=(30, 30, 36, 255))
        c.d.ellipse([v * SS for v in (220, 220, 290, 290)], fill=(30, 30, 36, 255))
    return sprite(("generator",), draw, size=(360, 300), anchor=(150, 290))


# ---------------------------------------------------------------- living room
@functools.lru_cache(maxsize=8)
def living(dark: bool = True) -> Image.Image:
    c = Canvas((64, 54, 70))
    _rect(c, (0, 0, W, 1480), (78, 66, 86))
    _rect(c, (640, 320, 980, 760), (16, 22, 44), 255, 8)
    _rect(c, (640, 320, 980, 340), (110, 90, 70))
    _rect(c, (80, 380, 380, 600), (110, 90, 70), 255, 6)    # picture frame
    _rect(c, (100, 400, 360, 580), (150, 170, 190))
    _rect(c, (60, 1180, 560, 1420), (120, 60, 70), 255, 30)  # couch
    _rect(c, (40, 1100, 140, 1440), (110, 54, 64), 255, 30)
    _rect(c, (480, 1100, 580, 1440), (110, 54, 64), 255, 30)
    _rect(c, (640, 1260, 1000, 1290), (120, 84, 58))        # side table
    _rect(c, (680, 1290, 700, 1480), (100, 70, 48))
    _rect(c, (940, 1290, 960, 1480), (100, 70, 48))
    _rect(c, (840, 860, 1060, 1480), (96, 70, 50), 255, 6)     # bookshelf
    for y in (960, 1100, 1240, 1380):
        _rect(c, (850, y, 1050, y + 12), (70, 50, 36))
        x = 860
        for k in range(6):
            bw = 22 + (k * 7) % 14
            _rect(c, (x, y - 90 + (k % 3) * 10, x + bw, y), [(190, 70, 60), (70, 120, 180), (220, 180, 60), (80, 150, 100)][k % 4])
            x += bw + 6
    _rect(c, (600, 820, 612, 1260), (60, 56, 60))              # floor lamp (off)
    _poly(c, (540, 820, 672, 820, 640, 720, 572, 720), (200, 180, 150))
    _rect(c, (120, 1480, 900, 1560), (140, 60, 66), 255, 30)    # rug
    _rect(c, (0, 1480, W, H), (60, 46, 52))
    _rect(c, (140, 1500, 880, 1600), (130, 56, 62), 255, 40)
    img = c.image()
    return _dim(img, 0.62) if dark else img


# ---------------------------------------------------------------- sink (cliffhanger)
@functools.lru_cache(maxsize=8)
def sink(dark: bool = True) -> Image.Image:
    c = Canvas((70, 76, 92))
    _rect(c, (0, 0, W, 1480), (82, 90, 108))
    for y in range(700, 1300, 70):
        for x in range(0, W, 70):
            _rect(c, (x + 2, y + 2, x + 68, y + 68), (96, 104, 124))
    _rect(c, (140, 1200, 940, 1480), (150, 156, 168), 255, 10)
    _rect(c, (240, 1220, 840, 1330), (60, 66, 80), 255, 40)
    _rect(c, (520, 980, 560, 1220), (190, 196, 206), 255, 12)     # faucet
    _rect(c, (520, 980, 700, 1020), (190, 196, 206), 255, 16)
    _rect(c, (660, 1000, 700, 1060), (190, 196, 206), 255, 10)
    _rect(c, (720, 260, 960, 500), (230, 230, 236), 255, 120)     # wall clock
    c.d.ellipse([v * SS for v in (730, 270, 950, 490)], fill=(250, 250, 252, 255))
    c.d.line([v * SS for v in (840, 380, 840, 300)], fill=(30, 30, 40, 255), width=8 * SS)
    c.d.line([v * SS for v in (840, 380, 890, 380)], fill=(30, 30, 40, 255), width=8 * SS)
    _rect(c, (0, 1480, W, H), (58, 52, 56))
    img = c.image()
    return _dim(img, 0.58) if dark else img


SETS = {"city": lambda: city(0.3), "city_dark": lambda: city(0.0), "kitchen": kitchen, "garage": garage,
        "living": living, "sink": sink}
