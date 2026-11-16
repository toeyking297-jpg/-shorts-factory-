"""Weekly analyst: turns real results into small, bounded, reversible changes to how clips are made.

Reads memory/analytics_summary.json + memory/clips/*.json, compares clips at the SAME age (first 7 days),
and writes:
  memory/learned.json         active changes (format weights, script length, writer notes) + their baseline
  memory/analyst_report.md    Thai summary for the owner (also sent to the phone)
Guardrails:
  - no change at all until at least MIN_CLIPS clips have 7-day data
  - each change is bounded (learned.LIMITS) and recorded with the baseline it must beat
  - a change that made things worse after enough new clips is rolled back automatically
  - the owner can switch any change off from the dashboard (memory/overrides.json)
  - code is never changed here, only these settings
"""
from __future__ import annotations

import datetime as dt
import os
import statistics

from . import brain
from .common import MEMORY, log, read_json, write_json
from .learned import LIMITS

MIN_CLIPS = 10
EVAL_AFTER = 5     # clips made after a change before judging it


def _d7(c):
    w = (c.get("windows") or {}).get("d7") or {}
    return w.get("engagedViews") or w.get("views")


def _pct(c):
    w = (c.get("windows") or {}).get("d7") or {}
    return w.get("averageViewPercentage")


def notify(title: str, msg: str) -> None:
    topic = os.environ.get("NTFY_TOPIC")
    if not topic:
        return
    try:
        import requests
        owner = os.environ.get("GITHUB_REPOSITORY_OWNER", "")
        requests.post(f"https://ntfy.sh/{topic}", data=msg.encode("utf-8"), timeout=20,
                      headers={"Title": title,
                               "Tags": "bar_chart", "Click": f"https://{owner}.github.io/-shorts-dashboard-/"})
    except Exception as e:  # noqa: BLE001
        log(f"notify failed: {e}")


def run(force: bool = False) -> dict:
    summ = read_json(MEMORY / "analytics_summary.json", {}) or {}
    clips = [c for c in summ.get("clips", []) if c.get("video_id") and c.get("video_confirmed")]
    rated = [c for c in clips if _d7(c) is not None]
    learned = read_json(MEMORY / "learned.json", {"version": 1, "changes": []}) or {"version": 1, "changes": []}
    changes = learned.setdefault("changes", [])
    hist = read_json(MEMORY / "history.json", [])
    week = (dt.date.today() - dt.timedelta(days=7)).isoformat()
    made = [h for h in hist if h.get("date", "") >= week]
    lines = [f"# สรุปประจำสัปดาห์ ({dt.date.today():%d/%m/%Y})", "",
             f"- ทำคลิป 7 วันล่าสุด: {len(made)} คลิป (พร้อมลง {sum(1 for h in made if h.get('status') == 'ready')}, "
             f"ต้องดูก่อน {sum(1 for h in made if h.get('status') == 'needs_review')}, "
             f"ล้มเหลว {sum(1 for h in made if h.get('status') == 'failed')})",
             f"- ใช้ Gemini ไป {sum(h.get('gemini_calls') or 0 for h in made)} ครั้ง "
             f"(เฉลี่ย {round(statistics.mean([h.get('seconds') or 0 for h in made]) / 60, 1) if made else 0} นาที/คลิป)",
             f"- คลิปที่ผูกกับ YouTube แล้ว: {len(clips)} · มีข้อมูลครบ 7 วัน: {len(rated)}"]
    if summ.get("oauth") is False:
        lines.append("- ยังไม่ได้เปิดสถิติเชิงลึก (ทำตาม SETUP_ANALYTICS_TH.md) ตอนนี้เห็นแค่ยอดวิวสาธารณะ")
    top = sorted(clips, key=lambda c: -((c.get("public") or {}).get("views") or 0))[:3]
    if top:
        lines += ["", "## คลิปที่วิวสูงสุด"] + [f"- {c.get('title')} — {((c.get('public') or {}).get('views') or 0):,} วิว"
                                                for c in top]

    # ---------- evaluate active changes (automatic rollback)
    for ch in changes:
        if ch.get("status") != "active" or not ch.get("baseline_median"):
            continue
        after = [c for c in rated if (c.get("date") or "") > ch["date"]]
        if len(after) >= EVAL_AFTER:
            med = statistics.median(_d7(c) for c in after)
            ch["evaluated"] = {"clips": len(after), "median_d7": med, "date": dt.date.today().isoformat()}
            if med < 0.8 * ch["baseline_median"]:
                ch["status"] = "rolled_back"
                lines.append(f"- ↩️ ย้อนการปรับ {ch['id']} ({ch['kind']} {ch.get('key', '')}) เพราะผลแย่ลง "
                             f"({int(med):,} vs เดิม {int(ch['baseline_median']):,} วิวใน 7 วัน)")

    if len(rated) < MIN_CLIPS and not force:
        lines += ["", f"## ทีมวิเคราะห์: ยังไม่ปรับระบบ", f"ต้องมีคลิปที่มีข้อมูล 7 วันอย่างน้อย {MIN_CLIPS} คลิป "
                  f"(ตอนนี้ {len(rated)}) ตัวเลขช่วงแรกแกว่งมาก ปรับตอนนี้เสี่ยงเรียนรู้ผิด"]
        return _finish(learned, lines)

    med_all = statistics.median(_d7(c) for c in rated)
    new_changes = []
    # ---------- format weights (equal-age 7-day views, at least 3 clips per format)
    fm: dict[str, list] = {}
    for c in rated:
        fm.setdefault(c.get("format") or "unknown", []).append(_d7(c))
    current = {c["key"]: c for c in changes if c.get("kind") == "format_weight" and c.get("status") == "active"}
    for f, vals in fm.items():
        if len(vals) < 3 or f == "unknown":
            continue
        ratio = statistics.median(vals) / max(med_all, 1)
        lo, hi = LIMITS["format_weight"]
        w = round(max(lo, min(hi, ratio ** 0.5)), 2)
        old = float(current[f]["value"]) if f in current else 1.0
        if abs(w - old) >= 0.15:
            if f in current:
                current[f]["status"] = "replaced"
            new_changes.append({"kind": "format_weight", "key": f, "value": w,
                                "why": f"{f}: median {int(statistics.median(vals)):,} views in 7 days vs channel "
                                       f"{int(med_all):,} ({len(vals)} clips)"})
    # ---------- length vs average view percentage
    pairs = [(c, _pct(c)) for c in rated if _pct(c) is not None]
    if len(pairs) >= MIN_CLIPS:
        clip_recs = {p.stem: read_json(p, {}) for p in (MEMORY / "clips").glob("*.json")}
        long_ = [p for c, p in pairs if (clip_recs.get(c["episode"], {}).get("words") or 0) >= 130]
        short = [p for c, p in pairs if 0 < (clip_recs.get(c["episode"], {}).get("words") or 0) < 120]
        if len(long_) >= 3 and len(short) >= 3 and statistics.mean(short) - statistics.mean(long_) >= 8:
            new_changes.append({"kind": "words_max", "key": "", "value": 125,
                                "why": f"clips under 120 words keep {statistics.mean(short):.0f}% watched vs "
                                       f"{statistics.mean(long_):.0f}% for 130+ words"})
    # ---------- scene types where viewers leave
    drops: dict[str, list] = {}
    for c in rated:
        ws = c.get("worst_scene")
        if ws:
            drops.setdefault(f"{ws.get('kind')}/{ws.get('overlay') or '-'}", []).append(ws["drop_per_s"])
    worst_kind = max(drops.items(), key=lambda kv: (len(kv[1]), statistics.mean(kv[1])))[0] if drops else None
    # ---------- writer notes from the best vs worst hooks (Gemini, bounded)
    if brain.available():
        srt = sorted(rated, key=lambda c: -_d7(c))
        best, worst = srt[:5], srt[-5:]
        try:
            res, _ = brain.ask_json(
                "You analyse a YouTube Shorts channel. Compare the best and worst clips (same age: first 7 days).\n"
                "BEST:\n" + "\n".join(f"- {_d7(c)} views, {_pct(c)}% watched | {c.get('format')} | {c.get('title')}"
                                      for c in best) +
                "\nWORST:\n" + "\n".join(f"- {_d7(c)} views, {_pct(c)}% watched | {c.get('format')} | {c.get('title')}"
                                         for c in worst) +
                (f"\nScene type where viewers most often leave: {worst_kind}" if worst_kind else "") +
                "\nWrite at most 2 short, concrete instructions for the script writer that would make new clips more "
                "like the best ones (about hooks, topics, pacing or pictures). Only patterns clearly supported by "
                "the data; if nothing is clear, return an empty list. Also write a 2-3 sentence summary IN THAI "
                "for the owner. Return JSON {\"notes\": [\"...\"], \"summary_th\": \"...\"}")
            for n in (res.get("notes") or [])[:2]:
                new_changes.append({"kind": "writer_note", "key": "", "value": str(n)[:300],
                                    "why": "pattern in best vs worst clips (first 7 days)"})
            if res.get("summary_th"):
                lines += ["", "## ทีมวิเคราะห์พบว่า", str(res["summary_th"])[:800]]
        except Exception as e:  # noqa: BLE001
            log(f"analyst notes skipped: {e}")
    if worst_kind:
        lines.append(f"- คนดูออกบ่อยที่สุดตอนฉากประเภท: {worst_kind}")

    n0 = len(changes)
    for k, ch in enumerate(new_changes, 1):
        ch.update({"id": f"c{n0 + k}", "date": dt.date.today().isoformat(), "status": "active",
                   "baseline_median": med_all, "baseline_clips": len(rated)})
        changes.append(ch)
    if new_changes:
        lines += ["", "## ระบบปรับอะไรบ้างสัปดาห์นี้ (ยกเลิกได้ในแดชบอร์ด แท็บ ผล)"] + \
                 [f"- {c['id']}: {c['kind']} {c.get('key', '')} = {c['value']} — {c['why']}" for c in new_changes]
    else:
        lines += ["", "## สัปดาห์นี้ไม่มีการปรับ (ยังไม่เห็นรูปแบบที่ชัดพอ)"]
    return _finish(learned, lines)


def _finish(learned: dict, lines: list[str]) -> dict:
    learned["updated"] = dt.datetime.now().isoformat(timespec="minutes")
    write_json(MEMORY / "learned.json", learned)
    text = "\n".join(lines) + "\n"
    (MEMORY / "analyst_report.md").write_text(text, encoding="utf-8")
    log("analyst report written")
    notify("Shorts Factory: weekly report", "\n".join(l for l in lines if l and not l.startswith("#"))[:1800])
    return learned
