"""Word-by-word 'karaoke' captions as an .ass file (burned in by FFmpeg/libass)."""
from __future__ import annotations

import re
from pathlib import Path

from .common import hex_to_rgb, read_json


def _ass_color(hex_color: str, alpha: int = 0) -> str:
    r, g, b = hex_to_rgb(hex_color)
    return f"&H{alpha:02X}{b:02X}{g:02X}{r:02X}"


def _t(sec: float) -> str:
    sec = max(sec, 0)
    h = int(sec // 3600)
    m = int(sec % 3600 // 60)
    s = sec % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def _clean(w: str) -> str:
    return re.sub(r"[{}\\]", "", w)


def _norm(s: str) -> str:
    return re.sub(r"[^0-9a-z]", "", s.lower())


def restore_punctuation(words: list[dict], texts: list[str]) -> list[dict]:
    """TTS word events often drop punctuation; copy it back from the script tokens."""
    tokens = " ".join(texts).split()
    j, out = 0, []
    for w in words:
        nw = _norm(w["w"])
        for k in range(j, min(j + 4, len(tokens))):
            if _norm(tokens[k]) == nw and nw:
                out.append({**w, "w": tokens[k]})
                j = k + 1
                break
        else:
            out.append(w)
    return out


def chunk_words(words: list[dict], max_words: int, max_chars: int, breaks: set[int] | None = None) -> list[list[dict]]:
    chunks, cur = [], []
    breaks = breaks or set()
    for idx, w in enumerate(words):
        if cur and idx in breaks:  # a new scene starts: never let a caption straddle the cut
            chunks.append(cur)
            cur = []
        cur_len = sum(len(x["w"]) + 1 for x in cur)
        if cur and (len(cur) >= max_words or cur_len + len(w["w"]) > max_chars):
            chunks.append(cur)
            cur = []
        cur.append(w)
        if re.search(r"[.!?;:,]$", w["w"]) and len(cur) >= 1:
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    return chunks


def build_ass(cfg: dict, words_path: Path, out: Path, scene_starts: list[float] | None = None,
              script_text: list[str] | None = None) -> Path:
    st = cfg["style"]
    words = read_json(words_path, [])
    if script_text:
        words = restore_punctuation(words, script_text)
    breaks = set()
    for st_t in (scene_starts or [])[1:]:
        idx = next((i for i, w in enumerate(words) if w["start"] >= st_t), None)
        if idx:
            breaks.add(idx)
    upper = st.get("sub_uppercase", True)
    font = st.get("font_name", "Poppins")
    size = st.get("sub_size_word", 120) if st.get("caption_mode", "chunk") == "word" else st.get("sub_size", 88)
    hi = _ass_color(st.get("accent", "#FFD400"))
    lines = [
        "[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920", "WrapStyle: 0",
        "ScaledBorderAndShadow: yes", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, "
        "Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, "
        "MarginL, MarginR, MarginV, Encoding",
        f"Style: Sub,{font},{size},&H00FFFFFF,&H000000FF,&H00000000,&H78000000,-1,0,0,0,100,100,1,0,1,"
        f"{st.get('sub_outline', 7)},3,2,120,120,{st.get('sub_margin_v', 560)},1",
        "",
        "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]
    one_word = st.get("caption_mode", "chunk") == "word"
    chunks = chunk_words(words, 1 if one_word else st.get("words_per_chunk", 3), st.get("chars_per_chunk", 18), breaks)
    for ci, ch in enumerate(chunks):
        nxt = chunks[ci + 1][0]["start"] if ci + 1 < len(chunks) else ch[-1]["end"] + 0.4
        chunk_end = min(ch[-1]["end"] + 0.25, nxt)
        for wi, w in enumerate(ch):
            # first caption is on screen from frame 0, so the loop seam never shows an empty frame
            start = 0.0 if (ci == 0 and wi == 0 and w["start"] < 0.3) else w["start"]
            end = ch[wi + 1]["start"] if wi + 1 < len(ch) else chunk_end
            if end <= start:
                continue
            parts = []
            for k, x in enumerate(ch):
                txt = _clean(x["w"].upper() if upper else x["w"])
                if k == wi:
                    parts.append(f"{{\\c{hi}\\fscx112\\fscy112}}{txt}{{\\r}}")
                else:
                    parts.append(txt)
            pop = "{\\fad(40,0)}" if wi == 0 else ""
            lines.append(f"Dialogue: 0,{_t(start)},{_t(end)},Sub,,0,0,0,,{pop}{' '.join(parts)}")
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return out
