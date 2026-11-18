// ตัวเรนเดอร์: อ่านตอน (episode JSON) แล้ววาดเฟรมที่เวลา T
(function (G) {
  const RK = G.RK, f = RK.f, W = RK.W, H = RK.H;
  let EP = null, STARTS = [], GRAIN = "";

  const DEFS = `
  <radialGradient id="poolGlow"><stop offset="0" stop-color="#E9F5DD" stop-opacity=".55"/><stop offset="1" stop-color="#E9F5DD" stop-opacity="0"/></radialGradient>
  <radialGradient id="lampGlow"><stop offset="0" stop-color="#FFFFF4" stop-opacity=".9"/><stop offset=".35" stop-color="#DDF2D0" stop-opacity=".35"/><stop offset="1" stop-color="#DDF2D0" stop-opacity="0"/></radialGradient>
  <radialGradient id="depthFog"><stop offset="0" stop-color="#000" stop-opacity=".85"/><stop offset=".5" stop-color="#05070B" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <radialGradient id="ghostGlow"><stop offset="0" stop-color="#BFE3F0" stop-opacity=".22"/><stop offset="1" stop-color="#BFE3F0" stop-opacity="0"/></radialGradient>
  <radialGradient id="vig" cx=".5" cy=".46" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".88"/></radialGradient>
  <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF6CF" stop-opacity=".75"/><stop offset="1" stop-color="#FFF6CF" stop-opacity="0"/></linearGradient>
  <radialGradient id="beamSpot"><stop offset="0" stop-color="#FFF4C6" stop-opacity=".55"/><stop offset="1" stop-color="#FFF4C6" stop-opacity="0"/></radialGradient>
  <radialGradient id="underLight" cx=".5" cy="1" r=".9"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".45"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient>
  <linearGradient id="subShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
  <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="blur14"><feGaussianBlur stdDeviation="14"/></filter>`;

  function makeGrain() {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const g = c.getContext("2d"), d = g.createImageData(256, 256), r = RK.rng(77);
    for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0); return c.toDataURL("image/png");
  }

  RK.load = function (ep) {
    EP = ep; STARTS = []; let t = 0;
    if (ep.prop && RK.PROPS) RK.PROP = RK.PROPS[ep.prop];
    RK.SUBY = ep.subY || 1330;
    for (const s of ep.shots) { STARTS.push(t); t += s.dur; }
    EP.duration = t;
    if (!GRAIN) GRAIN = makeGrain();
    return t;
  };

  function shotAt(T) {
    let i = STARTS.length - 1;
    while (i > 0 && T < STARTS[i]) i--;
    return [EP.shots[i], T - STARTS[i], i];
  }

  // ---------- ตัวละครในฉาก ----------
  function placeActor(a, cam, t) {
    const A = RK.resolve(a, t);
    if (A.z != null) { // วางในโลก 3 มิติ
      const [x, y] = cam.proj(A.x || 0, RK.sets.corridor.FLOOR, A.z);
      // ผี ~200 ซม. สูง 1100 หน่วย · คน: ความสูงจริงตามสเปก (ผู้ใหญ่ ~172 ซม.)
      const who = A.type === "hero" ? "hero" : A.who;
      const units = A.type === "ghost" ? 1100 : RK.personHeight ? RK.personHeight(who) : 900;
      const cm = A.type === "ghost" ? 200 : A.cm || ((RK.CAST[who] && RK.CAST[who].cm) || 172);
      A.x = x + (A.dx || 0); A.y = y + (A.dy || 0); A.s = (cam.scaleAt(A.z) * cm / units) * (A.size || 1);
      A._z = A.z;
    } else { A._z = A.depth ?? 0; }
    if (A.type === "fig" && RK.figMoveX) {
      const dx = RK.figMoveX(A, t);
      // ถึงจุดหยุดแล้ว → เปลี่ยนเป็นท่าที่กำหนด (ค่าเริ่ม idle) ไม่ย่ำเท้าอยู่กับที่
      if (A.stopX != null && Math.abs((A.x || 0) + dx - A.stopX) < 0.5) { A.motion = A.after || "idle"; A.move = 0; }
      A.x = (A.x || 0) + dx;
    }
    return A;
  }
  function drawActor(A, t) {
    if (A.hidden) return "";
    if (A.type === "hero") return RK.person("hero", A, t);
    if (A.type === "person") return RK.person(A.who, A, t);
    if (A.type === "cat") return RK.cat(A, t);
    if (A.type === "fig") return RK.fig(A, t);
    if (A.type === "ghost") return RK.ghost(A, t);
    if (A.type === "hand") return ghostHand(A, t);
    return "";
  }
  function ghostHand(A, t) { // มือผีซีดเข้ามาในเฟรม (ช็อตใกล้): แขนผอมยาว ฝ่ามือ + 4 นิ้วงอ + เล็บเทา
    const sh = Math.sin(t * 9) * 3, INK = RK.INK, sk = "#D3DBD8", skS = "#AEB9B6";
    const fingers = [[-46, 1.0], [-16, 1.12], [14, 1.06], [40, 0.88]].map(([y, k], i) => {
      const L = 120 * k, cx = -70 - L * 0.55, ex = -70 - L, ey = y + 34 * k;
      const d = `M-70,${y} Q${f(cx)},${f(y - 6)} ${f(ex)},${f(ey)}`;
      return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="34" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${sk}" stroke-width="22" stroke-linecap="round"/><ellipse cx="${f(ex + 2)}" cy="${f(ey + 4)}" rx="9" ry="7" fill="#7E8A88"/>`;
    }).join("");
    const thumb = `<path d="M-40,62 Q-80,96 -122,96" fill="none" stroke="${INK}" stroke-width="36" stroke-linecap="round"/><path d="M-40,62 Q-80,96 -122,96" fill="none" stroke="${sk}" stroke-width="24" stroke-linecap="round"/>`;
    const armP = `<path d="M-20,-50 L700,-34 L700,34 L-20,66Z" fill="${sk}" stroke="${INK}" stroke-width="8"/><path d="M60,20 L700,26" stroke="${skS}" stroke-width="10" opacity=".7"/><path d="M120,-30 q30,10 60,0 M300,-26 q30,10 60,0" fill="none" stroke="${skS}" stroke-width="5"/>`;
    const palm = `<path d="M-90,-62 Q-30,-80 20,-56 L24,72 Q-40,96 -96,70Z" fill="${sk}" stroke="${INK}" stroke-width="8"/>`;
    return `<g transform="translate(${f(A.x)},${f(A.y + sh)}) rotate(${f(A.rot || 0)}) scale(${f(A.s || 1)})" opacity="${f(A.alpha ?? 1)}">${armP}${thumb}${palm}${fingers}</g>`;
  }

  // ลำแสงไฟฉาย
  function beam(A, len, spread, alpha) {
    const [x, y, e0] = RK.heroTorchTip(A);
    const dir = A.facing || 1;
    const e = A.beamAngle != null ? (A.beamAngle * Math.PI) / 180 : (dir > 0 ? e0 : Math.PI - e0);
    const L = len * (A.s || 1), w = spread * (A.s || 1);
    const deg = (e * 180) / Math.PI;
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(deg)})" style="mix-blend-mode:screen" opacity="${f(alpha)}"><path d="M0,-10 L${f(L)},${f(-w)} L${f(L)},${f(w)} L0,10Z" fill="url(#beam)"/><ellipse cx="${f(L * 0.92)}" cy="0" rx="${f(L * 0.14)}" ry="${f(w * 1.05)}" fill="url(#beamSpot)"/></g>`;
  }

  // ---------- ข้อความบนจอ ----------
  function wrapThai(text, max) { // ตัดบรรทัดตามช่องว่าง/ตัวแบ่ง | ที่เขียนไว้ในบท
    const parts = String(text).split("|"); if (parts.length > 1) return parts;
    if (text.length <= max) return [text];
    const words = text.split(" "), lines = [""];
    for (const w of words) { if ((lines[lines.length - 1] + " " + w).trim().length > max) lines.push(w); else lines[lines.length - 1] = (lines[lines.length - 1] + " " + w).trim(); }
    return lines;
  }
  function subtitle(text, t, dur) {
    if (!text) return "";
    const lines = wrapThai(text, 22), y0 = (RK.SUBY || 1330) - (lines.length - 1) * 92, a = RK.clamp(t / 0.12) * RK.clamp((dur - t) / 0.12);
    const pop = 1 + 0.06 * (1 - RK.clamp(t / 0.18));
    return `<g opacity="${f(a)}" transform="translate(540,${y0}) scale(${f(pop)})">` + lines.map((l, i) =>
      `<text x="0" y="${i * 92}" text-anchor="middle" font-family="Kanit" font-weight="700" font-size="70" fill="#fff" stroke="#000" stroke-width="16" stroke-linejoin="round" paint-order="stroke">${RK.esc(l)}</text>`).join("") + `</g>`;
  }
  function hookText(text, t) {
    if (!text) return "";
    const lines = wrapThai(text, 16), a = RK.clamp(t / 0.15), sc = RK.lerp(1.25, 1, RK.ease.snap(RK.clamp(t / 0.35)));
    return `<g opacity="${f(a)}" transform="translate(540,300) scale(${f(sc)})">` + lines.map((l, i) =>
      `<text x="0" y="${i * 104}" text-anchor="middle" font-family="Kanit" font-weight="900" font-size="88" fill="#FFD43B" stroke="#140C02" stroke-width="20" stroke-linejoin="round" paint-order="stroke">${RK.esc(l)}</text>`).join("") + `</g>`;
  }
  function card(c, t) {
    const a = RK.clamp(t / 0.3);
    return `<rect width="${W}" height="${H}" fill="#050507"/><g opacity="${f(a)}"><text x="540" y="880" text-anchor="middle" font-family="Kanit" font-weight="900" font-size="96" fill="#FFD43B">${RK.esc(c.title || "")}</text><text x="540" y="990" text-anchor="middle" font-family="Kanit" font-weight="500" font-size="52" fill="#E8E8E8">${RK.esc(c.sub || "")}</text></g>`;
  }

  // ---------- เฟรม ----------
  RK.frame = function (T) {
    const [S, t, idx] = shotAt(T);
    let out = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${DEFS}</defs>`;
    if (S.card) { out += card(S.card, t) + "</svg>"; return out; }
    const camP = RK.resolve(S.cam || {}, t);
    // กล้องตามตัวละคร: cam.follow = ลำดับนักแสดง · cam.followX = ตำแหน่งบนจอที่ให้ตัวละครอยู่ (ค่าเริ่ม 540)
    if (camP.follow != null && S.actors && S.actors[camP.follow]) {
      const A0 = RK.resolve(S.actors[camP.follow], t), ax = (A0.x || 0) + (A0.type === "fig" && RK.figMoveX ? RK.figMoveX(A0, t) : 0);
      camP.panX = (camP.panX || 0) + ((camP.followX ?? 540) - 540) / (camP.zoom || 1) + 540 - ax;
    }
    // ไม่ให้กล้องหลุดขอบโลกของฉาก (ฉากที่ประกาศขอบเขต RK.sets[x].BOUNDS = [ซ้าย, ขวา])
    const BD = (RK.sets[S.set || "corridor"] || {}).BOUNDS;
    if (BD) { const z = camP.zoom || 1, hi = 540 - 540 / z - BD[0], lo = 540 + 540 / z - BD[1]; camP.panX = Math.min(Math.max(camP.panX || 0, Math.min(lo, hi)), Math.max(lo, hi)); }
    const cam = RK.makeCam(camP);
    const env = RK.resolve(S.env || {}, t);
    const set = RK.sets[S.set || "corridor"](cam, t + (S.seed || 0), env);
    const actors = (S.actors || []).map((a) => placeActor(a, cam, t)).sort((a, b) => b._z - a._z);

    let scene = `<g ${camP.bgBlur ? `filter="url(#blur${camP.bgBlur})"` : ""}>${set.svg}</g>`;
    // ชั้นฉากตามระยะลึก (set.layers [{depth, svg}]) สลับกับตัวละครตาม depth: ไกล (ค่ามาก) วาดก่อน
    const L = (set.layers || []).slice().sort((a, b) => b.depth - a.depth);
    let li = 0;
    for (const A of actors.filter((A) => A.type !== "ghost")) {
      while (li < L.length && L[li].depth > A._z) scene += L[li++].svg;
      scene += `<g data-actor="${A.who || A.type}">${drawActor(A, t)}</g>`;
    }
    while (li < L.length) scene += L[li++].svg;
    if (set.fg) scene += set.fg;
    // ความมืดทั้งฉาก
    scene += `<rect x="-300" y="-300" width="${W + 600}" height="${H + 600}" fill="#020308" opacity="${f(set.dark)}"/>`;
    // ผีเรืองแสงเอง: วาดหลังทาความมืด (มืดลงแค่บางส่วน)
    scene += actors.filter((A) => A.type === "ghost").map((A) => `<g opacity="${f(1 - set.dark * 0.45)}">${drawActor(A, t)}</g>`).join("");
    // แสงไฟฉาย (ส่องหลังทาความมืด จึงสว่างจริง)
    for (const A of actors) if (A.type === "hero" && A.torch && A.torch !== "off" && !A.hidden) scene += beam(A, A.beamLen || 1500, A.beamSpread || 260, A.beamAlpha ?? 0.9);
    if (S.fx && S.fx.underLight) scene += `<rect x="0" y="${H * 0.35}" width="${W}" height="${H * 0.65}" fill="url(#underLight)" style="mix-blend-mode:screen" opacity="${f(RK.kf(S.fx.underLight, t))}"/>`;
    // กล้อง: ซูม / แพน / เอียง / สั่น
    const z = camP.zoom || 1, px = camP.panX || 0, py = camP.panY || 0, roll = camP.roll || 0;
    const shake = RK.kf((S.fx && S.fx.shake) || 0, t);
    const sx = shake ? (RK.noise1(T * 25, 1) - 0.5) * 2 * shake : 0, sy = shake ? (RK.noise1(T * 25, 2) - 0.5) * 2 * shake : 0;
    out += `<g transform="translate(${f(540 + sx)},${f(960 + sy)}) rotate(${f(roll)}) scale(${f(z)}) translate(${f(-540 + px)},${f(-960 + py)})">${scene}</g>`;
    // แสงแฟลช (ไฟกลับมาติดทันที)
    const flash = RK.kf((S.fx && S.fx.flash) || 0, t);
    if (flash) out += `<rect width="${W}" height="${H}" fill="#fff" opacity="${f(flash)}"/>`;
    // โทนสี + ขอบมืด + เกรน
    if (set.tone !== false) out += `<rect width="${W}" height="${H}" fill="#123A3A" opacity=".16" style="mix-blend-mode:overlay"/>`;
    out += `<rect width="${W}" height="${H}" fill="url(#vig)"${set.tone === false ? ' opacity=".4"' : ""}/>`;
    const gr = (S.fx && S.fx.grain) ?? 0.09;
    if (gr) { const ox = Math.floor(RK.hash(Math.floor(T * 30)) * 256), oy = Math.floor(RK.hash(Math.floor(T * 30) + 9) * 256);
      out += `<defs><pattern id="gp" width="256" height="256" patternUnits="userSpaceOnUse" x="${ox}" y="${oy}"><image href="${GRAIN}" width="256" height="256"/></pattern></defs><rect width="${W}" height="${H}" fill="url(#gp)" opacity="${f(gr)}" style="mix-blend-mode:overlay"/>`; }
    // เปิดจากดำ
    if (S.fadeIn && t < S.fadeIn) out += `<rect width="${W}" height="${H}" fill="#000" opacity="${f(1 - t / S.fadeIn)}"/>`;
    if (S.fadeOut && t > S.dur - S.fadeOut) out += `<rect width="${W}" height="${H}" fill="#000" opacity="${f((t - (S.dur - S.fadeOut)) / S.fadeOut)}"/>`;
    // ข้อความ
    for (const sub of S.subs || []) if (t >= sub[0] && t < sub[1]) out += subtitle(sub[2], t - sub[0], sub[1] - sub[0]);
    if (S.hook && t < (S.hookDur || 2.6)) out += hookText(S.hook, t);
    return out + "</svg>";
  };

  RK.mount = function (T) { document.getElementById("stage").innerHTML = RK.frame(T); };
})(window);
