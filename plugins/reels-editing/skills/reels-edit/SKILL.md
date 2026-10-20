---
name: reels-edit
description: Edit a raw phone video (usually a talking-head selfie clip) into a finished vertical Reel, Short or TikTok. Use when the user says "edit this video", "make this a reel", "add captions", "polish my video", or uploads a .MOV/.MP4 and asks for an edit. Routes to the right specialist skill in this plugin.
---

# Reels edit (router)

Turn the user's raw clip into a ready-to-post 9:16 video. Work in this order and deliver each stage as a file the user can watch.

## 1. Inspect
- Run `ffprobe` for duration, resolution, rotation, fps and audio.
- Extract a contact sheet of frames (`fps=0.5,scale=480:-1,tile=5x1`) and look at it to confirm orientation, framing and what happens.
- Measure loudness (`volumedetect`) and find pauses (`silencedetect` or a 0.1 s RMS scan).

## 2. Polish (always)
- Output 1080x1920, H.264 CRF 18, yuv420p, 30 fps, AAC 192k, `+faststart`.
- Audio chain: `highpass=f=80, afftdn=nf=-25, acompressor=threshold=-20dB:ratio=3, loudnorm=I=-14:TP=-1.5:LRA=11` (Reels/Shorts loudness).
- Light grade: `eq=contrast=1.06:saturation=1.08`, `unsharp=5:5:0.5`. Never change skin tone strongly.
- Use the `ffmpeg` skill for any other conversion, trim or speed work.

## 3. Transcript
- Prefer word-level timestamps from Whisper (see `media-use` / `embedded-captions`).
- If transcription tools cannot be installed (network blocked), ask the user for the exact words or an .srt file exported from CapCut/Instagram. Never invent the spoken words. If timing must be estimated, map phrases onto detected speech segments and say so.

## 4. Captions and text
- For animated word-by-word captions, follow `embedded-captions`.
- Quick fallback without HyperFrames: generate an ASS file (PlayRes 1080x1920, bold font, white text, black outline, active word highlighted, pop-in scale animation) and burn it with the `ass` filter.
- Keep captions clear of the face and of the app UI zones (top ~200 px, bottom ~350 px on Reels).

## 5. Graphics and packaging
- Lower-thirds, title cards, data callouts, picture-in-picture: `talking-head-recut` (built on `hyperframes`, `hyperframes-core`, `hyperframes-animation`, `hyperframes-cli`).
- Long video into several short clips: `clipify`.

## 6. Check and deliver
- Pull frames at several timestamps and look at them: captions legible, nothing covering the face, correct orientation.
- Re-measure loudness (target about -14 LUFS).
- Save outputs next to the source with a clear suffix (`_polished`, `_captions`, `_final`) and tell the user what changed in two or three lines.
