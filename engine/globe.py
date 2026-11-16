"""Documentary-style animated maps on a 3D globe (orthographic projection over NASA Blue Marble imagery).

Why a globe: it never cuts the Pacific in half, the curve of the Earth shows real distance, and a camera that
turns and dives toward the place is the strongest possible opening shot. All labels are typography only
(no boxes) and are placed by typo.Layout, so they never touch each other, the headline, the captions or the
app buttons. Numbers on maps (distances) are static values from the script's facts.

Scene visual spec (all keys optional except type):
  {"type": "map",
   "focus": ["Australia"],               # highlighted countries (bright, yellow glowing edge, rest dimmed)
   "context": ["Malaysia"],              # secondary countries (white outline)
   "pins": [{"label": "Point Nemo", "lon": -123.39, "lat": -48.88}, {"place": "Singapore"}],
   "route": [[121.47, 31.23], [-118.24, 33.94]],     # [lon, lat] points, drawn along the Earth's curve
   "route_from": "Shanghai", "route_to": "Los Angeles", "vehicle": "ship" | "plane",
   "distance": {"from": [-123.39, -48.88], "to": [-124.79, -24.68], "label": "1,670 MI"},
   "ring": {"center": [-123.39, -48.88], "radius_km": 2688},          # dashed circle of that real radius
   "compare": {"shape": "USA48", "onto": "Australia", "label": "USA (LOWER 48)"},   # true-size overlay
   "headline": "1,670 MILES FROM LAND", "kicker": "NEAREST LAND",    # top typography ("title" also accepted)
   "zoom": "in" | "out" | "none"}
"""
from __future__ import annotations

import functools
import json
import math
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from . import typo
from .common import ROOT, ffmpeg_bin, hex_to_rgb, log
from .maps import countries, find

W, H, FPS = 1080, 1920, 30
SS = 2                      # vector layer supersampling (smooth lines)
EARTH_KM = 6371.0
CX, CY = W / 2, 800         # where the subject sits on screen (between headline and captions)
FIT_W, FIT_H = 430, 390     # half-size of the box the subject must fit in
WHITE, SOFT_BLUE = (255, 255, 255), (170, 200, 225)
OCEANS = [("PACIFIC OCEAN", -140, 5), ("PACIFIC OCEAN", 170, 20), ("ATLANTIC OCEAN", -35, 20),
          ("ATLANTIC OCEAN", -15, -25), ("INDIAN OCEAN", 78, -22), ("SOUTHERN OCEAN", 40, -62),
          ("SOUTHERN OCEAN", -120, -63), ("ARCTIC OCEAN", 0, 84)]


# ---------------------------------------------------------------- texture
@functools.lru_cache(maxsize=1)
def texture() -> np.ndarray:
    t = np.asarray(Image.open(ROOT / "assets/maps/blue_marble_4k.jpg").convert("RGB"), dtype=np.float32) / 255
    w = np.asarray(Image.open(ROOT / "assets/maps/water_mask.png").convert("L").resize(
        (t.shape[1], t.shape[0]), Image.BILINEAR), dtype=np.float32)[..., None] / 255
    lum = t.mean(axis=2, keepdims=True)
    land = np.clip((t * 0.82 + lum * 0.18 - 0.04) * 1.12, 0, 1)
    land = np.where(land > 0.55, 0.55 + (land - 0.55) * 0.35, land)      # ice caps stop glaring
    lat = np.linspace(90, -90, t.shape[0], dtype=np.float32)[:, None, None]
    polar = 1 - 0.36 * np.clip((-lat - 58) / 10, 0, 1) - 0.12 * np.clip((lat - 55) / 15, 0, 1)
    land = land * polar
    ocean = t * np.array([0.60, 0.85, 1.0], dtype=np.float32) * 0.92
    return (land * (1 - w) + ocean * w).astype(np.float32)


def _sample(lon, lat):
    tex = texture()
    th, tw = tex.shape[:2]
    x = (lon + 180) / 360 * tw - 0.5
    y = (90 - lat) / 180 * th - 0.5
    x0 = np.floor(x).astype(np.int32)
    y0 = np.floor(y).astype(np.int32)
    fx = (x - x0)[..., None]
    fy = (y - y0)[..., None]
    x0m, x1m = x0 % tw, (x0 + 1) % tw
    y0c, y1c = np.clip(y0, 0, th - 1), np.clip(y0 + 1, 0, th - 1)
    a = tex[y0c, x0m] * (1 - fx) + tex[y0c, x1m] * fx
    b = tex[y1c, x0m] * (1 - fx) + tex[y1c, x1m] * fx
    return a * (1 - fy) + b * fy


# ---------------------------------------------------------------- geo helpers
def vec(lon, lat):
    lo, la = np.radians(lon), np.radians(lat)
    return np.stack([np.cos(la) * np.cos(lo), np.cos(la) * np.sin(lo), np.sin(la)], axis=-1)


def ll(v):
    v = v / np.linalg.norm(v, axis=-1, keepdims=True)
    return np.degrees(np.arctan2(v[..., 1], v[..., 0])), np.degrees(np.arcsin(np.clip(v[..., 2], -1, 1)))


def dist_km(a, b) -> float:
    return EARTH_KM * math.acos(float(np.clip(np.dot(vec(*a), vec(*b)), -1, 1)))


def gc_points(a, b, n=160):
    p1, p2 = vec(*a), vec(*b)
    om = math.acos(float(np.clip(np.dot(p1, p2), -1, 1)))
    if om < 1e-9:
        return np.array([a, b], float)
    t = np.linspace(0, 1, n)[:, None]
    v = (np.sin((1 - t) * om) * p1 + np.sin(t * om) * p2) / math.sin(om)
    lo, la = ll(v)
    return np.column_stack([lo, la])


def path_points(pts, per=1.5):
    """Great-circle path through several [lon, lat] points (dense)."""
    out = []
    for a, b in zip(pts, pts[1:]):
        n = max(8, int(dist_km(a, b) / 111 / per))
        seg = gc_points(a, b, n)
        out.append(seg if not out else seg[1:])
    return np.concatenate(out) if out else np.array(pts, float)


def dest(lon, lat, brg, d_km):
    la1, lo1 = np.radians(lat), np.radians(lon)
    b, d = np.radians(brg), np.asarray(d_km) / EARTH_KM
    la2 = np.arcsin(np.sin(la1) * np.cos(d) + np.cos(la1) * np.sin(d) * np.cos(b))
    lo2 = lo1 + np.arctan2(np.sin(b) * np.sin(d) * np.cos(la1), np.cos(d) - np.sin(la1) * np.sin(la2))
    return (np.degrees(lo2) + 540) % 360 - 180, np.degrees(la2)


def bearing(a, pts):
    lo1, la1 = np.radians(a[0]), np.radians(a[1])
    lo2, la2 = np.radians(pts[:, 0]), np.radians(pts[:, 1])
    y = np.sin(lo2 - lo1) * np.cos(la2)
    x = math.cos(la1) * np.sin(la2) - math.sin(la1) * np.cos(la2) * np.cos(lo2 - lo1)
    return np.degrees(np.arctan2(y, x))


def dists(a, pts):
    return EARTH_KM * np.arccos(np.clip(vec(pts[:, 0], pts[:, 1]) @ vec(*a), -1, 1))


@functools.lru_cache(maxsize=1)
def _all_rings():
    """Every country ring, densified where segments are long (straight borders follow the globe's curve)."""
    out = []
    for c in countries():
        for r in c["rings"]:
            out.append(_densify(r))
    return out


def _densify(r, step=1.0):
    r = np.asarray(r, float)
    a, b = r, np.roll(r, -1, axis=0)
    d = np.abs(b - a).max(axis=1)
    if (d <= step).all():
        return np.vstack([r, r[:1]])
    pts = []
    for p, q, dd in zip(a, b, d):
        if abs(q[0] - p[0]) > 180:
            pts.append(p[None])
            continue
        n = max(1, int(dd / step))
        t = (np.arange(n) / n)[:, None]
        pts.append(p + (q - p) * t)
    pts.append(r[:1])
    return np.vstack(pts)


def _pin_ll(p: dict):
    if p.get("lon") is not None and p.get("lat") is not None:
        return float(p["lon"]), float(p["lat"])
    c = find(str(p.get("place", "")))
    if c and c.get("label") and c["label"][0] is not None:
        return float(c["label"][0]), float(c["label"][1])
    return None


def _pt(v):
    """[lon, lat] list, or a place/country name."""
    if isinstance(v, (list, tuple)) and len(v) == 2:
        return float(v[0]), float(v[1])
    if isinstance(v, dict):
        return _pin_ll(v)
    if isinstance(v, str):
        return _pin_ll({"place": v})
    return None


def anchor_point(spec: dict):
    """The main place of a map spec (first pin, distance start, ring centre, route start, focus country)."""
    for p in spec.get("pins") or []:
        q = _pin_ll(p) if isinstance(p, dict) else None
        if q:
            return q
    for k, sub in (("distance", "from"), ("ring", "center")):
        if isinstance(spec.get(k), dict) and _pt(spec[k].get(sub)):
            return _pt(spec[k][sub])
    if spec.get("route"):
        q = _pt(spec["route"][0])
        if q:
            return q
    for n in spec.get("focus") or []:
        q = _pin_ll({"place": n})
        if q:
            return q
    return None


def usa48_rings():
    c = find("United States of America")
    out = []
    for r in c["rings"] if c else []:
        m = r.mean(axis=0)
        if -126 < m[0] < -66 and 24 < m[1] < 50 and len(r) > 30:
            out.append(r)
    return out


def shape_rings(name: str):
    if name.upper() in ("USA48", "USA", "US", "UNITED STATES", "LOWER 48", "CONTIGUOUS US"):
        return usa48_rings(), (-98.6, 39.3)
    c = find(name)
    if not c:
        return [], None
    main = max(c["rings"], key=len)
    core = [r for r in c["rings"] if np.hypot(*(r.mean(axis=0) - main.mean(axis=0))) < 25]
    pts = np.concatenate(core)
    v = vec(pts[:, 0], pts[:, 1]).mean(axis=0)
    lo, la = ll(v)
    return core, (float(lo), float(la))


# ---------------------------------------------------------------- camera
class Cam:
    def __init__(self, lon0, lat0, R, cx=CX, cy=CY):
        self.l0, self.p0 = math.radians(lon0), math.radians(lat0)
        self.lon0, self.lat0 = lon0, lat0
        self.R, self.cx, self.cy = R, cx, cy

    def fwd(self, lon, lat, s=1.0):
        lon, lat = np.radians(np.asarray(lon, float)), np.radians(np.asarray(lat, float))
        dl = lon - self.l0
        cosc = math.sin(self.p0) * np.sin(lat) + math.cos(self.p0) * np.cos(lat) * np.cos(dl)
        x = np.cos(lat) * np.sin(dl)
        y = math.cos(self.p0) * np.sin(lat) - math.sin(self.p0) * np.cos(lat) * np.cos(dl)
        return (self.cx + self.R * x) * s, (self.cy - self.R * y) * s, cosc

    def raster(self, scale: float = 1.0) -> np.ndarray:
        h, w = int(H * scale), int(W * scale)
        ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
        u = (xs - self.cx) / self.R
        v = -(ys - self.cy) / self.R
        rho = np.sqrt(u * u + v * v)
        inside = rho < 1
        rr = np.where(inside, rho, 0.5)
        c = np.arcsin(np.clip(rr, 0, 1))
        sc, cc = np.sin(c), np.cos(c)
        sp, cp = math.sin(self.p0), math.cos(self.p0)
        lat = np.degrees(np.arcsin(np.clip(cc * sp + v * sc * cp / np.maximum(rr, 1e-9), -1, 1)))
        lon = np.degrees(self.l0 + np.arctan2(u * sc, rr * cp * cc - v * sp * sc))
        lon = (lon + 180) % 360 - 180
        col = _sample(lon, lat) * (0.30 + 0.70 * np.power(np.clip(cc, 0, 1), 0.55))[..., None]
        bg = _space() if scale == 1.0 else _space()[::int(round(1 / scale)), ::int(round(1 / scale))][:h, :w]
        return np.where(inside[..., None], (np.clip(col, 0, 1) * 255).astype(np.uint8), bg)

    def km_per_px(self):
        return EARTH_KM / self.R


@functools.lru_cache(maxsize=1)
def _space() -> np.ndarray:
    yy = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    bg = (np.array([7, 10, 20], np.float32) * (1 - yy) + np.array([3, 5, 10], np.float32) * yy) * np.ones((H, W, 3), np.float32)
    rng = np.random.default_rng(7)
    xs, ys, b = rng.integers(0, W, 700), rng.integers(0, H, 700), rng.uniform(50, 190, 700)
    bg[ys, xs] = b[:, None]
    return bg.astype(np.uint8)


def _center_of(points):
    v = vec(np.array([p[0] for p in points]), np.array([p[1] for p in points])).mean(axis=0)
    if np.linalg.norm(v) < 1e-6:
        return points[0]
    lo, la = ll(v)
    return float(lo), float(la)


def _fit_R(center, points, cap=60000.0):
    cam = Cam(center[0], center[1], 1.0, 0, 0)
    xs, ys, cc = cam.fwd(np.array([p[0] for p in points]), np.array([p[1] for p in points]))
    if (cc < 0.05).any():   # something on the far side: whole globe
        return 420.0
    mx, my = np.abs(xs).max(), np.abs(ys).max()
    R = min(FIT_W / max(mx, 1e-6), FIT_H / max(my, 1e-6))
    return float(min(max(R, 420.0), cap))


class MapScene:
    def __init__(self, cfg: dict, spec: dict, dur: float):
        self.spec, self.dur = spec, dur
        st = cfg.get("style", {})
        self.accent = hex_to_rgb(st.get("accent", "#FFD400"))
        self.focus = [c for c in (find(n) for n in spec.get("focus", []) or []) if c]
        self.context = [c for c in (find(n) for n in spec.get("context", []) or []) if c]
        self.pins = [(p, _pin_ll(p)) for p in spec.get("pins", []) or []]
        self.pins = [(p, q) for p, q in self.pins if q]
        self.route = [q for q in (_pt(p) for p in spec.get("route", []) or []) if q]
        self.distance = None
        dsp = spec.get("distance")
        if isinstance(dsp, dict) and _pt(dsp.get("from")) and _pt(dsp.get("to")):
            self.distance = (_pt(dsp["from"]), _pt(dsp["to"]), str(dsp.get("label", "")))
        self.ring = None
        rsp = spec.get("ring")
        if isinstance(rsp, dict) and _pt(rsp.get("center")) and rsp.get("radius_km"):
            c = _pt(rsp["center"])
            lo, la = dest(c[0], c[1], np.linspace(0, 360, 241), float(rsp["radius_km"]))
            self.ring = np.column_stack([lo, la])
        self.cmp = None
        csp = spec.get("compare")
        if isinstance(csp, dict) and csp.get("shape") and csp.get("onto"):
            src, sc = shape_rings(str(csp["shape"]))
            onto = find(str(csp["onto"]))
            _, oc = shape_rings(str(csp["onto"])) if onto else ([], None)
            if src and sc and oc:
                moved = []
                for r in src:
                    r = _densify(r, 0.5)
                    lo, la = dest(oc[0], oc[1], bearing(sc, r), dists(sc, r))
                    moved.append(np.column_stack([lo, la]))
                self.cmp = (moved, str(csp.get("label", csp["shape"])).upper(), oc)
                if onto not in self.focus:
                    self.focus.append(onto)
        self._plan()
        self.layout = typo.Layout()
        self.labels: list = []   # (sprite, x, y, anchor, leader_from)
        self._static_vec = None
        self._final_raster = None

    # ------------------------------------------------------------ camera plan
    def _must_show(self):
        pts = []
        for c in self.focus + self.context:
            b = c.get("main_bbox") or c["bbox"]
            pts += [(b[0], b[1]), (b[2], b[3]), (b[0], b[3]), (b[2], b[1])]
        pts += [q for _, q in self.pins]
        pts += self.route
        if self.distance:
            pts += [self.distance[0], self.distance[1]]
        if self.ring is not None:
            pts += [tuple(p) for p in self.ring[::20]]
        if self.cmp:
            for r in self.cmp[0]:
                pts += [tuple(p) for p in r[:: max(1, len(r) // 12)]]
        return pts

    def _plan(self):
        c = _pt(self.spec.get("center")) if self.spec.get("center") else None
        pts = self._must_show() or ([c] if c else [(0.0, 20.0)])
        if self.route and len(self.route) >= 2:
            pts = pts + [tuple(p) for p in path_points(self.route)[::10]]
        center = _center_of(pts)
        R = _fit_R(center, pts)
        alone = not (self.focus or self.context or self.route or self.distance or self.ring is not None or self.cmp)
        if self.spec.get("_fallback"):
            alone, R = False, 900.0
        if alone:           # a lone pin: the globe with the pin on it (where on Earth is this?)
            R = 640.0
        if len(self.focus) == 1 and not (self.route or self.cmp):
            R = min(R, 3200.0)      # tiny country: keep neighbours in view
        if self.route and len(self.route) >= 2:
            span = dist_km(self.route[0], self.route[-1])
            if span > 4000:   # long route: look from the equator side so the arc visibly curves
                center = (center[0], center[1] - math.copysign(min(22.0, span / 500), center[1] or 1))
                R = _fit_R(center, pts)
            R *= 0.92
        self.end = (center[0], center[1], R)
        zoom = self.spec.get("zoom", "in")
        if zoom == "in":
            self.start = ((center[0] - 38 + 540) % 360 - 180, center[1] * 0.35, 430.0)
        elif zoom == "out":
            self.start = (center[0], center[1], min(R * 3.0, 9000.0))
        else:   # no camera move: settled from the first frame (render.py adds a gentle push-in)
            self.start = self.end
        self.move = min(max(self.dur * 0.6, 0.8), 2.2) if zoom != "none" else 0.0

    def cam(self, t: float) -> Cam:
        k = min(max(t / self.move, 0.0), 1.0) if self.move > 0 else 1.0
        k = k * k * (3 - 2 * k) if self.spec.get("zoom", "in") != "none" else k
        (lo0, la0, r0), (lo1, la1, r1) = self.start, self.end
        v = vec(lo0, la0) * (1 - k) + vec(lo1, la1) * k
        lo, la = ll(v)
        R = math.exp(math.log(r0) + (math.log(r1) - math.log(r0)) * k)
        return Cam(float(lo), float(la), R)

    # ------------------------------------------------------------ drawing
    def _line(self, d, cam, pts, color, width, dash=None, progress=1.0, min_c=0.0):
        x, y, c = cam.fwd(pts[:, 0], pts[:, 1], SS)
        n = max(2, int(len(pts) * progress))
        x, y, c = x[:n], y[:n], c[:n]
        runs, cur = [], []
        for xi, yi, ci in zip(x, y, c):
            if ci > min_c:
                cur.append((float(xi), float(yi)))
            elif cur:
                runs.append(cur)
                cur = []
        if cur:
            runs.append(cur)
        for run in runs:
            if len(run) < 2:
                continue
            if dash:
                acc, on, seg = 0.0, True, [run[0]]
                for a, b in zip(run, run[1:]):
                    acc += math.dist(a, b)
                    seg.append(b)
                    if acc > dash * SS:
                        if on and len(seg) > 1:
                            d.line(seg, fill=color, width=int(width * SS))
                        on, acc, seg = not on, 0.0, [b]
                if on and len(seg) > 1:
                    d.line(seg, fill=color, width=int(width * SS))
            else:
                d.line(run, fill=color, width=int(width * SS), joint="curve")
        return runs

    def _vector(self, cam: Cam, t: float, settled: bool) -> Image.Image:
        lay = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
        d = ImageDraw.Draw(lay)
        a_b = 60 if cam.R < 1500 else 85
        for r in _all_rings():
            if len(r) < 3:
                continue
            self._line(d, cam, r, (255, 255, 255, a_b), 0.6 if cam.R < 900 else 0.9, min_c=0.02)
        for c in self.context:
            for r in c["rings"]:
                self._line(d, cam, _densify(r), (255, 255, 255, 230), 2.5, min_c=0.02)
        reveal = 1.0 if settled else 0.0
        if self.ring is not None:
            self._line(d, cam, self.ring, (255, 255, 255, int(210 * reveal)), 2.5, dash=12)
        if self.cmp:
            for r in self.cmp[0]:
                self._line(d, cam, r, (255, 255, 255, int(240 * reveal)), 3.5, dash=11)
        return lay

    def _focus_fx(self, base: Image.Image, cam: Cam, amount: float) -> Image.Image:
        if not self.focus or amount <= 0:
            return base
        mask = Image.new("L", (W, H), 0)
        md = ImageDraw.Draw(mask)
        for c in self.focus:
            for r in c["rings"]:
                x, y, cc = cam.fwd(r[:, 0], r[:, 1])
                if (cc > 0).all() and len(r) > 2:
                    md.polygon(list(zip(x.tolist(), y.tolist())), fill=255)
        dark = Image.blend(base, Image.new("RGBA", base.size, (0, 0, 0, 255)), 0.55 * amount)
        out = Image.composite(base, dark, mask)
        edge = mask.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.MaxFilter(3))
        glow = Image.new("RGBA", base.size, (*self.accent, 0))
        glow.putalpha(edge.filter(ImageFilter.GaussianBlur(9)).point(lambda v: int(min(255, v * 3) * amount)))
        out = Image.alpha_composite(out, glow)
        crisp = Image.new("RGBA", base.size, (*self.accent, 0))
        crisp.putalpha(edge.point(lambda v: int(v * amount)))
        return Image.alpha_composite(out, crisp)

    def _atmo(self, base: Image.Image, cam: Cam) -> Image.Image:
        if cam.R > 2500:
            return base
        g = Image.new("RGBA", base.size, (0, 0, 0, 0))
        r = cam.R
        ImageDraw.Draw(g).ellipse([cam.cx - r * 1.012, cam.cy - r * 1.012, cam.cx + r * 1.012, cam.cy + r * 1.012],
                                  outline=(120, 180, 255, 220), width=int(max(4, r * 0.016)))
        return Image.alpha_composite(base, g.filter(ImageFilter.GaussianBlur(max(4, r * 0.022))))

    # ------------------------------------------------------------ labels (final camera, collision-checked)
    def _plan_labels(self, cam: Cam):
        lay = self.layout
        self.labels = []
        head = self.spec.get("headline") or self.spec.get("title")
        kick = self.spec.get("kicker")
        y = 300
        if kick:
            txt = typo.clean(str(kick)).upper()
            sp = typo.sprite(txt, 34, self.accent, "medium", None, 5, True)
            self.labels.append({"sp": sp, "x": W / 2, "y": y, "anchor": "mm", "start": 0.0, "kind": "head"})
            lay.add("map kicker", typo.text_box(txt, 34, W / 2, y, "medium", 5))
            y += 62
        if head:
            size, lines = typo.fit_lines(typo.clean(str(head)).upper(), 880, 92, 40, 2)
            for ln in lines:
                sp = typo.sprite(ln, size, WHITE, "bold", None, 0, True)
                self.labels.append({"sp": sp, "x": W / 2, "y": y + size * 0.5, "anchor": "mm", "start": 0.05,
                                    "kind": "head"})
                tw, _ = typo.text_size(ln, typo.font(size))
                ih = typo.ink_height(ln, size)
                lay.add("map headline", (W / 2 - tw / 2, y + size * 0.5 - ih / 2, W / 2 + tw / 2, y + size * 0.5 + ih / 2))
                y += size * 1.04
        # reserve pins and route/ring/compare lines so labels avoid them
        for _, q in self.pins:
            x, yy, c = cam.fwd(q[0], q[1])
            if c > 0:
                lay.add("pin", (x - 22, yy - 22, x + 22, yy + 22), check=False)
        for pts in self._line_sets():
            x, yy, c = cam.fwd(pts[:, 0], pts[:, 1])
            for xi, yi, ci in list(zip(x, yy, c))[::4]:
                if ci > 0:
                    lay.add("line", (xi - 9, yi - 9, xi + 9, yi + 9), check=False)
        # distance label: next to the middle of its line
        if self.distance and self.distance[2]:
            mid = gc_points(self.distance[0], self.distance[1], 3)[1]
            x, yy, _ = cam.fwd(mid[0], mid[1])
            self._label(typo.clean(self.distance[2]).upper(), float(x), float(yy), 50, self.accent, leader=False,
                        offsets=[(-1, 0), (1, 0), (0, -1), (0, 1)])
        if self.cmp:
            oc = self.cmp[2]
            north = max(self.cmp[0], key=lambda r: r[:, 1].max())
            tip = north[np.argmax(north[:, 1])]
            x, yy, _ = cam.fwd(tip[0], tip[1])
            self._label(self.cmp[1], float(x), float(yy), 40, WHITE, offsets=[(0, -1), (1, -1), (-1, -1)])
        for i, (p, q) in enumerate(self.pins):
            lab = p.get("label", p.get("place"))
            if not lab:
                continue
            x, yy, c = cam.fwd(q[0], q[1])
            if c <= 0:
                continue
            self._label(typo.clean(str(lab)).upper(), float(x), float(yy), 44 if i == 0 else 36,
                        self.accent if i == 0 else WHITE, start=0.15 + 0.2 * i)
        if self.route:
            for txt, q in ((self.spec.get("route_from"), self.route[0]), (self.spec.get("route_to"), self.route[-1])):
                if txt:
                    x, yy, c = cam.fwd(q[0], q[1])
                    if c > 0:
                        self._label(typo.clean(str(txt)).upper(), float(x), float(yy), 38, WHITE, start=0.3)
        if self.spec.get("labels", True):
            for c in self.focus + self.context:
                if self.cmp and c is find(str(self.spec["compare"].get("onto"))):
                    lp = self.cmp[2]
                else:
                    lp = c.get("label")
                if not lp or lp[0] is None:
                    continue
                if any(c is find(str(p.get("place", ""))) for p, _ in self.pins):
                    continue
                x, yy, cc = cam.fwd(lp[0], lp[1])
                if cc <= 0.1:
                    continue
                big = c in self.focus
                self._label(c["short"].upper(), float(x), float(yy), 60 if big else 42,
                            self.accent if big else WHITE, offsets=[(0, 0), (0, -1), (0, 1), (1, 0), (-1, 0)],
                            leader=False, start=0.2)
        if cam.R < 2600 and not self.spec.get("_fallback"):
            for name, lo, la in OCEANS:
                x, yy, c = cam.fwd(lo, la)
                if c > 0.35 and 120 < x < W - 120 and 380 < yy < 1150:
                    box = typo.text_box(name, 30, float(x), float(yy), "italic", 8)
                    if lay.is_free(box, pad=14) and not self._on_land(cam, x, yy):
                        sp = typo.sprite(name, 30, SOFT_BLUE, "italic", 0, 8, False)
                        self.labels.append({"sp": sp, "x": float(x), "y": float(yy), "anchor": "mm", "start": 0.4,
                                            "kind": "ocean", "alpha": 0.85})
                        lay.add("ocean " + name, box, check=False)

    def _on_land(self, cam, x, y) -> bool:
        return False

    def _line_sets(self):
        out = []
        if self.route and len(self.route) >= 2:
            out.append(path_points(self.route))
        if self.distance:
            out.append(gc_points(self.distance[0], self.distance[1], 80))
        return out

    def _label(self, txt, ax, ay, size, color, offsets=None, leader=True, start=0.2):
        lay = self.layout
        f = typo.font(size)
        tw, _ = typo.text_size(txt, f)
        ih = typo.ink_height(txt, size)
        offsets = offsets or [(0, -1), (1, 0), (-1, 0), (0, 1), (1, -1), (-1, -1), (1, 1), (-1, 1)]
        for dist in (30, 60, 100, 150, 210):
            for ox, oy in offsets:
                cx = ax + ox * (dist + tw / 2 * abs(ox)) if ox else ax
                cy = ay + oy * (dist + ih / 2 * abs(oy)) if oy else ay
                box = (cx - tw / 2, cy - ih / 2, cx + tw / 2, cy + ih / 2)
                if lay.is_free(box, pad=10):
                    lay.add("label " + txt, box)
                    sp = typo.sprite(txt, size, color, "bold", None, 0, True)
                    lf = None
                    if leader and dist > 30:
                        lf = (ax, ay, min(max(ax, box[0]), box[2]), min(max(ay, box[1]), box[3]))
                    self.labels.append({"sp": sp, "x": cx, "y": cy, "anchor": "mm", "start": start, "kind": "label",
                                        "leader": lf})
                    return box
        lay.issues.append(f"map label '{txt}' has no free spot (left out)")
        return None

    # ------------------------------------------------------------ frames
    def _settled_layers(self):
        """Everything that no longer changes once the camera has stopped: drawn once, at full quality."""
        if getattr(self, "_layers", None) is not None:
            return self._layers
        cam = self.cam(self.move + 1)
        base = self._atmo(Image.fromarray(cam.raster()).convert("RGBA"), cam)
        base = self._focus_fx(base, cam, 1.0)
        base = Image.alpha_composite(base, self._vector(cam, 99, True).resize((W, H), Image.LANCZOS))
        if not getattr(self, "_planned", False):
            self._plan_labels(cam)
            self._planned = True
        L = {"base": base, "cam": cam}
        # route: full line (+ glow) and its screen path, revealed per frame with a cheap mask
        if self.route and len(self.route) >= 2:
            pts = path_points(self.route)
            full = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
            glow = Image.new("RGBA", full.size, (0, 0, 0, 0))
            self._line(ImageDraw.Draw(glow), cam, pts, (*self.accent, 150), 15)
            full = Image.alpha_composite(full, glow.filter(ImageFilter.GaussianBlur(7 * SS)))
            runs = self._line(ImageDraw.Draw(full), cam, pts, (*self.accent, 255), 5.5)
            dash = Image.new("RGBA", full.size, (0, 0, 0, 0))
            self._line(ImageDraw.Draw(dash), cam, pts, (255, 255, 255, 140), 2.5, dash=9)
            L["route"] = full.resize((W, H), Image.LANCZOS)
            L["route_dash"] = dash.resize((W, H), Image.LANCZOS)
            L["route_path"] = [(x / SS, y / SS) for run in runs for (x, y) in run]
        if self.distance:
            full = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
            runs = self._line(ImageDraw.Draw(full), cam, gc_points(self.distance[0], self.distance[1], 120),
                              (*self.accent, 255), 4.5)
            L["dist"] = full.resize((W, H), Image.LANCZOS)
            L["dist_path"] = [(x / SS, y / SS) for run in runs for (x, y) in run]
        # leader lines (fade in with their labels)
        lead = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
        ld = ImageDraw.Draw(lead)
        for lb in self.labels:
            lf = lb.get("leader")
            if lf:
                ld.line([(lf[0] * SS, lf[1] * SS), (lf[2] * SS, lf[3] * SS)], fill=(255, 255, 255, 200), width=2 * SS)
        L["leaders"] = lead.resize((W, H), Image.LANCZOS)
        self._layers = L
        return L

    @staticmethod
    def _reveal(layer, path, prog, width=46):
        if prog >= 0.999:
            return layer
        n = max(2, int(len(path) * prog))
        m = Image.new("L", (W, H), 0)
        if n >= 2:
            ImageDraw.Draw(m).line(path[:n], fill=255, width=width, joint="curve")
        out = layer.copy()
        out.putalpha(Image.composite(layer.getchannel("A"), Image.new("L", (W, H), 0), m))
        return out

    def frame(self, t: float) -> Image.Image:
        settled = t >= self.move
        L = self._settled_layers()
        tl = t - self.move  # time since the camera stopped
        if settled:
            cam = L["cam"]
            img = L["base"].copy()
        else:  # camera moving: fast half-resolution globe (motion hides it), 1x vector lines
            cam = self.cam(t)
            small = Cam(cam.lon0, cam.lat0, cam.R / 2, cam.cx / 2, cam.cy / 2)
            img = Image.fromarray(small.raster(scale=0.5)).resize((W, H), Image.BILINEAR).convert("RGBA")
            img = self._atmo(img, cam)
            k_hl = min(max((t - self.move * 0.7) / max(self.move * 0.3, 0.01), 0), 1)
            if k_hl > 0:
                img = self._focus_fx(img, cam, k_hl)
            vl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            dv = ImageDraw.Draw(vl)
            a_b = 60 if cam.R < 1500 else 85
            for r in _all_rings():
                x, y, c = cam.fwd(r[:, 0], r[:, 1])
                ok = c > 0.02
                if ok.sum() < 2:
                    continue
                if ok.all():
                    dv.line(list(zip(x.tolist(), y.tolist())), fill=(255, 255, 255, a_b), width=1)
                else:
                    idx = np.flatnonzero(ok)
                    for grp in np.split(idx, np.flatnonzero(np.diff(idx) > 1) + 1):
                        if len(grp) > 1:
                            dv.line(list(zip(x[grp].tolist(), y[grp].tolist())), fill=(255, 255, 255, a_b), width=1)
            img = Image.alpha_composite(img, vl)
        if settled:
            if "route" in L:
                span = max(self.dur - self.move - 0.4, 0.8)
                prog = 1 - (1 - min(max(tl / span, 0.0), 1.0)) ** 2
                if prog < 0.999:
                    img.alpha_composite(L["route_dash"])
                img.alpha_composite(self._reveal(L["route"], L["route_path"], prog))
                path = L["route_path"]
                n = max(2, int(len(path) * prog))
                if len(path) > 5:
                    self._vehicle(img, path[n - 1], path[max(n - 5, 0)])
            if "dist" in L:
                prog = 1 - (1 - min(max(tl / 0.7, 0), 1)) ** 3
                if prog > 0:
                    img.alpha_composite(self._reveal(L["dist"], L["dist_path"], prog))
            self._pins(img, cam, t, tl)
            a = min(max((tl - 0.15) / 0.3, 0), 1)
            if a > 0:
                lead = L["leaders"]
                if a < 1:
                    lead = lead.copy()
                    lead.putalpha(lead.getchannel("A").point(lambda v: int(v * a)))
                img.alpha_composite(lead)
            if self.spec.get("scalebar", True) and cam.R > 1100 and not self.cmp:
                self._scalebar(img, cam, min(max(tl / 0.4, 0), 1))
        for lb in self.labels:
            if lb["kind"] == "head":
                a = min(max((t - lb["start"]) / 0.3, 0), 1)
                typo.paste(img, lb["sp"], lb["x"], lb["y"] + 24 * (1 - a), alpha=a, anchor=lb["anchor"])
            elif settled:
                a = min(max((tl - lb["start"]) / 0.3, 0), 1) * lb.get("alpha", 1)
                if a > 0:
                    typo.paste(img, lb["sp"], lb["x"], lb["y"] + 14 * (1 - a), alpha=a, anchor=lb["anchor"])
        return img

    def _pins(self, img, cam, t, tl):
        """Pins: dark rim + solid dot; the main pin sends out two expanding rings. Drawn on small 2x patches."""
        for i, (p, q) in enumerate(self.pins):
            pk = min(max((tl - 0.1 * i) / 0.3, 0), 1)
            if pk <= 0:
                continue
            x, y, c = cam.fwd(q[0], q[1])
            if c <= 0:
                continue
            col = self.accent if i == 0 else WHITE
            P = 90
            patch = Image.new("RGBA", (P * 2 * SS, P * 2 * SS), (0, 0, 0, 0))
            d = ImageDraw.Draw(patch)
            o = P * SS
            r = (13 if i == 0 else 9) * SS * (0.6 + 0.4 * pk)
            if i == 0:
                for ph in (0.0, 0.5):
                    k = ((t * 0.9 + ph) % 1.0)
                    rr = r * (1.4 + 2.6 * k)
                    d.ellipse([o - rr, o - rr, o + rr, o + rr], outline=(*col, int(200 * (1 - k) * pk)), width=3 * SS)
            d.ellipse([o - r - 3 * SS, o - r - 3 * SS, o + r + 3 * SS, o + r + 3 * SS], fill=(*typo.DARK, int(255 * pk)))
            d.ellipse([o - r, o - r, o + r, o + r], fill=(*col, int(255 * pk)))
            patch = patch.resize((P * 2, P * 2), Image.LANCZOS)
            img.alpha_composite(patch, (int(x) - P, int(y) - P)) if 0 <= int(x) - P and int(x) + P <= W and \
                0 <= int(y) - P and int(y) + P <= H else img.paste(patch, (int(x) - P, int(y) - P), patch)

    def _vehicle(self, img, head, prev):
        name = self.spec.get("vehicle") or "ship"
        p = ROOT / "assets" / "icons" / f"{name}.png"
        if not p.exists():
            return
        size = 58
        ic = Image.open(p).getchannel("A").resize((size, size), Image.LANCZOS)
        solid = Image.new("RGBA", (size, size), (255, 255, 255, 255))
        solid.putalpha(ic)
        ang = -math.degrees(math.atan2(head[1] - prev[1], head[0] - prev[0]))
        if name == "ship":
            if abs(ang) > 90:
                solid = solid.transpose(Image.FLIP_LEFT_RIGHT)
                ang = ang - 180 if ang > 0 else ang + 180
            ang = max(min(ang, 25), -25)
        solid = solid.rotate(ang, resample=Image.BICUBIC, expand=True)
        sh = Image.new("RGBA", solid.size, (0, 0, 0, 0))
        sh.putalpha(solid.getchannel("A").point(lambda v: int(v * 0.8)))
        sh = sh.filter(ImageFilter.GaussianBlur(4))
        x, y = int(head[0] - solid.width / 2), int(head[1] - solid.height / 2)
        img.paste(sh, (x + 3, y + 5), sh)
        img.paste(solid, (x, y), solid)

    def _scalebar(self, img, cam, a):
        if a <= 0:
            return
        kmpp = cam.km_per_px()
        target = 170 * kmpp / 1.609     # miles that ~170 px represents
        nice = [10, 25, 50, 100, 200, 250, 500, 1000, 2000]
        miles = min(nice, key=lambda m: abs(m - target))
        px = miles * 1.609 / kmpp
        x0, y0 = 90, 1135
        box = (x0, y0 - 46, x0 + px, y0 + 12)
        if not self.layout.is_free(box, pad=4, ignore_reserved=True):
            return
        d = ImageDraw.Draw(img)
        al = int(255 * a)
        for w, col in ((7, (*typo.DARK, al)), (3, (255, 255, 255, al))):
            d.line([(x0, y0), (x0 + px, y0)], fill=col, width=w)
            for xx in (x0, x0 + px):
                d.line([(xx, y0 - 10), (xx, y0 + 10)], fill=col, width=w)
        typo.paste(img, typo.sprite(f"{miles:,} MI", 28, WHITE, "bold", None, 0, True), x0, y0 - 28, alpha=a,
                   anchor="lm")

    def report(self) -> dict:
        return {"type": "map", "issues": self.layout.issues,
                "boxes": [[n, list(b)] for n, b in self.layout.boxes if not n.startswith(("line", "pin"))]}


def render(cfg: dict, spec: dict, dur: float, out: Path, static: bool = False) -> Path:
    """Render a globe map scene straight to an H.264 clip (no audio) + .layout.json report."""
    ms = MapScene(cfg, spec, dur)
    frames = max(int(round(dur * FPS)), 1)
    cmd = [ffmpeg_bin(), "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
           "-pix_fmt", "yuv420p", "-r", str(FPS), "-an", str(out)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    t_off = (ms.move + 3.0) if static else 0.0   # loop opening: start already settled (frame 0 looks mid-video)
    for f in range(frames):
        proc.stdin.write(ms.frame(t_off + f / FPS).convert("RGB").tobytes())
    proc.stdin.close()
    err = proc.stderr.read().decode(errors="ignore")
    if proc.wait() != 0:
        raise RuntimeError("FFmpeg (map) failed: " + err[-1500:])
    out.with_suffix(".layout.json").write_text(json.dumps(ms.report(), ensure_ascii=False), encoding="utf-8")
    if ms.layout.issues:
        log(f"map layout: {'; '.join(ms.layout.issues[:3])}")
    return out


def still(cfg: dict, spec: dict, dur: float = 4.0) -> tuple[Image.Image, dict]:
    ms = MapScene(cfg, spec, dur)
    return ms.frame(ms.move + 2.5), ms.report()
