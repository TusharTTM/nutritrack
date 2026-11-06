import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "./theme";
import { DemoPromo } from "./DemoPromo";

export const Promo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <DemoPromo />
    </AbsoluteFill>
  );
};
