---
name: creamstage-cutout
description: Cut the speaker out of a selfie video (Robust Video Matting, CPU, no green screen) to make "text behind you" hooks, put the speaker in front of a map/graphic/screenshot, or blur/replace the background in a CreamStage Reel. Use when the user asks for text behind me, remove/blur background, me in front of the map, or cut-out.
---

# CreamStage Cut-out

`scripts/matte.py` + `scripts/rvm.onnx` (RobustVideoMatting mobilenetv3, 15 MB, GPL-3.0 model by PeterL1n). CPU speed ≈ 3.7 fps at work width 540 → only matte the seconds you need (hooks are 2–4 s ≈ 30 s of processing).

## Requirements
`onnxruntime` + `numpy` + ffmpeg (with libvpx-vp9). No PyPI in the workspace: on the user's computer `pip download onnxruntime --platform manylinux_2_28_x86_64 --python-version 3.13 --only-binary=:all: -d whl`, stage, `pip install --no-index --find-links whl onnxruntime --break-system-packages`.

## Make the foreground
```
python3 scripts/matte.py proj/public/aroll.mp4 0.0 3.0 proj/public/fg_hook.webm [--work 540]
```
Use the GRADED, CUT A-roll (same file the reel plays) so the cut-out lines up frame-for-frame. Output: transparent VP9 WebM (yuva420p), same size/fps. `--work 720` = cleaner hair edges, ~1.8× slower.

## Use it (Remotion)
Layer order, bottom → top: A-roll → your text/graphic → cut-out WebM.
```tsx
<Sequence from={S(0)} durationInFrames={S(3)}>
  <TextBehind text="20x MARGIN" fg="fg_hook.webm" from={0} t={0.1} y={380} color="#fff" />
</Sequence>
```
`TextBehind` (in creamstage-effects/src/Effects.tsx) draws a huge word stack and puts `<Video src={staticFile(fg)} transparent muted />` on top. The base A-roll must keep playing underneath (it is the background + carries the audio). `from` = the matte's start inside the Sequence (0 if the matte starts where the Sequence starts).

Other uses with the same WebM:
- **Speaker in front of a map/graphic**: background = cream stage + `RouteMap`/screenshot, top = fg WebM (shift with `transform` if the face must clear the graphic).
- **Background blur**: `<Video src=aroll style={{filter:'blur(18px)', transform:'scale(1.06)'}} muted/>` then the fg WebM on top.
- **Background replace**: any image/video underneath, fg on top; add a soft drop shadow on the fg for depth.

## Quality checks
Render 2 stills (start + middle). Check hair edge and hands; if hands moving fast fray, shorten the window or choose a calmer moment. Text must not cover eyes — y 300–450 puts it behind the head on a selfie framing.
