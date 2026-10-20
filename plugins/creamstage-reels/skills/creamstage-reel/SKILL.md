---
name: creamstage-reel
description: Edit a talking-head phone video into a "CreamStage" Reel — Hinglish word-timed captions (Inter + blue Instrument Serif accents), a cream animation stage that slides in as a top split or full screen with motion-graphic scenes built from the user's screenshots/screen recordings/photos, and 3-pass sound design. Use when the user says "CreamStage", "same style as the FTA reel", "edit this like last time", or uploads a reel with assets to animate.
---

# CreamStage Reel method

The house style built for this user's export-business Reels (India–NZ FTA reel = reference). Reuse the template — do not redesign. Inspiring, clean, premium tone.

## Look (fixed)
- **A-roll (v0.4 natural grade)**: keep the camera's own lighting — the user lights his shoots well. Light touch only: `eq=contrast=1.05:saturation=1.05:gamma=1.02, colorbalance rs=0.01 bs=-0.015, curves all 0/0 0.25/0.24 0.5/0.52 0.8/0.82 1/0.98, unsharp 0.3` (in cut_pauses.py). NEVER lift blacks (no brightness+, no gamma >1.03, curves must start at 0/0): the old v0.2 'bright' grade raised blacks 18→33 and made beard/hair/shirt grey and the face flat/milky — the user said the lighting looked poorer after editing. cut_pauses.py prints a grade check: graded p1 must be ≤ original p1 + 4. If footage is genuinely dark, use regrade.py --preset bright on that reel only. No vignette. Bottom overlay only light (0.28→0.42 in the last 28%). 1080×1920, 30 fps. Subtle zoom 1.0→1.06 over the first 3 s, then soft 5-frame punch-ins (1.07) on key lines.
- **Captions**: 2–5 words per page, word-by-word reveal (blur→sharp, 5 frames). Normal words Inter 600 50 px white; key words Instrument Serif italic 100 px, `#7EA6FF` on video / `#2F6BFF` on cream. y ≈ 1340 (normal), 975 (split 900) / 870 (title split 760) — i.e. on the wall ABOVE the head, never on the face — on a soft dark band (rgba(12,14,22,0.5), blur 6, radius 30); 1640 on full cream. Hinglish in Roman script; brand names spelled correctly. Captions stop where the CTA scene takes over.
- **Cream stage** (`#F4F1EA` radial + dot grid, 56 px rounded bottom, big shadow): height 0 / 760 (title split) / 900 (split) / 1920 (full); 0.36 s inOut slides. In split, A-roll shifts down 420 px (360 for the title split) so the whole face sits below the stage with room for captions above the head.
- **Title card** in the first 5 s (split 760): country/brand kicker pill → sans headline → big serif accent → dark date chip → sub-title. Whatever title the user gives goes here verbatim.
- Accent colour `#2F6BFF`, ink `#151515`.

## Scene library (template/src/Scenes.tsx + examples/)
TitleCard · Leaders (polaroid photo + sliding news screenshot + "IN FORCE" stamp) · FreeEntry (big % counter + animated route arc with plane) · TenWebsites (browser-tile grid that ticks + chain chips) · Sites (screen recordings in a browser frame, numbered header, tag chips, progress dots, slide transitions) · Checklist (rows tick on cue, highlight, "send" plane) · Cta (headline + comment box typing the comment keyword + "DM aa jayega" bubble) · FollowShare (pill nudges). Product-idea reels (see `examples/product-idea/Scenes.tsx`, Block Print Bandana reel): TitleCard (product + price chips) · Product (two polaroid photos + tag) · Demand (route arcs India → markets) · Retail (screen recording + price tags) · Compare (wholesale vs retail bars + "20x+ price gap" badge) · Sourcing (city pin cards) · IndiaMart (supplier recording + tag) · Checklist · Cta (question + comment typing + Follow). Adapt text/assets/cues; add a new scene only when no existing one fits.

## Companion skills (v0.3)
- **creamstage-effects** — kinetic hook, route maps, counters/charts, phone/laptop mockups, annotations, PiP, before/after wipe, film look, emoji/arrow stickers. Pick 2–4 per reel where they fit the script (e.g. hook word → KineticHook or TextBehind; countries → Globe3D (or flat RouteMap); explainer/price-gap/story beats → Vox kit collage; prices → BarChart/Counter; website recordings → LaptopMockup/PhoneMockup; key reactions → Sticker).
- **creamstage-cutout** — speaker matte for text-behind-you hooks and speaker-in-front-of-graphic shots.
- **creamstage-fixes** — anything after delivery (grade, audio, caption fixes, chunk re-render, delivery size). Use its `render_chunks.py` and `deliver.py` for steps 8–9.

If the user supplies a transcript, write captions from it (correct spellings) and use Whisper only for timing. RTF transcripts store Hindi as \\uNNNN escapes — decode them.

## Workflow (do in this order, no detours)
1. **Assets**: stage video + user assets. Screen recordings → `ffmpeg crop=W:1276:0:0 (drop macOS dock), scale=1400, fps=30` into `public/assets/siteN.mp4`; run `blackdetect` and set `skip` for black intros. Filenames with "PM" may contain U+202F (narrow no-break space).
2. **Transcribe**: `scripts/transcribe.py` (large-v3-turbo, language hi). If a stretch is missing, re-transcribe that window alone. Start this first, in background — it takes ~4 min.
3. **Cut**: `scripts/cut_pauses.py SRC OUT` (pause tightening; add retake removal by editing keep.json, then `--keep`). It checks for dropouts — must print 0. Never fade audio on seeked segment files.
4. **Captions + cues**: copy `scripts/gen_captions_cues.py`, write caption pages + scene cues on the ORIGINAL timeline; it maps them through keep.json to `src/captions.ts` and `src/cues.ts`. Flag any word Whisper was unsure of to the user.
5. **Template**: copy `template/` to a project, symlink `node_modules`, copy `assets/fonts` + `assets/sfx` to `public/`, put `aroll.mp4` in `public/`. Edit only Scenes text/assets and the PANEL keyframes in Reel.tsx.
6. **Sound**: `scripts/gen_sfx.py` → `src/Sfx.tsx`. Rules: whooshes on every movement (−10 to −12 dB, peak on the fastest frame); textures on pops/clicks/reveals (−6 to −8 dB); risers ending on big transitions with a hit under (≥2 bass + ≥2 metallic, −5 to −7 dB); typing = soft clicks; voice always on top; no music unless the user supplies it (−19 dB, talking head only).
7. **Check stills**: render ~12 stills at scale 0.3, **max 2 in parallel** (more get killed). Fix overlaps, black frames.
8. **Render**: in 2 chunks to avoid OOM: `--frames=0-N` / `--frames=N+1-end`, `--concurrency=2 --offthreadvideo-cache-size-in-bytes=400000000 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`. Run in background with nohup and poll.
9. **Deliver (two files)**: render with `--crf=16` (render_chunks.py does it), concat chunks once, then creamstage-fixes `deliver.py`:
   - **Preview** for chat: `deliver.py joined.mp4 NAME.mp4 --mb 28` → SendUserFile.
   - **Upload master** for Instagram: `deliver.py joined.mp4 NAME_HQ.mp4 --master` (CRF 17, ≤12 Mbps, BT.709 tagged). If >29 MB it is split into `NAME_HQ.mp4.partNN`; SendUserFile each part, device_commit_files them into ClaudeCowork, then device_bash `cd ~/mnt/ClaudeCowork && cat NAME_HQ.mp4.part* > NAME_HQ.mp4 && rm NAME_HQ.mp4.part*` (needs delete permission; if the mount fails, tell the user to join with Terminal `cat NAME_HQ.mp4.part* > NAME_HQ.mp4`). Tell the user to upload the HQ file to Instagram, not the preview.
   Verify: whisper the final audio in 15 s chunks and compare to the source transcript (check_audio.py); any missing phrase = audio bug, fix with `scripts/mix_audio.py` (remux, no re-render).
10. Offer the post caption (Hinglish, numbered list, comment-keyword CTA, 15 hashtags, keywords line).

## Environment notes
- Cloud workspace has Chromium + ffmpeg but no npm/pypi. Toolkit comes from the user's computer: there, `pip download faster-whisper --platform manylinux_2_28_x86_64 --python-version 3.13 --only-binary=:all:` and `npm install --os=linux --cpu=x64 remotion@4.0.535 @remotion/{cli,renderer,media,fonts,captions} react@19 react-dom@19 @fontsource/inter @fontsource/instrument-serif`, tar both, stage into the workspace, `pip install --no-index --find-links`. Hugging Face is reachable for the Whisper model.
- Avoid single ffmpeg filter graphs that trim a full 1080×1920 video many times — OOM. Cut per segment.
- Keep the user informed in one line while long steps run; tell them honestly if something you did caused a problem.
