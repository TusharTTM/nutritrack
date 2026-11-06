// Renders an animated 16:9 PREVIEW (GIF) of the promo.
//
// Every sampled frame is drawn with the SAME shared storyboard + frame builder
// that the Remotion MP4 uses (src/demo/*), so the preview is a faithful proxy
// for the real render - which needs Chrome and therefore cannot run in this
// sandbox. Render the real MP4 locally with `npm run render`.
import { Resvg } from "@resvg/resvg-js";
import gifenc from "gifenc";
const { GIFEncoder, quantize, applyPalette } = gifenc;
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DURATION, FPS, SCREEN_FILES, stateAt } from "../src/demo/storyboard.mjs";
import { frameSvg } from "../src/demo/frameSvg.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out");
fs.mkdirSync(outDir, { recursive: true });

// Inter (static weights 400-800) is vendored so the preview's typography
// matches the mockups instead of falling back to a generic system sans.
const FONT_FILES = fs
  .readdirSync(path.join(root, "qc/fonts"))
  .filter((f) => f.endsWith(".ttf"))
  .map((f) => path.join(root, "qc/fonts", f));

const screens = {};
for (const f of SCREEN_FILES) {
  screens[f] = fs.readFileSync(path.join(root, "public/screens", f), "utf8");
}

const OW = 1280, OH = 720, STEP = 5, DELAY = 83; // ~12fps over the full timeline

const gif = GIFEncoder();
let n = 0;
for (let f = 0; f < DURATION; f += STEP) {
  const svg = frameSvg(stateAt(f), screens);
  const res = new Resvg(svg, {
    fitTo: { mode: "width", value: OW },
    font: { fontFiles: FONT_FILES, loadSystemFonts: true },
  });
  const { pixels, width, height } = res.render();
  const palette = quantize(pixels, 256);
  const index = applyPalette(pixels, palette);
  gif.writeFrame(index, width, height, { palette, delay: DELAY });
  n++;
  if (n % 60 === 0) console.log(`  frame ${n} (t=${(f / FPS).toFixed(1)}s)`);
}
gif.finish();
const bytes = gif.bytes();
const out = path.join(outDir, "preview.gif");
fs.writeFileSync(out, bytes);
console.log(`preview.gif  ${n} frames  ${(bytes.length / 1048576).toFixed(2)} MB`);
