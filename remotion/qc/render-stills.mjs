// Renders one QC still per scene at 1920x1080 using resvg, mirroring the
// Remotion scene layouts (settled positions). Conservative word-wrap (wider
// than Inter) so if it fits here it fits in the browser render.
import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const spec = JSON.parse(fs.readFileSync(path.join(root, "src/spec.json"), "utf8"));
const outDir = path.join(root, "out");
fs.mkdirSync(outDir, { recursive: true });

const LIME = "#C6F24E", PAPER = "#F2F4EC", SUB = "#B9C0AC", MUTED = "#8A9078";
const SAFE = { x: 240, y: 120, w: 1440, h: 840 };
const PHONE_H = 840, PHONE_W = Math.round(840 * (430 / 884));
const phoneX = SAFE.x + SAFE.w - PHONE_W, phoneY = SAFE.y;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const wrap = (t, n) => {
  const words = t.split(" "); const lines = []; let cur = "";
  for (const w of words) { const c = cur ? cur + " " + w : w; if (c.length > n && cur) { lines.push(cur); cur = w; } else cur = c; }
  if (cur) lines.push(cur); return lines;
};
const T = (x, y, s, size, weight, fill, anchor = "start", ls = 0) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}">${esc(s)}</text>`;

const aurora = `
  <defs>
    <radialGradient id="g1"><stop offset="0" stop-color="${LIME}" stop-opacity="0.16"/><stop offset="1" stop-color="${LIME}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2"><stop offset="0" stop-color="#4FD6C6" stop-opacity="0.14"/><stop offset="1" stop-color="#4FD6C6" stop-opacity="0"/></radialGradient>
    <filter id="ds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="30" stdDeviation="40" flood-color="#000" flood-opacity="0.55"/></filter>
  </defs>
  <rect width="1920" height="1080" fill="#0E100B"/>
  <ellipse cx="230" cy="90" rx="900" ry="700" fill="url(#g1)"/>
  <ellipse cx="1770" cy="1040" rx="1000" ry="820" fill="url(#g2)"/>`;

const leaf = (cx, cy, size, color) => {
  const s = size / 24;
  return `<g transform="translate(${cx - size / 2},${cy - size / 2}) scale(${s})">
    <path d="M5 19C5 9.5 10.8 5 20 5c0 8.8-4.8 13.8-13.6 13.8-.5 0-1 0-1.4-.1Z" fill="${color}"/>
    <path d="M5.2 18.8C7.2 14.6 10.4 11.9 14.6 10.4" stroke="#0E100B" stroke-width="1.6" stroke-linecap="round"/></g>`;
};

const dots = (active, total) => {
  const cx = 960, y = SAFE.y + SAFE.h - 24; let w = total * 22 - 12; let x = cx - w / 2; let s = "";
  for (let i = 0; i < total; i++) { const on = i === active; const ww = on ? 30 : 10; s += `<rect x="${x}" y="${y - 5}" width="${ww}" height="10" rx="5" fill="${on ? LIME : "rgba(242,244,236,0.25)"}"/>`; x += ww + 12; }
  return s;
};

function sceneSVG(scene, index, phoneCount) {
  let body = aurora;
  if (scene.id === "intro") {
    body += leaf(960, 330, 150, LIME);
    body += T(960, 560, spec.appName, 92, 800, PAPER, "middle", -2);
    body += `<rect x="850" y="592" width="220" height="6" rx="3" fill="${LIME}"/>`;
    body += T(960, 690, `${spec.tagline1} ${spec.tagline2}`, 46, 700, LIME, "middle");
  } else if (scene.id === "outro") {
    body += leaf(960, 300, 120, LIME);
    body += T(960, 480, spec.tagline1, 104, 800, PAPER, "middle", -3);
    body += T(960, 600, spec.tagline2, 104, 800, LIME, "middle", -3);
    body += T(960, 700, spec.appName.toUpperCase(), 34, 700, SUB, "middle", 6);
  } else {
    // accent rule
    body += `<rect x="300" y="372" width="4" height="150" rx="2" fill="${LIME}"/>`;
    let y = 402;
    body += T(336, y, scene.eyebrow.toUpperCase(), 24, 700, LIME, "start", 4); y += 86;
    for (const ln of wrap(scene.headline, 15)) { body += T(336, y, ln, 82, 800, PAPER, "start", -2); y += 86; }
    y += 26;
    for (const ln of wrap(scene.subline, 38)) { body += T(336, y, ln, 30, 400, SUB); y += 41; }
    // phone
    body += `<image href="public/screens/${scene.phone}" x="${phoneX}" y="${phoneY}" width="${PHONE_W}" height="${PHONE_H}" filter="url(#ds)"/>`;
    body += dots(index, phoneCount);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1920" height="1080" viewBox="0 0 1920 1080" font-family="Inter, Helvetica, Arial, sans-serif">${body}</svg>`;
}

const phoneScenes = spec.scenes.filter((s) => s.phone);
for (const scene of spec.scenes) {
  const index = scene.phone ? spec.scenes.slice(0, spec.scenes.indexOf(scene)).filter((s) => s.phone).length : 0;
  const svg = sceneSVG(scene, index, phoneScenes.length);
  const r = new Resvg(svg, { fitTo: { mode: "width", value: 1920 }, background: "#0E100B" });
  const png = r.render().asPng();
  const f = path.join(outDir, `still-${scene.id}.png`);
  fs.writeFileSync(f, png);
  console.log(`still-${scene.id}.png  ${png.length} bytes`);
}
console.log("done");
