// flat_kitchen.js — ฉากครัวบ้านยามเช้า (แสงแดดลอดหน้าต่าง) พิกัดโลก: พื้นหน้าเวที y=0
(function (G) {
  const RK = G.RK, f = RK.f, sh = RK.shade;
  const R = (x, y, w, h, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${c}" ${ex}/>`;
  const RR = (x, y, w, h, r, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" fill="${c}" ${ex}/>`;
  const C = (x, y, r, c, ex = "") => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" ${ex}/>`;
  const E = (x, y, rx, ry, c, ex = "") => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${c}" ${ex}/>`;
  const Pth = (d, c, ex = "") => `<path d="${d}" fill="${c}" ${ex}/>`;
  const L = (x1, y1, x2, y2, c, w, ex = "") => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}" ${ex}/>`;

  const WALL_Y = -70;          // เส้นผนังชนพื้น
  const COUNTER_TOP = -400;    // ท็อปเคาน์เตอร์หลัง
  const WIN = { x: -620, y: -1330, w: 560, h: 560 };

  RK.flatDefs = `
  <filter id="fBlur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="fBlur3"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="fBlur20" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20"/></filter>
  <filter id="fGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
  <filter id="litL" x="-20%" y="-10%" width="140%" height="120%">
    <feOffset in="SourceAlpha" dx="4" dy="2" result="o1"/><feComposite in="SourceAlpha" in2="o1" operator="out" result="rim"/>
    <feFlood flood-color="#FFE2B0" flood-opacity=".42"/><feComposite in2="rim" operator="in" result="rimC"/>
    <feOffset in="SourceAlpha" dx="-26" dy="0" result="o2"/><feComposite in="SourceAlpha" in2="o2" operator="out" result="sb"/>
    <feGaussianBlur in="sb" stdDeviation="6" result="sbb"/><feComposite in="sbb" in2="SourceAlpha" operator="in" result="sbc"/>
    <feFlood flood-color="#3A2440" flood-opacity=".30"/><feComposite in2="sbc" operator="in" result="shC"/>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="shC"/><feMergeNode in="rimC"/></feMerge></filter>
  <filter id="litR" x="-20%" y="-10%" width="140%" height="120%">
    <feOffset in="SourceAlpha" dx="-4" dy="2" result="o1"/><feComposite in="SourceAlpha" in2="o1" operator="out" result="rim"/>
    <feFlood flood-color="#FFE2B0" flood-opacity=".42"/><feComposite in2="rim" operator="in" result="rimC"/>
    <feOffset in="SourceAlpha" dx="26" dy="0" result="o2"/><feComposite in="SourceAlpha" in2="o2" operator="out" result="sb"/>
    <feGaussianBlur in="sb" stdDeviation="6" result="sbb"/><feComposite in="sbb" in2="SourceAlpha" operator="in" result="sbc"/>
    <feFlood flood-color="#3A2440" flood-opacity=".30"/><feComposite in2="sbc" operator="in" result="shC"/>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="shC"/><feMergeNode in="rimC"/></feMerge></filter>
  <linearGradient id="kSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FC3E6"/><stop offset=".55" stop-color="#F7D9B5"/><stop offset="1" stop-color="#FFC48C"/></linearGradient>
  <radialGradient id="kSun"><stop offset="0" stop-color="#FFFBE8"/><stop offset=".25" stop-color="#FFF0C2" stop-opacity=".9"/><stop offset="1" stop-color="#FFD59A" stop-opacity="0"/></radialGradient>
  <linearGradient id="kWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9D8BE"/><stop offset="1" stop-color="#F2E4CD"/></linearGradient>
  <linearGradient id="kFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B98A5E"/><stop offset="1" stop-color="#8E623F"/></linearGradient>
  <linearGradient id="kBeam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3CF" stop-opacity=".55"/><stop offset=".6" stop-color="#FFE6B0" stop-opacity=".18"/><stop offset="1" stop-color="#FFE6B0" stop-opacity="0"/></linearGradient>
  <radialGradient id="kPatch"><stop offset="0" stop-color="#FFE9B8" stop-opacity=".55"/><stop offset="1" stop-color="#FFE9B8" stop-opacity="0"/></radialGradient>
  <radialGradient id="kLamp"><stop offset="0" stop-color="#FFE3A3" stop-opacity=".75"/><stop offset="1" stop-color="#FFC56B" stop-opacity="0"/></radialGradient>
  <radialGradient id="vigF" cx=".5" cy=".48" r=".78"><stop offset=".55" stop-color="#1A0E10" stop-opacity="0"/><stop offset="1" stop-color="#1A0E10" stop-opacity=".7"/></radialGradient>
  <linearGradient id="gradeTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB46B" stop-opacity=".16"/><stop offset=".5" stop-color="#FFB46B" stop-opacity="0"/><stop offset="1" stop-color="#5A2E48" stop-opacity=".18"/></linearGradient>
  <linearGradient id="kSteam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <clipPath id="kWinClip"><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}"/></clipPath>`;

  // ---------- นอกหน้าต่าง (ชั้นไกล เลื่อนช้ากว่า) ----------
  function outside(t) {
    let s = R(WIN.x - 300, WIN.y - 200, WIN.w + 600, WIN.h + 400, "url(#kSky)");
    s += C(WIN.x + 380, WIN.y + 330, 260, "url(#kSun)") + C(WIN.x + 380, WIN.y + 330, 46, "#FFF8E2");
    // เมฆ
    const cl = (x, y, k) => `<g opacity=".85" transform="translate(${f(x)},${f(y)}) scale(${k})">` + E(0, 0, 80, 26, "#FFF4E6") + E(-50, 8, 50, 20, "#FFEBD6") + E(56, 6, 60, 22, "#FFEBD6") + `</g>`;
    s += cl(WIN.x + 120 + t * 6, WIN.y + 120, 1) + cl(WIN.x + 460 + t * 4, WIN.y + 70, 0.7);
    // ภูเขา/ต้นไม้ไกล หลังคาบ้านไทย
    s += Pth(`M ${WIN.x - 200},${WIN.y + 430} C ${WIN.x},${WIN.y + 360} ${WIN.x + 200},${WIN.y + 400} ${WIN.x + 360},${WIN.y + 380} C ${WIN.x + 520},${WIN.y + 360} ${WIN.x + 700},${WIN.y + 400} ${WIN.x + 900},${WIN.y + 410} L ${WIN.x + 900},${WIN.y + 800} L ${WIN.x - 200},${WIN.y + 800} Z`, "#C9A99A", 'opacity=".75"');
    const r = RK.rng(11);
    for (let i = 0; i < 9; i++) {
      const x = WIN.x - 60 + i * 80 + r() * 30, y = WIN.y + 430 + r() * 30, k = 0.7 + r() * 0.6;
      s += E(x, y, 60 * k, 80 * k, i % 2 ? "#7FA088" : "#6E917B") + E(x - 20 * k, y - 30 * k, 36 * k, 40 * k, "#8DB096", 'opacity=".8"');
    }
    // หลังคาเพื่อนบ้าน + ต้นมะพร้าว
    s += Pth(`M ${WIN.x + 40},${WIN.y + 500} L ${WIN.x + 150},${WIN.y + 430} L ${WIN.x + 260},${WIN.y + 500} Z`, "#B35D4C") + R(WIN.x + 60, WIN.y + 500, 180, 80, "#E9D2B4");
    s += Pth(`M ${WIN.x + 440},${WIN.y + 600} C ${WIN.x + 450},${WIN.y + 500} ${WIN.x + 460},${WIN.y + 400} ${WIN.x + 470},${WIN.y + 300}`, "none", 'stroke="#7A5A44" stroke-width="10"');
    for (let a = 0; a < 6; a++) { const an = a * 60 + Math.sin(t * 1.3 + a) * 4; s += `<path d="M 0,0 C 30,-20 70,-14 110,20" stroke="#5E8A62" stroke-width="12" fill="none" stroke-linecap="round" transform="translate(${WIN.x + 470},${WIN.y + 300}) rotate(${f(an)})"/>`; }
    // นก
    for (let i = 0; i < 3; i++) { const bx = WIN.x + 200 + i * 40 + t * 18, by = WIN.y + 200 + i * 14 + Math.sin(t * 4 + i) * 6, fl = Math.sin(t * 12 + i * 2) * 6; s += `<path d="M ${f(bx - 10)},${f(by - fl)} Q ${f(bx - 4)},${f(by - 4)} ${f(bx)},${f(by)} Q ${f(bx + 4)},${f(by - 4)} ${f(bx + 10)},${f(by - fl)}" stroke="#5B4A52" stroke-width="3" fill="none"/>`; }
    return s;
  }

  // ---------- ผนัง + ของบนผนัง ----------
  function wall(t) {
    let s = R(-1500, -2200, 3000, 2200 + WALL_Y, "url(#kWall)");
    // ลายผนังจางๆ
    for (let x = -1500; x < 1500; x += 120) s += L(x, -2200, x, WALL_Y, "#DCC8A8", 2, 'opacity=".35"');
    // บัวเพดาน + คาน
    s += R(-1500, -1700, 3000, 40, "#D2BC9A") + R(-1500, -1662, 3000, 10, "#C4AA84");
    // หน้าต่าง
    s += `<g clip-path="url(#kWinClip)"><g transform="translate(${f(RK._camPx * 0.35)},${f(RK._camPy * 0.15)})">${outside(t)}</g></g>`;
    s += `<rect x="${WIN.x - 26}" y="${WIN.y - 26}" width="${WIN.w + 52}" height="${WIN.h + 52}" fill="none" stroke="#9C7651" stroke-width="40"/>`;
    s += R(WIN.x + WIN.w / 2 - 9, WIN.y, 18, WIN.h, "#B08A62") + R(WIN.x, WIN.y + WIN.h * 0.45 - 9, WIN.w, 18, "#B08A62");
    s += R(WIN.x - 50, WIN.y + WIN.h + 14, WIN.w + 100, 26, "#8B6744"); // ขอบหน้าต่าง
    // กระถางสมุนไพรบนขอบหน้าต่าง
    for (let i = 0; i < 3; i++) {
      const x = WIN.x + 70 + i * 190, y = WIN.y + WIN.h + 14;
      s += Pth(`M ${x - 34},${y - 60} L ${x + 34},${y - 60} L ${x + 26},${y} L ${x - 26},${y} Z`, ["#C96F4A", "#E3B062", "#6C8FA6"][i]);
      for (let k = 0; k < 7; k++) { const a = -70 + k * 23 + Math.sin(t * 1.5 + k + i) * 3; s += `<ellipse cx="0" cy="-34" rx="11" ry="30" fill="${k % 2 ? "#5F9A5C" : "#76B06C"}" transform="translate(${x},${y - 60}) rotate(${f(a)}) "/>`; }
    }
    // ผ้าม่าน
    const cur = (x0, sd) => {
      const sw = Math.sin(t * 1.1 + sd) * 8;
      return Pth(`M ${x0},${WIN.y - 80} L ${x0 + sd * 150},${WIN.y - 80} C ${x0 + sd * 120 + sw},${WIN.y + 120} ${x0 + sd * 70 + sw},${WIN.y + 260} ${x0 + sd * 90 + sw * 1.4},${WIN.y + 330} C ${x0 + sd * 110 + sw},${WIN.y + 420} ${x0 + sd * 140 + sw},${WIN.y + 520} ${x0 + sd * 160 + sw},${WIN.y + 640} L ${x0},${WIN.y + 640} Z`, "#F6E7C4", 'opacity=".96"') +
        L(x0 + sd * 40, WIN.y - 70, x0 + sd * 34 + sw * 0.5, WIN.y + 630, "#E5CF9E", 6, 'opacity=".7"') + L(x0 + sd * 90, WIN.y - 70, x0 + sd * 80 + sw, WIN.y + 300, "#E5CF9E", 5, 'opacity=".6"') +
        RR(x0 + sd * 72 - 26 + sw * 1.4, WIN.y + 320, 52, 18, 9, "#D98E6A");
    };
    s += cur(WIN.x - 60, 1) + cur(WIN.x + WIN.w + 60, -1);
    s += RR(WIN.x - 120, WIN.y - 100, WIN.w + 240, 16, 8, "#7C5A3E") + C(WIN.x - 120, WIN.y - 92, 14, "#7C5A3E") + C(WIN.x + WIN.w + 120, WIN.y - 92, 14, "#7C5A3E");
    // กระเบื้องหลังเคาน์เตอร์
    s += R(-1500, -720, 2200, 320, "#F4F1EA");
    for (let y = -720; y < COUNTER_TOP; y += 40) s += L(-1500, y, 700, y, "#D8D2C6", 2);
    for (let y = -720, r = 0; y < COUNTER_TOP; y += 40, r++) for (let x = -1500 + (r % 2) * 40; x < 700; x += 80) s += L(x, y, x, y + 40, "#D8D2C6", 2);
    // ชั้นวางของเปิด (ขวาของหน้าต่าง)
    const shelf = (y) => R(60, y, 560, 18, "#9C7651") + Pth(`M 90,${y + 18} L 110,${y + 50} L 90,${y + 50} Z M 590,${y + 18} L 570,${y + 50} L 590,${y + 50} Z`, "#8B6744");
    s += shelf(-1160) + shelf(-920);
    const jar = (x, y, w, h, c, lid) => RR(x, y - h, w, h, 10, "#F3F6F4", 'opacity=".9"') + RR(x + 4, y - h * 0.65, w - 8, h * 0.6, 6, c) + RR(x - 2, y - h - 14, w + 4, 16, 5, lid) + R(x + 8, y - h * 0.55, w - 16, 18, "#FFF8E6");
    s += jar(90, -1160, 60, 90, "#E3A548", "#9C7651") + jar(165, -1160, 52, 70, "#C9493B", "#5A3D2B") + jar(232, -1160, 66, 110, "#86A85E", "#9C7651");
    // จานตั้ง
    for (let i = 0; i < 3; i++) s += E(360 + i * 26, -1230, 12, 70, ["#E7EEF0", "#9FC4CF", "#F2D7A0"][i]) + E(360 + i * 26, -1230, 6, 50, "#fff", 'opacity=".5"');
    // ต้นพลูด่างย้อย
    s += Pth(`M 500,-1160 L 600,-1160 L 590,-1240 L 510,-1240 Z`, "#E9E2D6") + R(500, -1180, 100, 10, "#D7CBB6");
    const vine = (x, len, ph) => { let v = "", px = x, py = -1160; for (let k = 0; k < len; k++) { const nx = x + Math.sin(k * 0.8 + ph + t * 0.8) * 12, ny = -1150 + k * 34; v += L(px, py, nx, ny, "#4F7F4A", 4); v += `<ellipse cx="${f(nx + (k % 2 ? 14 : -14))}" cy="${f(ny)}" rx="16" ry="11" fill="${k % 3 ? "#6FAA5E" : "#9CCB7A"}" transform="rotate(${k % 2 ? 30 : -30} ${f(nx + (k % 2 ? 14 : -14))} ${f(ny)})"/>`; px = nx; py = ny; } return v; };
    s += vine(520, 9, 0) + vine(560, 6, 1.4) + vine(585, 11, 2.2);
    for (let k = 0; k < 9; k++) s += `<ellipse cx="${f(510 + k * 11)}" cy="-1262" rx="16" ry="11" fill="${k % 2 ? "#6FAA5E" : "#8EC170"}" transform="rotate(${-40 + k * 10} ${f(510 + k * 11)} -1262)"/>`;
    // แก้ว/เหยือกบนชั้นล่าง + ตะขอแขวนถ้วย
    for (let i = 0; i < 4; i++) s += RR(100 + i * 70, -1010, 50, 70, 8, ["#E46F5B", "#F2C14E", "#5E8FB0", "#F7F3EA"][i]) + R(110 + i * 70, -995, 30, 6, "#fff", 'opacity=".35"');
    s += RR(400, -1040, 90, 120, 18, "#D9E7EC", 'opacity=".9"') + Pth(`M 490,-1010 C 520,-1010 520,-950 490,-950`, "none", 'stroke="#D9E7EC" stroke-width="10"');
    for (let i = 0; i < 5; i++) { const sw = Math.sin(t * 2 + i) * 2; s += L(120 + i * 100, -902, 120 + i * 100, -880, "#8C8C8C", 3) + `<g transform="rotate(${f(sw)} ${120 + i * 100} -880)">` + RR(100 + i * 100, -880, 40, 46, 6, ["#F2C14E", "#E46F5B", "#F7F3EA", "#7DB3A1", "#E7A3B8"][i]) + `</g>`; }
    // นาฬิกา (7 โมงเช้า)
    const cx = 900, cy = -1300;
    s += C(cx, cy, 92, "#7C5A3E") + C(cx, cy, 80, "#FFFDF6");
    for (let i = 0; i < 12; i++) { const a = i * 30 * Math.PI / 180; s += L(cx + Math.sin(a) * 64, cy - Math.cos(a) * 64, cx + Math.sin(a) * 72, cy - Math.cos(a) * 72, "#3D3036", i % 3 ? 3 : 6); }
    const mn = (t / 60) * 360, hr = 210 + t / 120 * 30;
    s += L(cx, cy, cx + Math.sin(hr * Math.PI / 180) * 40, cy - Math.cos(hr * Math.PI / 180) * 40, "#3D3036", 8, 'stroke-linecap="round"') + L(cx, cy, cx + Math.sin(mn * Math.PI / 180) * 60, cy - Math.cos(mn * Math.PI / 180) * 60, "#3D3036", 5, 'stroke-linecap="round"');
    const sc = t * 360 % 360; s += L(cx, cy, cx + Math.sin(sc * Math.PI / 180) * 62, cy - Math.cos(sc * Math.PI / 180) * 62, "#E4572E", 2.5) + C(cx, cy, 7, "#E4572E");
    // ปฏิทิน + กรอบรูปครอบครัว
    s += RR(720, -1150, 150, 200, 6, "#FFFDF6") + R(720, -1150, 150, 50, "#E4572E") + C(760, -1150, 7, "#7C5A3E") + C(830, -1150, 7, "#7C5A3E");
    for (let r2 = 0; r2 < 4; r2++) for (let c2 = 0; c2 < 5; c2++) s += R(735 + c2 * 26, -1085 + r2 * 32, 16, 16, "#D9CFC0");
    s += `<circle cx="${735 + 2 * 26 + 8}" cy="${-1085 + 2 * 32 + 8}" r="16" fill="none" stroke="#E4572E" stroke-width="4"/>`;
    const frame = (x, y, w, h, bg) => R(x, y, w, h, "#7C5A3E") + R(x + 10, y + 10, w - 20, h - 20, bg) + C(x + w * 0.35, y + h * 0.55, w * 0.13, "#E8B690") + C(x + w * 0.65, y + h * 0.6, w * 0.11, "#F3C9A8") + Pth(`M ${x + 10},${y + h - 10} C ${x + w * 0.3},${y + h * 0.7} ${x + w * 0.7},${y + h * 0.72} ${x + w - 10},${y + h - 10} Z`, "#7AA2C4");
    s += frame(930, -1120, 130, 160, "#F2D7A0") + frame(1080, -1060, 100, 120, "#BFD8C8");
    // ตู้เย็น
    s += RR(980, -1000, 360, 940, 30, "#DDE8EA") + RR(980, -1000, 360, 320, 30, "#E8F0F2") + L(980, -680, 1340, -680, "#B9CBD0", 4);
    s += RR(1000, -940, 18, 180, 9, "#AFC1C6") + RR(1000, -620, 18, 260, 9, "#AFC1C6");
    s += RR(1110, -600, 120, 150, 4, "#FFFFFF") + Pth(`M 1130,-480 L 1170,-560 L 1210,-480 Z`, "#7FB069") + C(1200, -575, 16, "#F2C14E") + C(1150, -520, 10, "#E46F5B");
    s += C(1260, -880, 18, "#E46F5B") + RR(1080, -900, 50, 34, 6, "#F2C14E") + C(1290, -560, 14, "#5E8FB0") + RR(1250, -430, 60, 40, 4, "#FFF4D6");
    s += R(980, -1000, 14, 940, "#FFFFFF", 'opacity=".35"');
    // ปลั๊ก/สวิตช์
    s += RR(780, -820, 50, 70, 6, "#F6F2EA") + RR(796, -800, 18, 30, 4, "#E1D9CB");
    // เคาน์เตอร์หลัง
    s += R(-1500, COUNTER_TOP, 2250, 36, "#C89B6D") + R(-1500, COUNTER_TOP + 30, 2250, 8, "#A87C52");
    s += R(-1500, COUNTER_TOP + 38, 2250, -COUNTER_TOP + WALL_Y - 38, "#6F9C93");
    for (let x = -1480; x < 740; x += 230) { s += RR(x, COUNTER_TOP + 62, 210, -COUNTER_TOP + WALL_Y - 90, 8, "#7EAAA0") + RR(x + 14, COUNTER_TOP + 76, 182, -COUNTER_TOP + WALL_Y - 118, 6, "none", 'stroke="#6A958B" stroke-width="5"') + RR(x + 95, COUNTER_TOP + 96, 20, 6, 3, "#D9C08A"); }
    s += R(-1500, WALL_Y - 26, 2250, 26, "#4E7770");
    // ของบนเคาน์เตอร์หลัง: อ่างล้าง/ก๊อก, ที่คว่ำจาน, หม้อหุงข้าว, กาน้ำ, เขียง
    s += Pth(`M -440,${COUNTER_TOP} L -440,${COUNTER_TOP - 120} C -440,${COUNTER_TOP - 170} -360,${COUNTER_TOP - 170} -360,${COUNTER_TOP - 120} L -360,${COUNTER_TOP - 100}`, "none", 'stroke="#AEB6BC" stroke-width="16" stroke-linecap="round"');
    s += R(-600, COUNTER_TOP - 4, 320, 10, "#9AA3A9");
    for (let i = 0; i < 5; i++) s += E(-200 + i * 22, COUNTER_TOP - 60, 10, 58, ["#F2EFE8", "#E4E9EC", "#F7EBD8"][i % 3]) ;
    s += R(-230, COUNTER_TOP - 20, 140, 20, "#AEB6BC");
    s += RR(-1180, COUNTER_TOP - 130, 170, 130, 50, "#F4F1EA") + E(-1095, COUNTER_TOP - 130, 70, 18, "#E4572E") + C(-1095, COUNTER_TOP - 60, 12, "#7FB069") + RR(-1130, COUNTER_TOP - 92, 70, 20, 6, "#2E3138");
    s += Pth(`M -880,${COUNTER_TOP} L -870,${COUNTER_TOP - 110} C -860,${COUNTER_TOP - 150} -760,${COUNTER_TOP - 150} -750,${COUNTER_TOP - 110} L -740,${COUNTER_TOP} Z`, "#3D6B78") + E(-810, COUNTER_TOP - 145, 22, 8, "#2B4E58") + Pth(`M -750,${COUNTER_TOP - 70} C -720,${COUNTER_TOP - 70} -712,${COUNTER_TOP - 110} -700,${COUNTER_TOP - 120}`, "none", 'stroke="#3D6B78" stroke-width="12" stroke-linecap="round"');
    s += RR(80, COUNTER_TOP - 16, 260, 16, 4, "#D8AE7A") + E(160, COUNTER_TOP - 28, 46, 14, "#F28C3B") + E(250, COUNTER_TOP - 26, 30, 12, "#7FB069") + Pth(`M 290,${COUNTER_TOP - 20} L 380,${COUNTER_TOP - 40} L 388,${COUNTER_TOP - 32} Z`, "#C9CED2") + R(370, COUNTER_TOP - 46, 50, 16, "#3B3030");
    s += RR(460, COUNTER_TOP - 150, 60, 150, 10, "#C96F4A") + L(480, COUNTER_TOP - 150, 470, COUNTER_TOP - 230, "#9B6B43", 8) + L(500, COUNTER_TOP - 150, 515, COUNTER_TOP - 240, "#B9BDC4", 8) + L(490, COUNTER_TOP - 150, 492, COUNTER_TOP - 220, "#E3B062", 8);
    s += E(620, COUNTER_TOP - 26, 60, 26, "#E9E2D6") + C(600, COUNTER_TOP - 40, 16, "#9CCB5E") + C(630, COUNTER_TOP - 46, 16, "#B7DA6E") + C(650, COUNTER_TOP - 36, 14, "#9CCB5E");
    // พื้นไม้
    s += R(-1500, WALL_Y, 3000, 1600, "url(#kFloor)");
    const r = RK.rng(5);
    for (let y = WALL_Y + 30, k = 0; y < 1500; y += 46 + k * 4, k++) {
      s += L(-1500, y, 1500, y, "#7A5235", 3, 'opacity=".5"');
      for (let x = -1500 + r() * 300; x < 1500; x += 300 + r() * 260) s += L(x, y, x, y + 46 + k * 4, "#7A5235", 3, 'opacity=".35"');
    }
    // พรม
    s += Pth(`M -900,180 L 700,180 L 820,520 L -1020,520 Z`, "#C8553D", 'opacity=".92"') + Pth(`M -860,210 L 670,210 L 770,490 L -970,490 Z`, "none", 'stroke="#F2C14E" stroke-width="8" opacity=".8"') + Pth(`M -800,260 L 620,260 L 700,440 L -890,440 Z`, "none", 'stroke="#F6E7C4" stroke-width="4" opacity=".6" stroke-dasharray="18 14"');
    return s;
  }

  // ---------- โคมไฟห้อยเหนือเกาะครัว ----------
  function lamps(t) {
    let s = "";
    for (const x of [-480, -40]) {
      const sw = Math.sin(t * 0.9 + x) * 1.5;
      s += `<g transform="rotate(${f(sw)} ${x} -1700)">` + L(x, -1700, x, -1180, "#3D3036", 4) + Pth(`M ${x - 70},-1100 C ${x - 64},-1170 ${x - 30},-1190 ${x},-1190 C ${x + 30},-1190 ${x + 64},-1170 ${x + 70},-1100 Z`, "#2F4B4E") + E(x, -1100, 70, 10, "#FFE9B0") + C(x, -1095, 16, "#FFF7DB") + `</g>`;
      s += E(x, -1000, 260, 220, "url(#kLamp)", 'opacity=".55"');
    }
    return s;
  }

  // ---------- เกาะครัว (ชั้นกลาง บังขาคนข้างหลัง) ----------
  function island(t, o) {
    const x0 = o.islandX ?? -720, w = 900, top = -330, bot = -10;
    let s = E(x0 + w / 2, bot + 10, w * 0.55, 28, "#000", 'opacity=".22" filter="url(#fBlur8)"');
    s += R(x0, top + 30, w, bot - top - 30, "#3E5C5A");
    for (let i = 0; i < 3; i++) { const px = x0 + 30 + i * (w - 60) / 3; s += RR(px, top + 66, (w - 60) / 3 - 20, bot - top - 110, 8, "#466866") + RR(px + 12, top + 78, (w - 60) / 3 - 44, bot - top - 134, 6, "none", 'stroke="#38524F" stroke-width="5"') + RR(px + ((w - 60) / 3 - 20) / 2 - 30, top + 100, 60, 10, 5, "#D9C08A"); }
    s += R(x0, bot - 20, w, 20, "#304846");
    s += RR(x0 - 30, top, w + 60, 44, 8, "#D9A66E") + R(x0 - 30, top + 30, w + 60, 14, "#B98552");
    for (let i = 1; i < 9; i++) s += L(x0 - 30 + i * (w + 60) / 9, top + 4, x0 - 30 + i * (w + 60) / 9, top + 30, "#C9925A", 2, 'opacity=".6"');
    // เตา + หม้อ + ไฟ
    const sx = x0 + (o.stoveDX ?? 170);
    s += RR(sx - 120, top - 18, 240, 22, 6, "#2E3138") + RR(sx - 100, top - 26, 200, 10, 4, "#3E434C");
    for (let k = 0; k < 7; k++) { const fl = 14 + Math.sin(t * 22 + k * 1.7) * 4; s += Pth(`M ${sx - 48 + k * 16},${top - 26} Q ${sx - 52 + k * 16},${top - 26 - fl} ${sx - 44 + k * 16},${top - 30 - fl}  Q ${sx - 40 + k * 16},${top - 26 - fl * 0.5} ${sx - 40 + k * 16},${top - 26} Z`, "#5AA9F0", 'opacity=".85"'); }
    s += Pth(`M ${sx - 110},${top - 40} L ${sx + 110},${top - 40} L ${sx + 100},${top - 160} L ${sx - 100},${top - 160} Z`, "#D2453A") + R(sx - 100, top - 120, 200, 12, "#B83A30") + R(sx - 92, top - 156, 20, 110, "#E66A5D", 'opacity=".55"');
    s += RR(sx - 140, top - 150, 40, 18, 9, "#A8342B") + RR(sx + 100, top - 150, 40, 18, 9, "#A8342B");
    s += E(sx, top - 162, 108, 14, "#B83A30") + E(sx, top - 168, 20, 10, "#2E3138");
    // ไอน้ำ
    for (let k = 0; k < 5; k++) {
      const ph = (t * 0.45 + k / 5) % 1, x = sx - 50 + k * 25 + Math.sin(t * 2 + k) * 14 + ph * 20 * Math.sin(k), y = top - 180 - ph * 360;
      s += E(x, y, 26 + ph * 60, 40 + ph * 50, "#FFFFFF", `opacity="${f((1 - ph) * ph * 1.2)}" filter="url(#fBlur20)"`);
    }
    // ชามไข่ + ผลไม้ + เขียงผัก
    const bx = x0 + 620;
    s += Pth(`M ${bx - 80},${top} C ${bx - 80},${top - 70} ${bx + 80},${top - 70} ${bx + 80},${top} Z`, "#F6F1E6") + E(bx, top - 2, 80, 12, "#E2D9C6");
    for (let k = 0; k < 5; k++) s += E(bx - 46 + k * 23, top - 50 - (k % 2) * 14, 18, 23, k % 2 ? "#F7EBD8" : "#EED9BC");
    s += C(x0 + 820, top - 34, 34, "#F28C3B") + C(x0 + 780, top - 28, 30, "#E4572E") + Pth(`M ${x0 + 820},${top - 68} q 10,-14 22,-10`, "none", 'stroke="#5E8A62" stroke-width="6"');
    s += RR(x0 + 40, top - 14, 180, 14, 4, "#D8AE7A") + E(x0 + 90, top - 26, 30, 14, "#7FB069") + E(x0 + 150, top - 24, 26, 12, "#E4572E");
    return s;
  }

  // ---------- ฉากหน้า (เบลอ) ----------
  function foreground(t) {
    let s = "";
    // ต้นไม้แขวนมุมบนขวา
    for (let k = 0; k < 12; k++) { const a = -30 + k * 14 + Math.sin(t + k) * 4; s += `<ellipse cx="0" cy="110" rx="40" ry="110" fill="${k % 2 ? "#3E6E45" : "#558B57"}" transform="translate(1180,-1650) rotate(${f(a)})"/>`; }
    // เก้าอี้ไม้มุมล่างซ้าย
    s += R(-1350, 300, 60, 900, "#6B4A33") + R(-1350, 300, 440, 60, "#7C5A3E") + R(-970, 300, 60, 900, "#6B4A33");
    return s;
  }

  // ---------- แสงแดด + ฝุ่น ----------
  function sunlight(t, o) {
    const k = o.sun ?? 1;
    let s = `<g opacity="${f(k)}" style="mix-blend-mode:screen">`;
    const wx = WIN.x, wy = WIN.y;
    for (let i = 0; i < 3; i++) {
      const fl = 0.85 + Math.sin(t * 0.8 + i * 2) * 0.15;
      const ox = i * 170, w2 = 120 + i * 30;
      s += Pth(`M ${wx + 40 + ox},${wy} L ${wx + 40 + ox + w2},${wy} L ${wx + 1500 + ox + w2 * 2},${wy + 1700} L ${wx + 1250 + ox},${wy + 1700} Z`, "url(#kBeam)", `opacity="${f(fl * 0.9)}" filter="url(#fBlur20)"`);
    }
    s += E(wx + 1160, 120, 520, 130, "url(#kPatch)") + E(wx + 1500, 300, 420, 110, "url(#kPatch)", 'opacity=".7"');
    // ฝุ่นลอยในลำแสง
    const r = RK.rng(91);
    for (let i = 0; i < 46; i++) {
      const u = r(), v = r(), sp = 0.3 + r() * 0.6;
      const yy = wy + 80 + ((v * 1500 + t * 30 * sp) % 1500), xx = wx + 120 + u * 500 + (yy - wy) * 0.7 + Math.sin(t * sp * 2 + i) * 20;
      s += C(xx, yy, 2 + r() * 3.5, "#FFF6DA", `opacity="${f(0.35 + 0.5 * Math.abs(Math.sin(t * 1.3 + i)))}"`);
    }
    return s + `</g>`;
  }

  RK.flatSets = RK.flatSets || {};
  RK.flatSets.kitchen = { wall, lamps, island, foreground, sunlight, WALL_Y };
})(window);
