---
name: remotion-electronic-explainer
description: >-
  Creates synchronized, immersive single-pane Remotion visual explainer videos
  for Electronic Engineering (Semiconductors, PN Junctions, Diodes, BJTs, MOSFETs,
  CMOS Logic, Op-Amp IC Stages, ADC/DAC, PCB Signal Integrity) in a pure Log2Base2
  single-stage format—with a focused single-line device equation spotlight,
  full-screen animated carrier/channel diagrams and live I-V curves on one
  canvas, WordBoundary karaoke captions, and fast 1080p MP4 rendering. Use
  whenever the user asks to explain electronic engineering, semiconductors,
  transistors, or analog/digital ICs with /remotion.
---

# Remotion Electronic Engineering Explainer (`remotion-electronic-explainer`)

## Overview

Turns any electronic engineering topic—from semiconductor physics and transistor biasing to CMOS logic and analog IC stages—into an immersive, frame-synchronized **1920×1080 30fps MP4** Remotion explainer video in the **Single-Pane Log2Base2 Studio Format**.

Never split the screen into competing side-by-side panes or stacked text-card walls. Every video uses **one unified visual stage** (`<SinglePaneStage>`):

1. **Minimal Top Bar (`44px`, built into `SinglePaneStage`)**:
   - Topic title + active section pill on the left; subtle step counter + thin progress bar on the right.
2. **ONE Unified Log2Base2 Stage (`SinglePaneStage` — 100% width)**:
   - **Focused Single-Line Spotlight Header**: Highlights the active spoken term (`V_GS`, `V_th`, `I_D`, `β`, `g_m`, `V_OH`) in the active equation line with `borderBottom: "2px solid #FACC15"` (**never** add horizontal padding) plus **one** compact active callout pill (`symbol` → `electronic meaning + units`) at `triggerFrame`.
   - **Full-Width Immersive SVG Canvas (`viewBox="0 0 1600 680"`)**: Crisp animated semiconductor cross-sections (PN depletion region widening/narrowing, MOSFET inversion channel & pinch-off, BJT carrier flow, CMOS pull-up/pull-down switching) directly paired with a live $I$-$V$ curve and moving **Q-point** on the **same** open canvas.
3. **Minimal Bottom Caption Bar (`VoiceoverCaptionBar` — `68px`)**:
   - Clean centered karaoke word-by-word highlighted subtitles driven by exact TTS `WordBoundary` timestamps.

---

## Dependencies

- **`remotion-best-practices`** (`~/.gemini/skills/remotion/SKILL.md`)
- **`uv`** (`~/.gemini/config/plugins/science/skills/uv/SKILL.md`)

---

## Quick Start

```bash
# 1. Scaffold
uv run python3 \
  ~/.gemini/config/skills/remotion-electronic-explainer/scripts/explainer_cli.py \
  scaffold \
  --project-dir "/path/to/project" \
  --output "/path/to/project/scaffold-status.json"

# 2. Synthesize Voiceover
uv run --with edge-tts python3 \
  ~/.gemini/config/skills/remotion-electronic-explainer/scripts/explainer_cli.py \
  synthesize-voiceover \
  --project-dir "/path/to/project" \
  --beats-json "/path/to/project/beats.json" \
  --voice "en-US-AndrewNeural" \
  --rate "+2%" \
  --pause-sec 0.40 \
  --output "/path/to/project/public/voiceover/manifest.json"

# 3. Render 1080p MP4
uv run python3 \
  ~/.gemini/config/skills/remotion-electronic-explainer/scripts/explainer_cli.py \
  render-mp4 \
  --project-dir "/path/to/project" \
  --composition-id "ElectronicExplainer" \
  --out-name "ElectronicExplainer.mp4" \
  --concurrency 8 \
  --output "/path/to/project/render-report.json"
```

---

## Immersive Storytelling & Workflow

1. Keep `snippet` focused (`2–4` lines) so `<SinglePaneStage>` spotlights **one** active equation and **one** active callout pill at a time.
2. Set `"motionStepFrames": 2` on beats with moving Q-points, carrier flow, pinch-off morphs, or live switching waveforms.
3. **Show, don't tell**: Animate electrons/holes, depletion widths, and moving load-line Q-points directly on the single open `1600×680` SVG canvas (clipped cleanly with `<clipPath>`), never in separate split-screen boxes.
4. Always run `npm run lint`, inspect representative still frames (`npx remotion still`) with `read_file`, and save the final `.mp4` to `out/`, the project root, and the workspace root.
