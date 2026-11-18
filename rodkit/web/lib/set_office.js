// ดูเพลิน ฉาก 1: ออฟฟิศ "สบายดี กรุ๊ป" — สไตล์ 2 (เส้นขอบบางสีเข้มของชิ้นนั้น เงาด้านเดียว แสงจากหน้าต่างซ้าย)
// พิกัดจอ (กล้อง zoom 1): ผนังหลัง y 150–1060 · พื้น y > 1060 · จุดรวมสายตา VP (540,700) · โลกกว้าง x -420..1500 ให้แพนได้
// env.time: "morning" | "noon" | "evening" · env.fg: วาดฉากหน้า (ขอบโต๊ะ/ใบไม้) ทับตัวละคร
// มุมกล้องที่แนะนำ (cam): กว้าง {} · กลาง {zoom:1.55, panX:-120, panY:-260} · โต๊ะฮีโร่ใกล้ {zoom:2.6, panX:-260, panY:-380}
(function (G) {
  const RK = G.RK, f = RK.f;
  const ink = (c) => RK.shade(c, -0.42), shd = (c) => RK.shade(c, -0.14), hil = (c) => RK.shade(c, 0.16);
  const OW = 3;
  const VP = [540, 700], WALL = 1060, CEIL = 150;
  const toVP = (p, k) => [p[0] + (VP[0] - p[0]) * k, p[1] + (VP[1] - p[1]) * k];
  const pt = (p) => `${f(p[0])},${f(p[1])}`;
  const poly = (ps, fill, o = {}) => `<path d="M${ps.map(pt).join(" L")}Z" fill="${fill}"${o.noStroke ? "" : ` stroke="${o.stroke || ink(fill)}" stroke-width="${o.w || OW}" stroke-linejoin="round"`}${o.op != null ? ` opacity="${o.op}"` : ""}/>`;
  const rect = (x, y, w, h, fill, o = {}) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"${o.rx ? ` rx="${o.rx}"` : ""} fill="${fill}"${o.noStroke ? "" : ` stroke="${o.stroke || ink(fill)}" stroke-width="${o.w || OW}"`}${o.op != null ? ` opacity="${o.op}"` : ""}/>`;
  const line = (d, c, w = 2, o = "") => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${o}/>`;
  // กล่อง 3 มิติแบบจุดเดียว: หน้า (x,y,w,h) + ด้านบน + ด้านข้างที่หันเข้าหา VP · k = ความลึก
  function box(x, y, w, h, k, fill, o = {}) {
    const tl = [x, y], tr = [x + w, y], bl = [x, y + h], br = [x + w, y + h];
    const tl2 = toVP(tl, k), tr2 = toVP(tr, k), bl2 = toVP(bl, k), br2 = toVP(br, k);
    let s = "";
    if (y + h > VP[1] && o.top !== false && y > VP[1]) s += poly([tl, tr, tr2, tl2], o.topC || hil(fill));
    else if (y > VP[1] && o.top !== false) s += poly([tl, tr, tr2, tl2], o.topC || hil(fill));
    if (x + w < VP[0]) s += poly([tr, br, br2, tr2], o.sideC || shd(fill));
    else if (x > VP[0]) s += poly([tl, bl, bl2, tl2], o.sideC || shd(fill));
    s += rect(x, y, w, h, fill, o);
    return s;
  }

  const TIMES = {
    morning: { sky: ["#BFE3F2", "#FCE3C4"], sun: "#FFE7B0", shaft: 0.22, tint: "#FFE2B8", tintA: 0.06, lamps: 0.35, clock: [7, 0], cityLights: 0 },
    noon:    { sky: ["#7EC3EC", "#CDEBF8"], sun: "#FFF6DA", shaft: 0.14, tint: "#FFFFFF", tintA: 0, lamps: 0.25, clock: [11, 45], cityLights: 0 },
    evening: { sky: ["#5B5DA8", "#F59B6B"], sun: "#FFB36B", shaft: 0.28, tint: "#FF9E5E", tintA: 0.1, lamps: 1, clock: [17, 45], cityLights: 1 },
  };

  // ---------- ชิ้นส่วนฉาก ----------
  function ceiling(T) {
    let s = poly([[-500, -400], [1600, -400], [1600, CEIL], [-500, CEIL]], "#ECE8E0", { noStroke: true });
    for (let x = -500; x <= 1600; x += 170) s += line(`M${x},${CEIL} L${f(toVP([x, CEIL], -1.6)[0])},-400`, "#D6D0C4", 2);
    for (const y of [100, 40, -40, -150, -300]) s += line(`M-500,${y} L1600,${y}`, "#D6D0C4", 2);
    // ไฟเพดาน LED แผง
    for (const [x, y, w] of [[90, 92, 200], [430, 92, 200], [770, 92, 200], [40, 10, 260], [400, 10, 260], [770, 10, 260]]) {
      const on = T.lamps;
      s += poly([[x, y], [x + w, y], [x + w + (y < 50 ? 18 : 10), y + (y < 50 ? 36 : 26)], [x - (y < 50 ? 18 : 10), y + (y < 50 ? 36 : 26)]], on > 0.5 ? "#FFF9E6" : "#F4F3EE", { stroke: "#BDB6A8", w: 2.4 });
      const yb = y + (y < 50 ? 36 : 26); for (let gi = 1; gi < 4; gi++) s += line(`M${f(x + (w * gi) / 4)},${y + 2} L${f(x + (w * gi) / 4 + (gi - 2) * 4)},${yb - 2}`, "#D9D2C2", 1.4);
      s += line(`M${x - 4},${f((y + yb) / 2)} L${x + w + 4},${f((y + yb) / 2)}`, "#D9D2C2", 1.4);
      if (on > 0.2) s += `<ellipse cx="${x + w / 2}" cy="${y + 40}" rx="${w * 0.7}" ry="40" fill="#FFF3C8" opacity="${f(on * 0.35)}"/>`;
    }
    // ช่องแอร์ + หัวสปริงเกอร์
    s += rect(620, 40, 70, 40, "#E2DED5", { stroke: "#B9B2A4", w: 2 }) + [48, 56, 64, 72].map((y) => line(`M626,${y} L684,${y}`, "#B9B2A4", 2)).join("");
    s += `<circle cx="300" cy="120" r="5" fill="#C9C2B4" stroke="#9C9486" stroke-width="1.6"/><circle cx="820" cy="128" r="5" fill="#C9C2B4" stroke="#9C9486" stroke-width="1.6"/>`;
    s += line(`M-500,${CEIL} L1600,${CEIL}`, "#C9C2B4", 4);
    return s;
  }

  function backWall(T, t) {
    const W1 = "#F1E9DA";
    let s = rect(-500, CEIL, 2100, WALL - CEIL, W1, { noStroke: true });
    // ผนังส่วนล่างทาสีเข้มขึ้น + บัวกันกระแทก
    s += rect(-500, 830, 2100, WALL - 830, "#D9CDB6", { noStroke: true }) + rect(-500, 822, 2100, 12, "#BFA98A", { stroke: "#9C8869", w: 2 });
    s += rect(-500, WALL - 22, 2100, 22, "#8E7A63", { stroke: "#6B5A47", w: 2 });
    // ลายผนังจาง ๆ
    for (let x = -480; x < 1600; x += 60) s += line(`M${x},${CEIL + 10} L${x},815`, "#E8DECB", 2);
    return s;
  }

  function windows(T, t) {
    const x0 = 30, y0 = 250, w = 560, h = 520;
    let s = `<defs><linearGradient id="ofSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.sky[0]}"/><stop offset="1" stop-color="${T.sky[1]}"/></linearGradient><clipPath id="ofWin"><rect x="${x0}" y="${y0}" width="${w}" height="${h}"/></clipPath></defs>`;
    s += rect(x0 - 18, y0 - 18, w + 36, h + 36, "#DCD4C4", { stroke: "#A89E8C" });
    s += `<g clip-path="url(#ofWin)"><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="url(#ofSky)"/>`;
    if (T === TIMES.evening) s += `<circle cx="${x0 + 120}" cy="${y0 + 400}" r="60" fill="#FFD08A" opacity=".9"/>`;
    else s += `<circle cx="${x0 + 450}" cy="${y0 + (T === TIMES.morning ? 300 : 80)}" r="38" fill="#FFF8D8" opacity=".9"/>`;
    // เมฆ
    const cl = (cx, cy, k) => `<g transform="translate(${cx + ((t * 6) % 80)},${cy}) scale(${k})"><path d="M-60,0 Q-60,-26 -34,-28 Q-24,-52 4,-46 Q24,-62 44,-40 Q70,-40 68,-12 Q74,4 56,6 L-50,6 Q-64,4 -60,0Z" fill="#FFFFFF" opacity=".85"/></g>`;
    s += cl(x0 + 110, y0 + 90, 1) + cl(x0 + 380, y0 + 150, 0.7);
    // ตึกไกล (สีจาง) → ตึกใกล้ (เข้ม)
    const r = RK.rng(77);
    const far = T === TIMES.evening ? "#6E6A9E" : "#A9C3D6", near = T === TIMES.evening ? "#4A4878" : "#7FA0B8";
    for (let i = 0, x = x0 - 10; x < x0 + w; i++) { const bw = 40 + r() * 50, bh = 120 + r() * 200; s += rect(x, y0 + h - bh, bw, bh, far, { noStroke: true }); x += bw + 4; }
    for (let i = 0, x = x0 - 20; x < x0 + w; i++) {
      const bw = 60 + r() * 70, bh = 80 + r() * 180, by = y0 + h - bh;
      s += rect(x, by, bw, bh, near, { stroke: ink(near), w: 2 });
      for (let wy = by + 14; wy < y0 + h - 10; wy += 22) for (let wx = x + 8; wx < x + bw - 10; wx += 16) {
        const lit = T.cityLights && r() > 0.45;
        s += `<rect x="${f(wx)}" y="${f(wy)}" width="9" height="12" fill="${lit ? "#FFD98A" : RK.shade(near, 0.18)}"/>`;
      }
      if (r() > 0.6) s += rect(x + bw * 0.4, by - 30, 6, 30, near, { noStroke: true });
      x += bw + 6;
    }
    s += `</g>`;
    // กรอบหน้าต่าง 3 บาน + บานเลื่อน
    for (const mx of [x0 + w / 3, x0 + (2 * w) / 3]) s += rect(mx - 7, y0, 14, h, "#E8E2D6", { stroke: "#A89E8C", w: 2 });
    s += rect(x0, y0 + h * 0.62, w, 12, "#E8E2D6", { stroke: "#A89E8C", w: 2 });
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="#A89E8C" stroke-width="3"/>`;
    // แสงสะท้อนกระจก
    s += `<path d="M${x0 + 30},${y0 + h} L${x0 + 110},${y0} L${x0 + 140},${y0} L${x0 + 60},${y0 + h}Z M${x0 + 220},${y0 + h} L${x0 + 300},${y0} L${x0 + 316},${y0} L${x0 + 236},${y0 + h}Z" fill="#FFFFFF" opacity=".16"/>`;
    // มู่ลี่ ดึงลงมา 1/3 (เชือกดึงด้านขวา)
    const bl = y0 + h * 0.3;
    s += rect(x0 - 10, y0 - 12, w + 20, 18, "#F4F1EA", { stroke: "#B5AC9B", w: 2 });
    for (let y = y0 + 8; y < bl; y += 14) s += rect(x0, y, w, 10, "#F7F4EE", { stroke: "#CFC7B8", w: 1.4 });
    s += rect(x0, bl, w, 12, "#E9E4DA", { stroke: "#B5AC9B", w: 2 }) + line(`M${x0 + w - 16},${y0} L${x0 + w - 16},${bl + 140}`, "#B5AC9B", 2) + `<circle cx="${x0 + w - 16}" cy="${bl + 146}" r="6" fill="#E9E4DA" stroke="#B5AC9B" stroke-width="2"/>`;
    // ขอบหน้าต่าง + ของบนขอบ: กระบองเพชร แก้วปากกา กองแฟ้ม
    s += box(x0 - 30, y0 + h + 18, w + 60, 16, 0.03, "#E2DACB");
    s += pot(x0 + 70, y0 + h + 18, 0.8, "cactus") + pot(x0 + 470, y0 + h + 18, 0.75, "succulent");
    s += rect(x0 + 200, y0 + h - 22, 90, 40, "#3E7CB1", { rx: 3 }) + rect(x0 + 206, y0 + h - 50, 80, 30, "#E7B24A", { rx: 3 }) + line(`M${x0 + 220},${y0 + h - 4} L${x0 + 270},${y0 + h - 4}`, "#FFFFFF", 3);
    return s;
  }

  function pot(x, y, k, kind, noPot = false) {
    let s = "";
    if (kind === "cactus") s += `<path d="M-6,-40 Q-8,-90 6,-96 Q18,-90 18,-40Z" fill="#5FA05A" stroke="#3B6E38" stroke-width="3"/><path d="M14,-62 Q30,-64 30,-80" fill="none" stroke="#3B6E38" stroke-width="10" stroke-linecap="round"/><path d="M14,-62 Q30,-64 30,-80" fill="none" stroke="#5FA05A" stroke-width="6" stroke-linecap="round"/><path d="M0,-80 l-4,-2 M8,-60 l4,-2 M2,-50 l-4,0" stroke="#E6F2D0" stroke-width="2"/><circle cx="6" cy="-98" r="5" fill="#F27E9A"/>`;
    else if (kind === "succulent") s += [[-20, -40, -30], [0, -50, 0], [20, -40, 30], [-10, -46, -14], [10, -46, 14]].map(([dx, dy, a]) => `<ellipse cx="${dx}" cy="${dy}" rx="9" ry="20" fill="#7DBB86" stroke="#4A7E52" stroke-width="2.6" transform="rotate(${a} ${dx} ${dy})"/>`).join("");
    else if (kind === "snake") s += [[-26, -150, -10], [-8, -190, -3], [10, -170, 6], [26, -130, 14], [-14, -120, -18]].map(([dx, h, a]) => `<path d="M${dx - 8},-40 Q${dx - 14},${-40 + h * 0.5} ${dx},${-40 + h} Q${dx + 12},${-40 + h * 0.5} ${dx + 8},-40Z" fill="#4E8C55" stroke="#2F5E36" stroke-width="3" transform="rotate(${a} ${dx} -40)"/><path d="M${dx},-50 L${dx},${-40 + h * 0.8}" stroke="#C9D98A" stroke-width="2" opacity=".7" transform="rotate(${a} ${dx} -40)"/>`).join("");
    else if (kind === "monstera") s += [[-50, -110, -40], [40, -130, 30], [-10, -170, -5], [60, -70, 60], [-60, -60, -70]].map(([dx, dy, a]) => `<g transform="translate(${dx},${dy}) rotate(${a})"><path d="M0,40 L0,-34" stroke="#2F5E36" stroke-width="4"/><path d="M0,-50 Q40,-40 38,0 Q30,34 0,40 Q-30,34 -38,0 Q-40,-40 0,-50Z" fill="#3E8A4E" stroke="#245A30" stroke-width="3"/><path d="M0,-44 L0,36 M0,-20 L26,-26 M0,0 L32,-2 M0,20 L24,24 M0,-20 L-26,-26 M0,0 L-32,-2 M0,20 L-24,24" stroke="#245A30" stroke-width="2.4"/></g>`).join("") + `<path d="M0,-40 Q-30,-80 -50,-110 M0,-40 Q20,-90 40,-130 M0,-40 Q-6,-110 -10,-170" fill="none" stroke="#2F5E36" stroke-width="4"/>`;
    const big = kind === "snake" || kind === "monstera", pc = big ? "#C9744A" : "#D98A5F";
    const q = noPot ? "" : `<path d="M-30,-44 L30,-44 L24,0 L-24,0Z" fill="${pc}" stroke="${ink(pc)}" stroke-width="3" stroke-linejoin="round"/><rect x="-34" y="-50" width="68" height="10" rx="3" fill="${hil(pc)}" stroke="${ink(pc)}" stroke-width="2.4"/><path d="M14,-40 L10,-2 L24,-2 L28,-40Z" fill="${shd(pc)}"/>`;
    return `<g transform="translate(${x},${y}) scale(${k})">${big ? `<g transform="scale(1.6,1.8)">${s}</g>` : s}${big && !noPot ? `<g transform="scale(1.5,1.4)">${q}</g>` : q}</g>`;
  }

  function wallItems(T, t) {
    let s = "";
    // แอร์ติดผนัง (เหนือหน้าต่าง)
    s += rect(150, 168, 270, 64, "#F7F6F2", { rx: 12, stroke: "#B9B3A6" }) + rect(162, 214, 246, 10, "#E1DED6", { rx: 4, stroke: "#B9B3A6", w: 1.6 }) + `<circle cx="396" cy="186" r="4" fill="${T.lamps > 0.5 ? "#6BD46B" : "#9AD49A"}"/>` + line("M180,190 L330,190", "#E1DED6", 3);
    // นาฬิกาผนัง (เข็มตามเวลา)
    const [hh, mm] = T.clock, cx = 650, cy = 300;
    s += `<circle cx="${cx}" cy="${cy}" r="48" fill="#FFFFFF" stroke="#3A3A40" stroke-width="7"/>` + Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return line(`M${f(cx + Math.sin(a) * 36)},${f(cy - Math.cos(a) * 36)} L${f(cx + Math.sin(a) * 41)},${f(cy - Math.cos(a) * 41)}`, "#3A3A40", i % 3 ? 2 : 4); }).join("");
    const ha = (((hh % 12) + mm / 60) * Math.PI) / 6, ma = (mm * Math.PI) / 30, sa = (t * 6 * Math.PI) / 30;
    s += line(`M${cx},${cy} L${f(cx + Math.sin(ha) * 22)},${f(cy - Math.cos(ha) * 22)}`, "#2A2A30", 5) + line(`M${cx},${cy} L${f(cx + Math.sin(ma) * 32)},${f(cy - Math.cos(ma) * 32)}`, "#2A2A30", 3.4) + line(`M${cx},${cy} L${f(cx + Math.sin(sa) * 34)},${f(cy - Math.cos(sa) * 34)}`, "#D8483B", 1.6) + `<circle cx="${cx}" cy="${cy}" r="4" fill="#D8483B"/>`;
    // บอร์ดไม้ก๊อก + กระดาษหมุด
    s += rect(612, 390, 100, 150, "#C49A6C", { stroke: "#7E5E3C" }) + rect(618, 396, 88, 138, "#D2A877", { noStroke: true });
    const notes = [[622, 404, 34, 40, "#FFF4A8", -4], [664, 400, 36, 30, "#FFFFFF", 3], [626, 452, 40, 46, "#BFE3FF", 2], [670, 438, 30, 36, "#FFC9D6", -6], [664, 482, 38, 44, "#FFFFFF", -2], [628, 506, 28, 22, "#C9F2C0", 5]];
    s += notes.map(([x, y, w, h, c, a]) => `<g transform="rotate(${a} ${x + w / 2} ${y})">${rect(x, y, w, h, c, { stroke: "#B9AE96", w: 1.4 })}${line(`M${x + 5},${y + 12} L${x + w - 6},${y + 12} M${x + 5},${y + 19} L${x + w - 9},${y + 19} M${x + 5},${y + 26} L${x + w - 12},${y + 26}`, "#8C8270", 1.3)}<circle cx="${x + w / 2}" cy="${y + 4}" r="3.4" fill="#D8483B"/></g>`).join("");
    // ปฏิทิน
    s += rect(640, 560, 48, 60, "#FFFFFF", { stroke: "#B9AE96", w: 2 }) + rect(640, 560, 48, 14, "#D8483B", { noStroke: true }) + Array.from({ length: 12 }, (_, i) => `<rect x="${644 + (i % 4) * 11}" y="${580 + Math.floor(i / 4) * 12}" width="7" height="7" fill="${i === 6 ? "#D8483B" : "#C9C2B4"}"/>`).join("");
    // ป้ายบริษัท (ซ้ายนอกจอ ใช้ตอนแพน)
    s += rect(-380, 210, 320, 80, "#2E6F72", { rx: 10 }) + `<text x="-220" y="262" text-anchor="middle" font-family="Kanit" font-weight="800" font-size="40" fill="#F7EBD3">สบายดี กรุ๊ป</text><circle cx="-350" cy="250" r="16" fill="#F2B33D"/>`;
    // ไวท์บอร์ด + กราฟ + โน้ต
    s += rect(-390, 330, 340, 230, "#FBFBF8", { stroke: "#9AA0A6", w: 5 }) + rect(-380, 556, 320, 10, "#C6CACD", { stroke: "#8A9096", w: 2 });
    s += line("M-360,520 L-300,480 L-250,500 L-190,430 L-130,450 L-80,380", "#2F7DC1", 4) + line("M-360,530 L-80,530 M-360,530 L-360,370", "#555", 2) + `<path d="M-90,372 l14,6 l-12,10" fill="none" stroke="#2F7DC1" stroke-width="4"/>`;
    s += `<text x="-360" y="365" font-family="Kanit" font-size="24" fill="#D8483B">ยอดขาย Q4 !!</text>` + rect(-150, 345, 46, 42, "#FFF4A8", { stroke: "#D8C76A", w: 1.4 }) + line("M-144,358 l30,0 M-144,368 l24,0", "#8C8270", 1.4);
    s += rect(-300, 560, 30, 8, "#D8483B", { rx: 3, w: 1.4 }) + rect(-260, 560, 30, 8, "#2F7DC1", { rx: 3, w: 1.4 }) + rect(-215, 558, 40, 12, "#555", { rx: 3, w: 1.4 });
    // ป้ายทางออก + ถังดับเพลิง + สวิตช์ไฟ + ปลั๊ก
    s += rect(960, 168, 120, 40, "#2E9E5B", { rx: 4 }) + `<text x="1020" y="196" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="22" fill="#fff">ทางออก</text><path d="M1072,188 l-10,-8 l0,16Z" fill="#fff"/>`;
    s += rect(704, 920, 34, 70, "#D23B32", { rx: 10 }) + rect(712, 906, 18, 16, "#2A2A2A", { w: 1.6 }) + line("M720,912 Q742,904 744,930", "#2A2A2A", 4) + rect(708, 950, 26, 18, "#F4F1EA", { w: 1.2 });
    s += rect(1290, 640, 28, 44, "#F7F6F2", { rx: 3, stroke: "#B9B3A6", w: 2 }) + rect(1298, 648, 12, 12, "#E1DED6", { w: 1 }) + rect(1298, 664, 12, 12, "#E1DED6", { w: 1 });
    for (const x of [120, 470, 880]) s += rect(x, 980, 30, 22, "#F7F6F2", { rx: 3, stroke: "#B9B3A6", w: 1.8 }) + `<circle cx="${x + 10}" cy="991" r="2.4" fill="#777"/><circle cx="${x + 20}" cy="991" r="2.4" fill="#777"/>`;
    return s;
  }

  function bossRoom(T, t) {
    const x0 = 760, x1 = 1480, y0 = 230, AL = "#C9CED3";
    let s = "";
    // ด้านใน: ผนังสีเข้มขึ้น ชั้นหนังสือ โต๊ะผู้บริหาร เก้าอี้หนัง ถ้วยรางวัล
    s += rect(x0, y0, x1 - x0, WALL - y0, "#E3D6BF", { noStroke: true });
    s += rect(1060, 300, 260, 300, "#8A5A3A", { stroke: "#5E3C26" });
    const r = RK.rng(5);
    for (const sy of [330, 420, 510]) { s += rect(1066, sy + 70, 248, 10, "#6E4630", { noStroke: true }); for (let bx = 1072; bx < 1300;) { const bw = 10 + r() * 14, bh = 40 + r() * 28, c = ["#3E6FB0", "#C8483B", "#E7B24A", "#4E8C55", "#7A5BA6", "#EEE4D0"][Math.floor(r() * 6)]; s += rect(bx, sy + 70 - bh, bw, bh, c, { w: 1.6 }); bx += bw + 2; if (r() > 0.85) bx += 20; } }
    s += `<path d="M1240,412 l12,0 l-2,14 l10,0 l0,8 l-28,0 l0,-8 l10,0Z" fill="#E8C14A" stroke="#9C7A1E" stroke-width="2"/><circle cx="1246" cy="402" r="11" fill="#E8C14A" stroke="#9C7A1E" stroke-width="2"/>`;
    s += rect(820, 380, 160, 110, "#3D3D44", { rx: 4 }) + rect(828, 388, 144, 94, "#7FB2D9", { noStroke: true }) + `<path d="M828,470 L870,430 L900,450 L940,410 L972,440 L972,482 L828,482Z" fill="#5E9A62"/>`; // กรอบรูปวิว
    s += pot(1380, 1000, 1.05, "monstera");
    // เก้าอี้หนังผู้บริหาร + โต๊ะไม้
    s += `<path d="M960,640 Q956,560 1010,550 L1090,550 Q1140,560 1136,640 L1130,760 L966,760Z" fill="#3A2A26" stroke="#1E1412" stroke-width="3"/><path d="M990,580 L990,740 M1048,570 L1048,740 M1106,580 L1106,740" stroke="#4E3A34" stroke-width="3"/>`;
    s += box(880, 740, 360, 160, 0.06, "#9B6A43") + rect(900, 760, 150, 120, "#8A5D3A", { w: 2 }) + rect(1070, 760, 150, 120, "#8A5D3A", { w: 2 }) + `<circle cx="1036" cy="820" r="5" fill="#E8C14A"/><circle cx="1084" cy="820" r="5" fill="#E8C14A"/>`;
    s += rect(940, 700, 80, 46, "#2B2B33", { rx: 3 }) + rect(946, 706, 68, 34, "#8FD0F0", { noStroke: true }) + rect(974, 744, 12, 10, "#2B2B33", { noStroke: true }); // จอ
    s += rect(1090, 722, 60, 22, "#E9E2D2", { rx: 3, w: 1.6 }) + `<text x="1120" y="739" text-anchor="middle" font-family="Kanit" font-size="14" font-weight="700" fill="#5E3C26">ผู้จัดการ</text>`;
    s += `<path d="M1170,724 l16,0 l-2,20 l-12,0Z" fill="#FFFFFF" stroke="#999" stroke-width="2"/><path d="M1172,722 q6,-14 0,-22 M1180,722 q6,-14 0,-22" fill="none" stroke="#ccc" stroke-width="2" opacity=".7"/>`;
    // ผนังกระจก + มู่ลี่ครึ่งบาน + ประตู
    s += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${WALL - y0}" fill="#BFE0EE" opacity=".22"/>`;
    for (const gx of [x0, 960, 1180, 1400]) s += rect(gx - 8, y0, 16, WALL - y0, AL, { stroke: "#8E959C", w: 2 });
    s += rect(x0, y0 - 14, x1 - x0, 20, AL, { stroke: "#8E959C", w: 2 }) + rect(x0, 640, x1 - x0, 14, AL, { stroke: "#8E959C", w: 2 });
    for (let y = y0 + 12; y < 380; y += 12) s += rect(968, y, 204, 8, "#F2F0EA", { stroke: "#CFC7B8", w: 1 });
    s += `<path d="M${x0 + 20},${WALL} L${x0 + 140},${y0} L${x0 + 170},${y0} L${x0 + 50},${WALL}Z M1200,${WALL} L1300,${y0} L1316,${y0} L1216,${WALL}Z" fill="#FFFFFF" opacity=".18"/>`;
    // ประตูกระจกบานซ้าย มือจับ + ป้าย
    s += rect(780, 250, 168, 806, "#BFE0EE", { stroke: "#8E959C", w: 3, op: 0.35 }) + rect(924, 560, 10, 110, "#8E959C", { rx: 4, w: 1.6 });
    s += rect(800, 470, 120, 38, "#FFFFFF", { rx: 4, stroke: "#8E959C", w: 2 }) + `<text x="860" y="496" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="20" fill="#3A3A40">ห้องผู้จัดการ</text>`;
    s += rect(816, 530, 88, 26, "#D8483B", { rx: 3, w: 1.6 }) + `<text x="860" y="549" text-anchor="middle" font-family="Kanit" font-size="15" fill="#fff">กรุณาเคาะก่อน</text>`;
    return s;
  }

  // ตู้เอกสาร + เครื่องปริ้น + ตู้น้ำ (หน้าผนัง)
  function services(T, t) {
    let s = "";
    s += box(-330, 760, 200, 300, 0.05, "#B9BDC2") + [790, 880, 970].map((y) => rect(-320, y, 180, 80, "#C9CDD2", { w: 2 }) + rect(-250, y + 12, 40, 10, "#8E959C", { rx: 3, w: 1.4 }) + rect(-246, y + 30, 32, 16, "#FFFFFF", { w: 1 })).join("");
    // เครื่องถ่ายเอกสารบนตู้
    s += box(-320, 650, 180, 110, 0.06, "#E6E6E2") + rect(-312, 640, 120, 14, "#3A3A40", { w: 2 }) + rect(-300, 676, 60, 26, "#2B2B33", { w: 2 }) + rect(-296, 680, 52, 18, "#7FD0A0", { noStroke: true }) + `<circle cx="-200" cy="690" r="6" fill="#4CAF50"/><circle cx="-180" cy="690" r="6" fill="#D8483B"/>` + rect(-310, 720, 160, 10, "#C9C9C4", { w: 1.6 });
    s += `<path d="M-300,742 L-200,742 L-196,756 L-304,756Z" fill="#FFFFFF" stroke="#bbb" stroke-width="1.4"/>`;
    // ตู้น้ำดื่ม + ถังคว่ำ + แก้วกระดาษ
    const wx = 520;
    s += box(wx, 830, 80, 230, 0.05, "#F2F2EE") + rect(wx + 10, 870, 60, 50, "#DCDCD6", { w: 2 }) + `<rect x="${wx + 20}" y="882" width="10" height="16" rx="2" fill="#3E7CB1"/><rect x="${wx + 46}" y="882" width="10" height="16" rx="2" fill="#D8483B"/>`;
    s += `<path d="M${wx + 8},830 Q${wx + 4},740 ${wx + 40},732 Q${wx + 76},740 ${wx + 72},830Z" fill="#9FD4F2" stroke="#4E95C2" stroke-width="3" opacity=".9"/><path d="M${wx + 14},790 Q${wx + 40},784 ${wx + 66},790" stroke="#4E95C2" stroke-width="2" fill="none"/><path d="M${wx + 18},760 Q${wx + 22},748 ${wx + 30},744" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/>`;
    s += rect(wx + 84, 860, 16, 70, "#F7F6F2", { w: 1.6 }) + [0, 1, 2, 3].map((i) => `<path d="M${wx + 86},${866 + i * 14} l12,0 l-2,10 l-8,0Z" fill="#FFFFFF" stroke="#bbb" stroke-width="1"/>`).join("");
    // ต้นลิ้นมังกรมุมห้อง + ถังขยะ
    s += pot(700, 1060, 1, "snake");
    s += `<path d="M450,1010 L490,1010 L486,1060 L454,1060Z" fill="#6E7378" stroke="#43474B" stroke-width="2.4"/><path d="M458,1010 q6,-14 16,-6 q8,-10 14,4" fill="#F4F1EA" stroke="#bbb" stroke-width="1.4"/>`;
    return s;
  }

  function floor(T) {
    const C = "#8C97A3";
    let s = poly([[-500, WALL], [1600, WALL], [1600, 2400], [-500, 2400]], C, { noStroke: true });
    // พรมแผ่นสลับสี (เพอร์สเปกทีฟ)
    const rows = [WALL, 1110, 1180, 1280, 1420, 1620, 1900, 2300];
    for (let i = 0; i < rows.length - 1; i++) {
      const y0 = rows[i], y1 = rows[i + 1];
      for (let j = -8; j < 9; j++) {
        const xa = (y) => VP[0] + (j * 170 + 0) * ((y - VP[1]) / (WALL - VP[1])) * 1;
        const xb = (y) => VP[0] + ((j + 1) * 170) * ((y - VP[1]) / (WALL - VP[1]));
        if ((i + j) % 2) s += poly([[xa(y0), y0], [xb(y0), y0], [xb(y1), y1], [xa(y1), y1]], "#97A2AD", { noStroke: true });
      }
      s += line(`M-500,${y1} L1600,${y1}`, "#7A848F", 1.6);
    }
    for (let j = -8; j < 10; j++) { const x0 = VP[0] + j * 170, x1 = VP[0] + j * 170 * ((2400 - VP[1]) / (WALL - VP[1])); s += line(`M${f(x0)},${WALL} L${f(x1)},2400`, "#7A848F", 1.6); }
    // เส้นใยพรม (จุดจาง)
    { const r = RK.rng(31); let d = ""; for (let i = 0; i < 900; i++) { const y = WALL + 10 + Math.pow(r(), 0.7) * 900, x = -400 + r() * 1900; d += `<rect x="${f(x)}" y="${f(y)}" width="${f(2 + (y - WALL) / 300)}" height="1.6"/>`; } s += `<g fill="#6E7884" opacity=".35">${d}</g>`; }
    // แผ่นปิดสายไฟพาดพื้น + ช่องปลั๊กพื้น
    s += `<path d="M-500,1300 Q200,1290 560,1330 L560,1346 Q200,1306 -500,1316Z" fill="#6E747B" stroke="#4A5057" stroke-width="2"/>` + rect(250, 1500, 70, 30, "#B9BDC2", { rx: 4, w: 2 }) + rect(262, 1506, 20, 16, "#7A7F86", { w: 1 }) + rect(290, 1506, 20, 16, "#7A7F86", { w: 1 });
    // ถังขยะข้างโต๊ะฮีโร่ + กระดาษขยำ
    s += `<path d="M520,1600 L590,1600 L582,1700 L528,1700Z" fill="#5E7F8C" stroke="#3A5560" stroke-width="2.6"/><path d="M528,1630 L582,1630" stroke="#3A5560" stroke-width="2"/><circle cx="545" cy="1598" r="12" fill="#F4F1EA" stroke="#bbb" stroke-width="1.6"/><circle cx="566" cy="1594" r="10" fill="#FFF4A8" stroke="#D8C76A" stroke-width="1.6"/><circle cx="610" cy="1712" r="10" fill="#F4F1EA" stroke="#bbb" stroke-width="1.6"/>`;
    // แสงแดดจากหน้าต่างตกบนพื้น
    const sh = T.shaft, ev = T === TIMES.evening;
    s += `<path d="M40,${WALL} L590,${WALL} L${ev ? 1150 : 900},1500 L${ev ? 420 : 260},1500Z" fill="${T.sun}" opacity="${f(sh)}"/>`;
    s += [[200, 0], [380, 0]].map(([x]) => `<path d="M${x},${WALL} L${x + 14},${WALL} L${x + (ev ? 280 : 200) + 20},1500 L${x + (ev ? 280 : 200)},1500Z" fill="${RK.shade(C, -0.1)}" opacity="${f(sh * 1.4)}"/>`).join("");
    return s;
  }

  // ---------- โต๊ะทำงาน ----------
  function monitor(x, y, k, screen = "sheet", back = false) {
    let s = `<g transform="translate(${x},${y}) scale(${k})">`;
    s += `<path d="M-14,0 L14,0 L20,10 L-20,10Z" fill="#2B2B33" stroke="#15151A" stroke-width="2.4"/><rect x="-6" y="-34" width="12" height="36" fill="#3A3A42" stroke="#15151A" stroke-width="2"/>`;
    if (back) return s + `<rect x="-80" y="-130" width="160" height="100" rx="6" fill="#33333B" stroke="#15151A" stroke-width="3"/><rect x="-30" y="-100" width="60" height="40" rx="4" fill="#2B2B33"/><circle cx="60" cy="-44" r="3" fill="#6BD46B"/></g>`;
    s += `<rect x="-80" y="-130" width="160" height="100" rx="6" fill="#2B2B33" stroke="#15151A" stroke-width="3"/><rect x="-72" y="-122" width="144" height="82" fill="#EAF3FA"/>`;
    if (screen === "sheet") { s += `<rect x="-72" y="-122" width="144" height="10" fill="#2E8B57"/>`; for (let r = 0; r < 7; r++) for (let c = 0; c < 6; c++) s += `<rect x="${-70 + c * 24}" y="${-108 + r * 9.5}" width="22" height="8" fill="${r === 0 ? "#CFE8D7" : (r + c) % 5 === 0 ? "#FFE9A8" : "#FFFFFF"}" stroke="#C6D2DC" stroke-width=".8"/>`; }
    else if (screen === "chart") s += `<rect x="-72" y="-122" width="144" height="10" fill="#3E7CB1"/>` + [[-60, 30], [-40, 46], [-20, 22], [0, 56], [20, 40], [40, 64]].map(([bx, h]) => `<rect x="${bx}" y="${-44 - h}" width="14" height="${h}" fill="${h > 50 ? "#2E8B57" : "#3E7CB1"}"/>`).join("");
    else if (screen === "chat") s += `<rect x="-72" y="-122" width="40" height="82" fill="#D9E4EC"/>` + [[-26, -112, 70, "#FFFFFF"], [-10, -96, 76, "#C9F2C0"], [-26, -80, 60, "#FFFFFF"], [-4, -64, 70, "#C9F2C0"]].map(([bx, by, w, c]) => `<rect x="${bx}" y="${by}" width="${w}" height="12" rx="5" fill="${c}" stroke="#B9C6CF" stroke-width=".8"/>`).join("");
    s += `<path d="M-72,-122 L-30,-122 L-60,-40 L-72,-40Z" fill="#fff" opacity=".18"/><circle cx="68" cy="-36" r="2.4" fill="#6BD46B"/>`;
    return s + `</g>`;
  }
  function mug(x, y, k, c, steam, t) {
    return `<g transform="translate(${x},${y}) scale(${k})"><path d="M14,-26 q14,0 14,12 q0,12 -14,10" fill="none" stroke="${ink(c)}" stroke-width="5"/><path d="M14,-26 q14,0 14,12 q0,12 -14,10" fill="none" stroke="${c}" stroke-width="2.6"/><path d="M-14,-34 L16,-34 L13,0 L-11,0Z" fill="${c}" stroke="${ink(c)}" stroke-width="2.6" stroke-linejoin="round"/><ellipse cx="1" cy="-34" rx="15" ry="4" fill="#5A3A26" stroke="${ink(c)}" stroke-width="2"/><path d="M6,-30 L10,-4" stroke="${shd(c)}" stroke-width="5"/>` +
      (steam ? [-6, 4].map((dx, i) => `<path d="M${dx},-42 q-6,-10 0,-20 q6,-10 0,-20" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="${f(0.4 + 0.3 * Math.sin(t * 3 + i * 2))}" transform="translate(0,${f(-((t * 12 + i * 8) % 10))})"/>`).join("") : "") + `</g>`;
  }
  function chair(x, y, k, c = "#2F3B4C", face = 1) {
    return `<g transform="translate(${x},${y}) scale(${k * face},${k})">` +
      [-40, 0, 40].map((dx) => `<path d="M0,-40 L${dx * 1.3},-8" stroke="#2A2A2E" stroke-width="7" stroke-linecap="round"/><circle cx="${dx * 1.3}" cy="-4" r="7" fill="#1E1E22"/>`).join("") +
      `<rect x="-5" y="-110" width="10" height="72" fill="#55585E" stroke="#2A2A2E" stroke-width="2.4"/><path d="M-60,-118 Q-62,-138 -40,-140 L50,-140 Q66,-138 64,-118 L60,-104 L-56,-104Z" fill="${c}" stroke="${ink(c)}" stroke-width="3"/>` +
      `<path d="M-46,-140 Q-60,-220 -40,-286 Q0,-306 40,-286 Q56,-220 44,-140Z" fill="${c}" stroke="${ink(c)}" stroke-width="3"/><path d="M14,-280 Q34,-220 30,-146 L44,-140 Q56,-220 40,-286Z" fill="${shd(c)}"/><path d="M-30,-250 Q0,-260 30,-250 M-34,-200 Q0,-208 34,-200" fill="none" stroke="${ink(c)}" stroke-width="2" opacity=".5"/>` +
      `<path d="M-70,-150 L-62,-120 M60,-150 L56,-120" stroke="#2A2A2E" stroke-width="6" stroke-linecap="round"/><rect x="-80" y="-158" width="30" height="10" rx="4" fill="#2A2A2E"/><rect x="48" y="-158" width="30" height="10" rx="4" fill="#2A2A2E"/></g>`;
  }
  // โต๊ะทำงานหน้าตรง (เห็นหน้าโต๊ะ + ท็อปเอียงเข้า VP) พร้อมพาร์ติชันผ้าด้านหลัง
  function workDesk(x, y, w, k, o = {}, t = 0) {
    const H = 300 * k, top = y - H, D = o.depth || 0.07;
    const wood = o.wood || "#D9B98C", part = o.part || "#3E8C8A";
    let s = "";
    // พาร์ติชัน
    if (o.partition !== false) { const ph = 210 * k; s += box(x + 10 * k, top - ph, w - 20 * k, ph, D * 0.4, part, { top: false }) + rect(x + 10 * k, top - ph - 8 * k, w - 20 * k, 10 * k, "#B9BDC2", { w: 2 });
      for (let i = 1; i < 6; i++) s += line(`M${f(x + 10 * k + (i * (w - 20 * k)) / 6)},${f(top - ph + 6)} L${f(x + 10 * k + (i * (w - 20 * k)) / 6)},${f(top - 4)}`, RK.shade(part, -0.1), 1.6, 'opacity=".6"');
      (o.pins || []).forEach(([px, py, c, a]) => { s += `<g transform="rotate(${a} ${f(x + px * k)} ${f(top - py * k)})">${rect(x + px * k, top - py * k, 46 * k, 52 * k, c, { stroke: "#B9AE96", w: 1.4 })}${line(`M${f(x + px * k + 6)},${f(top - py * k + 16 * k)} l${f(32 * k)},0 M${f(x + px * k + 6)},${f(top - py * k + 26 * k)} l${f(26 * k)},0`, "#8C8270", 1.4)}</g>`; });
    }
    // ขาโต๊ะ + ตู้ลิ้นชัก + ท็อป
    s += box(x + 14 * k, top + 20 * k, 30 * k, H - 20 * k, 0.04, "#7A7F86");
    s += box(x + w - 150 * k, top + 20 * k, 136 * k, H - 30 * k, 0.05, "#B9BDC2") + [0, 1, 2].map((i) => rect(x + w - 142 * k, top + (34 + i * 82) * k, 120 * k, 72 * k, "#C9CDD2", { w: 2 }) + rect(x + w - 104 * k, top + (52 + i * 82) * k, 44 * k, 8 * k, "#8E959C", { rx: 3, w: 1 })).join("");
    s += box(x, top, w, 22 * k, D, wood);
    s += line(`M${f(x + 6)},${f(top + 10 * k)} L${f(x + w - 6)},${f(top + 10 * k)}`, hil(wood), 2);
    return { s, top, H };
  }

  // พนักงานนั่งโต๊ะ หันหน้าเข้ากล้อง (อยู่หน้าพาร์ติชัน หลังโต๊ะ) — วาดหลังพาร์ติชันแต่ก่อนท็อปโต๊ะ
  function worker(hx, top, i, t) {
    const P2 = [["#6A8CAF", "#2A1E1A", "#E8BC96"], ["#C27A8A", "#3A2620", "#F2CDB0"], ["#8FAF6A", "#1E1614", "#D19B74"]][i];
    const [shirt, hair, sk2] = P2, sway = Math.sin(t * 1.3 + i) * 2, x = hx + sway, fy = top - 104, blink = (t + i * 1.1) % 3.7 < 0.12;
    let s = "";
    // ลำตัว ไหล่ แขนวางบนโต๊ะ
    s += `<path d="M${f(x - 44)},${f(top + 4)} L${f(x - 46)},${f(top - 46)} Q${f(x - 44)},${f(top - 64)} ${f(x - 20)},${f(top - 68)} L${f(x + 20)},${f(top - 68)} Q${f(x + 44)},${f(top - 64)} ${f(x + 46)},${f(top - 46)} L${f(x + 44)},${f(top + 4)}Z" fill="${shirt}" stroke="${ink(shirt)}" stroke-width="2.4" stroke-linejoin="round"/>`;
    s += `<path d="M${f(x + 18)},${f(top - 66)} Q${f(x + 40)},${f(top - 60)} ${f(x + 44)},${f(top - 40)} L${f(x + 44)},${f(top + 4)} L${f(x + 24)},${f(top + 4)}Z" fill="${shd(shirt)}"/>`;
    s += `<path d="M${f(x - 10)},${f(top - 68)} L${f(x)},${f(top - 56)} L${f(x + 10)},${f(top - 68)}" fill="none" stroke="${ink(shirt)}" stroke-width="2"/>`;
    s += `<path d="M${f(x - 9)},${f(top - 80)} L${f(x - 10)},${f(top - 64)} Q${f(x)},${f(top - 58)} ${f(x + 10)},${f(top - 64)} L${f(x + 9)},${f(top - 80)}Z" fill="${sk2}" stroke="${ink(sk2)}" stroke-width="2"/>`;
    // หัว หู ผม หน้า
    s += `<ellipse cx="${f(x - 28)}" cy="${f(fy + 2)}" rx="5.5" ry="8.5" fill="${sk2}" stroke="${ink(sk2)}" stroke-width="2"/><ellipse cx="${f(x + 28)}" cy="${f(fy + 2)}" rx="5.5" ry="8.5" fill="${sk2}" stroke="${ink(sk2)}" stroke-width="2"/>`;
    if (i === 1) s += `<path d="M${f(x - 32)},${f(fy - 14)} Q${f(x - 44)},${f(fy + 30)} ${f(x - 30)},${f(fy + 42)} L${f(x + 30)},${f(fy + 42)} Q${f(x + 44)},${f(fy + 30)} ${f(x + 32)},${f(fy - 14)}Z" fill="${hair}" stroke="${ink(hair)}" stroke-width="2"/>`;
    s += `<path d="M${f(x - 26)},${f(fy - 6)} Q${f(x - 27)},${f(fy + 26)} ${f(x)},${f(fy + 30)} Q${f(x + 27)},${f(fy + 26)} ${f(x + 26)},${f(fy - 6)} Q${f(x + 24)},${f(fy - 32)} ${f(x)},${f(fy - 32)} Q${f(x - 24)},${f(fy - 32)} ${f(x - 26)},${f(fy - 6)}Z" fill="${sk2}" stroke="${ink(sk2)}" stroke-width="2.4"/>`;
    s += `<path d="M${f(x - 28)},${f(fy - 4)} Q${f(x - 30)},${f(fy - 36)} ${f(x)},${f(fy - 36)} Q${f(x + 30)},${f(fy - 36)} ${f(x + 28)},${f(fy - 6)} Q${f(x + 10)},${f(fy - 22)} ${f(x - 14)},${f(fy - 18)} Q${f(x - 22)},${f(fy - 14)} ${f(x - 28)},${f(fy - 4)}Z" fill="${hair}" stroke="${ink(hair)}" stroke-width="2"/>`;
    s += blink ? line(`M${f(x - 14)},${f(fy + 4)} l8,0 M${f(x + 6)},${f(fy + 4)} l8,0`, "#2A1A16", 2.4) : `<ellipse cx="${f(x - 10)}" cy="${f(fy + 3)}" rx="3" ry="3.8" fill="#2A1A16"/><ellipse cx="${f(x + 10)}" cy="${f(fy + 3)}" rx="3" ry="3.8" fill="#2A1A16"/><circle cx="${f(x - 9)}" cy="${f(fy + 2)}" r="1" fill="#fff"/><circle cx="${f(x + 11)}" cy="${f(fy + 2)}" r="1" fill="#fff"/>`;
    s += line(`M${f(x - 16)},${f(fy - 7)} q6,-3 11,0 M${f(x + 5)},${f(fy - 7)} q6,-3 11,0`, hair, 2.6) + line(`M${f(x)},${f(fy + 8)} l-2,7 l3,1`, ink(sk2), 1.8) + line(`M${f(x - 7)},${f(fy + 19)} q7,${i === 1 ? 5 : 3} 14,0`, "#8C3B36", 2.2);
    s += `<ellipse cx="${f(x - 17)}" cy="${f(fy + 13)}" rx="5.5" ry="3" fill="#F29A94" opacity=".4"/><ellipse cx="${f(x + 17)}" cy="${f(fy + 13)}" rx="5.5" ry="3" fill="#F29A94" opacity=".4"/>`;
    if (i === 2) s += `<rect x="${f(x - 21)}" y="${f(fy - 4)}" width="17" height="13" rx="4" fill="none" stroke="#2A2A30" stroke-width="2.2"/><rect x="${f(x + 4)}" y="${f(fy - 4)}" width="17" height="13" rx="4" fill="none" stroke="#2A2A30" stroke-width="2.2"/>`;
    return s;
  }
  function deskArms(x, top, i, t) {
    const sk2 = ["#E8BC96", "#F2CDB0", "#D19B74"][i], shirt = ["#6A8CAF", "#C27A8A", "#8FAF6A"][i], typ = Math.sin(t * 14 + i * 2) * 1.5;
    let s = "";
    for (const sg of [-1, 1]) {
      s += `<path d="M${f(x + sg * 40)},${f(top - 30)} Q${f(x + sg * 46)},${f(top - 6)} ${f(x + sg * 30)},${f(top + 2)}" fill="none" stroke="${ink(shirt)}" stroke-width="16" stroke-linecap="round"/><path d="M${f(x + sg * 40)},${f(top - 30)} Q${f(x + sg * 46)},${f(top - 6)} ${f(x + sg * 30)},${f(top + 2)}" fill="none" stroke="${shirt}" stroke-width="12" stroke-linecap="round"/>`;
      s += `<ellipse cx="${f(x + sg * 22)}" cy="${f(top + 4 + (sg > 0 ? typ : -typ))}" rx="10" ry="6" fill="${sk2}" stroke="${ink(sk2)}" stroke-width="2"/>`;
    }
    return s;
  }

  function deskRow(T, t) {
    let s = "";
    // แถวหลัง (ไกล) — โต๊ะ 3 ตัว พนักงานนั่งหันหน้าเข้ากล้อง หลังจอ (เห็นหลังจอ วางเยื้องไปข้าง ไม่บังหน้า)
    const k = 0.62, y = 1210;
    [[-60, 300], [300, 300], [660, 300]].forEach(([x, w], i) => {
      const H = 300 * k, top = y - H, cx = x + w * 0.42;
      // 1) พาร์ติชัน + ของแปะ
      const part = i === 1 ? "#5A7FA8" : "#3E8C8A", ph = 210 * k;
      s += box(x + 10 * k, top - ph, w - 20 * k, ph, 0.03, part, { top: false }) + rect(x + 10 * k, top - ph - 8 * k, w - 20 * k, 10 * k, "#B9BDC2", { w: 2 });
      [[18, 120, "#FFF4A8", -5], [w - 70, 112, "#FFFFFF", 4], [w - 120, 124, "#BFE3FF", -2]].forEach(([px, py, c, a]) => { s += `<g transform="rotate(${a} ${f(x + px)} ${f(top - py)})">${rect(x + px, top - py, 28, 32, c, { stroke: "#B9AE96", w: 1.2 })}${line(`M${f(x + px + 4)},${f(top - py + 10)} l18,0 M${f(x + px + 4)},${f(top - py + 17)} l14,0`, "#8C8270", 1.2)}</g>`; });
      // 2) พนักงาน (นั่งหน้าพาร์ติชัน)
      // พนักงาน: ตัวละครระบบเดียวกับตัวหลัก (มุมหน้าตรง) นั่งหลังโต๊ะ — ตัดส่วนที่อยู่ใต้ท็อปโต๊ะออก
      s += `<clipPath id="wk${i}"><rect x="${f(cx - 220)}" y="${f(top - 420)}" width="440" height="424"/></clipPath><g clip-path="url(#wk${i})">${RK.fig({ who: ["ex1", "ex2", "ex3"][i], view: "front", x: cx, y: top + 205, s: 0.34, motion: "idle", lookX: [0.6, -0.4, 0.2][i] }, t + i * 1.7)}</g>`;
      // 3) โต๊ะ: ขา ตู้ลิ้นชัก ท็อป
      s += box(x + 14 * k, top + 20 * k, 30 * k, H - 20 * k, 0.04, "#7A7F86");
      s += box(x + w - 150 * k, top + 20 * k, 136 * k, H - 30 * k, 0.05, "#B9BDC2") + [0, 1, 2].map((j) => rect(x + w - 142 * k, top + (34 + j * 82) * k, 120 * k, 72 * k, "#C9CDD2", { w: 2 }) + rect(x + w - 104 * k, top + (52 + j * 82) * k, 44 * k, 8 * k, "#8E959C", { rx: 3, w: 1 })).join("");
      s += box(x, top, w, 22 * k, 0.07, "#D9B98C");
      // 4) ของบนโต๊ะ: แขน+มือบนคีย์บอร์ด จอ (หลัง) เยื้องขวา แก้ว แฟ้ม
      s += `<path d="M${f(cx - 34)},${f(top + 2)} L${f(cx + 34)},${f(top + 2)} L${f(cx + 38)},${f(top + 10)} L${f(cx - 38)},${f(top + 10)}Z" fill="#E9E9E6" stroke="#8E8E8A" stroke-width="1.6"/>`;
      s += monitor(x + w * 0.8, top + 6, 0.5, "sheet", true) + mug(x + w * 0.12, top + 8, 0.55, ["#D8483B", "#F2B33D", "#3E7CB1"][i], i === 0, t);
      s += rect(x + w * 0.6, top - 14, 34, 14, ["#E7B24A", "#3E7CB1", "#C8483B"][i], { w: 1.4 }) + rect(x + w * 0.61, top - 24, 30, 10, "#FFFFFF", { w: 1.2 });
    });
    return s;
  }

  // โต๊ะฮีโร่ (แถวหน้า ขวา) — ตัวละครยืน/นั่งด้านซ้ายของโต๊ะ หันขวา
  function heroDesk(T, t, o = {}) {
    const x = 560, y = 1690, w = 560, k = 1;
    const d = workDesk(x, y, w, k, { pins: [[24, 196, "#FFF4A8", -6], [84, 186, "#FFC9D6", 3], [150, 200, "#FFFFFF", -2], [420, 190, "#BFE3FF", 4]], part: "#3E8C8A", wood: "#DDBB8A" }, t);
    let s = d.s; const top = d.top;
    // รูปติดพาร์ติชัน (รูปแมวข้าวต้ม) + ปฏิทินตั้งโต๊ะ
    s += rect(x + 250, top - 190, 70, 56, "#FFFFFF", { w: 2 }) + rect(x + 255, top - 185, 60, 42, "#F6C27A", { noStroke: true }) + `<circle cx="${x + 285}" cy="${top - 160}" r="12" fill="#E8892F"/><path d="M${x + 275},${top - 170} l3,-9 l5,7 M${x + 295},${top - 170} l-3,-9 l-5,7" fill="#E8892F"/>`;
    // จอคู่ (หันซ้ายเข้าหาตัวละคร = บีบแนวนอนเล็กน้อย)
    s += `<g transform="translate(${x + 230},${top + 8}) scale(-0.92,1)">${monitor(0, 0, 1, "sheet")}</g>` + `<g transform="translate(${x + 400},${top + 4}) scale(-0.8,0.95)">${monitor(0, 0, 1, "chart")}</g>`;
    // คีย์บอร์ด เมาส์ แผ่นรองเมาส์
    s += `<path d="M${x + 120},${top + 6} L${x + 300},${top + 6} L${x + 306},${top + 20} L${x + 114},${top + 20}Z" fill="#E9E9E6" stroke="#8E8E8A" stroke-width="2"/>` + Array.from({ length: 14 }, (_, i) => `<rect x="${x + 122 + i * 12.6}" y="${top + 9}" width="9" height="4" fill="#C9C9C4"/><rect x="${x + 120 + i * 12.8}" y="${top + 14}" width="9" height="4" fill="#C9C9C4"/>`).join("");
    s += `<ellipse cx="${x + 345}" cy="${top + 14}" rx="34" ry="8" fill="#3A5F8C"/><ellipse cx="${x + 345}" cy="${top + 11}" rx="9" ry="5" fill="#EDEDEA" stroke="#8E8E8A" stroke-width="1.6"/>`;
    // แก้วกาแฟมีควัน กองแฟ้ม โคมไฟ ต้นไม้เล็ก ปากกาในแก้ว กระดาษโน้ต
    s += mug(x + 60, top + 10, 1, "#F4F1EA", true, t);
    s += [["#3E7CB1", 0], ["#E7B24A", 1], ["#C8483B", 2], ["#4E8C55", 3]].map(([c, i]) => rect(x + 440 + i * 2, top + 4 - (i + 1) * 13, 100, 13, c, { w: 1.6 })).join("") + rect(x + 450, top - 60, 84, 10, "#FFFFFF", { w: 1.2 });
    s += `<path d="M${x + 500},${top + 6} L${x + 520},${top + 6} L${x + 512},${top - 4}Z" fill="#555"/><path d="M${x + 510},${top - 4} L${x + 470},${top - 110} L${x + 410},${top - 96}" fill="none" stroke="#555" stroke-width="6" stroke-linecap="round"/><path d="M${x + 380},${top - 110} L${x + 430},${top - 120} L${x + 438},${top - 84} L${x + 392},${top - 80}Z" fill="#E7B24A" stroke="#9C7A1E" stroke-width="2.4"/>`;
    if (T.lamps > 0.5) s += `<path d="M${x + 392},${top - 82} L${x + 438},${top - 86} L${x + 470},${top + 6} L${x + 330},${top + 6}Z" fill="#FFE9A8" opacity=".28"/>`;
    s += `<g transform="translate(${x + 30},${top + 6}) scale(.5)">${pot(0, 0, 1, "succulent")}</g>`;
    s += `<path d="M${x + 100},${top + 6} l14,0 l-2,-26 l-10,0Z" fill="#7A5BA6" stroke="#4E3A70" stroke-width="2"/>` + line(`M${x + 104},${top - 20} l-4,-18 M${x + 108},${top - 20} l2,-22 M${x + 111},${top - 20} l6,-16`, "#2A2A30", 2.4);
    s += rect(x + 180, top - 2, 34, 30, "#FFF4A8", { stroke: "#D8C76A", w: 1.4 }) + line(`M${x + 184},${top + 8} l24,0 M${x + 184},${top + 15} l18,0`, "#8C8270", 1.4);
    // เก้าอี้ฮีโร่ด้านซ้ายโต๊ะ
    if (o.chair !== false) s += chair(x - 40, y, 1, "#2F3B4C");
    // กระเป๋าเป้วางพื้น
    s += `<path d="M${x + 330},${y} Q${x + 320},${y - 90} ${x + 370},${y - 100} Q${x + 420},${y - 90} ${x + 410},${y}Z" fill="#4A6E8C" stroke="#2C4458" stroke-width="3"/><rect x="${x + 340}" y="${y - 50}" width="60" height="34" rx="6" fill="#3E5E78" stroke="#2C4458" stroke-width="2"/>`;
    return s;
  }

  // กล่องเอกสารบนพื้นใกล้กล้อง (อยู่หน้าตัวละครที่ยืนลึกกว่า)
  function floorBoxes() {
    let s = "";
    s += box(-30, 1660, 190, 100, 0.04, "#D4AE78") + rect(-10, 1640, 150, 24, "#FFFFFF", { w: 1.6 }) + rect(0, 1630, 130, 14, "#F4F1EA", { w: 1.2 }) + rect(60, 1700, 40, 16, "#B58C58", { rx: 6, w: 1.4 });
    s += box(-60, 1760, 230, 120, 0.04, "#C9A06A") + rect(-50, 1772, 210, 18, "#B58C58", { w: 1.6 }) + `<text x="55" y="1840" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="26" fill="#6B4E2A">เอกสาร 2568</text>`;
    return s;
  }

  function foreground(T, t) {
    // ขอบโต๊ะหน้ากล้อง (ซ้ายล่าง) + ใบมอนสเตอร่าขวาล่าง ให้มีระยะชัดลึก
    let s = `<g opacity=".97">` + box(-120, 1820, 420, 140, 0.02, "#C9A574", { top: true }) + mug(160, 1830, 1.5, "#3E7CB1", false, t) + rect(10, 1790, 120, 40, "#FFFFFF", { w: 2 }) + rect(20, 1800, 100, 6, "#C9C2B4", { noStroke: true }) + `</g>`;
    s += `<g transform="translate(1150,1990) scale(1.5) rotate(-24)">${pot(0, 0, 1, "monstera", true)}</g>`;
    return s;
  }

  RK.sets.office = function (cam, t, env = {}) {
    const T = TIMES[env.time || "morning"] || TIMES.morning;
    // ชั้นความลึก: ผนัง/ห้องผู้จัดการ (ไกลสุด) → แถวโต๊ะหลัง depth 5 → โต๊ะฮีโร่ depth 2 → ตัวละคร depth 0 → ฉากหน้า
    // ตัวละครที่ยืนหลังแถวโต๊ะ (เช่นหน้าห้องผู้จัดการ) ให้ใส่ depth 6 ขึ้นไป
    const s = ceiling(T) + backWall(T, t) + windows(T, t) + wallItems(T, t) + bossRoom(T, t) + services(T, t) + floor(T);
    const layers = [{ depth: 5, svg: deskRow(T, t) }, { depth: -0.5, svg: floorBoxes() }];
    if (env.heroDesk !== false) layers.push({ depth: 2, svg: heroDesk(T, t, { chair: env.heroChair !== false }) });
    let fg = env.fg ? foreground(T, t) : "";
    if (T.tintA) fg += `<rect x="-600" y="-500" width="2400" height="3000" fill="${T.tint}" opacity="${T.tintA}" style="mix-blend-mode:multiply"/>`;
    return { svg: s, layers, fg, dark: 0, tone: false };
  };
  RK.sets.office.BOUNDS = [-440, 1520];
})(window);
