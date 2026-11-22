from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np, math, glob
D='/home/claude/recover/shorts-factory/'; F=D+'assets/fonts/Kanit-Black.ttf'
fs=sorted(glob.glob(D+'rodkit/build/ST007_CUT/still_*.jpg'))
def cut(p):
    a=np.asarray(Image.open(p).convert('RGB')).astype(int); m=((a[...,1]-np.maximum(a[...,0],a[...,2]))>60)
    im=Image.fromarray(a.astype('uint8')).convert('RGBA'); im.putalpha(Image.fromarray(np.where(m,0,255).astype('uint8')).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8)))
    arr=np.asarray(im).copy(); arr[...,1]=np.minimum(arr[...,1].astype(int),np.maximum(arr[...,0],arr[...,2]).astype(int)+10).astype('uint8'); im=Image.fromarray(arr); return im.crop(im.getbbox())
def sticker(im,w=16):
    pad=w*2; b=Image.new('RGBA',(im.width+pad*2,im.height+pad*2),(0,0,0,0)); b.alpha_composite(im,(pad,pad))
    a=b.split()[3].filter(ImageFilter.MaxFilter(w*2+1)); o=Image.new('RGBA',b.size,(255,255,255,255)); o.putalpha(a)
    sh=Image.new('RGBA',b.size,(10,5,30,160)); sh.putalpha(a.point(lambda v:v*0.6)); sh=sh.filter(ImageFilter.GaussianBlur(16))
    fin=Image.new('RGBA',(b.width+30,b.height+30),(0,0,0,0)); fin.alpha_composite(sh,(18,24)); fin.alpha_composite(o); fin.alpha_composite(b); return fin
fah,phum=[cut(p) for p in fs]
W,H=1080,1920
y=np.linspace(0,1,H)[:,None,None]; top=np.array([224,140,60]); bot=np.array([170,70,60])
cv=Image.fromarray((top*(1-y)+bot*y).repeat(W,1).astype('uint8')).convert('RGBA')
# แสงเมืองเบลอ (โบเก้)
bk=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(bk); r=np.random.default_rng(3)
for i in range(40):
    x,yy,rr=r.integers(0,W),r.integers(700,1900),r.integers(20,70); c=[(255,210,120),(255,140,180),(150,200,255)][i%3]
    d.ellipse([x-rr,yy-rr,x+rr,yy+rr],fill=c+(70,))
cv.alpha_composite(bk.filter(ImageFilter.GaussianBlur(6)))
def place(im,w,x,y,alpha=1.0):
    im=im.resize((w,int(im.height*w/im.width)),Image.LANCZOS); st=sticker(im)
    if alpha<1: a=st.split()[3].point(lambda v:int(v*alpha)); st.putalpha(a)
    cv.alpha_composite(st,(int(x),int(y)))
# ภูมิหันหลังเดินจากไป (จาง เล็ก ขวา) / ฟ้าใหญ่ซ้าย
place(phum,400,660,780,1.0)
place(fah,600,-40,760)
d=ImageDraw.Draw(cv)
# ป้ายเช็กลิสต์ "พร้อมแล้ว"
cx,cy=470,1330; card=Image.new('RGBA',(600,520),(0,0,0,0)); cd=ImageDraw.Draw(card)
cd.rounded_rectangle([0,0,600,520],40,fill=(255,250,240,245),outline=(30,16,40),width=8)
fi=ImageFont.truetype(F,46)
for i,(ok,tx) in enumerate([(False,'เดตเพื่อลืมใคร'),(False,'เทียบกับคนเก่า'),(True,'อยู่คนเดียวได้')]):
    y0=60+i*150; c=(59,178,115) if ok else (229,72,77); cd.ellipse([40,y0,130,y0+90],fill=c)
    if ok: cd.line([(62,y0+48),(80,y0+66),(110,y0+28)],fill='white',width=12)
    else: cd.line([(62,y0+22),(108,y0+68)],fill='white',width=12); cd.line([(108,y0+22),(62,y0+68)],fill='white',width=12)
    cd.text((160,y0+45),tx,font=fi,fill=(30,16,40),anchor='lm')
cv.alpha_composite(card.rotate(4,expand=True,resample=Image.BICUBIC),(cx,cy))
d=ImageDraw.Draw(cv)
# หัวเรื่อง
t=Image.new('RGBA',(W,640),(0,0,0,0)); td=ImageDraw.Draw(t); fT=ImageFont.truetype(F,138)
for txt,yy,col in (('พร้อมรักใหม่',170,(255,255,255)),('หรือยัง?',345,(255,214,90))):
    td.text((W//2+8,yy+10),txt,font=fT,fill=(10,5,20,170),anchor='mm',stroke_width=22,stroke_fill=(10,5,20,170))
    td.text((W//2,yy),txt,font=fT,fill=col,anchor='mm',stroke_width=18,stroke_fill=(30,16,40))
cv.alpha_composite(t.rotate(-3,resample=Image.BICUBIC),(0,30))
f3=ImageFont.truetype(F,62); q='3 สัญญาณว่ายังไม่พร้อม'; bb=d.textbbox((0,0),q,font=f3); tw=bb[2]-bb[0]
d.rounded_rectangle([(W-tw)//2-40,560,(W+tw)//2+40,660],30,fill=(30,16,40)); d.text((W//2,608),q,font=f3,fill='white',anchor='mm')
f4=ImageFont.truetype(F,46); d.rounded_rectangle([36,40,262,118],38,fill=(255,214,90),outline=(30,16,40),width=6); d.text((149,78),'ดูเพลิน',font=f4,fill=(30,16,40),anchor='mm')
cv.convert('RGB').save('/tmp/ST007_ปก.jpg',quality=93); cv.convert('RGB').resize((450,800)).save('/tmp/c7.jpg')
