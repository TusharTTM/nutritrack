import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { C } from "../theme";

// Soft drifting Ink & Lime aurora blobs behind every scene.
export const Aurora: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 300], [0, 1], { extrapolateRight: "extend" });
  const dx1 = Math.sin(t * Math.PI * 2) * 40;
  const dy1 = Math.cos(t * Math.PI * 2) * 24;
  const dx2 = Math.cos(t * Math.PI * 2 + 1) * 50;
  const dy2 = Math.sin(t * Math.PI * 2 + 1) * 30;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 700px at ${12 + dx1 * 0.05}% ${8 + dy1 * 0.04}%, rgba(198,242,78,${0.16 * intensity}), transparent 60%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(1000px 800px at ${92 + dx2 * 0.04}% ${96 + dy2 * 0.03}%, rgba(79,214,198,${0.14 * intensity}), transparent 62%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(1200px 900px at 50% 120%, rgba(198,242,78,0.05), transparent 60%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const easeOutCubic = Easing.out(Easing.cubic);
