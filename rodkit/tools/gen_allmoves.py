"""สร้างตอนทดสอบท่าทางครบ 15 ท่า (ภูมิ ตัวเดียว) -> episodes/ALLMOVES.ep.json"""
import json, pathlib

S = 0.62
SC = S * 1.06  # สเกลจริงของภูมิ


def step(pairs):
    """คีย์แบบสลับค่าทันที (string/discrete): [(t, v), ...]"""
    out = []
    for i, (t, v) in enumerate(pairs):
        if i and t > 0:
            out.append([round(t - 0.001, 3), pairs[i - 1][1]])
        out.append([t, v])
    return out


def pose_track(seq):
    """seq = [(t, pose), ...] ท่าแขนต่อเนื่อง: ผสมจากท่าหนึ่งไปอีกท่า (ease inout) ระหว่างคีย์"""
    arms, arms2, mix = [], [], []
    for i in range(len(seq) - 1):
        t0, p0 = seq[i]
        t1, p1 = seq[i + 1]
        arms.append((t0, p0)); arms2.append((t0, p1))
        mix += [[t0, 0], [round(t1 - 0.002, 3), 1]]
    tl, pl = seq[-1]
    arms.append((tl, pl)); arms2.append((tl, pl)); mix.append([tl, 0])
    return {"arms": step(arms), "arms2": step(arms2), "armMix": mix}


def phum(**k):
    a = {"who": "phum", "s": S, "light": "litL", "x": 0, "y": 170, "view": "side", "dir": 1, "seed": 2}
    a.update(k)
    return a


def chip(t0, t1, text):
    return {"type": "chip", "t0": t0, "t1": t1, "x": 40, "y": 110, "icon": "clock", "text": text, "w": 80 + len(text) * 25}


shots = []
# 1) ตื่นนอน ลุกนั่ง บิดขี้เกียจ (ห้องนอน)
lie = dict(free=1, legNT=90, legNF=94, legFT=90, legFF=94)
a = phum(x=-190, y=-58, blanket=1, **lie,
         torsoRot=[[0, -90], [3.0, -90], [3.8, 6, "out"], [4.1, -2], [4.4, 3]],
         mood=step([(0, "sleep"), (2.35, "neutral"), (4.75, "yawn"), (6.4, "smile")]),
         zzz=[[0, 1], [1.7, 1], [2.1, 0]], blinkAt=[2.5, 2.75, 7.4],
         nod=[[1.9, 0], [2.05, 5], [2.2, -4], [2.35, 3], [2.5, 0]],
         tilt=[[0, 0], [4.7, 0], [5.1, -12], [6.2, -12], [6.6, 0]], life=0,
         **pose_track([(0, "rest"), (3.0, "rest"), (3.8, "idle"), (4.6, "idle"), (5.3, "stretch"), (6.2, "stretch"), (6.9, "idle")]))
shots.append({"name": "wake", "set": "bedroom", "dur": 8.0, "fadeIn": 0.5, "setOpts": {"alarm": [1.6, 3.1]},
              "cam": {"x": [[0, -330], [8, -280]], "y": [[0, -430], [8, -450]], "z": [[0, 1.12], [8, 1.22]]}, "dof": {"bg": 2, "fg": 0},
              "actors": [a], "ui": [chip(0.3, 7.9, "ท่า 8 · ตื่นนอน ลุกนั่ง บิดขี้เกียจ")]})
# 2) ยืนนิ่งแบบมีชีวิต
a = phum(view="front", mood="smile", look=[[0, 0], [0.7, -1], [1.5, -1], [2.1, 1], [2.9, 0]], tilt=[[0, 0], [0.7, -4], [1.5, -4], [2.1, 4], [2.9, 0]], blinkAt=[1.05, 2.55])
shots.append({"name": "idle", "dur": 3.2, "cam": {"x": 0, "y": [[0, -340], [3.2, -350]], "z": [[0, 1.2], [3.2, 1.28]]}, "dof": {"bg": 5, "fg": 0},
              "actors": [a], "ui": [chip(0.15, 3.1, "ท่า 9 · ยืนนิ่งแบบมีชีวิต")]})
# 3) พูดพร้อมทำมือ
a = phum(view="front", mood="smile", say=[[0.2, 1.4], [1.7, 3.6]], brow=[[0, 0], [0.3, 5], [1.4, 1], [1.8, 6], [3.6, 2]], nod=[[1.6, 0], [1.8, 4], [2.0, 0]],
         **pose_track([(0, "idle"), (0.25, "idle"), (0.7, "explain"), (1.4, "explain"), (1.9, "open2"), (2.8, "open2"), (3.2, "explain"), (3.8, "idle")]))
shots.append({"name": "talk", "dur": 4.0, "cam": {"x": 0, "y": -360, "z": [[0, 1.35], [4, 1.42]]}, "dof": {"bg": 6, "fg": 0},
              "actors": [a], "ui": [chip(0.15, 3.9, "ท่า 10 · พูดพร้อมทำมือ")],
              "subs": [{"t0": 0.2, "t1": 1.5, "text": "วันนี้|อากาศดีมาก", "hl": [1]}, {"t0": 1.7, "t1": 3.8, "text": "ออกไป|เดินเล่นกัน!", "hl": [1]}]})
# 4) ฟัง พยักหน้า หัวเราะ
a = phum(view="front", mood=step([(0, "smile")]), nod=[[0, 0], [0.25, 6], [0.5, 0], [0.75, 6], [1.0, 0]], laugh=[[0, 0], [1.3, 0], [1.5, 1], [3.0, 1], [3.3, 0.2]],
         **pose_track([(0, "idle"), (1.3, "idle"), (1.7, "belly"), (3.4, "belly")]))
shots.append({"name": "laugh", "dur": 3.4, "cam": {"x": 0, "y": -360, "z": 1.35}, "dof": {"bg": 6, "fg": 0},
              "actors": [a], "ui": [chip(0.15, 3.3, "ท่า 11 · ฟัง พยักหน้า หัวเราะ")]})
# 5) หมุนตัว -> เริ่มเดิน -> เดินข้าง -> หยุดเดิน
a = phum(view=step([(0, "front"), (0.45, "side")]), sx=[[0, 1], [0.25, 1], [0.45, 0.45], [0.7, 1]],
         x=[[0, -430], [0.75, -430], [1.75, -290, "in"], [4.4, 330, "linear"], [5.4, 460, "out"]],
         lean=[[0, 0], [0.8, 0], [1.1, -3], [1.6, 2], [4.4, 0], [4.85, 7], [5.35, -2], [5.8, 0]], mood="smile")
shots.append({"name": "walk", "dur": 6.0, "cam": {"x": [[0, -120], [6, 120]], "y": -280, "z": 0.95}, "dof": {"bg": 3, "fg": 0},
              "actors": [a], "ui": [chip(0.05, 0.85, "ท่า 4 · หมุนตัว"), chip(0.9, 1.85, "ท่า 6 · เริ่มเดินแบบมีน้ำหนัก"), chip(1.9, 4.4, "ท่า 1 · เดินด้านข้าง"), chip(4.45, 5.95, "ท่า 6 · หยุดเดิน (โน้มตัวแล้วตั้งหลัก)")]})
# 6) หมุนเข้าหากล้อง -> เดินเข้าหากล้อง
a = phum(view=step([(0, "side"), (0.4, "front")]), sx=[[0, 1], [0.2, 1], [0.4, 0.45], [0.65, 1]], x=460,
         y=[[0, 120], [0.7, 120], [3.5, 410, "linear"]], s=[[0, S], [0.7, S], [3.5, S * 1.32, "linear"]], mood="smile")
shots.append({"name": "toward", "dur": 3.6, "cam": {"x": 460, "y": [[0, -280], [3.6, -230]], "z": 1.0}, "dof": {"bg": 4, "fg": 0},
              "actors": [a], "ui": [chip(0.05, 3.5, "ท่า 4+2 · หมุนตัว แล้วเดินเข้าหากล้อง")]})
# 7) หันหลัง -> เดินออกจากกล้อง
a = phum(view=step([(0, "front"), (0.4, "back")]), sx=[[0, 1], [0.2, 1], [0.4, 0.45], [0.65, 1]], x=460,
         y=[[0, 410], [0.7, 410], [3.5, 120, "linear"]], s=[[0, S * 1.32], [0.7, S * 1.32], [3.5, S, "linear"]])
shots.append({"name": "away", "dur": 3.6, "cam": {"x": 460, "y": [[0, -230], [3.6, -280]], "z": 1.0}, "dof": {"bg": 4, "fg": 0},
              "actors": [a], "ui": [chip(0.05, 3.5, "ท่า 4+3 · หันหลัง เดินออกจากกล้อง")]})
# 8) วิ่ง
a = phum(run=1, x=[[0, -950], [2.8, 1350, "linear"]], mood="neutral", sweat=1, brow=4)
shots.append({"name": "run", "dur": 2.8, "cam": {"x": [[0, -520], [2.8, 950, "linear"]], "y": -280, "z": 0.9}, "dof": {"bg": 5, "fg": 0},
              "actors": [a], "ui": [chip(0.05, 2.7, "ท่า 5 · วิ่ง")]})
# 9) ตกใจ สะดุ้ง กระโดด
a = phum(free=1, mood=step([(0, "smile"), (0.6, "shock")]), brow=[[0, 0], [0.6, 0], [0.75, 12]],
         hipDrop=[[0, 0], [0.6, 0], [0.75, 30], [0.95, -95, "out"], [1.2, -95], [1.4, 0, "in"], [1.55, 28], [1.8, 0]],
         legNT=[[0, 3], [0.6, 3], [0.75, 20], [0.95, 30], [1.2, 30], [1.4, 4], [1.55, 22], [1.8, 3]], legNK=[[0, 0], [0.6, 0], [0.75, 40], [0.95, 64], [1.2, 64], [1.4, 4], [1.55, 44], [1.8, 0]],
         legFT=[[0, -3], [0.6, -3], [0.75, 14], [0.95, 22], [1.2, 22], [1.4, -2], [1.55, 16], [1.8, -3]], legFK=[[0, 0], [0.6, 0], [0.75, 40], [0.95, 72], [1.2, 72], [1.4, 4], [1.55, 40], [1.8, 0]],
         lean=[[0, 0], [0.6, 0], [0.8, -12], [1.8, -6], [2.4, -2]], exclaim=[[0, 0], [0.6, 0], [0.75, 1], [2.0, 1], [2.3, 0]],
         **pose_track([(0, "idle"), (0.6, "idle"), (0.82, "surprise"), (1.8, "surprise"), (2.4, "shrug")]))
shots.append({"name": "startle", "dur": 2.4, "cam": {"x": 0, "y": -320, "z": 1.05}, "dof": {"bg": 5, "fg": 0},
              "actors": [a], "ui": [chip(0.05, 2.35, "ท่า 12 · ตกใจ สะดุ้ง")]})
# 10) ลื่นเปลือกกล้วย ล้มก้นจ้ำเบ้า
a = phum(free=1, banana=[[0, 70], [0.5, 70], [0.85, 320, "out"]],
         legNT=[[0, 3], [0.5, 3], [0.75, 88]], legNK=0, legNF=[[0, 0], [0.5, 0], [0.75, 60]],
         legFT=[[0, -3], [0.5, -3], [0.7, 30], [0.9, 115]], legFK=[[0, 0], [0.5, 0], [0.7, 40], [0.9, 65]],
         hipDrop=[[0, 0], [0.5, 0], [0.62, -24], [0.88, 392, "in"], [0.98, 368, "out"], [1.08, 392]],
         torsoRot=[[0, 0], [0.5, 0], [0.7, 12], [0.88, -34], [1.02, -14], [1.25, -20]],
         mood=step([(0, "smile"), (0.55, "shock"), (0.95, "pain")]), dizzy=[[0, 0], [1.0, 0], [1.25, 1]],
         **pose_track([(0, "idle"), (0.5, "idle"), (0.68, "fall"), (1.15, "fall"), (1.5, "rubhead"), (3.4, "rubhead")]))
shots.append({"name": "fall", "dur": 3.4, "cam": {"x": 40, "y": -230, "z": 1.0}, "dof": {"bg": 5, "fg": 0},
              "actors": [a], "ui": [chip(0.05, 3.3, "ท่า 12 · ลื่นล้ม (มุกตลก)")]})
# 11) นั่งเก้าอี้ กิน ดื่ม เล่นมือถือ ลุก
seq = [(0, "idle"), (1.8, "idle"), (2.25, "scoop"), (2.6, "scoop"), (3.0, "mouth"), (3.4, "mouth"), (3.8, "scoop"), (4.1, "scoop"), (4.45, "mouth"), (4.55, "mouth"),
       (4.6, "hold"), (5.0, "hold"), (5.45, "sip"), (6.0, "sip"), (6.35, "hold"), (6.45, "hold"), (6.5, "phone"), (8.2, "phone"), (8.6, "idle"), (10, "idle")]
pt = pose_track(seq)
a = phum(chair=1, table=1, sitK=[[0, 0], [0.3, 0], [1.7, 1], [8.5, 1], [9.8, 0]],
         prop=step([(0, ""), (1.8, "spoon"), (4.58, "mug"), (6.48, "phone"), (8.4, "")]),
         chew=[[3.0, 3.6], [4.45, 4.6]], mood=step([(0, "smile"), (5.4, "happy"), (6.1, "smile")]),
         tilt=[[0, 0], [1.8, 0], [2.2, 10], [2.7, 0], [3.7, 10], [4.2, 0], [6.5, 0], [6.9, 14], [8.2, 14], [8.6, 0]], **pt)
shots.append({"name": "sit_eat", "dur": 10.0, "cam": {"x": [[0, 110], [10, 140]], "y": -300, "z": 1.05}, "dof": {"bg": 5, "fg": 0},
              "actors": [a], "ui": [chip(0.05, 1.75, "ท่า 7 · นั่งเก้าอี้"), chip(1.8, 4.5, "ท่า 15 · กินข้าว"), chip(4.6, 6.4, "ท่า 15 · ดื่ม"), chip(6.5, 8.35, "ท่า 15 · เล่นมือถือ"), chip(8.4, 9.95, "ท่า 7 · ลุกขึ้นยืน")]})
# 12) ยื่นของ
a = phum(view="front", prop=step([(0, "mug")]), mood="smile", say=[[1.0, 2.2]], **pose_track([(0, "idle"), (0.3, "idle"), (0.95, "offer"), (2.8, "offer")]))
shots.append({"name": "give", "dur": 2.8, "cam": {"x": 0, "y": -360, "z": 1.3}, "dof": {"bg": 6, "fg": 0},
              "actors": [a], "ui": [chip(0.05, 2.75, "ท่า 13 · ยื่นของให้")], "subs": [{"t0": 1.0, "t1": 2.7, "text": "กาแฟ|ไหมครับ", "hl": [0]}]})
# 13) กอด
a = phum(view="front", mood=step([(0, "smile"), (1.1, "happy")]), hearts=[[0, 0], [1.3, 0], [1.6, 1]], tilt=[[0, 0], [1.3, 0], [1.8, -5], [2.6, 5], [3.2, 0]],
         **pose_track([(0, "idle"), (0.2, "idle"), (0.8, "hugopen"), (1.1, "hugopen"), (1.6, "hug"), (3.2, "hug")]))
shots.append({"name": "hug", "dur": 3.2, "fadeOut": 0.6, "cam": {"x": 0, "y": -360, "z": [[0, 1.3], [3.2, 1.4]]}, "dof": {"bg": 6, "fg": 0},
              "actors": [a], "ui": [chip(0.05, 3.1, "ท่า 14 · กอด")], "subs": [{"t0": 1.2, "t1": 3.0, "text": "ส่งกอด|ให้ทุกคน", "hl": [1]}]})

for s in shots:
    s.setdefault("shake", 0)
ep = {"id": "ALLMOVES", "engine": "flat", "set": "kitchen", "fps": 30, "setOpts": {"islandX": -2800}, "shots": shots}
pathlib.Path(__file__).resolve().parent.parent.joinpath("episodes/ALLMOVES.ep.json").write_text(json.dumps(ep, ensure_ascii=False))
print("dur", round(sum(s["dur"] for s in shots), 2))
