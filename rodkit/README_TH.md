# rodkit (รุ่นใหม่ หลังย้ายบัญชี)

การ์ตูนวาดด้วยโค้ด (SVG) แล้วเรนเดอร์ทีละเฟรมด้วย Chrome แบบไม่มีหน้าจอ → ffmpeg → mp4 แนวตั้ง 1080x1920

- `web/lib/core.js` เวลา คีย์เฟรม ตัวช่วยวาด
- `web/lib/hero.js` พระเอก (แว่นกลม ผมหยิก เสื้อกั๊กกากี 4 กระเป๋า ทับเสื้อยืดเขียวน้ำทะเล) ท่า: idle torch scared cower point shush hands_up · หน้า: calm nervous scared terrified determined relief · เดิน (walk) สั่น (tremble) แว่นแวบ (glint)
- `web/lib/ghost.js` ผีผู้หญิงผมยาว ชุดขาว (glitch, ยื่นแขน)
- `web/lib/sets.js` ฉากทางเดินหอเก่าชั้น 4 (มุมลึก ไฟกะพริบ ประตู เลขห้อง คราบ ป้ายทางออก)
- `web/lib/render.js` กล้อง (ซูม แพน สั่น เบลอฉากหลัง) ไฟฉาย ความมืด เกรน ซับ ข้อความเปิด การ์ดปิด
- `episodes/*.ep.json` ไฟล์ตอน: ช็อตละ dur/set/cam/env/actors/fx/subs ทุกค่าใส่คีย์เฟรมได้ `[[เวลา,ค่า],[เวลา,ค่า,"ease"]]`

```
python -m rodkit.make rodkit/episodes/TEST01.ep.json --storyboard   ภาพรวมทุกช็อต
python -m rodkit.make rodkit/episodes/TEST01.ep.json --stills 2,6.5  ภาพนิ่ง
python -m rodkit.make rodkit/episodes/TEST01.ep.json                 วิดีโอ
```
บน GitHub: Actions → "rodkit render" → ใส่ไฟล์ตอน → ได้คลิปใน Releases

ยังไม่มี: เสียงพากย์/เอฟเฟกต์/เพลง (ElevenLabs) และส่ง Telegram — เป็นเฟส 3
