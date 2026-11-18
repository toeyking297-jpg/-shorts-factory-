"""ทดสอบ ElevenLabs: เช็กคีย์/เครดิต แล้วทำเสียงตัวอย่างภาษาไทย ตัวละครละ 3 เสียงให้เลือก
ใช้: python -m rodkit.voice_test [who1,who2,...]   (คีย์อ่านจาก ELEVENLABS_API_KEY เท่านั้น)
ผลลัพธ์: rodkit/voice_samples/<who>_<n>.mp3 + choices.md (เลขตัวเลือก → ชื่อเสียง/voice_id)
"""
import json, os, pathlib, sys, requests

ROOT = pathlib.Path(__file__).resolve().parent
CAST = ROOT / "cast.json"
OUT = ROOT / "voice_samples"
API = "https://api.elevenlabs.io"
KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip()
FLAT = ["narrator", "phum", "prang", "fah", "mali", "chai", "khaohom", "boon", "te", "jan", "piak"]


def req(m, path, **kw):
    r = requests.request(m, API + path, headers={"xi-api-key": KEY}, timeout=180, **kw)
    if r.status_code >= 400:
        raise SystemExit(f"ElevenLabs ตอบ {r.status_code} ที่ {path}: {r.text[:300]}")
    return r


def score(vo, gender, age):
    lb = {k: (v or "").lower() for k, v in (vo.get("labels") or {}).items()}
    g = gender.split()[0]
    s = 4 if lb.get("gender") == g else (-4 if lb.get("gender") else 0)
    if "child" in gender:
        s += 4 if any(x in (lb.get("age", "") + lb.get("description", "") + vo.get("name", "").lower()) for x in ("child", "kid", "young")) else 0
    elif any(x in age for x in ("60", "70", "old")):
        s += 3 if "old" in lb.get("age", "") else 0
    elif "20" in age:
        s += 2 if "young" in lb.get("age", "") else 0
    else:
        s += 2 if "middle" in lb.get("age", "") else 0
    if "th" in (lb.get("language", "") + str(vo.get("verified_languages", ""))).lower():
        s += 3
    return s


def main():
    if not KEY:
        raise SystemExit("ไม่พบ ELEVENLABS_API_KEY — ใส่ใน GitHub → Settings → Secrets and variables → Actions")
    sub = req("GET", "/v1/user/subscription").json()
    used, lim = sub.get("character_count", 0), sub.get("character_limit", 0)
    print(f"คีย์ใช้ได้ ✓  แพ็กเกจ {sub.get('tier')}  ใช้ไป {used:,}/{lim:,} ตัวอักษร  เหลือ {lim-used:,}")
    voices = req("GET", "/v1/voices").json().get("voices", [])
    print(f"เสียงในบัญชี {len(voices)} เสียง")
    cast = json.loads(CAST.read_text("utf-8"))
    model = cast.get("model", "eleven_v3")
    who_list = sys.argv[1].split(",") if len(sys.argv) > 1 else FLAT
    OUT.mkdir(exist_ok=True)
    for f in OUT.glob("*.mp3"):
        f.unlink()
    md = [f"# เสียงตัวอย่าง ElevenLabs (โมเดล {model})", "", f"เครดิตเหลือ {lim-used:,} ตัวอักษร", "",
          "ฟังไฟล์ `<ตัวละคร>_<เลข>.mp3` แล้วบอก Claude เช่น `มะลิ 2, ชัย 1`", ""]
    picks = {}
    for who in who_list:
        ch = cast["characters"][who]
        v = ch["voice"]
        text = ch.get("sample", "สวัสดีครับ")
        ranked = sorted(voices, key=lambda vo: -score(vo, v.get("gender", ""), v.get("age", "")))[:3]
        md.append(f"## {ch['name']} ({who}) — {v.get('gender')} {v.get('age')} · {v.get('tone','')}")
        picks[who] = []
        for i, vo in enumerate(ranked, 1):
            body = {"text": text, "model_id": model,
                    "voice_settings": {"stability": v.get("stability", 0.5), "similarity_boost": 0.8, "style": v.get("style", 0.35)}}
            r = req("POST", f"/v1/text-to-speech/{vo['voice_id']}", params={"output_format": "mp3_44100_128"}, json=body)
            (OUT / f"{who}_{i}.mp3").write_bytes(r.content)
            lb = vo.get("labels") or {}
            md.append(f"- **{i}** {vo.get('name')} · {lb.get('gender','?')} {lb.get('age','')} {lb.get('accent','')} · `{vo['voice_id']}`")
            picks[who].append({"n": i, "name": vo.get("name"), "voice_id": vo["voice_id"]})
            print(f"  {who}_{i}.mp3 ← {vo.get('name')}")
        md.append("")
    (OUT / "choices.md").write_text("\n".join(md), "utf-8")
    (OUT / "choices.json").write_text(json.dumps(picks, ensure_ascii=False, indent=1), "utf-8")
    sub = req("GET", "/v1/user/subscription").json()
    print(f"เสร็จ ✓  เครดิตเหลือ {sub.get('character_limit',0)-sub.get('character_count',0):,} ตัวอักษร")


if __name__ == "__main__":
    main()
