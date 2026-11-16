# EP001 ป้ามาก่อน: บทฉบับใช้จริง

สถานที่: หน้าร้านข้าวมันไก่ห้องแถว (LOC01) ใช้ฉากเดียวตลอดเรื่อง · ภาษาไทย

> ชื่อตัวละครเป็นรหัสภายในเท่านั้น ไม่มีใครพูดชื่อในเรื่อง

| # | ผู้พูด | บท | อารมณ์ / การส่ง | เว้นหลัง (ms) |
|---|---|---|---|---|
| D01 | ป้า (C02) | หลบหน่อยหนู ป้ามาก่อน | bossy: loud, fast, steps in front while fanning | 300 |
| D02 | หนุ่มหน้านิ่ง (C01) | ป้าครับ ผมยืนต่อคิวตรงนี้ ตั้งแต่ร้านยังไม่เปิดเลยครับ | deadpan: flat, polite, no anger | 250 |
| D03 | ป้า (C02) | ป้าก็มาก่อนหนูนั่นแหละ แค่ไปเข้าห้องน้ำมา | smug: dismissive, waves fan | 300 |
| D04 | หนุ่มหน้านิ่ง (C01) | ร้านเพิ่งเปิดได้ สามนาทีเองนะครับ | deadpan: flat, a tiny bit slower | 350 |
| D05 | ป้า (C02) | ป้าเข้าห้องน้ำเร็ว **[MID_JOKE: hold for reaction]** | proud: chin up, totally serious | 1100 |
| D06 | พนักงาน (C03) | บัตรคิวสี่สิบห้า มารับของได้เลยค่ะ | cheerful: service voice, bright | 600 |
| D07 | ป้า (C02) | สี่สิบห้า ของป้าเอง | greedy: snatches the ticket, quick | 250 |
| D08 | หนุ่มหน้านิ่ง (C01) | ป้าครับ บัตรนั้นมัน **[PLANT: he tries to warn her]** | deadpan: starts calmly, gets cut off | 60 |
| D09 | ป้า (C02) | ไม่ต้องพูดเยอะ ป้ารีบ ป้ามาก่อน | impatient: talks over him, palm up | 250 |
| D16 | ป้า (C02) | ของป้าห่อเดียว เร็ว เร็ว เลยหนู **[SETUP: she thinks it is one box]** | impatient: turns to the counter, waves the ticket | 350 |
| D10 | พนักงาน (C03) | คิวสี่สิบห้านะคะ ข้าวมันไก่ ห้าสิบห่อค่ะ | cheerful: reads the order, lifts a huge stack of bags | 450 |
| D11 | พนักงาน (C03) | ทั้งหมด สองพันห้าร้อยบาทค่ะ **[TURN: reaction hold on auntie]** | cheerful: same bright service voice | 1100 |
| D12 | ป้า (C02) | ห้าสิบห่อ เลยเหรอ | shocked: small, quiet voice | 400 |
| D13 | หนุ่มหน้านิ่ง (C01) | ของออฟฟิศผมเองครับ | deadpan: flat, informative | 500 |
| D14 | ป้า (C02) | หนู ป้าคืนให้ | sheepish: holds the ticket out with two fingers | 450 |
| D15 | หนุ่มหน้านิ่ง (C01) | ไม่เป็นไรครับ เชิญเลย ป้ามาก่อน **[PAYOFF: callback; end 1.5 s after]** | deadpan_polite: gentle open-palm gesture toward the counter, tiny smile | 1500 |

## จุดปูเรื่อง → จุดเฉลย
- ตัวเอกแบกถุงผ้าเก็บความร้อนพับกองโตบนไหล่ (SH01 (wide), SH09) → D10/D13 (50-box office order)
- ป้าพูดซ้ำว่า 'ป้ามาก่อน' (D01, D09) → D15 callback
- ตัวเอกพยายามบอกว่า 'ใบนั้นมัน…' แล้วถูกขัด (D08) → D10/D11 (the ticket is a big pre-order)
- insert: บัตรคิวเลข 45 ติดลวดเย็บกับใบสั่งยาวเหยียดในมือตัวเอก (SH08) → D10
- ป้าบอกพนักงานว่า 'ของป้าห่อเดียว' (D16 (SH09)) → D10 'ห้าสิบห่อ' contrast

## ประวัติการแก้
- 2026-10-22 D08, D12: ASR check (CER 0.27 / 0.33) heard 'ไปนั้น' and 'หาสิพ่อ'; lines made longer for clearer TTS
- 2026-10-22 D16, D05: real audio was 32.8 s (< 35 s); added a setup line that sharpens the payoff and a longer beat after the mid joke; slowed C01

## มุกเปิดและมุกจบทางเลือก
ดูตารางเปรียบเทียบใน `writers_room.md` (เลือก O1 + E1)

## ความยาว
- ความยาวจริงคำนวณจากไฟล์เสียงใน `timeline.json`
- ค่า `estimated_duration_sec` ในสคริปต์เป็นการประมาณคร่าวๆ ใช้วางแผนเท่านั้น
