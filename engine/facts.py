"""Facts registry: one list of facts (value + source) that every on-screen number must come from.

script["facts"] = [{"id": "f1", "claim": "...", "value": "1,670 miles", "source": "https://...", "source_name": "NOAA"}]
"""
from __future__ import annotations

import re

NUM = re.compile(r"\d[\d,]*(?:\.\d+)?")


def numbers(text: str) -> set[str]:
    """Numeric tokens, normalised ('1,670' -> '1670', '7.70' -> '7.7')."""
    out = set()
    for m in NUM.findall(str(text or "")):
        n = m.replace(",", "")
        if "." in n:
            n = n.rstrip("0").rstrip(".")
        out.add(n)
    return out


def registry_numbers(script: dict) -> set[str]:
    nums: set[str] = set()
    for f in script.get("facts", []) or []:
        nums |= numbers(f.get("value", "")) | numbers(f.get("claim", ""))
    return nums


def on_screen_texts(script: dict) -> list[tuple[str, str]]:
    """(where, text) for everything the viewer READS (not hears)."""
    out = []
    meta = script.get("meta", {})
    for k in ("title", "cover_text"):
        if meta.get(k):
            out.append((f"meta.{k}", meta[k]))
    for i, sc in enumerate(script.get("scenes", [])):
        ov = sc.get("overlay") if isinstance(sc.get("overlay"), dict) else {}
        for k in ("text", "value", "label", "title", "kicker", "sub"):
            if isinstance(ov.get(k), str):
                out.append((f"scene {i} overlay.{k}", ov[k]))
        for it in ov.get("items", []) or []:
            if isinstance(it, dict):
                for k in ("display", "label", "text", "year"):
                    if it.get(k) is not None:
                        out.append((f"scene {i} overlay item", str(it[k])))
            elif isinstance(it, str):
                out.append((f"scene {i} overlay item", it))
        v = sc.get("visual") if isinstance(sc.get("visual"), dict) else {}
        if v.get("type") == "map":
            for k in ("headline", "title", "kicker", "route_from", "route_to"):
                if isinstance(v.get(k), str):
                    out.append((f"scene {i} map.{k}", v[k]))
            if isinstance(v.get("distance"), dict) and v["distance"].get("label"):
                out.append((f"scene {i} map distance", str(v["distance"]["label"])))
            for p in v.get("pins", []) or []:
                if isinstance(p, dict) and p.get("label"):
                    out.append((f"scene {i} map pin", str(p["label"])))
            if isinstance(v.get("compare"), dict) and v["compare"].get("label"):
                out.append((f"scene {i} map compare", str(v["compare"]["label"])))
    return out


def check(script: dict, allowed_urls: list[str] | None = None) -> list[str]:
    """Factual QC issues (deterministic). Empty list = every on-screen number is backed by a sourced fact."""
    issues = []
    facts = script.get("facts", []) or []
    if not facts:
        issues.append("no facts registry: the script lists no sourced facts")
    ids = {f.get("id") for f in facts}
    for f in facts:
        src = str(f.get("source", ""))
        if not src.startswith("http"):
            issues.append(f"fact {f.get('id')} has no source URL: {f.get('claim', '')[:80]}")
        elif "vertexaisearch" in src:
            issues.append(f"fact {f.get('id')} source is a temporary search link, not the real page")
        elif allowed_urls and not any(_same(src, u) for u in allowed_urls):
            issues.append(f"fact {f.get('id')} source was not in the research sources: {src[:100]}")
    nums = registry_numbers(script)
    for where, txt in on_screen_texts(script):
        if where.endswith("map compare") or re.search(r"lower 48", txt, re.I):
            continue
        for n in numbers(txt):
            claim_like = re.search(rf"\b{re.escape(n)}\s*(x|%|times|percent)", txt, re.I)
            if len(n.replace(".", "")) <= 1 and not claim_like:   # "3 rules": counting words, not facts
                continue
            if n not in nums:
                issues.append(f"{where}: number {n} ('{txt[:40]}') is not in the facts registry")
    for i, sc in enumerate(script.get("scenes", [])):
        ov = sc.get("overlay") if isinstance(sc.get("overlay"), dict) else {}
        if ov.get("type") in ("stat", "compare"):
            fid = ov.get("fact")
            fids = fid if isinstance(fid, list) else [fid]
            if not fid or any(x not in ids for x in fids):
                issues.append(f"scene {i} {ov.get('type')} overlay is not linked to a fact id")
            if not ov.get("source"):
                issues.append(f"scene {i} {ov.get('type')} overlay shows no source")
    return issues


def _same(a: str, b: str) -> bool:
    norm = lambda u: re.sub(r"^https?://(www\.)?|[#?].*$|/$", "", u.strip().lower())
    return norm(a) == norm(b) or norm(a).startswith(norm(b)) or norm(b).startswith(norm(a))


def link_overlays(script: dict) -> None:
    """Fill missing fact ids / source names on stat & compare overlays by matching their numbers."""
    facts = script.get("facts", []) or []
    for sc in script.get("scenes", []):
        ov = sc.get("overlay")
        if not isinstance(ov, dict) or ov.get("type") not in ("stat", "compare"):
            continue
        txt = ov.get("value", "") + " " + " ".join(str(i.get("display", "")) for i in ov.get("items", []) or []
                                                   if isinstance(i, dict))
        want = numbers(txt)
        hit = [f for f in facts if want & (numbers(f.get("value", "")) | numbers(f.get("claim", "")))]
        if hit and not ov.get("fact"):
            ov["fact"] = hit[0]["id"] if len(hit) == 1 else [f["id"] for f in hit]
        if hit and not ov.get("source"):
            ov["source"] = hit[0].get("source_name") or re.sub(r"^https?://(www\.)?([^/]+).*", r"\2",
                                                               hit[0].get("source", ""))


def sources_block(script: dict) -> list[str]:
    """'NOAA - https://...' lines for the description, deduplicated, registry first."""
    seen, out = set(), []
    for f in script.get("facts", []) or []:
        u = f.get("source", "")
        if u.startswith("http") and u not in seen and "vertexaisearch" not in u:
            seen.add(u)
            out.append(f"{f.get('source_name') or ''} {u}".strip())
    for u in script.get("sources", []) or []:
        if u.startswith("http") and u not in seen and "vertexaisearch" not in u:
            seen.add(u)
            out.append(u)
    return out
