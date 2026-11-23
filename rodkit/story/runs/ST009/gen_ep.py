# ST009 EP.5 "ทะเลาะครั้งแรก" — ทะเลาะยังไงไม่ให้เลิกกัน (ฉากใหม่ busstop)
import sys; sys.path.insert(0,"/home/claude/recover/shorts-factory/rodkit/story/runs"); from fah_common import *
sh=[]; S=lambda **k: sh.append(k)
NT=dict(night=True)
S(name="s01_wait",set="busstop",cam=dict(x=[[0,-150],[3,-150]],y=-420,z=[[0,1.25],[3,1.35]]),
  actors=[FAH(x=-150,y=200,mood="worried",**PHONE)],sfx=[SFX("phone_buzz",0.3,0.3)],
  ui=[dict(type="chat",t0=0.1,t1=99,x=790,y=640,s=0.6,rot=4,name="ภูมิ",time="19:40",msgs=[dict(me=True,text="ถึงไหนแล้ว"),dict(me=True,text="รอที่ป้ายนะ"),dict(me=True,text="ภูมิ?")])],
  say=[N("หนึ่งทุ่มสี่สิบ"),N("ภูมิบอกว่าจะมารับตอนหนึ่งทุ่ม"),N("ฟ้ายืนรอใต้ฝน"),N("ข้อความไม่ถูกอ่านสักข้อ")])
S(name="s02_fear",set="busstop",cam=dict(x=-150,y=-480,z=[[0,2.3],[3,2.5]]),dof=dict(bg=5),
  actors=[FAH(x=-150,y=200,mood="pain")],ui=[BUB("เขาหายไปเฉยๆ อีกแล้ว…",y=520)],
  say=[N("ความกลัวเก่า กลับมาในทันที")])
S(name="s03_title",set="busstop",cam=dict(x=0,y=-520,z=[[0,1.0],[3,1.1]]),
  actors=[FAH(x=-150,y=200,mood="worried",**PHONE)],ui=[dict(type="title",t0=0.2,t1=99,y=420,text="ทะเลาะ ครั้งแรก",size=104)],
  say=[N("ทะเลาะกันยังไง ไม่ให้เลิกกัน")])
S(name="s04_phum_late",set="office",setOpts=dict(late=True),cut="whip",cam=dict(x=-200,y=-400,z=1.8),dof=dict(bg=3),
  actors=[PHUM(x=-200,mood="worried",**PHONE)],ui=[dict(type="chip",t0=0.2,t1=99,x=40,y=150,w=320,icon="clock",text="แบตหมด 0%")],
  say=[N("ส่วนภูมิ ติดประชุมด่วน มือถือแบตหมด")])
S(name="s05_argue",set="condo",setOpts=NT,cut="whip",cam=dict(x=0,y=-370,z=1.45),handheld=1.2,
  actors=[FAH(x=-220,view="side",dir=1,mood="worried",arms="cross"),PHUM(x=220,view="side",dir=-1,mood="worried")],sfx=[SFX("door",0.0,0.4)],
  say=[F("ภูมิสัญญาแล้วนี่ ว่าจะไม่หายไปเฉยๆ"),P("ก็งานมันด่วน ทำไมต้องคิดมากขนาดนี้")])
S(name="s06_escalate",set="condo",setOpts=NT,cam=dict(x=-220,y=-470,z=2.4),dof=dict(bg=5),handheld=1.4,
  actors=[FAH(x=-220,mood="pain")],ui=[TIP(False,"ตอบโต้ตอนโกรธ")],
  say=[F("คิดมากเหรอ ยืนตากฝนเป็นชั่วโมงเนี่ยนะ"),N("ยิ่งพูด ยิ่งแรง")])
S(name="s07_almost",set="condo",setOpts=NT,cam=dict(x=-220,y=-470,z=[[0,2.5],[3,2.8]]),dof=dict(bg=6),
  actors=[FAH(x=-220,mood="worried")],ui=[BUB("ก็เหมือนตอนที่ภูมิทิ้ง…"),TIP(False,"ขุดเรื่องเก่า",y=260)],
  say=[N("ประโยคต้องห้าม เกือบหลุดออกมา")])
S(name="s08_pause",set="condo",setOpts=NT,cam=dict(x=0,y=-370,z=1.45),
  actors=[FAH(x=-220,view="side",dir=1,mood="flat"),PHUM(x=220,view="side",dir=-1,mood="flat")],ui=[TIP(True,"ขอพักก่อน")],
  say=[F("เดี๋ยว… ขอพักสิบนาทีก่อนนะ"),N("ฟ้าเลือกหยุด"),N("ก่อนพูดสิ่งที่ถอนคืนไม่ได้")])
S(name="s09_think",set="condo",setOpts=dict(night=True,photo="up"),cam=dict(x=[[0,-500],[3.5,-560]],y=-700,z=1.6),dof=dict(bg=2),
  actors=[FAH(x=-700,view="side",dir=-1,mood="flat")],
  say=[N("สิบนาทีนั้น ทั้งคู่ได้ถามตัวเอง"),N("ว่าที่โกรธจริงๆ คือเรื่องอะไร")])
S(name="s10_feel",set="condo",setOpts=NT,cut="whip",cam=dict(x=-80,y=-430,z=2.2),dof=dict(bg=4),
  actors=[BED("fah",x=-80,mood="worried")],ui=[TIP(True,"พูดความรู้สึก")],
  say=[F("ฟ้าไม่ได้โกรธที่ภูมิมาช้า"),F("ฟ้ากลัวว่าเราจะกลับไปเป็นแบบเดิม")])
S(name="s11_listen",set="condo",setOpts=NT,cam=dict(x=320,y=-430,z=2.2),dof=dict(bg=4),
  actors=[BED("phum",x=320,mood="worried")],ui=[TIP(True,"ฟังให้จบ")],
  say=[P("ขอโทษนะ เราไม่รู้เลยว่าฟ้ากลัวแบบนั้น"),P("ครั้งหน้าถ้าจะช้า เราจะหาทางบอกให้ได้")])
S(name="s12_powerbank",set="office",cut="whip",cam=dict(x=-200,y=-470,z=2.3),dof=dict(bg=5),
  actors=[PHUM(x=-200,mood="smile",**PHONE)],ui=[dict(type="chip",t0=0.2,t1=99,x=40,y=150,w=360,icon="clock",text="แบตสำรอง 100%")],
  say=[N("วันรุ่งขึ้น"),N("ภูมิพกแบตสำรองติดกระเป๋าทุกวัน")])
S(name="s13_chatfight",set="condo",setOpts=NT,cut="whip",cam=dict(x=150,y=-340,z=1.9),dof=dict(bg=3),
  actors=[BED(mood="flat",**PHONE)],ui=[dict(type="chat",t0=0.1,t1=99,x=790,y=760,s=0.62,rot=4,time="23:02",msgs=[dict(me=False,text="ถึงบ้านแล้วนะ")],typing="ก็แล้วแต่ภูมิละกัน",erase=True,typeSec=1.0,hold=0.5),TIP(False,"ประชด ทะเลาะผ่านแชท")],
  say=[N("สิ่งที่ไม่ควรทำเวลาทะเลาะ"),N("คือเงียบใส่ หรือประชด"),N("และทะเลาะผ่านแชท"),N("ที่ไม่เห็นสีหน้ากัน")])
S(name="s14_make_up",set="condo",setOpts=NT,cam=dict(x=120,y=-380,z=1.35),
  actors=[BED("fah",x=-80,mood="smile"),BED("phum",x=320,mood="smile")],ui=[TIP(True,"คืนดีก่อนนอน")],
  say=[F("คืนดีกันก่อนนอนนะ"),P("อือ ฝันดีนะฟ้า")])
S(name="s15_end",set="busstop",cam=dict(x=0,y=-520,z=1.1),
  actors=[FAH(x=-150,y=200,mood="happy",view="side",dir=1),PHUM(x=150,y=200,mood="smile",view="side",dir=-1)],
  ui=[QUOTE(["คู่ที่ดี ไม่ใช่คู่ที่ไม่เคยทะเลาะ","แต่คือคู่ที่ทะเลาะแล้ว","ยังหันหน้าเข้าหากัน"])],
  say=[END("คู่ที่ดี ไม่ใช่คู่ที่ไม่เคยทะเลาะ แต่คือคู่ที่ทะเลาะแล้ว ยังหันหน้าเข้าหากัน")])
save("ST009","ทะเลาะครั้งแรก",sh,"busstop")
