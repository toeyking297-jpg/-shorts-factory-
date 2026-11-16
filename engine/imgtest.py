"""Test: which FREE image generators work with our keys, and can they keep our characters consistent?

Writes final/imgtest_*.png and final/imgtest_report.md
"""
from __future__ import annotations

import base64
import json
import os
import time
import urllib.parse
from pathlib import Path

import requests

OUT = Path("final")
OUT.mkdir(exist_ok=True)
KEY = os.environ.get("GEMINI_API_KEY", "")
API = "https://generativelanguage.googleapis.com/v1beta"

STYLE = ("Original cartoon style 'SOI DNA': clean flat cel animation look, bold deep-indigo outlines of even thickness, "
         "soft 2-tone cel shading, warm palette of coral, teal, mustard and cream, subtle paper grain, "
         "characters with slightly oval bean-shaped heads, small black dot eyes with one white highlight, "
         "very expressive thick eyebrows, small rosy cheeks, simple hands, slightly big heads (1:4 body ratio). "
         "Backgrounds are detailed, warm and slightly desaturated so characters pop. No text, no watermark, no logo.")
CAST = ("Character A 'the office guy': Thai man ~27, messy black hair with one cowlick, big round black glasses, "
        "mustard-yellow hoodie, grey slacks, white sneakers, tired deadpan face. "
        "Character B 'the auntie': Thai woman ~55, short curly permed hair dyed reddish-brown, red-and-white floral "
        "blouse, gold necklace, holding a folding fan, confident bossy face. "
        "Character C 'the cool girl': Thai woman ~24, black bob haircut with straight bangs, oversized light-denim "
        "jacket over a white tee, small silver hoop earrings, calm smirk.")

PROMPTS = {
    "sheet": f"{STYLE}\nCharacter model sheet on a plain cream background: the three characters standing side by "
             f"side, full body, front view, neutral poses, evenly spaced. {CAST}",
    "shot_wide": f"{STYLE}\nVertical 9:16 frame. Inside a crowded Bangkok skytrain carriage in the evening. "
                 f"The office guy sits on the bench hugging his backpack, eyes closed. The auntie stands in front of "
                 f"him, fanning herself, glaring down at him. The cool girl stands by the door watching, holding the "
                 f"pole. Same three characters as the reference sheet, identical design. {CAST}",
    "shot_close_closed": f"{STYLE}\nVertical 9:16 close-up of the auntie's face and shoulders, angry, eyebrows down, "
                         f"MOUTH CLOSED, skytrain window behind her. Identical design to the reference sheet. {CAST}",
    "shot_close_open": f"{STYLE}\nThe exact same picture as the reference close-up, identical pose, framing, "
                       f"lighting and background, but her MOUTH WIDE OPEN as if shouting. Change nothing else.",
}


def gemini_image_models() -> list[str]:
    r = requests.get(f"{API}/models", params={"key": KEY, "pageSize": 200}, timeout=30)
    out = []
    for m in r.json().get("models", []):
        n = m["name"].replace("models/", "")
        if "image" in n and "generateContent" in m.get("supportedGenerationMethods", []):
            out.append(n)
    return out


def gemini_generate(model: str, prompt: str, refs: list[Path]) -> tuple[bytes | None, str]:
    parts = [{"text": prompt}]
    for p in refs:
        parts.append({"inline_data": {"mime_type": "image/png", "data": base64.b64encode(p.read_bytes()).decode()}})
    body = {"contents": [{"role": "user", "parts": parts}],
            "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}}
    r = requests.post(f"{API}/models/{model}:generateContent", params={"key": KEY}, json=body, timeout=240)
    if r.status_code != 200:
        return None, f"HTTP {r.status_code}: {r.text[:300]}"
    for c in r.json().get("candidates", []):
        for p in c.get("content", {}).get("parts", []):
            d = p.get("inlineData") or p.get("inline_data")
            if d and d.get("data"):
                return base64.b64decode(d["data"]), "ok"
    return None, "no image in answer: " + json.dumps(r.json())[:300]


def pollinations(prompt: str, w=720, h=1280, seed=7) -> tuple[bytes | None, str]:
    url = "https://image.pollinations.ai/prompt/" + urllib.parse.quote(prompt[:1500])
    try:
        r = requests.get(url, params={"width": w, "height": h, "seed": seed, "nologo": "true", "model": "flux"},
                         timeout=180)
        if r.status_code == 200 and r.headers.get("content-type", "").startswith("image"):
            return r.content, "ok"
        return None, f"HTTP {r.status_code} {r.text[:200]}"
    except Exception as e:  # noqa: BLE001
        return None, str(e)


def main():
    rep = ["# Image generator test", ""]
    models = gemini_image_models() if KEY else []
    rep.append(f"Gemini image models visible to this key: {models or 'none'}")
    done = False
    for model in models:
        rep.append(f"\n## Gemini {model}")
        files: dict[str, Path] = {}
        for name, prompt in PROMPTS.items():
            refs = [files["sheet"]] if name in ("shot_wide", "shot_close_closed") and "sheet" in files else []
            if name == "shot_close_open" and "shot_close_closed" in files:
                refs = [files["shot_close_closed"]]
            t0 = time.time()
            img, msg = gemini_generate(model, prompt, refs)
            rep.append(f"- {name}: {msg} ({time.time() - t0:.0f}s)")
            if img:
                p = OUT / f"imgtest_gemini_{model.replace('.', '-')}_{name}.png"
                p.write_bytes(img)
                files[name] = p
            elif "429" in msg or "quota" in msg.lower():
                break
            time.sleep(6)
        if len(files) >= 2:
            done = True
            break
    rep.append("\n## Pollinations (free, no key)")
    for name in ("sheet", "shot_wide", "shot_close_closed"):
        img, msg = pollinations(PROMPTS[name], *((1280, 720) if name == "sheet" else (720, 1280)))
        rep.append(f"- {name}: {msg}")
        if img:
            (OUT / f"imgtest_pollinations_{name}.jpg").write_bytes(img)
        time.sleep(5)
    rep.append(f"\nGemini produced a usable set: {done}")
    (OUT / "imgtest_report.md").write_text("\n".join(rep), encoding="utf-8")
    print("\n".join(rep))


if __name__ == "__main__":
    main()
