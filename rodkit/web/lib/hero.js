// พระเอกช่อง กฎรอดตาย (v2): หน้าคม ทรงผม Dropcut แว่นเหลี่ยม ไฝใต้หางตาขวา หนวดเคราบางๆ
// เสื้อกั๊กกากีหลายกระเป๋า ทับเสื้อยืดสีเขียวน้ำทะเล · มือมีนิ้วจริง
// พิกัด: จุด (0,0) = กลางเท้า, สูงทั้งตัว ~900 หน่วยที่ scale 1
(function (G) {
  const RK = G.RK, f = RK.f, INK = RK.INK;
  const C = {
    skin: "#EFC29B", skinSh: "#D49E78", skinHi: "#F8D6B6", cheek: "#E99482", lip: "#B8665E",
    hair: "#221816", hairMid: "#3A2924", hairHi: "#5C443B", stubble: "#4A3A33",
    tee: "#2E9C9A", teeSh: "#227775", teeHi: "#46B5B2",
    vest: "#B79B66", vestSh: "#977C4C", vestHi: "#CDB582", stitch: "#6E5733",
    pants: "#3B4256", pantsSh: "#2B3142", pantsHi: "#4E5670",
    shoe: "#ECE6DA", shoeSh: "#C9C1B2", sole: "#8E887E", lace: "#9C958A", glass: "#17171C",
  };
  const LW = 7;

  // ---------- ท่า (องศา) แขนซ้ายของจอ = la/le, ขวา = ra/re · แขนห้อยปกติ: ต้นแขนกางออกนิด ศอกงอเข้าหาตัว ----------
  const POSES = {
    idle:        { la: 7,   le: -9,  ra: -7,   re: 9,   ll: 3,  lk: 0,  rl: -3, rk: 0,  lean: 0,  bob: 0, hl: "relaxed", hr: "relaxed" },
    torch:       { la: 7,   le: -9,  ra: -62,  re: -30, ll: 3,  lk: 0,  rl: -3, rk: 0,  lean: 2,  bob: 0, hl: "relaxed", hr: "grip" },
    torch_front: { la: 7,   le: -9,  ra: -6,   re: 12,  ll: 3,  lk: 0,  rl: -3, rk: 0,  lean: 1,  bob: 0, hl: "relaxed", hr: "torchF", foreR: 0.42 },
    scared:      { la: 30,  le: 100, ra: -30,  re: -100, ll: 8, lk: 6,  rl: -8, rk: -6, lean: -4, bob: 18, hl: "open", hr: "open" },
    cower:       { la: 118, le: 72,  ra: -118, re: -72, ll: 14, lk: 20, rl: -14, rk: -20, lean: 6, bob: 70, hl: "fist", hr: "fist" },
    point:       { la: 7,   le: -9,  ra: -100, re: -6,  ll: 3,  lk: 0,  rl: -3, rk: 0,  lean: 3,  bob: 0, hl: "relaxed", hr: "point" },
    shush:       { la: 7,   le: -9,  ra: -38,  re: -142, ll: 3, lk: 0,  rl: -3, rk: 0,  lean: 0,  bob: 0, hl: "relaxed", hr: "point" },
    hands_up:    { la: 150, le: 18,  ra: -150, re: -18, ll: 6,  lk: 0,  rl: -6, rk: 0,  lean: -3, bob: 0, hl: "open", hr: "open" },
  };
  RK.HERO_POSES = Object.keys(POSES);
  function blendPose(a, b, k) {
    const A = POSES[a] || POSES.idle, B = POSES[b] || A, o = {};
    for (const key in A) o[key] = typeof A[key] === "number" ? RK.lerp(A[key], B[key] ?? A[key], k) : (k < 0.5 ? A[key] : B[key] ?? A[key]);
    return o;
  }

  // ---------- หน้า ----------
  const FACES = {
    calm:       { brow: 0,   browY: 0,   eye: 1.0,  pupil: 1.0, lid: 0.15, mouth: "smirk",  sweat: 0 },
    nervous:    { brow: 14,  browY: -6,  eye: 1.1,  pupil: 0.85, lid: 0.05, mouth: "wobble", sweat: 1 },
    scared:     { brow: 26,  browY: -14, eye: 1.35, pupil: 0.62, lid: 0,    mouth: "o",      sweat: 2 },
    terrified:  { brow: 34,  browY: -22, eye: 1.55, pupil: 0.45, lid: 0,    mouth: "scream", sweat: 3 },
    determined: { brow: -18, browY: 6,   eye: 0.85, pupil: 1.0, lid: 0.3,  mouth: "flat",   sweat: 0 },
    relief:     { brow: 10,  browY: -2,  eye: 0.55, pupil: 1.0, lid: 0.4,  mouth: "smile",  sweat: 1 },
  };
  RK.HERO_FACES = Object.keys(FACES);

  function mouthPath(type, t) {
    const lip = `stroke="${INK}" stroke-width="${LW}" stroke-linecap="round" stroke-linejoin="round"`;
    switch (type) {
      case "smile": return `<path d="M-44,6 Q0,42 44,6" fill="none" ${lip}/>`;
      case "smirk": return `<path d="M-38,14 Q4,26 40,6" fill="none" ${lip}/><path d="M36,4 l10,-4" ${lip}/>`;
      case "flat": return `<path d="M-36,16 L36,16" ${lip}/>`;
      case "wobble": { const w = Math.sin(t * 22) * 4; return `<path d="M-40,20 Q-20,${10 + w} 0,20 Q20,${30 - w} 40,20" fill="none" ${lip}/>`; }
      case "o": return `<path d="M-18,8 Q0,-6 18,8 Q24,40 0,50 Q-24,40 -18,8Z" fill="#4A1A22" ${lip}/><ellipse cx="0" cy="40" rx="10" ry="6" fill="#D85E6E"/>`;
      case "scream": return `<path d="M-46,-4 Q0,-16 46,-4 Q40,76 0,84 Q-40,76 -46,-4Z" fill="#4A1A22" ${lip}/><path d="M-32,-2 Q0,-10 32,-2 L28,12 Q0,6 -28,12Z" fill="#F3F0EA"/><path d="M-24,72 Q0,64 24,72" fill="#F3F0EA" opacity=".9"/><ellipse cx="0" cy="58" rx="20" ry="10" fill="#D85E6E"/>`;
      case "talk": { const o = 6 + Math.abs(Math.sin(t * 18)) * 22; return `<path d="M-32,12 Q0,${12 + o * 1.4} 32,12 Q0,${8 - o * 0.2} -32,12Z" fill="#4A1A22" ${lip}/>`; }
      default: return "";
    }
  }

  // ทรงผม Dropcut: ข้าง/หลังไล่สั้น (fade) + ด้านบนยาวเป็นปอยแหลม + หน้าม้าตกลงมาเฉียง
  const HAIR = (() => {
    const r = RK.rng(1203);
    // ด้านบนยาวมีวอลลุ่มพอดีหัว (ไม่ตั้งสูง) ขอบบนเป็นปอยนุ่มๆ
    const top = [];
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (1.0 + (i / 12) * 1.0);
      const rad = 208 + (i % 2 ? 10 : 0) + r() * 6;
      top.push([Math.cos(a) * rad * 0.97, Math.sin(a) * rad * 0.46 - 168]);
    }
    // หน้าม้าตกลงมาเฉียงซ้ายของจอ ปลายแหลมแต่สั้น
    const fringe = [[198, -150], [170, -112], [138, -132], [104, -92], [70, -120], [36, -80], [2, -112], [-34, -74], [-66, -108], [-100, -82], [-132, -116], [-164, -100], [-198, -150]];
    const strands = [];
    for (let i = 0; i < 20; i++) {
      const x0 = -150 + i * 15 + (r() - 0.5) * 8, y0 = -258 + Math.abs(x0) * 0.18 + r() * 10;
      strands.push([[x0 + 10, y0], [x0 - 2 + (r() - 0.5) * 8, y0 + 60], [x0 - 18 - r() * 8, y0 + 120 + r() * 20]]);
    }
    return { top, fringe, strands };
  })();
  const STUBBLE = (() => { // ตอหนวดละเอียด: จุดเล็ก จาง ถี่ (ไม่ใช่จุดใหญ่แบบสิว)
    const r = RK.rng(77), dots = [];
    for (let i = 0; i < 900; i++) {
      const x = (r() - 0.5) * 330, y = 70 + r() * 150;
      const inJaw = y > 100 + Math.abs(x) * 0.2 && y < 212 - Math.abs(x) * 0.55 && !(Math.abs(x) < 50 && y > 102 && y < 152);
      if (inJaw) dots.push([x, y, 0.9 + r() * 0.8]);
    }
    return dots;
  })();
  function head(p, t) {
    const F = FACES[p.face] || FACES.calm, FE = p.face2 ? FACES[p.face2] : null, k = p.faceMix || 0;
    const mix = (a) => (FE ? RK.lerp(F[a], FE[a], k) : F[a]);
    const brow = mix("brow"), browY = mix("browY"), eyeS = mix("eye"), pup = mix("pupil"), lid = mix("lid");
    const mouth = FE && k > 0.5 ? FE.mouth : F.mouth;
    const sweat = Math.round(FE && k > 0.5 ? FE.sweat : F.sweat);
    const lookX = p.lookX || 0, lookY = p.lookY || 0, blink = p.blink ? 0.06 : 1;
    const tremble = (p.tremble || 0) * Math.sin(t * 60) * 3;
    let s = `<defs><linearGradient id="heroFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.hair}"/><stop offset=".55" stop-color="${C.hairMid}" stop-opacity=".8"/><stop offset="1" stop-color="${C.stubble}" stop-opacity=".15"/></linearGradient></defs>`;
    s += `<path d="M-46,150 L-42,222 L42,222 L46,150Z" fill="${C.skinSh}" stroke="${INK}" stroke-width="${LW}"/><path d="M-40,196 Q0,214 40,196" stroke="${RK.shade(C.skinSh, -0.15)}" stroke-width="6" fill="none"/>`;
    const ear = (sd) => `<g transform="translate(${sd * 186},28) scale(${sd},1)"><path d="M0,-40 Q34,-46 36,-6 Q36,34 6,46 Q-4,20 0,-40Z" fill="${C.skin}" stroke="${INK}" stroke-width="${LW}"/><path d="M8,-22 Q24,-14 20,10 Q16,22 8,24" fill="none" stroke="${C.skinSh}" stroke-width="5"/></g>`;
    s += ear(-1) + ear(1);
    // หน้าคม: โหนกแก้ม กรามเป็นเหลี่ยม คางแคบ
    const faceD = "M0,-212 C112,-212 190,-148 192,-30 L190,52 Q186,112 152,146 L78,198 Q0,226 -78,198 L-152,146 Q-186,112 -190,52 L-192,-30 C-190,-148 -112,-212 0,-212Z";
    s += `<path d="${faceD}" fill="${C.skin}" stroke="${INK}" stroke-width="${LW}"/>`;
    s += `<path d="M150,-10 Q156,80 132,130 L76,176 Q130,120 140,40Z" fill="${C.skinSh}" opacity=".55"/><path d="M-150,-10 Q-156,80 -132,130 L-76,176 Q-130,120 -140,40Z" fill="${C.skinSh}" opacity=".35"/>`;
    s += `<path d="M-60,190 Q0,206 60,190 Q0,220 -60,190Z" fill="${C.skinSh}" opacity=".5"/>`;
    // หนวดเคราบางๆ
    s += `<path d="M-160,104 Q-150,150 -78,196 Q0,224 78,196 Q150,150 160,104 Q120,150 60,160 Q0,170 -60,160 Q-120,150 -160,104Z" fill="${C.stubble}" opacity=".2"/>`;
    s += `<g fill="${C.stubble}" opacity=".32">` + STUBBLE.map(([x, y, rr]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}"/>`).join("") + `</g>`;
    s += `<path d="M-44,96 Q-22,86 0,92 Q22,86 44,96 Q22,100 0,98 Q-22,100 -44,96Z" fill="${C.hairMid}" opacity=".75"/>`;
    s += `<path d="M-14,164 Q0,174 14,164 Q8,182 0,186 Q-8,182 -14,164Z" fill="${C.hairMid}" opacity=".35"/>`;
    // ตาอัลมอนด์ + เปลือกตาบนหนา
    const eye = (cx, sd) => {
      const w = 34, h = 19 * eyeS * blink, lidCut = lid * h;
      const shape = `M${cx - w},10 Q${f(cx - w * 0.2)},${f(10 - h * 1.5)} ${cx + w},${6 - sd * 2} Q${f(cx + w * 0.2)},${f(10 + h * 1.25)} ${cx - w},10Z`;
      let e = `<path d="${shape}" fill="#FBFAF6" stroke="${INK}" stroke-width="4"/>`;
      if (blink > 0.5) {
        const px = cx + lookX * 14, py = 10 + lookY * 7;
        e += `<clipPath id="ec${sd}"><path d="${shape}"/></clipPath><g clip-path="url(#ec${sd})"><circle cx="${f(px)}" cy="${f(py)}" r="${f(17 * Math.max(pup, 0.55))}" fill="#4A2E22"/><circle cx="${f(px)}" cy="${f(py)}" r="${f(9 * pup)}" fill="#120C0A"/><circle cx="${f(px + 5)}" cy="${f(py - 6)}" r="4.5" fill="#fff"/>`;
        if (lidCut > 0.5) e += `<rect x="${cx - w - 2}" y="${f(10 - h * 1.6)}" width="${2 * w + 4}" height="${f(lidCut * 1.6)}" fill="${C.skinSh}"/>`;
        e += `</g>`;
      }
      e += `<path d="M${cx - w - 4},10 Q${f(cx - w * 0.2)},${f(10 - h * 1.55 + lidCut)} ${cx + w + 4},${4 - sd * 2}" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`;
      e += `<path d="M${f(cx - w * 0.5)},${f(14 + h * 1.3)} Q${cx},${f(18 + h * 1.4)} ${f(cx + w * 0.6)},${f(12 + h * 1.2)}" fill="none" stroke="${C.skinSh}" stroke-width="4"/>`;
      return e;
    };
    s += eye(-76, -1) + eye(76, 1);
    const browG = (cx, sd) => `<g transform="translate(${cx},${f(-52 + browY)}) rotate(${f(sd * brow)})"><path d="M${sd * -46},6 L${sd * -42},-10 L${sd * 30},-14 L${sd * 48},-2 L${sd * 30},2Z" fill="${C.hair}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></g>`;
    s += browG(-76, -1) + browG(76, 1);
    // ไฝ: ใต้หางตาขวาของตัวละคร (= ซ้ายของจอเมื่อหันหน้าเข้ากล้อง)
    s += `<circle cx="-112" cy="62" r="7" fill="#3A2420"/><circle cx="-114" cy="60" r="2.2" fill="#6A4A40"/>`;
    s += `<path d="M6,-6 L14,46 Q4,58 -10,56" fill="none" stroke="${C.skinSh}" stroke-width="6" stroke-linecap="round"/><path d="M-22,54 q6,8 14,2 M14,58 q8,4 14,-4" fill="none" stroke="${RK.shade(C.skinSh, -0.2)}" stroke-width="5" stroke-linecap="round"/>`;
    s += `<g transform="translate(0,${p.talk || mouth === "scream" || mouth === "o" ? 104 : 112})">${mouthPath(p.talk ? "talk" : mouth, t)}</g>`;
    // แว่นทรงเหลี่ยม
    const lens = (cx) => `<rect x="${cx - 64}" y="-30" width="128" height="84" rx="16" fill="rgba(205,230,255,.14)" stroke="${C.glass}" stroke-width="12"/><path d="M${cx - 50},-20 L${cx - 20},-20" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".35"/>`;
    s += lens(-78) + lens(78);
    s += `<path d="M-14,-6 Q0,-16 14,-6" fill="none" stroke="${C.glass}" stroke-width="11"/><path d="M-142,-14 L-190,-20 M142,-14 L190,-20" stroke="${C.glass}" stroke-width="11"/>`;
    if (p.glint) s += `<g stroke="#fff" stroke-linecap="round" opacity="${f(p.glint)}"><path d="M-126,30 L-60,-24" stroke-width="12"/><path d="M-100,44 L-70,20" stroke-width="7"/><path d="M34,30 L98,-22" stroke-width="12"/></g>`;
    // ผม: ข้าง fade แล้วผมด้านบน + เส้นผม
    s += `<path d="M-196,-40 C-198,-110 -176,-150 -150,-168 L-150,-120 Q-166,-80 -172,-20 Q-182,10 -188,30Z" fill="url(#heroFade)"/>`;
    s += `<path d="M196,-40 C198,-110 176,-150 150,-168 L150,-120 Q166,-80 172,-20 Q182,10 188,30Z" fill="url(#heroFade)"/>`;
    const hairD = RK.smooth(HAIR.top) + " L" + HAIR.fringe.map((q) => f(q[0]) + "," + f(q[1])).join(" L") + "Z";
    s += `<path d="${hairD}" fill="${C.hair}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`;
    s += HAIR.strands.map((st, i) => `<path d="${RK.smooth(st)}" fill="none" stroke="${i % 3 ? C.hairMid : C.hairHi}" stroke-width="${i % 3 ? 6 : 8}" stroke-linecap="round" opacity=".9"/>`).join("");
    const drops = [[-178, -40], [170, -20], [-166, 40]].slice(0, sweat);
    s += drops.map(([x, y], i) => { const dy = (t * 40 + i * 30) % 60; return `<path d="M${x},${f(y + dy)} q-12,22 0,30 q12,-8 0,-30Z" fill="#8FD3F5" stroke="${INK}" stroke-width="4" opacity="${f(1 - dy / 70)}"/>`; }).join("");
    return `<g transform="translate(${f(tremble)},0)">${s}</g>`;
  }

  // ---------- มือ (ข้อมือที่ 0,0 มือชี้ลง +y) วาดขอบทุกชิ้นก่อนแล้วเติมสีทับ = ขอบนอกเส้นเดียว ----------
  function hand(type, sd) {
    const th = -sd; // นิ้วโป้งหันเข้าหาลำตัว
    const segs = [];
    const palm = `M-24,-2 Q-31,26 -25,54 Q0,64 25,54 Q31,26 24,-2Z`;
    const fing = (x, L, bend, spread = 0) => {
      const by = 54, mx = x + spread * 0.5, my = by + L * (0.55 - 0.25 * bend);
      const tx = x + spread - bend * x * 0.15, ty = by + L * (1 - 0.75 * bend);
      return `M${f(x)},${by} Q${f(mx)},${f(my + bend * 10)} ${f(tx)},${f(ty)}`;
    };
    let thumb = "";
    switch (type) {
      case "open":
        [[-18, 56, -14], [-6, 64, -5], [6, 62, 5], [18, 50, 14]].forEach(([x, L, sp]) => segs.push([fing(x, L, 0, sp), 12]));
        thumb = `M${th * 22},12 Q${th * 46},28 ${th * 56},50`; break;
      case "fist": case "grip":
        [-18, -6, 6, 18].forEach((x) => segs.push([`M${x},46 Q${x},70 ${x - th * 4},66`, 13]));
        thumb = `M${th * 26},18 Q${th * 18},48 ${-th * 2},54`; break;
      case "point":
        segs.push([fing(-6 * th, 70, 0, 0), 12]);
        [6 * th, -6 * th, -18 * th].forEach((x) => segs.push([`M${x},46 Q${x},68 ${x},64`, 13]));
        thumb = `M${th * 26},18 Q${th * 22},46 ${th * 6},54`; break;
      case "torchF":
        [-18, -6, 6, 18].forEach((x) => segs.push([`M${x},40 Q${x},62 ${x},58`, 13]));
        thumb = `M${th * 28},10 Q${th * 30},36 ${th * 18},48`; break;
      default: // relaxed
        [[-18, 54, 0.32], [-6, 62, 0.26], [6, 60, 0.28], [18, 48, 0.36]].forEach(([x, L, b]) => segs.push([fing(x, L, b, 0), 12]));
        thumb = `M${th * 22},12 Q${th * 34},30 ${th * 28},52`;
    }
    segs.push([thumb, 14]);
    let out = `<path d="${palm}" fill="${INK}" stroke="${INK}" stroke-width="${LW * 2}" stroke-linejoin="round"/>`;
    out += segs.map(([d, w]) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + LW * 2 - 2}" stroke-linecap="round"/>`).join("");
    out += `<path d="${palm}" fill="${C.skin}"/>`;
    out += segs.map(([d, w]) => `<path d="${d}" fill="none" stroke="${C.skin}" stroke-width="${w}" stroke-linecap="round"/>`).join("");
    if (type === "fist" || type === "grip" || type === "torchF") out += [-12, 0, 12].map((x) => `<path d="M${x},${type === "torchF" ? 44 : 52} l0,14" stroke="${C.skinSh}" stroke-width="3"/>`).join("");
    else out += `<path d="M-12,48 l0,10 M0,48 l0,12 M12,48 l0,10" stroke="${C.skinSh}" stroke-width="3" stroke-linecap="round"/><path d="M-14,20 Q0,30 14,20" fill="none" stroke="${C.skinSh}" stroke-width="3" opacity=".6"/>`;
    out += `<path d="M${th * 8},22 Q${th * 14},34 ${th * 6},44" fill="none" stroke="${C.skinSh}" stroke-width="4" opacity=".8"/>`;
    return out;
  }
  function torchSide() {
    return `<g transform="translate(0,46) rotate(-90)"><rect x="-16" y="-20" width="32" height="96" rx="8" fill="#3A3F4A" stroke="${INK}" stroke-width="${LW}"/><path d="M-16,10 L16,10 M-16,24 L16,24 M-16,38 L16,38" stroke="#262A32" stroke-width="4"/><path d="M-24,76 L24,76 L20,112 L-20,112Z" fill="#575E6B" stroke="${INK}" stroke-width="${LW}"/><rect x="-20" y="108" width="40" height="8" fill="#FFF6C8"/></g>`;
  }
  function torchFront() {
    return `<g transform="translate(0,74)"><circle r="34" fill="#575E6B" stroke="${INK}" stroke-width="${LW}"/><circle r="25" fill="#FFF8D8" stroke="#8A8F98" stroke-width="5"/><circle r="13" fill="#FFFFFF"/><path d="M-20,-14 A25,25 0 0 1 8,-26" stroke="#fff" stroke-width="5" fill="none" opacity=".8"/></g>`;
  }
  function limb(len, w, fill, hi) {
    return `<rect x="${f(-w / 2)}" y="${f(-w / 2)}" width="${f(w)}" height="${f(len + w / 2)}" rx="${f(w / 2)}" fill="${fill}" stroke="${INK}" stroke-width="${LW}"/>` + (hi ? `<rect x="${f(-w / 2 + 8)}" y="${f(-w / 2 + 10)}" width="${f(w * 0.22)}" height="${f(Math.max(0, len - 10))}" rx="${f(w * 0.11)}" fill="${hi}" opacity=".5"/>` : "");
  }
  function arm(side, a, e, opts, foreOnly) {
    const sx = side * 146, L1 = 150, L2 = 134 * (opts.fore || 1), sy = opts.sy || 1;
    const ht = opts.hand || "relaxed";
    let handG;
    if (ht === "torchF") handG = hand("torchF", side) + torchFront();
    else if (opts.torch && side === 1) handG = torchSide() + hand("grip", side);
    else handG = hand(ht, side);
    const elbow = "";
    const fore = `<g transform="translate(0,${L1}) rotate(${f(e)})">${limb(L2, 44, C.skin, C.skinHi)}${elbow}<g transform="translate(0,${f(L2 + 4)})">${handG}</g></g>`;
    const upper = limb(L1, 62, C.tee, C.teeHi) + `<path d="M-31,${L1 - 32} L31,${L1 - 32}" stroke="${C.teeSh}" stroke-width="8"/><path d="M-31,${L1 - 26} Q0,${L1 - 18} 31,${L1 - 26}" stroke="${INK}" stroke-width="4" fill="none"/>`;
    return `<g transform="translate(${sx},-430) rotate(${f(a)}) scale(1,${f(sy)})">${foreOnly ? "" : upper}${fore}</g>`;
  }
  function leg(side, a, k, lift = 0) {
    const hx = side * 52, L1 = 125 * (1 - 0.3 * lift), L2 = 115 * (1 - 0.2 * lift), sw = 1 + 0.08 * lift, sh = 1 + 0.18 * lift;
    const shoe = `<path d="M-42,-16 Q-48,22 -12,26 L54,26 Q66,4 42,-18Z" fill="${C.shoe}" stroke="${INK}" stroke-width="${LW}"/><path d="M-30,-6 L30,-8 M-26,4 L28,2" stroke="${C.lace}" stroke-width="4" stroke-linecap="round"/><path d="M40,-14 Q54,4 50,20" fill="none" stroke="${C.shoeSh}" stroke-width="6"/><rect x="-44" y="18" width="104" height="13" rx="6" fill="${C.sole}" stroke="${INK}" stroke-width="5"/>`;
    const shin = `<g transform="translate(0,${f(L1)}) rotate(${f(k)})">${limb(L2, 64 * sw, C.pants, C.pantsHi)}<path d="M${f(-32 * sw)},${f(L2 - 6)} L${f(32 * sw)},${f(L2 - 6)}" stroke="${C.pantsSh}" stroke-width="7"/><g transform="translate(${side * 8},${f(L2 + 6)}) scale(${f(sh)})">${shoe}</g></g>`;
    const knee = lift > 0.15 ? `<ellipse cx="0" cy="${f(L1)}" rx="${f(38 * sw)}" ry="${f(14 + 20 * lift)}" fill="${C.pantsSh}" opacity=".7"/>` : "";
    const crease = `<path d="M${side * 10},20 Q${side * 4},${f(L1 * 0.6)} ${side * 12},${f(L1 - 10)}" fill="none" stroke="${C.pantsSh}" stroke-width="5"/>`;
    return `<g transform="translate(${hx},-245) rotate(${f(a)})">${limb(L1, 72 * sw, C.pants, C.pantsHi)}${crease}${knee}${shin}</g>`;
  }
  function body() {
    let s = "";
    s += `<path d="M-128,-440 Q-150,-340 -122,-218 L122,-218 Q150,-340 128,-440 Q0,-470 -128,-440Z" fill="${C.tee}" stroke="${INK}" stroke-width="${LW}"/>`;
    s += `<path d="M-50,-452 Q0,-414 50,-452" fill="none" stroke="${C.teeSh}" stroke-width="12"/><path d="M-50,-452 Q0,-414 50,-452" fill="none" stroke="${INK}" stroke-width="4"/>`;
    s += `<path d="M-20,-380 q10,30 -4,60 M14,-330 q8,24 -2,46 M-6,-262 q14,10 30,4" fill="none" stroke="${C.teeSh}" stroke-width="5" stroke-linecap="round"/>`;
    s += `<path d="M-122,-226 L122,-226" stroke="${C.teeSh}" stroke-width="8"/>`;
    // ตัวเสื้อกั๊กกว้างคลุมไหล่ ขอบรูแขนทับต้นแขนเสื้อยืด → แขนเสื้ออยู่ใต้เสื้อกั๊กชัดเจน
    const vest = "M-176,-430 Q-178,-380 -160,-338 Q-150,-290 -140,-232 L-30,-226 L-14,-420 Q-40,-452 -78,-460 Q-140,-458 -176,-430Z";
    s += `<path d="${vest}" fill="${C.vest}" stroke="${INK}" stroke-width="${LW}"/><path d="${vest}" transform="scale(-1,1)" fill="${C.vest}" stroke="${INK}" stroke-width="${LW}"/>`;
    s += `<path d="M-78,-458 Q-50,-440 -20,-420 L-36,-404 Q-60,-424 -84,-440Z" fill="${C.vestHi}" stroke="${INK}" stroke-width="4"/><path d="M78,-458 Q50,-440 20,-420 L36,-404 Q60,-424 84,-440Z" fill="${C.vestHi}" stroke="${INK}" stroke-width="4"/>`;
    s += `<path d="M-174,-428 Q-176,-382 -160,-340" fill="none" stroke="${C.vestSh}" stroke-width="10"/><path d="M174,-428 Q176,-382 160,-340" fill="none" stroke="${C.vestSh}" stroke-width="10"/>`;
    s += `<path d="M-128,-300 L-30,-296 M128,-300 L30,-296" stroke="${C.vestSh}" stroke-width="6"/><path d="M-130,-250 L-32,-246 M130,-250 L32,-246" stroke="${C.stitch}" stroke-width="3" stroke-dasharray="8 6"/>`;
    s += `<path d="M-22,-418 L-30,-230" stroke="${C.stitch}" stroke-width="5"/>` + [-400, -370, -340, -310, -280, -250].map((y) => `<path d="M-30,${y} l10,4" stroke="#8A8A86" stroke-width="4"/>`).join("");
    const pocket = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${C.vestSh}" stroke="${INK}" stroke-width="5"/><rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" rx="4" fill="none" stroke="${C.stitch}" stroke-width="3" stroke-dasharray="7 6"/><path d="M${x - 3},${y} L${x + w + 3},${y} L${x + w - 4},${y + 22} L${x + 4},${y + 22}Z" fill="${C.vestHi}" stroke="${INK}" stroke-width="5"/><circle cx="${x + w / 2}" cy="${y + 15}" r="5" fill="${C.stitch}"/><path d="M${x + 8},${y + h - 12} l${w - 16},0" stroke="${C.vest}" stroke-width="3" opacity=".6"/>`;
    s += pocket(-118, -404, 72, 62) + pocket(46, -404, 72, 62) + pocket(-124, -300, 80, 66) + pocket(44, -300, 80, 66);
    s += `<rect x="66" y="-416" width="9" height="30" rx="3" fill="#2F4F8C" stroke="${INK}" stroke-width="3"/><rect x="-112" y="-436" width="34" height="14" rx="3" fill="#D8483B" stroke="${INK}" stroke-width="3"/>`;
    s += `<path d="M96,-232 q8,-22 22,0" fill="none" stroke="#5B5146" stroke-width="7"/>`;
    return s;
  }

  RK.hero = function (p, t) {
    let P = blendPose(p.pose || "idle", p.pose2 || p.pose || "idle", p.poseMix || 0);
    let liftL = 0, liftR = 0, armSyL = 1, armSyR = 1, sway = 0;
    if (p.walk) {
      const ph = t * (p.walkRate || 7.5) + (p.phase || 0), w = p.walk;
      if ((p.walkView || "front") === "front") {
        liftL = Math.max(0, Math.sin(ph)) * w; liftR = Math.max(0, Math.sin(ph + Math.PI)) * w;
        P.lk += liftL * 8; P.rk -= liftR * 8;
        P.bob += -Math.abs(Math.sin(ph)) * 16 * w + 8 * w;
        sway = Math.sin(ph) * 2 * w;
        // แขนแกว่งสวนขา: แขนที่ไปข้างหน้าสั้นลงนิด ศอกงอเข้าหาตัวมากขึ้นนิด (ไม่กางศอกออก)
        const sL = Math.sin(ph + Math.PI), sR = Math.sin(ph);
        armSyL = 1 - 0.12 * Math.max(0, sL) * w; P.le += -8 * Math.max(0, sL) * w; P.la += 2 * sL * w;
        if (!/torch/.test(p.pose || "")) { armSyR = 1 - 0.12 * Math.max(0, sR) * w; P.re += 8 * Math.max(0, sR) * w; P.ra += -2 * sR * w; }
      } else {
        P.ll += Math.sin(ph) * 28 * w; P.rl += Math.sin(ph + Math.PI) * 28 * w;
        P.lk += Math.max(0, Math.sin(ph + 1.6)) * 30 * w; P.rk += Math.max(0, Math.sin(ph + Math.PI + 1.6)) * 30 * w;
        if (!/torch/.test(p.pose || "")) P.ra += Math.sin(ph) * 22 * w;
        P.la += Math.sin(ph + Math.PI) * 22 * w;
        P.bob += Math.abs(Math.sin(ph)) * -14 * w;
      }
    }
    const breathe = Math.sin(t * 2.4) * 4;
    const blink = p.blink ?? ((t * 1.0 + (p.phase || 0)) % 3.7 < 0.11);
    const legs = liftL > liftR ? leg(1, P.rl, P.rk, liftR) + leg(-1, P.ll, P.lk, liftL) : leg(-1, P.ll, P.lk, liftL) + leg(1, P.rl, P.rk, liftR);
    const lo = { hand: p.handL || P.hl, sy: armSyL };
    const ro = { hand: p.handR || P.hr, torch: p.torch && P.hr !== "torchF", sy: armSyR, fore: P.foreR };
    // แขนเสื้อต้องอยู่ใต้เสื้อกั๊กเสมอ: วาดแขนทั้งท่อนก่อนตัว แล้ววาดเฉพาะแขนท่อนล่าง+มือทับ
    const upper = arm(-1, P.la, P.le, lo) + arm(1, P.ra, P.re, ro) + body() + arm(-1, P.la, P.le, lo, true) + arm(1, P.ra, P.re, ro, true);
    const headG = `<g transform="translate(0,${f(-640 + breathe)}) rotate(${f(p.tilt || 0)})">${head({ ...p, blink }, t)}</g>`;
    const flip = (p.facing || 1) < 0 ? "scale(-1,1)" : "";
    const shadow = p.noShadow ? "" : `<ellipse cx="0" cy="8" rx="170" ry="26" fill="#000" opacity=".28"/>`;
    return `<g transform="translate(${f(p.x)},${f(p.y)}) scale(${f(p.s || 1)})">${shadow}<g transform="${flip} translate(0,${f(P.bob)}) rotate(${f(P.lean + sway)})">${legs}<g transform="translate(0,${f(breathe * 0.3)})">${upper}${headG}</g></g></g>`;
  };

  RK.heroTorchTip = function (p) {
    const P = blendPose(p.pose || "idle", p.pose2 || p.pose || "idle", p.poseMix || 0);
    const s = p.s || 1, dir = p.facing || 1, fore = P.foreR || 1;
    const a = (P.ra * Math.PI) / 180, e = ((P.ra + P.re) * Math.PI) / 180;
    let x = 146, y = -430;
    x += -Math.sin(a) * 150; y += Math.cos(a) * 150;
    const L2 = 134 * fore + 4;
    x += -Math.sin(e) * L2; y += Math.cos(e) * L2;
    if (P.hr === "torchF") { x += -Math.sin(e) * 74; y += Math.cos(e) * 74; }
    else { x += -Math.sin(e) * 46 + Math.cos(e) * 112; y += Math.cos(e) * 46 + Math.sin(e) * 112; }
    return [p.x + x * s * dir, p.y + y * s, e];
  };
})(window);
