// flat_scenes4.js — ฉากใหม่สีเข้มตัดกับตัวละคร
//  backyard  : หลังบ้าน ราวตากผ้า โอ่งมังกร กล้วย เฟื่องฟ้า  setOpts { eve:true } = แดดเย็น
//  housefront: หน้าบ้านทาวน์เฮาส์ ประตูรั้วเหล็ก มะม่วง มอไซค์ เสาไฟ  setOpts { eve:true(ค่าเริ่ม) | day:true, gateOpen:0..1 }
(function (G) {
  const RK = G.RK, f = RK.f, sh = RK.shade, K = 0.72, WALL_Y = -70;
  const R = (x, y, w, h, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${c}" ${ex}/>`;
  const RR = (x, y, w, h, r, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" fill="${c}" ${ex}/>`;
  const C = (x, y, r, c, ex = "") => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" ${ex}/>`;
  const E = (x, y, rx, ry, c, ex = "") => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${c}" ${ex}/>`;
  const Pth = (d, c, ex = "") => `<path d="${d}" fill="${c}" ${ex}/>`;
  const L = (x1, y1, x2, y2, c, w, ex = "") => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${ex}/>`;
  const ST = (c, w, op = 1) => `stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"`;
  const T = (x, y, txt, size, c, ex = "") => `<text x="${f(x)}" y="${f(y)}" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="${size}" fill="${c}" ${ex}>${txt}</text>`;
  const SHD = (x, y, w, op = 0.28) => E(x, y, w, w * 0.1, "#140A06", `opacity="${op}"`);

  RK.flatDefs += `
  <linearGradient id="s4SkyDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3F86C9"/><stop offset=".7" stop-color="#9CCBE8"/><stop offset="1" stop-color="#CFE6EE"/></linearGradient>
  <linearGradient id="s4SkyEve" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E3570"/><stop offset=".5" stop-color="#A9566F"/><stop offset=".85" stop-color="#E8895A"/><stop offset="1" stop-color="#F3B46E"/></linearGradient>
  <linearGradient id="s4Dirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7C6A4A"/><stop offset="1" stop-color="#5A4B33"/></linearGradient>
  <linearGradient id="s4Teak" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6B3F22"/><stop offset="1" stop-color="#7E4B2A"/></linearGradient>
  <linearGradient id="s4Jar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3A2418"/><stop offset=".45" stop-color="#7A4A2C"/><stop offset="1" stop-color="#2E1C12"/></linearGradient>
  <linearGradient id="s4Road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E6470"/><stop offset="1" stop-color="#3E434C"/></linearGradient>
  <radialGradient id="s4Lamp"><stop offset="0" stop-color="#FFE7A6" stop-opacity=".9"/><stop offset="1" stop-color="#FFB85C" stop-opacity="0"/></radialGradient>
  <linearGradient id="s4Beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE2A8" stop-opacity=".45"/><stop offset="1" stop-color="#FFE2A8" stop-opacity="0"/></linearGradient>`;

  // ---------- ของใช้ร่วม ----------
  function sky(o, x0 = -2600, w = 5200) {
    const eve = !!o.eve;
    let s = R(x0, -3400, w, 3400, eve ? "url(#s4SkyEve)" : "url(#s4SkyDay)");
    if (eve) s += C(1100, -980, 360, "url(#s4Lamp)", 'opacity=".7"') + C(1100, -980, 90, "#FFD58A", 'opacity=".9"');
    for (let i = 0; i < 5; i++) { const cx = -2000 + i * 900, cy = -2600 + (i % 2) * 260; s += E(cx, cy, 220, 60, "#FFFFFF", `opacity="${eve ? 0.18 : 0.6}"`) + E(cx + 120, cy - 30, 150, 60, "#FFFFFF", `opacity="${eve ? 0.15 : 0.55}"`); }
    return s;
  }
  function banana(x, y, k, t, c1 = "#3E8A3E", c2 = "#5DAA4E") {
    let s = R(x - 26 * k, y - 900 * k, 52 * k, 900 * k, "#7C8A4A") + R(x - 26 * k, y - 900 * k, 14 * k, 900 * k, "#93A15A");
    for (let i = 0; i < 7; i++) {
      const a = -160 + i * 50, sw = Math.sin(t * 1.1 + i) * 6, rad = (a + sw) * Math.PI / 180, ex = x + Math.cos(rad) * 520 * k, ey = y - 900 * k + Math.sin(rad) * 340 * k - 60 * k;
      s += Pth(`M ${f(x)},${f(y - 880 * k)} Q ${f((x + ex) / 2)},${f(ey - 200 * k)} ${f(ex)},${f(ey)} Q ${f((x + ex) / 2 + 30 * k)},${f(ey + 40 * k)} ${f(x)},${f(y - 860 * k)} Z`, i % 2 ? c1 : c2);
      s += Pth(`M ${f(x)},${f(y - 880 * k)} Q ${f((x + ex) / 2)},${f(ey - 170 * k)} ${f(ex)},${f(ey)}`, "none", ST(sh(c1, -0.25), 4 * k + 1, 0.7));
    }
    return s;
  }
  function bougain(x, y, w, h, seed) {
    const r = RK.rng(seed); let s = Pth(`M ${x},${y + h} C ${x + w * 0.1},${y} ${x + w * 0.9},${y - h * 0.1} ${x + w},${y + h} Z`, "#2F6B3A");
    for (let i = 0; i < 90; i++) { const px = x + r() * w, py = y + r() * h * 0.9; s += C(px, py, 12 + r() * 14, ["#E0368A", "#F05AA0", "#C4246F", "#FF7DB8"][Math.floor(r() * 4)]); }
    for (let i = 0; i < 30; i++) s += C(x + r() * w, y + r() * h, 10 + r() * 8, "#3E8A46");
    return s;
  }
  function jar(x, y, k) { // โอ่งมังกรเคลือบน้ำตาล ลายมังกรเหลือง
    let s = SHD(x, y + 4, 170 * k) + Pth(`M ${f(x - 110 * k)},${f(y - 400 * k)} C ${f(x - 230 * k)},${f(y - 260 * k)} ${f(x - 200 * k)},${f(y - 30 * k)} ${f(x - 110 * k)},${f(y)} L ${f(x + 110 * k)},${f(y)} C ${f(x + 200 * k)},${f(y - 30 * k)} ${f(x + 230 * k)},${f(y - 260 * k)} ${f(x + 110 * k)},${f(y - 400 * k)} Z`, "url(#s4Jar)");
    s += RR(x - 120 * k, y - 430 * k, 240 * k, 40 * k, 14 * k, "#4A2C1A") + E(x, y - 430 * k, 110 * k, 16 * k, "#6EA3C4");
    s += Pth(`M ${f(x - 150 * k)},${f(y - 240 * k)} q ${f(60 * k)},${f(-70 * k)} ${f(120 * k)},0 t ${f(120 * k)},0 t ${f(60 * k)},${f(20 * k)}`, "none", ST("#E8B54A", 14 * k, 0.9));
    s += C(x - 80 * k, y - 270 * k, 10 * k, "#E8B54A") + Pth(`M ${f(x - 60 * k)},${f(y - 360 * k)} q ${f(-40 * k)},${f(120 * k)} ${f(-10 * k)},${f(300 * k)}`, "none", ST("#FFFFFF", 10 * k, 0.18));
    return s;
  }
  function cloth(x, y, w, h, c, t, i, kind) {
    const sw = Math.sin(t * 2.1 + i * 1.3) * 7;
    if (kind === "shirt") return `<g transform="rotate(${f(sw * 0.4)} ${f(x + w / 2)} ${f(y)})">` + Pth(`M ${f(x)},${f(y)} L ${f(x + w)},${f(y)} L ${f(x + w + 40)},${f(y + 80)} L ${f(x + w - 10)},${f(y + 110)} L ${f(x + w - 10)},${f(y + h)} L ${f(x + 10)},${f(y + h)} L ${f(x + 10)},${f(y + 110)} L ${f(x - 40)},${f(y + 80)} Z`, c) + Pth(`M ${f(x + w / 2 - 30)},${f(y)} q 30,40 60,0`, sh(c, -0.25)) + `</g>`;
    if (kind === "pants") return `<g transform="rotate(${f(sw * 0.3)} ${f(x + w / 2)} ${f(y)})">` + Pth(`M ${f(x)},${f(y)} L ${f(x + w)},${f(y)} L ${f(x + w + 6)},${f(y + h)} L ${f(x + w / 2 + 12)},${f(y + h)} L ${f(x + w / 2)},${f(y + 90)} L ${f(x + w / 2 - 12)},${f(y + h)} L ${f(x - 6)},${f(y + h)} Z`, c) + `</g>`;
    // ผ้าเช็ดตัว/ผ้าถุง ปลายพลิ้ว
    return Pth(`M ${f(x)},${f(y)} L ${f(x + w)},${f(y)} L ${f(x + w + sw)},${f(y + h)} Q ${f(x + w / 2 + sw)},${f(y + h + 16)} ${f(x + sw)},${f(y + h)} Z`, c) + R(x + 6, y + h * 0.3, w - 12, 14, sh(c, 0.25), 'opacity=".7"') + R(x + 6, y + h * 0.65, w - 12, 10, sh(c, -0.2), 'opacity=".6"');
  }
  function peg(x, y) { return R(x - 6, y - 18, 12, 30, "#E4572E"); }

  // ================= BACKYARD =================
  function byWall(t, o) {
    let s = sky(o);
    // ต้นไม้ไกล + บ้านเพื่อนบ้าน
    for (let i = 0; i < 9; i++) s += C(-2400 + i * 560, -1250 - (i % 3) * 90, 330, i % 2 ? "#2D5E3A" : "#376E42");
    s += R(-300, -1700, 1100, 1630, "#C8B49A") + Pth("M -360,-1700 L 250,-2050 L 860,-1700 Z", "#8E3B2E") + R(-150, -1500, 260, 220, "#3B4D5E") + R(380, -1500, 260, 220, "#3B4D5E") + R(-150, -1500, 260, 16, "#E9DCC4") + R(380, -1500, 260, 16, "#E9DCC4");
    // กำแพงปูนเตี้ยด้านหลัง + เฟื่องฟ้าล้น
    s += R(-2600, -760, 5200, 690, "#B9A88C") + R(-2600, -780, 5200, 30, "#9E8D72");
    for (let x = -2600; x < 2600; x += 260) s += L(x, -750, x, WALL_Y, "#A8977B", 3, 'opacity=".6"');
    s += bougain(-2100, -1250, 900, 520, 7) + bougain(900, -1180, 1000, 440, 9);
    // ตัวบ้านไม้สักฝั่งซ้าย (ใต้ถุน + ฝาไม้ + หน้าต่างบานเฟี้ยม)
    s += R(-2600, -2300, 1300, 2230, "url(#s4Teak)");
    for (let y = -2300; y < WALL_Y; y += 70) s += L(-2600, y, -1300, y, "#5A3319", 4, 'opacity=".7"');
    s += R(-2100, -1900, 520, 560, "#2B1A10") + R(-2100, -1900, 260, 560, "#8C2F2A") + R(-1840, -1900, 260, 560, "#8C2F2A");
    for (let k = 0; k < 2; k++) for (let j = 0; j < 3; j++) s += RR(-2070 + k * 260, -1860 + j * 175, 200, 140, 6, "#A43A33");
    s += R(-2130, -1340, 580, 30, "#4A2A16") + R(-1320, -2300, 40, 2230, "#4A2A16");
    // ประตูหลังบ้านเปิดแง้ม
    s += R(-1500, -900, 180, 830, "#1F130B") + R(-1500, -900, 120, 830, "#7E4B2A") + C(-1400, -480, 10, "#E8B54A");
    // ก๊อกน้ำ + สายยาง
    s += R(-1150, -520, 20, 450, "#8A8F96") + R(-1180, -540, 60, 30, "#B0B5BC") + Pth("M -1140,-90 C -1000,40 -760,-40 -640,60", "none", ST("#2F9E5A", 16));
    return s;
  }
  function byLamps(t, o) {
    // ราวตากผ้า: เสา 2 ต้น + เชือก + ผ้า
    let s = R(-1200, -1500, 30, 1430, "#6E6E6E") + R(1300, -1500, 30, 1430, "#6E6E6E") + R(-1240, -1520, 110, 24, "#5A5A5A") + R(1260, -1520, 110, 24, "#5A5A5A");
    s += Pth("M -1185,-1480 Q 60,-1400 1315,-1480", "none", ST("#E8E2D4", 5));
    const items = [["#2F6FB0", 170, 300, "shirt"], ["#F2C14E", 160, 380, "towel"], ["#E4572E", 150, 320, "towel"], ["#7A5BA6", 150, 360, "pants"], ["#FFFFFF", 150, 260, "shirt"], ["#3E8A6E", 190, 420, "towel"], ["#E7A3B8", 160, 300, "shirt"]];
    let x = -1080;
    items.forEach(([c, w, h, k], i) => { const yy = -1480 + 80 * (1 - Math.pow((x + w / 2 - 65) / 1250, 2)) - 4; s += cloth(x, yy, w, h, c, t, i, k) + peg(x + 18, yy) + peg(x + w - 18, yy); x += w + 40; });
    return s;
  }
  function byIsland(t, o) {
    if (o.bare) return "";
    // กะละมังซักผ้าบนม้านั่ง + ตะกร้า + โอ่ง
    let s = jar(-900, 120, 1.1) + jar(-560, 90, 0.8);
    const bx = o.basinX ?? 700;
    s += SHD(bx, 160, 300) + R(bx - 280, 20, 560, 40, "#8C5E3C") + R(bx - 250, 60, 30, 100, "#6B4A33") + R(bx + 220, 60, 30, 100, "#6B4A33");
    s += Pth(`M ${bx - 240},20 L ${bx - 200},-120 L ${bx + 200},-120 L ${bx + 240},20 Z`, "#2F8FC4") + E(bx, -120, 200, 26, "#BFE6F7") + E(bx - 60, -126, 50, 14, "#FFFFFF", 'opacity=".8"') + E(bx + 40, -124, 40, 12, "#FFFFFF", 'opacity=".7"');
    s += SHD(1250, 200, 160) + Pth("M 1110,200 L 1140,40 L 1360,40 L 1390,200 Z", "#E4572E") + R(1140, 40, 220, 20, "#C9493B");
    for (let i = 0; i < 6; i++) s += L(1150 + i * 40, 70, 1140 + i * 44, 190, "#C9493B", 5);
    s += Pth("M 1150,40 q 40,-60 90,-20 q 50,-50 110,10 Z", "#2F6FB0") + Pth("M 1180,40 q 40,-40 100,-10 Z", "#F2C14E");
    return s;
  }
  function byFore(t, o) {
    let s = "";
    for (let i = 0; i < 30; i++) { const x = -1900 + i * 130, h = 90 + (i % 5) * 30, sw = Math.sin(t * 1.3 + i) * 8; s += Pth(`M ${x},760 Q ${x + sw},${760 - h * 0.6} ${x + sw * 1.4},${760 - h} Q ${x + 12},${760 - h * 0.6} ${x + 22},760 Z`, i % 2 ? "#2F6B3A" : "#4E8A44"); }
    s += RR(-1700, 520, 220, 240, 20, "#B5523F") + C(-1640, 480, 70, "#4E8A44") + C(-1560, 450, 60, "#3E7A3A") + C(-1600, 430, 18, "#F2C14E");
    s += RR(1520, 540, 200, 220, 20, "#2F6FB0") + C(1580, 500, 70, "#4E8A44") + C(1650, 470, 50, "#E0368A");
    return s;
  }
  function bySun(t, o) {
    if (o.eve) return Pth("M 1400,-2200 L 2400,-2200 L 600,800 L -400,800 Z", "url(#s4Beam)", 'opacity=".35"');
    let s = "";
    for (let i = 0; i < 6; i++) s += E(-1200 + i * 520, 380 + (i % 2) * 60, 180, 30, "#FFF4C8", 'opacity=".12"');
    return s;
  }

  // ================= HOUSE FRONT =================
  function hfWall(t, o) {
    const eve = o.day ? false : true, oo = Object.assign({}, o, { eve });
    let s = sky(oo);
    // สายไฟ + นก
    s += Pth("M -2600,-2350 Q 0,-2150 2600,-2380", "none", ST("#1E1E24", 5)) + Pth("M -2600,-2250 Q 0,-2060 2600,-2270", "none", ST("#1E1E24", 4));
    for (let i = 0; i < 4; i++) { const bx = -400 + i * 90, by = -2178 + Math.abs(i - 1.5) * 4; s += E(bx, by - 14, 16, 12, "#1E1E24") + C(bx + 12, by - 24, 8, "#1E1E24"); }
    // ทาวน์เฮาส์ซ้าย (เพื่อนบ้าน)
    s += R(-2600, -2200, 1050, 2130, "#C76B4E") + R(-2600, -2260, 1050, 70, "#8E4532");
    s += R(-2450, -1980, 760, 420, "#2A2F3A") + R(-2450, -1980, 760, 20, "#E9DCC4") + R(-2480, -1560, 820, 40, "#8E4532");
    for (let i = 0; i < 6; i++) s += L(-2470 + i * 160, -1560, -2470 + i * 160, -1420, "#3A2A26", 10);
    s += L(-2480, -1420, -1660, -1420, "#3A2A26", 12) + RR(-2400, -1500, 120, 80, 10, "#B5523F") + C(-2340, -1520, 50, "#4E8A44");
    s += R(-2500, -1000, 860, 930, "#8A8F96");
    for (let y = -1000; y < -70; y += 34) s += L(-2500, y, -1640, y, "#6E737A", 4);
    // บ้านเรา: ทาวน์เฮาส์สีเขียวมิ้นต์ 2 ชั้น
    const hx = -1450, hw = 2300;
    s += R(hx, -2400, hw, 2330, "#4E9C8E") + R(hx, -2460, hw, 80, "#2F6B61") + R(hx, -1300, hw, 40, "#2F6B61");
    // ชั้นบน: ระเบียง + ต้นไม้ + หน้าต่างไฟเปิด
    for (let k = 0; k < 2; k++) { const wx = hx + 260 + k * 1000; s += R(wx, -2200, 700, 560, "#1F2A33") + R(wx + 20, -2180, 320, 520, eve ? "#FFD889" : "#8FC3E6", `opacity="${eve ? 0.85 : 0.6}"`) + R(wx + 360, -2180, 320, 520, eve ? "#F6C46A" : "#8FC3E6", `opacity="${eve ? 0.75 : 0.6}"`) + R(wx, -2200, 700, 22, "#E9DCC4") + Pth(`M ${wx + 20},-2180 l 130,0 l -110,300 Z`, "#FFFFFF", 'opacity=".18"'); }
    s += R(hx + 120, -1640, hw - 240, 30, "#2F6B61");
    for (let i = 0; i < 18; i++) s += L(hx + 140 + i * 115, -1610, hx + 140 + i * 115, -1440, "#E9DCC4", 10);
    s += L(hx + 120, -1440, hx + hw - 120, -1440, "#E9DCC4", 14);
    for (let i = 0; i < 5; i++) s += RR(hx + 220 + i * 420, -1700, 130, 70, 10, ["#B5523F", "#E4A13A", "#B5523F", "#2F6FB0", "#E4A13A"][i]) + C(hx + 285 + i * 420, -1730, 54, i % 2 ? "#3E8A46" : "#5DAA4E") + (i % 2 ? C(hx + 270 + i * 420, -1750, 14, "#E0368A") : "");
    // ชั้นล่าง: ประตูเหล็กม้วนครึ่ง + ประตูกระจก แสงไฟในบ้าน
    s += R(hx + 200, -1180, 1100, 1110, eve ? "#F2C46E" : "#C9D7DA") + R(hx + 200, -1180, 1100, 420, "#9AA0A8");
    for (let y = -1180; y < -760; y += 30) s += L(hx + 200, y, hx + 1300, y, "#7E848C", 4);
    s += R(hx + 240, -760, 480, 690, "#3A2A26", 'opacity=".25"') + R(hx + 260, -740, 200, 650, eve ? "#FFE3A3" : "#DDEAF0", 'opacity=".65"') + R(hx + 500, -740, 200, 650, eve ? "#FFE3A3" : "#DDEAF0", 'opacity=".65"');
    s += RR(hx + 820, -620, 360, 420, 10, "#7C5A3E") + R(hx + 850, -580, 300, 30, "#5A3E28") + C(hx + 1000, -500, 60, "#E9DCC4"); // ศาลพระภูมิเล็ก/ตู้รองเท้า
    s += RR(hx + 1500, -1150, 520, 380, 12, "#E9DCC4") + T(hx + 1760, -1000, "บ้านเลขที่ 89", 64, "#2F6B61") + T(hx + 1760, -900, "ซอยมะลิ", 52, "#B5523F");
    s += RR(hx + 1550, -700, 420, 600, 10, "#2F6B61") + C(hx + 1930, -400, 14, "#E8B54A");
    // ไฟหน้าบ้าน
    s += RR(hx + 1380, -1250, 60, 90, 12, "#3A2A26") + C(hx + 1410, -1190, 30, "#FFE7A6") + (eve ? C(hx + 1410, -1190, 260, "url(#s4Lamp)", 'opacity=".8"') : "");
    // บ้านขวา
    s += R(850, -2000, 1750, 1930, "#E2C26A") + R(850, -2060, 1750, 70, "#A88A3C") + R(1050, -1800, 540, 380, "#2A2F3A") + R(1700, -1800, 540, 380, "#2A2F3A") + R(1050, -1800, 540, 18, "#FFF4D6") + R(1700, -1800, 540, 18, "#FFF4D6");
    s += R(1000, -1000, 1500, 930, "#8A8F96"); for (let y = -1000; y < -70; y += 34) s += L(1000, y, 2500, y, "#6E737A", 4);
    // ลานคอนกรีต
    s += R(-2600, WALL_Y, 5200, 260, "#A6A39C");
    for (let x = -2600; x < 2600; x += 340) s += L(x, WALL_Y, x - 60, WALL_Y + 260, "#8E8B84", 4);
    return s;
  }
  function hfLamps(t, o) {
    const eve = !o.day;
    // เสาไฟถนนขวา + ต้นมะม่วงซ้าย (ระยะกลางหลัง)
    let s = R(2050, -2500, 40, 2430, "#4A4E57") + Pth("M 2070,-2500 q 0,-80 -200,-90 l -60,0", "none", ST("#4A4E57", 20)) + RR(1760, -2610, 120, 50, 20, "#2E3138") + E(1820, -2560, 50, 16, "#FFE7A6");
    if (eve) s += Pth("M 1760,-2560 L 1880,-2560 L 2300,-60 L 1340,-60 Z", "url(#s4Beam)", 'opacity=".55"') + C(1820, -2560, 160, "url(#s4Lamp)");
    const sw = Math.sin(t * 0.9) * 10;
    s += R(-2050, -1200, 90, 1130, "#5A3B26") + Pth("M -2010,-1000 L -1820,-1300 M -2010,-900 L -2220,-1150", "none", ST("#5A3B26", 40));
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, rx = -2000 + Math.cos(a) * 420 + sw, ry = -1500 + Math.sin(a) * 260; s += C(rx, ry, 230, i % 2 ? "#2F6B3A" : "#3E7A44"); }
    s += C(-2000 + sw, -1500, 300, "#3E7A44");
    for (let i = 0; i < 7; i++) s += E(-2200 + i * 70 + sw, -1340 + (i % 2) * 60, 22, 34, "#E8C04A");
    return s;
  }
  function hfIsland(t, o) {
    // รั้วเหล็ก + เสาประตู + บานประตูรั้ว (เปิดได้) + มอไซค์
    const op = RK.resolve ? RK.resolve(o.gateOpen ?? 1, o._t || 0) : (o.gateOpen ?? 1);
    let s = "";
    const fence = (x0, x1) => { let r = R(x0, 40, x1 - x0, 120, "#D9D2C4") + R(x0, 30, x1 - x0, 20, "#B8B0A0") + L(x0, -380, x1, -380, "#2B2E35", 12) + L(x0, -250, x1, -250, "#2B2E35", 8); for (let x = x0 + 20; x < x1; x += 50) r += L(x, -400, x, 40, "#2B2E35", 9) + Pth(`M ${x - 12},-400 L ${x},-440 L ${x + 12},-400 Z`, "#2B2E35"); return r; };
    s += fence(-2600, -900) + fence(700, 2600);
    s += RR(-930, -620, 140, 780, 10, "#E9DCC4") + RR(-950, -660, 180, 60, 10, "#C9C1B0") + RR(660, -620, 140, 780, 10, "#E9DCC4") + RR(640, -660, 180, 60, 10, "#C9C1B0");
    s += RR(-900, -520, 80, 110, 8, "#B5523F") + T(-860, -450, "89", 44, "#FFFFFF"); // ตู้จดหมาย/เลขบ้าน
    // บานประตูพับไปซ้าย/ขวาตามค่า op (0 ปิด 1 เปิด)
    const gw = 760 * (1 - 0.85 * op);
    const gate = (x0, w, dir) => { let r = R(Math.min(x0, x0 + dir * w), -420, w, 16, "#1E2026") + R(Math.min(x0, x0 + dir * w), 20, w, 16, "#1E2026"); for (let k = 0; k <= 10; k++) r += L(x0 + dir * w * k / 10, -420, x0 + dir * w * k / 10, 36, "#1E2026", 8); return r; };
    s += gate(-790, gw, 1) + gate(660, gw, -1);
    if (!o.noMoto) {
      const mx = o.motoX ?? 1300, my = 120;
      s += SHD(mx, my + 8, 330) + C(mx - 220, my - 80, 86, "#1E1E22") + C(mx - 220, my - 80, 40, "#A0A4AC") + C(mx + 220, my - 80, 86, "#1E1E22") + C(mx + 220, my - 80, 40, "#A0A4AC");
      s += Pth(`M ${mx - 300},${my - 150} Q ${mx - 200},${my - 300} ${mx},${my - 260} L ${mx + 180},${my - 260} Q ${mx + 260},${my - 200} ${mx + 300},${my - 120} L ${mx - 120},${my - 120} Z`, "#C9302C");
      s += RR(mx - 160, my - 330, 280, 60, 26, "#1E1E22") + L(mx + 200, my - 260, mx + 260, my - 440, "#3A3A40", 16) + L(mx + 220, my - 440, mx + 320, my - 440, "#3A3A40", 14) + C(mx + 290, my - 380, 24, "#FFE7A6");
      s += RR(mx - 300, my - 400, 130, 90, 10, "#5E3B26"); // ตะกร้าหลัง
    }
    return s;
  }
  function hfFore(t, o) {
    // ถนนซอย + ขอบฟุตบาท + กระถาง
    let s = R(-2600, 260, 5200, 600, "url(#s4Road)") + R(-2600, 240, 5200, 34, "#C9C3B6");
    for (let x = -2400; x < 2600; x += 520) s += R(x, 560, 260, 18, "#E8E2D4", 'opacity=".75"');
    s += RR(-1750, 120, 220, 200, 18, "#B5523F") + C(-1690, 90, 80, "#3E7A44") + C(-1600, 60, 60, "#4E8A44") + C(-1650, 40, 16, "#F2C14E") + C(-1610, 90, 14, "#E0368A");
    s += RR(1700, 140, 200, 180, 18, "#2F6FB0") + C(1760, 110, 70, "#3E7A44") + C(1820, 90, 56, "#5DAA4E");
    return s;
  }
  function hfSun(t, o) { return ""; }

  const wrap = (fn, back, ground) => (t, o) => (back ? R(-4000, -5000, 8000, 5000 + WALL_Y * K, back(o || {})) + R(-4000, WALL_Y * K, 8000, 4000, ground) : "") + `<g transform="scale(${K})">${fn(t, o || {})}</g>`;
  RK.flatSets.backyard = { wall: wrap(byWall, (o) => (o.eve ? "#2E3570" : "#3F86C9"), "url(#s4Dirt)"), lamps: wrap(byLamps), island: wrap(byIsland), foreground: wrap(byFore), sunlight: wrap(bySun), WALL_Y: WALL_Y * K };
  RK.flatSets.housefront = { wall: wrap(hfWall, (o) => (o.day ? "#3F86C9" : "#2E3570"), "#A6A39C"), lamps: wrap(hfLamps), island: wrap(hfIsland), foreground: wrap(hfFore), sunlight: wrap(hfSun), WALL_Y: WALL_Y * K };
})(window);
