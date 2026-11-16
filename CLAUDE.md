# Shorts Factory (English YouTube Shorts channel)

The owner speaks Thai. Answer him in Thai. All channel content (scripts, on-screen text, titles) is English.
He wants finished videos, not drafts: work through the whole job without stopping for review.

To make Shorts, follow the skill `.claude/skills/clip-engine/SKILL.md` (/clip-engine).

## Layout
- `config/channel.json`: channel name, niche, voice, colours, fonts. Change the niche here only.
- `config/example_script.json`: a complete, correct example of an episode script.
- `queue/topics.md`: topic queue (TODO / DONE).
- `episodes/EP00N_slug/`: script.json, research.md, assets/, build/ (voice, scenes, check.jpg, report.json).
- `final/`: finished MP4s + upload sheets. This is what the owner uploads.
- `memory/lessons.md`: lessons from past batches. Read before each batch, append after.
- `engine/`: Python pipeline. Entry point `python -m engine.run` (doctor | new | make).

## Rules
- Never edit `.env` contents into chat or commit them.
- If the engine has a bug, fix it in `engine/` and note it in `memory/lessons.md`.
- On Windows, if `python` is not found, try `py`.
