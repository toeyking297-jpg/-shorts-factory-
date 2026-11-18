// flat_motion.js — ท่าทางเพิ่ม, ของประกอบฉาก (เก้าอี้ โต๊ะ ผ้าห่ม เปลือกกล้วย), เอฟเฟกต์ (Zzz ดาวมึน ! หัวใจ), ฉากห้องนอน
(function (G) {
  const RK = G.RK, X = RK._flat, f = X.f, P = X.P, path = X.path, circ = X.circ, line = X.line, taper = X.taper, sh = X.sh, pol = X.pol;
  const st = (c, w, op = 1, ex = "") => `stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" ${ex}`;
  const R = (x, y, w, h, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${c}" ${ex}/>`;
  const RR = (x, y, w, h, r, c, ex = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" fill="${c}" ${ex}/>`;
  const E = (x, y, rx, ry, c, ex = "") => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${c}" ${ex}/>`;
  const L = (x1, y1, x2, y2, c, w, ex = "") => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}" ${ex}/>`;

  // ---------- ท่าแขนเพิ่ม (องศา: [ต้นแขน, ศอก]) ----------
  Object.assign(RK.FLAT_ARM, {
    explain: { n: [38, 72], f: [6, 16] }, open2: { n: [32, 66], f: [32, 66] }, surprise: { n: [150, 40], f: [140, 50] },
    hugopen: { n: [84, 6], f: [84, 6] }, hug: { n: [86, 125], f: [86, 125] }, offer: { n: [78, 108], f: [6, 16] },
    scoop: { n: [58, 26], f: [12, 34] }, mouth: { n: [42, 152], f: [12, 34] }, phone: { n: [16, 104], f: [14, 98] },
    rubhead: { n: [168, 100], f: [24, 28] }, belly: { n: [-4, 98], f: [-2, 92] }, fall: { n: [62, 12], f: [-36, 8] },
    floor: { n: [-26, 10], f: [-30, 12] }, rest: { n: [-6, 8], f: [-4, 10] },
  });
  RK.FLAT_OPEN = { explain: ["n"], open2: ["n", "f"], surprise: ["n", "f"], hugopen: ["n", "f"], fall: ["n", "f"], stretch: ["n", "f"], floor: ["n", "f"] };

  // ---------- ของในมือเพิ่ม ----------
  Object.assign(RK.FLAT_GRIP, {
    spoon: (hc, ha) => `<g transform="translate(${P(hc[0], hc[1])}) rotate(${f(-ha + 90)})">` + line([-6, 0], [-62, -4], 7, "#C9CED6") + E(-74, -4, 16, 10, "#D7DBE2") + E(-76, -7, 10, 5, "#FFFFFF", 'opacity=".9"') + `</g>`,
    phone: (hc, ha, C, far, view) => view === "front" ? `<g transform="translate(${P(hc[0], hc[1] - 18)})"><rect x="-20" y="-36" width="40" height="72" rx="8" fill="#22252E"/><rect x="-16" y="-30" width="32" height="60" rx="5" fill="#7FC0F2"/></g>`
      : `<g transform="translate(${P(hc[0] + 10, hc[1] - 26)}) rotate(-62)"><rect x="-10" y="-38" width="20" height="76" rx="6" fill="#22252E"/><rect x="2" y="-32" width="5" height="64" rx="2" fill="#8FD0FF"/></g><ellipse cx="${f(hc[0] + 30)}" cy="${f(hc[1] - 60)}" rx="60" ry="40" fill="#9FD8FF" opacity=".12"/>`,
  });

  // ---------- ของประกอบรอบตัวละคร (พิกัดตัวละคร) ----------
  function chairSide() {
    const w = "#9C6B43", d = sh(w, -0.22), seat = -232;
    return L(-162, seat, -160, 6, d, 16, 'stroke-linecap="round"') + L(4, seat, 8, 6, d, 16, 'stroke-linecap="round"') + L(-150, -40, -4, -40, d, 9) +
      RR(-182, seat - 6, 200, 26, 8, w) + RR(-176, seat - 20, 186, 18, 8, "#C8553D") + path(`M -170,${seat - 18} L 4,${seat - 18}`, "none", st("#E07A5F", 3, 0.7)) +
      L(-176, seat, -186, -590, w, 18, 'stroke-linecap="round"') + [-560, -480, -400].map((y) => L(-188, y, -172, y + 10, d, 10, 'stroke-linecap="round"')).join("") +
      path(`M -170,${seat - 4} L 10,${seat - 4}`, "none", st("#FFFFFF", 2, 0.25));
  }
  function tableSide(A, t) {
    const w = "#B07B54", d = sh(w, -0.25), top = -372;
    let s = L(150, top, 150, 6, d, 18, 'stroke-linecap="round"') + L(450, top, 450, 6, d, 18, 'stroke-linecap="round"') + L(150, -70, 450, -70, d, 9);
    s += RR(110, top - 6, 380, 30, 8, w) + path(`M 110,${top + 14} L 490,${top + 14}`, "none", st(d, 4));
    s += path(`M 116,${top - 4} L 300,${top - 4} L 286,${top + 70} L 130,${top + 70} Z`, "#F6F1E6") + [0, 1, 2, 3, 4].map((i) => L(140 + i * 32, top - 2, 136 + i * 30, top + 66, "#E46F5B", 3, 'opacity=".55"')).join("");
    // ชามข้าว + ไอ
    s += path(`M 150,${top - 4} C 152,${top - 52} 252,${top - 52} 254,${top - 4} Z`, "#F7F3EA") + path(`M 160,${top - 40} L 244,${top - 40}`, "none", st("#5E8FB0", 4)) + E(202, top - 46, 50, 14, "#FFFDF6") + E(186, top - 52, 14, 8, "#F2C14E") + E(222, top - 50, 10, 6, "#7FB069");
    for (let k = 0; k < 3; k++) { const ph = (t * 0.5 + k / 3) % 1; s += E(190 + k * 16 + Math.sin(t * 2 + k) * 8, top - 70 - ph * 120, 12 + ph * 20, 18 + ph * 20, "#FFFFFF", `opacity="${f((1 - ph) * ph * 1.1)}" filter="url(#fBlur8)"`); }
    if (A.prop !== "mug") s += `<g transform="translate(340,${top - 30})">${RK.FLAT_PROPS.mug("#F7F3EA", false)}</g>`;
    if (A.prop !== "phone") s += `<rect x="392" y="${top - 12}" width="76" height="12" rx="5" fill="#22252E"/>`;
    s += path(`M 470,${top - 4} L 476,${top - 60} L 462,${top - 60} Z`, "#9FC4CF") + circ(469, top - 74, 12, "#E46F5B") + circ(458, top - 84, 9, "#F2C14E");
    return s;
  }
  function blanket(A) {
    const H = A._H || [0, -448], k = RK.clamp(-(A.torsoRot || 0) / 90), x0 = H[0] - 40 - 250 * k, x1 = H[0] + 470, top = H[1] - 54, bot = H[1] + 64;
    let s = path(`M ${f(x0)},${f(bot)} L ${f(x0)},${f(top + 20)} C ${f(x0 + 60)},${f(top - 6)} ${f(x0 + 160)},${f(top + 10)} ${f(H[0] + 60)},${f(top)} C ${f(H[0] + 200)},${f(top - 10)} ${f(H[0] + 360)},${f(top + 6)} ${f(x1)},${f(top + 2)} L ${f(x1 + 30)},${f(bot + 40)} L ${f(x0 - 10)},${f(bot + 40)} Z`, "#F2C14E");
    for (let i = 1; i < 7; i++) { const x = x0 + (x1 - x0) * i / 7; s += path(`M ${f(x)},${f(top + 10)} L ${f(x + 6)},${f(bot + 36)}`, "none", st("#D9A441", 3, 0.7)); }
    s += path(`M ${f(x0 + 10)},${f(top + 60)} C ${f(x0 + 200)},${f(top + 50)} ${f(x1 - 100)},${f(top + 66)} ${f(x1)},${f(top + 60)}`, "none", st("#D9A441", 3, 0.6));
    s += path(`M ${f(x0)},${f(top + 20)} C ${f(x0 + 60)},${f(top - 6)} ${f(x0 + 160)},${f(top + 10)} ${f(H[0] + 60)},${f(top)} L ${f(H[0] + 60)},${f(top + 22)} C ${f(x0 + 160)},${f(top + 30)} ${f(x0 + 60)},${f(top + 14)} ${f(x0)},${f(top + 40)} Z`, "#FFFDF6", `opacity="${f(0.4 + 0.6 * k)}"`);
    return s;
  }
  function banana(x) {
    return `<g transform="translate(${f(x)},0)">` + path(`M -30,6 C -20,-14 10,-16 26,4 C 14,-4 0,-4 -6,6 Z`, "#F2C94C") + path(`M -6,6 C -20,-2 -40,4 -54,0 C -40,-8 -20,-8 -6,0 Z`, "#E9B93A") + path(`M 26,4 C 36,-4 50,-2 58,4 C 46,6 36,8 26,4 Z`, "#E9B93A") + circ(-30, 4, 4, "#6B4A2B") + `</g>`;
  }
  RK.flatActorPre = function (C, A) {
    let s = "";
    if (A.chair && A.view !== "front") s += chairSide();
    if (A.banana != null) s += banana(A.banana);
    return s;
  };
  RK.flatActorPost = function (C, A, t) {
    let s = "";
    const hd = A._head || [0, -870];
    if (A.table && A.view !== "front") s += tableSide(A, t);
    if ((A.blanket || 0) > 0) s += blanket(A);
    const flip = (A.dir || 1) < 0 ? -1 : 1;
    const txt = (x, y, str, size, col, op, rot = 0) => `<g transform="translate(${f(x)},${f(y)}) scale(${flip},1) rotate(${rot})"><text text-anchor="middle" font-family="Kanit" font-weight="900" font-size="${size}" fill="${col}" stroke="#2B2230" stroke-width="5" paint-order="stroke" opacity="${f(op)}">${str}</text></g>`;
    if ((A.zzz || 0) > 0) for (let i = 0; i < 3; i++) { const ph = (t * 0.45 + i / 3) % 1; s += txt(hd[0] + 60 + ph * 120, hd[1] - 80 - ph * 220, "z", 46 + ph * 40, "#BFD7FF", A.zzz * Math.sin(Math.PI * ph)); }
    if ((A.dizzy || 0) > 0) for (let i = 0; i < 4; i++) { const a = t * 5 + i * Math.PI / 2, x = hd[0] + Math.cos(a) * 110, y = hd[1] - 120 + Math.sin(a) * 26; s += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(t * 300 + i * 40)})" opacity="${f(A.dizzy)}">` + path("M 0,-22 L 6,-7 L 22,-7 L 9,3 L 14,19 L 0,9 L -14,19 L -9,3 L -22,-7 L -6,-7 Z", "#F2C14E", 'stroke="#2B2230" stroke-width="3"') + `</g>`; }
    if ((A.exclaim || 0) > 0) { const k = A.exclaim, q = 0.6 + 0.4 * k; s += `<g transform="translate(${f(hd[0] + 40)},${f(hd[1] - 190 - 20 * k)}) scale(${f(q)}) rotate(8)" opacity="${f(k)}">` + path("M -16,-70 L 16,-70 L 9,20 L -9,20 Z", "#E4572E", 'stroke="#2B2230" stroke-width="6" stroke-linejoin="round"') + circ(0, 46, 15, "#E4572E", 'stroke="#2B2230" stroke-width="6"') + `</g>`; s += [0, 1, 2].map((i) => path(`M ${f(hd[0] - 90 - i * 10)},${f(hd[1] - 100 + i * 50)} l -40,${-20 + i * 20}`, "none", st("#2B2230", 6, k))).join(""); }
    if ((A.hearts || 0) > 0) for (let i = 0; i < 4; i++) { const ph = (t * 0.6 + i / 4) % 1, x = hd[0] + (i - 1.5) * 70 + Math.sin(t * 3 + i) * 14, y = hd[1] - 120 - ph * 220; s += `<g transform="translate(${f(x)},${f(y)}) scale(${f(0.8 + ph * 0.6)})" opacity="${f(A.hearts * Math.sin(Math.PI * ph))}">` + path("M 0,18 C -30,-2 -26,-24 -12,-26 C -4,-27 0,-20 0,-16 C 0,-20 4,-27 12,-26 C 26,-24 30,-2 0,18 Z", "#F2668B", 'stroke="#2B2230" stroke-width="3"') + `</g>`; }
    if ((A.sweat || 0) > 0) s += `<g transform="translate(${f(hd[0] + flip * 70)},${f(hd[1] - 60 + (t * 60) % 40)})" opacity="${f(A.sweat)}">` + path("M 0,-20 C 10,-4 14,6 0,14 C -14,6 -10,-4 0,-20 Z", "#9FD8FF", 'stroke="#2B2230" stroke-width="3"') + `</g>`;
    return s;
  };

  // =====================================================================
  // ฉากห้องนอนยามเช้า (แสงจากหน้าต่างขวา)
  // =====================================================================
  const WALL_Y = -40, WIN = { x: 420, y: -1380, w: 520, h: 600 };
  const defs = `<linearGradient id="bWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D7D2EA"/><stop offset="1" stop-color="#ECE6F2"/></linearGradient>
  <linearGradient id="bSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC8EA"/><stop offset=".6" stop-color="#FAD9B8"/><stop offset="1" stop-color="#FFC08A"/></linearGradient>
  <linearGradient id="bFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9805C"/><stop offset="1" stop-color="#7E5A3E"/></linearGradient>
  <linearGradient id="bBeam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3CF" stop-opacity=".6"/><stop offset=".6" stop-color="#FFE6B0" stop-opacity=".16"/><stop offset="1" stop-color="#FFE6B0" stop-opacity="0"/></linearGradient>
  <radialGradient id="bLamp"><stop offset="0" stop-color="#FFE3A3" stop-opacity=".8"/><stop offset="1" stop-color="#FFC56B" stop-opacity="0"/></radialGradient>
  <clipPath id="bWinClip"><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}"/></clipPath>`;
  RK.flatDefs += defs;

  function wall(t, o) {
    let s = R(-1600, -2200, 3200, 2200 + WALL_Y, "url(#bWall)");
    for (let x = -1600; x < 1600; x += 140) s += L(x, -2200, x, -560, "#CFC8E2", 2, 'opacity=".45"');
    s += R(-1600, -560, 3200, 520, "#F3EDE3") + R(-1600, -566, 3200, 16, "#E2D8C8");
    for (let x = -1560; x < 1600; x += 260) s += RR(x, -510, 220, 420, 8, "none", 'stroke="#E2D8C8" stroke-width="5"');
    s += R(-1600, -1720, 3200, 34, "#C9C0DD");
    // หน้าต่าง + วิว
    s += `<g clip-path="url(#bWinClip)">` + R(WIN.x - 100, WIN.y - 100, WIN.w + 200, WIN.h + 200, "url(#bSky)") + circ(WIN.x + 140, WIN.y + 360, 200, "url(#kSun)") + circ(WIN.x + 140, WIN.y + 360, 44, "#FFF8E2") +
      [0, 1, 2].map((i) => { const x = WIN.x + 80 + i * 170 + t * 5, y = WIN.y + 90 + i * 40; return E(x, y, 70, 22, "#FFF4E6", 'opacity=".85"') + E(x + 50, y + 6, 46, 18, "#FFEBD6", 'opacity=".8"'); }).join("") +
      path(`M ${WIN.x - 50},${WIN.y + 470} C ${WIN.x + 100},${WIN.y + 420} ${WIN.x + 300},${WIN.y + 450} ${WIN.x + 600},${WIN.y + 430} L ${WIN.x + 600},${WIN.y + 700} L ${WIN.x - 50},${WIN.y + 700} Z`, "#B9A3B2") +
      [0, 1, 2, 3, 4, 5].map((i) => E(WIN.x + 20 + i * 100, WIN.y + 500 + (i % 2) * 20, 70, 80, i % 2 ? "#7FA088" : "#6E917B")).join("") +
      path(`M ${WIN.x + 260},${WIN.y + 520} L ${WIN.x + 360},${WIN.y + 450} L ${WIN.x + 460},${WIN.y + 520} Z`, "#B35D4C") + R(WIN.x + 280, WIN.y + 520, 160, 90, "#EAD3B5") + R(WIN.x + 340, WIN.y + 550, 40, 60, "#8B6744") + `</g>`;
    s += `<rect x="${WIN.x - 24}" y="${WIN.y - 24}" width="${WIN.w + 48}" height="${WIN.h + 48}" fill="none" stroke="#F7F3EC" stroke-width="36"/>` + R(WIN.x + WIN.w / 2 - 8, WIN.y, 16, WIN.h, "#F7F3EC") + R(WIN.x, WIN.y + WIN.h * 0.42, WIN.w, 16, "#F7F3EC") + R(WIN.x - 50, WIN.y + WIN.h + 12, WIN.w + 100, 24, "#E6DCCB");
    // ผ้าม่านโปร่ง + ม่านทึบ
    const sw = Math.sin(t * 1.1) * 8;
    s += path(`M ${WIN.x - 20},${WIN.y - 70} L ${WIN.x + 160},${WIN.y - 70} C ${WIN.x + 140 + sw},${WIN.y + 200} ${WIN.x + 150 + sw},${WIN.y + 400} ${WIN.x + 170 + sw},${WIN.y + WIN.h + 40} L ${WIN.x - 20},${WIN.y + WIN.h + 40} Z`, "#FFFFFF", 'opacity=".45"');
    for (const sd of [-1, 1]) { const x0 = sd < 0 ? WIN.x - 70 : WIN.x + WIN.w + 70; s += path(`M ${x0},${WIN.y - 90} L ${x0 + sd * -150},${WIN.y - 90} C ${x0 + sd * -110 + sw},${WIN.y + 160} ${x0 + sd * -60 + sw},${WIN.y + 300} ${x0 + sd * -80 + sw},${WIN.y + 360} C ${x0 + sd * -110 + sw},${WIN.y + 480} ${x0 + sd * -140 + sw},${WIN.y + 600} ${x0 + sd * -150 + sw},${WIN.y + 700} L ${x0},${WIN.y + 700} Z`, "#E3B062") + L(x0 + sd * -40, WIN.y - 80, x0 + sd * -36 + sw * 0.5, WIN.y + 690, "#C9963F", 6, 'opacity=".7"') + RR(x0 + sd * -75 - 26 + sw, WIN.y + 350, 52, 18, 9, "#8B6744"); }
    s += RR(WIN.x - 130, WIN.y - 108, WIN.w + 260, 16, 8, "#7C5A3E");
    // ไฟสตริงพาดผนัง
    let d = "M -1300,-1560"; for (let i = 1; i <= 12; i++) d += ` Q ${-1300 + i * 110 - 55},-1490 ${-1300 + i * 110},-1560`;
    s += path(d, "none", st("#5A4A52", 3));
    for (let i = 0; i < 12; i++) { const x = -1300 + i * 110 + 55, y = -1528, g = 0.7 + 0.3 * Math.sin(t * 2 + i); s += E(x, y + 22, 34, 34, "#FFD98A", `opacity="${f(0.25 * g)}" filter="url(#fBlur8)"`) + RR(x - 7, y, 14, 10, 3, "#5A4A52") + E(x, y + 20, 9, 13, ["#FFE08A", "#FFB8A0", "#B8E0FF"][i % 3]); }
    // ภาพติดผนังเหนือเตียง
    s += RR(-560, -1330, 420, 300, 8, "#7C5A3E") + R(-544, -1314, 388, 268, "#F6E6C8") + path(`M -544,-1080 L -440,-1220 L -360,-1140 L -290,-1240 L -156,-1080 Z`, "#7FA088") + circ(-230, -1240, 30, "#F2A33A") + path(`M -544,-1080 L -156,-1080 L -156,-1046 L -544,-1046 Z`, "#6E917B");
    s += RR(-90, -1260, 170, 210, 6, "#5E8FB0") + R(-76, -1246, 142, 182, "#FFFDF6") + circ(-5, -1170, 36, "#E46F5B") + path(`M -50,-1100 L 40,-1100`, "none", st("#2B2F3A", 6));
    // ชั้นวางของ
    s += R(-1250, -1100, 420, 18, "#9C7651") + RR(-1230, -1180, 60, 80, 8, "#E46F5B") + RR(-1160, -1160, 40, 60, 6, "#F2C14E") + path(`M -1090,-1100 L -1050,-1200 L -1010,-1100 Z`, "#D9A441") + circ(-1050, -1210, 16, "#D9A441") + RR(-990, -1150, 90, 50, 10, "#5E8FB0") + circ(-970, -1100, 12, "#2B2F3A") + circ(-920, -1100, 12, "#2B2F3A");
    // ตู้เสื้อผ้า
    s += RR(1060, -1500, 520, 1460, 14, "#C9A27A") + L(1320, -1480, 1320, -60, "#A8835E", 5) + RR(1290, -820, 14, 120, 6, "#7C5A3E") + RR(1338, -820, 14, 120, 6, "#7C5A3E") + R(1060, -300, 520, 12, "#A8835E");
    // พื้น + พรม
    s += R(-1600, WALL_Y, 3200, 1600, "url(#bFloor)");
    for (let y = WALL_Y + 34, k = 0; y < 1500; y += 50 + k * 4, k++) s += L(-1600, y, 1600, y, "#6E4E35", 3, 'opacity=".5"');
    s += E(80, 220, 760, 120, "#9BB8D8", 'opacity=".95"') + E(80, 220, 700, 98, "none", 'stroke="#FFFFFF" stroke-width="6" stroke-dasharray="20 14" opacity=".7"');
    // โต๊ะข้างเตียง + โคมไฟ + นาฬิกาปลุก
    s += RR(-980, -420, 230, 380, 10, "#B07B54") + R(-962, -380, 194, 140, "#C48C62") + R(-962, -220, 194, 140, "#C48C62") + RR(-890, -320, 50, 12, 6, "#7C5A3E") + RR(-890, -160, 50, 12, 6, "#7C5A3E");
    s += E(-920, -620, 220, 200, "url(#bLamp)") + RR(-930, -470, 20, 50, 4, "#E6DCCB") + E(-920, -420, 40, 10, "#C9A27A") + path(`M -990,-470 L -850,-470 L -880,-580 L -960,-580 Z`, "#F7E1B5") + E(-920, -470, 70, 8, "#FFE9B0");
    const al = o.alarm && t >= o.alarm[0] && t <= o.alarm[1], wob = al ? Math.sin(t * 60) * 7 : 0;
    s += `<g transform="translate(-815,-420) rotate(${f(wob)})">` + circ(0, -40, 36, "#E4572E") + circ(0, -40, 27, "#FFFDF6") + L(0, -40, 0, -58, "#2B2230", 4) + L(0, -40, 14, -40, "#2B2230", 4) + circ(-24, -78, 13, "#F2C14E") + circ(24, -78, 13, "#F2C14E") + L(-20, -6, -28, 4, "#2B2230", 5) + L(20, -6, 28, 4, "#2B2230", 5) + `</g>`;
    if (al) s += [1, 2, 3].map((i) => path(`M ${-815 - 50 - i * 16},${-490 + i * 4} q ${-12},30 0,60 M ${-815 + 50 + i * 16},${-490 + i * 4} q 12,30 0,60`, "none", st("#E4572E", 5, 0.9 - i * 0.2))).join("");
    s += RR(-990, -440, 120, 18, 4, "#5E8FB0") + RR(-984, -458, 108, 18, 4, "#E46F5B");
    // เตียง
    s += RR(-700, -760, 90, 760, 30, "#8E6FA8") + [-700, -620, -540].map((y) => circ(-655, y, 7, "#6E5288")).join("") + RR(-712, -790, 114, 60, 30, "#7E609A");
    s += R(-620, -210, 1260, 90, "#B07B54") + R(-620, -210, 1260, 16, "#C48C62") + R(-600, -120, 30, 150, "#8C5E3C") + R(590, -120, 30, 150, "#8C5E3C") + RR(600, -400, 60, 420, 20, "#9C6B43");
    s += RR(-610, -320, 1220, 116, 20, "#FFFFFF") + R(-610, -232, 1220, 24, "#DCE7F2");
    s += RR(-600, -400, 230, 90, 40, "#F7F3EA") + RR(-590, -440, 210, 76, 36, "#DCE7F2") + path(`M -560,-404 C -520,-416 -450,-416 -400,-404`, "none", st("#C8D4E2", 3));
    // รองเท้าแตะ ตะกร้าผ้า
    s += E(260, 70, 46, 14, "#F2668B") + E(330, 80, 46, 14, "#F2668B") + RR(760, -230, 150, 190, 18, "#D9C5A0") + path("M 770,-200 L 900,-200 M 770,-160 L 900,-160 M 770,-120 L 900,-120", "none", st("#B8A47E", 4)) + E(800, -238, 30, 16, "#7DC4E4") + E(860, -236, 28, 14, "#F2C14E");
    // ต้นไม้ใหญ่มุมห้อง
    s += path("M -1380,-40 L -1240,-40 L -1260,-200 L -1360,-200 Z", "#E9E2D6");
    for (let k = 0; k < 9; k++) { const a = -70 + k * 18 + Math.sin(t + k) * 3; s += `<ellipse cx="0" cy="-150" rx="34" ry="150" fill="${k % 2 ? "#4F8A55" : "#68A866"}" transform="translate(-1310,-200) rotate(${f(a)})"/>`; }
    return s;
  }
  function sunlight(t) {
    let s = `<g style="mix-blend-mode:screen">`;
    for (let i = 0; i < 3; i++) { const ox = i * 150; s += path(`M ${WIN.x + 420 - ox},${WIN.y} L ${WIN.x + 500 - ox},${WIN.y} L ${WIN.x - 900 - ox * 1.4},${WIN.y + 1700} L ${WIN.x - 1180 - ox * 1.4},${WIN.y + 1700} Z`, "url(#bBeam)", `opacity="${f(0.8 + 0.15 * Math.sin(t * 0.8 + i))}" filter="url(#fBlur20)"`); }
    const r = RK.rng(42);
    for (let i = 0; i < 40; i++) { const u = r(), v = r(), yy = WIN.y + 60 + ((v * 1400 + t * 25) % 1400), xx = WIN.x + 300 - u * 400 - (yy - WIN.y) * 0.75; s += circ(xx, yy, 2 + r() * 3, "#FFF6DA", `opacity="${f(0.3 + 0.5 * Math.abs(Math.sin(t * 1.2 + i)))}"`); }
    return s + `</g>`;
  }
  RK.flatSets.bedroom = { wall, lamps: () => "", island: () => "", foreground: () => "", sunlight, WALL_Y };
})(window);
