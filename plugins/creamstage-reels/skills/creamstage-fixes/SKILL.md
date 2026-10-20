---
name: creamstage-fixes
description: Fast fixes on an already-edited CreamStage Reel without redoing the edit — lighting/grade fix, audio dropout/missing-words check and remix, caption or text corrections, re-render only the changed chunk, and final delivery under 30 MB. Use when the user says the face looks bad/dark/orange, words are missing, a caption is wrong, change one scene, make it smaller, or "fix it fast".
---

# CreamStage Quick Fixes

Every fix starts from the existing project folders (`cut/` from cut_pauses.py, `proj/` Remotion project). Never re-transcribe or re-cut unless the cut itself is wrong. Tell the user the fix + time estimate in one line, then do it.

| Problem | Fix | Time |
|---|---|---|
| Face washed out / grey blacks / flat | `python3 scripts/regrade.py cut --preset natural --compare 3` (v0.4 default — keeps camera lighting) |  ~15 min |
| Face too dark / orange / harsh | `python3 scripts/regrade.py cut --preset bright --compare 3` → LOOK at cut/compare.jpg → `cp cut/aroll.mp4 proj/public/` → `render_chunks.py` → `deliver.py`. Presets: bright (v0.2 default), brighter, neutral, warm, or `--grade "<ffmpeg filters>"`. Also check Reel.tsx overlays (bottom gradient ≤0.42, no vignette). | ~15 min |
| Words missing / audio cuts out | `python3 scripts/check_audio.py final.mp4 --ref words.json --keep cut/keep.json` → if dropouts: rebuild voice (cut_pauses.py `--keep`, audio part only) then `python3 scripts/mix_audio.py cut/voice.wav proj/src/Sfx.tsx proj/public/sfx mix.wav` → `python3 scripts/deliver.py render.mp4 final.mp4 --audio mix.wav`. No video re-render. | ~5 min |
| SFX too loud/soft/wrong | edit `gen_sfx.py` levels → regenerate Sfx.tsx → mix_audio.py → deliver.py --audio | ~3 min |
| Caption typo / brand spelling | edit the word in `gen_captions_cues.py` (P list) → rerun → `render_chunks.py proj Reel out.mp4 --only K` for the chunk(s) containing it (chunk K covers frames [(K-1)·dur/n, K·dur/n)) → deliver.py | ~8 min/chunk |
| Change scene text/asset | edit Scenes.tsx → 1 still to check → `--only K` re-render → deliver.py | ~8 min/chunk |
| Shorter version (30 s) | pick the keep ranges that carry the story, write keep30.json → cut_pauses.py `--keep` → regenerate captions/cues → render → deliver | ~25 min |
| File too big for chat | `python3 scripts/deliver.py in.mp4 out.mp4 --mb 28` (preview; auto bitrate) | 1–2 min |
| Looks muddy on Instagram | upload the master: `python3 scripts/deliver.py in.mp4 out_HQ.mp4 --master` (≈10–12 Mbps, split into parts for transfer, joined on the user's computer) | 3 min |

## Scripts
- `regrade.py CUTDIR [--preset|--grade] [--compare T]` — re-grade from the per-segment cut files, remux voice.
- `check_audio.py FINAL [--ref words.json --keep keep.json] [--chunk 15]` — digital-silence blocks (must be 0), level holes, Whisper per-window comparison vs the source transcript (flags windows missing >35 % of words).
- `mix_audio.py VOICE Sfx.tsx SFXDIR OUT.wav` — rebuild voice+SFX mix with ffmpeg (no Remotion).
- `render_chunks.py PROJ COMP OUT [--chunks 2] [--only K]` — chunked render + join (avoids OOM).
- `deliver.py IN OUT [--mb 28 | --master] [--audio mix.wav]` — loudnorm −14 LUFS, H.264. Preview sized to fit chat, or full-quality master (auto-split into ≤28 MB parts).

## Always
- After any fix: check_audio on the delivered file (dropouts 0), 2 stills of the changed part, then SendUserFile + commit to ClaudeCowork with the same name + `_v2/_v3`.
- If the bug was caused by an earlier step of ours, say so plainly.
