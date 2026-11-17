// ตัวละครช่อง ดูเพลิน — ล็อกหน้าตา (DNA) ไว้ที่นี่ ห้ามแก้สี/ทรงผม/จุดเด่นระหว่างตอน
// เสียง (ElevenLabs) ล็อกไว้ใน rodkit/cast.json
(function (G) {
  const RK = G.RK, f = RK.f, INK = RK.INK;
  const C = (RK.CAST = RK.CAST || {});

  C.hero = { // พระเอก "ภูมิ": หน้าคม Dropcut แว่นเหลี่ยม ไฝใต้หางตาขวา หนวดเคราบาง
    id: "hero", name: "ภูมิ",
    skin: "#EFC29B", skinSh: "#D49E78", skinHi: "#F8D6B6", cheek: "#E99482",
    head: "sharp", eyes: "almond", nose: "sharp",
    extras: { mole: [-112, 62], stubble: "#4A3A33" },
    glasses: { type: "square", color: "#17171C" },
    hair: { style: "dropcut", color: "#221816", mid: "#3A2924", hi: "#5C443B" },
    body: {},
    top: { color: "#2E9C9A", sh: "#227775", hi: "#46B5B2", sleeve: "short" },
    outer: { type: "vest", color: "#B79B66", sh: "#977C4C", hi: "#CDB582", stitch: "#6E5733" },
    bottom: { type: "pants", color: "#3B4256", sh: "#2B3142", hi: "#4E5670" },
    shoes: { type: "sneaker", color: "#ECE6DA", sole: "#8E887E", lace: "#9C958A" },
    outfits: {
      office: { top: { color: "#F4F6F8", sh: "#C9D0D8", hi: "#FFFFFF", sleeve: "short", collar: "shirt" }, outer: null, tie: "#2F5D8C", lanyard: "#1F6FB5", watch: 1,
        bottom: { type: "pants", color: "#2E3445", sh: "#20252F", hi: "#40475A" }, shoes: { type: "dress", color: "#2A2422" }, belt: "#2A2422" },
      home: { top: { color: "#8A939E", sh: "#6C747E", hi: "#A4ADB7", sleeve: "short" }, outer: null, bottom: { type: "shorts", color: "#2F3B5C", sh: "#232C46", hi: "#44507A" }, shoes: { type: "slipper", color: "#3C5A8A" } },
    },
  };

  C.mind = { // นางเอก "มายด์": ผมบ็อบ แสกข้าง กิ๊บเหลือง คาร์ดิแกนสีปะการัง ปากไว
    cm: 162, id: "mind", name: "มายด์",
    skin: "#F6D2B5", skinSh: "#E0AE8C", skinHi: "#FCE4D0", cheek: "#F29A94",
    head: "soft", eyes: "lash", nose: "button", browStyle: "thin", browColor: "#3B2620",
    extras: { blush: true, lipstick: "#D9576B", earrings: "#F2C14E" },
    hair: { style: "bob", color: "#3B2620", mid: "#5A3A2E", hi: "#7A5040", clip: "#F2B33D" },
    body: { bw: 0.9, legW: 0.92 }, nails: "#E66A7E", watch: 1,
    top: { color: "#F4F1EA", sh: "#D9D3C6", hi: "#FFFFFF", sleeve: "short", collar: "peter", collarColor: "#FFFFFF" },
    outer: { type: "cardigan", color: "#E27D6A", sh: "#C2604F", hi: "#EE9A8A", button: "#F7EBD3", sleeves: true },
    lanyard: "#D9576B",
    bottom: { type: "skirt", color: "#2F3B5C", sh: "#232C46", len: 128 },
    shoes: { type: "flat", color: "#2A2A33", bow: "#E27D6A" },
  };

  C.yai = { // ยาย "ยายศรี": ผมหงอกเกล้ามวย แว่นอ่านหนังสือมีสายคล้อง เสื้อลายดอก ผ้าถุง
    cm: 150, id: "yai", name: "ยายศรี",
    skin: "#E6B58E", skinSh: "#C99372", skinHi: "#F2CBA8", cheek: "#E4917E",
    head: "old", eyes: "old", nose: "old", browStyle: "thin", browColor: "#D9D4CC",
    extras: { wrinkles: true, blush: true },
    glasses: { type: "reading", color: "#8A5A3C" },
    hair: { style: "bun", color: "#E4E1DA", mid: "#B9B4AC", hi: "#FFFFFF" },
    body: { ls: 0.82, ts: 0.9, bw: 0.95, hunch: 4, head: 0.98 },
    top: { color: "#7A5BA6", sh: "#5E4585", hi: "#9478BF", sleeve: "3q", collar: "mandarin", pattern: "floral", p1: "#F6E6F0", p2: "#F2C14E" },
    bottom: { type: "sarong", color: "#7A2E2E", sh: "#5A2020", p1: "#B8862F", p2: "#E8C46A" },
    shoes: { type: "slipper", color: "#4C7A5E" },
  };

  C.big = { // เพื่อนซี้ "บิ๊ก": อ้วน หัวเกรียน ตาตี่ เสื้อโปโลส้ม ขาสั้น รองเท้าแตะ
    cm: 175, id: "big", name: "บิ๊ก",
    skin: "#D9A27A", skinSh: "#BC8460", skinHi: "#E8BA96", cheek: "#E08A70",
    head: "round", eyes: "small", nose: "wide", browStyle: "bushy", browW: 0.9,
    extras: { blush: true },
    hair: { style: "buzz", color: "#1E1614", mid: "#2E2420", hi: "#4A3A33" },
    body: { bw: 1.38, belly: 1, ls: 0.92 },
    top: { color: "#F08A24", sh: "#C96D12", hi: "#F7A453", sleeve: "short", collar: "polo", p1: "#FFFFFF" },
    bottom: { type: "shorts", color: "#8A7A5C", sh: "#6B5D44", hi: "#A69676" },
    shoes: { type: "sandal", color: "#2E2E2E", sole: "#4A3A2A" },
  };

  C.boss = { // หัวหน้า "บอสวิทย์": หัวล้านหวีปิด หนวดหนา คิ้วดก เสื้อเชิ้ตขาว เนกไทแดง พุงยื่น
    cm: 170, id: "boss", name: "บอสวิทย์",
    skin: "#E3B48E", skinSh: "#C2906C", skinHi: "#EEC6A4", cheek: "#E0937A",
    head: "boxy", eyes: "narrow", nose: "wide", browStyle: "bushy", browW: 1.1,
    extras: { mustache: "thick", wrinkles: true },
    hair: { style: "combover", color: "#2A2422", mid: "#3E3532", hi: "#6A5D58" },
    body: { bw: 1.18, belly: 0.9 }, watch: 1,
    top: { color: "#F5F6F8", sh: "#C9CED6", hi: "#FFFFFF", sleeve: "long", collar: "shirt" },
    tie: "#B3262C", belt: "#2A2422",
    bottom: { type: "pants", color: "#2D3340", sh: "#20252F", hi: "#3E4554" },
    shoes: { type: "dress", color: "#2A2220" },
  };

  C.jaew = { // ป้าแม่ค้า "ป้าแจ๋ว": ผมดัดฟู ลิปแดง ต่างหูทอง เสื้อลายใบไม้ ผ้ากันเปื้อนมีกระเป๋าเงิน ผ้าขนหนูพาดบ่า
    cm: 156, id: "jaew", name: "ป้าแจ๋ว",
    skin: "#D8A07A", skinSh: "#B9805C", skinHi: "#E6B892", cheek: "#E07F6E",
    head: "soft", eyes: "lash", nose: "button", browStyle: "thin", browColor: "#2A1A16",
    extras: { lipstick: "#C8283A", earrings: "#F2C14E", blush: true },
    hair: { style: "perm", color: "#3A1E18", mid: "#4E2A22", hi: "#6E3A2C" },
    body: { bw: 1.12, belly: 0.6, ls: 0.92 },
    top: { color: "#2E7D6B", sh: "#1F5F50", hi: "#3F9A86", sleeve: "short", pattern: "hawaii", p1: "#F7D046", p2: "#FFFFFF" },
    outer: { type: "apron", color: "#3E6FB0", sh: "#2D578F" }, towel: "#F2F2EE",
    bottom: { type: "sarong", color: "#3B2C5E", sh: "#2A1F44", p1: "#C04848", p2: "#F0C060" },
    shoes: { type: "sandal", color: "#C8283A" },
  };

  C.khaotu = { // หลาน "น้องข้าวตู": ผมจุกสองข้าง ตาโต เสื้อเหลืองลายดาว ขาสั้นชมพู
    cm: 112, id: "khaotu", name: "น้องข้าวตู",
    skin: "#F7D6BC", skinSh: "#E3B595", skinHi: "#FDE6D4", cheek: "#F49A9A",
    head: "kid", eyes: "kid", nose: "button", browStyle: "thin", browColor: "#2A1A16",
    extras: { blush: true },
    hair: { style: "pigtails", color: "#2A1A16", mid: "#3A2620", hi: "#4A3028", tie: "#FF6FA5" },
    body: { ls: 0.5, ts: 0.62, bw: 0.72, armS: 0.5, neck: 0.9, legW: 0.9 }, handScale: 0.72,
    top: { color: "#FFD23F", sh: "#E0B21C", hi: "#FFE27A", sleeve: "short", pattern: "star", p1: "#FFFFFF" },
    bottom: { type: "shorts", color: "#FF8FB1", sh: "#E06F93", hi: "#FFB0C9" },
    shoes: { type: "sneaker", color: "#FFFFFF", sole: "#FF6FA5", lace: "#FF8FB1" },
  };

  // ---------- แมวส้ม "ส้มฉุน" (มาสคอต) ท่านั่งหันหน้า ----------
  RK.cat = function (p, t) {
    const o = "#F29A3A", st = "#D9731E", wh = "#FFF4E6", pink = "#F6A6B2", LW = 6;
    const tail = Math.sin(t * 2.2) * 14, blink = (t + 1.3) % 4.1 < 0.12, mood = p.face || "calm";
    let s = `<ellipse cx="0" cy="6" rx="150" ry="20" fill="#000" opacity=".25"/>`;
    s += `<path d="M110,-30 Q220,${-40 + tail} 200,${-150 + tail} Q190,${-190 + tail} 170,${-180 + tail}" fill="none" stroke="${INK}" stroke-width="40" stroke-linecap="round"/><path d="M110,-30 Q220,${-40 + tail} 200,${-150 + tail} Q190,${-190 + tail} 170,${-180 + tail}" fill="none" stroke="${o}" stroke-width="28" stroke-linecap="round"/>`;
    s += [0.3, 0.55, 0.8].map((k) => `<circle cx="${f(110 + 90 * k + (k > 0.6 ? -10 : 0))}" cy="${f(-30 - 130 * k + tail * k)}" r="9" fill="${st}"/>`).join("");
    s += `<path d="M-120,0 Q-140,-170 -70,-230 L70,-230 Q140,-170 120,0Z" fill="${o}" stroke="${INK}" stroke-width="${LW}"/>`;
    s += `<path d="M-60,-220 Q0,-170 60,-220 Q70,-110 40,-20 Q0,0 -40,-20 Q-70,-110 -60,-220Z" fill="${wh}"/>`;
    s += [-100, -88, 88, 100].map((x, i) => `<path d="M${x},${-160 + (i % 2) * 40} q${x < 0 ? 24 : -24},6 ${x < 0 ? 30 : -30},22" fill="none" stroke="${st}" stroke-width="10" stroke-linecap="round"/>`).join("");
    s += `<ellipse cx="-50" cy="-8" rx="36" ry="22" fill="${wh}" stroke="${INK}" stroke-width="${LW}"/><ellipse cx="50" cy="-8" rx="36" ry="22" fill="${wh}" stroke="${INK}" stroke-width="${LW}"/><path d="M-60,-10 l0,12 M-46,-10 l0,12 M46,-10 l0,12 M60,-10 l0,12" stroke="${INK}" stroke-width="3"/>`;
    // หัว
    let h = `<path d="M-120,-60 L-100,-170 L-40,-110Z M120,-60 L100,-170 L40,-110Z" fill="${o}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/><path d="M-104,-80 L-96,-140 L-60,-104Z M104,-80 L96,-140 L60,-104Z" fill="${pink}"/>`;
    h += `<ellipse cx="0" cy="0" rx="150" ry="122" fill="${o}" stroke="${INK}" stroke-width="${LW}"/>`;
    h += `<path d="M-30,-118 l8,40 M0,-122 l0,44 M30,-118 l-8,40" stroke="${st}" stroke-width="12" stroke-linecap="round"/><path d="M-148,10 l40,4 M-146,34 l36,-2 M148,10 l-40,4 M146,34 l-36,-2" stroke="${st}" stroke-width="10" stroke-linecap="round"/>`;
    h += `<path d="M-80,40 Q0,10 80,40 Q70,110 0,116 Q-70,110 -80,40Z" fill="${wh}"/>`;
    const eye = (cx) => mood === "smug" || blink ? `<path d="M${cx - 30},4 Q${cx},${blink ? 10 : -6} ${cx + 30},4" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>` : `<ellipse cx="${cx}" cy="0" rx="32" ry="36" fill="#9BCB4B" stroke="${INK}" stroke-width="5"/><ellipse cx="${cx + (p.lookX || 0) * 10}" cy="2" rx="${mood === "shock" ? 16 : 9}" ry="28" fill="#141414"/><circle cx="${cx + 10}" cy="-14" r="7" fill="#fff"/>`;
    h += eye(-62) + eye(62);
    h += `<path d="M-12,46 L12,46 L0,60Z" fill="${pink}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M0,60 Q-14,78 -28,68 M0,60 Q14,78 28,68" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
    h += `<path d="M-60,56 L-150,40 M-60,66 L-150,72 M60,56 L150,40 M60,66 L150,72" stroke="${INK}" stroke-width="3" opacity=".8"/>`;
    h += `<path d="M-120,-30 Q-140,-20 -130,0" fill="none" stroke="${wh}" stroke-width="5" opacity=".5"/>`;
    s += `<g transform="translate(0,-300) rotate(${f(p.tilt || Math.sin(t * 1.1) * 3)})">${h}</g>`;
    return `<g transform="translate(${f(p.x)},${f(p.y)}) scale(${f(p.s || 1)}) ${(p.facing || 1) < 0 ? "scale(-1,1)" : ""}">${s}</g>`;
  };

  // ชื่อเดิมยังใช้ได้
  RK.hero = (p, t) => RK.person("hero", p, t);
  RK.heroTorchTip = (p) => RK.personTorchTip("hero", p);
})(window);
