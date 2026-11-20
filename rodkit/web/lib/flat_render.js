// flat_render.js — ตัวเรนเดอร์สไตล์แบน: กล้อง, ชั้นความลึก, ระยะชัด, แสง, การ์ดข้อมูล, ซับ
(function (G) {
  const RK = G.RK, f = RK.f, W = 1080, H = 1920, CX = 540, CY = 900;
  let EP = null, STARTS = [], GRAIN = "";

  function makeGrain() {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const g = c.getContext("2d"), d = g.createImageData(256, 256), r = RK.rng(77);
    for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0); return c.toDataURL("image/png");
  }

  RK.load = function (ep) {
    EP = ep; STARTS = []; let t = 0;
    for (const s of ep.shots) { STARTS.push(t); t += s.dur; }
    EP.duration = t; if (!GRAIN) GRAIN = makeGrain();
    return t;
  };
  function shotAt(T) { let i = STARTS.length - 1; while (i > 0 && T < STARTS[i]) i--; return [EP.shots[i], T - STARTS[i], i]; }

  // ---------- ไอคอน (วาดเอง ไม่พึ่งอีโมจิ) ----------
  const ICON = {
    sun: (c) => `<circle r="15" fill="${c}"/>` + [...Array(8)].map((_, i) => `<rect x="-3" y="-30" width="6" height="10" rx="3" fill="${c}" transform="rotate(${i * 45})"/>`).join(""),
    cup: (c) => `<path d="M -18,-12 L 16,-12 L 13,18 C 12,24 -15,24 -16,18 Z" fill="${c}"/><path d="M 16,-6 C 30,-6 30,12 14,12" stroke="${c}" stroke-width="5" fill="none"/>` +
      [0, 1, 2].map((i) => `<path d="M ${-8 + i * 8},-18 q -5,-8 0,-14 q 5,-6 0,-12" stroke="${c}" stroke-width="3" fill="none" opacity=".7"/>`).join(""),
    heart: (c) => `<path d="M 0,18 C -30,-2 -26,-24 -12,-26 C -4,-27 0,-20 0,-16 C 0,-20 4,-27 12,-26 C 26,-24 30,-2 0,18 Z" fill="${c}"/>`,
    clock: (c) => `<circle r="20" fill="none" stroke="${c}" stroke-width="5"/><path d="M 0,-11 L 0,0 L 9,6" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  };

  // ---------- การ์ดข้อมูล ----------
  function card(u, t) {
    const a = t - u.t0, b = u.t1 - t;
    if (a < 0 || b < 0) return "";
    const pin = RK.clamp(a / 0.45), out = RK.clamp(b / 0.3);
    const k = RK.ease.back(pin) * out, op = Math.min(pin * 2, 1) * out;
    const w = u.w || 420, h = u.h || 150, x = u.x, y = u.y + (1 - out) * -20;
    const acc = u.color || "#F2A33A";
    let num = u.value;
    if (typeof u.value === "number") num = Math.round(u.value * RK.ease.out(RK.clamp(a / (u.count || 0.9))));
    let s = `<g transform="translate(${f(x)},${f(y)}) scale(${f(k)})" opacity="${f(op)}">`;
    s += `<rect x="6" y="10" width="${w}" height="${h}" rx="26" fill="#000" opacity=".22" filter="url(#fBlur8)"/>`;
    s += `<rect width="${w}" height="${h}" rx="26" fill="#1E1A24" opacity=".78"/><rect width="${w}" height="${h}" rx="26" fill="none" stroke="#FFFFFF" stroke-opacity=".18" stroke-width="2"/>`;
    s += `<rect width="14" height="${h}" rx="7" fill="${acc}"/>`;
    s += `<g transform="translate(80,${h / 2})"><circle r="46" fill="${acc}" opacity=".18"/>${(ICON[u.icon] || ICON.sun)(acc)}</g>`;
    s += `<text x="148" y="${h / 2 - 22}" font-family="Kanit" font-weight="500" font-size="30" fill="#D9CFE6">${RK.esc(u.title || "")}</text>`;
    s += `<text x="148" y="${h / 2 + 40}" font-family="Kanit" font-weight="900" font-size="64" fill="#FFFFFF">${RK.esc(String(num))}<tspan font-size="32" font-weight="700" fill="${acc}" dx="10">${RK.esc(u.unit || "")}</tspan></text>`;
    if (u.bar != null) {
      const bw = w - 170, pr = RK.clamp(a / 1.2) * u.bar;
      s += `<rect x="148" y="${h - 26}" width="${bw}" height="10" rx="5" fill="#EADFCF"/><rect x="148" y="${h - 26}" width="${f(bw * pr)}" height="10" rx="5" fill="${acc}"/>`;
    }
    return s + `</g>`;
  }
  function chip(u, t) { // ป้ายบอกเวลา/สถานที่ มุมบน
    const a = t - u.t0, b = u.t1 - t; if (a < 0 || b < 0) return "";
    const k = RK.clamp(a / 0.35) * RK.clamp(b / 0.3), w = u.w || 330;
    return `<g transform="translate(${f(u.x - (1 - k) * 40)},${f(u.y)})" opacity="${f(k)}"><rect width="${w}" height="74" rx="37" fill="#1E1A24" opacity=".72"/>` +
      `<g transform="translate(40,37) scale(.8)">${(ICON[u.icon] || ICON.clock)("#FFD27A")}</g>` +
      `<text x="78" y="49" font-family="Kanit" font-weight="700" font-size="34" fill="#FFF6E6">${RK.esc(u.text)}</text></g>`;
  }
  // ---------- ซับไตเติล (คำเน้นสีเหลือง เด้งเข้าทีละคำ) ----------
  function subtitle(sb, t) {
    if (Array.isArray(sb)) sb = { t0: sb[0], t1: sb[1], text: String(sb[2]).trim().replace(/\s+/g, "|") };
    const a = t - sb.t0, b = sb.t1 - t; if (a < 0 || b < 0) return "";
    const k = RK.clamp(a / 0.18) * RK.clamp(b / 0.15);
    const parts = sb.text.split("|"), hl = sb.hl || [];
    let fs = sb.size || 66; const y = sb.y || 1500;
    // ประมาณความกว้าง (ย่อฟอนต์อัตโนมัติถ้ายาวเกินจอ)
    const ctx = (RK._ctx = RK._ctx || document.createElement("canvas").getContext("2d"));
    ctx.font = `700 ${fs}px Kanit`;
    let widths = parts.map((p) => ctx.measureText(p).width);
    let total = widths.reduce((x, y) => x + y, 0) + (parts.length - 1) * 14;
    if (total > 940) { const r = 940 / total; fs *= r; widths = widths.map((w) => w * r); total = 940; }
    let x = CX - total / 2, s = `<g opacity="${f(k)}">`;
    // ไม่มีกล่อง: ตัวหนังสือขาวขอบเข้มหนา + เงานุ่ม · คำที่ครอบด้วย *...* เป็นคำเน้น (สีเหลือง ใหญ่ขึ้น)
    const per = Math.min(0.12, Math.max(0.05, ((sb.t1 - sb.t0) * 0.55) / Math.max(1, parts.length)));
    parts.forEach((p, i) => {
      const pop = RK.ease.back(RK.clamp((a - i * per) / 0.22)), isH = hl.includes(i) || /^\*.*\*$/.test(p), txt = p.replace(/\*/g, "");
      const cx = x + widths[i] / 2, sz = fs * (isH ? 1.12 : 1);
      s += `<g transform="translate(${f(cx)},${f(y)}) scale(${f(0.7 + 0.3 * pop)})" opacity="${f(RK.clamp(pop * 1.5))}">` +
        `<text text-anchor="middle" y="6" font-family="Kanit" font-weight="800" font-size="${f(sz)}" fill="#000" opacity=".35" filter="url(#fBlur8)">${RK.esc(txt)}</text>` +
        `<text text-anchor="middle" font-family="Kanit" font-weight="800" font-size="${f(sz)}" fill="${isH ? "#FFD84A" : "#FFFFFF"}" stroke="#1A1220" stroke-width="${f(sz * 0.2)}" stroke-linejoin="round" paint-order="stroke">${RK.esc(txt)}</text></g>`;
      x += widths[i] + 14;
    });
    return s + `</g>`;
  }

  // ---------- นักแสดง: เดินอัตโนมัติจากความเร็วแกน x ----------
  function prepActor(a, t) {
    const A = RK.resolve(a, t); if (A.y == null) A.y = 0; if (A.x == null) A.x = 0;
    const sc = (A.s || 0.5) * ((RK.FLAT_CAST[A.who] || {}).h || 1);
    const x1 = RK.kf(a.x, t - 0.04), x2 = RK.kf(a.x, t + 0.04), sp = Math.abs(x2 - x1) / 0.08;
    const strideW = (RK.flatStride ? RK.flatStride(A.who, !!A.run) : RK.FLAT_STRIDE) * sc;
    const side = A.view !== "front" && A.view !== "back";
    A._walking = side && !A.free && !(A.sitK > 0) ? RK.clamp(sp / (strideW * 0.55)) : 0;
    A._walkP = ((A.x * (A.dir || 1)) / strideW % 1 + 1) % 1;
    if (!side) { // เดินเข้า/ออกจากกล้อง: จังหวะจากระยะที่เคลื่อนในแนวลึก
      const y1 = RK.kf(a.y, t - 0.04), y2 = RK.kf(a.y, t + 0.04), spY = Math.abs(y2 - y1) / 0.08, strideY = strideW * 0.32;
      A._fw = RK.clamp(spY / (strideY * 0.55)); A._fwP = ((Math.abs(A.y) / strideY) % 1 + 1) % 1; A._fwDir = Math.sign(y2 - y1) || 1;
    }
    // พูด: ช่วงเวลา say [[t0,t1],...]
    A.talk = 0;
    for (const [s0, s1] of a.say || []) if (t >= s0 && t <= s1) {
      const n = RK.noise1(t * 11, 3) * 0.7 + RK.noise1(t * 23, 7) * 0.3;
      A.talk = RK.clamp((n - 0.2) * 1.5) * RK.clamp((t - s0) / 0.08) * RK.clamp((s1 - t) / 0.08);
    }
    // ลิปซิงก์จริงจากความดังของเสียง (produce ใส่ env: [[t0, fps, [ค่า...]], ...])
    if (a.env) for (const [e0, fps, v] of a.env) { const i = Math.floor((t - e0) * fps); if (i >= 0 && i < v.length) { const fr = (t - e0) * fps - i, x = v[i] * (1 - fr) + (v[i + 1] ?? 0) * fr; A.talk = RK.clamp(x * 1.15); } }
    // ท่าคนฟัง: พยักหน้าเบาๆ + เอียงหัว ตอนอีกคนพูด
    if (a.listenAt) for (const [s0, s1] of a.listenAt) if (t >= s0 && t <= s1 + 0.4) { const k = RK.clamp((t - s0) / 0.3) * RK.clamp((s1 + 0.4 - t) / 0.3); A.nod = (A.nod || 0) + k * Math.max(0, Math.sin((t - s0) * 4.2)) * 4; A.tilt = (A.tilt || 0) + k * 3; }
    if (A.laugh > 0) { A.talk = Math.max(A.talk, (0.45 + 0.55 * Math.abs(Math.sin(t * 15))) * A.laugh); if (A.mood !== "laugh") A.mood = "laugh"; }
    if (a.chew) for (const [s0, s1] of a.chew) if (t >= s0 && t <= s1) A.talk = Math.max(A.talk, 0.15 + 0.15 * Math.abs(Math.sin(t * 9)));
    if (a.blinkAt) for (const b of a.blinkAt) { const d = Math.abs(t - b); if (d < 0.08) A.blink = 1 - d / 0.08; }
    return A;
  }

  RK.frame = function (T) {
    const [S, t, si] = shotAt(T);
    const cam = RK.resolve(S.cam || { x: 0, y: -600, z: 0.8 }, t);
    const hh = S.shake ?? EP.handheld ?? 1; // กล้องมือถือ: สั่นนุ่มๆ ไม่เป็นจังหวะ
    cam.x += (RK.noise1(T * 0.9, 11) - 0.5) * 14 * hh / cam.z; cam.y += (RK.noise1(T * 0.8, 29) - 0.5) * 10 * hh / cam.z;
    const rot = (RK.noise1(T * 0.6, 41) - 0.5) * 0.9 * hh;
    // whip-pan: ปลายช็อตเหวี่ยงออก ต้นช็อตถัดไปเหวี่ยงเข้า (แทนแฟลชขาว)
    const nx = EP.shots[si + 1], WIN = 0.16;
    let whip = 0, wdir = S.whipDir || 1;
    if (nx && (nx.cut || EP.cut) === "whip" && S.dur - t < WIN) whip = -Math.pow(1 - (S.dur - t) / WIN, 2);
    if (si > 0 && (S.cut || EP.cut) === "whip" && t < WIN) whip = Math.pow(1 - t / WIN, 2);
    if (whip) cam.x += whip * wdir * 700 / cam.z;
    RK._camPx = cam.x; RK._camPy = cam.y;
    const set = RK.flatSets[S.set || EP.set || "kitchen"], o = Object.assign({}, EP.setOpts || {}, S.setOpts || {}, { _t: t });
    const f4 = (n) => (Math.round(n * 10000) / 10000).toString(); // กล้องต้องละเอียด ไม่งั้นซูมกระตุกเป็นขั้นบันได
    const camT = (par = 1) => `translate(${CX},${CY}) scale(${f4(cam.z * par)}) translate(${f4(-cam.x)},${f4(-cam.y)})`;
    const dof = RK.resolve(S.dof || {}, t);
    const blurG = (inner, px) => px > 0.3 ? `<g filter="url(#dof${Math.round(px)})">${inner}</g>` : inner;
    const actors = (S.actors || []).map((a) => prepActor(a, t));
    const drawActors = (layer) => actors.filter((A) => (A.layer || "front") === layer).sort((p, q) => (p.y || 0) - (q.y || 0)).map((A, i) => {
      const g = RK.flatActor(A, T);
      if (A.sink == null && A.clipY == null) return g;
      // นั่งหลังโต๊ะ/เคาน์เตอร์ (มุมหน้า): เลื่อนตัวลงแล้วตัดส่วนล่างทิ้ง
      const id = `ck${layer}${i}`, cy = A.clipY ?? 0;
      return `<clipPath id="${id}"><rect x="-8000" y="-8000" width="16000" height="${f(8000 + cy)}"/></clipPath><g clip-path="url(#${id})"><g transform="translate(0,${f(A.sink || 0)})">${g}</g></g>`;
    }).join("");
    let defs = RK.flatDefs;
    // ตัวละครเด่นจากฉาก: ขยายตัว + เส้นขอบเข้ม (หนาคงที่บนจอ ไม่ขึ้นกับซูม) + ฉากหลังหรี่/ลดสี
    RK._actorK = EP.actorK ?? 1.22;
    const olW = S.outline ?? EP.outline ?? 3.2;
    if (olW > 0) {
      const zr = Math.max(0.6, cam.z), rr = (Math.round(olW / zr * 100) / 100), oid = `olin${Math.round(rr * 100)}`;
      RK._olin = oid;
      defs += `<filter id="${oid}" x="-5%" y="-5%" width="110%" height="110%"><feMorphology in="SourceAlpha" operator="dilate" radius="${rr}" result="d"/><feFlood flood-color="#2B1C18" flood-opacity=".92"/><feComposite in2="d" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
    } else RK._olin = null;
    const bgDim = S.bgDim ?? EP.bgDim ?? 0.22;
    for (const px of new Set([dof.bg, dof.mid, dof.fg ?? 9, dof.act].filter((v) => v > 0.3).map(Math.round))) defs += `<filter id="dof${px}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${px}"/></filter>`;

    const wb = Math.round(Math.abs(whip) * 60);
    if (wb > 1) defs += `<filter id="whipB" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation="${wb} 0"/></filter>`;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>`;
    s += `<rect width="${W}" height="${H}" fill="#2A1E1C"/><g ${wb > 1 ? 'filter="url(#whipB)"' : ""} transform="rotate(${f(rot)} ${CX} ${CY}) translate(${CX},${CY}) scale(1.02) translate(${-CX},${-CY})">`;
    s += blurG(`<g transform="${camT()}">${set.wall(T, o)}${set.lamps(T, o)}</g>`, dof.bg || 0);
    if (bgDim > 0) s += `<rect x="${-W}" y="${-H}" width="${3 * W}" height="${3 * H}" fill="${S.bgDimColor || EP.bgDimColor || "#24324A"}" opacity="${bgDim}" style="mix-blend-mode:multiply"/>`;
    s += blurG(`<g transform="${camT()}">${drawActors("back")}</g>`, dof.act || 0);
    s += blurG(`<g transform="${camT()}">${set.island(T, o)}${RK.flatProps ? RK.flatProps(S, t, T, "mid") : ""}</g>`, dof.mid || 0);
    s += blurG(`<g transform="${camT()}">${drawActors("front")}</g>`, dof.act || 0);
    if (RK.flatProps) s += blurG(`<g transform="${camT()}">${RK.flatProps(S, t, T, "front")}</g>`, dof.pf || 0);
    s += `<g transform="${camT()}">${set.sunlight(T, o)}</g>`;
    s += blurG(`<g transform="${camT(1.25)}">${set.foreground(T, o)}</g>`, dof.fg ?? 9);
    s += `</g>`;
    if (RK.flatGrade) s += RK.flatGrade(S, t);
    // เกรดสี + ขอบมืด + เกรน
    s += `<rect width="${W}" height="${H}" fill="url(#gradeTop)"/><rect width="${W}" height="${H}" fill="url(#vigF)"/>`;
    s += `<image href="${GRAIN}" width="${W}" height="${H}" preserveAspectRatio="none" opacity=".03" style="mix-blend-mode:overlay"/>`;
    // UI
    if (RK.flatFx) s += RK.flatFx(S, t);
    for (const u of S.ui || []) s += u.type === "chip" ? chip(u, t) : (RK.flatUi && RK.flatUi[u.type]) ? RK.flatUi[u.type](u, t) : card(u, t);
    for (const sb of S.subs || []) s += subtitle(sb, t);
    // เฟดเข้า/ออก + แฟลชตัดช็อต
    let fade = 0;
    if (S.fadeIn) fade = Math.max(fade, 1 - RK.clamp(t / S.fadeIn));
    if (S.fadeOut) fade = Math.max(fade, 1 - RK.clamp((S.dur - t) / S.fadeOut));
    if (fade > 0) s += `<rect width="${W}" height="${H}" fill="#120C0E" opacity="${f(fade)}"/>`;
    if (S.flash && t < 0.2) s += `<rect width="${W}" height="${H}" fill="#FFFFFF" opacity="${f((1 - t / 0.2) * 0.35)}"/>`;
    return s + `</svg>`;
  };
  RK.mount = function (T) { document.getElementById("stage").innerHTML = RK.frame(T); };
})(window);
