import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FontLoader } from "./components/FontLoader";
import { frameSvg } from "./demo/frameSvg.mjs";
import { DURATION, FPS, SCREEN_FILES, stateAt } from "./demo/storyboard.mjs";

// The whole promo is one SVG built by the shared storyboard (src/demo/*), the
// exact same code the QC preview GIF is rendered from. That guarantees the
// locally rendered MP4 and the downloadable preview are identical.
//
// The app screens are fetched as text so their markup can be patched live
// (numbers counting, bars filling, charts drawing) and inlined - browsers do
// render <text> inside an <img> SVG, but resvg does not, and inlining keeps
// both renderers on one code path.
export const DemoPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [screens, setScreens] = useState<Record<string, string> | null>(null);
  const [handle] = useState(() => delayRender("Loading app screens"));

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      SCREEN_FILES.map(async (file) => {
        const res = await fetch(staticFile(`screens/${file}`));
        return [file, await res.text()] as const;
      })
    )
      .then((entries) => {
        if (cancelled) return;
        setScreens(Object.fromEntries(entries));
      })
      .catch((err) => {
        console.error("Failed to load app screens", err);
      })
      .finally(() => {
        if (!cancelled) continueRender(handle);
      });
    return () => {
      cancelled = true;
      continueRender(handle);
    };
  }, [handle]);

  const state = stateAt(frame);
  // Let CSS size the SVG so it scales to the composition box exactly.
  const svg = screens
    ? frameSvg(state, screens).replace(
        /^(<svg[^>]*?)\s+width="\d+"\s+height="\d+"/,
        "$1"
      )
    : "";

  return (
    <AbsoluteFill style={{ backgroundColor: "#0E100B" }}>
      <FontLoader />
      <div
        style={{ position: "absolute", inset: 0, width, height }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </AbsoluteFill>
  );
};

export { DURATION, FPS };
