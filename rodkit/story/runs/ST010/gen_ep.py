# ST010 EP.6 "บ้านของภูมิ" — เข้าบ้านแฟนครั้งแรก ความต่าง + ขอบเขตกับครอบครัวอีกฝ่าย (ฉากใหม่ isan, ตัวละครใหม่ แม่นวล)
import sys; sys.path.insert(0,"/home/claude/recover/shorts-factory/rodkit/story/runs"); from fah_common import *
sh=[]; S=lambda **k: sh.append(k)
MATO=dict(mat=True)
MX=dict(pmom=-380,phum=-60,fah=280)
S(name="s01_arrive",set="isan",cam=dict(x=[[0,-260],[4,-120]],y=[[0,-800],[4,-620]],z=[[0,1.0],[4,1.15]]),
  actors=[FAH(x=-300,view="side",dir=1,mood="smile"),PHUM(x=-60,view="side",dir=1,mood="happy")],sfx=[SFX("chime",0.2,0.3)],
  say=[N("สงกรานต์ปีนี้ ภูมิพาฟ้ากลับบ้านที่ขอนแก่น"),N("ครั้งแรกที่ฟ้าจะได้เจอแม่ของเขา")])
S(name="s02_greet",set="isan",cam=dict(x=0,y=-470,z=1.35),
  actors=[PMOM(x=-230),FAH(x=200,mood="worried",arms="wai",tilt=6)],
  say=[F("สวัสดีค่ะคุณแม่"),N("แม่นวลรับไหว้ แต่ไม่ยิ้ม")])
S(name="s03_title",set="isan",cam=dict(x=0,y=-900,z=[[0,0.85],[3,0.92]]),
  actors=[PMOM(x=-230),FAH(x=200,mood="worried")],ui=[dict(type="title",t0=0.2,t1=99,y=420,text="บ้าน ของภูมิ",size=110)],
  say=[N("เข้าบ้านแฟนครั้งแรก ควรทำตัวยังไง")])
S(name="s04_dinner",set="isan",setOpts=MATO,cut="whip",cam=dict(x=-40,y=-400,z=1.2),
  actors=[MAT("pmom",-380),MAT("phum",-60,mood="smile"),MAT("fah",280,mood="worried")],
  say=[N("มื้อแรก มีส้มตำปลาร้ากับแจ่วบอง"),N("ฟ้ากินปลาร้าไม่เป็น"),N("แต่ฝืนกินจนน้ำตาซึม")])
S(name="s05_force",set="isan",setOpts=MATO,cam=dict(x=280,y=-420,z=2.3),dof=dict(bg=5),
  actors=[MAT("fah",280,mood="pain")],ui=[TIP(False,"ฝืนจนไม่ใช่ตัวเอง")],
  say=[N("การฝืนตัวเองจนทรมาน"),N("ไม่ได้ทำให้ใครรักเรามากขึ้น")])
S(name="s06_team",set="isan",setOpts=MATO,cam=dict(x=-60,y=-420,z=2.3),dof=dict(bg=5),
  actors=[MAT("phum",-60,mood="smile")],ui=[TIP(True,"เป็นทีมเดียวกัน")],
  say=[P("แม่ครับ ฟ้ากินปลาร้าไม่ได้"),P("ผมเจียวไข่ให้ฟ้าเองนะครับ")])
S(name="s07_mom_nod",set="isan",setOpts=MATO,cam=dict(x=-380,y=-420,z=2.3),dof=dict(bg=5),
  actors=[MAT("pmom",-380)],
  say=[N("แม่นวลพยักหน้า แต่ยังไม่พูดอะไร")])
S(name="s08_vent",set="isan",setOpts=dict(eve=True),cut="whip",cam=dict(x=0,y=-470,z=1.4),
  actors=[FAH(x=-200,view="side",dir=1,mood="worried"),PHUM(x=200,view="side",dir=-1,mood="flat")],ui=[TIP(False,"ให้แฟนเลือกข้าง")],
  say=[F("แม่ไม่ชอบฟ้าใช่ไหม"),P("แม่แค่ยังไม่รู้จักฟ้า"),N("ฟ้าอยากระบาย"),N("แต่ไม่บังคับให้ภูมิเลือกข้าง")])
S(name="s09_no_post",set="isan",setOpts=dict(eve=True),cam=dict(x=-200,y=-470,z=2.3),dof=dict(bg=5),
  actors=[FAH(x=-200,mood="flat",**PHONE)],ui=[TIP(False,"บ่นแม่แฟนลงโซเชียล")],
  say=[N("และไม่โพสต์บ่นลงโซเชียล"),N("ว่าแม่แฟนใจร้าย")])
S(name="s10_ask",set="isan",setOpts=dict(dawn=True,steam=True,steamX=0),cut="whip",cam=dict(x=0,y=-470,z=1.2),
  actors=[PMOM(x=-280,view="side",dir=1),FAH(x=280,view="side",dir=-1,mood="smile")],ui=[TIP(True,"ถามและเรียนรู้")],
  say=[N("ตีห้าวันรุ่งขึ้น ฟ้าตื่นมาหาแม่ที่หน้าเตา"),F("คุณแม่คะ สอนฟ้านึ่งข้าวเหนียวได้ไหมคะ")])
S(name="s11_learn",set="isan",setOpts=dict(dawn=True,steam=True,steamX=0),cam=dict(x=0,y=-430,z=1.55),dof=dict(bg=3),
  actors=[PMOM(x=-230,view="side",dir=1,arms="point"),FAH(x=230,view="side",dir=-1,mood="worried",arms="give")],sfx=[SFX("whoosh",0.6,0.2)],
  say=[N("แม่นวลสอนให้แช่ข้าว ล้างข้าว พลิกหวด"),N("มือฟ้าโดนไอน้ำลวกจนแดง"),N("แต่ไม่บ่นสักคำ")])
S(name="s12_story",set="isan",setOpts=dict(dawn=True,steam=True,steamX=0),cam=dict(x=-260,y=-470,z=2.3),dof=dict(bg=5),
  actors=[PMOM(x=-260,mood="worried")],
  say=[N("แล้วแม่ก็เล่า"),N("ตอนเลิกกับฟ้า"),N("ภูมิกลับมานอนเงียบอยู่ที่บ้านนี้เป็นเดือน")])
S(name="s13_understand",set="isan",setOpts=dict(dawn=True,steam=True,steamX=0),cam=dict(x=260,y=-470,z=[[0,2.3],[3,2.5]]),dof=dict(bg=5),
  actors=[FAH(x=260,mood="shock")],
  say=[N("ฟ้าถึงเข้าใจ"),N("ความเย็นชาของแม่ ไม่ใช่เพราะเกลียด"),N("แต่เพราะกลัวลูกเจ็บอีกครั้ง")])
S(name="s14_promise",set="isan",setOpts=dict(dawn=True,steam=True,steamX=0),cam=dict(x=0,y=-430,z=1.55),dof=dict(bg=3),
  actors=[PMOM(x=-230,view="side",dir=1,mood="smile"),FAH(x=230,view="side",dir=-1,mood="smile",arms="wai")],
  say=[F("ฟ้าจะดูแลภูมิให้ดีที่สุดค่ะ")])
S(name="s15_omelet",set="isan",setOpts=MATO,cut="whip",cam=dict(x=-40,y=-400,z=1.2),
  actors=[MAT("pmom",-380,mood="smile"),MAT("phum",-60,mood="happy"),MAT("fah",280,mood="happy")],ui=[TIP(True,"ให้เวลาเขารู้จักเรา")],sfx=[SFX("chime",0.3,0.3)],
  say=[N("มื้อเที่ยงวันนั้น มีไข่เจียววางข้างส้มตำ"),N("แม่นวลทำไว้ให้ ทั้งที่ไม่มีใครขอ")])
S(name="s16_end",set="isan",setOpts=dict(eve=True),cam=dict(x=0,y=[[0,-900],[4,-1100]],z=[[0,0.9],[4,0.8]]),
  actors=[PMOM(x=-300,mood="smile"),FAH(x=0,mood="happy"),PHUM(x=300,mood="happy")],
  ui=[QUOTE(["การเข้าบ้านใคร","ไม่ใช่การเอาชนะใจ","แต่คือการให้เวลา","เขารู้จักเรา"])],
  say=[END("การเข้าบ้านใคร ไม่ใช่การเอาชนะใจ แต่คือการให้เวลาเขารู้จักเรา")])
save("ST010","บ้านของภูมิ",sh,"isan")
