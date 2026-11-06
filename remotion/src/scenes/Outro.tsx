import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT } from "../theme";
import { Aurora, easeOutCubic } from "../components/Aurora";
import { LeafMark } from "../components/Logo";
import spec from "../spec.json";

const up = (frame: number, delay: number, dur = 26, dist = 44) => {
  const p = interpolate(frame, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });
  return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` };
};

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // gentle settle (zoom out) for a calm ending
  const zoom = interpolate(frame, [0, durationInFrames], [1.07, 1.0], {
    easing: Easing.inOut(Easing.quad),
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
        <Aurora intensity={1.1} />
        <AbsoluteFill
          style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}
        >
          <div style={{ ...up(frame, 4, 24, 26), opacity: up(frame, 4, 24, 26).opacity }}>
            <LeafMark size={120} color={C.lime} />
          </div>
          <div
            style={{
              ...up(frame, 14, 28, 40),
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 104,
              lineHeight: 1.05,
              letterSpacing: -3,
              color: C.paper,
              textAlign: "center",
              marginTop: 26,
            }}
          >
            {spec.tagline1}
            <br />
            <span style={{ color: C.lime }}>{spec.tagline2}</span>
          </div>
          <div
            style={{
              ...up(frame, 40, 26, 26),
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: C.sub,
              marginTop: 40,
            }}
          >
            {spec.appName}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
