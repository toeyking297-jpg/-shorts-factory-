// ฉาก: ทางเดินหอพักเก่าชั้น 4 ตอนตีสาม (มุมมองลึกแบบจุดเดียว)
// โลก: x ซ้าย-ขวา (ซม.), y ลง (+ = พื้น), z ระยะลึกจากกล้อง (ม.)
(function (G) {
  const RK = G.RK, f = RK.f, INK = RK.INK;
  RK.sets = RK.sets || {};

  const CW = 150, FLOOR = 165, CEIL = -125, END = 30;
  const DOORS = [3.2, 7.4, 11.6, 15.8, 20, 24.2];

  RK.makeCam = function (c) {
    const vx = c.vx ?? 540, vy = c.vy ?? 780, F = c.F ?? 900, cx = c.camX ?? 0, cy = c.camY ?? 0, cz = c.camZ ?? 0;
    const proj = (x, y, z) => { const zz = Math.max(z - cz, 0.05); return [vx + ((x - cx) * F) / (zz * 100), vy + ((y - cy) * F) / (zz * 100)]; };
    return { proj, vx, vy, F, cz, scaleAt: (z) => F / (Math.max(z - cz, 0.05) * 100) };
  };

  // ความสว่างของหลอดไฟแต่ละดวง: env.lights = [ระดับ 0..1 ต่อดวง] หรือ env.flicker = ความแรงการกะพริบ
  function lightLevel(i, env, t) {
    let L = env.lights && env.lights[i] != null ? env.lights[i] : 1;
    if (env.flicker) {
      const n = RK.noise1(t * 14 + i * 3.3, i + 5);
      if (n < env.flicker * 0.55) L *= 0.08 + n * 0.4;
    }
    if (i === 3) L *= RK.noise1(t * 22, 99) > 0.45 ? 1 : 0.15; // หลอดเสียดวงที่ 4 กะพริบตลอด
    return L * (env.master ?? 1);
  }

  RK.sets.corridor = function (cam, t, env = {}) {
    const P = cam.proj;
    const LIGHTS = [2, 6, 10, 14, 18, 22, 26];
    const lv = LIGHTS.map((_, i) => lightLevel(i, env, t));
    const avg = lv.reduce((a, b) => a + b, 0) / lv.length;
    let s = "";
    const quad = (pts, fill, extra = "") => RK.poly(pts, fill, extra);
    const wall = (side, z0, z1, y0, y1) => [P(side * CW, y0, z0), P(side * CW, y0, z1), P(side * CW, y1, z1), P(side * CW, y1, z0)];
    const flat = (x0, x1, y, z0, z1) => [P(x0, y, z0), P(x1, y, z0), P(x1, y, z1), P(x0, y, z1)];
    const nz = Math.max(cam.cz + 0.12, 0.2);

    // พื้นหลังมืด + ผนังปลายทาง
    s += `<rect x="-200" y="-200" width="1480" height="2320" fill="#07090D"/>`;
    // เพดาน / พื้น / ผนัง (ไล่สีตามระยะด้วย gradient แนวรัศมีที่จุดหาย)
    s += quad(flat(-CW, CW, CEIL, nz, END), "#2C3238");
    s += quad(flat(-CW, CW, FLOOR, nz, END), "#4B4A44");
    s += quad(wall(-1, nz, END, CEIL, FLOOR), "#5E6B5F");
    s += quad(wall(1, nz, END, CEIL, FLOOR), "#596657");
    // บัวผนังล่างสีเข้ม (ทาสีครึ่งล่างแบบหอเก่า)
    s += quad(wall(-1, nz, END, 70, FLOOR), "#3E4A44") + quad(wall(1, nz, END, 70, FLOOR), "#3A453F");
    s += quad(wall(-1, nz, END, 64, 72), "#2A332E") + quad(wall(1, nz, END, 64, 72), "#28302B");

    // กระเบื้องพื้น
    let tiles = "";
    for (let z = Math.ceil(nz / 0.6) * 0.6; z < END; z += 0.6) { const a = P(-CW, FLOOR, z), b = P(CW, FLOOR, z); tiles += `M${f(a[0])},${f(a[1])}L${f(b[0])},${f(b[1])}`; }
    for (let x = -CW; x <= CW; x += 50) { const a = P(x, FLOOR, nz), b = P(x, FLOOR, END); tiles += `M${f(a[0])},${f(a[1])}L${f(b[0])},${f(b[1])}`; }
    s += `<path d="${tiles}" stroke="#2F2E2A" stroke-width="2.5" opacity=".7"/>`;
    // คราบบนพื้น/ผนัง/เพดาน (สุ่มคงที่)
    const r = RK.rng(4242);
    for (let i = 0; i < 26; i++) {
      const z = 1 + r() * (END - 2), x = (r() - 0.5) * 2 * CW * 0.9, c = P(x, FLOOR, z), sc = cam.scaleAt(z);
      if (z <= nz) continue;
      s += `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${f(40 * sc * (0.6 + r()))}" ry="${f(9 * sc * (0.6 + r()))}" fill="#26241F" opacity="${f(0.25 + r() * 0.3)}"/>`;
    }
    // คราบน้ำไหลบนผนัง
    for (let i = 0; i < 16; i++) {
      const side = i % 2 ? 1 : -1, z0 = 1.5 + r() * 26, len = 0.2 + r() * 0.5;
      if (z0 <= nz) continue;
      s += quad(wall(side, z0, z0 + len * 0.3, CEIL + 5, CEIL + 60 + r() * 140), "#3F4A40", `opacity="${f(0.35 + r() * 0.3)}"`);
    }
    // สีลอกเป็นหย่อม
    for (let i = 0; i < 14; i++) {
      const side = i % 2 ? -1 : 1, z0 = 1.2 + r() * 26, y0 = -60 + r() * 110;
      if (z0 <= nz) continue;
      const pts = [P(side * CW, y0, z0), P(side * CW, y0 - 14, z0 + 0.25), P(side * CW, y0 + 6, z0 + 0.55), P(side * CW, y0 + 26, z0 + 0.3)];
      s += quad(pts, "#8E968A", `stroke="${INK}" stroke-width="1.5" opacity=".75"`);
    }
    // ท่อร้อยสายไฟ + กล่องพักสาย ตามแนวผนังบน
    const pa = P(-CW + 2, CEIL + 22, nz), pb = P(-CW + 2, CEIL + 22, END);
    s += `<path d="M${f(pa[0])},${f(pa[1])}L${f(pb[0])},${f(pb[1])}" stroke="#1F2420" stroke-width="${f(10 * cam.scaleAt(nz + 0.5))}" opacity=".9"/>`;
    for (let z = 4; z < END; z += 5) if (z > nz) s += quad(wall(-1, z, z + 0.18, CEIL + 12, CEIL + 34), "#3A403A", `stroke="${INK}" stroke-width="1.5"`);

    // ประตูห้อง (ไกล → ใกล้) + เลขห้อง + พรม + รองเท้า
    const items = [];
    DOORS.forEach((z, i) => {
      [-1, 1].forEach((side) => {
        if (z + 1 <= nz) return;
        const num = 400 + i * 2 + (side > 0 ? 2 : 1);
        items.push({ z, draw: () => {
          let d = "";
          d += quad(wall(side, z - 0.08, z + 1.08, -70, FLOOR), "#2A2620"); // วงกบ
          const ajar = env.ajar === num;
          d += quad(wall(side, z, z + 1, -60, FLOOR), ajar ? "#050506" : (i % 3 === 1 ? "#6B4A33" : "#5A3E2C"));
          if (!ajar) {
            d += quad(wall(side, z + 0.12, z + 0.88, -40, 40), "#4A3324", `opacity=".8"`); // ลูกฟัก
            d += quad(wall(side, z + 0.12, z + 0.88, 55, 140), "#4A3324", `opacity=".8"`);
            const kb = P(side * CW, 60, z + (side < 0 ? 0.85 : 0.15)), ks = cam.scaleAt(z);
            d += `<circle cx="${f(kb[0])}" cy="${f(kb[1])}" r="${f(Math.max(1.5, 5 * ks))}" fill="#B9A36A"/>`;
            const ph = P(side * CW, -10, z + 0.5);
            d += `<circle cx="${f(ph[0])}" cy="${f(ph[1])}" r="${f(Math.max(1, 2.4 * ks))}" fill="#111"/>`;
          } else {
            const g = P(side * CW, 20, z + 0.5);
            d += `<ellipse cx="${f(g[0])}" cy="${f(g[1])}" rx="${f(6 * cam.scaleAt(z))}" ry="${f(10 * cam.scaleAt(z))}" fill="#fff" opacity=".5"/>`;
          }
          // ป้ายเลขห้อง
          const np = P(side * CW, -85, z + 0.5), sc = cam.scaleAt(z + 0.5);
          if (sc > 0.18) d += `<g transform="translate(${f(np[0])},${f(np[1])}) scale(${f(sc)})"><rect x="-32" y="-15" width="64" height="30" rx="4" fill="#D9D2B8" stroke="${INK}" stroke-width="3"/><text x="0" y="10" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="24" fill="#2B2B2B">${num}</text></g>`;
          // พรมเช็ดเท้า + รองเท้า/รองเท้าแตะ
          const mx = side * (CW - 30);
          d += quad([P(mx - 25, FLOOR, z + 0.1), P(mx + 25, FLOOR, z + 0.1), P(mx + 25, FLOOR, z + 0.9), P(mx - 25, FLOOR, z + 0.9)], i % 2 ? "#6E2F2B" : "#3C4E5E", `opacity=".85"`);
          if ((i + (side > 0 ? 1 : 0)) % 2 === 0) {
            const sp = P(side * (CW - 55), FLOOR, z + 0.95), ss = cam.scaleAt(z + 0.95);
            d += `<g transform="translate(${f(sp[0])},${f(sp[1])}) scale(${f(ss)})"><ellipse cx="-12" cy="-4" rx="11" ry="5" fill="#C9C1AE" stroke="${INK}" stroke-width="2"/><ellipse cx="12" cy="-2" rx="11" ry="5" fill="#C9C1AE" stroke="${INK}" stroke-width="2"/></g>`;
          }
          return d;
        } });
      });
    });
    // ถังดับเพลิง + กระดาษประกาศ + ถุงขยะ
    items.push({ z: 9.4, draw: () => {
      const a = P(CW, -20, 9.3), b = P(CW, 70, 9.6);
      return quad(wall(1, 9.3, 9.6, -20, 70), "#A62B26", `stroke="${INK}" stroke-width="2"`) + quad(wall(1, 9.33, 9.57, -8, 14), "#E8E3D3");
    } });
    items.push({ z: 5.9, draw: () => quad(wall(-1, 5.9, 6.3, -40, 10), "#E6E0C8", `stroke="${INK}" stroke-width="1.5" opacity=".9"`) + quad(wall(-1, 5.95, 6.25, -30, -24), "#9A2F2A") });
    items.push({ z: 13.2, draw: () => { const c = P(-CW + 40, FLOOR, 13.2), sc = cam.scaleAt(13.2); return `<g transform="translate(${f(c[0])},${f(c[1])}) scale(${f(sc)})"><path d="M-36,0 Q-44,-60 -6,-70 Q4,-84 14,-70 Q44,-58 36,0Z" fill="#1A1A1D" stroke="${INK}" stroke-width="3"/><path d="M-6,-70 l-6,-12 M14,-70 l8,-12" stroke="#1A1A1D" stroke-width="5"/></g>`; } });

    // ผนังปลายทาง: หน้าต่างลูกกรง + แสงจันทร์ + ป้ายทางออก
    items.push({ z: END, draw: () => {
      let d = quad([P(-CW, CEIL, END), P(CW, CEIL, END), P(CW, FLOOR, END), P(-CW, FLOOR, END)], "#3E4A40");
      d += quad([P(-60, -60, END), P(60, -60, END), P(60, 70, END), P(-60, 70, END)], "#9CB8D8");
      const m = P(25, -30, END), ms = cam.scaleAt(END);
      d += `<circle cx="${f(m[0])}" cy="${f(m[1])}" r="${f(18 * ms)}" fill="#F4F2E6"/>`;
      for (let x = -45; x <= 45; x += 18) { const a = P(x, -60, END), b = P(x, 70, END); d += `<path d="M${f(a[0])},${f(a[1])}L${f(b[0])},${f(b[1])}" stroke="#14161A" stroke-width="${f(Math.max(1.5, 4 * ms))}"/>`; }
      const e = P(0, -100, END);
      d += `<g transform="translate(${f(e[0])},${f(e[1])}) scale(${f(ms)})"><rect x="-46" y="-16" width="92" height="32" rx="3" fill="#13A35A" opacity="${f(0.6 + 0.4 * RK.noise1(t * 3, 3))}"/><text x="0" y="9" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="22" fill="#E9FFF1">ทางออก</text></g>`;
      return d;
    } });

    // หลอดไฟบนเพดาน + แสงตกบนพื้น
    LIGHTS.forEach((z, i) => {
      if (z <= nz) return;
      items.push({ z: z + 0.01, draw: () => {
        const L = lv[i];
        let d = "";
        const fx = quad(flat(-62, 62, CEIL + 0.5, z - 0.16, z + 0.16), "#B9BDB4") + quad(flat(-55, -8, CEIL + 1, z - 0.12, z + 0.12), L > 0.3 ? "#F1F8EC" : "#59605A") + quad(flat(8, 55, CEIL + 1, z - 0.12, z + 0.12), L > 0.3 ? "#F1F8EC" : "#59605A");
        const pool = P(0, FLOOR, z + 0.3), ps = cam.scaleAt(z + 0.3);
        d += `<ellipse cx="${f(pool[0])}" cy="${f(pool[1])}" rx="${f(190 * ps)}" ry="${f(46 * ps)}" fill="url(#poolGlow)" opacity="${f(0.75 * L)}"/>`;
        const wl = P(-CW, 20, z), wr = P(CW, 20, z), ws = cam.scaleAt(z);
        d += `<ellipse cx="${f(wl[0])}" cy="${f(wl[1])}" rx="${f(70 * ws)}" ry="${f(150 * ws)}" fill="url(#poolGlow)" opacity="${f(0.35 * L)}"/>`;
        d += `<ellipse cx="${f(wr[0])}" cy="${f(wr[1])}" rx="${f(70 * ws)}" ry="${f(150 * ws)}" fill="url(#poolGlow)" opacity="${f(0.35 * L)}"/>`;
        d += fx;
        const c = P(0, CEIL + 2, z), cs = cam.scaleAt(z);
        d += `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${f(160 * cs)}" ry="${f(40 * cs)}" fill="url(#lampGlow)" opacity="${f(L)}"/>`;
        return d;
      } });
    });

    // ---------- รายละเอียดเล็กๆ ----------
    const at = (x, y, z) => { const q = P(x, y, z); return `translate(${f(q[0])},${f(q[1])}) scale(${f(cam.scaleAt(z))})`; };
    const R2 = RK.rng(909);
    DOORS.forEach((z, i) => [-1, 1].forEach((side) => {
      if (z + 1 <= nz) return;
      items.push({ z: z + 0.02, draw: () => {
        let d = "";
        // บานพับ 2 ตัว (ฝั่งตรงข้ามลูกบิด)
        const hz = side < 0 ? z + 0.04 : z + 0.96;
        [ -40, 110 ].forEach((y) => { d += quad(wall(side, hz - 0.02, hz + 0.02, y, y + 18), "#8A7D5C", `stroke="${INK}" stroke-width="1"`); });
        // ช่องระบายลมเหนือประตู (บานเกล็ด)
        d += quad(wall(side, z + 0.1, z + 0.9, -112, -72), "#2A2620", `stroke="${INK}" stroke-width="1.2"`);
        for (let y = -108; y < -74; y += 7) { const a = P(side * CW, y, z + 0.12), b = P(side * CW, y, z + 0.88); d += `<path d="M${f(a[0])},${f(a[1])}L${f(b[0])},${f(b[1])}" stroke="#57503F" stroke-width="${f(Math.max(0.8, 2.2 * cam.scaleAt(z)))}"/>`; }
        // ช่องเสียบจดหมาย + รอยขีดข่วน + สติกเกอร์ซีด
        d += quad(wall(side, z + 0.35, z + 0.65, 92, 100), "#2A2A2A");
        if (i % 2 === 0) d += quad(wall(side, z + 0.2, z + 0.34, -24, -4), "#C9B97A", `opacity=".65"`);
        const sc1 = P(side * CW, 20, z + 0.3), sc2 = P(side * CW, 48, z + 0.55);
        d += `<path d="M${f(sc1[0])},${f(sc1[1])}L${f(sc2[0])},${f(sc2[1])}" stroke="#7E5E44" stroke-width="${f(Math.max(0.6, 1.6 * cam.scaleAt(z)))}" opacity=".8"/>`;
        // สวิตช์ไฟ + ปลั๊ก ข้างวงกบ
        const sz = side < 0 ? z + 1.2 : z - 0.2;
        if (sz > nz) { d += quad(wall(side, sz, sz + 0.08, 30, 50), "#E8E2CF", `stroke="${INK}" stroke-width="1"`); d += quad(wall(side, sz, sz + 0.08, 140, 152), "#E8E2CF", `stroke="${INK}" stroke-width="1"`); }
        return d;
      } });
    }));
    // ร่มพิงประตู / กระถางต้นไม้ตาย / ชั้นวางรองเท้า
    items.push({ z: 4.4, draw: () => `<g transform="${at(CW - 12, FLOOR, 4.4)}"><path d="M0,0 L-30,-120" stroke="#1C1C22" stroke-width="7"/><path d="M-30,-120 q-10,-10 -2,-18" fill="none" stroke="#1C1C22" stroke-width="6"/><path d="M-6,-10 L-34,-104 L-14,-108Z" fill="#7A1F2E" stroke="${INK}" stroke-width="3"/></g>` });
    items.push({ z: 8.6, draw: () => `<g transform="${at(-CW + 24, FLOOR, 8.6)}"><path d="M-20,0 L-24,-40 L24,-40 L20,0Z" fill="#8C4A2E" stroke="${INK}" stroke-width="3"/><path d="M-4,-40 q-14,-50 -30,-60 M2,-40 q6,-40 22,-62 M0,-40 q2,-30 -4,-70" fill="none" stroke="#5E5A3A" stroke-width="4"/><path d="M-30,-100 q-6,6 -2,12 M24,-102 q8,4 4,12" fill="none" stroke="#6E6640" stroke-width="3"/></g>` });
    items.push({ z: 17.2, draw: () => `<g transform="${at(CW - 26, FLOOR, 17.2)}"><rect x="-26" y="-70" width="52" height="70" fill="none" stroke="#4A3B2C" stroke-width="5"/><path d="M-26,-46 L26,-46 M-26,-22 L26,-22" stroke="#4A3B2C" stroke-width="5"/><ellipse cx="-10" cy="-50" rx="10" ry="4" fill="#D8D2C2"/><ellipse cx="10" cy="-26" rx="10" ry="4" fill="#2F3E58"/><ellipse cx="-8" cy="-4" rx="11" ry="4" fill="#9B2E2E"/></g>` });
    // กล้องวงจรปิด / กระดิ่งไฟไหม้ / ไฟฉุกเฉิน
    items.push({ z: 5, draw: () => `<g transform="${at(CW - 6, CEIL + 16, 5)}"><rect x="-6" y="-4" width="12" height="16" fill="#5C5F66"/><path d="M-34,10 L4,4 L6,26 L-30,28Z" fill="#E4E2DA" stroke="${INK}" stroke-width="3"/><circle cx="-30" cy="19" r="6" fill="#1A1A1E"/><circle cx="-2" cy="10" r="2.5" fill="${RK.noise1(t * 2, 4) > 0.5 ? "#FF3B30" : "#5A1A1A"}"/></g>` });
    items.push({ z: 8.1, draw: () => `<g transform="${at(-CW + 2, -60, 8.1)}"><circle r="16" fill="#C62B26" stroke="${INK}" stroke-width="3"/><circle r="6" fill="#F0C8C2"/></g>` });
    items.push({ z: 16, draw: () => `<g transform="${at(0, CEIL + 4, 16)}"><rect x="-34" y="0" width="68" height="20" rx="3" fill="#E9E6DC" stroke="${INK}" stroke-width="3"/><circle cx="-22" cy="22" r="8" fill="#F7F3D0"/><circle cx="22" cy="22" r="8" fill="#F7F3D0"/></g>` });
    // หลอดไฟห้อย (หลอดดวงที่ 4 หลุดหนึ่งข้าง) + สายไฟห้อย
    items.push({ z: 14.05, draw: () => { const a = P(-40, CEIL + 2, 14), b = P(30, CEIL + 50 + Math.sin(t * 1.8) * 4, 14); return `<path d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}" stroke="#DDE3D8" stroke-width="${f(10 * cam.scaleAt(14))}" stroke-linecap="round"/>`; } });
    items.push({ z: 10.5, draw: () => { const a = P(-60, CEIL, 10.5), sc = cam.scaleAt(10.5), sw = Math.sin(t * 1.4) * 6; return `<path d="M${f(a[0])},${f(a[1])} q${f(sw * sc)},${f(30 * sc)} ${f(4 * sc)},${f(60 * sc)} q${f(-6 * sc)},${f(10 * sc)} ${f(6 * sc)},${f(18 * sc)}" fill="none" stroke="#141418" stroke-width="${f(Math.max(1, 2.5 * sc))}"/>`; } });
    // หยากไย่ตามมุมเพดาน
    [3.6, 9.8, 19.5].forEach((z, k) => items.push({ z, draw: () => {
      const sd = k % 2 ? 1 : -1, c = P(sd * CW, CEIL, z), sc = cam.scaleAt(z); let d = "";
      for (let a = 0; a < 6; a++) { const ang = (a / 5) * Math.PI / 2, dx = -sd * Math.cos(ang) * 70 * sc, dy = Math.sin(ang) * 70 * sc; d += `M${f(c[0])},${f(c[1])} l${f(dx)},${f(dy)}`; }
      for (let r = 1; r <= 3; r++) d += `M${f(c[0] - sd * r * 22 * sc)},${f(c[1])} Q${f(c[0] - sd * r * 14 * sc)},${f(c[1] + r * 14 * sc)} ${f(c[0])},${f(c[1] + r * 22 * sc)}`;
      return `<path d="${d}" fill="none" stroke="#C9CCC4" stroke-width="${f(Math.max(0.6, 1.4 * sc))}" opacity=".5"/>`;
    } }));
    // ประกาศหอพัก
    items.push({ z: 12.8, draw: () => quad(wall(-1, 12.8, 13.25, -50, 10), "#EDE6CC", `stroke="${INK}" stroke-width="1.2"`) + `<g transform="${at(-CW, -38, 13.02)}"><text x="0" y="0" font-family="Kanit" font-weight="700" font-size="9" fill="#9A2F2A" text-anchor="middle" transform="skewY(${f(-8)})">ห้ามส่งเสียงดัง</text><text x="0" y="12" font-family="Kanit" font-size="7" fill="#333" text-anchor="middle">หลัง 22.00 น.</text></g>` });
    // พื้น: รอยร้าว, ก้นบุหรี่, กระดาษขยำ, แอ่งน้ำสะท้อนไฟ, ฝุ่นเป็นก้อน
    for (let k = 0; k < 7; k++) {
      const z = 1.6 + R2() * 20, x0 = (R2() - 0.5) * 220;
      if (z <= nz) continue;
      const pts = [P(x0, FLOOR, z)]; let x = x0, zz = z;
      for (let j = 0; j < 5; j++) { x += (R2() - 0.5) * 40; zz += 0.12 + R2() * 0.2; pts.push(P(x, FLOOR, zz)); }
      items.push({ z, draw: () => `<polyline points="${RK.pts(pts)}" fill="none" stroke="#24231F" stroke-width="${f(Math.max(0.8, 2.2 * cam.scaleAt(z)))}" opacity=".8"/>` });
    }
    for (let k = 0; k < 14; k++) {
      const z = 1.4 + R2() * 18, x = (R2() - 0.5) * 260, rot = R2() * 180, kind = k % 3;
      if (z <= nz) continue;
      items.push({ z, draw: () => `<g transform="${at(x, FLOOR, z)} rotate(${f(rot)})">` + (kind === 0 ? `<rect x="-6" y="-2" width="12" height="4" fill="#E8E2D4"/><rect x="4" y="-2" width="4" height="4" fill="#C98B4A"/>` : kind === 1 ? `<path d="M-9,-3 L-4,-8 L5,-6 L9,1 L3,6 L-6,5Z" fill="#DCD6C6" stroke="${INK}" stroke-width="1"/>` : `<ellipse rx="8" ry="4" fill="#5E5A52" opacity=".6"/>`) + `</g>` });
    }
    items.push({ z: 6.6, draw: () => { const c = P(30, FLOOR, 6.6), sc = cam.scaleAt(6.6), L = lv[1]; return `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${f(70 * sc)}" ry="${f(14 * sc)}" fill="#2B3236" opacity=".85"/><ellipse cx="${f(c[0] + 6 * sc)}" cy="${f(c[1] - 2 * sc)}" rx="${f(30 * sc)}" ry="${f(4 * sc)}" fill="#E9F5DD" opacity="${f(0.5 * L)}"/>`; } });
    // คราบดำตามขอบพื้น-ผนัง
    s += quad(wall(-1, nz, END, 140, FLOOR), "#1E2421", `opacity=".45"`) + quad(wall(1, nz, END, 140, FLOOR), "#1E2421", `opacity=".45"`);
    items.sort((a, b) => b.z - a.z);
    s += items.map((it) => it.draw()).join("");
    // ความมืดตามระยะ (หมอก) + ความมืดรวมตามไฟ
    const vp = P(0, 20, END);
    s += `<ellipse cx="${f(vp[0])}" cy="${f(vp[1])}" rx="520" ry="700" fill="url(#depthFog)"/>`;
    // ความมืดรวม: ส่งให้ตัวเรนเดอร์ไปทาทับทั้งฉากและตัวละคร
    return { svg: s, floorY: FLOOR, avgLight: avg, lightLevels: lv, dark: RK.clamp(0.62 - avg * 0.5 + (env.dark || 0)) };
  };
  RK.sets.corridor.FLOOR = FLOOR;
  RK.sets.corridor.CW = CW;
})(window);

// ฉากสตูดิโอเปล่า (ใช้ทำตารางตัวละคร)
(function (G) {
  const RK = G.RK;
  RK.sets.studio = function (cam, t, env = {}) {
    let s = `<defs><linearGradient id="stBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3EBDD"/><stop offset="1" stop-color="#E2D3BC"/></linearGradient></defs>`;
    s += `<rect x="-200" y="-200" width="1480" height="2320" fill="url(#stBg)"/><rect x="-200" y="${env.floor || 1500}" width="1480" height="900" fill="#CDBB9E"/>`;
    for (let y = (env.floor || 1500) - 100; y > 200; y -= 100) s += `<path d="M0,${y} L1080,${y}" stroke="#C9B89C" stroke-width="2" stroke-dasharray="10 10"/>`;
    if (env.title) s += `<text x="540" y="150" text-anchor="middle" font-family="Kanit" font-weight="900" font-size="64" fill="#3A2E24">${RK.esc(env.title)}</text>`;
    (env.labels || []).forEach(({ x, y, text: txt }) => { s += `<text x="${x}" y="${y}" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="34" fill="#3A2E24">${RK.esc(txt)}</text>`; });
    return { svg: s, dark: 0 };
  };
})(window);
