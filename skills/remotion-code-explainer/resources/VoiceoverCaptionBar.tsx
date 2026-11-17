import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { WordTiming } from "../data/voiceoverData";

interface VoiceoverCaptionBarProps {
  words: WordTiming[];
  fallbackText: string;
  beatIndex: number;
  totalBeats: number;
  fontFamilySans: string;
  fontFamilyMono: string;
}

const WINDOW_SIZE = 14;

export const VoiceoverCaptionBar: React.FC<VoiceoverCaptionBarProps> = ({
  words,
  fallbackText,
  beatIndex,
  totalBeats,
  fontFamilySans,
  fontFamilyMono,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = (frame / fps) * 1000;

  let activeWordIndex = -1;
  for (let i = 0; i < words.length; i++) {
    if (currentTimeMs >= words[i].startMs) {
      activeWordIndex = i;
    } else {
      break;
    }
  }

  const pageIndex =
    activeWordIndex >= 0 ? Math.floor(activeWordIndex / WINDOW_SIZE) : 0;
  const pageStart = pageIndex * WINDOW_SIZE;
  const pageWords = words.slice(pageStart, pageStart + WINDOW_SIZE);

  return (
    <div
      style={{
        width: "100%",
        height: 68,
        backgroundColor: "rgba(11, 17, 32, 0.92)",
        borderRadius: 14,
        border: "1px solid rgba(148, 163, 184, 0.16)",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
      }}
    >
      {/* Subtle Step Indicator */}
      <span
        style={{
          fontFamily: fontFamilyMono,
          fontSize: 12,
          fontWeight: 700,
          color: "#64748B",
          flexShrink: 0,
          letterSpacing: 0.4,
        }}
      >
        {String(beatIndex + 1).padStart(2, "0")} /{" "}
        {String(totalBeats).padStart(2, "0")}
      </span>

      {/* Clean Centered Word-by-Word Subtitles */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "4px 6px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {pageWords.length > 0 ? (
          pageWords.map((w, idx) => {
            const globalIdx = pageStart + idx;
            const isCurrent = globalIdx === activeWordIndex;
            const isSpoken = globalIdx < activeWordIndex;
            return (
              <span
                key={`${globalIdx}-${w.startMs}`}
                style={{
                  fontFamily: fontFamilySans,
                  fontSize: 20,
                  fontWeight: isCurrent ? 800 : 500,
                  color: isCurrent
                    ? "#0F172A"
                    : isSpoken
                      ? "#F8FAFC"
                      : "#CBD5E1",
                  backgroundColor: isCurrent ? "#FACC15" : "transparent",
                  padding: isCurrent ? "1px 8px" : "1px 2px",
                  borderRadius: 6,
                }}
              >
                {w.text}
              </span>
            );
          })
        ) : (
          <span
            style={{
              fontFamily: fontFamilySans,
              fontSize: 18,
              color: "#E2E8F0",
            }}
          >
            {fallbackText}
          </span>
        )}
      </div>

      {/* Subtle Right Spacer for Visual Balance */}
      <div style={{ width: 52, flexShrink: 0 }} />
    </div>
  );
};
