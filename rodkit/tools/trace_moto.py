"""แปลงภาพถ่ายรถ -> ภาพ 2D แบบเวกเตอร์ (SVG) ด้วยโค้ด
ขั้นตอน: แยกรถออกจากฉาก (GrabCut + คำใบ้สี) -> ลบตัวอักษร/โลโก้ -> ลดสีเป็นโทนแบน (k-means ใน Lab)
-> ไล่ขอบแต่ละโทนเป็นเส้นโค้งเรียบ -> วาดล้อ ขอบล้อ ซี่ลวด ใหม่ด้วยโค้ดตามตำแหน่งที่วัดได้ -> ฉากหลังลานจอดแบบเบลอ"""
import cv2, numpy as np, json, sys, pathlib
SRC, OUT = sys.argv[1], pathlib.Path(sys.argv[2]); OUT.mkdir(parents=True, exist_ok=True)
K = int(sys.argv[3]) if len(sys.argv) > 3 else 18
im = cv2.imread(SRC); h, w = im.shape[:2]
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV); H, S, V = [hsv[:, :, i].astype(int) for i in range(3)]
YY, XX = np.mgrid[0:h, 0:w]
gold = (H >= 15) & (H <= 32) & (S > 90) & (V > 110)
red = ((H <= 8) | (H >= 170)) & (S > 110) & (V > 70)
blue = (H >= 95) & (H <= 125) & (S > 120) & (V > 60)
WH = {"rear": ((384.8, 758.9), 159.5), "front": ((1281.6, 783.3), 159.0)}
RIM_IN, RIM_OUT, TIRE = 151, 166, 193

# ---------- 1) แยกรถออกจากฉาก ----------
m = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
x0, y0, x1, y1 = 105, 150, 1490, 990
m[y0:y1, x0:x1] = cv2.GC_PR_FGD
m[:y0 - 15] = cv2.GC_BGD; m[y1 + 5:] = cv2.GC_BGD; m[:, :x0 - 15] = cv2.GC_BGD; m[:, x1 + 15:] = cv2.GC_BGD
m[gold | red] = cv2.GC_FGD
m[blue & (XX < 700) & (YY > 600)] = cv2.GC_FGD
m[blue & (XX > 1380)] = cv2.GC_BGD
for (cx, cy), r in WH.values():
    d = np.hypot(XX - cx, YY - cy)
    m[(d > RIM_OUT) & (d < TIRE - 4)] = cv2.GC_FGD
    m[(d > TIRE + 6) & (d < TIRE + 30) & (YY > cy)] = cv2.GC_BGD
# พื้นที่ว่างใต้ท้ายรถ (เห็นเสาด้านหลัง) และช่องลอดใต้เบาะ เป็นฉากหลัง
cv2.fillPoly(m, [np.array([(100, 455), (250, 462), (322, 480), (118, 628), (100, 628)])], cv2.GC_BGD)
gap = np.array([(812, 300), (948, 300), (955, 420), (940, 500), (920, 550), (860, 585), (760, 590), (720, 530), (800, 500), (810, 400)]) 
cv2.fillPoly(m, [gap], cv2.GC_BGD)
bgm = np.zeros((1, 65)); fgm = np.zeros((1, 65))
cv2.grabCut(im, m, None, bgm, fgm, 6, cv2.GC_INIT_WITH_MASK)
fg = ((m == 1) | (m == 3)).astype(np.uint8)
fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(fg)
fg2 = np.zeros_like(fg)
for i in range(1, n):
    if st[i, cv2.CC_STAT_AREA] > 1500: fg2[lab == i] = 1
fg = fg2
# ในวงล้อ: ตัดยาง/ขอบล้อ/ซี่ลวดออก (จะวาดใหม่) เหลือชิ้นใหญ่ เช่น ท่อ ตะเกียบ จานเบรก ดุม
wheelzone = np.zeros_like(fg)
for (cx, cy), r in WH.values():
    d = np.hypot(XX - cx, YY - cy); wheelzone |= (d < TIRE + 3).astype(np.uint8)
thick = cv2.morphologyEx(fg, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
dark = V < 70
inwheel_keep = thick & ~((gold | dark).astype(np.uint8) & wheelzone.astype(bool)).astype(np.uint8)
fg = np.where(wheelzone == 1, inwheel_keep, fg).astype(np.uint8)
fg[np.hypot(XX - 1281.6, YY - 783.3) < 64] = 0
fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))

# ---------- 2) ลบตัวอักษร/โลโก้แบรนด์ ----------
txt = np.zeros((h, w), np.uint8)
for (a, b, c, d) in [(940, 562, 1030, 590), (805, 630, 950, 684), (560, 520, 700, 595), (785, 760, 865, 800), (340, 445, 512, 515), (505, 520, 640, 556)]:
    txt[b:d, a:c] = 255
src = cv2.inpaint(im, txt, 7, cv2.INPAINT_TELEA)
# ---------- 3) แยกวัสดุ แล้ววาดใหม่แบบสะอาด (สีเรียบ + เงา + ไฮไลต์) บนรูปทรงจริงจากภาพ ----------
base = cv2.GaussianBlur(src, (0, 0), 2.0)
for _ in range(3): base = cv2.bilateralFilter(base, 9, 26, 9)
bh = cv2.cvtColor(base, cv2.COLOR_BGR2HSV); bH, bS, bV = [bh[:, :, i].astype(int) for i in range(3)]
lum = cv2.cvtColor(base, cv2.COLOR_BGR2LAB)[:, :, 0].astype(float)
F = fg == 1
M = {}
M["blue"] = F & (bH >= 92) & (bH <= 128) & (bS > 80) & (bV > 45) & (YY > 640) & (XX < 720) & (XX > 200)
M["red"] = F & ((bH <= 8) | (bH >= 168)) & (bS > 90) & (bV > 50) & (XX > 380) & (XX < 480) & (YY > 550) & (YY < 700)
M["gold"] = F & (bH >= 14) & (bH <= 34) & (bS > 85) & (bV > 90)
M["black"] = F & (bV < 64) & ~M["blue"]
# เบาะ: พลาสติกหุ้มสะท้อนแสงขาว -> ยังนับเป็นเบาะดำ
seatzone = np.zeros((h, w), np.uint8); cv2.fillPoly(seatzone, [np.array([(262, 360), (560, 330), (800, 360), (960, 420), (965, 520), (900, 560), (700, 520), (480, 470), (300, 440), (262, 410)])], 1)
sb = (M["black"] & (seatzone == 1)).astype(np.uint8)
sb = cv2.morphologyEx(sb, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31)))
ys_, xs_ = np.where(sb == 1)
seat = np.zeros((h, w), np.uint8)
if len(xs_): cv2.fillPoly(seat, [cv2.convexHull(np.stack([xs_, ys_], 1).astype(np.int32))], 1)
seat &= seatzone; seat &= fg
M["black"] = M["black"] | (seat == 1)
M["silver"] = F & ~(M["blue"] | M["red"] | M["gold"] | M["black"])
def clean(mk, k=7, mn=300):
    mk = mk.astype(np.uint8)
    mk = cv2.morphologyEx(mk, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
    mk = cv2.medianBlur(mk * 255, 9) // 255
    n_, lab_, st_, _ = cv2.connectedComponentsWithStats(mk)
    out = np.zeros_like(mk)
    for i in range(1, n_):
        if st_[i, cv2.CC_STAT_AREA] >= mn: out[lab_ == i] = 1
    return out
def smooth_path(cnt):
    p = cnt.reshape(-1, 2).astype(float)
    if len(p) < 3: return ""
    n = len(p); d = f"M{p[0][0]:.1f},{p[0][1]:.1f}"
    for i in range(n):
        p0, p1, p2, p3 = p[i - 1], p[i], p[(i + 1) % n], p[(i + 2) % n]
        c1 = p1 + (p2 - p0) / 6; c2 = p2 - (p3 - p1) / 6
        d += f"C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}"
    return d + "Z"
def mpath(mk, eps=2.0, mina=60):
    cs, _ = cv2.findContours(mk.astype(np.uint8), cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    return "".join(smooth_path(cv2.approxPolyDP(c, eps, True)) for c in cs if cv2.contourArea(c) >= mina)
lumS = cv2.GaussianBlur(lum, (0, 0), 7)
def band(mk, lo, hi, blur=4.0, src_l=None):
    LL = lumS if src_l is None else src_l
    q = np.quantile(LL[mk == 1], [lo, hi]) if mk.sum() else (0, 0)
    sel = ((LL >= q[0]) & (LL <= q[1]) & (mk == 1)).astype(np.float32)
    sel = cv2.GaussianBlur(sel, (0, 0), blur) > 0.5
    return clean(sel & (mk == 1), 7, 400)
lumM = cv2.GaussianBlur(lum, (0, 0), 3)
layers = []
sil = clean(M["silver"], 5, 200); blk = clean(M["black"], 5, 200)
blu = clean(M["blue"], 7, 300); red = clean(M["red"], 3, 60); gld = clean(M["gold"] & (wheelzone == 0) | (M["gold"] & (np.hypot(XX - 1281.6, YY - 783.3) < 130)), 3, 40)
defs_extra = """<radialGradient id="tDisc" cx=".45" cy=".4"><stop offset="0" stop-color="#EEF0F3"/><stop offset="1" stop-color="#9AA1AA"/></radialGradient><linearGradient id="tSil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9BFC6"/><stop offset=".5" stop-color="#99A0A9"/><stop offset="1" stop-color="#737A84"/></linearGradient>
<linearGradient id="tBlk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34363C"/><stop offset="1" stop-color="#17181B"/></linearGradient>
<linearGradient id="tBlue" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse" gradientTransform="rotate(-20 520 760)"><stop offset="0" stop-color="#8AD6FF"/><stop offset=".3" stop-color="#2F8BEE"/><stop offset=".6" stop-color="#173DA8"/><stop offset="1" stop-color="#3A88E6"/></linearGradient>
<pattern id="tMesh" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><rect width="12" height="12" fill="#3D4046"/><path d="M0,0 L0,12 M0,0 L12,0" stroke="#0F1012" stroke-width="3.6"/></pattern>"""
# เงิน: พื้น + เงา 2 ระดับ + ไฮไลต์ 2 ระดับ
layers.append(f'<path d="{mpath(sil)}" fill="url(#tSil)" fill-rule="evenodd" stroke="#A8AFB8" stroke-width="1.5"/>')
layers.append(f'<path d="{mpath(band(sil, 0, .3))}" fill="#8F96A0" fill-rule="evenodd" opacity=".75"/>')
layers.append(f'<path d="{mpath(band(sil, 0, .1))}" fill="#6F7681" fill-rule="evenodd" opacity=".75"/>')
layers.append(f'<path d="{mpath(band(sil, .8, 1))}" fill="#CDD2D8" fill-rule="evenodd" opacity=".7"/>')
layers.append(f'<path d="{mpath(band(sil, .95, 1, 2.5, lumM), 1.6, 40)}" fill="#F4F6F8" fill-rule="evenodd" opacity=".85"/>')
# ดำ: พื้น + เงาสะท้อน (พลาสติกหุ้มเบาะ/เครื่อง)
layers.append(f'<path d="{mpath(blk)}" fill="url(#tBlk)" fill-rule="evenodd" stroke="#1E1F23" stroke-width="1.5"/>')
nonseat = blk & (1 - seat)
layers.append(f'<path d="{mpath(band(nonseat, .75, 1, 2.2))}" fill="#4A4D55" fill-rule="evenodd" opacity=".8"/>')
layers.append(f'<path d="{mpath(band(nonseat, .93, 1, 1.6))}" fill="#7D828C" fill-rule="evenodd" opacity=".7"/>')
seatm = (seat & blk).astype(np.uint8)
layers.append(f'<path d="{mpath(band(seatm, .8, 1, 6))}" fill="#4F535B" fill-rule="evenodd" opacity=".55"/>')
layers.append(f'<path d="{mpath(band(seatm, .94, 1, 4))}" fill="#D3D8DF" fill-rule="evenodd" opacity=".4"/>')
# ตะกร้า: ตาข่าย
bask = (blk == 1) & (XX > 1170) & (YY < 500) & (YY > 320)
bask = cv2.morphologyEx(bask.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
cs_, _ = cv2.findContours(bask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE); bask = np.zeros_like(bask)
if cs_: cv2.drawContours(bask, [max(cs_, key=cv2.contourArea)], -1, 1, -1)
layers.append(f'<path d="{mpath(bask, 2.2, 400)}" fill="url(#tMesh)" stroke="#0F1012" stroke-width="7" stroke-linejoin="round"/>')
# ท่อน้ำเงิน
# ปลายท่อ (วัดจากภาพ): ท้าย (232,702) หน้า (636,818) หนา ~46
pA, pB = np.array([232., 704.]), np.array([636., 816.])
rcx, rcy = (pA + pB) / 2; rw = np.linalg.norm(pB - pA); rh = 46; ra = np.degrees(np.arctan2(*(pB - pA)[::-1]))
L2, T2 = rw / 2, rh / 2
muff = f'<g transform="translate({rcx:.1f},{rcy:.1f}) rotate({ra:.1f})">'
muff += f'<rect x="{-L2:.1f}" y="{-T2:.1f}" width="{rw:.1f}" height="{rh:.1f}" rx="{T2:.1f}" fill="url(#tBlueL)" stroke="#0E2C78" stroke-width="2.5"/>'
muff += f'<path d="M{-L2+T2:.1f},{-T2*0.62:.1f} L{L2-T2:.1f},{-T2*0.62:.1f}" stroke="#D8F1FF" stroke-width="{T2*0.22:.1f}" stroke-linecap="round" opacity=".85"/>'
muff += f'<path d="M{-L2+T2*1.4:.1f},{-T2*0.35:.1f} L{-L2*0.1:.1f},{-T2*0.35:.1f}" stroke="#FFFFFF" stroke-width="{T2*0.1:.1f}" stroke-linecap="round" opacity=".7"/>'
muff += f'<path d="M{-L2+T2:.1f},{T2*0.6:.1f} L{L2-T2:.1f},{T2*0.6:.1f}" stroke="#0B2361" stroke-width="{T2*0.18:.1f}" stroke-linecap="round" opacity=".6"/>'
muff += f'<rect x="{-L2*0.55:.1f}" y="{-T2*1.02:.1f}" width="{L2*0.9:.1f}" height="{T2*0.32:.1f}" rx="{T2*0.15:.1f}" fill="#0F2C74" opacity=".55"/>'
for k in (-0.62, -0.05, 0.5): muff += f'<circle cx="{L2*k:.1f}" cy="0" r="{T2*0.2:.1f}" fill="#D9DEE4" stroke="#5E6670" stroke-width="1.5"/><circle cx="{L2*k - T2*0.06:.1f}" cy="{-T2*0.06:.1f}" r="{T2*0.07:.1f}" fill="#fff"/>'
muff += f'<ellipse cx="{-L2+3:.1f}" cy="0" rx="{T2*0.32:.1f}" ry="{T2*0.95:.1f}" fill="#B9C0C9" stroke="#5E6670" stroke-width="1.5"/><ellipse cx="{-L2+2:.1f}" cy="0" rx="{T2*0.18:.1f}" ry="{T2*0.62:.1f}" fill="#2B2D33"/>'
muff += '</g>'
layers.append(muff)
defs_extra += f'<linearGradient id="tBlueL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8AD6FF"/><stop offset=".28" stop-color="#2F8BEE"/><stop offset=".62" stop-color="#173DA8"/><stop offset="1" stop-color="#3A88E6"/></linearGradient>'
# สปริงแดง (ตำแหน่งวัดจากภาพ): บน (456,566) ล่าง (420,692)
top, bot = np.array([456., 566.]), np.array([420., 692.]); v = (bot - top) / np.linalg.norm(bot - top); ang = np.degrees(np.arctan2(v[1], v[0]))
coil = f'<line x1="{top[0]-v[0]*30:.1f}" y1="{top[1]-v[1]*30:.1f}" x2="{bot[0]+v[0]*20:.1f}" y2="{bot[1]+v[1]*20:.1f}" stroke="url(#tChr)" stroke-width="14" stroke-linecap="round"/>'
coil += f'<rect x="-13" y="-34" width="26" height="40" rx="7" fill="url(#tChr)" transform="translate({top[0]-v[0]*24:.1f},{top[1]-v[1]*24:.1f}) rotate({ang-90:.1f})"/>'
n_c = 12; Lc = np.linalg.norm(bot - top)
for i in range(n_c):
    c_ = top + v * Lc * (i + 0.5) / n_c
    coil += f'<ellipse cx="{c_[0]:.1f}" cy="{c_[1]:.1f}" rx="19" ry="{Lc/n_c*0.45:.1f}" fill="{"#D8343A" if i%2 else "#AE1F27"}" transform="rotate({ang-90:.1f} {c_[0]:.1f} {c_[1]:.1f})"/><ellipse cx="{c_[0]-6:.1f}" cy="{c_[1]-1:.1f}" rx="6" ry="1.8" fill="#FF9F9F" opacity=".8" transform="rotate({ang-90:.1f} {c_[0]:.1f} {c_[1]:.1f})"/>'
coil += f'<rect x="-15" y="-4" width="30" height="8" rx="3" fill="#E9B93A" transform="translate({top[0]+v[0]*4:.1f},{top[1]+v[1]*4:.1f}) rotate({ang-90:.1f})"/>'
layers.append(coil)
defs_extra += '<linearGradient id="tChr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7F8792"/><stop offset=".35" stop-color="#F4F6F8"/><stop offset=".65" stop-color="#AEB5BE"/><stop offset="1" stop-color="#6E757F"/></linearGradient>'
layers.append(f'<path d="{mpath(gld, 1.2, 30)}" fill="#D9A92E" stroke="#9C7417" stroke-width="1.5"/>')
# เส้นต่อชิ้นงานจากภาพแบบร่าง (blueprint) จัดตำแหน่งด้วยศูนย์กลางล้อ 2 ล้อ
BP = sys.argv[4] if len(sys.argv) > 4 else None
if BP:
    bp = cv2.imread(BP); g = cv2.cvtColor(bp, cv2.COLOR_BGR2GRAY)
    circ_ = cv2.HoughCircles(cv2.GaussianBlur(g[20:630, 250:1380], (0, 0), 2), cv2.HOUGH_GRADIENT, 1.5, 300, param1=120, param2=60, minRadius=140, maxRadius=170)
    cc = sorted([(c[0] + 250, c[1] + 20) for c in circ_[0] if c[2] > 150][:2])
    Mbp, _ = cv2.estimateAffinePartial2D(np.float32(cc), np.float32([WH["rear"][0], WH["front"][0]]))
    bgm_ = cv2.medianBlur(g, 21); ln = ((g.astype(int) - bgm_.astype(int)) > 26).astype(np.uint8)
    ln[612:, :] = 0; ln[:, :255] = 0; ln[:, 1380:] = 0; ln[:120, :] = 0
    for (a_, b_, c_, d_) in [(440, 205, 610, 270), (935, 298, 1025, 326), (880, 378, 950, 404), (815, 456, 895, 482)]:
        ln[b_:d_, a_:c_] = 0                      # ตัดตัวอักษรแบรนด์/รุ่น
    hl = cv2.morphologyEx(ln, cv2.MORPH_OPEN, np.ones((1, 160), np.uint8)); ln[hl == 1] = 0   # เส้นไกด์แนวนอน
    W_ = cv2.warpAffine(ln * 255, Mbp, (w, h), flags=cv2.INTER_LINEAR) > 110
    W_ = W_.astype(np.uint8)
    fork = np.zeros((h, w), np.uint8); cv2.fillPoly(fork, [np.array([(1185, 560), (1250, 545), (1300, 790), (1250, 805)])], 1)
    for (cx_, cy_), r_ in WH.values():
        W_[(np.hypot(XX - cx_, YY - cy_) < TIRE + 6) & (fork == 0)] = 0
    W_[bask == 1] &= 0
    inner = cv2.erode(cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)), np.ones((9, 9), np.uint8))
    W_[inner == 0] = 0; W_[cv2.dilate(seat, np.ones((9, 9), np.uint8)) == 1] = 0
    from skimage.morphology import skeletonize
    sk = skeletonize(W_ > 0).astype(np.uint8)
    n_, lab_, st_, _ = cv2.connectedComponentsWithStats(sk, connectivity=8)
    keep_ = np.zeros_like(sk)
    for i in range(1, n_):
        if st_[i, cv2.CC_STAT_AREA] >= 45: keep_[lab_ == i] = 1
    cs_, _ = cv2.findContours(keep_, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    dl = ""
    for c in cs_:
        ap = cv2.approxPolyDP(c, 1.0, False).reshape(-1, 2)
        if len(ap) >= 2: dl += "M" + " L".join(f"{x},{y}" for x, y in ap)
    layers.append(f'<path d="{dl}" fill="none" stroke="#F3F5F8" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity=".45" transform="translate(1.2,1.5)"/>')
    layers.append(f'<path d="{dl}" fill="none" stroke="#25272C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" opacity=".62"/>')
# ---------- ชิ้นส่วนวาดใหม่ทีละชิ้น (ตำแหน่งวัดจากภาพ) ----------
P = []
# คอท่อโครเมียม (จากเครื่องไปปลายท่อ)
P.append('<path d="M902,772 C912,826 892,846 846,848 L636,830" fill="none" stroke="#6E757F" stroke-width="20" stroke-linecap="round"/><path d="M902,772 C912,826 892,846 846,848 L636,830" fill="none" stroke="url(#tChr)" stroke-width="15" stroke-linecap="round"/><path d="M898,780 C906,826 888,840 846,842 L640,825" fill="none" stroke="#FFFFFF" stroke-width="3" opacity=".7"/>')
# ฝาครอบคาร์บอน + ป้ายทอง (ไม่มีตัวอักษร)
P.append('<ellipse cx="818" cy="772" rx="54" ry="46" fill="#141518"/><ellipse cx="818" cy="772" rx="48" ry="40" fill="url(#tCarb)"/><ellipse cx="818" cy="772" rx="48" ry="40" fill="none" stroke="#4A4D55" stroke-width="2.5"/><path d="M780,752 C796,736 834,734 852,748" stroke="#FFFFFF" stroke-width="2.5" fill="none" opacity=".3"/>')
P.append('<rect x="790" y="778" width="56" height="14" rx="7" fill="#141518" stroke="#D9A92E" stroke-width="2"/><rect x="798" y="782" width="40" height="6" rx="3" fill="#D9A92E"/>')
P.append("".join(f'<circle cx="{818+np.cos(a)*51:.1f}" cy="{772+np.sin(a)*43:.1f}" r="3.2" fill="#9AA1AA"/>' for a in np.linspace(0, 2*np.pi, 9)[:-1]))
# ไฟท้าย: เลนส์ใสเหลี่ยมเพชร + ไส้แดง
P.append('<path d="M180,384 L270,416 L284,460 L266,470 L226,454 Z" fill="#EEF1F4" stroke="#8C939C" stroke-width="2"/><path d="M196,396 L262,422 L272,456 L230,446 Z" fill="#E4572E" opacity=".35"/>' +
         "".join(f'<path d="M{186+i*12},{398+i*5} L{204+i*12},{446+i*2}" stroke="#AEB5BE" stroke-width="1.5" opacity=".9"/>' for i in range(7)) +
         '<path d="M190,398 L258,430" stroke="#FFFFFF" stroke-width="3" opacity=".9"/><path d="M226,458 L268,470" stroke="#5E6670" stroke-width="2"/>')
# ไฟหน้า/หน้ากากบน + แฮนด์ + ปลายแฮนด์น้ำเงิน + สวิตช์ + มือเบรก
P.append('<path d="M1006,240 L1030,200 L1092,196 L1126,214 L1142,262 L1122,316 L1038,322 L1014,286 Z" fill="#1C1D21" stroke="#2E3036" stroke-width="2" stroke-linejoin="round"/><path d="M1030,206 L1124,220 L1134,250" stroke="#4A4D55" stroke-width="3" fill="none"/>'
         '<path d="M1030,204 C1062,196 1100,200 1120,218" stroke="#5A5D66" stroke-width="4" fill="none"/><path d="M1040,214 L1090,212 L1112,226 L1052,232 Z" fill="#2C2E33"/><rect x="1056" y="214" width="34" height="10" rx="3" fill="#8FD0FF" opacity=".7"/>'
         '<path d="M1100,248 L1138,266 L1124,310 L1106,300 Z" fill="url(#tLens)" stroke="#8C939C" stroke-width="2" stroke-linejoin="round"/><path d="M1108,258 L1130,270" stroke="#FFFFFF" stroke-width="3" opacity=".9"/>')
P.append('<path d="M1012,262 L962,272 L960,290 L1014,282 Z" fill="#1F2024"/><rect x="918" y="270" width="48" height="34" rx="10" fill="#26272C" transform="rotate(-14 942 287)"/>' + "".join(f'<line x1="{924+i*7}" y1="{276-i*1.7:.1f}" x2="{926+i*7}" y2="{298-i*1.7:.1f}" stroke="#3A3C42" stroke-width="2"/>' for i in range(5)) +
         '<rect x="958" y="268" width="22" height="22" rx="5" fill="#2F3136"/><circle cx="966" cy="276" r="3.5" fill="#E9B93A"/><circle cx="974" cy="284" r="3" fill="#9AA1AA"/>'
         '<circle cx="1004" cy="236" r="11" fill="#2A7BE4" stroke="#123A8C" stroke-width="2"/><circle cx="1000" cy="232" r="3.5" fill="#BFE6FF"/>'
         '<path d="M1016,268 L1040,312 L1032,316 L1008,272 Z" fill="#9AA1AA"/>')
# พวงกุญแจ
P.append('<circle cx="1036" cy="400" r="9" fill="#26272C"/><circle cx="1036" cy="400" r="3.5" fill="#C9CED5"/><circle cx="1036" cy="420" r="9" fill="none" stroke="#C9CED5" stroke-width="2.5"/><path d="M1036,429 L1030,452 L1042,452 Z" fill="#D9DEE4"/><circle cx="1031" cy="464" r="6" fill="none" stroke="#C9CED5" stroke-width="2"/>')
# ไฟเลี้ยวหน้า
P.append('<path d="M1122,440 L1186,470 L1180,492 L1132,476 Z" fill="#EEF1F4" stroke="#8C939C" stroke-width="2"/><path d="M1132,448 L1178,470 L1174,484 L1138,472 Z" fill="#F2C14E" opacity=".5"/><path d="M1128,444 L1182,470" stroke="#FFFFFF" stroke-width="2.5"/>')
# น็อตสีน้ำเงินตามตัวถัง (ตำแหน่งในภาพ)
for (bx, by) in [(1010, 592), (884, 702), (1060, 752), (1192, 640), (556, 520)]:
    P.append(f'<circle cx="{bx}" cy="{by}" r="6.5" fill="#123A8C"/><circle cx="{bx}" cy="{by}" r="5" fill="#2A7BE4"/><circle cx="{bx-1.6}" cy="{by-1.6}" r="1.8" fill="#BFE6FF"/>')
layers += P
defs_extra += '<pattern id="tCarb" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="#24252A"/><rect width="4.5" height="4.5" fill="#363840"/><rect x="4.5" y="4.5" width="4.5" height="4.5" fill="#363840"/></pattern>'
defs_extra += '<linearGradient id="tLens" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#DCE8F2"/><stop offset="1" stop-color="#9FB3C6"/></linearGradient>'
# เส้นขอบตัวรถ (outline การ์ตูน)
fgo = fg.copy(); cv2.line(fgo, (232, 704), (636, 816), 1, 48)
fgo = cv2.morphologyEx(fgo, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
cs, _ = cv2.findContours(fgo, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
outline = "".join(smooth_path(cv2.approxPolyDP(c, 1.6, True)) for c in cs if cv2.contourArea(c) > 20000)

# ---------- 4) ล้อวาดใหม่ด้วยโค้ด ----------
def wheel(cx, cy, front):
    s = f'<circle cx="{cx}" cy="{cy}" r="{TIRE}" fill="#18191C"/>'
    for i in range(60):
        a = np.deg2rad(i * 6)
        s += f'<line x1="{cx+np.cos(a)*(TIRE-2):.1f}" y1="{cy+np.sin(a)*(TIRE-2):.1f}" x2="{cx+np.cos(a)*(TIRE-10):.1f}" y2="{cy+np.sin(a)*(TIRE-10):.1f}" stroke="#2E3035" stroke-width="5"/>'
    s += f'<circle cx="{cx}" cy="{cy}" r="{TIRE-17}" fill="none" stroke="#26282D" stroke-width="2"/>'
    s += f'<path d="M{cx-TIRE*0.68:.1f},{cy-TIRE*0.68:.1f} A{TIRE-5},{TIRE-5} 0 0 1 {cx+TIRE*0.25:.1f},{cy-TIRE*0.96:.1f}" stroke="#4B4E56" stroke-width="3" fill="none"/>'
    s += f'<circle cx="{cx}" cy="{cy}" r="{RIM_IN-1}" fill="#3A3D44" opacity=".35"/>'
    s += f'<circle cx="{cx}" cy="{cy}" r="{(RIM_OUT+RIM_IN)/2:.1f}" fill="none" stroke="#9C7417" stroke-width="{RIM_OUT-RIM_IN+3}"/><circle cx="{cx}" cy="{cy}" r="{(RIM_OUT+RIM_IN)/2:.1f}" fill="none" stroke="#D9A92E" stroke-width="{RIM_OUT-RIM_IN-1}"/>'
    s += f'<circle cx="{cx}" cy="{cy}" r="{(RIM_OUT+RIM_IN)/2:.1f}" fill="none" stroke="#B98B1E" stroke-width="2.2"/>'
    s += f'<circle cx="{cx}" cy="{cy}" r="{RIM_IN}" fill="none" stroke="#F3D06A" stroke-width="2"/>'
    s += f'<path d="M{cx-RIM_OUT*0.8:.1f},{cy-RIM_OUT*0.55:.1f} A{RIM_OUT-2},{RIM_OUT-2} 0 0 1 {cx+RIM_OUT*0.35:.1f},{cy-RIM_OUT*0.93:.1f}" stroke="#FFF2BF" stroke-width="3" fill="none" opacity=".85"/>'
    hub = 22 if front else 30
    for i in range(36):
        a = np.deg2rad(i * 10 + 3); off = (0.45 if i % 2 else -0.45)
        hx, hy = cx + np.cos(a + off) * hub, cy + np.sin(a + off) * hub
        rx, ry = cx + np.cos(a) * (RIM_IN - 1), cy + np.sin(a) * (RIM_IN - 1)
        s += f'<line x1="{hx:.1f}" y1="{hy:.1f}" x2="{rx:.1f}" y2="{ry:.1f}" stroke="{"#D7DCE2" if i % 2 else "#9EA5AE"}" stroke-width="1.9"/><circle cx="{rx:.1f}" cy="{ry:.1f}" r="2.2" fill="#C9CED5"/>'
    s += f'<circle cx="{cx}" cy="{cy}" r="{hub+6}" fill="#9AA1AA"/><circle cx="{cx}" cy="{cy}" r="{hub-6}" fill="#D9DEE4"/>'
    return s
wheels = "".join(wheel(round(c[0], 1), round(c[1], 1), k == "front") for k, (c, r) in WH.items())
fx, fy = 1281.6, 783.3
disc = ""
pts = []
for i in range(37):
    a = np.deg2rad(i * 10); r = 60 - (3.5 if i % 2 else 0); pts.append(f"{fx+np.cos(a)*r:.1f},{fy+np.sin(a)*r:.1f}")
disc += f'<polygon points="{" ".join(pts)}" fill="url(#tDisc)" stroke="#7F8792" stroke-width="1.5"/><circle cx="{fx}" cy="{fy}" r="47" fill="none" stroke="#B9BFC7" stroke-width="2"/>'
for i in range(18):
    a = np.deg2rad(i * 20 + 10); r = 50 if i % 2 else 43; disc += f'<circle cx="{fx+np.cos(a)*r:.1f}" cy="{fy+np.sin(a)*r:.1f}" r="3" fill="#6E757F"/>'
disc += f'<circle cx="{fx}" cy="{fy}" r="31" fill="#8E959F"/>'
for i, c in enumerate(["#2A7BE4", "#9B59E0", "#E4572E", "#2A7BE4", "#D9A92E"]):
    a = np.deg2rad(i * 72 - 90); disc += f'<circle cx="{fx+np.cos(a)*24:.1f}" cy="{fy+np.sin(a)*24:.1f}" r="5" fill="{c}"/><circle cx="{fx+np.cos(a)*24-1.5:.1f}" cy="{fy+np.sin(a)*24-1.5:.1f}" r="1.8" fill="#fff" opacity=".8"/>'
disc += f'<path d="M{fx-70:.1f},{fy-52:.1f} C{fx-82:.1f},{fy-20:.1f} {fx-80:.1f},{fy+12:.1f} {fx-66:.1f},{fy+30:.1f} L{fx-48:.1f},{fy+22:.1f} C{fx-58:.1f},{fy+4:.1f} {fx-60:.1f},{fy-22:.1f} {fx-52:.1f},{fy-46:.1f} Z" fill="#D9A92E" stroke="#9C7417" stroke-width="2"/>'
disc += f'<circle cx="{fx-64:.1f}" cy="{fy-30:.1f}" r="4.5" fill="#2A7BE4"/><circle cx="{fx-60:.1f}" cy="{fy+12:.1f}" r="4.5" fill="#2A7BE4"/>'
disc += f'<line x1="1214" y1="612" x2="{fx-6:.1f}" y2="{fy-6:.1f}" stroke="url(#tChr)" stroke-width="34" stroke-linecap="round"/><line x1="1222" y1="640" x2="{fx-12:.1f}" y2="{fy-20:.1f}" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity=".6"/>'
disc += f'<circle cx="{fx}" cy="{fy}" r="13" fill="url(#tChr)" stroke="#5E6670" stroke-width="1.5"/><circle cx="{fx}" cy="{fy}" r="5" fill="#5E6670"/>'
wheels += disc
# บังโคลนหลังยาว (ดำ) ตามแนวในภาพ
wheels = '<path d="M338,474 L298,466 C238,512 168,574 108,630 L100,646 L132,650 C186,600 254,548 340,500 Z" fill="#1E1F23"/><path d="M300,476 C240,522 176,580 118,632" stroke="#4A4D55" stroke-width="3" fill="none"/>' + wheels

# ---------- 5) ฉากหลังลานจอดแบบเบลอ (วาดด้วยโค้ด) ----------
bg = f'<rect width="{w}" height="{h}" fill="#80868D"/>'
bg += f'<linearGradient id="bgw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5C6168"/><stop offset=".55" stop-color="#ABB1B7"/><stop offset="1" stop-color="#4A4E54"/></linearGradient><rect width="{w}" height="{int(h*0.67)}" fill="url(#bgw)"/>'
bg += '<g filter="url(#bb)">'
for i in range(9): bg += f'<rect x="{40+i*190}" y="0" width="{44 if i%2 else 58}" height="{int(h*0.67)}" fill="#596068"/><rect x="{48+i*190}" y="0" width="9" height="{int(h*0.67)}" fill="#8F959C" opacity=".6"/>'
for y in range(30, 300, 52): bg += f'<rect x="0" y="{y}" width="{w}" height="12" fill="#4D525A" opacity=".85"/>'
for i in range(14): bg += f'<line x1="{i*120}" y1="30" x2="{i*120+80}" y2="280" stroke="#4D525A" stroke-width="7"/>'
bg += f'<rect x="0" y="440" width="{w}" height="170" fill="#CBD5DD" opacity=".55"/><rect x="980" y="460" width="220" height="110" fill="#3C7FD0" opacity=".5"/><rect x="1420" y="440" width="150" height="160" fill="#2E6FC0" opacity=".55"/><rect x="180" y="490" width="300" height="70" fill="#E6E2D8" opacity=".5"/></g>'
bg += f'<linearGradient id="flr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E6369"/><stop offset="1" stop-color="#2B2E32"/></linearGradient><rect y="{int(h*0.67)}" width="{w}" height="{h-int(h*0.67)}" fill="url(#flr)"/>'
shadow = f'<ellipse cx="{w*0.53:.0f}" cy="965" rx="640" ry="26" fill="#000" opacity=".45" filter="url(#bs)"/>'
vig = f'<radialGradient id="vg" cx=".5" cy=".5" r=".65"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient><rect width="{w}" height="{h}" fill="url(#vg)"/>'
bike = wheels + "".join(layers) + f'<path d="{outline}" fill="none" stroke="#1A1B1F" stroke-width="2.4" stroke-linejoin="round" opacity=".75"/>'
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<defs>{defs_extra}<filter id="bb"><feGaussianBlur stdDeviation="7"/></filter><filter id="bs" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="10"/></filter><filter id="rf"><feGaussianBlur stdDeviation="4"/></filter></defs>
{bg}<g transform="translate(0,1960) scale(1,-1)" opacity=".14" filter="url(#rf)">{bike}</g>{shadow}<g id="bike">{bike}</g>{vig}</svg>'''
(OUT / "moto_traced.svg").write_text(svg)
(OUT / "bike_only.svg").write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><defs>{defs_extra}</defs>{bike}</svg>')
print("layers", len(layers), "bytes", len(svg))
