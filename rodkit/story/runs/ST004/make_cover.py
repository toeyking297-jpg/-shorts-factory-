from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
import numpy as np, math, glob
D='/home/claude/recover/shorts-factory/'; F=D+'assets/fonts/'
fs=sorted(glob.glob(D+'rodkit/build/ST004_CUT/still_*.jpg'))
def cut(p):
    a=np.asarray(Image.open(p).convert('RGB')).astype(int); r,g,b=a[...,0],a[...,1],a[...,2]
    m=((g-np.maximum(r,b))>60)
    al=np.where(m,0,255).astype('uint8'); im=Image.fromarray(a.astype('uint8')).convert('RGBA'); im.putalpha(Image.fromarray(al).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8)))
    # ลดคราบเขียวที่ขอบ
    arr=np.asarray(im).copy(); g2=arr[...,1].astype(int); lim=np.maximum(arr[...,0],arr[...,2]).astype(int)
    arr[...,1]=np.minimum(g2,lim+10).astype('uint8'); im=Image.fromarray(arr)
    return im.crop(im.getbbox())
def sticker(im,w=16,c=(255,255,255,255)):
    pad=w*2; base=Image.new('RGBA',(im.width+pad*2,im.height+pad*2),(0,0,0,0)); base.alpha_composite(im,(pad,pad))
    a=base.split()[3].filter(ImageFilter.MaxFilter(w*2+1))
    out=Image.new('RGBA',base.size,c); out.putalpha(a)
    sh=Image.new('RGBA',base.size,(40,10,10,150)); sh.putalpha(a.point(lambda v:v*0.55)); sh=sh.filter(ImageFilter.GaussianBlur(14))
    fin=Image.new('RGBA',(base.width+30,base.height+30),(0,0,0,0)); fin.alpha_composite(sh,(18,24)); fin.alpha_composite(out,(0,0)); fin.alpha_composite(base,(0,0)); return fin
boon,mali,props=[cut(p) for p in fs]
W,H=1080,1920
# พื้น: แดงส้มไล่เฉด + รัศมีแสง
y=np.linspace(0,1,H)[:,None]; top=np.array([232,74,46]); bot=np.array([140,24,30])
bg=(top*(1-y)+bot*y)[:,None,:].repeat(W,1)[:,:,0,:] if False else (top[None,None,:]*(1-y[...,None])+bot[None,None,:]*y[...,None]).repeat(W,1)
cv=Image.fromarray(bg.astype('uint8')).convert('RGBA')
rays=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(rays); cx,cy=W*0.42,H*0.56
for i in range(18):
    a0=i*20*math.pi/180; a1=a0+9*math.pi/180; R=2600
    d.polygon([(cx,cy),(cx+R*math.cos(a0),cy+R*math.sin(a0)),(cx+R*math.cos(a1),cy+R*math.sin(a1))],fill=(255,200,90,38))
cv.alpha_composite(rays)
glow=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(glow).ellipse([cx-520,cy-520,cx+520,cy+520],fill=(255,190,90,120)); cv.alpha_composite(glow.filter(ImageFilter.GaussianBlur(120)))
def place(im,w,x,y_bottom=None,y=None,rot=0):
    im=im.resize((w,int(im.height*w/im.width)),Image.LANCZOS)
    if rot: im=im.rotate(rot,expand=True,resample=Image.BICUBIC)
    st=sticker(im); yy=y if y is not None else y_bottom-st.height
    cv.alpha_composite(st,(int(x),int(yy))); return st
# ยายใหญ่ซ้าย (ล้นขอบล่าง), มะลิขวา
place(boon,640,-30,y=690)
place(mali,470,610,y=900)
# ชาม + ช้อน 2 คันล่างกลาง บนวงขาว
pl=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(pl).rounded_rectangle([70,1560,1010,1880],60,fill=(255,244,220,255),outline=(45,14,10,255),width=8); cv.alpha_composite(pl.filter(ImageFilter.GaussianBlur(2)))
pr=props.resize((820,int(props.height*900/props.width)),Image.LANCZOS)
px,py=120,1725-pr.height//2; cv.alpha_composite(pr,(px,py))
# วงปากกาเหลืองรอบช้อนคันที่ 2 + ลูกศร
d=ImageDraw.Draw(cv); sx0=px+int(pr.width*0.70); sx1=px+pr.width+20; sy0=py-30; sy1=py+pr.height+30
for k in range(3): d.ellipse([sx0-14+k*3,sy0-k*2,sx1+k*2,sy1+k*3],outline=(255,224,60,255),width=12)
fb=ImageFont.truetype(F+'Kanit-Black.ttf',58)
def ttext(xy,txt,font,fill,stroke=0,sc=(40,14,10),anchor='la'):
    d.text(xy,txt,font=font,fill=fill,stroke_width=stroke,stroke_fill=sc,anchor=anchor)
ttext((sx0+40,1545),'ช้อนคันที่ 2 ?',fb,(255,230,70),9,anchor='ms')
# หัวเรื่องใหญ่
tl=Image.new('RGBA',(W,700),(0,0,0,0)); td=ImageDraw.Draw(tl)
f1=ImageFont.truetype(F+'Kanit-Black.ttf',225)
td.text((W//2+10,330),'"เค็มไป!"',font=f1,fill=(30,8,6,170),anchor='mm',stroke_width=26,stroke_fill=(30,8,6,170))
td.text((W//2,316),'"เค็มไป!"',font=f1,fill=(255,226,64),anchor='mm',stroke_width=22,stroke_fill=(45,14,10))
tl=tl.rotate(-4,resample=Image.BICUBIC); cv.alpha_composite(tl,(0,-20))
# แถบคำถาม
f2=ImageFont.truetype(F+'Kanit-Black.ttf',70); txt='แม่ติทุกวัน… เพราะอะไร?'
bb=d.textbbox((0,0),txt,font=f2); tw=bb[2]-bb[0]
bx=(W-tw)//2-40; d.rounded_rectangle([bx,540,bx+tw+80,650],28,fill=(25,20,30,235)); d.text((W//2,592),txt,font=f2,fill=(255,255,255),anchor='mm')
# ป้ายช่อง
f3=ImageFont.truetype(F+'Kanit-Black.ttf',46); d.rounded_rectangle([36,40,262,118],38,fill=(255,226,64),outline=(45,14,10),width=6); d.text((149,78),'ดูเพลิน',font=f3,fill=(45,14,10),anchor='mm')
cv.convert('RGB').save('/tmp/ST004_ปก.jpg',quality=93); cv.convert('RGB').resize((450,800)).save('/tmp/c.jpg')
