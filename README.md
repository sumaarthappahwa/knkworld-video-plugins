# knkworld video plugins for Claude

Two plugins for editing talking-head phone videos into Reels, Shorts and TikToks.

| Plugin | What it does |
|---|---|
| **reels-editing** | Start here. Cleanup, animated word-by-word captions, graphic overlays, and cutting long videos into short clips. |
| **creamstage-reels** | The CreamStage house style: Hinglish captions, cream animation stage, effects pack, "text behind you" cut-out, quick fixes. |

Also install **Remotion** (CreamStage is built on it): https://github.com/remotion-dev/claude-code-plugin

## Install in Claude Code

```bash
claude plugin marketplace add sumaarthappahwa/knkworld-video-plugins
claude plugin install reels-editing@knkworld-video
claude plugin install creamstage-reels@knkworld-video

claude plugin marketplace add remotion-dev/claude-code-plugin
claude plugin install remotion@remotion
```

Restart Claude Code after installing.

## Requirements

ffmpeg, Node.js, and Python (Whisper is used for automatic transcription).

## Licenses

These plugins bundle open-source components under their own licenses:

- HyperFrames by HeyGen — Apache-2.0
- clipify by Louise de Sadeleer — MIT
- OpenMontage (ffmpeg skill) — AGPL-3.0
- Noto Emoji animations — Apache-2.0; Natural Earth — public domain
- RobustVideoMatting model — GPL-3.0
- Inter & Instrument Serif fonts — SIL OFL; Kenney SFX — CC0

Full texts are in `plugins/reels-editing/licenses/`. Each plugin's README lists its sources.
