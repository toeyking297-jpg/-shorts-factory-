// มุมหน้าตรง (view:"front") และมุมหลัง (view:"back") ของตัวละครสไตล์ 2 — ใช้สเปกเดียวกับ RK.FIG_CAST
// พิกัดเหมือนมุม 3/4: (0,0) = กลางเท้า · หัวกลางที่ x=0 · แสงจากซ้ายบน (เงาด้านขวาจอ)
(function (G) {
  const RK = G.RK, f = RK.f;
  const OW = 3.6;
  const ink = (c) => RK.shade(c, -0.42), shd = (c) => RK.shade(c, -0.16), hil = (c) => RK.shade(c, 0.18);
  const P = (p) => `${f(p[0])},${f(p[1])}`;
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
  const rot = (v, deg) => { const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
  const stroke = (c, w = OW) => `stroke="${ink(c)}" stroke-width="${w}" stroke-linejoin="round"`;
  const mir = (svg) => `<g transform="scale(-1,1)">${svg}</g>`;

  // ---------- หัว หน้าตรง ----------
  const FACE_F = {
    sharp: "M0,-1236 C64,-1236 92,-1186 92,-1120 C92,-1064 78,-1024 50,-1000 Q24,-982 0,-980 Q-24,-982 -50,-1000 C-78,-1024 -92,-1064 -92,-1120 C-92,-1186 -64,-1236 0,-1236Z",
    soft:  "M0,-1236 C64,-1236 92,-1186 92,-1120 C92,-1060 80,-1024 54,-1004 Q28,-986 0,-986 Q-28,-986 -54,-1004 C-80,-1024 -92,-1060 -92,-1120 C-92,-1186 -64,-1236 0,-1236Z",
    round: "M0,-1238 C70,-1238 102,-1186 102,-1116 C102,-1052 86,-1012 56,-994 Q28,-980 0,-980 Q-28,-980 -56,-994 C-86,-1012 -102,-1052 -102,-1116 C-102,-1186 -70,-1238 0,-1238Z",
    old:   "M0,-1234 C62,-1234 90,-1186 90,-1120 C90,-1060 78,-1022 52,-1002 Q26,-986 0,-986 Q-26,-986 -52,-1002 C-78,-1022 -90,-1060 -90,-1120 C-90,-1186 -62,-1234 0,-1234Z",
    boxy:  "M0,-1238 C66,-1238 96,-1188 96,-1120 C96,-1052 90,-1010 62,-992 Q30,-980 0,-980 Q-30,-980 -62,-992 C-90,-1010 -96,-1052 -96,-1120 C-96,-1188 -66,-1238 0,-1238Z",
    kid:   "M0,-1240 C70,-1240 100,-1186 100,-1112 C100,-1050 84,-1014 54,-998 Q28,-988 0,-988 Q-28,-988 -54,-998 C-84,-1014 -100,-1050 -100,-1112 C-100,-1186 -70,-1240 0,-1240Z",
  };
  // ผมด้านหน้า (มุมหน้าตรง) และผมด้านหลังหัว: แต่ละทรงคืน {back, front} — back วาดก่อนหน้า, front วาดทับหน้า
  function hairFront(H) {
    if (RK.HAIR2F && RK.HAIR2F[H.style]) { const r = RK.HAIR2F[H.style](H); return { back: r.back, front: r.front }; }
    const c = H.color, o = ink(c), hi = H.hi, st = stroke(c);
    const line = (d, w = 3.2) => `<path d="${d}" fill="none" stroke="${hi}" stroke-width="${w}" stroke-linecap="round" opacity=".8"/>`;
    switch (H.style) {
      case "dropcut": return { back: "", front: `<path d="M-96,-1110 C-104,-1200 -56,-1256 0,-1258 C56,-1256 104,-1200 96,-1110 C92,-1130 86,-1146 78,-1150 C70,-1140 60,-1138 52,-1150 C44,-1140 32,-1138 24,-1150 C16,-1140 4,-1138 -4,-1150 C-12,-1140 -24,-1138 -32,-1150 C-40,-1140 -52,-1140 -60,-1150 C-70,-1146 -82,-1134 -88,-1112 Z" fill="${c}" ${st}/>` + `<path d="M-96,-1112 C-98,-1090 -98,-1070 -94,-1056 M96,-1112 C98,-1090 98,-1070 94,-1056" stroke="${c}" stroke-width="8" opacity=".35" stroke-linecap="round"/>` + line("M-60,-1230 Q0,-1252 60,-1230 M-80,-1196 Q0,-1232 80,-1196 M-40,-1176 Q0,-1196 40,-1176") };
      case "quiff": return { back: "", front: `<path d="M-94,-1120 C-104,-1196 -60,-1250 0,-1260 C50,-1274 100,-1252 104,-1200 C106,-1170 98,-1146 94,-1124 C86,-1160 66,-1180 40,-1186 C10,-1192 -20,-1186 -44,-1172 C-70,-1158 -88,-1140 -94,-1120Z" fill="${c}" ${st}/>` + line("M-60,-1222 C-10,-1258 50,-1262 90,-1230 M-40,-1200 C0,-1230 50,-1236 96,-1206 M-70,-1160 C-40,-1184 0,-1192 40,-1188") };
      case "buzz": { const r = RK.rng(56); let d = ""; for (let i = 0; i < 200; i++) { const x = -90 + r() * 180, y = -1240 + r() * 90; if (y < -1170 + Math.abs(x) * 0.1 && x * x / 8100 + ((y + 1150) * (y + 1150)) / 9000 < 1) d += `<circle cx="${f(x)}" cy="${f(y)}" r="1.4"/>`; }
        return { back: "", front: `<path d="M-94,-1120 Q-100,-1214 -40,-1240 Q0,-1250 40,-1240 Q100,-1214 94,-1120 Q76,-1170 0,-1176 Q-76,-1170 -94,-1120Z" fill="${c}" ${st} opacity=".92"/><g fill="${hi}" opacity=".6">${d}</g>` }; }
      case "combover": return { back: "", front: `<path d="M-90,-1180 C-100,-1160 -104,-1130 -102,-1108 L-94,-1110 C-94,-1130 -92,-1156 -84,-1176Z M90,-1180 C100,-1160 104,-1130 102,-1108 L94,-1110 C94,-1130 92,-1156 84,-1176Z" fill="${c}" stroke="${ink(c)}" stroke-width="2.2" stroke-linejoin="round"/><path d="M-56,-1196 Q0,-1214 56,-1192 M-46,-1206 Q0,-1220 52,-1204" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/><ellipse cx="0" cy="-1214" rx="34" ry="9" fill="#fff" opacity=".28"/>` };
      case "bob": return { back: `<path d="M-112,-1120 Q-116,-1222 -40,-1252 Q0,-1262 40,-1252 Q116,-1222 112,-1120 L110,-1000 Q90,-984 70,-998 L-70,-998 Q-90,-984 -110,-1000Z" fill="${c}" ${st}/>`,
        front: `<path d="M-100,-1140 Q-104,-1230 -30,-1250 Q40,-1260 96,-1214 Q110,-1180 104,-1130 Q80,-1170 40,-1182 Q-20,-1192 -60,-1160 Q-84,-1140 -88,-1100 L-92,-1006 Q-104,-1010 -104,-1040Z" fill="${c}" ${st}/>` + line("M60,-1236 Q0,-1222 -50,-1170 M-84,-1150 L-88,-1020") + `<g transform="translate(64,-1186) rotate(-18)"><rect x="-18" y="-5" width="36" height="10" rx="5" fill="${H.clip || "#F2B33D"}" stroke="${ink(H.clip || "#F2B33D")}" stroke-width="2.4"/></g>` };
      case "long": return { back: `<path d="M-110,-1130 Q-116,-1226 -40,-1254 Q0,-1262 40,-1254 Q116,-1226 110,-1130 Q116,-1040 112,-940 Q120,-860 100,-820 Q70,-830 60,-900 L60,-1000 L-60,-1000 L-60,-900 Q-70,-830 -100,-820 Q-120,-860 -112,-940 Q-116,-1040 -110,-1130Z" fill="${c}" ${st}/>`,
        front: `<path d="M-98,-1130 Q-104,-1226 -20,-1250 Q60,-1258 98,-1200 Q106,-1170 100,-1130 Q76,-1180 20,-1190 Q-10,-1192 -30,-1176 Q-60,-1150 -78,-1100 Q-88,-1040 -84,-980 Q-80,-930 -90,-880 Q-104,-900 -104,-980 Q-104,-1060 -98,-1130Z" fill="${c}" ${st}/><path d="M100,-1130 Q104,-1060 98,-990 Q94,-930 104,-880 Q90,-880 84,-940 Q80,-1010 86,-1090Z" fill="${c}" ${st}/>` + line("M40,-1240 Q-20,-1216 -56,-1150 M-90,-1100 Q-96,-1010 -90,-920 M96,-1080 Q90,-1000 96,-920") };
      case "bun": return { back: `<circle cx="0" cy="-1258" r="40" fill="${c}" ${st}/><path d="M-28,-1270 Q0,-1294 28,-1270" fill="none" stroke="${shd(c)}" stroke-width="3"/><path d="M14,-1300 L30,-1240" stroke="#9C3A30" stroke-width="5" stroke-linecap="round"/>`,
        front: `<path d="M-94,-1110 Q-100,-1210 -30,-1240 Q30,-1250 90,-1214 Q100,-1180 94,-1110 Q76,-1180 0,-1186 Q-76,-1180 -94,-1110Z" fill="${c}" ${st}/><path d="M-80,-1150 Q-40,-1214 0,-1220 M80,-1150 Q40,-1214 0,-1220 M0,-1224 L0,-1186" fill="none" stroke="${shd(c)}" stroke-width="3" stroke-linecap="round"/>` };
      case "ponytail": return { back: `<path d="M60,-1170 C110,-1160 126,-1110 124,-1060 C122,-1000 110,-960 100,-944 C92,-980 96,-1030 96,-1070 C94,-1110 80,-1136 52,-1146Z" fill="${c}" ${st}/>`,
        front: `<path d="M-96,-1110 C-102,-1200 -50,-1252 6,-1252 C64,-1254 102,-1210 96,-1110 C88,-1150 70,-1178 40,-1186 C10,-1192 -30,-1186 -56,-1166 C-78,-1150 -90,-1132 -96,-1110Z" fill="${c}" ${st}/>` + line("M-20,-1246 C-40,-1220 -60,-1190 -76,-1150 M30,-1244 C56,-1224 76,-1196 86,-1160 M0,-1248 C4,-1220 6,-1200 8,-1188") + `<ellipse cx="84" cy="-1170" rx="12" ry="16" fill="${H.tie}" stroke="${ink(H.tie)}" stroke-width="2.6"/>` };
      case "pigtails": return { back: `<g transform="translate(-100,-1150) rotate(16)"><path d="M0,0 Q-40,40 -30,110 Q-22,140 -4,146 Q-8,80 16,20Z" fill="${c}" ${st}/></g><g transform="translate(100,-1150) rotate(-16)"><path d="M0,0 Q40,40 30,110 Q22,140 4,146 Q8,80 -16,20Z" fill="${c}" ${st}/></g>`,
        front: `<path d="M-98,-1110 Q-104,-1210 -30,-1242 Q30,-1252 98,-1210 Q104,-1170 98,-1110 L92,-1134 L-92,-1134Z" fill="${c}" ${st}/>` + line("M-40,-1200 L-42,-1140 M0,-1210 L0,-1140 M40,-1200 L42,-1140", 3) + `<circle cx="-100" cy="-1150" r="12" fill="${H.tie}" stroke="${ink(H.tie)}" stroke-width="2.6"/><circle cx="100" cy="-1150" r="12" fill="${H.tie}" stroke="${ink(H.tie)}" stroke-width="2.6"/>` };
      case "perm": { const N = 26, rx = 128, ry = 120, cy = -1146; let d = "";
        for (let i = 0; i <= N; i++) { const a = Math.PI * (0.78 + 1.44 * i / N), x = Math.cos(a) * rx, y = cy + Math.sin(a) * ry; if (!i) d += `M${f(x)},${f(y)}`; else { const am = Math.PI * (0.78 + 1.44 * (i - 0.5) / N); d += ` Q${f(Math.cos(am) * rx * 1.12)},${f(cy + Math.sin(am) * ry * 1.12)} ${f(x)},${f(y)}`; } }
        d += " Q0,-1060 " + f(Math.cos(Math.PI * 0.78) * rx) + "," + f(cy + Math.sin(Math.PI * 0.78) * ry) + "Z";
        const r = RK.rng(404); let cu = ""; for (let i = 0; i < 18; i++) { const x = -100 + r() * 200, y = -1250 + r() * 100; cu += `<path d="M${f(x - 7)},${f(y)} a8,8 0 1 1 10,6" fill="none" stroke="${hi}" stroke-width="2.6" stroke-linecap="round" opacity=".75"/>`; }
        let fr = "M-92,-1140"; for (let i = 0; i < 8; i++) { const x0 = -92 + i * 23, y0 = -1150 - 10 * Math.cos((x0 + 11.5) / 92 * 1.4); fr += ` Q${f(x0 + 11.5)},${f(y0 + 22)} ${f(x0 + 23)},${f(-1150 - 10 * Math.cos((x0 + 23) / 92 * 1.4))}`; } fr += " C100,-1220 54,-1266 0,-1266 C-54,-1266 -100,-1220 -92,-1140Z";
        return { back: `<path d="${d}" fill="${c}" ${st}/>`, front: `<path d="${fr}" fill="${c}" stroke="${o}" stroke-width="2.8" stroke-linejoin="round"/>` + cu }; }

    }
    return { back: "", front: "" };
  }
  function headFront(C, p, t) {
    const sk = C.skin, o = ink(sk), sh = shd(sk), H = C.hair, F = C.face, face = p.face || "smile";
    const blink = (t + (C.blink || 0.7)) % 3.9 < 0.1, es = F.eye || 1, lx = (p.lookX || 0) * 3;
    const fD = FACE_F[F.shape || "sharp"] || FACE_F.sharp, hr = hairFront(H);
    let s = "";
    for (const sg of [-1, 1]) s += `<path d="M${sg * 88},-1104 Q${sg * 108},-1110 ${sg * 108},-1080 Q${sg * 106},-1054 ${sg * 86},-1052Z" fill="${sk}" stroke="${o}" stroke-width="${OW}"/><path d="M${sg * 94},-1094 Q${sg * 102},-1080 ${sg * 92},-1064" fill="none" stroke="${sh}" stroke-width="3"/>` + (F.earrings ? `<circle cx="${sg * 96}" cy="-1046" r="6" fill="${F.earrings}" stroke="${ink(F.earrings)}" stroke-width="2"/>` : "");
    s += `<path d="${fD}" fill="${sk}" stroke="${o}" stroke-width="${OW}"/><clipPath id="ff${C.skin.slice(1)}${H.style}"><path d="${fD}"/></clipPath><g clip-path="url(#ff${C.skin.slice(1)}${H.style})"><path d="M56,-1240 Q96,-1150 70,-1040 Q60,-1000 30,-980 L140,-980 L140,-1240Z" fill="${sh}" opacity=".8"/>`;
    if (F.stubble) s += `<path d="M-74,-1050 Q-60,-1000 0,-986 Q60,-1000 74,-1050 Q60,-1022 0,-1018 Q-60,-1022 -74,-1050Z" fill="${F.stubble}" opacity=".22"/><path d="M-22,-1046 Q0,-1054 22,-1046 Q0,-1040 -22,-1046Z" fill="${F.stubble}" opacity=".5"/>`;
    if (F.wrinkles) s += `<path d="M-40,-1176 Q0,-1186 40,-1176 M-34,-1162 Q0,-1170 34,-1162" fill="none" stroke="${sh}" stroke-width="2.6"/>`;
    s += `</g>`;
    if (F.blush) s += `<ellipse cx="-50" cy="-1066" rx="17" ry="9" fill="${F.blush}" opacity=".45"/><ellipse cx="50" cy="-1066" rx="17" ry="9" fill="${F.blush}" opacity=".45"/>`;
    const EO = { iris: F.iris || "#3B2620", fem: !!F.lashes, face, blink, lx: lx / 3, sk, wr: !!F.wrinkles, id: "fr" };
    s += RK.figEye(-36, -1102, 16 * Math.sqrt(es), 8.5 * es, -1, EO) + RK.figEye(36, -1102, 16 * Math.sqrt(es), 8.5 * es, 1, EO);
    const br = face === "surprised" ? -8 : face === "worried" ? -3 : face === "angry" ? 4 : 0, tl = face === "worried" ? 6 : face === "angry" ? -7 : 0, bwid = F.brow || 6.5, bc = F.browColor || H.color, arch = F.lashes ? 7 : 3;
    s += RK.figBrow(-14, -1130 + br + tl, -58, -1124 + br - tl * 0.4, arch, bwid * 1.1, bc) + RK.figBrow(14, -1130 + br + tl, 58, -1124 + br - tl * 0.4, arch, bwid * 1.1, bc);
    if (F.mole) s += `<circle cx="-30" cy="-1080" r="2.8" fill="#3A2420"/>`;
    s += `<path d="M4,-1100 Q8,-1080 10,-1066" fill="none" stroke="${sh}" stroke-width="3" opacity=".6" stroke-linecap="round"/><path d="M-9,-1060 Q-4,-1054 0,-1056 Q4,-1054 9,-1060" fill="none" stroke="${o}" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="0" cy="-1068" rx="4" ry="2.4" fill="#fff" opacity=".3"/>`;
    s += RK.figLips(0, -1030, 40, { lip: F.lipstick || null, face: p.talk ? "smile" : face, talk: p.talk ? 1 : 0, t, sk });
    if (F.mustache) s += `<path d="M-30,-1042 Q-14,-1058 0,-1048 Q14,-1058 30,-1042 Q20,-1036 8,-1040 Q0,-1042 -8,-1040 Q-20,-1036 -30,-1042Z" fill="${H.color}" stroke="${ink(H.color)}" stroke-width="2.4"/>`;
    if (F.glasses === "square") s += `<rect x="-66" y="-1124" width="56" height="42" rx="9" fill="rgba(210,232,255,.16)" stroke="#1C1C22" stroke-width="6"/><rect x="10" y="-1124" width="56" height="42" rx="9" fill="rgba(210,232,255,.16)" stroke="#1C1C22" stroke-width="6"/><path d="M-10,-1108 Q0,-1114 10,-1108 M-66,-1110 L-90,-1104 M66,-1110 L90,-1104" fill="none" stroke="#1C1C22" stroke-width="5"/>`;
    if (F.glasses === "reading") s += `<circle cx="-36" cy="-1098" r="22" fill="rgba(210,232,255,.14)" stroke="#8A5A3C" stroke-width="3.6"/><circle cx="36" cy="-1098" r="22" fill="rgba(210,232,255,.14)" stroke="#8A5A3C" stroke-width="3.6"/><path d="M-14,-1100 Q0,-1106 14,-1100" fill="none" stroke="#8A5A3C" stroke-width="3"/>`;
    return s + hr.front;
  }
  function headBack(C) {
    const sk = C.skin, o = ink(sk), H = C.hair, c = H.color, st = stroke(c), hi = H.hi;
    let s = "";
    for (const sg of [-1, 1]) s += `<path d="M${sg * 86},-1104 Q${sg * 106},-1110 ${sg * 106},-1080 Q${sg * 104},-1054 ${sg * 84},-1052Z" fill="${sk}" stroke="${o}" stroke-width="${OW}"/>`;
    s += `<path d="M-92,-1120 C-92,-1190 -60,-1236 0,-1236 C60,-1236 92,-1190 92,-1120 C92,-1060 70,-1010 36,-996 L-36,-996 C-70,-1010 -92,-1060 -92,-1120Z" fill="${sk}" stroke="${o}" stroke-width="${OW}"/>`;
    const L = (d) => `<path d="${d}" fill="none" stroke="${hi}" stroke-width="3.2" stroke-linecap="round" opacity=".8"/>`;
    if (RK.HAIR2B && RK.HAIR2B[H.style]) return s + RK.HAIR2B[H.style](H);
    switch (H.style) {
      case "dropcut": case "quiff": case "buzz":
        // ผมสั้นด้านหลัง: ขอบล่างโค้งลงเป็นจอนท้ายทอย ไม่ตัดตรงเป็นกะลา + ไล่เฉดบาง ๆ ที่ต้นคอ
        s += `<path d="M-90,-1090 C-80,-1056 -44,-1022 0,-1016 C44,-1022 80,-1056 90,-1090 C84,-1040 50,-1002 0,-998 C-50,-1002 -84,-1040 -90,-1090Z" fill="${c}" opacity=".3"/>`;
        s += `<path d="M-96,-1110 C-100,-1200 -60,-1250 0,-1250 C60,-1250 100,-1200 96,-1110 C94,-1096 90,-1088 86,-1082 C70,-1060 40,-1036 0,-1030 C-40,-1036 -70,-1060 -86,-1082 C-90,-1088 -94,-1096 -96,-1110Z" fill="${c}" ${st}/>` + L("M-60,-1222 Q0,-1240 60,-1222 M-80,-1186 Q0,-1210 80,-1186 M-86,-1140 Q0,-1162 86,-1140 M-70,-1096 Q0,-1112 70,-1096");
        break;
      case "combover": s += `<path d="M-96,-1110 C-100,-1190 -60,-1236 0,-1238 C60,-1236 100,-1190 96,-1110 C94,-1096 90,-1088 86,-1082 C70,-1060 40,-1036 0,-1030 C-40,-1036 -70,-1060 -86,-1082 C-90,-1088 -94,-1096 -96,-1110Z" fill="${c}" ${st}/><ellipse cx="0" cy="-1196" rx="58" ry="34" fill="${sk}"/><ellipse cx="0" cy="-1196" rx="58" ry="34" fill="none" stroke="${c}" stroke-width="5" opacity=".5"/><ellipse cx="-8" cy="-1206" rx="26" ry="10" fill="#fff" opacity=".22"/>` + L("M-80,-1150 Q-60,-1120 -50,-1090 M80,-1150 Q60,-1120 50,-1090 M-70,-1096 Q0,-1110 70,-1096"); break;
      case "bob": s += `<path d="M-112,-1120 Q-116,-1222 -40,-1252 Q0,-1262 40,-1252 Q116,-1222 112,-1120 L110,-996 Q60,-984 0,-986 Q-60,-984 -110,-996Z" fill="${c}" ${st}/>` + L("M-70,-1220 Q-90,-1100 -84,-1000 M0,-1250 L0,-990 M70,-1220 Q90,-1100 84,-1000") + `<g transform="translate(-60,-1170) rotate(20)"><rect x="-18" y="-5" width="36" height="10" rx="5" fill="${H.clip || "#F2B33D"}" stroke="${ink(H.clip || "#F2B33D")}" stroke-width="2.4"/></g>`; break;
      case "long": s += `<path d="M-112,-1130 Q-118,-1226 -40,-1256 Q0,-1264 40,-1256 Q118,-1226 112,-1130 Q118,-1000 110,-880 Q100,-820 60,-812 Q0,-806 -60,-812 Q-100,-820 -110,-880 Q-118,-1000 -112,-1130Z" fill="${c}" ${st}/>` + L("M-60,-1230 Q-90,-1060 -70,-830 M0,-1256 Q-10,-1040 0,-816 M60,-1230 Q90,-1060 70,-830"); break;
      case "bun": s += `<path d="M-94,-1110 C-98,-1200 -60,-1244 0,-1244 C60,-1244 98,-1200 94,-1110 Q60,-1070 0,-1070 Q-60,-1070 -94,-1110Z" fill="${c}" ${st}/><circle cx="0" cy="-1226" r="42" fill="${c}" ${st}/><path d="M-28,-1236 Q0,-1260 28,-1236 M-30,-1216 Q0,-1240 30,-1216" fill="none" stroke="${shd(c)}" stroke-width="3"/><path d="M-30,-1268 L30,-1196" stroke="#9C3A30" stroke-width="5" stroke-linecap="round"/>`; break;
      case "ponytail": s += `<path d="M-96,-1110 C-100,-1200 -60,-1250 0,-1250 C60,-1250 100,-1200 96,-1110 Q60,-1060 0,-1062 Q-60,-1060 -96,-1110Z" fill="${c}" ${st}/>` + L("M-70,-1200 Q-30,-1160 0,-1150 M70,-1200 Q30,-1160 0,-1150") + `<path d="M-20,-1150 Q-40,-1040 -16,-930 Q0,-900 16,-930 Q40,-1040 20,-1150Z" fill="${c}" ${st}/><ellipse cx="0" cy="-1150" rx="18" ry="14" fill="${H.tie}" stroke="${ink(H.tie)}" stroke-width="2.6"/>`; break;
      case "pigtails": s += `<path d="M-96,-1110 C-100,-1200 -60,-1250 0,-1250 C60,-1250 100,-1200 96,-1110 Q60,-1070 0,-1072 Q-60,-1070 -96,-1110Z" fill="${c}" ${st}/><path d="M0,-1250 L0,-1078" stroke="${shd(c)}" stroke-width="3"/>` + [-1, 1].map((sg) => `<g transform="translate(${sg * 96},-1150) rotate(${-sg * 14})"><path d="M0,0 Q${sg * 40},40 ${sg * 30},110 Q${sg * 22},140 ${sg * 4},146 Q${sg * 8},80 ${-sg * 16},20Z" fill="${c}" ${st}/></g><circle cx="${sg * 96}" cy="-1150" r="12" fill="${H.tie}" stroke="${ink(H.tie)}" stroke-width="2.6"/>`).join(""); break;
      case "perm": { const hf = hairFront(H); s += hf.back; const r = RK.rng(405); for (let i = 0; i < 30; i++) { const x = -100 + r() * 200, y = -1250 + r() * 160; s += `<path d="M${f(x - 7)},${f(y)} a8,8 0 1 1 10,6" fill="none" stroke="${hi}" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>`; } break; }
    }
    return s;
  }
  function neckFB(C, back) {
    const sk = C.skin, o = ink(sk), sh = shd(sk);
    return `<path d="M-30,-1030 C-29,-1002 -31,-984 -42,-960 L42,-960 C31,-984 29,-1002 30,-1030Z" fill="${sk}"/><path d="M12,-1030 C12,-1002 16,-984 22,-960 L42,-960 C31,-984 29,-1002 30,-1030Z" fill="${sh}"/>` +
      (back ? "" : `<path d="M-30,-1012 Q0,-996 30,-1012 L30,-1030 L-30,-1030Z" fill="${sh}" opacity=".9"/>`) +
      `<path d="M-30,-1030 C-29,-1002 -31,-984 -42,-960 M30,-1030 C29,-1002 31,-984 42,-960" fill="none" stroke="${o}" stroke-width="${OW}" stroke-linecap="round"/>`;
  }

  // ---------- ลำตัว หน้า/หลัง ----------
  function torsoFBD(b, w) {
    const k = (v) => f(v);
    return `M-30,-982 Q-90,-970 -110,-930 Q-120,-900 -108,-866 Q${k(-98 - 14 * b)},-800 ${k(-84 * w - 20 * b)},-720 Q${k(-92 - 10 * b)},-660 ${k(-88 - 10 * b)},-604 L${k(88 + 10 * b)},-604 Q${k(92 + 10 * b)},-660 ${k(84 * w + 20 * b)},-720 Q${k(98 + 14 * b)},-800 108,-866 Q120,-900 110,-930 Q90,-970 30,-982 Q0,-972 -30,-982Z`;
  }
  function torsoFB(C, id, back) {
    const T = C.top, b = C.body.belly || 0, w = C.body.waist || 1, tD = torsoFBD(b, w), tc = T.color;
    let s = `<path d="${tD}" fill="${tc}"/><clipPath id="tfb${id}"><path d="${tD}"/></clipPath><g clip-path="url(#tfb${id})">`;
    if (T.pattern === "floral") { const r = RK.rng(12); for (let i = 0; i < 26; i++) { const x = -110 + r() * 220, y = -960 + r() * 350; s += `<g transform="translate(${f(x)},${f(y)}) scale(.55)">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-9" rx="5" ry="8" fill="${T.p1}" transform="rotate(${a})"/>`).join("")}<circle r="4" fill="${T.p2}"/></g>`; } }
    if (T.pattern === "leaf") { const r = RK.rng(21); for (let i = 0; i < 16; i++) { const x = -110 + r() * 220, y = -960 + r() * 350; s += `<path d="M${f(x)},${f(y)} q10,-14 20,0 q-10,14 -20,0Z" fill="${T.p1}" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/>`; } }
    if (T.pattern === "star" && !back) s += `<path d="M0,-860 L9,-840 L31,-838 L14,-824 L20,-802 L0,-814 L-20,-802 L-14,-824 L-31,-838 L-9,-840Z" fill="${T.p1}" stroke="${ink(T.p1)}" stroke-width="2.4"/>`;
    s += `<path d="M64,-960 Q86,-820 76,-604 L140,-604 L140,-960Z" fill="${shd(tc)}" opacity=".9"/>`;
    if (back) s += `<path d="M0,-960 L0,-610" stroke="${shd(tc)}" stroke-width="3" opacity=".5"/><path d="M-60,-760 q20,-8 40,0 M20,-700 q20,-8 40,0" fill="none" stroke="${ink(tc)}" stroke-width="2" opacity=".35"/>`;
    const O = C.outer;
    if (O) {
      const V = O.color, st = `stroke="${ink(V)}" stroke-width="${OW}"`;
      if (back) {
        if (O.type === "apron") s += `<path d="M-110,-760 Q0,-740 110,-760" fill="none" stroke="${V}" stroke-width="12"/><path d="M-6,-756 q-30,-20 -40,6 q20,14 40,-2 q30,-20 40,6 q-20,14 -40,-2" fill="${V}" ${st}/><path d="M-4,-748 L-24,-680 M4,-748 L24,-680" stroke="${V}" stroke-width="10" stroke-linecap="round"/><path d="M-40,-990 L-60,-760 M40,-990 L60,-760" stroke="${V}" stroke-width="10"/>`;
        else { s += `<path d="M-140,-960 L140,-960 L140,-600 L-140,-600Z" fill="${V}" ${st}/><path d="M64,-960 Q86,-820 76,-600 L140,-600 L140,-960Z" fill="${shd(V)}"/>`;
          if (O.type === "vest") s += `<path d="M-110,-900 Q0,-880 110,-900" fill="none" stroke="${ink(V)}" stroke-width="2.4"/><rect x="-70" y="-780" width="140" height="90" rx="6" fill="${shd(V)}" stroke="${ink(V)}" stroke-width="2.4"/><rect x="-62" y="-772" width="124" height="74" rx="4" fill="none" stroke="${ink(V)}" stroke-width="1.6" stroke-dasharray="5 4" opacity=".7"/>`;
          if (O.type === "jacket") s += `<path d="M-120,-890 Q0,-870 120,-890" fill="none" stroke="${RK.shade(V, 0.45)}" stroke-width="2" stroke-dasharray="6 4"/><path d="M-40,-880 L-40,-640 M40,-880 L40,-640" stroke="${RK.shade(V, 0.45)}" stroke-width="2" stroke-dasharray="6 4"/><rect x="-140" y="-640" width="280" height="36" fill="${shd(V)}" stroke="${ink(V)}" stroke-width="2.4"/>`;
          if (O.type === "cardigan") s += [-110, -70, 70, 110].map((x) => `<path d="M${x},-940 L${x},-620" stroke="${ink(V)}" stroke-width="1.4" opacity=".35"/>`).join("") + `<path d="M-140,-614 L140,-614" stroke="${shd(V)}" stroke-width="12"/>`;
        }
      } else if (O.type === "vest" || O.type === "cardigan" || O.type === "jacket") {
        s += `<path d="M-140,-960 L-44,-980 Q-30,-900 -18,-600 L-140,-600Z" fill="${V}" ${st}/><path d="M140,-960 L44,-980 Q30,-900 18,-600 L140,-600Z" fill="${V}" ${st}/><path d="M64,-940 Q80,-820 72,-600 L140,-600 L140,-940Z" fill="${shd(V)}"/>`;
        if (O.type === "vest") { s += [[-96, -900, 60, 46], [-100, -790, 66, 52], [36, -900, 60, 46], [34, -790, 66, 52]].map(([x, y, ww, h]) => `<rect x="${x}" y="${y}" width="${ww}" height="${h}" rx="4" fill="${shd(V)}" stroke="${ink(V)}" stroke-width="2.8"/><path d="M${x - 2},${y} L${x + ww + 2},${y} L${x + ww - 3},${y + 14} L${x + 3},${y + 14}Z" fill="${hil(V)}" stroke="${ink(V)}" stroke-width="2.6"/><circle cx="${x + ww / 2}" cy="${y + 9}" r="3" fill="${ink(V)}"/>`).join("") + `<rect x="54" y="-912" width="5" height="22" rx="2" fill="#2F4F8C"/><rect x="-86" y="-930" width="24" height="10" rx="2" fill="#D8483B"/>` + `<path d="M-44,-980 Q-36,-950 -24,-926 L-36,-918 Q-50,-946 -56,-972Z M44,-980 Q36,-950 24,-926 L36,-918 Q50,-946 56,-972Z" fill="${hil(V)}" stroke="${ink(V)}" stroke-width="2.6"/>`; }
        if (O.type === "cardigan") s += [-920, -860, -800, -740, -680].map((y) => `<circle cx="-26" cy="${y}" r="4" fill="${O.button}" stroke="${ink(V)}" stroke-width="1.6"/>`).join("") + `<rect x="-110" y="-720" width="50" height="44" rx="4" fill="${shd(V)}" stroke="${ink(V)}" stroke-width="2.4"/><rect x="60" y="-720" width="50" height="44" rx="4" fill="${shd(V)}" stroke="${ink(V)}" stroke-width="2.4"/><path d="M-140,-612 L-20,-612 M20,-612 L140,-612" stroke="${shd(V)}" stroke-width="10"/>`;
        if (O.type === "jacket") s += `<path d="M-44,-980 L-60,-930 L-30,-910 L-24,-950Z M44,-980 L60,-930 L30,-910 L24,-950Z" fill="${hil(V)}" stroke="${ink(V)}" stroke-width="2.6"/>` + [[-104, -880], [44, -880]].map(([x, y]) => `<rect x="${x}" y="${y}" width="60" height="46" rx="3" fill="${V}" stroke="${ink(V)}" stroke-width="2.4"/><path d="M${x},${y} L${x + 60},${y} L${x + 56},${y + 16} L${x + 30},${y + 22} L${x + 4},${y + 16}Z" fill="${hil(V)}" stroke="${ink(V)}" stroke-width="2.4"/><circle cx="${x + 30}" cy="${y + 14}" r="3.6" fill="#C9A44A"/>`).join("") + `<rect x="-140" y="-640" width="122" height="34" fill="${shd(V)}" stroke="${ink(V)}" stroke-width="2.4"/><rect x="18" y="-640" width="122" height="34" fill="${RK.shade(V, -0.22)}" stroke="${ink(V)}" stroke-width="2.4"/>` + [-860, -780, -700].map((y) => `<circle cx="-30" cy="${y}" r="4.2" fill="#C9A44A" stroke="#7A5E2A" stroke-width="1.4"/>`).join("");
      } else if (O.type === "apron") {
        s += `<path d="M-64,-880 L64,-880 L82,-600 L-82,-600Z" fill="${V}" ${st}/><path d="M-54,-880 Q-50,-950 -36,-980 M54,-880 Q50,-950 36,-980" fill="none" stroke="${V}" stroke-width="10"/><path d="M40,-870 Q56,-740 66,-600 L82,-600 L64,-880Z" fill="${shd(V)}"/><rect x="-50" y="-760" width="100" height="56" rx="6" fill="${shd(V)}" stroke="${ink(V)}" stroke-width="2.8"/><rect x="-38" y="-756" width="24" height="16" fill="#7BB661"/><rect x="-6" y="-754" width="24" height="14" fill="#C9A05A"/>`;
      }
    }
    s += `</g>`;
    if (!back) {
      switch (T.collar) {
        case "peter": s += `<path d="M-30,-982 Q-36,-950 -4,-946 Q0,-960 0,-972 Q0,-960 4,-946 Q36,-950 30,-982 Q0,-970 -30,-982Z" fill="#FFFFFF" stroke="#BFB8AA" stroke-width="2.6"/>`; break;
        case "polo": s += `<path d="M-30,-982 L-12,-940 L0,-954 L12,-940 L30,-982 Q0,-970 -30,-982Z" fill="${hil(tc)}" stroke="${ink(tc)}" stroke-width="2.6"/><path d="M0,-954 L0,-890" stroke="${ink(tc)}" stroke-width="2.4"/><circle cx="0" cy="-930" r="3.4" fill="#fff"/><circle cx="0" cy="-906" r="3.4" fill="#fff"/>`; break;
        case "shirt": s += `<path d="M-30,-982 L-18,-944 L0,-962 L18,-944 L30,-982 Q0,-970 -30,-982Z" fill="${hil(tc)}" stroke="${ink(tc)}" stroke-width="2.6"/><path d="M0,-962 L0,-604" stroke="${ink(tc)}" stroke-width="2"/>` + [-900, -850, -800, -750, -700].map((y) => `<circle cx="6" cy="${y}" r="3" fill="#EEE" stroke="${ink(tc)}" stroke-width="1.2"/>`).join("") + `<rect x="34" y="-916" width="30" height="30" rx="3" fill="none" stroke="${ink(tc)}" stroke-width="2"/><rect x="42" y="-926" width="5" height="22" rx="2" fill="#2F4F8C"/>`; break;
        case "mandarin": s += `<path d="M-30,-982 Q0,-966 30,-982 L30,-970 Q0,-954 -30,-970Z" fill="${hil(tc)}" stroke="${ink(tc)}" stroke-width="2.4"/><path d="M0,-960 L0,-604" stroke="${ink(tc)}" stroke-width="2"/>` + [-920, -870, -820, -770, -720, -670].map((y) => `<circle cx="0" cy="${y}" r="3.4" fill="${T.p2 || "#F2C14E"}" stroke="${ink(tc)}" stroke-width="1.2"/>`).join(""); break;
        case "vneck": s += `<path d="M-30,-982 L0,-930 L30,-982 L22,-982 L0,-944 L-22,-982Z" fill="${shd(tc)}" stroke="${ink(tc)}" stroke-width="2.4" stroke-linejoin="round"/>`; break;
        default: s += `<path d="M-30,-982 Q0,-962 30,-982" fill="none" stroke="${ink(tc)}" stroke-width="3"/><path d="M-26,-978 Q0,-956 26,-978" fill="none" stroke="${shd(tc)}" stroke-width="5"/>`;
      }
      if (C.tie) { const c = C.tie; s += `<path d="M-7,-960 L7,-960 L6,-946 L-6,-946Z" fill="${c}" stroke="${ink(c)}" stroke-width="2.4"/><path d="M-6,-946 L6,-946 L14,-700 L0,-680 L-14,-700Z" fill="${c}" stroke="${ink(c)}" stroke-width="2.6"/>`; }
      if (C.lanyard) s += `<path d="M-22,-980 L0,-860 L22,-980" fill="none" stroke="${C.lanyard}" stroke-width="5"/><rect x="-16" y="-866" width="32" height="44" rx="4" fill="#F4F4F0" stroke="#888" stroke-width="2.4"/><rect x="-11" y="-860" width="12" height="16" fill="#9FB7D6"/>`;
      if (C.towel) s += `<path d="M-30,-984 Q-80,-990 -104,-940 L-96,-820 L-74,-820 L-80,-930 Q-60,-966 -22,-972Z" fill="${C.towel}" stroke="${ink(C.towel)}" stroke-width="2.8"/>`;
    } else {
      s += `<path d="M-30,-982 Q0,-976 30,-982" fill="none" stroke="${ink(tc)}" stroke-width="3"/>`;
      if (C.towel) s += `<path d="M-30,-984 Q-80,-990 -104,-940 L-96,-860 L-74,-860 L-80,-930 Q-60,-966 -22,-972Z" fill="${C.towel}" stroke="${ink(C.towel)}" stroke-width="2.8"/>`;
    }
    return s;
  }
  function lowerFB(C, back) {
    const B = C.bottom, c = B.color, len = B.len || 1;
    if (B.type === "skirt") { const yb = -612 + 232 * len, fl = 30 * len;
      return `<path d="M-90,-612 L90,-612 Q${f(100 + fl)},-500 ${f(108 + fl)},${f(yb)} Q0,${f(yb + 12)} ${f(-108 - fl)},${f(yb)} Q${f(-100 - fl)},-500 -90,-612Z" fill="${c}" stroke="${ink(c)}" stroke-width="${OW}"/>` + [-60, -20, 20, 60].map((x) => `<path d="M${x * 0.8},-604 L${f(x * (1.1 + 0.2 * len))},${f(yb + 4)}" stroke="${ink(c)}" stroke-width="2" opacity=".55"/>`).join("") + `<path d="M60,-604 Q${f(90 + fl)},-500 ${f(100 + fl)},${f(yb)} L${f(108 + fl)},${f(yb)} Q${f(100 + fl)},-500 90,-612Z" fill="${shd(c)}"/>` + (B.belt && !back ? `<rect x="-90" y="-614" width="180" height="16" fill="${B.belt}" stroke="${ink(B.belt)}" stroke-width="2"/>` : ""); }
    if (B.type === "sarong") return `<path d="M-92,-612 L92,-612 Q98,-300 100,-74 Q0,-62 -100,-74 Q-98,-300 -92,-612Z" fill="${c}" stroke="${ink(c)}" stroke-width="${OW}"/><path d="M60,-600 Q72,-300 76,-76 L100,-74 Q98,-300 92,-612Z" fill="${shd(c)}"/>` + [-230, -170, -114].map((y) => `<path d="M-98,${y} L98,${y}" stroke="${B.p1}" stroke-width="12" opacity=".85"/><path d="M-98,${y + 12} L98,${y + 12}" stroke="${B.p2}" stroke-width="3"/>`).join("") + `<path d="M-92,-600 L92,-600" stroke="${shd(c)}" stroke-width="12"/>` + (back ? "" : `<path d="M30,-596 Q20,-300 34,-76" fill="none" stroke="${ink(c)}" stroke-width="2.4" opacity=".6"/>`);
    return `<path d="M-90,-612 L90,-612 Q96,-590 90,-556 L0,-548 L-90,-556 Q-96,-590 -90,-612Z" fill="${c}" stroke="${ink(c)}" stroke-width="${OW}"/>` + (back ? `<rect x="-70" y="-596" width="44" height="40" rx="3" fill="none" stroke="${ink(c)}" stroke-width="2"/><rect x="26" y="-596" width="44" height="40" rx="3" fill="none" stroke="${ink(c)}" stroke-width="2"/>` : `<path d="M0,-604 L0,-560" stroke="${ink(c)}" stroke-width="2.4"/>`) + (C.belt ? `<path d="M-90,-612 L90,-612 L92,-596 L-92,-596Z" fill="${C.belt}" stroke="${ink(C.belt)}" stroke-width="2.4"/>` + (back ? "" : `<rect x="-10" y="-614" width="20" height="20" rx="2" fill="#C9A44A" stroke="#7A5E2A" stroke-width="2"/>`) : "");
  }
  function shoeFB(at, k, C, back, side) {
    const S = C.shoes, c = S.color, sk = C.skin, o = ink(c), so = S.sole || "#9A948A";
    let g = "";
    if (S.type === "sandal" || S.type === "slipper") {
      const sl = S.sole || "#5A4636";
      g += `<path d="M-30,2 Q-32,12 -20,12 L20,12 Q32,12 30,2 Z" fill="${sl}" stroke="${ink(sl)}" stroke-width="2.6"/>`;
      if (back) g += `<path d="M-20,-40 L20,-40 Q24,-14 20,2 L-20,2 Q-24,-14 -20,-40Z" fill="${sk}" stroke="${ink(sk)}" stroke-width="${OW}"/>`;
      else { g += `<path d="M-18,-46 L18,-46 Q26,-20 28,-2 L-28,-2 Q-26,-20 -18,-46Z" fill="${sk}"/><path d="M18,-46 Q26,-20 28,-2 M-28,-2 Q-26,-20 -18,-46" fill="none" stroke="${ink(sk)}" stroke-width="${OW}"/>` + [[-20, 6], [-10, 6.5], [0, 6.8], [10, 6.4], [20, 7.2]].map(([x, r]) => `<ellipse cx="${x * -side}" cy="-2" rx="${r * 0.8}" ry="${r}" fill="${sk}" stroke="${ink(sk)}" stroke-width="2"/>`).join("");
        g += S.type === "slipper" ? `<path d="M-26,-24 Q0,-34 26,-24 L28,-8 L-28,-8Z" fill="${c}" stroke="${ink(c)}" stroke-width="2.6"/>` : `<path d="M-22,-28 L0,-12 L22,-28" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`; }
    } else if (S.type === "flat") {
      g += back ? `<path d="M-22,-30 Q-26,-6 -20,4 L20,4 Q26,-6 22,-30 Q0,-24 -22,-30Z" fill="${c}" stroke="${o}" stroke-width="${OW}"/><path d="M-14,-46 L14,-46 L22,-30 Q0,-24 -22,-30Z" fill="${sk}" stroke="${ink(sk)}" stroke-width="2.6"/>`
        : `<path d="M-16,-46 L16,-46 L22,-26 L-22,-26Z" fill="${sk}"/><path d="M16,-46 L22,-26 M-22,-26 L-16,-46" stroke="${ink(sk)}" stroke-width="${OW}"/><path d="M-26,-4 Q-30,-28 0,-28 Q30,-28 26,-4 Q24,6 0,6 Q-24,6 -26,-4Z" fill="${c}" stroke="${o}" stroke-width="${OW}"/><path d="M-8,-26 l-8,-6 l2,10Z M8,-26 l8,-6 l-2,10Z" fill="${S.bow || "#F7EBD3"}"/><circle cx="0" cy="-26" r="3.4" fill="${S.bow || "#F7EBD3"}"/>`;
    } else {
      const dress = S.type === "dress", sc = dress ? "#141414" : so;
      g += `<path d="M-30,0 Q-32,12 -20,12 L20,12 Q32,12 30,0Z" fill="${sc}" stroke="${ink(sc)}" stroke-width="2.6"/>`;
      g += back ? `<path d="M-26,-34 Q-30,-10 -26,2 L26,2 Q30,-10 26,-34 Q0,-44 -26,-34Z" fill="${c}" stroke="${o}" stroke-width="${OW}"/><path d="M-8,-40 L8,-40 L8,-16 L-8,-16Z" fill="${shd(c)}" stroke="${o}" stroke-width="2"/>`
        : `<path d="M-28,0 C-32,-24 -22,-44 0,-46 C22,-44 32,-24 28,0Z" fill="${c}" stroke="${o}" stroke-width="${OW}"/><ellipse cx="0" cy="-44" rx="13" ry="4" fill="${RK.shade(c, -0.5)}"/>` + (dress ? `<path d="M-10,-30 Q0,-36 10,-30" fill="none" stroke="#fff" stroke-width="3" opacity=".35"/>` : `<path d="M-8,-40 L8,-40 M-9,-32 L9,-32 M-10,-24 L10,-24" stroke="${o}" stroke-width="2.4" stroke-linecap="round"/><path d="M-22,-8 Q0,-2 22,-8" fill="none" stroke="${S.stripe || shd(c)}" stroke-width="3.4"/>`);
    }
    return `<g transform="translate(${P(at)}) scale(${f(k)})">${g}</g>`;
  }

  // ---------- ทั้งตัว ----------
  // ใช้ RK.figParts (ฟังก์ชันพื้นฐานจาก fig.js: limb, seg, chain, hand)
  RK.figFB = function (p, t, C, back) {
    const X = RK.figParts, B = C.body || {}, bw = B.bw || 1, hL = B.hL || 1, tL = B.tL || 1, hs = B.hs || 1;
    const legW = 1 + Math.max(0, bw - 1) * 1.6, armW = 1 + Math.max(0, bw - 1) * 1.1, aL = (tL + hL) / 2;
    const L1 = 278 * hL, L2 = 262 * hL, footH = 52 * Math.min(1, hL + 0.2);
    const m = p.motion || "", walk = m === "walk" || m === "run", fr = p.freq || (m === "run" ? 1.45 : 0.9), ph = 2 * Math.PI * fr * (t - (p.t0 || 0));
    // เดินเข้าหา/ออกจากกล้อง: ยกเข่าสลับ (ขาที่ยกดูสั้นลง) ตัวยุบขึ้นลง
    const liftOf = (q) => (walk ? Math.max(0, Math.sin(q)) * (m === "run" ? 0.3 : 0.16) : 0);
    const lL = liftOf(ph), lR = liftOf(ph + Math.PI), bob = walk ? Math.abs(Math.cos(ph)) * (m === "run" ? 16 : 8) : 0;
    const hipY = -(L1 + L2 + footH) + bob, TT = `translate(0,${f(hipY)}) scale(${f(bw)},${f(tL)}) translate(0,592)`;
    const tp = (x, y) => [x * bw, hipY + (y + 592) * tL], breathe = Math.sin(t * 2.2) * 2.4;
    const B2 = C.bottom, sarong = B2.type === "sarong", skirt = B2.type === "skirt", shorts = B2.type === "shorts", pants = B2.type === "pants";
    let s = `<ellipse cx="0" cy="6" rx="${f(120 * bw)}" ry="16" fill="#000" opacity=".16"/>`;
    const leg = (sx, lift) => {
      const h = [sx * 44 * bw, hipY + 8], kk = [sx * 40 * bw, hipY + 8 + L1 * (1 - lift * 0.9)], a = [sx * 36 * bw, hipY + 8 + L1 * (1 - lift * 0.9) + L2 * (1 - lift * 0.35)];
      let g = pants ? X.limb([h, kk, a], [84 * legW, 62 * legW, 52 * legW], B2.color, { bulge: 0.02, folds: [[1, 0.85, 0.7]] }) : X.limb([h, kk, a], [70 * legW, 46 * legW, 32 * legW], C.skin, { bulge: 0.1 });
      if (shorts) g += X.seg(h, add(h, mul([kk[0] - h[0], kk[1] - h[1]], 0.82)), 92 * legW, 80 * legW, B2.color, { flatEnd: true });
      g += shoeFB([a[0], a[1] + footH * 0.85], Math.min(1, 0.55 + hL * 0.5) * (1 + lift * 0.3), C, back, sx);
      return g;
    };
    const arm = (sx, A, pass = "all") => {
      const rz = Math.max(0, Math.min(1, (A[0] - 30) / 120)), sh0 = tp(sx * (104 - 8 * rz), -914 - 24 * rz);
      let [s0, e, w, tot] = X.chain(sh0, -A[0] * sx, 205 * aL, -A[1] * sx, 188 * aL * (A[3] || 1));
      const T = C.top, O = C.outer && C.outer.sleeves ? C.outer : null, sl = O ? "long" : T.sleeve, slc = O ? O.color : T.color;
      let g = "";
      const hk = Math.min(1, 0.5 + aL * 0.55) * Math.sqrt(armW);
      const hd = () => { const hs2 = X.hand(A[2] || "relaxed", w, tot, C.skin, true, hk, back ? null : C.nails, (sl === "long" ? 30 : 28) * armW, sl === "long"); return sx > 0 ? `<g transform="translate(${P(w)}) scale(-1,1) translate(${f(-w[0])},${f(-w[1])})">${hs2}</g>` : hs2; };
      if (sl === "long") g += hd() + X.limb([s0, e, w], [56 * armW, 44 * armW, 38 * armW], slc, { flatEnd: true, noStroke: true, sideFrom: 0.26 });
      else { g += X.limb([s0, e, w], [50 * armW, 36 * armW, 28 * armW], C.skin, { bulge: 0.1, noStroke: true, sideFrom: 0.5 }) + hd();
        const cuff = sl === "3q" ? add(e, rot([0, 30 * aL], tot)) : add(s0, rot([0, 96 * aL], -A[0] * sx));
        g += sl === "3q" ? X.limb([s0, e, cuff], [60 * armW, 50 * armW, 46 * armW], slc, { flatEnd: true, noStroke: true, sideFrom: 0.26 }) : X.seg(s0, cuff, 60 * armW, 54 * armW, slc, { flatEnd: true, noStroke: true, sideFrom: 0.26, noShade: true });
        const uu = rot([0, 1], sl === "3q" ? tot : -A[0] * sx), nn = [-uu[1], uu[0]], cw = (sl === "3q" ? 46 : 54) * armW / 2;
        g += `<path d="M${P(add(cuff, mul(nn, cw)))} Q${P(add(cuff, mul(uu, 5)))} ${P(add(cuff, mul(nn, -cw)))}" fill="none" stroke="${ink(slc)}" stroke-width="${OW}" stroke-linecap="round"/>`; }
      if (C.watch && sx < 0 && !back) g += `<g transform="translate(${P(add(w, rot([0, -12], tot)))}) rotate(${f(tot)})"><rect x="-17" y="-6" width="34" height="12" rx="4" fill="#2B2B33"/></g>`;
      if (pass === "over") { // ส่วนแขนที่อยู่หน้าขอบลำตัว: ตัดหัวไหล่ทิ้ง
        const u = rot([0, 1], -A[0] * sx), n = [-u[1], u[0]], c = add(s0, mul(u, 205 * aL * 0.22));
        const qq = [add(c, mul(n, 3000)), add(c, mul(n, -3000)), add(add(c, mul(n, -3000)), mul(u, 4000)), add(add(c, mul(n, 3000)), mul(u, 4000))];
        const cid = `fa${(p.who || "x")}${sx > 0 ? "r" : "l"}${back ? "b" : "f"}`;
        return `<clipPath id="${cid}"><path d="M${qq.map(P).join(" L")}Z"/></clipPath><g clip-path="url(#${cid})">${g}</g>`;
      }
      return g;
    };
    // ท่าแขน (ค่าบวก = กางออกด้านข้าง)
    let AL = [7, -3, "relaxed"], AR = [7, -3, "relaxed"];
    if (walk) { const sw = Math.sin(ph); AL = [7, -4 - 14 * Math.max(0, sw), m === "run" ? "fist" : "relaxed", 1 - 0.3 * Math.max(0, sw)]; AR = [7, -4 - 14 * Math.max(0, -sw), m === "run" ? "fist" : "relaxed", 1 - 0.3 * Math.max(0, -sw)]; }
    if (m === "wave" || p.pose === "wave") AL = [150, 30 + Math.sin(t * 9) * 16, "wave"];
    { const g0 = p.gest != null ? p.gest : (m === "talk" ? 1 : 0), k = g0 * g0 * (3 - 2 * g0);
      if (k > 0.001) { const T2 = [12, -44 + Math.sin(t * 4) * 10, "open", 0.55]; AR = [AR[0] + (T2[0] - AR[0]) * k, AR[1] + (T2[1] - AR[1]) * k, k > 0.5 ? "open" : AR[2], 1 - 0.45 * k]; } }
    { const ph1 = (String(p.who || "").length * 1.3) % 6.28; if (!walk) { AL = [AL[0] + Math.sin(t * 0.8 + ph1) * 1.6, AL[1] + Math.sin(t * 0.8 + ph1 - 0.5) * 2, AL[2], AL[3]]; AR = [AR[0] + Math.sin(t * 0.8 + ph1 + 1.2) * 1.6, AR[1], AR[2], AR[3]]; } }
    if (p.pose === "hips") { AL = [44, -84, "fist"]; AR = [44, -84, "fist"]; }
    if (p.pose === "cheer") { AL = [150, 10, "fist"]; AR = [150, 10, "fist"]; }
    // มุมหลัง: สลับซ้าย-ขวา (แขนที่โบกเป็นแขนเดิมของตัวละคร)
    if (back) [AL, AR] = [AR, AL];
    // ผมยาวด้านหลัง (มุมหน้าตรง) อยู่หลังลำตัว
    if (!back) s += `<g transform="translate(${f(tp(0, -968)[0])},${f(tp(0, -968)[1] + breathe * 0.4)}) scale(${f(hs)}) translate(0,968)">${hairFront(C.hair).back}</g>`;
    s += leg(-1, lL) + leg(1, lR);
    if (sarong) s += `<g transform="${TT}">${lowerFB(C, back)}</g>`;
    else s += `<g transform="${TT}">${lowerFB(C, back)}</g>`;
    if (back) { s += `<g transform="translate(${f(tp(0, -968)[0])},${f(tp(0, -968)[1] + breathe * 0.4)}) scale(${f(hs)}) translate(0,968)">${neckFB(C, true)}</g>`; }
    if (!back) s += `<g transform="translate(${f(tp(0, -968)[0])},${f(tp(0, -968)[1] + breathe * 0.4)}) scale(${f(hs)}) translate(0,968)">${neckFB(C, false)}</g>`;
    const fid = `olfb${(p.who || "x")}${back ? "b" : "f"}${Math.round(Math.random() * 1e6)}`;
    s += `<filter id="${fid}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB"><feMorphology in="SourceGraphic" operator="dilate" radius="2.2" result="d"/><feComponentTransfer in="d" result="k"><feFuncR type="linear" slope=".58"/><feFuncG type="linear" slope=".55"/><feFuncB type="linear" slope=".55"/></feComponentTransfer><feMerge><feMergeNode in="k"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
    s += `<g filter="url(#${fid})"><g transform="${TT} translate(0,${f(breathe * 0.4)})">${torsoFB(C, (p.who || "x") + (back ? "b" : "f"), back)}</g>${arm(-1, AL)}${arm(1, AR)}</g>`;
    const HT = `translate(${f(tp(0, -968)[0])},${f(tp(0, -968)[1] + breathe * 0.4)}) scale(${f(hs)}) translate(0,968)`;
    const ph0 = (String(p.who || "").length * 1.7) % 6.28, gst = p.gest != null ? p.gest : (m === "talk" ? 1 : 0);
    const tilt = Math.sin(t * 0.45 + ph0) * 1.4 + (Math.sin(t * 2.1 + ph0) * 2.4 + Math.sin(t * 3.7) * 1.2) * gst, nod = -Math.abs(Math.sin(t * 6.2)) * 2.4 * gst;
    s += `<g transform="translate(0,${f(nod)}) rotate(${f(tilt)} 0 ${f(tp(0, -968)[1])})"><g transform="${HT}">${back ? headBack(C) : headFront(C, p, t)}</g></g>`;
    return `<g transform="translate(${f(p.x)},${f(p.y)}) scale(${f(p.s || 1)})">${s}</g>`;
  };
})(window);
