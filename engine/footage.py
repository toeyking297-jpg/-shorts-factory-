"""Find and download royalty-free visuals for each scene.

Sources: Pexels (videos+photos), Pixabay (videos+photos), Wikimedia Commons (photos,
public-domain / CC licences only, attribution recorded). Keys go in .env:
  PEXELS_API_KEY=...   PIXABAY_API_KEY=...
Wikimedia needs no key.

Scene visual spec (script.json):
  {"type": "footage", "query": "polar bear walking on ice", "alt": ["arctic ice"], "source": "any"}
  {"type": "image",   "query": "Svalbard seed vault", "source": "wikimedia"}
  {"type": "graphic", ...}            -> nothing to download
  {"file": "C:/path/my_clip.mp4"}     -> use your own file as-is
"""
from __future__ import annotations

import os
import re
import shutil
from pathlib import Path

from .common import MEMORY, ROOT, log, metric, read_json, write_json

UA = {"User-Agent": "ShortsFactory/1.0 (personal YouTube production tool)"}
VIDEO_EXT = {".mp4", ".mov", ".webm", ".mkv"}


def _get(url, **kw):
    import requests
    metric("footage_api_calls")
    r = requests.get(url, timeout=40, **kw)
    r.raise_for_status()
    return r


def _download(url: str, dest: Path) -> Path:
    import requests
    metric("downloads")
    with requests.get(url, stream=True, timeout=120, headers=UA) as r:
        r.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in r.iter_content(1 << 16):
                f.write(chunk)
    return dest


# ---------------------------------------------------------------- searchers
def pexels_videos(q: str, min_dur: float):
    key = os.environ.get("PEXELS_API_KEY")
    if not key:
        return []
    out = []
    for orient in ("portrait", None):
        params = {"query": q, "per_page": 15}
        if orient:
            params["orientation"] = orient
        data = _get("https://api.pexels.com/videos/search", params=params, headers={"Authorization": key}).json()
        for v in data.get("videos", []):
            files = [f for f in v.get("video_files", []) if f.get("file_type") == "video/mp4" and f.get("height")]
            if not files:
                continue
            # prefer ~1080 short side, not 4K (faster download, same final quality)
            files.sort(key=lambda f: abs(min(f["width"], f["height"]) - 1080))
            f = files[0]
            out.append({"id": f"pexels:{v['id']}", "url": f["link"], "kind": "video", "ext": ".mp4",
                        "thumb": v.get("image", ""),
                        "duration": v.get("duration", 0), "portrait": f["height"] > f["width"],
                        "credit": f"Video by {v['user']['name']} on Pexels", "page": v.get("url", ""),
                        "license": "Pexels License"})
        if out:
            break
    return [c for c in out if c["duration"] >= min_dur] or out


def pexels_photos(q: str, min_dur: float = 0):
    key = os.environ.get("PEXELS_API_KEY")
    if not key:
        return []
    data = _get("https://api.pexels.com/v1/search", params={"query": q, "per_page": 15},
                headers={"Authorization": key}).json()
    return [{"id": f"pexels:p{p['id']}", "url": p["src"].get("large2x") or p["src"]["original"], "kind": "image",
             "thumb": p["src"].get("medium", ""),
             "ext": ".jpg", "credit": f"Photo by {p['photographer']} on Pexels", "page": p.get("url", ""),
             "license": "Pexels License"} for p in data.get("photos", [])]


def pixabay_videos(q: str, min_dur: float):
    key = os.environ.get("PIXABAY_API_KEY")
    if not key:
        return []
    data = _get("https://pixabay.com/api/videos/", params={"key": key, "q": q[:100], "per_page": 20,
                                                           "safesearch": "true"}).json()
    out = []
    for h in data.get("hits", []):
        vids = h.get("videos", {})
        f = vids.get("large") if vids.get("large", {}).get("url") else vids.get("medium")
        if not f or not f.get("url"):
            continue
        out.append({"id": f"pixabay:{h['id']}", "url": f["url"], "kind": "video", "ext": ".mp4",
                    "thumb": (vids.get("small") or {}).get("thumbnail") or f.get("thumbnail", ""),
                    "duration": h.get("duration", 0), "portrait": f.get("height", 0) > f.get("width", 1),
                    "credit": f"Video by {h.get('user', 'Pixabay')} on Pixabay", "page": h.get("pageURL", ""),
                    "license": "Pixabay Content License"})
    return [c for c in out if c["duration"] >= min_dur] or out


def pixabay_photos(q: str, min_dur: float = 0):
    key = os.environ.get("PIXABAY_API_KEY")
    if not key:
        return []
    data = _get("https://pixabay.com/api/", params={"key": key, "q": q[:100], "image_type": "photo",
                                                     "per_page": 20, "safesearch": "true"}).json()
    return [{"id": f"pixabay:p{h['id']}", "url": h["largeImageURL"], "kind": "image", "ext": ".jpg",
             "thumb": h.get("webformatURL", ""),
             "credit": f"Image by {h.get('user', 'Pixabay')} on Pixabay", "page": h.get("pageURL", ""),
             "license": "Pixabay Content License"} for h in data.get("hits", [])]


_OK_LICENSE = re.compile(r"(public domain|^pd|cc0|cc[ -]by)", re.I)


def wikimedia_photos(q: str, min_dur: float = 0):
    params = {"action": "query", "format": "json", "generator": "search", "gsrnamespace": 6,
              "gsrsearch": f"{q} filetype:bitmap", "gsrlimit": 15, "prop": "imageinfo",
              "iiprop": "url|extmetadata|size", "iiurlwidth": 1800}
    data = _get("https://commons.wikimedia.org/w/api.php", params=params, headers=UA).json()
    out = []
    pages = sorted(data.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 99))
    for p in pages:
        ii = (p.get("imageinfo") or [{}])[0]
        meta = ii.get("extmetadata", {})
        lic = meta.get("LicenseShortName", {}).get("value", "")
        if not _OK_LICENSE.search(lic) or ii.get("width", 0) < 800:
            continue
        artist = re.sub(r"<[^>]+>", "", meta.get("Artist", {}).get("value", "Unknown")).strip()
        out.append({"id": f"wikimedia:{p['pageid']}", "url": ii.get("thumburl") or ii["url"], "kind": "image",
                    "thumb": ii.get("thumburl") or ii["url"],
                    "ext": ".jpg", "credit": f"{p['title'].replace('File:', '')} by {artist} ({lic}), Wikimedia Commons",
                    "page": ii.get("descriptionurl", ""), "license": lic})
    return out


def _nasa(q: str, media: str, min_dur: float = 0):
    """NASA Image and Video Library (no key; NASA-made media is generally public domain)."""
    data = _get("https://images-api.nasa.gov/search", params={"q": q, "media_type": media}).json()
    out = []
    for it in data.get("collection", {}).get("items", [])[:6]:
        d = (it.get("data") or [{}])[0]
        nid = d.get("nasa_id")
        if not nid:
            continue
        try:
            files = [x["href"] for x in _get(f"https://images-api.nasa.gov/asset/{nid}").json()
                     ["collection"]["items"]]
        except Exception:
            continue
        if media == "video":
            pick = next((f for f in files if f.endswith("~medium.mp4")), None) or \
                   next((f for f in files if f.endswith(".mp4") and "~orig" not in f), None)
            ext, kind = ".mp4", "video"
        else:
            pick = next((f for f in files if f.endswith("~large.jpg")), None) or \
                   next((f for f in files if f.endswith("~orig.jpg")), None)
            ext, kind = ".jpg", "image"
        if not pick:
            continue
        out.append({"id": f"nasa:{nid}", "url": pick.replace("http://", "https://"), "kind": kind, "ext": ext,
                    "thumb": ((it.get("links") or [{}])[0].get("href", "")),
                    "duration": 999 if kind == "video" else 0, "portrait": False,
                    "credit": f"NASA ({d.get('center', 'NASA')}): {d.get('title', nid)}",
                    "page": f"https://images.nasa.gov/details/{nid}", "license": "NASA media (public domain)"})
    return out


def nasa_videos(q, min_dur):
    return _nasa(q, "video", min_dur)


def nasa_photos(q, min_dur=0):
    return _nasa(q, "image")


VIDEO_SOURCES = {"pexels": pexels_videos, "pixabay": pixabay_videos, "nasa": nasa_videos}
PHOTO_SOURCES = {"pexels": pexels_photos, "pixabay": pixabay_photos, "wikimedia": wikimedia_photos,
                 "nasa": nasa_photos}


def _order(order: list[str], pref: str) -> list[str]:
    """'nasa' / 'wikimedia' = try that source first, then the normal ones (never only one source)."""
    if pref in ("any", "", None):
        return order
    return [pref] + [o for o in order if o != pref]


# ---------------------------------------------------------------- main
def _gather(vis: dict, need: float, srcs: list[str], used: set, extra: list[str] | None = None,
            skip: set | None = None) -> list[dict]:
    """Up to 4 candidates: per query, the 2 most relevant from EACH source (one source never crowds out the
    others), then the next query, until 4."""
    out, seen = [], set(skip or ())
    queries = [vis.get("query") or "", *vis.get("alt", [])] if not extra else extra
    for q in [x for x in queries if x]:
        per_source = []
        for kind, table in (("video", VIDEO_SOURCES), ("image", PHOTO_SOURCES)):
            if kind == "video" and vis["type"] != "footage":
                continue
            for s in srcs:
                if s not in table:
                    continue
                try:
                    got = [c for c in table[s](q, need) if c["id"] not in used and c["id"] not in seen][:3]
                except Exception as e:  # network/API hiccup: try the next source
                    log(f"search error for '{q}' on {s}: {e}")
                    continue
                got.sort(key=lambda c: not c.get("portrait", False))
                per_source.append(got[:2])
            if any(per_source):
                break   # photos only when no video source had anything
        for k in range(2):  # interleave: best of each source first
            for lst in per_source:
                if k < len(lst) and lst[k]["id"] not in seen:
                    lst[k]["query"] = q
                    out.append(lst[k])
                    seen.add(lst[k]["id"])
        if len(out) >= 4:
            break
    return out[:4]


def _vision_pick(script: dict, pending: dict[int, list[dict]]) -> dict[int, int | None]:
    """Ask Gemini to look at the candidate thumbnails and pick the right one per scene."""
    from . import brain
    import requests
    parts = ["You are the picture editor of a factual English YouTube Short. For every scene below, look at the "
             "candidate images (thumbnails of stock videos/photos) and choose the ONE that best shows what the "
             "narration says. A pick MUST clearly contain everything in MUST SHOW and NOTHING in MUST NOT SHOW, and "
             "must not contradict the narration (e.g. narration about the open ocean far from land -> no beach, "
             "coast or island; a space station -> the whole station, not a cropped panel). Reject candidates that "
             "are: unrelated, misleading (wrong climate/country/era for a real place), AI-generated or "
             "illustration-looking when the scene is about something real, low quality, or with watermarks/big "
             "text. If none is acceptable answer none.\n"
             f"Topic: {script.get('topic', '')}\n"]
    labels: dict[int, list[str]] = {}
    for i, cands in pending.items():
        v = script['scenes'][i]['visual']
        ms, mn = v.get("must_show") or [], v.get("must_not_show") or []
        parts.append(f"\nSCENE {i}: narration: \"{script['scenes'][i]['text']}\"  (search: "
                     f"{v.get('query', '')})" + (f"  MUST SHOW: {', '.join(ms)}." if ms else "") +
                     (f"  MUST NOT SHOW: {', '.join(mn)}." if mn else ""))
        labels[i] = []
        for k, c in enumerate(cands):
            if not c.get("thumb"):
                continue
            try:
                img = requests.get(c["thumb"], timeout=30, headers=UA).content
            except Exception:
                continue
            lab = "ABCDEF"[k]
            labels[i].append(lab)
            parts.append(f"Scene {i} candidate {lab}:")
            parts.append(img)
    parts.append('\nReturn JSON {"picks": [{"scene": <number>, "pick": "A"|"B"|"C"|"D"|"E"|"F"|"none", '
                 '"reason": "few words"}]} with one entry per scene.')
    try:
        res, _ = brain.ask_json(parts)
    except Exception as e:
        log(f"vision check skipped: {e}")
        return {}
    out = {}
    for p in res.get("picks", []):
        try:
            i = int(p["scene"])
        except (KeyError, ValueError, TypeError):
            continue
        pick = str(p.get("pick", "")).strip().upper()
        if i in pending:
            out[i] = None if pick == "NONE" else ("ABCDEF".index(pick) if pick in labels.get(i, []) else 0)
            log(f"vision scene {i}: {pick} ({p.get('reason', '')})")
    return out


def run(ep: Path, only: set[int] | None = None, reject: dict[int, set] | None = None) -> None:
    """only: (re)fetch just these scenes. reject: scene -> media ids that QC rejected (never picked again)."""
    from . import brain
    from .common import load_config
    cfg = load_config()
    script = read_json(ep / "script.json")
    timings = read_json(ep / "build" / "timings.json")["scenes"]
    assets = ep / "assets"
    assets.mkdir(exist_ok=True)
    used_path = MEMORY / "used_media.json"
    used = set(read_json(used_path, []))
    credits = []
    order = cfg["footage"].get("sources", ["pixabay", "pexels", "wikimedia"])
    pending: dict[int, list[dict]] = {}

    for i, (sc, tm) in enumerate(zip(script["scenes"], timings)):
        vis = sc.get("visual", {})
        need = tm["end"] - tm["start"]
        if vis.get("file"):
            src = Path(vis["file"])
            if not src.is_absolute():
                src = ROOT / src
            dest = assets / f"s{i:02d}{src.suffix.lower()}"
            if src.resolve() != dest.resolve():
                shutil.copy(src, dest)
            vis["_asset"] = dest.name
            vis["_kind"] = "video" if dest.suffix in VIDEO_EXT else "image"
            continue
        if vis.get("type") not in ("footage", "image"):
            continue
        if only is not None and i not in only:
            continue
        existing = sorted(assets.glob(f"s{i:02d}.*"))
        if only is None and existing and vis.get("_asset") == existing[0].name:
            continue  # already downloaded on a previous run
        skip = set((reject or {}).get(i, set())) | set(vis.get("_rejected", []))
        vis["_rejected"] = sorted(skip)
        pref = vis.get("source", "any")
        pending[i] = _gather(vis, need, _order(order, pref), used, skip=skip)

    use_vision = brain.available() and cfg.get("brain", {}).get("vision_check", True)
    choice = _vision_pick(script, {i: c for i, c in pending.items() if c}) if use_vision and pending else {}
    # second chance: scenes where nothing fitted get fresh candidates from the backup queries + the topic
    retry = [i for i, c in pending.items() if use_vision and (not c or (i in choice and choice[i] is None))]
    if retry:
        topic = script.get("topic", "")
        for i in retry:
            vis = script["scenes"][i]["visual"]
            need = timings[i]["end"] - timings[i]["start"]
            tried = {c["id"] for c in pending.get(i, [])} | set(vis.get("_rejected", []))
            extra = [*(vis.get("alt") or []), vis.get("query", "") + " aerial", topic]
            pref = vis.get("source", "any")
            cands = _gather(vis, need, _order(order, pref), used, extra=extra, skip=tried)
            # real photos of the real place (Wikimedia Commons, NASA) when stock sites have nothing that fits
            core = re.split(r"\s*[:|]\s*|\s+-\s+", topic)[0] if topic else ""
            photo_q = [q for q in dict.fromkeys([core, vis.get("query", ""), *(vis.get("alt") or [])]) if q][:3]
            cands += _gather({**vis, "type": "image"}, need, ["wikimedia", "nasa"], used, extra=photo_q,
                             skip=tried | {c["id"] for c in cands})
            pending[i] = cands[:6]
        log(f"footage second pass for scenes {retry}")
        more = _vision_pick(script, {i: pending[i] for i in retry if pending[i]})
        for i in retry:
            choice[i] = more.get(i) if pending[i] else None

    for i, cands in pending.items():
        vis = script["scenes"][i]["visual"]
        idx = choice.get(i, 0) if cands else None
        picked = cands[idx] if (cands and idx is not None and idx < len(cands)) else None
        if picked and picked["id"] in used:  # two scenes chose the same clip
            picked = next((c for c in cands if c["id"] not in used), None)
        if not picked:
            log(f"scene {i}: no suitable media found (QC will flag it; render borrows a neighbour's picture)")
            vis["_kind"] = "none"
            vis.pop("_asset", None)
            for old in assets.glob(f"s{i:02d}.*"):
                old.unlink()
            continue
        dest = assets / f"s{i:02d}{picked['ext']}"
        for old in assets.glob(f"s{i:02d}.*"):
            old.unlink()
        log(f"scene {i}: {picked['id']}  ({picked['credit']})")
        _download(picked["url"], dest)
        used.add(picked["id"])
        vis["_asset"] = dest.name
        vis["_kind"] = picked["kind"]
        vis["_media_id"] = picked["id"]
        credits.append({"scene": i, **{k: picked[k] for k in ("id", "credit", "page", "license")}})

    write_json(ep / "script.json", script)
    old = read_json(ep / "build" / "credits.json", [])
    keep = {c["scene"]: c for c in old}
    keep.update({c["scene"]: c for c in credits})
    write_json(ep / "build" / "credits.json", [keep[k] for k in sorted(keep)])
    write_json(used_path, sorted(used))
