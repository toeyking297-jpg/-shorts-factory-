// flat_story2.js — ของสำหรับ EP002 "เต้ไปตลาด"
// ถุงผ้าเหลือง (ถือในมือ: prop:"bag", bagFill 0..1.4, bagItems 0..10 · หรือวางในฉาก props type:"bag")
// แมวส้มฉุน (props type:"cat", walk, sit, lime) · หม้อต้มยำ (props type:"pot", lid 0..1) · ของบนแผง 3 แบบ
// UI: count (ตัวนับ 3/10 เด้ง), mission (ป้ายภารกิจลอย), notes (โน้ตเพลงลอยรอบหัว)
(function (G) {
  const RK = G.RK, f = RK.f, sh = RK.shade;
  const R = (x, y, w, h, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${c}" ${ex}/>`;
  const RR = (x, y, w, h, r, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" fill="${c}" ${ex}/>`;
  const C = (x, y, r, c, ex = "") => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" ${ex}/>`;
  const E = (x, y, rx, ry, c, ex = "") => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${c}" ${ex}/>`;
  const Pth = (d, c, ex = "") => `<path d="${d}" fill="${c}" ${ex}/>`;
  const L = (x1, y1, x2, y2, c, w, ex = "") => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${ex}/>`;
  const ST = (c, w, op = 1) => `stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"`;
  const TX = (x, y, txt, size, c, ex = "") => `<text x="${f(x)}" y="${f(y)}" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="${size}" fill="${c}" ${ex}>${RK.esc(txt)}</text>`;
  const W = 1080, H = 1920;
  const YEL = "#FFD21F", YELD = "#C99A00";

  // ---------- ของที่โผล่ปากถุง (เรียงตามลำดับที่ได้มา) ----------
  const ITEM = [
    (x, y) => [0, 1, 2].map((i) => L(x - 10 + i * 9, y, x - 22 + i * 14, y - 120 - i * 8, i % 2 ? "#B9D27A" : "#A3C25E", 9) + L(x - 22 + i * 14, y - 120 - i * 8, x - 26 + i * 14, y - 150 - i * 8, "#6E9A3A", 5)).join(""), // ตะไคร้
    (x, y) => E(x, y - 22, 26, 20, "#E8C99A", `stroke="#B8935E" stroke-width="3"`) + E(x + 18, y - 38, 14, 12, "#F0D6AE", `stroke="#B8935E" stroke-width="3"`), // ข่า
    (x, y) => [-30, 0, 30].map((a) => `<ellipse cx="${f(x)}" cy="${f(y - 40)}" rx="12" ry="30" fill="#2E7D3A" stroke="#1E5A28" stroke-width="2" transform="rotate(${a} ${f(x)} ${f(y - 10)})"/>`).join(""), // ใบมะกรูด
    (x, y) => Pth(`M ${f(x - 20)},${f(y)} C ${f(x - 30)},${f(y - 50)} ${f(x + 20)},${f(y - 70)} ${f(x + 30)},${f(y - 40)} L ${f(x + 46)},${f(y - 60)} L ${f(x + 42)},${f(y - 30)}`, "#F07A4F", `stroke="#B8452A" stroke-width="3"`) + C(x + 12, y - 54, 3, "#222"), // กุ้ง
    (x, y) => R(x - 7, y - 30, 14, 30, "#F2E6D2") + Pth(`M ${f(x - 30)},${f(y - 26)} Q ${f(x)},${f(y - 66)} ${f(x + 30)},${f(y - 26)} Z`, "#C9A27A", `stroke="#8C6A48" stroke-width="3"`), // เห็ด
    (x, y) => [0, 1, 2].map((i) => Pth(`M ${f(x - 10 + i * 10)},${f(y)} q ${f(-6 + i * 6)},-40 ${f(10 + i * 4)},-60`, "none", ST(i % 2 ? "#3E8F3E" : "#D7263D", 9))).join(""), // พริก
    (x, y) => RR(x - 16, y - 110, 32, 110, 8, "#8A4B1E", `opacity=".9"`) + R(x - 9, y - 140, 18, 32, "#8A4B1E") + R(x - 11, y - 152, 22, 14, "#C9493B") + R(x - 14, y - 80, 28, 34, "#F7E8C8"), // น้ำปลา
    (x, y) => R(x - 10, y - 30, 20, 30, "#F7F3EC") + Pth(`M ${f(x - 30)},${f(y - 20)} Q ${f(x)},${f(y - 60)} ${f(x + 30)},${f(y - 20)} Z`, "#E8DCC8", `stroke="#B8A88E" stroke-width="3"`), // เห็ดฟาง 2
    (x, y) => [0, 1, 2, 3].map((i) => L(x - 6 + i * 4, y, x - 30 + i * 18, y - 70, "#4F8A3B", 4) + C(x - 30 + i * 18, y - 74, 12, "#5FA64A")).join(""), // ผักชี
    (x, y) => RR(x - 22, y - 70, 44, 70, 6, "#FFFFFF", `stroke="#9AA6B0" stroke-width="3"`) + TX(x, y - 26, "เกลือ", 16, "#2F5E6B"), // เกลือ
  ];
  // ถุงผ้า: จุดยึดหูถุงอยู่ที่ (0,0) ตัวถุงห้อยลงด้านล่าง
  function bagShape(fill, items, tt, rip) {
    const k = RK.clamp(fill, 0, 1.6), w = 70 + k * 150, h = 90 + k * 190, top = 70, bul = 10 + k * 40;
    let s = "";
    // หูถุง 2 เส้น
    s += Pth(`M ${f(-w * 0.35)},${f(top + 6)} C ${f(-w * 0.35)},-10 -6,-14 0,0 C 6,-14 ${f(w * 0.35)},-10 ${f(w * 0.35)},${f(top + 6)}`, "none", ST(YELD, 10));
    // ของโผล่ปากถุง (อยู่หลังตัวถุง)
    const n = Math.min(10, Math.round(items || 0));
    for (let i = 0; i < n; i++) { const xx = -w * 0.38 + (w * 0.76) * ((i * 0.37) % 1), wob = Math.sin(tt * 3 + i) * 2; s += `<g transform="rotate(${f((i % 3 - 1) * 10 + wob)} ${f(xx)} ${f(top + 10)})">${ITEM[i](xx, top + 16 - Math.min(30, k * 20))}</g>`; }
    // ตัวถุง พองตามปริมาณ
    s += Pth(`M ${f(-w / 2)},${f(top)} C ${f(-w / 2 - bul)},${f(top + h * 0.35)} ${f(-w / 2 - bul * 0.7)},${f(top + h)} ${f(-w * 0.35)},${f(top + h + 8)} L ${f(w * 0.35)},${f(top + h + 8)} C ${f(w / 2 + bul * 0.7)},${f(top + h)} ${f(w / 2 + bul)},${f(top + h * 0.35)} ${f(w / 2)},${f(top)} Z`, YEL, `stroke="${YELD}" stroke-width="4"`);
    s += Pth(`M ${f(-w / 2 + 10)},${f(top + 14)} L ${f(w / 2 - 10)},${f(top + 14)}`, "none", `stroke="${YELD}" stroke-width="2.5" stroke-dasharray="8 6"`);
    s += Pth(`M ${f(-w * 0.3)},${f(top + 30)} C ${f(-w * 0.4)},${f(top + h * 0.5)} ${f(-w * 0.36)},${f(top + h * 0.8)} ${f(-w * 0.26)},${f(top + h)}`, "none", ST("#FFF3A6", 8, 0.7));
    // โลโก้หน้าถุง: วงกลม + มะนาว (ไอรอนิก)
    // ลายสกรีนหน้าถุง: ตะกร้าผักเล็กๆ + คำว่า "ตลาด" (ไม่ให้ดูเหมือนหน้าคน)
    const lx = -w * 0.18, ly = top + h * 0.62, z = 0.6 + k * 0.5;
    s += `<g transform="translate(${f(lx)},${f(ly)}) scale(${f(z)})" opacity=".85">` + Pth("M -26,-4 L 26,-4 L 18,20 L -18,20 Z", "#8A5A00") + Pth("M -18,-4 Q 0,-30 18,-4", "none", ST("#8A5A00", 4)) + C(-8, -10, 7, "#3E8F3E") + C(8, -12, 7, "#D7263D") + `</g>`;
    s += TX(w * 0.12, top + h * 0.66, "ตลาด", f(16 + k * 12), "#8A5A00", 'opacity=".85"');
    // ปูดตามของข้างใน
    if (k > 0.5) for (let i = 0; i < 3; i++) s += E(-w * 0.25 + i * w * 0.25, top + h * (0.3 + 0.2 * (i % 2)), 18 + k * 10, 14 + k * 8, sh(YEL, -0.06), 'opacity=".7"');
    if (rip) { // ตะเข็บปริ
      const rx = w * 0.42, ry = top + h * 0.45;
      s += Pth(`M ${f(rx - 10)},${f(ry - 30)} l 14,12 l -12,10 l 14,12 l -10,10`, "none", ST("#6B4A00", 4)) + [0, 1, 2].map((i) => L(rx + 8, ry - 10 + i * 12, rx + 24 + i * 4, ry - 16 + i * 14, "#FFFFFF", 3, `opacity="${f(rip)}"`)).join("");
    }
    return s;
  }
  RK.flatBag = bagShape;
  RK.FLAT_GRIP = RK.FLAT_GRIP || {};
  RK.FLAT_GRIP.bag = (hc, ha, C, far, view) => {
    const A = RK._curA || {}, sw = Math.sin((RK._curT || 0) * 6 + (A.seed || 0)) * (A._walking > 0 ? 6 : 1.5);
    if (A.bagHug) { // ถุงใหญ่เกินถือ: กอดไว้หน้าอก (เดินโซเซ)
      if (far) return "";
      const wob = Math.sin((RK._curT || 0) * 7) * 5;
      return `<g transform="translate(${view === "front" ? 0 : 30},${-600}) rotate(${f(wob)})">${bagShape(A.bagFill ?? 1.2, A.bagItems ?? 10, RK._curT || 0, A.bagRip || 0)}</g>`;
    }
    return `<g transform="translate(${f(hc[0])},${f(hc[1] - 8)}) rotate(${f(sw)})">${bagShape(A.bagFill ?? 0.1, A.bagItems ?? 0, RK._curT || 0, A.bagRip || 0)}</g>`;
  };

  // ---------- ของบนแผง 3 แบบ (พิกัดชุดฉากก่อนย่อ) ----------
  RK.flatStallGoods = function (kind, x, y, t) {
    let s = "";
    const basket = (bx, w) => E(bx, y + 4, w, 22, "#C9A27A") + Pth(`M ${f(bx - w)},${f(y + 4)} L ${f(bx - w * 0.85)},${f(y + 40)} L ${f(bx + w * 0.85)},${f(y + 40)} L ${f(bx + w)},${f(y + 4)}`, "#B88A5E");
    const tag = (tx, ty, p) => RR(tx - 48, ty - 40, 96, 60, 6, "#F7E8C8", 'stroke="#B08A62" stroke-width="3"') + TX(tx, ty + 4, p, 34, "#C9493B");
    if (kind === "veg") {
      s += basket(x - 400, 120); for (let i = 0; i < 9; i++) s += L(x - 470 + i * 18, y - 4, x - 480 + i * 20, y - 150 - (i % 3) * 14, i % 2 ? "#B9D27A" : "#A3C25E", 12); // ตะไคร้มัด
      s += R(x - 480, y - 60, 170, 14, "#C9493B");
      s += basket(x - 140, 110); for (let i = 0; i < 9; i++) s += E(x - 200 + (i % 3) * 56, y - 14 - Math.floor(i / 3) * 26, 26, 18, "#E8C99A", `stroke="#B8935E" stroke-width="3"`); // ข่า
      s += basket(x + 120, 110); for (let i = 0; i < 14; i++) s += `<ellipse cx="${f(x + 60 + (i % 5) * 30)}" cy="${f(y - 20 - Math.floor(i / 5) * 24)}" rx="12" ry="26" fill="#2E7D3A" stroke="#1E5A28" stroke-width="2" transform="rotate(${(i % 3 - 1) * 30} ${f(x + 60 + (i % 5) * 30)} ${f(y - 20 - Math.floor(i / 5) * 24)})"/>`; // ใบมะกรูด
      s += basket(x + 380, 120); for (let i = 0; i < 6; i++) s += C(x + 320 + (i % 3) * 56, y - 24 - Math.floor(i / 3) * 40, 30, "#9CCB7A") + Pth(`M ${f(x + 300 + (i % 3) * 56)},${f(y - 24 - Math.floor(i / 3) * 40)} q 20,-24 40,0`, "none", ST("#6FAA5E", 3)); // ผักกาด
      s += tag(x - 400, y - 190, "฿10") + tag(x - 140, y - 110, "฿15") + tag(x + 380, y - 130, "฿20");
    } else if (kind === "meat") {
      s += RR(x - 520, y - 46, 520, 56, 12, "url(#mIce)");
      for (let i = 0; i < 9; i++) { const sx = x - 470 + i * 52, sy = y - 44 - (i % 2) * 14; s += `<g transform="translate(${f(sx)},${f(sy)}) rotate(${(i % 3 - 1) * 15})">` + Pth("M -18,10 C -26,-26 18,-40 26,-14 L 40,-28 L 38,0", "#F07A4F", `stroke="#B8452A" stroke-width="3"`) + C(10, -24, 3, "#222") + `</g>`; } // กุ้ง
      s += basket(x + 160, 120); for (let i = 0; i < 8; i++) { const mx = x + 90 + (i % 4) * 46, my = y - 12 - Math.floor(i / 4) * 36; s += R(mx - 7, my - 26, 14, 26, "#F2E6D2") + Pth(`M ${f(mx - 26)},${f(my - 22)} Q ${f(mx)},${f(my - 58)} ${f(mx + 26)},${f(my - 22)} Z`, "#C9A27A", `stroke="#8C6A48" stroke-width="3"`); } // เห็ด
      s += RR(x + 360, y - 120, 140, 120, 14, "#E4572E") + C(x + 430, y - 80, 36, "#FFFDF6") + L(x + 430, y - 80, x + 430 + Math.sin(t * 2) * 20, y - 100, "#2B2F3A", 4) + R(x + 340, y - 140, 180, 20, "#BFC4C8"); // ตาชั่ง
      s += tag(x - 260, y - 120, "฿120") + tag(x + 160, y - 130, "฿25");
    } else if (kind === "food") { // ร้านกับข้าวถุง: หม้อแกง + ถาด + กล่อง
      for (let i = 0; i < 4; i++) { const bx = x - 450 + i * 170, c = ["#E46F3A", "#C9A15A", "#5FA64A", "#B8452A"][i]; s += RR(bx - 70, y - 80, 140, 82, 14, "#9AA4AE", `stroke="#6E7882" stroke-width="3"`) + E(bx, y - 80, 70, 14, c) + E(bx - 20, y - 82, 12, 5, "#FFFFFF", 'opacity=".3"'); for (let k = 0; k < 2; k++) { const ph = (t * 0.4 + k / 2 + i * 0.3) % 1; s += Pth(`M ${f(bx - 10 + k * 16)},${f(y - 96 - ph * 90)} q 10,-14 0,-28 q -10,-14 0,-28`, "none", ST("#FFFFFF", 7, (1 - ph) * 0.45)); } }
      for (let i = 0; i < 3; i++) s += RR(x + 300 + (i % 2) * 6, y - 40 - i * 40, 130, 38, 6, "#F7F4EC", `stroke="#C9C0B0" stroke-width="2.5"`);
      s += tag(x - 450, y - 150, "฿40") + tag(x - 110, y - 150, "฿40") + tag(x + 230, y - 150, "฿50");
    } else if (kind === "spice") {
      for (let i = 0; i < 5; i++) { const bx = x - 460 + i * 150, c = ["#D7263D", "#E3A548", "#8C3B1E", "#F2C14E", "#3E8F3E"][i]; s += E(bx, y + 2, 64, 16, "#7A5A3E") + Pth(`M ${f(bx - 60)},${f(y)} Q ${f(bx)},${f(y - 90)} ${f(bx + 60)},${f(y)} Z`, c) + E(bx - 16, y - 40, 10, 6, "#FFFFFF", 'opacity=".25"'); } // กองพริกแกง/เครื่องเทศ
      for (let i = 0; i < 4; i++) { const bx = x + 300 + i * 50; s += RR(bx - 16, y - 110, 32, 110, 8, "#8A4B1E", 'opacity=".9"') + R(bx - 9, y - 140, 18, 32, "#8A4B1E") + R(bx - 11, y - 152, 22, 14, "#C9493B") + R(bx - 14, y - 80, 28, 34, "#F7E8C8"); } // น้ำปลา
      for (let i = 0; i < 6; i++) s += Pth(`M ${f(x - 520 + i * 40)},-760 q -10,70 ${f(4 + i * 3)},130`, "none", ST(i % 2 ? "#D7263D" : "#B81E30", 14)); // พริกแห้งแขวน
      s += tag(x - 310, y - 130, "฿10") + tag(x + 375, y - 190, "฿25");
    }
    return s;
  };

  // ---------- แมวส้มฉุน (มุมข้าง หันขวา dir 1) ----------
  function cat(p, t, TT) {
    const walk = p.walk ?? 0, sit = p.sit ?? 0, ph = (p.phase ?? TT) * 9, dir = p.dir ?? 1;
    const gray = p.col === "gray", O = gray ? "#9AA0A6" : "#F09A3E", OD = gray ? "#6E747A" : "#C66F1E", WH = gray ? "#E6E8EA" : "#FFF4E6";
    const thin = p.thin ? 0.82 : 1;
    let s = `<g transform="scale(${dir},1)">` + E(0, 4, 90, 10, "#000", 'opacity=".22"') + `<g transform="scale(1,${thin}) translate(0,0)">`;
    const leg = (x0, a) => { const sw = Math.sin(ph + a) * 22 * walk; return Pth(`M ${f(x0)},-40 L ${f(x0 + sw * 0.5)},-20 L ${f(x0 + sw)},0`, "none", ST(OD, 15)) + E(x0 + sw + 4, -2, 10, 6, WH); };
    const bob = Math.abs(Math.sin(ph)) * 4 * walk;
    // หาง
    s += Pth(`M -64,${f(-62 - bob + sit * 20)} C -110,${f(-80 + sit * 50)} -120,${f(-150 + sit * 120 + Math.sin(TT * 2) * 10)} -90,${f(-170 + sit * 150 + Math.sin(TT * 2) * 14)}`, "none", ST(O, 16));
    if (sit < 0.5) { s += leg(-40, 0) + leg(36, Math.PI); s += Pth(`M -70,${f(-50 - bob)} C -76,${f(-96 - bob)} 40,${f(-104 - bob)} 64,${f(-70 - bob)} C 70,${f(-46 - bob)} -60,${f(-30 - bob)} -70,${f(-50 - bob)} Z`, O); s += leg(-50, Math.PI) + leg(46, 0); }
    else { s += Pth("M -60,0 C -80,-60 -40,-118 10,-110 C 50,-104 60,-50 40,0 Z", O) + E(-10, -6, 46, 10, OD) + E(30, -4, 14, 8, WH) + E(4, -4, 14, 8, WH); }
    // ลายเสือ
    for (let i = 0; i < 3; i++) s += Pth(`M ${-30 + i * 22},${f((sit < 0.5 ? -94 : -100) - bob)} q 4,14 0,24`, "none", ST(OD, 6, 0.8));
    // หัว
    const hx = sit < 0.5 ? 72 : 38, hy = (sit < 0.5 ? -100 : -138) - bob;
    s += Pth(`M ${hx - 30},${hy - 22} L ${hx - 22},${hy - 54} L ${hx - 6},${hy - 30} Z M ${hx + 8},${hy - 30} L ${hx + 26},${hy - 54} L ${hx + 32},${hy - 20} Z`, O) + Pth(`M ${hx - 23},${hy - 30} L ${hx - 20},${hy - 46} L ${hx - 12},${hy - 32} Z`, "#F7B6A8");
    s += E(hx, hy, 40, 34, O) + E(hx + 10, hy + 14, 22, 15, WH);
    const bl = (TT % 3.1) < 0.12;
    s += bl ? L(hx - 10, hy - 4, hx, hy - 4, "#2B2230", 3) + L(hx + 16, hy - 4, hx + 26, hy - 4, "#2B2230", 3) : E(hx - 5, hy - 4, 6, 8, "#2B2230") + E(hx + 21, hy - 4, 6, 8, "#2B2230") + C(hx - 3, hy - 7, 2, "#FFF") + C(hx + 23, hy - 7, 2, "#FFF");
    s += Pth(`M ${hx + 6},${hy + 6} l 6,0 l -3,4 Z`, "#E46F82") + Pth(`M ${hx + 9},${hy + 10} q -5,6 -10,2 M ${hx + 9},${hy + 10} q 5,6 10,2`, "none", ST("#2B2230", 2));
    for (const sgn of [-1, 1]) s += L(hx + 24, hy + 8 + sgn * 4, hx + 54, hy + 4 + sgn * 10, "#FFFFFF", 2, 'opacity=".8"');
    if (p.lime) s += C(hx + 22, hy + 26, 15, "#86B84A", `stroke="#5E8A2E" stroke-width="2"`) + C(hx + 18, hy + 21, 4, "#C6E28A"); // คาบมะนาว
    if (p.fish) s += `<g transform="translate(${hx + 30},${hy + 22}) rotate(20)">` + Pth("M -26,0 C -16,-10 14,-10 22,-2 L 34,-12 L 32,2 L 36,14 L 22,4 C 14,10 -16,10 -26,0 Z", "#C9A15A", `stroke="#7E5A2A" stroke-width="2"`) + `</g>`; // คาบหางปลาทู
    if (p.lick) s += Pth(`M ${hx + 8},${hy + 14} q 4,10 10,4`, "#E46F82");
    return s + `</g></g>`;
  }
  // ---------- หม้อต้มยำบนเตา ----------
  function pot(p, t, TT) {
    const lid = p.lid ?? 0;
    let s = "";
    // ไฟเตา
    for (let i = 0; i < 7; i++) { const fx = -70 + i * 23, hh = 18 + Math.sin(TT * 14 + i * 2) * 6; s += Pth(`M ${fx - 7},0 Q ${fx},${-hh * 2} ${fx + 7},0 Z`, "#3E7BFF", 'opacity=".85"'); }
    s += RR(-130, -16, 260, 18, 6, "#2B2F36");
    s += Pth("M -110,-16 L -100,-150 L 100,-150 L 110,-16 Z", "#D2453A", `stroke="#A8342B" stroke-width="3"`) + R(-104, -110, 208, 12, "#B83A30") + RR(-140, -132, 34, 16, 6, "#2B2F36") + RR(106, -132, 34, 16, 6, "#2B2F36");
    s += E(0, -150, 100, 18, lid > 0.5 ? "#E8622C" : "#7C8792") + (lid > 0.5 ? E(-30, -152, 18, 6, "#F07A4F") + E(26, -148, 12, 5, "#3E8F3E") + E(4, -154, 10, 4, "#D7263D") : "");
    // ฝาหม้อ (ยกขึ้นตาม lid)
    const ly = -150 - lid * 120, lx = lid * 90, la = lid * 28;
    s += `<g transform="translate(${f(lx)},${f(ly)}) rotate(${f(la)})">` + Pth("M -108,0 Q 0,-30 108,0 Z", "#B83A30", `stroke="#8E2A22" stroke-width="3"`) + RR(-20, -40, 40, 14, 6, "#2B2F36") + `</g>`;
    // ไอน้ำ
    const n = lid > 0.5 ? 6 : 3;
    for (let i = 0; i < n; i++) { const ph = (TT * 0.5 + i / n) % 1; s += Pth(`M ${f(-50 + i * 22)},${f(-160 - ph * 160)} q 14,-20 0,-40 q -14,-20 0,-40`, "none", ST("#FFFFFF", 9, (1 - ph) * 0.6)); }
    return s;
  }
  function lime(p) { return C(0, -15, 15, "#86B84A", `stroke="#5E8A2E" stroke-width="2"`) + C(-4, -20, 4, "#C6E28A"); }
  function bagP(p, t, TT) { return bagShape(p.fill ?? 1, p.items ?? 10, TT, p.rip || 0); }
  const prev = RK.flatProps;
  const DRAW2 = { cat, pot, lime, bag: bagP };
  RK.flatProps = function (S, t, T, layer) {
    let s = prev ? prev(S, t, T, layer) : "";
    for (const p0 of S.props || []) {
      if ((p0.layer || "mid") !== layer || !DRAW2[p0.type]) continue;
      const p = {}; for (const k in p0) p[k] = Array.isArray(p0[k]) ? RK.kf(p0[k], t) : p0[k];
      s += `<g transform="translate(${f(p.x || 0)},${f(p.y || 0)}) scale(${f(p.s || 1)}) rotate(${f(p.rot || 0)})">${DRAW2[p.type](p, t, T)}</g>`;
    }
    return s;
  };

  // ---------- UI ----------
  const outline = (x, y, txt, size, fill, stroke, sw, ex = "") => `<text x="${f(x)}" y="${f(y)}" text-anchor="middle" font-family="Kanit" font-weight="800" font-size="${f(size)}" fill="${fill}" stroke="${stroke}" stroke-width="${f(sw)}" stroke-linejoin="round" paint-order="stroke" ${ex}>${RK.esc(txt)}</text>`;
  Object.assign(RK.flatUi, {
    count(u, t) { // {n:3, of:10, x, y}
      const a = t - u.t0, b = u.t1 - t; if (a < 0 || b < 0) return "";
      const k = RK.ease.back(RK.clamp(a / 0.25)), out = RK.clamp(b / 0.25), full = u.n >= u.of;
      let s = `<g transform="translate(${f(u.x ?? 860)},${f(u.y ?? 330)}) scale(${f(k * (1 + 0.15 * Math.max(0, 1 - a / 0.15)))}) rotate(${f(-6 + (full ? Math.sin(t * 12) * 4 : 0))})" opacity="${f(out)}">`;
      s += `<g transform="translate(-150,-60) scale(.42)">${RK.flatBag(0.6, Math.min(u.n, 10), t, 0)}</g>`;
      s += outline(30, 30, `${u.n}/${u.of}`, 110, full ? "#FFD84A" : "#FFFFFF", "#2B2230", 20);
      if (full) s += outline(30, 100, "ครบแล้ว!", 46, "#FFFFFF", "#2B2230", 10);
      return s + `</g>`;
    },
    mission(u, t) { // ป้ายภารกิจลอย ไม่มีกล่อง
      const a = t - u.t0, b = u.t1 - t; if (a < 0 || b < 0) return "";
      const k = RK.ease.back(RK.clamp(a / 0.35)), out = RK.clamp(b / 0.3), y = (u.y ?? 380) + Math.sin(t * 2) * 6;
      return `<g opacity="${f(out)}" transform="translate(${W / 2},${f(y)}) scale(${f(k)})">` + outline(0, -70, u.label || "ภารกิจ", 44, "#FFE7A0", "#2B2230", 10) + outline(0, 30, u.text, 92, "#FFFFFF", "#2B2230", 20) + `</g>`;
    },
    notes(u, t) { // โน้ตเพลงลอยรอบตำแหน่ง (x,y บนจอ)
      const a = t - u.t0, b = u.t1 - t; if (a < 0 || b < 0) return "";
      let s = `<g opacity="${f(RK.clamp(b / 0.3) * RK.clamp(a / 0.3))}">`;
      for (let i = 0; i < 6; i++) { const ph = (t * 0.7 + i / 6) % 1, x = (u.x ?? 540) + Math.sin(i * 2.3 + t * 2) * 140, y = (u.y ?? 500) - ph * 260; s += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(Math.sin(t * 3 + i) * 14)}) scale(${f(1.2 - ph * 0.4)})" opacity="${f(Math.sin(ph * Math.PI))}">` + `<ellipse cx="0" cy="0" rx="16" ry="12" fill="${["#FFD84A", "#7FD1FF", "#FF8FB1"][i % 3]}" stroke="#2B2230" stroke-width="4" transform="rotate(-20)"/>` + L(14, -4, 14, -60, "#2B2230", 5) + (i % 2 ? Pth("M 14,-60 q 24,8 20,30", "none", ST("#2B2230", 5)) : "") + `</g>`; }
      return s + `</g>`;
    },
  });
})(window);
