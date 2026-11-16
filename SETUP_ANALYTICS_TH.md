# เปิดสถิติเชิงลึกของช่อง (ทำครั้งเดียว ประมาณ 15 นาที ฟรี)

ถ้าไม่ทำ ระบบยังใช้งานได้ปกติ แต่จะเห็นแค่ยอดวิว ไลก์ และคอมเมนต์ที่ทุกคนเห็นได้
ถ้าทำ ระบบจะเห็นข้อมูลแบบ YouTube Studio:
- คนดูเฉลี่ยกี่เปอร์เซ็นต์ของคลิป
- กราฟการดูต่อเนื่อง (ระบบวางทับกับฉากของเรา เลยบอกได้ว่าคนออกตอนฉากไหน)
- คนดูมาจากไหน (หน้า Shorts หรือการค้นหา)
- ประเทศ อายุ เพศ อุปกรณ์
- ผู้ติดตามที่ได้เพิ่ม

**ความปลอดภัย**
- ระบบได้สิทธิ์ **อ่านอย่างเดียว** ทั้งสองอย่าง (`yt-analytics.readonly` และ `youtube.readonly`)
- ระบบแก้ไข ลบ หรืออัปโหลดวิดีโอไม่ได้
- ยกเลิกสิทธิ์เมื่อไรก็ได้ที่ myaccount.google.com/permissions
- ไม่ต้องผูกบัตร ไม่มีค่าใช้จ่าย

ทำบนมือถือได้ แต่ถ้าทำบนคอมจะง่ายกว่า

## 1. สร้างโปรเจกต์ (ฟรี ไม่ต้องใส่บัตร)
1. เข้า **console.cloud.google.com** แล้วล็อกอินด้วย Gmail ที่เป็นเจ้าของช่อง
2. กดชื่อโปรเจกต์ด้านบน → **New project** → ตั้งชื่อ `shorts-factory` → **Create**
   ถ้ามีโปรเจกต์ที่ใช้ทำ YouTube API key อยู่แล้ว ใช้โปรเจกต์เดิมได้เลย

## 2. เปิดใช้ 2 บริการ
เข้าเมนู **APIs & Services → Library** แล้วค้นหาและกด **Enable** ทีละตัว
- **YouTube Analytics API**
- **YouTube Data API v3** (ถ้าเปิดไว้แล้วข้ามได้)

## 3. ตั้งหน้าขออนุญาต แล้วเปลี่ยนเป็น "In production"
1. เข้าเมนู **Google Auth Platform** (บางบัญชีชื่อ **OAuth consent screen**) → **Get started**
2. ใส่ App name `Shorts Factory` และอีเมลของคุณ แล้วเลือก Audience เป็น **External** → ยืนยันจนเสร็จ
3. ไปที่ **Audience** → กด **Publish app** → **Confirm** ให้สถานะเป็น **In production**
   - **สำคัญ:** ถ้าค้างไว้ที่ "Testing" Google จะตัดสิทธิ์ทุก 7 วัน
   - ไม่ต้องส่งแอปให้ Google ตรวจ เพราะใช้แค่บัญชีของคุณเอง

## 4. สร้างกุญแจสำหรับระบบ
1. ไปที่ **Clients** → **Create client** → Application type เลือก **Web application**
2. ที่ **Authorized redirect URIs** กด Add แล้ววางข้อความนี้:
   `https://developers.google.com/oauthplayground`
3. กด **Create** แล้วจด **Client ID** และ **Client secret** ไว้

## 5. ขอ "Refresh token" (ใช้ได้ยาว ไม่ต้องทำซ้ำ)
1. เข้า **developers.google.com/oauthplayground**
2. กดรูปเฟือง ⚙️ มุมขวาบน → ติ๊ก **Use your own OAuth credentials** → วาง Client ID และ Client secret
3. ช่อง **Input your own scopes** (ซ้ายล่าง) วางข้อความนี้ทั้งบรรทัด:
   `https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/youtube.readonly`
4. กด **Authorize APIs** → เลือกบัญชี **ที่เป็นเจ้าของช่อง** (ถ้ามีหลายช่อง ให้เลือกช่อง HIDDEN ATLAS)
5. จะเจอหน้า "Google hasn't verified this app" เป็นเรื่องปกติ เพราะแอปนี้เป็นของคุณเอง ให้กด **Advanced** → **Go to Shorts Factory** → **Continue/Allow**
6. กลับมาที่ Playground กด **Exchange authorization code for tokens** แล้วก๊อป **Refresh token**

## 6. ใส่กุญแจใน GitHub (repo `-shorts-factory-` → Settings → Secrets and variables → Actions → New repository secret)
| ชื่อ secret | ค่า |
|---|---|
| `YT_CLIENT_ID` | Client ID จากข้อ 4 |
| `YT_CLIENT_SECRET` | Client secret จากข้อ 4 |
| `YT_REFRESH_TOKEN` | Refresh token จากข้อ 5 |
| `YOUTUBE_CHANNEL_ID` | รหัสช่องที่ขึ้นต้นด้วย UC… (ถ้ายังไม่ได้ใส่) |

**ห้ามส่งค่าพวกนี้ในแชต** ใส่ใน GitHub Secrets เท่านั้น

## 7. ทดสอบ
1. เปิดแดชบอร์ด → แท็บ **ผล** → กด **ดึงผลตอนนี้**
2. รอ 1–2 นาที แล้วเปิดแท็บ **ผล** ใหม่ ถ้าขึ้น **"สถิติเชิงลึก เปิดแล้ว"** แปลว่าใช้ได้

**ข้อควรรู้**
- YouTube ส่งข้อมูลเชิงลึกช้ากว่าจริงประมาณ 2–3 วัน
- ตัวเลข "2 วันแรก" จะขึ้นประมาณวันที่ 5 หลังลงคลิป และ "7 วันแรก" ขึ้นประมาณวันที่ 10
- ระบบเทียบคลิปที่อายุเท่ากันเสมอ คลิปใหม่จะไม่ถูกเอาไปเทียบกับคลิปเก่า

## ถ้าวันหนึ่งขึ้นว่า "ยังไม่เปิด" อีก
แปลว่า Google ยกเลิกสิทธิ์ (เช่น เปลี่ยนรหัสผ่าน หรือกดยกเลิกเอง) ทำข้อ 5–6 ใหม่ (ประมาณ 3 นาที)
ระหว่างนั้นระบบจะใช้ยอดวิวสาธารณะไปก่อน ไม่หยุดทำงาน
