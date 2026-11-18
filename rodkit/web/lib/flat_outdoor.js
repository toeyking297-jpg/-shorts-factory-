// flat_outdoor.js — ฉากเช้า: ระเบียงบ้าน (porch) + สวนสาธารณะ (park)
// setOpts: { dawn: true } = แสงทองตอนรุ่งเช้า (ค่าเริ่มต้น), { dawn: false } = สาย/กลางวัน
(function (G) {
  const RK = G.RK, f = RK.f, sh = RK.shade, KIT = RK._kit, K = 0.72, WALL_Y = -70;
  const R = (x, y, w, h, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${c}" ${ex}/>`;
  const RR = (x, y, w, h, r, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" fill="${c}" ${ex}/>`;
  const C = (x, y, r, c, ex = "") => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" ${ex}/>`;
  const E = (x, y, rx, ry, c, ex = "") => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${c}" ${ex}/>`;
  const Pth = (d, c, ex = "") => `<path d="${d}" fill="${c}" ${ex}/>`;
  const L = (x1, y1, x2, y2, c, w, ex = "") => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${ex}/>`;
  const ST = (c, w, op = 1) => `stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"`;
  const T = (x, y, txt, size, c, ex = "") => `<text x="${f(x)}" y="${f(y)}" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="${size}" fill="${c}" ${ex}>${txt}</text>`;
  const SHD = (x, y, w, op = 0.25) => E(x, y, w, w * 0.09, "#1A0E08", `opacity="${op}"`);

  RK.flatDefs += `
  <linearGradient id="pSkyDawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E8FC9"/><stop offset=".45" stop-color="#F3B6A0"/><stop offset=".8" stop-color="#FFD89A"/><stop offset="1" stop-color="#FFE9C4"/></linearGradient>
  <linearGradient id="pSkyDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#69B2E6"/><stop offset=".7" stop-color="#CFE9F5"/><stop offset="1" stop-color="#EAF5EC"/></linearGradient>
  <radialGradient id="pSun"><stop offset="0" stop-color="#FFF8DC"/><stop offset=".35" stop-color="#FFE7A0" stop-opacity=".9"/><stop offset="1" stop-color="#FFC970" stop-opacity="0"/></radialGradient>
  <linearGradient id="pMist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".6" stop-color="#FFF4E6" stop-opacity=".55"/><stop offset="1" stop-color="#FFF4E6" stop-opacity="0"/></linearGradient>
  <linearGradient id="pDeck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B07A4C"/><stop offset="1" stop-color="#7A4F30"/></linearGradient>
  <linearGradient id="pGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8DBB6A"/><stop offset="1" stop-color="#5E9A4E"/></linearGradient>
  <linearGradient id="pLake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FCFE0"/><stop offset="1" stop-color="#5E9CB8"/></linearGradient>
  <linearGradient id="pPath" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9B8A0"/><stop offset="1" stop-color="#B98E72"/></linearGradient>`;

  // ---------- ของใช้ร่วม ----------
  function sky(o, t) {
    const dawn = o.dawn !== false;
    let s = R(-2200, -3200, 4400, 3200, dawn ? "url(#pSkyDawn)" : "url(#pSkyDay)");
    const sx = dawn ? 700 : 900, sy = dawn ? -900 : -2300;
    s += C(sx, sy, dawn ? 520 : 380, "url(#pSun)") + C(sx, sy, dawn ? 120 : 90, dawn ? "#FFF2C8" : "#FFFBEA");
    const cl = (x, y, k, c) => `<g transform="translate(${f(x)},${f(y)}) scale(${k})" opacity=".92">` + E(0, 0, 160, 46, c) + E(-90, 14, 90, 36, c) + E(100, 10, 110, 40, c) + E(30, -26, 90, 44, c) + `</g>`;
    const cc = dawn ? "#FFD9C2" : "#FFFFFF";
    s += cl(-900 + t * 8, -2300, 1, cc) + cl(300 + t * 5, -2600, 0.8, cc) + cl(-200 + t * 6, -1700, 0.6, dawn ? "#FBC9B0" : "#F3F7FA") + cl(1300 + t * 4, -1900, 0.7, cc);
    // นกบิน
    for (let i = 0; i < 5; i++) { const bx = -1400 + i * 90 + t * 60, by = -2000 + i * 26 + Math.sin(t * 3 + i) * 10, fl = Math.sin(t * 10 + i) * 10; s += Pth(`M ${f(bx - 22)},${f(by - fl)} Q ${f(bx - 8)},${f(by - 6)} ${f(bx)},${f(by)} Q ${f(bx + 8)},${f(by - 6)} ${f(bx + 22)},${f(by - fl)}`, "none", ST("#3E3A4A", 4)); }
    return s;
  }
  function tree(x, y, k, t, c1 = "#5E9A5A", c2 = "#7DB86A", trunk = "#7A5638") {
    const sw = Math.sin(t * 0.8 + x) * 4 * k;
    let s = SHD(x, y + 4, 200 * k, 0.2) + Pth(`M ${x - 26 * k},${y} C ${x - 20 * k},${y - 200 * k} ${x - 40 * k},${y - 380 * k} ${x - 70 * k},${y - 480 * k} L ${x + 60 * k},${y - 480 * k} C ${x + 30 * k},${y - 380 * k} ${x + 22 * k},${y - 200 * k} ${x + 30 * k},${y} Z`, trunk);
    s += Pth(`M ${x},${y - 360 * k} l ${-120 * k},${-120 * k} M ${x + 10 * k},${y - 300 * k} l ${110 * k},${-150 * k}`, "none", ST(trunk, 18 * k));
    const blobs = [[0, -620, 260, 200], [-200, -540, 180, 150], [210, -540, 190, 150], [-100, -760, 190, 150], [120, -740, 200, 150], [0, -480, 220, 110]];
    blobs.forEach(([bx, by, rx, ry], i) => { s += E(x + bx * k + sw, y + by * k, rx * k, ry * k, i % 2 ? c1 : c2); s += E(x + bx * k + sw - 30 * k, y + by * k - 40 * k, rx * k * 0.5, ry * k * 0.4, sh(i % 2 ? c1 : c2, 0.12), 'opacity=".8"'); });
    const r = RK.rng(Math.round(x)); for (let i = 0; i < 16; i++) s += C(x + (r() - 0.5) * 600 * k + sw, y - (450 + r() * 380) * k, 10 * k, sh(c1, -0.15), 'opacity=".6"');
    return s;
  }
  function person(x, y, k, t, look, walk = 1) { // คนวิ่ง/เดินในฉากหลัง
    const [shirt, pant, skin, hair] = look, dir = walk >= 0 ? 1 : -1, ph = t * (Math.abs(walk) > 1 ? 9 : 5), sw = Math.sin(ph) * (Math.abs(walk) > 1 ? 18 : 10), bob = Math.abs(Math.sin(ph)) * 5;
    let g = `<g transform="translate(${f(x)},${f(y - bob)}) scale(${f(k * dir)},${f(k)})">` + E(0, 4 + bob, 70, 12, "#000", 'opacity=".15"');
    g += Pth(`M -18,-300 L ${f(-30 + sw)},0 L ${f(-6 + sw)},0 L 0,-250 L ${f(6 - sw)},0 L ${f(30 - sw)},0 L 18,-300 Z`, pant) + RR(-46, -560, 92, 280, 30, shirt);
    g += Pth(`M -40,-520 L ${f(-50 - sw)},-360 M 40,-520 L ${f(50 + sw)},-360`, "none", ST(sh(shirt, -0.08), 24)) + R(-12, -600, 24, 44, skin) + C(0, -640, 42, skin) + Pth("M -42,-640 C -44,-700 44,-700 42,-640 C 30,-662 -30,-662 -42,-640 Z", hair);
    return g + `</g>`;
  }

  // ======================= ระเบียงบ้าน =======================
  function porchWall(t, o) {
    let s = sky(o, t);
    const dawn = o.dawn !== false;
    // ทิวเขา/เมืองไกล + ยอดเจดีย์
    s += Pth("M -2200,-700 C -1600,-1000 -1100,-820 -600,-980 C -100,-1120 400,-900 900,-1040 C 1400,-1160 1800,-940 2200,-1060 L 2200,0 L -2200,0 Z", dawn ? "#B48BA0" : "#9DB7C9", 'opacity=".75"');
    s += Pth("M -320,-1100 L -300,-1300 L -280,-1100 Z", dawn ? "#9C7488" : "#8AA3B6") + R(-340, -1100, 80, 120, dawn ? "#9C7488" : "#8AA3B6") + C(-300, -1310, 8, dawn ? "#FFE3A3" : "#F2D58A");
    // หลังคาบ้านเพื่อนบ้าน + ต้นไม้
    const roofs = [[-1500, "#B35D4C"], [-700, "#5E7A8C"], [600, "#C47A4A"], [1500, "#8E5A4A"]];
    roofs.forEach(([x, c]) => { s += Pth(`M ${x - 360},-640 L ${x},-900 L ${x + 360},-640 Z`, c) + R(x - 300, -640, 600, 360, dawn ? "#F3D9C0" : "#EDE3D2") + R(x - 200, -560, 100, 100, dawn ? "#FFE3A3" : "#A9CBDA") + R(x + 80, -560, 100, 100, dawn ? "#FFE3A3" : "#A9CBDA"); });
    s += tree(-1050, -260, 0.9, t) + tree(1050, -260, 1.0, t, "#4F8A55", "#6FAA62") + tree(150, -280, 0.7, t);
    s += R(-2200, -1300, 4400, 900, "url(#pMist)");
    // นกกระจิบเกาะราวระเบียง
    for (let i = 0; i < 3; i++) { const bx = -300 + i * 110, by = -566 - Math.abs(Math.sin(t * 4 + i)) * 4; s += E(bx, by - 14, 18, 14, "#6B5A52") + C(bx + 14, by - 26, 9, "#6B5A52") + Pth(`M ${bx + 22},${by - 26} l 10,3 l -10,3 Z`, "#E3A548") + E(bx - 4, by - 10, 10, 6, "#E8D6C0"); }
    // ผนังบ้าน (ซ้าย): ประตู หน้าต่าง โคม ชั้นรองเท้า
    s += R(-2200, -1700, 800, 1630, "#F1E2CA") + R(-2200, -1700, 800, 40, "#7C5A3E");
    for (let y = -1660; y < -70; y += 60) s += L(-2200, y, -1400, y, "#E2CFB2", 3);
    s += R(-1980, -1120, 360, 1050, "#7C5A3E") + RR(-1950, -1090, 300, 990, 6, "#9C6B43") + [0, 1].map((i) => RR(-1930, -1060 + i * 480, 260, 420, 6, "none", ST("#7C5A3E", 6))).join("") + C(-1700, -580, 14, "#E3B062");
    s += RR(-1580, -1480, 130, 160, 10, "#3A2A26") + E(-1515, -1390, 120, 140, "#FFE3A3", `opacity="${dawn ? 0.35 : 0.1}"`) + RR(-1560, -1460, 90, 120, 8, dawn ? "#FFE3A3" : "#F7F1E6");
    s += R(-2140, -320, 100, 250, "#9C7651") + [0, 1, 2].map((i) => R(-2140, -300 + i * 80, 100, 10, "#7C5A3E") + E(-2110, -306 + i * 80, 22, 8, ["#E4572E", "#2F6FB0", "#F2C14E"][i]) + E(-2070, -306 + i * 80, 22, 8, ["#E4572E", "#2F6FB0", "#F2C14E"][i])).join("");
    // ระเบียงไม้ + ราวกันตก
    s += R(-2200, WALL_Y - 20, 4400, 1800, "url(#pDeck)");
    for (let y = WALL_Y + 20; y < 1600; y += 56) s += L(-2200, y, 2200, y, "#5E3E28", 3, 'opacity=".5"');
    s += R(-1400, -560, 3600, 26, "#8C5E3C") + R(-1400, -534, 3600, 10, "#6B4A33") + R(-1400, -150, 3600, 20, "#8C5E3C");
    for (let x = -1380; x < 2200; x += 70) s += RR(x, -534, 26, 384, 8, "#A8774C") + C(x + 13, -350, 10, "#8C5E3C");
    // กระถางกล้วยไม้แขวนบนราว + ระฆังลม
    for (const [x, c] of [[-1100, "#B57BD6"], [-200, "#F2668B"], [700, "#FFFFFF"]]) {
      const sw = Math.sin(t * 1.2 + x) * 6;
      s += L(x, -1500, x + sw, -1160, "#5A4A42", 3) + Pth(`M ${x - 70 + sw},-1160 L ${x + 70 + sw},-1160 L ${x + 50 + sw},-1080 L ${x - 50 + sw},-1080 Z`, "#8C6B4A");
      for (let i = 0; i < 5; i++) s += E(x - 60 + i * 30 + sw, -1060 + (i % 2) * 20, 34, 12, "#4F8A55");
      for (let i = 0; i < 6; i++) { const fx = x - 50 + i * 20 + sw * 1.4, fy = -1200 - i * 22 + Math.sin(t + i) * 3; s += C(fx, fy, 16, c, `stroke="${sh(c, -0.25)}" stroke-width="2"`) + C(fx, fy, 5, "#F2C14E"); }
      s += Pth(`M ${x + sw},-1160 C ${x - 40 + sw},-1250 ${x - 60 + sw},-1300 ${x - 50 + sw},-1330`, "none", ST("#4F8A55", 4));
    }
    const wc = 300, sw2 = Math.sin(t * 2) * 8;
    s += L(wc, -1500, wc, -1380, "#5A4A42", 3) + C(wc, -1370, 16, "#C9A27A") + [0, 1, 2, 3, 4].map((i) => R(wc - 40 + i * 20 + sw2 * (i % 2 ? 1 : -1) * 0.4, -1350, 8, 90 + i * 12, "#C9D0D7")).join("") + RR(wc - 14 + sw2, -1220, 28, 40, 6, "#E3A548");
    // ชายคาหลังคาระเบียง (ให้กระถางแขวนมีที่ห้อย) + ไฟระย้าเส้น
    s += R(-2200, -1620, 4400, 130, "#7C5A3E") + R(-2200, -1500, 4400, 18, "#5A3D2B") + R(-2200, -1640, 4400, 30, "#9C6B43");
    for (let x = -2200; x < 2200; x += 260) s += R(x, -1620, 30, 130, "#6B4A33");
    for (let x = -2200; x < 2200; x += 80) s += Pth(`M ${x},-1490 l 40,0 l -20,26 Z`, "#9C6B43");
    s += R(-1400, -1490, 30, 1430, "#8C5E3C") + R(2100, -1490, 30, 1430, "#8C5E3C");
    // ราวตากผ้า (ขวา)
    s += L(1300, -1300, 2200, -1340, "#5A4A42", 4);
    [["#2F6FB0", 1400], ["#F2C14E", 1620], ["#E46F5B", 1840]].forEach(([c, x], i) => { const sw = Math.sin(t * 1.6 + i) * 10; s += Pth(`M ${x},-1300 L ${x + 160},-1305 L ${x + 170 + sw},-1080 L ${x - 10 + sw},-1070 Z`, c) + R(x + 10, -1305, 10, 24, "#E4572E") + R(x + 140, -1308, 10, 24, "#E4572E"); });
    // กระถางต้นไม้ริมระเบียง + จักรยาน
    s += KIT.plant(-1250, -70, 0.5, t, "#C96F4A") + KIT.plant(1950, -70, 0.7, t, "#2F5E6B");
    const bx = 1500, by = -70;
    s += SHD(bx, by, 230) + C(bx - 150, by - 110, 100, "none", ST("#2B2B2B", 14)) + C(bx + 150, by - 110, 100, "none", ST("#2B2B2B", 14)) + Pth(`M ${bx - 150},${by - 110} L ${bx - 40},${by - 260} L ${bx + 110},${by - 260} L ${bx + 150},${by - 110} M ${bx - 40},${by - 260} L ${bx + 10},${by - 110} L ${bx + 110},${by - 260} M ${bx + 10},${by - 110} L ${bx - 150},${by - 110}`, "none", ST("#2F8F4F", 12)) + L(bx - 60, by - 290, bx - 20, by - 290, "#2B2B2B", 14) + L(bx + 110, by - 260, bx + 130, by - 330, "#9AA0A6", 8) + L(bx + 100, by - 330, bx + 170, by - 330, "#2B2B2B", 10) + Pth(`M ${bx + 150},${by - 330} l 60,0 l -10,50 l -50,0 Z`, "#C9A27A");
    // ของบนพื้นระเบียง: พรมเช็ดเท้า บัวรดน้ำ กระถางเรียง แมวนอนอาบแดด รองเท้า ไม้กวาด
    s += Pth("M -1300,260 L -820,260 L -760,420 L -1360,420 Z", "#C9493B") + Pth("M -1280,280 L -840,280 L -790,400 L -1330,400 Z", "none", ST("#F3D9A4", 6)) + T(-1060, 372, "ยินดีต้อนรับ", 40, "#F3D9A4");
    s += SHD(-560, 120, 90) + Pth("M -640,120 L -480,120 L -500,10 L -620,10 Z", "#2F8F4F") + Pth("M -480,40 L -360,-40", "none", ST("#2F8F4F", 14)) + E(-350, -46, 26, 16, "#2F8F4F") + Pth("M -620,40 q -60,-30 -40,-80", "none", ST("#2F8F4F", 10));
    for (const [x, c, k] of [[-260, "#C96F4A", 0.3], [-80, "#E9E2D6", 0.26], [90, "#C96F4A", 0.34]]) s += KIT.plant(x, 140, k, t, c);
    if (RK.flatSets.living) s += `<g transform="translate(260,0)">${""}</g>`;
    s += E(330, 520, 0, 0, "none");
    s += slipper2(-1250, 600, "#2F6FB0") + slipper2(-1050, 640, "#F2668B");
    s += L(1850, -60, 1700, -560, "#C9A27A", 10) + Pth("M 1830,-60 L 1900,-60 L 1880,40 L 1810,40 Z", "#E3B062") + [0, 1, 2, 3, 4].map((i) => L(1815 + i * 18, -40, 1810 + i * 20, 46, "#B08A3E", 4)).join("");
    s += catSun(400, 900, t);
    return s;
  }
  function slipper2(x, y, c) { return E(x, y, 46, 15, c) + E(x + 74, y + 10, 46, 15, c) + Pth(`M ${x - 24},${y - 4} q 24,-16 48,0 M ${x + 50},${y + 6} q 24,-16 48,0`, "none", ST(sh(c, -0.25), 7)); }
  function catSun(x, y, t) {
    const c = "#F2F0EA", tw = Math.sin(t * 1.4) * 14;
    return SHD(x, y + 10, 180) + E(x, y - 40, 160, 50, c) + E(x + 60, y - 60, 60, 30, "#9A8F84", 'opacity=".6"') + Pth(`M ${x + 150},${y - 30} C ${x + 220},${y - 20} ${x + 240 + tw},${y - 70} ${x + 210 + tw},${y - 100}`, "none", ST(c, 20)) + C(x - 150, y - 60, 50, c) + Pth(`M ${x - 188},${y - 92} l 8,-44 l 26,34 Z M ${x - 136},${y - 104} l 20,-38 l 14,42 Z`, c) + Pth(`M ${x - 176},${y - 62} q 9,7 18,0 M ${x - 142},${y - 64} q 9,7 18,0`, "none", ST("#3A2A26", 3)) + E(x - 158, y - 46, 7, 5, "#E58C8C") + E(x - 60, y + 10, 60, 14, "#F2F0EA");
  }
  function porchIsland(t, o) {
    // โต๊ะกาแฟเล็ก + เก้าอี้หวาย (ระยะกลาง)
    const x = o.tableX ?? 720, y = 60;
    let s = SHD(x, y, 230);
    s += E(x, y - 250, 190, 34, "#8C5E3C") + E(x, y - 258, 190, 30, "#A87A52") + R(x - 14, y - 250, 28, 250, "#6B4A33") + E(x, y - 4, 90, 16, "#6B4A33");
    s += RR(x - 120, y - 340, 70, 84, 12, "#FFFDF6") + E(x - 85, y - 340, 35, 9, "#6B3E26") + Pth(`M ${x - 50},${y - 324} q 26,10 0,40`, "none", ST("#FFFDF6", 8));
    for (let i = 0; i < 3; i++) { const ph = t * 1.2 + i * 1.7; s += Pth(`M ${x - 100 + i * 14},${y - 350} c -12,-24 12,-36 0,${f(-60 - 12 * Math.sin(ph))}`, "none", `stroke="#fff" stroke-width="6" opacity="${f(0.4 + 0.25 * Math.sin(ph))}"`); }
    s += `<g transform="rotate(-6 ${x + 60} ${y - 270})">` + R(x - 10, y - 290, 150, 40, "#F3F0E8") + R(x - 10, y - 290, 150, 8, "#C9493B") + L(x + 10, y - 270, x + 120, y - 270, "#9A948A", 3) + `</g>`;
    s += E(x + 80, y - 268, 40, 10, "#FFFDF6") + C(x + 66, y - 280, 12, "#E3A548") + C(x + 92, y - 282, 12, "#C98A3E");
    // เก้าอี้หวาย
    const cx = x + 380;
    s += SHD(cx, y, 160) + Pth(`M ${cx - 150},${y - 220} C ${cx - 170},${y - 520} ${cx + 170},${y - 520} ${cx + 150},${y - 220} Z`, "#C9A27A");
    for (let i = 0; i < 7; i++) s += Pth(`M ${cx - 130 + i * 6},${y - 230 - i * 36} Q ${cx},${y - 250 - i * 40 - 30} ${cx + 130 - i * 6},${y - 230 - i * 36}`, "none", ST("#A8835E", 4));
    s += RR(cx - 170, y - 240, 340, 70, 30, "#B68C62") + RR(cx - 150, y - 270, 300, 50, 24, "#E3A548") + L(cx - 130, y - 170, cx - 150, y, "#8C6B4A", 12) + L(cx + 130, y - 170, cx + 150, y, "#8C6B4A", 12);
    return s;
  }
  function porchFore(t, o) {
    let s = "";
    for (let k = 0; k < 9; k++) { const a = 140 + k * 14 + Math.sin(t + k) * 4; s += `<ellipse cx="0" cy="140" rx="46" ry="150" fill="${k % 2 ? "#3E6E45" : "#558B57"}" transform="translate(-1500,-1900) rotate(${f(a)})"/>`; }
    s += RR(1300, 400, 300, 260, 30, "#C96F4A") + [0, 1, 2, 3, 4].map((i) => C(1340 + i * 55, 380 - (i % 2) * 40, 40, ["#F2668B", "#F2C14E", "#E46F5B", "#FFFFFF", "#F2668B"][i])).join("");
    return s;
  }
  function porchSun(t, o) {
    const dawn = o.dawn !== false;
    let s = `<g style="mix-blend-mode:screen">`;
    for (let i = 0; i < 5; i++) s += Pth(`M ${700 + i * 40},-900 L ${760 + i * 40},-900 L ${-1600 + i * 500},800 L ${-1900 + i * 500},800 Z`, "url(#hBeam)", `opacity="${f((dawn ? 0.45 : 0.25) + 0.12 * Math.sin(t * 0.7 + i))}" filter="url(#fBlur20)"`);
    const r = RK.rng(9); for (let i = 0; i < 40; i++) { const xx = -1600 + r() * 3200, yy = -1200 + ((r() * 1600 + t * 20) % 1600); s += C(xx, yy, 2 + r() * 3, "#FFF6DA", `opacity="${f(0.25 + 0.5 * Math.abs(Math.sin(t + i)))}"`); }
    s += `</g>`;
    if (dawn) s += R(-2200, -3200, 4400, 5000, "#FFB870", 'opacity=".08"');
    return s;
  }

  // ======================= สวนสาธารณะ =======================
  function parkWall(t, o) {
    const dawn = o.dawn !== false;
    let s = sky(o, t);
    // ตึกเมืองไกลหลังสวน
    const r = RK.rng(31); let bx = -2200;
    while (bx < 2200) { const bw = 120 + r() * 160, bh = 400 + r() * 700; s += R(bx, -800 - bh, bw, bh + 200, dawn ? "#C9A7B8" : "#AFC4D6", 'opacity=".75"'); for (let wy = -780 - bh; wy < -640; wy += 46) for (let wx = bx + 16; wx < bx + bw - 20; wx += 34) s += R(wx, wy, 14, 22, dawn ? "#E8C9C8" : "#C9D9E6", 'opacity=".7"'); bx += bw + 20 + r() * 40; }
    s += R(-2200, -1200, 4400, 700, "url(#pMist)");
    // แนวต้นไม้หลัง
    for (let i = 0; i < 14; i++) s += tree(-2100 + i * 320, -560, 0.55 + (i % 3) * 0.1, t, "#6E9A6A", "#86B07A", "#6B5038");
    // ทะเลสาบ + เงาสะท้อน + เป็ด + น้ำพุ
    s += Pth("M -2200,-560 L 2200,-560 L 2200,-260 L -2200,-260 Z", "url(#pLake)");
    for (let i = 0; i < 12; i++) { const y = -540 + i * 24, ph = t * 1.5 + i; s += L(-2200 + ((ph * 40) % 300), y, 2200, y, "#FFFFFF", 2, `opacity="${f(0.15 + 0.1 * Math.sin(ph))}" stroke-dasharray="60 120"`); }
    s += C(700, -440, 70, "#FFE7A0", `opacity="${dawn ? 0.35 : 0.15}"`);
    for (let i = 0; i < 3; i++) { const dx = -900 + i * 130 + Math.sin(t * 0.5) * 100, dy = -400 + i * 16; s += E(dx, dy, 40, 18, "#FFFFFF") + C(dx + 34, dy - 22, 16, "#FFFFFF") + Pth(`M ${dx + 48},${dy - 22} l 16,4 l -16,4 Z`, "#F2A33A") + E(dx, dy + 14, 46, 6, "#FFFFFF", 'opacity=".35"'); }
    const fx = 200; s += E(fx, -300, 160, 30, "#C9D0D7") + R(fx - 18, -460, 36, 160, "#C9D0D7");
    for (let i = 0; i < 9; i++) { const a = -1 + i * 0.25, ph = (t * 1.5 + i * 0.3) % 1; s += Pth(`M ${fx},-470 Q ${f(fx + a * 160)},${f(-640 - 40 * Math.sin(ph * 3))} ${f(fx + a * 220)},-320`, "none", `stroke="#E8F6FF" stroke-width="6" opacity=".7"`); }
    // สนามหญ้า + ทางวิ่ง
    s += R(-2200, -260, 4400, 2000, "url(#pGrass)");
    const rg = RK.rng(44); for (let i = 0; i < 260; i++) { const x = -2200 + rg() * 4400, y = -240 + rg() * 1800; s += Pth(`M ${f(x)},${f(y)} l -6,-18 M ${f(x)},${f(y)} l 4,-22 M ${f(x)},${f(y)} l 12,-16`, "none", ST(rg() < 0.5 ? "#4E8A44" : "#9CCB7A", 3, 0.7)); }
    s += Pth("M -2200,-120 C -800,-160 600,-80 2200,-140 L 2200,40 C 600,100 -800,20 -2200,60 Z", "url(#pPath)");
    s += Pth("M -2200,-30 C -800,-70 600,10 2200,-50", "none", `stroke="#FFFFFF" stroke-width="6" stroke-dasharray="40 40" opacity=".6"`);
    // แปลงดอกไม้ + ป้ายสวน + ม้านั่ง + โคมไฟ + เครื่องออกกำลังกาย
    const bed = (x, y, w) => { let b = E(x, y, w, 50, "#6B4A33"); const rr = RK.rng(Math.round(x)); for (let i = 0; i < w / 10; i++) { const px = x - w * 0.9 + rr() * w * 1.8, py = y - 10 - rr() * 40; b += L(px, py + 20, px, py, "#4F8A55", 3) + C(px, py, 12, ["#F2668B", "#F2C14E", "#E46F5B", "#FFFFFF", "#B57BD6"][i % 5]); } return b; };
    s += bed(-1400, -250, 260) + bed(1200, -250, 300);
    s += R(-660, -560, 18, 330, "#6B4A33") + R(-420, -560, 18, 330, "#6B4A33") + RR(-720, -640, 360, 120, 14, "#2F8F4F") + T(-540, -568, "สวนสาธารณะ", 44, "#FFFFFF");
    const bench = (x, y) => SHD(x, y + 6, 220) + R(x - 200, y - 200, 400, 24, "#A8774C") + R(x - 200, y - 160, 400, 24, "#A8774C") + R(x - 210, y - 110, 420, 30, "#8C5E3C") + R(x - 180, y - 80, 20, 80, "#3A3A3A") + R(x + 160, y - 80, 20, 80, "#3A3A3A") + Pth(`M ${x - 200},${y - 210} l -10,110 M ${x + 200},${y - 210} l 10,110`, "none", ST("#3A3A3A", 10));
    s += bench(-1000, -200) + bench(1600, -200);
    for (const lx of [-1650, 500, 1950]) s += R(lx - 10, -900, 20, 680, "#2F3A4A") + RR(lx - 40, -960, 80, 70, 14, "#2F3A4A") + RR(lx - 28, -950, 56, 50, 10, dawn ? "#FFE3A3" : "#F7F1E6");
    s += L(900, -220, 900, -600, "#5E8FB0", 16) + L(1100, -220, 1100, -600, "#5E8FB0", 16) + L(880, -600, 1120, -600, "#E3A548", 16) + L(1000, -600, 1000, -480, "#9AA0A6", 6) + RR(960, -480, 80, 20, 8, "#E4572E");
    // ถังขยะ + ก๊อกน้ำดื่ม
    s += SHD(-200, -220, 60) + RR(-250, -380, 100, 160, 14, "#2F8F4F") + R(-250, -380, 100, 22, "#22663A");
    // ผ้าปิกนิก + ตะกร้า + ลูกบอล + ว่าว + หินทางเดิน + สปริงเกอร์
    s += Pth("M 300,420 L 900,380 L 1020,640 L 360,700 Z", "#E4572E") + [0, 1, 2, 3, 4].map((i) => Pth(`M ${f(300 + i * 120)},${f(420 - i * 8)} L ${f(360 + i * 132)},${f(700 - i * 12)}`, "none", ST("#FFFFFF", 14, 0.7))).join("") + [0, 1, 2].map((i) => Pth(`M ${f(316 + i * 10)},${f(500 + i * 90)} L ${f(940 + i * 26)},${f(470 + i * 76)}`, "none", ST("#FFFFFF", 14, 0.7))).join("");
    s += SHD(700, 520, 90) + Pth("M 620,520 L 780,520 L 760,420 L 640,420 Z", "#C9A27A") + Pth("M 640,420 Q 700,330 760,420", "none", ST("#A8835E", 8)) + C(670, 410, 24, "#E4572E") + R(700, 380, 50, 46, "#F7F1E6");
    s += SHD(-300, 640, 50) + C(-300, 600, 46, "#FFFFFF") + Pth("M -340,590 q 40,-30 80,0 M -300,556 l 0,90", "none", ST("#2F6FB0", 6));
    const kx = -700 + Math.sin(t * 0.7) * 80, ky = -1900 + Math.cos(t * 0.9) * 50; s += Pth(`M ${f(kx)},${f(ky - 90)} L ${f(kx + 70)},${f(ky)} L ${f(kx)},${f(ky + 110)} L ${f(kx - 70)},${f(ky)} Z`, "#F2C14E") + Pth(`M ${f(kx)},${f(ky - 90)} L ${f(kx)},${f(ky + 110)} M ${f(kx - 70)},${f(ky)} L ${f(kx + 70)},${f(ky)}`, "none", ST("#C9493B", 4)) + Pth(`M ${f(kx)},${f(ky + 110)} q 40,80 -10,160 q -40,60 0,120`, "none", ST("#C9493B", 4)) + Pth(`M ${f(kx)},${f(ky + 110)} Q ${f(kx + 400)},${f(ky + 900)} 1100,-60`, "none", ST("#FFFFFF", 2, 0.6));
    for (let i = 0; i < 7; i++) s += E(-1600 + i * 160, 260 + i * 70, 70, 26, "#C9C2B4") + E(-1610 + i * 160, 252 + i * 70, 56, 16, "#DCD6C9");
    const sp = (t * 120) % 360; s += C(1500, 300, 14, "#5E6B78") + [0, 1, 2, 3, 4, 5].map((i) => Pth(`M 1500,290 q ${f(Math.cos((sp + i * 30) * Math.PI / 180) * 160)},-120 ${f(Math.cos((sp + i * 30) * Math.PI / 180) * 300)},30`, "none", `stroke="#DFF3FF" stroke-width="4" opacity=".55" stroke-dasharray="6 10"`)).join("");
    // คนวิ่ง/เดินเล่น
    const looks = [["#E4572E", "#2F3A4A", "#E8B690", "#1C1414"], ["#2F6FB0", "#3B3F5C", "#C48A5E", "#2A201C"], ["#F2C14E", "#5A4A42", "#F1C6A2", "#4A403A"], ["#F2F4F6", "#2F3A4A", "#D7A079", "#E8E4DE"]];
    for (let i = 0; i < 4; i++) { const sp = i % 2 ? -1 : 1, run = i < 2 ? 2 : 1, x = ((-2200 + i * 1100 + sp * t * (run > 1 ? 160 : 70)) % 4400 + 4400) % 4400 - 2200; s += person(x, -60 + i * 10, 0.42, t + i, looks[i], sp * run); }
    return s;
  }
  function parkIsland(t, o) {
    // ต้นไม้ใหญ่ระยะกลาง (จามจุรี) + ม้านั่งหน้า
    let s = tree(o.treeX ?? -1250, 120, 1.55, t, "#4F8A55", "#6FAA62", "#6B4A33");
    const x = o.benchX ?? 900, y = 160;
    s += SHD(x, y + 6, 260) + R(x - 250, y - 240, 500, 28, "#A8774C") + R(x - 250, y - 196, 500, 28, "#A8774C") + R(x - 260, y - 140, 520, 36, "#8C5E3C") + R(x - 230, y - 104, 24, 104, "#3A3A3A") + R(x + 206, y - 104, 24, 104, "#3A3A3A");
    s += RR(x + 120, y - 230, 90, 90, 12, "#5E8FB0") + C(x + 150, y - 196, 10, "#fff", 'opacity=".6"'); // กระเป๋าบนม้านั่ง
    return s;
  }
  function parkFore(t, o) {
    let s = "";
    for (let i = 0; i < 26; i++) { const x = -1700 + i * 140, h = 120 + (i % 4) * 40, sw = Math.sin(t * 1.4 + i) * 10; s += Pth(`M ${x},700 Q ${x + sw},${700 - h * 0.6} ${x + sw * 1.6},${700 - h} Q ${x + 12},${700 - h * 0.6} ${x + 24},700 Z`, i % 2 ? "#4E8A44" : "#6FAA5E"); }
    s += C(-1500, 560, 60, "#F2668B") + C(-1420, 600, 50, "#F2C14E") + C(1450, 580, 56, "#FFFFFF") + C(1520, 620, 44, "#E46F5B");
    return s;
  }
  function parkSun(t, o) { return porchSun(t, o); }

  const wrap = (fn, back, ground) => (t, o) => (back ? R(-4000, -5000, 8000, 5000 + WALL_Y * K, back(o || {})) + R(-4000, WALL_Y * K, 8000, 4000, ground) : "") + `<g transform="scale(${K})">${fn(t, o || {})}</g>`;
  RK.flatSets.porch = { wall: wrap(porchWall, (o) => (o.dawn !== false ? "#6E8FC9" : "#69B2E6"), "#7A4F30"), lamps: () => "", island: wrap(porchIsland), foreground: wrap(porchFore), sunlight: wrap(porchSun), WALL_Y: WALL_Y * K };
  RK.flatSets.park = { wall: wrap(parkWall, (o) => (o.dawn !== false ? "#6E8FC9" : "#69B2E6"), "#5E9A4E"), lamps: () => "", island: wrap(parkIsland), foreground: wrap(parkFore), sunlight: wrap(parkSun), WALL_Y: WALL_Y * K };
})(window);
