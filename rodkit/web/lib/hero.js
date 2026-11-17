// พระเอกช่อง กฎรอดตาย: แว่นกลม ผมหยิก เสื้อกั๊กกากีหลายกระเป๋า ทับเสื้อยืดสีเขียวน้ำทะเล
// พิกัด: จุด (0,0) = กลางเท้า, สูงทั้งตัว ~900 หน่วยที่ scale 1
(function (G) {
  const RK = G.RK, f = RK.f, INK = RK.INK;
  const C = {
    skin: "#F1C7A0", skinSh: "#D9A47E", cheek: "#F09A8A",
    hair: "#2A1E1C", hairHi: "#4A3530",
    tee: "#2E9C9A", teeSh: "#227775",
    vest: "#B79B66", vestSh: "#977C4C", vestHi: "#CDB582", stitch: "#6E5733",
    pants: "#3B4256", pantsSh: "#2B3142",
    shoe: "#ECE6DA", sole: "#9A948A", glass: "#1E1E24",
  };
  const LW = 7; // ความหนาเส้นขอบ

  // ---------- ท่าทาง (มุมเป็นองศา, 0 = แขน/ขาห้อยลง, บวก = เหวี่ยงไปทางขวาของภาพ) ----------
  const POSES = {
    idle:     { la: 8,  le: 6,   ra: -8, re: -6,  ll: 3,  lk: 0,  rl: -3, rk: 0, lean: 0, bob: 0 },
    torch:    { la: 10, le: 8,   ra: -62, re: -38, ll: 3, lk: 0,  rl: -3, rk: 0, lean: 2, bob: 0 },
    scared:   { la: 35, le: 95,  ra: -35, re: -95, ll: 8, lk: 6,  rl: -8, rk: -6, lean: -4, bob: 18 },
    cower:    { la: 120, le: 70, ra: -120, re: -70, ll: 14, lk: 20, rl: -14, rk: -20, lean: 6, bob: 70 },
    torch_front: { la: 10, le: 8, ra: -18, re: 58, ll: 3, lk: 0, rl: -3, rk: 0, lean: 1, bob: 0 },
    point:    { la: 10, le: 6,   ra: -105, re: -8, ll: 3, lk: 0,  rl: -3, rk: 0, lean: 3, bob: 0 },
    shush:    { la: 8,  le: 6,   ra: -40, re: -140, ll: 3, lk: 0, rl: -3, rk: 0, lean: 0, bob: 0 },
    hands_up: { la: 150, le: 20, ra: -150, re: -20, ll: 6, lk: 0, rl: -6, rk: 0, lean: -3, bob: 0 },
  };
  RK.HERO_POSES = Object.keys(POSES);

  function blendPose(a, b, k) {
    const A = POSES[a] || POSES.idle, B = POSES[b] || A, o = {};
    for (const key in A) o[key] = RK.lerp(A[key], B[key] ?? A[key], k);
    return o;
  }

  // ---------- หน้า ----------
  const FACES = {
    calm:      { brow: 0,   browY: 0,  eye: 1.0,  pupil: 1.0, mouth: "smile", sweat: 0 },
    nervous:   { brow: 14,  browY: -6, eye: 1.05, pupil: 0.8, mouth: "wobble", sweat: 1 },
    scared:    { brow: 26,  browY: -16, eye: 1.25, pupil: 0.55, mouth: "o", sweat: 2 },
    terrified: { brow: 34,  browY: -24, eye: 1.4,  pupil: 0.35, mouth: "scream", sweat: 3 },
    determined:{ brow: -16, browY: 4,  eye: 0.9,  pupil: 1.0, mouth: "flat", sweat: 0 },
    relief:    { brow: 10,  browY: -2, eye: 0.6,  pupil: 1.0, mouth: "smile", sweat: 1 },
  };
  RK.HERO_FACES = Object.keys(FACES);

  function mouthPath(type, t) {
    switch (type) {
      case "smile": return `<path d="M-46,8 Q0,48 46,8" fill="none" stroke="${INK}" stroke-width="${LW}" stroke-linecap="round"/>`;
      case "flat": return `<path d="M-38,20 L38,20" stroke="${INK}" stroke-width="${LW}" stroke-linecap="round"/>`;
      case "wobble": { const w = Math.sin(t * 22) * 4; return `<path d="M-42,22 Q-21,${10 + w} 0,22 Q21,${34 - w} 42,22" fill="none" stroke="${INK}" stroke-width="${LW}" stroke-linecap="round"/>`; }
      case "o": return `<ellipse cx="0" cy="24" rx="20" ry="27" fill="#5A1E2A" stroke="${INK}" stroke-width="${LW}"/><ellipse cx="0" cy="38" rx="11" ry="7" fill="#E46A7A"/>`;
      case "scream": return `<path d="M-44,0 Q0,-12 44,0 Q38,74 0,80 Q-38,74 -44,0Z" fill="#5A1E2A" stroke="${INK}" stroke-width="${LW}"/><path d="M-30,2 L30,2 L26,14 L-26,14Z" fill="#fff"/><ellipse cx="0" cy="60" rx="20" ry="10" fill="#E46A7A"/>`;
      case "talk": { const o = 6 + Math.abs(Math.sin(t * 18)) * 22; return `<path d="M-34,14 Q0,${14 + o * 1.4} 34,14 Q0,${10 - o * 0.2} -34,14Z" fill="#5A1E2A" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`; }
      default: return "";
    }
  }

  // ผมหยิก: กลุ่มวงกลมเรียงรอบหัวด้านบน (ตำแหน่งคงที่)
  const CURLS = (() => {
    const r = RK.rng(97), out = [];
    for (let i = 0; i < 26; i++) {
      const a = Math.PI * (1.04 + (i / 25) * 0.92) + (r() - 0.5) * 0.12;
      const rad = 170 + r() * 34;
      out.push([Math.cos(a) * rad, Math.sin(a) * rad * 0.92 - 18, 44 + r() * 20]);
    }
    for (let i = 0; i < 9; i++) out.push([(r() - 0.5) * 230, -150 - r() * 50, 46 + r() * 16]);
    return out;
  })();

  function head(p, t) {
    const F = FACES[p.face] || FACES.calm;
    const FE = p.face2 ? FACES[p.face2] : null, k = p.faceMix || 0;
    const mix = (a) => (FE ? RK.lerp(F[a], FE[a], k) : F[a]);
    const brow = mix("brow"), browY = mix("browY"), eyeS = mix("eye"), pup = mix("pupil");
    const mouth = FE && k > 0.5 ? FE.mouth : F.mouth;
    const sweat = Math.round(FE && k > 0.5 ? FE.sweat : F.sweat);
    const lookX = p.lookX || 0, lookY = p.lookY || 0;
    const blink = p.blink ? 0.08 : 1;
    const tremble = (p.tremble || 0) * Math.sin(t * 60) * 3;
    let s = "";
    // คอ
    s += `<path d="M-38,150 L-34,215 L34,215 L38,150Z" fill="${C.skinSh}" stroke="${INK}" stroke-width="${LW}"/>`;
    // หัวทรงถั่ว
    const headD = "M0,-200 C120,-200 200,-120 200,10 C200,130 120,200 0,200 C-120,200 -200,130 -200,10 C-200,-120 -120,-200 0,-200Z";
    s += `<path d="${headD}" fill="${C.skin}" stroke="${INK}" stroke-width="${LW}"/>`;
    s += `<path d="M150,60 C140,140 80,185 0,190 C90,170 140,120 150,60Z" fill="${C.skinSh}" opacity=".55"/>`;
    // หู
    s += `<ellipse cx="-198" cy="30" rx="26" ry="38" fill="${C.skin}" stroke="${INK}" stroke-width="${LW}"/><ellipse cx="198" cy="30" rx="26" ry="38" fill="${C.skin}" stroke="${INK}" stroke-width="${LW}"/>`;
    // ผมหยิก (ด้านหลังเป็นก้อนเดียว + ลอนวงกลม)
    // วาดเส้นขอบรวมก่อน แล้วเติมสีทับ → เห็นเฉพาะขอบนอกของทรงผม ไม่เป็นวงซ้อนรก
    s += CURLS.map(([x, y, r]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r + LW / 2)}" fill="${INK}"/>`).join("");
    s += CURLS.map(([x, y, r]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r - LW / 2)}" fill="${C.hair}"/>`).join("");
    s += CURLS.slice(0, 26).map(([x, y, r]) => `<path d="M${f(x - r * 0.4)},${f(y - r * 0.2)} q${f(r * 0.3)},${f(-r * 0.35)} ${f(r * 0.6)},0" fill="none" stroke="${C.hairHi}" stroke-width="5" stroke-linecap="round"/>`).join("");
    // แก้ม
    s += `<ellipse cx="-118" cy="88" rx="30" ry="18" fill="${C.cheek}" opacity=".6"/><ellipse cx="118" cy="88" rx="30" ry="18" fill="${C.cheek}" opacity=".6"/>`;
    // ตา
    const eye = (cx) => {
      const ry = 36 * eyeS * blink, rx = 30 * eyeS;
      let e = `<ellipse cx="${cx}" cy="10" rx="${f(rx)}" ry="${f(ry)}" fill="#fff" stroke="${INK}" stroke-width="5"/>`;
      if (blink > 0.5) e += `<circle cx="${f(cx + lookX * 12)}" cy="${f(14 + lookY * 10)}" r="${f(15 * pup)}" fill="${INK}"/><circle cx="${f(cx + lookX * 12 + 5)}" cy="${f(8 + lookY * 10)}" r="${f(5 * Math.max(pup, 0.5))}" fill="#fff"/>`;
      return e;
    };
    s += eye(-74) + eye(74);
    // คิ้ว (มุมบวก = ด้านในยกขึ้น = กลัว)
    s += `<g transform="translate(-74,${f(-58 + browY)}) rotate(${f(-brow)})"><rect x="-38" y="-9" width="76" height="18" rx="9" fill="${C.hair}"/></g>`;
    s += `<g transform="translate(74,${f(-58 + browY)}) rotate(${f(brow)})"><rect x="-38" y="-9" width="76" height="18" rx="9" fill="${C.hair}"/></g>`;
    // แว่นกลม (DNA ของตัวละคร)
    const glint = p.glint ? `<path d="M-108,-24 L-62,-50 M-96,6 L-46,-22" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity="${f(p.glint)}"/><path d="M40,-24 L86,-50" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity="${f(p.glint)}"/>` : "";
    s += `<g fill="rgba(200,230,255,.16)" stroke="${C.glass}" stroke-width="12"><circle cx="-74" cy="10" r="58"/><circle cx="74" cy="10" r="58"/></g>`;
    s += `<path d="M-18,6 Q0,-6 18,6" fill="none" stroke="${C.glass}" stroke-width="10"/><path d="M-132,0 L-196,-6 M132,0 L196,-6" stroke="${C.glass}" stroke-width="10"/>` + glint;
    // จมูก
    s += `<path d="M-6,52 Q8,66 -4,78" fill="none" stroke="${C.skinSh}" stroke-width="6" stroke-linecap="round"/>`;
    // ปาก
    s += `<g transform="translate(0,104)">${mouthPath(p.talk ? "talk" : mouth, t)}</g>`;
    // เหงื่อ
    const drops = [[-176, -60], [168, -40], [-160, 40]].slice(0, sweat);
    s += drops.map(([x, y], i) => { const dy = ((t * 40 + i * 30) % 60); return `<path d="M${x},${f(y + dy)} q-12,22 0,30 q12,-8 0,-30Z" fill="#8FD3F5" stroke="${INK}" stroke-width="4" opacity="${f(1 - dy / 70)}"/>`; }).join("");
    return `<g transform="translate(${f(tremble)},0)">${s}</g>`;
  }

  // ---------- ส่วนตัว ----------
  function limb(len, w, fill, stroke) {
    return `<rect x="${-w / 2}" y="${-w / 2}" width="${w}" height="${len + w / 2}" rx="${w / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${LW}"/>`;
  }
  function hand(open) {
    return open
      ? `<g><ellipse cx="0" cy="22" rx="30" ry="32" fill="${C.skin}" stroke="${INK}" stroke-width="${LW}"/><path d="M-22,40 l-10,26 M-6,48 l-4,30 M10,48 l4,30 M24,38 l12,24" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M-22,40 l-10,26 M-6,48 l-4,30 M10,48 l4,30 M24,38 l12,24" stroke="${C.skin}" stroke-width="6" stroke-linecap="round"/></g>`
      : `<circle cx="0" cy="24" r="30" fill="${C.skin}" stroke="${INK}" stroke-width="${LW}"/><path d="M-12,8 Q2,22 -10,34" fill="none" stroke="${C.skinSh}" stroke-width="5"/>`;
  }
  function torch(on) {
    let s = `<g transform="translate(0,44) rotate(90)"><rect x="-16" y="-80" width="32" height="96" rx="8" fill="#3A3F4A" stroke="${INK}" stroke-width="${LW}"/><rect x="-24" y="-112" width="48" height="38" rx="8" fill="#575E6B" stroke="${INK}" stroke-width="${LW}"/><rect x="-18" y="-116" width="36" height="8" fill="${on ? "#FFF6C8" : "#888"}"/></g>`;
    return s;
  }
  function arm(side, a, e, opts, foreOnly) {
    const sy = opts.sy || 1;
    const sx = side * 112, L1 = 150, L2 = 136;
    const fore = `<g transform="translate(0,${L1}) rotate(${f(e)})">${limb(L2, 46, C.skin, INK)}<g transform="translate(0,${L2})">${opts.torch && side === 1 ? torch(opts.torchOn) + hand(false) : hand(opts.open)}</g></g>`;
    const upper = limb(L1, 62, C.tee, INK) + `<path d="M-31,${L1 - 30} L31,${L1 - 30}" stroke="${C.teeSh}" stroke-width="8"/>`;
    return `<g transform="translate(${sx},-430) rotate(${f(a)}) scale(1,${f(sy)})">${foreOnly ? "" : upper}${fore}</g>`;
  }
  // lift 0..1 = ขาที่ก้าวเข้าหากล้อง (มุมหน้าตรง): ต้นขา/หน้าแข้งสั้นลงเพราะพุ่งเข้าหาเรา รองเท้าใหญ่ขึ้นเพราะใกล้กล้อง
  function leg(side, a, k, lift = 0) {
    const hx = side * 52, L1 = 125 * (1 - 0.3 * lift), L2 = 115 * (1 - 0.2 * lift), sw = 1 + 0.08 * lift, sh = 1 + 0.18 * lift;
    const shin = `<g transform="translate(0,${f(L1)}) rotate(${f(k)})">${limb(L2, 64 * sw, C.pants, INK)}<g transform="translate(${side * 8},${f(L2 + 6)}) scale(${f(sh)})"><path d="M-40,-14 Q-44,22 -10,24 L52,24 Q62,4 40,-16Z" fill="${C.shoe}" stroke="${INK}" stroke-width="${LW}"/><rect x="-42" y="16" width="100" height="12" rx="6" fill="${C.sole}" stroke="${INK}" stroke-width="5"/></g></g>`;
    const knee = lift > 0.15 ? `<ellipse cx="0" cy="${f(L1)}" rx="${f(38 * sw)}" ry="${f(14 + 20 * lift)}" fill="${C.pantsSh}" opacity=".7"/>` : "";
    return `<g transform="translate(${hx},-245) rotate(${f(a)})">${limb(L1, 72 * sw, C.pants, INK)}${knee}${shin}</g>`;
  }
  function body() {
    let s = "";
    // เสื้อยืด (ชายเสื้อทับกางเกง)
    s += `<path d="M-128,-440 Q-150,-340 -122,-218 L122,-218 Q150,-340 128,-440 Q0,-470 -128,-440Z" fill="${C.tee}" stroke="${INK}" stroke-width="${LW}"/>`;
    s += `<path d="M-50,-452 Q0,-418 50,-452" fill="none" stroke="${C.teeSh}" stroke-width="10"/>`;
    // เสื้อกั๊กกากี (ทับเสื้อยืด + ทับต้นแขน)
    const vest = "M-136,-446 Q-150,-340 -134,-232 L-30,-226 L-14,-420 Q-40,-452 -78,-458Z";
    s += `<path d="${vest}" fill="${C.vest}" stroke="${INK}" stroke-width="${LW}"/>`;
    s += `<path d="${vest}" transform="scale(-1,1)" fill="${C.vest}" stroke="${INK}" stroke-width="${LW}"/>`;
    s += `<path d="M-128,-300 L-30,-296 M128,-300 L30,-296" stroke="${C.vestSh}" stroke-width="6"/>`;
    // กระเป๋า 4 ใบ + ฝากระเป๋า + ตะเข็บ + กระดุม
    const pocket = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${C.vestSh}" stroke="${INK}" stroke-width="5"/><rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" rx="4" fill="none" stroke="${C.stitch}" stroke-width="3" stroke-dasharray="7 6"/><path d="M${x - 3},${y} L${x + w + 3},${y} L${x + w - 4},${y + 22} L${x + 4},${y + 22}Z" fill="${C.vestHi}" stroke="${INK}" stroke-width="5"/><circle cx="${x + w / 2}" cy="${y + 15}" r="5" fill="${C.stitch}"/>`;
    s += pocket(-118, -404, 72, 62) + pocket(46, -404, 72, 62) + pocket(-124, -300, 80, 66) + pocket(44, -300, 80, 66);
    // ป้ายชื่อเล็ก / ห่วงไฟฉาย
    s += `<rect x="-112" y="-436" width="34" height="14" rx="3" fill="#D8483B" stroke="${INK}" stroke-width="3"/>`;
    s += `<path d="M96,-232 q8,-22 22,0" fill="none" stroke="#5B5146" stroke-width="7"/>`;
    // ขอบกางเกง/เข็มขัด (อยู่ใต้ชายเสื้อ จึงเห็นแค่ช่วงล่าง)
    return s;
  }

  // ---------- วาดตัวเต็ม ----------
  // p: x,y (ตำแหน่งเท้าบนจอ), s (scale), pose, pose2, mix, walk (0..1 ความเร็วเดิน), face, look, blink ...
  RK.hero = function (p, t) {
    let P = blendPose(p.pose || "idle", p.pose2 || p.pose || "idle", p.poseMix || 0);
    let liftL = 0, liftR = 0, armSyL = 1, armSyR = 1, sway = 0;
    if (p.walk) {
      const ph = t * (p.walkRate || 7.5) + (p.phase || 0), w = p.walk;
      if ((p.walkView || "front") === "front") {
        // เดินเข้าหากล้อง/ออกจากกล้อง: ขาสลับยกก้าว (ไม่เหวี่ยงซ้ายขวา) ตัวยุบ-ยืด สะโพกโยกเล็กน้อย
        liftL = Math.max(0, Math.sin(ph)) * w; liftR = Math.max(0, Math.sin(ph + Math.PI)) * w;
        P.lk += liftL * 8; P.rk -= liftR * 8;
        P.bob += -Math.abs(Math.sin(ph)) * 16 * w + 8 * w;
        sway = Math.sin(ph) * 2.2 * w;
        // แขนแกว่งหน้า-หลัง: แขนที่ไปข้างหน้าดูสั้นลง (พุ่งเข้าหากล้อง) และหุบเข้าเล็กน้อย
        armSyL = 1 - 0.16 * Math.max(0, Math.sin(ph + Math.PI)) * w; P.la += Math.sin(ph + Math.PI) * -6 * w;
        if ((p.pose || "idle") !== "torch") { armSyR = 1 - 0.16 * Math.max(0, Math.sin(ph)) * w; P.ra += Math.sin(ph) * 6 * w; }
      } else {
        // มุมข้าง: ขาเหวี่ยงหน้า-หลังตามแนวจอ
        P.ll += Math.sin(ph) * 28 * w; P.rl += Math.sin(ph + Math.PI) * 28 * w;
        P.lk += Math.max(0, Math.sin(ph + 1.6)) * 30 * w; P.rk += Math.max(0, Math.sin(ph + Math.PI + 1.6)) * 30 * w;
        if ((p.pose || "idle") !== "torch") { P.ra += Math.sin(ph) * 22 * w; }
        P.la += Math.sin(ph + Math.PI) * 22 * w;
        P.bob += Math.abs(Math.sin(ph)) * -14 * w;
      }
    }
    const breathe = Math.sin(t * 2.4) * 4;
    const blink = p.blink ?? ((t * 1.0 + (p.phase || 0)) % 3.7 < 0.11);
    // ขาที่ยกก้าวมาข้างหน้าต้องวาดทีหลัง (อยู่ใกล้กล้องกว่า)
    const legs = liftL > liftR ? leg(1, P.rl, P.rk, liftR) + leg(-1, P.ll, P.lk, liftL) : leg(-1, P.ll, P.lk, liftL) + leg(1, P.rl, P.rk, liftR);
    // แขนเสื้อต้องอยู่ใต้เสื้อกั๊กเสมอ: วาดแขนทั้งท่อนก่อนตัว แล้ววาดเฉพาะแขนท่อนล่าง+มือทับอีกที
    const ro = { open: p.openHands, torch: p.torch, torchOn: p.torch !== "off", sy: armSyR };
    const upper =
      arm(-1, P.la, P.le, { open: p.openHands, sy: armSyL }) + arm(1, P.ra, P.re, ro) + body() + arm(1, P.ra, P.re, ro, true);
    const headG = `<g transform="translate(0,${f(-640 + breathe)}) rotate(${f((p.tilt || 0))})">${head({ ...p, blink }, t)}</g>`;
    const flip = (p.facing || 1) < 0 ? "scale(-1,1)" : "";
    const shadow = p.noShadow ? "" : `<ellipse cx="0" cy="8" rx="170" ry="26" fill="#000" opacity=".28"/>`;
    return `<g transform="translate(${f(p.x)},${f(p.y)}) scale(${f(p.s || 1)})">${shadow}<g transform="${flip} translate(0,${f(P.bob)}) rotate(${f(P.lean + sway)})">${legs}<g transform="translate(0,${f(breathe * 0.3)})">${upper}${headG}</g></g></g>`;
  };

  // จุดปลายไฟฉาย (ใช้วาดลำแสง) — คืนพิกัดบนจอโดยประมาณ
  RK.heroTorchTip = function (p) {
    const P = blendPose(p.pose || "idle", p.pose2 || p.pose || "idle", p.poseMix || 0);
    const s = p.s || 1, dir = p.facing || 1;
    const a = (P.ra * Math.PI) / 180, e = ((P.ra + P.re) * Math.PI) / 180;
    let x = 112, y = -430;
    x += -Math.sin(a) * 150; y += Math.cos(a) * 150;
    x += -Math.sin(e) * 136; y += Math.cos(e) * 136;
    x += -Math.sin(e) * 44 + Math.cos(e) * 110; y += Math.cos(e) * 44 + Math.sin(e) * 110;
    return [p.x + x * s * dir, p.y + y * s, e];
  };
})(window);
