---
name: remotion-math-explainer
description: >-
  Creates synchronized, immersive single-pane Remotion visual explainer videos
  for Mathematics (Calculus, Linear Algebra, Differential Equations, Probability,
  Proofs) in a pure Log2Base2 single-stage format—with a focused single-line
  equation spotlight, full-screen 3Blue1Brown x Log2Base2 animated geometric/data
  motion graphics, WordBoundary karaoke captions, and fast 1080p MP4 rendering.
  Use whenever the user asks to explain math with /remotion, animate a
  derivation or theorem, or turn a math script into an MP4 explainer.
---

# Remotion Math Explainer (`remotion-math-explainer`)

## Overview

Turns any mathematical derivation, theorem, proof, or slide deck into an immersive, frame-synchronized **1920×1080 30fps MP4** Remotion explainer video in the **Single-Pane Log2Base2 Studio Format**.

Never split the screen into competing side-by-side panels or stacked text-card walls. Every video uses **one unified visual stage** (`<SinglePaneStage>`) so the viewer's full attention stays locked on the visual story:

1. **Minimal Top Bar (`44px`, built into `SinglePaneStage`)**:
   - Topic title + current active section pill on the left; subtle step counter + thin progress bar on the right.
2. **ONE Unified Log2Base2 Stage (`SinglePaneStage` — 100% width)**:
   - **Focused Single-Line Spotlight Header**: Shows **only** the current step title and the **single active equation line** (highlighting the active spoken term in-place with `borderBottom: "2px solid #FACC15"`, **never** adding horizontal padding) plus **one** compact active token callout pill (`symbol` → `plain-English meaning`) springing in at `triggerFrame`.
   - **Full-Width Immersive SVG Canvas (`viewBox="0 0 1600 680"`)**: Spacious, continuous motion graphics—live coordinate grids with colored data points stretching and collapsing, numbers physically gliding out of matrices into minor blocks, sweeping laser cross-outs, signed magnitude bars, and 3D unit cubes un-warping back to identity—integrated directly on the same open canvas.
3. **Minimal Bottom Caption Bar (`VoiceoverCaptionBar` — `68px`)**:
   - Clean centered karaoke word-by-word highlighted subtitles driven by exact TTS `WordBoundary` millisecond timestamps.

---

## Dependencies

- **`remotion-best-practices`** (`~/.gemini/skills/remotion/SKILL.md`): Must be followed for all Remotion animation rules (`useCurrentFrame()`, `interpolate()`, `spring()`, `<Sequence premountFor>`, `<Audio>`, `@remotion/google-fonts`, and zero CSS transitions).
- **`uv`** (`~/.gemini/config/plugins/science/skills/uv/SKILL.md`): Required to run `uv run --with edge-tts` for neural voiceover synthesis.

---

## Quick Start

```bash
# 1. Scaffold the Remotion math explainer project
uv run python3 \
  ~/.gemini/config/skills/remotion-math-explainer/scripts/explainer_cli.py \
  scaffold \
  --project-dir "/path/to/project" \
  --output "/path/to/project/scaffold-status.json"

# 2. Synthesize natural neural voiceover + exact WordBoundary & term timestamps
uv run --with edge-tts python3 \
  ~/.gemini/config/skills/remotion-math-explainer/scripts/explainer_cli.py \
  synthesize-voiceover \
  --project-dir "/path/to/project" \
  --beats-json "/path/to/project/beats.json" \
  --voice "en-US-AndrewNeural" \
  --rate "+2%" \
  --pause-sec 0.40 \
  --output "/path/to/project/public/voiceover/manifest.json"

# 3. Render final 1080p 30fps MP4 via fast 8-worker keyframe-deduplicated renderer
uv run python3 \
  ~/.gemini/config/skills/remotion-math-explainer/scripts/explainer_cli.py \
  render-mp4 \
  --project-dir "/path/to/project" \
  --composition-id "MathExplainer" \
  --out-name "MathExplainer.mp4" \
  --concurrency 8 \
  --output "/path/to/project/render-report.json"
```

---

## Immersive Storytelling & Workflow

1. **Design Energetic Beats (`beats.json`)**:
   - Write conversational, hook-first narration (avoid dry textbook phrasing) so even unmotivated students stay engaged.
   - Keep `snippet` to **2–4 crisp lines** where each `token` appears verbatim in one line and matches a clean single lowercase `triggerWord` in `text`.
   - Set `"motionStepFrames": 2` on beats with continuous curve, vector, grid, or flying-element animations.
2. **Scaffold & Synthesize Voiceover**:
   - Run `scaffold` (copies `SinglePaneStage.tsx`, `VoiceoverCaptionBar.tsx`, and `render_full_mp4.mjs`) and `synthesize-voiceover` via `scripts/explainer_cli.py`.
3. **Author Full-Canvas Motion Graphics (`viewBox="0 0 1600 680"`)**:
   - Pass your immersive SVG stage as `children` to `<SinglePaneStage>`.
   - **Show, don't tell**: Replace static bullet/text cards with physical motion—particles/points riding coordinate warps, elements flying between positions, sweeping laser lines, live gauges, and side-by-side live plots inside the **same** open canvas.
   - Always wrap warping/extending gridlines inside `<clipPath>` so motion never bleeds over labels or pills.
4. **Verify Stills & Render Final MP4**:
   - Run `npm run lint` and inspect representative still frames (`npx remotion still`) with `read_file` before running `render-mp4`.
   - Copy the final `.mp4` to `out/`, the project root, and the workspace root.

---

## Rate Limiting & Common Mistakes

- `scripts/explainer_cli.py` enforces `/tmp/remotion_edge_tts.lock` (`0.35s` spacing, 3 retries with `1s`/`2s`/`4s` backoff).
- **Never** use a multi-pane split-screen layout or stack bordered sub-cards—use `<SinglePaneStage>` so there is strictly **one** main pane on screen.
- **Never** dump a full multi-step proof on screen at once; spotlight one active equation line and one active callout pill at a time.
- **Never** add horizontal `padding` to highlighted inline tokens (`borderBottom: "2px solid #FACC15"` and `backgroundColor` only).
