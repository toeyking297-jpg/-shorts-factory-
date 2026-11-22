# ST005 "ข้อความที่ไม่ได้ส่ง" — เลิกกับแฟนแล้วควรทำยังไง (ผู้บรรยายต่อเนื่อง ห้ามเงียบเกิน 1.5 วิ)
import json
def A(who,**k): d=dict(who=who,s=0.62,y=230,view="front",light="litL"); d.update(k); return d
FAH=lambda **k: A("fah",**dict(dict(seed=4),**k))
PHUM=lambda **k: A("phum",**dict(dict(seed=5,mood="flat"),**k))
BED=lambda **k: FAH(**dict(dict(x=150,y=110,layer="back",sink=170,clipY=0),**k))
PHONE=dict(prop="phone",arms="phone")
N=lambda t: dict(who="narrator",text=t)
F=lambda t: dict(who="fah",text=t)
P=lambda t: dict(who="phum",text=t)
TIP=lambda ok,txt,y=300: dict(type="tip",t0=0.15,t1=99,do=ok,text=txt,y=y)
NIGHT=dict(night=True)
SFX=lambda n,at,g=0.6,prompt=None,ln=None: dict(name=n,at=at,gain=g,**({"prompt":prompt,"len":ln} if prompt else {}))
sh=[]
def S(**k): sh.append(k)

# ---------- 1) ฮุก ----------
S(name="s01_draft",set="condo",setOpts=NIGHT,cam=dict(x=[[0,140],[3,150]],y=-330,z=[[0,1.9],[3,2.05]]),dof=dict(bg=4),
  actors=[BED(mood="worried",**PHONE)],
  ui=[dict(type="chat",t0=0.1,t1=99,y=880,dark=True,time="02:14",msgs=[dict(me=True,text="ถึงบ้านยัง",read="อ่านแล้ว")],typing="นอนยัง… คิดถึงนะ",erase=True,typeSec=1.1,hold=0.5)],
  sfx=[SFX("typing",0.4,0.5)],say=[N("ตีสอง ฟ้าพิมพ์ข้อความเดิมเป็นครั้งที่สิบ")])
S(name="s02_bed_wide",set="condo",setOpts=NIGHT,cam=dict(x=[[0,0],[3,60]],y=-380,z=[[0,1.15],[3,1.25]]),
  actors=[BED(mood="worried",**PHONE)],
  ui=[dict(type="title",t0=0.2,t1=99,y=420,text="ข้อความ ที่ไม่ได้ส่ง",size=96)],
  say=[N("แล้วก็ลบทิ้ง เหมือนทุกคืนตั้งแต่เลิกกับภูมิ")])
S(name="s03_photo",set="condo",setOpts=NIGHT,cam=dict(x=[[0,400],[3,410]],y=[[0,-1500],[3,-1490]],z=[[0,3.0],[3,3.3]]),dof=dict(bg=0),
  say=[N("สามปีที่คบกัน จบลงด้วยประโยคเดียว")],sfx=[SFX("chime",0.3,0.35)])
S(name="s04_flash_break",set="office",setOpts=dict(late=True),grade="sepia",cam=dict(x=20,y=-370,z=1.4),
  actors=[FAH(x=-170,mood="worried",view="side",dir=1),PHUM(x=260,view="side",dir=-1)],
  say=[P("เราห่างกันสักพักเถอะนะฟ้า"),F("ห่าง… แค่ไหนเหรอ")])

# ---------- 2) สิ่งที่ไม่ควรทำ ----------
S(name="s05_stalk",set="condo",setOpts=dict(night=True,mess=True),cut="whip",cam=dict(x=150,y=-360,z=1.7),
  actors=[BED(mood="worried",**PHONE)],ui=[TIP(False,"ส่องโซเชียลเขาทุกคืน")],
  say=[N("ช่วงแรก ฟ้าทำทุกอย่างที่ไม่ควรทำ"),N("ส่องไอจีเขาทุกคืน ว่าไปไหน กับใคร")])
S(name="s06_drunk_call",set="condo",setOpts=dict(night=True,mess=True),grade="night",cam=dict(x=[[0,120],[3,160]],y=-350,z=[[0,1.9],[3,2.1]]),handheld=1.4,
  actors=[BED(mood="pain",**PHONE)],ui=[TIP(False,"โทรหาตอนเมา")],sfx=[SFX("phone_buzz",0.1,0.4)],
  say=[F("ภูมิ… กลับมาคุยกันได้ไหม"),N("โทรหาเขาตอนเมา"),N("ทั้งที่รู้ว่าพรุ่งนี้ต้องเสียใจ")])
S(name="s07_fake_smile",set="office",cut="whip",cam=dict(x=20,y=-370,z=1.45),
  actors=[FAH(x=-200,mood="laugh"),A("te",seed=6,x=250,view="side",dir=-1,mood="worried")],ui=[TIP(False,"ฝืนยิ้มว่าไม่เป็นไร")],
  say=[dict(who="te",text="พี่ฟ้าโอเคป่ะ"),F("สบายมาก! ไม่เป็นไรเลย")])
S(name="s08_ask_friend",set="office",cam=dict(x=-60,y=-360,z=1.6),
  actors=[FAH(x=-200,mood="worried",view="side",dir=1),A("te",seed=6,x=200,view="side",dir=-1,mood="shock")],ui=[TIP(False,"ถามเพื่อนเรื่องเขา")],
  say=[F("เมื่อวานภูมิไปกินข้าวกับใครเหรอ"),N("ยิ่งพยายามจับไว้ ก็ยิ่งเจ็บ")])

# ---------- 3) จุดเปลี่ยน + สิ่งที่ควรทำ ----------
S(name="s09_jan",set="office",setOpts=dict(late=True),cut="whip",cam=dict(x=0,y=-370,z=1.5),
  actors=[FAH(x=-200,mood="worried"),A("jan",seed=7,x=220,view="side",dir=-1,mood="smile")],
  say=[dict(who="jan",text="ร้องไห้ได้นะฟ้า ไม่ต้องเก่งตลอดเวลา")])
S(name="s10_cry",set="office",setOpts=dict(late=True),cam=dict(x=-200,y=-470,z=[[0,2.4],[3,2.6]]),dof=dict(bg=5),
  actors=[FAH(x=-200,mood="pain")],ui=[TIP(True,"ยอมให้ตัวเองเสียใจ")],sfx=[SFX("sigh",0.2,0.5,"tired adult woman soft sigh",1.0)],
  say=[N("คืนนั้น ฟ้าร้องไห้ออกมาจริงๆ เป็นครั้งแรก")])
S(name="s11_jan_advice",set="office",setOpts=dict(late=True),cam=dict(x=220,y=-470,z=2.3),dof=dict(bg=5),
  actors=[A("jan",seed=7,x=220,mood="smile",arms="give")],
  say=[dict(who="jan",text="ดูแลตัวเองก่อน กินให้ได้ นอนให้พอ")])
S(name="s12_eat",set="condo",cut="whip",cam=dict(x=-300,y=-360,z=1.6),
  actors=[FAH(x=-300,mood="smile",prop="bowlP",arms="hold")],ui=[TIP(True,"กินให้ครบ นอนให้พอ")],sfx=[SFX("eat",0.6,0.5)],
  say=[N("เธอเริ่มจากเรื่องเล็กๆ"),N("กินข้าวให้ครบมื้อ เข้านอนก่อนเที่ยงคืน")])
S(name="s13_walk",set="park",cam=dict(x=[[0,-500],[3.5,-100]],y=-380,z=1.35),
  actors=[FAH(view="side",dir=1,x=[[0,-900],[3.5,0]],mood="smile")],ui=[TIP(True,"ขยับร่างกาย")],sfx=[SFX("steps",0.2,0.4)],
  say=[N("ออกไปเดินตอนเช้า ให้ร่างกายช่วยพยุงใจ")])
S(name="s14_journal",set="condo",cam=dict(x=-280,y=-400,z=2.0),dof=dict(bg=3),
  actors=[FAH(x=-280,mood="flat",prop="notebookP",arms="hold")],ui=[TIP(True,"เขียนความรู้สึกออกมา")],
  sfx=[SFX("typing",0.3,0.25)],
  say=[N("เขียนสิ่งที่รู้สึกลงสมุด แทนที่จะส่งไปหาเขา")])
S(name="s15_mute",set="condo",cam=dict(x=150,y=-340,z=1.9),dof=dict(bg=3),
  actors=[BED(mood="flat",**PHONE)],ui=[TIP(True,"ให้พื้นที่ ไม่ติดต่อ")],sfx=[SFX("pop",0.6,0.4)],
  say=[N("และปิดเสียงโซเชียลของเขา"),N("ไม่ใช่เพราะเกลียด แต่เพื่อให้พื้นที่กัน")])
S(name="s16_photo_down",set="condo",setOpts=dict(photo="down"),cam=dict(x=[[0,400],[3,390]],y=-1420,z=[[0,3.0],[3,2.6]]),
  say=[N("การให้พื้นที่ คือการให้ทั้งสองคน ได้หายใจ")])

# ---------- 4) ปรับปรุงตัว + ความเชื่อผิด ----------
S(name="s17_own_part",set="office",cut="whip",cam=dict(x=-200,y=-380,z=1.9),dof=dict(bg=3),
  actors=[FAH(x=-200,mood="worried",**PHONE)],
  ui=[dict(type="chat",t0=0.4,t1=99,y=880,s=0.85,name="ภูมิ",msgs=[dict(me=True,text="ขอโทษ วันนี้ติดงานอีกแล้ว"),dict(me=True,text="เลื่อนก่อนนะ"),dict(me=False,text="อีกแล้วเหรอ…"),dict(me=True,text="ไว้วันหลังนะ")])],
  say=[N("ฟ้าเริ่มเห็นส่วนของตัวเอง"),N("นัดที่ถูกเลื่อน ครั้งแล้วครั้งเล่า")])
S(name="s18_belief",set="office",cam=dict(x=-200,y=-470,z=2.4),dof=dict(bg=4),
  actors=[FAH(x=-200,mood="happy")],ui=[dict(type="bubble",t0=0.3,t1=99,y=460,text="ถ้าฟ้าดีขึ้น ภูมิต้องกลับมา")],
  say=[F("ถ้าฟ้าดีขึ้น ภูมิต้องกลับมาแน่")])
S(name="s19_tell_phum",set="park",cut="whip",cam=dict(x=40,y=-380,z=1.45),
  actors=[FAH(x=-200,view="side",dir=1,mood="smile"),PHUM(x=260,view="side",dir=-1)],
  say=[F("ฟ้าเปลี่ยนแล้วนะ ไม่เลื่อนนัดแล้ว")])
S(name="s20_phum_reply",set="park",cam=dict(x=260,y=-470,z=2.4),dof=dict(bg=5),
  actors=[PHUM(x=260,mood="smile")],
  say=[P("ดีใจกับฟ้าจริงๆ นะ"),P("แต่เราเดินต่อมาไกลแล้ว")])

# ---------- 5) สายไป + จบ ----------
S(name="s21_too_late",set="park",cam=dict(x=-200,y=-470,z=[[0,2.3],[3,2.6]]),dof=dict(bg=6),
  actors=[FAH(x=-200,mood="pain")],sfx=[SFX("chime",0.2,0.35)],
  say=[N("บางเรื่อง เมื่อสายไปแล้ว ก็คือสายไป")])
S(name="s22_delete",set="condo",setOpts=NIGHT,cam=dict(x=150,y=-330,z=2.0),dof=dict(bg=4),
  actors=[BED(mood="flat",**PHONE)],
  ui=[dict(type="chat",t0=0.1,t1=99,y=880,dark=True,time="23:40",msgs=[dict(me=True,text="ถึงบ้านยัง",read="อ่านแล้ว")],typing="ขอบคุณสำหรับสามปีนะ",erase=True,typeSec=1.2,hold=0.8)],
  say=[N("คืนนั้น ฟ้าไม่ได้ส่งอะไรอีก"),N("การยอมรับ คือสิ่งสุดท้ายที่ยังทำได้")])
S(name="s23_months",set="park",cut="whip",cam=dict(x=[[0,-500],[4,-80]],y=-380,z=1.35),
  actors=[FAH(view="side",dir=1,x=[[0,-900],[4,0]],mood="happy")],
  ui=[dict(type="chip",t0=0.1,t1=99,x=40,y=150,w=360,icon="clock",text="สามเดือนต่อมา"),TIP(True,"คาดหวังกับตัวเอง",y=330)],
  say=[N("อย่าคาดหวังว่าเขาจะกลับมา"),N("ให้คาดหวังว่าวันหนึ่ง"),N("เราจะนึกถึงเขาได้ โดยไม่เจ็บ")])
S(name="s24_greet",set="office",cam=dict(x=40,y=-370,z=1.45),
  actors=[FAH(x=[[0,-450],[2.5,-200]],view="side",dir=1,mood="smile"),PHUM(x=260,view="side",dir=-1,mood="smile")],
  say=[P("สวัสดีฟ้า"),F("สวัสดีจ้ะ")])
S(name="s25_end",set="condo",setOpts=dict(photo="none"),cam=dict(x=-100,y=-400,z=1.3),
  actors=[FAH(x=-300,mood="smile")],
  ui=[dict(type="quote",t0=0.3,t1=99,lines=["สิ่งที่สายไปสำหรับเขา","ไม่เคยสายไป","สำหรับตัวเรา"])],
  say=[dict(who="narrator",text="สิ่งที่สายไปสำหรับเขา ไม่เคยสายไปสำหรับตัวเรา",sub="")])

ep=dict(id="ST005",engine="flat",fps=30,set="condo",title="ข้อความที่ไม่ได้ส่ง",music="family",musicGain=1.0,ambience="auto",ambienceGain=0.12,handheld=0.7,shots=sh)
json.dump(ep,open("/home/claude/recover/shorts-factory/rodkit/episodes/ST005.ep.json","w"),ensure_ascii=False,indent=1)
print(len(sh), sum(len(x["text"]) for s in sh for x in s.get("say",[])),"chars")
