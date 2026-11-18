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
    title(u, t) { // ชื่อตอนเปิดเรื่อง
      const a = t - u.t0, b = u.t1 - t; if (a < 0 || b < 0) return "";
      const k = RK.clamp(a / 0.5) * RK.clamp(b / 0.4), y = (u.y ?? 380) + (1 - RK.ease.out(RK.clamp(a / 0.6))) * 40;
      let s = `<g opacity="${f(k)}">`;
      s += `<rect x="70" y="${f(y - 120)}" width="940" height="${u.sub ? 250 : 180}" rx="40" fill="#1E1A24" opacity=".55"/>`;
      s += `<g transform="translate(${W / 2},${f(y - 70)})"><rect x="-110" y="-26" width="220" height="52" rx="26" fill="#F2C14E"/>` + `<text x="0" y="13" text-anchor="middle" font-family="Kanit" font-weight="800" font-size="32" fill="#2B2230">ดูเพลิน</text></g>`;
      s += outlineText(W / 2, y + 30, u.text, u.size || 66, "#FFFFFF", "#2B2230", 10);
      if (u.sub) s += `<text x="${W / 2}" y="${f(y + 92)}" text-anchor="middle" font-family="Kanit" font-weight="500" font-size="38" fill="#FFE7C2">${esc(u.sub)}</text>`;
      return s + `</g>`;
    },
    bubble(u, t) { // ฟองความคิด/คำพูดในใจ
      const a = t - u.t0, b = u.t1 - t; if (a < 0 || b < 0) return "";
      const k = RK.ease.back(RK.clamp(a / 0.35)) * RK.clamp(b / 0.3), w = u.w || 520, h = u.h || 150, x = u.x ?? 300, y = u.y ?? 500, bob = Math.sin(t * 2.4) * 6;
      let s = `<g transform="translate(${f(x)},${f(y + bob)}) scale(${f(k)})">`;
      s += `<ellipse cx="0" cy="0" rx="${w / 2}" ry="${h / 2}" fill="#FFFFFF" stroke="#2B2230" stroke-width="6"/>`;
      if (u.think !== false) s += `<circle cx="${f((u.tx ?? 0.2) * w)}" cy="${f(h / 2 + 34)}" r="20" fill="#FFF" stroke="#2B2230" stroke-width="5"/><circle cx="${f((u.tx ?? 0.2) * w + 26)}" cy="${f(h / 2 + 76)}" r="11" fill="#FFF" stroke="#2B2230" stroke-width="4"/>`;
      s += `<text x="0" y="16" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="${u.size || 46}" fill="${u.color || "#2B2230"}">${esc(u.text)}</text>`;
      return s + `</g>`;
    },
    quote(u, t) { // การ์ดคำคมตอนจบ
      const a = t - u.t0, b = u.t1 - t; if (a < 0 || b < 0) return "";
      const k = RK.clamp(a / 0.6) * RK.clamp(b / 0.5), lines = u.lines || [u.text];
      const y0 = (u.y ?? 700) + (1 - RK.ease.out(RK.clamp(a / 0.7))) * 60, h = 140 + lines.length * 96;
      let s = `<g opacity="${f(k)}"><rect width="${W}" height="${H}" fill="#120C14" opacity=".35"/>`;
      s += `<rect x="80" y="${f(y0)}" width="920" height="${h}" rx="44" fill="url(#fxCard)"/><rect x="80" y="${f(y0)}" width="920" height="16" rx="8" fill="${u.color || "#E46FA8"}"/>`;
      s += `<text x="150" y="${f(y0 + 120)}" font-family="Georgia" font-size="140" fill="${u.color || "#E46FA8"}" opacity=".35">“</text>`;
      lines.forEach((ln, i) => { const ap = RK.clamp((a - 0.35 - i * 0.35) / 0.4); s += `<text x="${W / 2}" y="${f(y0 + 140 + i * 96)}" text-anchor="middle" font-family="Kanit" font-weight="${i === lines.length - 1 ? 800 : 600}" font-size="${i === lines.length - 1 ? 60 : 54}" fill="${i === lines.length - 1 ? (u.color || "#C2457F") : "#2B2230"}" opacity="${f(ap)}">${esc(ln)}</text>`; });
      s += `<g transform="translate(${W / 2},${f(y0 + h + 70)})" opacity="${f(RK.clamp((a - 0.9) / 0.4))}"><rect x="-130" y="-34" width="260" height="68" rx="34" fill="#F2C14E"/><text x="0" y="16" text-anchor="middle" font-family="Kanit" font-weight="800" font-size="40" fill="#2B2230">ดูเพลิน</text></g>`;
      return s + `</g>`;
    },
    badge(u, t) { // โลโก้ช่องมุมจอ
      const k = env(u, t, 0.4, 0.3); if (!k) return "";
      return `<g transform="translate(${u.x ?? 900},${u.y ?? 120})" opacity="${f(k * 0.92)}"><rect x="-120" y="-36" width="240" height="72" rx="36" fill="#1E1A24" opacity=".55"/><circle cx="-78" cy="0" r="22" fill="#F2C14E"/><text x="-78" y="10" text-anchor="middle" font-family="Kanit" font-weight="900" font-size="26" fill="#2B2230">ด</text><text x="20" y="13" text-anchor="middle" font-family="Kanit" font-weight="800" font-size="36" fill="#FFF6E6">ดูเพลิน</text></g>`;
    },
  };
  RK.flatUi = UI;
})(window);
