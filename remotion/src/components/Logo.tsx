import React from "react";
import { C, FONT } from "../theme";

// NutriTrack leaf mark + wordmark (brand only — no invented UI).
export const LeafMark: React.FC<{ size?: number; color?: string }> = ({
  size = 120,
  color = C.lime,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M5 19C5 9.5 10.8 5 20 5c0 8.8-4.8 13.8-13.6 13.8-.5 0-1 0-1.4-.1Z"
      fill={color}
    />
    <path
      d="M5.2 18.8C7.2 14.6 10.4 11.9 14.6 10.4"
      stroke={C.ink}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

export const Wordmark: React.FC<{ size?: number; color?: string }> = ({
  size = 64,
  color = C.paper,
}) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: -1,
      color,
      lineHeight: 1,
    }}
  >
    NutriTrack
  </div>
);
