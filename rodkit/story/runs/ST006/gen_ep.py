# ST006 "ถ้าเขาขอกลับมา" — ภาคต่อ ST005: แฟนเก่าขอคืนดี ควรทำยังไง (ผู้บรรยายต่อเนื่อง ห้ามเงียบเกิน 1.5 วิ)
import json
def A(who,**k): d=dict(who=who,s=0.62,y=230,view="front",light="litL"); d.update(k); return d
FAH=lambda **k: A("fah",**dict(dict(seed=4),**k))
PHUM=lambda **k: A("phum",**dict(dict(seed=5,mood="flat"),**k))
CS=lambda who,x,**k: A(who,**dict(dict(x=x,y=20,layer="back",sink=190,clipY=0,view="side",dir=(1 if x<0 else -1),seed=(4 if who=="fah" else 5)),**k))
BED=lambda **k: FAH(**dict(dict(x=150,y=110,layer="back",sink=170,clipY=0),**k))
PHONE=dict(prop="phone",arms="phone")
N=lambda t: dict(who="narrator",text=t)
F=lambda t: dict(who="fah",text=t)
P=lambda t: dict(who="phum",text=t)
TIP=lambda ok,txt,y=300: dict(type="tip",t0=0.15,t1=99,do=ok,text=txt,y=y)
SFX=lambda n,at,g=0.6: dict(name=n,at=at,gain=g)
CAFE=dict(eve=True,rain=True)
sh=[]
def S(**k): sh.append(k)

# ---------- 1) ฮุก: ข้อความที่เคยรอ มาถึงแล้ว ----------
S(name="s01_msg",set="condo",cam=dict(x=[[0,150],[3,150]],y=-330,z=[[0,1.9],[3,2.05]]),dof=dict(bg=4),
  actors=[BED(mood="flat",**PHONE)],sfx=[SFX("phone_buzz",0.1,0.5),SFX("notify",0.9,0.4)],
  ui=[dict(type="chat",t0=0.1,t1=99,y=860,time="20:12",msgs=[dict(me=False,text="ฟ้า… สบายดีไหม"),dict(me=False,text="เราคิดถึงฟ้านะ"),dict(me=False,text="ขอเจอกันได้ไหม")])],
  say=[N("หกเดือนหลังเลิกกัน"),N("ข้อความที่ฟ้าเคยรอทุกคืน ก็มาถึง")])
S(name="s02_still",set="condo",cam=dict(x=150,y=-460,z=[[0,2.5],[3,2.8]]),dof=dict(bg=6),
  actors=[BED(mood="shock",**PHONE)],sfx=[SFX("heart",0.2,0.5)],
  say=[N("แต่แปลก… ใจเธอไม่ได้เต้นแรงอย่างที่เคยคิด")])
S(name="s03_title",set="condo",cam=dict(x=[[0,0],[3,60]],y=-380,z=[[0,1.15],[3,1.25]]),
  actors=[BED(mood="worried",**PHONE)],ui=[dict(type="title",t0=0.2,t1=99,y=420,text="ถ้าเขา ขอกลับมา",size=104)],
  say=[N("ถ้าแฟนเก่าขอกลับมา เราควรทำยังไง")])

# ---------- 2) สิ่งที่ไม่ควรทำ ----------
S(name="s04_rush",set="condo",cut="whip",cam=dict(x=150,y=-340,z=1.9),dof=dict(bg=3),
  actors=[BED(mood="happy",**PHONE)],ui=[dict(type="chat",t0=0.1,t1=99,y=980,s=0.85,time="20:13",msgs=[dict(me=False,text="ขอเจอกันได้ไหม")],typing="ได้สิ! เจอกันเลย",erase=True,typeSec=0.9,hold=0.4),TIP(False,"รีบตอบตอนใจยังเต้น")],
  sfx=[SFX("typing",0.3,0.4)],say=[N("สิ่งแรกที่ไม่ควรทำ"),N("คือรีบตอบ ตอนอารมณ์ยังพุ่ง")])
S(name="s05_te",set="office",cut="whip",cam=dict(x=20,y=-370,z=1.45),
  actors=[FAH(x=-200,mood="worried"),A("te",seed=6,x=250,view="side",dir=-1,mood="laugh")],ui=[TIP(False,"กลับเพราะเหงา")],
  say=[dict(who="te",text="กลับไปเลยพี่ ยังรักกันอยู่นี่"),N("และไม่ควรกลับไป แค่เพราะกลัวเหงา")])
S(name="s06_revenge",set="office",cam=dict(x=-200,y=-470,z=2.4),dof=dict(bg=5),
  actors=[FAH(x=-200,mood="flat")],ui=[dict(type="bubble",t0=0.2,t1=99,y=600,text="ให้เขารู้บ้าง ว่าเจ็บแค่ไหน"),TIP(False,"ใช้โอกาสนี้เอาคืน")],
  say=[N("ยิ่งไม่ควรใช้โอกาสนี้ เพื่อเอาคืน")])

# ---------- 3) สิ่งที่ควรทำ: ขอเวลา + ถามตัวเอง 3 ข้อ ----------
S(name="s07_ask_time",set="condo",cut="whip",cam=dict(x=150,y=-340,z=1.9),dof=dict(bg=3),
  actors=[BED(mood="flat",**PHONE)],ui=[dict(type="chat",t0=0.1,t1=99,y=980,s=0.85,time="21:30",msgs=[dict(me=False,text="ขอเจอกันได้ไหม"),dict(me=True,text="ขอเวลาคิดก่อนนะ")]),TIP(True,"ขอเวลาคิด")],
  sfx=[SFX("whoosh",0.9,0.3)],say=[N("ฟ้าเลือกขอเวลา แทนการตอบทันที")])
S(name="s08_jan",set="office",setOpts=dict(late=True),cut="whip",cam=dict(x=0,y=-370,z=1.5),
  actors=[FAH(x=-200,mood="worried"),A("jan",seed=7,x=220,view="side",dir=-1,mood="smile",arms="give")],
  say=[dict(who="jan",text="ก่อนตัดสินใจ ถามตัวเองสามข้อก่อนนะฟ้า")])
S(name="s09_q1",set="condo",setOpts=dict(night=True),cam=dict(x=-280,y=-400,z=2.0),dof=dict(bg=3),
  actors=[FAH(x=-280,mood="flat",prop="notebookP",arms="hold")],ui=[TIP(True,"1. ปัญหาเดิมแก้แล้ว?")],
  say=[N("ข้อแรก ปัญหาที่ทำให้เลิกกัน"),N("เปลี่ยนไปจริงไหม")])
S(name="s10_q2",set="condo",setOpts=dict(night=True),cam=dict(x=150,y=-430,z=[[0,2.3],[3,2.5]]),dof=dict(bg=5),
  actors=[BED(mood="worried")],ui=[TIP(True,"2. รักเขา หรือแค่เหงา?")],
  say=[N("ข้อสอง เราคิดถึงตัวเขา"),N("หรือแค่คิดถึง การมีใครสักคน")])
S(name="s11_q3",set="park",cam=dict(x=[[0,-500],[3.5,-100]],y=-380,z=1.35),
  actors=[FAH(view="side",dir=1,x=[[0,-900],[3.5,0]],mood="smile")],ui=[TIP(True,"3. เราสุขดีแล้วหรือยัง?")],sfx=[SFX("steps",0.2,0.4)],
  say=[N("ข้อสาม ตอนนี้"),N("เรามีความสุขกับตัวเองแล้วหรือยัง")])
S(name="s12_week",set="park",cam=dict(x=-100,y=-470,z=2.4),dof=dict(bg=5),
  actors=[FAH(x=-100,mood="flat")],
  say=[N("ฟ้าใช้เวลาหนึ่งสัปดาห์"),N("ตอบคำถามทั้งสามข้อ อย่างซื่อสัตย์")])

# ---------- 4) ร้านกาแฟ: ฟังเหตุผลที่เขากลับมา ----------
S(name="s13_cafe_wide",set="cafe",setOpts=CAFE,cut="whip",cam=dict(x=[[0,-60],[3.5,0]],y=-340,z=[[0,1.3],[3.5,1.4]]),
  actors=[CS("fah",-240,mood="flat"),CS("phum",240,mood="smile")],sfx=[SFX("chime",0.2,0.3)],
  say=[N("แล้วเธอก็ไปเจอเขา ที่ร้านกาแฟร้านเดิม")])
S(name="s14_phum_ask",set="cafe",setOpts=CAFE,cam=dict(x=240,y=-330,z=2.2),dof=dict(bg=5),
  actors=[CS("phum",240,mood="worried",view="front")],
  say=[P("เราคิดผิดที่ปล่อยฟ้าไป"),P("ลองเริ่มใหม่กันไหม")])
S(name="s15_fah_q",set="cafe",setOpts=CAFE,cam=dict(x=-240,y=-330,z=2.2),dof=dict(bg=5),
  actors=[CS("fah",-240,mood="flat",view="front")],
  say=[F("แล้วตอนนี้ ภูมิเปลี่ยนอะไรไปบ้าง")])
S(name="s16_phum_ans",set="cafe",setOpts=CAFE,cam=dict(x=[[0,0],[3,40]],y=-330,z=1.5),
  actors=[CS("fah",-240,mood="flat"),CS("phum",240,mood="worried")],
  say=[P("ก็… เหงาน่ะ ไม่มีใครเหมือนฟ้า"),N("คำตอบนั้น ทำให้ฟ้าเข้าใจทันที")])
S(name="s17_actions",set="cafe",setOpts=CAFE,cam=dict(x=-240,y=-330,z=2.4),dof=dict(bg=6),
  actors=[CS("fah",-240,mood="flat",view="front")],ui=[TIP(True,"ดูที่การกระทำ")],
  say=[N("เขาไม่ได้กลับมาเพราะเปลี่ยน"),N("แต่กลับมา เพราะเหงา")])
S(name="s18_answer",set="cafe",setOpts=CAFE,cam=dict(x=[[0,-240],[3,-230]],y=-330,z=[[0,2.2],[3,2.4]]),dof=dict(bg=6),
  actors=[CS("fah",-240,mood="smile",view="front")],sfx=[SFX("chime",0.1,0.3)],
  say=[F("ขอบคุณนะ ที่ยังคิดถึงกัน"),F("แต่ฟ้าเดินต่อมาไกลแล้ว")])
S(name="s19_phum_nod",set="cafe",setOpts=CAFE,cam=dict(x=240,y=-330,z=2.2),dof=dict(bg=5),
  actors=[CS("phum",240,mood="worried",view="front")],
  say=[P("…เข้าใจแล้ว"),N("ประโยคเดียวกับที่เขาเคยพูด"),N("แต่ครั้งนี้ ไม่มีใครตั้งใจทำร้ายใคร")])

# ---------- 5) ปิดอย่างสุภาพ + มุมมองที่ยุติธรรม ----------
S(name="s20_walk_home",set="housefront",cut="whip",cam=dict(x=[[0,-650],[3,-120]],y=-420,z=1.35),
  actors=[FAH(view="side",dir=1,x=[[0,-900],[3,-80]],y=200,mood="smile")],
  say=[N("ถ้าทั้งคู่เปลี่ยนจริง การกลับไปก็อาจดีได้"),N("แต่ต้องตัดสินจากสิ่งที่เห็น"),N("ไม่ใช่สิ่งที่หวัง")])
S(name="s21_close",set="condo",setOpts=dict(night=True),cam=dict(x=150,y=-340,z=1.9),dof=dict(bg=3),
  actors=[BED(mood="smile",**PHONE)],ui=[dict(type="chat",t0=0.1,t1=99,y=980,s=0.85,time="22:05",msgs=[dict(me=True,text="ขอบคุณที่กลับมาบอกนะ"),dict(me=True,text="ดูแลตัวเองด้วย")]),TIP(True,"ปิดให้ชัด อย่างสุภาพ")],
  say=[N("การไม่กลับไป ไม่ได้แปลว่าไม่เคยรัก"),N("แต่คือการเลือกตัวเอง"),N("โดยไม่ต้องเกลียดใคร")])
S(name="s22_end",set="park",cam=dict(x=-100,y=-400,z=1.3),
  actors=[FAH(x=-300,mood="happy")],
  ui=[dict(type="quote",t0=0.3,t1=99,lines=["บางคนกลับมา","ไม่ใช่เพราะพร้อม","แต่เพราะเหงา"])],
  say=[dict(who="narrator",text="บางคนกลับมา ไม่ใช่เพราะพร้อม แต่เพราะเหงา",sub="")])

ep=dict(id="ST006",engine="flat",fps=30,set="condo",title="ถ้าเขาขอกลับมา",music="family",musicGain=1.0,ambience="auto",ambienceGain=0.12,handheld=0.7,shots=sh)
json.dump(ep,open("/home/claude/recover/shorts-factory/rodkit/episodes/ST006.ep.json","w"),ensure_ascii=False,indent=1)
print(len(sh), sum(len(x["text"]) for s in sh for x in s.get("say",[])),"chars")
