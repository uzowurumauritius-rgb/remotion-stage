---
name: remotion-mechanical-explainer
description: >-
  Creates synchronized, immersive single-pane Remotion visual explainer videos
  for Mechanical Engineering (Statics, Dynamics, Strength of Materials, Fluid
  Mechanics, Thermodynamics, Kinematics, Control Systems) in a pure Log2Base2
  single-stage format—with a focused single-line governing equation spotlight,
  full-screen animated CAD/FBD/shear-moment/thermodynamic rigs and stress/flow
  visuals on one canvas, WordBoundary karaoke captions, and fast 1080p MP4
  rendering. Use whenever the user asks to explain mechanical engineering
  concepts with /remotion.
---

# Remotion Mechanical Engineering Explainer (`remotion-mechanical-explainer`)

## Overview

Turns any mechanical engineering analysis, mechanism, or thermo-fluid system into an immersive, frame-synchronized **1920×1080 30fps MP4** Remotion explainer video in the **Single-Pane Log2Base2 Studio Format**.

Never split the screen into competing side-by-side panes or stacked text-card walls. Every video uses **one unified visual stage** (`<SinglePaneStage>`):

1. **Minimal Top Bar (`44px`, built into `SinglePaneStage`)**:
   - Topic title + active section pill on the left; subtle step counter + thin progress bar on the right.
2. **ONE Unified Log2Base2 Stage (`SinglePaneStage` — 100% width)**:
   - **Focused Single-Line Spotlight Header**: Highlights the active spoken engineering term (`σ = My/I`, `τ = Tr/J`, `Re`, `η`, `ΔP`) in the active equation line with `borderBottom: "2px solid #FACC15"` (**never** add horizontal padding) plus **one** compact active callout pill (`symbol` → `engineering meaning + units`) at `triggerFrame`.
   - **Full-Width Immersive SVG Canvas (`viewBox="0 0 1600 680"`)**: Progressive CAD-style vector cross-sections, free-body force/torque arrows, beam deflection with live stress color gradients, spinning gear trains, 4-bar linkages, piston-cylinder cycles, and $P$-$v$/$T$-$s$ curves animated directly on the **same** open canvas.
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
  ~/.gemini/config/skills/remotion-mechanical-explainer/scripts/explainer_cli.py \
  scaffold \
  --project-dir "/path/to/project" \
  --output "/path/to/project/scaffold-status.json"

# 2. Synthesize Voiceover
uv run --with edge-tts python3 \
  ~/.gemini/config/skills/remotion-mechanical-explainer/scripts/explainer_cli.py \
  synthesize-voiceover \
  --project-dir "/path/to/project" \
  --beats-json "/path/to/project/beats.json" \
  --voice "en-US-AndrewNeural" \
  --rate "+2%" \
  --pause-sec 0.40 \
  --output "/path/to/project/public/voiceover/manifest.json"

# 3. Render 1080p MP4
uv run python3 \
  ~/.gemini/config/skills/remotion-mechanical-explainer/scripts/explainer_cli.py \
  render-mp4 \
  --project-dir "/path/to/project" \
  --composition-id "MechanicalExplainer" \
  --out-name "MechanicalExplainer.mp4" \
  --concurrency 8 \
  --output "/path/to/project/render-report.json"
```

---

## Immersive Storytelling & Workflow

1. Keep `snippet` focused (`2–4` lines) so `<SinglePaneStage>` spotlights **one** active equation and **one** active callout pill at a time.
2. Set `"motionStepFrames": 2` on beats with rotating gears, linkages, fluid streamlines, beam deflections, or cyclic pistons.
3. **Show, don't tell**: Animate physical forces, streamlines, and live stress/thermodynamic curves together on the **same** full-width `1600×680` SVG canvas (using `<clipPath>` for moving grids/cycles), never in separate split-screen boxes.
4. Always run `npm run lint`, inspect representative still frames (`npx remotion still`) with `read_file`, and save the final `.mp4` to `out/`, the project root, and the workspace root.
