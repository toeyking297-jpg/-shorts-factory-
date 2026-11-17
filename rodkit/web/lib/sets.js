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
        const fx = quad(flat(-55, 55, CEIL + 1, z - 0.12, z + 0.12), L > 0.3 ? "#F1F8EC" : "#59605A");
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
