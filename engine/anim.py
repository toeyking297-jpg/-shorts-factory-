"""Animated on-screen graphics, typography only (no boxes, cards or panels anywhere).

An overlay spec is first PLANNED once at its final state (every element gets a fixed box, checked against the
reserved screen zones and against each other), then animated frame by frame on a transparent layer and encoded
as a .mov with alpha that render.py puts on top of footage. Numbers are always shown at their real value
(no counting up from zero); only bars, lines and reveals move.

Overlay types (scene["overlay"]):
  label / title  {"type":"label","text":"2-5 WORD HEADLINE","kicker":"optional small line","pos":"top"}
  stat           {"type":"stat","value":"1,670 mi","label":"to the nearest land","source":"NOAA","fact":"f1"}
  compare        {"type":"compare","title":"GDP per person","items":[{"label":"Singapore","value":90700,
                  "display":"$90,700"},{"label":"USA","value":85800,"display":"$85,800"}],"source":"World Bank"}
  list           {"type":"list","title":"3 rules","items":["No cats","Carry a rifle","No dying"]}
  timeline       {"type":"timeline","items":[{"year":"1906","text":"Coal mine opens"}]}
  icons          {"type":"icons","title":"NO OIL. NO WATER.","items":[{"icon":"oil-well","label":"OIL","state":"no"}]}
  location       {"type":"location","place":"Svalbard","region":"Norway"}
  quote          {"type":"quote","text":"...","by":"..."}
"pos": "top" | "middle" | "bottom" (default top). Icons: see assets/icons/*.png
"""
from __future__ import annotations

import functools
import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw

from . import typo
from .common import ROOT, ffmpeg_bin, hex_to_rgb
from .typo import H, W, Layout, font, paste, sprite, text_size

FPS = 30
ICONS = ROOT / "assets" / "icons"
RED, GREEN, WHITE, SOFT = (255, 69, 58), (52, 199, 89), (255, 255, 255), (225, 228, 235)
X0, X1 = 100, 935          # text column (clear of the app buttons on the right)
MAXW = X1 - X0


def ease_out(x: float) -> float:
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


def ease_back(x: float) -> float:  # overshoot "pop"
    x = max(0.0, min(1.0, x))
    c1, c3 = 1.70158, 2.70158
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2


def icon_names() -> list[str]:
    return sorted(p.stem for p in ICONS.glob("*.png"))


@functools.lru_cache(maxsize=256)
def _icon(name: str, size: int, color: tuple) -> Image.Image | None:
    p = ICONS / f"{name}.png"
    if not p.exists():
        cands = [q for q in ICONS.glob("*.png") if name.split("-")[0] in q.stem]
        if not cands:
            return None
        p = cands[0]
    a = Image.open(p).getchannel("A").resize((size, size), Image.LANCZOS)
    im = Image.new("RGBA", (size, size), (*color, 255))
    im.putalpha(a)
    return im


class Overlay:
    """Plan + animate one overlay spec."""

    def __init__(self, cfg: dict, spec: dict, dur: float):
        st = cfg.get("style", {})
        self.accent = hex_to_rgb(st.get("accent", "#FFD400"))
        self.accent2 = hex_to_rgb(st.get("accent2", "#3DDCFF"))
        self.spec = spec
        self.dur = dur
        self.layout = Layout()
        self.els: list[dict] = []
        kind = spec.get("type", "label")
        if kind == "title":
            kind = "label"
        self.kind = kind
        for scale in (1.0, 0.85, 0.72):
            self.els = []
            getattr(self, "p_" + kind, self.p_label)(scale)
            if self._fits():
                break
        self._place()

    # ------------------------------------------------------------ planning helpers
    def text(self, txt, size, fill, y, x=None, anchor="mm", weight="bold", start=0.0, spacing=0, anim="rise",
             name="text"):
        txt = typo.clean(txt)
        sp = sprite(txt, int(size), tuple(fill), weight, None, spacing, True)
        tw, th = text_size(txt, font(int(size), weight), spacing)
        ih = typo.ink_height(txt, size)
        cx = W / 2 if x is None else x
        bx = {"l": cx, "m": cx - tw / 2, "r": cx - tw}[anchor[0]]
        self.els.append({"k": "text", "sp": sp, "x": cx, "y": y, "anchor": anchor, "start": start, "anim": anim,
                         "box": (bx, y - ih / 2, bx + tw, y + ih / 2), "name": name})
        return th

    def block(self, txt, size, fill, y, max_w=MAXW, lines=2, x=None, anchor="mm", weight="bold", start=0.0,
              gap=1.02, stagger=0.08, name="text", min_size=34):
        size, ls = typo.fit_lines(str(txt), max_w, int(size), min_size, lines, weight)
        lh = int(size * gap)
        for i, line in enumerate(ls):
            self.text(line, size, fill, y + lh / 2 + i * lh, x, anchor, weight, start + i * stagger, name=name)
        return lh * len(ls)

    def _bounds(self):
        bs = [e["box"] for e in self.els]
        return min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs)

    def _fits(self) -> bool:
        if not self.els:
            return True
        x0, y0, x1, y1 = self._bounds()
        return (y1 - y0) <= (typo.ZONE[3] - typo.ZONE[1]) and x0 >= 40 and x1 <= W - 40

    def _place(self):
        """Move the planned block to its position, then check every element against reserved zones + each other."""
        if not self.els:
            return
        x0, y0, x1, y1 = self._bounds()
        h = y1 - y0
        pos = self.spec.get("pos", "top")
        top = {"top": 300, "middle": 690 - h / 2, "bottom": 1140 - h}.get(pos, 300)
        top = max(typo.ZONE[1] + 10, min(top, typo.ZONE[3] - h))
        dy = top - y0
        for e in self.els:
            e["y"] += dy
            b = e["box"]
            e["box"] = (b[0], b[1] + dy, b[2], b[3] + dy)
            if "y2" in e:
                e["y2"] += dy
        for e in self.els:
            if e["k"] in ("text", "icon"):
                self.layout.add(e["name"], e["box"])

    def report(self) -> dict:
        return {"type": self.kind, "issues": self.layout.issues,
                "boxes": [[e["name"], [int(v) for v in e["box"]]] for e in self.els if e["k"] in ("text", "icon")]}

    # ------------------------------------------------------------ plans (y = absolute, before _place shifts)
    def p_label(self, k):
        s = self.spec
        y = 0
        if s.get("kicker"):
            y += self.text(str(s["kicker"]).upper(), 36 * k, self.accent, y + 20, weight="medium", spacing=5,
                           name="kicker") + 6
        txt = str(s.get("text") or s.get("title") or "").upper()
        y += self.block(txt, 104 * k, WHITE, y, lines=3, start=0.08, name="headline")
        if s.get("sub"):
            self.block(str(s["sub"]), 48 * k, self.accent, y + 14, lines=2, weight="medium", start=0.3, name="sub")

    def p_stat(self, k):
        s = self.spec
        val = str(s.get("value", ""))
        size, _ = typo.fit_lines(val, MAXW, int(190 * k), 60, 1)
        th = self.text(val, size, self.accent, size * 0.55, anim="pop", name="number")
        y = size * 0.55 + th / 2 + 8
        b = self.els[-1]["box"]
        self.els.append({"k": "line", "x0": b[0], "x1": b[2], "y": y, "y2": y, "start": 0.3, "w": 9,
                         "color": self.accent, "box": (b[0], y - 5, b[2], y + 5)})
        y += 26
        if s.get("label"):
            y += self.block(str(s["label"]).upper(), 56 * k, WHITE, y, lines=2, start=0.25, name="label")
        if s.get("sub"):
            y += self.block(str(s["sub"]), 40 * k, SOFT, y + 6, lines=2, weight="medium", start=0.4, name="sub") + 6
        if s.get("source"):
            self.text("SOURCE: " + str(s["source"]).upper(), 28 * k, SOFT, y + 30, weight="medium", start=0.6,
                      spacing=2, name="source")

    def p_compare(self, k):
        s = self.spec
        items = s.get("items", [])[:4]
        y = 0
        if s.get("title"):
            y += self.block(str(s["title"]).upper(), 64 * k, WHITE, y, lines=2, name="title") + 22
        try:
            mx = max(float(i.get("value", 0)) for i in items) or 1.0
        except (TypeError, ValueError):
            mx = 1.0
        for n, it in enumerate(items):
            lab = str(it.get("label", "")).upper()
            disp = str(it.get("display", it.get("value", "")))
            col = self.accent if n == 0 else WHITE
            fs = int(48 * k)
            self.text(lab, fs, WHITE, y + fs * 0.6, x=X0, anchor="lm", start=0.15 + 0.15 * n, name="label")
            self.text(disp, int(54 * k), col, y + fs * 0.6, x=X1, anchor="rm", start=0.15 + 0.15 * n, name="value")
            by = y + fs * 1.35 + 14
            try:
                frac = max(float(it.get("value", 0)) / mx, 0.02)
            except (TypeError, ValueError):
                frac = 0.5
            self.els.append({"k": "bar", "x0": X0, "x1": X1, "frac": frac, "y": by, "start": 0.3 + 0.15 * n,
                             "w": int(20 * k), "color": self.accent if n == 0 else self.accent2,
                             "box": (X0, by - 10, X1, by + 10)})
            y = by + 46 * k
        if s.get("source"):
            self.text("SOURCE: " + str(s["source"]).upper(), 28 * k, SOFT, y + 20, weight="medium", start=0.8,
                      spacing=2, name="source")

    def p_list(self, k):
        s = self.spec
        y = 0
        if s.get("title"):
            y += self.block(str(s["title"]).upper(), 66 * k, self.accent, y, lines=2, name="title") + 24
        items = s.get("items", [])[:4]
        gap = max(0.25, min(0.55, self.dur * 0.6 / max(len(items), 1)))
        for n, it in enumerate(items, 1):
            st = 0.15 + (n - 1) * gap
            fs = int(54 * k)
            size, ls = typo.fit_lines(str(it).upper(), MAXW - 110, fs, 34, 2)
            h = int(size * 1.05) * len(ls)
            self.text(str(n), int(84 * k), self.accent, y + h / 2, x=X0 + 30, start=st, anim="pop", name="number")
            for j, line in enumerate(ls):
                self.text(line, size, WHITE, y + size * 0.55 + j * size * 1.05, x=X0 + 100, anchor="lm", start=st,
                          name="item")
            y += max(h, 84 * k) + 30 * k

    def p_timeline(self, k):
        items = self.spec.get("items", [])[:4]
        y, lx = 0, X0 + 18
        gap = max(0.25, min(0.55, self.dur * 0.6 / max(len(items), 1)))
        first = None
        for n, it in enumerate(items):
            st = 0.15 + n * gap
            yr = int(62 * k)
            self.els.append({"k": "dot", "x": lx, "y": y + yr * 0.55, "r": 13, "start": st, "color": self.accent,
                             "box": (lx - 13, y, lx + 13, y + 26)})
            first = first if first is not None else y + yr * 0.55
            self.text(str(it.get("year", "")), yr, self.accent, y + yr * 0.55, x=lx + 50, anchor="lm", start=st,
                      name="year")
            h = self.block(str(it.get("text", "")), 46 * k, WHITE, y + yr * 1.1, max_w=MAXW - 70, lines=2,
                           x=lx + 50, anchor="lm", start=st + 0.05, name="item")
            last = y + yr * 0.55
            y += yr * 1.1 + h + 34 * k
        if items:
            self.els.insert(0, {"k": "line", "x0": lx, "x1": lx, "y": first, "y2": last, "start": 0.1, "w": 5,
                                "color": WHITE, "vertical": True, "box": (lx - 3, first, lx + 3, last)})

    def p_location(self, k):
        s = self.spec
        size = int(120 * k)
        self.els.append({"k": "icon", "name": "pin", "icon": "location-dot", "size": size, "x": W / 2,
                         "y": size / 2, "start": 0.0, "color": self.accent,
                         "box": (W / 2 - size / 2, 0, W / 2 + size / 2, size)})
        y = size + 16
        y += self.block(str(s.get("place", "")).upper(), 100 * k, WHITE, y, lines=2, start=0.15, name="place")
        if s.get("region"):
            y += self.block(str(s["region"]), 50 * k, self.accent, y + 6, lines=1, weight="medium", start=0.3,
                            name="region")
        if s.get("coords"):
            self.text(str(s["coords"]), 36 * k, SOFT, y + 30, weight="medium", start=0.4, spacing=3, name="coords")

    def p_quote(self, k):
        s = self.spec
        self.text("“", 150 * k, self.accent, 50 * k, anim="pop", name="quote mark")
        y = 125 * k
        y += self.block(str(s.get("text", "")), 58 * k, WHITE, y, lines=5, weight="italic", start=0.15, name="quote")
        if s.get("by"):
            self.text("— " + str(s["by"]), 40 * k, self.accent, y + 34, weight="medium", start=0.4, name="by")

    def p_icons(self, k):
        s = self.spec
        items = s.get("items", [])[:4]
        n = max(len(items), 1)
        y = 0
        if s.get("title"):
            y += self.block(str(s["title"]).upper(), 68 * k, self.accent, y, lines=2, name="title") + 26
        size = int((170 if n <= 3 else 140) * k)
        col_w = MAXW / n
        stg = min(0.45, max(0.25, self.dur * 0.5 / n))
        for i, it in enumerate(items):
            cx = X0 + col_w * i + col_w / 2
            cy = y + size / 2
            st = 0.15 + i * stg
            self.els.append({"k": "icon", "name": "icon", "icon": it.get("icon", "question"), "size": size, "x": cx,
                             "y": cy, "start": st, "color": WHITE, "state": (it.get("state") or "").lower(),
                             "box": (cx - size / 2, cy - size / 2, cx + size / 2, cy + size / 2)})
            if it.get("label"):
                lab = str(it["label"]).upper()
                fs, _ = typo.fit_lines(lab, int(col_w - 12), int(42 * k), 26, 1)
                self.text(lab, fs, WHITE, cy + size / 2 + 34, x=cx, start=st + 0.15, name="icon label")

    # ------------------------------------------------------------ animation
    def frame(self, t: float) -> Image.Image:
        img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        for e in self.els:
            p = (t - e["start"]) / 0.3
            if p <= 0:
                continue
            a = ease_out(p)
            if e["k"] == "text":
                if e["anim"] == "pop":
                    paste(img, e["sp"], e["x"], e["y"], alpha=a, scale=0.82 + 0.18 * ease_back(p * 0.8),
                          anchor=e["anchor"])
                else:
                    paste(img, e["sp"], e["x"], e["y"] + 26 * (1 - a), alpha=a, anchor=e["anchor"])
            elif e["k"] == "line":
                q = ease_out((t - e["start"]) / 0.45)
                if e.get("vertical"):
                    d.line([(e["x0"], e["y"]), (e["x0"], e["y"] + (e["y2"] - e["y"]) * q)],
                           fill=(*e["color"], 200), width=e["w"])
                else:
                    cx = (e["x0"] + e["x1"]) / 2
                    half = (e["x1"] - e["x0"]) / 2 * q
                    d.line([(cx - half, e["y"]), (cx + half, e["y"])], fill=(*e["color"], 255), width=e["w"])
            elif e["k"] == "bar":
                q = ease_out((t - e["start"]) / 0.8)
                r = e["w"] / 2
                d.rounded_rectangle((e["x0"], e["y"] - r, e["x1"], e["y"] + r), r, fill=(255, 255, 255, int(55 * a)))
                xe = e["x0"] + (e["x1"] - e["x0"]) * e["frac"] * q
                if xe - e["x0"] > e["w"]:
                    d.rounded_rectangle((e["x0"], e["y"] - r, xe, e["y"] + r), r, fill=(*e["color"], 255))
            elif e["k"] == "dot":
                r = e["r"] * ease_back(p)
                d.ellipse((e["x"] - r - 4, e["y"] - r - 4, e["x"] + r + 4, e["y"] + r + 4), fill=(*typo.DARK, int(255 * a)))
                d.ellipse((e["x"] - r, e["y"] - r, e["x"] + r, e["y"] + r), fill=(*e["color"], int(255 * a)))
            elif e["k"] == "icon":
                sc = max(ease_back(p * 0.85), 0.01)
                sz = max(int(e["size"] * sc), 2)
                ic = _icon(e["icon"], sz, tuple(e["color"]))
                if ic is not None:
                    sh = _icon(e["icon"], sz, (0, 0, 0))
                    shc = sh.copy()
                    shc.putalpha(shc.getchannel("A").point(lambda v: int(v * 0.55 * a)))
                    img.alpha_composite(shc, (int(e["x"] - sz / 2 + 5), int(e["y"] - sz / 2 + 8)))
                    icc = ic.copy() if a < 1 else ic
                    if a < 1:
                        icc.putalpha(icc.getchannel("A").point(lambda v: int(v * a)))
                    img.alpha_composite(icc, (int(e["x"] - sz / 2), int(e["y"] - sz / 2)))
                    d = ImageDraw.Draw(img)
                st = e.get("state")
                sk = ease_out((t - e["start"] - 0.4) / 0.2)
                cx, cy, size = e["x"], e["y"], e["size"]
                if st in ("no", "x") and sk > 0:
                    r = size * 0.55 * sk
                    for off, col in ((4, (0, 0, 0)), (0, RED)):
                        d.line([(cx - r + off, cy - r + off), (cx + r + off, cy + r + off)], fill=col, width=16)
                        d.line([(cx + r + off, cy - r + off), (cx - r + off, cy + r + off)], fill=col, width=16)
                elif st in ("yes", "check") and sk > 0:
                    r = size * 0.5 * sk
                    d.line([(cx - r, cy), (cx - r / 3, cy + r * 2 / 3), (cx + r, cy - r * 2 / 3)], fill=GREEN,
                           width=18, joint="curve")
        return img


def render_layer(cfg: dict, spec: dict, dur: float, out: Path, full: bool = False, static: bool = False) -> Path:
    """Encode an animated transparent overlay (.mov, PNG codec with alpha) + its layout report (.layout.json)."""
    ov = Overlay(cfg, spec, dur)
    out.with_suffix(".layout.json").write_text(json.dumps(ov.report(), ensure_ascii=False), encoding="utf-8")
    frames = max(int(round(dur * FPS)), 1)
    cmd = [ffmpeg_bin(), "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "png", "-pix_fmt", "rgba", str(out)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    last_start = max([e["start"] for e in ov.els] or [0])
    settle = last_start + 0.9  # after this nothing moves any more: reuse the last frame
    last = None
    for f in range(frames):
        t = 99.0 if static else f / FPS
        if last is None or (not static and t < settle):
            last = ov.frame(t).tobytes()
        proc.stdin.write(last)
    proc.stdin.close()
    err = proc.stderr.read().decode(errors="ignore")
    if proc.wait() != 0:
        raise RuntimeError("FFmpeg (animated layer) failed: " + err[-1500:])
    return out


def still(cfg: dict, spec: dict, dur: float = 3.0) -> tuple[Image.Image, dict]:
    """Final-state frame + layout report (used by the draft QC before the full render)."""
    ov = Overlay(cfg, spec, dur)
    return ov.frame(99.0), ov.report()
