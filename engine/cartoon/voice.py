"""Per-line voice: one file per dialogue_id, cached by text+voice hash.

Priority per line: audio/import/<D>.wav|.mp3 (owner's own recording) > edge-tts (free, needs internet).
Never regenerates the whole episode when one line changes.
"""
from __future__ import annotations

import asyncio
import time

from .common import BIBLE, ep_dir, load, save, sha, step_set


def _voices():
    b = load(BIBLE / "character_bible.json")
    return {c["character_id"]: c["voice"] for c in b["characters"]}


async def _edge(text, v, out):
    import edge_tts
    com = edge_tts.Communicate(text, v["voice_id"], rate=v["rate"], pitch=v["pitch"], volume=v.get("volume", "+0%"))
    await com.save(str(out))


def run(ep: str, dry=False) -> dict:
    d = ep_dir(ep)
    script = load(d / "script.json")
    voices = _voices()
    raw = d / "audio" / "raw"
    imp = d / "audio" / "import"
    raw.mkdir(parents=True, exist_ok=True)
    imp.mkdir(parents=True, exist_ok=True)
    manp = d / "audio" / "voice_manifest.json"
    man = load(manp) if manp.exists() else {}
    made, kept, failed = [], [], []
    for ln in script["dialogue"]:
        did, v = ln["dialogue_id"], voices[ln["character_id"]]
        imported = sorted(imp.glob(f"{did}.*"))
        if imported:
            man[did] = dict(source="import", file=str(imported[0].relative_to(d)), hash=sha(imported[0]))
            kept.append(did)
            continue
        h = sha(ln["text"], v)
        out = raw / f"{did}.mp3"
        if man.get(did, {}).get("hash") == h and out.exists() and out.stat().st_size > 1000:
            kept.append(did)
            continue
        if dry:
            made.append(did)
            continue
        for attempt in range(4):                     # limited retry with backoff (external service)
            try:
                asyncio.run(_edge(ln["text"], v, out))
                if out.stat().st_size > 1000:
                    break
            except Exception as e:  # noqa: BLE001
                print(f"  {did} attempt {attempt + 1} failed: {e}")
            time.sleep(2 ** attempt * 2)
        if out.exists() and out.stat().st_size > 1000:
            man[did] = dict(source="edge-tts", voice=v, file=str(out.relative_to(d)), hash=h)
            made.append(did)
        else:
            failed.append(did)
    if not dry:
        save(manp, man)
        step_set(ep, "voice", "READY" if not failed else "WAITING_FOR_ASSET", made=made, kept=kept, failed=failed,
                 cost={"service": "edge-tts (Microsoft Edge read-aloud endpoint)", "billed_thb": 0,
                       "note": "no account or key; unofficial free endpoint, availability not guaranteed"})
    print(f"voice{' [dry-run] would make' if dry else ': made'} {made} kept {len(kept)} failed {failed}")
    return dict(made=made, kept=kept, failed=failed)
