import React from "react";
import { Composition } from "remotion";
import { Promo } from "./Promo";
import { DURATION, FPS, H, W } from "./demo/storyboard.mjs";

export const Root: React.FC = () => {
  return (
    <Composition
      id="NutriTrackPromo"
      component={Promo}
      durationInFrames={DURATION}
      fps={FPS}
      width={W}
      height={H}
    />
  );
};
