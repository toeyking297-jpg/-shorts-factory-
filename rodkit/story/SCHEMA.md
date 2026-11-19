# story.json — โครงบท (เข้ากับระบบผลิตเดิมผ่าน `story_tool to-ep`)

```json
{
  "id": "ST003", "title": "คดีปลาทูหาย", "slot": "family|morning|comedy",
  "format": "single|duo|group|relay",
  "mechanism": "audience_less|audience_more|known_problem|known_goal_choice|expect_x_get_y",
  "logline": "…",
  "question": "คำถามหลักที่ตอนจบต้องตอบ",
  "seven": {"who": "", "want": "", "obstacle": "", "stakes": "", "decision": "", "consequence": "", "change": ""},
  "signature": {"conflict": "", "decision": "", "outcome": "", "hook": "", "ending": ""},
  "cast": [{"who": "khaohom", "role": "main|support|extra", "want": "", "canon": "ลูก"}],
  "hero_prop": {"name": "", "beats": ["b1", "b4", "b9"]},
  "beats": [
    {"id": "b1", "set": "dining", "link": "open|because|but|and",
     "function": ["info|harder|choice|consequence|relationship"],
     "on_screen": ["mali", "cat"], "action": "สิ่งที่ต้องเห็นบนจอ",
     "lines": [{"who": "mali", "text": "…"}], "vo": "", "thought": "",
     "plants": ["clue_toothpick"], "payoffs": [], "decider": "khaohom",
     "knowledge": {"audience": "", "main": "", "others": "", "wants_to_know": ""}}
  ],
  "ending": {"answers": "", "twist_plants": []},
  "production": {"sets": [], "new": []}
}
```

- `link`:
  - `because` = เพราะเหตุก่อนหน้าจึงเกิด
  - `but` = แต่กลับ
  - `and` = แค่ต่อกัน (ถ้ามี 2 ครั้งติด ตัวตรวจจะแจ้ง ERROR)
- `function` อย่างน้อย 1 ค่าต่อ beat
- beat ที่มี `choice` ต้องมี `decider` เป็นตัวหลัก
- `payoffs` ต้องอ้าง `plants` ที่อยู่ใน beat ก่อนหน้า

## คำสั่ง
```
python3 -m rodkit.story.story_tool check  rodkit/story/stories/ST003.story.json
python3 -m rodkit.story.story_tool dup    rodkit/story/stories/ST003.story.json
python3 -m rodkit.story.story_tool script rodkit/story/stories/ST003.story.json   # บทอ่านง่าย (markdown)
python3 -m rodkit.story.story_tool to-ep  rodkit/story/stories/ST003.story.json rodkit/story/stories/ST003.draft.ep.json
```

- `to-ep` เขียนไฟล์ใหม่เสมอ ไม่ทับ `rodkit/episodes/`
- ไฟล์ที่ได้ผ่าน `rodkit.produce --dry --no-render` ได้
- กล้อง ท่าทาง และของในฉาก ให้ฝ่ายผลิตเติมทีหลัง
