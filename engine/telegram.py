"""Send finished clips to the owner's Telegram (watch on the phone, then save). Free, no limits that matter here.

Secrets: TELEGRAM_BOT_TOKEN (from @BotFather). TELEGRAM_CHAT_ID is optional: if missing, the chat that last
messaged the bot is used (the owner just sends /start to the bot once).
"""
from __future__ import annotations

import json
import os
from pathlib import Path

from .common import FINAL, log, read_json

API = "https://api.telegram.org/bot{token}/{method}"


def _chat_id(token: str) -> str | None:
    cid = os.environ.get("TELEGRAM_CHAT_ID", "").strip()
    if cid:
        return cid
    import requests
    r = requests.get(API.format(token=token, method="getUpdates"), timeout=30).json()
    for u in reversed(r.get("result", [])):
        msg = u.get("message") or u.get("channel_post") or {}
        if msg.get("chat", {}).get("id"):
            return str(msg["chat"]["id"])
    return None


def send_all(dashboard_url: str = "") -> int:
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    if not token:
        return 0
    import requests
    chat = _chat_id(token)
    if not chat:
        log("Telegram: no chat found. Open your bot in Telegram and send /start once.")
        return 0
    sent = 0
    for vid in sorted(FINAL.glob("EP*.mp4")):
        kit = read_json(vid.with_suffix(".json"), {}) or {}
        badge = "✅ พร้อมลง" if kit.get("status") == "ready" else "⚠️ ต้องดูก่อน"
        lines = [f"{badge} · {kit.get('series', '')}", (kit.get("titles") or [vid.stem])[0]]
        for r in (kit.get("reasons_th") or [])[:3]:
            lines.append("• " + r[:160])
        if dashboard_url:
            lines.append(f"ชื่อคลิป/คำอธิบายพร้อมก๊อป: {dashboard_url}")
        caption = "\n".join(lines)[:1000]
        size = vid.stat().st_size
        try:
            if size < 49 * 1024 * 1024:
                with open(vid, "rb") as f:
                    r = requests.post(API.format(token=token, method="sendVideo"), timeout=300,
                                      data={"chat_id": chat, "caption": caption, "supports_streaming": "true",
                                            "width": 1080, "height": 1920},
                                      files={"video": (vid.name, f, "video/mp4")})
            else:
                r = requests.post(API.format(token=token, method="sendMessage"), timeout=60,
                                  data={"chat_id": chat, "text": caption + "\n(ไฟล์ใหญ่เกิน 50 MB ดูในแดชบอร์ด)"})
            ok = r.json().get("ok")
            log(f"Telegram: {vid.name} {'sent' if ok else 'failed: ' + json.dumps(r.json())[:200]}")
            sent += bool(ok)
        except Exception as e:  # noqa: BLE001
            log(f"Telegram send failed for {vid.name}: {e}")
    return sent


if __name__ == "__main__":
    import sys
    send_all(sys.argv[1] if len(sys.argv) > 1 else "")
