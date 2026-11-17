import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { bundle } from "@remotion/bundler";
import { openBrowser, selectComposition, renderStill } from "@remotion/renderer";

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "public", "voiceover", "manifest.json");
const OUT_DIR = path.join(ROOT, "out");
const SLUG = path.basename(ROOT).replace(/[^a-zA-Z0-9_-]/g, "_") || "explainer";
const TMP_DIR = path.join("/tmp", `remotion-frames-${SLUG}`);

const COMPOSITION_ID = process.env.REMOTION_COMPOSITION_ID || "CodeExplainer";
const OUT_NAME = process.env.REMOTION_OUT_NAME || "Explainer.mp4";
const CONCURRENCY = Math.max(1, Number(process.env.REMOTION_CONCURRENCY || 8));

async function main() {
  if (!process.env.REMOTION_KEEP_CACHE) {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  const fps = manifest.fps; // 30
  const beats = manifest.beats;

  console.log("1. Bundling Remotion project...");
  const serveUrl = await bundle({
    entryPoint: path.join(ROOT, "src", "index.ts"),
  });

  console.log(`2. Opening persistent Headless Browser pool (${CONCURRENCY} workers)...`);
  const browsers = await Promise.all(
    Array.from({ length: CONCURRENCY }, () => openBrowser("chrome")),
  );

  const composition = await selectComposition({
    serveUrl,
    id: COMPOSITION_ID,
    puppeteerInstance: browsers[0],
  });

  // Build exact list of keyframe intervals across the timeline.
  // For each beat:
  // - Capture smooth entrance/spring motion frames during the first 0.8s (every 2 frames)
  // - Capture every token trigger frame (including brief 12-frame spring settle after each trigger)
  // - Capture every word boundary frame for crisp karaoke captions
  // - Optional beat.motionStepFrames (default 0 = keyframe-only, or e.g. 3 for continuous physics/wave motion)
  const segments = [];
  for (const beat of beats) {
    const beatStart = beat.startFrame;
    const beatDur = beat.durationInFrames;

    const localPoints = new Set([0]);
    for (let f = 0; f <= Math.min(24, beatDur - 1); f += 2) {
      localPoints.add(f);
    }

    if (typeof beat.motionStepFrames === "number" && beat.motionStepFrames > 0) {
      for (let f = 0; f < beatDur; f += beat.motionStepFrames) {
        localPoints.add(f);
      }
    }

    for (const tok of beat.tokens || []) {
      if (tok.triggerFrame >= 0 && tok.triggerFrame < beatDur) {
        for (let offset = 0; offset <= 10; offset += 2) {
          if (tok.triggerFrame + offset < beatDur) {
            localPoints.add(tok.triggerFrame + offset);
          }
        }
      }
    }

    for (const w of beat.words || []) {
      const wf = Math.round((w.startMs / 1000) * fps);
      if (wf >= 0 && wf < beatDur) {
        localPoints.add(wf);
      }
    }

    const sortedLocal = Array.from(localPoints).sort((a, b) => a - b);
    for (let i = 0; i < sortedLocal.length; i++) {
      const curLocal = sortedLocal[i];
      const nextLocal = i + 1 < sortedLocal.length ? sortedLocal[i + 1] : beatDur;
      const durFrames = nextLocal - curLocal;
      if (durFrames > 0) {
        segments.push({
          globalFrame: beatStart + curLocal,
          durationSec: durFrames / fps,
          imgPath: path.join(
            TMP_DIR,
            `frame-${String(beatStart + curLocal).padStart(6, "0")}.jpg`,
          ),
        });
      }
    }
  }

  console.log(
    `3. Rendering ${segments.length} Remotion visual states across ${CONCURRENCY} workers...`,
  );

  let nextIdx = 0;
  const startTime = Date.now();

  async function worker(browserInstance) {
    while (true) {
      const idx = nextIdx++;
      if (idx >= segments.length) break;
      const seg = segments[idx];
      if (!fs.existsSync(seg.imgPath)) {
        await renderStill({
          composition,
          serveUrl,
          output: seg.imgPath,
          frame: seg.globalFrame,
          imageFormat: "jpeg",
          jpegQuality: 92,
          puppeteerInstance: browserInstance,
        });
      }
      if ((idx + 1) % 100 === 0 || idx + 1 === segments.length) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(
          `   Rendered ${idx + 1}/${segments.length} states (${elapsed}s)`,
        );
      }
    }
  }

  await Promise.all(browsers.map((b) => worker(b)));
  await Promise.all(browsers.map((b) => b.close({ silent: true })));

  console.log("4. Assembling full audio track and MP4 video via FFmpeg...");
  const framesConcatPath = path.join(TMP_DIR, "frames_concat.txt");
  const concatLines = [];
  for (const seg of segments) {
    concatLines.push(`file '${seg.imgPath}'`);
    concatLines.push(`duration ${seg.durationSec.toFixed(6)}`);
  }
  concatLines.push(`file '${segments[segments.length - 1].imgPath}'`);
  fs.writeFileSync(framesConcatPath, concatLines.join("\n"), "utf-8");

  const audioListPath = path.join(TMP_DIR, "audio_concat.txt");
  const audioLines = [];
  for (const beat of beats) {
    const paddedWav = path.join(TMP_DIR, `${beat.id}.wav`);
    const targetDurSec = (beat.durationInFrames / fps).toFixed(6);
    const srcMp3 = path.join(ROOT, "public", beat.audioFile);
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-i",
        srcMp3,
        "-af",
        `apad=whole_dur=${targetDurSec}`,
        "-t",
        targetDurSec,
        "-ar",
        "44100",
        "-ac",
        "2",
        paddedWav,
      ],
      { stdio: "ignore" },
    );
    audioLines.push(`file '${paddedWav}'`);
  }
  fs.writeFileSync(audioListPath, audioLines.join("\n"), "utf-8");

  const fullAudioPath = path.join(TMP_DIR, "full_voiceover.m4a");
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      audioListPath,
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      fullAudioPath,
    ],
    { stdio: "ignore" },
  );

  const finalMp4 = path.join(OUT_DIR, OUT_NAME);
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      framesConcatPath,
      "-i",
      fullAudioPath,
      "-fps_mode",
      "cfr",
      "-r",
      String(fps),
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "20",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "copy",
      "-movflags",
      "+faststart",
      "-shortest",
      finalMp4,
    ],
    { stdio: "inherit" },
  );

  const rootMp4 = path.join(ROOT, OUT_NAME);
  fs.copyFileSync(finalMp4, rootMp4);

  console.log(`\nSUCCESS! Final full MP4 written to:\n  - ${finalMp4}\n  - ${rootMp4}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
