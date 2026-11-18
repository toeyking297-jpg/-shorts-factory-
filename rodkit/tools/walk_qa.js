// ตรวจคุณภาพวงจรเดิน: เท้าไถล, เท้าจมพื้น, เข่ากระตุก, ขายืด, รอยต่อจุดวนลูป
const RK = require("../web/lib/flat_walk.js");
const { GROUND } = RK._walkInternals, F = RK.FLAT_FOOT;
const rot = (p, a) => { const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
const who = process.argv.slice(2).length ? process.argv.slice(2) : ["phum", "prang", "khaohom", "boon", "te", "jan", "mali", "chai", "piak"];
const FPS = 30, CYC = 3;
const rows = [];
for (const w of who) {
  const g = RK.flatGait(w), L = RK.flatStride(w), N = Math.round(FPS / g.cadence * CYC);
  let slide = 0, sink = 0, kneeJump = 0, stretch = 0, prevK = null, seam = 0, prev = null, maxKnee = 0, minKnee = 999;
  const lock = { n: null, f: null };
  for (let i = 0; i <= N; i++) {
    const p = (i / N) * CYC, bodyX = p * L, P = RK.flatWalkPose(w, p % 1, 1);
    const H = [0, P.hipY];
    for (const k of ["n", "f"]) {
      const Fo = P.feet[k], ik = RK.flatIK(H, Fo.A);
      if (ik.stretched) stretch++;
      const heel = rot(F.heel, Fo.ang), toe = rot(F.toe, Fo.ang);
      const hw = [bodyX + Fo.A[0] + heel[0], Fo.A[1] + heel[1]], tw = [bodyX + Fo.A[0] + toe[0], Fo.A[1] + toe[1]];
      sink = Math.max(sink, hw[1] - GROUND, tw[1] - GROUND);
      if (Fo.stance) {
        const piv = hw[1] >= GROUND - 0.5 && Fo.ang <= 0 ? hw : tw; // จุดที่แตะพื้น
        const key = Fo.ang <= 0 ? "heel" : "toe";
        if (lock[k] && lock[k].key === key) slide = Math.max(slide, Math.abs(piv[0] - lock[k].x));
        if (!lock[k] || lock[k].key !== key) lock[k] = { key, x: piv[0] };
      } else lock[k] = null;
      const kv = Math.atan2(ik.K[1] - H[1], ik.K[0] - H[0]) - Math.atan2(ik.A[1] - ik.K[1], ik.A[0] - ik.K[0]);
      const kd = Math.abs(kv * 180 / Math.PI); maxKnee = Math.max(maxKnee, kd); minKnee = Math.min(minKnee, kd);
      if (prevK && prevK[k] != null) kneeJump = Math.max(kneeJump, Math.abs(kd - prevK[k]));
      prevK = prevK || {}; prevK[k] = kd;
    }
    const sig = [P.hipY, P.lean, P.arms.n[0], P.arms.n[1], P.feet.n.A[0], P.feet.n.A[1]];
    if (prev) seam = Math.max(seam, ...sig.map((v, j) => Math.abs(v - prev[j])));
    prev = sig;
  }
  rows.push({ who: w, frames: N, "slide(u)": slide.toFixed(2), "sink(u)": Math.max(0, sink).toFixed(2), "kneeJump°/f": kneeJump.toFixed(1), "knee°min-max": minKnee.toFixed(0) + "-" + maxKnee.toFixed(0), stretched: stretch, "maxΔ/f": seam.toFixed(1) });
}
console.table(rows);
