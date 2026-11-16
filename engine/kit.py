"""Upload kit: everything the owner copies into YouTube / TikTok / Reels, plus the clip's QC status.

Writes final/<EP>.json (read by the dashboard), final/<EP>_upload.md (human readable) and the Shorts cover.
"""
from __future__ import annotations

import datetime as dt
import json
import re
from pathlib import Path

from . import facts as factsmod
from .common import FINAL, MEMORY, load_config, log, read_json, write_json

PLAYLISTS = {"map_explains": "Maps That Explain", "versus": "Versus", "myth_vs_fact": "Myth vs Fact",
             "three_things": "3 Things You Didn't Know", "shock_fact": "Strange But True"}


def post_times() -> list[dict]:
    """Configured US Eastern slots converted to Thailand time (handles US daylight saving)."""
    out = []
    try:
        from zoneinfo import ZoneInfo
        et, th = ZoneInfo("America/New_York"), ZoneInfo("Asia/Bangkok")
    except Exception:  # noqa: BLE001
        return [{"et": hm, "th": ""} for hm in load_config()["production"].get("post_times_et", [])]
    day = dt.date.today() + dt.timedelta(days=1)
    for hm in load_config()["production"].get("post_times_et", ["08:00", "12:30", "19:00"]):
        h, m = map(int, hm.split(":"))
        t = dt.datetime(day.year, day.month, day.day, h, m, tzinfo=et).astimezone(th)
        out.append({"et": hm, "th": f"{t:%H:%M}"})
    return out


def series_number(ep_name: str) -> int:
    """Stable running number for the channel's series (#1, #2, ...), assigned once per episode."""
    p = MEMORY / "series.json"
    data = read_json(p, {"next": 1, "episodes": {}}) or {"next": 1, "episodes": {}}
    if ep_name not in data["episodes"]:
        data["episodes"][ep_name] = data["next"]
        data["next"] += 1
        write_json(p, data)
    return data["episodes"][ep_name]


def build(ep: Path) -> dict:
    cfg = load_config()
    script = read_json(ep / "script.json")
    credits = read_json(ep / "build" / "credits.json", [])
    report = read_json(ep / "build" / "report.json", {}) or {}
    meta = script.get("meta", {})
    n = series_number(ep.name)
    series = f"{cfg['channel_name'].title()} #{n}"
    titles = [meta.get("title", "")] + [t for t in meta.get("title_options", []) if t != meta.get("title")]
    titles = [t for t in dict.fromkeys(titles) if t][:3]
    tags = meta.get("hashtags", []) or ["shorts"]
    hashtags = " ".join(f"#{t.lstrip('#')}" for t in tags)
    srcs = factsmod.sources_block(script)
    blob = json.dumps(script)
    credit_lines = [f"{c['credit']} {c.get('page', '')}".rstrip() for c in credits]
    if '"icons"' in blob:
        credit_lines.append("Icons: Font Awesome Free (CC BY 4.0) https://fontawesome.com")
    if '"map"' in blob:
        credit_lines.append("Earth imagery: NASA Blue Marble (public domain). Borders: Natural Earth (public domain)")
    desc = [meta.get("description", "").strip(), "", series]
    if srcs:
        desc += ["", "Sources:"] + [f"- {s}" for s in srcs]
    if credit_lines:
        desc += ["", "Footage & images:"] + [f"- {c}" for c in credit_lines]
    desc += ["", hashtags]
    description = "\n".join(desc).strip()
    social_caption = f"{titles[0] if titles else script.get('topic', '')} {hashtags}".replace("#shorts", "").strip()
    kit = {
        "episode": ep.name, "video": f"{ep.name}.mp4", "cover": f"{ep.name}_cover.jpg",
        "topic": script.get("topic", ""), "format": script.get("format", ""), "series": series, "series_no": n,
        "playlist": PLAYLISTS.get(script.get("format", ""), "Strange But True"),
        "titles": titles, "description": description, "hashtags": hashtags, "tags": meta.get("tags", []),
        "pinned_comment": meta.get("pinned_comment") or "Did you know this before? Tell me below.",
        "cover_text": meta.get("cover_text", ""),
        "social": {"tiktok": social_caption + " #fyp", "reels": social_caption, "facebook": social_caption},
        "post_times": post_times(),
        "status": report.get("status", "needs_review"), "status_th": report.get("status_th", "ต้องดูก่อน"),
        "reasons_th": report.get("reasons_th", []), "categories": report.get("categories", {}),
        "duration": report.get("duration"), "loop": bool(script.get("loop")),
        "facts": [{k: f.get(k) for k in ("claim", "value", "source", "source_name")} for f in script.get("facts", [])],
        "made": dt.datetime.now().isoformat(timespec="minutes"),
        "metrics": report.get("metrics", {}),
        "checklist": ["'Altered or synthetic content': NO for real footage + AI voice; YES only if realistic AI-made "
                      "people/places/events are shown"],
    }
    FINAL.mkdir(exist_ok=True)
    write_json(FINAL / f"{ep.name}.json", kit)
    md = [f"# {ep.name}  ({series})", "", f"**Status: {kit['status_th']}**"]
    if kit["reasons_th"]:
        md += [""] + [f"- {r}" for r in kit["reasons_th"]]
    md += ["", "## Titles (pick one)"] + [f"{i + 1}. {t}" for i, t in enumerate(titles)]
    md += ["", "## Description", description, "", "## Pinned comment", kit["pinned_comment"], "",
           "## Tags", ", ".join(kit["tags"]), "", f"## Playlist: {kit['playlist']}", "",
           "## TikTok / Reels / Facebook caption", kit["social"]["tiktok"], "",
           "## Best times to post (Thailand time)",
           " / ".join(f"{p['th']} (New York {p['et']})" for p in kit["post_times"]), "",
           "## Checklist", *[f"- [ ] {c}" for c in kit["checklist"]], ""]
    (ep / "upload.md").write_text("\n".join(md), encoding="utf-8")
    (FINAL / f"{ep.name}_upload.md").write_text("\n".join(md), encoding="utf-8")
    try:
        from . import cover
        cover.make(ep)
    except Exception as e:  # noqa: BLE001  cover is a bonus, never block the episode
        log(f"cover skipped: {e}")
    log(f"upload kit -> {FINAL / (ep.name + '.json')}")
    return kit


def clip_record(ep: Path) -> dict:
    """Compact, committed record of what is in the clip (scene timeline), for analytics + the analyst."""
    script = read_json(ep / "script.json")
    t = read_json(ep / "build" / "timings.json", {}) or {}
    report = read_json(ep / "build" / "report.json", {}) or {}
    kit = read_json(FINAL / f"{ep.name}.json", {}) or {}
    scenes = []
    for i, sc in enumerate(script.get("scenes", [])):
        tm = (t.get("scenes") or [{}] * (i + 1))[i] if i < len(t.get("scenes", [])) else {}
        v = sc.get("visual", {})
        scenes.append({"i": i, "start": tm.get("start"), "end": tm.get("end"), "text": sc.get("text", ""),
                       "kind": "map" if v.get("type") == "map" else (v.get("_kind") or v.get("type")),
                       "overlay": (sc.get("overlay") or {}).get("type"), "media": v.get("_media_id")})
    rec = {"episode": ep.name, "topic": script.get("topic", ""), "format": script.get("format", ""),
           "title": script.get("meta", {}).get("title", ""), "titles": kit.get("titles", []),
           "hook": (script.get("scenes") or [{}])[0].get("text", ""), "words": sum(len(s["text"].split())
                                                                                  for s in script.get("scenes", [])),
           "duration": report.get("duration"), "loop": bool(script.get("loop")), "status": report.get("status"),
           "series_no": kit.get("series_no"), "date": dt.date.today().isoformat(), "scenes": scenes,
           "video_id": None, "video_confirmed": False}
    p = MEMORY / "clips" / f"{ep.name}.json"
    old = read_json(p, {}) or {}
    for k in ("video_id", "video_confirmed", "published", "decision"):   # never lose the owner's binding
        if old.get(k):
            rec[k] = old[k]
    write_json(p, rec)
    return rec


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:40]
