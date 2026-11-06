import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT } from "../theme";
import { Aurora, easeOutCubic } from "../components/Aurora";
import { LeafMark } from "../components/Logo";
import spec from "../spec.json";

const up = (frame: number, delay: number, dur = 24, dist = 40) => {
  const p = interpolate(frame, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });
  return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` };
};

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.04, 1.0], {
    easing: Easing.inOut(Easing.quad),
    extrapolateRight: "clamp",
  });
  const mark = spring({ frame: frame - 6, fps, config: { damping: 14, mass: 0.8 } });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
        <Aurora intensity={1.15} />
        <AbsoluteFill
          style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}
        >
          <div style={{ transform: `scale(${0.7 + mark * 0.3})`, opacity: mark }}>
            <LeafMark size={150} color={C.lime} />
          </div>
          <div
            style={{
              ...up(frame, 22, 26, 30),
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 92,
              letterSpacing: -2,
              color: C.paper,
              marginTop: 28,
            }}
          >
            {spec.appName}
          </div>
          <div
            style={{
              width: interpolate(frame, [40, 76], [0, 220], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: easeOutCubic,
              }),
              height: 6,
              borderRadius: 3,
              backgroundColor: C.lime,
              marginTop: 22,
            }}
          />
          <div
            style={{
              ...up(frame, 52, 26, 26),
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 46,
              color: C.lime,
              marginTop: 34,
            }}
          >
            {spec.tagline1} {spec.tagline2}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
