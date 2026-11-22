from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np, math, glob
D='/home/claude/recover/shorts-factory/'; F=D+'assets/fonts/Kanit-Black.ttf'
fs=sorted(glob.glob(D+'rodkit/build/ST005_CUT/still_*.jpg'))
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
y=np.linspace(0,1,H)[:,None,None]; top=np.array([40,30,86]); bot=np.array([170,60,110])
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
place(phum,330,700,760,0.75)
place(fah,640,-40,720)
d=ImageDraw.Draw(cv)
# มือถือ: ข้อความร่างที่ไม่ได้ส่ง
px,py,pw,ph=560,1180,470,620
ph_img=Image.new('RGBA',(pw+40,ph+40),(0,0,0,0)); pd=ImageDraw.Draw(ph_img)
pd.rounded_rectangle([0,0,pw+40,ph+40],60,fill=(20,20,28,255)); pd.rounded_rectangle([20,20,pw+20,ph+20],44,fill=(18,20,30,255))
pd.rounded_rectangle([20,20,pw+20,140],44,fill=(40,46,66,255)); f1=ImageFont.truetype(F,40); pd.ellipse([50,45,120,115],fill=(235,192,155)); pd.text((140,80),'ภูมิ',font=f1,fill='white',anchor='lm'); pd.text((pw-10,80),'02:14',font=ImageFont.truetype(F,30),fill=(200,210,230),anchor='rm')
pd.rounded_rectangle([pw-240,190,pw+0,262],32,fill=(61,139,253)); pd.text((pw-120,226),'ถึงบ้านยัง',font=ImageFont.truetype(F,34),fill='white',anchor='mm')
pd.text((pw-250,250),'อ่านแล้ว',font=ImageFont.truetype(F,24),fill=(140,150,170),anchor='rm')
pd.rounded_rectangle([44,ph-110,pw-60,ph-20],44,fill=(36,40,56),outline=(120,130,160),width=3); pd.text((70,ph-64),'คิดถึงนะ… |',font=ImageFont.truetype(F,46),fill='white',anchor='lm')
pd.ellipse([pw-50,ph-108,pw+30,ph-28],fill=(61,139,253))
ph_img=ph_img.rotate(6,expand=True,resample=Image.BICUBIC); cv.alpha_composite(ph_img,(px,py))
# ป้าย "ไม่ได้ส่ง" แดง
f2=ImageFont.truetype(F,54); d.rounded_rectangle([600,1790,1010,1880],40,fill=(229,72,77),outline=(26,18,32),width=6); d.text((805,1835),'ไม่ได้ส่ง',font=f2,fill='white',anchor='mm')
# หัวเรื่อง
t=Image.new('RGBA',(W,640),(0,0,0,0)); td=ImageDraw.Draw(t); fT=ImageFont.truetype(F,150)
for txt,yy,col in (('ข้อความ',170,(255,255,255)),('ที่ไม่ได้ส่ง',345,(255,214,90))):
    td.text((W//2+8,yy+10),txt,font=fT,fill=(10,5,20,170),anchor='mm',stroke_width=22,stroke_fill=(10,5,20,170))
    td.text((W//2,yy),txt,font=fT,fill=col,anchor='mm',stroke_width=18,stroke_fill=(30,16,40))
cv.alpha_composite(t.rotate(-3,resample=Image.BICUBIC),(0,30))
f3=ImageFont.truetype(F,62); q='เลิกกันแล้ว… ควรทำยังไง?'; bb=d.textbbox((0,0),q,font=f3); tw=bb[2]-bb[0]
d.rounded_rectangle([(W-tw)//2-40,560,(W+tw)//2+40,660],30,fill=(229,72,77)); d.text((W//2,608),q,font=f3,fill='white',anchor='mm')
f4=ImageFont.truetype(F,46); d.rounded_rectangle([36,40,262,118],38,fill=(255,214,90),outline=(30,16,40),width=6); d.text((149,78),'ดูเพลิน',font=f4,fill=(30,16,40),anchor='mm')
cv.convert('RGB').save('/tmp/ST005_ปก.jpg',quality=93); cv.convert('RGB').resize((450,800)).save('/tmp/c5.jpg')
