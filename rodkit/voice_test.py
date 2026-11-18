"""ทดสอบ ElevenLabs: เช็กคีย์/เครดิต แล้วทำเสียงตัวอย่างภาษาไทย ตัวละครละ 3 เสียงให้เลือก
ใช้: python -m rodkit.voice_test [who1,who2,...]   (คีย์อ่านจาก ELEVENLABS_API_KEY เท่านั้น)
ผลลัพธ์: rodkit/voice_samples/<who>_<n>.mp3 + choices.md (เลขตัวเลือก → ชื่อเสียง/voice_id)
"""
import json, os, pathlib, sys, time, requests

ROOT = pathlib.Path(__file__).resolve().parent
CAST = ROOT / "cast.json"
OUT = ROOT / "voice_samples"
API = "https://api.elevenlabs.io"
KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip()
FLAT = ["narrator", "phum", "prang", "fah", "mali", "chai", "khaohom", "boon", "te", "jan", "piak"]


def req(m, path, timeout=90, tries=3, **kw):
    last = None
    for i in range(tries):
        try:
            r = requests.request(m, API + path, headers={"xi-api-key": KEY}, timeout=timeout, **kw)
        except requests.RequestException as e:
            last = e; print(f"  เชื่อมต่อ {path} ไม่ได้ ({type(e).__name__}) ลองใหม่ {i+1}/{tries}"); time.sleep(5 * (i + 1)); continue
        if r.status_code in (429, 500, 502, 503, 504):
            last = r.status_code; time.sleep(5 * (i + 1)); continue
        if r.status_code >= 400:
            raise SystemExit(f"ElevenLabs ตอบ {r.status_code} ที่ {path}: {r.text[:300]}")
        return r
    raise SystemExit(f"ElevenLabs ไม่ตอบที่ {path} ({last})")


def credits():
    try:
        sub = req("GET", "/v1/user/subscription", timeout=30, tries=2).json()
        return sub.get("tier"), sub.get("character_limit", 0) - sub.get("character_count", 0)
    except SystemExit as e:
        print(f"  ดูเครดิตไม่ได้ ({e}) — ข้ามไปทำเสียงต่อ")
        return "?", None


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


PREMADE = {  # เสียงมาตรฐานของ ElevenLabs (ใช้ได้ทุกบัญชี) — สำรองเมื่อไม่มีเสียงไทยที่เหมาะ
    ("male", "young"): [("Liam", "TX3LPaxmHKxFdv7VOQHJ"), ("Will", "bIHbv24MWmeRgasZH58o")],
    ("male", "middle_aged"): [("Brian", "nPczCjzI2devNBz1zQrb"), ("Eric", "cjVigY5qzO86Huf0OWal")],
    ("male", "old"): [("Bill", "pqHfZKP75CvOlQylNhV4"), ("George", "JBFqnCBsd6RMkjVDRZzb")],
    ("female", "young"): [("Jessica", "cgSgspJ2msm6clMCkdW9"), ("Sarah", "EXAVITQu4vr4xnSDxMaL")],
    ("female", "middle_aged"): [("Matilda", "XrExE9yKIg1WjnnlVkGX"), ("Laura", "FGY2WhTYpPnrIDTdsKH5")],
    ("female", "old"): [("Alice", "Xb7hH8MSUJpSbSDYk0k2"), ("Lily", "pFZP5JQG7iQjIQuC4Bku")],
}
ADDED = []


def age_key(v):
    g = v.get("gender", ""); a = v.get("age", "")
    if "child" in g or a.isdigit() and int(a) < 13: return "young"
    if any(x in a for x in ("60", "70", "old")): return "old"
    if "20" in a: return "young"
    return "middle_aged"


def candidates(v):
    g = v.get("gender", "female").split()[0]; ak = age_key(v)
    out = []
    try:
        j = req("GET", "/v1/shared-voices", timeout=60, tries=2,
                params={"language": "th", "gender": g, "age": ak, "page_size": 12, "sort": "usage_character_count_1y"}).json()
        for sv in j.get("voices", []):
            if len(out) >= 2: break
            out.append({"voice_id": sv["voice_id"], "name": sv.get("name"), "public_owner_id": sv.get("public_owner_id"),
                        "labels": {"gender": sv.get("gender"), "age": sv.get("age"), "accent": sv.get("accent"), "lang": sv.get("language")},
                        "description": (sv.get("description") or "")[:120]})
    except SystemExit as e:
        print(f"  ค้นคลังเสียงไทยไม่ได้ ({e})")
    for name, vid in PREMADE[(g if g in ("male", "female") else "female", ak)]:
        if len(out) >= 3: break
        out.append({"voice_id": vid, "name": name + " (มาตรฐาน)", "labels": {"gender": g, "age": ak}})
    return out


def speak(vo, body):
    path = f"/v1/text-to-speech/{vo['voice_id']}"
    prm = {"output_format": "mp3_44100_128"}
    try:
        return req("POST", path, timeout=150, params=prm, json=body)
    except SystemExit as e:
        if not vo.get("public_owner_id"):
            raise
        print(f"  เพิ่มเสียง {vo['name']} เข้าบัญชีก่อน ({str(e)[:80]})")
        nm = ("rk " + (vo.get("name") or "voice"))[:40]
        req("POST", f"/v1/voices/add/{vo['public_owner_id']}/{vo['voice_id']}", timeout=60, json={"new_name": nm})
        ADDED.append(vo["voice_id"])
        return req("POST", path, timeout=150, params=prm, json=body)


def main():
    if not KEY:
        raise SystemExit("ไม่พบ ELEVENLABS_API_KEY — ใส่ใน GitHub → Settings → Secrets and variables → Actions")
    tier, left = credits()
    voices = []  # รายชื่อเสียงในบัญชีโหลดช้ามาก (timeout) → ใช้คลังเสียงไทยจาก Voice Library + เสียงมาตรฐานแทน
    print(f"คีย์ใช้ได้ ✓  แพ็กเกจ {tier}  เครดิตเหลือ {left if left is None else f'{left:,}'}", flush=True)
    print(f"เสียงในบัญชี {len(voices)} เสียง")
    cast = json.loads(CAST.read_text("utf-8"))
    model = cast.get("model", "eleven_v3")
    who_list = sys.argv[1].split(",") if len(sys.argv) > 1 else FLAT
    OUT.mkdir(exist_ok=True)
    for f in OUT.glob("*.mp3"):
        f.unlink()
    md = [f"# เสียงตัวอย่าง ElevenLabs (โมเดล {model})", "", f"เครดิตเหลือ {left} ก่อนทดสอบ", "",
          "ฟังไฟล์ `<ตัวละคร>_<เลข>.mp3` แล้วบอก Claude เช่น `มะลิ 2, ชัย 1`", ""]
    picks = {}
    for who in who_list:
        ch = cast["characters"][who]
        v = ch["voice"]
        text = ch.get("sample", "สวัสดีครับ")
        ranked = candidates(v)
        md.append(f"## {ch['name']} ({who}) — {v.get('gender')} {v.get('age')} · {v.get('tone','')}")
        picks[who] = []
        for i, vo in enumerate(ranked, 1):
            body = {"text": text, "model_id": model,
                    "voice_settings": {"stability": v.get("stability", 0.5), "similarity_boost": 0.8, "style": v.get("style", 0.35)}}
            try:
                r = speak(vo, body)
            except SystemExit as e:
                print(f"  ข้าม {vo.get('name')} ({e})"); continue
            (OUT / f"{who}_{i}.mp3").write_bytes(r.content)
            lb = vo.get("labels") or {}
            md.append(f"- **{i}** {vo.get('name')} · {lb.get('gender','?')} {lb.get('age','')} {lb.get('accent','')} · `{vo['voice_id']}`")
            picks[who].append({"n": i, "name": vo.get("name"), "voice_id": vo["voice_id"], "labels": vo.get("labels"), "public_owner_id": vo.get("public_owner_id"), "description": vo.get("description")})
            print(f"  {who}_{i}.mp3 ← {vo.get('name')}")
        md.append("")
    (OUT / "catalog.json").write_text(json.dumps({"added_to_account": ADDED}, ensure_ascii=False, indent=1), "utf-8")
    (OUT / "choices.md").write_text("\n".join(md), "utf-8")
    (OUT / "choices.json").write_text(json.dumps(picks, ensure_ascii=False, indent=1), "utf-8")
    print(f"เสร็จ ✓  เครดิตเหลือ {credits()[1]}")


if __name__ == "__main__":
    main()
