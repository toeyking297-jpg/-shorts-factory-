"""Real results per clip, bound by video_id (not by title), compared at the SAME age (first 2 days, first 7 days).

Two levels, both free:
  - public stats (YouTube Data API key): views / likes / comments. Always available.
  - YouTube Analytics API (read-only OAuth, set up once, see SETUP_ANALYTICS_TH.md): engaged views, average view
    duration and %, the retention curve (mapped onto our scenes), traffic sources, countries, age/gender, device,
    subscribers gained.

Binding: memory/clips/<EP>.json is the clip record. The owner confirms the YouTube video on the dashboard
(memory/decisions/<EP>.json, written only by the owner workflow). If not confirmed, we look for an upload whose
title matches one of the clip's title options and mark it as an unconfirmed match for the owner to confirm.

Output: memory/analytics/<video_id>.json and memory/analytics_summary.json (dashboard "ผล" tab).
"""
from __future__ import annotations

import datetime as dt
import os
import re

from .common import MEMORY, load_config, log, metric, read_json, write_json

DATA = "https://www.googleapis.com/youtube/v3"
YTA = "https://youtubeanalytics.googleapis.com/v2/reports"
LATENCY_DAYS = 3   # YouTube Analytics data is final after ~2-3 days


# ---------------------------------------------------------------- auth
def access_token() -> str | None:
    cid, sec, ref = (os.environ.get(k) for k in ("YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN"))
    if not (cid and sec and ref):
        return None
    import requests
    r = requests.post("https://oauth2.googleapis.com/token", data={
        "client_id": cid, "client_secret": sec, "refresh_token": ref, "grant_type": "refresh_token"}, timeout=30)
    metric("youtube_calls")
    if r.status_code != 200:
        log(f"YouTube Analytics login failed ({r.status_code}): {r.text[:200]} -> using public stats only. "
            "If this keeps happening, repeat SETUP_ANALYTICS_TH.md step 4 (new refresh token).")
        return None
    return r.json().get("access_token")


def _get(url, params, token=None):
    import requests
    h = {"Authorization": f"Bearer {token}"} if token else {}
    if not token:
        params = {**params, "key": os.environ.get("YOUTUBE_API_KEY", "")}
    metric("youtube_calls")
    r = requests.get(url, params=params, headers=h, timeout=40)
    if r.status_code != 200:
        raise RuntimeError(f"HTTP {r.status_code} {r.text[:300]}")
    return r.json()


# ---------------------------------------------------------------- uploads + binding
def channel_uploads(token: str | None, limit: int = 50) -> list[dict]:
    cid = os.environ.get("YOUTUBE_CHANNEL_ID") or load_config().get("youtube", {}).get("channel_id")
    if token:
        ch = _get(f"{DATA}/channels", {"part": "contentDetails", "mine": "true"}, token)
    elif cid and os.environ.get("YOUTUBE_API_KEY"):
        ch = _get(f"{DATA}/channels", {"part": "contentDetails", "id": cid})
    else:
        return []
    items = ch.get("items", [])
    if not items:
        return []
    pl = items[0]["contentDetails"]["relatedPlaylists"]["uploads"]
    vids = _get(f"{DATA}/playlistItems", {"part": "contentDetails", "playlistId": pl, "maxResults": limit}, token)
    ids = [v["contentDetails"]["videoId"] for v in vids.get("items", [])]
    if not ids:
        return []
    data = _get(f"{DATA}/videos", {"part": "snippet,statistics,contentDetails", "id": ",".join(ids)}, token)
    out = []
    for v in data.get("items", []):
        st = v.get("statistics", {})
        out.append({"video_id": v["id"], "title": v["snippet"]["title"], "published": v["snippet"]["publishedAt"],
                    "views": int(st.get("viewCount", 0)), "likes": int(st.get("likeCount", 0)),
                    "comments": int(st.get("commentCount", 0)), "duration": v["contentDetails"].get("duration")})
    return out


def _words(t: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", (t or "").lower())) - {"the", "a", "an", "of", "to", "in", "is", "and", "why"}


def _sim(a: str, b: str) -> float:
    x, y = _words(a), _words(b)
    return len(x & y) / max(len(x | y), 1)


def video_id_from(text: str) -> str | None:
    m = re.search(r"(?:shorts/|v=|youtu\.be/|^)([A-Za-z0-9_-]{11})(?:\b|$)", (text or "").strip())
    return m.group(1) if m else None


def bind(uploads: list[dict]) -> list[dict]:
    """Apply the owner's confirmations; propose matches for unbound clips. Returns all clip records."""
    clips = []
    taken = set()
    for p in sorted((MEMORY / "clips").glob("*.json")):
        rec = read_json(p, {}) or {}
        dec = read_json(MEMORY / "decisions" / p.name, {}) or {}
        if dec.get("video_id"):
            rec["video_id"], rec["video_confirmed"] = dec["video_id"], True
        if dec.get("decision"):
            rec["decision"] = dec["decision"]
        if rec.get("video_id"):
            taken.add(rec["video_id"])
        clips.append((p, rec))
    for p, rec in clips:
        if rec.get("video_confirmed") or rec.get("decision") == "discard":
            continue
        made = rec.get("date", "2000-01-01")
        best, score = None, 0.0
        for u in uploads:
            if u["video_id"] in taken and u["video_id"] != rec.get("video_id"):
                continue
            if u["published"][:10] < made:
                continue
            s = max(_sim(t, u["title"]) for t in ([rec.get("title", "")] + rec.get("titles", [])))
            if s > score:
                best, score = u, s
        if best and score >= 0.5:
            if rec.get("video_id") != best["video_id"]:
                log(f"match: {rec['episode']} -> {best['video_id']} '{best['title']}' ({score:.2f}), waiting for "
                    "the owner to confirm on the dashboard")
            rec["video_id"], rec["video_confirmed"], rec["match_title"] = best["video_id"], False, best["title"]
            rec["match_score"] = round(score, 2)
            taken.add(best["video_id"])
        write_json(p, rec)
    return [r for _, r in clips]


# ---------------------------------------------------------------- analytics
def _report(token, vid, start, end, metrics, dims=None, sort=None, maxr=None, extra_filter=""):
    params = {"ids": "channel==MINE", "startDate": start, "endDate": end, "metrics": metrics,
              "filters": f"video=={vid}{extra_filter}"}
    if dims:
        params["dimensions"] = dims
    if sort:
        params["sort"] = sort
    if maxr:
        params["maxResults"] = maxr
    d = _get(YTA, params, token)
    cols = [c["name"] for c in d.get("columnHeaders", [])]
    return [dict(zip(cols, row)) for row in d.get("rows", []) or []]


def window(token, vid, start: str, end: str) -> dict:
    """Totals for one video between two dates (inclusive)."""
    out = {}
    base = "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,likes,comments,shares,subscribersGained"
    for m in ("engagedViews," + base, base):
        try:
            rows = _report(token, vid, start, end, m)
            out.update(rows[0] if rows else {})
            break
        except RuntimeError as e:
            if "engagedViews" in m:
                continue
            log(f"analytics {vid}: {e}")
    return out


def details(token, vid, start: str, end: str, duration: float | None, scenes: list[dict]) -> dict:
    d = {}
    try:
        ret = _report(token, vid, start, end, "audienceWatchRatio,relativeRetentionPerformance", "elapsedVideoTimeRatio")
        d["retention"] = [[round(r["elapsedVideoTimeRatio"], 3), round(r["audienceWatchRatio"], 4),
                           round(r.get("relativeRetentionPerformance", 0) or 0, 3)] for r in ret]
    except RuntimeError as e:
        log(f"retention {vid}: {e}")
    for key, dims, met, srt, mx in (("traffic", "insightTrafficSourceType", "views", "-views", 10),
                                    ("countries", "country", "views", "-views", 10),
                                    ("devices", "deviceType", "views", "-views", 5),
                                    ("demographics", "ageGroup,gender", "viewerPercentage", None, None)):
        try:
            d[key] = _report(token, vid, start, end, met, dims, srt, mx)
        except RuntimeError as e:
            log(f"{key} {vid}: {e}")
    if d.get("retention") and duration and scenes:
        d["scene_retention"] = scene_retention(d["retention"], duration, scenes)
    return d


def scene_retention(curve: list, duration: float, scenes: list[dict]) -> list[dict]:
    """Retention at the start and end of every scene -> where viewers leave, and on which kind of picture."""
    def at(sec):
        r = min(max(sec / duration, 0.0), 1.0)
        best = min(curve, key=lambda c: abs(c[0] - r))
        return best[1]
    out = []
    for s in scenes:
        if s.get("start") is None or s.get("end") is None:
            continue
        a, b = at(s["start"]), at(min(s["end"], duration))
        out.append({"i": s["i"], "kind": s.get("kind"), "overlay": s.get("overlay"), "text": s.get("text", "")[:80],
                    "start": s["start"], "end": s["end"], "ret_start": round(a, 3), "ret_end": round(b, 3),
                    "drop": round(a - b, 3), "drop_per_s": round((a - b) / max(s["end"] - s["start"], 0.3), 4)})
    return out


def run() -> dict:
    token = access_token()
    try:
        uploads = channel_uploads(token)
    except RuntimeError as e:
        log(f"could not list channel uploads: {e}")
        uploads = []
    by_id = {u["video_id"]: u for u in uploads}
    clips = bind(uploads)
    today = dt.date.today()
    summary = []
    for rec in clips:
        vid = rec.get("video_id")
        row = {k: rec.get(k) for k in ("episode", "title", "topic", "format", "video_id", "video_confirmed",
                                        "match_title", "decision", "status", "date", "series_no")}
        if not vid:
            summary.append(row)
            continue
        p = MEMORY / "analytics" / f"{vid}.json"
        a = read_json(p, {}) or {"video_id": vid, "episode": rec["episode"], "windows": {}}
        up = by_id.get(vid, {})
        if up:
            a["published"] = up["published"]
            a["public"] = {k: up[k] for k in ("views", "likes", "comments")} | {"at": today.isoformat()}
            a["title_on_youtube"] = up["title"]
        if token and a.get("published") and rec.get("video_confirmed", True):
            pub = dt.date.fromisoformat(a["published"][:10])
            for name, days in (("d2", 2), ("d7", 7), ("d28", 28)):
                end = pub + dt.timedelta(days=days - 1)
                if name not in a["windows"] and today >= end + dt.timedelta(days=LATENCY_DAYS):
                    w = window(token, vid, pub.isoformat(), end.isoformat())
                    if w:
                        a["windows"][name] = w
                        if name == "d7":
                            a["details_d7"] = details(token, vid, pub.isoformat(), end.isoformat(),
                                                      rec.get("duration"), rec.get("scenes", []))
            a["latest"] = window(token, vid, pub.isoformat(), today.isoformat())
        write_json(p, a)
        row.update({"published": a.get("published"), "public": a.get("public"), "windows": a.get("windows", {}),
                    "latest": a.get("latest")})
        sr = (a.get("details_d7") or {}).get("scene_retention")
        if sr:
            worst = max(sr, key=lambda s: s["drop_per_s"])
            row["worst_scene"] = worst
        ctry = (a.get("details_d7") or {}).get("countries")
        if ctry:
            tot = sum(c.get("views", 0) for c in ctry) or 1
            row["us_share"] = round(sum(c.get("views", 0) for c in ctry if c.get("country") == "US") / tot, 3)
        summary.append(row)
    out = {"updated": dt.datetime.now().isoformat(timespec="minutes"), "oauth": bool(token),
           "uploads_seen": len(uploads), "clips": summary}
    write_json(MEMORY / "analytics_summary.json", out)
    log(f"analytics: {len(summary)} clips, {sum(1 for s in summary if s.get('video_id'))} bound to YouTube videos, "
        f"detailed analytics {'ON' if token else 'OFF (public stats only)'}")
    return out
