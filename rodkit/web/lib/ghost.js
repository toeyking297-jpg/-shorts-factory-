// ผีผู้หญิงผมยาว ชุดขาว (ไม่มีเลือด ไม่สยองแบบโหด) — สูงกว่าคน ~1.25 เท่า
(function (G) {
  const RK = G.RK, f = RK.f, INK = RK.INK;
  // p: x,y,s, alpha, glitch(0..1), tilt, arm (0..1 ยื่นแขน), hairWave, face ("hidden"|"eye")
  RK.ghost = function (p, t) {
    const a = p.alpha ?? 1, tilt = p.tilt ?? 14, reach = p.arm || 0;
    const sway = Math.sin(t * 1.3) * 3, wave = (p.hairWave ?? 1) * Math.sin(t * 2.1);
    let s = "";
    // ชุดยาวขาด ปลายลอย (ไม่มีเท้าให้เห็นชัด)
    const r = RK.rng(311), hem = [];
    for (let i = 0; i <= 10; i++) hem.push([-150 + i * 30, (i % 2 ? 0 : -40) + (r() - 0.5) * 30 + Math.sin(t * 3 + i) * 8]);
    const dress = [[-70, -820], [70, -820], [120, -500], [160, -120], ...hem.reverse(), [-160, -120], [-120, -500]];
    s += `<path d="${RK.smooth(dress, true)}" fill="#E9ECEA" stroke="${INK}" stroke-width="7"/>`;
    s += `<path d="M-40,-760 Q-70,-420 -90,-80 M30,-740 Q60,-400 80,-100 M0,-600 Q-10,-300 10,-60" fill="none" stroke="#B9C2C4" stroke-width="10" stroke-linecap="round" opacity=".8"/>`;
    s += `<path d="M-150,-60 Q0,-10 150,-60" fill="none" stroke="#9AA6AA" stroke-width="16" opacity=".5"/>`;
    // แขนผอมยาว (ห้อยหรือยื่นมาข้างหน้า)
    const armG = (side) => {
      const ang = side * (6 + reach * 70) + Math.sin(t * 1.7 + side) * 2;
      return `<g transform="translate(${side * 70},-770) rotate(${f(-ang)})"><path d="M-16,0 L16,0 L12,520 L-12,520Z" fill="#D7DEDC" stroke="${INK}" stroke-width="6"/>` +
        `<g transform="translate(0,520)"><path d="M-14,0 L-30,70 M-6,4 L-12,96 M4,4 L6,100 M12,0 L26,84" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M-14,0 L-30,70 M-6,4 L-12,96 M4,4 L6,100 M12,0 L26,84" stroke="#D7DEDC" stroke-width="6" stroke-linecap="round"/></g></g>`;
    };
    s += armG(-1) + armG(1);
    // หัว + ผมยาวปิดหน้า
    let h = `<ellipse cx="0" cy="0" rx="78" ry="96" fill="#D7DEDC" stroke="${INK}" stroke-width="6"/>`;
    if (p.face === "eye") h += `<ellipse cx="22" cy="6" rx="14" ry="9" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="25" cy="7" r="4" fill="#111"/>`;
    const strands = [];
    for (let i = 0; i < 17; i++) {
      const x0 = -96 + i * 12, len = 520 + (i % 3) * 70;
      const pts = [];
      for (let k = 0; k <= 6; k++) pts.push([x0 * (1 + k * 0.06) + Math.sin(k * 0.9 + i + wave) * 12 * (k / 6), -96 + (len * k) / 6]);
      strands.push(`<path d="${RK.smooth(pts)}" fill="none" stroke="#0E0B10" stroke-width="${f(20 + (i % 4) * 4)}" stroke-linecap="round"/>`);
    }
    const face = p.face === "eye" ? `<path d="M10,-20 Q24,-10 40,-22 L44,40 Q24,30 6,40Z" fill="#D7DEDC"/>` : "";
    h = `<path d="M-90,-40 Q0,-150 90,-40 L96,60 L-96,60Z" fill="#0E0B10"/>` + h.replace(/^/, "") + strands.join("") + (p.face === "eye" ? `<g>${face}<ellipse cx="22" cy="6" rx="14" ry="9" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="25" cy="7" r="4" fill="#111"/></g>` : "");
    s += `<g transform="translate(0,-900) rotate(${f(tilt + sway)})">${h}</g>`;
    // ภาพเพี้ยน (เลื่อนเป็นแถบ)
    let body = s;
    if (p.glitch) {
      const off = (RK.noise1(t * 30, 7) - 0.5) * 60 * p.glitch;
      body = `<g opacity=".55" transform="translate(${f(off)},0)" style="mix-blend-mode:screen">${s}</g>` + s;
    }
    const glow = `<ellipse cx="0" cy="-450" rx="260" ry="560" fill="url(#ghostGlow)"/>`;
    return `<g transform="translate(${f(p.x)},${f(p.y)}) scale(${f(p.s || 1)})" opacity="${f(a)}">${glow}${body}</g>`;
  };
})(window);
