// ตัวละครแบบปรับได้ทุกส่วน (มุมหน้า) — ใช้กับทั้งช่อง: หัว ตา คิ้ว จมูก ผม จุดเด่นบนหน้า รูปร่าง ชุด รองเท้า
// สเปกตัวละครอยู่ใน cast.js · พิกัด: (0,0) = กลางเท้า, ผู้ใหญ่สูง ~900 หน่วยที่ scale 1
(function (G) {
  const RK = G.RK, f = RK.f, INK = RK.INK, LW = 7;
  RK.CAST = RK.CAST || {};

  // ---------- ท่าทาง ----------
  const POSES = {
    idle:        { la: 6,   le: -12, ra: -9,   re: 14,  ll: 3,  lk: -1, rl: -7, rk: 10, lean: 0,  bob: 0, tilt: 1.6, hl: "relaxed", hr: "relaxed" },
    wave:        { la: 7,   le: -9,  ra: -150, re: -30, ll: 3,  lk: 0,  rl: -3, rk: 0,  lean: -2, bob: 0, hl: "relaxed", hr: "open", waveR: 1 },
    hips:        { la: 40,  le: -110, ra: -40, re: 110, ll: 6,  lk: 0,  rl: -6, rk: 0,  lean: 0,  bob: 0, hl: "fist", hr: "fist" },
    cross:       { la: 22,  le: -128, ra: -22, re: 128, ll: 3,  lk: 0,  rl: -3, rk: 0,  lean: -2, bob: 0, hl: "fist", hr: "fist", crossed: 1 },
    think:       { la: 18,  le: -100, ra: -24, re: 150, ll: 3,  lk: 0,  rl: -3, rk: 0,  lean: 2,  bob: 0, hl: "fist", hr: "point" },
    cheer:       { la: 160, le: 10,  ra: -160, re: -10, ll: 8,  lk: 0,  rl: -8, rk: 0,  lean: 0,  bob: -10, hl: "fist", hr: "fist" },
    shrug:       { la: 50,  le: 70,  ra: -50,  re: -70, ll: 3,  lk: 0,  rl: -3, rk: 0,  lean: 0,  bob: 0, hl: "open", hr: "open" },
    point:       { la: 7,   le: -9,  ra: -100, re: -6,  ll: 3,  lk: 0,  rl: -3, rk: 0,  lean: 3,  bob: 0, hl: "relaxed", hr: "point" },
    scared:      { la: 30,  le: 100, ra: -30,  re: -100, ll: 8, lk: 6,  rl: -8, rk: -6, lean: -4, bob: 18, hl: "open", hr: "open" },
    cower:       { la: 118, le: 72,  ra: -118, re: -72, ll: 14, lk: 20, rl: -14, rk: -20, lean: 6, bob: 70, hl: "fist", hr: "fist" },
    hands_up:    { la: 150, le: 18,  ra: -150, re: -18, ll: 6,  lk: 0,  rl: -6, rk: 0,  lean: -3, bob: 0, hl: "open", hr: "open" },
    hold:        { la: 20,  le: -80, ra: -20,  re: 80,  ll: 3,  lk: 0,  rl: -3, rk: 0,  lean: 0,  bob: 0, hl: "grip", hr: "grip" },
    torch:       { la: 7,   le: -9,  ra: -62,  re: -30, ll: 3,  lk: 0,  rl: -3, rk: 0,  lean: 2,  bob: 0, hl: "relaxed", hr: "grip" },
    torch_front: { la: 7,   le: -9,  ra: -6,   re: 12,  ll: 3,  lk: 0,  rl: -3, rk: 0,  lean: 1,  bob: 0, hl: "relaxed", hr: "torchF", foreR: 0.42 },
    shush:       { la: 7,   le: -9,  ra: -38,  re: -142, ll: 3, lk: 0,  rl: -3, rk: 0,  lean: 0,  bob: 0, hl: "relaxed", hr: "point" },
  };
  RK.POSES = POSES;
  function blendPose(a, b, k) {
    const A = POSES[a] || POSES.idle, B = POSES[b] || A, o = {};
    for (const key of new Set([...Object.keys(A), ...Object.keys(B)])) {
      const va = A[key], vb = B[key] ?? va;
      o[key] = typeof va === "number" || typeof vb === "number" ? RK.lerp(va || 0, vb || 0, k) : (k < 0.5 ? va : vb);
    }
    return o;
  }

  // ---------- อารมณ์ ----------
  const FACES = {
    calm:       { brow: 0,   browY: 0,   eye: 1.0,  pupil: 1.0, lid: 0,    mouth: "smirk",  sweat: 0 },
    happy:      { brow: -4,  browY: -8,  eye: 0.0,  pupil: 1.0, lid: 0,    mouth: "grin",   sweat: 0, smileEyes: 1 },
    laugh:      { brow: -6,  browY: -10, eye: 0.0,  pupil: 1.0, lid: 0,    mouth: "laugh",  sweat: 0, smileEyes: 1 },
    smile:      { brow: 2,   browY: -3,  eye: 0.9,  pupil: 1.0, lid: 0.1,  mouth: "smile",  sweat: 0 },
    warm:       { brow: 10,  browY: -4,  eye: 0.7,  pupil: 1.0, lid: 0.25, mouth: "smile",  sweat: 0 },
    sad:        { brow: 22,  browY: -6,  eye: 0.9,  pupil: 0.9, lid: 0.3,  mouth: "frown",  sweat: 0, tear: 1 },
    angry:      { brow: -28, browY: 10,  eye: 0.85, pupil: 0.8, lid: 0.25, mouth: "shout",  sweat: 0, vein: 1 },
    annoyed:    { brow: -14, browY: 4,   eye: 0.8,  pupil: 0.9, lid: 0.45, mouth: "flat",   sweat: 1 },
    shock:      { brow: 30,  browY: -20, eye: 1.5,  pupil: 0.4, lid: 0,    mouth: "o",      sweat: 2 },
    nervous:    { brow: 14,  browY: -6,  eye: 1.1,  pupil: 0.85, lid: 0.05, mouth: "wobble", sweat: 1 },
    scared:     { brow: 26,  browY: -14, eye: 1.35, pupil: 0.62, lid: 0,    mouth: "o",      sweat: 2 },
    terrified:  { brow: 34,  browY: -22, eye: 1.55, pupil: 0.45, lid: 0,    mouth: "scream", sweat: 3 },
    determined: { brow: -18, browY: 6,   eye: 0.85, pupil: 1.0, lid: 0.3,  mouth: "flat",   sweat: 0 },
    relief:     { brow: 10,  browY: -2,  eye: 0.55, pupil: 1.0, lid: 0.4,  mouth: "smile",  sweat: 1 },
    smug:       { brow: -10, browY: 2,   eye: 0.8,  pupil: 1.0, lid: 0.45, mouth: "smirk",  sweat: 0 },
  };
  RK.FACES = FACES;


  // สัดส่วนทั้งช่อง (ปรับได้ต่อตอน): A = น่ารัก ~2.5 หัว, B = สมจริงขึ้น ~3.5 หัว
  RK.PROPS = { A: { leg: 1.25, torso: 1.15, head: 0.85 }, B: { leg: 2.05, torso: 1.32, head: 0.68 } };
  RK.PROP = RK.PROPS.B;
  function geom(S) {
    const B = S.body || {}, P = S._prop || RK.PROP;
    const ls = (B.ls || 1) * P.leg, ts = (B.ts || 1) * P.torso, hsz = (B.head || 1) * P.head, bw = B.bw || 1;
    const thighL = 128 * ls, shinL = 118 * ls, hipY = -(thighL + shinL + 28), shY = hipY - 185 * ts;
    const reach = hipY + thighL * 0.5 - shY; // ไหล่ → ปลายนิ้วอยู่กลางต้นขา
    return { ls, ts, hsz, bw, thighL, shinL, hipY, shY, L1: reach * 0.4, L2: reach * 0.36, handK: ((reach * 0.24) / 112) * (S.handScale || 1), headY: shY - 22 * ts - 200 * hsz, shX: 140 * bw };
  }
  RK.personGeom = geom;
  // ความสูงทั้งตัว (หน่วยวาด) ใช้แปลงเป็นซม.ในฉาก 3 มิติ
  RK.personHeight = (who) => { const S = RK.CAST[who]; if (!S) return 900; const g = geom(S); return -g.headY + 250 * g.hsz; };
  // ---------- ตัวช่วยวาด ----------
  function limb(len, w, fill, hi) { return taper(len, w, w * 0.82, fill, hi); }
  // แขนขาเรียวแบบคน: โคนกว้าง ปลายแคบ มีโค้งกล้ามเนื้อ (ไม่ใช่ท่อตรง)
  function taper(len, w0, w1, fill, hi, bulge = 0.1) {
    const a = w0 / 2, b = w1 / 2, m = Math.max(a, b) * (1 + bulge);
    const d = `M${f(-a)},0 C${f(-m)},${f(len * 0.35)} ${f(-b * 1.04)},${f(len * 0.78)} ${f(-b)},${f(len)} A${f(b)},${f(b * 0.9)} 0 0 0 ${f(b)},${f(len)} C${f(b * 1.04)},${f(len * 0.78)} ${f(m)},${f(len * 0.35)} ${f(a)},0 A${f(a)},${f(a * 0.75)} 0 0 0 ${f(-a)},0Z`;
    let s = `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`;
    if (hi) s += `<path d="M${f(-a * 0.55)},${f(len * 0.12)} C${f(-m * 0.7)},${f(len * 0.4)} ${f(-b * 0.75)},${f(len * 0.7)} ${f(-b * 0.6)},${f(len * 0.88)}" fill="none" stroke="${hi}" stroke-width="${f(Math.max(4, w1 * 0.16))}" stroke-linecap="round" opacity=".55"/>`;
    return s;
  }
  // ชิ้นที่ต่อกันหลายชิ้น: วาดขอบรวมก่อนแล้วเติมสี = ขอบนอกเส้นเดียว
  function merged(paths, fill, w = LW) {
    return paths.map((d) => `<path d="${d}" fill="${INK}" stroke="${INK}" stroke-width="${w * 2}" stroke-linejoin="round"/>`).join("") + paths.map((d) => `<path d="${d}" fill="${fill}"/>`).join("");
  }

  // ---------- มือ (ข้อมือ 0,0 · มือชี้ไปทาง +y ของแขน) ----------
  // sd = ข้างของแขนบนจอ (-1 ซ้าย, +1 ขวา) · แต่ละแบบวาดตามทิศจริงของมือ:
  //  relaxed = มือห้อยข้างตัว เห็น "สันมือด้านนิ้วโป้ง" (ฝ่ามือหันเข้าต้นขา) นิ้วโป้งอยู่หน้า นิ้วงอเข้า
  //  open    = แบฝ่ามือหันหาคนดู (โบก/ชูมือ/ตกใจ) นิ้วโป้งอยู่ฝั่งที่ชี้เข้าหาหัวเมื่อยกแขน
  //  fist/grip = กำ เห็นหลังมือ + ข้อนิ้ว 4 ข้อ นิ้วโป้งพับอยู่ด้านใน
  //  point   = หลังมือ + นิ้วชี้เหยียด (นิ้วชี้อยู่ฝั่งเดียวกับนิ้วโป้ง)
  function hand(type, sd, S) {
    const sk = S.skin, sh = S.skinSh, o = sd; // o = ฝั่งนอก (หลังมือ/นิ้วก้อย) ในพิกัดมือ เมื่อแขนห้อย
    const outline = (d, w) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + LW * 2 - 2}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const fillS = (d, w) => `<path d="${d}" fill="none" stroke="${sk}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const shape = (d) => `<path d="${d}" fill="${sk}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`;
    let out = "";
    if (type === "relaxed") {
      // หลังมือ+นิ้วที่งอ มองจากด้านนิ้วโป้ง: กว้างแค่ ~40 (บางกว่าฝ่ามือมาก)
      const body = `M${o * 15},-2 C${o * 19},20 ${o * 21},44 ${o * 19},62 C${o * 18},84 ${o * 10},100 ${-o * 2},104 C${-o * 12},106 ${-o * 18},98 ${-o * 16},86 C${-o * 14},74 ${-o * 18},62 ${-o * 20},48 C${-o * 21},30 ${-o * 18},10 ${-o * 15},-2Z`;
      out += shape(body);
      // ร่องนิ้วที่งอ (เห็นปลายนิ้ว 3 นิ้วซ้อนกัน)
      out += `<path d="M${o * 17},64 Q${o * 4},70 ${-o * 8},66 M${o * 14},80 Q${o * 2},86 ${-o * 10},82 M${o * 8},94 Q${-o * 2},98 ${-o * 10},94" fill="none" stroke="${sh}" stroke-width="3.5" stroke-linecap="round"/>`;
      out += `<path d="M${o * 19},30 q${o * 4},8 0,16" fill="none" stroke="${sh}" stroke-width="3" opacity=".7"/>`; // ข้อนิ้วด้านนอก
      // นิ้วโป้งอยู่หน้า (ใกล้กล้อง) ชี้ลงเฉียงเข้าหาตัว
      const th = `M${-o * 12},16 Q${-o * 26},40 ${-o * 18},66`;
      out += outline(th, 15) + fillS(th, 15) + `<path d="M${-o * 15},58 q${-o * 3},6 ${-o * 1},10" fill="none" stroke="${sh}" stroke-width="3"/>`;
      out += `<ellipse cx="${-o * 17}" cy="66" rx="5" ry="4" fill="${RK.shade(sk, 0.15)}" opacity=".8"/>`; // เล็บโป้ง
    } else if (type === "open") {
      const t = sd; // นิ้วโป้งอยู่ฝั่ง sd ในพิกัดมือ → เมื่อยกแขน จะชี้เข้าหาหัว
      const palm = `M-24,-2 Q-31,26 -25,54 Q0,64 25,54 Q31,26 24,-2Z`;
      const fingers = [[-18, 56, -14], [-6, 66, -5], [6, 64, 5], [18, 50, 14]].map(([x, L, sp]) => `M${f(x)},52 Q${f(x + sp * 0.5)},${f(52 + L * 0.55)} ${f(x + sp)},${f(52 + L)}`);
      const thumb = `M${t * 22},12 Q${t * 46},28 ${t * 54},50`;
      out += `<path d="${palm}" fill="${INK}" stroke="${INK}" stroke-width="${LW * 2}" stroke-linejoin="round"/>` + fingers.map((d) => outline(d, 12)).join("") + outline(thumb, 15);
      out += `<path d="${palm}" fill="${sk}"/>` + fingers.map((d) => fillS(d, 12)).join("") + fillS(thumb, 15);
      // ลายมือ: เส้นชีวิตโค้งรอบโคนนิ้วโป้ง + เส้นใจขวางใต้โคนนิ้ว
      out += `<path d="M${t * 16},8 Q${-t * 2},26 ${t * 2},50" fill="none" stroke="${sh}" stroke-width="3.5" stroke-linecap="round"/><path d="M${-t * 22},38 Q${-t * 4},32 ${t * 10},40" fill="none" stroke="${sh}" stroke-width="3" stroke-linecap="round"/>`;
      out += [[-18, 66], [-6, 74], [6, 72], [18, 62]].map(([x, y]) => `<path d="M${x - 4},${y} l8,0" stroke="${sh}" stroke-width="2.5"/>`).join("");
      if (S.nails) out += [[-32, 106], [-11, 116], [11, 114], [32, 100]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="5" fill="${S.nails}"/>`).join("");
    } else if (type === "point") {
      const i = -o; // นิ้วชี้อยู่ฝั่งเดียวกับนิ้วโป้ง (ฝั่งใน)
      const back = `M-24,-2 Q-30,26 -26,52 Q-22,64 -8,64 L14,64 Q26,62 26,48 Q30,24 24,-2Z`;
      const idx = `M${i * 14},54 L${i * 16},120`;
      out += shape(back) + outline(idx, 14) + fillS(idx, 14);
      out += [-0.5, 0.5].map((k) => `<path d="M${f(o * 12 + k * 14)},56 q0,10 ${f(-o * 2)},12" fill="none" stroke="${sh}" stroke-width="3"/>`).join("");
      out += `<path d="M-16,20 l0,24 M0,18 l0,28 M14,20 l0,24" stroke="${sh}" stroke-width="3" opacity=".55"/>`; // เส้นเอ็นหลังมือ
      const th = `M${i * 20},14 Q${i * 30},36 ${i * 18},52`;
      out += outline(th, 14) + fillS(th, 14);
    } else if (type === "torchF") {
      const fist = `M-26,-2 Q-32,24 -26,50 Q0,62 26,50 Q32,24 26,-2Z`;
      out += shape(fist) + [-15, -5, 5, 15].map((x) => `<path d="M${x},44 q0,8 0,10" stroke="${sh}" stroke-width="3"/>`).join("");
      const th = `M${-o * 26},8 Q${-o * 30},32 ${-o * 16},44`;
      out += outline(th, 14) + fillS(th, 14);
    } else { // fist / grip: หลังมือหันหาคนดู ข้อนิ้วเป็นปุ่ม 4 ปุ่ม
      const fist = `M-26,-2 Q-32,22 -28,46 Q-30,64 -14,66 L14,66 Q30,64 28,46 Q32,22 26,-2Z`;
      out += shape(fist);
      out += [-15, -5, 5, 15].map((x) => `<path d="M${x - 6},52 Q${x},62 ${x + 6},52" fill="none" stroke="${sh}" stroke-width="3.5"/>`).join("");
      out += `<path d="M-14,14 l0,22 M0,12 l0,26 M14,14 l0,22" stroke="${sh}" stroke-width="3" opacity=".55"/>`;
      const th = `M${-o * 26},14 Q${-o * 30},40 ${-o * 12},50`;
      out += outline(th, 14) + fillS(th, 14);
    }
    return out;
  }
  function torchSide() {
    return `<g transform="translate(0,46) rotate(-90)"><rect x="-16" y="-20" width="32" height="96" rx="8" fill="#3A3F4A" stroke="${INK}" stroke-width="${LW}"/><path d="M-16,10 L16,10 M-16,24 L16,24 M-16,38 L16,38" stroke="#262A32" stroke-width="4"/><path d="M-24,76 L24,76 L20,112 L-20,112Z" fill="#575E6B" stroke="${INK}" stroke-width="${LW}"/><rect x="-20" y="108" width="40" height="8" fill="#FFF6C8"/></g>`;
  }
  function torchFront() {
    return `<g transform="translate(0,74)"><circle r="34" fill="#575E6B" stroke="${INK}" stroke-width="${LW}"/><circle r="25" fill="#FFF8D8" stroke="#8A8F98" stroke-width="5"/><circle r="13" fill="#FFFFFF"/><path d="M-20,-14 A25,25 0 0 1 8,-26" stroke="#fff" stroke-width="5" fill="none" opacity=".8"/></g>`;
  }

  // ---------- หัว ----------
  const HEADS = {
    sharp: "M0,-212 C112,-212 190,-148 192,-30 L190,52 Q186,112 152,146 L78,198 Q0,226 -78,198 L-152,146 Q-186,112 -190,52 L-192,-30 C-190,-148 -112,-212 0,-212Z",
    soft:  "M0,-210 C116,-210 188,-140 188,-24 C188,86 142,176 0,204 C-142,176 -188,86 -188,-24 C-188,-140 -116,-210 0,-210Z",
    round: "M0,-204 C132,-204 214,-122 214,6 C214,136 134,214 0,214 C-134,214 -214,136 -214,6 C-214,-122 -132,-204 0,-204Z",
    old:   "M0,-206 C114,-206 186,-138 186,-26 C186,70 176,140 120,180 Q60,214 0,214 Q-60,214 -120,180 C-176,140 -186,70 -186,-26 C-186,-138 -114,-206 0,-206Z",
    boxy:  "M0,-206 C118,-206 194,-140 196,-30 L196,90 Q194,160 140,190 Q70,222 0,222 Q-70,222 -140,190 Q-194,160 -196,90 L-196,-30 C-194,-140 -118,-206 0,-206Z",
    kid:   "M0,-216 C130,-216 214,-140 214,-10 C214,120 140,196 0,196 C-140,196 -214,120 -214,-10 C-214,-140 -130,-216 0,-216Z",
  };

  function mouthPath(type, t, S) {
    const lip = `stroke="${INK}" stroke-width="${LW}" stroke-linecap="round" stroke-linejoin="round"`;
    const lc = S.lipstick;
    switch (type) {
      case "smile": return `<path d="M-44,6 Q0,42 44,6" fill="none" ${lip}/>` + (lc ? `<path d="M-30,16 Q0,34 30,16" fill="none" stroke="${lc}" stroke-width="7" opacity=".9"/>` : "");
      case "smirk": return `<path d="M-38,14 Q4,26 40,6" fill="none" ${lip}/><path d="M36,4 l10,-4" ${lip}/>`;
      case "grin": return `<path d="M-50,0 Q0,8 50,0 Q40,56 0,60 Q-40,56 -50,0Z" fill="#4A1A22" ${lip}/><path d="M-42,2 Q0,9 42,2 L38,16 Q0,22 -38,16Z" fill="#F7F4EE"/><ellipse cx="0" cy="44" rx="18" ry="8" fill="#D85E6E"/>`;
      case "laugh": { const o = 6 * Math.abs(Math.sin(t * 16)); return `<path d="M-54,-4 Q0,4 54,-4 Q44,${70 + o} 0,${76 + o} Q-44,${70 + o} -54,-4Z" fill="#4A1A22" ${lip}/><path d="M-46,-2 Q0,6 46,-2 L42,14 Q0,20 -42,14Z" fill="#F7F4EE"/><ellipse cx="0" cy="${54 + o}" rx="22" ry="10" fill="#D85E6E"/>`; }
      case "frown": return `<path d="M-38,26 Q0,4 38,26" fill="none" ${lip}/>`;
      case "shout": return `<path d="M-40,0 Q0,-8 40,0 L34,50 Q0,60 -34,50Z" fill="#4A1A22" ${lip}/><path d="M-32,2 L32,2 L28,14 L-28,14Z" fill="#F7F4EE"/><path d="M-26,48 Q0,40 26,48" fill="#F7F4EE"/>`;
      case "flat": return `<path d="M-36,16 L36,16" ${lip}/>` + (lc ? `<path d="M-26,18 L26,18" stroke="${lc}" stroke-width="6"/>` : "");
      case "wobble": { const w = Math.sin(t * 22) * 4; return `<path d="M-40,20 Q-20,${10 + w} 0,20 Q20,${30 - w} 40,20" fill="none" ${lip}/>`; }
      case "o": return `<path d="M-18,8 Q0,-6 18,8 Q24,40 0,50 Q-24,40 -18,8Z" fill="#4A1A22" ${lip}/><ellipse cx="0" cy="40" rx="10" ry="6" fill="#D85E6E"/>`;
      case "scream": return `<path d="M-46,-4 Q0,-16 46,-4 Q40,76 0,84 Q-40,76 -46,-4Z" fill="#4A1A22" ${lip}/><path d="M-32,-2 Q0,-10 32,-2 L28,12 Q0,6 -28,12Z" fill="#F3F0EA"/><ellipse cx="0" cy="58" rx="20" ry="10" fill="#D85E6E"/>`;
      case "talk": { const o = 6 + Math.abs(Math.sin(t * 18)) * 22; return `<path d="M-32,12 Q0,${f(12 + o * 1.4)} 32,12 Q0,${f(8 - o * 0.2)} -32,12Z" fill="#4A1A22" ${lip}/>`; }
      default: return "";
    }
  }

  // ทรงผม: คืน {back, front} (back = ส่วนที่อยู่หลังหัว)
  const HAIRS = {};
  HAIRS.dropcut = (() => {
    const r = RK.rng(1203), top = [];
    for (let i = 0; i <= 12; i++) { const a = Math.PI * (1 + i / 12), rad = 208 + (i % 2 ? 10 : 0) + r() * 6; top.push([Math.cos(a) * rad * 0.97, Math.sin(a) * rad * 0.46 - 168]); }
    const fringe = [[198, -150], [170, -112], [138, -132], [104, -92], [70, -120], [36, -80], [2, -112], [-34, -74], [-66, -108], [-100, -82], [-132, -116], [-164, -100], [-198, -150]];
    const strands = [];
    for (let i = 0; i < 20; i++) { const x0 = -150 + i * 15 + (r() - 0.5) * 8, y0 = -258 + Math.abs(x0) * 0.18 + r() * 10; strands.push([[x0 + 10, y0], [x0 - 2 + (r() - 0.5) * 8, y0 + 60], [x0 - 18 - r() * 8, y0 + 120 + r() * 20]]); }
    const d = RK.smooth(top) + " L" + fringe.map((q) => f(q[0]) + "," + f(q[1])).join(" L") + "Z";
    return (H) => ({ back: "", front:
      `<path d="M-196,-40 C-198,-110 -176,-150 -150,-168 L-150,-120 Q-166,-80 -172,-20 Q-182,10 -188,30Z" fill="url(#fade_${H.id})"/><path d="M196,-40 C198,-110 176,-150 150,-168 L150,-120 Q166,-80 172,-20 Q182,10 188,30Z" fill="url(#fade_${H.id})"/>` +
      `<path d="${d}" fill="${H.color}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>` +
      strands.map((st, i) => `<path d="${RK.smooth(st)}" fill="none" stroke="${i % 3 ? H.mid : H.hi}" stroke-width="${i % 3 ? 6 : 8}" stroke-linecap="round" opacity=".9"/>`).join("") });
  })();
  HAIRS.bob = (H) => { // บ็อบประบ่า แสกข้าง ปัดหน้าม้าเฉียง + กิ๊บ
    const back = `<path d="M-226,-40 C-236,-200 -120,-262 0,-262 C120,-262 236,-200 226,-40 L232,128 Q200,170 150,150 L-150,150 Q-200,170 -232,128Z" fill="${H.color}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`;
    let fr = `<path d="M-214,-30 C-220,-180 -110,-246 10,-246 C130,-246 222,-176 214,-30 L216,130 Q196,150 176,136 L170,-10 Q150,-110 60,-128 Q-30,-96 -120,-60 Q-160,-30 -170,40 L-174,136 Q-196,150 -216,130Z" fill="${H.color}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`;
    fr += `<path d="M70,-236 Q-10,-200 -96,-116 M110,-220 Q40,-170 -20,-104 M150,-196 Q120,-150 90,-116 M-150,-170 Q-190,-60 -196,100 M170,-150 Q196,-40 196,100" fill="none" stroke="${H.hi}" stroke-width="7" stroke-linecap="round" opacity=".8"/>`;
    fr += `<g transform="translate(150,-120) rotate(-30)"><rect x="-30" y="-9" width="60" height="18" rx="9" fill="${H.clip || "#F2B33D"}" stroke="${INK}" stroke-width="4"/><circle cx="-14" cy="0" r="4" fill="#fff" opacity=".7"/></g>`;
    return { back, front: fr };
  };
  HAIRS.bun = (H) => { // ผมหงอกเกล้ามวย แสกกลาง เป็นลอน
    const back = `<circle cx="0" cy="-238" r="76" fill="${H.color}" stroke="${INK}" stroke-width="${LW}"/><path d="M-50,-260 Q0,-300 50,-262 M-60,-226 Q0,-260 60,-224" fill="none" stroke="${H.mid}" stroke-width="6"/>`;
    let fr = `<path d="M-196,-6 C-206,-150 -112,-224 0,-224 C112,-224 206,-150 196,-6 Q180,-80 140,-120 Q70,-150 0,-126 Q-70,-150 -140,-120 Q-180,-80 -196,-6Z" fill="${H.color}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`;
    fr += `<path d="M0,-224 L0,-128 M-30,-210 Q-110,-180 -170,-80 M30,-210 Q110,-180 170,-80 M-60,-200 Q-140,-150 -184,-40 M60,-200 Q140,-150 184,-40" fill="none" stroke="${H.mid}" stroke-width="6" stroke-linecap="round"/>`;
    fr += `<rect x="-14" y="-322" width="28" height="44" rx="6" fill="#B33A3A" stroke="${INK}" stroke-width="4" transform="rotate(30 0 -300)"/>`;
    return { back, front: fr };
  };
  HAIRS.buzz = (H) => { // รองทรงสูงสั้นเกรียน
    const r = RK.rng(55); let dots = "";
    for (let i = 0; i < 160; i++) { const a = Math.PI * (1.05 + r() * 0.9), rr = 150 + r() * 60; dots += `<circle cx="${f(Math.cos(a) * rr)}" cy="${f(Math.sin(a) * rr * 0.95 - 30)}" r="2" fill="${H.hi}"/>`; }
    return { back: "", front: `<path d="M-212,-10 C-214,-150 -124,-210 0,-210 C124,-210 214,-150 212,-10 Q196,-90 150,-120 Q80,-140 0,-136 Q-80,-140 -150,-120 Q-196,-90 -212,-10Z" fill="${H.color}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/><g opacity=".7">${dots}</g>` };
  };
  HAIRS.combover = (H) => { // หัวล้านหน้า หวีปิด ข้างหนา
    const sides = `<path d="M-198,40 C-206,-60 -186,-120 -140,-150 L-130,-110 Q-160,-60 -164,40Z" fill="${H.color}" stroke="${INK}" stroke-width="${LW}"/><path d="M198,40 C206,-60 186,-120 140,-150 L130,-110 Q160,-60 164,40Z" fill="${H.color}" stroke="${INK}" stroke-width="${LW}"/>`;
    const top = `<path d="M-150,-150 Q-40,-212 130,-176 Q60,-190 -20,-176 Q-90,-160 -150,-150Z" fill="${H.color}" stroke="${INK}" stroke-width="4"/>` + [-170, -150, -130].map((y, i) => `<path d="M-140,${y + 20} Q0,${y - 30} 150,${y + 10}" fill="none" stroke="${H.color}" stroke-width="7" stroke-linecap="round"/>`).join("");
    return { back: "", front: sides + top + `<ellipse cx="40" cy="-150" rx="50" ry="18" fill="#fff" opacity=".35"/>` };
  };
  HAIRS.perm = (() => { // ดัดลอนสั้นฟู
    const r = RK.rng(404), cs = [];
    for (let i = 0; i < 34; i++) { const a = Math.PI * (0.92 + (i / 33) * 1.16) + (r() - 0.5) * 0.1, rad = 196 + r() * 40; cs.push([Math.cos(a) * rad, Math.sin(a) * rad * 0.9 - 26, 34 + r() * 14]); }
    for (let i = 0; i < 12; i++) cs.push([(r() - 0.5) * 300, -190 - r() * 50, 36 + r() * 12]);
    return (H) => {
      const ring = cs.map(([x, y, rr]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr + LW / 2)}" fill="${INK}"/>`).join("") + cs.map(([x, y, rr]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr - LW / 2)}" fill="${H.color}"/>`).join("");
      const curls = cs.map(([x, y, rr]) => `<path d="M${f(x - rr * 0.5)},${f(y)} a${f(rr * 0.4)},${f(rr * 0.4)} 0 1 1 ${f(rr * 0.6)},${f(rr * 0.2)}" fill="none" stroke="${H.hi}" stroke-width="5"/>`).join("");
      return { back: "", front: ring + curls };
    };
  })();
  HAIRS.pigtails = (H) => { // หน้าม้าตรง ผมจุก 2 ข้าง ยางรัดผมชมพู
    const tail = (sd) => `<g transform="translate(${sd * 214},-110) rotate(${sd * -24})"><path d="M0,0 Q${sd * 70},30 ${sd * 60},140 Q${sd * 40},200 ${sd * 10},210 Q${sd * 20},120 ${sd * -10},30Z" fill="${H.color}" stroke="${INK}" stroke-width="${LW}"/><path d="M${sd * 14},40 Q${sd * 44},100 ${sd * 30},170" fill="none" stroke="${H.hi}" stroke-width="6"/></g>`;
    const ties = (sd) => `<circle cx="${sd * 210}" cy="-110" r="22" fill="${H.tie || "#FF6FA5"}" stroke="${INK}" stroke-width="5"/><circle cx="${sd * 204}" cy="-116" r="6" fill="#fff" opacity=".7"/>`;
    const cap = `<path d="M-216,-20 C-220,-180 -120,-248 0,-248 C120,-248 220,-180 216,-20 L196,-30 L190,-80 L-190,-80 L-196,-30Z" fill="${H.color}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`;
    const bang = `<path d="M-190,-82 L190,-82" stroke="${INK}" stroke-width="${LW}"/>` + [-150, -100, -50, 0, 50, 100, 150].map((x) => `<path d="M${x},-230 L${x + 4},-90" stroke="${H.hi}" stroke-width="5" opacity=".7"/>`).join("");
    return { back: tail(-1) + tail(1), front: cap + bang + ties(-1) + ties(1) };
  };

  // ตา: แบบต่างๆ ใช้ฟังก์ชันเดียว ปรับด้วยพารามิเตอร์
  const EYES = {
    almond: { w: 34, h: 19, lashes: 0, lidBase: 0, crow: 0, iris: "#4A2E22" },
    lash:   { w: 34, h: 21, lashes: 3, lidBase: 0, crow: 0, iris: "#3B2A24" },
    small:  { w: 22, h: 12, lashes: 0, lidBase: 0.1, crow: 0, iris: "#2E211C" },
    old:    { w: 28, h: 14, lashes: 0, lidBase: 0.3, crow: 1, iris: "#3A2C26" },
    narrow: { w: 32, h: 14, lashes: 0, lidBase: 0.4, crow: 0, iris: "#2E211C", bags: 1 },
    kid:    { w: 34, h: 34, lashes: 2, lidBase: 0, crow: 0, iris: "#4B3328", round: 1 },
  };
  function eyeG(cx, sd, E, st) {
    const { eyeS, pup, lid, blink, lookX, lookY, smileEyes } = st;
    if (smileEyes) return `<path d="M${cx - E.w},14 Q${cx},${-10 - E.h * 0.4} ${cx + E.w},14" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>` + (E.lashes ? `<path d="M${cx + sd * E.w},14 l${sd * 10},-8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>` : "");
    const w = E.w * (E.round ? Math.max(0.8, eyeS) : 1), h = E.h * eyeS * blink, lidCut = Math.min(0.9, lid + E.lidBase) * h;
    const shape = E.round
      ? `M${f(cx - w)},10 A${f(w)},${f(Math.max(h, 1))} 0 1 1 ${f(cx + w)},10 A${f(w)},${f(Math.max(h, 1))} 0 1 1 ${f(cx - w)},10Z`
      : `M${f(cx - w)},10 Q${f(cx - w * 0.2)},${f(10 - h * 1.5)} ${f(cx + w)},${6 - sd * 2} Q${f(cx + w * 0.2)},${f(10 + h * 1.25)} ${f(cx - w)},10Z`;
    let e = `<path d="${shape}" fill="#FBFAF6" stroke="${INK}" stroke-width="4"/>`;
    if (blink > 0.5) {
      const px = cx + lookX * w * 0.4, py = 10 + lookY * h * 0.3, ir = Math.min(w, h * 1.2) * 0.5 * Math.max(pup, 0.55) + (E.round ? 4 : 0);
      e += `<clipPath id="ec${st.id}${sd}"><path d="${shape}"/></clipPath><g clip-path="url(#ec${st.id}${sd})"><circle cx="${f(px)}" cy="${f(py)}" r="${f(ir)}" fill="${E.iris}"/><circle cx="${f(px)}" cy="${f(py)}" r="${f(ir * 0.55 * pup)}" fill="#120C0A"/><circle cx="${f(px + ir * 0.3)}" cy="${f(py - ir * 0.35)}" r="${f(Math.max(2.5, ir * 0.28))}" fill="#fff"/>` + (E.round ? `<circle cx="${f(px - ir * 0.35)}" cy="${f(py + ir * 0.35)}" r="${f(ir * 0.14)}" fill="#fff"/>` : "");
      if (lidCut > 0.5) e += `<rect x="${f(cx - w - 2)}" y="${f(10 - h * 1.7)}" width="${f(2 * w + 4)}" height="${f(lidCut * 1.7)}" fill="${st.lidColor}"/>`;
      e += `</g>`;
    }
    const lidY = E.round ? 10 - h : 10 - h * 1.55 + lidCut;
    e += E.round ? `<path d="M${f(cx - w - 2)},10 A${f(w + 2)},${f(Math.max(h, 1) + 2)} 0 0 1 ${f(cx + w + 2)},10" fill="none" stroke="${INK}" stroke-width="8"/>` : `<path d="M${f(cx - w - 4)},10 Q${f(cx - w * 0.2)},${f(lidY)} ${f(cx + w + 4)},${4 - sd * 2}" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`;
    for (let i = 0; i < E.lashes; i++) e += `<path d="M${f(cx + sd * (w - i * 8))},${f(E.round ? 10 - h * 0.6 + i * 6 : 6 - i * 3)} l${sd * 12},${-8 + i * 2}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
    if (E.crow) e += `<path d="M${f(cx + sd * (w + 8))},4 l${sd * 14},-6 M${f(cx + sd * (w + 8))},12 l${sd * 16},0 M${f(cx + sd * (w + 8))},20 l${sd * 14},6" stroke="${st.lineColor}" stroke-width="3.5" stroke-linecap="round"/>`;
    if (E.bags || !E.round) e += `<path d="M${f(cx - w * 0.5)},${f(14 + h * 1.3)} Q${cx},${f(18 + h * 1.4)} ${f(cx + w * 0.6)},${f(12 + h * 1.2)}" fill="none" stroke="${st.lineColor}" stroke-width="${E.bags ? 5 : 3.5}"/>`;
    return e;
  }

  function head(S, p, t, id) {
    const F = FACES[p.face] || FACES.calm, FE = p.face2 ? FACES[p.face2] : null, k = p.faceMix || 0;
    const mix = (a) => (FE ? RK.lerp(F[a] || 0, FE[a] || 0, k) : F[a] || 0);
    const pick = (a) => (FE && k > 0.5 ? FE[a] : F[a]);
    const st = { eyeS: Math.max(mix("eye"), 0.05), pup: mix("pupil") || 1, lid: mix("lid"), blink: p.blink ? 0.06 : 1, lookX: p.lookX || 0, lookY: p.lookY || 0, smileEyes: pick("smileEyes"), id, lidColor: S.skinSh, lineColor: S.skinSh };
    const brow = mix("brow"), browY = mix("browY"), mouth = pick("mouth"), sweat = pick("sweat") || 0;
    const E = EYES[S.eyes || "almond"], H = { ...(S.hair || {}), id };
    const hairFn = HAIRS[H.style] || (() => ({ back: "", front: "" }));
    const hair = hairFn(H);
    const tremble = (p.tremble || 0) * Math.sin(t * 60) * 3;
    const ex = S.extras || {};
    let s = `<defs><linearGradient id="fade_${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${H.color}"/><stop offset=".55" stop-color="${H.mid}" stop-opacity=".8"/><stop offset="1" stop-color="${H.mid}" stop-opacity=".1"/></linearGradient></defs>`;
    s += hair.back;
    // คอ
    s += `<path d="M-46,150 L-42,222 L42,222 L46,150Z" fill="${S.skinSh}" stroke="${INK}" stroke-width="${LW}"/>`;
    // หู + ต่างหู
    const ear = (sd) => `<g transform="translate(${sd * 186},28) scale(${sd},1)"><path d="M0,-40 Q34,-46 36,-6 Q36,34 6,46 Q-4,20 0,-40Z" fill="${S.skin}" stroke="${INK}" stroke-width="${LW}"/><path d="M8,-22 Q24,-14 20,10 Q16,22 8,24" fill="none" stroke="${S.skinSh}" stroke-width="5"/>${ex.earrings ? `<circle cx="18" cy="56" r="10" fill="${ex.earrings}" stroke="${INK}" stroke-width="3"/>` : ""}</g>`;
    if (!S.hideEars) s += ear(-1) + ear(1);
    // หน้า
    s += `<path d="${HEADS[S.head || "soft"]}" fill="${S.skin}" stroke="${INK}" stroke-width="${LW}"/>`;
    s += `<path d="M150,-10 Q156,80 132,130 L76,176 Q130,120 140,40Z" fill="${S.skinSh}" opacity="${S.head === "sharp" ? 0.55 : 0.3}"/>`;
    if (S.head === "sharp") s += `<path d="M-150,-10 Q-156,80 -132,130 L-76,176 Q-130,120 -140,40Z" fill="${S.skinSh}" opacity=".35"/>`;
    if (ex.blush || S.cheek) s += `<ellipse cx="-120" cy="86" rx="30" ry="16" fill="${S.cheek || "#F09A8A"}" opacity="${ex.blush ? 0.6 : 0.25}"/><ellipse cx="120" cy="86" rx="30" ry="16" fill="${S.cheek || "#F09A8A"}" opacity="${ex.blush ? 0.6 : 0.25}"/>`;
    if (ex.freckles) s += [[-130, 60], [-112, 70], [-140, 76], [130, 60], [112, 70], [140, 76]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${S.skinSh}"/>`).join("");
    if (ex.wrinkles) s += `<path d="M-70,-120 Q0,-132 70,-120 M-56,-100 Q0,-110 56,-100" fill="none" stroke="${S.skinSh}" stroke-width="4" stroke-linecap="round"/><path d="M-62,66 Q-80,110 -66,140 M62,66 Q80,110 66,140" fill="none" stroke="${S.skinSh}" stroke-width="5" stroke-linecap="round"/>`;
    if (ex.stubble) {
      const r = RK.rng(77); let d = "";
      for (let i = 0; i < 900; i++) { const x = (r() - 0.5) * 330, y = 70 + r() * 150; if (y > 100 + Math.abs(x) * 0.2 && y < 212 - Math.abs(x) * 0.55 && !(Math.abs(x) < 50 && y > 102 && y < 152)) d += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.9 + r() * 0.8)}"/>`; }
      s += `<path d="M-160,104 Q-150,150 -78,196 Q0,224 78,196 Q150,150 160,104 Q120,150 60,160 Q0,170 -60,160 Q-120,150 -160,104Z" fill="${ex.stubble}" opacity=".2"/><g fill="${ex.stubble}" opacity=".32">${d}</g>`;
      s += `<path d="M-44,96 Q-22,86 0,92 Q22,86 44,96 Q22,100 0,98 Q-22,100 -44,96Z" fill="${H.mid}" opacity=".75"/><path d="M-14,164 Q0,174 14,164 Q8,182 0,186 Q-8,182 -14,164Z" fill="${H.mid}" opacity=".35"/>`;
    }
    // ตา
    s += eyeG(-76, -1, E, st) + eyeG(76, 1, E, st);
    // คิ้ว
    const bw = S.browW || 1, bc = S.browColor || H.color;
    const browShape = S.browStyle === "thin" ? (sd) => `M${sd * -40},4 Q0,-12 ${sd * 42},0 Q0,-4 ${sd * -40},4Z` : S.browStyle === "bushy" ? (sd) => `M${sd * -50},10 L${sd * -46},-16 Q0,-26 ${sd * 52},-8 L${sd * 46},6 Q0,-2 ${sd * -50},10Z` : (sd) => `M${sd * -46},6 L${sd * -42},-10 L${sd * 30},-14 L${sd * 48},-2 L${sd * 30},2Z`;
    const browG = (cx, sd) => `<g transform="translate(${cx},${f(-52 + browY)}) rotate(${f(sd * brow)}) scale(${bw})"><path d="${browShape(sd)}" fill="${bc}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></g>`;
    s += browG(-76, -1) + browG(76, 1);
    if (ex.mole) s += `<circle cx="${ex.mole[0]}" cy="${ex.mole[1]}" r="7" fill="#3A2420"/><circle cx="${ex.mole[0] - 2}" cy="${ex.mole[1] - 2}" r="2.2" fill="#6A4A40"/>`;
    // จมูก
    const nose = { sharp: `<path d="M6,-6 L14,46 Q4,58 -10,56" fill="none" stroke="${S.skinSh}" stroke-width="6" stroke-linecap="round"/><path d="M-22,54 q6,8 14,2 M14,58 q8,4 14,-4" fill="none" stroke="${RK.shade(S.skinSh, -0.2)}" stroke-width="5" stroke-linecap="round"/>`,
      button: `<path d="M-12,48 Q0,60 12,48" fill="none" stroke="${S.skinSh}" stroke-width="6" stroke-linecap="round"/>`,
      wide: `<path d="M-26,40 Q-34,62 -12,64 Q0,70 12,64 Q34,62 26,40" fill="none" stroke="${S.skinSh}" stroke-width="6" stroke-linecap="round"/><ellipse cx="0" cy="44" rx="18" ry="16" fill="${S.skinHi || S.skin}" opacity=".6"/>`,
      old: `<path d="M4,0 Q18,46 0,60 Q-16,62 -22,52" fill="none" stroke="${S.skinSh}" stroke-width="6" stroke-linecap="round"/>` }[S.nose || "button"];
    s += nose;
    // ปาก + หนวด
    const mt = p.talk ? "talk" : mouth;
    s += `<g transform="translate(0,${mt === "scream" || mt === "o" || mt === "talk" || mt === "grin" || mt === "laugh" || mt === "shout" ? 100 : 108})">${mouthPath(mt, t, ex)}</g>`;
    if (ex.mustache === "thick") s += `<path d="M-66,98 Q-50,72 -12,78 Q0,84 12,78 Q50,72 66,98 Q54,110 24,102 Q0,96 -24,102 Q-54,110 -66,98Z" fill="${H.color}" stroke="${INK}" stroke-width="4"/><path d="M-50,90 l10,-6 M-32,86 l8,-6 M32,86 l-8,-6 M50,90 l-10,-6" stroke="${H.hi}" stroke-width="3"/>`;
    // แว่น
    const gl = S.glasses;
    if (gl && gl.type === "square") {
      const lens = (cx) => `<rect x="${cx - 64}" y="-30" width="128" height="84" rx="16" fill="rgba(205,230,255,.14)" stroke="${gl.color}" stroke-width="12"/><path d="M${cx - 50},-20 L${cx - 20},-20" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".35"/>`;
      s += lens(-78) + lens(78) + `<path d="M-14,-6 Q0,-16 14,-6" fill="none" stroke="${gl.color}" stroke-width="11"/><path d="M-142,-14 L-190,-20 M142,-14 L190,-20" stroke="${gl.color}" stroke-width="11"/>`;
    } else if (gl && gl.type === "reading") {
      const lens = (cx) => `<circle cx="${cx}" cy="30" r="44" fill="rgba(205,230,255,.14)" stroke="${gl.color}" stroke-width="8"/>`;
      s += lens(-74) + lens(74) + `<path d="M-30,24 Q0,12 30,24" fill="none" stroke="${gl.color}" stroke-width="7"/><path d="M-118,22 L-186,4 M118,22 L186,4" stroke="${gl.color}" stroke-width="7"/><path d="M-186,4 Q-200,140 -150,230 M186,4 Q200,140 150,230" fill="none" stroke="#C9A55A" stroke-width="3" stroke-dasharray="6 4"/>`;
    }
    if (p.glint) s += `<g stroke="#fff" stroke-linecap="round" opacity="${f(p.glint)}"><path d="M-126,30 L-60,-24" stroke-width="12"/><path d="M34,30 L98,-22" stroke-width="12"/></g>`;
    s += hair.front;
    // สัญลักษณ์อารมณ์
    const tear = pick("tear"), vein = pick("vein");
    if (tear) { const dy = (t * 60) % 90; s += `<path d="M-98,${f(40 + dy)} q-10,18 0,26 q10,-8 0,-26Z" fill="#8FD3F5" stroke="${INK}" stroke-width="3"/>`; }
    if (vein) s += `<g transform="translate(130,-150) scale(${f(1 + 0.12 * Math.sin(t * 12))})"><path d="M-22,-6 Q-6,-6 -6,-22 M6,-22 Q6,-6 22,-6 M22,6 Q6,6 6,22 M-6,22 Q-6,6 -22,6" fill="none" stroke="#E0262B" stroke-width="7" stroke-linecap="round"/></g>`;
    const drops = [[-178, -40], [170, -20], [-166, 40]].slice(0, sweat);
    s += drops.map(([x, y], i) => { const dy = (t * 40 + i * 30) % 60; return `<path d="M${x},${f(y + dy)} q-12,22 0,30 q12,-8 0,-30Z" fill="#8FD3F5" stroke="${INK}" stroke-width="4" opacity="${f(1 - dy / 70)}"/>`; }).join("");
    return `<g transform="translate(${f(tremble)},0)">${s}</g>`;
  }

  // ---------- ลำตัว (วาดใน "พื้นที่ลำตัวมาตรฐาน" y: -470..-218 แล้วยืด/หดด้วย transform) ----------
  function torsoPath(belly, waist = 1) {
    const b = belly * 42, w = 112 * waist + b;
    return `M-50,-460 Q-108,-456 -134,-434 Q-146,-404 -132,-372 Q${f(-w - 6)},-320 ${f(-w)},-292 Q${f(-w + 2 - b * 0.3)},-250 -124,-218 L124,-218 Q${f(w - 2 + b * 0.3)},-250 ${f(w)},-292 Q${f(w + 6)},-320 132,-372 Q146,-404 134,-434 Q108,-456 50,-460 Q0,-440 -50,-460Z`;
  }
  function top(S) {
    const T = S.top, c = T.color, sh = T.sh || RK.shade(c, -0.2), hi = T.hi || RK.shade(c, 0.15), be = S.body.belly || 0;
    let s = `<path d="${torsoPath(be, S.body.waist || 1)}" fill="${c}" stroke="${INK}" stroke-width="${LW}"/>`;
    if (T.pattern === "floral") { const r = RK.rng(12); for (let i = 0; i < 26; i++) { const x = -110 + r() * 220, y = -440 + r() * 210; s += `<g transform="translate(${f(x)},${f(y)})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-9" rx="5" ry="8" fill="${T.p1 || "#F6E6F0"}" transform="rotate(${a})"/>`).join("")}<circle r="4" fill="${T.p2 || "#F2C14E"}"/></g>`; } }
    if (T.pattern === "hawaii") { const r = RK.rng(21); for (let i = 0; i < 14; i++) { const x = -110 + r() * 220, y = -430 + r() * 200; s += `<path d="M${f(x)},${f(y)} q14,-20 28,0 q-14,20 -28,0Z" fill="${T.p1 || "#F7D046"}" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/><circle cx="${f(x + 30)}" cy="${f(y + 18)}" r="7" fill="${T.p2 || "#FFFFFF"}" opacity=".8"/>`; } }
    if (T.pattern === "star") s += `<path d="M0,-372 L14,-340 L48,-338 L22,-316 L30,-282 L0,-300 L-30,-282 L-22,-316 L-48,-338 L-14,-340Z" fill="${T.p1 || "#FFFFFF"}" stroke="${INK}" stroke-width="4"/>`;
    // รอยยับ
    s += `<path d="M-20,-380 q10,30 -4,60 M14,-330 q8,24 -2,46 M-6,-262 q14,10 30,4" fill="none" stroke="${sh}" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
    s += `<path d="M-122,-226 L122,-226" stroke="${sh}" stroke-width="8"/>`;
    // คอเสื้อ
    switch (T.collar) {
      case "polo": s += `<path d="M-60,-454 L-10,-404 L-40,-388 L-76,-440Z M60,-454 L10,-404 L40,-388 L76,-440Z" fill="${hi}" stroke="${INK}" stroke-width="5"/><path d="M0,-410 L0,-350" stroke="${sh}" stroke-width="5"/><circle cx="0" cy="-392" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="0" cy="-366" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M60,-380 l20,0 l-4,14 l-12,0Z" fill="${T.p1 || "#fff"}" opacity=".8"/>`; break;
      case "shirt": s += `<path d="M-56,-456 L-2,-410 L-36,-384 L-80,-436Z M56,-456 L2,-410 L36,-384 L80,-436Z" fill="${hi}" stroke="${INK}" stroke-width="5"/><path d="M0,-410 L0,-222" stroke="${sh}" stroke-width="4"/>` + [-380, -340, -300, -260].map((y) => `<circle cx="10" cy="${y}" r="4.5" fill="#EDEDED" stroke="${INK}" stroke-width="2"/>`).join("") + `<rect x="56" y="-392" width="46" height="40" rx="4" fill="none" stroke="${sh}" stroke-width="4"/><rect x="66" y="-404" width="8" height="30" rx="3" fill="#2F4F8C" stroke="${INK}" stroke-width="2"/>`; break;
      case "peter": s += `<path d="M-6,-448 Q-40,-460 -78,-446 Q-80,-410 -40,-404 Q-10,-410 -6,-448Z M6,-448 Q40,-460 78,-446 Q80,-410 40,-404 Q10,-410 6,-448Z" fill="${T.collarColor || "#FFFFFF"}" stroke="${INK}" stroke-width="5"/>`; break;
      case "mandarin": s += `<path d="M-46,-460 Q0,-444 46,-460 L46,-444 Q0,-426 -46,-444Z" fill="${hi}" stroke="${INK}" stroke-width="4"/><path d="M0,-440 L0,-222" stroke="${sh}" stroke-width="4"/>` + [-410, -370, -330, -290, -250].map((y) => `<circle cx="0" cy="${y}" r="5" fill="${T.p2 || "#F2C14E"}" stroke="${INK}" stroke-width="2"/>`).join(""); break;
      default: s += `<path d="M-50,-452 Q0,-414 50,-452" fill="none" stroke="${sh}" stroke-width="12"/><path d="M-50,-452 Q0,-414 50,-452" fill="none" stroke="${INK}" stroke-width="4"/>`;
    }
    if (S.tie) s += `<path d="M-14,-412 L14,-412 L10,-394 L-10,-394Z" fill="${S.tie}" stroke="${INK}" stroke-width="4"/><path d="M-10,-394 L10,-394 L22,-270 L0,-244 L-22,-270Z" fill="${S.tie}" stroke="${INK}" stroke-width="5"/><path d="M-6,-370 L14,-350 M-12,-330 L16,-300" stroke="${RK.shade(S.tie, -0.25)}" stroke-width="5"/>`;
    return s;
  }
  function outer(S) {
    const O = S.outer; if (!O) return "";
    const c = O.color, sh = O.sh || RK.shade(c, -0.18), hi = O.hi || RK.shade(c, 0.15);
    let s = "";
    if (O.type === "vest") {
      const vest = "M-150,-440 Q-158,-400 -146,-364 Q-140,-300 -136,-232 L-30,-226 L-14,-420 Q-40,-452 -78,-460 Q-126,-458 -150,-440Z";
      s += `<path d="${vest}" fill="${c}" stroke="${INK}" stroke-width="${LW}"/><path d="${vest}" transform="scale(-1,1)" fill="${c}" stroke="${INK}" stroke-width="${LW}"/>`;
      s += `<path d="M-78,-458 Q-50,-440 -20,-420 L-36,-404 Q-60,-424 -84,-440Z" fill="${hi}" stroke="${INK}" stroke-width="4"/><path d="M78,-458 Q50,-440 20,-420 L36,-404 Q60,-424 84,-440Z" fill="${hi}" stroke="${INK}" stroke-width="4"/>`;
      s += `<path d="M-148,-436 Q-154,-398 -144,-364 M148,-436 Q154,-398 144,-364" fill="none" stroke="${sh}" stroke-width="9"/>`;
      s += `<path d="M-128,-300 L-30,-296 M128,-300 L30,-296" stroke="${sh}" stroke-width="6"/><path d="M-130,-250 L-32,-246 M130,-250 L32,-246" stroke="${O.stitch}" stroke-width="3" stroke-dasharray="8 6"/>`;
      s += `<path d="M-22,-418 L-30,-230" stroke="${O.stitch}" stroke-width="5"/>` + [-400, -370, -340, -310, -280, -250].map((y) => `<path d="M-30,${y} l10,4" stroke="#8A8A86" stroke-width="4"/>`).join("");
      const pocket = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${sh}" stroke="${INK}" stroke-width="5"/><rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" rx="4" fill="none" stroke="${O.stitch}" stroke-width="3" stroke-dasharray="7 6"/><path d="M${x - 3},${y} L${x + w + 3},${y} L${x + w - 4},${y + 22} L${x + 4},${y + 22}Z" fill="${hi}" stroke="${INK}" stroke-width="5"/><circle cx="${x + w / 2}" cy="${y + 15}" r="5" fill="${O.stitch}"/>`;
      s += pocket(-118, -404, 72, 62) + pocket(46, -404, 72, 62) + pocket(-124, -300, 80, 66) + pocket(44, -300, 80, 66);
      s += `<rect x="66" y="-416" width="9" height="30" rx="3" fill="#2F4F8C" stroke="${INK}" stroke-width="3"/><rect x="-112" y="-436" width="34" height="14" rx="3" fill="#D8483B" stroke="${INK}" stroke-width="3"/>`;
    } else if (O.type === "cardigan") {
      const side = "M-150,-436 Q-166,-330 -146,-206 L-40,-206 Q-36,-330 -30,-440 Q-90,-458 -150,-436Z";
      s += `<path d="${side}" fill="${c}" stroke="${INK}" stroke-width="${LW}"/><path d="${side}" transform="scale(-1,1)" fill="${c}" stroke="${INK}" stroke-width="${LW}"/>`;
      s += `<path d="M-146,-222 L-40,-222 M146,-222 L40,-222" stroke="${sh}" stroke-width="10"/>` + [-400, -350, -300, -250].map((y) => `<circle cx="-46" cy="${y}" r="6" fill="${O.button || "#F7EBD3"}" stroke="${INK}" stroke-width="3"/>`).join("");
      s += `<path d="M-120,-380 l0,140 M-90,-390 l0,150 M120,-380 l0,140 M90,-390 l0,150" stroke="${sh}" stroke-width="3" opacity=".6"/>`;
      s += `<rect x="60" y="-300" width="60" height="50" rx="5" fill="${sh}" stroke="${INK}" stroke-width="4"/>`;
    } else if (O.type === "apron") {
      s += `<path d="M-90,-390 L90,-390 L104,-150 Q0,-130 -104,-150Z" fill="${c}" stroke="${INK}" stroke-width="${LW}"/><path d="M-90,-390 Q-60,-470 -30,-462 M90,-390 Q60,-470 30,-462" fill="none" stroke="${c}" stroke-width="16"/><path d="M-90,-390 Q-60,-470 -30,-462 M90,-390 Q60,-470 30,-462" fill="none" stroke="${INK}" stroke-width="3"/>`;
      s += `<rect x="-60" y="-300" width="120" height="70" rx="8" fill="${sh}" stroke="${INK}" stroke-width="5"/><path d="M-60,-276 L60,-276" stroke="${INK}" stroke-width="3"/><rect x="-40" y="-298" width="30" height="18" fill="#7BB661" stroke="${INK}" stroke-width="2"/><rect x="6" y="-296" width="30" height="16" fill="#C9A05A" stroke="${INK}" stroke-width="2"/>`;
      s += `<path d="M-104,-250 Q-140,-250 -150,-226 M104,-250 Q140,-250 150,-226" fill="none" stroke="${c}" stroke-width="10"/>`;
    }
    if (S.lanyard) s += `<path d="M-40,-456 L0,-330 L40,-456" fill="none" stroke="${S.lanyard}" stroke-width="9"/><rect x="-26" y="-334" width="52" height="68" rx="6" fill="#F4F4F0" stroke="${INK}" stroke-width="4"/><rect x="-18" y="-324" width="20" height="24" fill="#9FB7D6"/><path d="M6,-320 l14,0 M6,-310 l14,0 M-18,-292 l38,0" stroke="#666" stroke-width="3"/>`;
    if (S.towel) s += `<path d="M60,-470 Q120,-470 150,-430 L150,-300 Q130,-290 120,-300 L118,-420 Q90,-440 50,-440Z" fill="${S.towel}" stroke="${INK}" stroke-width="5"/><path d="M128,-330 l20,0 M128,-316 l20,0" stroke="${RK.shade(S.towel, -0.2)}" stroke-width="3"/>`;
    return s;
  }
  function bottomLeg(S, side, a, k, lift, L1, L2) { // ขา 1 ข้าง: ต้นขา/น่องเรียว เข่าซ้อนกัน + รองเท้า
    const B = S.bottom, lw = S.body.legW || 1, sw = 1 + 0.08 * lift, shz = 1 + 0.18 * lift;
    L1 *= 1 - 0.3 * lift; L2 *= 1 - 0.2 * lift;
    const pants = B.type === "pants", shorts = B.type === "shorts";
    const thighC = pants || shorts ? B.color : S.skin, shinC = pants ? B.color : S.skin;
    const tw0 = (pants || shorts ? 108 : 82) * sw * lw, tw1 = (pants ? 74 : 56) * sw * lw;
    const sw0 = (pants ? 72 : 56) * sw * lw, sw1 = (pants ? 58 : 36) * sw * lw;
    const shoe = shoes({ skin: S.skin, ...S.shoes }, side);
    let shin = taper(L2, sw0, sw1, shinC, pants ? B.hi : S.skinHi, pants ? 0.04 : 0.22);
    if (pants) shin += `<path d="M${f(-sw1 / 2 - 2)},${f(L2 - 4)} Q0,${f(L2 + 6)} ${f(sw1 / 2 + 2)},${f(L2 - 4)}" fill="none" stroke="${B.sh}" stroke-width="6"/>`;
    const shinG = `<g transform="translate(0,${f(L1)}) rotate(${f(k)})">${shin}<g transform="translate(${side * 10},${f(L2 + 4)}) scale(${f(shz * (S.footK || 1.12))})">${shoe}</g></g>`;
    let thigh = taper(L1 + 6, tw0, tw1, thighC, pants || shorts ? B.hi : S.skinHi, 0.08);
    if (shorts) thigh += `<path d="M${f(-tw0 / 2 - 3)},0 L${f(tw0 / 2 + 3)},0 L${f(tw1 / 2 + 8)},${f(L1 * 0.55)} L${f(-tw1 / 2 - 8)},${f(L1 * 0.55)}Z" fill="${B.color}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/><path d="M${f(-tw1 / 2 - 6)},${f(L1 * 0.5)} L${f(tw1 / 2 + 6)},${f(L1 * 0.5)}" stroke="${B.sh}" stroke-width="6"/>`;
    if (pants) thigh += `<path d="M${side * 8},10 Q${side * 2},${f(L1 * 0.6)} ${side * 10},${f(L1 - 6)}" fill="none" stroke="${B.sh}" stroke-width="5"/>`;
    const knee = lift > 0.15 ? `<ellipse cx="0" cy="${f(L1)}" rx="${f(tw1 * 0.5)}" ry="${f(12 + 18 * lift)}" fill="${pants ? B.sh : S.skinSh}" opacity=".6"/>` : "";
    // วาดหน้าแข้งก่อน แล้วต้นขาทับ = เข่าดูต่อกันเป็นธรรมชาติ
    return `<g transform="translate(${f(side * 62 * (S.body.bw || 1))},${f(S._hipY)}) rotate(${f(a)})">${shinG}${thigh}${knee}</g>`;
  }
  function shoes(Sh, side) {
    const c = Sh.color, cs = RK.shade(c, -0.18);
    switch (Sh.type) {
      case "sandal": return `<path d="M-38,10 Q-44,26 -12,28 L50,28 Q60,14 44,8Z" fill="${Sh.sole || "#6B4B34"}" stroke="${INK}" stroke-width="5"/><path d="M-20,-14 Q-36,6 -30,14 L46,14 Q50,-4 30,-16Z" fill="${Sh.skin}" stroke="${INK}" stroke-width="5"/><path d="M-26,0 Q8,-12 40,0" fill="none" stroke="${c}" stroke-width="10"/>` + [-18, -4, 10, 24, 36].map((x) => `<circle cx="${x}" cy="14" r="5" fill="${Sh.skin}" stroke="${INK}" stroke-width="2"/>`).join("");
      case "slipper": return `<path d="M-38,8 Q-44,26 -12,28 L50,28 Q60,12 44,6Z" fill="${c}" stroke="${INK}" stroke-width="5"/><path d="M-20,-14 Q-36,6 -30,12 L46,12 Q50,-4 30,-16Z" fill="${Sh.skin}" stroke="${INK}" stroke-width="5"/><path d="M-30,6 L44,4" stroke="${c}" stroke-width="12"/>`;
      case "flat": return `<path d="M-36,-12 Q-44,22 -10,24 L50,24 Q60,4 40,-14Z" fill="${c}" stroke="${INK}" stroke-width="${LW}"/><path d="M-20,-10 Q10,0 34,-12" fill="none" stroke="${cs}" stroke-width="5"/><circle cx="8" cy="-6" r="6" fill="${Sh.bow || "#F7EBD3"}"/>`;
      case "dress": return `<path d="M-40,-14 Q-48,22 -12,26 L58,26 Q70,6 44,-16Z" fill="${c}" stroke="${INK}" stroke-width="${LW}"/><path d="M30,-8 Q50,0 52,14" fill="none" stroke="#fff" stroke-width="5" opacity=".35"/><rect x="-44" y="20" width="108" height="10" rx="5" fill="#141414"/>`;
      default: return `<path d="M-42,-16 Q-48,22 -12,26 L54,26 Q66,4 42,-18Z" fill="${c}" stroke="${INK}" stroke-width="${LW}"/><path d="M-30,-6 L30,-8 M-26,4 L28,2" stroke="${Sh.lace || "#9C958A"}" stroke-width="4" stroke-linecap="round"/><path d="M40,-14 Q54,4 50,20" fill="none" stroke="${cs}" stroke-width="6"/><rect x="-44" y="18" width="104" height="13" rx="6" fill="${Sh.sole || "#8E887E"}" stroke="${INK}" stroke-width="5"/>`;
    }
  }
  function skirtOver(S, ls) { // กระโปรง/ผ้าถุง/กางเกงส่วนสะโพก ทับขา
    const B = S.bottom, hy = S._hipY, w = 132 * (S.body.bw || 1);
    if (B.type === "skirt") { const L = (B.len || 128) * ls; return `<path d="M${-w + 10},${hy - 20} L${w - 10},${hy - 20} L${w + 30},${f(hy + L)} Q0,${f(hy + L + 14)} ${-w - 30},${f(hy + L)}Z" fill="${B.color}" stroke="${INK}" stroke-width="${LW}"/><path d="M-40,${hy} L-56,${f(hy + L)} M40,${hy} L56,${f(hy + L)} M0,${hy} L0,${f(hy + L + 8)}" stroke="${B.sh}" stroke-width="5"/>`; }
    if (B.type === "sarong") { const L = -hy - 30; return `<path d="M${-w + 4},${hy - 20} L${w - 4},${hy - 20} L${w + 6},${f(hy + L)} Q0,${f(hy + L + 10)} ${-w - 6},${f(hy + L)}Z" fill="${B.color}" stroke="${INK}" stroke-width="${LW}"/><path d="M${-w + 4},${hy - 4} L${w - 4},${hy - 4}" stroke="${B.sh}" stroke-width="12"/>` + [0.35, 0.6, 0.85].map((k) => `<path d="M${-w},${f(hy + L * k)} L${w},${f(hy + L * k)}" stroke="${B.p1 || B.sh}" stroke-width="10" opacity=".8"/><path d="M${-w},${f(hy + L * k + 14)} L${w},${f(hy + L * k + 14)}" stroke="${B.p2 || "#E8C46A"}" stroke-width="4"/>`).join("") + `<path d="M${w - 30},${hy - 10} Q${w - 50},${f(hy + L * 0.5)} ${w - 20},${f(hy + L)}" fill="none" stroke="${B.sh}" stroke-width="6"/>`; }
    if (B.type === "pants" || B.type === "shorts") { // สะโพก+เป้า ต่อขาสองข้างเป็นกางเกงตัวเดียว
      const bw = S.body.bw || 1, X = (x) => f(x * bw), lw = S.body.legW || 1;
      const d = `M${X(-120)},${hy - 30} L${X(120)},${hy - 30} Q${X(128)},${hy + 14} ${X(112 + 8 * lw)},${hy + 50} Q${X(46)},${hy + 70} ${X(6)},${hy + 44} L0,${hy + 40} L${X(-6)},${hy + 44} Q${X(-46)},${hy + 70} ${X(-112 - 8 * lw)},${hy + 50} Q${X(-128)},${hy + 14} ${X(-120)},${hy - 30}Z`;
      let o = `<path d="${d}" fill="${B.color}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`;
      o += `<path d="M0,${hy - 24} L0,${hy + 34}" stroke="${B.sh}" stroke-width="5"/><path d="M${X(-70)},${hy - 20} Q${X(-50)},${hy + 6} ${X(-30)},${hy - 20} M${X(70)},${hy - 20} Q${X(50)},${hy + 6} ${X(30)},${hy - 20}" fill="none" stroke="${B.sh}" stroke-width="4"/>`;
      if (S.belt) o += `<rect x="${X(-116)}" y="${hy - 30}" width="${X(232)}" height="18" fill="${S.belt}" stroke="${INK}" stroke-width="4"/><rect x="-14" y="${hy - 32}" width="28" height="22" rx="3" fill="#C9A44A" stroke="${INK}" stroke-width="3"/>`;
      return o;
    }
    return "";
  }
  function arm(S, side, a, e, opts, foreOnly) {
    const g = S._g, sx = side * g.shX, L1 = g.L1, L2 = g.L2 * (opts.fore || 1), sy = opts.sy || 1, aw = S.body.armW || 1;
    const T = S.top, O = S.outer && S.outer.sleeves ? S.outer : null;
    const sleeveC = O ? O.color : T.color, sleeveHi = O ? (O.hi || RK.shade(O.color, 0.15)) : (T.hi || RK.shade(T.color, 0.15)), sleeveSh = RK.shade(sleeveC, -0.2);
    const sl = O ? "long" : T.sleeve || "short";
    const ht = opts.hand || "relaxed";
    let handG = ht === "torchF" ? hand("torchF", side, S) + torchFront() : opts.torch && side === 1 ? torchSide() + hand("grip", side, S) : hand(ht, side, S);
    handG = `<g transform="scale(${f(g.handK)})">${handG}</g>`;
    if (opts.wave) handG = `<g transform="rotate(${f(Math.sin(opts.t * 10) * 18)})">${handG}</g>`;
    // แขนท่อนล่าง: เรียวจากศอกไปข้อมือ
    let fore = sl === "long" ? taper(L2, 50 * aw, 42 * aw, sleeveC, sleeveHi, 0.06) : taper(L2, 42 * aw, 30 * aw, S.skin, S.skinHi, 0.16);
    if (sl === "3q") fore += `<path d="M${f(-26 * aw)},-10 L${f(26 * aw)},-10 L${f(22 * aw)},${f(L2 * 0.45)} L${f(-22 * aw)},${f(L2 * 0.45)}Z" fill="${sleeveC}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/><path d="M${f(-22 * aw)},${f(L2 * 0.42)} L${f(22 * aw)},${f(L2 * 0.42)}" stroke="${sleeveSh}" stroke-width="6"/>`;
    if (sl === "long") fore += `<path d="M${f(-23 * aw)},${f(L2 - 14)} L${f(23 * aw)},${f(L2 - 14)} L${f(22 * aw)},${f(L2 + 4)} L${f(-22 * aw)},${f(L2 + 4)}Z" fill="${RK.shade(sleeveC, -0.1)}" stroke="${INK}" stroke-width="5"/>`;
    if (S.watch && side === -1) fore += `<rect x="${f(-18 * aw)}" y="${f(L2 - 22)}" width="${f(36 * aw)}" height="16" rx="5" fill="#2B2B33" stroke="${INK}" stroke-width="3"/><circle cx="0" cy="${f(L2 - 14)}" r="5" fill="#E6E6E6"/>`;
    const foreG = `<g transform="translate(0,${f(L1)}) rotate(${f(e)})">${fore}<g transform="translate(0,${f(L2 + 2)})">${handG}</g></g>`;
    // แขนท่อนบน: ผิว + แขนเสื้อสั้น/ยาวที่กว้างกว่าเล็กน้อย (บานตรงปลาย)
    let upper;
    if (sl === "long") upper = taper(L1 + 8, 64 * aw, 52 * aw, sleeveC, sleeveHi, 0.08);
    else {
      upper = taper(L1 + 8, 52 * aw, 42 * aw, S.skin, S.skinHi, 0.14);
      const sL = L1 * (sl === "3q" ? 1.05 : 0.55);
      upper += `<path d="M${f(-33 * aw)},-6 C${f(-38 * aw)},${f(sL * 0.4)} ${f(-36 * aw)},${f(sL * 0.8)} ${f(-35 * aw)},${f(sL)} L${f(35 * aw)},${f(sL)} C${f(36 * aw)},${f(sL * 0.8)} ${f(38 * aw)},${f(sL * 0.4)} ${f(33 * aw)},-6 A${f(33 * aw)},26 0 0 0 ${f(-33 * aw)},-6Z" fill="${sleeveC}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/><path d="M${f(-33 * aw)},${f(sL - 8)} L${f(33 * aw)},${f(sL - 8)}" stroke="${sleeveSh}" stroke-width="6"/>`;
      if (T.hi) upper += `<path d="M${f(-22 * aw)},4 Q${f(-26 * aw)},${f(sL * 0.5)} ${f(-24 * aw)},${f(sL - 14)}" fill="none" stroke="${sleeveHi}" stroke-width="6" opacity=".5" stroke-linecap="round"/>`;
    }
    // ท่อนล่างวาดก่อน แล้วท่อนบนทับ = ศอกต่อกันเหมือนจริง
    return `<g transform="translate(${f(sx)},${f(S._shY + 8)}) rotate(${f(a)}) scale(1,${f(sy)})">${foreG}${foreOnly ? "" : upper}</g>`;
  }

  // ---------- วาดตัวละคร ----------
  let UID = 0;
  RK.person = function (who, p, t) {
    const S0 = typeof who === "string" ? RK.CAST[who] : who;
    if (!S0) return "";
    const S = p.outfit && S0.outfits && S0.outfits[p.outfit] ? { ...S0, ...S0.outfits[p.outfit] } : { ...S0 };
    S._prop = p.prop ? RK.PROPS[p.prop] : null;
    const B = S.body || {}, g = geom(S), ls = g.ls, ts = g.ts, bw = g.bw;
    S._g = g; S._hipY = g.hipY; S._shY = g.shY;
    const L1 = g.thighL, L2 = g.shinL, headY = g.headY, hs = g.hsz;
    let P = blendPose(p.pose || "idle", p.pose2 || p.pose || "idle", p.poseMix || 0);
    let liftL = 0, liftR = 0, syL = 1, syR = 1, sway = 0;
    if (p.walk) {
      const ph = t * (p.walkRate || 7.5) + (p.phase || 0), w = p.walk;
      liftL = Math.max(0, Math.sin(ph)) * w; liftR = Math.max(0, Math.sin(ph + Math.PI)) * w;
      P.lk += liftL * 8; P.rk -= liftR * 8; P.bob += -Math.abs(Math.sin(ph)) * 16 * w + 8 * w; sway = Math.sin(ph) * 2 * w;
      const sL = Math.sin(ph + Math.PI), sR = Math.sin(ph);
      syL = 1 - 0.12 * Math.max(0, sL) * w; P.le += -8 * Math.max(0, sL) * w; P.la += 2 * sL * w;
      if (!/torch|hold/.test(p.pose || "")) { syR = 1 - 0.12 * Math.max(0, sR) * w; P.re += 8 * Math.max(0, sR) * w; P.ra += -2 * sR * w; }
    }
    if (p.bounce) P.bob += -Math.abs(Math.sin(t * 9)) * 22 * p.bounce;
    if (p.laughShake) P.bob += Math.sin(t * 30) * 4;
    const breathe = Math.sin(t * 2.4) * 4;
    const blink = p.blink ?? ((t + (p.phase || 0) + (S.blinkOff || 0)) % 3.7 < 0.11);
    const id = (S.id || "x") + (UID++ % 1000);
    const legs = liftL > liftR ? bottomLeg(S, 1, P.rl, P.rk, liftR, L1, L2) + bottomLeg(S, -1, P.ll, P.lk, liftL, L1, L2) : bottomLeg(S, -1, P.ll, P.lk, liftL, L1, L2) + bottomLeg(S, 1, P.rl, P.rk, liftR, L1, L2);
    const lo = { hand: p.handL || P.hl, sy: syL, t };
    const ro = { hand: p.handR || P.hr, torch: p.torch && P.hr !== "torchF", sy: syR, fore: P.foreR, wave: P.waveR, t };
    const torsoTr = `translate(0,${f(S._hipY + 245 * ts)}) scale(${f(bw)},${f(ts)})`;
    const tilt = P.tilt || 0; // ทิ้งน้ำหนักขาข้างเดียว: สะโพกเอียง ไหล่เอียงสวน
    const body = `<g transform="${torsoTr}">${top(S)}${outer(S)}</g>`;
    // แขนเสื้อต้องอยู่ใต้เสื้อตัวนอก: วาดแขนทั้งท่อนก่อนลำตัว แล้ววาดเฉพาะท่อนล่าง+มือทับ
    const upper = arm(S, -1, P.la, P.le, lo) + arm(S, 1, P.ra, P.re, ro) + body + arm(S, -1, P.la, P.le, lo, true) + arm(S, 1, P.ra, P.re, ro, true);
    const headG = `<g transform="translate(0,${f(headY + breathe)}) rotate(${f((p.tilt || 0) + (S.headTilt || 0))}) scale(${f(hs)})">${head(S, { ...p, blink }, t, id)}</g>`;
    const flip = (p.facing || 1) < 0 ? "scale(-1,1)" : "";
    const shadow = p.noShadow ? "" : `<ellipse cx="0" cy="8" rx="${f(170 * bw)}" ry="26" fill="#000" opacity=".28"/>`;
    const lean = P.lean + sway + (B.hunch || 0);
    return `<g transform="translate(${f(p.x)},${f(p.y)}) scale(${f(p.s || 1)})">${shadow}<g transform="${flip} translate(0,${f(P.bob)}) rotate(${f(lean)})">${legs}<g transform="rotate(${f(tilt)} 0 ${f(S._hipY)})">${skirtOver(S, ls)}<g transform="translate(0,${f(breathe * 0.3)}) rotate(${f(-tilt * 1.6)} 0 ${f(S._hipY)})">${upper}${headG}</g></g></g></g>`;
  };
  RK.personTorchTip = function (who, p) {
    const S = RK.CAST[who] || RK.CAST.hero, g = geom(S);
    const P = blendPose(p.pose || "idle", p.pose2 || p.pose || "idle", p.poseMix || 0);
    const s = p.s || 1, dir = p.facing || 1, fore = P.foreR || 1;
    const a = (P.ra * Math.PI) / 180, e = ((P.ra + P.re) * Math.PI) / 180;
    let x = g.shX, y = g.shY + 8;
    x += -Math.sin(a) * g.L1; y += Math.cos(a) * g.L1;
    const L2 = g.L2 * fore + 2;
    x += -Math.sin(e) * L2; y += Math.cos(e) * L2;
    const k = g.handK;
    if (P.hr === "torchF") { x += -Math.sin(e) * 74 * k; y += Math.cos(e) * 74 * k; }
    else { x += (-Math.sin(e) * 46 + Math.cos(e) * 112) * k; y += (Math.cos(e) * 46 + Math.sin(e) * 112) * k; }
    return [p.x + x * s * dir, p.y + y * s, e];
  };
})(window);
