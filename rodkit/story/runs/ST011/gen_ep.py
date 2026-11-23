# ST011 EP.7 "ก้าวต่อไป" — คุยเงิน คุยอนาคต ไม่รีบเพราะแรงกดดัน แล้วขอแต่งงาน (ฉากใหม่ fair) จบซีรีส์
import sys; sys.path.insert(0,"/home/claude/recover/shorts-factory/rodkit/story/runs"); from fah_common import *
sh=[]; S=lambda **k: sh.append(k)
S(name="s01_fair",set="fair",cam=dict(x=[[0,0],[4,250]],y=[[0,-700],[4,-560]],z=[[0,0.95],[4,1.1]]),
  actors=[FAH(x=[[0,-500],[4,-80]],view="side",dir=1,mood="happy"),PHUM(x=[[0,-240],[4,180]],view="side",dir=1,mood="smile")],sfx=[SFX("chime",0.2,0.3)],
  say=[N("ครบหนึ่งปีที่กลับมาคบกัน"),N("ภูมิชวนฟ้าเที่ยวงานวัด"),N("เหมือนเดตแรกเมื่อหลายปีก่อน")])
S(name="s02_title",set="fair",cam=dict(x=200,y=-620,z=[[0,1.0],[3,1.1]]),
  actors=[FAH(x=-80,view="side",dir=1,mood="happy"),PHUM(x=200,view="side",dir=-1,mood="smile")],ui=[dict(type="title",t0=0.2,t1=99,y=420,text="ก้าว ต่อไป",size=110)],
  say=[N("ก่อนจะก้าวไปอีกขั้น"),N("คู่รักควรคุยอะไรกันบ้าง")])
S(name="s03_money",set="cafe",cut="whip",cam=dict(x=[[0,-60],[3.5,0]],y=-340,z=[[0,1.3],[3.5,1.4]]),
  actors=[CS("fah",-240,mood="flat"),CS("phum",240,mood="flat")],ui=[TIP(True,"คุยเรื่องเงินตรงๆ")],
  say=[N("หนึ่งเดือนก่อนหน้านั้น"),F("ก่อนไปต่อ เราคุยเรื่องเงินกันตรงๆ ได้ไหม")])
S(name="s04_phum_money",set="cafe",cam=dict(x=240,y=-330,z=2.2),dof=dict(bg=5),
  actors=[CS("phum",240,mood="flat",view="front")],
  say=[P("เรายังผ่อนรถอีกสองปี"),P("เก็บเงินได้เดือนละห้าพัน")])
S(name="s05_fah_money",set="cafe",cam=dict(x=-240,y=-330,z=2.2),dof=dict(bg=5),
  actors=[CS("fah",-240,mood="flat",view="front")],
  say=[F("ฟ้ามีเงินเก็บนิดหน่อย"),F("แต่ส่งให้แม่ทุกเดือน"),N("ไม่มีใครรวยกว่าใคร"),N("แต่ไม่มีใครซ่อนอะไร")])
S(name="s06_future",set="cafe",cam=dict(x=0,y=-330,z=1.45),
  actors=[CS("fah",-240,mood="smile"),CS("phum",240,mood="smile")],ui=[TIP(True,"วางแผนอนาคตด้วยกัน")],
  say=[P("สักวัน เราอยากกลับไปดูแลแม่"),F("งั้นเรามาหาทาง ที่ดีกับทั้งสองบ้านนะ")])
S(name="s07_te",set="office",cut="whip",cam=dict(x=20,y=-370,z=1.45),
  actors=[FAH(x=-200,mood="flat"),C_("te",x=250,view="side",dir=-1,mood="laugh")],ui=[TIP(False,"รีบเพราะคนเร่ง")],
  say=[dict(who="te",text="พี่จะสามสิบแล้ว รีบแต่งเลยสิ!"),N("ไม่ควรรีบแต่ง"),N("เพราะอายุ หรือเพราะคนรอบข้างเร่ง")])
S(name="s08_myth",set="office",cam=dict(x=-200,y=-470,z=2.4),dof=dict(bg=5),
  actors=[FAH(x=-200,mood="flat")],ui=[TIP(False,"แต่งแล้วปัญหาหาย")],
  say=[N("และอย่าคิดว่าแต่งงานแล้ว"),N("ปัญหาจะหายไปเอง")])
S(name="s09_ton_help",set="pottery",setOpts=dict(wheels=[-240,240],clay=["bowl","bowl"]),cut="whip",cam=dict(x=0,y=-330,z=1.45),
  actors=[PS("phum",-240,mood="smile"),PS("ton",240,mood="laugh")],
  say=[N("ส่วนภูมิ แอบไปเรียนปั้นดินกับต้น"),N("ปั้นถ้วยใบเล็กๆ ที่เบี้ยวนิดหน่อย")])
S(name="s10_gift",set="fair",cut="whip",cam=dict(x=60,y=-430,z=1.6),dof=dict(bg=3),
  actors=[FAH(x=-140,view="side",dir=1,mood="smile"),PHUM(x=220,view="side",dir=-1,mood="smile",prop="bowlP",arms="give")],
  say=[P("ปั้นเองนะ เบี้ยวหน่อย"),P("เหมือนเราสองคนนั่นแหละ")])
S(name="s11_ring",set="fair",cam=dict(x=-140,y=-500,z=[[0,2.4],[3,2.7]]),dof=dict(bg=6),
  actors=[FAH(x=-140,mood="shock")],ui=[BUB("แหวน…!",y=520)],sfx=[SFX("heart",0.2,0.5)],
  say=[N("ในถ้วยใบนั้น มีแหวนวงเล็กๆ วางอยู่")])
S(name="s12_propose",set="fair",cam=dict(x=220,y=-500,z=2.3),dof=dict(bg=6),
  actors=[PHUM(x=220,mood="worried",arms="wai")],ui=[TIP(True,"ไม่กดดัน")],
  say=[P("ฟ้า… แต่งงานกับเรานะ"),P("ไม่ต้องตอบตอนนี้ก็ได้ เรารอได้")])
S(name="s13_yes",set="fair",cam=dict(x=-140,y=-500,z=2.3),dof=dict(bg=6),
  actors=[FAH(x=-140,mood="happy")],sfx=[SFX("chime",0.4,0.4)],
  say=[F("ฟ้าคิดมาทั้งปีแล้ว"),F("ตกลงค่ะ")])
S(name="s14_families",set="living",cut="whip",cam=dict(x=-60,y=-380,z=1.15),
  actors=[C_("fdad",x=-470,mood="happy"),C_("fmom",x=-220,mood="happy",**PHONE),C_("fsis",x=20,mood="laugh"),FAH(x=280,mood="happy")],
  say=[N("ข่าวดีถึงสองบ้านในคืนเดียว"),N("แม่นวลโทรหาแม่ของฟ้า"),N("คุยกันจนดึก")])
S(name="s15_recap",set="riverside",cut="whip",cam=dict(x=0,y=-420,z=1.3),
  actors=[RV("fah",-200,mood="happy"),RV("phum",200,mood="happy")],
  say=[N("จากข้อความที่ไม่ได้ส่ง สู่คำว่าตกลง"),N("ไม่ใช่เพราะรักไม่เคยพัง"),N("แต่เพราะทั้งคู่ซ่อมมันด้วยกัน")])
S(name="s16_end",set="fair",cam=dict(x=[[0,200],[4,400]],y=[[0,-700],[4,-1100]],z=[[0,1.0],[4,0.8]]),
  actors=[FAH(x=-80,view="side",dir=1,mood="happy"),PHUM(x=200,view="side",dir=-1,mood="happy")],
  ui=[QUOTE(["รักที่ดี","ไม่ใช่รักที่ไม่เคยพัง","แต่คือรักที่สองคน","ช่วยกันซ่อม"])],
  say=[END("รักที่ดี ไม่ใช่รักที่ไม่เคยพัง แต่คือรักที่สองคนช่วยกันซ่อม")])
save("ST011","ก้าวต่อไป",sh,"fair")
