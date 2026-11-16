"""Learn from real results, bound by video_id (see analytics.py), compared at equal age.

Writes per-format scores (memory/format_scores.json) and a short summary (memory/performance.md) that the
writer reads before every batch. Uses 7-day views when YouTube Analytics is connected, otherwise public views
of clips that are at least 7 days old (so new clips are never compared with old ones).
"""
from __future__ import annotations

import datetime as dt
import statistics

from .common import MEMORY, log, read_json, write_json


def _views(c: dict) -> int | None:
    w = (c.get("windows") or {}).get("d7") or {}
    if w.get("views") is not None:
        return int(w.get("engagedViews") or w["views"])
    pub = c.get("published")
    if pub and (c.get("public") or {}).get("views") is not None:
        age = (dt.date.today() - dt.date.fromisoformat(pub[:10])).days
        if age >= 7:
            return int(c["public"]["views"])
    return None


def update() -> None:
    try:
        from . import analytics
        analytics.run()
    except Exception as e:  # noqa: BLE001
        log(f"analytics refresh skipped: {e}")
    summ = read_json(MEMORY / "analytics_summary.json", {}) or {}
    rated = [c for c in summ.get("clips", []) if c.get("video_id") and _views(c) is not None]
    history = read_json(MEMORY / "history.json", [])
    by_ep = {c["episode"]: c for c in rated}
    for h in history:
        c = by_ep.get(h.get("episode"))
        if c:
            h["views"] = _views(c)
            h["video_id"] = c["video_id"]
    write_json(MEMORY / "history.json", history)
    if not rated:
        log("performance: no published clips with 7-day data yet")
        return
    fmt: dict[str, list[int]] = {}
    for c in rated:
        fmt.setdefault(c.get("format") or "unknown", []).append(_views(c))
    scores = {f: {"avg_views": int(statistics.mean(v)), "median_views": int(statistics.median(v)), "videos": len(v)}
              for f, v in fmt.items()}
    write_json(MEMORY / "format_scores.json", scores)
    rated.sort(key=lambda c: -_views(c))
    med = statistics.median(_views(c) for c in rated)
    lines = [f"# Performance (updated {dt.date.today()}, {len(rated)} Shorts with 7-day data, median {int(med)} views)",
             "Write more like the TOP ones; avoid what the BOTTOM ones have in common.", "", "TOP:"]
    lines += [f"- {_views(c)} views | {c.get('format')} | title: {c.get('title')}" for c in rated[:5]]
    if len(rated) > 5:
        lines += ["", "BOTTOM:"] + [f"- {_views(c)} views | {c.get('format')} | title: {c.get('title')}"
                                    for c in rated[-3:]]
    (MEMORY / "performance.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    log(f"performance: {len(rated)} clip(s) with equal-age results")
