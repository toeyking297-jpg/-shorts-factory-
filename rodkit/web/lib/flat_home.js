// flat_home.js — ฉากบ้าน: ห้องนั่งเล่น (living) + โต๊ะกินข้าว (dining)
// พิกัดโลก: พื้นหน้าเวที y=0, ผนังชนพื้น WALL_Y, ตัวละครสูง ~620 หน่วย (s=0.62)
// setOpts: { night: true }  → กลางคืน (ไฟโคม/ไฟเพดาน/แสงทีวี, นอกหน้าต่างมืด)
(function (G) {
  const RK = G.RK, f = RK.f, sh = RK.shade;
  const R = (x, y, w, h, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${c}" ${ex}/>`;
  const RR = (x, y, w, h, r, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" fill="${c}" ${ex}/>`;
  const C = (x, y, r, c, ex = "") => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" ${ex}/>`;
  const E = (x, y, rx, ry, c, ex = "") => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${c}" ${ex}/>`;
  const Pth = (d, c, ex = "") => `<path d="${d}" fill="${c}" ${ex}/>`;
  const L = (x1, y1, x2, y2, c, w, ex = "") => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${ex}/>`;
  const ST = (c, w, op = 1) => `stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"`;
  const OUT = "#3A2A26";

  const WALL_Y = -70;

  RK.flatDefs += `
  <linearGradient id="hWallL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9D7C0"/><stop offset="1" stop-color="#D8E2CF"/></linearGradient>
  <linearGradient id="hWallLn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E7F78"/><stop offset="1" stop-color="#8A9387"/></linearGradient>
  <linearGradient id="hWallD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EBD3B0"/><stop offset="1" stop-color="#F3E0C2"/></linearGradient>
  <linearGradient id="hWallDn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9A7A64"/><stop offset="1" stop-color="#B58E6E"/></linearGradient>
  <linearGradient id="hFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B78457"/><stop offset="1" stop-color="#7E5536"/></linearGradient>
  <linearGradient id="hSkyDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8EC6EA"/><stop offset=".7" stop-color="#D9EEF5"/><stop offset="1" stop-color="#F6E9C8"/></linearGradient>
  <linearGradient id="hSkyEve" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B3F7A"/><stop offset=".55" stop-color="#C46A79"/><stop offset="1" stop-color="#F6B27A"/></linearGradient>
  <linearGradient id="hSkyNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121A3A"/><stop offset="1" stop-color="#2F3A6B"/></linearGradient>
  <radialGradient id="hGlow"><stop offset="0" stop-color="#FFE3A3" stop-opacity=".85"/><stop offset="1" stop-color="#FFC56B" stop-opacity="0"/></radialGradient>
  <radialGradient id="hTvGlow"><stop offset="0" stop-color="#9FD8FF" stop-opacity=".55"/><stop offset="1" stop-color="#9FD8FF" stop-opacity="0"/></radialGradient>
  <linearGradient id="hBeam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3CF" stop-opacity=".5"/><stop offset=".6" stop-color="#FFE6B0" stop-opacity=".15"/><stop offset="1" stop-color="#FFE6B0" stop-opacity="0"/></linearGradient>
  <linearGradient id="hSofa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4F7A8C"/><stop offset="1" stop-color="#3B6172"/></linearGradient>
  <linearGradient id="hTv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5DB5E8"/><stop offset=".5" stop-color="#8ED08A"/><stop offset="1" stop-color="#F6C25B"/></linearGradient>
  <linearGradient id="hCloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7F1E6"/><stop offset="1" stop-color="#E9DDC8"/></linearGradient>
  <linearGradient id="hSteam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <pattern id="hRug" width="120" height="60" patternUnits="userSpaceOnUse"><rect width="120" height="60" fill="#B5523F"/><path d="M0,30 L30,10 L60,30 L30,50 Z M60,30 L90,10 L120,30 L90,50 Z" fill="#D9844A"/><circle cx="30" cy="30" r="7" fill="#F3D9A4"/><circle cx="90" cy="30" r="7" fill="#2F5E6B"/></pattern>
  <pattern id="hPaper" width="90" height="90" patternUnits="userSpaceOnUse"><path d="M45,10 C55,25 55,35 45,45 C35,35 35,25 45,10 Z" fill="#E2C59D" opacity=".55"/><circle cx="0" cy="0" r="4" fill="#E2C59D" opacity=".5"/><circle cx="90" cy="90" r="4" fill="#E2C59D" opacity=".5"/></pattern>`;

  // ---------- ของใช้ร่วม ----------
  const rngPick = (r, arr) => arr[Math.floor(r() * arr.length)];
  function floor(rug) {
    let s = R(-1700, WALL_Y, 3400, 1700, "url(#hFloor)");
    for (let y = WALL_Y + 30, k = 0; y < 1600; y += 46 + k * 5, k++) {
      s += L(-1700, y, 1700, y, "#5E3E28", 3, 'opacity=".45"');
      const r = RK.rng(100 + k);
      for (let i = 0; i < 7; i++) { const x = -1700 + r() * 3400; s += L(x, y, x, y + 46 + k * 5, "#5E3E28", 2, 'opacity=".3"'); }
    }
    if (rug) s += `<g transform="translate(${rug[0]},${rug[1]}) scale(1,.18)">` + E(0, 0, rug[2], rug[2] * 0.95, "url(#hRug)") + E(0, 0, rug[2], rug[2] * 0.95, "none", ST("#F3D9A4", 16)) + E(0, 0, rug[2] - 60, rug[2] * 0.95 - 60, "none", ST("#2F5E6B", 10)) + `</g>`;
    return s;
  }
  function baseboard(c) { return R(-1700, WALL_Y - 40, 3400, 40, c) + R(-1700, WALL_Y - 44, 3400, 6, sh(c, 0.15)); }
  function windowView(x, y, w, h, t, o, id) {
    const sky = o.night ? "url(#hSkyNight)" : o.eve ? "url(#hSkyEve)" : "url(#hSkyDay)";
    let s = `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})"><g transform="translate(${f(RK._camPx * 0.3)},${f(RK._camPy * 0.12)})">`;
    s += R(x - 400, y - 200, w + 800, h + 400, sky);
    if (o.night) {
      const r = RK.rng(7); for (let i = 0; i < 30; i++) s += C(x - 200 + r() * (w + 400), y + r() * h * 0.6, 1.5 + r() * 2, "#FFF8D6", `opacity="${f(0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)))}"`);
      s += C(x + w * 0.7, y + h * 0.22, 46, "#FFF4D0") + C(x + w * 0.7 + 16, y + h * 0.22 - 10, 40, o.night ? "#1E2850" : "#fff", 'opacity=".9"');
    } else {
      const cl = (cx, cy, k) => `<g opacity=".9" transform="translate(${f(cx)},${f(cy)}) scale(${k})">` + E(0, 0, 90, 28, "#FFFFFF") + E(-56, 8, 54, 22, "#F3F6FA") + E(60, 6, 64, 24, "#F3F6FA") + `</g>`;
      s += cl(x + 120 + t * 7, y + 110, 1) + cl(x + w * 0.75 + t * 4, y + 60, 0.7);
    }
    // ทิวไม้/บ้านเพื่อนบ้าน
    const hill = o.night ? "#1F2B45" : "#9DB59A", tree = o.night ? ["#1A2A3A", "#223548"] : ["#6E917B", "#7FA088"];
    s += Pth(`M ${x - 300},${y + h * 0.72} C ${x},${y + h * 0.62} ${x + w * 0.5},${y + h * 0.7} ${x + w + 300},${y + h * 0.66} L ${x + w + 300},${y + h + 200} L ${x - 300},${y + h + 200} Z`, hill);
    const r = RK.rng(19);
    for (let i = 0; i < 10; i++) { const tx = x - 120 + i * (w + 240) / 9 + r() * 30, ty = y + h * 0.72 + r() * 20, k = 0.6 + r() * 0.6; s += E(tx, ty, 58 * k, 76 * k, tree[i % 2]) + E(tx - 18 * k, ty - 28 * k, 34 * k, 38 * k, sh(tree[i % 2], 0.12)); }
    const hx = x + w * 0.35;
    s += Pth(`M ${hx - 120},${y + h * 0.8} L ${hx},${y + h * 0.68} L ${hx + 120},${y + h * 0.8} Z`, o.night ? "#4A2E3A" : "#B35D4C") + R(hx - 100, y + h * 0.8, 200, 120, o.night ? "#3A3550" : "#EAD3B5");
    s += R(hx - 70, y + h * 0.84, 40, 40, o.night ? "#FFD98A" : "#8FB3C9") + R(hx + 30, y + h * 0.84, 40, 40, o.night ? "#FFD98A" : "#8FB3C9");
    if (!o.night) for (let i = 0; i < 3; i++) { const bx = x + 80 + i * 36 + t * 22, by = y + 150 + i * 12 + Math.sin(t * 4 + i) * 6, fl = Math.sin(t * 12 + i * 2) * 6; s += Pth(`M ${f(bx - 10)},${f(by - fl)} Q ${f(bx - 4)},${f(by - 4)} ${f(bx)},${f(by)} Q ${f(bx + 4)},${f(by - 4)} ${f(bx + 10)},${f(by - fl)}`, "none", ST("#5B4A52", 3)); }
    s += `</g></g>`;
    // กรอบ + ลูกกรง
    s += `<rect x="${x - 24}" y="${y - 24}" width="${w + 48}" height="${h + 48}" fill="none" stroke="#F7F3EC" stroke-width="36"/>` + R(x + w / 2 - 8, y, 16, h, "#F7F3EC") + R(x, y + h * 0.45, w, 14, "#F7F3EC");
    s += RR(x - 60, y + h + 14, w + 120, 28, 6, "#E6DCCB") + R(x - 60, y + h + 38, w + 120, 8, "#CFC2AC");
    return s;
  }
  function curtains(x, y, w, h, t, col, sheer) {
    const sw = Math.sin(t * 1.1) * 8;
    let s = "";
    if (sheer) s += Pth(`M ${x - 10},${y - 70} L ${x + w * 0.42},${y - 70} C ${x + w * 0.38 + sw},${y + h * 0.4} ${x + w * 0.4 + sw},${y + h * 0.7} ${x + w * 0.44 + sw},${y + h + 40} L ${x - 10},${y + h + 40} Z`, "#FFFFFF", 'opacity=".38"');
    for (const sd of [-1, 1]) {
      const x0 = sd < 0 ? x - 80 : x + w + 80;
      s += Pth(`M ${x0},${y - 90} L ${x0 - sd * 170},${y - 90} C ${x0 - sd * 130 + sw},${y + h * 0.3} ${x0 - sd * 70 + sw},${y + h * 0.5} ${x0 - sd * 90 + sw},${y + h * 0.58} C ${x0 - sd * 120 + sw},${y + h * 0.8} ${x0 - sd * 150 + sw},${y + h} ${x0 - sd * 165 + sw},${y + h + 160} L ${x0},${y + h + 160} Z`, col);
      for (const k of [0.25, 0.55, 0.8]) s += L(x0 - sd * 170 * k, y - 80, x0 - sd * 160 * k + sw * k, y + h + 150, sh(col, -0.15), 6, 'opacity=".7"');
      s += RR(x0 - sd * 90 - 30 + sw, y + h * 0.55, 60, 20, 10, sh(col, -0.3));
    }
    s += RR(x - 150, y - 112, w + 300, 18, 9, "#7C5A3E") + C(x - 150, y - 103, 16, "#7C5A3E") + C(x + w + 150, y - 103, 16, "#7C5A3E");
    return s;
  }
  function plant(x, y, k, t, pot) {
    let s = Pth(`M ${x - 70 * k},${y - 150 * k} L ${x + 70 * k},${y - 150 * k} L ${x + 54 * k},${y} L ${x - 54 * k},${y} Z`, pot || "#E9E2D6") + R(x - 74 * k, y - 160 * k, 148 * k, 22 * k, sh(pot || "#E9E2D6", -0.08));
    for (let i = 0; i < 9; i++) {
      const a = -78 + i * 19 + Math.sin(t * 0.9 + i) * 3, len = (150 + (i % 3) * 40) * k;
      s += `<g transform="translate(${f(x)},${f(y - 150 * k)}) rotate(${f(a)})">` + E(0, -len * 0.55, 34 * k, len * 0.5, i % 2 ? "#4F8A55" : "#68A866") + L(0, 0, 0, -len * 0.95, "#3E6E45", 3 * k) + Pth(`M ${f(-10 * k)},${f(-len * 0.5)} l ${f(-22 * k)},${f(-14 * k)} M ${f(10 * k)},${f(-len * 0.6)} l ${f(22 * k)},${f(-14 * k)}`, "none", ST("#3E6E45", 2 * k, 0.6)) + `</g>`;
    }
    return s;
  }
  function frame(x, y, w, h, fc, art) { return RR(x, y, w, h, 6, fc) + R(x + 12, y + 12, w - 24, h - 24, "#FFFDF6") + art + Pth(`M ${x + 12},${y + 12} l ${w - 24},0 l -${f((w - 24) * 0.3)},${f((h - 24) * 0.25)} Z`, "#FFFFFF", 'opacity=".25"'); }
  // รูปครอบครัวขนาดย่อ (คนหัวกลม)
  function familyPic(x, y, w, h, n, bg) {
    let s = R(x, y, w, h, bg);
    s += Pth(`M ${x},${y + h * 0.75} C ${x + w * 0.3},${y + h * 0.65} ${x + w * 0.7},${y + h * 0.7} ${x + w},${y + h * 0.62} L ${x + w},${y + h} L ${x},${y + h} Z`, "#7FA088");
    const cols = ["#E46F5B", "#5E8FB0", "#F2C14E", "#8E6FA8", "#68A866"];
    for (let i = 0; i < n; i++) { const px = x + w * (i + 1) / (n + 1), sc = i === n - 1 ? 0.7 : 1, py = y + h * 0.82; s += RR(px - 14 * sc, py - 46 * sc, 28 * sc, 46 * sc, 10 * sc, cols[i % 5]) + C(px, py - 58 * sc, 13 * sc, "#E8B690") + Pth(`M ${f(px - 13 * sc)},${f(py - 60 * sc)} a ${f(13 * sc)},${f(12 * sc)} 0 0 1 ${f(26 * sc)},0 Z`, "#2A1D1A"); }
    return s;
  }
  function books(x, y, w, seed, hmax = 150) {
    const r = RK.rng(seed); let s = "", bx = x;
    const cols = ["#C9493B", "#2F5E6B", "#E3A548", "#6C8FA6", "#8E6FA8", "#4F8A55", "#D98E6A", "#3B3F5C"];
    while (bx < x + w - 20) {
      const bw = 18 + r() * 16, bh = hmax * (0.65 + r() * 0.35), c = rngPick(r, cols), lean = r() < 0.12 ? 8 : 0;
      s += `<g transform="rotate(${lean} ${f(bx)} ${f(y)})">` + R(bx, y - bh, bw, bh, c) + R(bx + 3, y - bh + 14, bw - 6, 5, sh(c, 0.35)) + R(bx + 3, y - 22, bw - 6, 4, sh(c, 0.35)) + `</g>`;
      bx += bw + 2 + lean;
    }
    return s;
  }
  function clock(x, y, r, t, c) {
    let s = C(x, y, r + 10, c) + C(x, y, r, "#FFFDF6");
    for (let i = 0; i < 12; i++) { const a = i * 30 * Math.PI / 180; s += L(x + Math.sin(a) * r * 0.82, y - Math.cos(a) * r * 0.82, x + Math.sin(a) * r * 0.94, y - Math.cos(a) * r * 0.94, "#3A2A26", i % 3 ? 2 : 4); }
    const m = (t * 6) % 360, hr = 7 * 30 + m / 12;
    s += L(x, y, x + Math.sin(hr * Math.PI / 180) * r * 0.5, y - Math.cos(hr * Math.PI / 180) * r * 0.5, "#3A2A26", 6) + L(x, y, x + Math.sin(m * Math.PI / 180) * r * 0.75, y - Math.cos(m * Math.PI / 180) * r * 0.75, "#3A2A26", 4);
    const sc = (t * 60) % 360; s += L(x, y, x + Math.sin(sc * Math.PI / 180) * r * 0.82, y - Math.cos(sc * Math.PI / 180) * r * 0.82, "#E4572E", 2) + C(x, y, 6, "#E4572E");
    return s;
  }
  function calendar(x, y) {
    let s = RR(x, y, 180, 230, 8, "#FFFDF6", 'stroke="#D9CDB8" stroke-width="3"') + R(x, y, 180, 50, "#E4572E") + C(x + 50, y, 7, "#5A4A52") + C(x + 130, y, 7, "#5A4A52");
    s += `<text x="${x + 90}" y="${y + 36}" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="26" fill="#fff">พฤศจิกายน</text>`;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) s += R(x + 14 + c * 22.5, y + 66 + r * 30, 16, 16, (r === 2 && c === 3) ? "#E4572E" : "#E6DED0");
    return s;
  }
  function pendant(x, y0, len, t, col, on) {
    const sw = Math.sin(t * 0.9 + x) * 2;
    let s = L(x, y0, x + sw, y0 + len, "#3A2A26", 4);
    if (on) s += E(x + sw, y0 + len + 140, 300, 260, "url(#hGlow)", 'opacity=".55"');
    s += Pth(`M ${f(x + sw - 90)},${f(y0 + len + 90)} C ${f(x + sw - 80)},${f(y0 + len + 10)} ${f(x + sw + 80)},${f(y0 + len + 10)} ${f(x + sw + 90)},${f(y0 + len + 90)} Z`, col) + E(x + sw, y0 + len + 90, 90, 14, sh(col, -0.25)) + E(x + sw, y0 + len + 96, 36, 16, on ? "#FFF2C4" : "#F3E3C0");
    return s;
  }

  RK._kit = { plant, books, clock, calendar, frame, pendant, floor, baseboard, windowView, curtains, familyPic };

  // ======================= ห้องนั่งเล่น =======================
  const LW = { x: -1180, y: -1450, w: 520, h: 620 };
  function lWall(t, o) {
    const n = !!o.night;
    let s = R(-1700, -2400, 3400, 2400 + WALL_Y, n ? "url(#hWallLn)" : "url(#hWallL)");
    // ผนังไม้ครึ่งล่าง (wainscot)
    s += R(-1700, -560, 3400, 490, n ? "#6B5446" : "#E7DCC8") + R(-1700, -572, 3400, 18, n ? "#5A463A" : "#CDBDA3");
    for (let x = -1680; x < 1700; x += 170) s += RR(x + 14, -530, 142, 420, 6, "none", `stroke="${n ? "#5A463A" : "#D4C6AE"}" stroke-width="5"`);
    // บัวเพดาน
    s += R(-1700, -1760, 3400, 44, n ? "#5C6A63" : "#E6EDE0") + R(-1700, -1718, 3400, 10, n ? "#4E5B55" : "#B9C8B0");
    // หน้าต่าง + ม่าน
    s += windowView(LW.x, LW.y, LW.w, LW.h, t, o, "hLWin") + curtains(LW.x, LW.y, LW.w, LW.h, t, n ? "#8A5A4A" : "#D98E6A", true);
    // กระถางบนขอบหน้าต่าง
    s += plant(LW.x + 110, LW.y + LW.h + 16, 0.35, t, "#C96F4A") + plant(LW.x + 400, LW.y + LW.h + 16, 0.3, t, "#6C8FA6");
    // แกลเลอรีรูปครอบครัวเหนือโซฟา
    const fc = "#7C5A3E";
    s += frame(-380, -1520, 380, 270, fc, familyPic(-368, -1508, 356, 246, 4, "#F6E6C8"));
    s += frame(30, -1560, 200, 250, "#2F2A28", familyPic(42, -1548, 176, 226, 2, "#DCE7F2"));
    s += frame(250, -1480, 170, 170, "#C9A27A", familyPic(262, -1468, 146, 146, 1, "#FCE3D6"));
    s += frame(-560, -1400, 150, 190, "#C9A27A", R(-548, -1388, 126, 166, "#EAF2E3") + plant(-485, -1240, 0.22, t, "#E3B062"));
    s += frame(30, -1290, 150, 120, fc, R(42, -1278, 126, 96, "#FFF0D6") + Pth("M 42,-1182 L 80,-1232 L 110,-1205 L 140,-1240 L 168,-1182 Z", "#86A85E") + C(140, -1255, 12, "#F2A33A"));
    s += frame(200, -1290, 120, 120, "#2F2A28", R(212, -1278, 96, 96, "#F2E6F8") + `<text x="260" y="-1218" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="28" fill="#8E6FA8">รักกัน</text>`);
    // นาฬิกา + ปฏิทิน
    s += clock(720, -1430, 86, t, "#7C5A3E") + calendar(1160, -1520);
    // ชั้นหนังสือติดผนัง (ขวา)
    for (const y of [-1180, -980]) s += R(980, y, 560, 22, "#9C7651") + Pth(`M 1000,${y + 22} l 20,30 l -20,0 Z M 1520,${y + 22} l -20,30 l 20,0 Z`, "#8B6744");
    s += books(990, -1180, 300, 3, 150) + plant(1440, -1180, 0.28, t, "#F2C14E") + RR(1330, -1240, 70, 60, 8, "#E46F5B");
    s += books(1200, -980, 330, 5, 130) + RR(1000, -1060, 150, 80, 10, "#FFFDF6") + C(1075, -1020, 24, "#5E8FB0");
    // ตู้วางทีวี + ทีวี
    const tvx = 760, tvy = -780, tw = 560, th = 320;
    s += RR(tvx - tw / 2 - 30, tvy - th / 2 - 30, tw + 60, th + 60, 18, "#202326");
    const scene = (t * 0.6) % 3;
    s += `<clipPath id="hTvC"><rect x="${tvx - tw / 2}" y="${tvy - th / 2}" width="${tw}" height="${th}" rx="6"/></clipPath><g clip-path="url(#hTvC)">` + R(tvx - tw / 2, tvy - th / 2, tw, th, "url(#hTv)", `opacity="${n ? 1 : 0.85}"`);
    s += C(tvx - 120 + Math.sin(t * 1.5) * 60, tvy + 20, 60, "#FFFFFF", 'opacity=".9"') + C(tvx - 140 + Math.sin(t * 1.5) * 60, tvy + 10, 9, "#2B2F3A") + C(tvx - 100 + Math.sin(t * 1.5) * 60, tvy + 10, 9, "#2B2F3A") + Pth(`M ${f(tvx - 145 + Math.sin(t * 1.5) * 60)},${tvy + 40} q 25,20 50,0`, "none", ST("#2B2F3A", 5));
    s += E(tvx + 160, tvy + th / 2, 200, 70, "#5FA25F") + C(tvx + 180, tvy - 60 + Math.sin(t * 3) * 10, 30, "#F2C14E") + R(tvx - tw / 2, tvy + th / 2 - 30 + (scene > 2 ? 0 : 0), tw, 30, "#000", 'opacity=".25"');
    s += `</g>` + R(tvx - tw / 2, tvy - th / 2, tw, 6, "#fff", 'opacity=".25"') + C(tvx + tw / 2 + 10, tvy + th / 2 + 18, 5, "#E4572E");
    s += R(tvx - 20, tvy + th / 2 + 30, 40, 60, "#2A2D31");
    // ตู้ไม้ใต้ทีวี
    const cx0 = tvx - 380, cy0 = -330;
    s += RR(cx0, cy0, 760, 230, 10, "#A87A52") + R(cx0, cy0, 760, 18, "#C49468") + R(cx0 + 20, WALL_Y - 100, 26, 60, "#6B4A33") + R(cx0 + 714, WALL_Y - 100, 26, 60, "#6B4A33");
    for (let i = 0; i < 3; i++) { const dx = cx0 + 24 + i * 248; s += RR(dx, cy0 + 40, 232, 170, 6, i === 1 ? "#8C6243" : "#B78A60") + RR(dx + 100, cy0 + 110, 32, 10, 5, "#5A3D2B"); }
    s += books(cx0 + 290, cy0 + 205, 170, 9, 110);   // หนังสือในช่องกลาง
    s += RR(cx0 + 40, cy0 - 70, 130, 70, 10, "#2B2F3A") + C(cx0 + 75, cy0 - 35, 14, "#5E8FB0") + C(cx0 + 135, cy0 - 35, 14, "#E46F5B"); // เครื่องเกม
    s += plant(cx0 + 680, cy0, 0.32, t, "#FFFDF6") + RR(cx0 + 500, cy0 - 40, 120, 40, 8, "#E3A548") + RR(cx0 + 510, cy0 - 70, 100, 30, 8, "#2F5E6B");
    // ลำโพงตั้งพื้น
    for (const sx of [tvx - 470, tvx + 440]) s += RR(sx, -620, 90, 560, 14, "#2E2A2A") + C(sx + 45, -520, 30, "#4A4444") + C(sx + 45, -520, 12, "#222") + C(sx + 45, -380, 40, "#4A4444") + C(sx + 45, -380, 16, "#222");
    // โคมไฟตั้งพื้น (ซ้ายของโซฟา)
    const lx = -760;
    if (n) s += E(lx + 60, -1150, 380, 340, "url(#hGlow)", 'opacity=".9"');
    s += L(lx, WALL_Y - 10, lx, -1100, "#3A2A26", 10) + Pth(`M ${lx},-1100 Q ${lx + 40},-1260 ${lx + 120},-1240`, "none", ST("#3A2A26", 8)) + Pth(`M ${lx + 50},-1240 L ${lx + 190},-1240 L ${lx + 160},-1140 L ${lx + 80},-1140 Z`, n ? "#FFE6A8" : "#F2D9A8") + E(lx, WALL_Y, 70, 14, "#3A2A26");
    // ต้นไม้ใหญ่มุมขวา + ตะกร้าของเล่น
    s += plant(1480, WALL_Y, 1.05, t, "#C9A27A");
    s += RR(-1480, -260, 230, 190, 20, "#D9C5A0") + Pth("M -1470,-230 L -1260,-230 M -1470,-190 L -1260,-190 M -1470,-150 L -1260,-150", "none", ST("#B8A47E", 4));
    s += C(-1410, -280, 38, "#C98A4E") + C(-1440, -310, 16, "#C98A4E") + C(-1380, -310, 16, "#C98A4E") + C(-1422, -282, 5, "#2B2230") + C(-1398, -282, 5, "#2B2230") + E(-1410, -268, 10, 7, "#8C5E3C"); // ตุ๊กตาหมี
    s += RR(-1340, -300, 50, 50, 6, "#5E8FB0") + RR(-1300, -320, 46, 46, 6, "#F2C14E") + C(-1270, -270, 22, "#E46F5B");
    // ปลั๊ก/สวิตช์
    s += RR(-200, -700, 60, 90, 8, "#F7F3EC", 'stroke="#D4C6AE" stroke-width="3"') + RR(-184, -680, 28, 18, 4, "#E6DED0");
    s += baseboard(n ? "#4E3B30" : "#F3EEE4");
    s += floor([-60, 260, 1150]);
    // บล็อกของเล่นบนพรม
    s += RR(420, 300, 46, 46, 6, "#E46F5B") + RR(470, 312, 40, 40, 6, "#5E8FB0") + RR(440, 266, 40, 40, 6, "#F2C14E") + E(-760, 420, 44, 12, "#6C8FA6") + C(-760, 380, 30, "#F2668B");
    return s;
  }
  function lLamps(t, o) {
    if (!o.night) return "";
    return pendant(-60, -2100, 260, t, "#E3B062", true);
  }
  // โซฟา + โต๊ะกลาง (ชั้นกลาง: อยู่หน้าตัวละครที่ layer:"back")
  function lIsland(t, o) {
    const n = !!o.night, so = o.sofaX ?? -60, sy = 60, SK = 0.55;
    let s = `<g transform="translate(${so},${sy}) scale(${SK}) translate(${-so},${-sy})">`;
    // เงาใต้โซฟา
    s += E(so, sy + 10, 760, 40, "#2A1A12", 'opacity=".28"');
    // ขาโซฟา
    for (const x of [so - 600, so + 560]) s += RR(x, sy - 40, 40, 50, 6, "#5A3D2B");
    // พนักหลัง
    s += RR(so - 640, sy - 560, 1280, 340, 60, "url(#hSofa)") + RR(so - 640, sy - 560, 1280, 60, 40, sh("#4F7A8C", 0.12));
    for (const x of [-420, 0, 420]) s += RR(so + x - 200, sy - 520, 400, 300, 50, sh("#4F7A8C", 0.06), `stroke="${sh("#4F7A8C", -0.18)}" stroke-width="4"`) + Pth(`M ${so + x - 160},${sy - 380} q 160,24 320,0`, "none", ST(sh("#4F7A8C", -0.15), 4, 0.6));
    // เบาะนั่ง
    s += RR(so - 610, sy - 250, 1220, 190, 34, sh("#4F7A8C", 0.04)) + R(so - 610, sy - 120, 1220, 60, sh("#4F7A8C", -0.12));
    for (const x of [-420, 0, 420]) s += L(so + x + 205, sy - 240, so + x + 205, sy - 70, sh("#4F7A8C", -0.25), 4);
    // ท้าวแขน
    for (const sd of [-1, 1]) s += RR(so + sd * 640 - 90, sy - 360, 180, 330, 60, sh("#4F7A8C", -0.06)) + RR(so + sd * 640 - 90, sy - 360, 180, 70, 40, sh("#4F7A8C", 0.1));
    // หมอนอิง + ผ้าห่มพาด
    s += `<g transform="rotate(-10 ${so - 470} ${sy - 300})">` + RR(so - 560, sy - 400, 180, 170, 40, "#F2C14E") + Pth(`M ${so - 540},${sy - 315} l 140,0`, "none", ST("#D9A441", 4)) + `</g>`;
    s += `<g transform="rotate(8 ${so + 470} ${sy - 300})">` + RR(so + 380, sy - 400, 180, 170, 40, "#E46F5B") + C(so + 470, sy - 315, 30, "#F7E1B5") + `</g>`;
    s += RR(so - 60, sy - 380, 160, 150, 36, "#F7F1E6") + Pth(`M ${so - 40},${sy - 360} l 120,110 M ${so + 80},${sy - 360} l -120,110`, "none", ST("#D9CDB8", 3));
    s += Pth(`M ${so + 250},${sy - 560} C ${so + 300},${sy - 420} ${so + 270},${sy - 200} ${so + 320},${sy - 60} L ${so + 520},${sy - 60} C ${so + 470},${sy - 220} ${so + 500},${sy - 420} ${so + 450},${sy - 560} Z`, "#C9D7C0", 'opacity=".95"');
    for (let k = 0; k < 6; k++) s += L(so + 280 + k * 32, sy - 70, so + 270 + k * 32, sy - 50, "#A9B9A0", 4);
    // โต๊ะข้างโซฟา + โคมเล็ก + แก้วน้ำ
    const tx = so + 830;
    s += RR(tx - 110, sy - 330, 220, 26, 8, "#A87A52") + R(tx - 90, sy - 304, 18, 300, "#8C6243") + R(tx + 72, sy - 304, 18, 300, "#8C6243") + R(tx - 90, sy - 120, 180, 14, "#8C6243");
    if (n) s += E(tx, sy - 520, 200, 180, "url(#hGlow)");
    s += RR(tx - 12, sy - 420, 24, 90, 6, "#E6DCCB") + Pth(`M ${tx - 70},${sy - 420} L ${tx + 70},${sy - 420} L ${tx + 50},${sy - 510} L ${tx - 50},${sy - 510} Z`, n ? "#FFE6A8" : "#F7E1B5");
    s += RR(tx + 34, sy - 386, 40, 56, 8, "#DCEFF7", 'opacity=".85"') + R(tx + 38, sy - 366, 32, 32, "#A9D6EA", 'opacity=".8"');
    return s + `</g>`;
  }
  function lFore(t, o) {
    let s = "";
    // โต๊ะกลางหน้าโซฟา (ฉากหน้า เบลอ)
    s += RR(-560, 520, 900, 46, 16, "#8C6243") + R(-520, 566, 40, 400, "#6B4A33") + R(260, 566, 40, 400, "#6B4A33");
    s += RR(-420, 470, 220, 50, 10, "#E46F5B") + RR(-390, 440, 160, 30, 8, "#F2C14E") + E(80, 500, 110, 26, "#F7F1E6") + E(80, 494, 80, 16, "#E3A548");
    // ใบไม้มุมบนซ้าย
    for (let k = 0; k < 10; k++) { const a = 120 + k * 14 + Math.sin(t + k) * 4; s += `<ellipse cx="0" cy="120" rx="44" ry="130" fill="${k % 2 ? "#3E6E45" : "#558B57"}" transform="translate(-1250,-1900) rotate(${f(a)})"/>`; }
    return s;
  }
  function lSun(t, o) {
    if (o.night) {
      // แสงทีวีกระทบพื้นห้อง + มุมมืด
      return `<g style="mix-blend-mode:screen">` + E(760, -500, 700, 500, "url(#hTvGlow)", `opacity="${f(0.6 + 0.2 * Math.sin(t * 5))}"`) + `</g>` + R(-1700, -2400, 3400, 4000, "#0E1430", 'opacity=".18"');
    }
    let s = `<g style="mix-blend-mode:screen">`;
    for (let i = 0; i < 3; i++) { const ox = i * 160; s += Pth(`M ${LW.x + 60 + ox},${LW.y} L ${LW.x + 180 + ox},${LW.y} L ${LW.x + 1500 + ox * 1.5},${LW.y + 1700} L ${LW.x + 1200 + ox * 1.5},${LW.y + 1700} Z`, "url(#hBeam)", `opacity="${f(0.85 + 0.15 * Math.sin(t * 0.8 + i))}" filter="url(#fBlur20)"`); }
    const r = RK.rng(53);
    for (let i = 0; i < 40; i++) { const u = r(), v = r(), yy = LW.y + 60 + ((v * 1400 + t * 25) % 1400), xx = LW.x + 200 + u * 400 + (yy - LW.y) * 0.75; s += C(xx, yy, 2 + r() * 3, "#FFF6DA", `opacity="${f(0.3 + 0.5 * Math.abs(Math.sin(t * 1.2 + i)))}"`); }
    return s + `</g>`;
  }
  // สเกลฉากให้สัมพันธ์กับตัวละคร (ตัวละครสูง ~400 หน่วยที่ s=0.62) + พื้นหลังสำรองไม่ให้ขอบโผล่
  const K = 0.72;
  const wrap = (fn, back) => (t, o) => (back ? R(-4000, -5000, 8000, 5000 + WALL_Y * K, back(o)) + R(-4000, WALL_Y * K, 8000, 4000, "#8E623F") : "") + `<g transform="scale(${K})">${fn(t, o || {})}</g>`;
  RK.flatSets.living = { wall: wrap(lWall, (o) => (o.night ? "#6E7F78" : "#C9D7C0")), lamps: wrap(lLamps), island: wrap(lIsland), foreground: wrap(lFore), sunlight: wrap(lSun), WALL_Y: WALL_Y * K };

  // ======================= โต๊ะกินข้าว =======================
  const DW = { x: 760, y: -1500, w: 520, h: 600 };
  function chairBack(x, y, c) { // พนักเก้าอี้ (อยู่หลังตัวละคร)
    return R(x - 90, y - 520, 22, 520, c) + R(x + 68, y - 520, 22, 520, c) + RR(x - 100, y - 540, 200, 40, 14, sh(c, 0.12)) + R(x - 70, y - 470, 140, 18, c) + R(x - 70, y - 400, 140, 18, c) + R(x - 70, y - 330, 140, 18, c);
  }
  function dWall(t, o) {
    const n = !!o.night, eve = o.eve ?? !n;
    let s = R(-1700, -2400, 3400, 2400 + WALL_Y, n ? "url(#hWallDn)" : "url(#hWallD)") + R(-1700, -2400, 3400, 2400 + WALL_Y, "url(#hPaper)", 'opacity=".9"');
    s += R(-1700, -1760, 3400, 44, n ? "#7E6250" : "#F4E8D6") + R(-1700, -1718, 3400, 10, n ? "#6B5244" : "#D6BF9C");
    s += R(-1700, -640, 3400, 20, n ? "#6B5244" : "#C9A980"); // คิ้วผนัง (chair rail)
    s += R(-1700, -620, 3400, 550, n ? "#7E6250" : "#E3CBA6");
    for (let x = -1700; x < 1700; x += 60) s += L(x, -620, x, WALL_Y, n ? "#6B5244" : "#D3B88F", 3);
    // หน้าต่างขวา (ฟ้ายามเย็น)
    s += windowView(DW.x, DW.y, DW.w, DW.h, t, Object.assign({}, o, { eve }), "hDWin") + curtains(DW.x, DW.y, DW.w, DW.h, t, n ? "#6E4E5E" : "#B5523F", true);
    // ตู้ไม้โชว์จาน (ซ้าย)
    const sx = -1520, sw = 760;
    s += RR(sx, -1520, sw, 900, 12, "#8C5E3C") + R(sx, -1520, sw, 30, "#A87A52");
    for (let c = 0; c < 2; c++) {
      const gx = sx + 30 + c * 360;
      s += RR(gx, -1470, 340, 800, 8, "#CFE3E6", 'opacity=".55"');
      for (let r = 0; r < 3; r++) {
        const yy = -1210 + r * 260;
        s += R(gx, yy, 340, 12, "#7C5A3E");
        const rr = RK.rng(30 + c * 3 + r);
        for (let k = 0; k < 4; k++) { const px = gx + 50 + k * 80, col = rngPick(rr, ["#FFFDF6", "#E6F0F5", "#F7E1B5", "#DCE7F2"]); s += E(px, yy - 70, 34, 70, col, `stroke="${sh(col, -0.12)}" stroke-width="3"`) + E(px, yy - 70, 18, 40, "none", ST("#6C8FA6", 3, 0.7)); }
      }
      s += Pth(`M ${gx + 20},-1450 l 120,0 l -100,240 Z`, "#FFFFFF", 'opacity=".22"');
    }
    s += RR(sx, -620, sw, 550, 10, "#7C5A3E");
    for (let i = 0; i < 3; i++) s += RR(sx + 24 + i * 245, -590, 225, 220, 6, "#9C6B43") + RR(sx + 24 + i * 245, -350, 225, 250, 6, "#9C6B43") + RR(sx + 120 + i * 245, -490, 40, 10, 5, "#E3B062") + RR(sx + 120 + i * 245, -240, 40, 10, 5, "#E3B062");
    s += plant(sx + 640, -620, 0.3, t, "#F7F1E6") + RR(sx + 60, -700, 160, 80, 10, "#E3A548") + E(sx + 140, -700, 80, 14, "#C98A4E") + C(sx + 110, -720, 26, "#E4572E") + C(sx + 160, -724, 24, "#F2A33A") + C(sx + 135, -748, 22, "#86A85E");
    s += RR(sx + 300, -760, 70, 140, 30, "#DCEFF7", 'opacity=".8"') + R(sx + 318, -700, 34, 70, "#F2C14E", 'opacity=".7"'); // โหลน้ำ
    // ภาพแขวนกลาง + นาฬิกา
    s += frame(-520, -1560, 520, 330, "#7C5A3E", R(-508, -1548, 496, 306, "#F6E2C0") + Pth("M -508,-1300 C -420,-1380 -300,-1340 -200,-1400 C -100,-1450 -40,-1380 -12,-1400 L -12,-1242 L -508,-1242 Z", "#C96F4A", 'opacity=".75"') + C(-140, -1460, 40, "#F2A33A") + Pth("M -460,-1320 l 30,-60 l 30,60 Z M -380,-1320 l 30,-80 l 30,80 Z", "#5E8A62"));
    s += clock(190, -1450, 76, t, "#3A2A26") + calendar(330, -1560);
    // ไฟเส้นตกแต่งเหนือหน้าต่าง
    let d = `M ${DW.x - 160},-1700`; for (let i = 1; i <= 8; i++) d += ` Q ${DW.x - 160 + i * 105 - 52},-1640 ${DW.x - 160 + i * 105},-1700`;
    s += Pth(d, "none", ST("#5A4A52", 3));
    for (let i = 0; i < 8; i++) { const x = DW.x - 160 + i * 105 + 52, g = 0.7 + 0.3 * Math.sin(t * 2 + i); s += E(x, -1650, 30, 30, "#FFD98A", `opacity="${f((n ? 0.5 : 0.25) * g)}" filter="url(#fBlur8)"`) + E(x, -1655, 8, 12, ["#FFE08A", "#FFB8A0", "#B8E0FF"][i % 3]); }
    s += baseboard(n ? "#5A4034" : "#B88D62");
    s += floor(null);
    // พนักเก้าอี้หลังโต๊ะ (ตัวละครนั่งหน้าพนัก)
    const cc = "#7C5A3E";
    for (const x of (o.chairs || [-420, -60, 300])) s += chairBack(x, 30, cc);
    return s;
  }
  function dLamps(t, o) {
    const on = !!o.night || (o.eve ?? true);
    return pendant(-420, -2200, 520, t, "#2F5E6B", on) + pendant(-60, -2200, 560, t, "#E3A548", on) + pendant(300, -2200, 520, t, "#2F5E6B", on);
  }
  // โต๊ะอาหาร (ชั้นกลาง: ตัวละครนั่งหลังโต๊ะใช้ layer:"back")
  function dIsland(t, o) {
    const x0 = o.tableX ?? -60, top = -260, w = 1500;
    let s = E(x0, 40, w * 0.55, 40, "#2A1A12", 'opacity=".25"');
    // ผ้าปูโต๊ะ
    const drop = 300; // ผ้าปูยาวถึงพื้น (ซ่อนขาคนนั่งหลังโต๊ะ)
    s += Pth(`M ${x0 - w / 2},${top} L ${x0 + w / 2},${top} L ${x0 + w / 2 + 24},${top + drop} C ${x0 + w / 4},${top + drop + 18} ${x0 - w / 4},${top + drop + 18} ${x0 - w / 2 - 24},${top + drop} Z`, "url(#hCloth)");
    for (let k = 1; k < 10; k++) { const fx = x0 - w / 2 + k * w / 10; s += Pth(`M ${f(fx)},${top + 40} C ${f(fx - 6)},${top + 140} ${f(fx + 8)},${top + 220} ${f(fx + (k - 5) * 2.4)},${top + drop + 10}`, "none", ST("#D9CDB8", 4, 0.55)); }
    s += R(x0 - w / 2 - 14, top + 110, w + 28, 16, "#B5523F", 'opacity=".85"') + R(x0 - w / 2 - 14, top + 134, w + 28, 6, "#E3A548", 'opacity=".85"');
    s += R(x0 - w / 2 - 22, top + drop - 30, w + 44, 14, "#B5523F", 'opacity=".7"');
    s += RR(x0 - w / 2 - 20, top - 22, w + 40, 30, 10, "#8C5E3C");
    s += R(x0 - w / 2 - 10, top - 28, w + 20, 10, "#F7F1E6");
    if (o.bare) return s; // โต๊ะเปล่า (ใช้ของในฉากจาก S.props แทน)
    // อาหารไทยบนโต๊ะ
    const steam = (x, y, k) => { let r = ""; for (let i = 0; i < 3; i++) { const ph = t * 1.2 + i * 1.7, yy = y - ((ph * 40) % 120); r += Pth(`M ${f(x + (i - 1) * 22 * k)},${f(y)} C ${f(x + (i - 1) * 22 * k - 20 * k)},${f(y - 40 * k)} ${f(x + (i - 1) * 22 * k + 20 * k)},${f(y - 80 * k)} ${f(x + (i - 1) * 22 * k)},${f(y - 120 * k)}`, "none", `stroke="url(#hSteam)" stroke-width="${f(10 * k)}" stroke-linecap="round" opacity="${f(0.55 + 0.25 * Math.sin(ph))}"`); } return r; };
    const plate = (x, y, rx, c) => E(x, y, rx + 14, (rx + 14) * 0.28, "#FFFDF6", 'stroke="#D9CDB8" stroke-width="3"') + E(x, y - 4, rx, rx * 0.26, c);
    const bowl = (x, y, rx, c) => Pth(`M ${x - rx},${y - rx * 0.3} C ${x - rx},${y + rx * 0.5} ${x + rx},${y + rx * 0.5} ${x + rx},${y - rx * 0.3} Z`, "#FFFDF6", 'stroke="#D9CDB8" stroke-width="3"') + E(x, y - rx * 0.3, rx, rx * 0.22, c) + Pth(`M ${x - rx * 0.8},${y + rx * 0.05} l ${rx * 1.6},0`, "none", ST("#6C8FA6", 4, 0.8));
    const y0 = top - 20;
    // หม้อข้าว
    if (!o.noPot) s += RR(x0 - 700, y0 - 140, 170, 140, 30, "#E6E2DA", 'stroke="#BDB6A8" stroke-width="3"') + E(x0 - 615, y0 - 140, 90, 22, "#D3CEC4") + RR(x0 - 640, y0 - 175, 50, 22, 10, "#9C8F7E") + R(x0 - 690, y0 - 70, 150, 12, "#E46F5B");
    // ไข่เจียว
    s += plate(x0 - 380, y0 - 10, 110, "#F2B53A") + Pth(`M ${x0 - 440},${y0 - 18} q 30,-14 60,0 q 30,-12 60,2`, "none", ST("#D98B2B", 5)) + E(x0 - 400, y0 - 20, 16, 6, "#5FA25F");
    // แกงเขียวหวาน + ไอ
    s += bowl(x0 - 100, y0 - 10, 90, "#7FA35A") + C(x0 - 120, y0 - 32, 10, "#F7F1E6") + C(x0 - 80, y0 - 34, 9, "#5E8A3B") + steam(x0 - 100, y0 - 50, 0.8);
    // ปลาทอด
    if (!o.noFish) s += plate(x0 + 170, y0 - 10, 130, "#F4E6C8") + `<g transform="translate(${x0 + 170},${y0 - 22})">` + Pth("M -90,0 C -60,-30 40,-30 70,0 C 40,26 -60,26 -90,0 Z", "#C9822F") + Pth("M 70,0 L 105,-24 L 100,24 Z", "#B06E25") + C(-62, -4, 6, "#3A2A26") + Pth("M -30,-14 q 10,14 0,28 M 0,-16 q 10,16 0,32 M 30,-12 q 8,12 0,24", "none", ST("#9C5C1E", 3)) + `</g>`;
    // ต้มจืด + ไอ
    s += bowl(x0 + 440, y0 - 10, 100, "#E8D8A8") + C(x0 + 420, y0 - 34, 12, "#86A85E") + C(x0 + 460, y0 - 36, 10, "#F7F1E6") + steam(x0 + 440, y0 - 52, 0.9);
    // ผัดผักบุ้ง
    s += plate(x0 + 650, y0 - 10, 90, "#4F8A3B") + Pth(`M ${x0 + 600},${y0 - 18} l 20,-12 M ${x0 + 640},${y0 - 20} l 24,-10 M ${x0 + 680},${y0 - 16} l 20,-14`, "none", ST("#7BB25A", 6)) + C(x0 + 630, y0 - 14, 7, "#E4572E") + C(x0 + 676, y0 - 12, 6, "#E4572E");
    // แก้วน้ำ + ถ้วยน้ำปลาพริก + ช้อนส้อม
    for (const gx of [x0 - 560, x0 - 230, x0 + 30, x0 + 320, x0 + 560]) s += RR(gx, y0 - 90, 44, 84, 8, "#DCEFF7", 'opacity=".8"') + R(gx + 4, y0 - 60, 36, 52, "#A9D6EA", 'opacity=".6"') + R(gx + 8, y0 - 84, 8, 70, "#fff", 'opacity=".5"');
    s += bowl(x0 + 30, y0 + 4, 30, "#B5523F") + C(x0 + 20, y0 - 6, 4, "#E4572E") + C(x0 + 40, y0 - 4, 4, "#86A85E");
    for (const fx of [x0 - 470, x0 - 160, x0 + 250]) s += L(fx, y0 + 10, fx + 50, y0 + 6, "#BFC4C8", 5) + L(fx + 70, y0 + 10, fx + 120, y0 + 6, "#BFC4C8", 5);
    return s;
  }
  function dFore(t, o) {
    let s = "";
    // แจกันดอกไม้มุมขวาล่าง (เบลอ)
    s += RR(1180, 300, 180, 300, 60, "#2F5E6B") + R(1180, 560, 180, 500, "#8C5E3C");
    for (let k = 0; k < 7; k++) { const a = -60 + k * 20 + Math.sin(t + k) * 3; s += `<g transform="translate(1270,300) rotate(${f(a)})">` + L(0, 0, 0, -260, "#4F8A55", 6) + C(0, -270, 34, ["#F2668B", "#F2C14E", "#FFFFFF"][k % 3]) + C(0, -270, 12, "#E3A548") + `</g>`; }
    // ขอบเก้าอี้หน้าสุด (ซ้าย)
    s += R(-1450, 250, 50, 900, "#6B4A33") + RR(-1480, 250, 360, 50, 14, "#7C5A3E");
    return s;
  }
  function dSun(t, o) {
    const n = !!o.night;
    let s = `<g style="mix-blend-mode:screen">`;
    // แสงอุ่นจากโคมเหนือโต๊ะ
    s += E(-60, -200, 1000, 300, "url(#hGlow)", `opacity="${n ? 0.55 : 0.35}"`);
    if (!n) for (let i = 0; i < 2; i++) { const ox = i * 180; s += Pth(`M ${DW.x + 120 + ox},${DW.y} L ${DW.x + 240 + ox},${DW.y} L ${DW.x - 600 + ox},${DW.y + 1700} L ${DW.x - 900 + ox},${DW.y + 1700} Z`, "url(#hBeam)", `opacity="${f(0.6 + 0.12 * Math.sin(t * 0.8 + i))}" filter="url(#fBlur20)"`); }
    s += `</g>`;
    if (n) s += R(-1700, -2400, 3400, 4000, "#0E1430", 'opacity=".15"');
    return s;
  }
  RK.flatSets.dining = { wall: wrap(dWall, (o) => (o.night ? "#9A7A64" : "#EBD3B0")), lamps: wrap(dLamps), island: wrap(dIsland), foreground: wrap(dFore), sunlight: wrap(dSun), WALL_Y: WALL_Y * K };
})(window);
