---
name: remotion-physics-explainer
description: >-
  Creates synchronized, immersive single-pane Remotion visual explainer videos
  for Physics (Mechanics, Electromagnetism, Thermodynamics, Optics/Waves, Quantum
  Mechanics, Relativity) in a pure Log2Base2 single-stage format—with a focused
  single-line governing law spotlight, full-screen animated free-body/field/wave
  simulations and live telemetry on one canvas, millisecond-accurate WordBoundary
  karaoke captions, and fast 1080p MP4 rendering. Use whenever the user asks to
  explain physics with /remotion or animate a physical law/system.
---

# Remotion Physics Explainer (`remotion-physics-explainer`)

## Overview

Turns any physics concept, law, or problem into an immersive, frame-synchronized **1920×1080 30fps MP4** Remotion explainer video in the **Single-Pane Log2Base2 Studio Format**.

Never split the screen into competing side-by-side panes or stacked text-card walls. Every video uses **one unified visual stage** (`<SinglePaneStage>`):

1. **Minimal Top Bar (`44px`, built into `SinglePaneStage`)**:
   - Topic title + active section pill on the left; subtle step counter + thin progress bar on the right.
2. **ONE Unified Log2Base2 Stage (`SinglePaneStage` — 100% width)**:
   - **Focused Single-Line Spotlight Header**: Highlights the active spoken physical symbol (`F`, `m`, `a`, `E`, `B`, `λ`, `Ψ`, `ΔS`) in the active equation line with `borderBottom: "2px solid #FACC15"` (**never** add horizontal padding) plus **one** compact active callout pill (`symbol` → `physical meaning + SI units`) at `triggerFrame`.
   - **Full-Width Immersive SVG Canvas (`viewBox="0 0 1600 680"`)**: Spacious real-time physical simulations—pendulums, projectile trajectories, charged particles curving in $\vec{B}$-fields, interfering wavefronts, energy bar transfers, and live vector overlays—animated directly on the **same** open canvas.
3. **Minimal Bottom Caption Bar (`VoiceoverCaptionBar` — `68px`)**:
   - Clean centered karaoke word-by-word highlighted subtitles driven by exact TTS `WordBoundary` timestamps.

---

## Dependencies

- **`remotion-best-practices`** (`~/.gemini/skills/remotion/SKILL.md`): Must be followed for all Remotion animation rules (`useCurrentFrame()`, `interpolate()`, `spring()`, `<Sequence premountFor>`, `<Audio>`, `@remotion/google-fonts`, and zero CSS transitions).
- **`uv`** (`~/.gemini/config/plugins/science/skills/uv/SKILL.md`): Required to run `uv run --with edge-tts`.

---

## Quick Start

```bash
# 1. Scaffold the Remotion physics explainer project
uv run python3 \
  ~/.gemini/config/skills/remotion-physics-explainer/scripts/explainer_cli.py \
  scaffold \
  --project-dir "/path/to/project" \
  --output "/path/to/project/scaffold-status.json"

# 2. Synthesize natural neural voiceover + exact WordBoundary timestamps
uv run --with edge-tts python3 \
  ~/.gemini/config/skills/remotion-physics-explainer/scripts/explainer_cli.py \
  synthesize-voiceover \
  --project-dir "/path/to/project" \
  --beats-json "/path/to/project/beats.json" \
  --voice "en-US-AndrewNeural" \
  --rate "+2%" \
  --pause-sec 0.40 \
  --output "/path/to/project/public/voiceover/manifest.json"

# 3. Render final 1080p 30fps MP4
uv run python3 \
  ~/.gemini/config/skills/remotion-physics-explainer/scripts/explainer_cli.py \
  render-mp4 \
  --project-dir "/path/to/project" \
  --composition-id "PhysicsExplainer" \
  --out-name "PhysicsExplainer.mp4" \
  --concurrency 8 \
  --output "/path/to/project/render-report.json"
```

---

## Immersive Storytelling & Workflow

1. Keep `snippet` focused (`2–4` lines) so `<SinglePaneStage>` spotlights **one** active equation and **one** active symbol callout pill at a time.
2. Set `"motionStepFrames": 2` on beats with continuous physical motion (pendulums, waves, fields, particles).
3. **Show, don't tell**: Animate forces, fields, energy exchanges, and live motion graphs together inside the **same** full-width `1600×680` SVG canvas (using `<clipPath>` for moving plots/waves), never in separate split-screen boxes.
4. Always run `npm run lint`, inspect representative still frames (`npx remotion still`) with `read_file`, and save the final `.mp4` to `out/`, the project root, and the workspace root.
