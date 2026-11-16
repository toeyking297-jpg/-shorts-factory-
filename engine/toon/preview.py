"""Fast look at an episode without voice: one frame per scene (at 70% of the scene) on a contact sheet.

  python -m engine.toon.preview toon/series/survive/ep01_blackout_en.json out.jpg
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

from .show import Scene, header_tag
from .draw import W, H


def sheet(script: Path, out: Path, at: float = 0.7, cols: int = 6, words_per_s: float = 2.6) -> Path:
    ep = json.loads(Path(script).read_text(encoding="utf-8"))
    lang = ep.get("lang", "en")
    frames = []
    for i, sc in enumerate(ep["scenes"]):
        n = len(sc["text"].split()) if lang == "en" else max(len(sc["text"]) / 7, 3)
        dur = max(n / words_per_s, 1.5)
        s = Scene(ep, sc.get("shot", {}), dur, i, lang)
        img = s.frame(dur * at)
        img.alpha_composite(header_tag(ep))
        d = ImageDraw.Draw(img)
        d.rectangle((60, 900, 1020, 1000), outline=(255, 255, 0, 160), width=3)   # caption band guide
        frames.append(img.convert("RGB").resize((270, 480)))
    rows = (len(frames) + cols - 1) // cols
    sh = Image.new("RGB", (cols * 270, rows * 480), (10, 10, 10))
    for k, f in enumerate(frames):
        sh.paste(f, ((k % cols) * 270, (k // cols) * 480))
    sh.save(out, quality=88)
    return out


if __name__ == "__main__":
    sheet(Path(sys.argv[1]), Path(sys.argv[2]))
