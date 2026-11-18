"""rodkit QA: ตรวจคลิปก่อนส่ง — ทุกช็อต 3 จังหวะ (25/50/80%) ภาพเต็ม + ภาพซูมตัวละครทุกตัวที่ขนาดจริง

python -m rodkit.qa rodkit/build/DP001/DP001.resolved.json   → rodkit/build/<id>/qa/shot_XX.jpg
ใช้ดูทีละช็อต: ผม หน้า คอ ไหล่ มือ เท้า การซ้อนชิ้น ตัวประกอบ ซับ
"""
from __future__ import annotations

import io
import json
import pathlib
import sys

from PIL import Image
from playwright.sync_api import sync_playwright

from .make import ROOT, load, open_page, shot


def main():
    ep = json.loads(pathlib.Path(sys.argv[1]).read_text("utf-8"))
    out = ROOT / "build" / ep["id"] / "qa"; out.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pw:
        br, pg = open_page(pw, 1.0)
        load(pg, ep)
        t0 = 0.0
        for i, S in enumerate(ep["shots"]):
            frames = []
            for q in (0.25, 0.5, 0.8):
                T = t0 + S["dur"] * q
                img = Image.open(io.BytesIO(shot(pg, T))).convert("RGB")
                boxes = pg.evaluate("""() => [...document.querySelectorAll('[data-actor]')].map(g => { const r = g.getBoundingClientRect(); return [g.dataset.actor, r.x, r.y, r.width, r.height]; })""")
                frames.append((img, boxes))
            # แผ่นตรวจ: แถวบน 3 เฟรมเต็ม, แถวล่าง ซูมตัวละคร (เฟรมกลาง) ส่วนบนตัว + ส่วนล่างตัว
            W = 1500
            row1 = [f[0].resize((360, 640)) for f in frames]
            crops = []
            img, boxes = frames[1]
            for who, x, y, w, h in boxes:
                x0, y0, x1, y1 = max(0, x), max(0, y), min(1080, x + w), min(1920, y + h)
                if x1 - x0 < 30 or y1 - y0 < 30: continue
                mid = y0 + (y1 - y0) * 0.5
                for (a, b) in ((y0, mid), (mid, y1)):
                    c = img.crop((int(x0), int(a), int(x1), int(b)))
                    k = 420 / max(1, c.height); crops.append(c.resize((max(1, int(c.width * k)), 420)))
            cw = sum(c.width for c in crops) + 10 * len(crops)
            sheet = Image.new("RGB", (max(W, 1100, cw), 640 + 20 + (440 if crops else 0)), (20, 20, 24))
            for j, r in enumerate(row1): sheet.paste(r, (j * 370, 0))
            x = 0
            for c in crops: sheet.paste(c, (x, 660)); x += c.width + 10
            p = out / f"shot_{i:02d}.jpg"; sheet.save(p, quality=86); print(p)
            t0 += S["dur"]
        br.close()


if __name__ == "__main__":
    main()
