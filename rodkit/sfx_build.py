"""สร้างคลังเสียงประกอบจาก sfx_lib.json ครั้งเดียว (ข้ามตัวที่มีไฟล์แล้ว) → rodkit/sfx_lib/<ชื่อ>.mp3
ใช้: python -m rodkit.sfx_build [name1,name2]"""
import json, os, pathlib, sys, requests

ROOT = pathlib.Path(__file__).resolve().parent
LIB = json.loads((ROOT / "sfx_lib.json").read_text("utf-8"))
OUT = ROOT / "sfx_lib"
KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip()


def path_of(name):
    return OUT / f"{name}.mp3"


def build(name, spec, key=KEY):
    p = path_of(name)
    if p.exists() and p.stat().st_size > 1000:
        return p, False
    r = requests.post("https://api.elevenlabs.io/v1/sound-generation", headers={"xi-api-key": key}, timeout=180,
                      json={"text": spec["prompt"], "duration_seconds": max(0.5, min(22, spec["len"])), "prompt_influence": 0.55})
    if r.status_code >= 400:
        raise RuntimeError(f"{name}: {r.status_code} {r.text[:200]}")
    OUT.mkdir(exist_ok=True)
    p.write_bytes(r.content)
    return p, True


def main():
    if not KEY:
        raise SystemExit("ไม่พบ ELEVENLABS_API_KEY")
    only = set(sys.argv[1].split(",")) if len(sys.argv) > 1 else None
    made = 0
    for group in ("sfx", "ambience"):
        for name, spec in LIB[group].items():
            if only and name not in only:
                continue
            try:
                _, new = build(name, spec)
                made += new
                print(("สร้าง " if new else "มีแล้ว ") + name)
            except Exception as e:  # noqa: BLE001
                print("พลาด", e)
    print(f"เสร็จ ✓ สร้างใหม่ {made} เสียง · ในคลังทั้งหมด {len(list(OUT.glob('*.mp3')))} เสียง")


if __name__ == "__main__":
    main()
