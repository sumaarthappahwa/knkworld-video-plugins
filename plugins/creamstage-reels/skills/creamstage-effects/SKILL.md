---
name: creamstage-effects
description: Ready-made motion-graphic effects for CreamStage Reels — 3D globe with country routes, Vox-style paper collage kit, kinetic hook word, animated India→country route maps, counters/bar/line charts, 3D phone & laptop mockups, circle/highlight/underline/arrow annotations, picture-in-picture bubble, before/after wipe, film grain look, animated emoji stickers and arrow stickers. Use when a CreamStage reel (or any Remotion reel) needs one of these, or the user asks for "text behind me", "map", "chart", "mockup", "sticker", "emoji", "before after", "film look", "PiP".
---

# CreamStage Effects pack

Drop-in Remotion components (4.0.535). All `t` values are seconds on the composition (or Sequence) timeline; S() = seconds→frames at 30 fps. Visual language matches creamstage-reel (cream `#F4F1EA`, blue `#2F6BFF`, ink, Inter + Instrument Serif).

## Install into a project (≈1 min)
1. `cp src/Effects.tsx <proj>/src/` (theme.ts too if the project has none — Effects imports `S, INK, BLUE, CREAM, SANS, SERIF, inOut, out, clamp` from `./theme`).
2. `cp -r assets/data assets/emoji <proj>/public/` (world.json = Natural Earth 50m countries, Miller projection 2000×1100, keyed by ISO-A3; emoji = Noto animated emoji Lottie, Apache-2.0).
3. Stickers need `@remotion/lottie@4.0.535` + `lottie-web`: `tar xzf vendor/lottie.tgz` and copy `node_modules/@remotion/lottie` and `node_modules/lottie-web` into the shared node_modules (no npm in the workspace).
4. `demo/Demo.tsx` and `demo/KitDemo.tsx` (globe + Vox) show every effect in use; copy `data/globe.json` too (needs aroll.mp4, a screenshot, a recording, before/after jpgs in public/).

## Components (copy the call, change text/assets/cues)
| Effect | Call | Notes |
|---|---|---|
| Kinetic hook (first 1 s) | `<KineticHook word="20x MARGIN" sub="on one product" t={0.1} dark />` | Letters slam in (scale+blur+shake), never wraps mid-word, auto size. Use as the first 0.8–1.2 s before the A-roll, or over a darkened A-roll. |
| Route map | `<RouteMap from="IND" fromLabel="India" to={[{iso:'GBR',label:'UK',t:1.2},{iso:'ARE',label:'UAE',t:1.6}]} t={0.1} height={1100} />` | Camera zooms world→region, countries fill, arcs draw with moving dot. ISO-A3 codes (NZL, USA, DEU, AUS, CAN, SAU, NLD, FRA…). |
| Counter | `<Counter to={100000} prefix="₹" suffix="+" t={0.2} size={220} />` | Indian grouping by default. |
| Bars | `<BarChart t={0.6} items={[{label:'Wholesale India',value:45,display:'₹45'},{label:'Retail UK',value:1200,display:'₹1,200',highlight:true}]} />` | Grows staggered; highlight = blue. |
| Line chart | `<LineChart t={0.2} values={[12,18,26,44]} labels={['22','23','24','25']} />` | Draws on, end dot + value. |
| Phone mockup | `<PhoneMockup t={0.1} m={{src:'assets/site1.mp4', video:true, skip:1.2}} />` | 3D tilt that settles. m = {src, video?, from?, skip?, fit?, position?}. |
| Laptop mockup | `<LaptopMockup t={0.1} m={{src:'assets/site2.mp4', video:true}} width={980} />` | Lid opens 35°→8°. Better than a flat browser frame for website recordings. |
| Annotations | `<HighlightMark x y w h t/>`, `<CircleMark x y w h t/>`, `<UnderlineMark x y w t/>`, `<ArrowMark x1 y1 x2 y2 t/>` | Put inside a `position:relative` wrapper around the screenshot; coords in that wrapper's px. Hand-drawn feel, draw-on. |
| PiP bubble | `<PipBubble src="aroll.mp4" t={0.2} size={360} corner="br" faceX={0.5} faceY={0.38} zoom={1.5} />` | Speaker shrinks into a round bubble while a screenshot/recording fills the frame. Tune faceX/faceY so the face is centred. Keep the main A-roll audio playing. |
| Before/after | `<BeforeAfterWipe t={0.1} before={{src:'before.jpg'}} after={{src:'after.jpg'}} rest={0.5} labels={['BEFORE','AFTER']} />` | Slider sweeps then rests; works with video media too. |
| Film look | `<FilmLook grain={0.1} vignette={0.4} warm={0.1} leak t={0} dur={3} />` | Overlay, put last. Use sparingly — hook or story beat only, never the whole reel; keep vignette ≤0.45 on selfie A-roll (user dislikes dark faces). |
| Emoji sticker | `<Sticker emoji="rocket" x={820} y={420} t={1.2} size={220} dur={2} />` | Keys in `EMOJI`: rocket fire check party bulb thumbsup pointdown heart hundred package globe chartup thinking hearteyes mindblown clap alarm cross siren moneywings eyes raisehands moneyface. Some (hundred) start blank for a few frames — cue 0.2 s early. More: download `https://fonts.gstatic.com/s/e/notoemoji/latest/<codepoint>/lottie.json` on the user's computer (workspace can't reach gstatic) and add to EMOJI. |
| Arrow sticker | `<ArrowSticker x={300} y={1300} t={0.5} dir="down" color="#E5322D" />` | Draws on and bobs; point at a button/price. |
| Text behind you | `TextBehind` — see creamstage-cutout skill. |
| **3D globe** (Globe.tsx) | `<Globe3D from="IND" fromLabel="India" t={0.1} size={1000} theme="cream" to={[{iso:'ARE',label:'UAE',t:2.2},{iso:'GBR',label:'UK',t:2.6}]} />` | Accurate orthographic Earth (Natural Earth 50m, `public/data/globe.json`, ISO-A3 keys). Spins in to the origin, then the camera follows each route (looks at the origin–destination midpoint), highlights countries, draws lifted great-circle arcs, pill labels, pulsing origin dot. `theme="night"` = dark space look (gold/blue). Best with 1–3 destinations; very far pairs (India–USA) show the arc over the limb. `spin` = degrees of intro spin, `zoom` = [start,end]. Size 900–1000 on a full cream/night stage. |
| **Vox kit** (Vox.tsx) | `<PaperBg/>` background · `<TornCutout src x y w h t from="left|right|drop" rot seed mono?/>` photo on torn paper + tape · `<VoxHeadline pre key_ post y t/>` serif headline with yellow highlighter swipe · `<VoxLabel text x y t bg/>` black/red label strip · `<Typewriter text x y t/>` typed note on a paper slip · `<MarkerLoop x y w h t/>` hand-drawn red circle · `<PinBoard pins links/>` red pins + paper tags + red yarn | Paper-collage explainer look. Combine 2 cut-outs + labels + typewriter line per scene; finish with `<FilmLook grain={0.08}/>`. Kling images (1 credit) make good cut-out material (market stall, workshop, luxury room) — never use Kling for text. |

## Rules of use
- Max ~1 new effect per 4–6 s of reel; the CreamStage split/full stage stays the backbone.
- Stickers: 1–3 per reel, on emotional words (₹ margin → moneywings, "jaldi" → alarm, "follow" → pointdown). Never over the face — use the wall area above the head or the cream stage.
- Add an SFX for each effect entrance (pop texture for stickers/counters, whoosh for wipes/maps, riser→hit for the kinetic hook).
- Check stills (scale 0.3, max 2 in parallel) for every new effect before rendering.
