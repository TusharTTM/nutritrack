// Builds the 1200x630 social share card (public/og-image.png) from the real
// app mockup, so links to the site preview with actual product UI instead of a
// bare URL. The rendered PNG is committed; this script only needs re-running
// when the brand or the home screen changes.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const { Resvg } = require(path.join(
  root,
  "remotion/node_modules/@resvg/resvg-js"
));

const LIME = "#C6F24E";
const PAPER = "#F2F4EC";
const SUB = "#B9C0AC";
const MUTED = "#8A9078";
const FONT =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const LEAF =
  "M12 2C9.5 6 6 8.2 6 12.7A6 6 0 0 0 18 12.7C18 9.8 16 7.9 14.2 6.1 13.7 7.7 12.6 8.6 11.4 8.9 11.9 6.7 11.7 4.3 12 2Z";

// Inline the real home screen so the card shows the actual product.
let screen = fs.readFileSync(path.join(root, "mockups/03-home.svg"), "utf8");
screen = screen
  .replace(/\bid="([^"]+)"/g, 'id="og_$1"')
  .replace(/url\(#([^)]+)\)/g, "url(#og_$1)");
screen = screen.replace(/<svg\b[^>]*>/, "").replace(/<\/svg>\s*$/, "");

const PHONE_H = 596;
const PHONE_W = Math.round((PHONE_H * 430) / 884);
const PHONE_X = 1200 - PHONE_W - 96;
const PHONE_Y = 17;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="${FONT}">
<defs>
  <radialGradient id="glowA"><stop offset="0" stop-color="${LIME}" stop-opacity="0.22"/><stop offset="1" stop-color="${LIME}" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowB"><stop offset="0" stop-color="#4FD6C6" stop-opacity="0.16"/><stop offset="1" stop-color="#4FD6C6" stop-opacity="0"/></radialGradient>
  <filter id="phShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="26" stdDeviation="40" flood-color="#000" flood-opacity="0.6"/></filter>
</defs>
<rect width="1200" height="630" fill="#0E100B"/>
<ellipse cx="180" cy="90" rx="620" ry="480" fill="url(#glowA)"/>
<ellipse cx="1150" cy="620" rx="560" ry="420" fill="url(#glowB)"/>

<g transform="translate(96,104) scale(3.4)" fill="${LIME}"><path d="${LEAF}"/></g>
<text x="96" y="268" font-size="62" font-weight="800" fill="${PAPER}" letter-spacing="-1.5">NutriTrack</text>
<text x="96" y="344" font-size="50" font-weight="800" fill="${LIME}" letter-spacing="-1.5">Eat Better.</text>
<text x="96" y="402" font-size="50" font-weight="800" fill="${PAPER}" letter-spacing="-1.5">Live Healthier.</text>
<text x="96" y="456" font-size="24" font-weight="400" fill="${SUB}">Track meals, macros, water and habits —</text>
<text x="96" y="488" font-size="24" font-weight="400" fill="${SUB}">all in one calm, beautiful place.</text>
<rect x="96" y="524" width="72" height="6" rx="3" fill="${LIME}"/>
<text x="96" y="572" font-size="20" font-weight="600" fill="${MUTED}" letter-spacing="3">NUTRITION &amp; ACTIVITY TRACKER</text>

<g filter="url(#phShadow)"><g transform="translate(${PHONE_X},${PHONE_Y}) scale(${(PHONE_H / 884).toFixed(5)})">${screen}</g></g>
</svg>`;

fs.writeFileSync(path.join(root, "scripts/og-card.svg"), svg);

const fontFiles = fs
  .readdirSync(path.join(root, "remotion/qc/fonts"))
  .filter((f) => f.endsWith(".ttf"))
  .map((f) => path.join(root, "remotion/qc/fonts", f));

const png = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
  font: { fontFiles, loadSystemFonts: true },
})
  .render()
  .asPng();

fs.writeFileSync(path.join(root, "public/og-image.png"), png);
console.log(`og-image.png  ${png.length} bytes  (1200x630)`);

// PWA icons: brand square with the app's own leaf mark, rendered at the two
// sizes a web manifest needs. Expo does not copy assets/ into dist/, so these
// live in public/ alongside the other static files.
const iconSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<defs><radialGradient id="ig"><stop offset="0" stop-color="${LIME}" stop-opacity="0.30"/><stop offset="1" stop-color="${LIME}" stop-opacity="0"/></radialGradient></defs>
<rect width="${size}" height="${size}" fill="#0E100B"/>
<ellipse cx="${size / 2}" cy="${size / 2}" rx="${size * 0.46}" ry="${size * 0.46}" fill="url(#ig)"/>
<g transform="translate(${size * 0.5 - size * 0.26},${size * 0.5 - size * 0.26}) scale(${(size * 0.52) / 24})" fill="${LIME}"><path d="${LEAF}"/></g>
</svg>`;

for (const size of [192, 512]) {
  const iconPng = new Resvg(iconSvg(size), {
    fitTo: { mode: "width", value: size },
    font: { fontFiles, loadSystemFonts: true },
  })
    .render()
    .asPng();
  fs.writeFileSync(path.join(root, `public/icon-${size}.png`), iconPng);
  console.log(`icon-${size}.png  ${iconPng.length} bytes`);
}
