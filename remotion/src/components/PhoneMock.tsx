import React from "react";
import { interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PHONE_H, PHONE_RATIO } from "../theme";
import { easeOutCubic } from "./Aurora";

// Shows one of the real app SVG screens inside its phone mockup.
// Proportions are preserved (SVG is vector → text stays sharp at any scale).
export const PhoneMock: React.FC<{
  file: string;
  height?: number;
  x: number;
  y: number;
  delay?: number;
}> = ({ file, height = PHONE_H, x, y, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const width = height * PHONE_RATIO;

  const enter = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 1 } });
  const slide = interpolate(frame - delay, [0, 26], [90, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });
  const opacity = interpolate(frame - delay, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        opacity,
        transform: `translateX(${slide}px) scale(${0.96 + enter * 0.04})`,
      }}
    >
      <img
        src={staticFile(`screens/${file}`)}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.55))",
        }}
      />
    </div>
  );
};
