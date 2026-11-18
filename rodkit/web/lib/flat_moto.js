// flat_moto.js — มอเตอร์ไซค์ครอบครัวแบบอันเดอร์โบน (มุมข้าง หันขวา) สไตล์แบน วาดด้วยโค้ดล้วน
// สัดส่วนอ้างอิงจากภาพถ่ายด้านข้าง (หน่วย = พิกเซลของภาพอ้างอิง) จุดกำเนิด = พื้น กึ่งกลางระหว่างล้อ
// ใช้: RK.flatMoto({ spin: องศาล้อ, steer: 0 }) แล้วย่อขนาดด้วย transform ตอนวางในฉาก (คู่กับตัวละคร s≈0.62 ใช้ scale≈0.95)
(function (G) {
  const RK = G.RK || (G.RK = {});
  const f = (v) => (Math.round(v * 10) / 10).toString();
  const P = (x, y) => f(x) + "," + f(y);
  const path = (d, c, ex = "") => `<path d="${d}" fill="${c}" ${ex}/>`;
  const circ = (x, y, r, c, ex = "") => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}" ${ex}/>`;
  const st = (c, w, op = 1, ex = "") => `stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" ${ex}`;
  const line = (x1, y1, x2, y2, c, w, ex = "") => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${ex}/>`;
  const bolt = (x, y, r = 5, c = "#2A7BE4") => circ(x, y, r + 1.5, "#1B2A44", 'opacity=".6"') + circ(x, y, r, c) + circ(x - r * 0.3, y - r * 0.3, r * 0.35, "#FFFFFF", 'opacity=".7"');
  const seam = (d, op = 0.8) => path(d, "none", st("#5D646E", 2.2, op)) + path(d, "none", st("#F1F3F6", 1.2, op * 0.6, 'transform="translate(1,1.5)"'));

  const C = { silverLo: "#7F8792", black: "#1F2024", black2: "#2D2F34", gold: "#D9A92E", goldHi: "#F7DA77", goldLo: "#9E7516", red: "#D8343A", tire: "#1B1C20" };
  const RW = [-335, -126], FW = [335, -126], TR = 127, RIM = 111;

  RK.flatMotoDefs = `
  <linearGradient id="mBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7AD0FF"/><stop offset=".3" stop-color="#2C86EC"/><stop offset=".62" stop-color="#173CA6"/><stop offset=".85" stop-color="#2557C8"/><stop offset="1" stop-color="#4FA6F2"/></linearGradient>
  <linearGradient id="mSilver" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9ECEF"/><stop offset=".35" stop-color="#C3C8CF"/><stop offset=".7" stop-color="#A3AAB3"/><stop offset="1" stop-color="#7F8792"/></linearGradient>
  <linearGradient id="mSilverF" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8E959F"/><stop offset=".4" stop-color="#C9CED4"/><stop offset=".75" stop-color="#E6E9EC"/><stop offset="1" stop-color="#9AA1AB"/></linearGradient>
  <linearGradient id="mSeat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#43464D"/><stop offset=".5" stop-color="#26282D"/><stop offset="1" stop-color="#141518"/></linearGradient>
  <linearGradient id="mChrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FAFBFC"/><stop offset=".45" stop-color="#A9B0B9"/><stop offset=".55" stop-color="#7F8792"/><stop offset="1" stop-color="#E9ECEF"/></linearGradient>
  <linearGradient id="mChromeV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7F8792"/><stop offset=".35" stop-color="#F4F6F8"/><stop offset=".6" stop-color="#AEB5BE"/><stop offset="1" stop-color="#6E757F"/></linearGradient>
  <radialGradient id="mHub" cx=".4" cy=".35"><stop offset="0" stop-color="#F7F8FA"/><stop offset="1" stop-color="#868D97"/></radialGradient>
  <radialGradient id="mDisc" cx=".45" cy=".4"><stop offset="0" stop-color="#E6E9ED"/><stop offset="1" stop-color="#9AA1AA"/></radialGradient>
  <pattern id="mMesh" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0,0 L0,11 M0,0 L11,0" stroke="#111114" stroke-width="3.2"/></pattern>
  <pattern id="mCarbon" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="#26272C"/><rect width="5" height="5" fill="#34363C"/><rect x="5" y="5" width="5" height="5" fill="#34363C"/></pattern>`;

  // ---------- ล้อ ----------
  function wheel(c, spin, front) {
    const [cx, cy] = c, rad = (d) => d * Math.PI / 180;
    let s = circ(cx, cy, TR, C.tire);
    // ดอกยาง (บล็อกรอบวง)
    for (let i = 0; i < 48; i++) { const a = rad(i * 7.5 + spin); s += `<rect x="${f(-5)}" y="${f(-TR + 1)}" width="10" height="7" rx="2" fill="#34363C" transform="translate(${P(cx, cy)}) rotate(${f(i * 7.5 + spin)})"/>`; }
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${TR - 11}" fill="none" stroke="#2A2B30" stroke-width="2.5"/>`;
    s += `<path d="M ${P(cx - TR * 0.62, cy - TR * 0.62)} A ${TR - 4},${TR - 4} 0 0 1 ${P(cx + TR * 0.2, cy - TR * 0.96)}" ${st("#4A4D55", 3, 0.8)}/>`;
    // ขอบล้ออะลูมิเนียมสีทอง (มีร่องกลาง + ไฮไลต์)
    s += circ(cx, cy, RIM + 3, C.goldLo) + circ(cx, cy, RIM, C.gold) + circ(cx, cy, RIM - 11, "#232428");
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${RIM - 5.5}" fill="none" stroke="${C.goldLo}" stroke-width="2"/>`;
    s += `<path d="M ${P(cx - RIM * 0.82, cy - RIM * 0.5)} A ${RIM - 2},${RIM - 2} 0 0 1 ${P(cx + RIM * 0.3, cy - RIM * 0.95)}" ${st("#FFF1B8", 3, 0.9)}/>`;
    s += `<path d="M ${P(cx + RIM * 0.86, cy + RIM * 0.4)} A ${RIM - 2},${RIM - 2} 0 0 1 ${P(cx + RIM * 0.1, cy + RIM * 0.99)}" ${st("#FFF1B8", 2, 0.5)}/>`;
    // จุ๊บลม
    { const a = rad(200 + spin); s += line(cx + Math.cos(a) * (RIM - 10), cy + Math.sin(a) * (RIM - 10), cx + Math.cos(a) * (RIM - 22), cy + Math.sin(a) * (RIM - 22), "#9AA1AA", 4); }
    // ซี่ลวดไขว้ 36 ซี่ + หัวนิปเปิล
    for (let i = 0; i < 36; i++) {
      const a = rad(i * 10 + spin), off = (i % 2 ? 1 : -1) * 0.42, hub = front ? 20 : 24;
      const hx = cx + Math.cos(a + off) * hub, hy = cy + Math.sin(a + off) * hub, rx = cx + Math.cos(a) * (RIM - 11), ry = cy + Math.sin(a) * (RIM - 11);
      s += line(hx, hy, rx, ry, i % 2 ? "#D5DAE0" : "#9FA6AF", 1.8) + circ(rx, ry, 2.2, "#C9CED5");
    }
    if (front) { // จานดิสก์ (ขอบหยัก + รูเจาะ + น็อตสี) + คาลิปเปอร์ทอง
      let d = "";
      for (let i = 0; i <= 36; i++) { const a = rad(i * 10 + spin), r = 50 + (i % 2 ? -3.5 : 0); d += (i ? " L " : "M ") + P(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
      s += path(d + " Z", "url(#mDisc)", 'stroke="#7F8792" stroke-width="1.5"') + `<circle cx="${f(cx)}" cy="${f(cy)}" r="40" fill="none" stroke="#B9BFC7" stroke-width="2"/>`;
      for (let i = 0; i < 18; i++) { const a = rad(i * 20 + 10 + spin), r = i % 2 ? 42 : 36; s += circ(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.6, "#6E757F"); }
      s += circ(cx, cy, 27, "#8E959F");
      for (let i = 0; i < 5; i++) { const a = rad(i * 72 + spin); s += bolt(cx + Math.cos(a) * 21, cy + Math.sin(a) * 21, 3.6, ["#2A7BE4", "#9B59E0", "#E4572E", "#2A7BE4", "#D9A92E"][i]); }
      s += circ(cx, cy, 13, "url(#mHub)") + circ(cx, cy, 5, "#5E6670");
      s += path(`M ${P(cx - 62, cy - 40)} C ${P(cx - 70, cy - 14)} ${P(cx - 68, cy + 10)} ${P(cx - 58, cy + 26)} L ${P(cx - 42, cy + 20)} C ${P(cx - 50, cy + 4)} ${P(cx - 52, cy - 18)} ${P(cx - 46, cy - 36)} Z`, C.gold, `stroke="${C.goldLo}" stroke-width="2"`);
      s += path(`M ${P(cx - 60, cy - 30)} C ${P(cx - 64, cy - 10)} ${P(cx - 63, cy + 6)} ${P(cx - 56, cy + 18)}`, "none", st(C.goldHi, 2, 0.8)) + bolt(cx - 56, cy - 26, 3.5) + bolt(cx - 52, cy + 12, 3.5);
      s += path(`M ${P(cx - 58, cy - 40)} C ${P(cx - 70, cy - 70)} ${P(cx - 60, cy - 100)} ${P(cx - 50, cy - 130)}`, "none", st("#1F2024", 4));
    } else { // ดรัมเบรกหลัง + แขนเบรก
      s += circ(cx, cy, 44, "#A4ABB4", 'stroke="#7F8792" stroke-width="2.5"') + `<circle cx="${f(cx)}" cy="${f(cy)}" r="34" fill="none" stroke="#C9CED5" stroke-width="2"/>`;
      for (let i = 0; i < 12; i++) { const a = rad(i * 30 + spin); s += line(cx + Math.cos(a) * 36, cy + Math.sin(a) * 36, cx + Math.cos(a) * 42, cy + Math.sin(a) * 42, "#7F8792", 2); }
      s += circ(cx, cy, 20, "url(#mHub)") + circ(cx, cy, 7, "#5E6670") + line(cx + 30, cy - 30, cx + 120, cy - 52, "#7F8792", 6) + circ(cx + 120, cy - 52, 5, "#C9CED5");
    }
    return s;
  }

  RK.flatMoto = function (o = {}) {
    const spin = o.spin || 0;
    let s = `<ellipse cx="0" cy="4" rx="520" ry="24" fill="#000" opacity=".35" filter="url(#fBlur8)"/>`;
    // ---------- บังโคลนหลังยาว (ดำ) ----------
    s += path(`M -650,-560 C -660,-520 -664,-490 -660,-460 L -636,-462 C -638,-492 -634,-520 -626,-548 Z`, C.black2) + path(`M -660,-470 C -676,-410 -694,-330 -708,-236 L -716,-206 L -690,-200 L -682,-230 C -670,-320 -654,-400 -636,-462 Z`, C.black) + path(`M -620,-458 C -650,-394 -672,-320 -686,-240`, "none", st("#3F4249", 3)) +
      path(`M -720,-214 L -684,-208 L -690,-178 L -726,-184 Z`, C.black2);
    // ---------- ล้อหลัง ----------
    s += wheel(RW, spin, false);
    // ---------- สวิงอาร์ม ----------
    s += path(`M -150,-196 L -340,-142 L -334,-110 L -144,-166 Z`, "url(#mChrome)", `stroke="#6E757F" stroke-width="2"`) + circ(-148, -182, 14, "#5E6670") + circ(-148, -182, 7, "#C9CED5") + circ(RW[0], RW[1], 9, "#C9CED5") + bolt(RW[0], RW[1], 5, "#C9CED5");
    // ---------- โช้คหลัง สปริงแดง + กระบอกโครเมียม ----------
    const sh0 = [-282, -190], sh1 = [-262, -372];
    s += line(sh0[0], sh0[1], sh1[0], sh1[1], "#9AA1AA", 12) + `<rect x="${f(sh1[0] - 14)}" y="${f(sh1[1] - 6)}" width="28" height="54" rx="7" fill="url(#mChromeV)"/>` + `<rect x="${f(sh0[0] - 10)}" y="${f(sh0[1] - 34)}" width="20" height="36" rx="6" fill="url(#mChromeV)"/>`;
    for (let i = 0; i < 12; i++) { const k = 0.18 + i * 0.054, x = sh0[0] + (sh1[0] - sh0[0]) * k, y = sh0[1] + (sh1[1] - sh0[1]) * k; s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="17" ry="5.5" fill="${i % 2 ? C.red : "#A51F26"}" transform="rotate(-7 ${f(x)} ${f(y)})"/>` + `<ellipse cx="${f(x - 6)}" cy="${f(y - 2)}" rx="5" ry="1.6" fill="#FF8A8A" opacity=".7"/>`; }
    s += circ(sh0[0], sh0[1], 9, "#C9CED5") + circ(sh1[0], sh1[1] - 2, 8, "#C9CED5") + `<rect x="${f(sh1[0] - 12)}" y="${f(sh1[1] + 14)}" width="24" height="7" rx="3" fill="#E9B93A"/>`;
    // ---------- ท่อไอเสีย ----------
    s += path(`M 30,-170 C 44,-120 50,-80 30,-56 C 10,-40 -60,-36 -190,-34 L -190,-54 C -70,-56 2,-58 14,-74 C 26,-92 20,-130 10,-168 Z`, "url(#mChrome)", 'stroke="#7F8792" stroke-width="1.5"');
    s += `<g transform="translate(0,-16) rotate(20 -336 -84)">` +
      path(`M -480,-110 L -200,-110 C -176,-110 -166,-96 -166,-84 C -166,-70 -176,-58 -200,-58 L -480,-58 C -498,-58 -506,-70 -506,-84 C -506,-98 -498,-110 -480,-110 Z`, "url(#mBlue)", 'stroke="#0F2C74" stroke-width="2.5"') +
      path(`M -470,-104 L -190,-104`, "none", st("#D2F0FF", 4, 0.85)) + path(`M -460,-98 L -320,-98`, "none", st("#FFFFFF", 2, 0.6)) + path(`M -480,-64 L -190,-64`, "none", st("#0B2463", 3, 0.6)) +
      path(`M -420,-112 C -400,-118 -250,-118 -230,-112 L -236,-104 L -414,-104 Z`, "#0F2C74", 'opacity=".55"') +
      [-440, -330, -220].map((x) => bolt(x, -84, 6, "#D9DEE4")).join("") +
      `<ellipse cx="-506" cy="-84" rx="9" ry="25" fill="url(#mChromeV)"/><ellipse cx="-508" cy="-84" rx="5" ry="15" fill="#2B2D33"/>` + `</g>`;
    // ---------- เครื่องยนต์ ----------
    s += path(`M -210,-300 L 20,-310 C 40,-280 46,-230 40,-180 L 22,-110 C -20,-74 -110,-70 -170,-90 C -206,-110 -222,-160 -224,-220 Z`, "#25262B") + path(`M -210,-300 L 20,-310 C 26,-296 30,-284 32,-270 L -218,-262 Z`, "#34363C");
    s += [0, 1, 2, 3, 4].map((i) => line(-190 + i * 4, -288 + i * 0, 14, -294 + i * 0, "#3E4047", 3)).join("").replace(/y1="-288"/g, 'y1="-288"');
    for (let i = 0; i < 5; i++) s += line(-180, -300 + i * 8, 12, -306 + i * 8, "#3A3C42", 2.5, 'opacity=".9"');
    s += `<ellipse cx="-98" cy="-188" rx="78" ry="72" fill="#18191C"/><ellipse cx="-98" cy="-188" rx="70" ry="64" fill="url(#mCarbon)"/>`;
    s += `<ellipse cx="-98" cy="-188" rx="70" ry="64" fill="none" stroke="#4A4D55" stroke-width="3"/>` + path(`M -150,-220 C -130,-246 -80,-252 -46,-228`, "none", st("#FFFFFF", 3, 0.25));
    s += `<rect x="-140" y="-196" width="84" height="22" rx="11" fill="#141518" stroke="#D9A92E" stroke-width="2.5"/>` + `<rect x="-128" y="-190" width="60" height="10" rx="5" fill="#D9A92E"/>`;
    for (let i = 0; i < 10; i++) { const a = i * 36 * Math.PI / 180; s += bolt(-98 + Math.cos(a) * 74, -188 + Math.sin(a) * 68, 3.2, "#9AA1AA"); }
    s += path(`M -40,-104 L 30,-110 L 34,-92 L -36,-86 Z`, "#2D2F34") + circ(26, -110, 6, "#9AA1AA");
    s += path(`M -200,-150 L -250,-200 L -238,-210 L -186,-162 Z`, "#2D2F34") + circ(-196, -156, 9, "#9AA1AA");
    // ---------- ขาตั้งกลาง ขาตั้งข้าง พักเท้า คันเกียร์ ----------
    s += line(-226, -98, -246, 0, C.black, 9) + line(-246, 0, -282, 0, C.black, 7) + line(-212, -98, -196, -8, C.black, 7) + line(-196, -8, -170, -8, C.black, 6);
    s += line(-30, -150, 70, -152, C.black, 10) + `<rect x="50" y="-163" width="40" height="24" rx="10" fill="#2D2F34"/>` + [56, 64, 72, 80].map((x) => line(x, -160, x, -142, "#45484F", 2)).join("");
    s += line(30, -164, 66, -196, "#2D2F34", 6) + `<rect x="58" y="-204" width="22" height="10" rx="5" fill="#2D2F34"/>`;
    // ---------- ตัวถังหลัง (ฝาข้าง) ----------
    const rearD = `M -704,-664 C -680,-660 -650,-650 -626,-628 C -616,-600 -612,-560 -612,-516 L 108,-500 C 84,-474 56,-444 22,-410 C -10,-376 -50,-330 -92,-304 C -150,-300 -220,-318 -280,-354 C -400,-424 -520,-500 -620,-570 C -660,-598 -688,-626 -704,-664 Z`;
    s += path(rearD, "url(#mSilver)", `stroke="${C.silverLo}" stroke-width="2.5"`);
    s += path(`M -690,-650 C -650,-620 -630,-590 -618,-560 M -600,-508 C -300,-500 -100,-496 100,-494`, "none", st("#FBFCFD", 5, 0.8));
    s += path(`M -560,-520 C -420,-500 -200,-482 40,-470`, "none", st("#FFFFFF", 3, 0.35));
    // ลายสติ๊กเกอร์: เส้นทอง-ดำ ลายจุด ลายตาราง
    s += path(`M -560,-498 C -440,-484 -300,-462 -140,-418 C -60,-396 0,-380 40,-366`, "none", st("#E9B93A", 5)) +
      path(`M -540,-486 C -420,-470 -290,-448 -150,-404`, "none", st("#2B2C31", 3)) +
      path(`M -330,-430 C -260,-414 -180,-392 -110,-366 L -128,-348 C -196,-372 -270,-394 -340,-410 Z`, "#2B2C31", 'opacity=".85"');
    for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) s += circ(-318 + i * 20 + r * 6, -414 + i * 5 + r * 12, 2.2, "#D7DBE0", 'opacity=".75"');
    s += path(`M -520,-480 C -470,-470 -420,-460 -380,-452`, "none", st("#C9CED5", 2, 0.8, 'stroke-dasharray="5 4"'));
    s += `<text x="-470" y="-462" font-family="Kanit" font-weight="900" font-style="italic" font-size="34" fill="#C8453A" stroke="#7E1F22" stroke-width="1" transform="rotate(-6 -470 -462)">125</text>`;
    s += seam(`M -92,-304 C -60,-350 -30,-420 -20,-500`, 0.6) + seam(`M -640,-560 C -600,-546 -560,-530 -520,-516`, 0.6);
    s += bolt(-226, -500, 4.5) + bolt(-60, -430, 4.5) + bolt(-560, -544, 4);
    // ไฟท้าย LED ใส
    s += path(`M -716,-666 L -668,-652 L -650,-626 L -664,-604 L -698,-632 Z`, "#F4F6F8", 'stroke="#9AA1AA" stroke-width="2"') + path(`M -704,-654 L -672,-644 L -660,-626 L -670,-614 L -694,-634 Z`, "#E4572E", 'opacity=".55"') + [0, 1, 2].map((i) => path(`M ${-700 + i * 12},${-648 + i * 6} l 8,10`, "none", st("#FFFFFF", 2, 0.8))).join("");
    // เหล็กกันตก/ตะแกรงท้าย (โครเมียม)
    s += path(`M -372,-498 L -366,-372 L -330,-366`, "none", st("url(#mChromeV)", 8)) + circ(-372, -498, 5, "#9AA1AA") + circ(-366, -372, 5, "#9AA1AA");
    // ---------- อันเดอร์โบน (ส่วนดำกลาง) ----------
    s += path(`M 30,-505 L 132,-505 C 128,-440 128,-380 132,-330 L 60,-318 C 40,-360 20,-400 -10,-430 C 6,-460 20,-486 30,-505 Z`, "#25262B") + path(`M 46,-488 L 116,-490 L 112,-350 L 72,-342 Z`, "#2F3136") + path(`M 60,-470 L 100,-470`, "none", st("#45484F", 2));
    // ---------- เบาะ (หุ้มพลาสติกใส) ----------
    s += path(`M -626,-516 C -626,-570 -596,-594 -520,-598 C -260,-606 -20,-600 70,-572 C 102,-560 114,-532 108,-500 C -100,-500 -400,-506 -626,-516 Z`, "url(#mSeat)");
    s += path(`M -620,-522 C -400,-512 -100,-506 104,-506`, "none", st("#0E0F11", 3)) + path(`M -610,-532 C -400,-524 -100,-516 100,-514`, "none", st("#55585F", 1.5, 0.8, 'stroke-dasharray="4 4"'));
    s += path(`M -560,-584 C -420,-594 -200,-596 0,-584`, "none", st("#FFFFFF", 5, 0.32)) +
      [[-520, -578, -470, -588, -420, -576], [-380, -572, -330, -590, -270, -578], [-230, -580, -170, -594, -110, -578], [-60, -574, -10, -586, 40, -570], [-460, -560, -400, -572, -340, -558], [-160, -560, -100, -572, -40, -558]]
        .map((a) => path(`M ${a[0]},${a[1]} Q ${a[2]},${a[3]} ${a[4]},${a[5]}`, "none", st("#FFFFFF", 2.2, 0.4))).join("") +
      path(`M 60,-570 L 90,-540 M 76,-578 L 100,-552`, "none", st("#FFFFFF", 2, 0.5));
    // ---------- ตัวถังหน้า (บังลม/คอ/ฝาครอบล่าง) ----------
    const frontD = `M 108,-508 C 132,-540 146,-596 156,-648 L 214,-654 C 214,-592 222,-526 244,-462 C 266,-400 288,-330 300,-272 C 284,-246 246,-224 204,-210 L 10,-206 C -6,-232 0,-282 22,-316 C 50,-356 82,-420 108,-508 Z`;
    s += path(frontD, "url(#mSilverF)", `stroke="${C.silverLo}" stroke-width="2.5"`);
    s += path(`M 170,-640 C 172,-560 186,-480 212,-410`, "none", st("#FFFFFF", 5, 0.7)) + path(`M 230,-440 C 250,-380 266,-330 276,-290`, "none", st("#FFFFFF", 3, 0.4));
    s += seam(`M 132,-330 C 160,-360 200,-380 250,-388`) + seam(`M 128,-505 C 150,-460 170,-420 200,-396`, 0.6) + seam(`M 22,-316 C 60,-300 120,-290 190,-262`, 0.6);
    // ช่องลมตะแกรงดำ
    s += path(`M 74,-318 L 132,-330 L 140,-238 L 82,-226 Z`, "#151518") + [0, 1, 2, 3, 4, 5, 6].map((i) => line(78 + i * 1.2, -306 + i * 12, 134 + i * 1.2, -318 + i * 12, "#4A4D55", 4)).join("");
    s += path(`M 150,-300 C 170,-306 186,-302 196,-292`, "none", st("#7F8792", 2));
    s += bolt(186, -232, 4.5) + bolt(40, -250, 4.5) + bolt(118, -420, 4) + bolt(150, -560, 4);
    // ไฟเลี้ยวหน้า
    s += path(`M 232,-418 L 262,-430 L 268,-404 L 238,-394 Z`, "#F4F6F8", 'stroke="#9AA1AA" stroke-width="1.5"') + path(`M 238,-414 L 258,-422 L 262,-408 L 242,-400 Z`, "#F2C14E", 'opacity=".75"');
    // สวิตช์กุญแจ + พวงกุญแจ
    s += circ(160, -432, 10, "#25262B") + circ(160, -432, 4, "#9AA1AA") + line(160, -432, 166, -404, "#C9CED5", 3.5) + `<circle cx="168" cy="-396" r="7" fill="none" stroke="#C9CED5" stroke-width="2.5"/>` + path(`M 168,-389 L 160,-366 L 176,-366 Z`, "#D9DEE4");
    // ---------- ตะเกียบหน้า (โครเมียม) ----------
    s += path(`M 248,-300 L 272,-306 L 346,-122 L 324,-114 Z`, "url(#mChromeV)", 'stroke="#7F8792" stroke-width="1.5"') + path(`M 290,-214 L 312,-220 L 346,-122 L 324,-114 Z`, "#B9BFC7") + `<rect x="300" y="-232" width="9" height="20" rx="3" fill="#E4572E" transform="rotate(-22 304 -222)"/>`;
    // ---------- ล้อหน้า ----------
    s += wheel(FW, spin, true);
    s += bolt(FW[0], FW[1], 6, "#C9CED5");
    // ---------- บังโคลนหน้า ----------
    s += path(`M 232,-246 C 278,-292 382,-296 440,-244 C 460,-226 470,-206 474,-188 L 452,-184 C 442,-214 404,-250 344,-260 C 300,-264 264,-250 242,-232 Z`, "url(#mSilver)", `stroke="${C.silverLo}" stroke-width="2"`) + path(`M 270,-270 C 320,-290 390,-284 432,-252`, "none", st("#FFFFFF", 3, 0.7));
    // ---------- คอแฮนด์ / หน้ากาก / แฮนด์ ----------
    s += path(`M 146,-640 C 150,-670 176,-690 212,-690 C 226,-676 228,-660 220,-644 Z`, "#25262B") + path(`M 186,-690 L 224,-692 L 232,-662 L 212,-650 Z`, "#E9EEF2", 'stroke="#9AA1AA" stroke-width="1.5"');
    s += line(156, -664, 92, -680, C.black, 15) + line(94, -680, 66, -686, "#2D2F34", 18) + [70, 76, 82, 88].map((x) => line(x, -694, x - 1, -678, "#45484F", 1.5)).join("") + bolt(58, -688, 7, "#2A7BE4");
    s += line(124, -672, 72, -660, "#9AA1AA", 4) + path(`M 140,-690 L 150,-712 L 160,-708 L 152,-688 Z`, "#25262B") + circ(146, -690, 4, "#C9CED5");
    s += `<rect x="168" y="-702" width="40" height="14" rx="5" fill="#4A4D55"/>` + path(`M 172,-696 L 204,-696`, "none", st("#8FD0FF", 3, 0.8));
    // ---------- ตะกร้าหน้า (ตาข่ายเหล็กดำ) ----------
    s += path(`M 340,-506 L 528,-532 L 512,-382 L 360,-372 Z`, "url(#mMesh)") + path(`M 340,-506 L 528,-532 L 512,-382 L 360,-372 Z`, "none", st("#111114", 6)) + line(340, -506, 528, -532, "#111114", 9) + line(352, -440, 520, -458, "#111114", 3, 'opacity=".8"');
    s += path(`M 345,-470 L 300,-476 L 268,-460`, "none", st("#111114", 6)) + path(`M 358,-390 L 300,-396`, "none", st("#111114", 5));
    return s;
  };
})(typeof window !== "undefined" ? window : globalThis);
