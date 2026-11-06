import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import spec from "./spec.json";
import { C } from "./theme";
import { FontLoader } from "./components/FontLoader";
import { SceneView } from "./scenes/SceneView";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";

export const Promo: React.FC = () => {
  const phoneCount = spec.scenes.filter((s) => s.phone).length;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <FontLoader />
      {spec.scenes.map((scene, i) => {
        let content: React.ReactNode;
        if (scene.id === "intro") {
          content = <Intro />;
        } else if (scene.id === "outro") {
          content = <Outro />;
        } else {
          const phoneIndex = spec.scenes.slice(0, i).filter((s) => s.phone).length;
          content = <SceneView scene={scene as never} index={phoneIndex} total={phoneCount} />;
        }
        return (
          <Sequence key={scene.id} from={scene.start} durationInFrames={scene.dur}>
            {content}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
