import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TokenCallout } from "../data/voiceoverData";

interface SinglePaneStageProps {
  topicTitle: string;
  sectionTitle: string;
  stepTitle: string;
  activeLine: string;
  tokens: TokenCallout[];
  activeTokenIndex: number;
  beatIndex: number;
  totalBeats: number;
  progressPct: number;
  fontFamilyMono: string;
  fontFamilySans: string;
  accentColor?: string;
  captionBar: React.ReactNode;
  children: React.ReactNode;
}

export const SinglePaneStage: React.FC<SinglePaneStageProps> = ({
  topicTitle,
  sectionTitle,
  stepTitle,
  activeLine,
  tokens,
  activeTokenIndex,
  beatIndex,
  totalBeats,
  progressPct,
  fontFamilyMono,
  fontFamilySans,
  accentColor = "#38BDF8",
  captionBar,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const activeCallout = tokens[activeTokenIndex];
  const activeTokenStr = activeCallout?.token ?? "";

  const stageFade = interpolate(frame, [0, 10], [0.75, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const calloutPop = spring({
    frame: Math.max(0, frame - (activeCallout?.triggerFrame ?? 0)),
    fps,
    config: { damping: 18, stiffness: 220 },
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#040814",
        backgroundImage:
          "radial-gradient(circle at 20% 15%, rgba(56, 189, 248, 0.12), transparent 45%), radial-gradient(circle at 80% 85%, rgba(167, 139, 250, 0.10), transparent 48%)",
        padding: "16px 26px 18px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxSizing: "border-box",
      }}
    >
      {/* 1. Minimal Top Bar */}
      <div
        style={{
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 6px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontFamily: fontFamilySans,
              fontSize: 16,
              fontWeight: 800,
              color: "#F8FAFC",
              letterSpacing: 0.4,
            }}
          >
            {topicTitle}
          </span>
          <span
            style={{
              fontFamily: fontFamilyMono,
              fontSize: 12,
              fontWeight: 800,
              color: accentColor,
              backgroundColor: "rgba(56, 189, 248, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              padding: "4px 12px",
              borderRadius: 999,
            }}
          >
            {sectionTitle}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              fontFamily: fontFamilyMono,
              fontSize: 12.5,
              fontWeight: 700,
              color: "#94A3B8",
            }}
          >
            STEP {beatIndex + 1} OF {totalBeats}
          </span>
          <div
            style={{
              width: 190,
              height: 6,
              borderRadius: 999,
              backgroundColor: "rgba(148, 163, 184, 0.18)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: "100%",
                backgroundColor: accentColor,
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. ONE SINGLE UNIFIED LOG2BASE2 STAGE PANE */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          backgroundColor: "#080E1E",
          borderRadius: 20,
          border: "1px solid rgba(56, 189, 248, 0.24)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          opacity: stageFade,
        }}
      >
        {/* Focused Single-Line Spotlight Header */}
        <div
          style={{
            padding: "16px 28px",
            backgroundColor: "#0D1529",
            borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontFamily: fontFamilySans,
                fontSize: 13.5,
                fontWeight: 700,
                color: "#A78BFA",
                letterSpacing: 0.4,
              }}
            >
              {stepTitle}
            </span>
            <span
              style={{
                fontFamily: fontFamilyMono,
                fontSize: 25,
                fontWeight: 700,
                color: "#F8FAFC",
                letterSpacing: 0.3,
              }}
            >
              {activeTokenStr && activeLine.includes(activeTokenStr)
                ? activeLine.split(activeTokenStr).map((part, pIdx, arr) => (
                    <React.Fragment key={pIdx}>
                      {part}
                      {pIdx < arr.length - 1 ? (
                        <span
                          style={{
                            color: "#FEF08A",
                            backgroundColor: "rgba(250, 204, 21, 0.22)",
                            borderBottom: "2px solid #FACC15",
                          }}
                        >
                          {activeTokenStr}
                        </span>
                      ) : null}
                    </React.Fragment>
                  ))
                : activeLine}
            </span>
          </div>

          {activeCallout ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(250, 204, 21, 0.35)",
                padding: "9px 16px",
                borderRadius: 12,
                transform: `translateY(${(1 - calloutPop) * 6}px)`,
                opacity: calloutPop,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: fontFamilyMono,
                  fontSize: 13.5,
                  fontWeight: 800,
                  color: "#0F172A",
                  backgroundColor: "#FACC15",
                  padding: "3px 10px",
                  borderRadius: 6,
                }}
              >
                {activeCallout.token}
              </span>
              <span
                style={{
                  fontFamily: fontFamilySans,
                  fontSize: 15.5,
                  fontWeight: 600,
                  color: "#F8FAFC",
                }}
              >
                {activeCallout.label}
              </span>
            </div>
          ) : null}
        </div>

        {/* Full-Width Spacious Visual Canvas */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </div>
      </div>

      {/* 3. Minimal Bottom Caption Bar */}
      <div style={{ flexShrink: 0 }}>{captionBar}</div>
    </div>
  );
};
