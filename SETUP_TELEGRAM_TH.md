# รับคลิปทาง Telegram (ทำครั้งเดียว ประมาณ 3 นาที ฟรี)

พอทำคลิปเสร็จ ระบบจะส่งวิดีโอเข้า Telegram ของคุณเอง
- กดดูในแชตได้เลย ไม่ต้องดาวน์โหลดก่อน
- ชอบแล้วค่อยกดค้างที่คลิป → **Save to Camera Roll / บันทึกลงอัลบั้ม**
- ข้อความใต้คลิปบอกสถานะ "พร้อมลง" หรือ "ต้องดูก่อน" และมีลิงก์ไปแดชบอร์ด ไว้ก๊อปชื่อคลิปกับคำอธิบาย

## 1. สร้างบอทของคุณเอง
1. เปิด Telegram ค้นหา **@BotFather** (มีเครื่องหมายถูกสีฟ้า) แล้วกด Start
2. พิมพ์ `/newbot`
3. ตั้งชื่อบอท เช่น `Hidden Atlas Clips`
4. ตั้ง username ให้ลงท้ายด้วย `bot` เช่น `hiddenatlas_clips_bot`
5. BotFather จะส่ง **token** มาให้ หน้าตาแบบ `1234567890:AAH...` ให้ก๊อปเก็บไว้

**ห้ามส่ง token ในแชต** ใส่ใน GitHub Secrets เท่านั้น

## 2. ทักบอทหนึ่งครั้ง
กดลิงก์บอทที่ BotFather ส่งมา แล้วกด **Start** (หรือพิมพ์ `/start`)
ระบบจะจำแชตนี้ไว้ส่งคลิปให้

## 3. ใส่ token ใน GitHub
repo `-shorts-factory-` → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
- Name: `TELEGRAM_BOT_TOKEN`
- Secret: token จากข้อ 1

เสร็จแล้ว ตั้งแต่คลิปรอบถัดไป ระบบจะส่งเข้า Telegram อัตโนมัติ
