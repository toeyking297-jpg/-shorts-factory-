"""Shared helpers: paths, config, .env, ffmpeg wrappers, logging."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / "config" / "channel.json"
EPISODES = ROOT / "episodes"
FINAL = ROOT / "final"
MEMORY = ROOT / "memory"


METRICS: dict = {"gemini_calls": 0, "gemini_by_model": {}, "gemini_errors": 0, "footage_api_calls": 0,
                  "downloads": 0}


def metric(name: str, n: int = 1, sub: str | None = None) -> None:
    """Count API calls etc. for the run report (measured, not estimated)."""
    if sub:
        d = METRICS.setdefault(name, {})
        d[sub] = d.get(sub, 0) + n
    else:
        METRICS[name] = METRICS.get(name, 0) + n


def log(msg: str) -> None:
    print(f"[engine] {msg}", flush=True)
    if os.environ.get("GITHUB_ACTIONS") and any(k in msg for k in ("Gemini", "FAILED", "failed", "unavailable", "timing")):
        print("::notice title=engine::" + msg[:500].replace("\n", " | "), flush=True)


def load_env() -> None:
    """Read KEY=VALUE lines from .env into os.environ (no extra dependency)."""
    env = ROOT / ".env"
    if not env.exists():
        return
    for line in env.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def load_config() -> dict:
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))


def read_json(p: Path, default=None):
    if not p.exists():
        return default
    return json.loads(p.read_text(encoding="utf-8"))


def write_json(p: Path, data) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def find_episode(ep_id: str) -> Path:
    """Accept 'EP001' or a full folder name like 'EP001_why-x'."""
    direct = EPISODES / ep_id
    if direct.is_dir():
        return direct
    matches = sorted(p for p in EPISODES.glob(f"{ep_id}*") if p.is_dir())
    if not matches:
        sys.exit(f"Episode folder not found for '{ep_id}' in {EPISODES}")
    return matches[0]


def ffmpeg_bin() -> str:
    exe = shutil.which("ffmpeg")
    if not exe:
        sys.exit("FFmpeg not found. Install it (Windows: winget install Gyan.FFmpeg) and reopen the terminal.")
    return exe


def run_ffmpeg(args: list[str], cwd: Path | None = None) -> None:
    cmd = [ffmpeg_bin(), "-hide_banner", "-loglevel", "error", "-y", *args]
    res = subprocess.run(cmd, cwd=str(cwd) if cwd else None, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError("FFmpeg failed:\n" + " ".join(cmd) + "\n" + res.stderr[-3000:])


def probe_duration(path: Path) -> float:
    exe = shutil.which("ffprobe") or "ffprobe"
    res = subprocess.run(
        [exe, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True,
    )
    try:
        return float(res.stdout.strip())
    except ValueError:
        return 0.0


def probe_size(path: Path) -> tuple[int, int]:
    exe = shutil.which("ffprobe") or "ffprobe"
    res = subprocess.run(
        [exe, "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
         "-of", "csv=p=0", str(path)], capture_output=True, text=True,
    )
    try:
        w, h = res.stdout.strip().split(",")[:2]
        return int(w), int(h)
    except ValueError:
        return 0, 0


def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def font_path(cfg: dict) -> str:
    """Resolve a bold TTF that exists on this machine."""
    candidates = [
        ROOT / cfg["style"].get("font_file", "assets/fonts/Poppins-Bold.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
        Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
    ]
    for c in candidates:
        if c.exists():
            return str(c)
    sys.exit("No usable bold font found. Put a .ttf in assets/fonts and set style.font_file.")
