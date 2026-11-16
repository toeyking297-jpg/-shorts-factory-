"""Shorts cover image (YouTube lets you pick a Shorts thumbnail; also used on TikTok/Reels)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance

from . import graphics
from .common import FINAL, load_config, log, read_json, run_ffmpeg


def make(ep: Path) -> Path | None:
    cfg = load_config()
    build = ep / "build"
    src = build / "video_only.mp4"
    if not src.exists():
        return None
    frame = build / "tmp" / "cover_frame.png"
    frame.parent.mkdir(exist_ok=True)
    run_ffmpeg(["-ss", "0.8", "-i", str(src), "-frames:v", "1", str(frame)])
    script = read_json(ep / "script.json")
    text = script.get("meta", {}).get("cover_text") or script.get("meta", {}).get("title") or script.get("topic", "")
    img = ImageEnhance.Brightness(Image.open(frame).convert("RGB")).enhance(0.8).convert("RGBA")
    shade = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(shade)
    for y in range(img.height // 3, img.height):  # dark gradient for readable text
        a = int(200 * (y - img.height / 3) / (img.height * 2 / 3))
        d.line([(0, y), (img.width, y)], fill=(0, 0, 0, a))
    img.alpha_composite(shade)
    p = graphics.Painter(cfg)
    d = ImageDraw.Draw(img)
    f, lines = p.wrap(d, text.upper(), 112, img.width - 160, 5)
    lh = int(f.size * 1.1)
    y = int(img.height * 0.62) - len(lines) * lh // 2
    p.text_block(d, lines, f, img.width // 2, y, p.accent, stroke=9, gap=1.1)
    img.alpha_composite(p.header(cfg["channel_name"]))
    out = FINAL / f"{ep.name}_cover.jpg"
    img.convert("RGB").save(out, quality=90)
    log(f"cover -> {out}")
    return out
