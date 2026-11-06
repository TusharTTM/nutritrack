import React, { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";

// Loads Inter from Google Fonts and BLOCKS rendering until fonts are ready,
// so no frame is ever captured with a fallback font.
export const FontLoader: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading Inter font"));

  useEffect(() => {
    const id = "remotion-inter-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }
    let cancelled = false;
    const done = () => {
      if (!cancelled) continueRender(handle);
    };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(done).catch(done);
    } else {
      done();
    }
    return () => {
      cancelled = true;
      continueRender(handle);
    };
  }, [handle]);

  return null;
};
