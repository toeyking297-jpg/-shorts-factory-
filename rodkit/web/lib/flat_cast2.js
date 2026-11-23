// flat_cast2.js — ตัวละครชุดที่ 2 (7 ตัว) + ทรงผม เสื้อผ้า รองเท้า เครื่องประดับ ของในมือ
// ใช้กับ flat_char.js (โหลดหลัง flat_char.js)
(function (G) {
  const RK = G.RK, X = RK._flat, f = X.f, P = X.P, path = X.path, circ = X.circ, line = X.line, taper = X.taper, sh = X.sh;
  const st = (c, w, op = 1, ex = "") => `stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" ${ex}`;
  const PP = (p) => P(p[0], p[1]);

  // ---------- ทีมนักแสดงชุดใหม่ ----------
  RK.FLAT_CAST.prang.gait = { bounce: 1.05, swing: 0.9, strideK: 0.92, lean: 2.5 };
  RK.FLAT_CAST.phum.gait = { bounce: 1.1, swing: 1.05, strideK: 1.0, lean: 3 };
  Object.assign(RK.FLAT_CAST, {
    mali: { gait: { bounce: 0.9, swing: 0.85, strideK: 0.85, lean: 2 }, name: "แม่มะลิ", sex: "f", age: 45, skin: "#E9B994", hair: "#2A1D1A", hairHi: "#4F3A31", style: "bun", pin: "#D9A441",
      top: "#E27D6C", topKind: "floral", print1: "#FFF1D6", print2: "#F6C04E", sleeve: "short", bottom: "#5E4A80", bottomKind: "sarong", band: "#D9A441",
      shoe: "#B07B54", shoeKind: "slipper", lips: "#C5605A", iris: "#2E1E1A", h: 0.95, bodyW: 1.2, belly: 18, glasses: "round", glassesC: "#8A5A3A", chain: true, earring: "#E9C46A" },
    chai: { gait: { bounce: 1.25, swing: 0.8, strideK: 0.88, lean: -1, armFwd: 8 }, name: "พ่อชัย", sex: "m", age: 48, skin: "#D7A079", hair: "#2B2522", hairHi: "#4A403A", style: "baldside", mustache: "thick",
      top: "#4F8A68", topKind: "polo", sleeve: "short", logo: "#F2C14E", bottom: "#2F3A4D", bottomKind: "shorts", belt: true,
      shoe: "#5B3E2B", shoeKind: "slipper", lips: "#A9604F", iris: "#2A1E1A", h: 1.02, bodyW: 1.16, belly: 44, browW: 8 },
    khaohom: { gait: { bounce: 1.7, swing: 1.25, strideK: 0.95, lean: 3, lift: 1.3 }, name: "น้องข้าวหอม", sex: "f", age: 7, skin: "#F6D0AE", hair: "#3A2620", hairHi: "#6A4436", style: "pigtails", ribbon: "#F2668B",
      top: "#FFFFFF", topKind: "uniform", sleeve: "short", tie: "#2E3F6E", bottom: "#2E3F6E", bottomKind: "skirt", tucked: true, sock: "#FFFFFF",
      shoe: "#1E1E24", shoeKind: "school", lips: "#E07A72", iris: "#3A2420", h: 0.6, headK: 1.4, bodyW: 0.9, earring: false, freckles: true, pack: "#F2A33A", browW: 4 },
    boon: { gait: { bounce: 0.35, swing: 0.35, strideK: 0.55, lean: 1, lift: 0.45, crouch: 0.95 }, name: "ยายบุญ", sex: "f", age: 72, skin: "#E2B28C", hair: "#ECE8E1", hairHi: "#FFFFFF", brow: "#B5ADA4", browW: 4, style: "curly",
      top: "#F4ECDD", topKind: "kurachao", print1: "#C9B79C", sleeve: "short", bottom: "#7A3B4E", bottomKind: "sin", band: "#D9A441", band2: "#2E5E4E",
      shoe: "#8C6A50", shoeKind: "slipper", lips: "#B9675F", iris: "#3A2C26", h: 0.86, hunch: 13, bodyW: 1.05, belly: 10, glasses: "thick", glassesC: "#4A4040", earring: "#E9C46A", cane: true },
    te: { gait: { bounce: 1.5, swing: 1.45, strideK: 1.08, lean: 5, armBend: 0.6 }, name: "เต้", sex: "m", age: 28, skin: "#DDA983", hair: "#2A201C", hairHi: "#4C3A30", hairTip: "#E9C46A", style: "spiky",
      top: "#7D8B5A", topKind: "hoodie", sleeve: "full", cuff: "#6A774C", print: "#F2EBDD", bottom: "#3B5C86", bottomKind: "jeans",
      shoe: "#F4F2EE", shoeKind: "sneaker", shoeAcc: "#E4572E", lips: "#B06A5A", iris: "#2A1E1A", h: 1.13, bodyW: 0.86, phones: "#E4572E", browW: 6 },
    jan: { gait: { bounce: 0.75, swing: 0.7, strideK: 0.86, lean: 1.5, armBend: 1.3 }, name: "พี่แจน", sex: "f", age: 35, skin: "#F1C6A2", hair: "#1C1414", hairHi: "#463434", style: "bob",
      top: "#2B2F3A", topKind: "blazer", inner: "#F4EFE6", sleeve: "full", cuff: "#252833", shirtCuff: "#F4EFE6", bottom: "#2B2F3A", bottomKind: "pencil",
      shoe: "#B8333A", shoeKind: "heels", lips: "#B82E3A", lipstick: "#C2303A", iris: "#2A1A1A", h: 1.03, earring: "#F7F2E8", lanyard: "#C2303A", browW: 5 },
    ton: { gait: { bounce: 0.9, swing: 0.85, strideK: 0.92, lean: 1.5 }, name: "ต้น", sex: "m", age: 29, skin: "#EBBE96", hair: "#4A2E22", hairHi: "#7A5040", style: "comma",
      top: "#D9A441", topKind: "tee", sleeve: "short", print: "#FFFFFF", bottom: "#2F3B5C", bottomKind: "chino", shoe: "#F4F1EA", shoeKind: "sneaker", shoeAcc: "#3E6FB0",
      lips: "#B06A5A", iris: "#2A1E1A", h: 1.1, glasses: "square", glassesC: "#2B2230", browW: 6 },
    fdad: { gait: { bounce: 0.8, swing: 0.7, strideK: 0.85, lean: 0 }, name: "พ่อของฟ้า", sex: "m", age: 57, skin: "#D9A57E", hair: "#8E8A86", hairHi: "#B9B4AE", style: "comma",
      top: "#2F4A6E", topKind: "polo", sleeve: "short", logo: "#E9C46A", bottom: "#A08A6A", bottomKind: "chino", belt: true,
      shoe: "#5B3E2B", shoeKind: "slipper", lips: "#A9604F", iris: "#2A1E1A", h: 1.03, bodyW: 1.1, belly: 22, glasses: "square", glassesC: "#3A3A40", browW: 8 },
    fmom: { gait: { bounce: 0.9, swing: 0.9, strideK: 0.85, lean: 1 }, name: "แม่ของฟ้า", sex: "f", age: 54, skin: "#E8B591", hair: "#3A2A24", hairHi: "#7A6A62", style: "bob",
      top: "#8E5BA6", topKind: "blouse", sleeve: "short", bottom: "#3F3A55", bottomKind: "wide",
      shoe: "#C9A77C", shoeKind: "slipper", lips: "#B5524F", iris: "#2A1E1A", h: 0.94, bodyW: 1.12, belly: 16, earring: "#E9C46A", browW: 7 },
    fsis: { gait: { bounce: 1.4, swing: 1.1, strideK: 0.95, lean: 2 }, name: "มิ้นท์", sex: "f", age: 20, skin: "#F3C9A8", hair: "#2B1C17", hairHi: "#5A3A2E", style: "bun", pin: "#F2668B",
      top: "#F2668B", topKind: "hoodie", sleeve: "long", bottom: "#3E5C8A", bottomKind: "wide",
      shoe: "#F4F1EA", shoeKind: "sneaker", shoeAcc: "#F2668B", lips: "#D46A63", iris: "#2A1E1A", h: 0.97, browW: 6 },
    piak: { gait: { bounce: 1.1, swing: 1.0, strideK: 0.9, lean: 2 }, name: "ลุงเปี๊ยก", sex: "m", age: 55, skin: "#C48A5E", hair: "#4A4442", hairHi: "#6E6662", style: "towel", towel: "#3F9BC4", mustache: "thin",
      top: "#F1EFEA", topKind: "tank", sleeve: "none", apron: "#C8553D", bottom: "#4E5A3E", bottomKind: "shorts",
      shoe: "#2E6FB0", shoeKind: "slipper", lips: "#9E5B48", iris: "#2A1E1A", h: 1.0, bodyW: 1.08, belly: 24, browW: 8 },
    jaew: { gait: { bounce: 1.2, swing: 1.1, strideK: 0.85, lean: 2 }, name: "ป้าแจ๋ว", sex: "f", age: 52, skin: "#D9A27C", hair: "#3A2A24", hairHi: "#5E463A", style: "curly",
      top: "#E8457A", topKind: "floral", print1: "#FFD84A", print2: "#FFFFFF", sleeve: "short", apron: "#2F8F4F", bottom: "#2E3F6E", bottomKind: "sarong", band: "#F2C14E",
      shoe: "#E4572E", shoeKind: "slipper", lips: "#C2303A", lipstick: "#C2303A", iris: "#2A1E1A", h: 0.93, bodyW: 1.22, belly: 30, earring: "#E9C46A", chain: true, browW: 7 },
    yai: { gait: { bounce: 0.4, swing: 0.4, strideK: 0.6, lean: 1, lift: 0.5, crouch: 0.95 }, name: "ยายศรี", sex: "f", age: 74, skin: "#D8A884", hair: "#B9B4AE", hairHi: "#E2DED8", style: "bun", pin: "#2E5E4E",
      top: "#4F79A8", topKind: "blouse", sleeve: "short", apron: "#C9A27A", bottom: "#5A3E2E", bottomKind: "sarong", band: "#D9A441",
      shoe: "#6B4A33", shoeKind: "slipper", lips: "#A9604F", iris: "#3A2C26", h: 0.85, hunch: 9, bodyW: 1.0, belly: 8, glasses: "round", glassesC: "#2B2230", earring: "#E9C46A", browW: 5 },
  });
  RK.FLAT_ARM.cane = { n: [14, 4], f: [6, 16] };
  RK.FLAT_ARM.tablet = { n: [12, 100], f: [8, 92] };
  RK.FLAT_ARM.hips = { n: [-18, 70], f: [-14, 70] };

  // =====================================================================
  // ทรงผม  (side = หันขวา, front = หันหน้า) คืนค่า { back, front }
  // =====================================================================
  const HAIR = (RK.FLAT_HAIR = RK.FLAT_HAIR || {});
  const hiL = (d, C, w = 8, op = 0.65) => path(d, "none", st(C.hairHi, w, op));
  const shL = (d, C, w = 4, op = 0.6) => path(d, "none", st(sh(C.hair, -0.35), w, op));

  // ผมมวย + ปิ่น (แม่มะลิ)
  const pinSvg = (C, x, y, a) => `<g transform="translate(${x},${y}) rotate(${a})">` + line([0, 0], [96, 0], 6, C.pin) + circ(0, 0, 9, "#C8453A") + [0, 72, 144, 216, 288].map((k) => `<ellipse cx="0" cy="-11" rx="6" ry="9" fill="#E46F5B" transform="rotate(${k})"/>`).join("") + circ(0, 0, 4, "#F6D36B") + line([24, 2], [30, 26], 2, C.pin) + circ(30, 30, 4, C.pin) + `</g>`;
  HAIR.bun = {
    side: (C) => {
      const h = C.hair;
      const front = path(`M 94,-40 C 86,-92 30,-118 -26,-110 C -78,-100 -102,-50 -92,0 C -88,22 -76,38 -60,46 C -54,24 -46,6 -32,-6 C -20,-18 0,-30 30,-36 C 56,-42 78,-42 94,-40 Z`, h) +
        hiL(`M 84,-62 C 50,-92 -10,-100 -64,-72`, C, 7) + hiL(`M 90,-48 C 50,-72 0,-76 -56,-52`, C, 4, 0.45) + shL(`M 70,-42 C 30,-50 -10,-40 -40,-14`, C, 3) +
        circ(-84, -66, 42, h) + path(`M -84,-66 m -26,0 a 26,26 0 1,0 26,-26 a 18,18 0 1,0 18,18`, "none", st(C.hairHi, 5, 0.6)) + shL(`M -112,-50 C -100,-30 -80,-26 -60,-36`, C, 4, 0.7) +
        pinSvg(C, -128, -104, 38) + path(`M -60,40 C -66,52 -64,60 -58,66`, "none", st(h, 3, 0.8));
      return { back: "", front };
    },
    front: (C) => {
      const h = C.hair;
      const back = circ(0, -118, 40, h) + path(`M -22,-118 a 22,22 0 1,1 22,22`, "none", st(C.hairHi, 5, 0.6)) + pinSvg(C, -70, -150, 22);
      const front = path(`M -86,0 C -100,-96 100,-96 86,0 C 82,-24 70,-44 40,-52 C 24,-56 10,-58 0,-52 C -10,-58 -24,-56 -40,-52 C -70,-44 -82,-24 -86,0 Z`, h) +
        hiL(`M -60,-74 C -30,-90 30,-90 60,-74`, C, 8) + shL(`M 0,-52 L 0,-88`, C, 3, 0.7) + hiL(`M -76,-30 C -70,-56 -40,-70 -12,-74`, C, 4, 0.4) + hiL(`M 76,-30 C 70,-56 40,-70 12,-74`, C, 4, 0.4);
      return { back, front };
    },
  };

  // หัวล้านกลาง ผมข้าง (พ่อชัย)
  HAIR.baldside = {
    side: (C) => {
      const h = C.hair;
      const front = path(`M 40,-44 C 20,-58 -10,-64 -36,-62 C -70,-58 -94,-34 -92,2 C -90,24 -80,40 -66,48 C -60,30 -50,16 -36,6 C -28,-2 -22,-10 -18,-22 C -4,-34 18,-40 40,-44 Z`, h) +
        shL(`M 30,-46 C 6,-54 -30,-56 -60,-44`, C, 3, 0.5) + hiL(`M -40,-50 C -60,-40 -76,-20 -80,4`, C, 4, 0.5) +
        path(`M -40,-80 C -10,-96 30,-98 66,-86`, "none", st(h, 2.5, 0.8)) + path(`M -30,-88 C 0,-102 36,-102 62,-94`, "none", st(h, 2, 0.7)) +
        `<ellipse cx="22" cy="-92" rx="44" ry="12" fill="#FFFFFF" opacity=".28" transform="rotate(-8 22 -92)"/>`;
      return { back: "", front };
    },
    front: (C) => {
      const h = C.hair, tuft = (sd) => path(`M ${sd * 86},14 C ${sd * 98},-18 ${sd * 94},-50 ${sd * 76},-66 C ${sd * 70},-50 ${sd * 66},-28 ${sd * 66},-4 C ${sd * 72},4 ${sd * 80},10 ${sd * 86},14 Z`, h) + path(`M ${sd * 80},-50 C ${sd * 86},-30 ${sd * 86},-10 ${sd * 82},8`, "none", st(C.hairHi, 3, 0.5));
      const front = tuft(-1) + tuft(1) + path(`M -50,-84 C -20,-98 20,-98 52,-84`, "none", st(h, 2.5, 0.85)) + path(`M -40,-90 C -10,-104 24,-102 46,-92`, "none", st(h, 2, 0.7)) + path(`M -30,-80 Q 0,-90 30,-80`, "none", st(h, 2, 0.6)) +
        `<ellipse cx="-14" cy="-80" rx="38" ry="10" fill="#FFFFFF" opacity=".25"/>`;
      return { back: "", front };
    },
  };

  // แกละสองข้าง + โบ (น้องข้าวหอม)
  const bow = (C, x, y, a) => `<g transform="translate(${x},${y}) rotate(${a})">` + path(`M 0,0 L -26,-16 C -32,-4 -32,6 -26,16 Z`, C.ribbon) + path(`M 0,0 L 26,-16 C 32,-4 32,6 26,16 Z`, C.ribbon) + path(`M -22,-10 L -8,-2 M 22,-10 L 8,-2`, "none", st(sh(C.ribbon, -0.2), 2.5)) + circ(0, 0, 8, sh(C.ribbon, -0.12)) + circ(-2, -2, 3, "#fff", 'opacity=".6"') + `</g>`;
  HAIR.pigtails = {
    side: (C, sway) => {
      const h = C.hair, s = sway * 12;
      const tail = (dx, dy, col) => path(`M ${-54 + dx},${-62 + dy} C ${-112 + dx},${-50 + dy} ${-130 + dx + s * 0.5},${10 + dy} ${-120 + dx + s},${84 + dy} C ${-114 + dx + s},${114 + dy} ${-98 + dx + s},${124 + dy} ${-88 + dx + s},${112 + dy} C ${-98 + dx + s * 0.6},${70 + dy} ${-96 + dx},${10 + dy} ${-50 + dx},${-40 + dy} Z`, col);
      const back = tail(18, -10, sh(h, -0.2)) + bow(C, -40, -78, -20);
      const front = path(`M 104,-22 L 104,-40 C 98,-100 30,-126 -30,-118 C -84,-104 -104,-44 -92,8 C -86,26 -74,34 -62,34 C -56,14 -46,-2 -32,-12 C -16,-22 10,-24 40,-24 L 104,-22 Z`, h) +
        path(`M 46,-24 L 52,-16 L 60,-24 L 68,-15 L 76,-24 L 84,-16 L 92,-24 L 100,-17 L 104,-22`, h) +
        hiL(`M -60,-90 C -20,-114 40,-112 84,-80`, C, 8) + shL(`M 30,-40 C 50,-46 80,-44 100,-30`, C, 3) +
        tail(0, 0, h) + path(`M ${-104 + s * 0.5},0 C ${-112 + s},40 ${-110 + s},80 ${-100 + s},106`, "none", st(C.hairHi, 4, 0.5)) + bow(C, -58, -62, -10);
      return { back, front };
    },
    front: (C, sway) => {
      const h = C.hair, s = sway * 10;
      const tail = (sd) => path(`M ${sd * 88},-56 C ${sd * 140},-48 ${sd * 160},14 ${sd * 150 + s},88 C ${sd * 142 + s},112 ${sd * 122 + s},110 ${sd * 118 + s},96 C ${sd * 128},44 ${sd * 118},-6 ${sd * 88},-30 Z`, h) + path(`M ${sd * 126},-20 C ${sd * 140},20 ${sd * 140},60 ${sd * 134 + s},90`, "none", st(C.hairHi, 4, 0.5));
      const back = tail(-1) + tail(1);
      const front = path(`M -90,8 C -102,-92 102,-92 90,8 C 88,-6 84,-16 78,-22 L -78,-22 C -84,-16 -88,-6 -90,8 Z`, h) +
        path(`M -78,-22 ${[...Array(13)].map((_, i) => `L ${-72 + i * 12},${i % 2 ? -14 : -22}`).join(" ")} L 78,-22 Z`, h) +
        path(`M -88,0 C -92,20 -90,40 -84,52 L -78,52 C -82,30 -82,10 -78,-10 Z M 88,0 C 92,20 90,40 84,52 L 78,52 C 82,30 82,10 78,-10 Z`, h) +
        hiL(`M -60,-70 C -20,-88 20,-88 60,-70`, C, 9) + shL(`M -40,-30 L -36,-20 M -10,-30 L -8,-18 M 20,-30 L 22,-18 M 50,-30 L 52,-20`, C, 2.5, 0.5) +
        bow(C, -86, -56, -30) + bow(C, 86, -56, 30);
      return { back, front };
    },
  };

  // ผมหยิกสั้นสีขาว (ยายบุญ)
  const curls = (C, pts) => pts.map(([x, y, r]) => circ(x + 2, y + 3, r, sh(C.hair, -0.18))).join("") + pts.map(([x, y, r]) => circ(x, y, r, C.hair) + path(`M ${x - r * 0.5},${y - r * 0.2} A ${r * 0.55},${r * 0.55} 0 0 1 ${x + r * 0.35},${y - r * 0.45}`, "none", st(C.hairHi, 3, 0.8)) + path(`M ${x - r * 0.2},${y + r * 0.3} a ${r * 0.3},${r * 0.3} 0 1 0 ${r * 0.4},0`, "none", st(sh(C.hair, -0.25), 2, 0.6))).join("");
  HAIR.curly = {
    side: (C) => {
      const front = path(`M 96,-36 C 90,-96 20,-120 -40,-108 C -90,-92 -104,-30 -90,14 C -80,30 -60,30 -50,20 C -40,0 -30,-14 -10,-22 C 30,-34 70,-36 96,-36 Z`, C.hair) +
        curls(C, [[90, -48, 17], [80, -78, 21], [56, -100, 23], [26, -112, 23], [-6, -116, 23], [-38, -108, 23], [-66, -92, 23], [-88, -64, 21], [-98, -32, 19], [-94, 0, 17], [-80, 22, 15], [30, -80, 18], [-10, -84, 18], [-48, -70, 18], [-70, -40, 16], [64, -66, 16]]);
      return { back: "", front };
    },
    front: (C) => {
      const front = path(`M -86,-10 C -100,-100 100,-100 86,-10 C 70,-40 40,-56 0,-56 C -40,-56 -70,-40 -86,-10 Z`, C.hair) +
        curls(C, [[-90, 14, 15], [-92, -14, 18], [-84, -44, 20], [-64, -70, 22], [-36, -88, 23], [-4, -94, 23], [28, -90, 23], [58, -74, 22], [80, -48, 20], [92, -18, 18], [90, 12, 15], [-40, -60, 16], [-6, -66, 16], [30, -62, 16], [-70, -24, 14], [70, -26, 14]]);
      return { back: "", front };
    },
  };

  // ผมตั้งชี้ ทำสีปลาย (เต้)
  function spikes(C, tips, base) {
    let d = `M ${base[0][0]},${base[0][1]}`;
    for (const t of tips) d += ` L ${t[0]},${t[1]} L ${t[2]},${t[3]}`;
    for (const b of base.slice(1)) d += ` L ${b[0]},${b[1]}`;
    let s = path(d + " Z", C.hair);
    let prev = base[0];
    for (const t of tips) { // ปลายสีทอง
      const tip = [t[0], t[1]], v2 = [t[2], t[3]], k = 0.38;
      s += path(`M ${P(tip[0] + (prev[0] - tip[0]) * k, tip[1] + (prev[1] - tip[1]) * k)} L ${P(...tip)} L ${P(tip[0] + (v2[0] - tip[0]) * k, tip[1] + (v2[1] - tip[1]) * k)} Z`, C.hairTip);
      prev = v2;
    }
    return s;
  }
  HAIR.spiky = {
    side: (C) => {
      const base = path(`M 98,-40 C 96,-90 40,-118 -20,-114 C -76,-104 -100,-56 -94,-4 C -88,20 -74,34 -62,40 C -58,18 -48,0 -34,-10 C -10,-26 40,-34 98,-40 Z`, C.hair);
      const sp = spikes(C, [[132, -66, 96, -78], [118, -118, 70, -104], [72, -152, 34, -118], [22, -164, -6, -122], [-34, -158, -50, -110], [-86, -134, -84, -78], [-118, -78, -96, -40]], [[100, -46], [-94, -20], [-60, -70], [20, -90], [80, -70]]);
      const front = base + sp + shL(`M -60,-40 C -40,-60 0,-70 40,-66`, C, 3, 0.5) + hiL(`M 20,-110 C 40,-112 70,-100 90,-80`, C, 5, 0.5) +
        path(`M -58,-4 C -52,-20 -40,-30 -26,-34 L -24,-24 C -36,-20 -46,-10 -50,6 Z`, sh(C.hair, 0.25), 'opacity=".55"');
      return { back: "", front };
    },
    front: (C) => {
      const base = path(`M -86,-4 C -100,-90 100,-90 86,-4 C 82,-26 66,-44 40,-50 C 20,-54 -20,-54 -40,-50 C -66,-44 -82,-26 -86,-4 Z`, C.hair);
      const sp = spikes(C, [[-112, -70, -78, -84], [-96, -130, -50, -106], [-50, -160, -16, -116], [6, -170, 26, -118], [56, -158, 62, -106], [100, -126, 82, -80], [114, -64, 90, -40]], [[-90, -30], [90, -40], [40, -60], [-40, -60]]);
      const bang = path(`M 6,-56 L 30,-24 L 34,-52 L 56,-30 L 54,-58 Z`, C.hair) + path(`M 26,-30 L 30,-24 L 31,-32 Z M 52,-36 L 56,-30 L 55,-38 Z`, C.hairTip);
      return { back: "", front: base + sp + bang + shL(`M -70,-30 C -50,-50 -20,-56 10,-56`, C, 3, 0.45) };
    },
  };

  // บ็อบตรงคม (พี่แจน)
  HAIR.bob = {
    side: (C) => {
      const h = C.hair;
      const front = path(`M 98,-24 C 104,-80 40,-124 -30,-118 C -94,-104 -112,-40 -106,30 C -104,56 -98,74 -90,84 C -50,86 -10,90 30,100 C 26,80 20,50 16,20 C 14,0 20,-20 40,-34 C 60,-44 80,-40 98,-24 Z`, h) +
        path(`M -96,70 C -50,74 -10,80 26,92 L 30,100 C -10,90 -50,86 -90,84 Z`, sh(h, -0.25)) +
        hiL(`M -70,-86 C -30,-110 30,-108 76,-72`, C, 9) + hiL(`M -96,-20 C -98,20 -96,50 -88,70`, C, 4, 0.4) +
        shL(`M 40,-34 C 30,-10 24,30 26,80`, C, 3, 0.6) + shL(`M -20,-90 C 10,-60 60,-40 96,-28`, C, 3, 0.5);
      return { back: "", front };
    },
    front: (C) => {
      const h = C.hair;
      const back = path(`M -100,0 C -104,40 -104,70 -98,96 L 98,96 C 104,70 104,40 100,0 Z`, sh(h, -0.25));
      const front = path(`M -96,10 C -110,-96 110,-96 96,10 C 98,40 100,70 96,94 L 62,98 C 68,70 72,30 66,-6 C 52,-38 18,-54 -24,-50 C -52,-42 -66,-20 -66,10 C -66,40 -64,70 -62,98 L -96,94 C -100,70 -98,40 -96,10 Z`, h) +
        hiL(`M -50,-58 C -20,-72 30,-72 56,-56`, C, 8) + shL(`M -24,-50 C 10,-50 50,-34 66,-6`, C, 3, 0.6) + shL(`M -66,10 L -64,90 M 66,0 L 64,90`, C, 2.5, 0.4) +
        hiL(`M 80,0 C 84,40 84,70 80,90`, C, 4, 0.35) + hiL(`M -80,0 C -84,40 -84,70 -80,90`, C, 4, 0.35);
      return { back, front };
    },
  };

  // ผ้าขนหนูคาดหัว + ผมเกรียนสีดอกเลา (ลุงเปี๊ยก)
  const towelStripes = (C, d1, d2) => path(d1, "none", st("#FFFFFF", 4, 0.75)) + path(d2, "none", st(sh(C.towel, -0.25), 3, 0.7));
  HAIR.towel = {
    side: (C, sway) => {
      const s = sway * 10, h = C.hair;
      const cap = path(`M 96,-40 C 90,-96 20,-118 -40,-108 C -92,-92 -102,-30 -88,16 C -80,30 -66,34 -58,26 C -50,6 -36,-10 -16,-22 C 20,-34 60,-40 96,-40 Z`, h) +
        [...Array(26)].map((_, i) => circ(-70 + (i * 37) % 150, -96 + ((i * 53) % 80), 2.2, "#9A928E", 'opacity=".7"')).join("");
      const band = path(`M 104,-66 C 60,-78 -40,-80 -100,-54 L -98,-16 C -40,-42 60,-38 106,-30 Z`, C.towel) +
        towelStripes(C, `M 104,-56 C 60,-66 -40,-68 -99,-44`, `M 105,-38 C 60,-46 -40,-50 -98,-24`) +
        circ(-104, -34, 18, sh(C.towel, -0.1)) + path(`M -110,-30 C ${-130 + s},-10 ${-138 + s * 1.3},20 ${-132 + s * 1.5},50 L ${-112 + s * 1.5},48 C ${-114 + s},20 -110,0 -100,-24 Z`, C.towel) +
        path(`M -104,-28 C ${-112 + s},0 ${-112 + s * 1.2},30 ${-100 + s * 1.4},56 L ${-84 + s * 1.4},50 C ${-92 + s},26 -94,0 -92,-24 Z`, sh(C.towel, -0.12)) +
        path(`M ${-132 + s * 1.5},50 L ${-112 + s * 1.5},48 M ${-100 + s * 1.4},56 L ${-84 + s * 1.4},50`, "none", st("#FFFFFF", 3, 0.6, 'stroke-dasharray="3 3"'));
      return { back: "", front: cap + band };
    },
    front: (C) => {
      const cap = path(`M -86,-50 C -92,-102 92,-102 86,-50 Z`, C.hair) + [...Array(20)].map((_, i) => circ(-66 + (i * 29) % 132, -88 + ((i * 17) % 34), 2.2, "#9A928E", 'opacity=".7"')).join("");
      const band = path(`M -94,-62 C -40,-78 40,-78 94,-62 L 94,-26 C 40,-42 -40,-42 -94,-26 Z`, C.towel) +
        towelStripes(C, `M -94,-52 C -40,-66 40,-66 94,-52`, `M -94,-34 C -40,-48 40,-48 94,-34`) +
        path(`M -86,-26 L -88,6 L -80,4 L -78,-24 Z M 86,-26 L 88,6 L 80,4 L 78,-24 Z`, C.hair);
      return { back: "", front: cap + band };
    },
  };

  // =====================================================================
  // เครื่องประดับบนหัว: แว่น สายคล้องแว่น หนวด ริ้วรอย ลิปสติก กระ
  // =====================================================================
  RK.flatHeadAcc = function (C, o, view) {
    let s = "";
    const age = C.age || 25, sk = C.skin, wr = sh(sk, -0.24);
    if (view === "side") {
      if (age >= 40) s += path(`M 84,34 C 78,42 76,50 80,58`, "none", st(wr, 2.5, 0.55));
      if (age >= 52) s += path(`M 44,-4 L 34,-8 M 44,2 L 33,2 M 44,8 L 35,12`, "none", st(wr, 2.2, 0.6)) + path(`M 74,-48 C 82,-50 90,-48 96,-46`, "none", st(wr, 2, 0.4));
      if (age >= 68) s += path(`M 72,-58 C 82,-60 90,-58 96,-56 M 50,14 C 58,20 68,20 74,16`, "none", st(wr, 2.2, 0.5)) + path(`M 30,80 C 20,96 10,108 2,116`, "none", st(wr, 2.5, 0.4));
      if (C.freckles) s += [[48, 30], [56, 26], [60, 34], [44, 36]].map(([x, y]) => circ(x, y, 2.2, "#C98A64", 'opacity=".7"')).join("");
      if (C.mustache) s += C.mustache === "thick" ? path(`M 106,36 C 100,48 82,48 70,42 C 74,34 92,30 106,36 Z`, C.hair) + path(`M 100,40 L 80,42`, "none", st(C.hairHi, 2, 0.5)) : path(`M 104,38 C 96,44 84,44 76,42`, "none", st(C.hair, 5));
      if (C.lipstick && (o.talk || 0) < 0.08) s += path(`M 80,50 C 86,46 92,46 97,50 C 94,56 86,58 80,54 Z`, C.lipstick);
      if (C.glasses) {
        const g = C.glassesC, w = C.glasses === "thick" ? 6 : 4;
        s += path(`M 72,-16 C 80,-18 84,-6 84,4 C 84,16 78,20 72,18`, "none", st(g, w)) + `<ellipse cx="78" cy="1" rx="5" ry="17" fill="#E8F4F8" opacity=".25"/>` + line([72, -10], [-8, -2], w - 1, g);
        if (C.chain) s += path(`M -8,0 C -24,50 -20,110 0,160`, "none", st("#D9A441", 2.5, 0.9, 'stroke-dasharray="2 5"'));
      }
      return s;
    }
    // front
    if (age >= 40) s += path(`M -22,40 C -28,48 -28,56 -24,62 M 22,40 C 28,48 28,56 24,62`, "none", st(wr, 2.5, 0.5));
    if (age >= 52) s += path(`M -54,-2 L -62,-6 M -54,6 L -63,6 M -54,12 L -61,16 M 54,-2 L 62,-6 M 54,6 L 63,6 M 54,12 L 61,16`, "none", st(wr, 2.2, 0.55)) + path(`M -30,-48 Q 0,-54 30,-48`, "none", st(wr, 2, 0.35));
    if (age >= 68) s += path(`M -34,-58 Q 0,-64 34,-58 M -44,22 Q -34,28 -24,22 M 44,22 Q 34,28 24,22`, "none", st(wr, 2.2, 0.45));
    if (C.freckles) s += [[-50, 30], [-42, 26], [-38, 34], [-56, 36], [50, 30], [42, 26], [38, 34], [56, 36]].map(([x, y]) => circ(x, y, 2.2, "#C98A64", 'opacity=".7"')).join("");
    if (C.mustache) s += C.mustache === "thick" ? path(`M -34,46 C -24,36 -8,38 0,42 C 8,38 24,36 34,46 C 26,54 10,52 0,48 C -10,52 -26,54 -34,46 Z`, C.hair) + path(`M -24,44 Q -12,40 -2,44 M 24,44 Q 12,40 2,44`, "none", st(C.hairHi, 2, 0.5)) : path(`M -26,46 Q -12,40 0,43 Q 12,40 26,46`, "none", st(C.hair, 5));
    if (C.lipstick && (o.talk || 0) < 0.08) s += path(`M -16,57 C -8,52 -3,55 0,56 C 3,55 8,52 16,57 C 10,66 -10,66 -16,57 Z`, C.lipstick) + path(`M -14,57 Q 0,60 14,57`, "none", st(sh(C.lipstick, -0.3), 2)) + `<ellipse cx="-4" cy="62" rx="5" ry="1.8" fill="#fff" opacity=".45"/>`;
    if (C.glasses) {
      const g = C.glassesC, w = C.glasses === "thick" ? 6 : 4, r = C.glasses === "thick" ? 24 : 21;
      const lens = (x) => C.glasses === "thick" ? `<rect x="${x - r}" y="${4 - r * 0.8}" width="${r * 2}" height="${r * 1.6}" rx="10" fill="#E8F4F8" fill-opacity=".22" stroke="${g}" stroke-width="${w}"/>` : `<circle cx="${x}" cy="4" r="${r}" fill="#E8F4F8" fill-opacity=".22" stroke="${g}" stroke-width="${w}"/>`;
      s += lens(-34) + lens(34) + path(`M -12,2 Q 0,-6 12,2`, "none", st(g, w - 1)) + line([-34 - r, 0], [-82, -4], w - 1, g) + line([34 + r, 0], [82, -4], w - 1, g);
      s += path(`M -46,-6 L -38,-14 M 22,-6 L 30,-14`, "none", st("#FFFFFF", 3, 0.7));
      if (C.chain) s += path(`M -82,0 C -86,60 -60,140 0,170 C 60,140 86,60 82,0`, "none", st("#D9A441", 2.5, 0.9, 'stroke-dasharray="2 5"'));
    }
    return s;
  };

  // =====================================================================
  // เสื้อ: รายละเอียดทับลำตัว
  // =====================================================================
  const TOP = (RK.FLAT_TOP = RK.FLAT_TOP || {});
  const clipT = (ctx, inner) => { const id = `cl_${ctx.A.who}_${ctx.view}`; return `<clipPath id="${id}"><path d="${ctx.tpD}"/></clipPath><g clip-path="url(#${id})">${inner}</g>`; };
  const flower = (x, y, r, c1, c2) => [0, 72, 144, 216, 288].map((a) => `<circle cx="${f(x + Math.sin(a * Math.PI / 180) * r)}" cy="${f(y - Math.cos(a * Math.PI / 180) * r)}" r="${f(r * 0.72)}" fill="${c1}"/>`).join("") + circ(x, y, r * 0.55, c2) + path(`M ${x + r * 1.2},${y + r * 1.2} q 8,-2 12,-10`, "none", st("#6F9C6A", 2.5, 0.8));
  function floral(C, pts) { let s = ""; pts.forEach(([x, y], i) => { s += flower(x, y, 9 + (i % 3) * 2, i % 2 ? C.print1 : C.print2, i % 2 ? C.print2 : "#C8453A"); s += circ(x + 22, y + 18, 3, C.print1, 'opacity=".8"'); }); return s; }
  TOP.floral = {
    side: (C, T, ctx) => {
      const pts = []; for (let y = -280; y < 10; y += 48) for (let x = -60; x < 80; x += 44) pts.push(T(x + ((y / 48) % 2) * 20, y));
      return clipT(ctx, floral(C, pts)) + path(`M ${PP(T(-26, -300))} Q ${PP(T(6, -282))} ${PP(T(34, -296))}`, "none", st(sh(C.top, -0.25), 6)) + path(`M ${PP(T(-56, -6))} Q ${PP(T(0, 4))} ${PP(T(56, -6))}`, "none", st(sh(C.top, -0.15), 4, 0.6));
    },
    front: (C, ctx) => {
      const { S, H } = ctx, pts = []; for (let y = S[1]; y < H[1] + 20; y += 46) for (let x = -100; x < 110; x += 46) pts.push([x + ((Math.round((y - S[1]) / 46)) % 2) * 22, y + 10]);
      return clipT(ctx, floral(C, pts)) + path(`M -36,${f(S[1] - 4)} Q 0,${f(S[1] + 40)} 36,${f(S[1] - 4)}`, "none", st(sh(C.top, -0.25), 7)) + path(`M -30,${f(S[1] - 2)} Q 0,${f(S[1] + 32)} 30,${f(S[1] - 2)} Z`, sh(C.skin, -0.04));
    },
  };
  TOP.polo = {
    side: (C, T) => {
      const c = sh(C.top, -0.16);
      return path(`M ${PP(T(-30, -304))} C ${PP(T(0, -316))} ${PP(T(30, -312))} ${PP(T(46, -300))} L ${PP(T(40, -274))} C ${PP(T(24, -286))} ${PP(T(4, -292))} ${PP(T(-24, -288))} Z`, sh(C.top, 0.08)) +
        path(`M ${PP(T(-30, -304))} C ${PP(T(0, -316))} ${PP(T(30, -312))} ${PP(T(46, -300))}`, "none", st(c, 3)) +
        path(`M ${PP(T(36, -292))} L ${PP(T(40, -232))}`, "none", st(c, 3)) + circ(...T(40, -270), 4, "#F2EFE6") + circ(...T(41, -248), 4, "#F2EFE6") +
        `<g transform="translate(${PP(T(30, -214))})">${circ(0, 0, 9, C.logo)}${path("M -5,2 L 0,-5 L 5,2", "none", st(C.top, 2.5))}</g>` +
        path(`M ${PP(T(-56, -20))} Q ${PP(T(0, -10))} ${PP(T(56, -20))}`, "none", st(c, 4, 0.5));
    },
    front: (C, ctx) => {
      const { S, H } = ctx, c = sh(C.top, -0.16), y = S[1];
      return path(`M -40,${f(y - 8)} L -6,${f(y + 30)} L -14,${f(y + 44)} L -52,${f(y + 18)} Z M 40,${f(y - 8)} L 6,${f(y + 30)} L 14,${f(y + 44)} L 52,${f(y + 18)} Z`, sh(C.top, 0.08)) +
        path(`M -40,${f(y - 8)} L -6,${f(y + 30)} M 40,${f(y - 8)} L 6,${f(y + 30)}`, "none", st(c, 3)) +
        `<rect x="-11" y="${f(y + 26)}" width="22" height="76" rx="4" fill="${sh(C.top, -0.06)}" stroke="${c}" stroke-width="2.5"/>` + circ(0, y + 52, 4.5, "#F2EFE6") + circ(0, y + 80, 4.5, "#F2EFE6") +
        `<g transform="translate(-44,${f(y + 84)})">${circ(0, 0, 10, C.logo)}${path("M -6,2 L 0,-6 L 6,2", "none", st(C.top, 2.5))}</g>` +
        path(`M -70,${f(H[1] - 10)} Q 0,${f(H[1] + 2)} 70,${f(H[1] - 10)}`, "none", st(c, 4, 0.4));
    },
  };
  TOP.uniform = {
    side: (C, T) => path(`M ${PP(T(-26, -304))} L ${PP(T(30, -306))} L ${PP(T(48, -276))} L ${PP(T(20, -284))} Z`, "#F4F4F2", `stroke="#D6D6D2" stroke-width="2"`) +
      `<g transform="translate(${PP(T(50, -270))})">${path("M 0,0 L -12,30 L 0,24 L 10,34 Z", C.tie)}${circ(0, 0, 6, C.tie)}</g>` +
      path(`M ${PP(T(-58, -16))} Q ${PP(T(0, -6))} ${PP(T(56, -16))}`, "none", st("#D9D9D4", 3)),
    front: (C, ctx) => {
      const { S } = ctx, y = S[1];
      return path(`M -38,${f(y - 8)} L -2,${f(y + 22)} L -30,${f(y + 40)} L -50,${f(y + 10)} Z M 38,${f(y - 8)} L 2,${f(y + 22)} L 30,${f(y + 40)} L 50,${f(y + 10)} Z`, "#FFFFFF", `stroke="#D6D6D2" stroke-width="2.5"`) +
        `<g transform="translate(0,${f(y + 26)})">${path("M 0,0 L -30,-14 L -30,14 Z M 0,0 L 30,-14 L 30,14 Z", C.tie)}${path("M -4,4 L -14,44 L 0,36 L 14,44 L 4,4 Z", sh(C.tie, -0.1))}${circ(0, 0, 8, sh(C.tie, 0.1))}</g>` +
        `<rect x="-58" y="${f(y + 70)}" width="38" height="42" rx="4" fill="none" stroke="#D6D6D2" stroke-width="2.5"/>` + circ(-39, y + 84, 8, "#3B5BA8") + path(`M -54,${f(y + 102)} l 8,-2 l 6,2 l 8,-2 l 6,2`, "none", st("#3B5BA8", 2)) +
        path(`M 22,${f(y + 84)} L 56,${f(y + 84)}`, "none", st("#3B5BA8", 3)) + [0, 1, 2].map((k) => circ(0, y + 60 + k * 50, 3.5, "#E2E2DD")).join("");
    },
  };
  TOP.kurachao = {
    side: (C, T, ctx) => {
      let s = path(`M ${PP(T(4, -302))} C ${PP(T(10, -262))} ${PP(T(30, -248))} ${PP(T(54, -258))} L ${PP(T(40, -300))} Z`, sh(C.skin, -0.04));
      for (let k = 0; k <= 6; k++) { const a = k / 6, p = T(4 + 50 * a, -302 + 46 * Math.sin(a * Math.PI * 0.9)); s += circ(...p, 5, "#FFFFFF", `stroke="${C.print1}" stroke-width="1.5"`); }
      const dots = []; for (let y = -240; y < 0; y += 34) for (let x = -50; x < 60; x += 30) dots.push(T(x + ((y / 34) % 2) * 15, y));
      return s + clipT(ctx, dots.map((p) => circ(...p, 3, C.print1, 'opacity=".55"')).join(""));
    },
    front: (C, ctx) => {
      const { S, H } = ctx, y = S[1];
      let s = path(`M -46,${f(y - 6)} C -40,${f(y + 50)} 40,${f(y + 50)} 46,${f(y - 6)} Z`, sh(C.skin, -0.04)) + path(`M -28,${f(y + 22)} Q -14,${f(y + 30)} -4,${f(y + 26)} M 28,${f(y + 22)} Q 14,${f(y + 30)} 4,${f(y + 26)}`, "none", st(sh(C.skin, -0.2), 2.5, 0.5));
      for (let k = 0; k <= 10; k++) { const a = k / 10, x = -46 + 92 * a, yy = y - 6 + 44 * Math.sin(a * Math.PI); s += circ(x, yy, 5.5, "#FFFFFF", `stroke="${C.print1}" stroke-width="1.5"`); }
      const dots = []; for (let yy = y + 70; yy < H[1]; yy += 34) for (let x = -80; x < 90; x += 30) dots.push([x + ((Math.round((yy - y) / 34)) % 2) * 15, yy]);
      return s + clipT(ctx, dots.map((p) => circ(...p, 3, C.print1, 'opacity=".55"')).join("")) + [0, 1, 2].map((k) => circ(0, y + 70 + k * 46, 4, "#E8DCC6")).join("");
    },
  };
  TOP.hoodie = {
    side: (C, T) => {
      const c = sh(C.top, -0.14);
      return path(`M ${PP(T(-64, -290))} C ${PP(T(-76, -330))} ${PP(T(-30, -344))} ${PP(T(-4, -322))} C ${PP(T(4, -308))} ${PP(T(-14, -296))} ${PP(T(-30, -296))} Z`, sh(C.top, 0.06)) + path(`M ${PP(T(-58, -296))} C ${PP(T(-64, -322))} ${PP(T(-32, -332))} ${PP(T(-12, -318))}`, "none", st(c, 3)) +
        path(`M ${PP(T(-10, -306))} Q ${PP(T(16, -288))} ${PP(T(42, -302))}`, "none", st(c, 6)) +
        path(`M ${PP(T(30, -296))} L ${PP(T(36, -216))} M ${PP(T(40, -298))} L ${PP(T(48, -226))}`, "none", st(C.print, 3)) + circ(...T(36, -212), 4, "#C9C3B8") + circ(...T(48, -222), 4, "#C9C3B8") +
        path(`M ${PP(T(-4, -126))} L ${PP(T(54, -126))} L ${PP(T(58, -54))} L ${PP(T(8, -54))} Z`, sh(C.top, -0.05), `stroke="${c}" stroke-width="2.5"`) +
        path(`M ${PP(T(-58, -18))} L ${PP(T(56, -18))} L ${PP(T(56, 10))} L ${PP(T(-58, 10))} Z`, C.cuff) + [0, 1, 2, 3, 4, 5, 6].map((k) => path(`M ${PP(T(-50 + k * 16, -16))} L ${PP(T(-50 + k * 16, 8))}`, "none", st(c, 1.5, 0.5))).join("");
    },
    front: (C, ctx) => {
      const { S, H } = ctx, y = S[1], c = sh(C.top, -0.14);
      return path(`M -64,${f(y - 2)} C -60,${f(y - 30)} 60,${f(y - 30)} 64,${f(y - 2)} C 50,${f(y + 40)} -50,${f(y + 40)} -64,${f(y - 2)} Z`, sh(C.top, 0.07)) + path(`M -40,${f(y - 6)} C -20,${f(y + 22)} 20,${f(y + 22)} 40,${f(y - 6)} C 20,${f(y + 6)} -20,${f(y + 6)} -40,${f(y - 6)} Z`, sh(C.top, -0.3)) +
        path(`M -16,${f(y + 20)} L -20,${f(y + 110)} M 16,${f(y + 20)} L 20,${f(y + 106)}`, "none", st(C.print, 3.5)) + `<rect x="-24" y="${f(y + 108)}" width="8" height="12" rx="2" fill="#C9C3B8"/><rect x="16" y="${f(y + 104)}" width="8" height="12" rx="2" fill="#C9C3B8"/>` +
        `<g transform="translate(0,${f(y + 150)})">${path("M -24,-16 L 24,-16 L 18,16 L -18,16 Z", C.print, 'opacity=".9"')}<text x="0" y="7" text-anchor="middle" font-family="Kanit" font-weight="900" font-size="18" fill="${C.top}">TE</text></g>` +
        path(`M -50,${f(H[1] - 110)} L 50,${f(H[1] - 110)} L 62,${f(H[1] - 30)} L -62,${f(H[1] - 30)} Z`, sh(C.top, -0.05), `stroke="${c}" stroke-width="2.5"`) + path(`M -50,${f(H[1] - 110)} Q -60,${f(H[1] - 70)} -62,${f(H[1] - 30)} M 50,${f(H[1] - 110)} Q 60,${f(H[1] - 70)} 62,${f(H[1] - 30)}`, "none", st(c, 3)) +
        `<rect x="${f(-72 * ctx.bw)}" y="${f(H[1] - 18)}" width="${f(144 * ctx.bw)}" height="30" rx="8" fill="${C.cuff}"/>` + [...Array(11)].map((_, k) => path(`M ${f((-64 + k * 13) * ctx.bw)},${f(H[1] - 14)} L ${f((-64 + k * 13) * ctx.bw)},${f(H[1] + 8)}`, "none", st(c, 1.5, 0.5))).join("");
    },
  };
  TOP.blazer = {
    side: (C, T) => {
      const c = sh(C.top, -0.35), l = sh(C.top, 0.12);
      return path(`M ${PP(T(10, -302))} L ${PP(T(44, -298))} L ${PP(T(50, -250))} Z`, C.inner) + path(`M ${PP(T(30, -300))} L ${PP(T(52, -248))} L ${PP(T(48, -160))} L ${PP(T(40, -160))} L ${PP(T(42, -250))} Z`, l) +
        path(`M ${PP(T(40, -160))} L ${PP(T(46, 6))}`, "none", st(c, 3)) + circ(...T(46, -140), 5, "#1A1C24") + circ(...T(47, -100), 5, "#1A1C24") +
        path(`M ${PP(T(-6, -70))} L ${PP(T(40, -70))}`, "none", st(c, 4)) + path(`M ${PP(T(-54, -60))} L ${PP(T(-56, 8))}`, "none", st(c, 3, 0.7)) + path(`M ${PP(T(-24, -300))} Q ${PP(T(4, -312))} ${PP(T(30, -304))}`, "none", st(l, 7));
    },
    front: (C, ctx) => {
      const { S, H } = ctx, y = S[1], c = sh(C.top, -0.35), l = sh(C.top, 0.12);
      return path(`M -36,${f(y - 6)} L 0,${f(y + 130)} L 36,${f(y - 6)} Z`, C.inner) + path(`M -14,${f(y + 2)} Q 0,${f(y + 14)} 14,${f(y + 2)}`, "none", st(sh(C.inner, -0.15), 3)) +
        path(`M -40,${f(y - 8)} L -60,${f(y + 30)} L -46,${f(y + 44)} L -58,${f(y + 56)} L 0,${f(y + 134)} L -8,${f(y + 134)} L -36,${f(y + 4)} Z`, l) +
        path(`M 40,${f(y - 8)} L 60,${f(y + 30)} L 46,${f(y + 44)} L 58,${f(y + 56)} L 0,${f(y + 134)} L 8,${f(y + 134)} L 36,${f(y + 4)} Z`, l) +
        path(`M 0,${f(y + 134)} L 0,${f(H[1] + 10)}`, "none", st(c, 3)) + circ(4, y + 160, 6, "#1A1C24") + circ(4, y + 204, 6, "#1A1C24") +
        path(`M -64,${f(H[1] - 70)} L -24,${f(H[1] - 70)} M 24,${f(H[1] - 70)} L 64,${f(H[1] - 70)}`, "none", st(c, 4)) +
        path(`M -60,${f(y + 84)} L -30,${f(y + 84)}`, "none", st(c, 3)) + path(`M -56,${f(y + 84)} l 6,-14 l 6,10 l 6,-12 l 6,16 Z`, "#C2303A");
    },
  };
  TOP.tank = {
    side: (C, T) => path(`M ${PP(T(-36, -302))} C ${PP(T(-46, -262))} ${PP(T(-36, -226))} ${PP(T(-6, -220))} C ${PP(T(22, -226))} ${PP(T(30, -262))} ${PP(T(22, -300))} Z`, C.skin) +
      path(`M ${PP(T(24, -300))} C ${PP(T(30, -270))} ${PP(T(46, -262))} ${PP(T(58, -268))} L ${PP(T(50, -300))} Z`, C.skin) +
      path(`M ${PP(T(-36, -302))} C ${PP(T(-46, -262))} ${PP(T(-36, -226))} ${PP(T(-6, -220))} C ${PP(T(22, -226))} ${PP(T(30, -262))} ${PP(T(22, -300))}`, "none", st(sh(C.top, -0.12), 4)) +
      path(`M ${PP(T(-56, -40))} Q ${PP(T(0, -30))} ${PP(T(54, -40))}`, "none", st(sh(C.top, -0.12), 3, 0.5)),
    front: (C, ctx) => {
      const { S } = ctx, y = S[1], b = ctx.bw;
      const arm = (sd) => path(`M ${f(sd * 42 * b)},${f(y - 8)} L ${f(sd * 80 * b)},${f(y + 16)} C ${f(sd * 84 * b)},${f(y + 60)} ${f(sd * 78 * b)},${f(y + 92)} ${f(sd * 68 * b)},${f(y + 100)} C ${f(sd * 58 * b)},${f(y + 74)} ${f(sd * 48 * b)},${f(y + 34)} ${f(sd * 42 * b)},${f(y - 8)} Z`, C.skin);
      return arm(-1) + arm(1) + path(`M -28,${f(y - 6)} C -26,${f(y + 50)} 26,${f(y + 50)} 28,${f(y - 6)} Z`, C.skin) +
        path(`M -28,${f(y - 6)} C -26,${f(y + 50)} 26,${f(y + 50)} 28,${f(y - 6)}`, "none", st(sh(C.top, -0.12), 4)) + path(`M -20,${f(y + 24)} Q -10,${f(y + 30)} -3,${f(y + 26)} M 20,${f(y + 24)} Q 10,${f(y + 30)} 3,${f(y + 26)}`, "none", st(sh(C.skin, -0.2), 2.5, 0.5));
    },
  };

  // =====================================================================
  // ท่อนล่าง: ลวดลายผ้าถุง ผ้าซิ่น จีบกระโปรง ฯลฯ
  // =====================================================================
  const BOT = (RK.FLAT_BOTTOM = RK.FLAT_BOTTOM || {});
  const zig = (x0, x1, y, h, n) => { let d = `M ${f(x0)},${f(y)}`; for (let i = 1; i <= n; i++) d += ` L ${f(x0 + (x1 - x0) * i / n)},${f(y + (i % 2 ? -h : 0))}`; return d; };
  BOT.sarong = {
    side: (C, T, ctx) => { const k = ctx.A._skirt; if (!k) return ""; const { a, b, hy } = k; return path(`M ${f(a[0] + 4)},${f(hy - 52)} L ${f(b[0] - 4)},${f(hy - 52)} L ${f(b[0])},${f(hy - 6)} L ${f(a[0])},${f(hy - 6)} Z`, C.band, 'opacity=".9"') + path(zig(a[0] + 6, b[0] - 6, hy - 22, 14, 12), "none", st(sh(C.bottom, -0.2), 3)) + [0.25, 0.5, 0.75].map((q) => path(`M ${PP(T(-40 + 90 * q, -10))} L ${f(a[0] + (b[0] - a[0]) * q)},${f(hy - 56)}`, "none", st(sh(C.bottom, 0.12), 3, 0.5))).join(""); },
    front: (C, ctx) => { const hm = ctx.hem, w = 82 + ctx.fl; return path(`M ${-w + 2},${f(hm - 52)} L ${w - 2},${f(hm - 52)} L ${w},${f(hm - 6)} L ${-w},${f(hm - 6)} Z`, C.band, 'opacity=".9"') + path(zig(-w + 4, w - 4, hm - 22, 14, 14), "none", st(sh(C.bottom, -0.2), 3)) + [-40, -14, 14, 40].map((x) => path(`M ${x * 0.9},${f(ctx.H[1])} L ${x * 1.2},${f(hm - 56)}`, "none", st(sh(C.bottom, 0.12), 3, 0.45))).join("") + path(`M -60,${f(ctx.H[1] + 10)} L 20,${f(ctx.H[1] - 10)} L 30,${f(ctx.H[1] + 40)}`, "none", st(sh(C.bottom, -0.18), 3, 0.7)); },
  };
  BOT.sin = {
    side: (C, T, ctx) => { const k = ctx.A._skirt; if (!k) return ""; const { a, b, hy } = k; return path(`M ${f(a[0] + 4)},${f(hy - 70)} L ${f(b[0] - 4)},${f(hy - 70)} L ${f(b[0])},${f(hy - 4)} L ${f(a[0])},${f(hy - 4)} Z`, C.band2) + path(zig(a[0] + 6, b[0] - 6, hy - 30, 18, 14), "none", st(C.band, 4)) + path(zig(a[0] + 6, b[0] - 6, hy - 46, 10, 20), "none", st("#F2E3B3", 2.5)) + [0, 1, 2, 3].map((r) => path(`M ${PP(T(-54, -120 + r * 40))} L ${PP(T(54, -120 + r * 40))}`, "none", st(sh(C.bottom, 0.15), 3, 0.5))).join(""); },
    front: (C, ctx) => { const hm = ctx.hem, w = 82 + ctx.fl; return path(`M ${-w + 2},${f(hm - 70)} L ${w - 2},${f(hm - 70)} L ${w},${f(hm - 4)} L ${-w},${f(hm - 4)} Z`, C.band2) + path(zig(-w + 4, w - 4, hm - 30, 18, 16), "none", st(C.band, 4)) + path(zig(-w + 4, w - 4, hm - 46, 10, 24), "none", st("#F2E3B3", 2.5)) + [0, 1, 2, 3].map((r) => path(`M -74,${f(ctx.H[1] + 20 + r * 40)} L 74,${f(ctx.H[1] + 20 + r * 40)}`, "none", st(sh(C.bottom, 0.15), 3, 0.5))).join(""); },
  };
  BOT.skirt = {
    side: (C, T, ctx) => { const k = ctx.A._skirt; if (!k) return ""; const { a, b, hy } = k; return [0.15, 0.32, 0.5, 0.68, 0.85].map((q) => path(`M ${PP(T(-50 + 100 * q, -10))} L ${f(a[0] + (b[0] - a[0]) * q)},${f(hy - 2)}`, "none", st(sh(C.bottom, -0.25), 2.5, 0.7))).join(""); },
    front: (C, ctx) => { const hm = ctx.hem, w = 82 + ctx.fl; return [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75].map((q) => path(`M ${f(q * 60)},${f(ctx.H[1] - 10)} L ${f(q * w)},${f(hm - 2)}`, "none", st(sh(C.bottom, -0.25), 2.5, 0.7))).join("") + path(`M -66,${f(ctx.H[1] - 20)} L 66,${f(ctx.H[1] - 20)}`, "none", st(sh(C.bottom, -0.3), 8)); },
  };
  BOT.pencil = {
    side: (C, T, ctx) => { const k = ctx.A._skirt; if (!k) return ""; return path(`M ${f(k.a[0] + 10)},${f(k.hy)} L ${f(k.a[0] + 18)},${f(k.hy - 50)}`, "none", st(sh(C.bottom, -0.35), 3)); },
    front: (C, ctx) => path(`M 0,${f(ctx.hem)} L 0,${f(ctx.hem - 46)}`, "none", st(sh(C.bottom, -0.35), 3)) + path(`M -56,${f(ctx.H[1] + 30)} Q 0,${f(ctx.H[1] + 44)} 56,${f(ctx.H[1] + 30)}`, "none", st(sh(C.bottom, 0.1), 3, 0.4)),
  };
  BOT.shorts = {
    side: (C, T) => path(`M ${PP(T(0, -14))} L ${PP(T(2, 30))}`, "none", st(sh(C.bottom, -0.25), 3, 0.7)),
    front: (C, ctx) => path(`M -62,${f(ctx.H[1] + 20)} L -64,${f(ctx.H[1] + 70)} M 62,${f(ctx.H[1] + 20)} L 64,${f(ctx.H[1] + 70)}`, "none", st(sh(C.bottom, -0.25), 3, 0.7)),
  };
  BOT.jeans = {
    side: (C, T) => path(`M ${PP(T(-54, 0))} L ${PP(T(-30, 0))} L ${PP(T(-32, 26))} L ${PP(T(-42, 32))} L ${PP(T(-52, 26))} Z`, "none", st("#D9A441", 2, 0.8, 'stroke-dasharray="4 3"')) + path(`M ${PP(T(30, -14))} C ${PP(T(38, 4))} ${PP(T(48, 10))} ${PP(T(54, 8))}`, "none", st("#D9A441", 2, 0.8, 'stroke-dasharray="4 3"')),
    front: (C, ctx) => path(`M -60,${f(ctx.H[1] - 10)} C -50,${f(ctx.H[1] + 6)} -42,${f(ctx.H[1] + 12)} -30,${f(ctx.H[1] + 14)} M 60,${f(ctx.H[1] - 10)} C 50,${f(ctx.H[1] + 6)} 42,${f(ctx.H[1] + 12)} 30,${f(ctx.H[1] + 14)}`, "none", st("#D9A441", 2, 0.8, 'stroke-dasharray="4 3"')),
  };

  // =====================================================================
  // รองเท้า
  // =====================================================================
  const SHOE = (RK.FLAT_SHOE = RK.FLAT_SHOE || {});
  const G_ = (a, ang, inner) => `<g transform="translate(${PP(a)}) rotate(${f(ang)}) translate(-4,22)">${inner}</g>`;
  SHOE.slipper = {
    side: (C, a, ang, far) => { const sk = far ? sh(C.skin, -0.22) : C.skin, c = far ? sh(C.shoe, -0.2) : C.shoe; return G_(a, ang, path(`M -30,6 L 86,6 C 94,6 94,16 84,16 L -26,16 C -34,16 -34,6 -30,6 Z`, sh(c, -0.25)) + path(`M -30,4 L 86,4 C 92,4 92,10 86,10 L -28,10 Z`, c) + path(`M -26,6 C -30,-16 -10,-24 12,-22 C 42,-20 66,-14 80,-4 C 86,2 84,6 78,6 Z`, sk) + path(`M 62,-2 L 64,6 M 70,0 L 72,6 M 54,-4 L 56,5`, "none", st(sh(sk, -0.25), 2, 0.7)) + path(`M 10,-14 C 24,-26 44,-18 46,-6`, "none", st(c, 9))); },
    front: (C, sd) => `<g transform="translate(${PP([sd * 36, -12])})">` + `<ellipse cx="0" cy="14" rx="34" ry="10" fill="${sh(C.shoe, -0.25)}"/>` + path(`M -26,-2 C -28,-30 28,-30 26,-2 C 28,10 20,14 0,14 C -20,14 -28,10 -26,-2 Z`, C.skin) + [-16, -6, 4, 14].map((x) => circ(x, 6, 5, sh(C.skin, -0.04), `stroke="${sh(C.skin, -0.2)}" stroke-width="1.5"`)).join("") + path(`M -24,-8 L 0,6 L 24,-8`, "none", st(C.shoe, 8)) + `</g>`,
  };
  SHOE.heels = {
    side: (C, a, ang, far) => { const c = far ? sh(C.shoe, -0.2) : C.shoe; return G_(a, ang, path(`M -26,-8 L -22,14 L -14,14 L -16,-4 Z`, sh(c, -0.35)) + path(`M -30,-16 C -32,-34 -2,-36 16,-26 C 46,-12 80,-6 96,6 C 100,12 92,14 86,14 L 34,14 C 14,8 -8,-2 -22,-8 Z`, c) + path(`M -4,-24 C 14,-18 30,-10 44,-4`, "none", st(sh(C.skin, -0.05), 7)) + path(`M 40,4 C 60,4 80,6 92,10`, "none", st("#FFFFFF", 2, 0.4))); },
    front: (C, sd) => `<g transform="translate(${PP([sd * 34, -10])})">` + path(`M -18,-8 C -20,-30 20,-30 18,-8 L 10,16 C 4,22 -4,22 -10,16 Z`, C.shoe) + path(`M -14,-14 C -6,-20 6,-20 14,-14`, "none", st(sh(C.skin, -0.05), 6)) + `</g>`,
  };
  SHOE.school = {
    side: (C, a, ang, far) => { const c = far ? "#121216" : C.shoe; return G_(a, ang, path(`M -30,-6 C -32,-30 -6,-36 10,-30 C 34,-24 62,-22 76,-12 C 90,-2 88,10 78,12 L -26,12 C -34,10 -34,0 -30,-6 Z`, c) + path(`M -30,8 L 82,8 C 86,12 82,16 76,16 L -26,16 C -32,16 -32,10 -30,8 Z`, "#3A3A40") + path(`M 2,-30 L 26,-18`, "none", st("#2E2E36", 7)) + circ(26, -18, 4, "#C9C9C9") + path(`M 40,-20 C 54,-18 66,-14 74,-8`, "none", st("#FFFFFF", 3, 0.35))); },
    front: (C, sd) => `<g transform="translate(${PP([sd * 36, -10])})">` + path(`M -28,-6 C -30,-30 30,-30 28,-6 C 30,8 24,14 0,14 C -24,14 -30,8 -28,-6 Z`, C.shoe) + path(`M -24,-14 L 24,-14`, "none", st("#2E2E36", 6)) + circ(sd * 14, -14, 4, "#C9C9C9") + path(`M -14,-4 Q 0,-10 14,-4`, "none", st("#FFFFFF", 2.5, 0.3)) + `</g>`,
  };
  SHOE.sneaker = {
    side: (C, a, ang, far) => { const c = far ? sh(C.shoe, -0.2) : C.shoe, ac = far ? sh(C.shoeAcc, -0.2) : C.shoeAcc; return G_(a, ang, path(`M -30,-8 C -32,-36 -6,-42 10,-36 C 30,-30 62,-28 80,-14 C 94,-4 92,10 82,12 L -26,12 C -34,10 -34,0 -30,-8 Z`, c) + path(`M -32,4 L 88,4 C 92,10 88,16 80,16 L -26,16 C -34,16 -34,8 -32,4 Z`, sh(C.shoe, -0.3)) + path(`M 4,-8 C 24,-4 44,-12 60,-24`, "none", st(ac, 7)) + path(`M 10,-32 L 18,-24 M 20,-30 L 28,-22 M 30,-28 L 38,-20`, "none", st(sh(c, -0.3), 2.5)) + path(`M -30,-20 L -18,-22 L -18,-6 L -30,-4 Z`, ac)); },
    front: (C, sd) => `<g transform="translate(${PP([sd * 36, -10])})">` + path(`M -30,-6 C -32,-32 32,-32 30,-6 C 32,8 26,14 0,14 C -26,14 -32,8 -30,-6 Z`, C.shoe) + path(`M -30,6 C -26,14 26,14 30,6 L 30,10 C 26,18 -26,18 -30,10 Z`, sh(C.shoe, -0.3)) + path(`M -10,-24 L 10,-24 M -10,-16 L 10,-16`, "none", st(sh(C.shoe, -0.3), 2.5)) + path(`M ${sd * 10},0 Q ${sd * 22},-4 ${sd * 28},-14`, "none", st(C.shoeAcc, 5)) + `</g>`,
  };

  // =====================================================================
  // ของในมือ (กำ): ไม้เท้า แท็บเล็ต
  // =====================================================================
  RK.FLAT_GRIP = Object.assign(RK.FLAT_GRIP || {}, {
    cane: (hc, ha, C, far, view) => {
      const x = view === "front" ? hc[0] : hc[0] + 4, top = hc[1] - 14, gy = 4, wood = "#8B5A2B";
      return path(`M ${x - 30},${top + 14} C ${x - 32},${top - 22} ${x + 2},${top - 26} ${x + 2},${top}`, "none", st(wood, 11)) + line([x + 2, top], [x + 6, gy - 10], 11, wood) + line([x + 6, gy - 22], [x + 6, gy], 13, "#2E2E2E") + path(`M ${x - 26},${top + 4} C ${x - 26},${top - 16} ${x - 4},${top - 18} ${x - 2},${top - 2}`, "none", st("#B07A44", 3, 0.7));
    },
    tablet: (hc, ha, C, far, view) => {
      if (view === "front") return `<g transform="translate(${PP([hc[0] - (hc[0] > 0 ? 40 : -40), hc[1] - 20])}) rotate(${hc[0] > 0 ? -8 : 8})"><rect x="-46" y="-62" width="92" height="124" rx="10" fill="#9AA1AD"/><rect x="-42" y="-58" width="84" height="116" rx="7" fill="#B9C0CA"/><circle cx="0" cy="-2" r="10" fill="#9AA1AD"/><circle cx="-30" cy="-48" r="5" fill="#2E3138"/></g>`;
      return `<g transform="translate(${PP([hc[0] + 40, hc[1] - 18])}) rotate(-24)"><rect x="-10" y="-62" width="20" height="124" rx="6" fill="#2E3138"/><rect x="2" y="-56" width="6" height="112" rx="2" fill="#6FA9E8"/></g>`;
    },
  });

  // =====================================================================
  // เครื่องประดับบนตัว: หูฟัง กระเป๋าเป้ สายคล้องบัตร
  // =====================================================================
  RK.flatBodyAcc = function (C, A, layer, ctx) {
    let s = "";
    const T = ctx.T, S = ctx.S, H = ctx.H;
    if (C.pack) {
      if (layer === "sideBack") s += path(`M ${PP(T(-130, -270))} C ${PP(T(-140, -150))} ${PP(T(-136, -80))} ${PP(T(-118, -50))} L ${PP(T(-54, -56))} L ${PP(T(-54, -280))} Z`, C.pack) + path(`M ${PP(T(-134, -170))} L ${PP(T(-160, -160))} L ${PP(T(-158, -80))} L ${PP(T(-128, -76))} Z`, sh(C.pack, -0.12)) + path(`M ${PP(T(-122, -240))} L ${PP(T(-62, -246))}`, "none", st(sh(C.pack, -0.3), 3)) + circ(...T(-96, -244), 5, "#E9E2D6") + `<rect x="${f(T(-150, -150)[0])}" y="${f(T(-150, -150)[1])}" width="14" height="40" rx="5" fill="#7DC4E4" opacity=".9"/>`;
      if (layer === "side") s += path(`M ${PP(T(-40, -296))} C ${PP(T(-10, -312))} ${PP(T(30, -290))} ${PP(T(34, -250))} L ${PP(T(30, -150))} L ${PP(T(18, -150))} L ${PP(T(22, -250))} C ${PP(T(18, -282))} ${PP(T(-10, -296))} ${PP(T(-36, -286))} Z`, sh(C.pack, -0.08)) + `<rect x="${f(T(18, -200)[0])}" y="${f(T(18, -200)[1])}" width="16" height="12" rx="3" fill="#3A3A40"/>`;
      if (layer === "frontBack") s += `<rect x="-90" y="${f(S[1] + 20)}" width="180" height="200" rx="40" fill="${C.pack}"/>` + `<rect x="-90" y="${f(S[1] + 20)}" width="180" height="200" rx="40" fill="none" stroke="${sh(C.pack, -0.2)}" stroke-width="4"/>`;
      if (layer === "front") s += [-1, 1].map((sd) => path(`M ${sd * 30},${f(S[1] - 4)} C ${sd * 44},${f(S[1] + 40)} ${sd * 44},${f(S[1] + 120)} ${sd * 46},${f(S[1] + 190)}`, "none", st(sh(C.pack, -0.08), 14)) + `<rect x="${sd * 46 - 8}" y="${f(S[1] + 110)}" width="16" height="12" rx="3" fill="#3A3A40"/>`).join("");
    }
    if (C.phones) {
      if (layer === "side") s += path(`M ${PP(T(-40, -306))} C ${PP(T(-40, -330))} ${PP(T(30, -332))} ${PP(T(36, -300))}`, "none", st("#2B2B30", 9)) + `<ellipse cx="${f(T(32, -294)[0])}" cy="${f(T(32, -294)[1])}" rx="20" ry="28" fill="${C.phones}"/><ellipse cx="${f(T(30, -294)[0])}" cy="${f(T(30, -294)[1])}" rx="10" ry="18" fill="#2B2B30"/>`;
      if (layer === "front") s += path(`M -62,${f(S[1] - 4)} C -60,${f(S[1] + 40)} 60,${f(S[1] + 40)} 62,${f(S[1] - 4)}`, "none", st("#2B2B30", 9)) + [-1, 1].map((sd) => `<ellipse cx="${sd * 56}" cy="${f(S[1] + 4)}" rx="22" ry="28" fill="${C.phones}" transform="rotate(${sd * -20} ${sd * 56} ${f(S[1] + 4)})"/><ellipse cx="${sd * 50}" cy="${f(S[1] + 6)}" rx="10" ry="18" fill="#2B2B30" transform="rotate(${sd * -20} ${sd * 50} ${f(S[1] + 6)})"/>`).join("");
    }
    if (C.lanyard) {
      const card = (x, y, r) => `<g transform="translate(${f(x)},${f(y)}) rotate(${r})"><rect x="-24" y="0" width="48" height="66" rx="5" fill="#FFFFFF" stroke="#D0CCC4" stroke-width="2"/><rect x="-16" y="8" width="20" height="24" rx="3" fill="#A8C3D8"/><circle cx="-6" cy="16" r="5" fill="${C.skin}"/><rect x="8" y="10" width="10" height="4" fill="#C9C3B8"/><rect x="-16" y="40" width="32" height="4" fill="#2B2F3A"/><rect x="-16" y="50" width="22" height="3" fill="#C9C3B8"/><rect x="-24" y="0" width="48" height="6" rx="3" fill="${C.lanyard}"/></g>`;
      if (layer === "side") s += path(`M ${PP(T(20, -302))} C ${PP(T(30, -260))} ${PP(T(48, -230))} ${PP(T(56, -190))}`, "none", st(C.lanyard, 4)) + card(...T(60, -190), -6);
      if (layer === "front") s += path(`M -26,${f(S[1] - 4)} C -20,${f(S[1] + 80)} -6,${f(S[1] + 130)} 0,${f(S[1] + 150)} C 6,${f(S[1] + 130)} 20,${f(S[1] + 80)} 26,${f(S[1] - 4)}`, "none", st(C.lanyard, 4)) + card(0, S[1] + 148, 0);
    }
    return s;
  };
})(window);
