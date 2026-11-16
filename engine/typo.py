"""Typography-only on-screen text (the channel never uses boxes, cards or panels behind text).

Every piece of text is: bold fill + thin dark outline + soft drop shadow, straight on the picture.
`Layout` knows the reserved screen zones (channel tag, caption band, Shorts/TikTok/Reels buttons) and every box
already placed, so new text is either placed where it is free, shrunk, or reported as a collision. Those
reports go into the QC report ("visual" category).

Screen plan (1080x1920):
    0-100     phone status bar / app UI
    110-200   channel tag (small, no box)
    230-1150  graphics zone (headlines, numbers, icons, map labels)
    1190-1400 caption band (burned subtitles)
    1480-1920 app UI (title, channel name, music)
    right column x>940 between y 880-1500: like/comment/share buttons
"""
from __future__ import annotations

import functools
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

from .common import ROOT

W, H = 1080, 1920
FONTS = ROOT / "assets" / "fonts"
ZONE = (70, 230, 1010, 1150)            # where graphics may go
CAPTION_BAND = (60, 1190, 1020, 1400)
RESERVED = [
    ("status bar / channel tag", (0, 0, W, 215)),
    ("caption band", CAPTION_BAND),
    ("app UI bottom", (0, 1480, W, H)),
    ("app buttons right", (945, 880, W, 1500)),
]
DARK = (8, 12, 20)


@functools.lru_cache(maxsize=128)
def font(size: int, weight: str = "bold") -> ImageFont.FreeTypeFont:
    name = {"bold": "Poppins-Bold.ttf", "medium": "Poppins-Medium.ttf", "italic": "Poppins-MediumItalic.ttf"}[weight]
    p = FONTS / name
    if not p.exists():
        p = FONTS / "Poppins-Bold.ttf"
    return ImageFont.truetype(str(p), max(int(size), 8))


def text_size(txt: str, f: ImageFont.FreeTypeFont, spacing: float = 0) -> tuple[int, int]:
    """Visual width/height of a single line (spacing = extra letter spacing in px)."""
    if spacing:
        w = sum(f.getlength(ch) for ch in txt) + spacing * max(len(txt) - 1, 0)
    else:
        w = f.getlength(txt)
    asc, desc = f.getmetrics()
    return int(w + 0.5), asc + desc


@functools.lru_cache(maxsize=512)
def sprite(txt: str, size: int, fill: tuple, weight: str = "bold", stroke: float | None = None,
           spacing: float = 0, shadow: bool = True) -> Image.Image:
    """Rendered text (with outline + shadow) on a tight transparent canvas. Cached: drawn once, reused per frame."""
    f = font(size, weight)
    sw = int(round(size * 0.075)) if stroke is None else int(stroke)
    tw, th = text_size(txt, f, spacing)
    pad = sw + max(10, size // 5)
    cw, ch = tw + 2 * pad, th + 2 * pad
    img = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    if shadow:
        sh = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
        _draw(ImageDraw.Draw(sh), txt, pad + size * 0.03, pad + size * 0.06, f, (0, 0, 0, 170), sw + max(2, size // 25),
              (0, 0, 0, 170), spacing)
        img = Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(max(3, size / 14))))
    layer = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    _draw(ImageDraw.Draw(layer), txt, pad, pad, f, (*fill[:3], 255), sw, (*DARK, 255), spacing)
    img = Image.alpha_composite(img, layer)
    img.info["pad"] = pad
    return img


def _draw(d, txt, x, y, f, fill, sw, sfill, spacing):
    if spacing:
        for chr_ in txt:
            d.text((x, y), chr_, font=f, fill=fill, stroke_width=sw, stroke_fill=sfill)
            x += f.getlength(chr_) + spacing
    else:
        d.text((x, y), txt, font=f, fill=fill, stroke_width=sw, stroke_fill=sfill)


def fit_lines(txt: str, max_w: int, size: int, min_size: int = 34, max_lines: int = 2, weight: str = "bold",
              spacing: float = 0) -> tuple[int, list[str]]:
    """Largest font size (<= size) at which the text fits in max_lines lines of max_w px, balanced lines."""
    words = txt.split()
    while size >= min_size:
        f = font(size, weight)
        best = None
        for n in range(1, max_lines + 1):
            lines = _balanced(words, n, f, spacing)
            if lines and all(text_size(l, f, spacing)[0] <= max_w for l in lines):
                best = lines
                break
        if best:
            return size, best
        size -= 4
    return min_size, [txt]


def _balanced(words, n, f, spacing):
    if n == 1:
        return [" ".join(words)]
    if len(words) < n:
        return None
    best, best_w = None, 1e9
    # try every split point(s) for n=2 or 3 and keep the one with the smallest widest line
    import itertools
    for cuts in itertools.combinations(range(1, len(words)), n - 1):
        parts, prev = [], 0
        for c in (*cuts, len(words)):
            parts.append(" ".join(words[prev:c]))
            prev = c
        widest = max(text_size(p, f, spacing)[0] for p in parts)
        if widest < best_w:
            best, best_w = parts, widest
    return best


class Layout:
    """Collision-aware placement. Boxes are (x0, y0, x1, y1) in 1080x1920 space."""

    def __init__(self, reserved: bool = True):
        self.boxes: list[tuple[str, tuple]] = list(RESERVED) if reserved else []
        self.issues: list[str] = []

    @staticmethod
    def overlap(a, b, pad=0) -> bool:
        return not (a[2] + pad <= b[0] or a[0] - pad >= b[2] or a[3] + pad <= b[1] or a[1] - pad >= b[3])

    def is_free(self, box, pad=8, ignore_reserved=False) -> bool:
        if box[0] < 30 or box[2] > W - 30 or box[1] < 0 or box[3] > H:
            return False
        for name, b in self.boxes:
            if ignore_reserved and any(name == r[0] for r in RESERVED):
                continue
            if self.overlap(box, b, pad):
                return False
        return True

    def hits(self, box, pad=4) -> list[str]:
        return [name for name, b in self.boxes if self.overlap(box, b, pad)]

    def add(self, name: str, box, check: bool = True) -> None:
        if check:
            hit = self.hits(box)
            if hit:
                self.issues.append(f"'{name}' overlaps {', '.join(hit)}")
        self.boxes.append((name, tuple(int(v) for v in box)))


def paste(img: Image.Image, sp: Image.Image, cx: float, cy: float, alpha: float = 1.0, scale: float = 1.0,
          anchor: str = "mm") -> tuple:
    """Paste a text sprite so its TEXT (not padding) is anchored at cx, cy. Returns the text box."""
    pad = sp.info.get("pad", 0)
    if scale != 1.0:
        sp2 = sp.resize((max(int(sp.width * scale), 1), max(int(sp.height * scale), 1)), Image.BILINEAR)
        pad = pad * scale
    else:
        sp2 = sp
    if alpha < 1.0:
        sp2 = sp2.copy()
        sp2.putalpha(sp2.getchannel("A").point(lambda v: int(v * max(alpha, 0))))
    tw, th = sp2.width - 2 * pad, sp2.height - 2 * pad
    x = {"l": cx, "m": cx - tw / 2, "r": cx - tw}[anchor[0]]
    y = {"t": cy, "m": cy - th / 2, "b": cy - th}[anchor[1]]
    if alpha > 0:
        img.alpha_composite(sp2, (int(x - pad), int(y - pad)))
    return (x, y, x + tw, y + th)


def ink_height(txt: str, size: float) -> float:
    """Height of the actual letters (for collision boxes): caps-only text is shorter than its line box."""
    low = any(c in "gjpqy" for c in txt)
    return size * (0.95 if low else (0.8 if any(c.islower() for c in txt) else 0.74))


def clean(txt: str) -> str:
    """Replace characters the channel font does not have."""
    return str(txt).replace("′", "'").replace("″", '"')


def text_box(txt: str, size: int, cx: float, cy: float, weight="bold", spacing=0, anchor="mm") -> tuple:
    tw, th = text_size(txt, font(size, weight), spacing)
    x = {"l": cx, "m": cx - tw / 2, "r": cx - tw}[anchor[0]]
    y = {"t": cy, "m": cy - th / 2, "b": cy - th}[anchor[1]]
    return (x, y, x + tw, y + th)


def shorten_headline(text: str, max_words: int = 5) -> str | None:
    """On-screen headline = 2-5 words. Strip filler; if still too long it is narration, not a headline -> None."""
    filler = {"the", "a", "an", "is", "are", "was", "were", "of", "that", "this", "it", "its", "it's", "just",
              "really", "very", "so", "and", "but", "then", "there", "here", "to"}
    words = text.replace("…", "").split()
    if len(words) <= max_words:
        return " ".join(words)
    kept = [w for w in words if w.lower().strip(".,!?") not in filler]
    if len(kept) <= max_words:
        return " ".join(kept)
    return None
