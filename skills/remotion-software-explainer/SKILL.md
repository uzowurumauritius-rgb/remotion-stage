---
name: remotion-software-explainer
description: >-
  Creates synchronized, immersive single-pane Remotion visual explainer videos
  for Software Engineering (System Design, Distributed Systems, Microservices,
  Kubernetes/Docker, Design Patterns, Database Internals, CI/CD, Networking)
  in a pure Log2Base2 single-stage format—with a focused single-line contract/YAML
  spotlight, full-screen animated architecture flows with traveling request
  packets and live trace timelines on one canvas, WordBoundary karaoke captions,
  and fast 1080p MP4 rendering. Use whenever the user asks to explain software
  engineering, system design, or architecture with /remotion.
---

# Remotion Software Engineering Explainer (`remotion-software-explainer`)

## Overview

Turns any system design, distributed architecture, design pattern, database internal, or DevOps workflow into an immersive, frame-synchronized **1920×1080 30fps MP4** Remotion explainer video in the **Single-Pane Log2Base2 Studio Format**.

Never split the screen into competing side-by-side panes or stacked text-card walls. Every video uses **one unified visual stage** (`<SinglePaneStage>`):

1. **Minimal Top Bar (`44px`, built into `SinglePaneStage`)**:
   - Topic title + active section pill on the left; subtle step counter + thin progress bar on the right.
2. **ONE Unified Log2Base2 Stage (`SinglePaneStage` — 100% width)**:
   - **Focused Single-Line Spotlight Header**: Highlights the active spoken element (`replicas: 3`, `ConsistentHash`, `WAL`, `CircuitBreaker`) in the active spec/contract line with `borderBottom: "2px solid #FACC15"` (**never** add horizontal padding) plus **one** compact active callout pill (`term` → `architectural role`) at `triggerFrame`.
   - **Full-Width Immersive SVG Canvas (`viewBox="0 0 1600 680"`)**: Progressive vector service nodes (Client, API Gateway, Load Balancer, Microservices, Message Queue, Cache, DB Shards, K8s Pods) appearing as spoken, connected by animated dashed pipelines with **traveling request packets**, live cache-hit/throughput gauges, and request trace spans flowing directly across the **same** open canvas.
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
  ~/.gemini/config/skills/remotion-software-explainer/scripts/explainer_cli.py \
  scaffold \
  --project-dir "/path/to/project" \
  --output "/path/to/project/scaffold-status.json"

# 2. Synthesize Voiceover
uv run --with edge-tts python3 \
  ~/.gemini/config/skills/remotion-software-explainer/scripts/explainer_cli.py \
  synthesize-voiceover \
  --project-dir "/path/to/project" \
  --beats-json "/path/to/project/beats.json" \
  --voice "en-US-AndrewNeural" \
  --rate "+2%" \
  --pause-sec 0.40 \
  --output "/path/to/project/public/voiceover/manifest.json"

# 3. Render 1080p MP4
uv run python3 \
  ~/.gemini/config/skills/remotion-software-explainer/scripts/explainer_cli.py \
  render-mp4 \
  --project-dir "/path/to/project" \
  --composition-id "SoftwareExplainer" \
  --out-name "SoftwareExplainer.mp4" \
  --concurrency 8 \
  --output "/path/to/project/render-report.json"
```

---

## Immersive Storytelling & Workflow

1. Keep `snippet` focused (`2–4` lines) so `<SinglePaneStage>` spotlights **one** active contract line and reveal architecture nodes progressively—never dump 15 boxes on frame 0.
2. Set `"motionStepFrames": 2` on beats with traveling request packets, failover cascades, or autoscaling animations.
3. **Show, don't tell**: Animate request packets moving across nodes alongside live latency/queue/trace bars directly inside the **same** full-width `1600×680` SVG canvas (using `<clipPath>` where needed), never in separate split-screen boxes.
4. Always run `npm run lint`, inspect representative still frames (`npx remotion still`) with `read_file`, and save the final `.mp4` to `out/`, the project root, and the workspace root.
