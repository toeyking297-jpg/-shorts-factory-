# ระบบการ์ตูนบทสนทนาสั้น (pilot EP001 "ป้ามาก่อน")

ระบบนี้ทำการ์ตูนแนวตั้งยาว 35–50 วินาทีแบบ **limited animation**:
- ภาพนิ่งแยกชั้น (ฉากหลัง / ตัวละคร / ปาก / พร็อพ)
- ขยับปากเฉพาะคนที่พูด กะพริบตา และกล้องซูมช้าๆ
- ตัดภาพตามเสียงพากย์จริง
- ซับไทยอ้างอิงบทที่อนุมัติแล้ว ไม่ได้ใช้ข้อความจากการถอดเสียง

## สถานะตอนนี้
| ส่วน | สถานะ |
|---|---|
| วิเคราะห์คลิปอ้างอิง | เสร็จ → `analysis/reference_analysis.md` |
| บท | เสร็จ → `episodes/EP001/script.md` |
| Bible / Storyboard / Prompt | เสร็จ |
| เสียงพากย์ | เสร็จ: edge-tts ทีละประโยค 16 ไฟล์ ความยาวจริง 37.39 s (ฟรี) ตรวจด้วย ASR ได้ CER เฉลี่ย 0.07 แต่**ยังไม่มีคนฟัง** |
| ภาพ | **ยังเป็นภาพชั่วคราว (PLACEHOLDER) วาดด้วยโค้ด** ต้องสร้างภาพจริงตาม `episodes/EP001/prompts/prompts.md` |
| วิดีโอ | `preview/animatic_full.mp4` (1080x1920) และ `animatic_preview.mp4` ผ่านการตรวจเทคนิคแล้ว ส่วน `final.mp4` ระบบไม่ยอมออกจนกว่าภาพจะครบ |
| QA | `qa_report.json`: WAITING_FOR_ASSET, คะแนนบรรณาธิการ 71/85 (ส่วนเสียง 15 คะแนนยัง NOT_REVIEWED) |

## โฟลเดอร์
```
cartoon/
  input/reference/            คลิปอ้างอิง (ไม่ขึ้น git)
  analysis/                   ผลวิเคราะห์คลิปอ้างอิง
  bible/                      character_bible.json, scene_bible.json  (ล็อกหน้าตา สี พร็อพ เสียง ผังฉาก)
  assets/
    characters/ mouths/ backgrounds/ props/   ← วางภาพจริงที่นี่ (ชื่อไฟล์ = asset_id.png)
    _placeholder/             ภาพชั่วคราวที่ระบบวาดเอง (ไม่ขึ้น git)
    manifest.json             ทุก asset: ขนาด, จุดยึดปาก, สถานะ READY/PLACEHOLDER
    anchors_override.json     (ถ้ามี) แก้จุดยึดปากของภาพจริง
  episodes/EP001/
    writers_room.md           5 ไอเดีย + คะแนน + มุกเปิด/จบทางเลือก
    script.json / script.md   บท
    shotlist_src.json         storyboard ต้นฉบับ (เวลาอ้างอิงประโยค เช่น D07.start+0.2)
    shotlist.json / .csv      storyboard ที่มีเวลาจริงจากเสียง
    continuity_matrix.csv     เสื้อผ้า พร็อพ ตำแหน่ง ทิศมอง สีหน้า รายช็อต
    timeline.json             เวลาแต่ละประโยคจากไฟล์เสียงจริง
    audio/raw/ audio/import/  เสียงทีละประโยค (วางไฟล์พากย์เองที่ import/D01.wav ได้)
    audio/asr_report.json     ผลตรวจเสียงด้วย ASR (เครื่องตรวจ ไม่ใช่คนฟัง)
    subtitles/                subtitle.ass, subtitle.srt
    prompts/                  asset_requests.json, shot_prompts.json, prompts.md
    preview/                  animatic_preview.mp4, animatic_full.mp4, qa/ (contact sheets)
    export/                   final.mp4 (ออกเมื่อ asset ครบเท่านั้น)
    qa_report.json            PASS / FAIL / NOT_REVIEWED พร้อมหลักฐาน
  state/jobs.json             สถานะทุกขั้น (PLANNED … COMPLETE)
engine/cartoon/               โค้ด
```

## คำสั่ง (รันที่โฟลเดอร์โปรเจกต์)
```
python -m engine.cartoon status   EP001        ดูสถานะทุกขั้น
python -m engine.cartoon run      EP001 --dry-run   ดูว่าจะทำอะไรบ้าง โดยยังไม่เรนเดอร์
python -m engine.cartoon assets   EP001        สร้างภาพชั่วคราว + manifest (ภาพจริงที่วางไว้จะถูกใช้แทน)
python -m engine.cartoon prompts  EP001        สร้างรายการภาพที่ต้องทำ + prompt
python -m engine.cartoon voice    EP001        พากย์ (ต้องมี edge-tts; บนมือถือใช้ workflow "Cartoon voice")
python -m engine.cartoon timeline EP001        จัดเวลาจากเสียงจริง + ซับ + มิกซ์เสียง
python -m engine.cartoon render   EP001 --preview   540x960 เร็ว
python -m engine.cartoon render   EP001 --full      1080x1920
python -m engine.cartoon render   EP001 --final     1080x1920 ไม่มีป้าย (ปฏิเสธถ้ายังมีภาพชั่วคราว)
python -m engine.cartoon qa       EP001        ตรวจคุณภาพจากไฟล์ที่เรนเดอร์จริง
python -m engine.cartoon run      EP001 --from timeline   ทำต่อจากขั้นที่ล้ม
```
- บน Windows ถ้าไม่มีคำสั่ง `python` ให้ใช้ `py`
- ต้องมี ffmpeg ที่รองรับ libass
- บนเครื่องที่ติดตั้ง Python ได้ ให้ลง `pip install edge-tts faster-whisper pillow numpy`

## เมื่อแก้บททีละประโยค
แก้ `script.json` แล้วรัน voice → timeline → render ระบบจะสร้างเสียงใหม่**เฉพาะประโยคที่ข้อความหรือเสียงเปลี่ยน** (เช็กจาก hash) ประโยคอื่นใช้ไฟล์เดิม

## ทำภาพจริงให้ครบ (ขั้นต่อไป)
1. เปิด `episodes/EP001/prompts/prompts.md`
2. ทำกลุ่ม `REF_` ก่อน แล้วแนบภาพ REF ทุกครั้งที่ทำภาพของตัวละครนั้น
3. ภาพตัวละคร ปาก และพร็อพ ต้องเป็นพื้นหลังโปร่งใส ใช้ขนาดตามที่ระบุ ตั้งชื่อเป็น `asset_id.png`
4. วางไฟล์ในโฟลเดอร์ที่ตรงกับประเภท แล้วรัน `python -m engine.cartoon run EP001 --from assets`
5. ถ้าตำแหน่งปากเพี้ยนบนภาพจริง ให้แก้ใน `assets/anchors_override.json` เช่น
   `{"C01_bust_deadpan": {"mouth_anchor": [600, 640], "mouth_scale": 2.0}}`
6. ภาพ `_blink` ไม่บังคับ ถ้าไม่มี ตัวละครจะไม่กะพริบตาเท่านั้น

## ค่าใช้จ่ายที่บันทึก
- **edge-tts:** ไม่มีบัญชีและไม่มีบิล (0 บาท) แต่เป็น endpoint ฟรีที่ไม่มีการรับประกันว่าจะใช้ได้ตลอด
- **GitHub Actions:** ใช้นาทีฟรีของ repo private ตามโควตาบัญชี ส่วนนาทีที่ใช้ไปจริง ระบบไม่ได้วัด (UNKNOWN)
- **ภาพ:** ยังไม่มีค่าใช้จ่าย ระบบไม่ได้เรียกบริการสร้างภาพใดๆ
