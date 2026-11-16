"""Gemini (free tier) as the brain: research, scripts, reviews, footage vision checks.

Needs GEMINI_API_KEY (free at https://aistudio.google.com/apikey). Uses the stable
generateContent REST endpoint. Free-tier limits are small (about 10 requests/minute), so every
call is spaced out and retried on 429 automatically.
"""
from __future__ import annotations

import base64
import io
import json
import os
import re
import time

from .common import load_config, log, metric

API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
_last_call = [0.0]


class BrainError(RuntimeError):
    pass


def available() -> bool:
    return bool(os.environ.get("GEMINI_API_KEY"))


_model_cache: list[str] = []
_busy: dict[str, float] = {}  # model -> time it may be used again (per-minute limit)
_dead: set[str] = set()   # models that returned "quota 0 / not available" for this key


def _models() -> list[str]:
    """Configured models first, then whatever Flash models this key can actually use (asked from the API)."""
    if not _model_cache:
        wanted = load_config().get("brain", {}).get(
            "models", ["gemini-3.8-flash", "gemini-flash-latest", "gemini-2.5-flash"])
        live = []
        try:
            import requests
            r = requests.get("https://generativelanguage.googleapis.com/v1beta/models",
                             params={"key": os.environ.get("GEMINI_API_KEY", ""), "pageSize": 200}, timeout=30)
            if r.status_code == 200:
                for m in r.json().get("models", []):
                    name = m.get("name", "").replace("models/", "")
                    if "generateContent" in m.get("supportedGenerationMethods", []) and "flash" in name \
                            and not any(x in name for x in ("tts", "image", "live", "audio", "embedding", "exp", "omni", "thinking")):
                        live.append(name)
                log(f"Gemini models available to this key: {', '.join(live[:12]) or 'none'}")
            else:
                log(f"Gemini model list failed: HTTP {r.status_code} {r.text[:300]}")
        except Exception as e:
            log(f"Gemini model list failed: {e}")
        ordered = [m for m in wanted if not live or m in live or m.endswith("-latest")]
        # newest-looking extras (lite last)
        extras = sorted([m for m in live if m not in ordered], key=lambda n: ("lite" in n, n), reverse=False)
        extras.sort(key=lambda n: ("lite" in n, "preview" in n, [-int(x) for x in __import__("re").findall(r"\d+", n)[:2]]))
        _model_cache.extend(ordered + extras[:4])
    return [m for m in _model_cache if m not in _dead]


def _space_calls() -> None:
    gap = load_config().get("brain", {}).get("min_seconds_between_calls", 7)
    wait = _last_call[0] + gap - time.time()
    if wait > 0:
        time.sleep(wait)
    _last_call[0] = time.time()


def _img_part(img_bytes: bytes, max_w: int = 384) -> dict:
    from PIL import Image
    im = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    if im.width > max_w:
        im = im.resize((max_w, int(im.height * max_w / im.width)))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=80)
    return {"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(buf.getvalue()).decode()}}


def ask(prompt: str | list, *, json_mode: bool = False, search: bool = False,
        images: list[bytes] | None = None, retries: int = 4) -> tuple[str, list[dict]]:
    """Return (text, sources). `prompt` may be a list mixing str and image bytes (in order)."""
    import requests

    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise BrainError("GEMINI_API_KEY is missing")
    parts = []
    for p in (prompt if isinstance(prompt, list) else [prompt]):
        parts.append({"text": p} if isinstance(p, str) else _img_part(p))
    for im in images or []:
        parts.append(_img_part(im))
    body: dict = {"contents": [{"role": "user", "parts": parts}]}
    if json_mode:
        body["generationConfig"] = {"responseMimeType": "application/json"}
    if search:
        body["tools"] = [{"google_search": {}}]

    last = None
    for rnd in range(4):  # rounds over all usable models; a rate-limited model is skipped, never waited on alone
        models = _models()
        if not models:
            break
        for model in models:
            if _busy.get(model, 0) > time.time():
                continue
            for attempt in range(2):
                _space_calls()
                try:
                    metric("gemini_calls")
                    metric("gemini_by_model", 1, model)
                    r = requests.post(API.format(model=model), params={"key": key}, json=body, timeout=180)
                    if r.status_code != 200:
                        metric("gemini_errors")
                except requests.RequestException as e:
                    last = f"{model}: {e}"
                    time.sleep(5)
                    continue
                err = r.text[:600] if r.status_code != 200 else ""
                if r.status_code in (403, 404):  # model not available on this key
                    last = f"{model}: HTTP {r.status_code} {err[:300]}"
                    log(f"Gemini {model} not available ({r.status_code}) -> next model")
                    _dead.add(model)
                    break
                if r.status_code == 429:
                    last = f"{model}: HTTP 429 {err[:300]}"
                    if "limit: 0" in err or "PerDay" in err or "per day" in err.lower():
                        log(f"Gemini {model}: free daily quota used up -> next model")
                        _dead.add(model)
                        break
                    m = re.search(r"retry in ([\d.]+)s|\"retryDelay\":\s*\"(\d+)s", err)
                    delay = min(float(next(g for g in m.groups() if g)) + 1, 65) if m else 30
                    _busy[model] = time.time() + delay
                    metric("gemini_rate_limited")
                    break   # next model right away
                if r.status_code in (500, 502, 503, 504):
                    last = f"{model}: HTTP {r.status_code} {err[:200]}"
                    time.sleep(4)
                    continue
                if r.status_code == 400 and "API key" in err:
                    raise BrainError("GEMINI_API_KEY is not valid. Create a new key at aistudio.google.com/apikey "
                                     "and paste it again into GitHub Secrets.")
                if r.status_code == 400 and search and "tools" in body:
                    log("Gemini search grounding unavailable here, continuing without it")
                    body.pop("tools", None)
                    continue
                if r.status_code != 200:  # this model does not accept the request -> next model
                    last = f"{model}: HTTP {r.status_code} {err[:300]}"
                    log(f"Gemini {model} rejected the request ({r.status_code}) -> next model. {err[:200]}")
                    _dead.add(model)
                    break
                data = r.json()
                cand = (data.get("candidates") or [{}])[0]
                text = "".join(p.get("text", "") for p in cand.get("content", {}).get("parts", []))
                sources = []
                for ch in cand.get("groundingMetadata", {}).get("groundingChunks", []) or []:
                    web = ch.get("web") or {}
                    if web.get("uri"):
                        sources.append({"title": web.get("title", ""), "url": web["uri"]})
                if not text.strip():
                    last = f"{model}: empty answer ({cand.get('finishReason')})"
                    continue
                return text, sources
        # every usable model is rate-limited: grounded search has its own small quota, so drop it first
        if search and "tools" in body and rnd >= 3:
            log("Google Search grounding is rate-limited on every model -> continuing without it (Wikipedia stays)")
            body.pop("tools", None)
            continue
        live = [m for m in _models() if m not in _dead]
        if not live:
            break
        wait = max(min(_busy.get(m, 0) for m in live) - time.time(), 2)
        log(f"all Gemini models rate-limited, waiting {wait:.0f}s (round {rnd + 1}/4)")
        time.sleep(min(wait, 65))
    raise BrainError(f"Gemini did not answer: {last}")


def ask_json(prompt, **kw):
    """JSON answer. A top-level object is expected: a 1-item list [{...}] (Gemini sometimes wraps it) is unwrapped."""
    text, sources = ask(prompt, json_mode=True, **kw)
    data = parse_json(text)
    if isinstance(data, list) and data and all(isinstance(x, dict) for x in data):
        data = data[0] if len(data) == 1 or "scenes" in data[0] or "script" in data[0] else {"items": data}
    if not isinstance(data, dict):
        raise BrainError("Gemini returned JSON that is not an object: " + text[:300])
    return data, sources


def parse_json(text: str):
    t = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.M).strip()
    try:
        return json.loads(t)
    except json.JSONDecodeError:
        pass
    for open_c, close_c in (("{", "}"), ("[", "]")):
        if open_c in t:
            try:
                return json.loads(t[t.index(open_c): t.rindex(close_c) + 1])
            except (ValueError, json.JSONDecodeError):
                continue
    raise BrainError("Gemini returned invalid JSON:\n" + text[:800])
