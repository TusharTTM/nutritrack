// Ink & Lime palette + layout constants shared by the video scenes.
export const FONT =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const C = {
  bg: "#0E100B",
  ink: "#0E100B",
  ink2: "#161A10",
  lime: "#C6F24E",
  limeD: "#A3E635",
  limeSoft: "rgba(198,242,78,0.14)",
  paper: "#F2F4EC",
  sub: "#B9C0AC",
  muted: "#8A9078",
  teal: "#4FD6C6",
  warn: "#F0B44E",
  water: "#5AB4F0",
};

// 16:9 title-safe (keep ALL content inside this).
export const SAFE = { x: 240, y: 120, w: 1440, h: 840 };
// Central key-content safe area (keep logos / headlines / tagline inside this)
// so the frame can be re-cropped for 1:1 and 9:16 without losing them.
export const CORE = { x: 420, y: 200, w: 1080, h: 680 };

// The SVG screens are 430x884 phone mockups.
export const PHONE_W = 430;
export const PHONE_H = 884;
export const PHONE_RATIO = PHONE_W / PHONE_H;
