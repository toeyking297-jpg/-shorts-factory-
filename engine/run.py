"""Command line for the Shorts Factory.

  python -m engine.run doctor                 check FFmpeg, packages, API keys
  python -m engine.run new "Topic title"      create the next episode folder (EP001_topic-title)
  python -m engine.run trends --niche "..."    trend radar -> trends/latest.json
  python -m engine.run auto --niche "..." --count 3   FULL AUTO (needs GEMINI_API_KEY)
  python -m engine.run quick [inbox.json]     FREE MODE: script JSON from any chat AI -> finished video
  python -m engine.run make EP001             voice -> footage -> edit -> QC -> upload sheet
  python -m engine.run make EP001 --from render        restart from a step (tts|footage|render|check|package)
  python -m engine.run make EP001 --scenes 3,5         re-render only these scenes, then rebuild the final
  python -m engine.run make EP001 --refetch 3,5        throw away footage for these scenes and search again
  python -m engine.run analytics              bind clips to YouTube videos + fetch equal-age results
  python -m engine.run analyst [--force]      weekly analysis -> bounded, reversible settings + Thai report
  python -m engine.run voices                 voice samples (Edge + Kokoro) for choosing by ear
  python -m engine.run owner --action use|discard|bind|confirm|voice|undo_change|redo_change --target EP001 --value ...
"""
from __future__ import annotations

import argparse
import json
import importlib.util
import os
import re
import shutil
import sys

from .common import EPISODES, FINAL, ROOT, find_episode, load_config, load_env, log, read_json, write_json  # noqa: F401

STEPS = ["tts", "footage", "render", "check", "package"]


def slugify(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:40]


def cmd_doctor() -> None:
    ok = True
    for exe in ("ffmpeg", "ffprobe"):
        found = shutil.which(exe)
        print(f"{'OK ' if found else 'MISSING'} {exe} {found or ''}")
        ok &= bool(found)
    for mod in ("PIL", "requests", "edge_tts"):
        found = importlib.util.find_spec(mod) is not None
        print(f"{'OK ' if found else 'MISSING'} python package {mod}")
        ok &= found
    load_env()
    has_px = bool(os.environ.get("PIXABAY_API_KEY"))
    has_pe = bool(os.environ.get("PEXELS_API_KEY"))
    print(f"{'OK ' if has_px else 'MISSING'} PIXABAY_API_KEY  (main footage source, free: pixabay.com/api/docs)")
    print(f"{'OK ' if has_pe else 'optional'} PEXELS_API_KEY  (extra footage source)")
    print(f"{'OK ' if os.environ.get('ELEVENLABS_API_KEY') else 'optional'} ELEVENLABS_API_KEY")
    print(f"{'OK ' if os.environ.get('GEMINI_API_KEY') else 'optional'} GEMINI_API_KEY  (automatic mode: aistudio.google.com/apikey)")
    print(f"{'OK ' if os.environ.get('YOUTUBE_API_KEY') else 'optional'} YOUTUBE_API_KEY  (trend radar)")
    print("OK  Wikimedia Commons + NASA (no key needed)")
    ok &= has_px or has_pe
    print("\nReady." if ok else "\nFix the MISSING items (see SETUP_TH.md).")


def cmd_new(title: str):
    EPISODES.mkdir(exist_ok=True)
    nums = [int(m.group(1)) for p in EPISODES.iterdir() if (m := re.match(r"EP(\d+)", p.name))]
    ep_id = f"EP{(max(nums) + 1) if nums else 1:03d}"
    ep = EPISODES / f"{ep_id}_{slugify(title)}"
    ep.mkdir()
    template = read_json(ROOT / "config" / "script_template.json")
    template["id"] = ep_id
    template["topic"] = title
    write_json(ep / "script.json", template)
    print(ep)
    return ep


def cmd_quick(path: str) -> None:
    """Free mode: take the JSON a free chat AI produced (pasted into inbox.json), make the episode."""
    import json
    src = ROOT / path
    raw = src.read_text(encoding="utf-8-sig").strip()
    if not raw:
        sys.exit(f"{src} is empty. Paste the script JSON from the AI chat into it first.")
    raw = re.sub(r"^```(?:json)?|```$", "", raw, flags=re.M).strip()
    try:
        data = json.loads(raw[raw.index("{"): raw.rindex("}") + 1])
    except (ValueError, json.JSONDecodeError) as e:
        sys.exit(f"Could not read the JSON in {src}: {e}\nAsk the AI to send the script again as valid JSON only.")
    if not data.get("scenes"):
        sys.exit("The JSON has no 'scenes'. Ask the AI to follow the format in PROMPT_FREE.md.")
    ep = cmd_new(data.get("topic") or data.get("meta", {}).get("title") or "episode")
    data["id"] = ep.name.split("_")[0]
    write_json(ep / "script.json", data)
    done = src.with_name(f"inbox_used_{data['id']}.json")
    src.replace(done)
    src.write_text("", encoding="utf-8")
    cmd_make(ep.name, "tts", None, None)
    report = read_json(ep / "build" / "report.json", {})
    print("\n==== DONE ====")
    print(f"Video : {FINAL / (ep.name + '.mp4')}")
    print(f"Upload: {FINAL / (ep.name + '_upload.md')}")
    if report.get("issues"):
        print("QC notes (paste these back to the AI to get a fixed script if needed):")
        for it in report["issues"]:
            print("  - " + it)


def _summary(md: str) -> None:
    p = os.environ.get("GITHUB_STEP_SUMMARY")
    if p:
        with open(p, "a", encoding="utf-8") as f:
            f.write(md + "\n")


def cmd_package(ep) -> None:
    """Upload kit (titles, description with sources, pinned comment, captions for other apps) + cover + record."""
    from . import kit
    kit.build(ep)
    kit.clip_record(ep)


def cmd_make(ep_id: str, start: str, scenes: str | None, refetch: str | None) -> None:
    load_env()
    load_config()
    ep = find_episode(ep_id)
    from . import check, footage, render, tts

    if refetch:
        idx = {int(x) for x in refetch.split(",")}
        script = read_json(ep / "script.json")
        for i in idx:
            script["scenes"][i].get("visual", {}).pop("_asset", None)
            script["scenes"][i].get("visual", {}).pop("_kind", None)
            for f in (ep / "assets").glob(f"s{i:02d}.*"):
                f.unlink()
        write_json(ep / "script.json", script)
        start = "footage"
    only = {int(x) for x in scenes.split(",")} if scenes else None
    if only is not None and start == "tts":
        start = "render"
    for step in STEPS[STEPS.index(start):]:
        log(f"=== {step} ===")
        if step == "tts":
            tts.run(ep)
        elif step == "footage":
            footage.run(ep)
        elif step == "render":
            render.run(ep, only)
            only = None
        elif step == "check":
            check.run(ep)
        elif step == "package":
            cmd_package(ep)


def main() -> None:
    ap = argparse.ArgumentParser(prog="python -m engine.run")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("doctor")
    n = sub.add_parser("new")
    n.add_argument("title")
    q = sub.add_parser("quick")
    q.add_argument("file", nargs="?", default="inbox.json")
    t = sub.add_parser("trends")
    t.add_argument("--niche", default="")
    au = sub.add_parser("auto")
    au.add_argument("--niche", default="")
    au.add_argument("--count", default="3")
    au.add_argument("--topics", default="")
    m = sub.add_parser("make")
    m.add_argument("episode")
    m.add_argument("--from", dest="start", choices=STEPS, default="tts")
    m.add_argument("--scenes")
    m.add_argument("--refetch")
    sub.add_parser("analytics")
    an = sub.add_parser("analyst")
    an.add_argument("--force", action="store_true")
    sub.add_parser("voices")
    tn = sub.add_parser("toon")
    tn.add_argument("scripts", nargs="+")
    ow = sub.add_parser("owner")
    ow.add_argument("--action", required=True)
    ow.add_argument("--target", default="")
    ow.add_argument("--value", default="")
    a = ap.parse_args()
    if a.cmd == "doctor":
        cmd_doctor()
    elif a.cmd == "quick":
        load_env()
        cmd_quick(a.file)
    elif a.cmd == "new":
        cmd_new(a.title)
    elif a.cmd == "trends":
        load_env()
        from . import trends
        trends.run(a.niche)
    elif a.cmd == "auto":
        load_env()
        from . import auto
        try:
            count = int(str(a.count).strip() or load_config()["production"].get("daily_count", 3))
        except ValueError:
            count = 3
        try:
            res = auto.produce(a.niche, count, a.topics.replace("\\n", "\n"))
        except BaseException as e:  # make the reason visible on GitHub and in the phone notification
            msg = f"{type(e).__name__}: {e}"
            _summary(f"## ❌ ระบบหยุดทำงาน\n\n```\n{msg[:1500]}\n```\n")
            print("::error title=Shorts Factory::" + msg[:900].replace("\n", " | "), flush=True)
            (FINAL).mkdir(exist_ok=True)
            (FINAL / "error.txt").write_text(msg[:500], encoding="utf-8")
            raise
        fails = [r for r in res if "error" in r]
        _summary("## ผลการทำคลิป\n\n" + "\n".join(
            f"- {'❌ ' + r['topic'] + ': ' + r['error'][:300] if 'error' in r else '✅ ' + r['title']}" for r in res))
        for r in fails:
            print(f"::warning title=Episode failed::{r['topic']}: {r['error'][:600]}".replace("\n", " | "), flush=True)
        if fails and len(fails) == len(res):
            (FINAL / "error.txt").write_text(fails[0]["error"][:500], encoding="utf-8")
        ok = [r for r in res if "error" not in r]
        print(f"\n==== {len(ok)}/{len(res)} clip(s) done -> final/ ====")
    elif a.cmd == "analytics":
        load_env()
        from . import analytics, performance
        performance.update()
    elif a.cmd == "analyst":
        load_env()
        from . import analyst
        analyst.run(force=a.force)
    elif a.cmd == "voices":
        load_env()
        from . import tts
        text = ("At this spot in the Pacific, the nearest people are not on land. "
                "They're flying overhead, about two hundred and fifty miles up.")
        made = tts.voice_samples(FINAL, text)
        print(f"{len(made)} voice sample(s) in final/")
    elif a.cmd == "toon":
        load_env()
        from .toon import show
        for sp in a.scripts:
            show.render_episode(ROOT / sp if not sp.startswith("/") else sp)
    elif a.cmd == "owner":
        from . import owner
        owner.run(a.action, a.target, a.value)
    else:
        cmd_make(a.episode, a.start, a.scenes, a.refetch)


if __name__ == "__main__":
    sys.exit(main())
