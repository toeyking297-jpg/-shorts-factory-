"""Cartoon pipeline CLI.

  python -m engine.cartoon status   EP001
  python -m engine.cartoon assets                # draw placeholders + manifest
  python -m engine.cartoon prompts  EP001        # asset_requests.json + prompts.md
  python -m engine.cartoon voice    EP001 [--dry-run]
  python -m engine.cartoon asr      EP001
  python -m engine.cartoon timeline EP001
  python -m engine.cartoon render   EP001 --preview | --full | --final
  python -m engine.cartoon qa       EP001
  python -m engine.cartoon run      EP001 [--dry-run] [--from STEP]   # every step this machine can do, resumable
"""
from __future__ import annotations

import argparse
import importlib.util
import json

from .common import ep_dir, state_get, step_get, step_set

STEPS = ["assets", "prompts", "voice", "asr", "timeline", "preview", "full", "final", "qa"]


def _has(mod):
    return importlib.util.find_spec(mod) is not None


def do(step, ep, dry=False):
    if step == "assets":
        from . import assets
        m = assets.build()
        n = sum(1 for r in m.values() if r["status"] == "READY")
        step_set(ep, "assets", "READY" if n == len(m) else "WAITING_FOR_ASSET", real=n, total=len(m))
        print(f"assets: {n}/{len(m)} real, rest PLACEHOLDER")
    elif step == "prompts":
        from . import prompts
        prompts.write(ep)
    elif step == "voice":
        if not _has("edge_tts") and not dry:
            step_set(ep, "voice", "WAITING_FOR_ASSET", reason="edge-tts not installed here (run on GitHub Actions)")
            print("voice: SKIPPED (edge-tts missing) -> run workflow 'Cartoon voice'")
            return False
        from . import voice
        voice.run(ep, dry)
    elif step == "asr":
        if not _has("faster_whisper"):
            print("asr: SKIPPED (faster-whisper missing) -> runs in workflow 'Cartoon voice'")
            return False
        from . import asr
        asr.run(ep)
    elif step == "timeline":
        from . import timeline
        timeline.build(ep)
    elif step in ("preview", "full", "final"):
        from . import render
        render.render(ep, step, dry=dry)
    elif step == "qa":
        from . import qa
        qa.run(ep)
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd")
    ap.add_argument("ep", nargs="?", default="EP001")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--from", dest="frm")
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--full", action="store_true")
    ap.add_argument("--final", action="store_true")
    a = ap.parse_args()
    if a.cmd == "status":
        print(json.dumps(state_get()["episodes"].get(a.ep, {}), ensure_ascii=False, indent=1))
    elif a.cmd == "render":
        do("final" if a.final else "full" if a.full else "preview", a.ep, a.dry_run)
    elif a.cmd == "run":
        steps = STEPS[STEPS.index(a.frm):] if a.frm else STEPS
        for s in steps:
            if a.dry_run and s not in ("voice", "preview", "full", "final"):
                print(f"[dry-run] would run {s} (last status: {step_get(a.ep, s).get('status', 'PLANNED')})")
                continue
            try:
                do(s, a.ep, a.dry_run)
            except Exception as e:  # noqa: BLE001
                step_set(a.ep, s, "QA_FAILED" if s == "qa" else "WAITING_FOR_ASSET", error=str(e)[:300])
                print(f"{s}: FAILED: {e}\nresume with: python -m engine.cartoon run {a.ep} --from {s}")
                raise SystemExit(1)
    else:
        do(a.cmd, a.ep, a.dry_run)


if __name__ == "__main__":
    main()
