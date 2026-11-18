// flat_town.js — ฉากนอกบ้าน/ที่ทำงาน: ออฟฟิศ (office) + ตลาดสด (market)
// พิกัดโลกเหมือนฉากบ้าน (สเกล K ให้สัมพันธ์กับตัวละคร) · setOpts: office {late:true} = ทำโอทีกลางคืน · market {rain:false}
(function (G) {
  const RK = G.RK, f = RK.f, sh = RK.shade, KIT = RK._kit;
  const R = (x, y, w, h, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${c}" ${ex}/>`;
  const RR = (x, y, w, h, r, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" fill="${c}" ${ex}/>`;
  const C = (x, y, r, c, ex = "") => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" ${ex}/>`;
  const E = (x, y, rx, ry, c, ex = "") => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${c}" ${ex}/>`;
  const Pth = (d, c, ex = "") => `<path d="${d}" fill="${c}" ${ex}/>`;
  const L = (x1, y1, x2, y2, c, w, ex = "") => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${ex}/>`;
  const ST = (c, w, op = 1) => `stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"`;
  const T = (x, y, txt, size, c, ex = "") => `<text x="${f(x)}" y="${f(y)}" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="${size}" fill="${c}" ${ex}>${RK.esc ? RK.esc(txt) : txt}</text>`;
  const WALL_Y = -70, K = 0.72;

  RK.flatDefs += `
  <linearGradient id="oWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDE3E8"/><stop offset="1" stop-color="#E9EDF0"/></linearGradient>
  <linearGradient id="oWallN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A5466"/><stop offset="1" stop-color="#5A6375"/></linearGradient>
  <linearGradient id="oCarpet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7C8794"/><stop offset="1" stop-color="#5B6572"/></linearGradient>
  <linearGradient id="oCityDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7DB8E2"/><stop offset="1" stop-color="#D8ECF6"/></linearGradient>
  <linearGradient id="oCityN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0F1530"/><stop offset="1" stop-color="#3A2F5C"/></linearGradient>
  <linearGradient id="oScreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9F4FF"/><stop offset="1" stop-color="#CFE3F5"/></linearGradient>
  <linearGradient id="oGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#CFE6EE" stop-opacity=".55"/><stop offset="1" stop-color="#A9CBD8" stop-opacity=".35"/></linearGradient>
  <radialGradient id="oLampG"><stop offset="0" stop-color="#FFE9B0" stop-opacity=".8"/><stop offset="1" stop-color="#FFE9B0" stop-opacity="0"/></radialGradient>
  <linearGradient id="mSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8CC4EA"/><stop offset=".6" stop-color="#E8F1F2"/><stop offset="1" stop-color="#FCE6C2"/></linearGradient>
  <linearGradient id="mGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A39A8E"/><stop offset="1" stop-color="#7E766B"/></linearGradient>
  <linearGradient id="mShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E1410" stop-opacity=".35"/><stop offset="1" stop-color="#1E1410" stop-opacity="0"/></linearGradient>
  <linearGradient id="mIce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4FBFF"/><stop offset="1" stop-color="#C9E6F2"/></linearGradient>`;

  // ======================= ออฟฟิศ =======================
  function city(x, y, w, h, t, night, id) {
    let s = `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})"><g transform="translate(${f(RK._camPx * 0.25)},0)">`;
    s += R(x - 500, y - 100, w + 1000, h + 200, night ? "url(#oCityN)" : "url(#oCityDay)");
    if (!night) s += E(x + w * 0.2 + t * 6, y + 80, 90, 26, "#FFFFFF", 'opacity=".85"') + E(x + w * 0.7 + t * 4, y + 50, 70, 20, "#FFFFFF", 'opacity=".8"');
    else { const r0 = RK.rng(4); for (let i = 0; i < 20; i++) s += C(x - 300 + r0() * (w + 600), y + r0() * h * 0.3, 2, "#FFF8D6", 'opacity=".7"'); }
    const r = RK.rng(77);
    for (let layer = 0; layer < 2; layer++) {
      let bx = x - 400;
      while (bx < x + w + 400) {
        const bw = 90 + r() * 140, bh = (layer ? 300 : 420) + r() * (layer ? 260 : 380), by = y + h - bh + 20;
        const col = night ? (layer ? "#1E2440" : "#2A3154") : (layer ? "#A9BDCB" : "#8FA6B8");
        s += R(bx, by, bw, bh + 200, col);
        for (let wy = by + 24; wy < y + h; wy += 40) for (let wx = bx + 14; wx < bx + bw - 20; wx += 30) {
          const on = night ? r() < 0.45 : r() < 0.15;
          s += R(wx, wy, 16, 22, night ? (on ? "#FFD98A" : "#2E3658") : (on ? "#E8F4FA" : sh(col, -0.12)), `opacity="${night ? 0.9 : 0.8}"`);
        }
        if (r() < 0.25) s += L(bx + bw / 2, by, bx + bw / 2, by - 60, night ? "#FF6B6B" : "#5E6B78", 4) + C(bx + bw / 2, by - 62, 6, night ? "#FF6B6B" : "#E4572E", night ? `opacity="${f(0.5 + 0.5 * Math.sin(t * 3 + bx))}"` : "");
        bx += bw + 10 + r() * 30;
      }
    }
    s += `</g></g>`;
    return s;
  }
  function blinds(x, y, w, h, t, night) {
    let s = "";
    const down = h * 0.32;
    for (let yy = y; yy < y + down; yy += 22) s += R(x, yy, w, 16, night ? "#8A93A3" : "#F3F5F7", 'opacity=".95"') + R(x, yy + 14, w, 3, night ? "#6E7787" : "#D2D8DE");
    s += L(x + 40, y, x + 40, y + down + 160, "#C8CED4", 3) + C(x + 40, y + down + 166, 8, "#C8CED4");
    return s;
  }
  function monitor(x, y, w, t, night, kind) {
    const h = w * 0.62;
    let s = RR(x - w / 2 - 10, y - h - 10, w + 20, h + 20, 10, "#22262B") + R(x - w / 2, y - h, w, h, "url(#oScreen)");
    if (kind === 0) { // กราฟ
      s += R(x - w / 2 + 12, y - h + 12, w - 24, 22, "#4F7FB0");
      const r = RK.rng(Math.round(x));
      for (let i = 0; i < 6; i++) { const bh = (0.2 + r() * 0.5) * h * (0.9 + 0.1 * Math.sin(t * 2 + i)); s += R(x - w / 2 + 20 + i * (w - 40) / 6, y - 14 - bh, (w - 40) / 6 - 8, bh, ["#5E8FB0", "#E3A548", "#68A866"][i % 3]); }
    } else if (kind === 1) { // โค้ด/เอกสาร
      for (let i = 0; i < 7; i++) s += R(x - w / 2 + 16 + (i % 3) * 14, y - h + 18 + i * (h - 30) / 7, (w - 50) * (0.4 + ((i * 37) % 50) / 100), 7, ["#8E6FA8", "#4F7FB0", "#C9493B", "#68A866"][i % 4]);
      s += R(x - w / 2 + 16 + ((t * 40) % (w * 0.6)), y - 26, 4, 12, "#2B2F3A");
    } else { // แชท/อีเมล
      s += R(x - w / 2, y - h, w * 0.3, h, "#DCE6F0");
      for (let i = 0; i < 4; i++) s += RR(x - w / 2 + w * 0.36 + (i % 2) * w * 0.18, y - h + 14 + i * h * 0.22, w * 0.42, h * 0.15, 8, i % 2 ? "#CDEBC9" : "#FFFFFF");
    }
    s += R(x - w / 2, y - h, w, h * 0.35, "#FFFFFF", 'opacity=".12"');
    s += R(x - 10, y + 10, 20, 50, "#30353B") + RR(x - 60, y + 56, 120, 14, 6, "#30353B");
    if (night) s += E(x, y - h / 2, w * 1.1, h, "#9FD8FF", 'opacity=".12"');
    return s;
  }
  function oWall(t, o) {
    const n = !!o.late;
    let s = R(-1700, -2400, 3400, 2400 + WALL_Y, n ? "url(#oWallN)" : "url(#oWall)");
    // เพดานฝ้า + ไฟเส้น
    s += R(-1700, -2400, 3400, 560, n ? "#3A4252" : "#F2F4F6");
    for (let x = -1700; x < 1700; x += 300) s += L(x, -2400, x, -1840, n ? "#323946" : "#DDE1E5", 3);
    for (const lx of [-1100, -300, 500, 1300]) s += RR(lx - 160, -1870, 320, 24, 8, n ? "#6B7383" : "#FFFFFF") + (n ? "" : E(lx, -1830, 280, 90, "#FFFFFF", 'opacity=".35"'));
    // หน้าต่างกระจกบานใหญ่ 2 บาน + ม่านมู่ลี่
    for (const [wx, id] of [[-1560, "oW1"], [-860, "oW2"]]) {
      s += city(wx, -1720, 600, 900, t, n, id) + blinds(wx, -1720, 600, 900, t, n);
      s += `<rect x="${wx - 16}" y="-1736" width="632" height="932" fill="none" stroke="${n ? "#2E3440" : "#C3CBD3"}" stroke-width="32"/>` + R(wx + 292, -1720, 16, 900, n ? "#2E3440" : "#C3CBD3");
      s += R(wx - 30, -820, 660, 30, n ? "#3A4252" : "#D6DCE2");
    }
    // ไวท์บอร์ด + กราฟ + โพสต์อิท
    const bx = -100;
    s += RR(bx, -1640, 760, 470, 12, "#AEB6BE") + R(bx + 14, -1626, 732, 442, "#FBFCFD");
    s += Pth(`M ${bx + 60},-1260 L ${bx + 180},-1330 L ${bx + 300},-1300 L ${bx + 420},-1420 L ${bx + 540},-1380`, "none", ST("#2F6FB0", 6)) + Pth(`M ${bx + 520},-1400 l 30,10 l -16,26`, "none", ST("#2F6FB0", 6));
    s += L(bx + 50, -1230, bx + 560, -1230, "#555", 3) + L(bx + 50, -1230, bx + 50, -1580, "#555", 3);
    s += T(bx + 300, -1560, "ยอดขาย Q4", 40, "#C9493B");
    const pc = ["#FFE27A", "#FF9FB0", "#9FE0C9", "#A9C8FF", "#FFC68A"];
    for (let i = 0; i < 8; i++) { const px = bx + 590 + (i % 2) * 74, py = -1600 + Math.floor(i / 2) * 100, a = ((i * 37) % 11) - 5; s += `<g transform="rotate(${a} ${px + 30} ${py + 30})">` + R(px, py, 62, 62, pc[i % 5]) + L(px + 10, py + 22, px + 50, py + 22, "#7A6A5A", 3) + L(px + 10, py + 36, px + 40, py + 36, "#7A6A5A", 3) + `</g>`; }
    s += RR(bx + 20, -1190, 720, 18, 6, "#AEB6BE") + RR(bx + 80, -1206, 70, 16, 4, "#C9493B") + RR(bx + 160, -1206, 70, 16, 4, "#2F6FB0") + RR(bx + 240, -1206, 70, 16, 4, "#2F8F4F");
    // ป้ายบริษัท + โปสเตอร์ให้กำลังใจ + นาฬิกา
    s += RR(780, -1700, 360, 120, 14, "#2F5E6B") + C(850, -1640, 38, "#F2C14E") + T(850, -1627, "DP", 34, "#2F5E6B") + T(990, -1624, "ดูเพลิน", 44, "#FFFFFF");
    s += KIT.frame(800, -1520, 300, 380, "#2B2F3A", R(812, -1508, 276, 356, "#F2C14E") + T(950, -1380, "สู้ๆ", 96, "#C9493B") + T(950, -1270, "วันนี้ก็เก่งมาก", 34, "#3A2A26") + C(950, -1210, 20, "#C9493B"));
    s += KIT.clock(1360, -1560, 80, t, "#3A4252") + KIT.calendar(1250, -1400);
    // ห้องประชุมกระจก (ขวาหลัง)
    s += R(1200, -1180, 520, 1110, "url(#oGlass)") + R(1200, -1180, 520, 14, "#9AA6B0") + R(1196, -1180, 14, 1110, "#9AA6B0");
    s += RR(1300, -560, 360, 30, 8, "#7C5A3E", 'opacity=".75"') + R(1340, -530, 20, 460, "#5A4232", 'opacity=".6"') + C(1380, -680, 40, "#5E6B78", 'opacity=".45"') + RR(1350, -640, 60, 110, 20, "#5E6B78", 'opacity=".45"') + C(1560, -690, 36, "#5E6B78", 'opacity=".45"') + RR(1530, -652, 60, 110, 20, "#5E6B78", 'opacity=".45"');
    s += R(1210, -900, 510, 40, "#FFFFFF", 'opacity=".35"') + Pth("M 1230,-1160 l 160,0 l -160,300 Z", "#FFFFFF", 'opacity=".2"');
    // ตู้เอกสาร + เครื่องปริ้น + ตู้น้ำ + ต้นไม้
    s += RR(-1560, -620, 300, 560, 10, "#B6BEC6") + [0, 1, 2].map((i) => RR(-1545, -600 + i * 180, 270, 160, 6, "#C9D0D7") + RR(-1450, -540 + i * 180, 80, 14, 7, "#7E8994")).join("");
    s += RR(-1560, -700, 300, 80, 10, "#E9ECEF") + RR(-1520, -760, 220, 60, 8, "#5E6B78") + R(-1500, -700, 180, 12, "#2B2F3A") + R(-1480, -760, 140, 8, "#FFFFFF") + Pth(`M -1470,-690 l 120,0 l -10,${f(30 + 10 * Math.sin(t * 2))} l -100,0 Z`, "#FFFFFF");
    s += RR(-1200, -640, 150, 580, 14, "#E9ECEF") + RR(-1180, -620, 110, 220, 10, "#9CC9E6") + R(-1180, -620, 110, 50, "#7FB4D8") + RR(-1170, -380, 30, 40, 6, "#2F6FB0") + RR(-1110, -380, 30, 40, 6, "#C9493B") + RR(-1190, -320, 130, 14, 6, "#B6BEC6");
    s += KIT.plant(-980, WALL_Y, 0.85, t, "#F2F4F6");
    // ราวแขวนเสื้อ
    s += L(1100, WALL_Y, 1100, -760, "#3A4252", 10) + L(1060, -760, 1140, -760, "#3A4252", 8) + Pth("M 1060,-760 l -40,30 M 1140,-760 l 40,30", "none", ST("#3A4252", 6)) + Pth("M 1100,-740 C 1040,-700 1030,-500 1050,-380 L 1150,-380 C 1170,-500 1160,-700 1100,-740 Z", "#C9493B");
    s += R(-1700, WALL_Y - 34, 3400, 34, n ? "#2E3440" : "#B6BEC6");
    // พรมออฟฟิศ
    s += R(-1700, WALL_Y, 3400, 1700, "url(#oCarpet)");
    for (let y = WALL_Y + 40; y < 1600; y += 70) s += L(-1700, y, 1700, y, "#55606C", 2, 'opacity=".35"');
    for (let x = -1700; x < 1700; x += 140) s += L(x, WALL_Y, x * 1.6, 1600, "#55606C", 2, 'opacity=".25"');
    // พนักเก้าอี้สำนักงาน (หลังตัวละคร)
    for (const cx of (o.chairs || [-560, 240])) s += RR(cx - 110, -560, 220, 280, 50, "#2B2F3A") + RR(cx - 90, -540, 180, 240, 40, "#3A4050") + R(cx - 12, -280, 24, 120, "#2B2F3A");
    return s;
  }
  function oLamps(t, o) { return ""; }
  function oIsland(t, o) {
    const n = !!o.late;
    let s = "";
    // โต๊ะทำงาน 2 ตัว (มุมหน้า) — ตัวละครนั่งหลังโต๊ะ (layer back + sink)
    for (const [dx, seed] of [[-560, 0], [240, 1]]) {
      const top = -250, w = 680;
      s += E(dx, 30, w * 0.55, 30, "#1A1E24", 'opacity=".3"');
      s += R(dx - w / 2, top, w, 22, "#E8E2D6") + R(dx - w / 2, top + 22, w, 8, "#C9C2B4");
      s += RR(dx - w / 2 + 10, top + 30, w - 20, 270, 4, "#D6D0C3") + R(dx - w / 2 + 10, top + 30, w - 20, 270, "#000", 'opacity=".06"');
      s += RR(dx + w / 2 - 190, top + 50, 160, 230, 6, "#C9C2B4") + RR(dx + w / 2 - 130, top + 90, 40, 10, 5, "#8C8577") + RR(dx + w / 2 - 130, top + 190, 40, 10, 5, "#8C8577");
      // จอ 2 จอ (เว้นกลางให้เห็นหน้า)
      s += monitor(dx - 220, top - 70, 190, t, n, seed ? 1 : 0) + monitor(dx + 230, top - 70, 170, t, n, 2);
      s += RR(dx - 110, top - 18, 220, 20, 6, "#3A4050") + RR(dx + 130, top - 16, 46, 26, 12, "#3A4050");
      // แก้วกาแฟ (ไอ) + โพสต์อิท + กองเอกสาร + โคมโต๊ะ
      const mx = dx - w / 2 + 70;
      s += RR(mx - 26, top - 70, 52, 66, 10, seed ? "#E4572E" : "#2F5E6B") + Pth(`M ${mx + 26},${top - 56} q 22,6 0,30`, "none", ST(seed ? "#E4572E" : "#2F5E6B", 6));
      for (let i = 0; i < 3; i++) { const ph = t * 1.2 + i * 1.7; s += Pth(`M ${mx - 12 + i * 12},${top - 78} c -10,-20 10,-30 0,${f(-50 - 10 * Math.sin(ph))}`, "none", `stroke="#fff" stroke-width="5" opacity="${f(0.35 + 0.2 * Math.sin(ph))}"`); }
      s += R(dx - w / 2 + 120, top - 40, 120, 38, "#FFFFFF") + R(dx - w / 2 + 126, top - 50, 120, 10, "#F3F0EA") + R(dx - w / 2 + 116, top - 58, 120, 8, "#E8E2D6");
      s += `<g transform="rotate(-6 ${dx + w / 2 - 60} ${top - 150})">` + R(dx + w / 2 - 90, top - 180, 50, 50, "#FFE27A") + `</g>`;
      if (n) s += E(dx + w / 2 - 50, top - 60, 200, 140, "url(#oLampG)");
      s += L(dx + w / 2 - 40, top, dx + w / 2 - 40, top - 140, "#3A4050", 6) + L(dx + w / 2 - 40, top - 140, dx + w / 2 - 100, top - 180, "#3A4050", 6) + Pth(`M ${dx + w / 2 - 140},${top - 200} l 80,-10 l 10,40 l -70,20 Z`, n ? "#F2C14E" : "#5E6B78");
      // ต้นไม้เล็ก
      s += KIT.plant(dx + 60, top + 2, 0.18, t, "#FFFFFF");
    }
    // ของบนพื้น: ถังขยะ กล่องพัสดุ สายไฟ เก้าอี้ล้อเลื่อนว่าง
    s += Pth("M 900,40 L 1000,40 L 985,180 L 915,180 Z", "#5E6B78") + E(950, 40, 50, 10, "#3A4050") + Pth("M 930,30 q 10,-30 30,-10", "none", ST("#FFFFFF", 6));
    s += RR(-1280, 60, 220, 150, 8, "#C9A27A") + R(-1280, 110, 220, 16, "#E6CFA6") + RR(-1240, 20, 150, 50, 6, "#D9B98C") + R(-1240, 40, 150, 10, "#E6CFA6");
    s += Pth("M -200,-20 C -150,60 -40,40 10,120 S 200,160 260,220", "none", ST("#2B2F3A", 5, 0.6));
    const ch = (cx, cy) => RR(cx - 100, cy - 300, 200, 240, 50, "#2B2F3A") + RR(cx - 110, cy - 90, 220, 50, 20, "#3A4050") + R(cx - 10, cy - 40, 20, 80, "#2B2F3A") + Pth(`M ${cx - 110},${cy + 60} L ${cx + 110},${cy + 60}`, "none", ST("#2B2F3A", 12)) + C(cx - 110, cy + 70, 14, "#1E2228") + C(cx + 110, cy + 70, 14, "#1E2228") + C(cx, cy + 74, 14, "#1E2228");
    s += ch(1250, 260);
    return s;
  }
  function oFore(t, o) {
    // ขอบพาร์ทิชันหน้าสุด + ต้นไม้ใหญ่ (เบลอ)
    let s = RR(-1600, 200, 520, 900, 16, "#8E9AA6") + R(-1600, 200, 520, 30, "#6E7A86");
    for (let k = 0; k < 10; k++) { const a = -60 + k * 13 + Math.sin(t + k) * 3; s += `<ellipse cx="0" cy="-150" rx="50" ry="160" fill="${k % 2 ? "#3E6E45" : "#558B57"}" transform="translate(1350,500) rotate(${f(a)})"/>`; }
    return s;
  }
  function oSun(t, o) {
    if (o.late) return R(-1700, -2400, 3400, 4000, "#0A1030", 'opacity=".22"');
    let s = `<g style="mix-blend-mode:screen">`;
    for (let i = 0; i < 3; i++) s += Pth(`M ${-1500 + i * 260},-1720 L ${-1360 + i * 260},-1720 L ${-200 + i * 300},0 L ${-500 + i * 300},0 Z`, "url(#hBeam)", `opacity="${f(0.55 + 0.1 * Math.sin(t + i))}" filter="url(#fBlur20)"`);
    return s + `</g>`;
  }

  // ======================= ตลาดสด =======================
  function shophouse(x, w, h, c, sign, signC, t) {
    let s = R(x, -h, w, h + WALL_Y, c) + R(x, -h, w, 30, sh(c, -0.15));
    for (let fl = 0; fl < 2; fl++) { const y = -h + 90 + fl * 300; for (let i = 0; i < 3; i++) { const wx = x + 40 + i * (w - 80) / 3; s += R(wx, y, (w - 80) / 3 - 30, 170, "#CFE3E6") + R(wx, y, (w - 80) / 3 - 30, 170, "none", ST(sh(c, -0.3), 6)) + L(wx + ((w - 80) / 3 - 30) / 2, y, wx + ((w - 80) / 3 - 30) / 2, y + 170, sh(c, -0.3), 4); } s += R(x + 20, y + 185, w - 40, 14, sh(c, -0.2)); }
    s += RR(x + 30, -h + 690, w - 60, 110, 10, signC) + T(x + w / 2, -h + 765, sign, 60, "#FFFFFF");
    // ประตูเหล็กม้วน
    s += R(x + 30, -h + 820, w - 60, h - 820 + WALL_Y, "#9AA0A6");
    for (let y = -h + 830; y < WALL_Y; y += 22) s += L(x + 30, y, x + w - 30, y, "#7E848A", 3);
    // แอร์ + ต้นไม้ระเบียง
    s += RR(x + w - 150, -h + 470, 110, 70, 8, "#E9ECEF") + L(x + w - 130, -h + 490, x + w - 60, -h + 490, "#B6BEC6", 3);
    return s;
  }
  function crowd(t) {
    let s = `<g opacity=".92">`;
    const r = RK.rng(5), shirts = ["#6C8FA6", "#C96F4A", "#86A85E", "#E3B062", "#8E6FA8", "#F2F4F6", "#2F5E6B", "#D98E6A"], pants = ["#3B3F5C", "#5A4A42", "#2F3A4A", "#6B5A4A"], skins = ["#E8B690", "#D7A079", "#C48A5E", "#F1C6A2"], hair = ["#1C1414", "#2A201C", "#4A403A", "#E8E4DE"];
    for (let i = 0; i < 18; i++) {
      const dir = r() < 0.5 ? 1 : -1, sp = 14 + r() * 14, x = ((-1800 + i * 200 + r() * 90 + dir * t * sp) % 3600 + 3600) % 3600 - 1800, y = -340 + r() * 50, k = 0.62 + r() * 0.18;
      const sc = shirts[i % 8], pc = pants[i % 4], skc = skins[i % 4], hc = hair[i % 4], ph = t * 5 + i, sw = Math.sin(ph) * 10, bob = Math.abs(Math.sin(ph)) * 4;
      let g = `<g transform="translate(${f(x)},${f(y - bob)}) scale(${f(k * dir)},${f(k)})">`;
      g += E(0, 4 + bob, 70, 12, "#000", 'opacity=".15"');
      g += Pth(`M -18,-300 L ${f(-30 + sw)},0 L ${f(-6 + sw)},0 L 0,-250 L ${f(6 - sw)},0 L ${f(30 - sw)},0 L 18,-300 Z`, pc);
      g += RR(-46, -560, 92, 280, 30, sc) + Pth(`M -46,-520 L ${f(-60 - sw * 0.6)},-340 L ${f(-44 - sw * 0.6)},-336 L -30,-480 Z M 46,-520 L ${f(60 + sw * 0.6)},-340 L ${f(44 + sw * 0.6)},-336 L 30,-480 Z`, sh(sc, -0.08));
      g += C(f(-52 - sw * 0.6), -330, 12, skc) + C(f(52 + sw * 0.6), -330, 12, skc);
      g += R(-12, -600, 24, 44, skc) + C(0, -640, 42, skc) + Pth("M -42,-640 C -44,-700 44,-700 42,-640 C 30,-662 -30,-662 -42,-640 Z", hc);
      if (i % 4 === 0) g += Pth("M -70,-680 L 70,-680 L 40,-720 L -40,-720 Z", "#E8D6A8") + E(0, -680, 74, 12, "#D9C28A");
      if (i % 3 === 1) g += Pth(`M ${f(56 + sw * 0.6)},-330 l 10,0 l 6,70 l -40,0 l 6,-70 Z`, "#FFFFFF", 'opacity=".9"') + Pth(`M ${f(60 + sw * 0.6)},-300 q 10,30 -10,40`, "none", ST("#E4572E", 3));
      s += g + `</g>`;
    }
    return s + `</g>`;
  }
  function awning(x, w, y, c1, c2, t) {
    let s = "", n = Math.round(w / 70);
    for (let i = 0; i < n; i++) s += Pth(`M ${x + i * w / n},${y} L ${x + (i + 1) * w / n},${y} L ${x + (i + 1) * w / n},${y + 90} Q ${x + (i + 0.5) * w / n},${y + 120} ${x + i * w / n},${y + 90} Z`, i % 2 ? c1 : c2);
    return s + R(x, y - 10, w, 14, sh(c1, -0.2));
  }
  function produce(x, y, kind, n, seed) {
    const r = RK.rng(seed); let s = "";
    for (let i = 0; i < n; i++) {
      const px = x + (r() - 0.5) * 200, py = y - Math.abs(r() - 0.5) * 70 - (i / n) * 50;
      if (kind === "orange") s += C(px, py, 22, "#F2A33A") + C(px - 6, py - 7, 6, "#FFD08A");
      else if (kind === "tomato") s += C(px, py, 18, "#E4572E") + Pth(`M ${f(px - 6)},${f(py - 16)} l 6,4 l 6,-4`, "none", ST("#4F8A3B", 3));
      else if (kind === "cabbage") s += C(px, py, 30, "#9CCB7A") + Pth(`M ${f(px - 20)},${f(py)} q 20,-24 40,0`, "none", ST("#6FAA5E", 3));
      else if (kind === "chili") s += Pth(`M ${f(px)},${f(py)} q 18,-6 30,10`, "none", ST(i % 3 ? "#D7263D" : "#4F8A3B", 9));
      else if (kind === "egg") s += E(px, py, 15, 19, "#F3E3C6", 'stroke="#D9C5A0" stroke-width="2"');
      else if (kind === "lime") s += C(px, py, 15, "#86B84A");
    }
    return s;
  }
  function stall(x, y, w, t, goods, cloth) {
    let s = R(x - w / 2, y, w, 26, "#8C5E3C") + R(x - w / 2 + 20, y + 26, 22, 274, "#6B4A33") + R(x + w / 2 - 42, y + 26, 22, 274, "#6B4A33") + E(x, y + 300, w * 0.55, 22, "#1E1410", 'opacity=".25"');
    s += Pth(`M ${x - w / 2 - 10},${y + 20} L ${x + w / 2 + 10},${y + 20} L ${x + w / 2 + 10},${y + 160} L ${x - w / 2 - 10},${y + 160} Z`, cloth) + R(x - w / 2 - 10, y + 140, w + 20, 20, sh(cloth, -0.2));
    const slots = goods.length;
    goods.forEach((g, i) => {
      const gx = x - w / 2 + (i + 0.5) * w / slots;
      s += E(gx, y + 4, w / slots * 0.42, 18, "#C9A27A") + produce(gx, y - 6, g, 14, Math.round(gx));
      s += RR(gx - 46, y - 110 - (i % 2) * 20, 92, 56, 6, "#F7E8C8", 'stroke="#B08A62" stroke-width="3"') + T(gx, y - 70 - (i % 2) * 20, `฿${[20, 35, 15, 50, 40][(i + Math.round(x)) % 5]}`, 34, "#C9493B");
    });
    return s;
  }
  function mWall(t, o) {
    let s = R(-1800, -2600, 3600, 2600 + WALL_Y, "url(#mSky)");
    s += E(900 + t * 3, -2100, 140, 40, "#FFFFFF", 'opacity=".9"') + E(-700 + t * 5, -2250, 110, 30, "#FFFFFF", 'opacity=".85"');
    // ตึกแถว 4 ห้อง
    const H = [["ร้านทอง", "#C9493B"], ["ร้านยา", "#2F8F4F"], ["ขายส่ง", "#2F5E6B"], ["ก๋วยเตี๋ยว", "#E3A548"]];
    H.forEach(([name, c], i) => { s += shophouse(-1700 + i * 860, 860, 1900, ["#E8D6B8", "#D9C4C0", "#E6E0C8", "#D2D9C9"][i], name, c, t); });
    // สายไฟ + เสาไฟ
    s += R(1240, -2300, 30, 2300 + WALL_Y, "#8A8F94") + R(1180, -2200, 150, 16, "#8A8F94");
    for (let k = 0; k < 4; k++) s += Pth(`M -1800,${-2150 + k * 26} Q -300,${-1960 + k * 30} 1240,${-2180 + k * 20}`, "none", ST("#3A3A3A", 3)) + Pth(`M 1270,${-2180 + k * 20} Q 1500,${-2120 + k * 20} 1800,${-2160 + k * 26}`, "none", ST("#3A3A3A", 3));
    // ผ้าใบกันแดดกว้าง (ตลาด)
    s += crowd(t);
    for (const [ax, aw, c1, c2] of [[-1700, 900, "#C9493B", "#F7E8C8"], [-760, 900, "#2F6FB0", "#F7F3EC"], [180, 900, "#E3A548", "#FFF6E0"], [1120, 700, "#2F8F4F", "#F7F3EC"]]) s += awning(ax, aw, -980, c1, c2, t);
    // หลอดไฟห้อย
    for (let i = 0; i < 10; i++) { const x = -1500 + i * 320, y = -820 + Math.sin(t + i) * 3; s += L(x, -900, x, y, "#3A2A26", 3) + E(x, y + 16, 30, 30, "#FFE3A3", 'opacity=".35" filter="url(#fBlur8)"') + E(x, y + 14, 12, 16, "#FFF2C4"); }
    // แผงหลัง (แผงเพื่อนบ้าน)
    s += stall(-1100, -300, 640, t, ["cabbage", "tomato", "chili"], "#6C8FA6") + stall(1000, -300, 640, t, ["orange", "lime", "egg"], "#8E6FA8");
    // พื้นคอนกรีต + คราบน้ำ
    s += R(-1800, WALL_Y, 3600, 1800, "url(#mGround)");
    for (let y = WALL_Y + 60; y < 1600; y += 120) s += L(-1800, y, 1800, y, "#8C8378", 3, 'opacity=".4"');
    s += E(-300, 380, 260, 30, "#C9D5DA", 'opacity=".4"') + E(700, 620, 200, 24, "#C9D5DA", 'opacity=".35"');
    // ลังพลาสติก + ตะกร้าข้างแผง
    for (const [cx, cy, c] of [[-1500, -60, "#2F6FB0"], [-1420, -150, "#E4572E"], [1450, -60, "#F2C14E"]]) s += RR(cx - 70, cy - 90, 140, 90, 8, c) + L(cx - 60, cy - 60, cx + 60, cy - 60, sh(c, -0.25), 4) + L(cx - 60, cy - 30, cx + 60, cy - 30, sh(c, -0.25), 4);
    return s;
  }
  // แผงหลักของลุงเปี๊ยก (ชั้นกลาง: คนขายยืน/นั่งหลังแผงใช้ layer back)
  function mIsland(t, o) {
    const x = o.stallX ?? 0, y = -210, w = 1100;
    let s = E(x, 40, w * 0.55, 30, "#1E1410", 'opacity=".3"');
    // แผงข้างซ้าย (ปลา) + ขวา (ผลไม้)
    s += stall(x - 1250, y + 40, 700, t, ["lime", "chili", "egg"], "#C9493B") + stall(x + 1250, y + 40, 700, t, ["orange", "tomato", "cabbage"], "#E3A548");
    // ร่มใหญ่ด้านบน
    s += L(x, y, x, -1000, "#5A4A42", 12);
    s += Pth(`M ${x - 720},-940 Q ${x},-1180 ${x + 720},-940 Z`, "#C9493B") + Pth(`M ${x - 720},-940 Q ${x - 360},-900 ${x - 240},-985 Q ${x - 120},-900 ${x},-1010 Q ${x + 120},-900 ${x + 240},-985 Q ${x + 360},-900 ${x + 720},-940`, "#F7E8C8") + C(x, -1095, 14, "#5A4A42");
    s += R(x - w / 2, y, w, 30, "#8C5E3C");
    // ผ้าหน้าแผง + ป้ายร้าน
    s += Pth(`M ${x - w / 2 - 14},${y + 24} L ${x + w / 2 + 14},${y + 24} L ${x + w / 2 + 14},${y + 250} L ${x - w / 2 - 14},${y + 250} Z`, "#2F8F4F");
    for (let k = 0; k < 12; k++) s += R(x - w / 2 + k * w / 12, y + 24, w / 24, 226, "#3FA35F", 'opacity=".5"');
    s += RR(x - 260, y + 70, 520, 120, 16, "#F7E8C8", 'stroke="#8C5E3C" stroke-width="6"') + T(x, y + 152, "ผักสดลุงเปี๊ยก", 64, "#2F8F4F");
    // สินค้าบนแผง: ผัก ผลไม้ ปลาบนน้ำแข็ง ตาชั่ง
    s += E(x - 400, y + 4, 120, 20, "#C9A27A") + produce(x - 400, y - 4, "cabbage", 10, 3);
    s += E(x - 160, y + 4, 110, 20, "#C9A27A") + produce(x - 160, y - 4, "tomato", 16, 4);
    s += RR(x + 30, y - 40, 260, 50, 10, "url(#mIce)") + [0, 1, 2].map((i) => `<g transform="translate(${x + 90 + i * 70},${y - 46}) rotate(${-10 + i * 10})">` + Pth("M -40,0 C -24,-18 20,-18 34,0 C 20,16 -24,16 -40,0 Z", "#8FA6B8") + Pth("M 34,0 L 52,-14 L 50,14 Z", "#7A93A6") + C(-28, -3, 4, "#2B2F3A") + `</g>`).join("");
    s += RR(x + 360, y - 120, 140, 120, 14, "#E4572E") + C(x + 430, y - 80, 36, "#FFFDF6") + L(x + 430, y - 80, x + 430 + Math.sin(t * 2) * 20, y - 100, "#2B2F3A", 4) + R(x + 340, y - 140, 180, 20, "#BFC4C8");
    s += RR(x - 520, y - 150, 96, 60, 6, "#F7E8C8", 'stroke="#B08A62" stroke-width="3"') + T(x - 472, y - 106, "฿25", 34, "#C9493B") + RR(x - 210, y - 130, 96, 60, 6, "#F7E8C8", 'stroke="#B08A62" stroke-width="3"') + T(x - 162, y - 86, "฿30", 34, "#C9493B");
    // พวงกล้วยห้อย
    s += L(x - 320, -940, x - 320, -720, "#5A4A42", 4) + [0, 1, 2, 3, 4].map((i) => Pth(`M ${x - 340 + i * 10},-720 q -30,60 ${-10 + i * 8},110`, "none", ST(i % 2 ? "#F2C94C" : "#E8B93A", 18))).join("");
    return s;
  }
  function mFore(t, o) {
    let s = "";
    for (const [cx, c] of [[-1350, "#2F6FB0"], [1350, "#E4572E"]]) s += RR(cx - 150, 260, 300, 200, 12, c) + produce(cx, 260, cx < 0 ? "orange" : "chili", 18, 9);
    s += E(1250, -1450, 240, 60, "#C9493B");
    return s;
  }
  function mSun(t, o) {
    let s = `<g style="mix-blend-mode:screen">`;
    for (let i = 0; i < 3; i++) s += Pth(`M ${600 + i * 220},-2400 L ${720 + i * 220},-2400 L ${-500 + i * 260},0 L ${-800 + i * 260},0 Z`, "url(#hBeam)", `opacity="${f(0.5 + 0.12 * Math.sin(t + i))}" filter="url(#fBlur20)"`);
    s += `</g>` + R(-1800, -900, 3600, 900, "url(#mShade)");
    return s;
  }

  const wrap = (fn, back, ground) => (t, o) => (back ? R(-4000, -5000, 8000, 5000 + WALL_Y * K, back(o || {})) + R(-4000, WALL_Y * K, 8000, 4000, ground) : "") + `<g transform="scale(${K})">${fn(t, o || {})}</g>`;
  RK.flatSets.office = { wall: wrap(oWall, (o) => (o.late ? "#3A4252" : "#F2F4F6"), "#5B6572"), lamps: wrap(oLamps), island: wrap(oIsland), foreground: wrap(oFore), sunlight: wrap(oSun), WALL_Y: WALL_Y * K };
  RK.flatSets.market = { wall: wrap(mWall, () => "#8CC4EA", "#7E766B"), lamps: () => "", island: wrap(mIsland), foreground: wrap(mFore), sunlight: wrap(mSun), WALL_Y: WALL_Y * K };
})(window);
