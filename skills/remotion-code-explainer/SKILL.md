---
name: remotion-code-explainer
description: >-
  Creates synchronized, immersive single-pane Remotion visual explainer videos
  for source code (Mobile/Web UI, Backend, AI/ML, Algorithms) in a pure
  Log2Base2 single-stage format—with a focused single-line code spotlight,
  full-screen animated memory boxes, pointer arrows, data packets, and live
  execution state on one canvas, WordBoundary karaoke captions, and fast 1080p
  MP4 rendering. Use whenever the user asks to explain code with /remotion,
  build a code walkthrough video, or turn a voiceover script into an MP4
  explainer.
---

# Remotion Code Explainer (`remotion-code-explainer`)

## Overview

Turns any source code file into an immersive, frame-synchronized **1920×1080 30fps MP4** Remotion explainer video in the **Single-Pane Log2Base2 Studio Format**.

Never split the screen into competing side-by-side panes or crowded multi-card walls. Every video uses **one unified visual stage** (`<SinglePaneStage>`) so the viewer's full attention stays locked on how the code executes:

1. **Minimal Top Bar (`44px`, built into `SinglePaneStage`)**:
   - Lesson title + current active section pill on the left; subtle step counter + thin progress bar on the right.
2. **ONE Unified Log2Base2 Stage (`SinglePaneStage` — 100% width)**:
   - **Focused Single-Line Spotlight Header**: Shows **only** the current step title and the **single active code line** in crisp monospace (highlighting the active spoken token in-place with `borderBottom: "2px solid #FACC15"`, **never** adding horizontal padding) plus **one** compact active callout pill (`token` → `plain-English meaning`) springing in at `triggerFrame`.
   - **Full-Width Immersive SVG Canvas (`viewBox="0 0 1600 680"`)**: Spacious, continuous motion graphics combining Log2Base2 memory/execution visuals (labeled memory boxes `0x1004`, mutating variables, animated `strokeDashoffset` pointer arrows, stack frames pushing/popping, array/tree swaps) directly alongside live UI/stdout/tensor previews on the **same** open canvas.
3. **Minimal Bottom Caption Bar (`VoiceoverCaptionBar` — `68px`)**:
   - Clean centered karaoke word-by-word highlighted subtitles driven by exact TTS `WordBoundary` millisecond timestamps (`startMs`, `endMs`).

---

## Dependencies

- **`remotion-best-practices`** (`~/.gemini/skills/remotion/SKILL.md`): Must be followed for all Remotion animation rules (`useCurrentFrame()`, `interpolate()`, `spring()`, `<Sequence premountFor>`, `<Audio>`, `@remotion/google-fonts`, and zero CSS transitions).
- **`uv`** (`~/.gemini/config/plugins/science/skills/uv/SKILL.md`): Required to run `uv run --with edge-tts` for neural voiceover synthesis and `WordBoundary` timestamp extraction.

---

## Quick Start

```bash
# 1. Scaffold the Remotion explainer project
uv run python3 \
  ~/.gemini/config/skills/remotion-code-explainer/scripts/code_explainer_cli.py \
  scaffold \
  --project-dir "/path/to/project" \
  --source-file "/path/to/source.ext" \
  --output "/path/to/project/scaffold-status.json"

# 2. Synthesize natural neural voiceover + exact WordBoundary & token timestamps
uv run --with edge-tts python3 \
  ~/.gemini/config/skills/remotion-code-explainer/scripts/code_explainer_cli.py \
  synthesize-voiceover \
  --project-dir "/path/to/project" \
  --beats-json "/path/to/project/beats.json" \
  --voice "en-US-AndrewNeural" \
  --rate "+2%" \
  --pause-sec 0.40 \
  --output "/path/to/project/public/voiceover/manifest.json"

# 3. Render final 1080p 30fps MP4 via fast 8-worker keyframe-deduplicated renderer
uv run python3 \
  ~/.gemini/config/skills/remotion-code-explainer/scripts/code_explainer_cli.py \
  render-mp4 \
  --project-dir "/path/to/project" \
  --composition-id "CodeExplainer" \
  --out-name "Explainer.mp4" \
  --concurrency 8 \
  --output "/path/to/project/render-report.json"
```

---

## Immersive Storytelling & Workflow

1. **Design Energetic Beats (`beats.json`)**:
   - Write crisp, conversational narration that hooks the viewer immediately into *why* the code behaves the way it does.
   - Keep `codeSnippet` focused (`1–4` lines) so the active line passed to `<SinglePaneStage>` contains the active `token` verbatim.
   - Set `"motionStepFrames": 2` on beats with traveling packets, pointer hops, array swaps, or live tensor/UI animations.
2. **Scaffold & Synthesize Voiceover**:
   - Run `scaffold` (copies `SinglePaneStage.tsx`, `VoiceoverCaptionBar.tsx`, and `render_full_mp4.mjs`) and `synthesize-voiceover` via `scripts/code_explainer_cli.py`.
3. **Author Full-Canvas Motion Graphics (`viewBox="0 0 1600 680"`)**:
   - Pass your animated Log2Base2 × KodeKloud SVG storyboard as `children` into `<SinglePaneStage>`.
   - **Show, don't tell**: Replace static code walls and text boxes with physical motion—values flying from registers/variables into memory slots, pointers re-routing smoothly, data packets traveling across components, and live state/UI outputs updating on the same open canvas.
   - Wrap dynamic grids or scrolling traces in `<clipPath>` so motion never bleeds outside its region.
4. **Verify Stills & Render Final MP4**:
   - Run `npm run lint` and inspect representative still frames (`npx remotion still`) with `read_file` to verify zero overlap or clipping.
   - Run `render-mp4` (`scripts/render_full_mp4.mjs`) and ensure the final `.mp4` is saved to `out/`, the project root, and the workspace root.

---

## Rate Limiting & Common Mistakes

- `scripts/code_explainer_cli.py` enforces `/tmp/remotion_edge_tts.lock` (`0.35s` spacing, 3 retries with `1s`/`2s`/`4s` backoff).
- **Never** use a 2-zone split-screen dashboard or dump a 40-line scrolling code wall; keep the screen to **one** `<SinglePaneStage>` pane.
- **Never** add horizontal `padding` to highlighted inline tokens (`borderBottom: "2px solid #FACC15"` and `backgroundColor` only).
- **Never** use static text cards inside the SVG stage when animated memory/pointer/packet motion can demonstrate the concept visually.
