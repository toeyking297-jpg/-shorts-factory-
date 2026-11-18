// สไตล์ 2 (ตามภาพอ้างอิง): สัดส่วน ~6 หัว มุม 3/4 เส้นบางสีเข้มของชิ้นนั้น เงาด้านเดียว (แสงจากซ้ายบน) ผ้ามีรอยยับ
// ตัวละครทุกตัวสร้างจากสเปกใน RK.FIG_CAST (ปรับรูปหน้า ทรงผม รูปร่าง ชุด รองเท้า)
// พิกัด: (0,0) = กลางเท้า · ผู้ใหญ่สูง ~1235 หน่วยที่ scale 1 · หันหน้าไปทางขวาของจอ (facing:-1 = กลับด้าน)
(function (G) {
  const RK = G.RK, f = RK.f;
  const OW = 3.6;
  const ink = (c) => RK.shade(c, -0.42), shd = (c) => RK.shade(c, -0.16), hil = (c) => RK.shade(c, 0.18);
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
  const rot = (v, deg) => { const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
  const P = (p) => `${f(p[0])},${f(p[1])}`;
  let UID = 0;

  // ---------- ท่อนแขนขา ----------
  function seg(a, b, w0, w1, fill, o = {}) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, u = [dx / L, dy / L], n = [-u[1], u[0]];
    const bul = o.bulge ?? 0.06, m = Math.max(w0, w1) * (0.5 + bul);
    const A1 = add(a, mul(n, w0 / 2)), A2 = add(a, mul(n, -w0 / 2)), B1 = add(b, mul(n, w1 / 2)), B2 = add(b, mul(n, -w1 / 2));
    const M1 = add(add(a, mul(u, L * 0.4)), mul(n, m)), M2 = add(add(a, mul(u, L * 0.4)), mul(n, -m));
    const capB = o.flatEnd ? `L${P(B2)}` : `C${P(add(B1, mul(u, w1 * 0.55)))} ${P(add(B2, mul(u, w1 * 0.55)))} ${P(B2)}`;
    const d = `M${P(A1)} Q${P(M1)} ${P(B1)} ${capB} Q${P(M2)} ${P(A2)} C${P(add(A2, mul(u, -w0 * 0.55)))} ${P(add(A1, mul(u, -w0 * 0.55)))} ${P(A1)}Z`;
    let s = `<path d="${d}" fill="${fill}"${o.noStroke ? "" : ` stroke="${ink(fill)}" stroke-width="${OW}" stroke-linejoin="round"`}/>`;
    if (o.sideFrom != null) { const fa = (sg) => add(add(a, mul(u, L * o.sideFrom)), mul(n, sg * (w0 + (w1 - w0) * o.sideFrom) / 2)); s += `<path d="M${P(fa(1))} Q${P(M1)} ${P(B1)} M${P(fa(-1))} Q${P(M2)} ${P(B2)}" fill="none" stroke="${ink(fill)}" stroke-width="${OW}" stroke-linecap="round"/>`; }
    const sideN = n[0] + n[1] * 0.4 >= 0 ? n : mul(n, -1);
    const S1 = add(a, mul(sideN, w0 * 0.47)), S2 = add(b, mul(sideN, w1 * 0.47)), S3 = add(b, mul(sideN, w1 * 0.12)), S4 = add(a, mul(sideN, w0 * 0.12));
    const SM = add(add(a, mul(u, L * 0.4)), mul(sideN, m * 0.92));
    if (!o.noShade) s += `<path d="M${P(S1)} Q${P(SM)} ${P(S2)} L${P(S3)} L${P(S4)}Z" fill="${shd(fill)}"/>`;
    if (o.folds) s += o.folds.map(([t, k]) => { const c = add(a, mul(u, L * t)); const p1 = add(c, mul(n, -w0 * 0.3 * k)), p2 = add(c, mul(n, w0 * 0.25 * k)); const q = add(c, mul(u, 10)); return `<path d="M${P(p1)} Q${P(q)} ${P(p2)}" fill="none" stroke="${ink(fill)}" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>`; }).join("");
    return s;
  }
  // แขน/ขาต่อเนื่องเป็นชิ้นเดียว (ไม่มีรอยต่อข้อศอก/เข่า) · pts=[ต้น,ข้อพับ,ปลาย] ws=[กว้างต้น,ข้อพับ,ปลาย]
  function limb(pts, ws, fill, o = {}) {
    const [a, b, c] = pts, [w0, w1, w2] = ws;
    const nrm = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1; return [[dx / L, dy / L], [-dy / L, dx / L]]; };
    const [u1, n1] = nrm(a, b), [u2, n2] = nrm(b, c);
    let nb = add(n1, n2); const nl = Math.hypot(nb[0], nb[1]) || 1; nb = mul(nb, 1 / nl);
    const kb = Math.min(1.5, 1 / Math.max(0.5, (n1[0] * nb[0] + n1[1] * nb[1])));
    const bl = o.bulge ?? 0.06, L1 = Math.hypot(b[0] - a[0], b[1] - a[1]), L2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const side = (sg, kk) => {
      const A = add(a, mul(n1, sg * w0 / 2 * kk)), B = add(b, mul(nb, sg * w1 / 2 * kb * kk)), Cc = add(c, mul(n2, sg * w2 / 2 * kk));
      const m1 = add(add(a, mul(u1, L1 * 0.42)), mul(n1, sg * ((w0 + w1) / 4) * (1 + bl * 2) * kk));
      const m2 = add(add(b, mul(u2, L2 * 0.4)), mul(n2, sg * ((w1 + w2) / 4) * (1 + bl * 2) * kk));
      return [A, m1, B, m2, Cc];
    };
    const [A1, M1, B1, N1, C1] = side(1, 1), [A2, M2, B2, N2, C2] = side(-1, 1);
    const cap = o.flatEnd ? `L${P(C2)}` : `C${P(add(C1, mul(u2, w2 * 0.55)))} ${P(add(C2, mul(u2, w2 * 0.55)))} ${P(C2)}`;
    const capA = o.flatStart ? `L${P(A1)}` : `C${P(add(A2, mul(u1, -w0 * 0.5)))} ${P(add(A1, mul(u1, -w0 * 0.5)))} ${P(A1)}`;
    const d = `M${P(A1)} Q${P(M1)} ${P(B1)} Q${P(N1)} ${P(C1)} ${cap} Q${P(N2)} ${P(B2)} Q${P(M2)} ${P(A2)} ${capA}Z`;
    let s = `<path d="${d}" fill="${fill}"${o.noStroke ? "" : ` stroke="${ink(fill)}" stroke-width="${OW}" stroke-linejoin="round"`}/>`;
    if (o.sideFrom != null) { const fa = (sg) => add(add(a, mul(u1, L1 * o.sideFrom)), mul(n1, sg * (w0 + (w1 - w0) * o.sideFrom) / 2)); s += `<path d="M${P(fa(1))} Q${P(M1)} ${P(B1)} Q${P(N1)} ${P(C1)} M${P(fa(-1))} Q${P(M2)} ${P(B2)} Q${P(N2)} ${P(C2)}" fill="none" stroke="${ink(fill)}" stroke-width="${OW}" stroke-linecap="round" stroke-linejoin="round"/>`; }
    if (!o.noShade) {
      const sg = (nb[0] + nb[1] * 0.4) >= 0 ? 1 : -1;
      let [So, Mo, Bo, No, Co] = side(sg, 0.92), [Si, , Bi, , Ci] = side(sg, 0.2);
      if (o.sideFrom != null) { const c0 = add(a, mul(u1, L1 * Math.max(0.35, o.sideFrom))), wf = w0 + (w1 - w0) * 0.35; So = add(c0, mul(n1, sg * wf / 2 * 0.92)); Si = add(c0, mul(n1, sg * wf / 2 * 0.2)); Mo = add(add(a, mul(u1, L1 * 0.7)), mul(n1, sg * ((w0 + w1) / 4) * 0.95)); }
      s += `<path d="M${P(So)} Q${P(Mo)} ${P(Bo)} Q${P(No)} ${P(Co)} L${P(Ci)} L${P(Bi)} L${P(Si)}Z" fill="${shd(fill)}" stroke="none"/>`;
    }
    if (o.crease) { const sg = (nb[0] + nb[1] * 0.4) >= 0 ? -1 : 1; const q = add(b, mul(nb, sg * w1 * 0.36)); s += `<path d="M${P(add(q, mul(u1, -10)))} Q${P(add(q, mul(nb, sg * -4)))} ${P(add(q, mul(u2, 10)))}" fill="none" stroke="${ink(fill)}" stroke-width="2.2" stroke-linecap="round" opacity=".55"/>`; }
    if (o.folds) s += o.folds.map(([seg, tt, k]) => { const [p0, uu, nn, LL, ww] = seg ? [b, u2, n2, L2, w1] : [a, u1, n1, L1, w0]; const cc = add(p0, mul(uu, LL * tt)); return `<path d="M${P(add(cc, mul(nn, -ww * 0.3 * k)))} Q${P(add(cc, mul(uu, 10)))} ${P(add(cc, mul(nn, ww * 0.25 * k)))}" fill="none" stroke="${ink(fill)}" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>`; }).join("");
    return s;
  }
  function chain(base, a1, L1, a2, L2) { const e = add(base, rot([0, L1], a1)), w = add(e, rot([0, L2], a1 + a2)); return [base, e, w, a1 + a2]; }

  // ---------- มือ ----------
  // ---------- มือ ----------
  // ระบบพิกัดมือ: ข้อมือ (0,0) นิ้วชี้ไปทาง +y · ด้าน +x = ด้านนิ้วโป้ง · นิ้วแต่ละนิ้ววาดแยก (ขอบเข้ม+เนื้อ) ซ้อนจากหลังไปหน้า
  // view: back = เห็นหลังมือ · palm = เห็นฝ่ามือ/ด้านใน
  const HS = 1.32; // มือใหญ่ขึ้นให้สมกับหน้า (ยาวราว 0.6 ของหน้า)
  function hand(type, at, ang, sk, near, k = 1, nails, ww = 28, cuff = false) {
    const K = k * HS, lw = OW / K, o = ink(sk), sh = shd(sk), hw = ww / 2 / K;
    const fing = (pts, w) => { const d = pts.length === 3 ? `M${P(pts[0])} Q${P(pts[1])} ${P(pts[2])}` : `M${P(pts[0])} L${P(pts[1])}`;
      return `<path d="${d}" fill="none" stroke="${o}" stroke-width="${f(w + lw * 2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${sk}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round"/>`; };
    const nail = (pt, ang2 = 0) => nails ? `<ellipse cx="${f(pt[0])}" cy="${f(pt[1])}" rx="2.6" ry="3.2" fill="${nails}" transform="rotate(${ang2} ${f(pt[0])} ${f(pt[1])})"/>` : "";
    // ฝ่ามือ: ขอบล่างโค้งตามแนวข้อนิ้ว ไม่ลากเส้นขอบล่าง (นิ้วต่อเนื่องจากมือ) ลากเส้นเฉพาะสองข้าง
    const palmShape = (x1, y1, x2, y2) => {
      const Ls = `M${f(-hw)},0 C${f(-hw - 2)},${f(y1 * 0.4)} ${f(x1)},${f(y1 * 0.7)} ${f(x1)},${f(y1)}`, Rs = `M${f(hw)},0 C${f(hw + 2)},${f(y2 * 0.4)} ${f(x2)},${f(y2 * 0.7)} ${f(x2)},${f(y2)}`;
      const d = `M${f(-hw)},0 C${f(-hw - 2)},${f(y1 * 0.4)} ${f(x1 + lw / 2)},${f(y1 * 0.7)} ${f(x1 + lw / 2)},${f(y1)} Q${f((x1 + x2) / 2)},${f((y1 + y2) / 2 + 5)} ${f(x2 - lw / 2)},${f(y2)} C${f(x2 - lw / 2)},${f(y2 * 0.7)} ${f(hw + 2)},${f(y2 * 0.4)} ${f(hw)},0Z`;
      return `<path d="${d}" fill="${sk}"/><path d="${Ls}" fill="none" stroke="${o}" stroke-width="${f(lw)}" stroke-linecap="round"/><path d="${Rs}" fill="none" stroke="${o}" stroke-width="${f(lw)}" stroke-linecap="round"/>`; };
    let g = "";
    if (type === "pocket") return "";
    // ลำดับวาด: นิ้ว (รวมนิ้วโป้ง) ก่อน → ฝ่ามือ/หลังมือทับโคนนิ้ว → ขอบล่างของมือคือแนวข้อนิ้ว · ไม่มีนิ้วไหนวางทับบนมือ
    let fg = "", palm = "", mk = "";
    if (type === "relaxed" && near) {
      // หลังมือขวา ห้อยข้างตัว นิ้วตรงลงตามธรรมชาติ งอเล็กน้อยที่ปลาย นิ้วโป้งแนบด้านหน้า
      fg += fing([[12, 14], [19, 30], [19, 44]], 10);
      fg += fing([[-11.5, 32], [-12.5, 50], [-11, 60]], 8) + fing([[-4, 32], [-4.5, 56], [-2.5, 68]], 9.2) + fing([[3.5, 32], [3.5, 58], [5, 70]], 9.4) + fing([[11, 32], [11.5, 54], [12.5, 64]], 9);
      fg += nail([-11, 57], 4) + nail([-2.5, 65], 4) + nail([5, 67], 4) + nail([12.5, 61], 4);
      palm = palmShape(-17, 40, 16, 42);
      mk = `<path d="M-6,8 Q-9,22 -8,32 M2,10 Q1,22 2,32" fill="none" stroke="${sh}" stroke-width="2" stroke-linecap="round" opacity=".8"/>` +
        `<path d="M-14,50 q2,2 4,0 M-6,54 q2,2 4,0 M2,55 q2,2 4,0 M9,52 q2,2 4,0" fill="none" stroke="${o}" stroke-width="${f(lw * 0.55)}" opacity=".5"/>`;
    } else if (type === "relaxed") {
      // มือซ้าย(ข้างไกล) เห็นด้านฝ่ามือ: นิ้วห้อยตรง ปลายนิ้วงอเข้าหาฝ่ามือ (สั้นลงตามมุม) นิ้วโป้งแนบด้านหน้า
      fg += fing([[12, 12], [20, 28], [19, 42]], 10.5);
      fg += fing([[-11.5, 32], [-12, 48], [-10.5, 56]], 8) + fing([[-4, 32], [-4.5, 52], [-3, 62]], 9) + fing([[3.5, 32], [3.5, 54], [4.5, 64]], 9.2) + fing([[11, 32], [11.5, 50], [12, 58]], 9);
      palm = palmShape(-17, 40, 16, 40);
      mk = `<path d="M-12,26 Q0,32 12,24" fill="none" stroke="${sh}" stroke-width="2.2" stroke-linecap="round"/>`;
    } else if (type === "fist") {
      // กำมือ เห็นหลังมือ ข้อนิ้วพับอยู่ใต้แนวข้อนิ้ว นิ้วโป้งพับอยู่ด้านหน้า
      fg += fing([[13, 12], [24, 28], [16, 44]], 10);
      fg += fing([[-12.5, 32], [-12, 50]], 9.5) + fing([[-5, 32], [-3, 53]], 10) + fing([[4, 32], [6, 53]], 10) + fing([[11, 32], [14, 50]], 9.5);
      palm = palmShape(-18, 42, 17, 42);
      mk = `<path d="M-15,36 Q-10,33 -6,37 M-5,38 Q0,35 4,39 M5,38 Q10,35 14,38" fill="none" stroke="${sh}" stroke-width="2" stroke-linecap="round"/>`;
    } else if (type === "open" || type === "wave") {
      // แบมือ เห็นฝ่ามือ นิ้วเหยียดออกจากใต้ฝ่ามือ (wave = กางออกเล็กน้อย)
      const sp = type === "wave" ? 1.6 : 0.6;
      fg += fing([[10, 12], [22, 22], [f(26 + 2 * sp), 34]], 10.5);
      [[-12.5, 24, -5], [-5, 31, -2], [4, 33, 1], [12, 29, 4]].forEach(([x, L, d]) => { const e = [x + d * sp, 36 + L]; fg += fing([[x, 30], [x + d * sp * 0.4, 36 + L * 0.5], e], x === -12.5 ? 8.4 : 9.4); });
      palm = palmShape(-19, 38, 18, 38);
      mk = type === "wave" ? `<path d="M-14,30 Q0,25 16,30 M-2,10 Q0,22 -8,32" fill="none" stroke="${sh}" stroke-width="2.4" stroke-linecap="round"/>`
        : `<path d="M-7,8 Q-10,22 -9,32 M2,10 Q1,22 2,32 M10,10 Q10,22 10,32" fill="none" stroke="${sh}" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
    } else if (type === "point") {
      fg += fing([[13, 12], [24, 28], [16, 44]], 10);
      fg += fing([[-12.5, 32], [-12, 50]], 9.5) + fing([[-5, 32], [-3, 53]], 10) + fing([[4, 32], [6, 53]], 10) + fing([[11, 32], [14, 58], [15, 80]], 9);
      palm = palmShape(-18, 42, 17, 42);
    }
    g += fg + palm + mk;
    if (!cuff) g = `<rect x="${f(-hw + lw / 2)}" y="-14" width="${f(hw * 2 - lw)}" height="18" fill="${sk}"/>` + g;
    // มือซ้าย/ขวา: ภาพวาดแต่ละท่าเป็นมือข้างใดข้างหนึ่ง (หลังมือขวา = นิ้วโป้ง +x, ฝ่ามือซ้าย = นิ้วโป้ง +x)
    // ข้างใกล้กล้อง = มือขวา, ข้างไกล = มือซ้าย → ถ้าภาพวาดเป็นมือคนละข้างกับที่ต้องการ ให้กลับด้าน
    const drawnRight = { relaxed: !!near, fist: true, point: true, open: true, wave: false }[type]; // open = หลังมือ นิ้วโป้งอยู่บนเมื่อยื่นมือไปข้างหน้า
    const mirror = drawnRight !== !!near;
    return `<g transform="translate(${P(at)}) rotate(${f(ang)}) scale(${f(mirror ? -K : K)},${f(K)})">${g}</g>`;
  }
  RK.figHand = hand;
  RK.figParts = { limb: (...a) => limb(...a), seg: (...a) => seg(...a), chain: (...a) => chain(...a), hand: (...a) => hand(...a) };


  // ---------- ส่วนประกอบใบหน้า (ใช้ทั้งมุม 3/4 และหน้าตรง) ----------
  // ตา: ทรงอัลมอนด์ เส้นขนตาบนหนาเรียวไปหาง ชั้นตาสองชั้น ม่านตาไล่สี ประกายตา 2 จุด
  // dir = 1 หางตาอยู่ทางขวา (+x), -1 หางตาอยู่ทางซ้าย
  RK.figEye = function (cx, cy, ww, hh, dir, o) {
    const { iris = "#3B2620", fem = false, face = "smile", blink = false, lx = 0, sk = "#EFC29B", irisK = 1, wr = false, id = "" } = o;
    const X = (k) => f(cx + dir * k), I = cx - dir * ww, Tl = cx + dir * ww;
    const lash = "#1E1412", lw = fem ? 4.2 : 3.6;
    if (face === "happy" || face === "laugh") return `<path d="M${f(I)},${f(cy + 1)} C${X(-ww * 0.4)},${f(cy - hh * 1.6)} ${X(ww * 0.45)},${f(cy - hh * 1.6)} ${f(Tl)},${f(cy + 1)}" fill="none" stroke="${lash}" stroke-width="${lw}" stroke-linecap="round"/>` + (fem ? `<path d="M${f(Tl)},${f(cy + 1)} l${f(dir * 6)},-4" stroke="${lash}" stroke-width="2.6" stroke-linecap="round"/>` : "");
    if (blink) return `<path d="M${f(I)},${f(cy)} C${X(-ww * 0.4)},${f(cy + hh * 0.6)} ${X(ww * 0.4)},${f(cy + hh * 0.6)} ${f(Tl)},${f(cy - 1)}" fill="none" stroke="${lash}" stroke-width="${lw}" stroke-linecap="round"/>`;
    const h2 = face === "surprised" ? hh * 1.45 : face === "angry" ? hh * 0.8 : hh;
    const top = `M${f(I)},${f(cy)} C${X(-ww * 0.45)},${f(cy - h2 * 1.75)} ${X(ww * 0.5)},${f(cy - h2 * 1.85)} ${f(Tl)},${f(cy - h2 * 0.15)}`;
    const bot = `C${X(ww * 0.5)},${f(cy + h2 * 0.95)} ${X(-ww * 0.45)},${f(cy + h2 * 0.85)} ${f(I)},${f(cy)}`;
    const ir = Math.min(ww * 0.52, h2 * 1.05) * irisK, ix = cx + dir * ww * 0.08 + lx * ww * 0.3, iy = cy - h2 * 0.28;
    const cid = `ey${id}${Math.round(cx)}${Math.round(cy)}`;
    let e = `<clipPath id="${cid}"><path d="${top} ${bot}Z"/></clipPath><path d="${top} ${bot}Z" fill="#FBFAF7"/>`;
    e += `<g clip-path="url(#${cid})"><circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir)}" fill="${iris}"/><path d="M${f(ix - ir * 0.8)},${f(iy + ir * 0.2)} A${f(ir * 0.82)},${f(ir * 0.82)} 0 0 0 ${f(ix + ir * 0.8)},${f(iy + ir * 0.2)}" fill="${RK.shade(iris, 0.3)}" opacity=".55"/>`;
    e += `<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir)}" fill="none" stroke="${RK.shade(iris, -0.5)}" stroke-width="1.6"/><circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir * 0.45)}" fill="#0E0908"/>`;
    e += `<circle cx="${f(ix + ir * 0.35)}" cy="${f(iy - ir * 0.38)}" r="${f(ir * 0.28)}" fill="#fff"/><circle cx="${f(ix - ir * 0.38)}" cy="${f(iy + ir * 0.42)}" r="${f(ir * 0.12)}" fill="#fff" opacity=".85"/>`;
    e += `<path d="${top} L${f(Tl)},${f(cy - h2 * 3)} L${f(I)},${f(cy - h2 * 3)}Z" fill="${RK.shade(sk, -0.25)}" opacity=".22" transform="translate(0,${f(h2 * 0.55)})"/></g>`;
    // เส้นขนตาบน (หนาขึ้นไปทางหางตา) + หางตา (ผู้หญิง)
    e += `<path d="${top} C${X(ww * 0.5)},${f(cy - h2 * 1.55)} ${X(-ww * 0.45)},${f(cy - h2 * 1.45)} ${f(I)},${f(cy + 0.5)}Z" fill="${lash}" stroke="${lash}" stroke-width="${f(lw * 0.55)}" stroke-linejoin="round"/>`;
    if (fem) e += `<path d="M${f(Tl)},${f(cy - h2 * 0.15)} q${f(dir * 7)},-3 ${f(dir * 10)},-8 q${f(-dir * 2)},6 ${f(-dir * 9)},10Z" fill="${lash}"/>`;
    // ชั้นตา + ขอบตาล่างบาง
    e += `<path d="M${X(-ww * 0.55)},${f(cy - h2 * 1.75)} C${X(-ww * 0.1)},${f(cy - h2 * 2.35)} ${X(ww * 0.55)},${f(cy - h2 * 2.25)} ${X(ww * 0.92)},${f(cy - h2 * 1.1)}" fill="none" stroke="${RK.shade(sk, -0.38)}" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>`;
    e += `<path d="M${X(-ww * 0.6)},${f(cy + h2 * 0.55)} C${X(-ww * 0.2)},${f(cy + h2 * 0.95)} ${X(ww * 0.4)},${f(cy + h2 * 0.9)} ${X(ww * 0.85)},${f(cy + h2 * 0.25)}" fill="none" stroke="${RK.shade(sk, -0.32)}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`;
    if (wr) e += `<path d="M${X(ww + 4)},${f(cy + 2)} l${f(dir * 8)},4 M${X(ww + 4)},${f(cy - 4)} l${f(dir * 10)},0" stroke="${RK.shade(sk, -0.38)}" stroke-width="1.8" opacity=".6"/>`;
    return e;
  };
  // คิ้ว: รูปทรงทึบ หัวคิ้วหนา ไล่เรียวไปหางคิ้ว (ชายตรงเข้ม หญิงโค้งบาง)
  RK.figBrow = function (x0, y0, x1, y1, arch, th, col) {
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - arch, nx = 0, ny = 1;
    return `<path d="M${f(x0)},${f(y0 - th * 0.55)} Q${f(mx)},${f(my - th * 0.5)} ${f(x1)},${f(y1)} Q${f(mx)},${f(my + th * 0.45)} ${f(x0)},${f(y0 + th * 0.45)} Q${f(x0 - Math.sign(x1 - x0) * th * 0.4)},${f(y0)} ${f(x0)},${f(y0 - th * 0.55)}Z" fill="${col}"/>` +
      `<path d="M${f(x0 + (x1 - x0) * 0.15)},${f(y0 - th * 0.1)} Q${f(mx)},${f(my - th * 0.15)} ${f(x0 + (x1 - x0) * 0.8)},${f(y0 + (y1 - y0) * 0.8 - arch * 0.5)}" fill="none" stroke="${RK.shade(col, 0.35)}" stroke-width="1.2" opacity=".5"/>`;
  };
  // ปาก: ชาย = เส้นปากเรียบ + เงาใต้ริมฝีปากล่าง · หญิง = ริมฝีปากเต็ม บน (โค้งกระจับ) ล่าง (อิ่ม) + ไฮไลต์
  RK.figLips = function (cx, cy, w, o) {
    const { lip = null, face = "smile", talk = 0, t = 0, sk = "#EFC29B", dir = 1 } = o;
    const L = cx - w / 2, R = cx + w / 2, dk = "#5A2622", lc = lip || RK.shade(sk, -0.28);
    if (talk) { const op = 5 + Math.abs(Math.sin(t * 16)) * 11; return `<path d="M${f(L)},${f(cy)} Q${f(cx)},${f(cy - 3)} ${f(R)},${f(cy)} Q${f(cx)},${f(cy + op)} ${f(L)},${f(cy)}Z" fill="#6E2A2A" stroke="${lip ? lc : RK.shade(sk, -0.4)}" stroke-width="2.6"/><path d="M${f(L + w * 0.2)},${f(cy + 1)} L${f(R - w * 0.2)},${f(cy + 1)} L${f(R - w * 0.25)},${f(cy + 4)} L${f(L + w * 0.25)},${f(cy + 4)}Z" fill="#fff" opacity=".9"/>` + (lip ? `<path d="M${f(L)},${f(cy)} Q${f(cx - w * 0.2)},${f(cy - 6)} ${f(cx)},${f(cy - 3)} Q${f(cx + w * 0.2)},${f(cy - 6)} ${f(R)},${f(cy)}" fill="none" stroke="${lc}" stroke-width="3.4" stroke-linecap="round"/>` : ""); }
    if (face === "smile" || face === "worried" || face === "angry") {
      const k = face === "smile" ? 1 : face === "worried" ? -0.6 : -0.3;
      if (lip) return `<path d="M${f(L)},${f(cy - 2 * k)} Q${f(cx - w * 0.25)},${f(cy - 8)} ${f(cx - 2)},${f(cy - 5)} Q${f(cx)},${f(cy - 7)} ${f(cx + 2)},${f(cy - 5)} Q${f(cx + w * 0.25)},${f(cy - 8)} ${f(R)},${f(cy - 2 * k)} Q${f(cx)},${f(cy + 4 * k)} ${f(L)},${f(cy - 2 * k)}Z" fill="${lc}"/>` +
        `<path d="M${f(L + 3)},${f(cy - k)} Q${f(cx)},${f(cy + 5 * k)} ${f(R - 3)},${f(cy - k)} Q${f(cx)},${f(cy + 12)} ${f(L + 3)},${f(cy - k)}Z" fill="${RK.shade(lc, 0.12)}"/><path d="M${f(L)},${f(cy - 2 * k)} Q${f(cx)},${f(cy + 4 * k)} ${f(R)},${f(cy - 2 * k)}" fill="none" stroke="${dk}" stroke-width="2" stroke-linecap="round"/><ellipse cx="${f(cx + 2)}" cy="${f(cy + 6)}" rx="${f(w * 0.12)}" ry="1.8" fill="#fff" opacity=".55"/>`;
      return `<path d="M${f(L)},${f(cy - 2 * k)} Q${f(cx)},${f(cy + 7 * k)} ${f(R)},${f(cy - 2.5 * k)}" fill="none" stroke="${RK.shade(sk, -0.48)}" stroke-width="2.8" stroke-linecap="round"/><path d="M${f(cx - w * 0.18)},${f(cy + 10)} Q${f(cx)},${f(cy + 13)} ${f(cx + w * 0.2)},${f(cy + 10)}" fill="none" stroke="${RK.shade(sk, -0.2)}" stroke-width="2.4" stroke-linecap="round"/>`;
    }
    if (face === "surprised") return `<ellipse cx="${f(cx)}" cy="${f(cy + 4)}" rx="${f(w * 0.2)}" ry="${f(w * 0.28)}" fill="#6E2A2A" stroke="${lip ? lc : RK.shade(sk, -0.4)}" stroke-width="2.6"/>`;
    // happy / laugh: ปากยิ้มกว้างเห็นฟัน + ลิ้น
    const dp = face === "laugh" ? 26 + Math.abs(Math.sin(t * 16)) * 4 : 20;
    return `<path d="M${f(L - 2)},${f(cy - 3)} Q${f(cx)},${f(cy - 1)} ${f(R + 2)},${f(cy - 3)} Q${f(cx + w * 0.3)},${f(cy + dp)} ${f(cx)},${f(cy + dp)} Q${f(cx - w * 0.3)},${f(cy + dp)} ${f(L - 2)},${f(cy - 3)}Z" fill="#5E2224" stroke="${lip ? lc : RK.shade(sk, -0.45)}" stroke-width="2.6" stroke-linejoin="round"/>` +
      `<path d="M${f(L + 1)},${f(cy - 2)} Q${f(cx)},${f(cy)} ${f(R - 1)},${f(cy - 2)} L${f(R - 4)},${f(cy + 6)} Q${f(cx)},${f(cy + 8)} ${f(L + 4)},${f(cy + 6)}Z" fill="#fff"/><ellipse cx="${f(cx)}" cy="${f(cy + dp - 6)}" rx="${f(w * 0.24)}" ry="5" fill="#D85E6E"/>` + (lip ? `<path d="M${f(L - 2)},${f(cy - 3)} Q${f(cx - w * 0.2)},${f(cy - 9)} ${f(cx)},${f(cy - 5)} Q${f(cx + w * 0.2)},${f(cy - 9)} ${f(R + 2)},${f(cy - 3)}" fill="none" stroke="${lc}" stroke-width="3.6" stroke-linecap="round"/>` : "");
  };

  // ---------- หัว (3/4 หันขวา) ----------
  const FACES = {
    sharp: "M-62,-1186 C-20,-1222 62,-1214 88,-1160 C96,-1140 96,-1122 94,-1106 L100,-1078 Q96,-1050 86,-1032 Q74,-1006 54,-994 Q30,-986 6,-994 Q-34,-1004 -54,-1036 Q-66,-1056 -66,-1090 Q-74,-1150 -62,-1186Z",
    soft:  "M-62,-1182 C-22,-1220 58,-1214 86,-1162 C96,-1140 96,-1118 94,-1100 L98,-1076 Q94,-1046 80,-1026 Q64,-1002 40,-996 Q14,-992 -10,-1002 Q-42,-1014 -56,-1042 Q-66,-1066 -66,-1094 Q-72,-1150 -62,-1182Z",
    round: "M-70,-1176 C-30,-1222 60,-1218 92,-1160 C104,-1136 104,-1110 104,-1090 Q106,-1050 92,-1020 Q76,-990 40,-984 Q0,-982 -30,-994 Q-62,-1010 -72,-1046 Q-80,-1080 -78,-1110 Q-80,-1150 -70,-1176Z",
    old:   "M-62,-1180 C-22,-1218 56,-1212 84,-1162 C94,-1140 94,-1118 92,-1100 L96,-1074 Q94,-1040 82,-1018 Q66,-994 40,-990 Q12,-988 -12,-998 Q-44,-1010 -58,-1040 Q-68,-1066 -66,-1094 Q-72,-1150 -62,-1180Z",
    boxy:  "M-64,-1184 C-22,-1222 62,-1214 90,-1160 C98,-1138 98,-1116 96,-1100 L102,-1074 Q100,-1036 90,-1010 Q76,-988 44,-984 Q10,-982 -20,-990 Q-54,-1004 -64,-1036 Q-70,-1064 -70,-1094 Q-76,-1150 -64,-1184Z",
    kid:   "M-66,-1180 C-26,-1224 62,-1220 90,-1164 C102,-1140 102,-1110 100,-1086 Q98,-1048 80,-1024 Q60,-1000 30,-998 Q0,-998 -28,-1010 Q-58,-1026 -66,-1060 Q-74,-1100 -72,-1130 Q-74,-1160 -66,-1180Z",
  };
  // ---------- ทรงผม (มุม 3/4 หันขวา) ----------
  // ทุกทรง: ก้อนผมโค้งต่อเนื่องคลุมกะโหลก (ไม่มีหยักฟันเลื่อย) + ชั้นเงาใต้ผม + เส้นไฮไลต์ไหลตามทิศผม
  const hp = (d, H, w = OW) => `<path d="${d}" fill="${H.color}" stroke="${ink(H.color)}" stroke-width="${w}" stroke-linejoin="round"/>`;
  const hl = (d, H, op = 0.8, w = 3) => `<path d="${d}" fill="none" stroke="${H.hi}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`;
  const hs = (d, H, op = 0.55) => `<path d="${d}" fill="${shd(H.color)}" opacity="${op}"/>`;
  const HAIR = {
    // ครอปผมนุ่ม ปอยหน้าม้าปลายมนตกลงหน้าผาก ข้างสั้นไล่เฉด
    dropcut: (H, id) => {
      const d = "M-82,-1104 C-94,-1168 -80,-1230 -30,-1254 C20,-1276 80,-1262 104,-1222 C114,-1204 112,-1184 104,-1170 C98,-1158 90,-1150 82,-1156 C76,-1146 66,-1140 58,-1150 C50,-1142 40,-1140 34,-1152 C26,-1146 14,-1148 10,-1162 C-10,-1162 -30,-1150 -46,-1128 C-54,-1114 -58,-1100 -60,-1086 L-66,-1080 C-74,-1088 -80,-1096 -82,-1104Z";
      return { back: "", front:
        `<defs><linearGradient id="fade${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${H.color}" stop-opacity=".55"/><stop offset="1" stop-color="${H.color}" stop-opacity="0"/></linearGradient></defs><path d="M-60,-1110 C-64,-1090 -66,-1070 -64,-1050 L-56,-1056 C-56,-1076 -54,-1096 -50,-1112Z" fill="url(#fade${id})"/>` +
        hp(d, H) + hs("M-60,-1092 C-56,-1118 -40,-1146 -16,-1160 C-30,-1146 -44,-1124 -52,-1098Z", H) +
        hl("M-56,-1214 C-16,-1250 40,-1256 86,-1232 M-64,-1180 C-24,-1222 40,-1230 96,-1196 M-50,-1146 C-26,-1180 20,-1192 64,-1176 M70,-1236 C88,-1214 92,-1190 88,-1170", H) };
    },
    // บ็อบปลายงุ้ม หน้าม้าปัดข้าง กิ๊บติดผม
    bob: (H) => ({
      back: hp("M-100,-1128 C-110,-1214 -50,-1258 10,-1262 C70,-1264 108,-1222 110,-1170 C112,-1110 108,-1050 102,-1014 C96,-996 82,-992 72,-1002 L-62,-996 C-80,-990 -96,-994 -104,-1012 C-112,-1052 -106,-1092 -100,-1128Z", H) +
        hs("M-96,-1030 C-60,-1018 20,-1016 96,-1024 L100,-1012 C94,-998 82,-994 72,-1002 L-62,-996 C-80,-990 -96,-994 -100,-1010Z", H, 0.7),
      front: hp("M-86,-1150 C-88,-1214 -36,-1248 20,-1250 C70,-1252 104,-1220 108,-1180 C100,-1168 88,-1166 76,-1170 C56,-1176 30,-1170 10,-1156 C-6,-1146 -18,-1130 -26,-1110 C-32,-1130 -42,-1146 -54,-1150 C-60,-1120 -62,-1060 -60,-1004 C-70,-996 -82,-998 -88,-1012 C-94,-1060 -92,-1110 -86,-1150Z", H) +
        hl("M76,-1232 C40,-1226 4,-1196 -20,-1130 M44,-1244 C10,-1232 -24,-1196 -44,-1150 M-74,-1150 C-80,-1100 -78,-1050 -74,-1012", H) +
        `<g transform="translate(66,-1190) rotate(-20)"><rect x="-18" y="-5" width="36" height="10" rx="5" fill="${H.clip || "#F2B33D"}" stroke="${ink(H.clip || "#F2B33D")}" stroke-width="2.4"/><rect x="-14" y="-3" width="12" height="3" rx="1.5" fill="#fff" opacity=".6"/></g>` }),
    // มวยผมยาย: ผมหวีเรียบเก็บไปมวยด้านหลัง ปิ่นปักมวย
    bun: (H) => ({
      back: `<circle cx="-62" cy="-1226" r="40" fill="${H.color}" stroke="${ink(H.color)}" stroke-width="${OW}"/>` + hl("M-92,-1236 C-76,-1258 -48,-1258 -32,-1240 M-96,-1214 C-76,-1238 -44,-1238 -26,-1218 M-90,-1196 C-72,-1212 -50,-1212 -36,-1200", H, 0.7) + `<path d="M-46,-1270 L-24,-1206" stroke="#9C3A30" stroke-width="5" stroke-linecap="round"/><circle cx="-47" cy="-1272" r="5" fill="#E8C14A"/>`,
      front: hp("M-80,-1100 C-92,-1170 -76,-1230 -26,-1250 C24,-1268 82,-1248 100,-1206 C104,-1190 102,-1178 96,-1170 C70,-1184 40,-1186 10,-1176 C-20,-1166 -44,-1146 -58,-1118 L-66,-1086 C-74,-1090 -78,-1094 -80,-1100Z", H) +
        hl("M90,-1190 C60,-1214 10,-1226 -44,-1214 M92,-1206 C60,-1236 0,-1246 -48,-1232 M64,-1182 C30,-1196 -10,-1194 -50,-1176 M-40,-1160 C-56,-1146 -64,-1124 -66,-1100", H, 0.75) }),
    // สกินเฮดสั้นเกรียน: ผิวผมเรียบ มีเงาเงาแสงบนศีรษะ
    buzz: (H) => {
      const r = RK.rng(55); let d = "";
      for (let i = 0; i < 160; i++) { const x = -70 + r() * 165, y = -1250 + r() * 140; d += `<circle cx="${f(x)}" cy="${f(y)}" r="1.1"/>`; }
      const P2 = "M-78,-1104 C-90,-1170 -74,-1228 -24,-1250 C24,-1266 70,-1252 86,-1216 C90,-1204 86,-1190 78,-1180 C66,-1184 40,-1188 12,-1182 C-20,-1174 -46,-1152 -58,-1122 L-64,-1090 C-72,-1094 -76,-1098 -78,-1104Z";
      return { back: "", front: `<path d="${P2}" fill="${H.color}" stroke="${ink(H.color)}" stroke-width="${OW}" stroke-linejoin="round" opacity=".94"/><clipPath id="bz${UID}"><path d="${P2}"/></clipPath><g clip-path="url(#bz${UID})"><g fill="${H.hi}" opacity=".45">${d}</g></g>` };
    },
    // หัวล้านกลางหวีปิด: ผมข้างหนาเรียบเหนือหู + เส้นผมหวีพาดกลางหัว
    combover: (H) => ({ back: "", front:
      hp("M-68,-1100 C-73,-1126 -70,-1154 -60,-1174 C-52,-1162 -51,-1136 -54,-1108 C-57,-1100 -63,-1097 -68,-1100Z", H, 2.4) + `<path d="M-58,-1104 C-58,-1092 -59,-1080 -60,-1070" stroke="${H.color}" stroke-width="5" stroke-linecap="round" opacity=".8"/>` +
      hl("M-62,-1156 C-64,-1136 -64,-1120 -62,-1106", H, 0.7) +
      `<path d="M-44,-1176 C6,-1204 56,-1200 88,-1170 M-38,-1186 C10,-1210 60,-1204 86,-1186 M-48,-1166 C0,-1192 52,-1188 90,-1156" fill="none" stroke="${H.color}" stroke-width="4.4" stroke-linecap="round"/><ellipse cx="20" cy="-1196" rx="30" ry="8" fill="#fff" opacity=".3" transform="rotate(-8 20 -1196)"/>` }),
    // ดัดลอนป้า: ทรงพองกลมเรียบเป็นก้อนเดียว ขอบเป็นลอนโค้ง ด้านในมีลอนก้นหอย
    perm: (H) => {
      const N = 22, cx = -6, cy = -1150, rx = 120, ry = 112, a0 = Math.PI * 0.62, a1 = Math.PI * 2.08;
      let d = "";
      for (let i = 0; i <= N; i++) { const a = a0 + (a1 - a0) * (i / N), x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry; if (i === 0) d += `M${f(x)},${f(y)}`; else { const am = a0 + (a1 - a0) * ((i - 0.5) / N); d += ` Q${f(cx + Math.cos(am) * rx * 1.12)},${f(cy + Math.sin(am) * ry * 1.12)} ${f(x)},${f(y)}`; } }
      const back = `<path d="${d} Q${f(cx + 40)},${f(cy + 40)} ${f(cx + Math.cos(a0) * rx)},${f(cy + Math.sin(a0) * ry)}Z" fill="${H.color}" stroke="${ink(H.color)}" stroke-width="${OW}" stroke-linejoin="round"/>`;
      const r = RK.rng(404); let curls = "";
      for (let i = 0; i < 16; i++) { const a = a0 + (a1 - a0) * r(), rr = Math.sqrt(r()) * 0.8, x = cx + Math.cos(a) * rx * rr, y = cy + Math.sin(a) * ry * rr; if (y < -1190 || x < -56) curls += `<path d="M${f(x - 7)},${f(y)} a8,8 0 1 1 10,6" fill="none" stroke="${H.hi}" stroke-width="2.8" stroke-linecap="round" opacity=".75"/>`; }
      const front = `<path d="M-60,-1176 C-30,-1214 40,-1220 96,-1186 C104,-1176 104,-1166 98,-1158 C88,-1166 76,-1158 66,-1166 C56,-1156 44,-1158 36,-1168 C26,-1158 12,-1160 6,-1172 C-6,-1162 -22,-1164 -28,-1176 C-40,-1166 -54,-1164 -60,-1176Z" fill="${H.color}" stroke="${ink(H.color)}" stroke-width="${OW}" stroke-linejoin="round"/>` + curls;
      return { back: back, front };
    },
    // ควิฟฟ์: ผมหน้าตั้งขึ้นแล้วม้วนไปข้างหลัง แนวไรผมโค้งตามหน้าผาก ข้างสั้นเรียบแนบหัว
    quiff: (H) => {
      const d = "M-80,-1108 C-92,-1170 -78,-1228 -30,-1252 C10,-1272 58,-1284 96,-1266 C118,-1254 120,-1226 106,-1206 C98,-1194 86,-1190 74,-1188 C50,-1186 20,-1178 -6,-1164 C-30,-1150 -50,-1128 -58,-1100 L-64,-1074 C-72,-1084 -78,-1096 -80,-1108Z";
      return { back: "", front: hp(d, H) + hs("M-58,-1100 C-50,-1130 -30,-1152 -6,-1164 C20,-1178 50,-1186 74,-1188 C60,-1180 30,-1172 4,-1158 C-20,-1144 -40,-1124 -52,-1096Z", H) +
        hl("M-40,-1236 C0,-1262 50,-1270 92,-1256 M-56,-1206 C-10,-1238 40,-1248 98,-1232 M-60,-1170 C-30,-1200 20,-1212 76,-1204 M-62,-1130 C-50,-1156 -26,-1172 0,-1178", H, 0.85, 3.2) +
        `<path d="M100,-1214 C92,-1200 80,-1196 70,-1196" fill="none" stroke="${ink(H.color)}" stroke-width="2.2" stroke-linecap="round"/>` };
    },
    // ผมยาวสลวย แสกข้าง ปอยหน้าทัดหูพาดไหล่หน้า ด้านหลังยาวถึงกลางหลัง
    long: (H) => {
      const back = hp("M-100,-1130 C-112,-1222 -46,-1262 14,-1262 C76,-1262 110,-1218 108,-1160 C106,-1110 102,-1070 96,-1040 C90,-1026 80,-1028 76,-1040 L60,-1004 L-60,-990 C-80,-960 -96,-910 -96,-860 C-96,-830 -88,-806 -76,-790 C-98,-786 -118,-804 -128,-840 C-140,-890 -132,-950 -118,-1000 C-108,-1040 -106,-1090 -100,-1130Z", H) +
        hs("M-112,-1010 C-126,-950 -126,-880 -110,-820 L-100,-822 C-112,-880 -110,-950 -98,-1010Z", H, 0.6) + hl("M-116,-1030 C-130,-960 -126,-880 -108,-818", H, 0.6);
      const front = hp("M-86,-1150 C-88,-1218 -40,-1254 18,-1252 C72,-1250 104,-1214 108,-1166 C96,-1178 70,-1186 44,-1182 C16,-1178 -6,-1166 -24,-1146 C-40,-1126 -50,-1096 -54,-1060 C-58,-1020 -54,-986 -48,-956 C-42,-920 -46,-884 -62,-856 C-70,-844 -80,-838 -88,-838 C-78,-866 -78,-900 -82,-936 C-88,-990 -88,-1060 -86,-1150Z", H) +
        hl("M80,-1228 C40,-1220 0,-1196 -24,-1150 M40,-1246 C0,-1232 -30,-1200 -46,-1150 M-70,-1150 C-74,-1080 -72,-1010 -66,-960 C-62,-920 -66,-880 -76,-850", H, 0.8);
      return { back, front };
    },
    // หางม้าสูง หน้าม้าปัดข้าง หางแกว่งเล็กน้อย
    ponytail: (H) => ({
      back: hp("M-80,-1160 C-120,-1166 -146,-1130 -150,-1080 C-154,-1030 -142,-980 -120,-944 C-114,-934 -104,-930 -100,-938 C-112,-980 -116,-1030 -110,-1076 C-106,-1110 -96,-1136 -80,-1146Z", H) + hl("M-128,-1110 C-140,-1060 -134,-1000 -116,-956", H, 0.75),
      front: hp("M-82,-1110 C-92,-1190 -46,-1246 16,-1252 C72,-1256 106,-1218 106,-1172 C96,-1176 84,-1176 74,-1178 C50,-1184 26,-1180 6,-1168 C-10,-1178 -30,-1180 -48,-1170 C-64,-1158 -74,-1136 -82,-1110Z", H) +
        hl("M-6,-1244 C-2,-1210 2,-1186 4,-1172 M36,-1246 C60,-1226 76,-1206 86,-1184 M-36,-1238 C-56,-1212 -66,-1180 -70,-1146", H, 0.8) +
        `<ellipse cx="-90" cy="-1150" rx="13" ry="17" fill="${H.tie}" stroke="${ink(H.tie)}" stroke-width="2.6"/><path d="M-96,-1162 Q-88,-1150 -96,-1138" fill="none" stroke="${shd(H.tie)}" stroke-width="3"/>` }),
    // แกละสองข้าง หน้าม้าตรงปลายมน ยางรัดลูกบอล
    pigtails: (H) => ({
      back: `<g transform="translate(-74,-1140) rotate(14)">${hp("M0,0 C-30,20 -38,70 -30,110 C-26,130 -14,140 -4,138 C-10,100 -6,50 14,16Z", H)}</g><circle cx="-74" cy="-1140" r="12" fill="${H.tie}" stroke="${ink(H.tie)}" stroke-width="2.6"/><g transform="translate(96,-1170) rotate(-10)">${hp("M0,0 C26,22 30,64 24,90 C18,102 10,104 6,100 C10,64 4,30 -10,10Z", H)}</g><circle cx="96" cy="-1170" r="10" fill="${H.tie}" stroke="${ink(H.tie)}" stroke-width="2.6"/>`,
      front: hp("M-76,-1120 C-86,-1196 -36,-1246 20,-1248 C72,-1250 104,-1214 104,-1170 C104,-1158 100,-1148 94,-1142 C70,-1144 40,-1142 10,-1144 C-10,-1144 -30,-1136 -48,-1120 C-56,-1112 -62,-1102 -66,-1094 C-70,-1102 -74,-1110 -76,-1120Z", H) +
        hl("M0,-1210 C0,-1180 2,-1160 2,-1146 M30,-1218 C32,-1186 32,-1164 32,-1146 M60,-1212 C62,-1186 62,-1164 62,-1146 M-40,-1210 C-30,-1230 0,-1244 40,-1240", H, 0.7) }),
  };


  // คอ: วาดก่อนลำตัว (คอเสื้อทับฐานคอ) ด้านข้างโค้งบานลงเป็นบ่า ไม่มีเส้นขอบล่าง
  function neck(C) {
    const sk = C.skin, o = ink(sk), sh = shd(sk);
    // คอเรียว (กว้างราว 2/3 ของขากรรไกร) บานออกเล็กน้อยที่ฐาน
    const L = "M-20,-1030 C-19,-1004 -20,-984 -30,-960", Rr = "M36,-1028 C35,-1004 36,-986 46,-962";
    return `<path d="M-20,-1030 C-19,-1004 -20,-984 -30,-960 L46,-962 C36,-986 35,-1004 36,-1028Z" fill="${sk}"/>` +
      `<path d="M14,-1030 C13,-1004 15,-984 22,-962 L46,-962 C36,-986 35,-1004 36,-1028Z" fill="${sh}"/>` +
      `<path d="M-20,-1008 Q8,-994 36,-1004 L36,-1028 L-20,-1030Z" fill="${sh}" opacity=".9"/>` +
      `<path d="${L}" fill="none" stroke="${o}" stroke-width="${OW}" stroke-linecap="round"/><path d="${Rr}" fill="none" stroke="${o}" stroke-width="${OW}" stroke-linecap="round"/>`;
  }
  function head(C, p, t, id) {
    const sk = C.skin, o = ink(sk), sh = shd(sk), H = C.hair, F = C.face;
    const face = p.face || "smile", blink = (t + (C.blink || 0.7)) % 3.9 < 0.1, lx = p.lookX || 0, es = F.eye || 1;
    const hair = (HAIR[H.style] || HAIR.dropcut)(H, id);
    const fD = FACES[F.shape || "sharp"];
    let s = hair.back;
    s += `<path d="M-60,-1100 Q-82,-1104 -82,-1078 Q-80,-1054 -58,-1050Z" fill="${sk}" stroke="${o}" stroke-width="${OW}"/><path d="M-64,-1092 Q-76,-1084 -66,-1062" fill="none" stroke="${sh}" stroke-width="3"/>`;
    if (F.earrings) s += `<circle cx="-70" cy="-1044" r="6" fill="${F.earrings}" stroke="${ink(F.earrings)}" stroke-width="2"/>`;
    s += `<path d="${fD}" fill="${sk}" stroke="${o}" stroke-width="${OW}" stroke-linejoin="round"/><clipPath id="face${id}"><path d="${fD}"/></clipPath>`;
    s += `<g clip-path="url(#face${id})"><path d="M72,-1236 Q94,-1160 84,-1096 Q90,-1040 52,-990 L140,-990 L140,-1236Z" fill="${sh}" opacity=".85"/><path d="M-40,-996 Q16,-984 70,-996 L70,-970 L-40,-970Z" fill="${sh}"/>`;
    if (F.blush) s += `<defs><radialGradient id="bl${id}"><stop offset="0" stop-color="${F.blush}" stop-opacity=".55"/><stop offset="1" stop-color="${F.blush}" stop-opacity="0"/></radialGradient></defs><ellipse cx="-28" cy="-1066" rx="24" ry="13" fill="url(#bl${id})"/><ellipse cx="76" cy="-1066" rx="14" ry="10" fill="url(#bl${id})"/>`;
    // โหนกแก้ม/กราม: แสงเงานุ่ม ๆ ให้หน้ามีมิติ
    s += `<path d="M-50,-1080 Q-40,-1040 -8,-1012" fill="none" stroke="${sh}" stroke-width="6" opacity=".25" stroke-linecap="round"/><ellipse cx="-20" cy="-1150" rx="30" ry="12" fill="#fff" opacity=".08"/>`;
    if (F.stubble) {
      const r = RK.rng(91); let dots = "";
      for (let i = 0; i < 420; i++) { const x = -48 + r() * 140, y = -1050 + r() * 56; if (y > -1052 + Math.max(0, x - 70) * 0.8 && !(x > 18 && x < 64 && y > -1044 && y < -1020)) dots += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.45 + r() * 0.5)}"/>`; }
      s += `<path d="M-50,-1040 Q-30,-1004 8,-994 Q40,-988 62,-1004 Q84,-1024 92,-1050 Q80,-1028 58,-1022 Q30,-1018 6,-1024 Q-28,-1030 -50,-1040Z" fill="${F.stubble}" opacity=".2"/><g fill="${F.stubble}" opacity=".26">${dots}</g><path d="M22,-1046 Q40,-1054 62,-1046 Q44,-1042 22,-1046Z" fill="${F.stubble}" opacity=".55"/>`;
    }
    if (F.wrinkles) s += `<path d="M-30,-1166 Q10,-1176 60,-1166 M-24,-1152 Q14,-1160 54,-1152" fill="none" stroke="${sh}" stroke-width="2.6"/><path d="M36,-1062 Q24,-1040 30,-1018" fill="none" stroke="${o}" stroke-width="2.2" opacity=".55"/>`;
    s += `</g>`;
    const fem = !!F.lashes, eid = id;
    const EO = (far) => ({ iris: F.iris || "#3B2620", fem, face, blink, lx, sk, irisK: far ? 0.9 : 1, wr: !!F.wrinkles && !far, id: eid });
    s += RK.figEye(-4, -1104, 17 * Math.sqrt(es), 8.5 * es, -1, EO(false)) + RK.figEye(60, -1105, 11 * Math.sqrt(es), 8 * es, 1, EO(true));
    const br = face === "surprised" ? -8 : face === "worried" ? -3 : face === "angry" ? 4 : 0, tl = face === "worried" ? 6 : face === "angry" ? -7 : 0;
    const bwid = F.brow || 6.5, bc = F.browColor || H.color, arch = fem ? 7 : 3;
    s += RK.figBrow(14, -1131 + br - tl * 0.6, -28, -1126 + br + tl * 0.3, arch, bwid * 1.15, bc) + RK.figBrow(46, -1133 + br - tl * 0.6, 76, -1128 + br, arch * 0.7, bwid * 0.85, bc);
    if (F.mole) s += `<circle cx="-24" cy="-1084" r="2.8" fill="#3A2420"/>`;
    // จมูก: สันจมูกเงาอ่อน ปลายจมูกมีไฮไลต์ รูจมูกเล็ก
    s += `<path d="M44,-1108 Q50,-1086 58,-1072" fill="none" stroke="${sh}" stroke-width="3" stroke-linecap="round" opacity=".7"/><path d="M58,-1078 Q68,-1066 64,-1058 Q58,-1054 50,-1058" fill="none" stroke="${o}" stroke-width="2.6" stroke-linecap="round"/><path d="M60,-1070 Q66,-1063 63,-1059 Q57,-1058 54,-1061Z" fill="${sh}"/><ellipse cx="60" cy="-1068" rx="3" ry="2" fill="#fff" opacity=".35"/><path d="M46,-1059 q3,2 6,1" fill="none" stroke="${o}" stroke-width="2.2" stroke-linecap="round"/>`;
    s += RK.figLips(39, -1034, 40, { lip: F.lipstick || null, face: p.talk ? "smile" : face, talk: p.talk ? 1 : 0, t, sk });
    if (F.mustache) s += `<path d="M12,-1046 Q26,-1060 40,-1052 Q54,-1060 68,-1046 Q60,-1040 48,-1044 Q40,-1046 32,-1044 Q20,-1040 12,-1046Z" fill="${H.color}" stroke="${ink(H.color)}" stroke-width="2.4"/>`;
    const gl = F.glasses;
    if (gl === "square") s += `<rect x="-42" y="-1124" width="72" height="44" rx="9" fill="rgba(210,232,255,.16)" stroke="#1C1C22" stroke-width="6"/><rect x="40" y="-1124" width="42" height="44" rx="8" fill="rgba(210,232,255,.16)" stroke="#1C1C22" stroke-width="5.5"/><path d="M30,-1108 Q35,-1114 40,-1108" fill="none" stroke="#1C1C22" stroke-width="5"/><path d="M-42,-1112 L-66,-1100" stroke="#1C1C22" stroke-width="5" stroke-linecap="round"/><path d="M-34,-1118 L-10,-1118 M46,-1118 L58,-1118" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>`;
    if (gl === "reading") s += `<circle cx="-4" cy="-1096" r="24" fill="rgba(210,232,255,.14)" stroke="#8A5A3C" stroke-width="3.6"/><ellipse cx="60" cy="-1096" rx="15" ry="22" fill="rgba(210,232,255,.14)" stroke="#8A5A3C" stroke-width="3.4"/><path d="M20,-1100 Q32,-1106 45,-1100 M-28,-1100 L-64,-1092" fill="none" stroke="#8A5A3C" stroke-width="3"/><path d="M-64,-1092 Q-96,-1000 -60,-950" fill="none" stroke="#C9A55A" stroke-width="2" stroke-dasharray="4 3"/>`;
    s += hair.front;
    return s;
  }

  // ---------- ลำตัว ----------
  function torsoD(b, w) {
    const k = (v) => f(v);
    // ไหล่ลาดจากคอลงมาเป็นหัวไหล่โค้งมน (ไม่ยกตั้ง)
    return `M-110,-924 Q-96,-956 -24,-980 Q10,-968 44,-976 Q76,-962 88,-930 Q96,-900 ${k(84 + 20 * b)},-862 Q${k(74 + 70 * b)},-790 ${k(70 * w + 70 * b)},-720 Q${k(74 + 50 * b)},-660 ${k(78 + 20 * b)},-604 L${k(-84 - 10 * b)},-606 Q${k(-80 - 14 * b)},-660 ${k(-80 * w - 20 * b)},-720 Q${k(-86 - 10 * b)},-800 -100,-870 Q-116,-896 -110,-924Z`;
  }
  function pocket(x, y, w, h, V) { return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${shd(V)}" stroke="${ink(V)}" stroke-width="2.8"/><rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" rx="3" fill="none" stroke="${ink(V)}" stroke-width="1.6" stroke-dasharray="5 4" opacity=".7"/><path d="M${x - 2},${y} L${x + w + 2},${y} L${x + w - 3},${y + 14} L${x + 3},${y + 14}Z" fill="${hil(V)}" stroke="${ink(V)}" stroke-width="2.6"/><circle cx="${x + w / 2}" cy="${y + 9}" r="3" fill="${ink(V)}"/>`; }
  function torso(C, id, noOutline = false) {
    const T = C.top, b = C.body.belly || 0, w = C.body.waist || 1, tD = torsoD(b, w), tc = T.color;
    let s = `<path d="${tD}" fill="${tc}"${noOutline ? "" : ` stroke="${ink(tc)}" stroke-width="${OW}" stroke-linejoin="round"`}/><clipPath id="tor${id}"><path d="${tD}"/></clipPath><g clip-path="url(#tor${id})">`;
    if (T.pattern === "floral") { const r = RK.rng(12); for (let i = 0; i < 22; i++) { const x = -96 + r() * 190, y = -960 + r() * 350; s += `<g transform="translate(${f(x)},${f(y)}) scale(.55)">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-9" rx="5" ry="8" fill="${T.p1}" transform="rotate(${a})"/>`).join("")}<circle r="4" fill="${T.p2}"/></g>`; } }
    if (T.pattern === "leaf") { const r = RK.rng(21); for (let i = 0; i < 14; i++) { const x = -96 + r() * 190, y = -960 + r() * 350; s += `<path d="M${f(x)},${f(y)} q10,-14 20,0 q-10,14 -20,0Z" fill="${T.p1}" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/><circle cx="${f(x + 22)}" cy="${f(y + 12)}" r="4" fill="${T.p2}" opacity=".85"/>`; } }
    if (T.pattern === "star") s += `<path d="M10,-860 L19,-840 L41,-838 L24,-824 L30,-802 L10,-814 L-10,-802 L-4,-824 L-21,-838 L1,-840Z" fill="${T.p1}" stroke="${ink(T.p1)}" stroke-width="2.4"/>`;
    s += `<path d="M40,-900 Q60,-820 52,-700 Q58,-650 60,-606 L140,-606 L140,-900Z" fill="${shd(tc)}" opacity=".9"/>`;
    const O = C.outer;
    if (O && O.type === "vest") {
      const V = O.color;
      s += `<path d="M-120,-950 Q-70,-972 -30,-976 Q-12,-940 -4,-900 L4,-600 L-140,-600Z" fill="${V}" stroke="${ink(V)}" stroke-width="${OW}"/><path d="M38,-974 Q66,-966 90,-946 L140,-946 L140,-600 L28,-600 L26,-900 Q28,-940 38,-974Z" fill="${V}" stroke="${ink(V)}" stroke-width="${OW}"/><path d="M44,-920 Q64,-830 56,-700 Q60,-650 62,-600 L140,-600 L140,-920Z" fill="${shd(V)}"/>`;
      s += `<path d="M-30,-976 Q-22,-944 -10,-918 L-24,-908 Q-40,-936 -46,-966Z" fill="${hil(V)}" stroke="${ink(V)}" stroke-width="2.8"/><path d="M38,-974 Q34,-946 30,-920 L40,-912 Q46,-940 50,-968Z" fill="${hil(V)}" stroke="${ink(V)}" stroke-width="2.8"/>`;
      s += `<path d="M-6,-900 L2,-600" stroke="${ink(V)}" stroke-width="2.6"/>` + [-880, -840, -800, -760, -720, -680, -640].map((y) => `<path d="M-6,${y} l7,3" stroke="#8A8A86" stroke-width="2.6"/>`).join("");
      s += pocket(-82, -900, 54, 46, V) + pocket(-86, -790, 60, 52, V) + pocket(38, -900, 32, 46, V) + pocket(36, -790, 34, 52, V);
      s += `<rect x="54" y="-910" width="5" height="22" rx="2" fill="#2F4F8C"/><rect x="-76" y="-930" width="24" height="10" rx="2" fill="#D8483B" stroke="#8C2A22" stroke-width="2"/><path d="M-60,-700 q14,-10 30,-4 M-70,-660 q20,-6 36,2 M40,-700 q10,-6 20,2" fill="none" stroke="${ink(V)}" stroke-width="2.2" opacity=".55" stroke-linecap="round"/>`;
    } else if (O && O.type === "cardigan") {
      const V = O.color;
      s += `<path d="M-140,-960 L-34,-976 Q-24,-900 -12,-600 L-140,-600Z" fill="${V}" stroke="${ink(V)}" stroke-width="${OW}"/><path d="M46,-976 Q36,-900 34,-600 L140,-600 L140,-960Z" fill="${V}" stroke="${ink(V)}" stroke-width="${OW}"/>`;
      s += `<path d="M52,-940 Q64,-820 58,-600 L140,-600 L140,-940Z" fill="${shd(V)}"/>` + [-920, -860, -800, -740, -680].map((y) => `<circle cx="-18" cy="${y}" r="4" fill="${O.button}" stroke="${ink(V)}" stroke-width="1.6"/>`).join("");
      s += `<path d="M-120,-930 l0,300 M-90,-940 l0,320 M70,-930 l0,300" stroke="${ink(V)}" stroke-width="1.6" opacity=".35"/><rect x="-96" y="-720" width="50" height="44" rx="4" fill="${shd(V)}" stroke="${ink(V)}" stroke-width="2.4"/><path d="M-130,-612 L-14,-612 M38,-612 L140,-612" stroke="${shd(V)}" stroke-width="10"/>`;
    } else if (O && O.type === "jacket") {
      // แจ็กเก็ตยีนส์ เปิดหน้า มีปกเสื้อ กระเป๋าหน้าอกฝาปิด ตะเข็บด้ายสีอ่อน ขอบเอว
      const V = O.color, st = RK.shade(V, 0.45);
      s += `<path d="M-140,-960 L-34,-976 Q-26,-900 -16,-600 L-140,-600Z" fill="${V}" stroke="${ink(V)}" stroke-width="${OW}"/><path d="M46,-976 Q38,-900 36,-600 L140,-600 L140,-960Z" fill="${V}" stroke="${ink(V)}" stroke-width="${OW}"/>`;
      s += `<path d="M54,-940 Q66,-820 60,-600 L140,-600 L140,-940Z" fill="${shd(V)}"/>`;
      s += `<path d="M-128,-900 L-24,-904 M48,-904 L130,-900" stroke="${st}" stroke-width="2" stroke-dasharray="6 4" opacity=".8"/>`;
      s += `<path d="M-30,-976 L-46,-930 L-20,-912 L-12,-952Z" fill="${hil(V)}" stroke="${ink(V)}" stroke-width="2.6" stroke-linejoin="round"/><path d="M44,-976 L58,-934 L40,-916 L34,-952Z" fill="${hil(V)}" stroke="${ink(V)}" stroke-width="2.6" stroke-linejoin="round"/>`;
      s += [[-96, -880, 56], [52, -880, 40]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="46" rx="3" fill="${V}" stroke="${ink(V)}" stroke-width="2.4"/><path d="M${x},${y} L${x + w},${y} L${x + w - 4},${y + 16} L${x + w / 2},${y + 22} L${x + 4},${y + 16}Z" fill="${hil(V)}" stroke="${ink(V)}" stroke-width="2.4"/><circle cx="${x + w / 2}" cy="${y + 14}" r="3.6" fill="#C9A44A" stroke="#7A5E2A" stroke-width="1.2"/><rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="38" rx="2" fill="none" stroke="${st}" stroke-width="1.4" stroke-dasharray="4 3" opacity=".7"/>`).join("");
      s += `<rect x="-140" y="-640" width="122" height="34" fill="${shd(V)}" stroke="${ink(V)}" stroke-width="2.4"/><rect x="36" y="-640" width="104" height="34" fill="${RK.shade(V, -0.24)}" stroke="${ink(V)}" stroke-width="2.4"/><path d="M-140,-630 L-18,-630 M36,-630 L140,-630" stroke="${st}" stroke-width="1.6" stroke-dasharray="5 4"/>` +
        [-860, -780, -700].map((y) => `<circle cx="-26" cy="${y}" r="4.2" fill="#C9A44A" stroke="#7A5E2A" stroke-width="1.4"/>`).join("") + `<path d="M-90,-790 q20,-6 40,4 M60,-760 q16,-4 30,4" fill="none" stroke="${ink(V)}" stroke-width="2" opacity=".5"/>`;
    } else if (O && O.type === "apron") {
      const V = O.color;
      s += `<path d="M-60,-880 L76,-880 L90,-600 L-74,-600Z" fill="${V}" stroke="${ink(V)}" stroke-width="${OW}"/><path d="M-50,-880 Q-40,-950 -22,-974 M66,-880 Q60,-950 48,-972" fill="none" stroke="${V}" stroke-width="10"/><path d="M60,-870 Q70,-740 78,-600 L90,-600 L76,-880Z" fill="${shd(V)}"/>`;
      s += `<rect x="-40" y="-760" width="100" height="56" rx="6" fill="${shd(V)}" stroke="${ink(V)}" stroke-width="2.8"/><rect x="-28" y="-756" width="24" height="16" fill="#7BB661" stroke="#4A7A3A" stroke-width="1.6"/><rect x="4" y="-754" width="24" height="14" fill="#C9A05A" stroke="#8A6A3A" stroke-width="1.6"/><path d="M-40,-738 L60,-738" stroke="${ink(V)}" stroke-width="2"/>`;
    }
    s += `</g>` + (noOutline ? "" : `<path d="${tD}" fill="none" stroke="${ink(tc)}" stroke-width="${OW}" stroke-linejoin="round"/>`);
    switch (T.collar) {
      case "peter": s += `<path d="M-24,-980 Q-30,-950 -4,-946 Q10,-958 14,-972 Q30,-954 46,-958 Q56,-970 44,-976 Q10,-964 -24,-980Z" fill="#FFFFFF" stroke="#BFB8AA" stroke-width="2.6"/>`; break;
      case "polo": s += `<path d="M-24,-980 L-8,-938 L10,-952 L26,-938 L44,-976 Q10,-966 -24,-980Z" fill="${hil(tc)}" stroke="${ink(tc)}" stroke-width="2.6"/><path d="M10,-952 L12,-890" stroke="${ink(tc)}" stroke-width="2.4"/><circle cx="12" cy="-930" r="3.4" fill="#fff" stroke="${ink(tc)}" stroke-width="1.4"/><circle cx="12" cy="-906" r="3.4" fill="#fff" stroke="${ink(tc)}" stroke-width="1.4"/><path d="M40,-910 l14,0 l-3,8 l-8,0Z" fill="#fff" opacity=".8"/>`; break;
      case "shirt": s += `<path d="M-24,-980 L-14,-942 L8,-958 L26,-940 L44,-976 Q10,-966 -24,-980Z" fill="${hil(tc)}" stroke="${ink(tc)}" stroke-width="2.6"/><path d="M8,-958 L12,-604" stroke="${ink(tc)}" stroke-width="2"/>` + [-900, -850, -800, -750, -700].map((y) => `<circle cx="18" cy="${y}" r="3" fill="#EEE" stroke="${ink(tc)}" stroke-width="1.2"/>`).join("") + `<rect x="40" y="-916" width="30" height="30" rx="3" fill="none" stroke="${ink(tc)}" stroke-width="2"/><rect x="48" y="-926" width="5" height="22" rx="2" fill="#2F4F8C"/>`; break;
      case "vneck": s += `<path d="M-24,-980 L10,-930 L44,-976 L36,-978 L10,-942 L-16,-982Z" fill="${shd(tc)}" stroke="${ink(tc)}" stroke-width="2.4" stroke-linejoin="round"/>`; break;
      case "mandarin": s += `<path d="M-24,-980 Q10,-962 44,-976 L44,-964 Q10,-950 -24,-966Z" fill="${hil(tc)}" stroke="${ink(tc)}" stroke-width="2.4"/><path d="M10,-958 L14,-604" stroke="${ink(tc)}" stroke-width="2"/>` + [-920, -870, -820, -770, -720, -670].map((y) => `<circle cx="14" cy="${y}" r="3.4" fill="${T.p2 || "#F2C14E"}" stroke="${ink(tc)}" stroke-width="1.2"/>`).join(""); break;
      default: s += `<path d="M-24,-980 Q10,-968 44,-976" fill="none" stroke="${ink(tc)}" stroke-width="3"/><path d="M-20,-976 Q10,-956 40,-972" fill="none" stroke="${shd(tc)}" stroke-width="5"/>`;
    }
    if (C.tie) { const c = C.tie; s += `<path d="M2,-958 L18,-958 L16,-944 L4,-944Z" fill="${c}" stroke="${ink(c)}" stroke-width="2.4"/><path d="M4,-944 L16,-944 L26,-700 L12,-680 L-2,-700Z" fill="${c}" stroke="${ink(c)}" stroke-width="2.6"/><path d="M8,-900 L22,-880 M6,-840 L24,-818 M8,-780 L24,-760" stroke="${shd(c)}" stroke-width="3"/>`; }
    if (C.lanyard) s += `<path d="M-14,-976 L8,-860 L36,-976" fill="none" stroke="${C.lanyard}" stroke-width="5"/><rect x="-8" y="-866" width="32" height="44" rx="4" fill="#F4F4F0" stroke="#888" stroke-width="2.4"/><rect x="-3" y="-860" width="12" height="16" fill="#9FB7D6"/><path d="M12,-856 l8,0 M12,-850 l8,0 M-3,-836 l24,0" stroke="#777" stroke-width="2"/>`;
    if (C.towel) s += `<path d="M-60,-980 Q-20,-1000 20,-978 L-60,-920 L-96,-930 Q-110,-960 -60,-980Z" fill="${C.towel}" stroke="${ink(C.towel)}" stroke-width="2.8"/><path d="M-96,-930 L-104,-820 L-80,-816 L-68,-928" fill="${C.towel}" stroke="${ink(C.towel)}" stroke-width="2.8"/>`;
    return s;
  }
  function lower(C) {
    const B = C.bottom, c = B.color;
    if (B.type === "skirt") { const yb = -612 + 232 * (B.len || 1), fl = 30 * (B.len || 1), yb2 = yb + 12;
      return `<path d="M-88,-612 L80,-612 Q${f(80 + fl)},-500 ${f(88 + fl)},${f(yb)} Q20,${f(yb2)} ${f(-70 - fl)},${f(yb)} Q${f(-74 - fl * 0.6)},-500 -88,-612Z" fill="${c}" stroke="${ink(c)}" stroke-width="${OW}" stroke-linejoin="round"/><path d="M-50,-600 L${f(-50 - fl * 0.6)},${f(yb + 2)} M0,-600 L6,${f(yb2)} M44,-600 L${f(44 + fl * 0.8)},${f(yb + 4)}" stroke="${ink(c)}" stroke-width="2.2" opacity=".6"/><path d="M60,-600 Q${f(70 + fl)},-500 ${f(80 + fl)},${f(yb + 2)} L${f(88 + fl)},${f(yb)} Q${f(80 + fl)},-500 80,-612Z" fill="${shd(c)}"/>` + (B.belt ? `<rect x="-88" y="-614" width="168" height="16" fill="${B.belt}" stroke="${ink(B.belt)}" stroke-width="2"/>` : ""); }
    if (B.type === "sarong") { let s = `<path d="M-88,-612 L80,-612 Q92,-300 96,-74 Q10,-62 -84,-74 Q-92,-300 -88,-612Z" fill="${c}" stroke="${ink(c)}" stroke-width="${OW}" stroke-linejoin="round"/><path d="M60,-600 Q76,-300 80,-76 L96,-74 Q92,-300 80,-612Z" fill="${shd(c)}"/>`;
      s += [-230, -170, -114].map((y) => `<path d="M-86,${y} L94,${y}" stroke="${B.p1}" stroke-width="12" opacity=".85"/><path d="M-86,${y + 12} L94,${y + 12}" stroke="${B.p2}" stroke-width="3"/>`).join("");
      return s + `<path d="M-86,-600 L80,-600" stroke="${shd(c)}" stroke-width="12"/><path d="M50,-596 Q40,-300 60,-76" fill="none" stroke="${ink(c)}" stroke-width="2.4" opacity=".6"/>`; }
    return `<path d="M-86,-612 L78,-612 Q86,-590 80,-560 L46,-548 L10,-566 L-24,-548 L-80,-560 Q-90,-590 -86,-612Z" fill="${c}" stroke="${ink(c)}" stroke-width="${OW}" stroke-linejoin="round"/><path d="M10,-604 L10,-568" stroke="${ink(c)}" stroke-width="2.4"/>` + (C.belt ? `<path d="M-86,-612 L78,-612 L80,-596 L-86,-596Z" fill="${C.belt}" stroke="${ink(C.belt)}" stroke-width="2.4"/><rect x="0" y="-614" width="18" height="20" rx="2" fill="#C9A44A" stroke="#7A5E2A" stroke-width="2"/>` : `<path d="M-60,-596 q14,10 26,0 M30,-596 q12,10 24,0" fill="none" stroke="${ink(c)}" stroke-width="2.2" opacity=".7"/>`);
  }
  // รองเท้ามุม 3/4 (หันขวา-เข้าหากล้อง): ส้นอยู่หลังข้อเท้า ปลายเท้าสั้นลงตามมุมมอง เห็นหน้ารองเท้าด้านบน
  // จุดกำเนิด = พื้นใต้ข้อเท้า · ข้อเท้าอยู่ที่ (0,-44) · rot = เอียงปลายเท้าลงเข้าหากล้อง
  function shoe(at, k, C, rot = 0) {
    const S = C.shoes, c = S.color, sk = C.skin, o = ink(c), so = S.sole || "#9A948A";
    let g = "";
    const sole = (col) => `<path d="M-27,-4 Q-30,8 -18,10 L52,10 Q68,8 66,-6 L50,0 L-24,-2Z" fill="${col}" stroke="${ink(col)}" stroke-width="2.6" stroke-linejoin="round"/>`;
    if (S.type === "sandal" || S.type === "slipper") {
      const sl = S.sole || "#5A4636";
      g += `<path d="M-28,-2 Q-30,8 -18,9 L56,9 Q72,7 70,-6 L54,-2 L-24,-4Z" fill="${sl}" stroke="${ink(sl)}" stroke-width="2.6" stroke-linejoin="round"/>`;
      // เท้า: ส้น หลังเท้า นิ้วเท้า 5 นิ้วเรียงเข้าหากล้อง
      const ft = "M14,-48 Q20,-32 40,-22 Q58,-16 64,-8 Q64,-2 56,-2 L-22,-4 Q-30,-8 -27,-20 Q-24,-34 -14,-48";
      g += `<path d="${ft}Z" fill="${sk}"/><path d="${ft}" fill="none" stroke="${ink(sk)}" stroke-width="${OW}" stroke-linejoin="round" stroke-linecap="round"/><path d="M-8,-30 q6,-6 12,0" fill="none" stroke="${shd(sk)}" stroke-width="2.4"/>`;
      g += [[62, -8, 7.5], [53, -6, 6], [46, -5, 5.4], [40, -4, 5], [34, -4, 4.6]].reverse().map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.9}" fill="${sk}" stroke="${ink(sk)}" stroke-width="2"/>`).join("");
      g += `<path d="M-4,-30 Q10,-22 26,-20" fill="none" stroke="${shd(sk)}" stroke-width="3" stroke-linecap="round"/><ellipse cx="62" cy="-10" rx="4" ry="3" fill="${RK.shade(sk, 0.2)}"/>`;
      g += S.type === "slipper" ? `<path d="M8,-30 Q30,-34 52,-18 L56,-6 L4,-6Z" fill="${c}" stroke="${ink(c)}" stroke-width="2.6" stroke-linejoin="round"/><path d="M14,-20 Q32,-22 48,-12" fill="none" stroke="${hil(c)}" stroke-width="3"/>` : `<path d="M34,-24 L44,-6 M48,-22 L36,-6" stroke="${ink(c)}" stroke-width="8" stroke-linecap="round"/><path d="M34,-24 L44,-6 M48,-22 L36,-6" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`;
    } else if (S.type === "flat") {
      g += `<path d="M-14,-48 L14,-48 Q20,-36 30,-28 L-20,-30Z" fill="${sk}"/><path d="M14,-48 Q20,-36 30,-28 M-20,-30 L-14,-48" fill="none" stroke="${ink(sk)}" stroke-width="${OW}" stroke-linecap="round"/>`;
      g += `<path d="M-22,-30 C-30,-22 -29,-6 -23,0 L50,2 C64,2 68,-8 62,-16 C54,-24 42,-28 28,-28 Q4,-26 -22,-30Z" fill="${c}" stroke="${o}" stroke-width="${OW}" stroke-linejoin="round"/>`;
      g += `<path d="M-24,-2 L50,0 Q62,0 64,-6" fill="none" stroke="#141414" stroke-width="4"/><path d="M-26,-4 L-26,4 L-14,4 L-14,-2Z" fill="#141414"/>`;
      g += `<path d="M30,-22 Q48,-20 58,-12" fill="none" stroke="${hil(c)}" stroke-width="3" stroke-linecap="round" opacity=".7"/><path d="M32,-30 l-8,-6 l2,10Z M32,-30 l8,-6 l-2,10Z" fill="${S.bow || "#F7EBD3"}" stroke="${ink(S.bow || "#F7EBD3")}" stroke-width="1.6"/><circle cx="32" cy="-30" r="3" fill="${S.bow || "#F7EBD3"}"/>`;
    } else {
      // รองเท้าผ้าใบ / รองเท้าหนัง
      const dress = S.type === "dress", sc = dress ? "#141414" : so;
      g += sole(sc);
      g += `<path d="M-22,-42 C-30,-32 -30,-12 -24,-2 L50,0 C62,0 66,-8 62,-16 C57,-26 44,-30 30,-33 L16,-44 Q-4,-50 -22,-42Z" fill="${c}" stroke="${o}" stroke-width="${OW}" stroke-linejoin="round"/>`;
      g += `<path d="M-24,-14 Q14,-8 60,-10 L50,0 L-24,-2Z" fill="${shd(c)}"/>`;
      g += `<ellipse cx="-3" cy="-44" rx="15" ry="4.5" fill="${RK.shade(c, -0.5)}"/>`;
      if (dress) g += `<path d="M24,-28 Q46,-24 58,-14" fill="none" stroke="#FFFFFF" stroke-width="3.4" stroke-linecap="round" opacity=".35"/><path d="M14,-40 L28,-31" stroke="${o}" stroke-width="2.4"/>`;
      else g += `<path d="M14,-42 L32,-32 M16,-36 l10,-8 M22,-33 l10,-8 M28,-30 l9,-7" fill="none" stroke="${o}" stroke-width="2.4" stroke-linecap="round"/><path d="M40,-10 Q50,-22 62,-14" fill="none" stroke="${o}" stroke-width="2" opacity=".6"/><path d="M-16,-24 Q6,-26 22,-16" fill="none" stroke="${S.stripe || shd(c)}" stroke-width="4" stroke-linecap="round"/>`;
    }
    return `<g transform="translate(${P(at)}) rotate(${f(rot)}) scale(${f(k)})">${g}</g>`;
  }
  RK.figShoe = shoe;

  const POSE2 = {
    pocket:  { near: [8, -30, "pocket"], far: [-12, 10, "relaxed"], legN: [2, -2], legF: [-8, 8], lean: 0 },
    talk:    { near: [16, -100, "open", 0.62], far: [-12, 10, "relaxed"], legN: [2, -2], legF: [-10, 10], lean: 1 },
    hips:    { near: [42, -82, "fist"], far: [-12, 10, "relaxed"], legN: [4, -2], legF: [-12, 6], lean: -1 },
    wave:    { near: [146, 34, "wave"], far: [-12, 10, "relaxed"], legN: [2, -2], legF: [-8, 8], lean: -2 },
    relaxed: { near: [6, -14, "relaxed"], far: [-8, -6, "relaxed"], legN: [2, -2], legF: [-8, 8], lean: 0 },
    cheer:   { near: [150, -10, "fist"], far: [-150, 10, "fist"], legN: [6, -2], legF: [-10, 6], lean: 0 },
  };
  RK.POSE2 = POSE2;


  // ---------- เก้าอี้ (สำหรับท่านั่ง) มุม 3/4 หันขวา: พนักพิงอยู่ด้านหลัง (ซ้าย) ----------
  RK.figChair = function (kind, hipY, bw = 1) {
    const sy = hipY + 46, k = Math.max(1, bw);
    let g = "";
    if (kind === "office") {
      const c = "#2F3B4C", o = ink(c);
      g += [-70, 0, 80].map((dx) => `<path d="M10,${f(sy + 70)} L${f(dx * k)},-18" stroke="#2A2A2E" stroke-width="10" stroke-linecap="round"/><circle cx="${f(dx * k)}" cy="-10" r="10" fill="#1E1E22"/>`).join("");
      g += `<rect x="2" y="${f(sy + 20)}" width="16" height="${f(-sy - 40)}" fill="#55585E" stroke="#2A2A2E" stroke-width="3"/>`;
      g += `<path d="M${f(-150 * k)},${f(sy - 380)} Q${f(-170 * k)},${f(sy - 200)} ${f(-130 * k)},${f(sy - 20)} L${f(-90 * k)},${f(sy - 20)} Q${f(-118 * k)},${f(sy - 200)} ${f(-100 * k)},${f(sy - 380)} Q${f(-126 * k)},${f(sy - 400)} ${f(-150 * k)},${f(sy - 380)}Z" fill="${c}" stroke="${o}" stroke-width="${OW}" stroke-linejoin="round"/>`;
      g += `<path d="M${f(-128 * k)},${f(sy - 40)} L${f(-60 * k)},${f(sy + 6)}" stroke="#2A2A2E" stroke-width="12" stroke-linecap="round"/>`;
      g += `<path d="M${f(-120 * k)},${f(sy)} Q${f(-124 * k)},${f(sy - 22)} ${f(-96 * k)},${f(sy - 24)} L${f(120 * k)},${f(sy - 24)} Q${f(146 * k)},${f(sy - 20)} ${f(140 * k)},${f(sy + 2)} L${f(132 * k)},${f(sy + 22)} L${f(-112 * k)},${f(sy + 22)}Z" fill="${c}" stroke="${o}" stroke-width="${OW}" stroke-linejoin="round"/><path d="M${f(-110 * k)},${f(sy + 12)} L${f(134 * k)},${f(sy + 12)} L${f(132 * k)},${f(sy + 22)} L${f(-112 * k)},${f(sy + 22)}Z" fill="${shd(c)}"/>`;
    } else if (kind === "plastic") {
      const c = "#D8483B", o = ink(c);
      g += [[-90, 1], [110, 1], [-60, 0.9], [130, 0.9]].map(([x, q]) => `<path d="M${f(x * k)},${f(sy + 10)} L${f(x * k * 1.06)},0" stroke="${o}" stroke-width="${f(18 * q + 3)}" stroke-linecap="round"/><path d="M${f(x * k)},${f(sy + 10)} L${f(x * k * 1.06)},0" stroke="${q < 1 ? shd(c) : c}" stroke-width="${f(18 * q)}" stroke-linecap="round"/>`).join("");
      g += `<path d="M${f(-130 * k)},${f(sy - 320)} Q${f(-140 * k)},${f(sy - 160)} ${f(-112 * k)},${f(sy)} L${f(-84 * k)},${f(sy)} Q${f(-104 * k)},${f(sy - 160)} ${f(-94 * k)},${f(sy - 320)}Z" fill="${c}" stroke="${o}" stroke-width="${OW}"/>` + [0.25, 0.45, 0.65].map((q) => `<path d="M${f(-126 * k)},${f(sy - 320 * q)} L${f(-100 * k)},${f(sy - 320 * q)}" stroke="${o}" stroke-width="3"/>`).join("");
      g += `<path d="M${f(-120 * k)},${f(sy - 10)} L${f(140 * k)},${f(sy - 18)} L${f(136 * k)},${f(sy + 14)} L${f(-118 * k)},${f(sy + 16)}Z" fill="${c}" stroke="${o}" stroke-width="${OW}" stroke-linejoin="round"/>`;
    } else {
      const c = "#9B6A43", o = ink(c);
      g += [[-90, 1], [120, 1], [-60, 0.85], [140, 0.85]].map(([x, q]) => `<rect x="${f(x * k - 8)}" y="${f(sy)}" width="16" height="${f(-sy)}" fill="${q < 1 ? shd(c) : c}" stroke="${o}" stroke-width="2.6"/>`).join("");
      g += `<rect x="${f(-112 * k)}" y="${f(sy - 330)}" width="22" height="${330}" fill="${c}" stroke="${o}" stroke-width="2.6"/>` + [0.3, 0.55, 0.8].map((q) => `<rect x="${f(-118 * k)}" y="${f(sy - 330 * q)}" width="34" height="18" fill="${hil(c)}" stroke="${o}" stroke-width="2.4"/>`).join("");
      g += `<path d="M${f(-120 * k)},${f(sy - 8)} L${f(150 * k)},${f(sy - 14)} L${f(150 * k)},${f(sy + 10)} L${f(-120 * k)},${f(sy + 14)}Z" fill="${hil(c)}" stroke="${o}" stroke-width="${OW}"/>`;
    }
    return g;
  };

  // ---------- โมชั่น: ท่าที่ขยับตามเวลา ----------
  // p.motion: idle | talk | wave | walk | run | sit | sitTalk | sitType · p.freq = รอบต่อวินาที (เดิน 0.9 วิ่ง 1.45)
  // ค่ามุม: สะโพก/ไหล่ ค่าลบ = ไปข้างหน้า (ทิศที่หัน) · เข่า ค่าบวก = หน้าแข้งพับไปข้างหลัง · ศอก ค่าลบ = แขนท่อนล่างยกไปข้างหน้า
  const MOT = {
    walk: { A: 24, B: 46, arm: 20, elb: 14, lean: 2, freq: 0.9 },
    run:  { A: 40, B: 96, arm: 42, elb: 92, lean: 9, freq: 1.45 },
  };
  const hashW = (w) => { let h = 7; for (const ch of String(w || "")) h = (h * 31 + ch.charCodeAt(0)) % 997; return h / 997 * 6.28; };
  const ease = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  const mixA = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, k > 0.5 ? b[2] : a[2], (a[3] || 1) + ((b[3] || 1) - (a[3] || 1)) * k];
  function motionPose(p, t) {
    const m = p.motion || "";
    const ph0 = hashW(p.who), since = Math.max(0, t - (p.t0 || 0));
    const base = POSE2[p.pose || "relaxed"] || POSE2.relaxed;
    const Q = { near: base.near.slice(), far: base.far.slice(), legN: base.legN.slice(), legF: base.legF.slice(), lean: base.lean, lift: 0, footN: 0, footF: 0, sit: false, thighK: 1 };
    if (m === "walk" || m === "run") {
      const M = MOT[m], fr = p.freq || M.freq, ph = 2 * Math.PI * fr * (t - (p.t0 || 0));
      const ramp = ease(since / 0.4); // ออกตัวค่อย ๆ เร่ง ไม่กระชาก
      const legAt = (ph2) => { const u = Math.sin(ph2), v = Math.cos(ph2); return [[(-M.A * u + (m === "run" ? -6 : 0)) * ramp, (M.B * Math.max(0, v) + (m === "run" ? 22 : 5)) * ramp + 3], -14 * Math.max(0, v) * (m === "run" ? 1.4 : 1) * ramp]; };
      const [lN, fN] = legAt(ph), [lF, fF] = legAt(ph + Math.PI);
      Q.legN = lN; Q.legF = lF; Q.footN = fN; Q.footF = fF;
      const sw = Math.sin(ph - 0.35) * ramp; // แขนแกว่งช้ากว่าขาเล็กน้อย
      Q.headTilt = Math.sin(ph * 2) * 1.2 * ramp; Q.headY = -Math.abs(Math.cos(ph)) * 3 * ramp;
      if (m === "walk") { Q.near = [M.arm * sw * 0.9 + 4, -M.elb - 10 * Math.max(0, -sw), "relaxed"]; Q.far = [-M.arm * sw * 0.9 - 6, -M.elb - 10 * Math.max(0, sw), "relaxed"]; }
      else { Q.near = [M.arm * sw - 6, -M.elb, "fist"]; Q.far = [-M.arm * sw - 10, -M.elb, "fist"]; Q.lift = 22 * Math.max(0, Math.sin(2 * ph - 0.6)); }
      if (p.carry) Q.near = base.near.slice();
      Q.lean = M.lean;
    } else if (m === "sit" || m === "sitTalk" || m === "sitType") {
      Q.sit = true; Q.thighK = 0.8;
      Q.legN = [-86, 92]; Q.legF = [-80, 88];
      Q.near = m === "sitType" ? [34, -96, "relaxed"] : [14, -62, "relaxed"];
      Q.far = m === "sitType" ? [30, -92, "relaxed"] : [8, -58, "relaxed"];
      if (m === "sitType") { const k = Math.sin(t * 13) * 3; Q.near[1] += k; Q.far[1] -= k; }
      if (m === "sitTalk") { Q.near = [20, -96 + Math.sin(t * 4.2) * 10, "open", 0.62]; }
      Q.lean = -2;
    } else if (m === "wave") {
      const up = ease(since / 0.45);
      Q.near = mixA(Q.near, [146, 34 + Math.sin(t * 8) * 16 * up, "wave"], up);
      Q.headTilt = -3 * up;
    }
    // ยืน: ถ่ายน้ำหนัก หายใจ แขนแกว่งเบา ๆ แต่ละคนจังหวะไม่ตรงกัน
    if (!Q.sit && m !== "walk" && m !== "run") {
      Q.lean += Math.sin(t * 0.55 + ph0) * 1.3;
      if (m !== "wave") { Q.near = Q.near.slice(); Q.near[0] += Math.sin(t * 0.8 + ph0) * 2.2; Q.near[1] += Math.sin(t * 0.8 + ph0 - 0.6) * 2.5; }
      Q.far = Q.far.slice(); Q.far[0] += Math.sin(t * 0.8 + ph0 + 1.3) * 2; Q.far[1] += Math.sin(t * 0.8 + ph0 + 0.7) * 2;
      Q.headTilt = (Q.headTilt || 0) + Math.sin(t * 0.45 + ph0) * 1.4;
    }
    // พูด: ยกมือประกอบคำพูดแบบค่อย ๆ ยก/ลด (gest 0..1 มาจากเวลาเสียงพูด) + พยักหน้า เอียงหัวตามจังหวะ
    const gest = p.gest != null ? p.gest : (m === "talk" || m === "sitTalk" ? 1 : 0);
    if (gest > 0.001) {
      const beat = Math.sin(t * 5.1 + ph0) * 0.6 + Math.sin(t * 3.3) * 0.4;
      const G = Q.sit ? [16, -110 + beat * 8, "open", 0.7] : [12 + beat * 3, -122 + beat * 9, "open", 0.78];
      if (m !== "wave" && Q.near[2] !== "pocket") Q.near = mixA(Q.near, G, ease(gest));
      Q.headTilt = (Q.headTilt || 0) + (Math.sin(t * 2.1 + ph0) * 2.2 + Math.sin(t * 3.7) * 1.2) * gest;
      Q.headY = (Q.headY || 0) + Math.abs(Math.sin(t * 6.2)) * -2.2 * gest;
    }
    if (p.armN) Q.near = p.armN; if (p.armF) Q.far = p.armF;
    return Q;
  }
  RK.figMotion = motionPose;
  // ระยะที่ตัวละครเดิน/วิ่งได้ (หน่วยจอ) ตามความยาวขา ความถี่ และสเกล — ให้เท้าไม่ไถลบนพื้น
  RK.figMoveX = function (A, t) {
    if (!A.move || (A.motion !== "walk" && A.motion !== "run")) return 0;
    const C = RK.FIG_CAST[A.who || "hero"]; if (!C) return 0;
    const M = MOT[A.motion], fr = A.freq || M.freq, L = (278 + 262) * ((C.body || {}).hL || 1);
    const v = 4 * L * Math.sin((M.A * Math.PI) / 180) * fr * (A.motion === "run" ? 1.15 : 0.92) * (A.s || 1);
    const dt = Math.max(0, t - (A.t0 || 0)), dir = (A.facing || 1) < 0 ? -1 : 1;
    let dx = v * dt * dir;
    if (A.stopX != null) { const lim = A.stopX - A.x; if (Math.abs(dx) > Math.abs(lim)) dx = lim; }
    return dx;
  };

  RK.fig = function (p, t) {
    if (p.who === "cat") return RK.figCat(p, t);
    const C = RK.FIG_CAST[p.who || "hero"];
    if (!C) return "";
    if ((p.view === "front" || p.view === "back") && RK.figFB) return RK.figFB(p, t, C, p.view === "back");
    const id = (p.who || "x") + (UID++ % 999);
    const Q = motionPose(p, t);
    const B = C.body || {}, bw = B.bw || 1, hL = B.hL || 1, tL = B.tL || 1, hs = B.hs || 1;
    const legW = 1 + Math.max(0, bw - 1) * 1.6, armW = 1 + Math.max(0, bw - 1) * 1.1, aL = (tL + hL) / 2;
    const legLen1 = 278 * hL, legLen2 = 262 * hL, footH = 52 * Math.min(1, hL + 0.2);
    // ความสูงสะโพก: เท้าข้างที่ต่ำที่สุดแตะพื้นพอดี (เดิน/นั่งแล้วเท้าไม่ลอย ไม่จมพื้น)
    const footY = (ang) => legLen1 * Q.thighK * Math.cos((ang[0] * Math.PI) / 180) + legLen2 * Math.cos(((ang[0] + ang[1]) * Math.PI) / 180);
    const hipY = -(Math.max(footY(Q.legN), footY(Q.legF)) + 8 + footH) - (Q.lift || 0);
    const TT = `translate(0,${f(hipY)}) scale(${f(bw)},${f(tL)}) translate(0,592)`;
    const tp = (x, y) => [x * bw, hipY + (y + 592) * tL];
    const breathe = Math.sin(t * 2.2) * 2.4;
    let s = `<ellipse cx="10" cy="6" rx="${f(130 * bw)}" ry="18" fill="#000" opacity=".16"/>`;
    if (Q.sit && p.chair) s += RK.figChair(p.chair, hipY, bw);
    const B2 = C.bottom, sarong = B2.type === "sarong", skirt = B2.type === "skirt", shorts = B2.type === "shorts";
    let legN_pts = null;
    const leg = (hipX, ang, near) => {
      const [h, k, a] = chain([hipX * bw, hipY + 8], ang[0], legLen1 * Q.thighK, ang[1], legLen2);
      let g = "";
      const pc = B2.color, pants = B2.type === "pants", cloth = pants || shorts;
      if (pants) g += limb([h, k, a], [84 * legW, 62 * legW, 52 * legW], pc, { bulge: 0.02, crease: 1, folds: [[0, 0.2, 0.6], [1, 0.85, 0.7]] });
      else g += limb([h, k, a], [(cloth ? 80 : 70) * legW, 46 * legW, 32 * legW], C.skin, { bulge: 0.1, crease: 1 });
      if (shorts) { const kk = add(h, mul([k[0] - h[0], k[1] - h[1]], 0.82)); g += seg(h, kk, 92 * legW, 78 * legW, pc, { flatEnd: true, folds: [[0.3, 0.6]] }); }
      if (pants) g += `<path d="M${P(add(a, [-24 * legW, -14]))} Q${P(add(a, [0, -6]))} ${P(add(a, [24 * legW, -14]))}" fill="none" stroke="${ink(pc)}" stroke-width="2.4"/>`;
      g += shoe(add(a, [0, footH * 0.85]), (near ? 1.05 : 0.95) * Math.min(1, 0.55 + hL * 0.5), C, (near ? 7 : 2) + (near ? Q.footN : Q.footF));
      if (near) legN_pts = [h, k, a];
      return g;
    };
    // แขน: pass "all" | "under" (ส่วนบนไหล่ อยู่ใต้ลำตัว/เสื้อกั๊ก) | "over" (ส่วนที่เหลือ+มือ ทับลำตัว)
    const arm = (sh, A, near, pass = "all") => {
      const fs = A[3] || 1;
      let [s0, e, w, tot] = chain(sh, A[0], 205 * aL, A[1], 188 * aL * fs);
      if (A[2] === "pocket") w = add(e, rot([0, 112 * aL], tot));
      const T = C.top, O = C.outer && C.outer.sleeves ? C.outer : null, sl = O ? "long" : T.sleeve, slc = O ? O.color : T.color;
      let g = "";
      const hk = Math.min(1, 0.5 + aL * 0.55) * Math.sqrt(armW);
      const mkHand = (cuff) => A[2] === "pocket" ? "" : hand(A[2], w, tot, C.skin, near, hk, C.nails, (cuff ? 30 : 28) * armW, cuff);
      if (sl === "long") g += mkHand(true);
      const SF = near ? 0.24 : null; // ขอบข้างแขนเริ่มใต้หัวไหล่ (ไม่มีเส้นรอยต่อที่ไหล่)
      if (sl === "long") {
        g += limb([s0, e, w], [56 * armW, 44 * armW, 38 * armW], slc, { crease: 1, folds: [[0, 0.85, 0.6], [1, 0.2, 0.5]], flatEnd: true, noStroke: true, sideFrom: SF });
        g += seg(add(w, rot([0, -16], tot)), w, 40 * armW, 38 * armW, shd(slc), { flatEnd: true, noShade: true });
      } else {
        g += limb([s0, e, w], [50 * armW, 36 * armW, 28 * armW], C.skin, { bulge: 0.1, crease: 1, noStroke: true, sideFrom: SF == null ? null : 0.5 });
        // แขนเสื้อ: ปลายแขนเสื้อมีขอบ (ผ้าทับผิว) ไม่มีเส้นที่หัวไหล่
        const cuffAt = sl === "3q" ? add(e, rot([0, 30 * aL], tot)) : add(s0, rot([0, 96 * aL], A[0]));
        g += sl === "3q" ? limb([s0, e, cuffAt], [60 * armW, 50 * armW, 46 * armW], slc, { flatEnd: true, folds: [[0, 0.7, 0.5]], noStroke: true, sideFrom: SF })
          : seg(s0, cuffAt, 60 * armW, 54 * armW, slc, { flatEnd: true, folds: [[0.6, 0.5]], noStroke: true, sideFrom: SF, noShade: true }) + seg(add(s0, rot([0, 40 * aL], A[0])), cuffAt, 30 * armW, 24 * armW, shd(slc), { flatEnd: true, noStroke: true, noShade: true });
        { const uu = sl === "3q" ? rot([0, 1], tot) : rot([0, 1], A[0]), nn = [-uu[1], uu[0]], cw = (sl === "3q" ? 46 : 54) * armW / 2;
          g += `<path d="M${P(add(cuffAt, mul(nn, cw)))} Q${P(add(cuffAt, mul(uu, 5)))} ${P(add(cuffAt, mul(nn, -cw)))}" fill="none" stroke="${ink(slc)}" stroke-width="${OW}" stroke-linecap="round"/>`; }
      }
      if (pass === "under") return g;
      if (C.watch && near && A[2] !== "pocket") g += `<g transform="translate(${P(add(w, rot([0, -12], tot)))}) rotate(${f(tot)})"><rect x="-17" y="-6" width="34" height="12" rx="4" fill="#2B2B33"/><circle cx="0" cy="0" r="4" fill="#E6E6E6"/></g>`;
      if (A[2] === "pocket") g += `<path d="M${P(add(w, [-26, -4]))} Q${P(add(w, [0, 14]))} ${P(add(w, [26, -2]))} L${P(add(w, [22, 16]))} Q${P(add(w, [0, 26]))} ${P(add(w, [-22, 14]))}Z" fill="${shd(B2.color)}" stroke="${ink(B2.color)}" stroke-width="${OW}"/>`;
      else if (sl !== "long") g += mkHand(false);
      if (pass === "over") {
        // ส่วนที่ทับลำตัว: ตัดหัวแขนเสื้อทิ้ง (หัวไหล่จริงมาจากรอบ under ที่อยู่หลังลำตัว) (หัวแขนเสื้อ) ทิ้ง ให้ลำตัว/หัวไหล่เป็นตัวต่อ ไม่ให้แขนเสื้อโผล่ยกเหนือไหล่
        const u = rot([0, 1], A[0]), n = [-u[1], u[0]], c = add(s0, mul(u, 205 * aL * (near ? 0.2 : 0.16)));
        const q = [add(c, mul(n, 3000)), add(c, mul(n, -3000)), add(add(c, mul(n, -3000)), mul(u, 4000)), add(add(c, mul(n, 3000)), mul(u, 4000))];
        return `<clipPath id="arm${id}${near ? "n" : "f"}"><path d="M${q.map(P).join(" L")}Z"/></clipPath><g clip-path="url(#arm${id}${near ? "n" : "f"})">${g}</g>`;
      }
      return g;
    };
    s += leg(40, Q.legF, false);
    // ขอบนอกทั้งกลุ่ม (ไม่มีเส้นรอยต่อภายใน): ขยายภาพแล้วทำให้เข้ม วางไว้ใต้ภาพจริง
    const OLR = 2.2;
    s += `<filter id="ol${id}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB"><feMorphology in="SourceGraphic" operator="dilate" radius="${OLR}" result="d"/><feComponentTransfer in="d" result="k"><feFuncR type="linear" slope=".58"/><feFuncG type="linear" slope=".55"/><feFuncB type="linear" slope=".55"/></feComponentTransfer><feMerge><feMergeNode in="k"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
    // ไหล่ขยับตามแขน: ยกแขนสูง → หัวไหล่ยกและเข้าใน
    const raiseN = Math.max(0, Math.min(1, (Q.near[0] - 30) / 120)), raiseF = Math.max(0, Math.min(1, (-Q.far[0] - 30) / 120));
    s += `<g filter="url(#ol${id})">${arm(tp(62 - 4 * raiseF, -914 - 22 * raiseF), Q.far, false)}</g>`;
    // กระโปรง/ผ้าถุงอยู่หน้าขา · กางเกงต่อสะโพกก่อนแล้วขาใกล้ทับ
    // ผ้าถุง: เท้าวาดก่อนผ้า ให้ชายผ้าบังส้น เห็นแค่ปลายเท้าโผล่
    if (Q.sit && (skirt || sarong)) {
      // นั่ง: กระโปรง/ผ้าถุงพาดบนตัก — วาดขาใกล้ก่อน แล้วผ้าคลุมต้นขา (ผ้าถุงคลุมถึงหน้าแข้ง)
      s += `<g transform="${TT}"><clipPath id="wb${id}"><rect x="-200" y="-640" width="400" height="70"/></clipPath><g clip-path="url(#wb${id})">${lower(C)}</g></g>`;
      s += leg(-40, Q.legN, true);
      const [h, k, a] = legN_pts, c = B2.color, hb = add(h, [-70 * bw, -24]);
      s += seg(hb, add(k, [8, -2]), (sarong ? 140 : 118) * bw, (sarong ? 100 : 86) * legW, c, { flatEnd: true, folds: [[0.45, 0.5], [0.75, 0.4]] });
      if (sarong) s += seg(add(k, [6, -30]), add(k, mul([a[0] - k[0], a[1] - k[1]], 0.72)), 108 * legW, 116 * legW, c, { flatEnd: true }) + [0.35, 0.55].map((q) => `<path d="M${P(add(k, [-44 * legW, (a[1] - k[1]) * q]))} L${P(add(k, [56 * legW, (a[1] - k[1]) * q]))}" stroke="${B2.p1}" stroke-width="10" opacity=".85"/>`).join("");
      else s += `<path d="M${P(add(k, [-30 * legW, -40]))} Q${P(add(k, [16, -46]))} ${P(add(k, [40 * legW, -30]))} L${P(add(k, [36 * legW, 22]))} Q${P(add(k, [0, 30]))} ${P(add(k, [-26 * legW, 24]))}Z" fill="${c}" stroke="${ink(c)}" stroke-width="${OW}" stroke-linejoin="round"/><path d="M${P(add(k, [10 * legW, -30]))} L${P(add(k, [8 * legW, 22]))}" stroke="${ink(c)}" stroke-width="2" opacity=".5"/>`;
    } else {
      if (sarong) s += shoe([-40 * bw + 4, -2], 1.05 * Math.min(1, 0.55 + hL * 0.5), C, 7);
      if (skirt) s += leg(-40, Q.legN, true) + `<g transform="${TT}">${lower(C)}</g>`;
      else { s += `<g transform="${TT}">${lower(C)}</g>`; if (!sarong) s += leg(-40, Q.legN, true); }
    }
    const shN = tp(-88 + 6 * raiseN, -912 - 24 * raiseN);
    const nk = tp(10, -968), HT = `translate(${f(nk[0])},${f(nk[1] + breathe * 0.4)}) scale(${f(hs)}) translate(-10,968)`;
    s += `<g transform="${HT}">${neck(C)}</g>`;
    // ลำตัว + แขนใกล้ อยู่กลุ่มเดียวกัน: ขอบนอกต่อเนื่องจากไหล่ลงแขน ไม่มีรอยต่อ
    let g4 = `<g transform="${TT} translate(0,${f(breathe * 0.4)})">${torso(C, id, true)}</g>` + arm(shN, Q.near, true);
    // เสื้อกั๊ก/แจ็กเก็ตไม่มีแขน: วาดชิ้นหน้าซ้ายทับหัวแขนเสื้ออีกรอบ (แขนเสื้อลอดออกจากรูแขนเสื้อกั๊ก)
    if (C.outer && C.outer.type === "vest") { const V = C.outer.color; g4 += `<g transform="${TT} translate(0,${f(breathe * 0.4)})"><clipPath id="vh${id}"><path d="M-200,-1000 L-24,-1000 L-24,-930 Q-70,-916 -112,-872 L-200,-872Z"/></clipPath><g clip-path="url(#vh${id})"><clipPath id="vt${id}"><path d="${torsoD(C.body.belly || 0, C.body.waist || 1)}"/></clipPath><path d="M-120,-950 Q-70,-972 -30,-976 Q-12,-940 -4,-900 L4,-600 L-140,-600Z" fill="${V}" clip-path="url(#vt${id})"/><path d="M-30,-976 Q-22,-944 -10,-918 L-24,-908 Q-40,-936 -46,-966Z" fill="${hil(V)}" stroke="${ink(V)}" stroke-width="2.8"/></g><path d="M-66,-912 Q-92,-898 -112,-872" fill="none" stroke="${ink(V)}" stroke-width="2.8" stroke-linecap="round"/></g>`; }
    s += `<g filter="url(#ol${id})">${g4}</g>`;
    if (Q.near[2] === "pocket" && !sarong && !skirt) s += `<g transform="${TT}"><path d="M-88,-604 Q-70,-596 -54,-604" fill="none" stroke="${ink(B2.color)}" stroke-width="3"/></g>`;
    s += `<g transform="translate(${f(nk[0])},${f(nk[1] + breathe * 0.4 + (Q.headY || 0))}) rotate(${f(Q.headTilt || 0)}) scale(${f(hs)}) translate(-10,${f(968 - (C.body.neck ?? 0))})">${head(C, p, t, id)}</g>`;
    const flip = (p.facing || 1) < 0 ? "scale(-1,1)" : "";
    return `<g transform="translate(${f(p.x)},${f(p.y)}) scale(${f(p.s || 1)}) ${flip}"><g transform="rotate(${f(Q.lean + (B.hunch || 0))} 0 ${f(hipY)})">${s}</g></g>`;
  };


  // ---------- แมว ข้าวต้ม (สไตล์ 2: นั่ง 3/4 หันขวา ส้มลายสลิด) ----------
  RK.figCat = function (p, t) {
    const c = "#E8892F", w = "#FBF3E6", o = ink(c), sh = shd(c), st = RK.shade(c, -0.3);
    const blink = (t + 1.3) % 4.2 < 0.12, tail = Math.sin(t * 1.6) * 8, ear = Math.sin(t * 0.9) > 0.96 ? -8 : 0;
    let g = `<ellipse cx="6" cy="4" rx="96" ry="12" fill="#000" opacity=".16"/>`;
    g += `<g transform="rotate(${f(tail)} -60 -20)"><path d="M-60,-20 Q-130,-10 -130,-70 Q-128,-120 -100,-140" fill="none" stroke="${o}" stroke-width="${24 + OW}" stroke-linecap="round"/><path d="M-60,-20 Q-130,-10 -130,-70 Q-128,-120 -100,-140" fill="none" stroke="${c}" stroke-width="24" stroke-linecap="round"/><path d="M-118,-40 l18,-6 M-128,-74 l20,0 M-122,-108 l18,6" stroke="${st}" stroke-width="5" stroke-linecap="round"/></g>`;
    const body = "M-70,-6 Q-86,-80 -60,-140 Q-34,-196 18,-196 Q60,-190 66,-140 Q74,-80 64,-6 Z";
    g += `<path d="${body}" fill="${c}" stroke="${o}" stroke-width="${OW}"/><clipPath id="catb${p.who || ""}${UID}"><path d="${body}"/></clipPath><g clip-path="url(#catb${p.who || ""}${UID})">`;
    g += `<path d="M-74,-120 Q-30,-112 -50,-60 M-80,-80 Q-40,-74 -56,-30 M-70,-160 Q-40,-150 -50,-120" fill="none" stroke="${st}" stroke-width="7" stroke-linecap="round"/><path d="M20,-200 Q-10,-120 18,-6 L70,-6 L70,-200Z" fill="${w}"/><path d="M44,-200 Q60,-100 50,-6 L80,-6 L80,-200Z" fill="${shd(w)}"/></g>`;
    g += `<path d="M-46,-4 Q-60,-40 -30,-46 Q-6,-42 -6,-4Z" fill="${c}" stroke="${o}" stroke-width="${OW}"/><path d="M-40,-30 l10,-4 M-44,-18 l10,-2" stroke="${st}" stroke-width="5" stroke-linecap="round"/>`;
    for (const [x, k] of [[8, 0.92], [42, 1]]) g += `<g transform="translate(${x},0) scale(${k},1)"><path d="M-13,-118 Q-16,-60 -12,-18 Q-16,-2 0,0 Q16,-2 13,-16 Q16,-60 12,-118Z" fill="${w}" stroke="${RK.shade(c, -0.25)}" stroke-width="${OW}" stroke-linejoin="round"/><path d="M6,-110 Q9,-60 7,-18" fill="none" stroke="${shd(w)}" stroke-width="6"/><path d="M-4,-1 l0,-8 M5,-1 l0,-8" stroke="${RK.shade(c, -0.25)}" stroke-width="2" stroke-linecap="round"/></g>`;
    g += `<g transform="translate(16,-196)">`;
    g += `<path d="M-58,-30 L-60,-96 Q-30,-74 -16,-62 Z" fill="${c}" stroke="${o}" stroke-width="${OW}" stroke-linejoin="round" transform="rotate(${ear} -40 -50)"/><path d="M-50,-44 L-52,-82 Q-34,-68 -26,-60Z" fill="#F2A5A0" transform="rotate(${ear} -40 -50)"/>`;
    g += `<path d="M24,-62 Q44,-80 66,-98 L66,-36 Z" fill="${c}" stroke="${o}" stroke-width="${OW}" stroke-linejoin="round"/><path d="M34,-58 Q48,-72 60,-82 L60,-46Z" fill="#F2A5A0"/>`;
    const hd = "M-68,-10 Q-74,-60 -40,-74 Q0,-86 46,-72 Q80,-58 78,-14 Q74,26 30,36 Q-10,42 -44,28 Q-70,16 -68,-10Z";
    g += `<path d="${hd}" fill="${c}" stroke="${o}" stroke-width="${OW}" stroke-linejoin="round"/>`;
    g += `<path d="M-30,-76 l4,20 M-12,-80 l0,22 M6,-80 l-3,22" stroke="${st}" stroke-width="6" stroke-linecap="round"/><path d="M50,-10 Q78,-20 78,-14 Q74,20 30,36 Q50,10 50,-10Z" fill="${sh}"/>`;
    g += `<path d="M-14,8 Q8,-4 34,6 Q46,26 30,34 Q8,40 -14,30 Q-24,20 -14,8Z" fill="${w}"/>`;
    const eye = (cx, rx) => blink ? `<path d="M${cx - rx},-24 Q${cx},-18 ${cx + rx},-24" fill="none" stroke="#3A2414" stroke-width="3.6" stroke-linecap="round"/>` :
      `<ellipse cx="${cx}" cy="-24" rx="${rx}" ry="15" fill="#B8D65A" stroke="#3A2414" stroke-width="3"/><ellipse cx="${cx + 2}" cy="-24" rx="${f(rx * 0.32)}" ry="12" fill="#1A120C"/><circle cx="${cx + 5}" cy="-30" r="3.4" fill="#fff"/>`;
    g += eye(-22, 14) + eye(36, 10);
    g += `<path d="M10,0 L22,0 L16,8Z" fill="#E77A86" stroke="#9C4450" stroke-width="2"/><path d="M16,8 Q16,16 6,18 M16,8 Q18,16 28,17" fill="none" stroke="#7A4A30" stroke-width="2.6" stroke-linecap="round"/>`;
    g += `<path d="M-6,8 L-56,0 M-6,14 L-58,16 M38,8 L82,2 M38,14 L84,16" stroke="#FFF7EA" stroke-width="2" opacity=".9"/>`;
    g += `</g>`;
    const flip = (p.facing || 1) < 0 ? "scale(-1,1)" : "";
    return `<g transform="translate(${f(p.x)},${f(p.y)}) scale(${f(p.s || 1)}) ${flip}">${g}</g>`;
  };

  RK.FIG_CAST = {
    // ตัวประกอบในออฟฟิศ (ใช้ระบบเดียวกับตัวหลัก)
    ex1: { skin: "#E8BC96", hair: { style: "dropcut", color: "#2A1E1A", hi: "#5A463C" }, face: { shape: "round", brow: 6 }, body: {},
      top: { color: "#6A8CAF", sleeve: "short", collar: "polo" }, bottom: { type: "pants", color: "#3A4256" }, shoes: { type: "sneaker", color: "#EEE", sole: "#999" } },
    ex2: { skin: "#F2CDB0", hair: { style: "bob", color: "#3A2620", hi: "#7A5040", clip: "#E7B24A" }, face: { shape: "soft", lashes: 1, blush: "#F29A94", lipstick: "#D9576B", brow: 4.4 }, body: { bw: 0.9 },
      top: { color: "#C27A8A", sleeve: "short", collar: "vneck" }, bottom: { type: "pants", color: "#3A3A44" }, shoes: { type: "flat", color: "#333" } },
    ex3: { skin: "#D19B74", hair: { style: "buzz", color: "#1E1614", hi: "#4A3A33" }, face: { shape: "boxy", glasses: "square", brow: 7 }, body: { bw: 1.08 },
      top: { color: "#8FAF6A", sleeve: "short", collar: "polo" }, bottom: { type: "pants", color: "#4A4036" }, shoes: { type: "sneaker", color: "#EEE", sole: "#999" } },
    // ตัวละครหลักชุดใหม่ (หน้าตาดี นิสัยดี แต่งตัวดี)
    phum: { skin: "#EBC09B", hair: { style: "quiff", color: "#1A1311", hi: "#5A463C" },
      face: { shape: "sharp", brow: 7, eye: 1.02, iris: "#2E1E18" }, watch: 1, belt: "#6B4A2E",
      body: { bw: 1.04, hL: 1.05, tL: 1.02 }, top: { color: "#A9CBEA", sleeve: "3q", collar: "shirt" },
      bottom: { type: "pants", color: "#D2BE96" }, shoes: { type: "sneaker", color: "#FBFBF8", sole: "#E4DED2", stripe: "#2F4F8C" } },
    prang: { skin: "#F5D3B8", hair: { style: "long", color: "#3B2419", hi: "#86563E" },
      face: { shape: "soft", lashes: 1, blush: "#F29A94", lipstick: "#D65A6E", earrings: "#F4F1EA", brow: 4.2, eye: 1.06, iris: "#4A2C20" }, nails: "#E66A7E",
      body: { tL: 0.95, hL: 0.98, bw: 0.88, waist: 0.84 }, top: { color: "#EBB8C3", sleeve: "short", collar: "vneck" },
      bottom: { type: "skirt", color: "#F3EBDD", len: 1.55, belt: "#C9A06A" }, shoes: { type: "flat", color: "#D9B48A", bow: "#F3EBDD" } },
    fah: { skin: "#EEC4A0", hair: { style: "ponytail", color: "#2A1A16", hi: "#5E4034", tie: "#F2B33D" },
      face: { shape: "soft", lashes: 1, blush: "#F49A94", lipstick: "#E06F7C", brow: 4.5, eye: 1.1, iris: "#3A2418" }, watch: 1,
      body: { tL: 0.93, hL: 0.97, bw: 0.86, waist: 0.86 }, top: { color: "#FAFAF7", sleeve: "short" }, outer: { type: "jacket", color: "#6F94C4", sleeves: true },
      bottom: { type: "pants", color: "#EDE4D3" }, shoes: { type: "sneaker", color: "#FBFBF8", sole: "#E4DED2", stripe: "#F2B33D" } },
    hero: { skin: "#EFC29B", hair: { style: "dropcut", color: "#231916", hi: "#5C443B" },
      face: { shape: "sharp", glasses: "square", mole: 1, stubble: "#4A3A33" },
      body: {}, top: { color: "#2E9C9A", sleeve: "short" }, outer: { type: "vest", color: "#B79B66" },
      bottom: { type: "pants", color: "#36405A" }, shoes: { type: "sneaker", color: "#ECE6DA", sole: "#9A948A" } },
    mind: { skin: "#F6D2B5", hair: { style: "bob", color: "#3B2620", hi: "#7A5040", clip: "#F2B33D" },
      face: { shape: "soft", lashes: 1, blush: "#F29A94", lipstick: "#D9576B", earrings: "#F2C14E", brow: 4.5 },
      body: { tL: 0.94, hL: 0.95, bw: 0.9, waist: 0.86 }, nails: "#E66A7E", watch: 1, lanyard: "#D9576B",
      top: { color: "#F4F1EA", sleeve: "short", collar: "peter" }, outer: { type: "cardigan", color: "#E27D6A", button: "#F7EBD3", sleeves: true },
      bottom: { type: "skirt", color: "#2F3B5C" }, shoes: { type: "flat", color: "#2A2A33", bow: "#E27D6A" } },
    yai: { skin: "#E6B58E", hair: { style: "bun", color: "#E4E1DA", hi: "#FFFFFF" },
      face: { shape: "old", glasses: "reading", wrinkles: 1, blush: "#E4917E", browColor: "#BDB7AE", brow: 4.2, eye: 0.85 },
      body: { tL: 0.86, hL: 0.8, bw: 0.95, hunch: 4 },
      top: { color: "#7A5BA6", sleeve: "3q", collar: "mandarin", pattern: "floral", p1: "#F6E6F0", p2: "#F2C14E" },
      bottom: { type: "sarong", color: "#7A2E2E", p1: "#B8862F", p2: "#E8C46A" }, shoes: { type: "slipper", color: "#4C7A5E" } },
    big: { skin: "#D9A27A", hair: { style: "buzz", color: "#1E1614", hi: "#4A3A33" },
      face: { shape: "round", blush: "#E08A70", brow: 8, eye: 0.85 },
      body: { bw: 1.32, belly: 1, hL: 0.92, hs: 1.06, neck: 0 },
      top: { color: "#F08A24", sleeve: "short", collar: "polo" },
      bottom: { type: "shorts", color: "#8A7A5C" }, shoes: { type: "sandal", color: "#2E2E2E", sole: "#4A3A2A" } },
    boss: { skin: "#E3B48E", hair: { style: "combover", color: "#5A534E", hi: "#9A948E" },
      face: { shape: "boxy", mustache: 1, wrinkles: 1, brow: 9, eye: 0.85 },
      body: { bw: 1.15, belly: 0.8, hL: 0.94 }, watch: 1, tie: "#B3262C", belt: "#2A2422",
      top: { color: "#F5F6F8", sleeve: "long", collar: "shirt" },
      bottom: { type: "pants", color: "#2D3340" }, shoes: { type: "dress", color: "#2A2220" } },
    jaew: { skin: "#D8A07A", hair: { style: "perm", color: "#3A1E18", hi: "#6E3A2C" },
      face: { shape: "soft", lashes: 1, lipstick: "#C8283A", earrings: "#F2C14E", blush: "#E07F6E", brow: 4.5 },
      body: { tL: 0.92, hL: 0.86, bw: 1.12, belly: 0.5 }, towel: "#F2F2EE",
      top: { color: "#2E7D6B", sleeve: "short", pattern: "leaf", p1: "#F7D046", p2: "#FFFFFF" }, outer: { type: "apron", color: "#3E6FB0" },
      bottom: { type: "sarong", color: "#3B2C5E", p1: "#C04848", p2: "#F0C060" }, shoes: { type: "sandal", color: "#C8283A", sole: "#6B3A2A" } },
    khaotu: { skin: "#F7D6BC", hair: { style: "pigtails", color: "#2A1A16", hi: "#4A3028", tie: "#FF6FA5" },
      face: { shape: "kid", lashes: 1, blush: "#F49A9A", eye: 1.35, brow: 4 },
      body: { tL: 0.55, hL: 0.5, bw: 0.74, hs: 1.18 },
      top: { color: "#FFD23F", sleeve: "short", pattern: "star", p1: "#FFFFFF" },
      bottom: { type: "shorts", color: "#FF8FB1" }, shoes: { type: "sneaker", color: "#FFFFFF", sole: "#FF6FA5" } },
  };
})(window);
