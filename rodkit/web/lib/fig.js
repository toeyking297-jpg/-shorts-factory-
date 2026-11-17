// สไตล์ 2 (ตามภาพอ้างอิง): สัดส่วน ~6 หัว มุม 3/4 เส้นบางสีเข้มของชิ้นนั้น เงาด้านเดียว (แสงจากซ้ายบน) ผ้ามีรอยยับ
// พิกัด: (0,0) = กลางเท้า, สูงทั้งตัว ~1235 หน่วยที่ scale 1 · หันหน้าไปทางขวาของจอ (facing:-1 = กลับด้าน)
(function (G) {
  const RK = G.RK, f = RK.f;
  const OW = 3.6;                                   // ความหนาเส้นขอบ
  const ink = (c) => RK.shade(c, -0.42);            // เส้นขอบ = สีเข้มของชิ้นนั้น
  const shd = (c) => RK.shade(c, -0.16);            // เงา
  const hil = (c) => RK.shade(c, 0.18);             // ไฮไลต์
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
  const rot = (v, deg) => { const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
  const P = (p) => `${f(p[0])},${f(p[1])}`;

  // ท่อนแขนขา: จาก a ไป b กว้าง w0→w1 มีโค้งกล้าม + เงาด้านขวา
  function seg(a, b, w0, w1, fill, o = {}) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, u = [dx / L, dy / L], n = [-u[1], u[0]];
    const bul = o.bulge ?? 0.06, m = Math.max(w0, w1) * (0.5 + bul);
    const A1 = add(a, mul(n, w0 / 2)), A2 = add(a, mul(n, -w0 / 2)), B1 = add(b, mul(n, w1 / 2)), B2 = add(b, mul(n, -w1 / 2));
    const M1 = add(add(a, mul(u, L * 0.4)), mul(n, m)), M2 = add(add(a, mul(u, L * 0.4)), mul(n, -m));
    // ปลายมนด้วยเส้นโค้งที่ดันออกไปตามแนวกระดูกเสมอ (ไม่พลิกเป็นรอยเว้า)
    const capB = o.flatEnd ? `L${P(B2)}` : `C${P(add(B1, mul(u, w1 * 0.55)))} ${P(add(B2, mul(u, w1 * 0.55)))} ${P(B2)}`;
    const d = `M${P(A1)} Q${P(M1)} ${P(B1)} ${capB} Q${P(M2)} ${P(A2)} C${P(add(A2, mul(u, -w0 * 0.55)))} ${P(add(A1, mul(u, -w0 * 0.55)))} ${P(A1)}Z`;
    let s = `<path d="${d}" fill="${fill}" stroke="${ink(fill)}" stroke-width="${OW}" stroke-linejoin="round"/>`;
    // เงา: ด้านที่หันไปทางขวา/ล่าง (ตรงข้ามแสง)
    const sideN = n[0] + n[1] * 0.4 >= 0 ? n : mul(n, -1);
    const S1 = add(a, mul(sideN, w0 * 0.47)), S2 = add(b, mul(sideN, w1 * 0.47)), S3 = add(b, mul(sideN, w1 * 0.12)), S4 = add(a, mul(sideN, w0 * 0.12));
    const SM = add(add(a, mul(u, L * 0.4)), mul(sideN, m * 0.92));
    if (!o.noShade) s += `<path d="M${P(S1)} Q${P(SM)} ${P(S2)} L${P(S3)} L${P(S4)}Z" fill="${shd(fill)}"/>`;
    if (o.folds) s += o.folds.map(([t, k]) => { const c = add(a, mul(u, L * t)); const p1 = add(c, mul(n, -w0 * 0.3 * k)), p2 = add(c, mul(n, w0 * 0.25 * k)); const q = add(add(c, mul(u, 10)), mul(n, 0)); return `<path d="M${P(p1)} Q${P(q)} ${P(p2)}" fill="none" stroke="${ink(fill)}" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>`; }).join("");
    return s;
  }
  function chain(base, a1, L1, a2, L2) { // มุมเป็นองศาจากแนวดิ่งลง (+ = หมุนตามเข็ม)
    const e = add(base, rot([0, L1], a1)), w = add(e, rot([0, L2], a1 + a2));
    return [base, e, w, a1 + a2];
  }

  // ---------- มือ 3/4 ----------
  function hand(type, at, ang, C, near) {
    const sk = C.skin, o = ink(sk), sh = shd(sk);
    let s = "";
    if (type === "pocket") return "";
    if (type === "open") { // แบมือ ฝ่ามือขึ้น/หันออก นิ้วกางเล็กน้อย
      s += `<path d="M-16,0 Q-22,22 -16,44 Q0,52 18,44 Q24,22 16,0Z" fill="${sk}" stroke="${o}" stroke-width="${OW}"/>`;
      s += [[-13, 40, -8], [-4, 46, -3], [6, 45, 3], [15, 36, 8]].map(([x, L, sp]) => `<path d="M${x},38 q${sp * 0.5},${L * 0.5} ${sp},${L}" fill="none" stroke="${o}" stroke-width="${8.5 + OW}" stroke-linecap="round"/><path d="M${x},38 q${sp * 0.5},${L * 0.5} ${sp},${L}" fill="none" stroke="${sk}" stroke-width="8.5" stroke-linecap="round"/>`).join("");
      s += `<path d="M-14,8 Q-34,18 -38,36" fill="none" stroke="${o}" stroke-width="${10 + OW}" stroke-linecap="round"/><path d="M-14,8 Q-34,18 -38,36" fill="none" stroke="${sk}" stroke-width="10" stroke-linecap="round"/>`;
      s += `<path d="M-8,10 Q-2,24 -6,38 M-12,30 Q2,26 12,30" fill="none" stroke="${sh}" stroke-width="2.4"/>`;
    } else if (type === "fist") {
      s += `<path d="M-18,0 Q-24,20 -20,38 Q-14,50 0,50 Q16,50 20,38 Q24,20 18,0Z" fill="${sk}" stroke="${o}" stroke-width="${OW}"/>`;
      s += `<path d="M-14,38 q4,8 8,0 M-4,40 q4,8 8,0 M6,38 q4,8 8,0" fill="none" stroke="${sh}" stroke-width="2.6"/><path d="M-18,12 Q-26,26 -10,32" fill="none" stroke="${o}" stroke-width="2.6"/>`;
    } else { // relaxed: มือห้อย มองจากด้านนิ้วโป้ง นิ้วงอเข้า
      const t = near ? 1 : -1;
      s += `<path d="M${t * -12},0 C${t * -15},18 ${t * -16},36 ${t * -14},50 C${t * -12},64 ${t * -4},74 ${t * 6},74 C${t * 14},72 ${t * 16},62 ${t * 14},50 C${t * 14},34 ${t * 13},16 ${t * 12},0Z" fill="${sk}" stroke="${o}" stroke-width="${OW}"/>`;
      s += `<path d="M${t * -13},48 Q${t * 0},54 ${t * 12},50 M${t * -10},60 Q${t * 1},66 ${t * 11},61" fill="none" stroke="${sh}" stroke-width="2.4"/>`;
      s += `<path d="M${t * 10},10 Q${t * 22},28 ${t * 15},46" fill="none" stroke="${o}" stroke-width="${9 + OW}" stroke-linecap="round"/><path d="M${t * 10},10 Q${t * 22},28 ${t * 15},46" fill="none" stroke="${sk}" stroke-width="9" stroke-linecap="round"/>`;
    }
    return `<g transform="translate(${P(at)}) rotate(${f(ang)})">${s}</g>`;
  }

  // ---------- หัว 3/4 หันขวา ----------
  function head(C, p, t) {
    const sk = C.skin, o = ink(sk), sh = shd(sk), H = C.hair;
    const face = p.face || "smile", blink = (t + 0.7) % 3.9 < 0.1;
    const lx = p.lookX || 0;
    let s = "";
    // คอ
    s += `<path d="M-22,-1012 L-26,-968 Q10,-958 44,-966 L40,-1008Z" fill="${sk}" stroke="${o}" stroke-width="${OW}"/><path d="M8,-1010 L4,-966 Q26,-962 44,-966 L40,-1008Z" fill="${sh}"/>`;
    // หูข้างใกล้
    s += `<path d="M-60,-1100 Q-82,-1104 -82,-1078 Q-80,-1054 -58,-1050Z" fill="${sk}" stroke="${o}" stroke-width="${OW}"/><path d="M-64,-1092 Q-76,-1084 -66,-1062" fill="none" stroke="${sh}" stroke-width="3"/>`;
    // หน้า: หน้าผากโค้ง โหนกแก้มด้านหน้า กรามเหลี่ยม คางแหลมนิด
    const faceD = "M-62,-1186 C-20,-1222 62,-1214 88,-1160 C96,-1140 96,-1122 94,-1106 L100,-1078 Q96,-1050 86,-1032 Q74,-1006 54,-994 Q30,-986 6,-994 Q-34,-1004 -54,-1036 Q-66,-1056 -66,-1090 Q-74,-1150 -62,-1186Z";
    s += `<path d="${faceD}" fill="${sk}" stroke="${o}" stroke-width="${OW}" stroke-linejoin="round"/><clipPath id="fig_face"><path d="${faceD}"/></clipPath>`;
    s += `<path d="M78,-1100 Q86,-1050 54,-998 Q72,-1004 84,-1030 Q96,-1052 100,-1078Z" fill="${sh}"/><path d="M-20,-1000 Q16,-990 50,-996 Q30,-984 6,-990Z" fill="${sh}"/>`;
    // หนวดเคราบาง + ตอหนวด
    s += `<path d="M-50,-1040 Q-30,-1004 8,-994 Q40,-988 62,-1004 Q84,-1024 92,-1050 Q80,-1028 58,-1022 Q30,-1018 6,-1024 Q-28,-1030 -50,-1040Z" fill="${C.stubble}" opacity=".2" clip-path="url(#fig_face)"/>`;
    const r = RK.rng(91); let dots = "";
    for (let i = 0; i < 420; i++) { const x = -48 + r() * 140, y = -1050 + r() * 56; if (y > -1052 + Math.max(0, x - 70) * 0.8 && !(x > 18 && x < 64 && y > -1044 && y < -1020)) dots += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.45 + r() * 0.5)}"/>`; }
    s += `<g fill="${C.stubble}" opacity=".26" clip-path="url(#fig_face)">${dots}</g>`;
    s += `<path d="M22,-1046 Q40,-1054 62,-1046 Q44,-1042 22,-1046Z" fill="${C.stubble}" opacity=".55"/>`;
    // ตา (ข้างใกล้กว้าง ข้างไกลแคบ)
    const eye = (cx, w, far) => {
      if (blink) return `<path d="M${cx - w},-1106 Q${cx},-1100 ${cx + w},-1106" fill="none" stroke="${o}" stroke-width="3.4" stroke-linecap="round"/>`;
      const hh = face === "surprised" ? 13 : 8.5;
      let e = `<path d="M${cx - w},-1106 Q${cx},${-1106 - hh * 1.5} ${cx + w},-1108 Q${cx},${-1106 + hh} ${cx - w},-1106Z" fill="#FBFAF6"/>`;
      const ix = cx + w * 0.25 + lx * w * 0.3;
      e += `<circle cx="${f(ix)}" cy="-1105" r="${f(far ? 5.6 : 6.6)}" fill="#3B2620"/><circle cx="${f(ix)}" cy="-1105" r="3" fill="#120C0A"/><circle cx="${f(ix + 2)}" cy="-1108" r="1.6" fill="#fff"/>`;
      e += `<path d="M${cx - w - 2},-1105 Q${cx},${-1107 - hh * 1.6} ${cx + w + 2},-1109" fill="none" stroke="#2A1A16" stroke-width="3.6" stroke-linecap="round"/>`;
      e += `<path d="M${cx - w * 0.5},-1096 Q${cx},-1093 ${cx + w * 0.6},-1097" fill="none" stroke="${sh}" stroke-width="2"/>`;
      return e;
    };
    s += eye(-6, 17, false) + eye(60, 11, true);
    // คิ้ว
    const br = face === "surprised" ? -8 : face === "worried" ? -4 : 0, tl = face === "worried" ? 6 : 0;
    s += `<path d="M-26,${-1128 + br} Q-6,${-1138 + br - tl} 14,${-1132 + br}" fill="none" stroke="${H.color}" stroke-width="6.5" stroke-linecap="round"/><path d="M46,${-1134 + br - tl} Q62,${-1138 + br} 74,${-1130 + br}" fill="none" stroke="${H.color}" stroke-width="5.5" stroke-linecap="round"/>`;
    // ไฝ ใต้หางตาขวาของตัวละคร (ฝั่งใกล้กล้อง)
    s += `<circle cx="-24" cy="-1084" r="2.8" fill="#3A2420"/>`;
    // จมูก (เห็นสันด้านหน้า)
    s += `<path d="M54,-1082 Q64,-1068 68,-1060 Q62,-1054 52,-1056" fill="none" stroke="${o}" stroke-width="3" stroke-linecap="round"/><path d="M58,-1074 Q66,-1064 66,-1060 Q58,-1059 55,-1062Z" fill="${sh}"/><path d="M44,-1058 q4,3 8,1" fill="none" stroke="${o}" stroke-width="2.4" stroke-linecap="round"/>`;
    // ปาก
    const mouths = {
      smile: `<path d="M18,-1036 Q38,-1024 60,-1036" fill="none" stroke="#8C3B36" stroke-width="3.4" stroke-linecap="round"/>`,
      talk: `<path d="M20,-1038 Q40,${-1038 + 6 + Math.abs(Math.sin(t * 16)) * 12} 60,-1038 Q40,-1040 20,-1038Z" fill="#6E2A2A" stroke="#8C3B36" stroke-width="2.6"/>`,
      surprised: `<ellipse cx="40" cy="-1030" rx="9" ry="12" fill="#6E2A2A" stroke="#8C3B36" stroke-width="2.6"/>`,
      worried: `<path d="M20,-1030 Q40,-1040 60,-1030" fill="none" stroke="#8C3B36" stroke-width="3.2" stroke-linecap="round"/>`,
    };
    s += mouths[p.talk ? "talk" : face] || mouths.smile;
    // แว่นเหลี่ยม 3/4: เลนส์ใกล้กว้าง เลนส์ไกลแคบ ขาแว่นไปที่หู
    const gc = C.glasses;
    s += `<rect x="-42" y="-1124" width="72" height="44" rx="9" fill="rgba(210,232,255,.16)" stroke="${gc}" stroke-width="6"/><rect x="40" y="-1124" width="42" height="44" rx="8" fill="rgba(210,232,255,.16)" stroke="${gc}" stroke-width="5.5"/>`;
    s += `<path d="M30,-1108 Q35,-1114 40,-1108" fill="none" stroke="${gc}" stroke-width="5"/><path d="M-42,-1112 L-66,-1100" stroke="${gc}" stroke-width="5" stroke-linecap="round"/><path d="M-34,-1118 L-10,-1118 M46,-1118 L58,-1118" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>`;
    // ผม Dropcut: ข้าง/หลังไล่สั้น + ด้านบนยาว หน้าม้าตกเฉียงไปข้างหน้า
    s += `<defs><linearGradient id="fig_fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${H.color}"/><stop offset="1" stop-color="${H.color}" stop-opacity="0"/></linearGradient></defs>`;
    s += `<path d="M-64,-1170 Q-80,-1120 -70,-1070 L-60,-1102 Q-54,-1140 -40,-1166Z" fill="url(#fig_fade)"/>`;
    const hairD = "M-70,-1150 Q-86,-1196 -50,-1226 Q-6,-1252 50,-1240 Q92,-1228 104,-1186 Q108,-1166 98,-1148 L90,-1160 L84,-1140 L72,-1158 L62,-1134 L52,-1160 L38,-1140 L30,-1166 L12,-1150 L4,-1172 Q-24,-1170 -44,-1164 Q-58,-1160 -70,-1150Z";
    s += `<path d="${hairD}" fill="${H.color}" stroke="${ink(H.color)}" stroke-width="${OW}" stroke-linejoin="round"/>`;
    s += `<path d="M-40,-1218 Q10,-1236 60,-1222 M-50,-1200 Q0,-1220 70,-1204 M-20,-1188 Q30,-1206 84,-1186 M20,-1180 Q50,-1190 92,-1170" fill="none" stroke="${H.hi}" stroke-width="3.2" stroke-linecap="round" opacity=".8"/>`;
    return s;
  }

  // ---------- ลำตัว (เสื้อยืด + เสื้อกั๊ก) 3/4 ----------
  function torso(C) {
    const T = C.tee, V = C.vest;
    let s = `<path d="M-100,-944 Q-60,-978 -24,-980 Q10,-968 44,-976 Q70,-966 80,-946 Q90,-900 84,-862 Q74,-790 70,-720 Q74,-660 78,-604 L-84,-606 Q-80,-660 -80,-720 Q-86,-800 -98,-870 Q-108,-914 -100,-944Z" fill="${T}" stroke="${ink(T)}" stroke-width="${OW}" stroke-linejoin="round"/>`;
    s += `<path d="M-24,-980 Q10,-962 44,-976" fill="none" stroke="${ink(T)}" stroke-width="3"/><path d="M-20,-976 Q10,-956 40,-972" fill="none" stroke="${shd(T)}" stroke-width="5"/>`;
    s += `<path d="M40,-900 Q60,-820 52,-700 Q58,-650 60,-606 L78,-604 Q74,-660 70,-720 Q74,-790 84,-862Z" fill="${shd(T)}"/>`;
    // เสื้อกั๊ก แผงใกล้ + แผงไกล (ช่องเปิดเลื่อนไปทางขวาเพราะหันเฉียง)
    const near = "M-102,-940 Q-70,-970 -30,-976 Q-12,-940 -4,-900 L4,-612 L-88,-610 Q-84,-680 -84,-730 Q-90,-810 -100,-866 Q-110,-908 -102,-940Z";
    const far = "M38,-974 Q66,-966 78,-946 Q88,-900 82,-860 Q72,-790 68,-720 Q70,-660 74,-612 L28,-612 L26,-900 Q28,-940 38,-974Z";
    s += `<path d="${near}" fill="${V}" stroke="${ink(V)}" stroke-width="${OW}" stroke-linejoin="round"/><path d="${far}" fill="${V}" stroke="${ink(V)}" stroke-width="${OW}" stroke-linejoin="round"/>`;
    s += `<path d="M44,-920 Q64,-830 56,-700 Q60,-650 62,-612 L74,-612 Q70,-660 68,-720 Q72,-790 82,-860Z" fill="${shd(V)}"/>`;
    // ปกเสื้อกั๊ก
    s += `<path d="M-30,-976 Q-22,-944 -10,-918 L-24,-908 Q-40,-936 -46,-966Z" fill="${hil(V)}" stroke="${ink(V)}" stroke-width="2.8"/><path d="M38,-974 Q34,-946 30,-920 L40,-912 Q46,-940 50,-968Z" fill="${hil(V)}" stroke="${ink(V)}" stroke-width="2.8"/>`;
    // ซิป/ตะเข็บ
    s += `<path d="M-6,-900 L2,-614" stroke="${ink(V)}" stroke-width="2.6"/>` + [-880, -840, -800, -760, -720, -680, -640].map((y) => `<path d="M-6,${y} l7,3" stroke="#8A8A86" stroke-width="2.6"/>`).join("");
    // กระเป๋า: แผงใกล้ 2 ใบเต็ม แผงไกล 2 ใบแคบ (หดตามมุมเฉียง)
    const pocket = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${shd(V)}" stroke="${ink(V)}" stroke-width="2.8"/><rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" rx="3" fill="none" stroke="${ink(V)}" stroke-width="1.6" stroke-dasharray="5 4" opacity=".7"/><path d="M${x - 2},${y} L${x + w + 2},${y} L${x + w - 3},${y + 14} L${x + 3},${y + 14}Z" fill="${hil(V)}" stroke="${ink(V)}" stroke-width="2.6"/><circle cx="${x + w / 2}" cy="${y + 9}" r="3" fill="${ink(V)}"/>`;
    s += pocket(-82, -900, 54, 46) + pocket(-86, -790, 60, 52) + pocket(38, -900, 32, 46) + pocket(36, -790, 34, 52);
    s += `<rect x="54" y="-910" width="5" height="22" rx="2" fill="#2F4F8C" stroke="#1E3360" stroke-width="1.6"/><rect x="-76" y="-930" width="24" height="10" rx="2" fill="#D8483B" stroke="#8C2A22" stroke-width="2"/>`;
    // รอยยับตามแรงดึง
    s += `<path d="M-60,-700 q14,-10 30,-4 M-70,-660 q20,-6 36,2 M40,-700 q10,-6 20,2" fill="none" stroke="${ink(V)}" stroke-width="2.2" opacity=".55" stroke-linecap="round"/>`;
    return s;
  }
  function pelvis(C) {
    const B = C.pants;
    return `<path d="M-86,-612 L78,-612 Q86,-590 80,-560 L46,-548 L10,-566 L-24,-548 L-80,-560 Q-90,-590 -86,-612Z" fill="${B}" stroke="${ink(B)}" stroke-width="${OW}" stroke-linejoin="round"/><path d="M10,-604 L10,-568" stroke="${ink(B)}" stroke-width="2.4"/><path d="M-60,-596 q14,10 26,0 M30,-596 q12,10 24,0" fill="none" stroke="${ink(B)}" stroke-width="2.2" opacity=".7"/>`;
  }
  function shoe(at, k, C, far) {
    const c = C.shoe, sole = C.sole;
    return `<g transform="translate(${P(at)}) scale(${f(k)})"><path d="M-34,-6 Q-38,-34 -16,-40 Q14,-46 30,-30 Q62,-20 78,-6 Q84,6 74,10 L-30,10 Q-40,6 -34,-6Z" fill="${c}" stroke="${ink(c)}" stroke-width="${OW}" stroke-linejoin="round"/><path d="M-36,4 L78,4 Q82,12 74,14 L-30,14 Q-38,12 -36,4Z" fill="${sole}" stroke="${ink(sole)}" stroke-width="2.6"/><path d="M0,-38 Q16,-30 32,-30 M4,-30 l10,-6 M14,-26 l10,-6" fill="none" stroke="${ink(c)}" stroke-width="2.4"/><path d="M40,-22 Q62,-14 74,-4" fill="none" stroke="${shd(c)}" stroke-width="6" stroke-linecap="round"/></g>`;
  }

  // ---------- ท่า ----------
  // แขน: [มุมต้นแขน, มุมศอก (เทียบต้นแขน)], มือ · ขา: [มุมต้นขา, มุมเข่า]
  const POSE2 = {
    pocket: { near: [8, -30, "pocket"], far: [-12, 10, "relaxed"], legN: [2, -2], legF: [-8, 8], lean: 0 },
    talk:   { near: [14, -96, "open"], far: [-12, 10, "relaxed"], legN: [2, -2], legF: [-10, 10], lean: 1 },
    hips:   { near: [44, -118, "fist"], far: [-12, 10, "relaxed"], legN: [4, -2], legF: [-12, 6], lean: -1 },
    wave:   { near: [160, -28, "open"], far: [-12, 10, "relaxed"], legN: [2, -2], legF: [-8, 8], lean: -2 },
    relaxed:{ near: [8, -12, "relaxed"], far: [-12, 10, "relaxed"], legN: [2, -2], legF: [-8, 8], lean: 0 },
  };

  RK.fig = function (p, t) {
    const C = RK.FIG_CAST[p.who || "hero"];
    const Q = POSE2[p.pose || "relaxed"] || POSE2.relaxed;
    const breathe = Math.sin(t * 2.2) * 2.4;
    let s = `<ellipse cx="10" cy="6" rx="130" ry="18" fill="#000" opacity=".16"/>`;
    // ขาไกล (หลัง) → ขาใกล้
    const leg = (hip, ang, near) => {
      const [h, k, a, tot] = chain(hip, ang[0], 278, ang[1], 262);
      let g = "";
      g += seg(k, a, 64, 50, C.pants, { folds: [[0.85, 0.7]], bulge: 0.02 });
      g += seg(h, k, 82, 66, C.pants, { folds: [[0.2, 0.6], [0.92, 0.8]], bulge: 0.03 });
      g += `<path d="M${P(add(a, [-24, -14]))} Q${P(add(a, [0, -6]))} ${P(add(a, [24, -14]))}" fill="none" stroke="${ink(C.pants)}" stroke-width="2.4"/>`; // ขากางเกงย่นที่ข้อเท้า
      g += shoe(add(a, [0, 40]), near ? 1 : 0.9, C, !near);
      return g;
    };
    s += leg([40, -592], Q.legF, false);
    // แขนไกล (หลังลำตัว)
    const arm = (sh, A, near) => {
      let [s0, e, w, tot] = chain(sh, A[0], 222, A[1], 200);
      if (A[2] === "pocket") w = add(e, rot([0, 118], tot)); // มือจมในกระเป๋า: แขนท่อนล่างหายเข้ากระเป๋า
      let g = "";
      const sleeveEnd = add(s0, rot([0, 108], A[0]));
      g += seg(s0, e, 48, 38, C.skin, { bulge: 0.1 });                  // ต้นแขน (ผิว)
      g += seg(e, w, 38, 28, C.skin, { bulge: 0.12 });                     // แขนท่อนล่าง
      g += seg(s0, sleeveEnd, 58, 52, C.tee, { flatEnd: true, folds: [[0.6, 0.5]] }); // แขนเสื้อสั้น
      if (A[2] === "pocket") g += `<path d="M${P(add(w, [-26, -4]))} Q${P(add(w, [0, 14]))} ${P(add(w, [26, -2]))} L${P(add(w, [22, 16]))} Q${P(add(w, [0, 26]))} ${P(add(w, [-22, 14]))}Z" fill="${shd(C.pants)}" stroke="${ink(C.pants)}" stroke-width="${OW}"/>`;
      else g += hand(A[2], w, tot, C, near);
      return g;
    };
    s += arm([70, -938], Q.far, false);
    s += pelvis(C);
    s += leg([-40, -592], Q.legN, true);
    s += `<g transform="translate(0,${f(breathe * 0.4)})">${torso(C)}</g>`;
    // มือในกระเป๋ากางเกง: ขอบกระเป๋าทับแขน
    s += arm([-92, -936], Q.near, true);
    // ขอบรูแขนเสื้อกั๊กทับต้นแขนเสื้อยืด (แขนเสื้ออยู่ใต้เสื้อกั๊กเสมอ)
    s += `<g transform="translate(0,${f(breathe * 0.4)})"><path d="M-104,-946 Q-76,-972 -46,-972 Q-62,-956 -74,-934 Q-84,-914 -88,-890 Q-100,-900 -106,-918 Q-110,-934 -104,-946Z" fill="${C.vest}" stroke="${ink(C.vest)}" stroke-width="${OW}" stroke-linejoin="round"/></g>`;
    if (Q.near[2] === "pocket") s += `<path d="M-88,-604 Q-70,-596 -54,-604" fill="none" stroke="${ink(C.pants)}" stroke-width="3"/>`;
    s += `<g transform="translate(0,${f(breathe)})">${head(C, p, t)}</g>`;
    const flip = (p.facing || 1) < 0 ? "scale(-1,1)" : "";
    return `<g transform="translate(${f(p.x)},${f(p.y)}) scale(${f(p.s || 1)}) ${flip}"><g transform="rotate(${f(Q.lean)} 0 -600)">${s}</g></g>`;
  };

  RK.FIG_CAST = {
    hero: { skin: "#EFC29B", stubble: "#4A3A33", glasses: "#1C1C22", hair: { color: "#231916", hi: "#5C443B" },
      tee: "#2E9C9A", vest: "#B79B66", pants: "#36405A", shoe: "#ECE6DA", sole: "#9A948A" },
  };
})(window);
