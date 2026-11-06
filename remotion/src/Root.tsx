import React from "react";
import { Composition } from "remotion";
import { Promo } from "./Promo";
import spec from "./spec.json";

export const Root: React.FC = () => {
  return (
    <Composition
      id="NutriTrackPromo"
      component={Promo}
      durationInFrames={spec.durationInFrames}
      fps={spec.fps}
      width={spec.width}
      height={spec.height}
    />
  );
};
