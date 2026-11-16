"""Owner commands sent from the phone dashboard (through the 'Owner command' workflow, so the phone token never
needs write access to files). Only these small files are ever written:

  memory/decisions/<EP>.json   {"decision": "use"|"discard", "video_id": "...", "confirmed": true}
  memory/overrides.json        {"disabled": ["c3", ...]}   analyst changes the owner switched off
  config/channel.json          voice choice only
"""
from __future__ import annotations

import datetime as dt
import json
import re

from .analytics import video_id_from
from .common import CONFIG_PATH, MEMORY, log, read_json, write_json


def _ep_name(target: str) -> str:
    target = re.sub(r"\.(mp4|json)$", "", (target or "").strip())
    if not re.match(r"^EP\d{3}", target):
        raise SystemExit(f"bad episode name: {target!r}")
    clips = sorted((MEMORY / "clips").glob(f"{target}*.json"))
    return clips[0].stem if clips else target


def run(action: str, target: str = "", value: str = "") -> None:
    now = dt.datetime.now().isoformat(timespec="minutes")
    if action in ("use", "discard", "decision"):
        ep = _ep_name(target)
        dec = value if action == "decision" else action
        if dec not in ("use", "discard", ""):
            raise SystemExit("decision must be use or discard")
        p = MEMORY / "decisions" / f"{ep}.json"
        d = read_json(p, {}) or {}
        d.update({"decision": dec, "decided": now})
        write_json(p, d)
        log(f"{ep}: decision = {dec}")
    elif action in ("bind", "confirm"):
        ep = _ep_name(target)
        if action == "confirm":
            rec = read_json(MEMORY / "clips" / f"{ep}.json", {}) or {}
            vid = rec.get("video_id")
        else:
            vid = video_id_from(value)
        if not vid:
            raise SystemExit("no YouTube video id found (paste the Shorts link)")
        p = MEMORY / "decisions" / f"{ep}.json"
        d = read_json(p, {}) or {}
        d.update({"video_id": vid, "confirmed": True, "bound": now, "decision": d.get("decision") or "use"})
        write_json(p, d)
        rec_p = MEMORY / "clips" / f"{ep}.json"
        rec = read_json(rec_p, {}) or {}
        if rec:
            rec.update({"video_id": vid, "video_confirmed": True})
            write_json(rec_p, rec)
        log(f"{ep}: bound to YouTube video {vid}")
    elif action in ("undo_change", "redo_change"):
        p = MEMORY / "overrides.json"
        d = read_json(p, {"disabled": []}) or {"disabled": []}
        s = set(d.get("disabled", []))
        (s.add if action == "undo_change" else s.discard)(target)
        d["disabled"] = sorted(s)
        write_json(p, d)
        log(f"analyst change {target}: {'switched off' if action == 'undo_change' else 'switched on'}")
    elif action == "voice":
        eng, _, name = value.partition(":")
        if eng not in ("edge", "kokoro") or not re.match(r"^[A-Za-z0-9_-]+$", name or ""):
            raise SystemExit("voice must look like edge:en-US-BrianMultilingualNeural or kokoro:am_michael")
        cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
        cfg["voice"]["engine"] = eng
        cfg["voice"]["edge_voice" if eng == "edge" else "kokoro_voice"] = name
        CONFIG_PATH.write_text(json.dumps(cfg, indent=2, ensure_ascii=False), encoding="utf-8")
        log(f"voice set to {eng}:{name}")
    else:
        raise SystemExit(f"unknown action {action}")
