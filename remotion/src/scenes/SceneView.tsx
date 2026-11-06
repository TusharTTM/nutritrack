import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT, SAFE } from "../theme";
import { Aurora, easeOutCubic } from "../components/Aurora";
import { PhoneMock } from "../components/PhoneMock";

type Scene = {
  id: string;
  name: string;
  phone: string | null;
  eyebrow?: string;
  headline?: string;
  subline?: string;
};

// A cross-dissolve + gentle camera push used by every phone scene.
export const SceneView: React.FC<{ scene: Scene; index: number; total: number }> = ({
  scene,
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  // Camera push (slow zoom toward the content).
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.05], {
    easing: Easing.inOut(Easing.quad),
    extrapolateRight: "clamp",
  });

  const up = (delay: number, dur = 22, dist = 34) => {
    const p = interpolate(frame, [delay, delay + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOutCubic,
    });
    return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` };
  };

  const phoneH = 1000;
  const phoneW = phoneH * (430 / 884);
  const phoneX = SAFE.x + SAFE.w - phoneW; // right edge of title-safe
  const phoneY = SAFE.y + (SAFE.h - phoneH) / 2;

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
        <Aurora />

        {/* lime accent rule */}
        <div
          style={{
            position: "absolute",
            left: 300,
            top: 372,
            width: 4,
            height: interpolate(frame, [6, 34], [0, 150], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: easeOutCubic,
            }),
            backgroundColor: C.lime,
            borderRadius: 2,
          }}
        />

        {/* left text block (kept inside central safe area) */}
        <div style={{ position: "absolute", left: 336, top: 372, width: 780 }}>
          <div
            style={{
              ...up(4),
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: C.lime,
            }}
          >
            {scene.eyebrow}
          </div>
          <div
            style={{
              ...up(12, 26, 44),
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 82,
              lineHeight: 1.04,
              letterSpacing: -2,
              color: C.paper,
              marginTop: 18,
            }}
          >
            {scene.headline}
          </div>
          <div
            style={{
              ...up(22, 24, 30),
              fontFamily: FONT,
              fontWeight: 400,
              fontSize: 30,
              lineHeight: 1.35,
              color: C.sub,
              marginTop: 26,
              width: 700,
            }}
          >
            {scene.subline}
          </div>
        </div>

        {/* glow behind phone so the dark app screen pops from the background */}
        {scene.phone && (
          <div
            style={{
              position: "absolute",
              left: phoneX - 50,
              top: phoneY,
              width: phoneW + 100,
              height: phoneH,
              background:
                "radial-gradient(closest-side, rgba(198,242,78,0.20), transparent 72%)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* the real app screen */}
        {scene.phone && (
          <PhoneMock file={scene.phone} height={phoneH} x={phoneX} y={phoneY} delay={6} />
        )}

        {/* scene progress dots */}
        <div
          style={{
            position: "absolute",
            left: SAFE.x + SAFE.w / 2,
            top: SAFE.y + SAFE.h - 24,
            transform: "translateX(-50%)",
            display: "flex",
            gap: 12,
          }}
        >
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 30 : 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: i === index ? C.lime : "rgba(242,244,236,0.25)",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
