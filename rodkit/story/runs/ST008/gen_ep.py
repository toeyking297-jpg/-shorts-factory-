# ST008 "ให้โอกาสอีกครั้ง" — ภาค 4: ฟ้ากับภูมิกลับมาคบกันใหม่ อย่างไรไม่ให้จบแบบเดิม (ฉากใหม่ riverside)
import json
def A(who,**k): d=dict(who=who,s=0.62,y=230,view="front",light="litL"); d.update(k); return d
FAH=lambda **k: A("fah",**dict(dict(seed=4),**k))
PHUM=lambda **k: A("phum",**dict(dict(seed=5,mood="flat"),**k))
RV=lambda who,x,**k: A(who,**dict(dict(x=x,y=20,layer="back",sink=150,clipY=0,seed=(4 if who=="fah" else 5)),**k))
CS=lambda who,x,**k: A(who,**dict(dict(x=x,y=20,layer="back",sink=190,clipY=0,view="side",dir=(1 if x<0 else -1),seed=(4 if who=="fah" else 5)),**k))
PS=lambda who,x,**k: A(who,**dict(dict(x=x,y=60,layer="back",sink=120,clipY=0,view="front",arms="give",seed=(4 if who=="fah" else 8)),**k))
BED=lambda **k: FAH(**dict(dict(x=150,y=110,layer="back",sink=170,clipY=0),**k))
PHONE=dict(prop="phone",arms="phone")
N=lambda t: dict(who="narrator",text=t)
F=lambda t: dict(who="fah",text=t)
P=lambda t: dict(who="phum",text=t)
TIP=lambda ok,txt,y=300: dict(type="tip",t0=0.15,t1=99,do=ok,text=txt,y=y)
SFX=lambda n,at,g=0.6: dict(name=n,at=at,gain=g)
sh=[]
def S(**k): sh.append(k)

# ---------- 1) ฮุก ----------
S(name="s01_river",set="riverside",cam=dict(x=[[0,-40],[3.5,0]],y=[[0,-520],[3.5,-420]],z=[[0,1.15],[3.5,1.3]]),
  actors=[RV("fah",-200,mood="smile"),RV("phum",200,mood="smile")],sfx=[SFX("chime",0.2,0.3)],
  say=[N("หนึ่งปีหลังเลิกกัน"),N("ฟ้ากับภูมิ กลับมานั่งข้างกันอีกครั้ง")])
S(name="s02_title",set="riverside",cam=dict(x=0,y=-420,z=[[0,1.3],[3,1.4]]),
  actors=[RV("fah",-200,mood="smile",view="side",dir=1),RV("phum",200,mood="smile",view="side",dir=-1)],
  ui=[dict(type="title",t0=0.2,t1=99,y=420,text="ให้โอกาส อีกครั้ง",size=104)],
  say=[N("แต่ครั้งนี้ ต้องไม่จบแบบเดิม")])

# ---------- 2) เห็นการเปลี่ยนแปลงจากการกระทำ ----------
S(name="s03_no_msg",set="condo",cut="whip",cam=dict(x=150,y=-340,z=1.9),dof=dict(bg=3),
  actors=[BED(mood="flat",**PHONE)],
  say=[N("ตลอดหลายเดือน ภูมิไม่ได้ทักมาขอคืนดีอีกเลย")])
S(name="s04_phum_market",set="market",cut="whip",cam=dict(x=[[0,-300],[3,-200]],y=-380,z=1.4),
  actors=[PHUM(x=-250,view="side",dir=1,mood="smile",prop="porkbag",arms="hold")],ui=[TIP(True,"ดูที่การกระทำ")],
  say=[N("แต่ฟ้าเห็นเขาเปลี่ยน จากสิ่งที่ทำ"),N("หัดอยู่คนเดียว และเลิกหนีปัญหา")])
S(name="s06_consistent",set="office",cam=dict(x=-200,y=-470,z=2.4),dof=dict(bg=5),
  actors=[FAH(x=-200,mood="smile")],ui=[TIP(True,"เปลี่ยนจริง ต่อเนื่อง")],
  say=[N("ไม่ใช่เปลี่ยนแค่สัปดาห์เดียว"),N("แต่เปลี่ยนต่อเนื่อง จนฟ้าเชื่อได้")])
S(name="s07_ton",set="pottery",setOpts=dict(wheels=[-240,240],clay=["bowl","wonky"]),cut="whip",cam=dict(x=0,y=-330,z=1.45),
  actors=[PS("fah",-240,mood="smile"),PS("ton",240,mood="laugh")],
  say=[N("ต้นคือคนแรกที่ฟ้าเล่าให้ฟัง"),N("และเป็นเพื่อนที่ยิ้มให้กำลังใจ")])

# ---------- 3) คุยเรื่องเก่าให้จบ + ขอไปขอโทษครอบครัว ----------
S(name="s08_cafe",set="cafe",setOpts=dict(eve=True),cut="whip",cam=dict(x=[[0,-60],[3.5,0]],y=-340,z=[[0,1.3],[3.5,1.4]]),
  actors=[CS("fah",-240,mood="flat"),CS("phum",240,mood="flat")],
  say=[P("ก่อนเริ่มใหม่"),P("เราขอคุยเรื่องเก่าให้จบก่อนได้ไหม")])
S(name="s09_fah_sorry",set="cafe",setOpts=dict(eve=True),cam=dict(x=-240,y=-330,z=2.2),dof=dict(bg=5),
  actors=[CS("fah",-240,mood="worried",view="front")],ui=[TIP(True,"คุยปัญหาเดิมตรงๆ")],
  say=[F("ฟ้าเคยเลื่อนนัดภูมิบ่อยมาก"),F("ขอโทษนะ")])
S(name="s10_phum_sorry",set="cafe",setOpts=dict(eve=True),cam=dict(x=240,y=-330,z=2.2),dof=dict(bg=5),
  actors=[CS("phum",240,mood="worried",view="front")],
  say=[P("เราก็เคยกลับมา เพราะเหงา"),P("ขอโทษเหมือนกัน"),P("แล้วเราอยากไปขอโทษ"),P("พ่อแม่ กับน้องของฟ้าด้วย")])

# ---------- 3.5) ขอโทษครอบครัวของฟ้า ----------
FAM=dict(houseNo="บ้านเลขที่ 12",soi="ซอยพุดซ้อน")
DAD=lambda **k: A("fdad",**dict(dict(seed=11,mood="flat"),**k))
MOM=lambda **k: A("fmom",**dict(dict(seed=12,mood="flat"),**k))
SIS=lambda **k: A("fsis",**dict(dict(seed=13,mood="flat"),**k))
S(name="s10a_gate",set="housefront",setOpts=dict(FAM,gateOpen=0.15),cut="whip",cam=dict(x=[[0,-350],[3,-260]],y=-420,z=1.4),
  actors=[PHUM(x=-250,y=200,view="side",dir=1,mood="worried",prop="porkbag",arms="hold")],sfx=[SFX("door",0.4,0.35)],
  say=[N("เย็นวันเสาร์ ภูมิมายืนหน้าบ้านของฟ้า"),N("บ้านที่เขาไม่กล้ามาเหยียบ ตั้งแต่วันที่เลิกกัน")])
S(name="s10b_family",set="living",cam=dict(x=-60,y=-380,z=1.15),
  actors=[DAD(x=-470),MOM(x=-220),SIS(x=20,view="side",dir=-1,arms="cross"),PHUM(x=330,view="side",dir=-1,mood="worried",arms="wai",tilt=8)],
  say=[N("พ่อนั่งหน้านิ่ง แม่ไม่ยิ้ม"),N("ส่วนมิ้นท์ น้องสาวของฟ้า กอดอกไม่ยอมมองหน้า")])
S(name="s10c_apology",set="living",cam=dict(x=330,y=-400,z=[[0,1.9],[3,2.05]]),dof=dict(bg=5),
  actors=[PHUM(x=330,mood="worried",arms="wai",tilt=6)],
  say=[P("ผมขอโทษครับ ที่เคยทำให้ฟ้าเสียใจ"),P("ผมไม่ได้มาขอให้ยกโทษวันนี้"),P("แค่อยากให้เห็นว่า ผมตั้งใจจริง")])
S(name="s10d_sister",set="living",cam=dict(x=20,y=-460,z=2.3),dof=dict(bg=5),
  actors=[SIS(x=20,view="side",dir=-1,arms="cross",mood="worried")],ui=[TIP(True,"ไม่บังคับให้ใครยกโทษ")],
  say=[N("มิ้นท์เคยเห็นพี่สาวร้องไห้ทุกคืน"),N("เธอยังไม่พร้อมจะยกโทษ และภูมิก็ยอมรับ")])
S(name="s10e_help_dad",set="housefront",setOpts=dict(FAM,gateOpen=0.5),cut="whip",cam=dict(x=-300,y=-400,z=1.45),
  actors=[DAD(x=-480,view="side",dir=1,arms="point"),PHUM(x=-150,y=200,view="side",dir=-1,mood="smile",arms="give")],ui=[TIP(True,"พิสูจน์ด้วยเวลา")],sfx=[SFX("whoosh",0.5,0.2)],
  say=[N("หลังจากนั้นทุกสัปดาห์ ภูมิมาช่วยพ่อซ่อมรั้ว")])
S(name="s10f_help_mom",set="market",cam=dict(x=[[0,-300],[3,-200]],y=-380,z=1.4),
  actors=[MOM(x=-380,view="side",dir=1,mood="smile"),PHUM(x=-120,view="side",dir=1,mood="smile",prop="porkbag",arms="hold")],
  say=[N("ช่วยแม่หิ้วของจากตลาด โดยไม่ต้องมีใครขอ")])
S(name="s10g_dinner",set="dining",setOpts=dict(bare=True),cam=dict(x=60,y=-330,z=1.2),
  actors=[A("fdad",seed=11,mood="smile",x=-300,y=20,layer="back",sink=40,clipY=0),A("fmom",seed=12,mood="happy",x=-60,y=20,layer="back",sink=40,clipY=0),A("fah",seed=4,mood="happy",x=180,y=20,layer="back",sink=40,clipY=0),A("phum",seed=5,mood="smile",x=420,y=20,layer="back",sink=40,clipY=0)],
  say=[N("จนวันหนึ่ง พ่อรินน้ำให้"),N("แม่ชวนอยู่กินข้าวเย็น")])
S(name="s10h_sister_smile",set="dining",setOpts=dict(bare=True),cam=dict(x=-560,y=-420,z=2.3),dof=dict(bg=5),
  actors=[A("fsis",seed=13,mood="smile",x=-560,y=20,layer="back",sink=40,clipY=0)],sfx=[SFX("chime",0.2,0.3)],
  say=[N("และมิ้นท์ ยอมยิ้มให้ภูมิ เป็นครั้งแรก")])

# ---------- 4) กติกาใหม่ ----------
S(name="s11_rules",set="cafe",setOpts=dict(eve=True),cut="whip",cam=dict(x=0,y=-330,z=1.45),
  actors=[CS("fah",-240,mood="smile"),CS("phum",240,mood="smile")],ui=[TIP(True,"ตั้งกติกาใหม่ด้วยกัน")],
  say=[F("ถ้าต้องเลื่อนนัด ฟ้าจะบอกเหตุผล"),F("แล้วนัดวันใหม่ทันที"),P("ถ้าเราเหงา เราจะบอกตรงๆ"),P("ไม่หายไปเฉยๆ")])
# ---------- 5) สิ่งที่ไม่ควรทำ ----------
S(name="s13_fight",set="condo",cut="whip",cam=dict(x=-60,y=-370,z=1.45),
  actors=[FAH(x=-260,mood="worried",view="side",dir=1),PHUM(x=200,view="side",dir=-1,mood="worried")],
  ui=[dict(type="bubble",t0=0.2,t1=99,y=470,text="ก็ภูมิเคยทิ้งฟ้า…"),TIP(False,"ขุดเรื่องเก่ามาทะเลาะ",y=260)],
  say=[N("สิ่งที่ไม่ควรทำ คือหยิบเรื่องเก่ามาเป็นอาวุธ"),N("และหวังให้ทุกอย่าง กลับไปเหมือนเดิม")])
S(name="s15_caveat",set="riverside",cut="whip",cam=dict(x=0,y=-470,z=1.2),
  say=[N("แต่ถ้าปัญหาเดิม คือการทำร้ายกัน"),N("การไม่ให้โอกาส ก็เป็นทางเลือกที่ถูกเหมือนกัน")])

# ---------- 6) ค่อยเป็นค่อยไป: กติกาใช้ได้จริง ----------
S(name="s16_reschedule",set="office",setOpts=dict(late=True),cut="whip",cam=dict(x=-200,y=-380,z=1.9),dof=dict(bg=3),
  actors=[FAH(x=-200,mood="flat",**PHONE)],
  ui=[dict(type="chat",t0=0.1,t1=99,y=980,s=0.85,name="ภูมิ",time="17:40",msgs=[dict(me=True,text="งานด่วน ขอเลื่อนเป็นพรุ่งนี้ทุ่มนึงได้ไหม"),dict(me=False,text="ได้สิ ขอบคุณที่บอกนะ")]),TIP(True,"ค่อยเป็นค่อยไป")],
  sfx=[SFX("notify",1.2,0.35)],say=[N("กติกาใหม่ ใช้ได้จริง")])

# ---------- 7) จบที่ท่าน้ำ ----------
S(name="s17_thanks_fah",set="riverside",cut="whip",cam=dict(x=-200,y=-360,z=2.2),dof=dict(bg=4),
  actors=[RV("fah",-200,mood="smile",view="side",dir=1)],
  say=[F("ขอบคุณที่ให้โอกาสกันนะ")])
S(name="s18_thanks_phum",set="riverside",cam=dict(x=200,y=-360,z=2.2),dof=dict(bg=4),
  actors=[RV("phum",200,mood="smile",view="side",dir=-1)],
  say=[P("เราต่างหากที่ต้องขอบคุณ ฟ้ากับครอบครัว")])
S(name="s19_end",set="riverside",cam=dict(x=[[0,0],[4,0]],y=[[0,-420],[4,-560]],z=[[0,1.3],[4,1.15]]),
  actors=[RV("fah",-200,mood="happy"),RV("phum",200,mood="happy")],
  ui=[dict(type="quote",t0=0.3,t1=99,lines=["โอกาสครั้งที่สอง","ไม่ใช่การย้อนกลับไป","แต่คือการเริ่มใหม่","กับคนเดิม ที่ไม่เหมือนเดิม"])],
  say=[dict(who="narrator",text="โอกาสครั้งที่สอง ไม่ใช่การย้อนกลับไป แต่คือการเริ่มใหม่ กับคนเดิม ที่ไม่เหมือนเดิม",sub="")])

ep=dict(id="ST008",engine="flat",fps=30,set="riverside",title="ให้โอกาสอีกครั้ง",music="family",musicGain=1.0,ambience="auto",ambienceGain=0.12,handheld=0.7,shots=sh)
json.dump(ep,open("/home/claude/recover/shorts-factory/rodkit/episodes/ST008.ep.json","w"),ensure_ascii=False,indent=1)
print(len(sh), sum(len(x["text"]) for s in sh for x in s.get("say",[])),"chars")
