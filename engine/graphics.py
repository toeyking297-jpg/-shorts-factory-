"""Original on-screen graphics drawn with Pillow (this is what makes each Short 'yours').

Graphic spec (used as a full-screen scene: visual.type == "graphic", or as an overlay on
footage: scene.overlay). All text in English.

  title     {"type":"title", "text":"The town where dying is illegal", "sub":"Longyearbyen, Norway"}
  stat      {"type":"stat", "value":"-46°C", "label":"coldest temperature recorded", "sub":"1917"}
  compare   {"type":"compare", "title":"Population", "items":[{"label":"Town","value":2400,"display":"2,400"}, ...]}
  list      {"type":"list", "title":"3 rules here", "items":["No cats", "Carry a rifle", "No dying"]}
  label     {"type":"label", "text":"Built in 2008", "pos":"top"}            (small callout, best as overlay)
  location  {"type":"location", "place":"Svalbard", "region":"Norway", "coords":"78°N 15°E"}
  quote     {"type":"quote", "text":"...", "by":"..."}
  timeline  {"type":"timeline", "items":[{"year":"1906","text":"Coal mine opens"}, ...]}
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

from .common import font_path, hex_to_rgb

W, H = 1080, 1920
SAFE_X = 90          # keep clear of edges / Shorts UI on the right
TOP, BOTTOM = 330, 1180   # graphics live here; subtitles sit below, channel tag above


class Painter:
    def __init__(self, cfg: dict):
        st = cfg["style"]
        self.font_file = font_path(cfg)
        self.accent = hex_to_rgb(st.get("accent", "#FFD400"))
        self.accent2 = hex_to_rgb(st.get("accent2", "#3DDCFF"))
        self.panel = hex_to_rgb(st.get("panel", "#0B1E3A"))
        self.white = (255, 255, 255)

    def font(self, size: int) -> ImageFont.FreeTypeFont:
        return ImageFont.truetype(self.font_file, size)

    # ---------- primitives
    def wrap(self, d: ImageDraw.ImageDraw, text: str, size: int, max_w: int, max_lines: int = 4):
        """Shrink font until text fits in max_lines lines of max_w px."""
        while size > 28:
            f = self.font(size)
            lines, cur = [], ""
            for word in text.split():
                test = f"{cur} {word}".strip()
                if d.textlength(test, font=f) <= max_w:
                    cur = test
                else:
                    if cur:
                        lines.append(cur)
                    cur = word
            if cur:
                lines.append(cur)
            if len(lines) <= max_lines and all(d.textlength(l, font=f) <= max_w for l in lines):
                return f, lines
            size -= 4
        return self.font(size), [text]

    def text_block(self, d, lines, f, cx, y, fill, stroke=6, gap=1.12, anchor="ma"):
        lh = int(f.size * gap)
        for i, line in enumerate(lines):
            d.text((cx, y + i * lh), line, font=f, fill=fill, anchor=anchor,
                   stroke_width=stroke, stroke_fill=(0, 0, 0))
        return y + len(lines) * lh

    def panel_box(self, img, box, alpha=215, radius=34, border=True):
        layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        x0, y0, x1, y1 = box
        shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
        ImageDraw.Draw(shadow).rounded_rectangle((x0 + 8, y0 + 14, x1 + 8, y1 + 14), radius, fill=(0, 0, 0, 120))
        img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(14)))
        ld.rounded_rectangle(box, radius, fill=(*self.panel, alpha))
        if border:
            ld.rounded_rectangle(box, radius, outline=(*self.accent2, 255), width=4)
        img.alpha_composite(layer)

    # ---------- backgrounds
    def blueprint_bg(self) -> Image.Image:
        img = Image.new("RGBA", (W, H), (*self.panel, 255))
        d = ImageDraw.Draw(img)
        # vertical gradient
        for y in range(H):
            k = y / H
            c = tuple(int(v * (0.75 + 0.45 * (1 - abs(k - 0.45) * 1.6))) for v in self.panel)
            d.line([(0, y), (W, y)], fill=(*[min(255, x) for x in c], 255))
        grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        g = ImageDraw.Draw(grid)
        for x in range(0, W, 40):
            g.line([(x, 0), (x, H)], fill=(255, 255, 255, 34 if x % 200 == 0 else 14), width=1)
        for y in range(0, H, 40):
            g.line([(0, y), (W, y)], fill=(255, 255, 255, 34 if y % 200 == 0 else 14), width=1)
        img.alpha_composite(grid)
        vignette = Image.new("L", (W, H), 0)
        ImageDraw.Draw(vignette).ellipse((-300, -200, W + 300, H + 200), fill=255)
        vignette = vignette.filter(ImageFilter.GaussianBlur(220))
        dark = Image.new("RGBA", (W, H), (0, 0, 0, 160))
        img = Image.composite(img, Image.alpha_composite(img, dark), vignette)
        return img

    def header(self, name: str) -> Image.Image:
        """Channel tag at the top of every frame."""
        """Small, quiet channel tag: letter-spaced text + accent dot, no box (typography only)."""
        from . import typo
        img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        sp = typo.sprite(name.upper(), 30, (255, 255, 255), "medium", 2, 6, True)
        tw, _ = typo.text_size(name.upper(), typo.font(30, "medium"), 6)
        typo.paste(img, sp, W / 2 + 12, 158, alpha=0.82)
        d = ImageDraw.Draw(img)
        x = W / 2 + 12 - tw / 2 - 22
        d.ellipse((x - 6, 152, x + 6, 164), fill=(*self.accent, 220))
        return img

    # ---------- graphic types
    def render(self, spec: dict, full: bool, with_bg: bool = True) -> Image.Image:
        img = self.blueprint_bg() if (full and with_bg) else Image.new("RGBA", (W, H), (0, 0, 0, 0))
        getattr(self, "g_" + spec.get("type", "title"))(img, spec, full)
        return img

    def g_title(self, img, s, full):
        d = ImageDraw.Draw(img)
        f, lines = self.wrap(d, s["text"].upper(), 104, W - 2 * SAFE_X, 4)
        h = len(lines) * int(f.size * 1.12)
        y = 560 - h // 2 if full else TOP + 40
        end = self.text_block(d, lines, f, W // 2, y, self.accent)
        if s.get("sub"):
            f2, l2 = self.wrap(d, s["sub"], 52, W - 2 * SAFE_X, 2)
            self.text_block(d, l2, f2, W // 2, end + 26, self.white, stroke=4)

    def g_stat(self, img, s, full):
        d = ImageDraw.Draw(img)
        box = (SAFE_X, 420, W - SAFE_X, 1060)
        self.panel_box(img, box, alpha=230 if not full else 160)
        d = ImageDraw.Draw(img)
        f, lines = self.wrap(d, s["value"], 230, W - 2 * SAFE_X - 80, 1)
        d.text((W // 2, 640), lines[0], font=f, fill=self.accent, anchor="mm", stroke_width=8, stroke_fill=(0, 0, 0))
        f2, l2 = self.wrap(d, s.get("label", "").upper(), 58, W - 2 * SAFE_X - 100, 2)
        end = self.text_block(d, l2, f2, W // 2, 800, self.white, stroke=4)
        if s.get("sub"):
            f3, l3 = self.wrap(d, s["sub"], 42, W - 2 * SAFE_X - 100, 2)
            self.text_block(d, l3, f3, W // 2, end + 14, self.accent2, stroke=3)

    def g_compare(self, img, s, full):
        items = s["items"][:4]
        box = (SAFE_X - 20, 380, W - SAFE_X + 20, 380 + 170 + 175 * len(items))
        self.panel_box(img, box, alpha=230 if not full else 150)
        d = ImageDraw.Draw(img)
        ft = self.font(60)
        d.text((W // 2, 430), s.get("title", "").upper(), font=ft, fill=self.white, anchor="ma",
               stroke_width=4, stroke_fill=(0, 0, 0))
        mx = max(float(i["value"]) for i in items) or 1
        fl, fv = self.font(44), self.font(48)
        bar_x0, bar_w = SAFE_X + 20, W - 2 * SAFE_X - 40
        for k, it in enumerate(items):
            y = 550 + k * 175
            d.text((bar_x0, y), str(it["label"]), font=fl, fill=self.white, stroke_width=3, stroke_fill=(0, 0, 0))
            frac = max(float(it["value"]) / mx, 0.04)
            col = self.accent if k == 0 else self.accent2
            track = Image.new("RGBA", img.size, (0, 0, 0, 0))
            ImageDraw.Draw(track).rounded_rectangle((bar_x0, y + 62, bar_x0 + bar_w, y + 122), 30,
                                                    fill=(255, 255, 255, 40))
            img.alpha_composite(track)
            d = ImageDraw.Draw(img)
            d.rounded_rectangle((bar_x0, y + 62, bar_x0 + int(bar_w * frac), y + 122), 30, fill=(*col, 255))
            disp = str(it.get("display", it["value"]))
            tx = bar_x0 + int(bar_w * frac) - 20
            anchor = "rm"
            if d.textlength(disp, font=fv) > bar_w * frac - 40:
                tx, anchor = bar_x0 + int(bar_w * frac) + 20, "lm"
            d.text((tx, y + 92), disp, font=fv, fill=(15, 15, 15) if anchor == "rm" else self.white,
                   anchor=anchor, stroke_width=0 if anchor == "rm" else 3, stroke_fill=(0, 0, 0))

    def g_list(self, img, s, full):
        items = s["items"][:5]
        d = ImageDraw.Draw(img)
        fi = self.font(56)
        rows = []
        for it in items:
            f, lines = self.wrap(d, it, 56, W - 2 * SAFE_X - 170, 2)
            rows.append((f, lines))
        h = 150 + sum(len(l) * int(f.size * 1.15) + 50 for f, l in rows)
        box = (SAFE_X - 20, 380, W - SAFE_X + 20, 380 + h)
        self.panel_box(img, box, alpha=230 if not full else 150)
        d = ImageDraw.Draw(img)
        if s.get("title"):
            d.text((W // 2, 420), s["title"].upper(), font=self.font(62), fill=self.accent, anchor="ma",
                   stroke_width=4, stroke_fill=(0, 0, 0))
        y = 530
        for n, (f, lines) in enumerate(rows, 1):
            d.ellipse((SAFE_X + 10, y - 4, SAFE_X + 94, y + 80), fill=(*self.accent, 255))
            d.text((SAFE_X + 52, y + 38), str(n), font=fi, fill=(10, 10, 10), anchor="mm")
            for j, line in enumerate(lines):
                d.text((SAFE_X + 130, y + j * int(f.size * 1.15)), line, font=f, fill=self.white,
                       stroke_width=3, stroke_fill=(0, 0, 0))
            y += len(lines) * int(f.size * 1.15) + 50

    def g_label(self, img, s, full):
        d = ImageDraw.Draw(img)
        f, lines = self.wrap(d, s["text"], 64, W - 2 * SAFE_X - 80, 2)
        lh = int(f.size * 1.15)
        tw = max(d.textlength(l, font=f) for l in lines)
        y0 = {"top": 360, "middle": 760, "bottom": 1040}.get(s.get("pos", "top"), 360)
        box = (W / 2 - tw / 2 - 40, y0, W / 2 + tw / 2 + 40, y0 + lh * len(lines) + 44)
        self.panel_box(img, box, alpha=235, radius=26)
        d = ImageDraw.Draw(img)
        d.rectangle((box[0] + 4, box[1] + 18, box[0] + 14, box[3] - 18), fill=(*self.accent, 255))
        self.text_block(d, lines, f, W // 2, y0 + 20, self.white, stroke=0)

    def g_location(self, img, s, full):
        d = ImageDraw.Draw(img)
        cx, cy = W // 2, 560
        # pin
        d.ellipse((cx - 70, cy - 190, cx + 70, cy - 50), fill=(*self.accent, 255))
        d.polygon([(cx - 58, cy - 95), (cx + 58, cy - 95), (cx, cy + 10)], fill=(*self.accent, 255))
        d.ellipse((cx - 28, cy - 148, cx + 28, cy - 92), fill=(*self.panel, 255))
        for r, a in ((120, 90), (190, 50), (260, 25)):
            d.ellipse((cx - r, cy - r * 0.28, cx + r, cy + r * 0.28), outline=(*self.accent2, a), width=4)
        f, lines = self.wrap(d, s["place"].upper(), 110, W - 2 * SAFE_X, 2)
        end = self.text_block(d, lines, f, cx, cy + 90, self.white, stroke=7)
        if s.get("region"):
            end = self.text_block(d, [s["region"]], self.font(54), cx, end + 10, self.accent, stroke=4)
        if s.get("coords"):
            self.text_block(d, [s["coords"]], self.font(40), cx, end + 10, self.accent2, stroke=3)

    def g_quote(self, img, s, full):
        d = ImageDraw.Draw(img)
        f, lines = self.wrap(d, f"“{s['text']}”", 70, W - 2 * SAFE_X - 80, 6)
        lh = int(f.size * 1.18)
        box = (SAFE_X - 20, 400, W - SAFE_X + 20, 400 + 120 + lh * len(lines) + (80 if s.get("by") else 0))
        self.panel_box(img, box, alpha=230 if not full else 150)
        d = ImageDraw.Draw(img)
        end = self.text_block(d, lines, f, W // 2, 460, self.white, stroke=3, gap=1.18)
        if s.get("by"):
            d.text((W // 2, end + 20), "— " + s["by"], font=self.font(46), fill=self.accent, anchor="ma",
                   stroke_width=3, stroke_fill=(0, 0, 0))

    def g_timeline(self, img, s, full):
        items = s["items"][:4]
        box = (SAFE_X - 20, 380, W - SAFE_X + 20, 420 + 190 * len(items))
        self.panel_box(img, box, alpha=230 if not full else 150)
        d = ImageDraw.Draw(img)
        x = SAFE_X + 70
        d.line([(x, 450), (x, 390 + 190 * len(items))], fill=(*self.accent2, 255), width=8)
        for k, it in enumerate(items):
            y = 440 + k * 190
            d.ellipse((x - 22, y + 14, x + 22, y + 58), fill=(*self.accent, 255), outline=(0, 0, 0), width=4)
            d.text((x + 60, y), str(it["year"]), font=self.font(64), fill=self.accent, stroke_width=4,
                   stroke_fill=(0, 0, 0))
            f, lines = self.wrap(d, it["text"], 44, W - x - 60 - SAFE_X - 20, 2)
            for j, line in enumerate(lines):
                d.text((x + 60, y + 78 + j * int(f.size * 1.1)), line, font=f, fill=self.white,
                       stroke_width=3, stroke_fill=(0, 0, 0))


def render_png(cfg: dict, spec: dict, out: Path, full: bool, with_bg: bool = True) -> Path:
    Painter(cfg).render(spec, full, with_bg).save(out)
    return out


def header_png(cfg: dict, out: Path) -> Path:
    Painter(cfg).header(cfg["channel_name"]).save(out)
    return out


def bg_png(cfg: dict, out: Path) -> Path:
    Painter(cfg).blueprint_bg().save(out)
    return out
