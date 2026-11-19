// flat_roundhead.js — ตัวละครสไตล์หัวกลม (หัวขาวขอบดำ ตาจุด แขนขาเรียว มือ/รองเท้าดำ) วางผ่าน S.props type:"rh"
// ฟิลด์: x,y (เท้า), h (สูงรวม world, ผู้ใหญ่ 420 / เด็ก 290), dir (1 ขวา / -1 ซ้าย), view "front"|"side"
//        shirt, pants (สี), skirt (bool), pose: stand|point|hold|hands_hips|reach|walk, mood: smile|worried|shock|happy|sad|flat
//        acc: ["bow","bun","glasses","tie","apron","towel","pigtail","hat"], item: "plate"|"bowl"|"magnifier"|"clipboard"
(function (G) {
  const RK = G.RK, f = RK.f;
  const K = "#1A1A1A", SW = 5;
  const P = (d, fill, ex = "") => `<path d="${d}" fill="${fill}" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round" ${ex}/>`;
  const Ln = (x1, y1, x2, y2, w = 9) => `<path d="M ${f(x1)},${f(y1)} L ${f(x2)},${f(y2)}" stroke="${K}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
  const Cu = (d, w = 9, c = K) => `<path d="${d}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const sh = RK.shade;

  function face(hx, hy, r, mood, side, dir, TT, seed) {
    let s = "";
    const blink = ((TT + (seed || 0) * 0.37) % 3.7) < 0.12;
    const ex = side ? [hx + dir * r * 0.32, hx + dir * r * 0.62] : [hx - r * 0.3, hx + r * 0.3], ey = hy - r * 0.08;
    // ตา
    for (const x of ex) s += blink ? Cu(`M ${f(x - 6)},${f(ey)} L ${f(x + 6)},${f(ey)}`, 4) : `<ellipse cx="${f(x)}" cy="${f(ey)}" rx="${f(r * 0.07)}" ry="${f(r * (mood === "shock" ? 0.13 : 0.1))}" fill="${K}"/>`;
    // คิ้ว
    const bw = r * 0.14, by = ey - r * 0.24;
    for (const x of ex) {
      const tilt = mood === "worried" || mood === "sad" ? (x < hx ? 1 : -1) : mood === "shock" ? 0 : (x < hx ? -0.4 : 0.4);
      s += Cu(`M ${f(x - bw)},${f(by + tilt * 5)} Q ${f(x)},${f(by - 6 - (mood === "shock" ? 6 : 0))} ${f(x + bw)},${f(by - tilt * 5)}`, 4);
    }
    // ปาก
    const mx = side ? hx + dir * r * 0.5 : hx, my = hy + r * 0.38, mw = r * 0.22;
    if (mood === "shock") s += `<ellipse cx="${f(mx)}" cy="${f(my)}" rx="${f(mw * 0.45)}" ry="${f(mw * 0.6)}" fill="${K}"/>`;
    else if (mood === "worried" || mood === "sad") s += Cu(`M ${f(mx - mw)},${f(my + 4)} Q ${f(mx)},${f(my - 8)} ${f(mx + mw)},${f(my + 4)}`, 4);
    else if (mood === "happy") s += P(`M ${f(mx - mw)},${f(my - 4)} Q ${f(mx)},${f(my + mw * 1.3)} ${f(mx + mw)},${f(my - 4)} Z`, "#7A2E2E") ;
    else if (mood === "flat") s += Cu(`M ${f(mx - mw * 0.7)},${f(my)} L ${f(mx + mw * 0.7)},${f(my)}`, 4);
    else s += Cu(`M ${f(mx - mw)},${f(my - 3)} Q ${f(mx)},${f(my + 10)} ${f(mx + mw)},${f(my - 3)}`, 4);
    if (mood === "happy" || mood === "smile") for (const x of ex) s += `<ellipse cx="${f(x + (x < hx ? -6 : 6))}" cy="${f(ey + r * 0.28)}" rx="${f(r * 0.1)}" ry="${f(r * 0.05)}" fill="#F2A6A0" opacity=".55"/>`;
    return s;
  }
  function item(kind, x, y) {
    if (kind === "plate") return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="46" ry="12" fill="#FFFFFF" stroke="${K}" stroke-width="4"/>` + Cu(`M ${f(x - 30)},${f(y - 4)} L ${f(x + 26)},${f(y - 4)}`, 3, "#B8A88E") + [0, 1, 2, 3, 4, 5].map((i) => Cu(`M ${f(x - 22 + i * 9)},${f(y - 10)} L ${f(x - 22 + i * 9)},${f(y + 2)}`, 2, "#B8A88E")).join("");
    if (kind === "bowl") return P(`M ${f(x - 30)},${f(y - 14)} Q ${f(x - 26)},${f(y + 12)} ${f(x)},${f(y + 12)} Q ${f(x + 26)},${f(y + 12)} ${f(x + 30)},${f(y - 14)} Z`, "#F6F1E6") + `<ellipse cx="${f(x)}" cy="${f(y - 14)}" rx="30" ry="7" fill="#D9B98A" stroke="${K}" stroke-width="4"/>`;
    if (kind === "magnifier") return `<circle cx="${f(x + 14)}" cy="${f(y - 28)}" r="24" fill="#CFE8F5" fill-opacity=".6" stroke="${K}" stroke-width="7"/>` + Ln(x, y - 8, x - 8, y + 20, 9);
    if (kind === "clipboard") return P(`M ${f(x - 26)},${f(y - 40)} L ${f(x + 26)},${f(y - 40)} L ${f(x + 26)},${f(y + 30)} L ${f(x - 26)},${f(y + 30)} Z`, "#B98A5A") + P(`M ${f(x - 18)},${f(y - 32)} L ${f(x + 18)},${f(y - 32)} L ${f(x + 18)},${f(y + 22)} L ${f(x - 18)},${f(y + 22)} Z`, "#FFFFFF");
    return "";
  }
  function rh(p, t, TT) {
    const H = p.h || 420, s = H / 420, dir = p.dir || 1, side = p.view === "side", pose = p.pose || "stand", mood = p.mood || "smile";
    const acc = new Set(p.acc || []);
    const shirt = p.shirt || "#E8732C", pants = p.pants || "#6B4A33";
    const walk = pose === "walk" ? Math.sin(TT * 7) : 0, bob = Math.abs(walk) * 4;
    // พิกัดก่อนย่อ (สูง 420): เท้า y=0, สะโพก -170, ไหล่ -290, คอ -300, หัวกลาง -365 รัศมี 62
    const hipY = -170 - bob, shY = -288 - bob, hr = 62, hy = -362 - bob, hx = side ? dir * 6 : 0;
    let o = `<g transform="translate(${f(p.x || 0)},${f(p.y || 0)}) scale(${f(s)})">`;
    o += `<ellipse cx="0" cy="4" rx="70" ry="10" fill="#000" opacity=".18"/>`;
    // ขา
    const legs = side ? [[-10 + walk * 26, 0], [10 - walk * 26, 0]] : [[-26, 0], [26, 0]];
    if (p.skirt) {
      o += legs.map(([fx]) => Ln(fx * 0.7, hipY + 70, fx, -12, 9)).join("");
      o += P(`M -40,${f(hipY - 6)} L 40,${f(hipY - 6)} L 58,${f(hipY + 80)} L -58,${f(hipY + 80)} Z`, pants);
    } else {
      o += legs.map(([fx]) => P(`M ${f(fx * 0.5 - 16)},${f(hipY)} L ${f(fx * 0.5 + 16)},${f(hipY)} L ${f(fx + 14)},-14 L ${f(fx - 14)},-14 Z`, pants)).join("");
      o += P(`M -38,${f(hipY - 10)} L 38,${f(hipY - 10)} L 36,${f(hipY + 22)} L -36,${f(hipY + 22)} Z`, pants);
    }
    o += legs.map(([fx]) => `<path d="M ${f(fx - 18 + (side ? dir * 4 : 0))},-2 Q ${f(fx + (side ? dir * 22 : 0))},-30 ${f(fx + 22 + (side ? dir * 12 : 0))},-2 Z" fill="${K}"/>`).join("");
    // แขน (หลังลำตัวสำหรับแขนไกล)
    const arm = (sideSign, near) => {
      const sx = sideSign * 34, sy = shY + 14;
      let ex, ey, hx2, hy2;
      if (pose === "point" && sideSign === dir) { ex = sx + sideSign * 60; ey = sy - 10; hx2 = sx + sideSign * 120; hy2 = sy - 26; }
      else if (pose === "hold" || pose === "reach") { ex = sx + sideSign * 20; ey = sy + 70; hx2 = (pose === "reach" ? dir * 70 : sideSign * 10); hy2 = sy + (pose === "reach" ? 90 : 60); }
      else if (pose === "hands_hips") { ex = sx + sideSign * 44; ey = sy + 56; hx2 = sx + sideSign * 6; hy2 = hipY + 4; }
      else { const sw = walk * 30 * sideSign * (side ? 1 : 0); ex = sx + sideSign * 10 + sw * 0.5; ey = sy + 70; hx2 = sx + sideSign * 6 + sw; hy2 = sy + 134; }
      let r = "";
      // แขนเสื้อ
      r += P(`M ${f(sx - 14)},${f(sy - 12)} L ${f(sx + 14)},${f(sy - 12)} L ${f(sx + (ex - sx) * 0.45 + 12)},${f(sy + (ey - sy) * 0.45)} L ${f(sx + (ex - sx) * 0.45 - 12)},${f(sy + (ey - sy) * 0.45 + 6)} Z`, sh(shirt, near ? 0 : -0.1));
      r += Cu(`M ${f(sx + (ex - sx) * 0.4)},${f(sy + (ey - sy) * 0.4)} Q ${f(ex)},${f(ey)} ${f(hx2)},${f(hy2)}`, 8);
      r += `<circle cx="${f(hx2)}" cy="${f(hy2)}" r="11" fill="${K}"/>`;
      if (near && p.item && (pose === "hold" || pose === "reach" || (pose === "point" && sideSign !== dir))) r += item(p.item, hx2, hy2 - 6);
      return r;
    };
    const farS = side ? -dir : -1, nearS = side ? dir : 1;
    o += arm(farS, false);
    // ลำตัว (เสื้อ)
    o += P(`M -40,${f(shY)} Q 0,${f(shY - 10)} 40,${f(shY)} L 44,${f(hipY + 4)} L -44,${f(hipY + 4)} Z`, shirt);
    o += Cu(`M -14,${f(shY - 2)} L 0,${f(shY + 22)} L 14,${f(shY - 2)}`, 4);
    if (acc.has("tie")) o += P(`M -6,${f(shY + 10)} L 6,${f(shY + 10)} L 10,${f(shY + 70)} L 0,${f(shY + 82)} L -10,${f(shY + 70)} Z`, "#2F4E8A");
    if (acc.has("apron")) o += P(`M -32,${f(shY + 24)} L 32,${f(shY + 24)} L 38,${f(hipY + 40)} L -38,${f(hipY + 40)} Z`, p.apronC || "#F2EADB") + Cu(`M -18,${f(hipY - 20)} L 18,${f(hipY - 20)}`, 3, "#B8A88E");
    if (acc.has("towel")) o += P(`M -40,${f(shY - 4)} Q 0,${f(shY + 30)} 40,${f(shY - 4)} L 30,${f(shY + 60)} L 18,${f(shY + 10)} Q 0,${f(shY + 24)} -18,${f(shY + 10)} L -26,${f(shY + 40)} Z`, "#FFFFFF");
    o += arm(nearS, true);
    // คอ + หัว
    o += Ln(hx, shY + 4, hx, hy + hr - 6, 10);
    if (acc.has("bun")) o += `<circle cx="${f(hx - dir * (side ? 40 : 0))}" cy="${f(hy - hr - 6)}" r="22" fill="${p.bunC || "#C9C4BE"}" stroke="${K}" stroke-width="${SW}"/>`;
    if (acc.has("pigtail")) for (const sx of [-1, 1]) o += `<circle cx="${f(hx + sx * (hr + 6))}" cy="${f(hy - 10)}" r="16" fill="#4A3426" stroke="${K}" stroke-width="${SW}"/>`;
    o += `<circle cx="${f(hx)}" cy="${f(hy)}" r="${hr}" fill="#FFFFFF" stroke="${K}" stroke-width="${SW + 1}"/>`;
    o += `<ellipse cx="${f(hx - hr * 0.35)}" cy="${f(hy - hr * 0.45)}" rx="${f(hr * 0.28)}" ry="${f(hr * 0.14)}" fill="#FFFFFF" opacity=".9" transform="rotate(-30 ${f(hx)} ${f(hy)})"/>`;
    o += `<path d="M ${f(hx + hr * 0.2)},${f(hy + hr * 0.75)} A ${hr} ${hr} 0 0 0 ${f(hx + hr * 0.85)},${f(hy + hr * 0.2)}" stroke="#D9D4CC" stroke-width="8" fill="none" opacity=".7"/>`;
    o += face(hx, hy, hr, mood, side, dir, TT, p.seed);
    if (acc.has("bow")) o += P(`M ${f(hx + 30)},${f(hy - hr + 6)} l -26,-16 l 0,32 Z M ${f(hx + 30)},${f(hy - hr + 6)} l 26,-16 l 0,32 Z`, "#E4405F") + `<circle cx="${f(hx + 30)}" cy="${f(hy - hr + 6)}" r="7" fill="#E4405F" stroke="${K}" stroke-width="4"/>`;
    if (acc.has("glasses")) for (const x of side ? [hx + dir * 0.32 * hr, hx + dir * 0.62 * hr] : [hx - hr * 0.3, hx + hr * 0.3]) o += `<circle cx="${f(x)}" cy="${f(hy - hr * 0.08)}" r="${f(hr * 0.17)}" fill="none" stroke="${K}" stroke-width="3.5"/>`;
    if (acc.has("hat")) o += P(`M ${f(hx - hr * 0.9)},${f(hy - hr * 0.55)} Q ${f(hx)},${f(hy - hr * 1.5)} ${f(hx + hr * 0.9)},${f(hy - hr * 0.55)} Z`, "#C9A15A");
    if (p.sweat) o += `<path d="M ${f(hx + hr * 0.75)},${f(hy - hr * 0.5)} q 8,14 0,20 q -8,-6 0,-20 Z" fill="#8FD0F0" stroke="${K}" stroke-width="3"/>`;
    return o + `</g>`;
  }
  const prev = RK.flatProps;
  RK.flatProps = function (S, t, T, layer) {
    let s = prev ? prev(S, t, T, layer) : "";
    for (const p0 of S.props || []) {
      if (p0.type !== "rh" || (p0.layer || "mid") !== layer) continue;
      const p = {}; for (const k in p0) p[k] = Array.isArray(p0[k]) && typeof p0[k][0] !== "string" && Array.isArray(p0[k][0]) ? RK.kf(p0[k], t) : p0[k];
      s += rh(p, t, T);
    }
    return s;
  };
})(window);
