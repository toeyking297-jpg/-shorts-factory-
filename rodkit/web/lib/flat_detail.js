// flat_detail.js — ชั้นรายละเอียดเพิ่มให้ฉาก living / dining / office / market
// (ต่อท้ายฟังก์ชันเดิมของแต่ละฉาก ใช้พิกัดก่อนสเกลเดียวกัน K = 0.72)
(function (G) {
  const RK = G.RK, f = RK.f, sh = RK.shade, KIT = RK._kit, K = 0.72;
  const R = (x, y, w, h, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${c}" ${ex}/>`;
  const RR = (x, y, w, h, r, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" fill="${c}" ${ex}/>`;
  const C = (x, y, r, c, ex = "") => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" ${ex}/>`;
  const E = (x, y, rx, ry, c, ex = "") => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${c}" ${ex}/>`;
  const Pth = (d, c, ex = "") => `<path d="${d}" fill="${c}" ${ex}/>`;
  const L = (x1, y1, x2, y2, c, w, ex = "") => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${ex}/>`;
  const ST = (c, w, op = 1) => `stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"`;
  const T = (x, y, txt, size, c, ex = "") => `<text x="${f(x)}" y="${f(y)}" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="${size}" fill="${c}" ${ex}>${txt}</text>`;
  const SHD = (x, y, w, op = 0.28) => E(x, y, w, w * 0.09, "#1A0E08", `opacity="${op}"`);

  RK.flatDefs += `
  <linearGradient id="dAO" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1A12" stop-opacity=".28"/><stop offset="1" stop-color="#2A1A12" stop-opacity="0"/></linearGradient>
  <linearGradient id="dAOup" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2A1A12" stop-opacity=".22"/><stop offset="1" stop-color="#2A1A12" stop-opacity="0"/></linearGradient>
  <linearGradient id="dTank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FE0EA" stop-opacity=".75"/><stop offset="1" stop-color="#3E9BB0" stop-opacity=".85"/></linearGradient>
  <filter id="dNoise" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .14  0 0 0 0 .1  0 0 0 .07 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;

  // ---------- ของใช้ร่วม ----------
  const ao = () => R(-1700, -1716, 3400, 260, "url(#dAO)") + R(-1700, -330, 3400, 260, "url(#dAOup)");          // เงามุมเพดาน/พื้น
  const texture = (y0, y1) => R(-1700, y0, 3400, y1 - y0, "#fff", 'filter="url(#dNoise)"');
  function ceilingFan(x, y, t, c = "#7C5A3E") {
    let s = L(x, y, x, y + 160, "#3A2A26", 8) + RR(x - 40, y + 150, 80, 50, 20, "#E6DCCB");
    const a = (t * 260) % 360;
    for (let i = 0; i < 4; i++) { const an = (a + i * 90) * Math.PI / 180, sx = Math.cos(an); s += `<g transform="translate(${x},${y + 175}) scale(${f(sx)},1)">` + Pth("M 0,-12 C 120,-26 300,-22 360,-6 C 300,10 120,14 0,12 Z", c, 'opacity=".92"') + `</g>`; }
    return s + E(x, y + 200, 34, 16, "#F7E1B5");
  }
  function aircon(x, y, w = 420) {
    return RR(x, y, w, 120, 18, "#F7F8F9", 'stroke="#D2D6DA" stroke-width="3"') + R(x + 20, y + 84, w - 40, 6, "#C9CED4") + R(x + 20, y + 96, w - 40, 6, "#C9CED4") + C(x + w - 40, y + 30, 6, "#68C35A") + RR(x + 30, y + 20, 120, 24, 6, "#E6EAEE");
  }
  function cat(x, y, t, c = "#E3953F") { // แมวส้มนอนขด หางกระดิก
    const tw = Math.sin(t * 1.6) * 12;
    return SHD(x, y + 6, 120) + E(x, y - 36, 110, 46, c) + Pth(`M ${x + 90},${y - 20} C ${x + 150},${y - 10} ${x + 170 + tw},${y - 60} ${x + 140 + tw},${y - 90}`, "none", ST(c, 18)) +
      C(x - 92, y - 62, 42, c) + Pth(`M ${x - 124},${y - 88} l 8,-40 l 22,30 Z M ${x - 82},${y - 98} l 18,-34 l 12,38 Z`, c) + Pth(`M ${x - 114},${y - 64} q 8,6 16,0 M ${x - 84},${y - 66} q 8,6 16,0`, "none", ST("#3A2A26", 3)) + E(x - 98, y - 50, 6, 4, "#E58C8C") +
      Pth(`M ${x - 40},${y - 70} q 20,-14 40,0 M ${x + 10},${y - 74} q 20,-14 40,0`, "none", ST(sh(c, -0.25), 6, 0.7)) + C(x - 60, y - 40 + Math.sin(t * 2) * 1.5, 1, "#000", 'opacity="0"');
  }
  function fishTank(x, y, w, h, t) {
    let s = R(x - 20, y + h, w + 40, 300, "#5A3D2B") + R(x - 20, y + h, w + 40, 20, "#7C5A3E") + RR(x + 10, y + h + 50, w - 20, 220, 6, "#4A3022");
    s += R(x, y, w, h, "url(#dTank)") + R(x, y + h - 40, w, 40, "#D9C08A") + R(x, y, w, 26, "#2B2F3A");
    for (let i = 0; i < 4; i++) { const px = x + 40 + i * (w - 60) / 3; s += Pth(`M ${px},${y + h - 30} C ${px - 20},${y + h - 120} ${px + 20 + Math.sin(t + i) * 10},${y + h - 180} ${px + Math.sin(t + i) * 14},${y + h - 240}`, "none", ST(i % 2 ? "#3E8A4A" : "#5FAF5F", 10)); }
    for (let i = 0; i < 3; i++) { const fx = x + 40 + ((t * (40 + i * 18) + i * 90) % (w - 80)), fy = y + 70 + i * 50 + Math.sin(t * 2 + i) * 10; s += E(fx, fy, 16, 9, ["#F28A30", "#F2C14E", "#E4572E"][i]) + Pth(`M ${f(fx - 14)},${f(fy)} l -12,-8 l 0,16 Z`, ["#F28A30", "#F2C14E", "#E4572E"][i]); }
    for (let i = 0; i < 6; i++) { const by = y + h - 40 - ((t * 60 + i * 50) % (h - 60)); s += C(x + w - 40 + Math.sin(t * 3 + i) * 4, by, 4 + (i % 3), "#FFFFFF", 'opacity=".7"'); }
    return s + R(x, y, w, h, "none", ST("#DDE8EC", 6)) + R(x + 10, y + 30, 14, h - 80, "#fff", 'opacity=".35"');
  }
  function vaseFlowers(x, y, t, k = 1, vc = "#2F5E6B") {
    let s = Pth(`M ${x - 26 * k},${y} C ${x - 40 * k},${y - 60 * k} ${x - 14 * k},${y - 90 * k} ${x - 12 * k},${y - 110 * k} L ${x + 12 * k},${y - 110 * k} C ${x + 14 * k},${y - 90 * k} ${x + 40 * k},${y - 60 * k} ${x + 26 * k},${y} Z`, vc);
    for (let i = 0; i < 7; i++) { const a = -50 + i * 16 + Math.sin(t + i) * 3; s += `<g transform="translate(${x},${y - 110 * k}) rotate(${f(a)})">` + L(0, 0, 0, -120 * k, "#4F8A55", 4 * k) + C(0, -126 * k, 18 * k, ["#F2668B", "#FFFFFF", "#F2C14E", "#E46F5B"][i % 4]) + C(0, -126 * k, 7 * k, "#E3A548") + `</g>`; }
    return s;
  }
  function slippers(x, y, c) { return E(x, y, 40, 13, c) + E(x + 64, y + 8, 40, 13, c) + Pth(`M ${x - 20},${y - 4} q 20,-14 40,0 M ${x + 44},${y + 4} q 20,-14 40,0`, "none", ST(sh(c, -0.25), 6)); }
  function fan(x, y, t) { // พัดลมตั้งพื้น (หันส่าย)
    const sw = Math.sin(t * 0.8) * 0.25, spin = (t * 900) % 360;
    let s = SHD(x, y + 4, 110) + E(x, y - 10, 100, 24, "#E6E2DA") + R(x - 10, y - 520, 20, 510, "#D3CEC4");
    s += `<g transform="translate(${x},${y - 640}) scale(${f(1 - Math.abs(sw))},1)">` + C(0, 0, 130, "#BFD9E6", 'opacity=".55"') + `<g transform="rotate(${f(spin)})">` + [0, 120, 240].map((a) => `<ellipse cx="0" cy="-60" rx="34" ry="64" fill="#7FB4D8" opacity=".7" transform="rotate(${a})"/>`).join("") + `</g>` + C(0, 0, 130, "none", ST("#9AA6B0", 5)) + [0, 30, 60, 90, 120, 150].map((a) => `<line x1="-130" y1="0" x2="130" y2="0" stroke="#9AA6B0" stroke-width="2" transform="rotate(${a})"/>`).join("") + C(0, 0, 26, "#E6E2DA") + `</g>`;
    return s + RR(x - 50, y - 520, 100, 40, 12, "#E6E2DA") + C(x - 20, y - 500, 6, "#68A866") + C(x + 10, y - 500, 6, "#E4572E");
  }
  function plateRice(x, y) { return E(x, y, 74, 20, "#FFFDF6", 'stroke="#D9CDB8" stroke-width="3"') + E(x, y - 10, 44, 18, "#FBF8F2") + Pth(`M ${x - 40},${y - 10} q 40,-30 80,0`, "#FFFFFF") + L(x + 50, y - 2, x + 90, y - 20, "#BFC4C8", 5); }
  function binders(x, y, w) { let s = "", cols = ["#2F5E6B", "#C9493B", "#E3A548", "#5E6B78", "#68A866"]; for (let i = 0; i * 40 < w; i++) s += R(x + i * 40, y - 150, 34, 150, cols[i % 5]) + RR(x + i * 40 + 6, y - 120, 22, 36, 4, "#FFFFFF", 'opacity=".85"') + C(x + i * 40 + 17, y - 30, 7, "#fff", 'opacity=".7"'); return s; }

  // ---------- ห้องนั่งเล่น ----------
  function livingWall(t, o) {
    const n = !!o.night;
    let s = texture(-1716, -572) + ao();
    s += aircon(-320, -1700, 440) + ceilingFan(500, -1716, t);
    // ชั้นลอยเหนือโซฟา + ของตกแต่ง
    s += R(-420, -880, 740, 20, "#9C7651") + R(-420, -860, 740, 6, "#7C5A3E", 'opacity=".6"');
    s += vaseFlowers(-360, -880, t, 0.55) + RR(-280, -940, 70, 60, 6, "#E3A548") + KIT.frame(-190, -1010, 110, 130, "#2F2A28", KIT.familyPic(-178, -998, 86, 106, 2, "#FCE3D6"));
    s += C(-20, -912, 30, "#F7F1E6") + RR(-30, -960, 20, 30, 4, "#E3B062") + E(-20, -966, 6, 10, "#FFD98A", n ? 'opacity="1"' : 'opacity=".3"');
    s += KIT.books(60, -880, 120, 21, 90) + RR(200, -930, 60, 50, 25, "#8E6FA8");
    for (let k = 0; k < 7; k++) s += Pth(`M ${290 - k * 6},-880 q ${f(-10 + Math.sin(t + k) * 4)},${40 + k * 14} ${-4 - k * 2},${80 + k * 26}`, "none", ST(k % 2 ? "#4F8A55" : "#68A866", 7)); // ต้นไม้ห้อย
    s += Pth("M 270,-930 l 40,0 l -6,50 l -28,0 Z", "#C96F4A");
    // ไฟผนังคู่ข้างทีวี
    for (const x of [300, 1220]) { if (n) s += E(x, -1060, 140, 160, "url(#hGlow)"); s += RR(x - 16, -1100, 32, 70, 10, "#7C5A3E") + Pth(`M ${x - 46},-1100 L ${x + 46},-1100 L ${x + 30},-1170 L ${x - 30},-1170 Z`, n ? "#FFE6A8" : "#F2D9A8"); }
    // ตู้ปลา (ขวา)
    s += fishTank(1150, -620, 260, 300, t);
    // เบาะรองนั่งพื้น + รองเท้าแตะ + นิตยสาร + แมว
    s += SHD(-1000, 330, 150) + RR(-1140, 250, 280, 90, 40, "#E3A548") + Pth("M -1120,295 l 240,0", "none", ST("#C98A2B", 4)) + C(-1000, 295, 10, "#C98A2B");
    s += slippers(-540, 400, "#5E8FB0") + slippers(-380, 430, "#F2668B");
    s += `<g transform="rotate(-8 900 420)">` + R(820, 400, 150, 40, "#F7F1E6") + R(830, 392, 130, 8, "#E46F5B") + `</g>`;
    s += cat(640, 360, t);
    // ลายไม้พื้นเพิ่ม (ขอบแผ่นไม้ + เงาสะท้อนแสง)
    s += R(-1700, -70, 3400, 1700, "url(#dAOup)", 'opacity=".4"');
    return s;
  }
  function livingIsland(t, o) {
    // ผ้าห่มลายบนพนักโซฟาข้างหมอน + แสงสะท้อนบนโซฟา
    return SHD(-60 + 0.55 * 830, 60, 90, 0.2);
  }
  // ---------- โต๊ะกินข้าว ----------
  function diningWall(t, o) {
    const n = !!o.night;
    let s = texture(-1716, -640) + ao();
    s += ceilingFan(-60, -1716, t, "#5A3D2B") + aircon(820, -1720, 420);
    // ชั้นโหลแก้ว + กรอบรูปเล็ก ระหว่างภาพกับหน้าต่าง
    s += R(60, -1060, 560, 20, "#7C5A3E");
    const jar = (x, c, h) => RR(x, -1060 - h, 70, h, 14, "#EAF4F6", 'opacity=".9"') + RR(x + 6, -1060 - h * 0.6, 58, h * 0.55, 10, c) + RR(x - 4, -1060 - h - 16, 78, 18, 6, "#7C5A3E");
    s += jar(80, "#E3A548", 120) + jar(170, "#C9493B", 90) + jar(260, "#86A85E", 140) + KIT.frame(370, -1210, 120, 150, "#2F2A28", KIT.familyPic(382, -1198, 96, 126, 3, "#DCE7F2")) + vaseFlowers(560, -1060, t, 0.5, "#E46F5B");
    // ประตูครัว (ขวาสุด) + ตู้เย็น
    s += R(1420, -1400, 300, 1330, "#5A4034") + R(1440, -1380, 260, 1310, "#F1E5D2") + RR(1470, -1300, 200, 1040, 18, "#DCE3E8", 'stroke="#B6BEC6" stroke-width="4"') + R(1470, -900, 200, 8, "#B6BEC6") + RR(1490, -1200, 14, 160, 7, "#9AA6B0") + RR(1490, -840, 14, 200, 7, "#9AA6B0");
    s += [["#F2C14E", 1560, -1180], ["#E46F5B", 1610, -1120], ["#5E8FB0", 1540, -1060]].map(([c, x, y]) => C(x, y, 18, c)).join("") + R(1530, -1020, 80, 100, "#FFFFFF", 'transform="rotate(4 1570 -970)"');
    // พัดลมตั้งพื้น + ชามข้าวแมว + พรมทางเดิน
    s += fan(1150, 140, t);
    s += E(-1250, 260, 60, 18, "#E46F5B") + E(-1250, 252, 44, 10, "#C98A4E") + C(-1270, 248, 6, "#8C5E3C") + C(-1240, 250, 6, "#8C5E3C");
    s += Pth("M -860,60 L 740,60 L 900,320 L -1020,320 Z", "#B5523F") + Pth("M -820,80 L 700,80 L 840,300 L -960,300 Z", "none", ST("#F3D9A4", 8)) + Pth("M -780,100 L 660,100 L 780,280 L -900,280 Z", "url(#hRug)", 'opacity=".55"');
    for (let i = 0; i < 18; i++) s += L(-1020 + i * 107, 320, -1020 + i * 107, 344, "#F3D9A4", 4);
    if (n) s += E(-60, -900, 900, 500, "url(#hGlow)", 'opacity=".25"');
    return s;
  }
  function diningIsland(t, o) {
    const x0 = o.tableX ?? -60, y0 = -280;
    let s = "";
    // จานข้าวประจำที่นั่ง (หน้าแต่ละเก้าอี้)
    for (const cx of (o.chairs || [-420, -60, 300])) s += plateRice(cx - 30, y0 + 40);
    // กล่องทิชชู่ + ถาดเครื่องปรุง + ตะกร้าผลไม้ + เหยือกน้ำ
    s += RR(x0 - 760, y0 - 60, 110, 60, 8, "#F2C14E") + Pth(`M ${x0 - 720},${y0 - 60} q 10,-30 30,-4`, "#FFFFFF");
    s += RR(x0 + 680, y0 - 40, 150, 40, 8, "#C9A27A") + [0, 1, 2, 3].map((i) => RR(x0 + 692 + i * 34, y0 - 100, 26, 64, 8, ["#E4572E", "#F7F1E6", "#5A3D2B", "#86A85E"][i], 'opacity=".9"')).join("");
    s += Pth(`M ${x0 + 520},${y0 - 30} C ${x0 + 520},${y0 + 10} ${x0 + 660},${y0 + 10} ${x0 + 660},${y0 - 30} Z`, "#C98A4E") + C(x0 + 560, y0 - 50, 26, "#F2A33A") + C(x0 + 610, y0 - 54, 24, "#86A85E") + C(x0 + 585, y0 - 76, 22, "#E4572E") + Pth(`M ${x0 + 630},${y0 - 40} q 40,-60 20,-90`, "none", ST("#F2C94C", 16));
    s += Pth(`M ${x0 - 860},${y0} L ${x0 - 870},${y0 - 120} Q ${x0 - 830},${y0 - 150} ${x0 - 790},${y0 - 120} L ${x0 - 800},${y0} Z`, "#DCEFF7", 'opacity=".85"') + R(x0 - 862, y0 - 80, 56, 76, "#A9D6EA", 'opacity=".6"');
    return s;
  }
  // ---------- ออฟฟิศ ----------
  function officeWall(t, o) {
    const n = !!o.late;
    let s = texture(-1840, -104) + ao();
    // ช่องแอร์ + สปริงเกอร์ + ป้ายทางออก
    for (const x of [-700, 100, 900]) s += RR(x - 120, -1900, 240, 60, 6, n ? "#4A5466" : "#E2E6EA") + [0, 1, 2, 3].map((i) => R(x - 100, -1888 + i * 12, 200, 4, n ? "#3A4252" : "#C9CED4")).join("");
    s += RR(1300, -1880, 220, 80, 8, "#2F8F4F") + T(1410, -1826, "ทางออก", 40, "#FFFFFF");
    // บอร์ดหมุดรูปทีม + จอทีวีตารางประชุม
    s += RR(80, -1100, 500, 330, 12, "#B88D62") + R(96, -1084, 468, 298, "#D9B98C");
    const r = RK.rng(12); for (let i = 0; i < 9; i++) { const px = 110 + (i % 3) * 150 + r() * 20, py = -1070 + Math.floor(i / 3) * 95 + r() * 10, a = (r() - 0.5) * 14; s += `<g transform="rotate(${f(a)} ${f(px + 60)} ${f(py + 40)})">` + R(px, py, 120, 80, ["#FFFFFF", "#FFE27A", "#A9C8FF"][i % 3]) + (i % 3 === 0 ? KIT.familyPic(px + 8, py + 8, 104, 64, 3, "#DCE7F2") : L(px + 14, py + 26, px + 100, py + 26, "#7A6A5A", 4) + L(px + 14, py + 46, px + 80, py + 46, "#7A6A5A", 4)) + C(px + 60, py + 6, 7, "#E4572E") + `</g>`; }
    s += RR(680, -1100, 460, 280, 12, "#1E2228") + R(696, -1084, 428, 248, n ? "#1C3A5A" : "#2F5E8F") + T(910, -1030, "ประชุมวันนี้", 40, "#FFFFFF");
    for (let i = 0; i < 3; i++) s += RR(716, -1000 + i * 52, 388, 40, 8, "#FFFFFF", 'opacity=".18"') + T(800, -970 + i * 52, ["09:00", "13:30", "16:00"][i], 26, "#F2C14E") + R(870, -984 + i * 52, 200 - i * 40, 10, "#FFFFFF", 'opacity=".7"');
    // ชั้นแฟ้ม
    s += R(-240, -1100, 140, 24, "#9AA6B0") + binders(-240, -1100, 140) + R(-240, -900, 140, 24, "#9AA6B0") + binders(-240, -900, 120);
    // พรมแผ่น (ลายตาราง) + ทางเดิน
    for (let y = 0; y < 1500; y += 160) for (let x = -1700; x < 1700; x += 160) if (((x + y) / 160) % 2 === 0) s += R(x, y - 70, 160, 160, "#000", 'opacity=".04"');
    s += R(-1700, 300, 3400, 140, "#8E99A6", 'opacity=".35"');
    // ต้นไม้ใหญ่กระถางสูง + ถังรีไซเคิล + หุ่นยนต์ดูดฝุ่น
    s += KIT.plant(620, -70, 0.7, t, "#2B2F3A");
    for (const [x, c, lb] of [[-1050, "#2F6FB0", "กระดาษ"], [-900, "#F2C14E", "ขวด"]]) s += SHD(x, 230, 70) + RR(x - 60, 60, 120, 170, 10, c) + R(x - 60, 60, 120, 24, sh(c, -0.2)) + T(x, 170, lb, 26, "#FFFFFF");
    // ไวท์บอร์ดล้อเลื่อน + เก้าอี้ว่างแถวหน้า + ตู้ล็อกเกอร์
    s += SHD(-1300, 700, 160) + L(-1420, 700, -1420, 300, "#9AA6B0", 10) + L(-1180, 700, -1180, 300, "#9AA6B0", 10) + RR(-1460, -60, 320, 380, 10, "#FBFCFD", 'stroke="#AEB6BE" stroke-width="10"') + Pth("M -1420,120 C -1380,40 -1320,180 -1260,80 S -1180,140 -1170,90", "none", ST("#C9493B", 6)) + T(-1300, 20, "ไอเดีย!", 44, "#2F6FB0") + C(-1420, 712, 16, "#2B2F3A") + C(-1180, 712, 16, "#2B2F3A");
    s += SHD(1350, 820, 200) + RR(1200, 400, 300, 420, 10, "#AEB6BE") + [0, 1, 2].map((i) => R(1206 + i * 98, 406, 92, 408, "#C9D0D7") + RR(1270 + i * 98, 560, 12, 40, 6, "#7E8994") + [0, 1, 2].map((k) => R(1220 + i * 98, 430 + k * 12, 60, 4, "#9AA6B0")).join("")).join("");
    const rx = 300 + Math.sin(t * 0.4) * 400;
    s += SHD(rx, 520, 90) + E(rx, 500, 90, 26, "#2B2F3A") + E(rx, 488, 80, 20, "#3A4050") + C(rx + 40, 486, 6, "#68C35A");
    return s;
  }
  function officeIsland(t, o) {
    // ปลั๊กไฟใต้โต๊ะ + หูฟังห้อยข้างจอ + ขวดน้ำ
    let s = "";
    for (const dx of [-560, 240]) s += Pth(`M ${dx + 300},-330 q 30,40 0,80`, "none", ST("#2B2F3A", 6)) + RR(dx + 280, -260, 40, 50, 16, "#2B2F3A") + RR(dx - 160, -330, 36, 80, 10, "#5FB6E0", 'opacity=".75"') + R(dx - 156, -346, 28, 18, "#2F6FB0");
    return s;
  }
  // ---------- ตลาด ----------
  function bunting(x0, x1, y, t) {
    let s = Pth(`M ${x0},${y} Q ${(x0 + x1) / 2},${y + 120} ${x1},${y}`, "none", ST("#5A4A42", 3)), n = Math.round((x1 - x0) / 80);
    for (let i = 1; i < n; i++) { const u = i / n, x = x0 + (x1 - x0) * u, yy = y + 4 * 120 * u * (1 - u) * 0.5 * 2 / 2 * 2 / 2 + 240 * u * (1 - u) - 0, sw = Math.sin(t * 3 + i) * 4; s += Pth(`M ${f(x - 26)},${f(yy)} L ${f(x + 26)},${f(yy)} L ${f(x + sw)},${f(yy + 56)} Z`, ["#E4572E", "#F2C14E", "#2F8F4F", "#2F6FB0", "#F2668B"][i % 5]); }
    return s;
  }
  function motorbike(x, y, c, dir = 1) {
    let s = `<g transform="translate(${x},${y}) scale(${dir},1)">` + SHD(0, 4, 170);
    s += C(-120, -60, 58, "#2B2B2B") + C(-120, -60, 30, "#9AA0A6") + C(140, -60, 58, "#2B2B2B") + C(140, -60, 30, "#9AA0A6");
    s += Pth("M -150,-110 C -150,-180 -40,-200 20,-170 L 90,-120 L 150,-140 L 160,-110 L 100,-60 L -60,-60 Z", c) + RR(-160, -210, 180, 40, 18, "#2B2B2B") + L(110, -150, 150, -280, "#5E6B78", 10) + L(120, -280, 190, -290, "#2B2B2B", 10) + C(160, -230, 18, "#F7F3EC") + RR(170, -160, 80, 60, 10, "#C8CED4", 'opacity=".9"');
    return s + `</g>`;
  }
  function foodCart(x, y, t) {
    let s = SHD(x, y + 6, 260) + C(x - 170, y - 50, 50, "#2B2B2B") + C(x - 170, y - 50, 22, "#9AA0A6") + C(x + 170, y - 50, 50, "#2B2B2B") + C(x + 170, y - 50, 22, "#9AA0A6");
    s += R(x - 260, y - 400, 520, 300, "#C9D0D7") + R(x - 260, y - 400, 520, 30, "#9AA6B0") + R(x - 240, y - 350, 480, 220, "url(#oGlass)");
    for (let i = 0; i < 9; i++) s += C(x - 200 + (i % 3) * 50, y - 230 - Math.floor(i / 3) * 20, 18, "#C98A3E") + Pth(`M ${x - 210 + (i % 3) * 50},${y - 240 - Math.floor(i / 3) * 20} l 40,-20`, "none", ST("#E8D6A8", 5));
    s += RR(x + 40, y - 300, 180, 140, 20, "#9AA0A6") + E(x + 130, y - 300, 90, 18, "#7E848A");
    for (let i = 0; i < 3; i++) { const ph = t * 1.2 + i * 1.7; s += Pth(`M ${x + 100 + i * 30},${y - 320} C ${x + 80 + i * 30},${y - 380} ${x + 120 + i * 30},${y - 420} ${x + 100 + i * 30},${f(y - 480 - 20 * Math.sin(ph))}`, "none", `stroke="url(#hSteam)" stroke-width="16" stroke-linecap="round" opacity="${f(0.6 + 0.2 * Math.sin(ph))}"`); }
    s += R(x - 280, y - 700, 20, 300, "#5A4A42") + R(x + 260, y - 700, 20, 300, "#5A4A42") + Pth(`M ${x - 320},${y - 700} L ${x + 320},${y - 700} L ${x + 290},${y - 640} L ${x - 290},${y - 640} Z`, "#E4572E");
    s += RR(x - 200, y - 640, 400, 80, 10, "#FFF6E0") + T(x, y - 584, "ไก่ทอด ลูกชิ้น", 44, "#C9493B");
    return s;
  }
  function marketWall(t, o) {
    let s = bunting(-1700, -100, -1180, t) + bunting(-100, 1600, -1180, t);
    s += motorbike(-560, -330, "#C9493B", 1) + motorbike(540, -340, "#2F6FB0", -1);
    s += foodCart(1520, -330, t);
    // ถุงพลาสติกห้อยกับแผง + ป้ายผ้า
    for (let i = 0; i < 5; i++) { const x = -1350 + i * 60; s += Pth(`M ${x},-560 l 40,0 l 10,80 l -60,0 Z`, ["#FFFFFF", "#E4572E", "#2F8F4F"][i % 3], 'opacity=".9"'); }
    s += RR(-500, -1040, 600, 90, 10, "#FFF6E0") + T(-200, -980, "ตลาดสดเช้า ดูเพลิน", 52, "#2F5E6B");
    // พื้นกระเบื้อง + ตะแกรงระบายน้ำ + ใบไม้
    for (let y = -40; y < 1500; y += 110) for (let x = -1800; x < 1800; x += 220) s += R(x + ((y / 110) % 2) * 110, y, 220, 110, "none", ST("#8C8378", 2, 0.35));
    s += R(-1800, 140, 3600, 30, "#5A544C") + [...Array(36)].map((_, i) => L(-1800 + i * 100, 140, -1800 + i * 100, 170, "#3A362F", 4)).join("");
    // เก้าอี้พลาสติก ตะกร้า หมาจรนอน กองลัง (เติมพื้นที่ว่างกลางตลาด)
    const stool = (x, y, c) => SHD(x, y + 4, 70) + Pth(`M ${x - 60},${y - 120} L ${x + 60},${y - 120} L ${x + 50},${y} L ${x + 30},${y} L ${x + 30},${y - 70} L ${x - 30},${y - 70} L ${x - 30},${y} L ${x - 50},${y} Z`, c) + E(x, y - 120, 62, 14, sh(c, 0.15));
    s += stool(-1300, 420, "#E4572E") + stool(-1130, 470, "#2F6FB0") + stool(1180, 400, "#F2C14E");
    const basket = (x, y, fill) => SHD(x, y + 4, 110) + Pth(`M ${x - 110},${y - 90} L ${x + 110},${y - 90} L ${x + 85},${y} L ${x - 85},${y} Z`, "#C9A27A") + [0, 1, 2].map((i) => L(x - 100 + i * 6, y - 60 + i * 26, x + 100 - i * 6, y - 60 + i * 26, "#A8835E", 4)).join("") + fill;
    s += basket(-800, 700, [0, 1, 2, 3, 4, 5].map((i) => C(-860 + i * 24, 600 - (i % 2) * 14, 20, "#F2A33A")).join("")) + basket(950, 760, [0, 1, 2, 3].map((i) => C(890 + i * 40, 600, 30, "#9CCB7A")).join(""));
    const dog = (x, y) => SHD(x, y + 6, 150) + E(x, y - 40, 140, 44, "#C9A27A") + C(x - 130, y - 56, 44, "#C9A27A") + Pth(`M ${x - 160},${y - 90} l -14,40 l 30,-6 Z`, "#A8835E") + Pth(`M ${x - 150},${y - 52} q 8,6 16,0`, "none", ST("#3A2A26", 3)) + E(x - 170, y - 40, 10, 7, "#3A2A26") + Pth(`M ${x + 130},${y - 40} q 40,10 50,-20`, "none", ST("#C9A27A", 14)) + E(x - 20, y - 20, 50, 18, "#E8D3B0");
    s += dog(380, 900);
    for (const [x, y, c] of [[1400, 640, "#2F8F4F"], [1480, 560, "#E4572E"], [-1480, 900, "#2F6FB0"]]) s += SHD(x, y + 4, 90) + RR(x - 80, y - 100, 160, 100, 8, c) + L(x - 70, y - 66, x + 70, y - 66, sh(c, -0.25), 4) + L(x - 70, y - 34, x + 70, y - 34, sh(c, -0.25), 4);
    s += E(-200, 1100, 320, 36, "#C9D5DA", 'opacity=".35"') + E(-260, 1094, 120, 10, "#FFFFFF", 'opacity=".35"');
    const r = RK.rng(66); for (let i = 0; i < 14; i++) { const x = -1700 + r() * 3400, y = 200 + r() * 1100, a = r() * 180; s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="18" ry="8" fill="${r() < 0.5 ? "#8DA65A" : "#C9A04A"}" transform="rotate(${f(a)} ${f(x)} ${f(y)})"/>`; }
    return s;
  }
  function marketIsland(t, o) {
    // ถุงแดงแขวนมุมแผง + ผ้าขนหนูพาดบ่าแผง + กระด้ง
    const x = o.stallX ?? 0, y = -210;
    let s = Pth(`M ${x + 480},${y - 260} l 40,0 l 12,90 l -64,0 Z`, "#E4572E", 'opacity=".95"') + Pth(`M ${x + 540},${y - 250} l 34,0 l 10,80 l -54,0 Z`, "#FFFFFF", 'opacity=".95"');
    s += L(x + 460, -900, x + 500, y - 260, "#5A4A42", 3) + L(x + 560, -900, x + 556, y - 250, "#5A4A42", 3);
    s += E(x - 560, y + 2, 100, 22, "#C9A27A") + [0, 1, 2, 3, 4].map((i) => C(x - 600 + i * 22, y - 10, 12, "#86B84A")).join("");
    return s;
  }

  // ---------- ต่อท้ายฉากเดิม ----------
  const add = (set, key, fn) => { const S = RK.flatSets[set], old = S[key]; S[key] = (t, o) => old(t, o) + `<g transform="scale(${K})">${fn(t, o || {})}</g>`; };
  add("living", "wall", livingWall); add("living", "island", livingIsland);
  add("dining", "wall", diningWall); add("dining", "island", diningIsland);
  add("office", "wall", officeWall); add("office", "island", officeIsland);
  add("market", "wall", marketWall); add("market", "island", marketIsland);
})(window);
