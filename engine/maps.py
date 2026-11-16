"""Animated maps from Natural Earth (public domain): zoom, highlighted countries, pins, routes.

Scene visual spec:
  {"type": "map",
   "focus": ["Singapore"],                 # countries to highlight (names, English)
   "context": ["Malaysia"],                # optional: second highlight colour
   "pins": [{"place": "Singapore", "lon": 103.8, "lat": 1.35}],   # lon/lat optional if place is a country
   "labels": true,                         # write country names on focus/context countries
   "route": [[72.8, 19.0], [95.3, 5.6], [103.8, 1.3], [121.5, 31.2]],   # optional animated route (lon, lat)
   "route_from": "FROM INDIA", "route_to": "TO CHINA",
   "title": "1965",                        # optional big text at the top
   "zoom": "in" | "out" | "none"}          # camera move (default "in")
"""
from __future__ import annotations

import functools
import json

import numpy as np
import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

from .common import ROOT, ffmpeg_bin, font_path, hex_to_rgb

W, H, FPS, SS = 1080, 1920, 30, 1.25
SHORT = {"United States of America": "USA", "United Kingdom": "UK", "United Arab Emirates": "UAE",
         "Democratic Republic of the Congo": "DR Congo", "Central African Republic": "CAR"}
DATA = ROOT / "assets" / "maps" / "countries_50m.json"
ALIASES = {"usa": "united states of america", "us": "united states of america", "america": "united states of america",
           "united states": "united states of america", "uk": "united kingdom", "britain": "united kingdom",
           "russia": "russia", "south korea": "south korea", "north korea": "north korea", "czechia": "czech republic"}

OCEAN, LAND, BORDER = (11, 22, 48), (58, 72, 100), (30, 42, 66)
FOCUS, CONTEXT, PIN = (47, 111, 214), (92, 120, 170), (255, 59, 48)


@functools.lru_cache(maxsize=1)
def countries() -> list[dict]:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    for c in data:
        polys = c["coords"] if c["type"] == "MultiPolygon" else [c["coords"]]
        c["rings"] = [np.asarray(poly[0], dtype=np.float64) for poly in polys if len(poly[0]) > 2]
        allp = np.concatenate(c["rings"])
        c["bbox"] = (allp[:, 0].min(), allp[:, 1].min(), allp[:, 0].max(), allp[:, 1].max())
        # "core" = rings near the main landmass (keeps Peninsular + Borneo Malaysia, drops Alaska/Hawaii for the USA)
        main = max(c["rings"], key=len)
        mc = main.mean(axis=0)
        core = [r for r in c["rings"] if np.hypot(*(r.mean(axis=0) - mc)) < 25]
        cp = np.concatenate(core)
        c["main_bbox"] = (cp[:, 0].min(), cp[:, 1].min(), cp[:, 0].max(), cp[:, 1].max())
        c["short"] = SHORT.get(c["name"], c["name"])
        c["keys"] = {str(k).lower() for k in [c["name"], *c["alt"]] if k}
    return data


def find(name: str) -> dict | None:
    n = ALIASES.get(name.lower().strip(), name.lower().strip())
    for c in countries():
        if n in c["keys"]:
            return c
    for c in countries():
        if any(n in k or k in n for k in c["keys"] if len(k) > 3):
            return c
    return None


def ease(x: float) -> float:
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


class Camera:
    def __init__(self, clon, clat, span):
        self.clon, self.clat, self.span = clon, clat, span  # span = degrees of latitude visible vertically
        self.k = (H * SS) / span
        self.coslat = math.cos(math.radians(clat))

    def xy(self, lon, lat):
        return (W * SS / 2 + (lon - self.clon) * self.coslat * self.k,
                H * SS * 0.46 - (lat - self.clat) * self.k)

    def xy_np(self, arr):
        return (W * SS / 2 + (arr[:, 0] - self.clon) * self.coslat * self.k,
                H * SS * 0.46 - (arr[:, 1] - self.clat) * self.k)

    def visible_bbox(self):
        half_lat = self.span * 0.6
        half_lon = half_lat * (W / H) / max(self.coslat, 0.2) + 2
        return self.clon - half_lon, self.clat - half_lat, self.clon + half_lon, self.clat + half_lat


def _plan(spec: dict) -> tuple:
    """Work out camera start/end from what must be visible."""
    pts = []
    for name in spec.get("focus", []) + spec.get("context", []):
        c = find(name)
        if c:
            b = c["main_bbox"]
            pts += [(b[0], b[1]), (b[2], b[3])]
    for p in spec.get("pins", []):
        ll = _pin_ll(p)
        if ll:
            pts.append(ll)
    pts += [tuple(p) for p in spec.get("route", [])]
    if not pts:
        pts = [(0, 20)]
    lons, lats = [p[0] for p in pts], [p[1] for p in pts]
    clon, clat = (min(lons) + max(lons)) / 2, (min(lats) + max(lats)) / 2
    cos = max(math.cos(math.radians(clat)), 0.2)
    span = max((max(lats) - min(lats)) * 1.6, (max(lons) - min(lons)) * cos * (H / W) * 1.25, 2.5)
    focus = spec.get("focus", [])
    if len(focus) == 1 and not spec.get("route") and not spec.get("context"):
        c = find(focus[0])
        b = c["main_bbox"] if c else None
        if b and (b[2] - b[0]) < 4 and c["label"][0] is not None:  # tiny country: centre on it, show neighbours
            clon, clat = c["label"]
            span = max(span, 9)
    span = min(span, 95)  # never zoom out to a tiny whole-world map
    if not spec.get("focus") and not spec.get("context") and not spec.get("route"):
        span = max(min(span, 60), 40)  # a lone pin in the ocean/desert: show the surrounding region
    zoom = spec.get("zoom", "in")
    start = min(span * (3.2 if zoom == "in" else 1.0), 110) if zoom != "out" else span
    end = span if zoom != "out" else min(span * 3.2, 110)
    return clon, clat, start, end


def _pin_ll(p: dict):
    if p.get("lon") is not None and p.get("lat") is not None:
        return float(p["lon"]), float(p["lat"])
    c = find(p.get("place", ""))
    if c and c["label"][0] is not None:
        return tuple(c["label"])
    return None


class MapPainter:
    def __init__(self, cfg: dict):
        self.font_file = font_path(cfg)
        self.accent = hex_to_rgb(cfg["style"].get("accent", "#FFD400"))

    @functools.lru_cache(maxsize=32)
    def font(self, size):
        return ImageFont.truetype(self.font_file, int(size * SS))

    def text(self, d, xy, s, size, fill, anchor="mm"):
        d.text(xy, s, font=self.font(size), fill=fill, anchor=anchor, stroke_width=int(6 * SS), stroke_fill=(0, 0, 0))

    def frame(self, spec: dict, t: float, dur: float, plan: tuple) -> Image.Image:
        clon, clat, s0, s1 = plan
        k = ease(t / max(min(dur * 0.75, 3.0), 0.5))
        span = math.exp(math.log(s0) + (math.log(s1) - math.log(s0)) * k)
        cam = Camera(clon, clat, span)
        img = Image.new("RGB", (int(W * SS), int(H * SS)), OCEAN)
        d = ImageDraw.Draw(img)
        vb = cam.visible_bbox()
        focus = {find(n)["name"] for n in spec.get("focus", []) if find(n)}
        context = {find(n)["name"] for n in spec.get("context", []) if find(n)}
        hl = ease((t - 0.25) / 0.5)
        for c in countries():
            b = c["bbox"]
            if b[2] < vb[0] or b[0] > vb[2] or b[3] < vb[1] or b[1] > vb[3]:
                continue
            col = LAND
            if c["name"] in focus:
                col = tuple(int(LAND[i] + (FOCUS[i] - LAND[i]) * hl) for i in range(3))
            elif c["name"] in context:
                col = tuple(int(LAND[i] + (CONTEXT[i] - LAND[i]) * hl) for i in range(3))
            for ring in c["rings"]:
                rx, ry = cam.xy_np(ring)
                if rx.max() < 0 or rx.min() > W * SS or ry.max() < 0 or ry.min() > H * SS:
                    continue
                if (rx.max() - rx.min()) < 1.5 and (ry.max() - ry.min()) < 1.5:
                    continue
                d.polygon(np.column_stack((rx, ry)).ravel().tolist(), fill=col, outline=BORDER,
                          width=max(int(1.5 * SS), 1))
        # route (dotted line drawn progressively + moving head)
        route = spec.get("route", [])
        if len(route) >= 2:
            pts = [cam.xy(*p) for p in route]
            segs = [math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]
            total = sum(segs) or 1
            prog = ease((t - 0.4) / max(dur * 0.6, 0.8)) * total
            walked, head = 0.0, pts[0]
            for i, L in enumerate(segs):
                a, b = pts[i], pts[i + 1]
                n = max(int(L / (14 * SS)), 1)
                for j in range(n):
                    pos = walked + L * j / n
                    if pos > prog:
                        break
                    x = a[0] + (b[0] - a[0]) * j / n
                    y = a[1] + (b[1] - a[1]) * j / n
                    if j % 2 == 0:
                        d.ellipse((x - 3 * SS, y - 3 * SS, x + 3 * SS, y + 3 * SS), fill=(*self.accent,))
                    head = (x, y)
                walked += L
                if walked > prog:
                    break
            d.ellipse((head[0] - 9 * SS, head[1] - 9 * SS, head[0] + 9 * SS, head[1] + 9 * SS), fill=(255, 255, 255),
                      outline=(0, 0, 0), width=int(3 * SS))
            if spec.get("route_from") and t > 0.4:
                self.text(d, (pts[0][0], pts[0][1] - 40 * SS), spec["route_from"].upper(), 38, (255, 255, 255))
            if spec.get("route_to") and prog >= total * 0.98:
                self.text(d, (pts[-1][0], pts[-1][1] - 40 * SS), spec["route_to"].upper(), 38, (255, 255, 255))
        # labels on highlighted countries
        if spec.get("labels", True) and hl > 0.6:
            for name in list(focus) + list(context):
                c = find(name)
                if c and c["label"][0] is not None:
                    x, y = cam.xy(*c["label"])
                    pinned = any((p.get("place") or "").lower() in c["keys"] for p in spec.get("pins", []))
                    if not pinned and 0 < x < W * SS and 0 < y < H * SS:
                        self.text(d, (x, y), c["short"].upper(), 44, (255, 255, 255))
        # pins with pulsing glow
        for i, p in enumerate(spec.get("pins", [])):
            ll = _pin_ll(p)
            if not ll:
                continue
            pk = ease((t - 0.5 - 0.25 * i) / 0.3)
            if pk <= 0:
                continue
            x, y = cam.xy(*ll)
            r = (26 + 10 * math.sin(t * 5)) * SS * pk
            pad = int(r * 3)
            glow = Image.new("RGBA", (pad * 2, pad * 2), (0, 0, 0, 0))
            ImageDraw.Draw(glow).ellipse((pad - r * 1.8, pad - r * 1.8, pad + r * 1.8, pad + r * 1.8), fill=(*PIN, 110))
            glow = glow.filter(ImageFilter.GaussianBlur(10 * SS))
            img.paste(glow, (int(x - pad), int(y - pad)), glow)
            d = ImageDraw.Draw(img)
            d.ellipse((x - r * 0.75, y - r * 0.55, x + r * 0.75, y + r * 0.55), fill=PIN)
            if p.get("label", p.get("place")):
                self.text(d, (x, y + 60 * SS), str(p.get("label", p.get("place"))).upper(), 48, self.accent)
        if spec.get("title"):
            a = ease(t / 0.3)
            col = tuple(int(v * a + OCEAN[i] * (1 - a)) for i, v in enumerate(self.accent))
            size = 120
            while size > 50 and d.textlength(spec["title"], font=self.font(size)) > (W - 140) * SS:
                size -= 6
            self.text(d, (W * SS / 2, 330 * SS), spec["title"], size, col)
        return img.resize((W, H), Image.LANCZOS)


def render(cfg: dict, spec: dict, dur: float, out: Path, static: bool = False) -> Path:
    """Render a map scene straight to an H.264 clip (no audio)."""
    mp = MapPainter(cfg)
    plan = _plan(spec)
    frames = max(int(round(dur * FPS)), 1)
    cmd = [ffmpeg_bin(), "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "19",
           "-pix_fmt", "yuv420p", "-r", str(FPS), "-an", str(out)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    for f in range(frames):
        t = (dur if static else f / FPS)
        proc.stdin.write(mp.frame(spec, t, dur, plan).tobytes())
    proc.stdin.close()
    err = proc.stderr.read().decode(errors="ignore")
    if proc.wait() != 0:
        raise RuntimeError("FFmpeg (map) failed: " + err[-1500:])
    return out
