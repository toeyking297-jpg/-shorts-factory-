// rodkit core: เวลา, คีย์เฟรม, สุ่มแบบคงที่, ตัวช่วยวาด SVG
(function (G) {
  const RK = (G.RK = G.RK || {});
  RK.W = 1080; RK.H = 1920;
  RK.INK = "#23203A";

  // ---------- สุ่มแบบคงที่ (seed เดิม = ภาพเดิมทุกครั้ง) ----------
  RK.rng = function (seed) {
    let s = (seed >>> 0) || 1;
    return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
  };
  RK.hash = (n) => { n = (n << 13) ^ n; return (1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0) * 0.5 + 0.5; };
  RK.noise1 = (x, seed = 0) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return RK.hash(i + seed * 131) * (1 - u) + RK.hash(i + 1 + seed * 131) * u; };

  // ---------- easing + คีย์เฟรม ----------
  RK.ease = {
    linear: (t) => t,
    in: (t) => t * t,
    out: (t) => 1 - (1 - t) * (1 - t),
    inout: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    back: (t) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    snap: (t) => 1 - Math.pow(1 - t, 4),
  };
  RK.lerp = (a, b, t) => a + (b - a) * t;
  RK.clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  // ค่าคงที่ หรือ [[t,v],[t,v,"ease"],...]
  RK.kf = function (v, t) {
    if (!Array.isArray(v) || !Array.isArray(v[0])) return v;
    if (t <= v[0][0]) return v[0][1];
    for (let i = 1; i < v.length; i++) {
      const [t1, v1, e] = v[i];
      if (t <= t1) {
        const [t0, v0] = v[i - 1];
        if (typeof v0 !== "number" || typeof v1 !== "number") return t - t0 < t1 - t ? v0 : v1;
        const k = (RK.ease[e || "inout"] || RK.ease.inout)((t - t0) / (t1 - t0 || 1));
        return RK.lerp(v0, v1, k);
      }
    }
    return v[v.length - 1][1];
  };
  // อ่านทุกฟิลด์ของ object ที่อาจเป็นคีย์เฟรม
  RK.resolve = function (o, t) {
    const r = {};
    for (const k in o) {
      const v = o[k];
      r[k] = Array.isArray(v) && Array.isArray(v[0]) ? RK.kf(v, t) : v;
    }
    return r;
  };

  // ---------- ตัวช่วย SVG ----------
  RK.f = (n) => (Math.round(n * 10) / 10).toString();
  RK.pts = (a) => a.map((p) => RK.f(p[0]) + "," + RK.f(p[1])).join(" ");
  RK.poly = (a, fill, extra = "") => `<polygon points="${RK.pts(a)}" fill="${fill}" ${extra}/>`;
  RK.g = (tr, inner, extra = "") => `<g transform="${tr}" ${extra}>${inner}</g>`;
  RK.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // เส้นโค้งผ่านจุด (Catmull-Rom → Bezier)
  RK.smooth = function (p, closed = false) {
    if (p.length < 2) return "";
    const P = closed ? [p[p.length - 1], ...p, p[0], p[1]] : [p[0], ...p, p[p.length - 1]];
    let d = `M${RK.f(P[1][0])},${RK.f(P[1][1])}`;
    for (let i = 1; i < P.length - 2; i++) {
      const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${RK.f(c1[0])},${RK.f(c1[1])} ${RK.f(c2[0])},${RK.f(c2[1])} ${RK.f(p2[0])},${RK.f(p2[1])}`;
    }
    return d + (closed ? "Z" : "");
  };
  // ขอบเส้นหยักๆ แบบวาดมือ
  RK.wobble = function (pts, amp, seed) {
    const r = RK.rng(seed);
    return pts.map((p) => [p[0] + (r() - 0.5) * amp, p[1] + (r() - 0.5) * amp]);
  };
  RK.shade = function (hex, k) { // k<0 มืดลง, k>0 สว่างขึ้น
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const m = (c) => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k);
    return "#" + ((1 << 24) | (m(r) << 16) | (m(g) << 8) | m(b)).toString(16).slice(1);
  };
})(window);
