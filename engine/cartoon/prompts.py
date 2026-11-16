"""Write the image-request list: layered assets (what the renderer uses) + one full-frame prompt per shot."""
from __future__ import annotations

from .common import ASSETS, BIBLE, ep_dir, load, save, step_set
from . import assets as A

COMMON = ("Vertical 9:16, clean 2D cartoon, clear silhouettes, bold outlines, restrained flat colors. "
          "No generated text, no letters, no logo, no watermark (subtitles are added in editing). "
          "Do not add any character that is not listed for this shot.")


def write(ep: str):
    d = ep_dir(ep)
    reqs = A.prompts()
    src = load(d / "shotlist_src.json")
    b = load(BIBLE / "character_bible.json")
    man = load(ASSETS / "manifest.json") if (ASSETS / "manifest.json").exists() else A.build()
    name_en = {"C01": "the office guy (mustard hoodie, round glasses, silver bags on shoulder)",
               "C02": "the auntie (curly reddish perm, coral floral blouse, gold chain, coral fan)",
               "C03": "the stall girl (black bob, white tee, teal apron)"}
    shot_prompts = []
    for s in src["shots"]:
        cast, refs = [], []
        for L in s["layers"]:
            rec = man.get(L.get("asset", ""), {})
            if rec.get("kind") == "pose":
                cid = rec["character_id"]
                gaze = "looking screen-right" if rec["facing"] > 0 else "looking screen-left"
                cast.append(f"{name_en[cid]}: {rec['expression'].replace('_', ' ')}, pose '{rec['pose']}', {gaze}")
                refs += [f"REF_{cid}_turnaround", f"REF_{cid}_expressions"]
        shot_prompts.append(dict(
            shot_id=s["shot_id"], refs=sorted(set(refs)) + [s["background_id"]],
            prompt=f"{b['style_prompt']}\n{COMMON}\nShot {s['shot_id']} - {s['shot_size']}, camera {s['camera_angle']}. "
                   f"Location: Thai chicken-rice shophouse front (same as background {s['background_id']}). "
                   f"Characters in frame ONLY: {'; '.join(cast) if cast else 'none (insert/prop shot)'}. "
                   f"Action: {s['action']} (Thai note for the artist). Keep the counter on screen-right.",
            use="optional: single full-frame key art for this shot; the renderer uses the layered assets"))
    save(d / "prompts" / "asset_requests.json", dict(episode_id=ep, requests=reqs))
    save(d / "prompts" / "shot_prompts.json", dict(episode_id=ep, shots=shot_prompts))
    waiting = [r for r in reqs if r["status"] != "READY"]
    md = [f"# รายการภาพที่ต้องสร้าง: {ep}", "",
          f"ทั้งหมด {len(reqs)} ภาพ ยังขาด {len(waiting)} ภาพ (สถานะ WAITING_FOR_ASSET)", "",
          "## วิธีใช้ (ChatGPT หรือเครื่องมือวาดที่มีอยู่)",
          "1. ทำกลุ่ม REF_ ก่อน (ภาพอ้างอิงตัวละคร) แล้วแนบภาพ REF ทุกครั้งที่สร้างภาพของตัวละครนั้น",
          "2. ภาพตัวละคร ปาก และพร็อพ: ขอ **พื้นหลังโปร่งใส (PNG)**",
          "3. บันทึกด้วยชื่อ `<asset_id>.png` ตามขนาดที่ระบุ แล้ววางในโฟลเดอร์:",
          "   - ตัวละคร: `cartoon/assets/characters/`",
          "   - ปาก: `cartoon/assets/mouths/`",
          "   - ฉาก: `cartoon/assets/backgrounds/`",
          "   - พร็อพ: `cartoon/assets/props/`",
          "4. รัน `python -m engine.cartoon run EP001 --from assets`",
          "   - ระบบจะเปลี่ยนภาพชั่วคราวเป็นภาพจริงทีละไฟล์",
          "   - ถ้าครบทุกไฟล์ จะออก final.mp4", ""]
    group = None
    for r in reqs:
        g = r["type"]
        if g != group:
            md += [f"## {g}", ""]
            group = g
        md += [f"### {r['asset_id']} ({r['status']})" + (" · ไม่บังคับ (ไม่มีก็แค่ไม่กะพริบตา)" if r["asset_id"].endswith("_blink") else ""), f"- ขนาด: {r['size']}",
               f"- แนบภาพอ้างอิง: {', '.join(r['refs']) or '-'}", "", "```", r["prompt"], "```", ""]
    md += ["## Prompt ภาพเต็มรายช็อต (ทางเลือก ไม่บังคับ)", ""]
    for s in shot_prompts:
        md += [f"### {s['shot_id']}", f"- แนบ: {', '.join(s['refs'])}", "", "```", s["prompt"], "```", ""]
    (d / "prompts" / "prompts.md").write_text("\n".join(md), encoding="utf-8")
    step_set(ep, "prompts", "READY", total=len(reqs), waiting=len(waiting))
    print(f"prompts: {len(reqs)} asset requests ({len(waiting)} waiting), {len(shot_prompts)} shot prompts")
