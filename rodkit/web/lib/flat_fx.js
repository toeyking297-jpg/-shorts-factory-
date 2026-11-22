// flat_fx.js — เอฟเฟกต์ภาพระดับจอ + UI พิเศษ (ใช้ได้ทุกฉาก)
// ช็อต: "fx": [{ "type": "petals|sparkle|confetti|speed|pulse|lightleak|bokeh|burst|rays", "t0":0, "t1":3, ...}]
// UI:   "ui": [{ "type": "pop|quote|title|bubble|badge", ... }]
(function (G) {
  const RK = G.RK, f = RK.f, W = 1080, H = 1920;
  const esc = (s) => (RK.esc ? RK.esc(String(s)) : String(s));
  const env = (u, t, fi = 0.4, fo = 0.4) => { const a = t - (u.t0 ?? 0), b = (u.t1 ?? 999) - t; if (a < 0 || b < 0) return 0; return RK.clamp(a / fi) * RK.clamp(b / fo); };
  const rng = (seed) => RK.rng(seed);

  RK.flatDefs += `
  <radialGradient id="fxLeak" cx=".85" cy=".1" r=".9"><stop offset="0" stop-color="#FFC27A" stop-opacity=".75"/><stop offset=".45" stop-color="#FF9A8A" stop-opacity=".25"/><stop offset="1" stop-color="#FF9A8A" stop-opacity="0"/></radialGradient>
  <radialGradient id="fxPulse" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#3A0A18" stop-opacity="0"/><stop offset="1" stop-color="#3A0A18" stop-opacity=".75"/></radialGradient>
  <radialGradient id="fxBokeh"><stop offset="0" stop-color="#FFF4D6" stop-opacity=".55"/><stop offset=".7" stop-color="#FFE3A3" stop-opacity=".25"/><stop offset="1" stop-color="#FFE3A3" stop-opacity="0"/></radialGradient>
  <linearGradient id="fxCard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFBF2" stop-opacity=".96"/><stop offset="1" stop-color="#FFF1DC" stop-opacity=".96"/></linearGradient>`;

  const petal = (c) => `<path d="M 0,-22 C 14,-14 16,8 0,22 C -16,8 -14,-14 0,-22 Z" fill="${c}"/><path d="M 0,-16 L 0,14" stroke="#fff" stroke-width="2" opacity=".5"/>`;
  const star = (c) => `<path d="M 0,-30 C 3,-6 6,-3 30,0 C 6,3 3,6 0,30 C -3,6 -6,3 -30,0 C -6,-3 -3,-6 0,-30 Z" fill="${c}"/>`;

  const FX = {
    petals(u, t, k) { // กลีบกล้วยไม้/ดอกไม้ร่วงลอย
      const r = rng(u.seed || 11), n = u.n || 22, cols = u.colors || ["#F2A6D0", "#FFFFFF", "#D9A6F2", "#FFC6DE"];
      let s = "";
      for (let i = 0; i < n; i++) { const sp = 90 + r() * 120, x0 = r() * W, ph = r() * 10, y = ((t * sp + r() * H) % (H + 200)) - 100, x = x0 + Math.sin(t * 1.3 + ph) * 60, rot = t * (60 + r() * 120) + ph * 30, sc = 0.6 + r() * 0.9; s += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(sc)},${f(sc * (0.6 + 0.4 * Math.abs(Math.sin(t * 2 + ph))))})" opacity="${f(k * 0.9)}">${petal(cols[i % cols.length])}</g>`; }
      return s;
    },
    sparkle(u, t, k) { // ประกายวิบวับ (รอบจุดหรือทั้งจอ)
      const r = rng(u.seed || 5), n = u.n || 14, cx = u.x ?? W / 2, cy = u.y ?? H * 0.42, rad = u.r || 380;
      let s = "";
      for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = rad * (0.3 + r() * 0.7), ph = r() * 6, tw = Math.max(0, Math.sin(t * (3 + r() * 3) + ph)); s += `<g transform="translate(${f(cx + Math.cos(a) * d)},${f(cy + Math.sin(a) * d * 0.8)}) scale(${f(0.3 + tw * 0.7)}) rotate(${f(t * 40)})" opacity="${f(k * tw)}">${star(u.color || "#FFF3B0")}</g>`; }
      return s;
    },
    confetti(u, t, k) { // กระดาษสีโปรยลงมา
      const r = rng(u.seed || 3), n = u.n || 70, a0 = t - (u.t0 || 0), cols = ["#E4572E", "#F2C14E", "#2F8F4F", "#2F6FB0", "#F2668B", "#8E6FA8"];
      let s = "";
      for (let i = 0; i < n; i++) { const vx = (r() - 0.5) * 700, vy = -900 - r() * 700, x = W / 2 + vx * a0 + Math.sin(a0 * 4 + i) * 30, y = H * 0.35 + vy * a0 + 900 * a0 * a0 * 1.4, rot = a0 * (200 + r() * 500); if (y > H + 50) continue; s += `<rect x="-10" y="-6" width="20" height="12" rx="2" fill="${cols[i % 6]}" transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(1,${f(Math.cos(a0 * 8 + i))})" opacity="${f(k)}"/>`; }
      return s;
    },
    speed(u, t, k) { // เส้นความเร็วขอบจอ
      const r = rng(7); let s = "";
      for (let i = 0; i < 26; i++) { const y = r() * H, len = 120 + r() * 260, x = ((r() * W - t * (900 + r() * 600)) % (W + 400) + W + 400) % (W + 400) - 200, edge = Math.abs(y - H / 2) / (H / 2); if (edge < 0.35) continue; s += `<rect x="${f(x)}" y="${f(y)}" width="${f(len)}" height="${f(3 + r() * 4)}" rx="3" fill="#FFFFFF" opacity="${f(k * 0.45 * edge)}"/>`; }
      return s;
    },
    pulse(u, t, k) { // หัวใจเต้นแรง (ขอบจอแดงเต้นตามจังหวะ)
      const bpm = u.bpm || 110, ph = (t * bpm / 60) % 1, beat = Math.max(Math.exp(-ph * 9), 0.7 * Math.exp(-Math.abs(ph - 0.22) * 14));
      return `<rect width="${W}" height="${H}" fill="url(#fxPulse)" opacity="${f(k * (0.35 + 0.65 * beat))}"/>`;
    },
    lightleak(u, t, k) { return `<rect width="${W}" height="${H}" fill="url(#fxLeak)" opacity="${f(k * (0.7 + 0.3 * Math.sin(t * 0.9)))}" style="mix-blend-mode:screen"/>`; },
    bokeh(u, t, k) {
      const r = rng(u.seed || 21); let s = "";
      for (let i = 0; i < (u.n || 12); i++) { const x = r() * W + Math.sin(t * 0.4 + i) * 40, y = r() * H * 0.7 - t * 12 * (r() + 0.3), rr = 40 + r() * 90; s += `<circle cx="${f(x)}" cy="${f(((y % H) + H) % H)}" r="${f(rr)}" fill="url(#fxBokeh)" opacity="${f(k * (0.5 + 0.5 * Math.sin(t + i)))}"/>`; }
      return `<g style="mix-blend-mode:screen">${s}</g>`;
    },
    burst(u, t, k) { // รัศมีการ์ตูนตอนดีใจ/ตกใจ
      const cx = u.x ?? W / 2, cy = u.y ?? H * 0.4, n = 18, rot = t * 20; let s = "";
      for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + rot * Math.PI / 180, a2 = a + Math.PI / n; s += `<path d="M ${f(cx)},${f(cy)} L ${f(cx + Math.cos(a) * 1600)},${f(cy + Math.sin(a) * 1600)} L ${f(cx + Math.cos(a2) * 1600)},${f(cy + Math.sin(a2) * 1600)} Z" fill="${u.color || "#FFE7A0"}" opacity="${f(k * 0.22)}"/>`; }
      return s;
    },
    rays(u, t, k) { // ลำแสงพระเจ้าเฉียงจากมุมบน
      let s = ""; for (let i = 0; i < 5; i++) { const x = (u.x ?? 900) - i * 140; s += `<path d="M ${x},-50 L ${x + 70},-50 L ${x - 500 + i * 30},${H} L ${x - 760 + i * 30},${H} Z" fill="#FFF0C8" opacity="${f(k * (0.12 + 0.06 * Math.sin(t * 0.8 + i)))}" filter="url(#fBlur20)"/>`; }
      return `<g style="mix-blend-mode:screen">${s}</g>`;
    },
  };
  RK.flatFx = function (S, t) {
    let s = "";
    for (const u of S.fx || []) { const k = env(u, t, u.fi ?? 0.5, u.fo ?? 0.5); if (k > 0 && FX[u.type]) s += FX[u.type](u, t, k); }
    return s;
  };

  // ---------- UI พิเศษ ----------
  const outlineText = (x, y, txt, size, fill, stroke, sw, ex = "") => `<text x="${f(x)}" y="${f(y)}" text-anchor="middle" font-family="Kanit" font-weight="900" font-size="${size}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" paint-order="stroke" stroke-linejoin="round" ${ex}>${esc(txt)}</text>`;
  const UI = {
    pop(u, t) { // คำใหญ่เด้งกระแทก เช่น "สู้ๆ!"
      const a = t - u.t0, b = u.t1 - t; if (a < 0 || b < 0) return "";
      const k = RK.ease.back(RK.clamp(a / 0.35)) * RK.clamp(b / 0.25), wob = Math.sin(a * 14) * Math.exp(-a * 4) * 6;
      return `<g transform="translate(${f(u.x ?? W / 2)},${f(u.y ?? 520)}) rotate(${f((u.rot ?? -6) + wob)}) scale(${f(k)})">` + outlineText(6, 10, u.text, u.size || 150, "#000", "#000", 26, 'opacity=".25"') + outlineText(0, 0, u.text, u.size || 150, u.color || "#FFD23F", "#2B2230", 22) + `</g>`;
    },
    title(u, t) { // ชื่อตอน: ตัวหนังสือใหญ่ขอบหนา เด้งเข้าทีละคำ ไม่มีกล่อง
      const a = t - u.t0, b = u.t1 - t; if (a < 0 || b < 0) return "";
      const out = RK.clamp(b / 0.4), y = u.y ?? 420, words = String(u.text).split(/\s+/);
      let s = `<g opacity="${f(out)}">`;
      const pill = RK.ease.back(RK.clamp(a / 0.35));
      s += `<g transform="translate(${W / 2},${f(y - 120)}) scale(${f(pill)})"><rect x="-104" y="-28" width="208" height="56" rx="28" fill="#F2C14E"/><text x="0" y="12" text-anchor="middle" font-family="Kanit" font-weight="800" font-size="32" fill="#2B2230">ดูเพลิน</text></g>`;
      const lineH = (u.size || 92) * 1.15;
      words.forEach((w, i) => { const k = RK.ease.back(RK.clamp((a - 0.25 - i * 0.22) / 0.3)); s += `<g transform="translate(${W / 2},${f(y + i * lineH)}) scale(${f(k)}) rotate(${f((i % 2 ? 2 : -2) * (1 - k))})">` + outlineText(5, 8, w, u.size || 92, "#000", "#000", 22, 'opacity=".25"') + outlineText(0, 0, w, u.size || 92, i === words.length - 1 ? (u.color || "#FFD84A") : "#FFFFFF", "#2B2230", 20) + `</g>`; });
      if (u.sub) s += outlineText(W / 2, y + words.length * lineH - 10, u.sub, 40, "#FFE7C2", "#2B2230", 9, `opacity="${f(RK.clamp((a - 0.9) / 0.4))}"`);
      return s + `</g>`;
    },
    bubble(u, t) { // เสียงในใจ: ตัวหนังสือลอย เขียนทีละคำ (ไม่มีกล่อง)
      const a = t - u.t0, b = u.t1 - t; if (a < 0 || b < 0) return "";
      const out = RK.clamp(b / 0.3), x = u.x ?? W / 2, y = (u.y ?? 500) + Math.sin(t * 1.8 + x) * 6, words = String(u.text).split(/\s+/), sz = u.size || 58;
      const ctx = (RK._ctx = RK._ctx || document.createElement("canvas").getContext("2d")); ctx.font = `700 ${sz}px Kanit`;
      const ws = words.map((w) => ctx.measureText(w).width), tot = ws.reduce((p, q) => p + q, 0) + (words.length - 1) * 16;
      let cx = x - tot / 2, s = `<g opacity="${f(out)}">`;
      words.forEach((w, i) => { const k = RK.clamp((a - i * 0.18) / 0.25); s += `<g transform="translate(${f(cx + ws[i] / 2)},${f(y - (1 - k) * 20)})" opacity="${f(k)}">` + outlineText(0, 0, w, sz, u.color || "#FFFFFF", "#3A2440", sz * 0.2, 'font-style="italic"') + `</g>`; cx += ws[i] + 16; });
      if (u.think !== false) for (let i = 0; i < 3; i++) s += `<circle cx="${f(x + (u.tx ?? 0.2) * 300 + i * 18)}" cy="${f(y + 40 + i * 26)}" r="${f(9 - i * 2.5)}" fill="#FFFFFF" stroke="#3A2440" stroke-width="3" opacity="${f(RK.clamp((a - 0.2 * i) / 0.2))}"/>`;
      return s + `</g>`;
    },
    quote(u, t) { // คำคมตอนจบ: วางบนภาพตรงๆ ภาพหลังมืดลงนิด ตัวหนังสือพิมพ์ทีละบรรทัด
      const a = t - u.t0, b = u.t1 - t; if (a < 0 || b < 0) return "";
      const out = RK.clamp(b / 0.5), lines = u.lines || [u.text], y0 = u.y ?? 760;
      let s = `<g opacity="${f(out)}"><rect width="${W}" height="${H}" fill="#120C14" opacity="${f(0.42 * RK.clamp(a / 0.8))}"/>`;
      lines.forEach((ln, i) => { const k = RK.clamp((a - 0.3 - i * 0.6) / 0.5), last = i === lines.length - 1; s += `<g transform="translate(${W / 2},${f(y0 + i * 120 + (1 - RK.ease.out(k)) * 30)})" opacity="${f(k)}">` + outlineText(0, 0, String(ln).replace(/\*/g, ""), last ? 78 : 66, last ? (u.color || "#FFD84A") : "#FFFFFF", "#1A1220", last ? 16 : 13) + `</g>`; });
      const kb = RK.clamp((a - 0.6 - lines.length * 0.6) / 0.4);
      s += `<g transform="translate(${W / 2},${f(y0 + lines.length * 120 + 40)}) scale(${f(RK.ease.back(kb))})"><rect x="-120" y="-32" width="240" height="64" rx="32" fill="#F2C14E"/><text x="0" y="14" text-anchor="middle" font-family="Kanit" font-weight="800" font-size="38" fill="#2B2230">ดูเพลิน</text></g>`;
      return s + `</g>`;
    },

    chat(u, t) { // จอมือถือแชท: msgs=[{me:true,text}] , typing="ข้อความที่กำลังพิมพ์" (พิมพ์แล้วลบเมื่อ erase:true), name, time
      const k = env(u, t, 0.35, 0.3); if (!k) return "";
      const a = t - u.t0, x = u.x ?? W / 2, y = u.y ?? 860, pw = 600, ph = 1000, sc = (u.s ?? 1) * (0.9 + 0.1 * RK.ease.back(RK.clamp(a / 0.35)));
      let s = `<g transform="translate(${f(x)},${f(y)}) scale(${f(sc)}) rotate(${f(u.rot ?? -3)})" opacity="${f(k)}">`;
      s += `<rect x="${-pw / 2 - 26}" y="${-ph / 2 - 26}" width="${pw + 52}" height="${ph + 52}" rx="70" fill="#15151B"/><rect x="${-pw / 2}" y="${-ph / 2}" width="${pw}" height="${ph}" rx="48" fill="${u.dark ? "#12141C" : "#EEF1F6"}"/>`;
      s += `<rect x="${-pw / 2}" y="${-ph / 2}" width="${pw}" height="150" rx="48" fill="${u.dark ? "#232838" : "#5C7CB5"}"/><circle cx="${-pw / 2 + 80}" cy="${-ph / 2 + 85}" r="38" fill="#EBC09B"/><text x="${-pw / 2 + 140}" y="${-ph / 2 + 100}" font-family="Kanit" font-weight="800" font-size="42" fill="#FFFFFF">${esc(u.name || "ภูมิ")}</text>`;
      if (u.time) s += `<text x="${pw / 2 - 30}" y="${-ph / 2 + 98}" text-anchor="end" font-family="Kanit" font-weight="600" font-size="34" fill="#DDE6F5">${esc(u.time)}</text>`;
      const ctx = (RK._ctx = RK._ctx || document.createElement("canvas").getContext("2d")); ctx.font = `600 40px Kanit`;
      let yy = -ph / 2 + 210;
      (u.msgs || []).forEach((m, i) => { const kk = RK.clamp((a - 0.2 - i * 0.35) / 0.25); if (!kk) return; const tw = Math.min(440, ctx.measureText(m.text).width) + 50, bx = m.me ? pw / 2 - 30 - tw : -pw / 2 + 30;
        s += `<g opacity="${f(kk)}"><rect x="${f(bx)}" y="${f(yy)}" width="${f(tw)}" height="76" rx="34" fill="${m.me ? "#3D8BFD" : (u.dark ? "#2E3446" : "#FFFFFF")}"/><text x="${f(bx + 25)}" y="${f(yy + 51)}" font-family="Kanit" font-weight="600" font-size="40" fill="${m.me ? "#FFFFFF" : (u.dark ? "#E6E9F2" : "#1E2230")}">${esc(m.text)}</text>`;
        if (m.read) s += `<text x="${f(bx - 12)}" y="${f(yy + 70)}" text-anchor="end" font-family="Kanit" font-size="26" fill="#8A93A8">${esc(m.read)}</text>`;
        s += `</g>`; yy += 100; });
      // ช่องพิมพ์: พิมพ์ทีละตัว ค้าง แล้วลบ (ถ้า erase)
      s += `<rect x="${-pw / 2 + 24}" y="${ph / 2 - 120}" width="${pw - 140}" height="84" rx="42" fill="${u.dark ? "#232838" : "#FFFFFF"}" stroke="#C9D2E2" stroke-width="3"/><circle cx="${pw / 2 - 62}" cy="${ph / 2 - 78}" r="40" fill="#3D8BFD"/><path d="M ${pw / 2 - 80},${ph / 2 - 96} L ${pw / 2 - 40},${ph / 2 - 78} L ${pw / 2 - 80},${ph / 2 - 60} Z" fill="#fff"/>`;
      if (u.typing) { const chars = Array.from(u.typing), dur = u.t1 - u.t0, tt = u.typeSec ?? Math.min(dur * 0.45, chars.length * 0.09);
        let n = Math.floor(RK.clamp((a - 0.3) / tt) * chars.length);
        if (u.erase) { const e0 = 0.3 + tt + (u.hold ?? 0.6); if (a > e0) n = Math.max(0, chars.length - Math.floor((a - e0) / 0.035)); }
        const shown = chars.slice(0, n).join(""), blink = Math.floor(t * 2.5) % 2;
        s += `<text x="${-pw / 2 + 56}" y="${ph / 2 - 64}" font-family="Kanit" font-weight="600" font-size="40" fill="${u.dark ? "#E6E9F2" : "#1E2230"}">${esc(shown)}${blink ? "|" : ""}</text>`; }
      return s + `</g>`;
    },
    tip(u, t) { // ✓ ควรทำ / ✗ ไม่ควรทำ : ตราใหญ่ + ข้อความ (ไม่มีกล่องขาว) do:true|false
      const a = t - u.t0, b = u.t1 - t; if (a < 0 || b < 0) return "";
      const k = RK.ease.back(RK.clamp(a / 0.35)), out = RK.clamp(b / 0.25), ok = !!u.do, c = ok ? "#3BB273" : "#E5484D", x = u.x ?? 540, y = u.y ?? 300;
      let s = `<g opacity="${f(out)}"><g transform="translate(${f(x - 250)},${f(y)}) scale(${f(k)}) rotate(${f((ok ? -8 : 8) * (1 - k))})"><circle r="78" fill="${c}" stroke="#1A1220" stroke-width="10"/>`;
      s += ok ? `<path d="M -36,2 L -8,30 L 40,-26" fill="none" stroke="#fff" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>` : `<path d="M -30,-30 L 30,30 M 30,-30 L -30,30" stroke="#fff" stroke-width="20" stroke-linecap="round"/>`;
      s += `</g>`;
      const kt = RK.clamp((a - 0.15) / 0.3);
      s += `<g opacity="${f(kt)}" transform="translate(${f(x - 150 + (1 - kt) * 30)},${f(y - 18)})">` + `<text x="0" y="0" font-family="Kanit" font-weight="900" font-size="56" fill="${c}" stroke="#1A1220" stroke-width="12" paint-order="stroke">${ok ? "ควรทำ" : "ไม่ควรทำ"}</text>` + `<text x="0" y="66" font-family="Kanit" font-weight="900" font-size="${u.size || 70}" fill="#FFFFFF" stroke="#1A1220" stroke-width="14" paint-order="stroke" stroke-linejoin="round">${esc(u.text)}</text></g>`;
      return s + `</g>`;
    },
    badge(u, t) { // โลโก้ช่องมุมจอ
      const k = env(u, t, 0.4, 0.3); if (!k) return "";
      return `<g transform="translate(${u.x ?? 900},${u.y ?? 120})" opacity="${f(k * 0.92)}"><rect x="-120" y="-36" width="240" height="72" rx="36" fill="#1E1A24" opacity=".55"/><circle cx="-78" cy="0" r="22" fill="#F2C14E"/><text x="-78" y="10" text-anchor="middle" font-family="Kanit" font-weight="900" font-size="26" fill="#2B2230">ด</text><text x="20" y="13" text-anchor="middle" font-family="Kanit" font-weight="800" font-size="36" fill="#FFF6E6">ดูเพลิน</text></g>`;
    },
  };
  RK.flatUi = UI;
})(window);
