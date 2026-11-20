import json
TOP=-187
def A(who,**k): d=dict(who=who,s=0.62,y=230,view="front",light="litL"); d.update(k); return d
def SEAT(who,x,sink,**k): d=dict(who=who,s=0.62,y=20,x=x,view="front",layer="back",sink=sink,clipY=0,light="litL"); d.update(k); return d
DIN=dict(eve=True,bare=True,chairs=[-420,-60,300,620])
BOON=lambda **k: SEAT("boon",-43,40,**dict(dict(s=0.58,seed=3,mood="flat"),**k))
SOUP=lambda x=-43,**k: dict(dict(type="soup",x=x,y=TOP,s=0.8),**k)
SP1=dict(type="spoon",x=30,y=TOP+4,s=1.2)
SP2=lambda x=170,**k: dict(dict(type="spoon",x=x,y=TOP+4,s=1.5,ang=8),**k)
SFX=lambda n,at,g=0.6,prompt=None,ln=None: dict(name=n,at=at,gain=g,**({"prompt":prompt,"len":ln} if prompt else {}))
sh=[]
def S(**k): sh.append(k)
# --- เปิด 0–8 ---
S(name="s01_taste",set="dining",setOpts=DIN,cam=dict(x=-20,y=-280,z=[[0,2.2],[3,2.4]]),dof=dict(bg=6),
  actors=[BOON(mood="flat")],props=[SOUP(),SP1],say=[dict(who="boon",text="เค็มไป…")],sfx=[SFX("spoonclink",0.1,0.5,"metal spoon clinking ceramic bowl, quiet room",0.8)])
S(name="s02_spoon2",set="dining",setOpts=DIN,dur=2.4,cam=dict(x=150,y=-200,z=3.2),dof=dict(bg=7),
  props=[SOUP(),SP1,SP2(x=[[0,60],[0.9,170]])],sfx=[SFX("spoonplace",0.6,0.5,"metal spoon placed gently on wooden table",0.6)])
S(name="s03_mali_tired",set="kitchen",dur=2.0,cam=dict(x=-300,y=-380,z=2.2),dof=dict(bg=6),
  actors=[A("mali",x=-300,mood="worried",seed=2,prop="ladle",arms="hold")],sfx=[SFX("sigh",0.4,0.5,"tired adult woman soft sigh",1.0)])
# --- 8–25 ---
S(name="s04_mon",set="dining",setOpts=DIN,cut="whip",cam=dict(x=[[0,-20],[4,20]],y=-330,z=1.45),
  actors=[BOON(mood="smile",arms="give"),A("mali",view="side",dir=1,x=[[0,-650],[3.5,700]],mood="flat",seed=2,prop="bowlP",arms="hold")],
  props=[SOUP(),SP1,SP2()],ui=[dict(type="chip",t0=0.1,t1=99,x=40,y=150,w=300,icon="clock",text="วันจันทร์")],
  say=[dict(who="boon",text="จืดไปนะลูก มาชิมดูสิ")])
S(name="s04b_laundry",set="backyard",cam=dict(x=[[0,-80],[3,-40]],y=-640,z=1.4),dof=dict(bg=3),
  actors=[A("mali",view="side",dir=1,x=-60,y=200,mood="flat",seed=2,arms="give")],
  say=[dict(who="mali",text="หนูยุ่งค่ะแม่")])
S(name="s05_tue",set="dining",setOpts=DIN,cut="whip",cam=dict(x=[[0,20],[4,-20]],y=-330,z=1.45),
  actors=[BOON(mood="smile",arms="give")],
  props=[SOUP(),SP1,SP2()],ui=[dict(type="chip",t0=0.1,t1=99,x=40,y=150,w=300,icon="clock",text="วันอังคาร")],
  say=[dict(who="boon",text="เผ็ดไป… มานั่งชิมก่อน")])
S(name="s05b_phone",set="housefront",cam=dict(x=[[0,-160],[3,-120]],y=-420,z=1.45),dof=dict(bg=3),
  actors=[A("mali",x=-120,y=200,mood="flat",seed=2,prop="phone",arms="phone")],
  say=[dict(who="mali",text="เดี๋ยวค่ะแม่")])
S(name="s06_wed_watch",set="dining",setOpts=DIN,cut="whip",dur=3.0,cam=dict(x=-43,y=-300,z=[[0,2.2],[3,2.6]]),dof=dict(bg=6),
  actors=[BOON(mood="worried",dir=1)],props=[SOUP(),SP1],ui=[dict(type="chip",t0=0.1,t1=99,x=40,y=150,w=300,icon="clock",text="วันพุธ")],
  sfx=[SFX("busyhouse",0,0.35,"distant footsteps hurrying, broom sweeping in another room",3.0)])
S(name="s07_tease",set="kitchen",cut="whip",cam=dict(x=[[0,-40],[4,0]],y=-360,z=1.3),
  actors=[A("chai",x=120,mood="laugh",seed=4),A("khaohom",x=330,mood="laugh",seed=1),A("mali",view="side",dir=1,x=-330,mood="worried",seed=2,prop="ladle",arms="hold",listen=False)],
  say=[dict(who="chai",text="ยายติอีกแล้วเหรอ"),dict(who="khaohom",text="เค็มไป~ จืดไป~")],sfx=[SFX("giggle",1.8,0.4,"father and young daughter giggling quietly",1.2)])
S(name="s08_hurt",set="kitchen",dur=1.8,cam=dict(x=-330,y=-390,z=2.4),dof=dict(bg=7),
  actors=[A("mali",view="side",dir=1,x=-330,mood="worried",seed=2,prop="ladle",arms="hold")])
# --- 25–65 ---
S(name="s09_night",set="kitchen",grade="night",cut="whip",cam=dict(x=-300,y=-380,z=[[0,1.9],[4,2.2]]),dof=dict(bg=6),
  actors=[A("mali",x=-300,mood="worried",seed=2)],say=[dict(who="mali",text="พรุ่งนี้ไม่ทำแล้ว ซื้อเอา จะได้ไม่ต้องโดนติ")],
  sfx=[SFX("drawer",0.2,0.8,"kitchen drawer slammed shut",0.6)])
S(name="s10_market",set="market",setOpts=dict(stall="food"),cut="whip",cam=dict(x=[[0,-160],[4,-120]],y=-380,z=1.35),
  actors=[dict(who="jaew",s=0.62,y=0,x=80,view="front",layer="back",light="litL",mood="smile",seed=3),A("mali",x=-420,mood="flat",seed=2)],
  say=[dict(who="jaew",text="อ้าว ปกติแม่มะลิทำเองไม่ใช่เหรอ"),dict(who="mali",text="ทำไปก็โดนติค่ะป้า")])
S(name="s10b_home_box",set="housefront",setOpts=dict(gateOpen=[[0,0.2],[1.2,1]]),dur=2.4,cam=dict(x=[[0,-500],[2.4,-200]],y=-420,z=1.25),
  actors=[A("mali",view="side",dir=1,x=[[0,-900],[2.4,-80]],y=200,mood="flat",seed=2,prop="porkbag",arms="hold")])
S(name="s11_box_dinner",set="dining",setOpts=DIN,cut="whip",dur=3.2,cam=dict(x=-20,y=-330,z=[[0,1.5],[3.2,1.7]]),dof=dict(bg=4),
  actors=[BOON(mood="flat")],props=[dict(type="foodbox",x=-43,y=TOP,s=0.8,n=1),SP1],sfx=[SFX("clock",0,0.4,"quiet wall clock ticking in silent room",3.2)])
S(name="s12_mali_listens",set="kitchen",dur=2.6,cam=dict(x=-300,y=-390,z=2.3),dof=dict(bg=6),
  actors=[A("mali",x=-300,mood=[[0,"flat"],[1.4,"smile"]],seed=2)])
S(name="s13_spoon_out",set="dining",setOpts=DIN,dur=2.8,cam=dict(x=100,y=-230,z=2.4),dof=dict(bg=6),
  actors=[BOON(mood="smile")],props=[dict(type="foodbox",x=-43,y=TOP,s=0.8,n=1),SP1,SP2(x=[[0,60],[0.9,170]])])
S(name="s14_spoon_back",set="dining",setOpts=DIN,dur=3.2,cam=dict(x=100,y=-230,z=2.4),dof=dict(bg=6),
  actors=[BOON(mood=[[0,"smile"],[1.2,"flat"]])],props=[dict(type="foodbox",x=-43,y=TOP,s=0.8,n=1),SP1,SP2(x=[[0,170],[1.6,170],[2.4,40]],op=[[0,1],[2.2,1],[2.5,0]])],
  sfx=[SFX("spoonaway",1.8,0.4,"metal spoon slid quietly off a table",0.6)])
S(name="s15_boxes",set="kitchen",cut="whip",cam=dict(x=-300,y=-380,z=[[0,1.6],[5,1.9]]),dof=dict(bg=4),
  props=[dict(type="foodbox",x=-300,y=-330,s=0.9,n=[[0,1],[1.5,2],[3,3]])],ui=[dict(type="chip",t0=0.1,t1=99,x=40,y=150,w=300,icon="clock",text="สามวันต่อมา")],
  say=[dict(who="narrator",text="สามวันแล้ว ยายไม่ติอะไรเลยสักคำ… แต่ก็แทบไม่ได้กินด้วย")],sfx=[SFX("boxdrop",1.5,0.4,"plastic food container set down on counter",0.5),SFX("boxdrop",3.0,0.4,"plastic food container set down on counter",0.5)])
S(name="s16_kid_tells",set="kitchen",cam=dict(x=-120,y=-340,z=1.65),
  actors=[A("mali",x=-300,mood="worried",seed=2),A("khaohom",x=80,mood="flat",seed=1)],props=[dict(type="foodbox",x=-300,y=-330,s=0.9,n=3)],
  say=[dict(who="mali",text="ยายไม่สบายรึเปล่าลูก"),dict(who="khaohom",text="ไม่หรอก ยายถามทุกวันว่าแม่ยุ่งอยู่มั้ย")])
# --- 65–100 เฉลยด้วยการกระทำ ---
S(name="s17_clock6",set="dining",setOpts=DIN,dur=1.8,cam=dict(x=250,y=-1050,z=2.6),dof=dict(bg=2),sfx=[SFX("clock",0,0.5,"quiet wall clock ticking in silent room",1.8)])
S(name="s18_two_spoons",set="dining",setOpts=DIN,dur=3.2,cam=dict(x=60,y=-260,z=1.9),dof=dict(bg=5),
  actors=[BOON(mood="smile")],props=[dict(type="foodbox",x=-43,y=TOP,s=0.8,n=1),SP1,SP2(x=[[0,60],[1.0,170]])])
S(name="s19_wait",set="dining",setOpts=DIN,dur=3.4,cam=dict(x=-43,y=-300,z=[[0,2.4],[3.4,2.9]]),dof=dict(bg=7),
  actors=[BOON(mood=[[0,"smile"],[2.2,"flat"]])],sfx=[SFX("clock",0,0.45,"quiet wall clock ticking in silent room",3.4)])
S(name="s20_spoon_back2",set="dining",setOpts=DIN,dur=2.6,cam=dict(x=150,y=-200,z=3.2),dof=dict(bg=7),
  props=[SP2(x=[[0,170],[0.8,170],[1.8,40]],op=[[0,1],[1.6,1],[1.9,0]])])
S(name="s21_one_bite",set="dining",setOpts=DIN,dur=3.0,cam=dict(x=-20,y=-300,z=2.1),dof=dict(bg=6),
  actors=[BOON(mood="flat")],props=[dict(type="foodbox",x=-43,y=TOP,s=0.8,n=1),SP1])
S(name="s22_mali_door",set="dining",setOpts=DIN,dur=2.4,cam=dict(x=640,y=-400,z=2.4),dof=dict(bg=7),
  actors=[A("mali",x=640,mood="worried",seed=2)],sfx=[SFX("piano",0.3,0.5,"single soft emotional piano note",2.0)])
for i,(day,lbl) in enumerate([("จันทร์","s23"),("อังคาร","s24"),("พุธ","s25")]):
    S(name=f"{lbl}_flash",set="dining",setOpts=DIN,grade="sepia",dur=1.3 if i<2 else 3.2,lockDur=True,cam=dict(x=60,y=-300,z=1.8),dof=dict(bg=5),
      actors=[BOON(mood="smile",arms="give")],props=[SOUP(),SP1,SP2()],
      ui=([dict(type="bubble",t0=0.3,t1=99,x=540,y=430,text="ที่แม่ติ… คือชวนให้นั่งด้วยกัน",color="#FFE7A0",think=False)] if i==2 else []))
# --- 100–120 ---
S(name="s26_cook_again",set="kitchen",cut="whip",dur=3.4,cam=dict(x=-400,y=-380,z=[[0,1.8],[3.4,2.0]]),dof=dict(bg=5),
  actors=[A("mali",x=-300,mood="smile",seed=2,prop="ladle",arms="stir")],sfx=[SFX("simmer",0,0.5,"soup simmering in pot, ladle stirring",3.4)])
S(name="s27_sit_down",set="dining",setOpts=DIN,dur=3.0,cam=dict(x=120,y=-360,z=1.45),
  actors=[BOON(mood="flat"),A("mali",view="side",dir=-1,x=[[0,700],[2.2,260]],mood="smile",seed=2,prop="bowlP",arms="hold")],props=[SP1])
S(name="s28_together",set="dining",setOpts=DIN,cam=dict(x=80,y=-320,z=1.6),dof=dict(bg=4),
  actors=[BOON(mood=[[0,"shock"],[1.0,"happy"]]),SEAT("mali",216,55,seed=2,mood="happy")],props=[SOUP(),SOUP(x=216),SP1,SP2()],
  say=[dict(who="boon",text="เค็มไปนิดนึงนะ"),dict(who="mali",text="งั้นแม่ช่วยกินให้หมดนะคะ")],sfx=[SFX("softlaugh",3.2,0.35,"two women laughing softly together",1.2)])
S(name="s29_empty_bowls",set="dining",setOpts=DIN,dur=3.0,cam=dict(x=90,y=-210,z=2.6),dof=dict(bg=7),
  props=[SOUP(full=[[0,1],[2.5,0]]),SOUP(x=216,full=[[0,1],[2.5,0]]),SP1,SP2()])
S(name="s30_full_table",set="dining",setOpts=DIN,cut="whip",dur=4.5,cam=dict(x=[[0,70],[4.5,80]],y=-340,z=[[0,1.2],[4.5,1.12]]),
  actors=[SEAT("mali",216,55,seed=2,mood="happy"),BOON(mood="happy"),SEAT("chai",-302,55,mood="laugh",seed=4),SEAT("khaohom",446,12,mood="happy",seed=1)],
  props=[SOUP(x=-302,s=0.7),SOUP(s=0.7),SOUP(x=216,s=0.7),SOUP(x=446,s=0.7)],sfx=[SFX("family",0.4,0.4,"warm family dinner chatter and light laughter",3.5)])
ep=dict(id="ST004",engine="flat",fps=30,set="dining",title="เค็มไป",music="family",musicGain=1.1,targetSec=120,ambience="auto",ambienceGain=0.12,handheld=0.7,shots=sh)
json.dump(ep,open("/home/claude/recover/shorts-factory/rodkit/episodes/ST004.ep.json","w"),ensure_ascii=False,indent=1)
print(len(sh))
