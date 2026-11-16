"""Subtitles from the approved script (not from ASR), timed on real audio. Max 2 lines, keywords in yellow."""
from __future__ import annotations

from .common import FONT

STYLE_FONT = "Kanit SemiBold"
SIZE = 70
MARGIN_V = 400          # text bottom at y = 1520 (79%): below the chin in close-ups, above the Shorts title area
MARGIN_LR = 120
YELLOW = "&H0030D7FF&"  # ASS is &HBBGGRR


def cues(script, lines):
    out = []
    dl = script["dialogue"]
    for i, ln in enumerate(dl):
        L = lines[ln["dialogue_id"]]
        nxt = lines[dl[i + 1]["dialogue_id"]]["start"] if i + 1 < len(dl) else L["end"] + 1.2
        start = L["start"]
        end = min(max(L["end"] + 0.3, start + 0.9), nxt - 0.03)
        out.append(dict(dialogue_id=ln["dialogue_id"], start=round(start, 3), end=round(end, 3),
                        lines=ln["subtitle"].split("|"), highlight=ln.get("highlight", [])))
    return out


def _ts_ass(t):
    h, r = divmod(t, 3600)
    m, s = divmod(r, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def _ts_srt(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def _hl(text, words):
    for w in sorted(words, key=len, reverse=True):
        if w and w in text:
            text = text.replace(w, "{\\c" + YELLOW + "}" + w + "{\\c&H00FFFFFF&}", 1)
    return text


def write_ass(cues, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    head = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920", "WrapStyle: 2",
            "ScaledBorderAndShadow: yes", "", "[V4+ Styles]",
            "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, "
            "Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, "
            "MarginR, MarginV, Encoding",
            f"Style: Sub,{STYLE_FONT},{SIZE},&H00FFFFFF,&H000000FF,&H00201418,&H64000000,0,0,0,0,100,100,0,0,1,7,2,2,"
            f"{MARGIN_LR},{MARGIN_LR},{MARGIN_V},222", "", "[Events]",
            "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    ev = []
    for c in cues:
        txt = "\\N".join(_hl(l, c["highlight"]) for l in c["lines"])
        ev.append(f"Dialogue: 0,{_ts_ass(c['start'])},{_ts_ass(c['end'])},Sub,{c['dialogue_id']},0,0,0,,{txt}")
    path.write_text("\n".join(head + ev) + "\n", encoding="utf-8")


def write_srt(cues, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    out = []
    for i, c in enumerate(cues, 1):
        out += [str(i), f"{_ts_srt(c['start'])} --> {_ts_srt(c['end'])}", "\n".join(c["lines"]), ""]
    path.write_text("\n".join(out), encoding="utf-8")


def measure(cues):
    """Pixel width of every subtitle line with the real font (for QA)."""
    from PIL import ImageFont
    f = ImageFont.truetype(str(FONT), SIZE)
    res = []
    for c in cues:
        for l in c["lines"]:
            res.append(dict(dialogue_id=c["dialogue_id"], text=l, width_px=int(f.getlength(l)),
                            max_px=1080 - 2 * MARGIN_LR, lines=len(c["lines"])))
    return res
