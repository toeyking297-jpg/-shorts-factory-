---
name: clip-engine
description: Produce finished English YouTube Shorts end-to-end for this channel (topic research, script, fact-check, voice, footage, edit, captions, QC, upload sheet). Use when the user asks to make clips/episodes/Shorts, e.g. "ทำคลิป 3 ตอน", "make 5 shorts", "หาหัวข้อใหม่".
---

# Clip Engine: English Shorts, fully automatic

The owner talks to you in Thai. Reply to him in Thai, but **every piece of channel content is in English**
(script, on-screen text, titles, descriptions). He does NOT want to review drafts: run the whole
batch to the end and hand over finished files. Only stop if something is truly blocked
(missing API key, FFmpeg missing) and say exactly what to do.

## 0. Load context (every batch)
1. Read `config/channel.json` (niche, voice, style) and `memory/lessons.md` (apply every lesson).
2. Read `queue/topics.md`. Count TODO items. Default batch size = `production.episodes_per_batch`
   unless the owner gave a number.
3. Run `python -m engine.run doctor` once. If anything required is MISSING, stop and explain in Thai.

## 1. Topics (when the queue has fewer TODO items than the batch needs)
Research with WebSearch: what is currently getting views in this niche, plus evergreen "I never knew that"
facts. A good topic:
- fits `niche.angles` and avoids everything in `niche.avoid`
- has ONE clear surprising claim that can be said in the first 2 seconds
- can be verified in at least 2 independent reliable sources (encyclopedia, official site, major media, scientific body)
- has visuals that free sources will actually have (landscape/city/object footage, or Wikimedia photos of the landmark)
- is not already in the DONE list (no repeats, no near-duplicates)

Append new ideas to `## TODO` as `- [ ] Topic | angle | why it hooks`. Keep ~10 ideas in reserve.

## 2. Per episode: research -> script -> fact-check
Create the folder: `python -m engine.run new "<topic>"` (prints the episode path).

**Research**: read 2+ sources, write the facts you will use with their URLs into `research.md` in the episode folder.
Never copy sentences from sources; write your own.

**Script formula (target 110-145 words, about 40-55 s)**:
1. Hook (scene 1, under 8 words): the surprising claim or a question. No "Did you know", no greetings.
2. Context: where/what, fast (1-2 scenes).
3. Escalation: 2-4 scenes, each adds a new fact. A number, a comparison, or a "but" twist.
4. The WHY: the real explanation. This is what makes the channel worth watching.
5. Payoff, then the **loop bridge** (see below). No "subscribe", no "comment below", no outro, no "the end" feeling.

### Seamless loop (preferred, never at the cost of good English)
The owner wants Shorts to replay without viewers noticing. When it reads naturally, the last line is an **unfinished
phrase that the first line completes**. If no natural bridge exists, set `"loop": false` and end on a clean payoff.

- Scene 1 (hook) must work on its own as an opener AND as the second half of the last line.
  Don't start it with "Did you know", "So", "And", "Hi", or a name of the channel.
- The last scene is a short fragment (2-6 words) with **no final . ! ?**, e.g. "It's just that", "and that's why",
  "which is exactly how", "because". Read "<last scene> <scene 1>" aloud: it must be one grammatical sentence.
- The payoff (the scene before the bridge) should close the story, so the bridge feels like a natural afterthought.
- Last scene visual: `{"type": "loop"}`. The engine then shows the shot that leads into scene 1, so the picture keeps
  moving across the seam. Scene 1 should therefore be footage or the globe map diving in.

Example (`config/example_script.json`):
  first: "In this Arctic town, you can't be buried. Ever."  ...  payoff: "Dying isn't actually illegal here."
  bridge (last): "It's just that"  ->  "It's just that in this Arctic town, you can't be buried. Ever."

More bridge patterns:
  hook "This island changes country every six months."  <-  last "Which is how a tiny piece of land ends up proving that"
  hook "This lake turns animals into statues."  <-  last "Which is why, to this day,"

The engine does the rest automatically: voice is generated with the hook repeated at the end so the bridge has
mid-sentence intonation, then cut sample-accurately; no silence/fades at the seam; music bed is crossfaded into
itself; loudness is normalised with a static gain. QC fails the episode if the last scene ends with . ! ? or the seam
has more than 0.45 s of silence. Look at `build/loop_seam.jpg` (last frame | first frame): they should look like
two neighbouring frames.

Write for the ear: short sentences, contractions, spell out awkward numbers ("twenty five hundred"),
no parentheses, no abbreviations the voice might misread.

**Scenes**: one scene = one sentence or clause, 2-5 seconds (about 6-14 words). Change the picture every scene
(the loop bridge is the only scene allowed to be shorter).
At least 1/3 of scenes must carry our own graphics (a globe `map` scene OR an `overlay` on footage). This is what keeps
the channel clear of YouTube's "inauthentic content" rule. NEVER full-screen graphic cards, NEVER boxes behind text:
typography only, on-screen headlines 2-5 words, never a narration sentence on screen.

**Visual spec per scene**: the complete, current list (animated maps, icons, stats with sources, etc.) is in
`config/script_rules.md` and `config/example_script.json`; follow those. Summary:
- `{"type":"footage","query":"...","alt":["..."]}`: queries are concrete and visual ("aerial view snowy arctic town",
  not "Longyearbyen history"). Always give 1-2 broader `alt` queries.
- `{"type":"image","query":"...","source":"wikimedia"}`: for a specific landmark/person/map that stock sites won't have.
  If the topic is a real named place, scene 1 must be its real photo from wikimedia (stock sites return look-alikes).
- Stock sites contain staged/AI-generated pictures of people: query places, objects, nature, vehicles, not "scientist".
- `{"type":"map", ...}`: the 3D globe (pins, routes, distance lines, rings of real radius, true-size compare).
- `"overlay"` on footage: label (2-5 words), stat, compare, list, timeline, icons, location, quote. No overlay on maps.
- Footage scenes carry `must_show` / `must_not_show` so the picture can never contradict the narration.
- Every on-screen number is the `value` of a fact in `"facts"` (with a real source URL).
- `"source":"nasa"` for space topics (NASA media, public domain).

**Fact-check pass (mandatory)**: re-read the script as a skeptic. For every number, date, superlative ("only",
"first", "biggest") and causal claim, confirm it against the sources (WebSearch again if needed). Fix or soften
anything that is disputed, then list the sources in `"sources"`. Myths that are commonly repeated online count as
wrong. Precision beats drama: say "you can't be buried there", not "it's illegal to die" if the latter is false.

Fill `meta`: title (40-70 chars, curiosity + the subject named, no ALL CAPS), a 1-2 sentence description,
3-5 hashtags starting with `shorts`, 6-10 tags. Save `script.json`.

## 3. Build
```
python -m engine.run make EP00N
```
This runs voice -> footage -> render -> QC -> upload sheet. For a whole batch, finish the scripts first, then build
them one after another.

## 4. QC (you are the editor)
1. Read `episodes/<ep>/build/report.json` (`status` ready / needs_review, issues in 5 categories: technical,
   factual, visual, rights, editorial; `build/draft.jpg` is the one-still-per-scene draft check). Fix every issue:
   - scene too long -> split the sentence into two scenes; too short -> merge
   - "found no media" -> better `query`/`alt`, then `python -m engine.run make EP00N --refetch <i>`
   - narration over `max_seconds` -> cut words
2. Open `episodes/<ep>/build/loop_seam.jpg`: the two halves must look like consecutive frames (same shot,
   same overlay). Then open `episodes/<ep>/build/check.jpg` with Read and look at it like a viewer:
   footage that does not match what is being said, text cut off, graphics overlapping captions,
   ugly/watermarked/low-quality footage, anything misleading -> fix (`--refetch <i>`, change the spec, or
   `--scenes <i>` to re-render specific scenes).
3. Maximum 2 fix rounds per episode, then deliver and note any remaining weakness.

## 5. Deliver and learn
- Finished files: `final/<ep>.mp4` + `final/<ep>.json` / `final/<ep>_upload.md` (3 titles, description with sources,
  pinned comment, tags, captions for TikTok/Reels, QC status).
- Mark the queue item `- [x] ... -> EP00N`, moving it under `## DONE`.
- Append 1-3 short lines to `memory/lessons.md` (what broke, what fixed it, which queries/graphics worked).
- Tell the owner in Thai: what was made (titles), where the files are, anything he must do (e.g. add music,
  key missing), and the 2 clips you think are strongest. Keep it short.

## Hard rules
- English only on screen and in audio. Fact-checked. No copyrighted footage: only the engine's sources or files the owner supplies.
- Never claim something that isn't supported by the sources. No fake quotes.
- Each episode must look different from the previous one: rotate overlay types and map styles, colours stay on brand.
- A clip that did not pass QC is delivered as needs_review with its reasons, never as ready.
- Don't upload anything. The owner uploads (max `production.max_uploads_per_day` per day).
