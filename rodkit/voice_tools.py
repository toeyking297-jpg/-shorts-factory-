"""เครื่องมือเสียงตัวละคร (ElevenLabs)
  python -m rodkit.voice_tools catalog   → ดึงคลังเสียงไทยจาก Voice Library เก็บที่ rodkit/voice_catalog.json
  python -m rodkit.voice_tools lock      → เพิ่มเสียงที่เลือกใน cast.json เข้าบัญชี (ถ้าจำเป็น) + ทำเสียงยืนยันตัวละครละ 1 ไฟล์
"""
import json, os, pathlib, sys, time, requests

ROOT = pathlib.Path(__file__).resolve().parent
API = "https://api.elevenlabs.io"
KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip()
CAST = ROOT / "cast.json"
OUT = ROOT / "voice_samples"


def req(m, path, timeout=120, tries=3, **kw):
    last = None
    for i in range(tries):
        try:
            r = requests.request(m, API + path, headers={"xi-api-key": KEY}, timeout=timeout, **kw)
        except requests.RequestException as e:
            last = e; print(f"  {path}: {type(e).__name__} ลองใหม่ {i+1}/{tries}", flush=True); time.sleep(5 * (i + 1)); continue
        if r.status_code in (409, 429, 500, 502, 503, 504):
            last = f"{r.status_code} {r.text[:120]}"; time.sleep(8 * (i + 1)); continue
        if r.status_code >= 400:
            raise RuntimeError(f"{r.status_code} {path}: {r.text[:300]}")
        return r
    raise RuntimeError(f"ไม่ตอบ {path} ({last})")


def catalog():
    seen, out = set(), []
    for g in ("male", "female", None):
        for page in range(4):
            prm = {"language": "th", "page_size": 100, "page": page, "sort": "usage_character_count_1y"}
            if g: prm["gender"] = g
            try:
                j = req("GET", "/v1/shared-voices", timeout=150, params=prm).json()
            except RuntimeError as e:
                print("  ", e); break
            vs = j.get("voices", [])
            for v in vs:
                if v["voice_id"] in seen: continue
                seen.add(v["voice_id"])
                out.append({k: v.get(k) for k in ("voice_id", "public_owner_id", "name", "gender", "age", "accent", "language", "locale",
                                                  "descriptive", "use_case", "category", "description", "usage_character_count_1y",
                                                  "cloned_by_count", "free_users_allowed", "preview_url")})
            print(f"gender={g} page={page}: +{len(vs)} รวม {len(out)}", flush=True)
            if not j.get("has_more"): break
    (ROOT / "voice_catalog.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), "utf-8")
    print(f"เสร็จ ✓ เสียงไทย {len(out)} เสียง")


def lock():
    cast = json.loads(CAST.read_text("utf-8"))
    model = cast.get("model", "eleven_v3")
    OUT.mkdir(exist_ok=True)
    for f in OUT.glob("*"): f.unlink()
    lines = ["# เสียงที่ล็อกแล้ว (ElevenLabs)", ""]
    for who, ch in cast["characters"].items():
        v = ch.get("voice", {})
        if not v.get("voice_id") or v.get("type") == "sfx" or not ch.get("sample"):
            continue
        if v.get("public_owner_id") and not v.get("in_account"):
            try:
                req("POST", f"/v1/voices/add/{v['public_owner_id']}/{v['voice_id']}", json={"new_name": f"{ch['name']} ({who})"[:40]})
                print(f"  เพิ่มเสียง {v.get('voice_name')} เข้าบัญชีสำหรับ {who}", flush=True)
            except RuntimeError as e:
                if "already" not in str(e).lower(): print("  เพิ่มเสียงไม่ได้:", e)
            v["in_account"] = True
        body = {"text": ch["sample"], "model_id": model,
                "voice_settings": {"stability": v.get("stability", 0.5), "similarity_boost": 0.8, "style": v.get("style", 0.35)}}
        try:
            r = req("POST", f"/v1/text-to-speech/{v['voice_id']}", timeout=180, params={"output_format": "mp3_44100_128"}, json=body)
            (OUT / f"{who}.mp3").write_bytes(r.content)
            print(f"  {who}.mp3 ← {v.get('voice_name')}", flush=True)
            lines.append(f"- **{ch['name']}** ({who}) → {v.get('voice_name')} · `{v['voice_id']}`")
        except RuntimeError as e:
            print(f"  {who} พลาด: {e}")
            lines.append(f"- **{ch['name']}** ({who}) → พลาด: {str(e)[:120]}")
    CAST.write_text(json.dumps(cast, ensure_ascii=False, indent=2) + "\n", "utf-8")
    (OUT / "locked.md").write_text("\n".join(lines), "utf-8")
    print("เสร็จ ✓")


if __name__ == "__main__":
    if not KEY: raise SystemExit("ไม่พบ ELEVENLABS_API_KEY")
    {"catalog": catalog, "lock": lock}[sys.argv[1]]()
