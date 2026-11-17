---
name: remotion-embedded-explainer
description: >-
  Creates synchronized, immersive single-pane Remotion visual explainer videos
  for Embedded Systems (ARM Cortex-M, AVR, ESP32, RISC-V, Registers & Bitwise Ops,
  GPIO/Interrupts/ISR, PWM/Timers, SPI/I2C/UART, DMA, RTOS, Bare-Metal C/Rust)
  in a pure Log2Base2 single-stage format—with a focused single-line firmware
  spotlight, full-screen animated 32/16/8-bit register bit-boxes, bus packets,
  and live hardware/logic-analyzer output on one canvas, WordBoundary karaoke
  captions, and fast 1080p MP4 rendering. Use whenever the user asks to explain
  embedded systems or firmware with /remotion.
---

# Remotion Embedded Systems Explainer (`remotion-embedded-explainer`)

## Overview

Turns any firmware snippet, peripheral driver, hardware protocol, or RTOS mechanism into an immersive, frame-synchronized **1920×1080 30fps MP4** Remotion explainer video in the **Single-Pane Log2Base2 Studio Format**.

Never split the screen into competing side-by-side panes or stacked text-card walls. Every video uses **one unified visual stage** (`<SinglePaneStage>`):

1. **Minimal Top Bar (`44px`, built into `SinglePaneStage`)**:
   - Topic title + active section pill on the left; subtle step counter + thin progress bar on the right.
2. **ONE Unified Log2Base2 Stage (`SinglePaneStage` — 100% width)**:
   - **Focused Single-Line Spotlight Header**: Highlights the active spoken token (`GPIOA->MODER`, `1U << 10`, `DMA`, `IRQ`) in the active C/Rust line with `borderBottom: "2px solid #FACC15"` (**never** add horizontal padding) plus **one** compact active callout pill (`token` → `hardware effect`) at `triggerFrame`.
   - **Full-Width Immersive SVG Canvas (`viewBox="0 0 1600 680"`)**: Large 32-bit/16-bit/8-bit register bit-boxes (`[31..0]`) physically flipping `0 → 1`, bit-shift (`<<`) slides, MCU ↔ Peripheral bus packets (`MOSI/MISO/SCLK`, `SDA/SCL`), and live dev-board LEDs/PWM/logic-analyzer waveforms responding directly on the **same** open canvas.
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
  ~/.gemini/config/skills/remotion-embedded-explainer/scripts/explainer_cli.py \
  scaffold \
  --project-dir "/path/to/project" \
  --output "/path/to/project/scaffold-status.json"

# 2. Synthesize Voiceover
uv run --with edge-tts python3 \
  ~/.gemini/config/skills/remotion-embedded-explainer/scripts/explainer_cli.py \
  synthesize-voiceover \
  --project-dir "/path/to/project" \
  --beats-json "/path/to/project/beats.json" \
  --voice "en-US-AndrewNeural" \
  --rate "+2%" \
  --pause-sec 0.40 \
  --output "/path/to/project/public/voiceover/manifest.json"

# 3. Render 1080p MP4
uv run python3 \
  ~/.gemini/config/skills/remotion-embedded-explainer/scripts/explainer_cli.py \
  render-mp4 \
  --project-dir "/path/to/project" \
  --composition-id "EmbeddedExplainer" \
  --out-name "EmbeddedExplainer.mp4" \
  --concurrency 8 \
  --output "/path/to/project/render-report.json"
```

---

## Immersive Storytelling & Workflow

1. Keep `snippet` focused (`2–4` lines) so `<SinglePaneStage>` spotlights **one** active firmware line and **one** active callout pill at a time.
2. Set `"motionStepFrames": 2` on beats with bit-shifts, traveling SPI/I2C/UART frames, or live logic-analyzer traces.
3. **Show, don't tell**: Animate bits flying into register slots and driving the virtual hardware/timing traces directly inside the **same** full-width `1600×680` SVG canvas (using `<clipPath>` for scrolling traces), never in separate split-screen boxes.
4. Always run `npm run lint`, inspect representative still frames (`npx remotion still`) with `read_file`, and save the final `.mp4` to `out/`, the project root, and the workspace root.
