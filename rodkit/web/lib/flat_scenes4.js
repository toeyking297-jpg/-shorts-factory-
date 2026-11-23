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
    s += RR(hx + 1500, -1150, 520, 380, 12, "#E9DCC4") + T(hx + 1760, -1000, o.houseNo || "บ้านเลขที่ 89", 64, "#2F6B61") + T(hx + 1760, -900, o.soi || "ซอยมะลิ", 52, "#B5523F");
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

  // ================= CONDO (ห้องคอนโดของฟ้า) =================
  //  setOpts { night:true, photo:"up|down|none", bed:true(ค่าเริ่ม), mess:true(รก) }
  RK.flatDefs += `
  <linearGradient id="cdWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B06E62"/><stop offset="1" stop-color="#BF7E70"/></linearGradient>
  <linearGradient id="cdWallN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2A48"/><stop offset="1" stop-color="#4A3656"/></linearGradient>
  <linearGradient id="cdCity" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E1530"/><stop offset="1" stop-color="#2A2E5A"/></linearGradient>
  <linearGradient id="cdCityD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FB2E6"/><stop offset="1" stop-color="#CFE6F2"/></linearGradient>
  <radialGradient id="cdLamp"><stop offset="0" stop-color="#FFD98A" stop-opacity=".85"/><stop offset="1" stop-color="#FFB45C" stop-opacity="0"/></radialGradient>`;
  function cdWall(t, o) {
    const n = !!o.night;
    let s = R(-1800, -2500, 3600, 2500 + WALL_Y, n ? "url(#cdWallN)" : "url(#cdWall)");
    // ลายผนังเส้นตั้งบางๆ
    for (let x = -1800; x < 1800; x += 120) s += L(x, -2500, x, WALL_Y, n ? "#33243F" : "#A56458", 3, 'opacity=".5"');
    s += R(-1800, -260, 3600, 190 + WALL_Y + 70, n ? "#2E2138" : "#8E5348") + R(-1800, -270, 3600, 18, n ? "#5A4468" : "#E9C9B8");
    // หน้าต่างบานใหญ่ + เมือง
    const wx = -1450, wy = -2050, ww = 1150, wh = 1250;
    s += R(wx - 30, wy - 30, ww + 60, wh + 60, n ? "#1E1626" : "#6E3F36") + R(wx, wy, ww, wh, n ? "url(#cdCity)" : "url(#cdCityD)");
    const r = RK.rng(11);
    for (let i = 0; i < 9; i++) { const bx = wx + i * 130, bh = 300 + r() * 650, bw = 110; s += R(bx, wy + wh - bh, bw, bh, n ? "#151A36" : "#8FA5B8"); for (let yy = wy + wh - bh + 30; yy < wy + wh - 20; yy += 55) for (let xx = bx + 14; xx < bx + bw - 20; xx += 32) if (r() < (n ? 0.45 : 0.25)) s += R(xx, yy, 16, 24, n ? (r() < 0.8 ? "#FFD27A" : "#9FD3FF") : "#D9E6EE", `opacity="${n ? 0.9 : 0.8}"`); }
    if (n) s += C(wx + 900, wy + 180, 60, "#FFF4D0") + C(wx + 925, wy + 165, 55, "#0E1530");
    s += R(wx + ww / 2 - 10, wy, 20, wh, n ? "#1E1626" : "#6E3F36") + R(wx, wy + wh / 2 - 8, ww, 16, n ? "#1E1626" : "#6E3F36");
    // ผ้าม่านมัสตาร์ด
    const sw = Math.sin(t * 0.8) * 8;
    s += Pth(`M ${wx - 120},${wy - 80} L ${wx + 110},${wy - 80} Q ${wx + 60 + sw},${wy + 600} ${wx + 120 + sw},${wy + wh + 90} L ${wx - 120},${wy + wh + 90} Z`, n ? "#8C6A2E" : "#D9A441");
    s += Pth(`M ${wx + ww + 120},${wy - 80} L ${wx + ww - 110},${wy - 80} Q ${wx + ww - 60 - sw},${wy + 600} ${wx + ww - 120 - sw},${wy + wh + 90} L ${wx + ww + 120},${wy + wh + 90} Z`, n ? "#8C6A2E" : "#D9A441");
    for (let k = 0; k < 4; k++) s += L(wx - 90 + k * 50, wy - 60, wx - 60 + k * 50 + sw, wy + wh + 80, n ? "#7A5A24" : "#C08E34", 6, 'opacity=".6"');
    s += R(wx - 160, wy - 100, ww + 320, 26, n ? "#2A1E30" : "#5A3A2E");
    // ชั้นวาง + รูปคู่ (ของสำคัญ) + ต้นไม้ + หนังสือ
    const shx = 300, shy = -1500;
    s += R(shx, shy, 900, 28, n ? "#5A4468" : "#6E4A3A") + R(shx, shy - 500, 900, 24, n ? "#5A4468" : "#6E4A3A");
    const bc = ["#2F6FB0", "#F2C14E", "#3E8A6E", "#E4572E", "#7A5BA6", "#FFFFFF"];
    for (let i = 0; i < 9; i++) s += R(shx + 30 + i * 46, shy - 200 - (i % 3) * 30, 40, 200 + (i % 3) * 30, bc[i % 6]);
    s += RR(shx + 520, shy - 120, 130, 120, 20, "#E9DCC4") + C(shx + 585, shy - 170, 70, "#3E8A46") + C(shx + 545, shy - 210, 50, "#5DAA4E");
    s += RR(shx + 700, shy - 640, 160, 140, 14, "#3E8A6E") + C(shx + 780, shy - 670, 60, "#5DAA4E");
    const ph = o.photo || "up";
    if (ph === "up") {
      s += `<g transform="rotate(-4 ${shx + 260} ${shy - 600})">` + RR(shx + 120, shy - 760, 300, 260, 12, "#F7EBD8") + R(shx + 140, shy - 740, 260, 200, n ? "#7E9BC4" : "#9CC6E8");
      // คนสองคนในรูป (ฟ้า + ภูมิ)
      s += C(shx + 225, shy - 650, 34, "#EEC4A0") + Pth(`M ${shx + 190},${shy - 670} q 35,-50 72,0 l 0,40 l -12,-30 l -48,0 Z`, "#2C1C17") + R(shx + 195, shy - 615, 60, 75, "#6F94C4");
      s += C(shx + 315, shy - 655, 36, "#EBC09B") + Pth(`M ${shx + 280},${shy - 680} q 36,-40 72,0 Z`, "#1E1614") + R(shx + 285, shy - 618, 62, 78, "#2F5E6B");
      s += Pth(`M ${shx + 268},${shy - 700} c -6,-14 -22,-8 -16,6 l 16,14 l 16,-14 c 6,-14 -10,-20 -16,-6 Z`, "#E4572E") + `</g>`;
    } else if (ph === "down") s += R(shx + 130, shy - 520, 300, 22, "#F7EBD8") + R(shx + 130, shy - 520, 300, 8, "#C9B9A0");
    // ปฏิทิน + โปสเตอร์
    s += RR(1300, -1900, 330, 400, 10, "#F7EBD8") + R(1300, -1900, 330, 90, "#E4572E") + T(1465, -1830, "วันนี้", 52, "#FFFFFF");
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) s += R(1330 + i * 75, -1790 + j * 70, 50, 40, (i + j) % 5 ? "#E7D8C2" : "#F2C14E");
    // พื้นไม้
    s += R(-1800, WALL_Y, 3600, 1600, n ? "#3A2A22" : "#9A6A46");
    for (let x = -1800; x < 1800; x += 220) s += L(x, WALL_Y, x - 260, WALL_Y + 1600, n ? "#2E2018" : "#87593A", 4);
    return s;
  }
  function cdLamps(t, o) {
    const n = !!o.night;
    let s = n ? C(1040, -420, 700, "url(#cdLamp)", 'opacity=".9"') : "";
    if (o.bed === false) return s;
    // หัวเตียง + ที่นอนด้านหลัง (อยู่หลังตัวละคร) + หมอน
    s += RR(-560, -820, 1240, 620, 50, n ? "#3B2A30" : "#5E3A30") + RR(-520, -780, 1160, 540, 40, n ? "#4E3640" : "#7A4A3A");
    s += RR(-600, -260, 1320, 300, 30, n ? "#C9CBD8" : "#F4EFE6") + RR(-610, -270, 1340, 90, 30, n ? "#DCDEEA" : "#FFFFFF");
    s += RR(-560, -380, 340, 140, 60, n ? "#DCDEEA" : "#FFFFFF") + RR(-180, -370, 300, 130, 60, "#F2C14E");
    if (o.mess) s += C(150, -250, 40, "#F7EBD8") + R(110, -270, 80, 30, "#3E8A46");
    return s;
  }
  function cdIsland(t, o) {
    if (o.bed === false) return "";
    // เตียง: หัวเตียงชิดผนัง ผ้าห่มฟ้าเทา หมอน
    const n = !!o.night;
    let s = SHD(250, 230, 900, 0.35);
    s += RR(-600, 0, 1320, 200, 30, n ? "#C9CBD8" : "#F4EFE6");
    s += Pth("M -620,60 C -300,10 200,90 740,40 L 740,200 L -620,200 Z", n ? "#5A6E9A" : "#4F7FB8") + Pth("M -620,60 C -300,10 200,90 740,40", "none", ST(n ? "#7A8EBA" : "#79A2D4", 14));
    for (let i = 0; i < 6; i++) s += C(-500 + i * 230, 140 + (i % 2) * 24, 22, n ? "#7A8EBA" : "#F2C14E", 'opacity=".55"');
    if (o.mess) { s += RR(400, -10, 160, 50, 14, "#E4572E") + RR(-300, 0, 120, 40, 10, "#FFFFFF"); }
    // โต๊ะหัวเตียง + โคม + โทรศัพท์
    s += SHD(1040, 200, 220) + RR(880, -260, 320, 460, 16, n ? "#5A3E2E" : "#7A5236") + R(900, -60, 280, 10, n ? "#3A2A20" : "#5A3E28") + C(1040, 60, 14, "#E8B54A");
    s += R(1020, -520, 40, 260, "#C9B9A0") + Pth("M 930,-520 L 1150,-520 L 1100,-700 L 980,-700 Z", n ? "#FFE3A3" : "#F2C14E");
    s += RR(940, -300, 90, 40, 8, "#1E1E24") + (o.night ? R(948, -296, 74, 30, "#8FD3FF", 'opacity=".8"') : "");
    return s;
  }
  function cdFore(t, o) {
    let s = E(-200, 520, 900, 120, o.night ? "#5A3E5A" : "#3E8A6E", 'opacity=".9"') + E(-200, 520, 760, 90, o.night ? "#6E4E6E" : "#5DAA8E", 'opacity=".8"');
    s += RR(-1600, 360, 180, 120, 30, "#F7EBD8") + RR(-1380, 380, 180, 120, 30, "#F7EBD8"); // รองเท้าแตะ
    if (o.mess) s += RR(1200, 420, 300, 120, 20, "#C9C1B0") + RR(1250, 380, 120, 60, 10, "#E4572E");
    return s;
  }
  RK.flatSets.condo = { wall: wrap(cdWall, (o) => (o.night ? "#3A2A48" : "#B06E62"), "#9A6A46"), lamps: wrap(cdLamps), island: wrap(cdIsland), foreground: wrap(cdFore), sunlight: () => "", WALL_Y: WALL_Y * K };


  // ================= CAFE (ร้านกาแฟ) =================
  //  setOpts { eve:true, cups:2|1|0, rain:true }
  RK.flatDefs += `
  <linearGradient id="cfWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F5D50"/><stop offset="1" stop-color="#3A6B5D"/></linearGradient>
  <linearGradient id="cfWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9744A"/><stop offset="1" stop-color="#8A5A36"/></linearGradient>
  <linearGradient id="cfStreet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CCBE8"/><stop offset="1" stop-color="#E6F0F2"/></linearGradient>
  <linearGradient id="cfStreetE" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A3F78"/><stop offset="1" stop-color="#E28A64"/></linearGradient>`;
  function cfWall(t, o) {
    const e = !!o.eve;
    let s = R(-1900, -2600, 3800, 2600 + WALL_Y, "url(#cfWall)");
    // ผนังอิฐครึ่งล่าง
    s += R(-1900, -760, 3800, 690, "#8E4A3A");
    for (let y = -760, r = 0; y < WALL_Y; y += 46, r++) for (let x = -1900 + (r % 2) * 70; x < 1900; x += 140) s += R(x + 3, y + 3, 134, 40, r % 3 ? "#A0574400" : "#9A5242", 'opacity=".9"') + L(x, y, x + 140, y, "#6E352A", 3) + L(x, y, x, y + 46, "#6E352A", 3);
    s += R(-1900, -780, 3800, 26, "#5A2E24");
    // หน้าต่างใหญ่ซ้าย + ถนน + คนเดินผ่าน
    const wx = -1750, wy = -2150, ww = 1250, wh = 1300;
    s += R(wx - 30, wy - 30, ww + 60, wh + 60, "#1E2E28") + R(wx, wy, ww, wh, e ? "url(#cfStreetE)" : "url(#cfStreet)");
    s += R(wx, wy + 700, ww, 600, e ? "#4A4060" : "#C9B9A0") + R(wx + 80, wy + 260, 300, 440, e ? "#2E2A48" : "#D98C6B") + R(wx + 500, wy + 160, 380, 540, e ? "#3A3460" : "#E2C26A") + R(wx + 940, wy + 300, 260, 400, e ? "#2E2A48" : "#7FA6AE");
    for (let i = 0; i < 6; i++) s += R(wx + 120 + i * 180, wy + 340 + (i % 2) * 120, 70, 90, e ? "#FFD27A" : "#E9F2F6", 'opacity=".85"');
    const px = wx + ((t * 140) % (ww + 200)) - 100; s += C(px, wy + 900, 34, "#3A2A26", 'opacity=".55"') + RR(px - 40, wy + 930, 80, 200, 30, "#3A2A26", 'opacity=".55"');
    if (o.rain) for (let i = 0; i < 60; i++) { const rx = wx + ((i * 97) % ww), ry = wy + ((t * 900 + i * 131) % wh); s += L(rx, ry, rx - 10, ry + 50, "#DDE8F5", 3, 'opacity=".6"'); }
    s += R(wx + ww / 2 - 12, wy, 24, wh, "#1E2E28") + T(wx + ww / 2, wy + 200, "OPEN", 80, "#F2C14E", 'opacity=".25"');
    // กันสาดผ้าลายขวาง (ด้านใน)
    for (let i = 0; i < 10; i++) s += Pth(`M ${wx - 40 + i * 133},${wy - 40} l 133,0 l 0,90 q -66,40 -133,0 Z`, i % 2 ? "#F7EBD8" : "#C9493B");
    // กระดานชอล์กเมนู
    const bx = -250, by = -2150;
    s += RR(bx - 30, by - 30, 900, 1000, 20, "#6E4A30") + R(bx, by, 840, 940, "#23302B");
    s += T(bx + 420, by + 120, "เมนูวันนี้", 84, "#F7EBD8");
    ["ลาเต้เย็น      55", "อเมริกาโน่    50", "ชาไทย          45", "โกโก้ร้อน      50", "ครัวซองต์      65"].forEach((m, i) => { s += `<text x="${bx + 80}" y="${by + 260 + i * 120}" font-family="Kanit" font-weight="600" font-size="56" fill="#E9E2D2" opacity=".9">${m}</text>`; });
    s += Pth(`M ${bx + 640},${by + 820} q 40,-80 80,0 q 40,-80 80,0`, "none", ST("#F2C14E", 8)) + C(bx + 120, by + 840, 30, "#E4572E", 'opacity=".8"');
    // ชั้นวางเมล็ดกาแฟ + ต้นไม้แขวน
    const sx = 850, sy = -1900;
    s += R(sx, sy, 950, 26, "#5A3A26") + R(sx, sy + 400, 950, 26, "#5A3A26");
    for (let i = 0; i < 6; i++) s += RR(sx + 40 + i * 150, sy - 210, 110, 210, 14, ["#F7EBD8", "#C9493B", "#F2C14E", "#F7EBD8", "#7FA6AE", "#C9493B"][i]) + R(sx + 55 + i * 150, sy - 140, 80, 60, "#6E4A30", 'opacity=".7"');
    for (let i = 0; i < 5; i++) s += C(sx + 100 + i * 180, sy + 300, 70, "#E9DCC4") + R(sx + 40 + i * 180, sy + 300, 120, 100, "#E9DCC4");
    const sw = Math.sin(t * 0.9) * 6;
    for (let k = 0; k < 2; k++) { const hx = sx + 250 + k * 450; s += L(hx, -2600, hx, -2250, "#2A1E16", 4) + RR(hx - 60, -2260, 120, 100, 20, "#B5523F"); for (let j = 0; j < 7; j++) s += Pth(`M ${hx - 40 + j * 14},-2170 q ${f(sw - 20 + j * 6)},180 ${f(sw - 30 + j * 10)},${300 + (j % 3) * 60}`, "none", ST(j % 2 ? "#3E8A46" : "#5DAA4E", 12)); }
    // เคาน์เตอร์บาร์ + เครื่องชง
    s += R(800, -760, 1100, 690, "#6E4A30") + R(780, -800, 1140, 50, "#C9B9A0");
    for (let i = 0; i < 8; i++) s += L(820 + i * 135, -740, 820 + i * 135, -90, "#5A3A26", 6);
    s += RR(1000, -1100, 380, 300, 30, "#B0B5BC") + RR(1020, -1080, 340, 90, 20, "#8A8F96") + C(1110, -930, 26, "#2A2E35") + C(1270, -930, 26, "#2A2E35") + R(1080, -860, 60, 50, "#2A2E35") + R(1240, -860, 60, 50, "#2A2E35");
    s += RR(1450, -980, 160, 180, 20, "#F2C14E") + RR(1650, -960, 120, 160, 16, "#FFFFFF") + C(1710, -1000, 40, "#7A4A2C");
    // พื้นไม้
    s += R(-1900, WALL_Y, 3800, 1800, "#7A5236");
    for (let x = -1900; x < 1900; x += 200) s += L(x, WALL_Y, x - 320, WALL_Y + 1800, "#674528", 4);
    return s;
  }
  function cfLamps(t, o) {
    let s = "";
    for (let i = 0; i < 3; i++) { const lx = -700 + i * 700, sw = Math.sin(t * 0.8 + i) * 4; s += L(lx, -2600, lx + sw, -1900, "#1E1A16", 5) + Pth(`M ${lx + sw - 110},-1830 L ${lx + sw + 110},-1830 L ${lx + sw + 60},-1910 L ${lx + sw - 60},-1910 Z`, "#2A2E35") + E(lx + sw, -1826, 90, 18, "#FFE3A3") + C(lx + sw, -1700, 320, "url(#cdLamp)", 'opacity=".5"'); }
    return s;
  }
  function cfIsland(t, o) {
    // โต๊ะไม้กลาง (ซ่อนขาคนนั่ง) + แก้วกาแฟ
    const x0 = o.tableX ?? 0, top = -260, w = 1300;
    let s = E(x0, 40, w * 0.5, 36, "#1A0E08", 'opacity=".3"');
    s += R(x0 - w / 2 + 30, top, w - 60, 320, "#5A3A26") + R(x0 - w / 2 + 30, top, w - 60, 40, "#3E2818", 'opacity=".6"');
    s += RR(x0 - w / 2, top - 30, w, 46, 10, "url(#cfWood)") + R(x0 - w / 2, top + 6, w, 10, "#6E4A30");
    const cup = (x, iced) => iced ? Pth(`M ${x - 46},${top - 200} L ${x + 46},${top - 200} L ${x + 36},${top - 30} L ${x - 36},${top - 30} Z`, "#E9DCC4", 'opacity=".95"') + Pth(`M ${x - 40},${top - 140} L ${x + 40},${top - 140} L ${x + 36},${top - 30} L ${x - 36},${top - 30} Z`, "#A86A3E") + R(x - 46, top - 210, 92, 16, "#F7EBD8") + L(x + 14, top - 280, x + 4, top - 160, "#2F8F6B", 10)
      : RR(x - 60, top - 120, 120, 92, 20, "#F7EBD8") + Pth(`M ${x + 58},${top - 100} q 50,10 0,50`, "none", ST("#F7EBD8", 12)) + E(x, top - 120, 60, 12, "#6E3F22") + E(x, top - 26, 90, 14, "#E9DCC4");
    const n = o.cups ?? 2;
    if (n >= 1) s += cup(x0 - 240, false);
    if (n >= 2) s += cup(x0 + 240, true);
    if (o.phone) s += RR(x0 - 60, top - 46, 120, 30, 8, "#1E1E24") + (o.phoneLit ? R(x0 - 52, top - 42, 104, 22, "#8FD3FF") : "");
    return s;
  }
  function cfFore(t, o) {
    let s = RR(-1850, 300, 260, 300, 30, "#B5523F") + C(-1720, 230, 130, "#2F6B3A") + C(-1640, 160, 100, "#3E8A46") + C(-1800, 180, 90, "#4E8A44");
    s += RR(1550, 320, 240, 280, 30, "#E9DCC4") + C(1670, 250, 120, "#3E8A46") + C(1750, 190, 80, "#5DAA4E");
    return s;
  }
  RK.flatSets.cafe = { wall: wrap(cfWall, () => "#2F5D50", "#7A5236"), lamps: wrap(cfLamps), island: wrap(cfIsland), foreground: wrap(cfFore), sunlight: () => "", WALL_Y: WALL_Y * K };


  // ================= ROOFTOP (ร้านอาหารดาดฟ้ากลางคืน) =================
  RK.flatDefs += `
  <linearGradient id="rtSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151B45"/><stop offset=".6" stop-color="#3B2F6E"/><stop offset="1" stop-color="#C2607A"/></linearGradient>
  <radialGradient id="rtBulb"><stop offset="0" stop-color="#FFE7A6" stop-opacity=".95"/><stop offset="1" stop-color="#FFB45C" stop-opacity="0"/></radialGradient>`;
  function rtWall(t, o) {
    let s = R(-2600, -3400, 5200, 3400 + WALL_Y, "url(#rtSky)");
    const r = RK.rng(21);
    for (let i = 0; i < 60; i++) s += C(-2500 + r() * 5000, -3300 + r() * 1300, 3 + r() * 4, "#FFFFFF", `opacity="${(0.3 + 0.5 * Math.abs(Math.sin(t * 1.5 + i))).toFixed(2)}"`);
    s += C(1500, -2700, 110, "#FFF4D0") + C(1540, -2720, 100, "#2A2560");
    // เส้นขอบฟ้าเมือง 2 ชั้น
    for (let layer = 0; layer < 2; layer++) for (let i = 0; i < 16; i++) { const bx = -2600 + i * 340 + layer * 160, bh = 500 + r() * (layer ? 1100 : 700), bw = 260 + r() * 80, c = layer ? "#1E2250" : "#2E3368";
      s += R(bx, WALL_Y - 600 - bh + layer * 200, bw, bh, c); for (let yy = WALL_Y - 560 - bh + layer * 200; yy < WALL_Y - 640 + layer * 200; yy += 70) for (let xx = bx + 20; xx < bx + bw - 30; xx += 50) if (r() < 0.4) s += R(xx, yy, 22, 34, r() < 0.8 ? "#FFD27A" : "#8FD3FF", `opacity="${layer ? 0.9 : 0.6}"`); }
    s += R(1700, -2600, 50, 900, "#1E2250") + C(1725, -2620, 16, "#FF4D4D", `opacity="${0.4 + 0.6 * (Math.floor(t * 1.5) % 2)}"`);
    // ราวกันตกกระจก + พื้นไม้ระเบียง
    s += R(-2600, -700, 5200, 630, "#9FD3FF", 'opacity=".12"') + R(-2600, -720, 5200, 22, "#C9CED8");
    for (let x = -2600; x < 2600; x += 520) s += R(x, -720, 18, 650, "#C9CED8");
    s += R(-2600, WALL_Y, 5200, 1800, "#5A3E2E"); for (let y = WALL_Y; y < WALL_Y + 1800; y += 60) s += L(-2600, y, 2600, y, "#4A3226", 3);
    // ต้นไม้กระถางสูง
    for (const px of [-1900, 1950]) s += RR(px - 130, -420, 260, 350, 20, "#2A2E35") + C(px, -560, 180, "#2F6B3A") + C(px - 80, -680, 140, "#3E8A46") + C(px + 70, -760, 120, "#4E8A44");
    return s;
  }
  function rtLamps(t, o) {
    // ไฟสายระโยง 2 เส้น
    let s = "";
    for (let k = 0; k < 2; k++) { const y0 = -1900 + k * 260; s += Pth(`M -2600,${y0} Q 0,${y0 + 380} 2600,${y0}`, "none", ST("#1A1A22", 4));
      for (let i = 0; i <= 26; i++) { const u = i / 26, x = -2600 + u * 5200, y = y0 + 4 * 380 * u * (1 - u) * 0.5 * 2 * 0.5 * 2; const yy = y0 + 380 * 4 * u * (1 - u) * 0.5; const fl = 0.75 + 0.25 * Math.sin(t * 3 + i * 1.7 + k);
        s += C(x, yy + 26, 70, "url(#rtBulb)", `opacity="${(0.55 * fl).toFixed(2)}"`) + C(x, yy + 26, 14, "#FFE7A6"); } }
    return s;
  }
  function rtIsland(t, o) {
    const x0 = o.tableX ?? 0, top = -260, w = 1250;
    let s = E(x0, 40, w * 0.5, 36, "#0A0612", 'opacity=".35"') + R(x0 - w / 2 + 20, top, w - 40, 320, "#F4EFE6") + R(x0 - w / 2 + 20, top + 200, w - 40, 14, "#C9493B", 'opacity=".7"');
    s += RR(x0 - w / 2, top - 24, w, 36, 10, "#FFFFFF");
    // เทียน + จาน + แก้วไวน์น้ำแดง
    const fl = 1 + 0.15 * Math.sin(t * 9);
    s += R(x0 - 22, top - 150, 44, 130, "#F7EBD8") + E(x0, top - 168, 14 * fl, 26 * fl, "#FFC24A") + C(x0, top - 160, 120, "url(#rtBulb)", 'opacity=".55"');
    for (const sx of [-1, 1]) { const px = x0 + sx * 320; s += E(px, top - 30, 150, 26, "#FFFFFF", 'stroke="#D9CDB8" stroke-width="3"') + E(px, top - 38, 100, 18, o.empty ? "#F4EFE6" : "#E4A13A") + (o.empty ? "" : C(px - 30, top - 50, 22, "#3E8A46") + C(px + 30, top - 48, 20, "#C9493B"));
      const gx = x0 + sx * 120; s += Pth(`M ${gx - 34},${top - 200} L ${gx + 34},${top - 200} Q ${gx + 34},${top - 120} ${gx},${top - 110} Q ${gx - 34},${top - 120} ${gx - 34},${top - 200} Z`, "#E9F2F6", 'opacity=".8"') + Pth(`M ${gx - 30},${top - 165} L ${gx + 30},${top - 165} Q ${gx + 28},${top - 122} ${gx},${top - 114} Q ${gx - 28},${top - 122} ${gx - 30},${top - 165} Z`, "#B3262C") + L(gx, top - 110, gx, top - 30, "#E9F2F6", 6) + E(gx, top - 28, 30, 8, "#E9F2F6"); }
    return s;
  }
  RK.flatSets.rooftop = { wall: wrap(rtWall, () => "#151B45", "#5A3E2E"), lamps: wrap(rtLamps), island: wrap(rtIsland), foreground: wrap((t, o) => ""), sunlight: () => "", WALL_Y: WALL_Y * K };

  // ================= POTTERY (คลาสปั้นดิน) =================
  //  setOpts { wheels:[x...] ตำแหน่งแป้นหมุน, clay:"tall|bowl|wonky" }
  function ptWall(t, o) {
    let s = R(-2200, -2600, 4400, 2600 + WALL_Y, "#E0A458") + R(-2200, -2600, 4400, 900, "#D38F43");
    for (let x = -2200; x < 2200; x += 260) s += L(x, -1700, x, WALL_Y, "#CC9248", 4, 'opacity=".5"');
    // หน้าต่างโค้งแสงเช้า
    for (const wx of [-1650, 1100]) { s += Pth(`M ${wx},-900 L ${wx},-1900 Q ${wx + 280},-2250 ${wx + 560},-1900 L ${wx + 560},-900 Z`, "#7A4A2C") + Pth(`M ${wx + 30},-930 L ${wx + 30},-1890 Q ${wx + 280},-2200 ${wx + 530},-1890 L ${wx + 530},-930 Z`, "#BFE3F0") + L(wx + 280, -2150, wx + 280, -930, "#7A4A2C", 14) + L(wx + 30, -1400, wx + 530, -1400, "#7A4A2C", 14) + C(wx + 140, -1700, 80, "#5DAA4E", 'opacity=".7"'); }
    // ชั้นวางงานปั้น 3 ชั้น
    const sx = -900, sy = -2000, colors = ["#B5523F", "#E9DCC4", "#3E7FA8", "#C9A36A", "#7A9A6A", "#F2C14E", "#E9DCC4", "#9A6A4A"];
    for (let k = 0; k < 3; k++) { const y = sy + k * 380; s += R(sx, y, 1800, 30, "#6E4A30");
      for (let i = 0; i < 8; i++) { const px = sx + 80 + i * 215, c = colors[(i + k * 3) % 8], tp = (i + k) % 3; s += tp === 0 ? Pth(`M ${px - 60},${y} Q ${px - 80},${y - 150} ${px - 30},${y - 200} L ${px + 30},${y - 200} Q ${px + 80},${y - 150} ${px + 60},${y} Z`, c) + E(px, y - 200, 30, 8, sh(c, -0.3))
        : tp === 1 ? Pth(`M ${px - 80},${y - 90} Q ${px},${y + 30} ${px + 80},${y - 90} Z`, c) + E(px, y - 90, 80, 14, sh(c, -0.25)) : RR(px - 50, y - 160, 100, 160, 30, c) + Pth(`M ${px + 50},${y - 120} q 40,10 0,60`, "none", ST(c, 14)); } }
    // ป้าย + ผ้ากันเปื้อนแขวน
    s += RR(-300, -2480, 600, 150, 20, "#5A3A26") + T(0, -2380, "คลาสปั้นดิน", 90, "#F7EBD8");
    for (let i = 0; i < 4; i++) s += L(1200 + i * 150, -760, 1200 + i * 150, -700, "#5A3A26", 6) + Pth(`M ${1150 + i * 150},-700 L ${1250 + i * 150},-700 L ${1270 + i * 150},-420 L ${1130 + i * 150},-420 Z`, ["#3E6FB0", "#C9493B", "#3E8A6E", "#F2C14E"][i]);
    // พื้นปูนขัด + คราบดิน
    s += R(-2200, WALL_Y, 4400, 1800, "#B9ADA0"); for (let i = 0; i < 14; i++) s += E(-1900 + i * 290, 200 + (i % 3) * 140, 70, 18, "#9A7A5A", 'opacity=".35"');
    return s;
  }
  function ptIsland(t, o) {
    // โต๊ะแป้นหมุนยาว (ซ่อนขาคนนั่ง) + ดินบนแป้นหมุน
    const top = -260, w = 2200;
    let s = E(0, 40, w * 0.48, 36, "#3A2A20", 'opacity=".3"') + R(-w / 2, top, w, 320, "#8A6A4A") + RR(-w / 2 - 20, top - 30, w + 40, 44, 10, "#A9845A");
    const clay = o.clay || "tall";
    for (const [i, wx] of (o.wheels || [-300, 300]).entries()) {
      const spin = t * 7 + i, form = Array.isArray(clay) ? clay[i] : clay;
      s += `<g transform="translate(${f(wx)},${top}) scale(.72) translate(${f(-wx)},${-top})">`;
      s += E(wx, top - 34, 200, 34, "#4A4E57") + E(wx, top - 44, 180, 28, "#6E737A");
      for (let k = 0; k < 6; k++) { const a = spin + k * Math.PI / 3, xx = wx + Math.cos(a) * 150; if (Math.sin(a) > 0) s += L(xx, top - 52, xx, top - 38, "#4A4E57", 5); }
      const cc = "#B5734A", hi = "#D08F64";
      if (form === "bowl") s += Pth(`M ${wx - 120},${top - 160} Q ${wx - 110},${top - 50} ${wx},${top - 48} Q ${wx + 110},${top - 50} ${wx + 120},${top - 160} Z`, cc) + E(wx, top - 160, 120, 22, "#8E5434");
      else if (form === "wonky") { const wb = Math.sin(spin) * 18; s += Pth(`M ${wx - 70},${top - 50} Q ${wx - 120 + wb},${top - 160} ${wx - 30 + wb * 1.5},${top - 260} L ${wx + 40 + wb * 1.5},${top - 250} Q ${wx + 110 + wb},${top - 150} ${wx + 70},${top - 50} Z`, cc) + E(wx + wb * 1.5, top - 255, 36, 10, "#8E5434"); }
      else s += Pth(`M ${wx - 80},${top - 50} Q ${wx - 110},${top - 170} ${wx - 50},${top - 270} L ${wx + 50},${top - 270} Q ${wx + 110},${top - 170} ${wx + 80},${top - 50} Z`, cc) + E(wx, top - 270, 50, 12, "#8E5434");
      for (let k = 0; k < 3; k++) { const yy = top - 90 - k * 55 - ((spin * 20) % 55); s += L(wx - 70 + k * 8, yy, wx + 70 - k * 8, yy, hi, 4, 'opacity=".5"'); }
      s += `</g>`;
    }
    // ถังน้ำ + ฟองน้ำ + เครื่องมือ
    s += RR(-1000, top - 140, 150, 120, 16, "#3E7FA8") + E(-925, top - 140, 75, 14, "#8FC3E6") + RR(860, top - 70, 120, 50, 10, "#F2C14E") + L(700, top - 40, 800, top - 60, "#6E4A30", 10);
    return s;
  }
  RK.flatSets.pottery = { wall: wrap(ptWall, () => "#E0A458", "#B9ADA0"), lamps: wrap((t, o) => ""), island: wrap(ptIsland), foreground: wrap((t, o) => RR(-1950, 340, 300, 260, 30, "#B5523F") + C(-1800, 280, 140, "#3E8A46") + C(-1720, 200, 100, "#5DAA4E")), sunlight: wrap((t, o) => Pth("M -1600,-1900 L -1100,-1900 L -300,400 L -1300,400 Z", "#FFF4C8", 'opacity=".12"') + Pth("M 1150,-1900 L 1650,-1900 L 2200,400 L 1400,400 Z", "#FFF4C8", 'opacity=".12"')), WALL_Y: WALL_Y * K };


  // ================= RIVERSIDE (ท่าน้ำริมเจ้าพระยา ยามเย็น) =================
  RK.flatDefs += `
  <linearGradient id="rvWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C96A6A"/><stop offset=".4" stop-color="#6A5A8A"/><stop offset="1" stop-color="#2E3A6A"/></linearGradient>`;
  function rvWall(t, o) {
    let s = R(-2600, -3400, 5200, 3400, "url(#s4SkyEve)");
    s += C(300, -1330, 230, "#FFD58A", 'opacity=".9"') + C(300, -1330, 560, "url(#s4Lamp)", 'opacity=".7"');
    for (let i = 0; i < 4; i++) s += E(-1800 + i * 1200, -2600 + (i % 2) * 200, 380, 50, "#F3B46E", 'opacity=".35"');
    // ฝั่งตรงข้าม: ต้นไม้ + เจดีย์/ปรางค์ + อาคาร
    const by = -1080;
    for (let i = 0; i < 14; i++) s += C(-2600 + i * 390, by + 20, 170, "#3A2A48");
    s += R(-2600, by, 5200, 160, "#33243F");
    const pr = (x, h, w) => Pth(`M ${x - w},${by} L ${x - w * 0.7},${by - h * 0.45} L ${x - w * 0.35},${by - h * 0.8} L ${x},${by - h} L ${x + w * 0.35},${by - h * 0.8} L ${x + w * 0.7},${by - h * 0.45} L ${x + w},${by} Z`, "#2A1E3A") + L(x, by - h, x, by - h - 120, "#2A1E3A", 10);
    s += pr(-700, 760, 230) + pr(-1150, 420, 130) + pr(-250, 420, 130);
    s += R(1100, by - 520, 300, 520, "#2E2448") + R(1450, by - 380, 260, 380, "#2E2448") + R(1750, by - 640, 220, 640, "#2E2448");
    for (let i = 0; i < 10; i++) s += R(1130 + (i % 3) * 90, by - 480 + Math.floor(i / 3) * 110, 40, 50, "#FFD27A", 'opacity=".8"');
    // แม่น้ำ + ประกายแดด + ระลอก
    s += R(-2600, by + 160, 5200, -by - 160 + WALL_Y, "url(#rvWater)");
    for (let i = 0; i < 26; i++) { const yy = by + 220 + i * 45, w = 60 + i * 9, x = 300 + Math.sin(t * 1.4 + i) * 40; s += R(x - w / 2, yy, w, 8, "#FFD58A", `opacity="${(0.65 - i * 0.02).toFixed(2)}"`); }
    for (let i = 0; i < 18; i++) { const x = -2400 + ((i * 331 + t * 60) % 4800), y = by + 260 + (i * 97) % 900; s += L(x, y, x + 120, y, "#E9DCF2", 4, 'opacity=".35"'); }
    // เรือหางยาววิ่งผ่าน
    const bx = -2800 + ((t * 260) % 6000), byy = by + 520;
    s += Pth(`M ${bx - 260},${byy} L ${bx + 300},${byy} Q ${bx + 360},${byy - 30} ${bx + 380},${byy - 80} L ${bx - 260},${byy - 40} Z`, "#7A3A2A") + R(bx - 200, byy - 120, 300, 80, "#E4572E") + R(bx - 220, byy - 130, 340, 16, "#F2C14E") + L(bx - 260, byy - 30, bx - 380, byy + 20, "#2A1E16", 8) + Pth(`M ${bx - 380},${byy + 20} q -60,10 -120,0`, "none", ST("#FFFFFF", 6, 0.5));
    // ท่าเรือไม้ (พื้น)
    s += R(-2600, WALL_Y, 5200, 1800, "#7A5236");
    for (let x = -2600; x < 2600; x += 180) s += L(x, WALL_Y, x - 300, WALL_Y + 1800, "#5E3E28", 5);
    s += R(-2600, WALL_Y - 20, 5200, 30, "#5E3E28");
    return s;
  }
  function rvLamps(t, o) {
    // เสาไฟท่าน้ำ + ม้านั่งไม้ (หลังคน)
    let s = "";
    for (const lx of [-1700, 1700]) s += R(lx - 18, -1500, 36, 1430, "#2A2E35") + RR(lx - 60, -1600, 120, 120, 30, "#2A2E35") + C(lx, -1540, 40, "#FFE7A6") + C(lx, -1540, 240, "url(#s4Lamp)", 'opacity=".8"');
    s += RR(-700, -620, 1400, 60, 16, "#8E5A36") + RR(-700, -520, 1400, 60, 16, "#8E5A36") + R(-640, -620, 30, 560, "#5E3E28") + R(610, -620, 30, 560, "#5E3E28");
    return s;
  }
  function rvIsland(t, o) {
    // ราวท่าน้ำเตี้ย (บังขา = ท่านั่ง) + เชือกพันเสา + กระถางดอกไม้
    const top = -260;
    let s = R(-2600, top, 5200, 330, "#6E4A30") + RR(-2600, top - 30, 5200, 44, 10, "#8E5A36");
    for (let x = -2400; x < 2600; x += 600) s += R(x - 24, top - 60, 48, 390, "#5E3E28") + E(x, top - 60, 30, 10, "#7A5236") + Pth(`M ${x - 26},${top + 40} q 26,20 52,0 M ${x - 26},${top + 80} q 26,20 52,0`, "none", ST("#D9C49A", 8));
    for (const px of [-1500, 1500]) s += RR(px - 110, top - 150, 220, 130, 20, "#B5523F") + C(px - 40, top - 190, 50, "#E0368A") + C(px + 40, top - 200, 46, "#F2C14E") + C(px, top - 230, 40, "#FF7DB8") + C(px - 70, top - 160, 30, "#3E8A46") + C(px + 70, top - 160, 30, "#3E8A46");
    return s;
  }
  RK.flatSets.riverside = { wall: wrap(rvWall, () => "#2E3570", "#7A5236"), lamps: wrap(rvLamps), island: wrap(rvIsland), foreground: wrap((t, o) => ""), sunlight: () => "", WALL_Y: WALL_Y * K };


  // ================= BUSSTOP (ป้ายรถเมล์ ฝนตกกลางคืน) =================
  function bsWall(t, o) {
    let s = R(-2600, -3400, 5200, 3400 + WALL_Y, "#1B2238");
    // ตึกฝั่งตรงข้ามเบลอ ไฟร้าน
    const r = RK.rng(31);
    for (let i = 0; i < 9; i++) { const bx = -2600 + i * 600, bh = 1300 + r() * 900; s += R(bx, WALL_Y - bh, 560, bh, i % 2 ? "#252E4A" : "#2C3656");
      for (let yy = WALL_Y - bh + 80; yy < WALL_Y - 500; yy += 140) for (let xx = bx + 40; xx < bx + 520; xx += 110) if (r() < 0.5) s += R(xx, yy, 60, 80, r() < 0.7 ? "#FFD27A" : "#8FD3FF", 'opacity=".55"'); }
    s += RR(-1900, -720, 700, 260, 20, "#E4572E", 'opacity=".85"') + T(-1550, -560, "7-11", 120, "#FFFFFF") + RR(600, -760, 900, 300, 20, "#2F8F6B", 'opacity=".8"') + T(1050, -580, "ร้านข้าวมันไก่", 90, "#FFFFFF");
    // ถนนเปียก + แสงสะท้อน
    s += R(-2600, -420, 5200, 350 + WALL_Y + 420, "#262C3C");
    for (let i = 0; i < 12; i++) s += R(-2400 + i * 420, -300, 200, 14, "#E8E2D4", 'opacity=".5"');
    for (let i = 0; i < 8; i++) { const x = -2300 + i * 600; s += R(x, -400, 40, 330, ["#FFD27A", "#E4572E", "#8FD3FF"][i % 3], 'opacity=".25"'); }
    // ไฟรถวิ่งผ่าน
    const cx = 2800 - ((t * 900) % 6200); s += RR(cx, -560, 520, 170, 40, "#2E3138") + C(cx + 30, -480, 30, "#FFF4C8") + C(cx + 30, -480, 140, "url(#s4Lamp)", 'opacity=".8"') + R(cx - 600, -490, 600, 40, "#FFF4C8", 'opacity=".12"');
    // ทางเท้า
    s += R(-2600, WALL_Y - 20, 5200, 1800, "#4A505E") + R(-2600, WALL_Y - 30, 5200, 30, "#8A8F96");
    for (let x = -2600; x < 2600; x += 300) s += L(x, WALL_Y, x - 200, WALL_Y + 1800, "#3E4350", 4);
    return s;
  }
  function bsLamps(t, o) {
    // ศาลาป้ายรถเมล์ (หลังคน): หลังคา เสา ป้ายสาย ม้านั่ง
    let s = R(-1500, -1500, 3000, 80, "#2F6FB0") + R(-1500, -1430, 3000, 30, "#1E4F80") + R(-1400, -1410, 40, 1350, "#8A8F96") + R(1360, -1410, 40, 1350, "#8A8F96");
    s += R(-1360, -1400, 2720, 900, "#9FD3FF", 'opacity=".12"') + RR(-1250, -1340, 600, 520, 20, "#F2C14E") + T(-950, -1200, "สาย 8", 84, "#1E2230") + T(-950, -1070, "อนุสาวรีย์ฯ", 56, "#1E2230") + T(-950, -960, "สะพานพุทธ", 56, "#1E2230");
    s += RR(650, -1340, 600, 520, 20, "#FFFFFF", 'opacity=".9"') + T(950, -1140, "โปรดรอรถ", 64, "#2F6FB0") + T(950, -1000, "ในศาลา", 64, "#2F6FB0");
    s += R(-1200, -430, 2400, 40, "#6E737A") + R(-1150, -390, 40, 330, "#6E737A") + R(1110, -390, 40, 330, "#6E737A");
    s += C(0, -1450, 420, "url(#s4Lamp)", 'opacity=".45"') + RR(-120, -1430, 240, 30, 10, "#FFF4C8");
    return s;
  }
  function bsRain(t, o) {
    // ฝน (หน้าสุด) + หยดกระเด็นที่พื้น
    let s = "";
    for (let i = 0; i < 160; i++) { const x = -2600 + ((i * 263) % 5200), y = -2600 + ((t * 2400 + i * 397) % 3400); s += L(x, y, x - 26, y + 130, "#DDEBFF", 6, 'opacity=".55"'); }
    for (let i = 0; i < 30; i++) { const x = -2400 + ((i * 331) % 4800), ph = (t * 3 + i * 0.37) % 1; s += E(x, WALL_Y + 200 + (i % 5) * 160, 30 * ph + 6, 6 * ph + 2, "#CFE0F5", `opacity="${(0.6 * (1 - ph)).toFixed(2)}"`); }
    return s;
  }
  RK.flatSets.busstop = { wall: wrap(bsWall, () => "#1B2238", "#4A505E"), lamps: wrap(bsLamps), island: wrap((t, o) => ""), foreground: wrap(bsRain), sunlight: () => "", WALL_Y: WALL_Y * K };

  // ================= ISAN (บ้านไม้ใต้ถุนสูง ทุ่งนา ภูเขา) =================
  //  setOpts { dawn:true, eve:true, mat:true(เสื่อ+สำรับกลางใต้ถุน), steam:true(หวดนึ่งข้าว) }
  function isWall(t, o) {
    const sky = o.dawn ? "url(#s4SkyEve)" : o.eve ? "url(#s4SkyEve)" : "url(#s4SkyDay)";
    let s = R(-2600, -3400, 5200, 3400, sky);
    if (o.dawn) s += C(1600, -1500, 160, "#FFD58A") + C(1600, -1500, 500, "url(#s4Lamp)", 'opacity=".7"');
    // ภูเขา + ทุ่งนา
    s += Pth("M -2600,-1300 L -1800,-2100 L -1100,-1500 L -300,-2300 L 600,-1550 L 1400,-2000 L 2600,-1400 L 2600,-1200 L -2600,-1200 Z", o.dawn ? "#5A4A78" : "#4E7A8A", 'opacity=".9"');
    s += R(-2600, -1250, 5200, 700, o.dawn ? "#8EA65A" : "#7DBA4E");
    for (let i = 0; i < 18; i++) s += L(-2600, -1200 + i * 40, 2600, -1180 + i * 40, o.dawn ? "#7A9A4E" : "#6AA844", 6, 'opacity=".7"');
    for (let i = 0; i < 30; i++) { const x = -2500 + i * 170, sw = Math.sin(t * 1.4 + i * 0.6) * 10; s += Pth(`M ${x},-560 q ${sw},-60 ${sw * 1.5},-120 M ${x + 30},-560 q ${sw},-50 ${sw * 1.5 + 20},-100`, "none", ST("#5E9A3A", 8)); }
    // ต้นตาล + กล้วย
    for (const px of [-2100, 2200]) { s += R(px - 22, -2300, 44, 1750, "#6E5A3E"); for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; s += Pth(`M ${px},-2300 l ${Math.cos(a) * 260},${Math.sin(a) * 160 - 60} l ${Math.cos(a + 0.2) * 40},40 Z`, "#3E7A3A"); } }
    s += banana(-1500, -540, 0.9, t) + banana(1700, -540, 0.8, t);
    // บ้านไม้ใต้ถุนสูง
    const hx = -1100, hw = 2200;
    s += Pth(`M ${hx - 200},-1900 L ${hx + hw / 2},-2600 L ${hx + hw + 200},-1900 Z`, "#8E3B2E") + Pth(`M ${hx - 200},-1900 L ${hx + hw / 2},-2600 L ${hx + hw + 200},-1900`, "none", ST("#6E2A20", 20));
    s += R(hx, -1900, hw, 760, "url(#s4Teak)"); for (let y = -1900; y < -1140; y += 60) s += L(hx, y, hx + hw, y, "#5A3319", 4, 'opacity=".7"');
    for (let k = 0; k < 3; k++) s += R(hx + 200 + k * 700, -1760, 360, 420, "#2B1A10") + R(hx + 200 + k * 700, -1760, 180, 420, "#8C5A2A") + R(hx + 380 + k * 700, -1760, 180, 420, "#8C5A2A");
    s += R(hx - 60, -1150, hw + 120, 60, "#5A3319");
    for (let k = 0; k < 7; k++) s += R(hx + 20 + k * 350, -1090, 60, 1020, "#6E4A30");
    // บันได + โอ่ง + ไหปลาร้า
    s += Pth(`M ${hx + hw - 100},-1100 L ${hx + hw + 260},-70 L ${hx + hw + 360},-70 L ${hx + hw},-1100 Z`, "#7A5236") + jar(hx + 400, -80, 0.7) + jar(hx + hw - 300, -80, 0.55);
    s += R(-2600, WALL_Y, 5200, 1800, "#A68A62"); for (let i = 0; i < 20; i++) s += E(-2400 + i * 260, 200 + (i % 4) * 120, 50, 10, "#8E7450", 'opacity=".4"');
    return s;
  }
  function isIsland(t, o) {
    let s = "";
    if (o.mat) { // เสื่อ + ขันโตก (สำรับ) ระดับโต๊ะเตี้ย ซ่อนขาคนนั่งพับเพียบ
      const top = -120;
      s += R(-1300, top, 2600, 300, "#C9A050") + R(-1300, top, 2600, 300, "url(#cdLamp)", 'opacity="0"');
      for (let x = -1300; x < 1300; x += 80) s += L(x, top, x, top + 300, "#A8843E", 4);
      s += R(-1300, top + 60, 2600, 20, "#B5523F") + R(-1300, top + 200, 2600, 20, "#2F6FB0");
      s += E(0, top - 10, 420, 60, "#7A4A2C") + E(0, top - 22, 380, 46, "#9A6A3E");
      s += RR(-300, top - 150, 140, 130, 30, "#C9A36A") + Pth(`M ${-300},${top - 150} q 70,-60 140,0`, "#E9DCC4") + E(-10, top - 60, 90, 22, "#3E8A46") + E(180, top - 60, 80, 20, "#E4A13A") + C(180, top - 76, 20, "#C9493B") + E(-160, top - 50, 60, 16, "#F7EBD8");
    }
    if (o.steam) { // เตาถ่าน + หม้อนึ่ง + หวดข้าวเหนียว + ไอน้ำ
      const x = o.steamX ?? 300, top = -260;
      s += R(x - 140, top + 40, 280, 260, "#6E6E6E") + E(x, top + 40, 140, 26, "#4A4A4A") + C(x, top + 160, 50, "#E4572E", `opacity="${0.6 + 0.3 * Math.sin(t * 8)}"`);
      s += Pth(`M ${x - 150},${top + 30} L ${x + 150},${top + 30} L ${x + 120},${top - 150} L ${x - 120},${top - 150} Z`, "#B0B5BC") + Pth(`M ${x - 110},${top - 150} L ${x + 110},${top - 150} L ${x + 60},${top - 420} L ${x - 60},${top - 420} Z`, "#C9A050");
      for (let k = 0; k < 6; k++) s += L(x - 100 + k * 40, top - 160, x - 50 + k * 20, top - 410, "#A8843E", 4);
      for (let k = 0; k < 4; k++) { const ph = (t * 0.6 + k * 0.25) % 1; s += C(x + Math.sin(ph * 6 + k) * 40, top - 440 - ph * 500, 40 + ph * 60, "#FFFFFF", `opacity="${(0.5 * (1 - ph)).toFixed(2)}"`); }
    }
    return s;
  }
  RK.flatSets.isan = { wall: wrap(isWall, (o) => (o.dawn || o.eve ? "#2E3570" : "#3F86C9"), "#A68A62"), lamps: wrap((t, o) => ""), island: wrap(isIsland), foreground: wrap((t, o) => ""), sunlight: wrap((t, o) => o.dawn ? Pth("M 1600,-1500 L 2600,-1500 L 600,800 L -600,800 Z", "url(#s4Beam)", 'opacity=".35"') : ""), WALL_Y: WALL_Y * K };

  // ================= FAIR (งานวัด กลางคืน: ชิงช้าสวรรค์ ไฟ ร้านค้า) =================
  function frWall(t, o) {
    let s = R(-2600, -3400, 5200, 3400 + WALL_Y, "#141A3A");
    const r = RK.rng(41); for (let i = 0; i < 40; i++) s += C(-2500 + r() * 5000, -3300 + r() * 900, 3 + r() * 3, "#FFFFFF", 'opacity=".5"');
    // ชิงช้าสวรรค์หมุน
    const wx = 900, wy = -1900, wr = 900, rot = t * 0.25;
    s += Pth(`M ${wx - 500},-70 L ${wx},${wy} L ${wx + 500},-70`, "none", ST("#C9CED8", 26));
    s += C(wx, wy, wr, "none", 'stroke="#E9DCC4" stroke-width="18"') + C(wx, wy, wr * 0.6, "none", 'stroke="#E9DCC4" stroke-width="8" opacity=".6"');
    for (let k = 0; k < 12; k++) { const a = rot + k * Math.PI / 6, ex = wx + Math.cos(a) * wr, ey = wy + Math.sin(a) * wr; s += L(wx, wy, ex, ey, "#E9DCC4", 6) + C(ex, ey, 14, ["#FF5A7A", "#FFD27A", "#5AC8FF"][k % 3]) + C(ex, ey, 60, "url(#rtBulb)", 'opacity=".5"');
      s += RR(ex - 60, ey + 10, 120, 100, 20, ["#E4572E", "#2F6FB0", "#F2C14E", "#3E8A6E"][k % 4]) + R(ex - 44, ey + 26, 88, 36, "#1E2230", 'opacity=".6"'); }
    s += C(wx, wy, 60, "#E9DCC4");
    // ศาลา/โบสถ์ไกล
    s += Pth("M -2400,-1500 L -1900,-1900 L -1400,-1500 Z", "#3A2A48") + R(-2300, -1500, 800, 700, "#3A2A48") + Pth("M -1900,-1900 L -1900,-2150", "none", ST("#3A2A48", 14));
    // ซุ้มร้านค้า 3 ร้าน
    const stall = (x, c, txt) => R(x - 360, -900, 720, 830, "#2A2E35") + Pth(`M ${x - 420},-900 L ${x + 420},-900 L ${x + 360},-1120 L ${x - 360},-1120 Z`, c) + T(x, -980, txt, 76, "#FFFFFF") + R(x - 340, -500, 680, 40, "#6E4A30") + C(x - 200, -560, 50, "#F2C14E") + C(x, -560, 50, "#FF5A7A") + C(x + 200, -560, 50, "#5AC8FF");
    s += stall(-1700, "#C9302C", "ยิงปืนลูกโป่ง") + stall(-800, "#2F8F6B", "สายไหม") + stall(100, "#E4A13A", "ลูกชิ้นปิ้ง");
    // ไฟประดับ
    for (let k = 0; k < 2; k++) for (let i = 0; i < 30; i++) { const x = -2600 + i * 180, y = -1250 - k * 200 + Math.sin(i * 0.6) * 40; s += C(x, y, 12, ["#FF5A7A", "#FFD27A", "#5AC8FF", "#7CFF8A"][(i + k) % 4], `opacity="${(0.6 + 0.4 * Math.sin(t * 4 + i)).toFixed(2)}"`); }
    s += R(-2600, WALL_Y, 5200, 1800, "#3A3428"); for (let i = 0; i < 16; i++) s += E(-2400 + i * 320, 220 + (i % 3) * 150, 90, 14, "#FFD27A", 'opacity=".08"');
    return s;
  }
  function frFore(t, o) {
    // ลูกโป่ง + พวงไฟหน้า
    let s = "";
    for (let i = 0; i < 5; i++) { const x = -1900 + i * 70, y = 200 - i * 40 + Math.sin(t * 2 + i) * 14; s += L(x, y + 70, -1820, 520, "#E9DCC4", 3) + E(x, y, 50, 64, ["#FF5A7A", "#FFD27A", "#5AC8FF", "#7CFF8A", "#E0368A"][i]); }
    return s;
  }
  RK.flatSets.fair = { wall: wrap(frWall, () => "#141A3A", "#3A3428"), lamps: wrap((t, o) => ""), island: wrap((t, o) => ""), foreground: wrap(frFore), sunlight: () => "", WALL_Y: WALL_Y * K };

  // ฉากสีเรียบ (ใช้ทำปก: เรนเดอร์บนเขียวแล้วตัดพื้นออก)
  const plainW = (t, o) => R(-6000, -6000, 12000, 12000, o.color || "#00FF00"), nil = () => "";
  RK.flatSets.plain = { wall: plainW, lamps: nil, island: nil, foreground: nil, sunlight: nil, WALL_Y: WALL_Y * K };
  RK.flatSets.backyard = { wall: wrap(byWall, (o) => (o.eve ? "#2E3570" : "#3F86C9"), "url(#s4Dirt)"), lamps: wrap(byLamps), island: wrap(byIsland), foreground: wrap(byFore), sunlight: wrap(bySun), WALL_Y: WALL_Y * K };
  RK.flatSets.housefront = { wall: wrap(hfWall, (o) => (o.day ? "#3F86C9" : "#2E3570"), "#A6A39C"), lamps: wrap(hfLamps), island: wrap(hfIsland), foreground: wrap(hfFore), sunlight: wrap(hfSun), WALL_Y: WALL_Y * K };
})(window);
