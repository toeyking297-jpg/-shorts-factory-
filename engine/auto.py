"""Fully automatic production: niche in -> finished, checked Shorts out.

  python -m engine.run auto --niche "weird places" --count 3
  python -m engine.run auto --topics "Point Nemo\nPheasant Island"

Per episode:
  research (Wikipedia + Gemini with Google Search, real source URLs)
  -> script with a facts registry -> strict fact / story / loop review
  -> voice -> footage (+ picture check with must-show / must-not-show)
  -> DRAFT QC on one still per scene (text collisions + picture review) -> repair only failed scenes
  -> full render -> FINAL QC in 5 categories -> repair only failed scenes (time permitting)
  -> upload kit + status: "ready" or "needs_review" (never shipped as ready when something failed)
"""
from __future__ import annotations

import copy
import datetime as dt
import json
import re
import time
import traceback

from . import brain, check, draft, facts as factsmod, footage, kit, learned, render, trends, tts
from .common import FINAL, MEMORY, METRICS, ROOT, load_config, log, read_json, write_json

UA = {"User-Agent": "ShortsFactory/1.0 (personal YouTube research tool)"}


# ---------------------------------------------------------------- research
def wikipedia_research(topic: str, max_pages: int = 2, max_chars: int = 14000) -> tuple[str, list[dict]]:
    import requests
    api = "https://en.wikipedia.org/w/api.php"
    try:
        hits = requests.get(api, params={"action": "query", "list": "search", "srsearch": topic, "format": "json",
                                         "srlimit": max_pages}, headers=UA, timeout=30).json()
        titles = [h["title"] for h in hits.get("query", {}).get("search", [])]
        text, srcs = [], []
        for t in titles:
            pg = requests.get(api, params={"action": "query", "prop": "extracts", "explaintext": 1, "titles": t,
                                           "format": "json", "redirects": 1}, headers=UA, timeout=30).json()
            for p in pg.get("query", {}).get("pages", {}).values():
                ex = (p.get("extract") or "")[:max_chars]
                if ex:
                    text.append(f"=== Wikipedia: {p['title']} ===\n{ex}")
                    srcs.append({"url": "https://en.wikipedia.org/wiki/" + p["title"].replace(" ", "_"),
                                 "title": f"Wikipedia: {p['title']}"})
        return "\n\n".join(text), srcs
    except Exception as e:  # noqa: BLE001
        log(f"Wikipedia research failed: {e}")
        return "", []


def _resolve(url: str) -> str:
    """Gemini grounding returns temporary redirect links; follow them once to get the real page URL."""
    if "vertexaisearch" not in url and "grounding-api-redirect" not in url:
        return url
    try:
        import requests
        r = requests.head(url, allow_redirects=False, timeout=12, headers=UA)
        loc = r.headers.get("Location", "")
        if loc.startswith("http"):
            return loc
        r = requests.get(url, allow_redirects=True, timeout=15, headers=UA, stream=True)
        return r.url if "vertexaisearch" not in r.url else ""
    except Exception:  # noqa: BLE001
        return ""


def core_subject(topic: str) -> str:
    """'Point Nemo: the ocean spot where...' -> 'Point Nemo' (what to look up)."""
    return re.split(r"\s*[:|\u2013\u2014]\s*|\s+-\s+", topic.strip())[0][:80] or topic


def on_topic(script: dict, topic: str) -> bool:
    core = core_subject(topic).lower()
    keys = [w for w in re.findall(r"[a-z0-9']+", core) if len(w) > 3 and w not in {"that", "this", "with", "from",
                                                                                     "where", "what", "when", "which"}]
    text = (" ".join(sc.get("text", "") for sc in script.get("scenes", [])) + " " +
            str(script.get("meta", {}).get("title", ""))).lower()
    if not keys or core in text:
        return True
    need = len(keys) if len(keys) <= 3 else (len(keys) + 1) // 2   # short names ("Point Nemo") must appear whole
    return sum(re.search(rf"\b{re.escape(k)}", text) is not None for k in keys) >= need


def research(topic: dict) -> tuple[str, list[dict]]:
    subject = topic["topic"]
    wiki_text, srcs = wikipedia_research(core_subject(subject))
    try:
        notes, found = brain.ask(
            f"Research this subject for a 45-second factual YouTube Short: {subject}\n"
            f"Angle: {topic.get('angle', '')}\n"
            "Use Google Search. List 10-15 short, verified facts (numbers with units, dates, causes, comparisons) "
            "and name the source (organisation + page) for each. Prefer official / scientific / encyclopedic "
            "sources. Flag any popular claim about this subject that is a MYTH, disputed, or true only under a "
            "condition (state the condition).", search=True)
    except brain.BrainError as e:
        log(f"grounded research failed: {e}")
        notes, found = "", []
    log(f"research: Google Search grounding returned {len(found)} source(s)")
    for s in found:
        u = _resolve(s.get("url", ""))
        if u and not any(u == x["url"] for x in srcs):
            srcs.append({"url": u, "title": s.get("title", "")})
    return f"{wiki_text}\n\n=== Web research notes ===\n{notes}", srcs


# ---------------------------------------------------------------- writing
def _rules() -> str:
    return (ROOT / "config" / "script_rules.md").read_text(encoding="utf-8")


def _example() -> str:
    return (ROOT / "config" / "example_script.json").read_text(encoding="utf-8")


def _lessons() -> str:
    out = ""
    for name, n in (("performance.md", 2500), ("lessons.md", 2000)):
        p = MEMORY / name
        if p.exists():
            out += p.read_text(encoding="utf-8")[-n:] + "\n"
    notes = learned.settings().get("writer_notes", [])
    if notes:
        out += "\nLEARNED FROM OUR OWN AUDIENCE (apply):\n" + "\n".join(f"- {n}" for n in notes) + "\n"
    return out


def _sources_text(sources: list[dict]) -> str:
    return "\n".join(f"- {s['url']}  ({s.get('title', '')})" for s in sources[:20]) or "- (none found)"


def normalize(script: dict, topic: dict, sources: list) -> dict:
    from .typo import shorten_headline
    script.setdefault("topic", topic["topic"])
    if not isinstance(script.get("meta"), dict):
        script["meta"] = {}
    subj = topic.get("topic", "") if isinstance(topic, dict) else ""
    scenes = [s for s in script.get("scenes", []) if isinstance(s, dict) and str(s.get("text", "")).strip()]
    if len(scenes) < 4:
        raise brain.BrainError("script has too few scenes")
    for sc in scenes:
        sc["text"] = str(sc["text"]).strip()
        if not isinstance(sc.get("visual"), dict):
            sc["visual"] = {"type": "footage", "query": subj or sc["text"][:60]}
        v = sc["visual"]
        g = v.get("graphic") if isinstance(v.get("graphic"), dict) else None
        if v.get("type") == "graphic" and g and g.get("type") == "map":  # map put inside "graphic"
            sc["visual"] = v = {**{k: val for k, val in g.items() if k != "type"}, "type": "map"}
        elif v.get("type") == "graphic":
            # NO full-screen graphic cards: the graphic goes on top of real footage instead
            g = g or {"type": "label", "text": sc["text"][:40]}
            if g.get("type") == "title":
                g = {"type": "label", "text": g.get("text", "")}
            sc.setdefault("overlay", g)
            sc["visual"] = v = {"type": "footage", "query": (v.get("query") or subj or sc["text"])[:80],
                                "alt": [subj] if subj else []}
        if v.get("type") in ("footage", "image"):
            if not v.get("source") and re.search(r"\b(space station|iss|astronaut|orbit|rocket|satellite|spacecraft|"
                                                 r"from space|nasa)\b", str(v.get("query", "")), re.I):
                v["source"] = "nasa"   # real NASA footage instead of AI-looking stock space clips
            v.setdefault("must_show", [])
            v.setdefault("must_not_show", [])
            if "watermark" not in v["must_not_show"]:
                v["must_not_show"] = [*v["must_not_show"], "watermark or big text"]
        ov = sc.get("overlay")
        if ov is not None and not isinstance(ov, dict):
            sc.pop("overlay")
            ov = None
        if isinstance(ov, dict) and ov.get("type") == "title":
            ov["type"] = "label"
        if isinstance(ov, dict) and ov.get("type") not in ("label", "icons", "stat", "list", "location", "compare",
                                                           "timeline", "quote"):
            sc.pop("overlay")
            ov = None
        if v.get("type") == "map":
            pins = []
            for p in v.get("pins") or []:
                if isinstance(p, dict):
                    pins.append(p)
                elif isinstance(p, (list, tuple)) and len(p) == 2:
                    pins.append({"lon": p[0], "lat": p[1]})
                elif isinstance(p, str):
                    pins.append({"place": p})
            v["pins"] = pins
            for k in ("focus", "context"):
                if isinstance(v.get(k), str):
                    v[k] = [v[k]]
            for k in ("distance", "ring", "compare"):
                if k in v and not isinstance(v[k], dict):
                    v.pop(k)
            if v.get("title") and not v.get("headline"):
                v["headline"] = v.pop("title")
            if ov:  # maps carry their own typography: move the overlay's words into the map headline
                if ov.get("type") == "label" and not v.get("headline"):
                    v["headline"], v["kicker"] = ov.get("text"), ov.get("kicker") or v.get("kicker")
                elif ov.get("type") == "stat" and not v.get("headline"):
                    v["headline"], v["kicker"] = ov.get("value"), ov.get("label")
                sc.pop("overlay", None)
                ov = None
            if v.get("headline"):
                h = shorten_headline(str(v["headline"]), 5)
                if h:
                    v["headline"] = h
                else:
                    v.pop("headline")
        for obj in (ov, v):
            if isinstance(obj, dict) and isinstance(obj.get("kicker"), str):
                obj["kicker"] = re.sub(r"(?i)^\s*thing\s*(\d)", r"FACT \1", obj["kicker"])
        if isinstance(ov, dict) and ov.get("type") == "label":
            h = shorten_headline(str(ov.get("text", "")), 5)
            if not h:
                log(f"  dropped an on-screen headline that was a whole sentence: {ov.get('text', '')[:60]}")
                sc.pop("overlay")
            else:
                ov["text"] = h

    loop = script.get("loop", True) is not False
    last = scenes[-1]
    if loop:
        last["visual"] = {"type": "loop"}
        last["text"] = last["text"].strip().rstrip(".!?")
        last.pop("overlay", None)
    else:
        if last.get("visual", {}).get("type") == "loop":
            last["visual"] = {"type": "footage", "query": subj or last["text"][:60], "must_show": [],
                              "must_not_show": ["watermark or big text"]}
        if not last["text"].rstrip().endswith((".", "!", "?")):
            last["text"] = last["text"].rstrip() + "."
    script["loop"] = loop
    script["scenes"] = scenes
    # facts registry
    fl = [f for f in script.get("facts", []) or [] if isinstance(f, dict)]
    for k, f in enumerate(fl, 1):
        f.setdefault("id", f"f{k}")
        f["source"] = str(f.get("source", "")).strip()
    script["facts"] = fl
    factsmod.link_overlays(script)
    urls = [s["url"] if isinstance(s, dict) else s for s in sources]
    src = list(dict.fromkeys([*[f["source"] for f in fl if f["source"].startswith("http")],
                              *script.get("sources", []), *urls]))
    script["sources"] = [u for u in src if u and "vertexaisearch" not in u][:10]
    script.pop("voice_engine", None)
    if topic.get("format"):
        script["format"] = topic["format"]
    return script


def write_script(topic: dict, facts: str, sources: list[dict], niche: str) -> dict:
    lw = learned.settings()
    words = lw.get("words_target") or load_config()["production"].get("words_target", [100, 140])
    prompt = (f"{_rules()}\n\nCHANNEL NICHE: {niche}\n"
              f"TOPIC (the Short is about exactly this subject and names it; ignore research about other "
              f"subjects): {topic['topic']}\nANGLE: {topic.get('angle', '')}\nSUGGESTED HOOK: {topic.get('hook', '')}\n"
              f"FORMAT: {topic.get('format', 'shock_fact')}\nTARGET LENGTH: {words[0]}-{words[1]} words\n\n"
              f"LESSONS FROM PAST EPISODES (apply them):\n{_lessons()}\n\n"
              f"ALLOWED SOURCES (facts[].source must be one of these exact URLs):\n{_sources_text(sources)}\n\n"
              f"RESEARCH (use only facts supported here):\n{facts[:24000]}\n\n"
              f"Return ONLY the JSON script, in exactly this format (complete correct example):\n{_example()}")
    script, _ = brain.ask_json(prompt)
    if not on_topic(script, topic["topic"]):
        log(f"  first draft drifted off the topic ({script.get('topic', '')!r}) -> rewriting")
        script, _ = brain.ask_json(prompt + f"\n\nIMPORTANT: the Short MUST be about exactly this subject: "
                                            f"{topic['topic']}. Name it in the narration. Ignore research that is "
                                            "about anything else.")
        if not on_topic(script, topic["topic"]):
            raise brain.BrainError(f"the writer kept drifting away from the topic '{topic['topic']}'")
    script = normalize(script, topic, sources)
    script["topic"] = topic["topic"]

    review_prompt = (
        "You are a strict fact-checker, story editor AND retention editor for YouTube Shorts. Review this script.\n"
        "1) FACTS: every number, date, superlative and causal claim must be supported by the RESEARCH and listed in "
        "facts[] with a source URL from ALLOWED SOURCES. Fix or soften anything unsupported, disputed or true only "
        "under a condition (keep the condition in the words). The same fact uses the same number everywhere "
        "(narration, overlays, map labels, title, cover). Never attribute a number to an organisation that did not "
        "publish it.\n"
        "2) STORY: one main question, raised by the hook and clearly answered before the end; cut side stories.\n"
        "3) Hook under 8 words that creates a question instantly. Each scene 6-14 words, total "
        f"{words[0]}-{words[1]} words, spoken English, no filler.\n"
        "4) LOOP: if '<last scene> <first scene>' can read as ONE natural, grammatical sentence, keep loop true and "
        "make the last scene that 2-6 word bridge. If it cannot sound natural, set loop false and end on a clean "
        "payoff sentence. Bad English is never worth a loop.\n"
        "5) ON-SCREEN TEXT: headlines/labels 2-5 words, never a narration sentence; one overlay per scene; no "
        "overlay on map scenes (use the map's headline/kicker).\n"
        "6) VISUALS: queries describe what is SEEN; every footage scene has must_show / must_not_show that stop "
        "contradicting pictures (open ocean -> no beach/coast; a station -> whole station visible).\n"
        "7) HOOK CONTEST: write 5 alternative first lines; score each 1-10 on curiosity, clarity, specificity and "
        "scroll-stopping power for an American viewer. Put the winner in scene 1.\n"
        "8) SCROLL TEST: rate every scene 1-10 for 'would keep watching'; rewrite any scene below 7.\n"
        "9) TITLES: 3 options (40-70 chars, curiosity + the subject named, no clickbait the video does not pay "
        "off); best in meta.title, all 3 in meta.title_options. meta.pinned_comment: one short question.\n"
        f"RULES:\n{_rules()}\n\nALLOWED SOURCES:\n{_sources_text(sources)}\n\nRESEARCH:\n{facts[:20000]}\n\n"
        f"SCRIPT:\n{json.dumps(script, ensure_ascii=False)}\n\n"
        "Return JSON {\"changes\": [\"what you fixed\"], \"hooks\": [{\"text\": \"...\", \"score\": 0}], "
        "\"loop_sentence\": \"<last> <first> as read\", \"loop_ok\": true, \"script\": <the full corrected script>}")
    try:
        reviewed, _ = brain.ask_json(review_prompt)
        if isinstance(reviewed.get("script"), dict):
            new = reviewed["script"]
            if reviewed.get("loop_ok") is False:
                new["loop"] = False
                log(f"  loop dropped (not natural): {reviewed.get('loop_sentence', '')[:120]}")
            if on_topic(new, topic["topic"]):
                script = normalize(new, topic, sources)
                script["topic"] = topic["topic"]
            else:
                log("  review drifted off the topic -> keeping the first draft")
            for c in reviewed.get("changes", [])[:8]:
                log(f"  review: {c}")
            hooks = sorted(reviewed.get("hooks", []), key=lambda h: -float(h.get("score", 0) or 0))
            if hooks:
                log(f"  best hook ({hooks[0].get('score')}): {hooks[0].get('text')}")
    except Exception as e:  # noqa: BLE001  a bad review must never kill the episode
        log(f"review step failed, keeping first draft: {type(e).__name__}: {e}")
    return script


def audit_claims(script: dict, facts: str, topic: str) -> list[str]:
    """Sentence-by-sentence claim audit against the research (what QC numbers alone cannot see)."""
    lines = "\n".join(f"{i}: {sc['text']}" for i, sc in enumerate(script["scenes"]))
    on_screen = "\n".join(f"- {w}: {t}" for w, t in factsmod.on_screen_texts(script))
    try:
        res, _ = brain.ask_json(
            f"You audit a factual YouTube Short about: {topic}. Check every narration sentence and every on-screen "
            "text against the RESEARCH only. Flag:\n"
            "- unsupported: the research does not state it (numbers, dates, counts, 'first/only/most').\n"
            "- overclaim: stronger than the research (drops a condition, 'always', 'anyone', 'X times closer' when "
            "the source only supports a conditional or approximate comparison, future events stated as done).\n"
            "- off_topic: a fact that is not about the main subject or not needed to answer the hook (e.g. movie "
            "box office in a geography Short, or a detour to a different place before the main subject).\n"
            "- wrong_source: a fact whose source page is not where that number comes from.\n"
            f"NARRATION (scene: text):\n{lines}\nON SCREEN:\n{on_screen}\n"
            f"FACTS REGISTRY:\n{json.dumps(script.get('facts', []), ensure_ascii=False)}\n\nRESEARCH:\n{facts[:18000]}\n\n"
            "Return JSON {\"problems\": [{\"scene\": n, \"kind\": \"unsupported|overclaim|off_topic|wrong_source\", "
            "\"text\": \"the exact words\", \"fix\": \"how to say it truthfully, or cut it\"}]} (empty list if clean).")
    except Exception as e:  # noqa: BLE001
        log(f"claim audit skipped: {e}")
        return []
    out = []
    for p in res.get("problems", []) or []:
        if isinstance(p, dict) and p.get("kind") in ("unsupported", "overclaim", "off_topic", "wrong_source"):
            out.append(f"scene {p.get('scene')}: {p['kind']}: \"{str(p.get('text', ''))[:120]}\" -> {str(p.get('fix', ''))[:160]}")
    return out[:8]


def fix_script(script: dict, issues: list[str], facts: str, sources: list) -> dict:
    prompt = (f"The video QC found these problems in a YouTube Short script:\n- " + "\n- ".join(issues) +
              "\n\nFix ALL of them with the smallest possible change (keep scenes that have no problem exactly as "
              "they are, including their visuals). Keep facts supported by the research and listed in facts[] with "
              f"sources from ALLOWED SOURCES.\n\nRULES:\n{_rules()}\n\nALLOWED SOURCES:\n{_sources_text(sources)}\n\n"
              f"RESEARCH:\n{facts[:12000]}\n\nSCRIPT:\n{json.dumps(_public(script), ensure_ascii=False)}\n\n"
              "Return ONLY the full corrected script JSON.")
    new, _ = brain.ask_json(prompt)
    if script.get("loop") is False:
        new["loop"] = False
    return normalize(new, {"topic": script.get("topic", ""), "format": script.get("format")}, sources)


def _public(script: dict) -> dict:
    """Script without engine-internal keys (what the writer sees)."""
    s = copy.deepcopy(script)
    s.pop("qc_audit", None)
    for sc in s.get("scenes", []):
        for k in [k for k in sc.get("visual", {}) if k.startswith("_")]:
            sc["visual"].pop(k)
    return s


# ---------------------------------------------------------------- build with QC gates
def _strip_runtime(sc: dict) -> dict:
    return {k: v for k, v in sc.get("visual", {}).items() if not k.startswith("_")}


def _apply_script_fix(ep, old: dict, new: dict) -> tuple[bool, set[int], set[int]]:
    """Keep downloaded media for unchanged visuals.
    Returns (narration_changed, scenes_with_new_visuals, scenes_whose_overlay_or_map_text_changed)."""
    changed, restyle = set(), set()
    old_vis = [_strip_runtime(s) for s in old["scenes"]]
    for i, sc in enumerate(new["scenes"]):
        if i < len(old_vis) and _strip_runtime(sc) == old_vis[i]:
            for k, v in old["scenes"][i].get("visual", {}).items():
                if k.startswith("_"):
                    sc["visual"][k] = v
            if sc.get("overlay") != old["scenes"][i].get("overlay"):
                restyle.add(i)
        elif i < len(old_vis) and sc.get("visual", {}).get("type") in ("map", "loop"):
            restyle.add(i)   # map spec changed: just re-render it, nothing to download
        else:
            changed.add(i)
            for f in (ep / "assets").glob(f"s{i:02d}.*"):
                f.unlink()
    narration = [s["text"] for s in old["scenes"]] != [s["text"] for s in new["scenes"]]
    write_json(ep / "script.json", new)
    return narration, changed, restyle


def _reject_current(ep, scenes: set[int]) -> dict[int, set]:
    script = read_json(ep / "script.json")
    rej = {}
    for i in scenes:
        v = script["scenes"][i].get("visual", {})
        if v.get("_media_id"):
            rej[i] = set(v.get("_rejected", [])) | {v["_media_id"]}
    return rej


def build(ep, facts: str, sources: list[dict], deadline: float) -> dict:
    cfg = load_config()
    tm: dict = {}
    m0 = json.loads(json.dumps(METRICS))
    allowed = [s["url"] for s in sources]

    def step(name, fn, *a, **kw):
        t0 = time.time()
        r = fn(*a, **kw)
        tm[name] = tm.get(name, 0) + round(time.time() - t0)
        return r

    step("voice", tts.run, ep)
    step("footage", footage.run, ep)

    # -------- DRAFT QC (one still per scene, before the slow render)
    d_issues = step("draft_qc", draft.review, ep)
    refetch = {i["scene"] for i in d_issues if i.get("fix") == "refetch" and i.get("scene") is not None}
    text_fix = [i for i in d_issues if i.get("fix") == "script"]
    if refetch and time.time() < deadline:
        log(f"draft repair: new pictures for scenes {sorted(refetch)}")
        step("footage", footage.run, ep, only=refetch, reject=_reject_current(ep, refetch))
    if text_fix and time.time() < deadline:
        old = read_json(ep / "script.json")
        try:
            new = fix_script(old, [i["msg"] for i in text_fix], facts, sources)
            new["qc_audit"] = audit_claims(new, facts, old.get("topic", ""))
            narr, changed, _ = _apply_script_fix(ep, old, new)
            if narr:
                step("voice", tts.run, ep)
            if changed or narr:
                step("footage", footage.run, ep)
        except brain.BrainError as e:
            log(f"draft text fix failed: {e}")

    # -------- full render + FINAL QC
    step("render", render.run, ep)
    final_issues = step("final_review", visual_review, ep)
    report = step("qc", check.run, ep, final_issues, allowed)

    # -------- repair only what failed (one round, time permitting)
    rounds = cfg.get("brain", {}).get("auto_fix_rounds", 1)
    for r in range(rounds):
        todo = [i for i in report.get("issue_list", []) if i.get("blocking", True) and i.get("fix")]
        if not todo or time.time() > deadline:
            if todo:
                log("time budget reached: no more repairs, the clip goes to needs_review")
            break
        refetch = {i["scene"] for i in todo if i["fix"] == "refetch" and i.get("scene") is not None}
        rerender = {i["scene"] for i in todo if i["fix"] == "render" and i.get("scene") is not None}
        text = [i["msg"] for i in todo if i["fix"] == "script"]
        log(f"repair round {r + 1}: pictures {sorted(refetch)}, re-render {sorted(rerender)}, text {len(text)}")
        full = False
        if text:
            old = read_json(ep / "script.json")
            try:
                new = fix_script(old, text, facts, sources)
                new["qc_audit"] = audit_claims(new, facts, old.get("topic", ""))
                narr, changed, restyle = _apply_script_fix(ep, old, new)
                if narr:
                    step("voice", tts.run, ep)
                    full = True
                refetch |= {i for i in changed if new["scenes"][i].get("visual", {}).get("type") in ("footage", "image")}
                rerender |= restyle | (changed - refetch)
            except brain.BrainError as e:
                log(f"text repair failed: {e}")
        if refetch:
            step("footage", footage.run, ep, only=refetch, reject=_reject_current(ep, refetch - set()))
        if full:
            step("render", render.run, ep)
        elif refetch | rerender:
            step("render", render.run, ep, refetch | rerender)
        elif not text:
            break
        final_issues = step("final_review", visual_review, ep)
        report = step("qc", check.run, ep, final_issues, allowed)

    used = {k: (METRICS[k] - m0.get(k, 0)) if isinstance(METRICS[k], int) else
            {m: n - m0.get(k, {}).get(m, 0) for m, n in METRICS[k].items()} for k in METRICS}
    report["metrics"] = {"seconds": tm, "total_seconds": sum(tm.values()), "api": used}
    write_json(ep / "build" / "report.json", report)
    log(f"timing {ep.name}: " + ", ".join(f"{k} {v}s" for k, v in tm.items()) +
        f" | Gemini calls {used.get('gemini_calls')}, footage API calls {used.get('footage_api_calls')}")
    return report


def visual_review(ep) -> list[dict]:
    """Gemini watches 9 frames of the finished cut like a viewer. Problems map back to the scene on screen."""
    sheet = ep / "build" / "check.jpg"
    final = FINAL / f"{ep.name}.mp4"
    if not brain.available() or not final.exists():
        return []
    from .common import probe_duration
    check.contact_sheet(final, ep / "build")
    script = read_json(ep / "script.json")
    t = read_json(ep / "build" / "timings.json")
    dur = probe_duration(final)
    at = [dur * (k + 0.5) / 9 for k in range(9)]
    scene_of = [next((i for i, s in enumerate(t["scenes"]) if s["start"] <= x < s["end"]), len(t["scenes"]) - 1)
                for x in at]
    try:
        res, _ = brain.ask_json([
            "You are a YouTube Shorts editor. These are 9 frames (numbered 1-9 left-to-right, top-to-bottom) from a "
            f"finished Short about: {script.get('topic', '')}.\nNarration: " + " ".join(s["text"] for s in script["scenes"]) +
            "\nScore 1-10: would an American viewer keep watching? List concrete problems per frame: a picture that "
            "contradicts or does not match the story, text overlapping text or the captions, unreadable text, an "
            "empty or boring frame, the same picture repeated, a cropped subject. Return JSON {\"score\": n, "
            "\"problems\": [{\"frame\": 1-9, \"problem\": \"...\", \"fix\": \"new_picture\"|\"text\"|\"none\"}]}",
            sheet.read_bytes()])
    except Exception as e:  # noqa: BLE001
        log(f"visual review skipped: {e}")
        return []
    score = res.get("score", 10)
    probs = [p for p in res.get("problems", []) if isinstance(p, dict)]
    log(f"final visual review {score}/10: " + "; ".join(str(p.get("problem", ""))[:80] for p in probs[:4]))
    out = []
    if isinstance(score, (int, float)) and score < 7:
        for p in probs[:4]:
            try:
                sc = scene_of[int(p.get("frame", 1)) - 1]
            except (TypeError, ValueError, IndexError):
                sc = None
            fix = {"new_picture": "refetch", "text": "script"}.get(p.get("fix"))
            if fix == "refetch" and (sc is None or script["scenes"][sc].get("visual", {}).get("type") not in
                                     ("footage", "image")):
                fix = None
            out.append(check.issue("visual", f"final review (score {score}): {p.get('problem', '')}", sc, fix))
        if not out:
            out.append(check.issue("visual", f"final review score {score}/10", None, None))
    return out


# ---------------------------------------------------------------- batch
def write_report() -> None:
    """Small JSON the dashboard shows as the overview."""
    hist = read_json(MEMORY / "history.json", [])
    week = (dt.date.today() - dt.timedelta(days=7)).isoformat()
    pub = [h for h in hist if "views" in h]
    scores = read_json(MEMORY / "format_scores.json", {})
    best = max(scores.items(), key=lambda kv: kv[1].get("avg_views", 0))[0] if scores else None
    top = max(pub, key=lambda h: h["views"]) if pub else None
    recent = [h for h in hist if h.get("date", "") >= week]
    write_json(MEMORY / "report.json", {
        "updated": dt.datetime.now().isoformat(timespec="minutes"),
        "clips_total": len(hist), "clips_7d": len(recent),
        "ready_7d": sum(1 for h in recent if h.get("status") == "ready"),
        "needs_review_7d": sum(1 for h in recent if h.get("status") == "needs_review"),
        "published_tracked": len(pub), "views_total": sum(h["views"] for h in pub),
        "best_format": best, "format_scores": scores,
        "top_video": {"title": top.get("title"), "views": top["views"]} if top else None,
        "failed_7d": sum(1 for h in recent if h.get("error"))})


def assign_formats(picks: list[dict], history: list[dict], cfg: dict) -> None:
    """Rotate formats so the channel never looks templated; favour formats that perform best."""
    formats = cfg["production"].get("formats", ["shock_fact"])
    perf = read_json(MEMORY / "format_scores.json", {})
    w = learned.settings().get("format_weights", {})
    ranked = sorted(formats, key=lambda f: -(perf.get(f, {}).get("avg_views", 1) or 1) * w.get(f, 1.0))
    recent = [h.get("format") for h in history[-3:]]
    pool = [f for f in ranked if f not in recent] + [f for f in ranked if f in recent]
    for i, t in enumerate(picks):
        if t.get("format") not in formats or t["format"] in [p.get("format") for p in picks[:i]]:
            t["format"] = pool[i % len(pool)]


def produce(niche: str = "", count: int = 3, topics_text: str = "") -> list[dict]:
    from .run import cmd_new
    cfg = load_config()
    if not brain.available():
        raise SystemExit("GEMINI_API_KEY is missing (free key: https://aistudio.google.com/apikey)")
    niche = niche.strip() or cfg["niche"]["name"]
    try:
        from . import performance
        performance.update()
    except Exception as e:  # noqa: BLE001  learning is best-effort
        log(f"performance update skipped: {e}")
    history = read_json(MEMORY / "history.json", [])
    done = {h.get("topic", "").lower() for h in history if h.get("status") != "failed"}

    if topics_text.strip():
        picks = [{"topic": t.strip(), "angle": "", "hook": ""} for t in topics_text.splitlines() if t.strip()]
    else:
        latest = read_json(ROOT / "trends" / "latest.json", {})
        fresh = latest and latest.get("niche_input", "").strip() == niche and \
            (dt.datetime.now() - dt.datetime.fromisoformat(latest["date"])).total_seconds() < 20 * 3600
        data = latest if fresh else trends.run(niche)
        picks = [t for t in data.get("topics", []) if t.get("topic", "").lower() not in done]
    picks = picks[:max(1, min(int(count), 10))]
    assign_formats(picks, history, cfg)
    budget_min = cfg["production"].get("episode_budget_min", 30)
    log(f"producing {len(picks)} episode(s) for niche: {niche} (time budget {budget_min} min per clip)")

    results = []
    for n, topic in enumerate(picks, 1):
        log(f"\n######## {n}/{len(picks)}: {topic['topic']} ########")
        t_start = time.time()
        deadline = t_start + budget_min * 60
        try:
            t0 = time.time()
            facts, sources = research(topic)
            script = write_script(topic, facts, sources, niche)
            problems = audit_claims(script, facts, topic["topic"])
            if problems:
                log("claim audit: " + " | ".join(problems))
                try:
                    fixed = fix_script(script, problems, facts, sources)
                    if on_topic(fixed, topic["topic"]):
                        script = fixed
                        script["topic"] = topic["topic"]
                    problems = audit_claims(script, facts, topic["topic"])
                except brain.BrainError as e:
                    log(f"claim fix failed: {e}")
            script["qc_audit"] = problems   # anything left is shown to the owner and blocks "ready"
            t_write = round(time.time() - t0)
            log(f"timing writing (research+script+review): {t_write}s")
            ep = cmd_new(script.get("meta", {}).get("title") or topic["topic"])
            script["id"] = ep.name.split("_")[0]
            write_json(ep / "script.json", script)
            (ep / "research.md").write_text(facts + "\n\n=== Sources ===\n" + _sources_text(sources), encoding="utf-8")
            write_json(ep / "build" / "research_sources.json", sources)
            report = build(ep, facts, sources, deadline)
            report.setdefault("metrics", {}).setdefault("seconds", {})["writing"] = t_write
            report["metrics"]["total_seconds"] = round(time.time() - t_start)
            write_json(ep / "build" / "report.json", report)
            k = kit.build(ep)
            kit.clip_record(ep)
            script = read_json(ep / "script.json")
            entry = {"topic": topic["topic"], "episode": ep.name, "title": script["meta"].get("title", ""),
                     "format": script.get("format", ""), "hook": script["scenes"][0]["text"],
                     "title_options": k.get("titles", []), "description": script["meta"].get("description", ""),
                     "status": report.get("status"), "ok": report.get("ok"), "issues": report.get("issues", [])[:6],
                     "reasons_th": report.get("reasons_th", []), "date": dt.date.today().isoformat(), "niche": niche,
                     "series_no": k.get("series_no"), "seconds": report["metrics"]["total_seconds"],
                     "gemini_calls": report["metrics"].get("api", {}).get("gemini_calls")}
            history.append(entry)
            write_json(MEMORY / "history.json", history)
            if report.get("status") != "ready":
                with open(MEMORY / "lessons.md", "a", encoding="utf-8") as f:
                    f.write(f"- {dt.date.today()} {ep.name}: needs_review: {'; '.join(report['issues'][:3])}\n")
            results.append(entry)
        except Exception as e:  # noqa: BLE001  one bad episode must not stop the batch
            tb = traceback.extract_tb(e.__traceback__)
            where = " <- ".join(f"{f.filename.split('/')[-1]}:{f.lineno} {f.name}" for f in tb[::-1][:3])
            log(f"EPISODE FAILED: {type(e).__name__}: {e} [at {where}]")
            traceback.print_exc()
            results.append({"topic": topic["topic"], "error": f"{type(e).__name__}: {e} [at {where}]",
                            "status": "failed"})

    write_report()
    lines = [f"# {len([r for r in results if 'error' not in r])} clip(s) - {niche}", ""]
    for r in results:
        if "error" in r:
            lines += [f"## ❌ FAILED: {r['topic']}", r["error"][:300], ""]
        else:
            badge = "✅ พร้อมลง" if r["status"] == "ready" else "⚠️ ต้องดูก่อน"
            lines += [f"## {badge} · {r['title']}", f"`{r['episode']}.mp4` · {r['seconds']}s · "
                      f"Gemini {r.get('gemini_calls')} calls", *[f"- {x}" for x in r.get("reasons_th", [])[:4]], ""]
    FINAL.mkdir(exist_ok=True)
    (FINAL / "batch_summary.md").write_text("\n".join(lines), encoding="utf-8")
    return results
