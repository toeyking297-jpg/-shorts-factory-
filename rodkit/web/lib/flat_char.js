// flat_char.js — ตัวละครสไตล์แบน (หันข้าง / หันหน้า) ข้อต่อกลมไม่มีรอยต่อ เดินไม่ไถลเท้า
// หน่วย: ตัวสูง ~1000 หน่วย จุดกำเนิด = กลางเท้าบนพื้น, แกน y ขึ้นเป็นลบ
(function (G) {
  const RK = G.RK, f = RK.f, sh = RK.shade, D2R = Math.PI / 180;

  // ---------- ทีมนักแสดง ----------
  RK.FLAT_CAST = {
    prang: { sex: "f", skin: "#F3C9A8", hair: "#3B2622", hairHi: "#6A4436", style: "long",
      top: "#F6EEE2", topKind: "blouse", apron: "#8FAE96", bottom: "#3F4663", bottomKind: "wide", shoe: "#EFE8DC",
      lips: "#D46A63", iris: "#3A2420", h: 1.0 },
    phum: { sex: "m", skin: "#E8B690", hair: "#211919", hairHi: "#4A3A34", style: "comma",
      top: "#2F4B6E", topKind: "tee", print: "#F2C14E", bottom: "#C8B596", bottomKind: "chino", shoe: "#F4F1EA",
      lips: "#B86B5E", iris: "#2A1E1A", h: 1.06 },
  };

  // ---------- เดิน: ระยะต่อรอบ (เท้าไม่ไถล) ----------
  const THIGH = 225, SHIN = 205, LEG = THIGH + SHIN, AMP = 24;
  RK.FLAT_STRIDE = 520; // ระยะเดิน 1 รอบ (2 ก้าว) หน่วยตัวละคร

  // ---------- ตัวช่วย ----------
  const P = (x, y) => f(x) + "," + f(y);
  const line = (a, b, w, c, extra = "") => `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const circ = (x, y, r, c, extra = "") => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" ${extra}/>`;
  const path = (d, c, extra = "") => `<path d="${d}" fill="${c}" ${extra}/>`;
  const R2 = (c, w, h, col) => `<rect x="${f(c[0] - w / 2)}" y="${f(c[1] - h / 2 + 7)}" width="${f(w)}" height="${f(h)}" rx="3" fill="none" stroke="${col}" stroke-width="3"/>`;
  const pol = (a, l, ang) => [a[0] + l * Math.sin(ang * D2R), a[1] + l * Math.cos(ang * D2R)];
  // ส่วนแขนขาเรียว (ปลายมน) จาก a ไป b ความกว้าง w1→w2
  function taper(a, b, w1, w2, c, extra = "") {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const p1 = [a[0] + nx * w1 / 2, a[1] + ny * w1 / 2], p2 = [b[0] + nx * w2 / 2, b[1] + ny * w2 / 2];
    const p3 = [b[0] - nx * w2 / 2, b[1] - ny * w2 / 2], p4 = [a[0] - nx * w1 / 2, a[1] - ny * w1 / 2];
    return `<path d="M${P(...p1)} L${P(...p2)} A${f(w2 / 2)},${f(w2 / 2)} 0 0 0 ${P(...p3)} L${P(...p4)} A${f(w1 / 2)},${f(w1 / 2)} 0 0 0 ${P(...p1)}Z" fill="${c}" ${extra}/>`;
  }

  // ---------- ท่าทาง ----------
  // แขน: [ต้นแขน, ศอก] องศา (0 = ห้อยลง, + = ไปข้างหน้า), ขา: [ต้นขา, เข่า]
  const ARM = {
    idle: { n: [-4, 12], f: [4, 14] },
    cross: { n: [12, 105], f: [16, 100] },
    stir: { n: [32, 70], f: [26, 80] },
    give: { n: [62, 18], f: [6, 16] },
    take: { n: [52, 34], f: [8, 18] },
    hold: { n: [18, 92], f: [8, 18] },
    sip: { n: [10, 150], f: [6, 18] },
    wave: { n: [150, 30], f: [4, 14] },
    point: { n: [80, 6], f: [4, 14] },
    shrug: { n: [-10, 95], f: [-6, 95] },
    stretch: { n: [170, 10], f: [165, 12] },
  };
  RK.FLAT_ARM = ARM;
  function armPose(A, t) {
    const a = ARM[A.arms] || ARM.idle, b = A.arms2 && ARM[A.arms2];
    const k = b ? RK.clamp(A.armMix ?? 0) : 0;
    const L = (x, y) => [x[0] + (y[0] - x[0]) * k, x[1] + (y[1] - x[1]) * k];
    let n = b ? L(a.n, b.n) : a.n.slice(), fr = b ? L(a.f, b.f) : a.f.slice();
    if ((A.arms === "stir" && k < 0.5) || (A.arms2 === "stir" && k > 0.5)) { n = [n[0] + 6 * Math.sin(t * 7), n[1] + 10 * Math.cos(t * 7)]; }
    if ((A.arms === "wave" && k < 0.5) || (A.arms2 === "wave" && k > 0.5)) { n = [n[0], n[1] + 22 * Math.sin(t * 11)]; }
    return { n, f: fr };
  }


  // ---------- มือ: นิ้วแยกชัด (ระบบพิกัดมือ: +y = ทิศนิ้ว, +x = ฝั่งนิ้วโป้ง) ----------
  function hand(kind, c) {
    const d = sh(c, -0.22), d2 = sh(c, -0.1), ln = `stroke="${d}" stroke-width="2.4" stroke-linecap="round" fill="none"`;
    const fing = (x, y, ang, len, w) => { const e = [x + Math.sin(ang * D2R) * len, y + Math.cos(ang * D2R) * len]; return taper([x, y], e, w, w * 0.86, c, `stroke="${d}" stroke-width="2"`) + `<path d="M${P(e[0] - w * 0.25, e[1] - 4)} q ${f(w * 0.25)},3 ${f(w * 0.5)},0" stroke="${d2}" stroke-width="1.6" fill="none"/>`; };
    if (kind === "open") { // กางนิ้ว เห็นฝ่ามือ
      let r = fing(18, 10, 52, 24, 12);
      r += fing(-13, 30, -9, 25, 10) + fing(-4.5, 32, -3, 30, 10.5) + fing(4.5, 32, 3, 29, 10.5) + fing(13, 30, 9, 24, 10);
      r += path(`M -19,-2 C -21,12 -20,26 -16,34 L 17,34 C 21,24 21,10 18,-2 Z`, c);
      r += `<path d="M -10,20 C -2,26 8,24 14,14" ${ln}/><path d="M -6,8 C -2,14 4,18 10,30" stroke="${d}" stroke-width="1.8" fill="none" opacity=".6"/>`;
      return r;
    }
    if (kind === "grip") { // กำ (จับหูแก้ว)
      let r = path(`M -18,-2 C -21,14 -18,34 -4,40 C 10,44 22,36 22,22 C 22,10 20,2 18,-2 Z`, c);
      r += `<path d="M 4,18 C 12,17 18,18 22,20" ${ln}/><path d="M 1,27 C 10,26 17,28 21,30" ${ln}/><path d="M -2,35 C 6,35 12,36 16,38" ${ln}/>`;
      r += taper([10, 4], [24, 14], 12, 10, c, `stroke="${d}" stroke-width="2"`);
      return r;
    }
    if (kind === "point") {
      let r = path(`M -18,-2 C -21,14 -18,32 -4,36 C 10,40 20,32 20,20 C 20,10 19,2 17,-2 Z`, c);
      r += `<path d="M 2,22 C 10,22 16,24 19,26" ${ln}/><path d="M 0,30 C 8,30 13,32 16,34" ${ln}/>`;
      r += fing(10, 14, 4, 34, 10.5) + taper([14, 4], [20, 18], 11, 10, c, `stroke="${d}" stroke-width="2"`);
      return r;
    }
    // relaxed: นิ้วชิดกัน งอเล็กน้อย มีขีดแยกนิ้ว
    let r = path(`M -18,-2 C -20,12 -19,28 -17,36 C -16,52 -8,62 4,62 C 13,62 18,54 18,44 L 18,-2 Z`, c);
    r += `<path d="M -8,34 C -8,46 -5,55 -1,60" ${ln}/><path d="M 1,34 C 1,46 4,55 8,59" ${ln}/><path d="M 10,33 C 11,43 13,50 15,54" ${ln}/>`;
    r += `<path d="M -16,30 C -6,34 6,34 17,30" stroke="${d}" stroke-width="1.8" fill="none" opacity=".55"/>`;
    r += taper([14, 6], [21, 32], 13, 11, c, `stroke="${d}" stroke-width="2"`) + `<path d="M 17,28 q 3,2 5,0" stroke="${d2}" stroke-width="1.5" fill="none"/>`;
    return r;
  }
  function handKind(A, side) {
    const holding = A.prop && (A.propHand || "n") === side;
    if (holding) return "grip";
    const pose = (A.armMix ?? 0) > 0.5 && A.arms2 ? A.arms2 : A.arms;
    const OP = RK.FLAT_OPEN || {};
    if (OP[pose] && OP[pose].includes(side)) return "open";
    if (side === "n" && (pose === "wave" || pose === "take" || pose === "shrug" || pose === "stretch")) return "open";
    if (side === "n" && pose === "point") return "point";
    return "relaxed";
  }

  // ---------- ใบหน้า: ด้านข้าง (หันขวา) จุดกำเนิด = กลางศีรษะ ----------
  function eyeSide(C, ex, ey, blink, mood) {
    if (mood === "shock") return `<ellipse cx="${f(ex + 1)}" cy="${f(ey - 1)}" rx="11" ry="16" fill="#FFFDF8" stroke="#2A1C19" stroke-width="2.5"/>` + circ(ex + 4, ey, 4.5, C.iris) + circ(ex + 5, ey - 2, 1.5, "#fff");
    if (mood === "pain") return `<path d="M${P(ex - 9, ey - 9)} L${P(ex + 7, ey)} L${P(ex - 9, ey + 9)}" stroke="#2A1C19" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    const open = (mood === "sleep" || mood === "yawn") ? 0 : 1 - blink;
    if (mood === "happy" || mood === "laugh" || open < 0.15) {
      return `<path d="M${P(ex - 11, ey + 1)} Q${P(ex + 1, ey - 9 * (mood === "happy" ? 1 : 0.2))} ${P(ex + 12, ey + 2)}" stroke="#2A1C19" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    }
    let s = `<ellipse cx="${f(ex + 1)}" cy="${f(ey)}" rx="8.5" ry="${f(13 * open)}" fill="${C.iris}"/>`;
    s += circ(ex + 4, ey - 5 * open, 3.2, "#fff") + circ(ex - 1.5, ey + 5 * open, 1.4, "#fff", 'opacity=".7"');
    if (C.sex === "f") s += `<path d="M${P(ex - 9, ey - 12 * open)} Q${P(ex + 2, ey - 17 * open)} ${P(ex + 14, ey - 10 * open)} L${P(ex + 18, ey - 15 * open)}" stroke="#241614" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    else s += `<path d="M${P(ex - 8, ey - 12 * open)} Q${P(ex + 2, ey - 15 * open)} ${P(ex + 12, ey - 11 * open)}" stroke="#241614" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    return s;
  }
  function mouthSide(C, mx, my, talk, mood) {
    if (mood === "yawn") return `<ellipse cx="${f(mx - 4)}" cy="${f(my + 8)}" rx="11" ry="17" fill="#6E2B2B"/><ellipse cx="${f(mx - 4)}" cy="${f(my + 18)}" rx="7" ry="5" fill="#D9776E"/>`;
    if (mood === "shock") return `<ellipse cx="${f(mx - 2)}" cy="${f(my + 4)}" rx="6" ry="9" fill="#6E2B2B"/>`;
    if (mood === "pain") return `<path d="M${P(mx - 12, my + 2)} L${P(mx - 6, my - 2)} L${P(mx - 1, my + 3)} L${P(mx + 5, my - 2)}" stroke="#7A3530" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (talk > 0.08) {
      const o = 4 + talk * 14;
      return `<path d="M${P(mx - 12, my - 2)} Q${P(mx - 2, my - 5)} ${P(mx + 6, my - 3)} Q${P(mx + 4, my + o)} ${P(mx - 8, my + o * 0.8)} Z" fill="#6E2B2B"/>` +
        `<path d="M${P(mx - 8, my + o * 0.55)} Q${P(mx - 2, my + o * 0.35)} ${P(mx + 3, my + o * 0.5)} L${P(mx - 6, my + o * 0.8)}Z" fill="#D9776E"/>` +
        `<path d="M${P(mx - 11, my - 2)} L${P(mx + 5, my - 3)}" stroke="#fff" stroke-width="3" opacity=".9"/>`;
    }
    if (mood === "happy" || mood === "smile") return `<path d="M${P(mx - 13, my - 4)} Q${P(mx - 2, my + 7)} ${P(mx + 6, my - 4)}" stroke="#7A3530" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    if (mood === "sleepy") return `<path d="M${P(mx - 10, my)} L${P(mx + 4, my - 1)}" stroke="#7A3530" stroke-width="4" stroke-linecap="round"/>`;
    return `<path d="M${P(mx - 11, my - 1)} Q${P(mx - 3, my + 3)} ${P(mx + 5, my - 2)}" stroke="#7A3530" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }

  // ทรงผม (ด้านข้าง) : back = ส่วนหลังศีรษะ (วาดก่อนหน้า), front = ส่วนบน/หน้าม้า (วาดทับ)
  function hairSide(C, sway) {
    if (RK.FLAT_HAIR && RK.FLAT_HAIR[C.style]) return RK.FLAT_HAIR[C.style].side(C, sway);
    const h = C.hair, hi = C.hairHi;
    if (C.style === "long") {
      const s = sway * 14;
      // ผมยาวด้านหลัง: ไหลจากกลางหัวลงหลังคอ ปลายซอยเป็นชั้น
      const back = path(`M -30,-104 C -86,-96 -108,-40 -104,20 C -100,90 -108,170 ${f(-112 + s)},240 C ${f(-114 + s)},270 ${f(-104 + s * 1.2)},296 ${f(-88 + s * 1.3)},312 C ${f(-84 + s * 1.3)},298 ${f(-80 + s * 1.3)},292 ${f(-72 + s * 1.2)},300 C ${f(-66 + s * 1.2)},286 ${f(-60 + s * 1.1)},282 ${f(-52 + s)},288 C -44,240 -38,170 -38,110 C -38,70 -40,40 -44,20 Z`, h) +
        path(`M ${f(-70 + s * 0.5)},60 C ${f(-74 + s * 0.8)},140 ${f(-78 + s)},220 ${f(-72 + s * 1.2)},290`, "none", `stroke="${hi}" stroke-width="6" stroke-linecap="round" opacity=".5"`) +
        path(`M ${f(-94 + s * 0.5)},40 C ${f(-98 + s * 0.8)},120 ${f(-100 + s)},200 ${f(-96 + s * 1.2)},270`, "none", `stroke="${sh(h, -0.35)}" stroke-width="5" stroke-linecap="round" opacity=".6"`);
      // ส่วนบน: หัวมีวอลลุ่ม หน้าม้าปัดข้างลงถึงคิ้ว ทัดหลังหู (เห็นหู)
      const front = path(`M -92,-4 C -100,-76 -48,-126 20,-122 C 74,-118 106,-84 104,-44 C 103,-30 98,-18 90,-10 C 86,-26 76,-38 60,-46 C 64,-34 62,-24 56,-18 C 50,-34 36,-46 18,-50 C 8,-42 -2,-36 -14,-32 C -24,-28 -30,-18 -32,-6 C -34,14 -36,36 -40,64 L -102,64 C -98,34 -94,12 -92,-4 Z`, h) +
        path(`M -50,-98 C -10,-118 44,-114 82,-84`, "none", `stroke="${hi}" stroke-width="10" stroke-linecap="round" opacity=".7"`) +
        path(`M 30,-104 C 62,-92 86,-70 96,-40`, "none", `stroke="${hi}" stroke-width="5" stroke-linecap="round" opacity=".45"`) +
        path(`M 18,-50 C 40,-42 54,-30 56,-18`, "none", `stroke="${sh(h, -0.35)}" stroke-width="3.5" stroke-linecap="round" opacity=".7"`) +
        path(`M 60,-46 C 76,-36 86,-24 90,-10`, "none", `stroke="${sh(h, -0.35)}" stroke-width="3.5" stroke-linecap="round" opacity=".7"`) +
        path(`M -14,-32 C -26,-26 -34,-12 -36,4`, "none", `stroke="${sh(h, -0.35)}" stroke-width="3" stroke-linecap="round" opacity=".6"`);
      return { back, front };
    }
    // ผู้ชาย ทรงคอมม่า: ด้านบนฟู ปอยหน้าโค้งลงเป็นปลายแหลม ข้างสั้นไล่เฉด เห็นหู
    const back = path(`M -92,0 C -100,-66 -60,-110 0,-114 C 50,-116 90,-92 98,-52 L 60,-40 L -10,-24 L -46,10 L -70,42 C -84,32 -90,18 -92,0 Z`, sh(h, 0.12), 'opacity=".75"');
    const front = path(`M -98,-20 C -112,-86 -56,-142 20,-140 C 70,-138 104,-112 112,-74 C 118,-52 112,-30 100,-14 C 104,-30 98,-44 90,-50 C 92,-36 86,-24 74,-18 C 78,-32 72,-46 62,-52 C 50,-42 36,-38 22,-38 C 16,-30 10,-20 8,-6 C 0,-22 -10,-30 -24,-32 C -36,-30 -50,-18 -60,-2 C -64,10 -66,24 -70,36 C -84,22 -94,4 -98,-20 Z`, h) +
      path(`M -70,-110 C -30,-136 40,-136 90,-104`, "none", `stroke="${hi}" stroke-width="10" stroke-linecap="round" opacity=".75"`) +
      path(`M -44,-86 C -10,-104 40,-106 80,-88`, "none", `stroke="${hi}" stroke-width="6" stroke-linecap="round" opacity=".5"`) +
      path(`M 40,-120 C 70,-110 96,-90 104,-50`, "none", `stroke="${sh(h, -0.4)}" stroke-width="4" stroke-linecap="round" opacity=".8"`) +
      path(`M 62,-52 C 76,-44 86,-34 90,-50`, "none", `stroke="${sh(h, -0.45)}" stroke-width="3" stroke-linecap="round" opacity=".7"`) +
      path(`M -60,-2 C -54,-14 -40,-26 -24,-32 L -20,-22 C -34,-16 -46,-4 -50,10 Z`, sh(h, 0.25), 'opacity=".5"');
    return { back, front };
  }

  function headSide(C, o) {
    const sk = C.skin, hr = hairSide(C, o.sway || 0);
    let s = hr.back;
    // คอ
    // หน้า+กะโหลก
    s += path(`M -84,-20 C -86,-92 -20,-112 34,-102 C 80,-92 98,-56 97,-18 L 98,-2 C 101,6 112,16 110,26 C 108,33 99,35 97,39 C 100,46 99,54 95,60 C 92,64 94,70 90,76 C 82,90 62,96 42,96 C 12,96 -18,86 -40,66 C -70,42 -84,14 -84,-20 Z`, sk);
    // เงาใต้คาง / แก้ม
    s += path(`M 90,76 C 82,90 62,96 42,96 C 20,96 0,92 -14,84 C 10,88 50,86 90,76 Z`, sh(sk, -0.1), 'opacity=".8"');
    s += `<ellipse cx="54" cy="36" rx="17" ry="9" fill="#F28C82" opacity="${C.sex === "f" ? 0.38 : 0.18}"/>`;
    // ตา คิ้ว ปาก
    const by = o.brow || 0;
    s += eyeSide(C, 62, 0, o.blink || 0, o.mood);
    s += path(`M ${P(48, -26 - by)} Q ${P(62, -33 - by * 1.2)} ${P(80, -27 - by)}`, "none", `stroke="${C.brow || sh(C.hair, -0.1)}" stroke-width="${C.browW || (C.sex === "f" ? 5 : 7)}" stroke-linecap="round"`);
    s += path(`M 104,28 C 101,30 97,30 95,28`, "none", `stroke="${sh(sk, -0.3)}" stroke-width="3" stroke-linecap="round"`);
    s += mouthSide(C, 90, 54, o.talk || 0, o.mood);
    if (C.sex === "f") s += path(`M 80,50 Q 88,46 96,49`, "none", `stroke="${C.lips}" stroke-width="2.5" opacity=".6"`);
    s += hr.front;
    // หู
    s += `<ellipse cx="-14" cy="12" rx="15" ry="21" fill="${sh(sk, -0.06)}"/>` + path(`M -18,0 C -8,2 -6,16 -14,24`, "none", `stroke="${sh(sk, -0.25)}" stroke-width="4" stroke-linecap="round"`);
    if (C.earring !== false && (C.sex === "f" || C.earring)) s += circ(-12, 34, 4.5, C.earring || "#F4D58D");
    if (RK.flatHeadAcc) s += RK.flatHeadAcc(C, o, "side");
    return s;
  }

  // ---------- ใบหน้า: ด้านหน้า ----------
  function eyeFront(C, ex, ey, blink, mood, look, side) {
    if (mood === "shock") return `<ellipse cx="${f(ex)}" cy="${f(ey - 2)}" rx="18" ry="21" fill="#FFFDF8" stroke="#2A1C19" stroke-width="3"/>` + circ(ex + look * 4, ey, 6, C.iris) + circ(ex + look * 4 + 2, ey - 2, 2, "#fff");
    if (mood === "pain") return `<path d="M${P(ex - side * 12, ey - 10)} L${P(ex + side * 8, ey)} L${P(ex - side * 12, ey + 10)}" stroke="#2A1C19" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    const open = (mood === "sleep" || mood === "yawn") ? 0 : 1 - blink;
    if (mood === "happy" || mood === "laugh" || open < 0.15) return `<path d="M${P(ex - 14, ey + 3)} Q${P(ex, ey - 10 * (mood === "happy" ? 1 : 0.2))} ${P(ex + 14, ey + 3)}" stroke="#2A1C19" stroke-width="5.5" fill="none" stroke-linecap="round"/>`;
    let s = `<ellipse cx="${f(ex)}" cy="${f(ey)}" rx="15" ry="${f(15 * open)}" fill="#FFFDF8"/>`;
    s += `<ellipse cx="${f(ex + look * 4)}" cy="${f(ey + 1)}" rx="10.5" ry="${f(12.5 * open)}" fill="${C.iris}"/>`;
    s += `<ellipse cx="${f(ex + look * 4)}" cy="${f(ey + 2)}" rx="5" ry="${f(6 * open)}" fill="#120B0A"/>`;
    s += circ(ex + look * 4 + 4, ey - 4 * open, 3.6, "#fff") + circ(ex + look * 4 - 3, ey + 5 * open, 1.6, "#fff", 'opacity=".75"');
    const lw = C.sex === "f" ? 5 : 4;
    s += `<path d="M${P(ex - 16, ey - 2)} Q${P(ex, ey - 17 * open)} ${P(ex + 16, ey - 3)}" stroke="#211412" stroke-width="${lw}" fill="none" stroke-linecap="round"/>`;
    if (C.sex === "f") s += `<path d="M${P(ex + side * 15, ey - 4)} L${P(ex + side * 22, ey - 10)}" stroke="#211412" stroke-width="3.5" stroke-linecap="round"/>`;
    return s;
  }
  function mouthFront(C, talk, mood) {
    const y = 60;
    if (mood === "yawn") return `<ellipse cx="0" cy="${y + 10}" rx="16" ry="26" fill="#6E2B2B"/><ellipse cx="0" cy="${y + 26}" rx="10" ry="7" fill="#D9776E"/>`;
    if (mood === "shock") return `<ellipse cx="0" cy="${y + 6}" rx="10" ry="14" fill="#6E2B2B"/>`;
    if (mood === "pain") return `<path d="M -16,${y + 2} L -8,${y - 3} L 0,${y + 3} L 8,${y - 3} L 16,${y + 2}" stroke="#7A3530" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (talk > 0.08) {
      const o = 5 + talk * 16, w = 15 - talk * 3;
      return `<path d="M${P(-w, y - 2)} Q${P(0, y - 6)} ${P(w, y - 2)} Q${P(w * 0.7, y + o)} ${P(0, y + o + 2)} Q${P(-w * 0.7, y + o)} ${P(-w, y - 2)}Z" fill="#6E2B2B"/>` +
        `<path d="M${P(-w * 0.6, y + o * 0.7)} Q${P(0, y + o * 0.35)} ${P(w * 0.6, y + o * 0.7)} Q${P(0, y + o + 1)} ${P(-w * 0.6, y + o * 0.7)}Z" fill="#D9776E"/>` +
        `<path d="M${P(-w * 0.85, y - 2)} L${P(w * 0.85, y - 2)}" stroke="#fff" stroke-width="3.5"/>`;
    }
    if (mood === "happy" || mood === "smile") return `<path d="M${P(-17, y - 4)} Q${P(0, y + 12)} ${P(17, y - 4)}" stroke="#7A3530" stroke-width="5" fill="none" stroke-linecap="round"/>` + (C.sex === "f" ? `<path d="M -10,${y + 7} Q 0,${y + 11} 10,${y + 7}" stroke="${C.lips}" stroke-width="3" fill="none" opacity=".5"/>` : "");
    if (mood === "sleepy") return `<path d="M -10,${y} Q 0,${y + 3} 10,${y}" stroke="#7A3530" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    return `<path d="M -13,${y - 1} Q 0,${y + 5} 13,${y - 1}" stroke="#7A3530" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  }
  function hairFront(C, sway) {
    if (RK.FLAT_HAIR && RK.FLAT_HAIR[C.style]) return RK.FLAT_HAIR[C.style].front(C, sway);
    const h = C.hair, hi = C.hairHi, s = sway * 10;
    if (C.style === "long") {
      const back = path(`M -96,-20 C -112,-110 112,-110 96,-20 C 100,60 ${f(100 + s)},150 ${f(96 + s * 1.3)},230 C 50,246 -50,246 ${f(-96 + s * 1.3)},230 C ${f(-100 + s)},150 -100,60 -96,-20 Z`, sh(h, -0.12));
      const front = path(`M -98,-10 C -112,-100 -40,-128 6,-124 C 70,-122 112,-90 100,-6 C 98,40 100,110 ${f(104 + s)},170 C 90,176 82,160 80,140 C 82,90 82,40 72,-4 C 60,-46 36,-60 10,-72 C -6,-44 -32,-24 -62,-16 C -76,20 -80,90 -78,150 C -82,170 -96,172 ${f(-104 + s)},166 C -104,100 -104,40 -98,-10 Z`, h) +
        path(`M -60,-100 C -20,-118 30,-118 70,-96`, "none", `stroke="${hi}" stroke-width="10" stroke-linecap="round" opacity=".65"`) +
        path(`M 10,-72 C 30,-62 54,-46 66,-20`, "none", `stroke="${sh(h, -0.35)}" stroke-width="4" stroke-linecap="round" opacity=".6"`) +
        path(`M 86,20 C 90,70 92,120 96,160`, "none", `stroke="${hi}" stroke-width="5" stroke-linecap="round" opacity=".4"`) +
        path(`M -88,20 C -92,70 -94,120 -96,160`, "none", `stroke="${hi}" stroke-width="5" stroke-linecap="round" opacity=".4"`);
      return { back, front };
    }
    const back = "";
    const front = path(`M -92,-4 C -110,-80 -60,-138 6,-134 C 76,-132 112,-86 98,-6 C 94,8 88,12 86,0 C 84,-26 74,-40 60,-46 C 58,-30 48,-20 34,-16 C 40,-34 36,-50 22,-60 C -4,-52 -30,-40 -50,-28 C -60,-14 -70,0 -76,14 C -86,12 -90,6 -92,-4 Z`, h) +
      path(`M -64,-104 C -26,-128 30,-130 74,-104`, "none", `stroke="${hi}" stroke-width="11" stroke-linecap="round" opacity=".75"`) +
      path(`M -40,-76 C -10,-92 30,-94 60,-80`, "none", `stroke="${hi}" stroke-width="6" stroke-linecap="round" opacity=".5"`) +
      path(`M 22,-60 C 40,-52 52,-40 60,-46`, "none", `stroke="${sh(h, -0.4)}" stroke-width="4" stroke-linecap="round" opacity=".7"`);
    return { back, front };
  }
  function headFront(C, o) {
    const sk = C.skin, hr = hairFront(C, o.sway || 0), lk = o.look || 0;
    let s = o.noBack ? "" : hr.back;
    s += `<ellipse cx="-84" cy="14" rx="14" ry="20" fill="${sh(sk, -0.05)}"/><ellipse cx="84" cy="14" rx="14" ry="20" fill="${sh(sk, -0.05)}"/>`;
    if (C.earring !== false && (C.sex === "f" || C.earring)) s += circ(-84, 36, 4.5, C.earring || "#F4D58D") + circ(84, 36, 4.5, C.earring || "#F4D58D");
    s += path(`M -82,-22 C -84,-104 84,-104 82,-22 C 82,26 66,72 30,92 C 14,100 -14,100 -30,92 C -66,72 -82,26 -82,-22 Z`, sk);
    s += path(`M 66,40 C 60,70 44,88 30,92 C 14,100 -14,100 -30,92 C -10,96 30,86 66,40 Z`, sh(sk, -0.08), 'opacity=".8"');
    s += `<ellipse cx="-46" cy="34" rx="18" ry="10" fill="#F28C82" opacity="${C.sex === "f" ? 0.38 : 0.16}"/><ellipse cx="46" cy="34" rx="18" ry="10" fill="#F28C82" opacity="${C.sex === "f" ? 0.38 : 0.16}"/>`;
    s += eyeFront(C, -34, 4, o.blink || 0, o.mood, lk, -1) + eyeFront(C, 34, 4, o.blink || 0, o.mood, lk, 1);
    const by = o.brow || 0, bw = C.browW ? C.browW + 1 : (C.sex === "f" ? 5.5 : 8);
    s += path(`M ${P(-50, -24 - by)} Q ${P(-34, -32 - by * 1.3)} ${P(-16, -25 - by)}`, "none", `stroke="${C.brow || sh(C.hair, -0.1)}" stroke-width="${bw}" stroke-linecap="round"`);
    s += path(`M ${P(16, -25 - by)} Q ${P(34, -32 - by * 1.3)} ${P(50, -24 - by)}`, "none", `stroke="${C.brow || sh(C.hair, -0.1)}" stroke-width="${bw}" stroke-linecap="round"`);
    s += path(`M -6,34 Q 0,38 6,34`, "none", `stroke="${sh(sk, -0.3)}" stroke-width="3.5" stroke-linecap="round"`) + path(`M 3,12 L 6,30`, "none", `stroke="${sh(sk, -0.12)}" stroke-width="3" stroke-linecap="round"`);
    s += mouthFront(C, o.talk || 0, o.mood);
    s += hr.front;
    if (RK.flatHeadAcc) s += RK.flatHeadAcc(C, o, "front");
    return s;
  }

  // ---------- ศีรษะด้านหลัง ----------
  function headBack(C, o) {
    const sk = C.skin, h = C.hair, hi = C.hairHi;
    let s = `<ellipse cx="-84" cy="14" rx="14" ry="20" fill="${sh(sk, -0.08)}"/><ellipse cx="84" cy="14" rx="14" ry="20" fill="${sh(sk, -0.08)}"/>`;
    s += path(`M -82,-22 C -84,-104 84,-104 82,-22 C 82,26 66,72 30,92 C 14,100 -14,100 -30,92 C -66,72 -82,26 -82,-22 Z`, sh(sk, -0.04));
    if (RK.FLAT_HAIR && RK.FLAT_HAIR[C.style] && RK.FLAT_HAIR[C.style].back) return s + RK.FLAT_HAIR[C.style].back(C, o.sway || 0);
    s += path(`M -94,-10 C -110,-112 110,-112 94,-10 C 92,30 80,60 52,76 C 20,88 -20,88 -52,76 C -80,60 -92,30 -94,-10 Z`, h);
    s += path(`M -52,76 C -20,88 20,88 52,76 C 40,62 20,56 0,56 C -20,56 -40,62 -52,76 Z`, sh(h, 0.18), 'opacity=".55"');
    s += path(`M -60,-70 C -20,-98 30,-98 66,-70`, "none", `stroke="${hi}" stroke-width="11" stroke-linecap="round" opacity=".7"`);
    s += path(`M 6,-60 m -14,0 a 14,12 0 1,0 14,-12 a 8,7 0 1,0 8,7`, "none", `stroke="${sh(h, -0.35)}" stroke-width="3.5" opacity=".7"`);
    s += [-60, -36, -12, 12, 36, 60].map((x) => path(`M ${x},-20 C ${x * 1.05},10 ${x * 1.08},40 ${x * 0.9},66`, "none", `stroke="${sh(h, -0.3)}" stroke-width="3" opacity=".45"`)).join("");
    if (C.style === "long") s += path(`M -96,-10 C -100,80 -100,170 -90,240 C -40,256 40,256 90,240 C 100,170 100,80 96,-10 Z`, h) + path(`M -40,40 C -44,120 -44,190 -40,240 M 40,40 C 44,120 44,190 40,240`, "none", `stroke="${hi}" stroke-width="5" opacity=".4"`);
    return s;
  }

  // ---------- รองเท้า ----------
  function shoeSide(C, a, ang, far) {
    if (C.shoeKind && RK.FLAT_SHOE && RK.FLAT_SHOE[C.shoeKind]) return RK.FLAT_SHOE[C.shoeKind].side(C, a, ang, far);
    const c = far ? sh(C.shoe, -0.2) : C.shoe;
    const sole = sh(C.shoe, -0.35);
    return `<g transform="translate(${P(a[0], a[1])}) rotate(${f(ang)}) translate(-4,22)">` +
      path(`M -30,-8 C -32,-34 -6,-40 10,-34 C 30,-28 62,-26 78,-14 C 92,-4 90,10 80,12 L -26,12 C -34,10 -34,0 -30,-8 Z`, c) +
      path(`M -30,6 L 84,6 C 88,10 84,14 78,14 L -26,14 C -32,14 -32,8 -30,6 Z`, sole) +
      path(`M 6,-30 L 30,-24`, "none", `stroke="${sh(c, -0.2)}" stroke-width="4" stroke-linecap="round"`) + `</g>`;
  }

  // ---------- กระโปรง (ด้านข้าง): ชายกระโปรงกางตามขาจริง ----------
  const SKIRT_LEN = { skirt: 0.5, pencil: 0.56, sarong: 0.93, sin: 0.93 };
  function skirtSide(C, A, T, H) {
    const L = SKIRT_LEN[C.bottomKind] || 0.5, hy = H[1] + (LEG + 18) * L * 0.98;
    const xs = [];
    for (const k of ["n", "f"]) {
      const g = A._leg && A._leg[k]; if (!g) continue;
      const pts = [H, g.K, g.An];
      for (let i = 0; i < 2; i++) { const a = pts[i], b = pts[i + 1]; if ((a[1] - hy) * (b[1] - hy) <= 0) xs.push(a[0] + (b[0] - a[0]) * (hy - a[1]) / ((b[1] - a[1]) || 1)); }
      if (g.An[1] < hy) xs.push(g.An[0]);
    }
    const mn = Math.min(...xs, -10), mx = Math.max(...xs, 10);
    const fl = C.bottomKind === "skirt" ? 26 : C.bottomKind === "pencil" ? 4 : 12;
    const a = [mn - 34 - fl, hy], b = [mx + 34 + fl, hy];
    let r = path(`M ${P(...T(-56, -24))} L ${P(...T(55, -24))} C ${P(...T(60, 30))} ${P(b[0] - 4, hy - 60)} ${P(...b)} Q ${P((a[0] + b[0]) / 2, hy + 8)} ${P(...a)} C ${P(a[0] + 4, hy - 60)} ${P(...T(-62, 30))} ${P(...T(-56, -24))} Z`, C.bottom);
    A._skirt = { a, b, hy };
    return r;
  }

  // ---------- ตัว: ด้านข้าง ----------
  function bodySide(C, A, t) {
    const sk = C.skin, pose = armPose(A, t);
    const walkP = A._walkP, walking = A._walking;
    // ท่าเดินจากวงจรคีย์โพส (flat_walk.js)
    const WP = walking > 0 && !A.sit && RK.flatWalkPose ? RK.flatWalkPose(A.who, walkP, walking, !!A.run) : null;
    const breathe = Math.sin(t * 2.2 + (A.seed || 0)) * 3;
    let bob = 0, legs, arms = pose;
    // ขา
    function legAt(ph) { // ph 0..1  เส้นโค้งต่อเนื่องทั้งรอบ (ไม่มีจุดกระตุก)
      const a = ph * 2 * Math.PI;
      const th = AMP * Math.sin(a);
      const sw = Math.max(0, Math.cos(a));            // ช่วงขาเหวี่ยงไปข้างหน้า
      const st = Math.max(0, -Math.cos(a));           // ช่วงขารับน้ำหนัก
      const knee = 5 + 52 * Math.pow(sw, 1.6) + 7 * Math.pow(Math.max(0, Math.sin(a)), 3) * st;
      const foot = 16 * Math.pow(sw, 1.4) * Math.sin(a + 0.6) - 10 * Math.pow(st, 2) * Math.max(0, -Math.sin(a));
      return [th, knee, foot];
    }
    if (walking > 0) {
      const ln = legAt(walkP), lf = legAt(walkP + 0.5), w = walking;
      legs = { n: [ln[0] * w, 4 + (ln[1] - 4) * w, ln[2] * w], f: [lf[0] * w, 4 + (lf[1] - 4) * w, lf[2] * w] };
      bob = 0;
      const W = walking, mix = (p, q) => [p[0] * (1 - W) + q[0] * W, p[1] * (1 - W) + q[1] * W, q[2] * W];
      if (WP) arms = { n: mix(pose.n, WP.arms.n), f: mix(pose.f, WP.arms.f) };
    } else {
      const st = A.stance || 0;
      legs = { n: [3 + st, 4, 0], f: [-3 - st, 4, 0] };
    }
    if (A.sit) legs = { n: [80, 85, 0], f: [76, 85, 0] };
    if (A.free) legs = { n: [A.legNT || 0, A.legNK || 0, A.legNF || 0], f: [A.legFT || 0, A.legFK || 0, A.legFF || 0] };
    const life = (WP || A.free || (A.sitK || 0) > 0) ? 0 : (A.life ?? 1);
    const hip = [A.free ? (A.hipShift || 0) : 0, A.free ? -LEG - 30 + (A.hipDrop || 0) : -LEG - 18 + bob];
    const lean = (A.lean || 0) + (C.hunch || 0) + (WP ? WP.lean : 0) + life * 1.3 * Math.sin(t * 0.5 + (A.seed || 0) * 1.7);
    const sho = [hip[0] + Math.sin(lean * D2R) * 290, hip[1] - 290 + breathe * 0.4];
    const kneeOf = (l) => pol(hip, THIGH, l[0]);
    const ankOf = (l) => pol(kneeOf(l), SHIN, l[0] - l[1]);
    // ถ้าเท้ายืนอยู่กับพื้น ให้ยกตัวพอดี (ขาที่ต่ำสุดแตะพื้น)
    const lowY = Math.max(ankOf(legs.n)[1], ankOf(legs.f)[1]);
    const dy = (A.sit || A.free) ? 0 : -(lowY - (-30)) + (walking > 0 ? 5 * walking * (1 - Math.cos(walkP * 4 * Math.PI)) * 0.5 - 3 * walking : 0);
    const off = (p) => [p[0], p[1] + dy];
    let H = off(hip), S = off(sho), IK = null;
    // ---- เดิน: เท้าล็อกกับพื้นตามจุดหมุน (ส้น/ปลายเท้า) + IK สองท่อน ----
    if (WP) {
      const w = walking;
      H = [0, WP.hipY];
      S = [H[0] + Math.sin(lean * D2R) * 290, H[1] - 290 + breathe * 0.4];
      const st = { n: off(ankOf(legs.n)), f: off(ankOf(legs.f)) };
      IK = {};
      for (const k of ["n", "f"]) {
        const F = WP.feet[k], tgt = [st[k][0] + (F.A[0] - st[k][0]) * w, st[k][1] + (F.A[1] - st[k][1]) * w];
        const ik = RK.flatIK(H, tgt);
        IK[k] = { K: ik.K, A: ik.A, ang: F.ang * w };
      }
    }
    // ---- นั่งลง/ลุกขึ้น: เท้าวางนิ่ง สะโพกเคลื่อนเป็นโค้งไปหลัง-ลง ลำตัวโน้มหน้าถ่ายน้ำหนัก ----
    if (!WP && (A.sitK || 0) > 0) {
      const k = RK.clamp(A.sitK), sm = (x) => { x = RK.clamp(x); return x * x * (3 - 2 * x); };
      const kx = sm(k * 1.25), ky = sm((k - 0.12) / 0.88);
      H = [(A.seatX ?? -78) * kx, H[1] + ((A.seatY ?? -262) - H[1]) * ky];
      const lean2 = lean + 32 * Math.sin(Math.PI * Math.min(1, k)) * (1 - 0.45 * k);
      S = [H[0] + Math.sin(lean2 * D2R) * 290, H[1] - 290 + breathe * 0.4];
      const st = { n: off(ankOf(legs.n)), f: off(ankOf(legs.f)) }, seatA = { n: [44, -30], f: [26, -30] };
      IK = {};
      for (const kk of ["n", "f"]) { const tg = [st[kk][0] + (seatA[kk][0] - st[kk][0]) * ky, -30]; const ik = RK.flatIK(H, tg); IK[kk] = { K: ik.K, A: ik.A, ang: 0 }; }
    }
    const lg = A.laugh || 0;
    if (lg) S = [S[0] - 4 * lg, S[1] - Math.abs(Math.sin(t * 15)) * 7 * lg];
    A._H = H;
    const pantsW = C.bottomKind === "wide" ? [70, 66] : [66, 54];
    const farC = (c) => sh(c, -0.22);
    let s = "";
    const ROT = A.torsoRot ? `<g transform="rotate(${f(A.torsoRot)} ${f(H[0])} ${f(H[1])})">` : "";
    const bw = C.bodyW || 1, bel = C.belly || 0, hk = C.headK || 1, hun = C.hunch || 0, BK = C.bottomKind || "chino";
    const PL = ({ shorts: 0.5, skirt: 0, pencil: 0, sarong: 0, sin: 0 })[BK] ?? 1;
    const ctx = { A, t, view: "side", far: false };
    // แขนไกล
    const drawArm = (a, far) => {
      const sp = [S[0] + (far ? -6 : 4) + (WP ? (far ? WP.shF : WP.shN) : 0), S[1] + 30];
      const el = pol(sp, 150, a[0]), wr = pol(el, 135, a[0] + a[1]);
      const skc = far ? farC(sk) : sk, top = far ? farC(C.top) : C.top;
      let r = taper(sp, el, 44, 38, skc) + taper(el, wr, 38, 32, skc);
      const slv = C.sleeve || (C.topKind === "tee" ? "short" : "rolled");
      const lerp2 = (p, q, k) => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
      if (slv === "short") { const se = lerp2(sp, el, 0.62); r += taper([sp[0], sp[1] - 6], se, 56, 50, top) + taper(lerp2(sp, el, 0.56), se, 52, 52, sh(top, -0.1)); }
      else if (slv === "rolled") { // แขนเสื้อยาวพับถึงศอก
        const fe = lerp2(el, wr, 0.55);
        r += taper([sp[0], sp[1] - 6], el, 54, 48, top) + taper(el, fe, 48, 46, top);
        r += taper(lerp2(el, wr, 0.49), fe, 52, 52, sh(top, -0.08));
      } else if (slv === "full") { // แขนยาวถึงข้อมือ + ปลายแขน
        const fe = lerp2(el, wr, 0.9);
        r += taper([sp[0], sp[1] - 6], el, 56, 50, top) + taper(el, fe, 50, 44, top);
        r += taper(lerp2(el, wr, 0.78), fe, 48, 46, far ? farC(C.cuff || sh(C.top, -0.12)) : (C.cuff || sh(C.top, -0.12)));
        if (C.shirtCuff) r += taper(fe, lerp2(el, wr, 0.95), 40, 38, far ? farC(C.shirtCuff) : C.shirtCuff);
        r += path(`M ${P(...lerp2(sp, el, 0.85))} q 10,6 20,0`, "none", `stroke="${sh(top, -0.18)}" stroke-width="3" opacity=".6"`);
      }
      const ha = a[0] + a[1], side = far ? "f" : "n", kind = handKind(A, side);
      if (kind === "grip" && RK.FLAT_GRIP && RK.FLAT_GRIP[A.prop]) r += RK.FLAT_GRIP[A.prop](pol(wr, 26, ha), ha, C, far, "side");
      else if (kind === "grip" && RK.FLAT_PROPS[A.prop]) { // แก้วอยู่ใต้มือ หูแก้วอยู่ในกำมือ
        const hc = pol(wr, 26, ha);
        r += `<g transform="translate(${P(hc[0] + 31, hc[1] + 2)})">${RK.FLAT_PROPS[A.prop](A.propColor, true)}</g>`;
      }
      r += `<g transform="translate(${P(wr[0], wr[1])}) rotate(${f(-ha + (a[2] || 0))})">` + hand(kind, skc) + `</g>`;
      A._hand = A._hand || {}; A._hand[far ? "f" : "n"] = { p: wr, ang: ha };
      return r;
    };
    { const m0 = s.length; s += drawArm(arms.f, true); if (ROT) s = s.slice(0, m0) + ROT + s.slice(m0) + "</g>"; }
    // ขาไกล
    const drawLeg = (l, far) => {
      const ik = IK && IK[far ? "f" : "n"];
      const K = ik ? ik.K : off(kneeOf(l)), An = ik ? ik.A : off(ankOf(l)), pc = far ? farC(C.bottom) : C.bottom;
      const skc = far ? farC(sk) : sk, sockC = C.sock ? (far ? farC(C.sock) : C.sock) : skc;
      let r;
      if (PL >= 1) {
        r = taper(H, K, pantsW[0], pantsW[0] - 4, pc) + taper(K, An, pantsW[0] - 4, pantsW[1], pc);
        if (C.bottomKind === "wide") r += taper([An[0] - 2, An[1] - 6], [An[0] + 2, An[1] + 2], pantsW[1] + 6, pantsW[1] + 8, pc);
        if (C.bottomKind === "jeans") r += taper([An[0] - 1, An[1] - 22], [An[0], An[1] - 4], pantsW[1] + 4, pantsW[1] + 4, sh(pc, 0.12)) + line([K[0] - 8, K[1] - 4], [K[0] + 6, K[1] + 4], 4, "#F3EFE6", 'opacity=".85"') + line([K[0] - 10, K[1] + 6], [K[0] + 8, K[1] + 10], 3, "#F3EFE6", 'opacity=".7"');
      } else if (PL > 0) { // ขาสั้น: ต้นขาเป็นกางเกง ปลายขาเห็นผิว
        const he = [H[0] + (K[0] - H[0]) * 1.02, H[1] + (K[1] - H[1]) * 1.02];
        r = taper(H, K, 54, 48, skc) + taper(K, An, 48, 38, skc);
        r += path(`M ${P(K[0] - 6, K[1] - 4)} q 8,5 14,0`, "none", `stroke="${sh(skc, -0.18)}" stroke-width="2.5" opacity=".6"`);
        r += taper(H, he, pantsW[0] + 4, pantsW[0] + 10, pc) + taper([he[0] - (K[0] - H[0]) * 0.08, he[1] - (K[1] - H[1]) * 0.08], he, pantsW[0] + 12, pantsW[0] + 12, sh(pc, -0.1));
      } else { // กระโปรง: ขาเป็นผิว
        r = taper(H, K, 54, 46, skc) + taper(K, An, 46, 36, skc);
      }
      A._leg = A._leg || {}; A._leg[far ? "f" : "n"] = { K, An };
      r += taper(An, [An[0], An[1] + 16], 26, 24, sockC);
      r += shoeSide(C, An, ik ? ik.ang : -l[2] + (l[0] - l[1]) * 0.15, far);
      return r;
    };
    s += drawLeg(legs.f, true);
    s += drawLeg(legs.n, false);
    const UP0 = s.length;
    // ลำตัว (กว้าง/พุงตามรูปร่าง)
    const tx = S[0] - H[0], ty = S[1] - H[1];
    const T = (x, y) => { let xx = x * bw; if (x > 0 && bel) xx += bel * Math.pow(Math.max(0, Math.sin(Math.PI * RK.clamp((-y + 10) / 250))), 1.3); return [H[0] + xx + tx * (-y / 290), H[1] + y * (ty / -290)]; };
    Object.assign(ctx, { T, S, H, hk });
    if (RK.flatBodyAcc) s += RK.flatBodyAcc(C, A, "sideBack", ctx);
    // คอ (วาดก่อนลำตัว ปกเสื้อทับโคน ไม่โผล่ทะลุ)
    const hp0 = [S[0] + 10 + hun * 2.4, S[1] - 125 - (hk - 1) * 82 + hun * 1.4 + (WP ? WP.headDy : 0)];
    s += taper([hp0[0] - 4, hp0[1] + 60 * hk], [S[0] - 2, S[1] + 18], 44, 50, sh(sk, -0.1));
    s += taper([hp0[0] + 6, hp0[1] + 84 * hk], [S[0] + 8, S[1] + 4], 14, 8, sh(sk, -0.22), 'opacity=".5"');
    // กางเกงช่วงบน: เอวพอดีตัว สะโพกโค้งลงรับต้นขา (ไม่มีก้อนยื่น)
    const tw = pantsW[0] / 2;
    if (PL === 0) s += skirtSide(C, A, T, H);
    else s += path(`M ${P(...T(-56, -24))} L ${P(...T(55, -24))} C ${P(...T(57, -2))} ${P(...T(52, 10))} ${P(H[0] + tw - 2, H[1] + 6)} C ${P(H[0] + tw - 4, H[1] + tw)} ${P(H[0] - tw + 4, H[1] + tw)} ${P(H[0] - tw + 2, H[1] + 6)} C ${P(...T(-58, 12))} ${P(...T(-58, -2))} ${P(...T(-56, -24))} Z`, C.bottom);
    s += path(`M ${P(...T(-56, -26))} L ${P(...T(55, -26))} L ${P(...T(55.5, -14))} L ${P(...T(-56.5, -14))} Z`, sh(C.bottom, -0.3));
    s += C.bottomKind === "chino" ? R2(T(-10, -27), 16, 15, "#C9A35E") : "";
    s += path(`M ${P(...T(30, -14))} C ${P(...T(38, 4))} ${P(...T(48, 10))} ${P(...T(54, 8))}`, "none", `stroke="${sh(C.bottom, -0.22)}" stroke-width="3" stroke-linecap="round"`);

    const bust = C.sex === "f" ? 8 : 0;
    const tp = [T(-56, 10), T(-60, -60), T(-52, -150), T(-60, -230), T(-48, -284), T(-14, -300), T(26, -296), T(56 + bust * 0.4, -250), T(58 + bust, -200), T(50, -150), T(52, -70), T(54, 10)];
    if (PL === 0 && C.tucked) tp.splice(0, 1, T(-56, -10)), tp.splice(tp.length - 1, 1, T(54, -10));
    s += path(RK.smooth(tp, true), C.top);
    ctx.tpD = RK.smooth(tp, true);
    // ลายเสื้อ / รายละเอียด
    if (C.topKind === "tee") {
      s += path(`M ${P(...T(-10, -300))} Q ${P(...T(14, -276))} ${P(...T(38, -292))}`, "none", `stroke="${sh(C.top, -0.3)}" stroke-width="7" stroke-linecap="round"`);
      s += `<g transform="translate(${P(...T(30, -205))})">` + circ(0, 0, 20, C.print, 'opacity=".95"') + path(`M -9,-2 L 0,-12 L 9,-2 L 4,-2 L 4,10 L -4,10 L -4,-2 Z`, C.top) + `</g>`;
      s += path(`M ${P(...T(-56, -40))} Q ${P(...T(0, -30))} ${P(...T(54, -40))}`, "none", `stroke="${sh(C.top, -0.18)}" stroke-width="4" opacity=".6"`);
    } else if (C.topKind === "blouse") {
      s += path(`M ${P(...T(-6, -300))} L ${P(...T(20, -262))} L ${P(...T(40, -294))}`, "none", `stroke="${sh(C.top, -0.2)}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"`);
      for (let k = 0; k < 4; k++) s += circ(...T(22 + k * 1.5, -240 + k * 52), 4, sh(C.top, -0.25));
    }
    if (C.apron) {
      const ap = [T(-6, -250), T(52 + bust, -244), T(58 + bust, -190), T(56, -80), T(66, 40), T(70, 120), T(10, 130), T(-10, 40), T(-14, -80), T(-10, -190)];
      s += path(RK.smooth(ap, true), C.apron);
      s += path(`M ${P(...T(-10, -150))} L ${P(...T(-58, -150))} L ${P(...T(-74, -120))} M ${P(...T(-58, -150))} L ${P(...T(-80, -160))}`, "none", `stroke="${sh(C.apron, -0.1)}" stroke-width="10" stroke-linecap="round"`);
      s += path(`M ${P(...T(8, -60))} L ${P(...T(52, -60))} L ${P(...T(54, -10))} L ${P(...T(8, -10))} Z`, sh(C.apron, -0.1)) + path(`M ${P(...T(30, -60))} L ${P(...T(30, -10))}`, "none", `stroke="${sh(C.apron, -0.25)}" stroke-width="3"`);
      s += path(`M ${P(...T(-4, -240))} L ${P(...T(-30, -300))}`, "none", `stroke="${sh(C.apron, -0.1)}" stroke-width="9" stroke-linecap="round"`);
    }
    if (RK.FLAT_TOP && RK.FLAT_TOP[C.topKind]) s += RK.FLAT_TOP[C.topKind].side(C, T, ctx);
    if (RK.FLAT_BOTTOM && RK.FLAT_BOTTOM[BK]) s += RK.FLAT_BOTTOM[BK].side(C, T, ctx);
    // หัว
    const nod = (A.nod || 0) + (A.talk ? Math.sin(t * 9) * 2 * A.talk : 0) + (WP ? WP.headTilt : 0) - 8 * lg + (life ? 2.5 * Math.sin(t * 0.7 + (A.seed || 0)) * life : 0);
    const hp = hp0;
    s += `<g transform="translate(${P(hp[0], hp[1])}) rotate(${f((A.tilt || 0) + nod + hun * 0.6)}) scale(${f(hk)})">` + headSide(C, A) + `</g>`;
    // ปกเสื้อ (ทับคอ)
    s += path(`M ${P(...T(-30, -296))} Q ${P(...T(0, -306))} ${P(...T(30, -298))} L ${P(...T(26, -286))} Q ${P(...T(0, -292))} ${P(...T(-26, -284))} Z`, sh(C.top, -0.12));
    if (RK.flatBodyAcc) s += RK.flatBodyAcc(C, A, "side", ctx);
    s += drawArm(arms.n, false);
    if (ROT) s = s.slice(0, UP0) + ROT + s.slice(UP0) + "</g>";
    A._head = A.torsoRot ? (() => { const a = A.torsoRot * D2R, dx = hp[0] - H[0], dy2 = hp[1] - H[1]; return [H[0] + dx * Math.cos(a) - dy2 * Math.sin(a), H[1] + dx * Math.sin(a) + dy2 * Math.cos(a)]; })() : hp;
    return s;
  }

  // ---------- ตัว: ด้านหน้า ----------
  function bodyFront(C, A, t) {
    const sk = C.skin, pose = armPose(A, t), breathe = Math.sin(t * 2.2 + (A.seed || 0)) * 3, back = A.view === "back";
    // เดินเข้า/ออกจากกล้อง: ใช้จังหวะเดียวกับวงจรเดินด้านข้าง (สะโพกขึ้นลง ถ่ายน้ำหนักซ้ายขวา แขนแกว่ง)
    const fw = A._fw || 0, fp = A._fwP || 0, FW = fw > 0 && RK.flatWalkPose ? RK.flatWalkPose(A.who, fp, fw) : null;
    const life = FW ? 0 : (A.life ?? 1);
    const hx = (FW ? 8 * fw * Math.sin(2 * Math.PI * (fp - 0.08)) : 0) + life * 5 * Math.sin(t * 0.5 + (A.seed || 0) * 1.7);
    const hbob = FW ? (FW.hipY - (-30 - (225 + 205) * FW.g.crouch)) * 1.1 : 0;
    const lg = A.laugh || 0;
    const H = [hx, -LEG + hbob], S = [hx, H[1] - 290 + breathe * 0.4 - Math.abs(Math.sin(t * 15)) * 7 * lg];
    if (FW) { pose.n = [FW.arms.n[0] * 0.8, FW.arms.n[1] * 0.6]; pose.f = [FW.arms.f[0] * 0.8, FW.arms.f[1] * 0.6]; }
    const tiltT = FW ? -2.2 * fw * Math.sin(2 * Math.PI * (fp - 0.08)) : 0;
    const pantsW = C.bottomKind === "wide" ? [72, 68] : [66, 56];
    const bw = C.bodyW || 1, bel = C.belly || 0, hk = C.headK || 1, hun = C.hunch || 0, BK = C.bottomKind || "chino";
    const PL = ({ shorts: 0.5, skirt: 0, pencil: 0, sarong: 0, sin: 0 })[BK] ?? 1;
    const ctx = { A, t, view: "front", S, H, hk, bw, bel };
    const nod0 = (A.nod || 0) + (A.talk ? Math.sin(t * 9) * 2 * A.talk : 0);
    const HY = S[1] - 112 - (hk - 1) * 80 + hun * 2.2;
    let s = back ? "" : `<g transform="translate(${f(hx * 0.6)},${f(HY)}) rotate(${f((A.tilt || 0) + nod0 * 0.5)}) scale(${f(hk)})">${hairFront(C, A.sway || 0).back}</g>`;
    if (RK.flatBodyAcc) s += RK.flatBodyAcc(C, A, "frontBack", ctx);
    // ขา
    for (const sd of [-1, 1]) {
      const u = (((fp + (sd > 0 ? 0 : 0.5)) % 1) + 1) % 1, swing = FW && u > 0.6 ? Math.pow(Math.sin(Math.PI * (u - 0.6) / 0.4), 1.1) * fw : 0;
      const down = FW && u < 0.6 ? Math.max(0, Math.sin(Math.PI * u / 0.6)) * 0.25 * fw : 0;
      const hp = [sd * 32 + hx * 0.6, H[1] + 34], an = [sd * 34, -36 - 58 * swing];
      const kn = [sd * (33 + 5 * swing) + hx * 0.3, (hp[1] + an[1]) / 2 - 30 * swing + 6 * down];
      A._fwSwing = A._fwSwing || {}; A._fwSwing[sd] = swing;
      const pc = sh(C.bottom, sd < 0 ? -0.06 : 0), skc = sh(sk, sd < 0 ? -0.05 : 0);
      if (PL >= 1) {
        s += taper(hp, kn, pantsW[0], pantsW[0] - 4, pc) + taper(kn, an, pantsW[0] - 4, pantsW[1], pc);
        if (BK === "jeans") s += taper([an[0], an[1] - 22], [an[0], an[1] - 4], pantsW[1] + 4, pantsW[1] + 4, sh(pc, 0.12)) + line([kn[0] - 10, kn[1] - 4], [kn[0] + 8, kn[1] - 2], 4, "#F3EFE6", 'opacity=".85"') + line([kn[0] - 8, kn[1] + 6], [kn[0] + 10, kn[1] + 8], 3, "#F3EFE6", 'opacity=".7"');
      } else if (PL > 0) {
        s += taper(hp, kn, 54, 48, skc) + taper(kn, an, 48, 38, skc) + path(`M ${P(kn[0] - 8, kn[1] + 6)} q 8,5 16,0`, "none", `stroke="${sh(sk, -0.18)}" stroke-width="2.5" opacity=".6"`);
        s += taper([hp[0], hp[1] - 30], [kn[0] + sd * 4, kn[1] - 6], pantsW[0] + 8, pantsW[0] + 14, pc) + taper([kn[0] + sd * 4, kn[1] - 18], [kn[0] + sd * 4, kn[1] - 6], pantsW[0] + 16, pantsW[0] + 16, sh(pc, -0.1));
      } else {
        s += taper(hp, kn, 54, 46, skc) + taper(kn, an, 46, 36, skc);
      }
      s += taper(an, [an[0], an[1] + 10], 24, 24, C.sock || sk);
      const shoeT = swing ? `<g transform="translate(0,${f(-58 * swing)}) translate(${sd * 36},-10) scale(${f(1 + (A._fwDir || 1) * 0.1 * swing)}) translate(${-sd * 36},10)">` : "<g>";
      s += shoeT + ((C.shoeKind && RK.FLAT_SHOE && RK.FLAT_SHOE[C.shoeKind]) ? RK.FLAT_SHOE[C.shoeKind].front(C, sd) : `<g transform="translate(${P(sd * 36, -10)})">` + path(`M -30,-6 C -32,-30 32,-30 30,-6 C 32,8 26,14 0,14 C -26,14 -32,8 -30,-6 Z`, C.shoe) + path(`M -30,6 C -26,14 26,14 30,6 L 30,10 C 26,18 -26,18 -30,10 Z`, sh(C.shoe, -0.35)) + `</g>`) + "</g>";
    }
    const UPF = s.length;
    // แขน (หน้า: มุมกางออกด้านข้าง)
    const drawArm = (sd, a) => {
      const sp = [sd * 62 * bw, S[1] + 34];
      const up = a[0] > 90 ? a[0] * 0.85 : Math.max(-10, a[0] * 0.35 + 8), raised = a[0] > 90, fa = raised ? up + a[1] * 0.75 : up - a[1] * 0.85, el = pol(sp, 150, sd * up), wr = pol(el, raised ? 135 : 135 * (1 - 0.3 * Math.sin(Math.min(90, a[1]) * D2R)), sd * fa);
      let r = taper(sp, el, 42, 36, sk) + taper(el, wr, 36, 30, sk);
      const slv = C.sleeve || (C.topKind === "tee" ? "short" : "rolled"), lp = (k) => [el[0] + (wr[0] - el[0]) * k, el[1] + (wr[1] - el[1]) * k];
      if (slv === "short") r += taper([sp[0], sp[1] - 8], pol(sp, 92, sd * up), 58, 52, C.top) + taper(pol(sp, 84, sd * up), pol(sp, 92, sd * up), 54, 54, sh(C.top, -0.1));
      else if (slv === "rolled") r += taper([sp[0], sp[1] - 8], el, 54, 48, C.top) + taper(el, lp(0.55), 48, 46, C.top) + taper(lp(0.49), lp(0.55), 52, 52, sh(C.top, -0.08));
      else if (slv === "full") { r += taper([sp[0], sp[1] - 8], el, 56, 50, C.top) + taper(el, lp(0.9), 50, 44, C.top) + taper(lp(0.78), lp(0.9), 48, 46, C.cuff || sh(C.top, -0.12)); if (C.shirtCuff) r += taper(lp(0.9), lp(0.95), 40, 38, C.shirtCuff); }
      const kind = handKind(A, sd > 0 ? "n" : "f");
      if (kind === "grip" && RK.FLAT_GRIP && RK.FLAT_GRIP[A.prop]) r += RK.FLAT_GRIP[A.prop](wr, sd, C, false, "front");
      r += `<g transform="translate(${P(wr[0], wr[1])}) rotate(${f(-sd * fa)}) scale(${sd > 0 ? -1 : 1},1)">` + hand(kind, sk) + `</g>`;
      A._hand = A._hand || {}; A._hand[sd > 0 ? "n" : "f"] = { p: wr, ang: 0 };
      return r;
    };
    // คอ (ก่อนลำตัว)
    s += taper([0, HY + 62 * hk], [0, S[1] + 10], 46, 52, sh(sk, -0.08));
    s += path(`M -22,${f(HY + 70 * hk)} Q 0,${f(HY + 92 * hk)} 22,${f(HY + 70 * hk)} L 22,${f(HY + 84 * hk)} Q 0,${f(HY + 100 * hk)} -22,${f(HY + 84 * hk)} Z`, sh(sk, -0.2), 'opacity=".55"');
    const pelvisF = () => { let s = "";
    // กางเกงช่วงบน: เอว → สะโพก → เป้า (ต่อเนียนกับขาทั้งสอง)
    const hy = H[1], lw = pantsW[0] / 2;
    if (RK.FLAT_TOP && RK.FLAT_TOP[C.topKind] && RK.FLAT_TOP[C.topKind].frontUnder) s += RK.FLAT_TOP[C.topKind].frontUnder(C, ctx);
    if (PL === 0) {
      const L = SKIRT_LEN[BK] || 0.5, hm = hy + (LEG + 18) * L * 0.98, fl = BK === "skirt" ? 30 : BK === "pencil" ? 0 : 10;
      s += path(`M ${f(-66 * bw)},${f(hy - 24)} L ${f(66 * bw)},${f(hy - 24)} C ${f(74 * bw)},${f(hy + 20)} ${f(80 + fl)},${f(hm - 60)} ${f(82 + fl)},${f(hm)} Q 0,${f(hm + 10)} ${f(-82 - fl)},${f(hm)} C ${f(-80 - fl)},${f(hm - 60)} ${f(-74 * bw)},${f(hy + 20)} ${f(-66 * bw)},${f(hy - 24)} Z`, C.bottom);
      ctx.hem = hm; ctx.fl = fl;
    } else s += path(`M -66,${f(hy - 24)} L 66,${f(hy - 24)} C 72,${f(hy + 4)} 72,${f(hy + 24)} ${f(32 + lw)},${f(hy + 40)} L ${f(32 + lw - 2)},${f(hy + 60)} L 6,${f(hy + 60)} Q 0,${f(hy + 72)} -6,${f(hy + 60)} L ${f(-32 - lw + 2)},${f(hy + 60)} L ${f(-32 - lw)},${f(hy + 40)} C -72,${f(hy + 24)} -72,${f(hy + 4)} -66,${f(hy - 24)} Z`, C.bottom);
    s += taper([-66, hy - 20], [66, hy - 20], 13, 13, sh(C.bottom, -0.3));
    if (C.bottomKind === "chino" || C.bottomKind === "jeans" || C.belt) s += `<rect x="-9" y="${f(hy - 27)}" width="18" height="15" rx="3" fill="none" stroke="${C.buckle || "#C9A35E"}" stroke-width="3"/>`;
    if (PL > 0) s += path(`M 0,${f(hy - 13)} L 0,${f(hy + 40)} Q 0,${f(hy + 52)} -8,${f(hy + 58)}`, "none", `stroke="${sh(C.bottom, -0.22)}" stroke-width="3" stroke-linecap="round"`);
    if (PL > 0) s += path(`M -60,${f(hy - 12)} C -50,${f(hy + 4)} -42,${f(hy + 10)} -30,${f(hy + 12)} M 60,${f(hy - 12)} C 50,${f(hy + 4)} 42,${f(hy + 10)} 30,${f(hy + 12)}`, "none", `stroke="${sh(C.bottom, -0.2)}" stroke-width="3" stroke-linecap="round"`);
      return s; };
    if (!C.tucked) s += pelvisF();
    // ลำตัว
    const bust = C.sex === "f" ? 1 : 0;
    const bb = (y) => bel * 0.55 * Math.pow(Math.max(0, Math.sin(Math.PI * RK.clamp((H[1] + 10 - y) / 250))), 1.3);
    const tp = [[-70, H[1] + 10], [-64, H[1] - 60], [-56, H[1] - 150], [-66, H[1] - 230], [-74, S[1] + 22], [-40, S[1] - 6], [40, S[1] - 6], [74, S[1] + 22], [66, H[1] - 230], [56, H[1] - 150], [64, H[1] - 60], [70, H[1] + 10]].map(([x, y]) => [x * bw + Math.sign(x) * bb(y), y]);
    s += path(RK.smooth(tp, true), C.top);
    ctx.tpD = RK.smooth(tp, true); ctx.tp = tp;
    if (C.topKind === "tee" && !back) {
      s += path(`M -36,${f(S[1] - 4)} Q 0,${f(S[1] + 34)} 36,${f(S[1] - 4)}`, "none", `stroke="${sh(C.top, -0.3)}" stroke-width="8" stroke-linecap="round"`);
      s += `<g transform="translate(0,${f(S[1] + 110)})">` + circ(0, 0, 30, C.print) + path(`M -14,-2 L 0,-18 L 14,-2 L 6,-2 L 6,16 L -6,16 L -6,-2 Z`, C.top) + `</g>`;
    } else if (C.topKind === "blouse" && !back) {
      s += path(`M -30,${f(S[1] - 5)} L 0,${f(S[1] + 34)} L 30,${f(S[1] - 5)} Z`, sh(sk, -0.04));
      s += path(`M -24,${f(S[1] + 18)} Q -12,${f(S[1] + 24)} -4,${f(S[1] + 22)} M 24,${f(S[1] + 18)} Q 12,${f(S[1] + 24)} 4,${f(S[1] + 22)}`, "none", `stroke="${sh(sk, -0.2)}" stroke-width="2.5" opacity=".6" stroke-linecap="round"`);
      s += path(`M -44,${f(S[1] - 8)} L -30,${f(S[1] - 5)} L 0,${f(S[1] + 34)} L -10,${f(S[1] + 44)} Z M 44,${f(S[1] - 8)} L 30,${f(S[1] - 5)} L 0,${f(S[1] + 34)} L 10,${f(S[1] + 44)} Z`, sh(C.top, -0.06));
    }
    if (C.tucked) s += pelvisF();
    if (C.apron) {
      s += path(`M -50,${f(S[1] + 60)} L 50,${f(S[1] + 60)} C 56,${f(S[1] + 140)} 60,${f(H[1])} 70,${f(H[1] + 130)} L -70,${f(H[1] + 130)} C -60,${f(H[1])} -56,${f(S[1] + 140)} -50,${f(S[1] + 60)} Z`, C.apron);
      s += path(`M -46,${f(S[1] + 62)} L -58,${f(S[1] - 2)} M 46,${f(S[1] + 62)} L 58,${f(S[1] - 2)}`, "none", `stroke="${sh(C.apron, -0.1)}" stroke-width="9" stroke-linecap="round"`);
      s += path(`M -36,${f(H[1] - 10)} L 36,${f(H[1] - 10)} L 38,${f(H[1] + 40)} L -38,${f(H[1] + 40)} Z`, sh(C.apron, -0.1)) + path(`M 0,${f(H[1] - 10)} L 0,${f(H[1] + 40)}`, "none", `stroke="${sh(C.apron, -0.25)}" stroke-width="3"`);
      s += path(`M -66,${f(H[1] - 120)} L 66,${f(H[1] - 120)}`, "none", `stroke="${sh(C.apron, -0.12)}" stroke-width="10"`);
    }
    if (!back && RK.FLAT_TOP && RK.FLAT_TOP[C.topKind]) s += RK.FLAT_TOP[C.topKind].front(C, ctx);
    if (!back && RK.FLAT_BOTTOM && RK.FLAT_BOTTOM[BK]) s += RK.FLAT_BOTTOM[BK].front(C, ctx);
    if (back) s += path(`M -40,${f(S[1] - 6)} Q 0,${f(S[1] + 8)} 40,${f(S[1] - 6)}`, "none", `stroke="${sh(C.top, -0.25)}" stroke-width="7" stroke-linecap="round"`) + path(`M 0,${f(S[1] + 20)} L 0,${f(H[1] - 30)}`, "none", `stroke="${sh(C.top, -0.12)}" stroke-width="3" opacity=".5"`);
    s += drawArm(-1, pose.f) + drawArm(1, pose.n);
    const nod = (A.nod || 0) + (A.talk ? Math.sin(t * 9) * 2 * A.talk : 0);
    const hp = [0, HY + (FW ? FW.headDy : 0)];
    s += `<g transform="translate(${P(hp[0], hp[1])}) rotate(${f((A.tilt || 0) + nod * 0.5 - tiltT * 0.6 - 6 * lg)}) scale(${f(hk)})">` + (back ? headBack(C, A) : headFront(C, Object.assign({}, A, { noBack: true }))) + `</g>`;
    if (RK.flatBodyAcc) s += RK.flatBodyAcc(C, A, "front", ctx);
    if (hx) s = s.slice(0, UPF) + `<g transform="translate(${f(hx * 0.6)},0)">` + s.slice(UPF) + "</g>";
    if (tiltT) s = s.slice(0, UPF) + `<g transform="rotate(${f(tiltT)} ${f(H[0])} ${f(H[1])})">` + s.slice(UPF) + "</g>";
    A._head = hp; A._H = H;
    return s;
  }

  RK._flat = { P, line, circ, path, taper, pol, sh, f, D2R, hand, LEG };

  // ---------- ของในมือ ----------
  RK.FLAT_PROPS = {
    mug: (c, flip) => `<g transform="scale(${flip ? -1 : 1},1)">` + path(`M -22,-30 L 22,-30 L 18,22 C 16,30 -16,30 -18,22 Z`, c || "#F7F3EA") + path(`M 22,-18 C 40,-18 40,10 20,10`, "none", `stroke="${c || "#F7F3EA"}" stroke-width="8"`) + `<rect x="-22" y="-12" width="44" height="10" fill="#E46F5B"/>` + `<rect x="-17" y="-26" width="6" height="40" rx="3" fill="#fff" opacity=".5"/></g>`,
    ladle: () => line([0, 0], [0, -150], 9, "#9B6B43") + `<ellipse cx="0" cy="8" rx="20" ry="12" fill="#B9BDC4"/>`,
    phone: () => `<rect x="-18" y="-34" width="36" height="66" rx="7" fill="#22252E"/><rect x="-14" y="-28" width="28" height="52" rx="4" fill="#6FA9E8"/>`,
  };

  // ---------- วาดนักแสดง ----------
  RK.flatActor = function (A, t) {
    const C = Object.assign({}, RK.FLAT_CAST[A.who] || RK.FLAT_CAST.prang, A.look2 || {});
    if (A.apron != null) C.apron = A.apron ? (typeof A.apron === "string" ? A.apron : "#8FAE96") : null; else if (C.apron === undefined && A.who === "prang") C.apron = null;
    // กระพริบตา
    const bp = (t + (A.seed || 0) * 0.71) % 3.4;
    A.blink = Math.max(A.blink || 0, bp < 0.14 ? Math.sin(bp / 0.14 * Math.PI) : 0);
    A.sway = A.sway ?? (Math.sin(t * 1.6 + (A.seed || 0)) * 0.25 + ((A._walking > 0 && A.view !== "front" && RK.flatWalkPose) ? RK.flatWalkPose(A.who, A._walkP, A._walking).sway * 3 : 0));
    A._hand = {};
    const body = ((A.view === "front" || A.view === "back") ? bodyFront : bodySide)(C, A, t);
    const pre = RK.flatActorPre ? RK.flatActorPre(C, A, t) : "", post = RK.flatActorPost ? RK.flatActorPost(C, A, t) : "";
    let prop = "";
    if (A.prop && RK.FLAT_PROPS[A.prop] && !(RK.FLAT_GRIP && RK.FLAT_GRIP[A.prop]) && A._hand[A.propHand || "n"] && A.view !== "side") {
      const h = A._hand[A.propHand || "n"];
      prop = `<g transform="translate(${P(h.p[0] + (A.view === "front" ? 0 : 6), h.p[1] + 22)})">${RK.FLAT_PROPS[A.prop](A.propColor)}</g>`;
    }
    const sc = (A.s || 0.5) * C.h, dir = A.dir || 1;
    const shadow = `<ellipse cx="0" cy="0" rx="${f(150 * sc * (A.view === "front" ? 0.9 : 1.15))}" ry="${f(22 * sc)}" fill="#000" opacity=".28" filter="url(#fBlur8)"/>`;
    return `<g data-actor="${A.who}" transform="translate(${f(A.x)},${f(A.y)})">${shadow}<g transform="scale(${f(sc * dir * (A.sx ?? 1))},${f(sc)})" filter="url(#${A.light || "litR"})">${pre}${body}${prop}${post}</g></g>`;
  };
})(window);
