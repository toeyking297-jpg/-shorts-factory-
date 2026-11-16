"""Trend & niche radar (free data only).

Signals:
  1. YouTube Data API (YOUTUBE_API_KEY, free 10,000 units/day): English Shorts from the last N days
     in the niche, ranked by "outlier score" = views / subscribers of the channel. A video that got
     500k views on a 3k-subscriber channel proves the TOPIC is pulling viewers, not the channel.
  2. Wikipedia most-read articles yesterday (no key): what people are curious about right now.
  3. Reddit r/todayilearned top of the week (no key, may be blocked from some servers).
Gemini then turns the evidence into a ranked list of concrete Short topics.

Output: trends/latest.json (read by the dashboard) + trends/history/<date>.json
"""
from __future__ import annotations

import datetime as dt
import os
import statistics

from . import brain
from .common import ROOT, log, read_json, write_json

UA = {"User-Agent": "ShortsFactory/1.0 (personal YouTube research tool)"}
YT = "https://www.googleapis.com/youtube/v3"
TRENDS = ROOT / "trends"


def _get(url, **kw):
    import requests
    r = requests.get(url, timeout=40, **kw)
    r.raise_for_status()
    return r.json()


# ---------------------------------------------------------------- YouTube
def youtube_outliers(keywords: list[str], days: int = 10, per_kw: int = 25) -> list[dict]:
    key = os.environ.get("YOUTUBE_API_KEY")
    if not key:
        log("trends: no YOUTUBE_API_KEY -> skipping YouTube signal")
        return []
    since = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")
    found: dict[str, dict] = {}
    for kw in keywords:
        try:
            data = _get(f"{YT}/search", params={
                "key": key, "part": "snippet", "q": f"{kw} #shorts", "type": "video", "videoDuration": "short",
                "order": "viewCount", "publishedAfter": since, "relevanceLanguage": "en", "maxResults": per_kw})
        except Exception as e:  # quota or network
            log(f"trends: YouTube search failed for '{kw}': {e}")
            continue
        for it in data.get("items", []):
            vid = it["id"].get("videoId")
            if vid and vid not in found:
                found[vid] = {"id": vid, "keyword": kw, "title": it["snippet"]["title"],
                              "channel": it["snippet"]["channelTitle"], "channelId": it["snippet"]["channelId"],
                              "published": it["snippet"]["publishedAt"]}
    if not found:
        return []
    ids = list(found)
    for i in range(0, len(ids), 50):
        data = _get(f"{YT}/videos", params={"key": key, "part": "statistics", "id": ",".join(ids[i:i + 50])})
        for it in data.get("items", []):
            st = it.get("statistics", {})
            found[it["id"]].update(views=int(st.get("viewCount", 0)), likes=int(st.get("likeCount", 0) or 0),
                                   comments=int(st.get("commentCount", 0) or 0))
    chans = list({v["channelId"] for v in found.values()})
    subs = {}
    for i in range(0, len(chans), 50):
        data = _get(f"{YT}/channels", params={"key": key, "part": "statistics", "id": ",".join(chans[i:i + 50])})
        for it in data.get("items", []):
            st = it.get("statistics", {})
            subs[it["id"]] = 0 if st.get("hiddenSubscriberCount") else int(st.get("subscriberCount", 0))
    now = dt.datetime.now(dt.timezone.utc)
    out = []
    for v in found.values():
        v["subs"] = subs.get(v["channelId"], 0)
        hours = max((now - dt.datetime.fromisoformat(v["published"].replace("Z", "+00:00"))).total_seconds() / 3600, 1)
        v["views_per_hour"] = round(v.get("views", 0) / hours)
        v["outlier"] = round(v.get("views", 0) / max(v["subs"], 1000), 1)
        v["url"] = f"https://www.youtube.com/shorts/{v['id']}"
        out.append(v)
    out.sort(key=lambda v: (v["outlier"], v.get("views", 0)), reverse=True)
    return out


def niche_opportunity(videos: list[dict]) -> dict:
    """How winnable is this niche for a NEW channel?"""
    if not videos:
        return {"score": None, "note": "no YouTube data"}
    small = [v for v in videos if v["subs"] < 10_000]
    small_hits = [v for v in small if v.get("views", 0) >= 100_000]
    med_out = statistics.median(v["outlier"] for v in videos)
    med_views = statistics.median(v.get("views", 0) for v in videos)
    score = min(100, round(len(small_hits) / max(len(videos), 1) * 200 + min(med_out, 30) * 1.5))
    return {"score": score, "videos_checked": len(videos), "small_channel_hits": len(small_hits),
            "median_outlier": med_out, "median_views": int(med_views),
            "note": "score 0-100: share of small channels (<10k subs) reaching 100k+ views, plus typical outlier ratio"}


# ---------------------------------------------------------------- Wikipedia / Reddit
def wikipedia_trending(limit: int = 120) -> list[dict]:
    day = dt.date.today() - dt.timedelta(days=1)
    try:
        data = _get(f"https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/"
                    f"{day:%Y/%m/%d}", headers=UA)
    except Exception as e:
        log(f"trends: Wikipedia unavailable: {e}")
        return []
    arts = data["items"][0]["articles"]
    skip = ("Main_Page", "Special:", "Wikipedia:", "Portal:", "File:", "Help:", "Talk:")
    return [{"title": a["article"].replace("_", " "), "views": a["views"]}
            for a in arts if not a["article"].startswith(skip)][:limit]


def reddit_til(limit: int = 60) -> list[dict]:
    try:
        data = _get("https://www.reddit.com/r/todayilearned/top.json", params={"t": "week", "limit": limit},
                    headers=UA)
    except Exception as e:
        log(f"trends: Reddit unavailable: {e}")
        return []
    return [{"title": c["data"]["title"], "score": c["data"].get("score", 0)}
            for c in data.get("data", {}).get("children", [])]


# ---------------------------------------------------------------- channel learning
def my_channel_stats() -> list[dict]:
    """Public stats of our own uploads (config youtube.channel_id) to learn what works."""
    from .common import load_config
    key = os.environ.get("YOUTUBE_API_KEY")
    cid = load_config().get("youtube", {}).get("channel_id") or os.environ.get("YOUTUBE_CHANNEL_ID")
    if not key or not cid:
        return []
    try:
        ch = _get(f"{YT}/channels", params={"key": key, "part": "contentDetails", "id": cid})
        pl = ch["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
        items = _get(f"{YT}/playlistItems", params={"key": key, "part": "contentDetails", "playlistId": pl,
                                                     "maxResults": 50})["items"]
        ids = [i["contentDetails"]["videoId"] for i in items]
        vids = _get(f"{YT}/videos", params={"key": key, "part": "snippet,statistics", "id": ",".join(ids)})["items"]
    except Exception as e:
        log(f"trends: own channel stats unavailable: {e}")
        return []
    out = [{"title": v["snippet"]["title"], "views": int(v["statistics"].get("viewCount", 0)),
            "likes": int(v["statistics"].get("likeCount", 0) or 0), "published": v["snippet"]["publishedAt"]}
           for v in vids]
    out.sort(key=lambda v: v["views"], reverse=True)
    return out


# ---------------------------------------------------------------- competitors & viewers
def _channel_recent(cid: str, key: str, n: int = 15) -> list[dict]:
    ch = _get(f"{YT}/channels", params={"key": key, "part": "contentDetails,snippet,statistics", "id": cid})
    if not ch.get("items"):
        return []
    it = ch["items"][0]
    subs = int(it["statistics"].get("subscriberCount", 0) or 0)
    pl = it["contentDetails"]["relatedPlaylists"]["uploads"]
    items = _get(f"{YT}/playlistItems", params={"key": key, "part": "contentDetails", "playlistId": pl,
                                                 "maxResults": n}).get("items", [])
    ids = [i["contentDetails"]["videoId"] for i in items]
    if not ids:
        return []
    vids = _get(f"{YT}/videos", params={"key": key, "part": "snippet,statistics", "id": ",".join(ids)}).get("items", [])
    out = []
    for v in vids:
        views = int(v["statistics"].get("viewCount", 0))
        out.append({"title": v["snippet"]["title"], "channel": it["snippet"]["title"], "views": views, "subs": subs,
                    "outlier": round(views / max(subs, 1000), 1), "url": f"https://www.youtube.com/shorts/{v['id']}",
                    "published": v["snippet"]["publishedAt"]})
    return out


def competitor_hits(videos: list[dict]) -> list[dict]:
    """Remember channels that keep producing outliers in our niche; check their latest uploads every run."""
    from .common import MEMORY
    key = os.environ.get("YOUTUBE_API_KEY")
    if not key:
        return []
    comp = read_json(MEMORY / "competitors.json", {})
    for v in videos[:25]:
        if v.get("outlier", 0) >= 5:
            c = comp.setdefault(v["channelId"], {"name": v["channel"], "hits": 0})
            c["hits"] += 1
    write_json(MEMORY / "competitors.json", comp)
    top = sorted(comp.items(), key=lambda kv: -kv[1]["hits"])[:10]
    out = []
    for cid, _ in top:
        try:
            recent = _channel_recent(cid, key)
        except Exception as e:
            log(f"trends: competitor {cid} skipped: {e}")
            continue
        if recent:
            med = statistics.median(r["views"] for r in recent)
            out += [r for r in recent if r["views"] >= 3 * max(med, 1)]  # their breakout videos
    out.sort(key=lambda r: -r["views"])
    return out[:20]


def viewer_questions(limit_videos: int = 10) -> list[str]:
    """Questions viewers ask in our own comments = free topic ideas."""
    from .common import load_config
    key = os.environ.get("YOUTUBE_API_KEY")
    cid = load_config().get("youtube", {}).get("channel_id") or os.environ.get("YOUTUBE_CHANNEL_ID")
    if not key or not cid:
        return []
    out = []
    try:
        data = _get(f"{YT}/commentThreads", params={"key": key, "part": "snippet", "allThreadsRelatedToChannelId": cid,
                                                     "maxResults": 100, "order": "relevance"})
        for it in data.get("items", []):
            txt = it["snippet"]["topLevelComment"]["snippet"].get("textOriginal", "")
            if "?" in txt and 15 < len(txt) < 300:
                out.append(txt)
    except Exception as e:
        log(f"trends: comments unavailable: {e}")
    return out[:40]


# ---------------------------------------------------------------- main
def run(niche: str, n_topics: int = 12) -> dict:
    from .common import load_config
    cfg = load_config()
    niche = niche.strip() or cfg["niche"]["name"]
    log(f"trends: niche = {niche}")
    kw, _ = brain.ask_json(
        "You plan research for a faceless ENGLISH YouTube Shorts channel. The owner describes the niche "
        f"(maybe in Thai): \"{niche}\".\nReturn JSON {{\"niche_en\": short English niche name, "
        "\"keywords\": [6 short English YouTube search phrases that find popular Shorts in this niche]}}")
    keywords = kw.get("keywords", [])[:6] or [niche]
    videos = youtube_outliers(keywords)
    opp = niche_opportunity(videos)
    wiki = wikipedia_trending()
    til = reddit_til()
    mine = my_channel_stats()
    comp_hits = competitor_hits(videos)
    questions = viewer_questions()
    done = _done_topics()

    evidence = {
        "youtube_outliers": [{k: v.get(k) for k in ("title", "channel", "views", "subs", "outlier", "url")}
                             for v in videos[:40]],
        "wikipedia_trending_yesterday": [w["title"] for w in wiki[:120]],
        "reddit_til_top_week": [t["title"] for t in til[:50]],
        "competitor_breakouts": [{k: v.get(k) for k in ("title", "channel", "views", "outlier")} for v in comp_hits],
        "viewer_questions_from_our_comments": questions,
        "our_channel_best": mine[:5], "our_channel_worst": mine[-5:] if len(mine) > 5 else [],
        "already_made": done[-80:],
    }
    rules = (ROOT / "config" / "niche_rules.md").read_text(encoding="utf-8")
    ideas, _ = brain.ask_json([
        f"You are the trend analyst for a faceless English YouTube Shorts channel.\nNiche: {kw.get('niche_en', niche)}\n"
        f"Channel rules:\n{rules}\n\nEVIDENCE (real data collected today):\n"
        f"{__import__('json').dumps(evidence, ensure_ascii=False)[:60000]}\n\n"
        f"Propose the {n_topics} best NEW Short topics for this niche. Prefer topics where the evidence shows "
        "demand (YouTube outliers, competitor breakouts, viewer questions, trending Wikipedia pages, viral TIL facts), "
        "that can be "
        "verified with reliable sources, that have free visuals (real places/objects/nature), that AMERICAN viewers "
        "would care about (highest-paying audience), and that are NOT in "
        "already_made. Never copy a competitor's video; find a fresh angle.\n"
        "Return JSON: {\"topics\": [{\"topic\": \"specific subject\", \"angle\": \"the surprising claim\", "
        "\"hook\": \"first line, under 8 words\", \"why_now\": \"which evidence supports it\", "
        f"\"format\": one of {cfg['production'].get('formats', [])}, "
        "\"evidence_urls\": [\"...\"], \"score\": 0-100}]} sorted best first."])
    topics = ideas.get("topics", [])
    result = {"date": dt.datetime.now().isoformat(timespec="minutes"), "niche_input": niche,
              "niche_en": kw.get("niche_en", niche), "keywords": keywords, "opportunity": opp,
              "topics": topics, "top_outliers": evidence["youtube_outliers"][:12]}
    TRENDS.mkdir(exist_ok=True)
    write_json(TRENDS / "latest.json", result)
    write_json(TRENDS / "history" / f"{dt.date.today()}.json", result)
    log(f"trends: {len(topics)} topic ideas, opportunity score {opp.get('score')}")
    return result


def _done_topics() -> list[str]:
    hist = read_json(ROOT / "memory" / "history.json", [])
    return [h.get("topic", "") for h in hist]
