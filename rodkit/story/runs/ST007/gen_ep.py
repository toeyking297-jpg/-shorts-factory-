# ST007 "พร้อมรักใหม่หรือยัง" — ภาค 3 (จบซีรีส์ฟ้า) ฉากใหม่ rooftop + pottery, ตัวละครใหม่ ต้น (ไม่มีบทพูด ผู้บรรยายเล่าแทน)
import json
def A(who,**k): d=dict(who=who,s=0.62,y=230,view="front",light="litL"); d.update(k); return d
FAH=lambda **k: A("fah",**dict(dict(seed=4),**k))
TON=lambda **k: A("ton",**dict(dict(seed=8,mood="smile"),**k))
SEAT=lambda who,x,**k: A(who,**dict(dict(x=x,y=20,layer="back",sink=190,clipY=0,view="side",dir=(1 if x<0 else -1),seed=(4 if who=="fah" else 8)),**k))
BED=lambda **k: FAH(**dict(dict(x=150,y=110,layer="back",sink=170,clipY=0),**k))
PHONE=dict(prop="phone",arms="phone")
N=lambda t: dict(who="narrator",text=t)
F=lambda t: dict(who="fah",text=t)
TIP=lambda ok,txt,y=300: dict(type="tip",t0=0.15,t1=99,do=ok,text=txt,y=y)
SFX=lambda n,at,g=0.6: dict(name=n,at=at,gain=g)
POT=dict(wheels=[-240,240],clay=["tall","wonky"])
PS=lambda who,x,**k: SEAT(who,x,**dict(dict(sink=120,y=60),**k))
sh=[]
def S(**k): sh.append(k)

# ---------- 1) ฮุก: เดตแรก แต่พูดแต่เรื่องคนเก่า ----------
S(name="s01_date_wide",set="rooftop",cam=dict(x=[[0,-60],[3.5,0]],y=-360,z=[[0,1.25],[3.5,1.35]]),
  actors=[SEAT("fah",-260,mood="laugh"),SEAT("ton",260,mood="smile")],sfx=[SFX("chime",0.2,0.3)],
  say=[N("เก้าเดือนหลังเลิกกับภูมิ"),N("ฟ้าตกลงไปเดตครั้งแรก")])
S(name="s02_fah_talk",set="rooftop",cam=dict(x=-260,y=-330,z=2.3),dof=dict(bg=6),
  actors=[SEAT("fah",-260,mood="laugh",view="front")],
  say=[F("ร้านนี้ภูมิเคยพามาเหมือนกัน"),F("ภูมิชอบสั่งพาสต้า แล้วก็…")])
S(name="s03_ton_smile",set="rooftop",cam=dict(x=260,y=-330,z=2.3),dof=dict(bg=6),
  actors=[SEAT("ton",260,mood="smile",view="front")],
  say=[N("ต้นยิ้มรับอย่างสุภาพ"),N("ขณะที่ฟ้าเล่าเรื่องภูมิ ไปอีกครึ่งชั่วโมง")])
S(name="s04_title",set="rooftop",cam=dict(x=[[0,0],[3,40]],y=-420,z=[[0,1.05],[3,1.15]]),
  actors=[SEAT("fah",-260,mood="flat"),SEAT("ton",260,mood="flat")],ui=[dict(type="title",t0=0.2,t1=99,y=420,text="พร้อมรักใหม่ หรือยัง",size=100)],
  say=[N("จะรู้ได้ยังไง ว่าเราพร้อมรักใหม่แล้ว")])

# ---------- 2) สัญญาณว่ายังไม่พร้อม ----------
S(name="s05_te_setup",set="office",cut="whip",cam=dict(x=20,y=-370,z=1.45),
  actors=[FAH(x=-200,mood="smile"),A("te",seed=6,x=250,view="side",dir=-1,mood="laugh")],
  say=[dict(who="te",text="พี่ฟ้า ผมมีเพื่อนจะแนะนำ คนนี้ดีมาก!"),F("ได้เลย จะได้ลืมภูมิสักที")])
S(name="s06_sign1",set="office",cam=dict(x=-200,y=-470,z=2.4),dof=dict(bg=5),
  actors=[FAH(x=-200,mood="flat")],ui=[TIP(False,"เดตเพื่อลืมใครบางคน")],
  say=[N("นี่คือสัญญาณแรก ว่ายังไม่พร้อม"),N("ไปเดต เพื่อลืมคนเก่า")])
S(name="s07_sign2",set="rooftop",cut="whip",cam=dict(x=-260,y=-330,z=2.3),dof=dict(bg=6),
  actors=[SEAT("fah",-260,mood="worried",view="front")],ui=[dict(type="bubble",t0=0.2,t1=99,y=470,text="ภูมิไม่สั่งแบบนี้หรอก"),TIP(False,"เทียบกับคนเก่า",y=260)],
  say=[N("สัญญาณที่สอง"),N("คือเปรียบเทียบเขากับคนเก่า ตลอดเวลา")])
S(name="s08_sign3",set="condo",setOpts=dict(night=True),cut="whip",cam=dict(x=150,y=-340,z=1.9),dof=dict(bg=3),
  actors=[BED(mood="worried",**PHONE)],ui=[TIP(False,"ยังแอบดูโซเชียลเขา")],sfx=[SFX("notify",0.3,0.3)],
  say=[N("และสัญญาณสุดท้าย"),N("กลับบ้านมา ยังแอบดูโซเชียลของภูมิอยู่")])
S(name="s09_realize",set="condo",setOpts=dict(night=True),cam=dict(x=150,y=-460,z=2.6),dof=dict(bg=6),
  actors=[BED(mood="worried",**PHONE)],sfx=[SFX("sigh",0.1,0.5)],
  say=[F("ฟ้ายังไม่พร้อมเลยนี่นา")])

# ---------- 3) ทำสิ่งที่ถูก: ซื่อสัตย์ + ไม่รีบ ----------
S(name="s10_honest",set="condo",setOpts=dict(night=True),cam=dict(x=150,y=-340,z=1.9),dof=dict(bg=3),
  actors=[BED(mood="flat",**PHONE)],ui=[dict(type="chat",t0=0.1,t1=99,y=980,s=0.85,name="ต้น",time="23:10",msgs=[dict(me=True,text="ขอโทษนะต้น ฟ้ายังไม่พร้อม"),dict(me=True,text="เป็นเพื่อนกันก่อนได้ไหม"),dict(me=False,text="ได้สิ ไม่ต้องรีบนะ")]),TIP(True,"บอกความจริง")],
  sfx=[SFX("whoosh",0.6,0.3)],say=[N("สิ่งที่ฟ้าทำถูก"),N("คือบอกความจริง ก่อนที่ใครจะเจ็บ")])
S(name="s11_jan",set="office",setOpts=dict(late=True),cut="whip",cam=dict(x=0,y=-370,z=1.5),
  actors=[FAH(x=-200,mood="flat"),A("jan",seed=7,x=220,view="side",dir=-1,mood="smile",arms="give")],
  say=[dict(who="jan",text="ไม่ต้องรีบนะฟ้า"),dict(who="jan",text="ความรักไม่ใช่การแข่ง ว่าใครมูฟออนก่อน")])
S(name="s12_pottery",set="pottery",setOpts=dict(wheels=[-300],clay="tall"),cut="whip",cam=dict(x=[[0,-200],[3.5,-280]],y=-360,z=[[0,1.5],[3.5,1.7]]),
  actors=[PS("fah",-300,mood="happy",view="front",arms="give")],ui=[TIP(True,"เติมชีวิตตัวเอง")],sfx=[SFX("chime",0.2,0.25)],
  say=[N("ฟ้าเลยหันมาใช้เวลากับตัวเอง"),N("ลงเรียนปั้นดิน ที่อยากทำมานาน")])
S(name="s13_for_self",set="pottery",setOpts=dict(wheels=[-300],clay="bowl"),cam=dict(x=-300,y=-360,z=2.4),dof=dict(bg=5),
  actors=[PS("fah",-300,mood="smile",view="front",arms="give")],
  say=[N("ไม่ใช่เพื่อรอใคร"),N("แต่เพราะชีวิตนี้ เป็นของเธอ")])

# ---------- 4) สัญญาณว่าพร้อมแล้ว ----------
S(name="s14_ready1",set="park",cut="whip",cam=dict(x=[[0,-500],[3.5,-100]],y=-380,z=1.35),
  actors=[FAH(view="side",dir=1,x=[[0,-900],[3.5,0]],mood="smile")],ui=[TIP(True,"นึกถึงได้ ไม่เจ็บ")],sfx=[SFX("steps",0.2,0.4)],
  say=[N("แล้ววันหนึ่ง เธอนึกถึงภูมิ"),N("ได้โดยไม่เจ็บอีกแล้ว")])
S(name="s15_ready2",set="condo",cam=dict(x=-300,y=-360,z=1.6),
  actors=[FAH(x=-300,mood="happy",prop="bowlP",arms="hold")],ui=[TIP(True,"อยู่คนเดียวได้")],
  say=[N("อยู่คนเดียวได้ โดยไม่รู้สึกว่าขาด")])
S(name="s16_ready3",set="condo",cam=dict(x=-280,y=-400,z=2.0),dof=dict(bg=3),
  actors=[FAH(x=-280,mood="smile",prop="notebookP",arms="hold")],ui=[TIP(True,"รู้ว่าเรียนรู้อะไร")],
  say=[N("และรู้แล้วว่า จากรักครั้งก่อน"),N("เธอได้เรียนรู้อะไร")])

# ---------- 5) เริ่มจากเพื่อน ค่อยเป็นค่อยไป ----------
S(name="s17_ton_arrives",set="pottery",setOpts=POT,cut="whip",cam=dict(x=[[0,0],[3,20]],y=-330,z=1.45),
  actors=[PS("fah",-240,mood="shock",view="front",arms="give"),PS("ton",240,mood="laugh",view="front",arms="give")],sfx=[SFX("door",0.1,0.4)],
  say=[N("ส่วนต้น เขาไม่ได้หายไปไหน"),N("เขามาลงเรียนปั้นดินด้วย ในฐานะเพื่อน")])
S(name="s18_friends",set="pottery",setOpts=POT,cam=dict(x=240,y=-360,z=2.3),dof=dict(bg=5),
  actors=[PS("ton",240,mood="laugh",view="front",arms="give")],ui=[TIP(True,"เริ่มจากเพื่อน")],
  say=[N("ครั้งนี้ ไม่มีใครรีบ"),N("ไม่มีใครถูกใช้แทนใคร")])
S(name="s19_laugh",set="pottery",setOpts=POT,cam=dict(x=-240,y=-360,z=2.3),dof=dict(bg=5),
  actors=[PS("fah",-240,mood="laugh",view="front",arms="give")],sfx=[SFX("chime",0.3,0.25)],
  say=[F("ของต้นเบี้ยวกว่าของฟ้าอีก!")])
S(name="s20_end",set="pottery",setOpts=POT,cam=dict(x=0,y=-380,z=1.3),
  actors=[PS("fah",-240,mood="happy",view="front",arms="give"),PS("ton",240,mood="laugh",view="front",arms="give")],
  ui=[dict(type="quote",t0=0.3,t1=99,lines=["เราพร้อมรักใหม่","ไม่ใช่ตอนที่เจอใคร","แต่ตอนที่อยู่คนเดียวได้"])],
  say=[dict(who="narrator",text="เราพร้อมรักใหม่ ไม่ใช่ตอนที่เจอใคร แต่ตอนที่อยู่คนเดียวได้อย่างมีความสุข",sub="")])

ep=dict(id="ST007",engine="flat",fps=30,set="rooftop",title="พร้อมรักใหม่หรือยัง",music="family",musicGain=1.0,ambience="auto",ambienceGain=0.12,handheld=0.7,shots=sh)
json.dump(ep,open("/home/claude/recover/shorts-factory/rodkit/episodes/ST007.ep.json","w"),ensure_ascii=False,indent=1)
print(len(sh), sum(len(x["text"]) for s in sh for x in s.get("say",[])),"chars")
