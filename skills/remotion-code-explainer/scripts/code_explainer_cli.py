#!/usr/bin/env python3
"""
CLI helper for the remotion-code-explainer skill.
Provides subcommands:
  - scaffold
  - synthesize-voiceover
  - render-mp4
"""
import argparse
import asyncio
import fcntl
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

LOCK_FILE = Path("/tmp/remotion_edge_tts.lock")
MIN_INTERVAL_SEC = 0.35
FPS = 30


class RateLimitError(Exception):
    """Raised when TTS service rate-limits requests."""


def enforce_rate_limit() -> None:
    LOCK_FILE.touch(exist_ok=True)
    with open(LOCK_FILE, "r+", encoding="utf-8") as lf:
        fcntl.flock(lf, fcntl.LOCK_EX)
        try:
            content = lf.read().strip()
            last_ts = float(content) if content else 0.0
            now = time.monotonic()
            elapsed = now - last_ts
            if 0 <= elapsed < MIN_INTERVAL_SEC:
                time.sleep(MIN_INTERVAL_SEC - elapsed)
            lf.seek(0)
            lf.truncate()
            lf.write(f"{time.monotonic():.6f}")
            lf.flush()
        finally:
            fcntl.flock(lf, fcntl.LOCK_UN)


def get_audio_duration_ffprobe(path: Path) -> float:
    res = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(res.stdout.strip())


async def synthesize_single_beat(
    beat: dict, out_dir: Path, voice: str, rate: str, pause_sec: float
) -> dict:
    import edge_tts

    mp3_path = out_dir / f"{beat['id']}.mp3"
    max_retries = 3
    words = []

    for attempt in range(1, max_retries + 1):
        enforce_rate_limit()
        words = []
        try:
            communicate = edge_tts.Communicate(
                beat["text"], voice, rate=rate, boundary="WordBoundary"
            )
            with open(mp3_path, "wb") as audio_file:
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        audio_file.write(chunk["data"])
                    elif chunk["type"] == "WordBoundary":
                        start_ms = round(chunk["offset"] / 10000)
                        dur_ms = round(chunk["duration"] / 10000)
                        words.append(
                            {
                                "text": chunk["text"],
                                "startMs": start_ms,
                                "endMs": start_ms + dur_ms,
                            }
                        )
            break
        except Exception as exc:
            if attempt == max_retries:
                raise RuntimeError(
                    f"edge-tts failed for beat '{beat['id']}' after {max_retries} attempts "
                    f"(rate_limit={MIN_INTERVAL_SEC}s/req): {exc}"
                ) from exc
            backoff = 2 ** (attempt - 1)
            print(
                f"[retry {attempt}/{max_retries}] edge-tts error on {beat['id']}: {exc}. "
                f"Retrying in {backoff}s...",
                file=sys.stderr,
            )
            await asyncio.sleep(backoff)

    audio_dur_sec = get_audio_duration_ffprobe(mp3_path)
    total_sec = audio_dur_sec + pause_sec
    duration_in_frames = max(30, int(round(total_sec * FPS)))

    tokens_with_timing = []
    total_ms = int(audio_dur_sec * 1000)
    raw_tokens = beat.get("tokens", [])
    for idx, tok in enumerate(raw_tokens):
        trigger = tok.get("triggerWord", "").lower()
        matched_ms = None
        if trigger:
            for w in words:
                if trigger in w["text"].lower():
                    matched_ms = w["startMs"]
                    break
        if matched_ms is None:
            matched_ms = int((idx / max(1, len(raw_tokens))) * total_ms * 0.8)
        tokens_with_timing.append(
            {
                "token": tok["token"],
                "label": tok["label"],
                "triggerMs": matched_ms,
                "triggerFrame": int(round((matched_ms / 1000.0) * FPS)),
            }
        )

    return {
        **beat,
        "audioFile": f"voiceover/{beat['id']}.mp3",
        "audioDurationSec": round(audio_dur_sec, 3),
        "durationInFrames": duration_in_frames,
        "words": words,
        "tokens": tokens_with_timing,
    }


def cmd_scaffold(args: argparse.Namespace) -> None:
    skill_root = Path(__file__).resolve().parent.parent
    resources_dir = skill_root / "resources"
    project_dir = Path(args.project_dir).resolve()
    source_file = Path(args.source_file).resolve()
    output_path = Path(args.output).resolve()

    if not source_file.exists():
        print(f"Error: Source file not found: {source_file}", file=sys.stderr)
        sys.exit(1)

    project_dir.mkdir(parents=True, exist_ok=True)
    pkg_json = project_dir / "package.json"

    if not pkg_json.exists():
        tmp_init = project_dir / "remotion-temp-init"
        if tmp_init.exists():
            shutil.rmtree(tmp_init)
        subprocess.run(
            [
                "npx",
                "--yes",
                "create-video@latest",
                "--yes",
                "--blank",
                "--no-tailwind",
                "remotion-temp-init",
            ],
            cwd=str(project_dir),
            check=True,
        )
        for item in tmp_init.iterdir():
            target = project_dir / item.name
            if target.exists():
                if target.is_dir():
                    shutil.rmtree(target)
                else:
                    target.unlink()
            shutil.move(str(item), str(target))
        tmp_init.rmdir()

    subprocess.run(
        ["npx", "remotion", "add", "@remotion/media", "@remotion/google-fonts"],
        cwd=str(project_dir),
        check=True,
    )

    comp_dir = project_dir / "src" / "components"
    scripts_dir = project_dir / "scripts"
    comp_dir.mkdir(parents=True, exist_ok=True)
    scripts_dir.mkdir(parents=True, exist_ok=True)

    copied = []
    for res_file in resources_dir.iterdir():
        if res_file.suffix in {".tsx", ".ts"}:
            shutil.copy2(res_file, comp_dir / res_file.name)
            copied.append(res_file.name)
        elif res_file.name == "render_full_mp4.mjs":
            shutil.copy2(res_file, scripts_dir / "render_full_mp4.mjs")

    result = {
        "status": "ok",
        "projectDir": str(project_dir),
        "sourceFile": str(source_file),
        "copiedComponents": copied,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"Success! Scaffold metadata written to: {output_path}")


def cmd_synthesize_voiceover(args: argparse.Namespace) -> None:
    project_dir = Path(args.project_dir).resolve()
    beats_path = Path(args.beats_json).resolve()
    output_path = Path(args.output).resolve()

    if not beats_path.exists():
        print(f"Error: Beats JSON not found: {beats_path}", file=sys.stderr)
        sys.exit(1)

    beats = json.loads(beats_path.read_text(encoding="utf-8"))
    out_dir = project_dir / "public" / "voiceover"
    out_dir.mkdir(parents=True, exist_ok=True)
    data_dir = project_dir / "src" / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    async def _run():
        results = []
        current_frame = 0
        for beat in beats:
            item = await synthesize_single_beat(
                beat, out_dir, args.voice, args.rate, args.pause_sec
            )
            item["startFrame"] = current_frame
            item["endFrame"] = current_frame + item["durationInFrames"]
            current_frame = item["endFrame"]
            results.append(item)
        return results, current_frame

    try:
        results, total_frames = asyncio.run(_run())
    except Exception as exc:
        print(f"Error during voiceover synthesis: {exc}", file=sys.stderr)
        sys.exit(1)

    manifest = {
        "fps": FPS,
        "voice": args.voice,
        "totalFrames": total_frames,
        "totalDurationSec": round(total_frames / FPS, 2),
        "beats": results,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    ts_path = data_dir / "voiceoverData.ts"
    ts_content = (
        "// AUTO-GENERATED BY code_explainer_cli.py — DO NOT EDIT MANUALLY\n"
        "export interface WordTiming {\n"
        "  text: string;\n"
        "  startMs: number;\n"
        "  endMs: number;\n"
        "}\n\n"
        "export interface TokenCallout {\n"
        "  token: string;\n"
        "  label: string;\n"
        "  triggerMs: number;\n"
        "  triggerFrame: number;\n"
        "}\n\n"
        "export interface VoiceoverBeat {\n"
        "  id: string;\n"
        "  sectionId: string;\n"
        "  sectionTitle: string;\n"
        "  lineTitle: string;\n"
        "  focusLines: number[];\n"
        "  scrollLine: number;\n"
        "  codeSnippet: string;\n"
        "  visualType: string;\n"
        "  text: string;\n"
        "  motionStepFrames?: number;\n"
        "  audioFile: string;\n"
        "  audioDurationSec: number;\n"
        "  durationInFrames: number;\n"
        "  startFrame: number;\n"
        "  endFrame: number;\n"
        "  words: WordTiming[];\n"
        "  tokens: TokenCallout[];\n"
        "}\n\n"
        f"export const VOICEOVER_FPS = {FPS};\n"
        f"export const TOTAL_DURATION_FRAMES = {total_frames};\n"
        f"export const VOICEOVER_BEATS: VoiceoverBeat[] = {json.dumps(results, indent=2)};\n"
    )
    ts_path.write_text(ts_content, encoding="utf-8")
    print(f"Success! Voiceover manifest written to: {output_path}")


def cmd_render_mp4(args: argparse.Namespace) -> None:
    project_dir = Path(args.project_dir).resolve()
    output_path = Path(args.output).resolve()
    render_script = project_dir / "scripts" / "render_full_mp4.mjs"

    if not render_script.exists():
        print(f"Error: {render_script} not found.", file=sys.stderr)
        sys.exit(1)

    env = os.environ.copy()
    env["REMOTION_COMPOSITION_ID"] = args.composition_id
    env["REMOTION_OUT_NAME"] = args.out_name
    env["REMOTION_CONCURRENCY"] = str(args.concurrency)

    subprocess.run(
        ["node", str(render_script)],
        cwd=str(project_dir),
        env=env,
        check=True,
    )

    final_mp4 = project_dir / "out" / args.out_name
    root_mp4 = project_dir / args.out_name
    report = {
        "status": "ok",
        "outMp4": str(final_mp4),
        "rootMp4": str(root_mp4),
        "sizeBytes": final_mp4.stat().st_size if final_mp4.exists() else 0,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Success! Render report written to: {output_path}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="CLI helper for remotion-code-explainer skill"
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_scaf = sub.add_parser("scaffold", help="Scaffold Remotion code explainer project")
    p_scaf.add_argument("--project-dir", required=True)
    p_scaf.add_argument("--source-file", required=True)
    p_scaf.add_argument("--output", required=True)
    p_scaf.set_defaults(func=cmd_scaffold)

    p_tts = sub.add_parser(
        "synthesize-voiceover",
        help="Synthesize neural voiceover MP3s and WordBoundary timestamps",
    )
    p_tts.add_argument("--project-dir", required=True)
    p_tts.add_argument("--beats-json", required=True)
    p_tts.add_argument("--voice", default="en-US-AndrewNeural")
    p_tts.add_argument("--rate", default="-2%")
    p_tts.add_argument("--pause-sec", type=float, default=0.45)
    p_tts.add_argument("--output", required=True)
    p_tts.set_defaults(func=cmd_synthesize_voiceover)

    p_ren = sub.add_parser(
        "render-mp4",
        help="Render full 1080p MP4 via keyframe-deduplicated Chromium pool + FFmpeg",
    )
    p_ren.add_argument("--project-dir", required=True)
    p_ren.add_argument("--composition-id", default="FortuneCookieExplainer")
    p_ren.add_argument("--out-name", required=True)
    p_ren.add_argument("--concurrency", type=int, default=8)
    p_ren.add_argument("--output", required=True)
    p_ren.set_defaults(func=cmd_render_mp4)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
