# Remotion Stage

**Turn any code snippet, equation, circuit, system architecture, or physics problem into a frame-synchronized 1080p animated explainer video — straight from your AI coding assistant.**

Built for **students, teachers, researchers, and technical educators**, **Remotion Stage** is a suite of **8 AI Agent Skills** powered by [Remotion](https://www.remotion.dev/) and `edge-tts` that eliminates the friction of building clear, visual technical explanations.

---

## Why Remotion Stage?

Traditional educational slides and screen recordings suffer from cognitive overload—walls of text, tiny unreadable code, and disconnected audio. **Remotion Stage** enforces a **Single-Pane Visual Studio Format** (`1920×1080`, `30fps`):

1. **Minimal Top Bar (`44px`)** — Topic title, active section pill, step counter, and progress bar.
2. **Focused Single-Line Spotlight** — Displays only the active line of code, equation, register, or spec, highlighting the exact spoken token in-place alongside one plain-English callout pill.
3. **Full-Width Animated SVG Stage (`1600×680`)** — Continuous motion graphics tailored to each STEM domain: memory boxes & pointers, waveforms & oscilloscopes, free-body & field simulations, bit-level registers, and traveling packets.
4. **Millisecond-Synced Karaoke Captions (`68px`)** — Neural TTS (`edge-tts`) with `WordBoundary` timestamp alignment so visuals, spoken narration, and word highlights hit on the exact frame.
5. **Fast Deduplicated Rendering** — Persistent headless browser pool + keyframe deduplication renders crisp 1080p MP4s dramatically faster than naive frame-by-frame capture.

---

## Included Skills (8 STEM & Engineering Domains)

| Skill | Domain | Visuals & Focus |
| :--- | :--- | :--- |
| [`remotion-code-explainer`](skills/remotion-code-explainer/SKILL.md) | Source Code (Web, Mobile, Backend, AI/ML, DSA) | Memory boxes (`0x1004`), pointer arrows, call stacks, array/tree swaps, tensor & UI state |
| [`remotion-software-explainer`](skills/remotion-software-explainer/SKILL.md) | System Design & Architecture | Distributed flows, microservices, Kubernetes/Docker, WAL/DB internals, traveling packets |
| [`remotion-math-explainer`](skills/remotion-math-explainer/SKILL.md) | Mathematics | Calculus, linear algebra, ODEs, probability, geometric & proof animations |
| [`remotion-physics-explainer`](skills/remotion-physics-explainer/SKILL.md) | Physics | Free-body diagrams, pendulums, trajectories, $\vec{E}/\vec{B}$ fields, waves, quantum/thermo |
| [`remotion-electrical-explainer`](skills/remotion-electrical-explainer/SKILL.md) | Electrical Engineering | KVL/KCL circuits, AC phasors, Op-Amps, Bode/filters, current-flow dots, oscilloscope waves |
| [`remotion-electronic-explainer`](skills/remotion-electronic-explainer/SKILL.md) | Electronic Engineering | Semiconductors, PN junctions, BJTs/MOSFETs, CMOS logic, I-V curves, ADC/DAC |
| [`remotion-mechanical-explainer`](skills/remotion-mechanical-explainer/SKILL.md) | Mechanical Engineering | Statics/dynamics, shear-moment diagrams, stress/strain, fluid mechanics, thermo rigs |
| [`remotion-embedded-explainer`](skills/remotion-embedded-explainer/SKILL.md) | Embedded Systems & Firmware | Cortex-M/ESP32/RISC-V, 8/16/32-bit register bit-boxes, GPIO/ISR, SPI/I2C/UART, DMA, RTOS |

---

## Prerequisites

- **Node.js** (`>= 18`) & `npm`
- **Python 3** & [`uv`](https://docs.astral.sh/uv/) (runs `edge-tts` cleanly with `uv run --with edge-tts`)
- **FFmpeg & FFprobe** (`ffmpeg` and `ffprobe` on `PATH`)
- **Remotion Best Practices skill** (optional, recommended if using Antigravity/Claude Code with Remotion rules)

---

## Installation

### Option 1: Let Your AI Agent Install It (Recommended)

Simply paste this repository URL into your AI coding assistant (Antigravity, Claude Code, etc.) and tell it:

> *"Install the Remotion Stage skills from `https://github.com/uzowurumauritius-rgb/remotion-stage`."*

Your agent will clone the repository, run `install.sh` into your agent's skills directory, and check that prerequisites (`node`, `npm`, `python3`, `uv`, `ffmpeg`, `ffprobe`) are ready.

### Option 2: Manual Install

Clone this repository, then run the installer:

```bash
git clone https://github.com/uzowurumauritius-rgb/remotion-stage.git
cd remotion-stage
chmod +x install.sh
./install.sh
```

By default, `install.sh` copies all 8 skills into `~/.gemini/config/skills/`.

To install into a different agent skills directory (e.g., Claude Code or a custom workspace):

```bash
./install.sh --target ~/.claude/skills
```

---

## How Each Skill Works (3-Step Pipeline)

1. **`scaffold`** — Initializes a Remotion project and copies `SinglePaneStage.tsx`, `VoiceoverCaptionBar.tsx`, and `render_full_mp4.mjs`.
2. **`synthesize-voiceover`** — Generates neural voiceover MP3s per beat via `edge-tts`, measures exact durations with `ffprobe`, and outputs `public/voiceover/manifest.json` with millisecond `WordBoundary` and token trigger frames.
3. **`render-mp4`** — Bundles the composition and renders a `1920×1080` `30fps` MP4 using parallel headless browser workers and keyframe deduplication.

> **Tip for Educators & Researchers:** Just drop a lecture derivation, algorithm, lab circuit, or paper equation into your AI coding assistant and ask it to explain the concept using `/remotion` or the matching `remotion-*-explainer` skill.

---

## Repository Structure

```text
remotion-stage/
├── README.md
├── install.sh
└── skills/
    ├── remotion-code-explainer/
    ├── remotion-electrical-explainer/
    ├── remotion-electronic-explainer/
    ├── remotion-embedded-explainer/
    ├── remotion-math-explainer/
    ├── remotion-mechanical-explainer/
    ├── remotion-physics-explainer/
    └── remotion-software-explainer/
```
