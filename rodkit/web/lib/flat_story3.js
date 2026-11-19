// flat_story3.js — ของสำหรับ ST003 "คดีปลาทูหาย"
// props: plate{kind:full|bones|messy|empty, toothpick}, tin (กระปุกไม้จิ้มฟันหัวแดง), cooker{done 0/1, steam 0..1},
//        carrier, rack{gma 0/1}, prints{len, slipper 0/1}, bowl, cat ขยาย: col:"gray"|"orange", thin, fish
// ui: notebook{lines:[{t, at, strike?, check?}]}, lens (มุมมองแว่นขยาย)
// S.grade: "sepia" | "dusk" | "night" — ปรับโทนทั้งภาพ
(function (G) {
  const RK = G.RK, f = RK.f, W = 1080, H = 1920;
  const R = (x, y, w, h, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${c}" ${ex}/>`;
  const RR = (x, y, w, h, r, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" fill="${c}" ${ex}/>`;
  const C = (x, y, r, c, ex = "") => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" ${ex}/>`;
  const E = (x, y, rx, ry, c, ex = "") => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${c}" ${ex}/>`;
  const Pth = (d, c, ex = "") => `<path d="${d}" fill="${c}" ${ex}/>`;
  const L = (x1, y1, x2, y2, c, w, ex = "") => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${ex}/>`;
  const ST = (c, w, op = 1) => `stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"`;
  const TX = (x, y, txt, size, c, ex = "") => `<text x="${f(x)}" y="${f(y)}" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="${size}" fill="${c}" ${ex}>${RK.esc(txt)}</text>`;

  // ---------- ปลาทู ----------
  const fish = (x, y, s = 1, flip = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s * flip)},${f(s)})">` +
    Pth("M -60,0 C -40,-22 30,-24 52,-4 L 74,-18 L 70,2 L 76,20 L 52,6 C 30,22 -40,20 -60,0 Z", "#C9A15A", `stroke="#7E5A2A" stroke-width="2.5"`) +
    Pth("M -50,-4 C -20,-16 20,-16 46,-6", "none", ST("#E8C987", 4, 0.8)) + C(-44, -4, 4, "#2B2230") + Pth("M -36,-10 q 6,10 0,20", "none", ST("#7E5A2A", 2.5)) +
    [0, 1, 2, 3].map((i) => L(-20 + i * 16, -12, -14 + i * 16, 10, "#8E6A3A", 1.5, 'opacity=".5"')).join("") + `</g>`;
  const toothpick = (x, y, a = -8) => `<g transform="translate(${f(x)},${f(y)}) rotate(${a})">` + L(-34, 0, 34, 0, "#E9D3A8", 4) + L(26, 0, 36, 0, "#D7263D", 5) + L(-36, 0, -26, 0, "#D7263D", 5) + `</g>`;
  function plate(p, t, TT) {
    const k = p.kind || "bones";
    let s = E(0, 6, 120, 16, "#000", 'opacity=".2"') + E(0, 0, 118, 30, "#FFFFFF", `stroke="#D9D2C4" stroke-width="3"`) + E(0, -2, 92, 21, "#F4EFE6") + E(0, -2, 100, 25, "none", `stroke="#4F8FC0" stroke-width="2.5" opacity=".6"`);
    if (k === "full") s += fish(-6, -12, 0.95) + fish(10, -4, 0.85, -1);
    if (k === "bones") { // ก้างเรียงเป็นแถวตรงเป๊ะ (ฝีมือคนแกะ)
      for (let i = 0; i < 2; i++) { const yy = -14 + i * 14; s += L(-62, yy, 50, yy, "#F2EADB", 3.5) + [...Array(11)].map((_, j) => L(-54 + j * 10, yy - 7, -54 + j * 10, yy + 7, "#EDE3D0", 2)).join("") + Pth(`M 50,${yy} l 14,-9 l -3,9 l 3,9 Z`, "#E8DCC6") + C(-66, yy, 6, "#E8DCC6"); }
    }
    if (k === "messy") { // ก้างกระจาย + เศษข้าว (ฝีมือเด็ก)
      const r = RK.rng(7);
      for (let i = 0; i < 14; i++) { const x = -70 + r() * 140, y = -18 + r() * 28, a = r() * 180; s += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(a)})">` + L(-14, 0, 14, 0, "#EDE3D0", 2.5) + L(-6, -5, -6, 5, "#EDE3D0", 1.6) + L(4, -5, 4, 5, "#EDE3D0", 1.6) + `</g>`; }
      for (let i = 0; i < 12; i++) s += E(-60 + r() * 120, -14 + r() * 22, 4, 2.5, "#FFFFFF", `stroke="#E3DACB" stroke-width="1"`);
      s += fish(30, -8, 0.4) ;
    }
    if (k === "rice") s += Pth("M -60,-4 Q 0,-46 60,-4 Z", "#FFFFFF", `stroke="#E3DACB" stroke-width="2"`) + fish(10, -10, 0.5);
    if (p.toothpick) s += toothpick(60, 6, -12);
    return s;
  }
  function tin(p) {
    let s = E(0, 4, 40, 7, "#000", 'opacity=".2"') + RR(-34, -90, 68, 92, 10, "#DDEFF5", `opacity=".7" stroke="#A9C8D2" stroke-width="3"`);
    for (let i = 0; i < 11; i++) { const x = -26 + i * 5.2, a = (i - 5) * 2.4; s += `<g transform="rotate(${f(a)} ${f(x)} 0)">` + L(x, -6, x, -118, "#E9D3A8", 3) + L(x, -110, x, -122, "#D7263D", 4.5) + `</g>`; }
    s += RR(-38, -96, 76, 14, 5, "#C9493B") + R(-28, -60, 56, 24, "#FFF4D6", 'opacity=".9"') + TX(0, -42, "ยาย", 16, "#8E3B46");
    return s;
  }
  function cooker(p, t, TT) {
    const done = (p.done ?? 0) > 0.5, st = p.steam ?? 0.4;
    let s = E(0, 4, 90, 12, "#000", 'opacity=".22"');
    s += RR(-82, -120, 164, 124, 40, "#FBF6F0", `stroke="#D8CEC2" stroke-width="3"`) + Pth("M -86,-112 Q 0,-170 86,-112 Z", "#F3E3E8", `stroke="#D8CEC2" stroke-width="3"`) + RR(-26, -160, 52, 16, 8, "#C9B9BF");
    s += RR(-36, -64, 72, 40, 10, "#E9DCE2") + C(-14, -44, 8, done ? "#4CC36A" : "#FF4B3E") + (done ? E(-14, -44, 18, 18, "#4CC36A", 'opacity=".3"') : E(-14, -44, 16 + Math.sin(TT * 6) * 3, 16, "#FF4B3E", 'opacity=".3"')) + C(14, -44, 8, "#B8A8AE");
    for (let i = 0; i < 4; i++) { const ph = (TT * (0.6 + st) + i / 4) % 1; s += Pth(`M ${f(-10 + i * 7)},${f(-170 - ph * 140 * (0.5 + st))} q 12,-18 0,-36 q -12,-18 0,-36`, "none", ST("#FFFFFF", 8 + st * 6, (1 - ph) * (0.25 + 0.5 * st))); }
    return s;
  }
  function carrier(p) {
    let s = E(0, 4, 130, 14, "#000", 'opacity=".25"') + RR(-120, -150, 240, 154, 26, "#5BA4D9", `stroke="#3B78A8" stroke-width="4"`) + RR(-110, -170, 220, 40, 18, "#4A8FC4");
    s += RR(-40, -196, 80, 20, 10, "none", 'stroke="#2E5E86" stroke-width="10"') + RR(-80, -120, 120, 100, 12, "#2E3F55");
    for (let i = 0; i < 6; i++) s += L(-70 + i * 20, -116, -70 + i * 20, -24, "#BFD3E2", 5);
    for (let i = 0; i < 6; i++) s += C(70, -120 + i * 18, 5, "#2E5E86");
    return s;
  }
  function slipper(x, y, c, s = 1) { return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">` + E(0, 0, 30, 10, c, `stroke="${RK.shade(c, -0.3)}" stroke-width="2"`) + Pth("M -18,-2 Q 0,-16 18,-2", "none", ST(RK.shade(c, -0.35), 5)) + `</g>`; }
  function rack(p) {
    let s = R(-200, -170, 400, 12, "#8A5A3A") + R(-200, -80, 400, 12, "#8A5A3A") + R(-200, 0, 400, 12, "#8A5A3A") + R(-204, -176, 14, 190, "#6E4630") + R(190, -176, 14, 190, "#6E4630");
    const tag = (x, y, t) => RR(x - 34, y - 14, 68, 24, 6, "#FFF4D6", `stroke="#B08A62" stroke-width="2"`) + TX(x, y + 4, t, 15, "#6E4630");
    s += slipper(-100, -96, "#6B4A33", 1.25) + tag(-100, -140, "พ่อ") + slipper(90, -96, "#E46F82") + tag(90, -140, "แม่");
    s += slipper(-100, -14, "#F2C14E", 0.75) + tag(-100, -50, "ข้าวหอม") + tag(90, -50, "ยาย");
    if ((p.gma ?? 0) > 0.5) s += slipper(90, -14, "#3E8F7A");
    else s += E(90, -12, 30, 6, "#000", 'opacity=".12"');
    return s;
  }
  function prints(p, t, TT) { // รอยเท้าเปียกบนพื้น ไปทางขวา
    const n = p.n || 9, gap = p.gap || 110;
    let s = "";
    for (let i = 0; i < n; i++) {
      const x = i * gap, y = (i % 2 ? 12 : -12), sh = `opacity="${f(0.85 - i * 0.04)}"`;
      s += `<g transform="translate(${f(x)},${f(y)}) scale(1.6)" ${sh}>` + E(0, 0, 13, 10, "#3E5A68") + [-12, -4, 4, 12].map((dx) => E(dx, -14, 4.5, 5, "#3E5A68")).join("") + E(-3, -3, 5, 3, "#BFE6F5", 'opacity=".8"') + `</g>`;
      if (p.slipper && i % 2 === 0) s += `<g transform="translate(${f(x + 50)},${f(70)})" opacity="${f((0.7 - i * 0.04) * (p.slipper))}">` + E(0, 0, 36, 14, "#3E5A68") + E(-8, -4, 14, 4, "#BFE6F5", 'opacity=".7"') + `</g>`;
    }
    return s;
  }
  function bowl(p) { return E(0, 4, 50, 8, "#000", 'opacity=".2"') + Pth("M -46,-30 Q -40,6 0,6 Q 40,6 46,-30 Z", "#F6F1E6", `stroke="#C9C0B0" stroke-width="2.5"`) + R(-44, -24, 88, 6, "#4F8FC0", 'opacity=".6"') + E(0, -30, 46, 9, (p.fish ?? 1) > 0.5 ? "#D9B98A" : "#EFE8DA"); }
  function slippers(p) { return slipper(-26, 0, "#3E8F7A") + slipper(30, 8, "#3E8F7A") + ((p.wet ?? 1) > 0.5 ? E(0, 10, 70, 12, "#3E5A68", 'opacity=".35"') + E(-30, -2, 10, 3, "#FFFFFF", 'opacity=".6"') : ""); }
  function bucket(p) { return E(0, 4, 60, 10, "#000", 'opacity=".2"') + Pth("M -50,-90 L 50,-90 L 40,0 L -40,0 Z", "#4A86C4", `stroke="#2E5E86" stroke-width="3"`) + E(0, -90, 50, 10, "#9FD3E8") + Pth("M -50,-90 Q 0,-150 50,-90", "none", ST("#2E5E86", 5)) + L(30, -100, 120, -330, "#C9A27A", 9) + Pth("M 100,-300 l 50,-60 l 20,20 l -50,60 Z", "#E8E2D6"); }
  function spoon(p) { // ช้อนวางบนโต๊ะ
    return E(0, 2, 34, 4, "#000", 'opacity=".15"') + `<g transform="rotate(${f(p.ang ?? -8)})">` + E(-22, -4, 14, 7, "#D8DEE4", `stroke="#8E98A2" stroke-width="2"`) + E(-24, -6, 6, 2.5, "#FFFFFF", 'opacity=".8"') + RR(-10, -6.5, 46, 5, 2.5, "#C3CBD3", `stroke="#8E98A2" stroke-width="1.5"`) + `</g>`;
  }
  function soup(p, t, TT) { // ชามแกงจืด (full 0..1)
    const full = p.full ?? 1;
    let s = E(0, 4, 62, 9, "#000", 'opacity=".2"') + Pth("M -58,-40 Q -52,8 0,8 Q 52,8 58,-40 Z", "#FFFFFF", `stroke="#C9C0B0" stroke-width="2.5"`) + R(-56, -30, 112, 6, "#4F8FC0", 'opacity=".6"');
    s += E(0, -40, 58, 11, full > 0.05 ? "#E9DDB0" : "#F4EFE6");
    if (full > 0.05) { s += E(-18, -41, 10 * full, 4, "#5FA64A") + E(14, -40, 12 * full, 4, "#F2F2E6", `stroke="#D8D2C0" stroke-width="1"`) + E(30, -42, 6 * full, 3, "#E46F3A"); for (let i = 0; i < 2; i++) { const ph = (TT * 0.5 + i / 2) % 1; s += Pth(`M ${f(-10 + i * 18)},${f(-52 - ph * 70)} q 9,-12 0,-24 q -9,-12 0,-24`, "none", ST("#FFFFFF", 6, (1 - ph) * 0.5 * full)); } }
    return s;
  }
  function foodbox(p) { // กล่องข้าวซื้อ ซ้อน n กล่อง (ทศนิยม = กล่องบนสุดกำลังวาง)
    const n = p.n ?? 1; let s = E(0, 4, 70, 8, "#000", 'opacity=".2"');
    for (let i = 0; i < Math.ceil(n); i++) { const op = Math.min(1, n - i), y = -i * 44; s += `<g opacity="${f(op)}" transform="translate(${f((i % 2) * 6 - 3)},${f(y)})">` + RR(-62, -40, 124, 40, 6, "#F7F4EC", `stroke="#C9C0B0" stroke-width="2.5"`) + R(-62, -24, 124, 4, "#C9C0B0") + RR(-20, -36, 40, 10, 3, "#E46F3A", 'opacity=".8"') + `</g>`; }
    return s;
  }
  const DRAW3 = { plate, tin, cooker, carrier, rack, prints, bowl, slippers, bucket, spoon, soup, foodbox };
  const prev = RK.flatProps;
  RK.flatProps = function (S, t, T, layer) {
    let s = prev ? prev(S, t, T, layer) : "";
    for (const p0 of S.props || []) {
      if ((p0.layer || "mid") !== layer || !DRAW3[p0.type]) continue;
      const p = {}; for (const k in p0) p[k] = Array.isArray(p0[k]) ? RK.kf(p0[k], t) : p0[k];
      s += `<g transform="translate(${f(p.x || 0)},${f(p.y || 0)}) scale(${f(p.s || 1)}) rotate(${f(p.rot || 0)})" opacity="${f(p.op ?? 1)}">${DRAW3[p.type](p, t, T)}</g>`;
    }
    return s;
  };
  // ของถือในมือ (มุมหน้า วางที่มือ)
  Object.assign(RK.FLAT_PROPS, {
    magnifier: () => C(0, -30, 26, "#CFE8F5", `opacity=".55" stroke="#2B2230" stroke-width="7"`) + E(-8, -38, 8, 5, "#FFFFFF", 'opacity=".8"') + L(0, -4, 0, 30, "#8A5A3A", 9),
    notebookP: () => RR(-26, -40, 52, 66, 5, "#D7263D", `stroke="#8E1E2A" stroke-width="2"`) + R(-20, -32, 40, 6, "#FFFFFF", 'opacity=".7"'),
    bowlP: () => Pth("M -30,-16 Q -26,8 0,8 Q 26,8 30,-16 Z", "#F6F1E6", `stroke="#C9C0B0" stroke-width="2"`) + E(0, -16, 30, 6, "#D9B98A"),
    porkbag: () => Pth("M -24,-40 L 24,-40 L 30,24 L -30,24 Z", "#F2F6F8", `opacity=".85" stroke="#C8D2D8" stroke-width="2"`) + [0, 1, 2].map((i) => L(-12 + i * 12, -60, -12 + i * 12, 10, "#C9A27A", 3) + RR(-18 + i * 12, -20, 12, 30, 4, "#9A4A2A")).join(""),
    spatula: () => L(0, -70, 0, 10, "#5A3E2E", 7) + RR(-16, -100, 32, 36, 5, "#9AA4AE"),
  });

  // ---------- แมว: เพิ่มสี/ตัวผอม/คาบปลา ----------
  const baseCat = (() => { // ห่อแมวเดิมจาก flat_story2 (ใช้ type cat) — เปลี่ยนสีด้วยการแทนที่สีในผลลัพธ์
    return null;
  })();
  const prevProps2 = RK.flatProps;
  RK.flatProps = function (S, t, T, layer) {
    let s = prevProps2(S, t, T, layer);
    return s;
  };
  // หมายเหตุ: แมวเทา/ลูกแมว ใช้ type "cat" + col:"gray" ซึ่ง flat_story2 รองรับ (ดูแก้ใน cat())

  // ---------- UI ----------
  const W2 = W / 2;
  Object.assign(RK.flatUi, {
    notebook(u, t) { // สมุดนักสืบเต็มจอ เขียนทีละบรรทัด
      const a = t - u.t0, b = u.t1 - t; if (a < 0 || b < 0) return "";
      const k = RK.ease.out(RK.clamp(a / 0.35)), out = RK.clamp(b / 0.3);
      let s = `<g opacity="${f(out)}"><rect width="${W}" height="${H}" fill="#1A1220" opacity="${f(0.55 * k)}"/>`;
      s += `<g transform="translate(${W2},${f(960 + (1 - k) * 200)}) rotate(${f(-3 + (1 - k) * 6)})">`;
      s += RR(-400, -560, 800, 1120, 30, "#B81E30") + RR(-370, -530, 760, 1060, 18, "#FFFBF0") + R(-370, -530, 60, 1060, "#F3E6D0");
      for (let y = -430; y < 520; y += 90) s += L(-300, y, 370, y, "#9FC3E0", 2.5);
      s += L(-290, -530, -290, 530, "#E58A8A", 3);
      const lines = u.lines || [];
      lines.forEach((ln, i) => {
        const p = RK.clamp((t - u.t0 - (ln.at ?? i * 0.5)) / 0.45); if (p <= 0) return;
        const y = -450 + i * 90 + 70, x0 = -260;
        s += `<clipPath id="nbc${i}"><rect x="${x0 - 10}" y="${y - 70}" width="${f(680 * p)}" height="100"/></clipPath>`;
        s += `<text x="${x0}" y="${y}" font-family="Kanit" font-weight="500" font-size="${ln.size || 58}" fill="${ln.color || "#2B2F5A"}" clip-path="url(#nbc${i})" transform="rotate(-1 ${x0} ${y})">${RK.esc(ln.t)}</text>`;
        if (ln.strike != null) { const sp = RK.clamp((t - u.t0 - ln.strike) / 0.3); if (sp > 0) s += L(x0 - 10, y - 18, x0 - 10 + (ln.w || 260) * sp, y - 24, "#D7263D", 9); }
        if (ln.check != null) { const cp = RK.clamp((t - u.t0 - ln.check) / 0.25); if (cp > 0) s += `<path d="M ${x0 + (ln.w || 300) + 20},${y - 20} l 24,26 l 50,-60" fill="none" stroke="#2E9E5B" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${f(1 - cp)}"/>`; }
        if (ln.circle != null) { const cp = RK.clamp((t - u.t0 - ln.circle) / 0.4); if (cp > 0) s += `<ellipse cx="${x0 + (ln.w || 200) / 2}" cy="${y - 20}" rx="${(ln.w || 200) / 2 + 30}" ry="52" fill="none" stroke="#D7263D" stroke-width="7" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${f(1 - cp)}"/>`; }
      });
      return s + `</g></g>`;
    },
    timer(u, t) { // ตัวนับเวลาหม้อหุงข้าว (ไม่มีกล่อง)
      const a = t - u.t0, b = u.t1 - t; if (a < 0 || b < 0) return "";
      const k = RK.ease.back(RK.clamp(a / 0.3)) * RK.clamp(b / 0.25), sec = Math.max(0, (u.from ?? 1200) - (u.rate ?? 0) * a), mm = Math.floor(sec / 60), ss = Math.floor(sec % 60);
      const txt = `${mm}:${String(ss).padStart(2, "0")}`, c = sec < 600 ? "#FF6B5E" : "#FFFFFF";
      return `<g transform="translate(${f(u.x ?? 860)},${f(u.y ?? 330)}) scale(${f(k)})">` + `<text x="0" y="0" text-anchor="middle" font-family="Kanit" font-weight="800" font-size="96" fill="${c}" stroke="#1A1220" stroke-width="18" stroke-linejoin="round" paint-order="stroke">${txt}</text>` +
        `<text x="0" y="56" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="36" fill="#FFE7A0" stroke="#1A1220" stroke-width="8" paint-order="stroke">${RK.esc(u.label || "ก่อนข้าวสุก")}</text></g>`;
    },
    lens(u, t) { // มุมมองผ่านแว่นขยาย
      const a = t - u.t0, b = u.t1 - t; if (a < 0 || b < 0) return "";
      const k = RK.ease.back(RK.clamp(a / 0.3)) * RK.clamp(b / 0.2), cx = u.x ?? W2, cy = (u.y ?? 900) + Math.sin(t * 2) * 6, r = (u.r ?? 360) * k;
      return `<mask id="lensM"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="#000"/></mask>` +
        `<rect width="${W}" height="${H}" fill="#120C14" opacity=".82" mask="url(#lensM)"/>` + C(cx, cy, r, "none", `stroke="#2B2230" stroke-width="34"`) + C(cx, cy, r - 12, "none", `stroke="#C9A27A" stroke-width="8"`) +
        Pth(`M ${f(cx - r * 0.6)},${f(cy - r * 0.55)} q ${f(r * 0.2)},${f(-r * 0.2)} ${f(r * 0.5)},${f(-r * 0.25)}`, "none", ST("#FFFFFF", 14, 0.5)) +
        `<g transform="translate(${f(cx + r * 0.7)},${f(cy + r * 0.7)}) rotate(45)">` + RR(-26, 0, 52, 300, 22, "#8A5A3A") + `</g>`;
    },
  });

  // ---------- โทนภาพ ----------
  RK.flatGrade = function (S, t) {
    const g = S.grade; if (!g) return "";
    if (g === "sepia") return `<rect width="${W}" height="${H}" fill="#8A5A2A" opacity=".38" style="mix-blend-mode:color"/><rect width="${W}" height="${H}" fill="#F3E0B0" opacity=".18"/>` +
      `<radialGradient id="sepV" cx=".5" cy=".5" r=".7"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2A1A0A" stop-opacity=".7"/></radialGradient><rect width="${W}" height="${H}" fill="url(#sepV)"/>`;
    if (g === "dusk") return `<rect width="${W}" height="${H}" fill="#3A2A6A" opacity=".32" style="mix-blend-mode:multiply"/><rect width="${W}" height="${H}" fill="#FF9A5A" opacity=".10" style="mix-blend-mode:screen"/>`;
    if (g === "night") return `<rect width="${W}" height="${H}" fill="#1E2450" opacity=".42" style="mix-blend-mode:multiply"/>`;
    return "";
  };
})(window);
