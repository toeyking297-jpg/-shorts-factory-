// flat_story.js — ฉากห้องประชุม (meeting) + ของในฉากที่ขยับตามเวลา (S.props)
// S.props: [{type:"orchid"|"laptop"|"plug"|"note", x, y, s, layer:"mid"|"front", ...ค่าอื่นเป็นตัวเลขหรือคีย์เฟรม [[t,v],...]}]
// orchid: bloom 0..1 (0.2 = ดอกแรกบาน ที่เหลือตูม), glow 0..1 · laptop: on 0..1, bat (ตัวเลข %), slide · plug: on 0/1
(function (G) {
  const RK = G.RK, f = RK.f, sh = RK.shade;
  const R = (x, y, w, h, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${c}" ${ex}/>`;
  const RR = (x, y, w, h, r, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" fill="${c}" ${ex}/>`;
  const C = (x, y, r, c, ex = "") => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" ${ex}/>`;
  const E = (x, y, rx, ry, c, ex = "") => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${c}" ${ex}/>`;
  const Pth = (d, c, ex = "") => `<path d="${d}" fill="${c}" ${ex}/>`;
  const L = (x1, y1, x2, y2, c, w, ex = "") => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${ex}/>`;
  const ST = (c, w, op = 1) => `stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"`;
  const T = (x, y, txt, size, c, ex = "") => `<text x="${f(x)}" y="${f(y)}" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="${size}" fill="${c}" ${ex}>${RK.esc(txt)}</text>`;
  const KV = (v, t) => (Array.isArray(v) ? RK.kf(v, t) : v);
  const WALL_Y = -70, K = 0.72;
  const draw = (p) => `pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${f(1 - RK.clamp(p))}"`;

  RK.flatDefs += `
  <linearGradient id="mtWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BCC8CF"/><stop offset="1" stop-color="#CED8DD"/></linearGradient>
  <linearGradient id="mtWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A3E2E"/><stop offset="1" stop-color="#3E2A20"/></linearGradient>
  <linearGradient id="mtSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86BDE3"/><stop offset="1" stop-color="#DDEEF6"/></linearGradient>
  <linearGradient id="mtScr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1A2230"/><stop offset=".5" stop-color="#0D1118"/><stop offset="1" stop-color="#1C2533"/></linearGradient>
  <radialGradient id="orGlow"><stop offset="0" stop-color="#FFE3A6" stop-opacity=".95"/><stop offset=".45" stop-color="#E7A6FF" stop-opacity=".45"/><stop offset="1" stop-color="#E7A6FF" stop-opacity="0"/></radialGradient>
  <radialGradient id="orPetal" cx=".5" cy=".75" r=".8"><stop offset="0" stop-color="#F6E3FF"/><stop offset=".45" stop-color="#B566E8"/><stop offset="1" stop-color="#7A2BB8"/></radialGradient>`;

  // ======================= ห้องประชุม =======================
  function slide(x, y, w, h, t, kind) { // หน้าสไลด์บนจอ
    let s = R(x, y, w, h, "#F7F9FB") + R(x, y, w, h * 0.16, "#2F5E6B") + `<text x="${f(x + w * 0.05)}" y="${f(y + h * 0.115)}" font-family="Kanit" font-weight="700" font-size="${f(h * 0.08)}" fill="#FFFFFF">แผนการตลาด 2027</text>`;
    const bw = w * 0.08;
    [0.35, 0.5, 0.45, 0.68, 0.82].forEach((v, i) => { s += R(x + w * 0.08 + i * bw * 1.6, y + h * 0.9 - h * 0.6 * v, bw, h * 0.6 * v, i === 4 ? "#E4572E" : "#7FA7B8"); });
    s += L(x + w * 0.6, y + h * 0.35, x + w * 0.92, y + h * 0.35, "#9AA6B0", h * 0.03) + L(x + w * 0.6, y + h * 0.5, x + w * 0.86, y + h * 0.5, "#9AA6B0", h * 0.03) + L(x + w * 0.6, y + h * 0.65, x + w * 0.9, y + h * 0.65, "#9AA6B0", h * 0.03);
    return s;
  }
  function blackScreen(x, y, w, h) {
    return R(x, y, w, h, "url(#mtScr)") + Pth(`M ${f(x + w * 0.1)},${f(y)} L ${f(x + w * 0.35)},${f(y)} L ${f(x + w * 0.15)},${f(y + h)} L ${f(x - w * 0.1)},${f(y + h)} Z`, "#FFFFFF", `opacity=".06"`);
  }
  function mWall(t, o) {
    const tv = KV(o.tv ?? 1, o._t || 0), dp = KV(o.draw ?? 0, o._t || 0);
    let s = R(-1800, -2400, 3600, 2400 + WALL_Y, "url(#mtWall)");
    s += R(-1800, -2400, 3600, 520, "#E8EDF0");
    for (const lx of [-1000, 0, 1000]) s += RR(lx - 220, -1900, 440, 26, 10, "#FFFFFF") + E(lx, -1850, 360, 90, "#FFFFFF", 'opacity=".4"');
    // ผนังไม้ระแนงตรงกลาง (ช่วยให้ดอกสีม่วงเด่น: โทนไม้เข้ม/เทาเย็น)
    for (let x = -460; x < 1180; x += 46) s += R(x, -1820, 34, 1750 + WALL_Y, "#8A6A52") + R(x + 34, -1820, 12, 1750 + WALL_Y, "#6E523E");
    // จอทีวีใหญ่บนผนังไม้
    s += RR(-200, -1560, 1040, 600, 16, "#1A1E24") + (tv > 0.5 ? slide(-176, -1536, 992, 552, t) + E(320, -1260, 600, 360, "#BFE4FF", 'opacity=".12"') : blackScreen(-176, -1536, 992, 552));
    s += RR(260, -950, 120, 16, 6, "#1A1E24");
    // โลโก้ห้อง
    s += RR(-120, -1760, 260, 90, 12, "#2F5E6B") + T(10, -1700, "ห้องประชุม 1", 36, "#FFFFFF");
    // ไวต์บอร์ดซ้าย + ภาพที่ค่อยๆ ถูกวาด (o.draw 0..1)
    const bx = -1560, by = -1560;
    s += RR(bx, by, 900, 600, 14, "#AEB6BE") + R(bx + 16, by + 16, 868, 568, "#FBFCFD");
    if (dp > 0) {
      const seg = (i, n = 6) => RK.clamp(dp * n - i);
      s += Pth(`M ${bx + 90},${by + 500} L ${bx + 90},${by + 110} M ${bx + 90},${by + 500} L ${bx + 560},${by + 500}`, "none", ST("#2B2F3A", 8) + " " + draw(seg(0)));
      s += Pth(`M ${bx + 110},${by + 470} C ${bx + 200},${by + 460} ${bx + 260},${by + 380} ${bx + 330},${by + 360} S ${bx + 460},${by + 200} ${bx + 540},${by + 150}`, "none", ST("#E4572E", 10) + " " + draw(seg(1)));
      s += Pth(`M ${bx + 500},${by + 140} L ${bx + 545},${by + 148} L ${bx + 530},${by + 192}`, "none", ST("#E4572E", 10) + " " + draw(seg(2)));
      s += `<g opacity="${f(seg(2))}">` + T(bx + 720, by + 120, "ลูกค้า", 46, "#2F5E6B") + `</g>`;
      s += Pth(`M ${bx + 640},${by + 170} L ${bx + 800},${by + 170} M ${bx + 720},${by + 170} L ${bx + 720},${by + 260}`, "none", ST("#2F5E6B", 7) + " " + draw(seg(3)));
      s += `<g opacity="${f(seg(3))}">` + T(bx + 720, by + 310, "ใจ + ของดี", 44, "#2B2F3A") + `</g>`;
      s += Pth(`M ${bx + 620},${by + 360} q 100,-40 200,0 q -100,90 -200,0 Z`, "none", ST("#7A2BB8", 7) + " " + draw(seg(4))); // วงรอบ
      s += `<g opacity="${f(seg(5))}">` + T(bx + 720, by + 460, "= บานยาว", 52, "#7A2BB8") + `</g>`;
      // ดอกกล้วยไม้ดูเดิ้ลเล็กๆ มุมบอร์ด
      s += `<g opacity="${f(seg(5))}" transform="translate(${bx + 820},${by + 520})">` + [0, 72, 144, 216, 288].map((a) => `<ellipse rx="14" ry="24" cy="-20" fill="none" stroke="#7A2BB8" stroke-width="4" transform="rotate(${a})"/>`).join("") + `</g>`;
    } else {
      s += Pth(`M ${bx + 80},${by + 120} l 300,0 M ${bx + 80},${by + 180} l 220,0`, "none", ST("#BFC6CC", 6));
    }
    s += RR(bx + 30, by + 600, 840, 18, 6, "#AEB6BE") + RR(bx + 120, by + 586, 80, 16, 4, "#E4572E") + RR(bx + 210, by + 586, 80, 16, 4, "#2F5E6B") + RR(bx + 300, by + 586, 80, 16, 4, "#7A2BB8");
    // หน้าต่างกระจกขวา + เมือง
    s += `<clipPath id="mtWin"><rect x="1260" y="-1760" width="460" height="1080"/></clipPath><g clip-path="url(#mtWin)">` + R(1260, -1760, 460, 1080, "url(#mtSky)");
    const r = RK.rng(31);
    for (let i = 0; i < 9; i++) { const bw = 70 + r() * 80, bh = 300 + r() * 500, bx2 = 1240 + i * 60 + (RK._camPx || 0) * 0.15; s += R(bx2, -680 - bh, bw, bh, i % 2 ? "#9DB1C0" : "#8AA0B2"); for (let wy = -660 - bh; wy < -700; wy += 40) s += R(bx2 + 12, wy, bw - 24, 14, "#DDEBF3", 'opacity=".7"'); }
    s += `</g>` + `<rect x="1250" y="-1770" width="480" height="1100" fill="none" stroke="#9AA6B0" stroke-width="20"/>` + R(1480, -1760, 12, 1080, "#9AA6B0");
    s += Pth("M 1280,-1740 l 120,0 l -120,260 Z", "#FFFFFF", 'opacity=".25"');
    // ตู้เตี้ยใต้ทีวี + ขวดน้ำ + ต้นไม้ + นาฬิกา
    s += RR(-1560, -560, 700, 490, 10, "#E3E7EA") + R(-1560, -560, 700, 18, "#C9D0D6") + RR(-1520, -500, 300, 400, 6, "#D2D8DD") + RR(-1200, -500, 300, 400, 6, "#D2D8DD") + RR(-1250, -320, 12, 60, 6, "#9AA6B0") + RR(-1170, -320, 12, 60, 6, "#9AA6B0");
    for (let i = 0; i < 4; i++) s += RR(-1500 + i * 60, -650, 36, 90, 10, "#9FD3E8", 'opacity=".85"') + RR(-1494 + i * 60, -670, 24, 22, 4, "#2F6FB0");
    s += KIT().plant(1150, WALL_Y, 0.9, t, "#E3E7EA") + KIT().clock(1490, -1880 + 300, 70, t, "#2B2F3A");
    // แผงซับเสียง
    for (let i = 0; i < 3; i++) s += RR(-1700 + i * 0, -1820 + i * 0, 0, 0, 0, "none");
    s += R(-1800, WALL_Y - 30, 3600, 30, "#9AA6B0");
    // พื้นพรม
    s += R(-1800, WALL_Y, 3600, 1700, "#56606B");
    for (let y = WALL_Y + 50; y < 1600; y += 80) s += L(-1800, y, 1800, y, "#4A535D", 2, 'opacity=".5"');
    // พนักเก้าอี้ลูกค้า (อยู่หลังโต๊ะ)
    for (const cx of (o.chairs || [-300, 420])) s += RR(cx - 120, -600, 240, 320, 60, "#1F2329") + RR(cx - 98, -578, 196, 270, 48, "#2E333C");
    return s;
  }
  function mIsland(t, o) {
    // โต๊ะประชุมยาวไม้เข้ม
    const top = -250, x0 = -1500, x1 = 1500;
    let s = E(0, 40, 1600, 40, "#000", 'opacity=".28"');
    s += R(x0, top, x1 - x0, 26, "#6E4E3A") + R(x0, top + 26, x1 - x0, 10, "#4A3326") + R(x0 + 20, top + 36, x1 - x0 - 40, 260, "url(#mtWood)");
    for (let x = x0 + 120; x < x1 - 60; x += 240) s += L(x, top + 60, x, top + 280, "#2E2018", 3, 'opacity=".4"');
    // ของบนโต๊ะ: แก้วน้ำ สมุด ปากกา ป้ายชื่อ
    for (const [gx, nm] of [[-380, "คุณชัย"], [330, "คุณแจน"]]) {
      s += RR(gx - 100, top - 46, 120, 46, 4, "#FFFFFF") + Pth(`M ${gx - 100},${top - 46} l 60,-30 l 60,30`, "none", ST("#C9D0D6", 3)) + T(gx - 40, top - 14, nm, 26, "#2F5E6B");
      s += Pth(`M ${gx + 60},${top - 70} l 40,0 l -6,70 l -28,0 Z`, "#CFEAF5", 'opacity=".85"') + R(gx + 64, top - 40, 32, 30, "#9FD3E8", 'opacity=".7"');
      s += RR(gx + 130, top - 10, 150, 12, 3, "#F3F0EA") + L(gx + 150, top - 16, gx + 260, top - 22, "#2B2F3A", 5);
    }
    return s;
  }
  function mFore(t, o) {
    let s = RR(-1700, 300, 420, 700, 90, "#1F2329") + RR(1300, 340, 420, 700, 90, "#1F2329");
    for (let k = 0; k < 8; k++) { const a = -50 + k * 14 + Math.sin(t + k) * 3; s += `<ellipse cx="0" cy="-150" rx="46" ry="150" fill="${k % 2 ? "#3E6E45" : "#558B57"}" transform="translate(-1500,520) rotate(${f(a)})"/>`; }
    return s;
  }
  function mSun(t, o) {
    let s = `<g style="mix-blend-mode:screen">`;
    for (let i = 0; i < 2; i++) s += Pth(`M ${1280 + i * 200},-1740 L ${1400 + i * 200},-1740 L ${600 + i * 260},0 L ${300 + i * 260},0 Z`, "url(#hBeam)", `opacity="${f(0.4 + 0.1 * Math.sin(t + i))}" filter="url(#fBlur20)"`);
    return s + `</g>`;
  }
  const KIT = () => RK._kit;
  const wrap = (fn, back, ground) => (t, o) => (back ? R(-4000, -5000, 8000, 5000 + WALL_Y * K, back) + R(-4000, WALL_Y * K, 8000, 4000, ground) : "") + `<g transform="scale(${K})">${fn(t, o || {})}</g>`;
  RK.flatSets.meeting = { wall: wrap(mWall, "#E8EDF0", "#56606B"), lamps: () => "", island: wrap(mIsland), foreground: wrap(mFore), sunlight: wrap(mSun), WALL_Y: WALL_Y * K };

  // ======================= ของในฉาก =======================
  function orchid(p, t, TT) {
    const bloom = p.bloom ?? 0.2, glow = p.glow ?? 0;
    let s = "";
    if (glow > 0) {
      s += E(40, -150, 260, 240, "url(#orGlow)", `opacity="${f(glow * (0.85 + 0.15 * Math.sin(TT * 3)))}"`);
      const r = RK.rng(9);
      for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = 60 + r() * 170, ph = (TT * 0.6 + r()) % 1, x = 40 + Math.cos(a) * d, y = -150 + Math.sin(a) * d * 0.8 - ph * 60; s += `<g transform="translate(${f(x)},${f(y)}) scale(${f(Math.sin(ph * Math.PI) * glow)})"><path d="M 0,-12 L 3,-3 L 12,0 L 3,3 L 0,12 L -3,3 L -12,0 L -3,-3 Z" fill="#FFF3C4"/></g>`; }
    }
    // กระถางเซรามิกขาว + จานรอง
    s += E(0, 2, 60, 10, "#000", 'opacity=".25"') + RR(-58, -8, 116, 12, 6, "#D8D2C6");
    s += Pth("M -48,-78 L 48,-78 L 38,-6 L -38,-6 Z", "#FAF7F0", `stroke="#D3CCBE" stroke-width="2.5"`) + R(-48, -84, 96, 12, "#EFEAE0") + Pth("M -30,-70 L -24,-14", "none", ST("#FFFFFF", 6, 0.8)) + R(-46, -52, 92, 8, "#7A2BB8", 'opacity=".85"');
    s += E(0, -82, 44, 8, "#5A3E2E");
    // ใบหนาๆ 3 ใบ
    const sway = Math.sin(TT * 1.3) * 1.5;
    s += Pth("M -6,-84 C -60,-110 -120,-96 -136,-70 C -96,-74 -50,-74 -6,-80 Z", "#2E6B3A", `stroke="#1F4A28" stroke-width="2"`);
    s += Pth("M 6,-84 C 60,-120 128,-104 140,-80 C 98,-80 56,-78 6,-80 Z", "#3B7E46", `stroke="#1F4A28" stroke-width="2"`);
    s += Pth("M 0,-86 C -20,-130 -6,-160 18,-170 C 16,-140 14,-110 4,-84 Z", "#4A8F52", `stroke="#1F4A28" stroke-width="2"`);
    s += Pth("M -60,-92 C -90,-92 -112,-84 -126,-74", "none", ST("#5FA668", 3, 0.6)) + Pth("M 60,-98 C 90,-100 112,-92 128,-82", "none", ST("#6DB577", 3, 0.6));
    // ไม้ค้ำ + ก้านโค้ง
    s += L(-4, -84, -8, -300, "#A07A52", 5);
    const stem = [[-6, -90], [-8, -200], [-4, -296], [30, -330], [76, -332], [116, -312], [146, -280]];
    s += Pth(`M ${stem.map((q) => `${f(q[0] + (q[1] < -280 ? sway : 0))},${f(q[1])}`).join(" L ")}`, "none", ST("#4C6B3A", 5)) + C(-6, -250, 5, "#C9A27A");
    // ดอก 5 ดอกตามก้าน (ดอกแรกบานก่อน)
    const spots = [[2, -300, 0], [40, -330, 1], [82, -330, 2], [118, -310, 3], [146, -278, 4]];
    for (const [x, y, i] of spots.slice().reverse()) {
      const b = RK.ease.out(RK.clamp(bloom * 5 - i * 0.92)), bx = x + sway, by = y + 18 + i * 3, sc = 0.5 + 0.5 * b, bud = 1 - b;
      s += L(x + sway, y, bx, by - 6, "#4C6B3A", 3);
      if (b < 0.05) { s += E(bx, by + 6, 11 - i, 15 - i, "#9C5BC4", `stroke="#5B2A7A" stroke-width="2"`) + E(bx - 3, by + 2, 3, 6, "#D9B3F0", 'opacity=".7"'); continue; }
      s += `<g transform="translate(${f(bx)},${f(by + 22)}) scale(${f(sc * (1 - 0.04 * i))}) rotate(${f((i - 2) * 6)})">`;
      // กลีบเลี้ยง 3 กลีบ
      for (const a of [0, 120, 240]) s += `<ellipse cx="0" cy="-26" rx="${f(12 * b + 4)}" ry="${f(26 * b + 6)}" fill="url(#orPetal)" stroke="#5B1A7A" stroke-width="1.6" transform="rotate(${a + 180})"/>`;
      // กลีบดอก 2 กลีบกว้าง
      for (const a of [-62, 62]) s += `<ellipse cx="0" cy="-26" rx="${f(22 * b + 4)}" ry="${f(25 * b + 5)}" fill="url(#orPetal)" stroke="#5B1A7A" stroke-width="1.6" transform="rotate(${a})"/>`;
      // ปากดอกสีเข้ม + เส้าเกสรเหลือง
      s += Pth(`M -10,4 C -14,22 14,22 10,4 C 6,10 -6,10 -10,4 Z`, "#5B1A7A") + E(0, 1, 7, 6, "#FFD84A") + E(-1, -1, 2.5, 2, "#FFFFFF");
      s += `</g>`;
    }
    return s;
  }
  function laptop(p, t, TT) {
    const on = p.on ?? 1, bat = p.bat, w = 260, h = 170;
    let s = E(0, 4, 170, 12, "#000", 'opacity=".3"');
    s += Pth(`M ${-w / 2 - 20},0 L ${w / 2 + 20},0 L ${w / 2},-16 L ${-w / 2},-16 Z`, "#B8C0C8") + R(-40, -4, 80, 4, "#8E98A2");
    s += RR(-w / 2, -16 - h, w, h, 10, "#2B2F36") + (on > 0.5 ? slide(-w / 2 + 10, -16 - h + 10, w - 20, h - 24, TT) : blackScreen(-w / 2 + 10, -16 - h + 10, w - 20, h - 24));
    if (on > 0.5 && bat != null) {
      const blink = Math.sin(TT * 10) > 0 ? 1 : 0.35;
      s += `<g transform="translate(${w / 2 - 70},${-16 - h + 18})" opacity="${f(blink)}">` + RR(0, 0, 54, 24, 4, "#1A1E24") + RR(3, 3, 44, 18, 2, "none", 'stroke="#FF4B3E" stroke-width="2.5"') + R(5, 5, 4, 14, "#FF4B3E") + R(47, 8, 4, 8, "#FF4B3E") + `</g>` + T(w / 2 - 98, -16 - h + 37, `${bat}%`, 20, "#FF4B3E", `opacity="${f(blink)}"`);
    }
    if (on <= 0.5 && on > 0.02) s += R(-w / 2 + 10, -16 - h / 2 - 2, w - 20, 4 * on * 2, "#FFFFFF", `opacity="${f(on * 2)}"`); // เส้นสว่างตอนจอดับ
    s += C(0, -16 - h + 5, 2.5, "#111");
    return s;
  }
  function plug(p, t, TT) {
    const on = (p.on ?? 0) > 0.5;
    let s = RR(-110, -26, 220, 30, 8, "#F3F4F6", `stroke="#C8CED4" stroke-width="2"`);
    for (let i = 0; i < 3; i++) s += RR(-60 + i * 46, -18, 30, 16, 4, "#D8DDE2") + R(-52 + i * 46, -14, 4, 8, "#555") + R(-40 + i * 46, -14, 4, 8, "#555");
    s += RR(-104, -22, 30, 22, 4, on ? "#FF3B30" : "#9A2A24") + (on ? E(-89, -11, 30, 22, "#FF5A4E", 'opacity=".35"') : "");
    s += RR(-28, -40, 26, 34, 5, "#2B2F36") + Pth("M -15,-40 C -15,-90 -200,-60 -260,-20", "none", ST("#2B2F36", 6));
    s += Pth("M 110,-12 C 180,-10 220,30 300,20", "none", ST("#E9ECEF", 7));
    return s;
  }
  const DRAW = { orchid, laptop, plug };
  RK.flatProps = function (S, t, T, layer) {
    let s = "";
    for (const p0 of S.props || []) {
      if ((p0.layer || "mid") !== layer) continue;
      const p = {}; for (const k in p0) p[k] = KV(p0[k], t);
      if (!DRAW[p.type]) continue;
      s += `<g transform="translate(${f(p.x || 0)},${f(p.y || 0)}) scale(${f(p.s || 1)})">${DRAW[p.type](p, t, T)}</g>`;
    }
    return s;
  };
})(window);
