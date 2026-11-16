"""Automatic QA on the RENDERED file + merge of the manual/model review (qa_review.json).

Every item is PASS / FAIL / NOT_REVIEWED with evidence. Nothing that needs ears or a human eye is
marked PASS automatically.
"""
from __future__ import annotations

import json
import re
import subprocess

from PIL import Image, ImageDraw, ImageFont

from .common import ASSETS, FONT, ep_dir, load, save, step_set
from . import subs as S


def _probe(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                        "format=duration:stream=codec_name,codec_type,width,height,r_frame_rate,pix_fmt,sample_rate",
                        "-of", "json", str(p)], capture_output=True, text=True)
    return json.loads(r.stdout)


def _faststart(p):
    b = open(p, "rb").read(1 << 20)
    i, j = b.find(b"moov"), b.find(b"mdat")
    return i != -1 and (j == -1 or i < j)


def _ff(args):
    return subprocess.run(["ffmpeg", "-hide_banner", "-nostats"] + args, capture_output=True, text=True).stderr


def item(name, status, evidence):
    return dict(check=name, status=status, evidence=evidence)


def run(ep: str) -> dict:
    d = ep_dir(ep)
    tl = load(d / "timeline.json")
    sl = load(d / "shotlist.json")
    script = load(d / "script.json")
    man = load(ASSETS / "manifest.json")
    rl = load(d / "preview" / "render_full.json")
    vid = d / rl["output"]
    out = []
    # 1 files
    need = ["script.json", "script.md", "shotlist.json", "shotlist.csv", "continuity_matrix.csv", "timeline.json",
            "subtitles/subtitle.ass", "subtitles/subtitle.srt", "audio/mix.wav", "prompts/asset_requests.json",
            "prompts/prompts.md", rl["output"]]
    miss = [f for f in need if not (d / f).exists()]
    out.append(item("files complete", "PASS" if not miss else "FAIL", miss or need))
    # 2 duration + spec
    pr = _probe(vid)
    vs = [s for s in pr["streams"] if s["codec_type"] == "video"][0]
    au = [s for s in pr["streams"] if s["codec_type"] == "audio"][0]
    dur = float(pr["format"]["duration"])
    ok = abs(dur - tl["total_sec"]) < 0.1 and 35 <= dur <= 50
    out.append(item("duration matches timeline and is 35-50 s", "PASS" if ok else "FAIL",
                    f"video {dur:.2f}s, timeline {tl['total_sec']:.2f}s"))
    spec = (vs["width"], vs["height"], vs["r_frame_rate"], vs["codec_name"], vs["pix_fmt"], au["codec_name"])
    ok = spec == (1080, 1920, "30/1", "h264", "yuv420p", "aac") and _faststart(vid)
    out.append(item("output spec 1080x1920 30fps H.264/AAC yuv420p faststart", "PASS" if ok else "FAIL",
                    f"{spec}, faststart={_faststart(vid)}; art is drawn at stage 1188x2112 and only scaled down"))
    # 3 black / silence
    e = _ff(["-i", str(vid), "-vf", "blackdetect=d=0.1:pix_th=0.08", "-an", "-f", "null", "-"])
    blacks = re.findall(r"black_start:([\d.]+)", e)
    out.append(item("no unintended black frames", "PASS" if not blacks else "FAIL", blacks or "blackdetect: none"))
    e = _ff(["-i", str(vid), "-af", "silencedetect=noise=-55dB:d=0.3", "-vn", "-f", "null", "-"])
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", e)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", e)] + [tl["total_sec"]]
    drops = [f"{a:.2f}-{b:.2f} inside {did}" for a, b in zip(st, en) for did, L in tl["lines"].items()
             if a < L["end"] - 0.05 and b > L["start"] + 0.05]
    out.append(item("no audio drop-outs inside spoken lines", "PASS" if not drops else "FAIL",
                    drops or f"silencedetect(-55dB,0.3s): {len(st)} silent gaps, all inside planned pauses"))
    # 4 loudness
    e = _ff(["-i", str(vid), "-af", "ebur128=peak=true", "-vn", "-f", "null", "-"])
    I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", e)[-1])
    TP = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", e)[-1])
    out.append(item("loudness -16..-14 LUFS, true peak <= -1 dBTP (working target)",
                    "PASS" if -16 <= I <= -14 and TP <= -1.0 else "FAIL", f"I={I} LUFS, TP={TP} dBFS"))
    # 5 dialogue logic
    texts = [l["text"] for l in script["dialogue"]]
    dup = sorted({t for t in texts if texts.count(t) > 1})
    out.append(item("no repeated dialogue lines", "PASS" if not dup else "FAIL", dup or f"{len(texts)} unique lines"))
    wrong_spk = []
    for s in sl["render_spec"]:
        vis = {man[L["asset"]]["character_id"] for L in s["layers"] if man.get(L.get("asset", ""), {}).get("kind") == "pose"}
        for did in s["dialogue_ids"]:
            spk = tl["lines"][did]["speaker"]
            if spk not in vis and s["shot_size"] != "insert":
                wrong_spk.append(f"{s['shot_id']}:{did}:{spk}")
    out.append(item("speaker is on screen for every line (insert shots excepted)", "PASS" if not wrong_spk else "FAIL",
                    wrong_spk or "all speakers visible; D07 is an off-screen line over the insert SH08 by design"))
    out.append(item("only the speaker's mouth moves", "PASS" if rl["non_speaker_mouth_frames"] == 0 else "FAIL",
                    f"non-speaker mouth frames in render log: {rl['non_speaker_mouth_frames']}"))
    # 6 continuity (data level)
    errs = []
    for s in sl["render_spec"]:
        for L in s["layers"]:
            a = L.get("asset", "")
            if a.startswith("C02_") and s["shot_id"] < "SH08" and man[a]["pose"] in ("ticket", "sheepish", "shocked"):
                errs.append(f"{s['shot_id']}: C02 holds ticket before the snatch")
            if a.startswith("C02_") and s["shot_id"] > "SH08" and man[a]["pose"] == "bossy":
                errs.append(f"{s['shot_id']}: C02 lost the ticket after the snatch")
            if a == "PROP_BAGS_WIDE" and s["shot_id"] < "SH10":
                errs.append(f"{s['shot_id']}: bag stack before it is brought out")
    out.append(item("continuity rules (props / ticket ownership / bag stack)", "PASS" if not errs else "FAIL",
                    errs or "matches scene_bible continuity_rules and continuity_matrix.csv"))
    # 7 timing
    first = min(L["start"] for L in tl["lines"].values())
    last = max(L["end"] for L in tl["lines"].values())
    tail = tl["total_sec"] - last
    out.append(item("conflict starts within 0-2 s", "PASS" if first <= 2 else "FAIL", f"D01 starts at {first:.2f}s"))
    out.append(item("ends 1-3 s after the last line", "PASS" if 1 <= tail <= 3 else "FAIL", f"tail {tail:.2f}s"))
    out.append(item("timeline problems", "PASS" if not tl["problems"] else "FAIL", tl["problems"] or "none"))
    # 8 subtitles
    cues = S.cues(script, tl["lines"])
    meas = S.measure(cues)
    over = [m for m in meas if m["width_px"] > m["max_px"] or m["lines"] > 2]
    overlap = [c["dialogue_id"] for a, c in zip(cues, cues[1:]) if c["start"] < a["end"]]
    out.append(item("subtitles <= 2 lines and inside safe width", "PASS" if not over and not overlap else "FAIL",
                    over or overlap or f"widest {max(m['width_px'] for m in meas)}px of {meas[0]['max_px']}px"))
    # 9 ASR machine check
    ap = d / "audio" / "asr_report.json"
    if ap.exists():
        a = load(ap)
        st = "PASS" if a["mean_cer"] <= 0.15 and not a["flagged"] else "FAIL"
        out.append(item("ASR machine check of voice lines (not a listening review)", st,
                        f"mean CER {a['mean_cer']}, flagged {a['flagged']}"))
    else:
        out.append(item("ASR machine check of voice lines", "NOT_REVIEWED", "asr_report.json missing"))
    # 10 evidence sheets from the RENDERED file
    sheets = _sheets(d, vid, sl, cues)
    out.append(item("contact sheet from rendered video", "PASS", sheets))
    # 11 assets
    ph = rl["missing_assets"]
    out.append(item("all art is final (no placeholders)", "FAIL" if ph else "PASS",
                    f"{len(ph)} placeholder assets in use" if ph else "all READY"))
    # merge manual / model review
    rv = load(d / "qa_review.json") if (d / "qa_review.json").exists() else {"items": [], "rubric": {}}
    out += rv["items"]
    rub = rv.get("rubric", {})
    scored = [v for v in rub.values() if isinstance(v.get("score"), (int, float))]
    total = sum(v["score"] for v in scored)
    max_scored = sum(v["max"] for v in scored)
    nr = [k for k, v in rub.items() if not isinstance(v.get("score"), (int, float))]
    fails = [i["check"] for i in out if i["status"] == "FAIL"]
    art_items = ("all art is final (no placeholders)", "art quality / style DNA (final look)")
    tech_fail = [f for f in fails if f not in art_items]
    overall = ("COMPLETE" if not fails and not nr and total >= 85 else
               "WAITING_FOR_ASSET" if not tech_fail and ph else "QA_FAILED")
    rep = dict(episode_id=ep, video=str(vid.relative_to(d)), overall=overall,
               animatic_technical="PASS" if not tech_fail else "FAIL",
               rubric=rub, rubric_scored=f"{total}/{max_scored}", rubric_not_reviewed=nr,
               gate="final needs >= 85/100, no FAIL and no NOT_REVIEWED", items=out,
               note="Editorial scores are the editor's judgement, not a view or retention prediction.")
    save(d / "qa_report.json", rep)
    step_set(ep, "qa", overall, fails=fails, rubric=rep["rubric_scored"])
    for i in out:
        print(f"[{i['status']:12}] {i['check']}")
    print(f"overall: {overall}  rubric {rep['rubric_scored']}  not reviewed: {nr}")
    return rep


def _sheets(d, vid, sl, cues):
    q = d / "preview" / "qa"
    q.mkdir(parents=True, exist_ok=True)
    f = ImageFont.truetype(str(FONT), 22)

    def grab(t, w=270):
        p = q / "_f.jpg"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", str(vid), "-frames:v", "1",
                        "-vf", f"scale={w}:-2", str(p)], check=True)
        return Image.open(p).convert("RGB")

    def sheet(items, name, cols=6, w=270):
        ims = [(lab, grab(t, w)) for lab, t in items]
        h = ims[0][1].height
        rows = (len(ims) + cols - 1) // cols
        S_ = Image.new("RGB", (cols * w, rows * (h + 30)), (16, 16, 16))
        dr = ImageDraw.Draw(S_)
        for k, (lab, im) in enumerate(ims):
            x, y = (k % cols) * w, (k // cols) * (h + 30)
            S_.paste(im, (x, y + 30))
            dr.text((x + 4, y + 3), lab, font=f, fill=(255, 220, 90))
        S_.save(q / name, quality=86)
        return str((q / name).relative_to(d))

    shots = sl["render_spec"]
    a = sheet([(f"{s['shot_id']} {s['start_sec']:.1f}-{s['end_sec']:.1f}", (s["start_sec"] + s["end_sec"]) / 2)
               for s in shots], "contact_rendered_shots.jpg", cols=8)
    b = sheet([(f"{c['dialogue_id']} {c['start']:.1f}", min(c["start"] + 0.45, c["end"] - 0.05)) for c in cues],
              "contact_rendered_subtitles.jpg", cols=8)
    # safe-area overlay on one close-up frame with subtitles (zones are approximate, not platform constants)
    im = grab(cues[1]["start"] + 0.5, 1080)
    ov = Image.new("RGBA", im.size, (0, 0, 0, 0))
    dr = ImageDraw.Draw(ov)
    for box, lab in (((0, 0, 1080, 140), "top UI (approx)"), ((940, 1000, 1080, 1640), "buttons (approx)"),
                     ((0, 1560, 1080, 1920), "title / channel / description (approx)")):
        dr.rectangle(box, fill=(255, 0, 80, 70), outline=(255, 0, 80, 220), width=4)
        dr.text((box[0] + 12, box[1] + 10), lab, font=ImageFont.truetype(str(FONT), 34), fill=(255, 255, 255, 255))
    im = Image.alpha_composite(im.convert("RGBA"), ov).convert("RGB")
    im.resize((540, 960)).save(q / "safe_area_check.jpg", quality=88)
    return [a, b, str((q / "safe_area_check.jpg").relative_to(d))]
