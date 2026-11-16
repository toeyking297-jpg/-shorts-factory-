"""Shared paths, JSON helpers, hashing and job state for the cartoon pipeline."""
from __future__ import annotations

import hashlib
import json
import re
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CART = ROOT / "cartoon"
BIBLE = CART / "bible"
ASSETS = CART / "assets"
PLACEHOLDER = ASSETS / "_placeholder"
STATE = CART / "state" / "jobs.json"
FONT_DIR = ROOT / "assets" / "fonts"
FONT = FONT_DIR / "Kanit-SemiBold.ttf"
FONT_BOLD = FONT_DIR / "Kanit-Bold.ttf"

STAGE_W, STAGE_H = 1188, 2112          # composition stage (1.1 x output) so camera moves never upscale
OUT_W, OUT_H, FPS = 1080, 1920, 30
STATUSES = ("PLANNED", "WAITING_FOR_ASSET", "READY", "RENDERING", "QA_FAILED", "COMPLETE")


def ep_dir(ep: str) -> Path:
    return CART / "episodes" / ep


def load(p: Path):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def save(p: Path, obj) -> Path:
    p = Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=1), encoding="utf-8")
    return p


def sha(*parts) -> str:
    h = hashlib.sha256()
    for x in parts:
        if isinstance(x, Path):
            h.update(x.read_bytes() if x.exists() else b"<missing>")
        else:
            h.update(json.dumps(x, ensure_ascii=False, sort_keys=True).encode())
    return h.hexdigest()[:16]


def hex_rgb(h: str, a: int = 255):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


# ---------- job state ----------
def state_get() -> dict:
    return load(STATE) if STATE.exists() else {"episodes": {}}


def step_set(ep: str, step: str, status: str, **info):
    st = state_get()
    e = st["episodes"].setdefault(ep, {"steps": {}})
    rec = e["steps"].setdefault(step, {})
    rec.update(info)
    rec["status"] = status
    rec["updated"] = time.strftime("%Y-%m-%dT%H:%M:%S%z")
    save(STATE, st)


def step_get(ep: str, step: str) -> dict:
    return state_get()["episodes"].get(ep, {}).get("steps", {}).get(step, {})


# ---------- timeline anchors ----------
_ANCH = re.compile(r"^(D\d+|SHOT)\.(start|end)\s*([+-]\s*\d*\.?\d+)?$")


def resolve(anchor, lines: dict, shot_start: float | None = None) -> float:
    """'D07.start+0.2' / 'SHOT.start+0.4' / number -> seconds."""
    if isinstance(anchor, (int, float)):
        return float(anchor)
    m = _ANCH.match(anchor.replace(" ", ""))
    if not m:
        raise ValueError(f"bad time anchor: {anchor}")
    who, edge, off = m.groups()
    off = float(off) if off else 0.0
    if who == "SHOT":
        if shot_start is None:
            raise ValueError("SHOT anchor needs shot_start")
        return shot_start + off
    ln = lines[who]
    return (ln["start"] if edge == "start" else ln["end"]) + off
