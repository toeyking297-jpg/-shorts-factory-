"""ตัวช่วย Story Engine ของดูเพลิน: ตรวจโครงบท · หาเรื่องซ้ำ · พิมพ์บท · แปลงเป็น ep.json ร่าง
ไม่เรียก API ใดๆ และไม่เขียนทับไฟล์ใน rodkit/episodes/
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
ROOT = HERE.parent
MEM = HERE / "memory" / "stories.json"
FUNCS = {"info", "harder", "choice", "consequence", "relationship"}
LINKS = {"open", "because", "but", "and"}
SEVEN = ["who", "want", "obstacle", "stakes", "decision", "consequence", "change"]
SIG = ["conflict", "decision", "outcome", "hook", "ending"]
# บทบาทตายตัวของคาสต์ (GUIDE ข้อ 4) — ใช้จับการใช้ตัวละครผิดบทบาท
CANON = {
    "mali": "แม่ของข้าวหอม", "chai": "พ่อของข้าวหอม", "khaohom": "ลูก", "boon": "ยายของข้าวหอม", "cat": "แมวบ้านครอบครัวข้าวหอม",
    "prang": "พนักงานออฟฟิศ", "phum": "พนักงานออฟฟิศ", "fah": "พนักงานออฟฟิศ", "te": "เพื่อนซุ่มซ่าม", "jan": "หัวหน้า",
    "piak": "พ่อค้าตลาด", "jaew": "แม่ค้าตลาด", "yai": "แม่ค้าตลาด", "narrator": "ผู้บรรยาย",
}
SEC_PER_CHAR = 1 / 10.7  # วัดจริงจาก ST003: 874 ตัวอักษร = 81.4 วิ


def load(p):
    return json.loads(pathlib.Path(p).read_text(encoding="utf-8"))


def est_dur(b):
    # ปรับเทียบจาก ST003: เสียงจริง 10.7 ตัวอักษร/วิ + ช่องว่างหัวท้ายประโยค ~0.6 วิ + ภาพประกอบต่อจังหวะ ~1.2 วิ
    n = len(b.get("lines", [])) + (1 if b.get("vo") else 0)
    talk = sum(len(L["text"]) for L in b.get("lines", [])) * SEC_PER_CHAR + len(b.get("vo", "")) * SEC_PER_CHAR
    return (talk + 0.6 * n + 1.2) if talk else float(b.get("dur", 2.0))


def check(st, quiet=False):
    err, warn = [], []
    cast_json = load(ROOT / "cast.json")["characters"]
    for k in SEVEN:
        if not st.get("seven", {}).get(k):
            err.append(f"7 คำถาม: ขาด '{k}'")
    if not st.get("question"):
        err.append("ไม่มีคำถามหลัก (question)")
    cast = {c["who"]: c for c in st.get("cast", [])}
    mains = [w for w, c in cast.items() if c.get("role") == "main"]
    if len(mains) != 1:
        err.append(f"ต้องมีตัวหลัก 1 ตัว (พบ {len(mains)})")
    for w, c in cast.items():
        if w not in cast_json:
            err.append(f"ตัวละคร '{w}' ไม่มีใน cast.json")
        if w in CANON and c.get("canon") and c["canon"] != CANON[w]:
            err.append(f"'{w}' ใช้ผิดบทบาท: บทนี้ = {c['canon']} · บทบาทจริง = {CANON[w]}")
    beats = st.get("beats", [])
    if not 6 <= len(beats) <= 24:
        warn.append(f"จำนวน beat = {len(beats)} (แนะนำ 6–24)")
    plants, ands, choice_by_main, vo_n = set(), 0, False, 0
    first = beats[0] if beats else {}
    if first.get("vo") and not first.get("action"):
        err.append("เปิดเรื่องด้วยเสียงบรรยายอย่างเดียว — ต้องเปิดด้วยเหตุการณ์ที่เห็นเป็นภาพ")
    if first and est_dur(first) > 4:
        warn.append(f"beat แรกยาว ~{est_dur(first):.1f} วิ — ฮุกควรจบใน 3 วิ")
    for i, b in enumerate(beats):
        bid = b.get("id", f"#{i}")
        if b.get("link") not in LINKS:
            err.append(f"{bid}: link ต้องเป็น {sorted(LINKS)}")
        ands = ands + 1 if b.get("link") == "and" else 0
        if ands >= 2:
            err.append(f"{bid}: 'แล้วก็' ติดกัน 2 ช่วง — เหตุการณ์ไม่ส่งผลต่อกัน")
        fs = set(b.get("function", []))
        if not fs or not fs <= FUNCS:
            err.append(f"{bid}: function ต้องมีอย่างน้อย 1 ค่าจาก {sorted(FUNCS)}")
        if "choice" in fs:
            if b.get("decider") in mains:
                choice_by_main = True
            else:
                warn.append(f"{bid}: ฉากเลือกแต่ผู้ตัดสินใจไม่ใช่ตัวหลัก ({b.get('decider')})")
        for p in b.get("payoffs", []):
            if p not in plants:
                err.append(f"{bid}: payoff '{p}' ไม่เคยปูไว้ก่อนหน้า (หักมุมไม่เป็นธรรม)")
        plants |= set(b.get("plants", []))
        for L in b.get("lines", []):
            if L["who"] not in cast and L["who"] != "narrator":
                err.append(f"{bid}: '{L['who']}' พูดแต่ไม่อยู่ใน cast")
            if len(L["text"]) > 48:
                warn.append(f"{bid}: บทพูดยาว {len(L['text'])} ตัวอักษร (~{len(L['text']) * SEC_PER_CHAR:.1f} วิ) — ตัดให้สั้น")
        if b.get("vo"):
            vo_n += 1
        if not b.get("action"):
            err.append(f"{bid}: ไม่มี action (สิ่งที่ต้องเห็นบนจอ)")
    if not choice_by_main:
        err.append("ตัวหลักไม่มีฉากตัดสินใจ (function choice + decider) — เรื่องจะเดินด้วยคนอื่นหรือโชค")
    moral = ("ชีวิต", "บางครั้ง", "จงจำ", "ข้อคิด", "เราไม่จำเป็นต้อง", "ขอให้", "ลอง")
    for b in beats[-2:]:
        if any(m in b.get("vo", "") for m in moral):
            warn.append(f"{b.get('id')}: เสียงบรรยายตอนท้ายสรุปข้อคิดแทนคนดู — ให้ภาพ/การกระทำบอกแทน")
    for p in st.get("ending", {}).get("twist_plants", []):
        if p not in plants:
            err.append(f"หักมุมอ้าง '{p}' ที่ไม่มีใน plants")
    # มุมมองเปลี่ยน (แนวช่อง GUIDE ข้อ 0)
    pv = st.get("perspective")
    if pv is None:
        warn.append("ไม่มีช่อง perspective (แนวช่อง: เรื่องเปลี่ยนมุมมอง)")
    else:
        for k in ("initial_belief", "why_plausible", "hidden_context", "reveal_method", "reveal_plants", "new_meaning", "early_beat", "info_mode"):
            if not pv.get(k):
                err.append(f"perspective: ขาด '{k}'")
        for pl in pv.get("reveal_plants", []):
            if pl not in plants:
                err.append(f"perspective: หลักฐานเฉลย '{pl}' ไม่เคยปูในบท")
        ids = [b.get("id") for b in beats]
        if pv.get("early_beat") in ids and ids.index(pv["early_beat"]) > len(ids) // 3:
            warn.append("early_beat ควรอยู่ช่วงต้นเรื่อง (ภาพตอนต้นที่ความหมายเปลี่ยนตอนท้าย)")
        try:
            mem = load(MEM)["stories"]
            recent = [m.get("reveal_method") for m in mem[-3:] if m.get("reveal_method")]
            if pv.get("reveal_method") in recent:
                err.append(f"วิธีเฉลย '{pv['reveal_method']}' ซ้ำกับ 3 เรื่องล่าสุด")
            cliche = ("diary", "letter", "cctv", "secret_notebook")
            if pv.get("reveal_method") in cliche and any(m.get("reveal_method") in cliche for m in mem[-5:]):
                err.append("เฉลยด้วยสมุดลับ/จดหมาย/กล้องวงจรปิด ซ้ำในช่วง 5 เรื่องล่าสุด")
        except Exception:  # noqa: BLE001
            pass
    tgt = st.get("target_sec")
    if tgt and beats:
        acc, hook_end = 0.0, None
        for b in beats:
            acc += est_dur(b)
            if hook_end is None and ("harder" in b.get("function", []) or "info" in b.get("function", [])):
                hook_end = acc
        if hook_end and hook_end > 8:
            warn.append(f"ฮุกจบที่ ~{hook_end:.0f} วิ (แนวทาง ≤ 8 วิ)")
    hp = st.get("hero_prop")
    if hp and len(hp.get("beats", [])) < 3:
        warn.append("ของพระเอกเห็นน้อยกว่า 3 ครั้ง")
    dur = sum(est_dur(b) for b in beats)
    tg = st.get("target_sec")
    if tg and not 0.7 * tg <= dur <= 1.0 * tg:
        warn.append(f"เสียงพูด+ช็อตเงียบประมาณ {dur:.0f} วิ เทียบเป้า {tg} วิ — ช่วงที่ปรับได้ควรเหลือ 0–30%")
    elif not tg and not 40 <= dur <= 150:
        warn.append(f"ความยาวประมาณ {dur:.0f} วิ")
    if not quiet:
        for e in err:
            print("ERROR ", e)
        for w in warn:
            print("WARN  ", w)
        print(f"สรุป: ERROR {len(err)} · WARN {len(warn)} · beat {len(beats)} · ยาวประมาณ {dur:.0f} วิ")
    return err, warn, dur


def dup(st):
    mem = load(MEM)["stories"]
    sig = st.get("signature", {})
    out = []
    for m in mem:
        same = [k for k in SIG if sig.get(k) and sig.get(k) == m.get("signature", {}).get(k)]
        extra = [k for k in ("slot", "format", "mechanism") if st.get(k) and st.get(k) == m.get(k)]
        score = len(same) + 0.5 * len(extra)
        out.append((score, m["id"], m["title"], same + extra))
    out.sort(reverse=True)
    for score, i, t, ks in out:
        flag = "ซ้ำมาก" if score >= 4 else ("ใกล้" if score >= 2.5 else "ต่าง")
        print(f"{flag:6s} {score:.1f}  {i} {t}  ตรงกันที่: {', '.join(ks) or '-'}")
    return out


def script(st):
    cast = load(ROOT / "cast.json")["characters"]
    nm = lambda w: cast.get(w, {}).get("name", w)  # noqa: E731
    o = [f"# {st['title']}", "", f"> {st['logline']}", ""]
    t = 0.0
    for b in st["beats"]:
        d = est_dur(b)
        o.append(f"**{b['id']} · {t:.0f}–{t + d:.0f} วิ · {b['set']}** ({b['link']}; {', '.join(b['function'])})")
        o.append(f"- ภาพ: {b['action']}")
        for L in b.get("lines", []):
            o.append(f"- {nm(L['who'])}: “{L['text']}”")
        if b.get("thought"):
            o.append(f"- (ความคิดลอย) {b['thought']}")
        if b.get("vo"):
            o.append(f"- เสียงบรรยาย: {b['vo']}")
        o.append("")
        t += d
    return "\n".join(o)


def to_ep(st):
    """ร่าง ep.json ที่ระบบผลิตเดิมรับได้: 1 beat = 1 ช็อต (ฝ่ายผลิตแตกช็อต/กล้อง/ของทีหลัง)"""
    shots = []
    for b in st["beats"]:
        who = list(dict.fromkeys(b.get("on_screen", []) + [L["who"] for L in b.get("lines", []) if L["who"] != "narrator"]))
        people = [w for w in who if w != "cat"]
        xs = [0] if len(people) == 1 else [(-300 + 600 * i / max(1, len(people) - 1)) for i in range(len(people))]
        S = {"name": b["id"], "set": b["set"], "cam": {"x": 0, "y": -380, "z": 1.05},
             "actors": [{"who": w, "view": "front", "x": round(x), "y": 230, "s": 0.62, "light": "litL"} for w, x in zip(people, xs)],
             "note": b["action"]}
        if b.get("lines"):
            S["say"] = [{"who": L["who"], "text": L["text"]} for L in b["lines"]]
        else:
            S["dur"] = round(est_dur(b), 1)
        if b.get("vo"):
            S.setdefault("say", []).append({"who": "narrator", "text": b["vo"]})
        if b.get("thought"):
            S["ui"] = [{"type": "bubble", "t0": 0.2, "t1": 99, "text": b["thought"], "think": True}]
        shots.append(S)
    return {"id": st["id"], "engine": "flat", "fps": 30, "set": st["beats"][0]["set"], "title": st["title"],
            "draft": True, "source": f"rodkit/story/stories/{st['id']}.story.json", "ambience": "auto", "shots": shots}


def main():
    cmd, p = sys.argv[1], sys.argv[2]
    st = load(p)
    if cmd == "check":
        e, _, _ = check(st)
        sys.exit(1 if e else 0)
    elif cmd == "dup":
        dup(st)
    elif cmd == "script":
        print(script(st))
    elif cmd == "to-ep":
        out = pathlib.Path(sys.argv[3])
        if "rodkit/episodes" in str(out.resolve()) and out.exists():
            sys.exit("ไม่เขียนทับไฟล์ใน rodkit/episodes/")
        out.write_text(json.dumps(to_ep(st), ensure_ascii=False, indent=1), encoding="utf-8")
        print("เขียน", out)


if __name__ == "__main__":
    main()
