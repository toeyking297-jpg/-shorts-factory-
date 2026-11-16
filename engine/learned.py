"""What the analyst learned from real results, as small bounded settings the producer applies.

memory/learned.json (written only by engine/analyst.py):
  {"version": 3, "updated": "...", "changes": [
     {"id": "c7", "date": "...", "kind": "format_weight", "key": "versus", "value": 1.3, "why": "...",
      "baseline": {...}, "status": "active" | "rolled_back" | "disabled"}, ...]}
memory/overrides.json (written by the owner from the dashboard): {"disabled": ["c7"]}

Everything here has hard limits so one noisy week can never wreck the channel.
"""
from __future__ import annotations

from .common import MEMORY, read_json

LIMITS = {"format_weight": (0.5, 2.0), "words_min": (80, 120), "words_max": (110, 150), "scene_max_s": (3.0, 6.0)}


def active_changes() -> list[dict]:
    data = read_json(MEMORY / "learned.json", {}) or {}
    off = set((read_json(MEMORY / "overrides.json", {}) or {}).get("disabled", []))
    return [c for c in data.get("changes", []) if c.get("status") == "active" and c.get("id") not in off]


def settings() -> dict:
    s = {"format_weights": {}, "writer_notes": [], "words_target": None}
    wmin = wmax = None
    for c in active_changes():
        k = c.get("kind")
        if k == "format_weight":
            lo, hi = LIMITS["format_weight"]
            s["format_weights"][c["key"]] = max(lo, min(hi, float(c.get("value", 1))))
        elif k == "writer_note" and c.get("value"):
            s["writer_notes"].append(str(c["value"])[:300])
        elif k == "words_min":
            wmin = max(LIMITS["words_min"][0], min(LIMITS["words_min"][1], int(c["value"])))
        elif k == "words_max":
            wmax = max(LIMITS["words_max"][0], min(LIMITS["words_max"][1], int(c["value"])))
    if wmin or wmax:
        s["words_target"] = [wmin or 90, wmax or 140]
    s["writer_notes"] = s["writer_notes"][-6:]
    return s
