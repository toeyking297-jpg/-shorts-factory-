// flat_walk.js — วงจรการเดินแบบแอนิเมเตอร์ (ด้านข้าง)
// ท่าหลักต่อขา: Contact (0) → Down → Passing → Up → (ขาอีกข้าง Contact ที่ 0.5)
// เท้า: ส้นแตะ → ฝ่าเท้าราบ → ส้นยก → ปลายเท้าถีบ (หมุนรอบส้น/ปลายเท้า ล็อกกับพื้น) → ยกพ้นพื้นช่วงเหวี่ยง
// ทุกช่องสัญญาณกำหนดด้วยคีย์เฟรมตามช่วง (Hermite) ไม่ใช่ sine เดียวคุมทุกข้อต่อ
// ใช้ได้ทั้งในเบราว์เซอร์และ Node (สำหรับสคริปต์ตรวจคุณภาพ)
(function (G) {
  const RK = G.RK || (G.RK = {});
  const D2R = Math.PI / 180;
  const THIGH = 225, SHIN = 205, LEGL = THIGH + SHIN;
  const ANK_Y = -30, GROUND = 6;                 // ข้อเท้าตอนยืน / ระดับพื้น (หน่วยตัวละคร)
  RK.FLAT_GROUND = GROUND;
  // จุดหมุนเท้า (เทียบข้อเท้า ก่อนหมุน): ส้นเท้า และปลายเท้า ที่พื้นรองเท้า
  const FOOT = { heel: [-30, 36], toe: [80, 36] };
  RK.FLAT_FOOT = FOOT;

  const ss = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const rot = (p, ang) => { const c = Math.cos(ang * D2R), s = Math.sin(ang * D2R); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };

  // Hermite ผ่านคีย์ [[u,v],...] แบบวนรอบ (periodic) — ความชันจากเพื่อนบ้าน (Catmull-Rom ไม่สม่ำเสมอ)
  function cyc(keys, u) {
    const n = keys.length; u = ((u % 1) + 1) % 1;
    let i = -1; for (let k = 0; k < n; k++) if (keys[k][0] <= u) i = k;
    let uu = u; if (i < 0) { i = n - 1; uu = u + 1; }
    const K = (j) => [keys[((j % n) + n) % n][0] + Math.floor(j / n), keys[((j % n) + n) % n][1]];
    const p0 = K(i - 1), p1 = K(i), p2 = K(i + 1), p3 = K(i + 2), h = p2[0] - p1[0], t = (uu - p1[0]) / h;
    const m1 = (p2[1] - p0[1]) / (p2[0] - p0[0]) * h, m2 = (p3[1] - p1[1]) / (p3[0] - p1[0]) * h;
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2;
  }
  // Hermite เปิด (ไม่วน) ผ่านคีย์ + ความชันปลายกำหนดเอง
  function open(keys, x, m0, mN) {
    const n = keys.length; if (x <= keys[0][0]) return keys[0][1]; if (x >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0; while (keys[i + 1][0] < x) i++;
    const a = keys[i], b = keys[i + 1], h = b[0] - a[0], t = (x - a[0]) / h;
    const sl = (j) => j === 0 ? m0 : j === n - 1 ? mN : (keys[j + 1][1] - keys[j - 1][1]) / (keys[j + 1][0] - keys[j - 1][0]);
    const ma = sl(i) * h, mb = sl(i + 1) * h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * a[1] + (t3 - 2 * t2 + t) * ma + (-2 * t3 + 3 * t2) * b[1] + (t3 - t2) * mb;
  }

  // ---------- บุคลิกการเดิน ----------
  const BASE = {
    strideK: 1, beta: 0.6, bounce: 1, armF: 19, armB: 14, armFwd: 3, elb0: 12, elb1: 22, wrist: 10,
    lean: 3, leanOsc: 1.4, lift: 1, heelStrike: 15, toeOff: 32, crouch: 0.972, shoulder: 5, headStab: 0.55,
    asymLift: 0.96, asymArm: 0.9, asymStep: 0.0, cadence: 0.95,
  };
  RK.FLAT_GAIT = {
    phum: { cadence: 0.95 },
    prang: { strideK: 0.92, bounce: 0.85, armF: 15, armB: 11, elb0: 14, lean: 2, heelStrike: 13, toeOff: 30, cadence: 0.98 },
    khaohom: { strideK: 0.95, beta: 0.56, bounce: 1.55, armF: 24, armB: 18, elb0: 18, elb1: 24, lift: 1.35, heelStrike: 17, toeOff: 36, lean: 2.5, cadence: 1.25, asymArm: 0.84 },
    boon: { strideK: 0.6, beta: 0.68, bounce: 0.45, armF: 8, armB: 6, elb0: 24, elb1: 10, lift: 0.6, heelStrike: 7, toeOff: 18, crouch: 0.955, lean: 1, leanOsc: 0.6, shoulder: 2.5, cadence: 0.72, asymLift: 0.9 },
    te: { strideK: 1.08, bounce: 1.3, armF: 25, armB: 20, elb0: 8, elb1: 18, wrist: 16, lean: 4.5, toeOff: 38, shoulder: 7, cadence: 1.0, asymArm: 0.85 },
    jan: { strideK: 0.86, bounce: 0.7, armF: 12, armB: 9, elb0: 18, heelStrike: 7, toeOff: 26, lean: 1.5, leanOsc: 0.9, shoulder: 3.5, cadence: 1.05 },
    mali: { strideK: 0.85, bounce: 0.9, armF: 14, armB: 11, elb0: 16, lean: 1.5, cadence: 0.9 },
    chai: { strideK: 0.88, bounce: 1.15, armF: 14, armB: 11, elb0: 20, armFwd: 9, lean: -0.5, leanOsc: 1.8, cadence: 0.86, asymLift: 0.93 },
    piak: { strideK: 0.9, bounce: 1.05, armF: 17, armB: 13, lean: 2, cadence: 0.95 },
  };
  // วิ่ง: ช่วงรับน้ำหนักสั้น มีช่วงลอยตัว ส้นเตะสูง แขนงอเกือบฉากแกว่งแรง ลำตัวเอนหน้า
  const RUN = { strideK: 1.75, beta: 0.36, heelStrike: 4, toeOff: 44, swX: [0.1, 0.72], swY: [150, 100, 26], lift: 1, armF: 38, armB: 34, armFwd: 8,
    elb0: 78, elb1: 16, wrist: 6, lean: 9, leanOsc: 2.2, crouch: 0.94, shoulder: 8, headStab: 0.7, cadence: 1.45,
    hipKeys: [[0, 0], [0.12, 14], [0.3, -4], [0.42, -16], [0.5, 0], [0.62, 14], [0.8, -4], [0.92, -16]] };
  RK.flatGait = (who, run) => Object.assign({}, BASE, RK.FLAT_GAIT[who] || {}, run ? RUN : {});
  RK.FLAT_STRIDE_BASE = 520;
  RK.flatStride = (who, run) => RK.FLAT_STRIDE_BASE * RK.flatGait(who, run).strideK;

  // ---------- เท้า 1 ข้าง ณ เฟสขา u (0 = ส้นแตะพื้น) ----------
  // คืน ankle (เทียบสะโพกแกน x, y ในพิกัดตัว), ang (องศา + = ปลายเท้าทิ่มลง), stance, pivot (จุดล็อกกับพื้น)
  function footAt(g, u, liftK) {
    u = ((u % 1) + 1) % 1;
    const L = RK.FLAT_STRIDE_BASE * g.strideK, B = g.beta;
    const heel0 = 0.5 * B * L - 34;               // ส้นเท้าอยู่หน้าสะโพกเท่านี้ตอนแตะพื้น
    const flatU = B * 0.14, offU = B * 0.58;      // ฝ่าเท้าราบเมื่อ / ส้นเริ่มยกเมื่อ
    const stanceAt = (uu) => {
      const d = uu * L, hx = heel0 - d;            // ส้นเท้าล็อกกับพื้น (สะโพกเคลื่อนไปหน้า d)
      let ang, piv, loc;
      if (uu < flatU) { ang = -g.heelStrike * (1 - ss(uu / flatU)); piv = [hx, GROUND]; loc = FOOT.heel; }
      else if (uu < offU) { ang = 0; piv = [hx, GROUND]; loc = FOOT.heel; }
      else { const q = (uu - offU) / (B - offU); ang = g.toeOff * Math.pow(ss(q), 1.25); piv = [hx + FOOT.toe[0] - FOOT.heel[0], GROUND]; loc = FOOT.toe; }
      const r = rot(loc, ang);
      return { A: [piv[0] - r[0], piv[1] - r[1]], ang, piv, stance: true };
    };
    if (u <= B) return stanceAt(u);
    // ช่วงเหวี่ยง: Hermite จากท่าปลายเท้าถีบ → Contact รอบถัดไป
    const s = (u - B) / (1 - B), a0 = stanceAt(B), a1 = stanceAt(0), sw = 1 - B;
    const sx = g.swX || [0.22, 0.66], sy = g.swY || [62, 36, 10];
    const x = open([[0, a0.A[0]], [0.3, lerp(a0.A[0], a1.A[0], sx[0])], [0.6, lerp(a0.A[0], a1.A[0], sx[1])], [1, a1.A[0]]], s, -L * 0.25 * sw, -L * 0.18 * sw);
    const yTop = ANK_Y;
    const y = open([[0, a0.A[1]], [0.28, yTop - sy[0] * g.lift * liftK], [0.58, yTop - sy[1] * g.lift * liftK], [0.86, yTop - sy[2] * g.lift * liftK], [1, a1.A[1]]], s, -60 * sw, 30 * sw);
    const ang = open([[0, a0.ang], [0.3, g.toeOff * 0.55], [0.62, 2], [0.9, -g.heelStrike * 0.85], [1, a1.ang]], s, -20 * sw, 0);
    return { A: [x, y], ang, stance: false };
  }

  // ---------- IK สองท่อน (เข่างอไปทางหน้าเสมอ, จำกัดการเหยียด) ----------
  RK.flatIK = function (H, A) {
    let dx = A[0] - H[0], dy = A[1] - H[1], d = Math.hypot(dx, dy);
    const maxD = LEGL * 0.998, minD = 60;
    const dd = Math.max(minD, Math.min(d, maxD));
    const base = Math.atan2(dy, dx), g = Math.acos(Math.max(-1, Math.min(1, (THIGH * THIGH + dd * dd - SHIN * SHIN) / (2 * THIGH * dd))));
    const k1 = [H[0] + THIGH * Math.cos(base - g), H[1] + THIGH * Math.sin(base - g)], k2 = [H[0] + THIGH * Math.cos(base + g), H[1] + THIGH * Math.sin(base + g)];
    const K = k1[0] > k2[0] ? k1 : k2;
    const ang = Math.atan2(A[1] - K[1], A[0] - K[0]);
    return { K, A: [K[0] + SHIN * Math.cos(ang), K[1] + SHIN * Math.sin(ang)], stretched: d > maxD };
  };

  // ---------- ท่าเดินทั้งตัว ณ เฟส p (ขาใกล้) ----------
  RK.flatWalkPose = function (who, p, w = 1, run = false) {
    const g = RK.flatGait(who, run);
    const fn = footAt(g, p, 1), ff = footAt(g, p + 0.5, g.asymLift);
    // สะโพก: คีย์ต่อครึ่งรอบ (Contact 0, Down .09, Passing .22, Up .33) ค่าบวก = ลง
    const hk = (o) => [[0 + o, 2], [0.09 + o, 9], [0.22 + o, 0], [0.33 + o, -7], [0.43 + o, -2]];
    const hipKeys = g.hipKeys || [...hk(0), ...hk(0.5).map(([u, v]) => [u, v * 0.94])];
    let hipDy = cyc(hipKeys, p) * g.bounce;
    const stand = ANK_Y - LEGL * g.crouch;
    let hy = stand + hipDy;
    // ห้ามยืดขาเกิน: ทั้งสองเท้าต้องเอื้อมถึงเสมอ (คิดตลอดรอบ ไม่สลับเปิดปิดตามช่วง จึงไม่เกิดจุดกระตุก)
    // ใช้ soft-max ทำให้สะโพกค่อย ๆ ลดลงแทนการหักมุม
    const reach = LEGL * 0.996, sm = 3.5;
    for (const F of [fn, ff]) {
      const need = F.A[1] - Math.sqrt(Math.max(0, reach * reach - F.A[0] * F.A[0]));
      hy = Math.max(hy, need) + sm * Math.log(1 + Math.exp(-Math.abs(hy - need) / sm));
    }
    // ลำตัว/อก: เอนตามจังหวะลงน้ำหนัก (ชดเชยสะโพก)
    const lk = (o) => [[0 + o, 0.6], [0.09 + o, 1.6], [0.22 + o, 0.2], [0.33 + o, -0.6], [0.43 + o, 0]];
    const lean = g.lean + cyc([...lk(0), ...lk(0.5)], p) * g.leanOsc;
    // ไหล่ใกล้/ไกล ขยับหน้า-หลังสวนกับขาข้างเดียวกัน (หมุนลำตัวในมุมด้านข้าง)
    const shK = [[0, -1], [0.12, -0.9], [0.27, 0], [0.5, 1], [0.62, 0.9], [0.77, 0]];
    const shN = cyc(shK, p) * g.shoulder, shF = -shN;
    // แขน: ไหล่นำ ศอกตามหลัง 0.06 ข้อมือตามหลังอีก
    const armK = (A, Bk) => [[0, -Bk], [0.07, -Bk * 0.96], [0.25, -Bk * 0.15], [0.5, A], [0.57, A * 0.96], [0.75, A * 0.12]];
    const arm = (u, k) => {
      const up = cyc(armK(g.armF * k, g.armB * k), u) + g.armFwd;
      const fw = (cyc(armK(1, 1), u - 0.06) + 1) / 2;   // 0 = หลังสุด, 1 = หน้าสุด (ตามหลังไหล่)
      const elb = g.elb0 + g.elb1 * Math.pow(Math.max(0, fw), 1.5);
      const vel = cyc(armK(1, 1), u - 0.1) - cyc(armK(1, 1), u - 0.16); // ความเร็วแขนที่หน่วงแล้ว
      return [up, elb, -vel * g.wrist * 2.2];
    };
    const an = arm(p + 0.5, 1), af = arm(p, g.asymArm); // แขนใกล้สวนขาใกล้
    // ศีรษะ: ชดเชยการขึ้นลงบางส่วน (รักษาระดับสายตา) + เอียงสวนอก หน่วงเล็กน้อย
    const lagDy = cyc(hipKeys, p - 0.04) * g.bounce;
    const headDy = -g.headStab * lagDy;
    const headTilt = -(lean - g.lean) * 0.7 - g.lean * 0.5;
    // ผม/ผ้า: ตามความเร่งแนวดิ่งที่หน่วง
    const sway = (cyc(hipKeys, p - 0.12) - cyc(hipKeys, p - 0.2)) * 0.08 * g.bounce;
    const W = (a, b) => lerp(a, b, w);
    return {
      g, hipY: W(stand + 0, hy), lean: W(0, lean), shN: shN * w, shF: shF * w,
      feet: { n: fn, f: ff }, arms: { n: an, f: af }, headDy: headDy * w, headTilt: headTilt * w, sway: sway * w,
    };
  };
  RK._walkInternals = { footAt, cyc, open, THIGH, SHIN, GROUND, ANK_Y };
  if (typeof module !== "undefined") module.exports = RK;
})(typeof window !== "undefined" ? window : globalThis);
