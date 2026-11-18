"""Hand-authored flat-cartoon motorcycle (style A), photo coordinates 1570x1043.
Usage: python3 tools/moto_vec.py out.svg [photo_for_overlay] [overlay_opacity]
"""
import sys, base64

OUT = '#23252B'   # outline colour shared with the cast style
W_OUT = 4

PAL = {
  'silver': ('#D3DAE2', '#AAB4BF', '#7D8794'),   # light, base, shadow
  'black':  ('#4A4D55', '#2E3036', '#1A1B1F'),
  'seat':   ('#4B4E57', '#2C2E34', '#17181C'),
  'dsilver':('#B9C1CB', '#8E98A4', '#666F7B'),
  'lens':   ('#FFFFFF', '#EEF1F4', '#C5CCD4'),
  'red':    ('#FF7A6E', '#E2463B', '#A92A22'),
  'amber':  ('#FFD58A', '#F3A93B', '#C77B18'),
}

def smooth(pts, closed=True, t=0.5):
    """Catmull-Rom -> cubic bezier. A point (x,y,1) is a sharp corner."""
    n = len(pts)
    P = [(p[0], p[1]) for p in pts]
    sharp = [len(p) > 2 and p[2] for p in pts]
    d = 'M%.1f,%.1f' % P[0]
    rng = range(n) if closed else range(n - 1)
    for i in rng:
        p0, p1, p2, p3 = P[i - 1], P[i], P[(i + 1) % n], P[(i + 2) % n]
        if not closed:
            p0 = P[max(i - 1, 0)]; p3 = P[min(i + 2, n - 1)]
        k1 = 0 if sharp[i] else t / 3
        k2 = 0 if sharp[(i + 1) % n] else t / 3
        c1 = (p1[0] + (p2[0] - p0[0]) * k1, p1[1] + (p2[1] - p0[1]) * k1)
        c2 = (p2[0] - (p3[0] - p1[0]) * k2, p2[1] - (p3[1] - p1[1]) * k2)
        d += ' C%.1f,%.1f %.1f,%.1f %.1f,%.1f' % (c1 + c2 + p2)
    return d + (' Z' if closed else '')

DEFS = []
BODY = []
_id = [0]

def nid(p):
    _id[0] += 1
    return '%s%d' % (p, _id[0])

def part(pts, pal, rim=(0, 7), shade=(0, -14), extra='', outline=True, sw=W_OUT):
    """Cel-shaded part: light rim on top edge, shadow band on bottom edge."""
    L, B, S = PAL[pal]
    d = smooth(pts)
    c0, c1, c2 = nid('c'), nid('c'), nid('c')
    DEFS.append('<clipPath id="%s"><path d="%s"/></clipPath>' % (c0, d))
    DEFS.append('<clipPath id="%s"><path d="%s" transform="translate(%g,%g)"/></clipPath>' % (c1, d, *rim))
    DEFS.append('<clipPath id="%s"><path d="%s" transform="translate(%g,%g)"/></clipPath>' % (c2, d, *shade))
    s = ('<g clip-path="url(#%s)"><path d="%s" fill="%s"/>'
         '<g clip-path="url(#%s)"><rect x="0" y="0" width="1570" height="1043" fill="%s"/>'
         '<g clip-path="url(#%s)"><rect x="0" y="0" width="1570" height="1043" fill="%s"/></g></g>%s</g>'
         % (c0, d, L, c1, S, c2, B, extra))
    if outline:
        s += '<path d="%s" fill="none" stroke="%s" stroke-width="%g" stroke-linejoin="round"/>' % (d, OUT, sw)
    BODY.append(s)
    return d

def line(pts, col=OUT, w=2.5, closed=False, op=1, hi=None):
    """Panel seam: dark groove plus optional light lip offset below it."""
    d = smooth(pts, closed=closed)
    if hi:
        BODY.append('<path d="%s" fill="none" stroke="%s" stroke-width="%g" transform="translate(%g,%g)" stroke-linecap="round" opacity="%g"/>'
                    % (d, hi[0], w, hi[1], hi[2], op))
    BODY.append('<path d="%s" fill="none" stroke="%s" stroke-width="%g" stroke-linecap="round" stroke-linejoin="round" opacity="%g"/>' % (d, col, w, op))

def poly(pts, fill, op=1, stroke=None, sw=0):
    d = smooth(pts)
    st = ' stroke="%s" stroke-width="%g" stroke-linejoin="round"' % (stroke, sw) if stroke else ''
    BODY.append('<path d="%s" fill="%s" opacity="%g"%s/>' % (d, fill, op, st))

SEAM = ('#E9EEF3', 0, 2.5)

def build():
    # ---- ghost wheels (stage 1 placeholders; real wheels come in stage 3)
    for cx, cy in ((385, 759), (1282, 783)):
        BODY.append('<circle cx="%d" cy="%d" r="190" fill="none" stroke="#C9CED6" stroke-width="3" stroke-dasharray="10 9"/>' % (cx, cy))
        BODY.append('<circle cx="%d" cy="%d" r="158" fill="none" stroke="#D5D9E0" stroke-width="2" stroke-dasharray="6 8"/>' % (cx, cy))

    # ---- rear mudflap (black, behind body)
    part([(262, 466), (298, 496, 1), (215, 585), (150, 648), (108, 660, 1), (98, 632), (170, 556), (232, 484)],
         'black', rim=(3, 5), shade=(-5, -8))

    # ---- rear side cover / tail body (silver)
    side = [(176, 368, 1), (300, 382), (420, 436), (560, 470), (680, 490), (792, 498, 1),
            (800, 530), (794, 590), (798, 650), (800, 700), (790, 736, 1), (700, 728), (610, 676),
            (520, 604), (430, 556), (340, 524), (262, 474), (210, 444)]
    part(side, 'silver', rim=(0, 8), shade=(0, -26))
    # cel shadow wedge under the seat line
    poly([(300, 395), (560, 482), (700, 505), (790, 512), (770, 540), (640, 525), (430, 470), (280, 420)], '#97A1AD', op=.55)
    # side-cover seams + vents
    line([(250, 446), (360, 480), (470, 530), (580, 600), (680, 680), (760, 712)], hi=SEAM)
    line([(612, 530), (700, 548), (770, 548)], hi=SEAM)
    # gold/black pinstripe decal
    line([(258, 432), (380, 470), (500, 520), (620, 572), (720, 600)], col='#E3B23C', w=6)
    line([(262, 444), (384, 482), (504, 532), (622, 584), (716, 612)], col=OUT, w=3)
    line([(500, 560), (620, 612), (700, 640)], col='#5C6570', w=8, op=.8)
    for i in range(7):
        x = 520 + i * 22; y = 572 + i * 9
        BODY.append('<circle cx="%d" cy="%d" r="3" fill="#3B3F47"/>' % (x, y))

    # ---- tail cowl spike + tail light
    part([(212, 332, 1), (240, 328), (302, 368), (300, 384, 1), (230, 378), (186, 370, 1)], 'dsilver', rim=(0, 5), shade=(0, -7), sw=3.5)
    part([(176, 372, 1), (248, 384), (268, 438, 1), (244, 456), (210, 434), (186, 404)], 'lens', rim=(2, 3), shade=(-3, -6), sw=3.5)
    for k in range(4):
        y = 392 + k * 13
        line([(194 + k * 4, y), (244 + k * 3, y + 6)], col='#E2463B', w=5)
    poly([(200, 384), (236, 390), (232, 398), (204, 393)], '#FFFFFF', op=.9)

    # ---- seat (black, sits on side cover)
    seat = [(282, 360, 1), (360, 362), (450, 372), (560, 392), (660, 404), (745, 418), (790, 440),
            (800, 470), (790, 498, 1), (700, 496), (610, 484), (520, 462), (420, 432), (330, 396)]
    part(seat, 'seat', rim=(0, 9), shade=(0, -18))
    line([(300, 382), (420, 412), (560, 446), (690, 470), (782, 478)], col='#4E525B', w=3)   # piping seam
    for a, b in (((380, 372), (430, 380)), ((520, 392), (590, 404)), ((660, 412), (720, 424))):
        line([a, b], col='#6E737D', w=4, op=.9)               # glint
    line([(746, 432), (772, 448)], col='#80858F', w=5)

    # ---- step-through floor (black)
    part([(782, 590, 1), (820, 600), (870, 600), (938, 574, 1), (946, 606), (900, 630), (840, 644), (796, 646, 1)],
         'black', rim=(0, 5), shade=(0, -10))
    line([(800, 606), (860, 612), (930, 590)], col='#5A5E67', w=3)

    # ---- centre frame cover (silver, the panel under the floor)
    centre = [(796, 640, 1), (880, 630), (944, 600, 1), (968, 660), (1010, 760), (1040, 836, 1),
              (990, 838), (930, 800), (860, 760), (796, 736, 1)]
    part(centre, 'silver', rim=(0, 7), shade=(-8, -18))
    # grille / vent on centre cover
    vent = [(905, 640), (946, 630), (986, 690), (972, 720), (932, 706)]
    part(vent, 'black', rim=(0, 3), shade=(0, -4), sw=3)
    for k in range(6):
        line([(912 + k * 6, 648 + k * 11), (948 + k * 6, 640 + k * 11)], col='#7D8794', w=2.5)
    line([(860, 610), (920, 700), (980, 790)], hi=SEAM)

    # ---- inner shield face (rear side of the leg shield, lighter silver)
    part([(958, 380), (1046, 352), (1040, 420), (1010, 480), (972, 540), (938, 590, 1), (930, 560),
          (948, 500), (952, 440)], 'dsilver', rim=(4, 4), shade=(-6, -10))
    # ---- front neck (black steering cover)
    part([(958, 314, 1), (1046, 326), (1050, 360), (1030, 404), (996, 430), (962, 432, 1), (952, 380)],
         'black', rim=(3, 5), shade=(-6, -10))
    BODY.append('<circle cx="1010" cy="470" r="9" fill="#2E3036" stroke="%s" stroke-width="2.5"/>' % OUT)
    # ---- front leg shield (silver)
    shield = [(1050, 356, 1), (1086, 402), (1124, 438), (1170, 462), (1216, 478), (1258, 498, 1),
              (1236, 520), (1192, 520), (1152, 534), (1124, 574), (1104, 646), (1090, 724), (1070, 800),
              (1046, 852, 1), (1018, 820), (992, 760), (966, 690), (942, 620), (950, 566), (982, 508),
              (1012, 456), (1034, 404)]
    part(shield, 'silver', rim=(5, 6), shade=(-10, -22))
    poly([(1030, 430), (1060, 470), (1080, 560), (1078, 680), (1060, 790), (1046, 820), (1030, 760),
          (1040, 640), (1046, 540)], '#C3CBD4', op=.8)           # vertical sheen
    line([(1044, 400), (1074, 470), (1090, 560), (1086, 680), (1066, 800)], hi=SEAM)
    line([(1100, 440), (1150, 486), (1200, 500)], hi=SEAM)
    # turn-signal pocket (lens itself lands in stage 3)
    part([(1112, 448, 1), (1176, 470), (1188, 496, 1), (1150, 494), (1118, 470)], 'amber', rim=(0, 3), shade=(0, -5), sw=3)

    # ---- head (handlebar cover) + front cowl
    head = [(958, 252, 1), (1000, 214), (1032, 194, 1), (1092, 196), (1126, 214), (1142, 262), (1122, 316, 1),
            (1060, 330), (1000, 326), (962, 304)]
    part(head, 'black', rim=(0, 7), shade=(0, -12))
    part([(1100, 230, 1), (1132, 222), (1146, 262), (1128, 314, 1), (1104, 300), (1098, 262)], 'lens', rim=(0, 4), shade=(-4, -10), sw=3)
    poly([(1112, 236), (1130, 232), (1138, 258), (1120, 252)], '#FFFFFF')
    line([(1104, 280), (1132, 292)], col='#9AA3AE', w=2.5)
    line([(1000, 230), (1060, 222), (1110, 234)], col='#5A5E67', w=3)
    # meter window
    part([(1040, 212, 1), (1088, 208), (1100, 226, 1), (1050, 232)], 'lens', rim=(0, 2), shade=(0, -3), sw=2.5)
    # handlebar grip, lever and blue bar-end
    part([(918, 286, 1), (968, 276), (976, 302, 1), (926, 314)], 'black', rim=(0, 4), shade=(0, -6), sw=3)
    for k in range(5):
        line([(928 + k * 9, 286 - k * 2), (932 + k * 9, 308 - k * 2)], col='#4A4D55', w=2)
    line([(956, 300), (1000, 318), (1030, 316)], col='#8E98A4', w=5)
    BODY.append('<ellipse cx="992" cy="236" rx="14" ry="17" fill="#2F7DE0" stroke="%s" stroke-width="3"/>'
                '<ellipse cx="988" cy="230" rx="5" ry="6" fill="#9CCBFF"/>' % OUT)

    # ---- front fender (silver arch over the front wheel)
    part([(1176, 610), (1222, 580), (1290, 572), (1356, 584), (1406, 604, 1), (1398, 616, 1), (1340, 604),
          (1270, 600), (1214, 618), (1186, 640, 1)], 'silver', rim=(0, 5), shade=(0, -8))

def render(out, photo=None, op=0.35):
    build()
    bg = ''
    if photo:
        b64 = base64.b64encode(open(photo, 'rb').read()).decode()
        bg = '<image href="data:image/jpeg;base64,%s" width="1570" height="1043" opacity="%g"/>' % (b64, op)
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1570 1043" width="1570" height="1043">'
           '<defs>%s</defs><rect width="1570" height="1043" fill="#F4F6F9"/>%s'
           '<ellipse cx="830" cy="962" rx="640" ry="22" fill="#000" opacity=".12"/>%s</svg>'
           % (''.join(DEFS), bg, ''.join(BODY)))
    open(out, 'w').write(svg)

if __name__ == '__main__':
    render(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None, float(sys.argv[3]) if len(sys.argv) > 3 else .35)
