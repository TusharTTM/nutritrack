// Renders one QC still per slide at 1920x1080 using resvg, from the same shared
// storyboard the video uses (src/demo/*). Handy for eyeballing a single beat
// without scrubbing the preview GIF.
import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { frameSvg } from "../src/demo/frameSvg.mjs";
import { SCREEN_FILES, SLIDES, stateAt } from "../src/demo/storyboard.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out");
fs.mkdirSync(outDir, { recursive: true });

// Inter (static weights 400-800) is vendored so the QC renders match the
// mockups' typography instead of falling back to a generic system sans.
const FONT_FILES = fs
  .readdirSync(path.join(root, "qc/fonts"))
  .filter((f) => f.endsWith(".ttf"))
  .map((f) => path.join(root, "qc/fonts", f));

const screens = {};
for (const f of SCREEN_FILES) {
  screens[f] = fs.readFileSync(path.join(root, "public/screens", f), "utf8");
}

for (const slide of SLIDES) {
  // A representative frame: mid-slide, so every beat has resolved.
  const frame = slide.start + Math.round(slide.dur / 2);
  const svg = frameSvg(stateAt(frame), screens);
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: 1920 },
    background: "#0E100B",
    font: { fontFiles: FONT_FILES, loadSystemFonts: true },
  })
    .render()
    .asPng();
  const f = path.join(outDir, `still-${slide.id}.png`);
  fs.writeFileSync(f, png);
  console.log(`still-${slide.id}.png  ${png.length} bytes`);
}
console.log("done");
