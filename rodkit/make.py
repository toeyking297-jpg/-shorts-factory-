"""rodkit: เรนเดอร์ตอนการ์ตูนจากไฟล์ตอน (*.ep.json) ด้วย Chrome แบบไม่มีหน้าจอ

python -m rodkit.make rodkit/episodes/TEST01.ep.json               วิดีโอเต็ม → rodkit/build/<id>/<id>.mp4
python -m rodkit.make <ep> --storyboard                               ภาพละ 1 เฟรมต่อช็อต → storyboard.jpg
python -m rodkit.make <ep> --stills 1.5,6,9.2                         ภาพนิ่งตามเวลา
python -m rodkit.make <ep> --fps 15 --scale 0.5                       ร่างเร็ว
"""
from __future__ import annotations

import argparse
import json
import math
import os
import pathlib
import shutil
import subprocess
import sys
import time

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent
WEB = ROOT / "web" / "index.html"


def chrome_path() -> str | None:
    for p in (os.environ.get("CHROME_PATH"), "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"):
        if p and pathlib.Path(p).exists():
            return p
    return None  # ใช้ Chromium ของ playwright


def open_page(pw, scale: float):
    exe = chrome_path()
    br = pw.chromium.launch(executable_path=exe, args=["--allow-file-access-from-files", "--disable-gpu"]) if exe else pw.chromium.launch(args=["--allow-file-access-from-files"])
    pg = br.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=scale)
    pg.goto(WEB.as_uri())
    pg.wait_for_function("window.RK_READY === true", timeout=30000)
    return br, pg


def load(pg, ep: dict) -> float:
    return pg.evaluate("ep => RK.load(ep)", ep)


def shot(pg, T: float) -> bytes:
    pg.evaluate("T => RK.mount(T)", T)
    return pg.screenshot(type="jpeg", quality=92, clip={"x": 0, "y": 0, "width": 1080, "height": 1920})


def contact_sheet(images: list[pathlib.Path], labels: list[str], out: pathlib.Path, cols: int = 4):
    from PIL import Image, ImageDraw, ImageFont
    th = [Image.open(p).convert("RGB").resize((270, 480)) for p in images]
    rows = math.ceil(len(th) / cols)
    sheet = Image.new("RGB", (cols * 280 + 10, rows * 530 + 10), (18, 18, 22))
    font_p = ROOT.parent / "assets" / "fonts" / "Kanit-Medium.ttf"
    font = ImageFont.truetype(str(font_p), 20) if font_p.exists() else None
    d = ImageDraw.Draw(sheet)
    for i, (im, lb) in enumerate(zip(th, labels)):
        x, y = 10 + (i % cols) * 280, 10 + (i // cols) * 530
        sheet.paste(im, (x, y))
        d.text((x, y + 486), lb, fill=(235, 235, 235), font=font)
    sheet.save(out, quality=90)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--storyboard", action="store_true")
    ap.add_argument("--stills", default="")
    ap.add_argument("--fps", type=int, default=0)
    ap.add_argument("--scale", type=float, default=1.0, help="0.5 = ร่างเร็วครึ่งความละเอียด")
    ap.add_argument("--start", type=float, default=0)
    ap.add_argument("--end", type=float, default=0)
    a = ap.parse_args()

    ep_path = pathlib.Path(a.episode)
    ep = json.loads(ep_path.read_text(encoding="utf-8"))
    eid = ep.get("id", ep_path.stem.split(".")[0])
    out = ROOT / "build" / eid
    out.mkdir(parents=True, exist_ok=True)
    fps = a.fps or ep.get("fps", 30)

    with sync_playwright() as pw:
        br, pg = open_page(pw, a.scale if (a.storyboard or a.stills) else 1.0)
        dur = load(pg, ep)

        if a.storyboard:
            imgs, labels, t0 = [], [], 0.0
            for i, s in enumerate(ep["shots"]):
                mid = t0 + s["dur"] * s.get("boardAt", 0.6)
                p = out / f"board_{i:02d}.jpg"
                p.write_bytes(shot(pg, mid))
                imgs.append(p); labels.append(f"{i + 1}. {s.get('name', '')} @{mid:.1f}s")
                t0 += s["dur"]
            contact_sheet(imgs, labels, out / "storyboard.jpg")
            print(out / "storyboard.jpg")
            br.close(); return

        if a.stills:
            for tt in [float(x) for x in a.stills.split(",") if x]:
                p = out / f"still_{tt:06.2f}.jpg"
                p.write_bytes(shot(pg, tt)); print(p)
            br.close(); return

        start, end = a.start, (a.end or dur)
        n = int(round((end - start) * fps))
        video = out / f"{eid}_silent.mp4"
        ff = subprocess.Popen([
            "ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(fps), "-c:v", "mjpeg", "-i", "-",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(video)],
            stdin=subprocess.PIPE)
        t_start = time.time()
        for k in range(n):
            ff.stdin.write(shot(pg, start + k / fps))
            if k % (fps * 2) == 0:
                el = time.time() - t_start
                print(f"  เฟรม {k}/{n}  ({el:.0f}s)", flush=True)
        ff.stdin.close(); ff.wait()
        br.close()

    final = out / f"{eid}.mp4"
    audio = ep.get("audio")
    if audio and pathlib.Path(audio).exists():
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(video), "-i", audio, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", str(final)], check=True)
    else:
        shutil.copyfile(video, final)
    print(final)


if __name__ == "__main__":
    main()
