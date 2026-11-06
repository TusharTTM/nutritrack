// Renders an animated 16:9 PREVIEW (GIF) of the promo by drawing each sampled
// frame as an SVG (mirroring the Remotion scenes' motion) via resvg, then
// encoding with gifenc. This is a faithful proxy since Remotion's own renderer
// needs Chrome (unavailable in this sandbox). Render the real MP4 locally with
// `npm run render`.
import { Resvg } from "@resvg/resvg-js";
import gifenc from "gifenc";
const { GIFEncoder, quantize, applyPalette } = gifenc;
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const spec = JSON.parse(fs.readFileSync(path.join(root, "src/spec.json"), "utf8"));
const outDir = path.join(root, "out");
fs.mkdirSync(outDir, { recursive: true });

const LIME = "#C6F24E", PAPER = "#F2F4EC", SUB = "#B9C0AC";
const SAFE = { x: 240, y: 120, w: 1440, h: 840 };
const PHONE_H = 840, PHONE_W = Math.round(840 * (430 / 884));
const phoneX = SAFE.x + SAFE.w - PHONE_W, phoneY = SAFE.y;

// output preview geometry (16:9)
const OW = 854, OH = 480, STEP = 5, DELAY = 83; // ~12fps over 1800 frames

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const seg = (v, a, b) => clamp((v - a) / (b - a), 0, 1);
const lerp = (t, a, b) => a + (b - a) * t;
const eoc = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
const up = (local, d, dur, dist) => { const p = eoc(seg(local, d, d + dur)); return { p, ty: (1 - p) * dist }; };

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const wrap = (t, n) => { const w = t.split(" "); const L = []; let c = ""; for (const x of w) { const cc = c ? c + " " + x : x; if (cc.length > n && c) { L.push(c); c = x; } else c = cc; } if (c) L.push(c); return L; };
const T = (x, y, s, size, weight, fill, anchor = "start", ls = 0, ty = 0, op = 1) =>
  `<text x="${x}" y="${y + ty}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${op.toFixed(3)}">${esc(s)}</text>`;

const leaf = (cx, cy, size, color, op = 1) => {
  const s = size / 24;
  return `<g transform="translate(${cx - size / 2},${cy - size / 2}) scale(${s})" opacity="${op}">
    <path d="M5 19C5 9.5 10.8 5 20 5c0 8.8-4.8 13.8-13.6 13.8-.5 0-1 0-1.4-.1Z" fill="${color}"/>
    <path d="M5.2 18.8C7.2 14.6 10.4 11.9 14.6 10.4" stroke="#0E100B" stroke-width="1.6" stroke-linecap="round"/></g>`;
};

const defs = `<defs>
  <radialGradient id="g1"><stop offset="0" stop-color="${LIME}" stop-opacity="0.16"/><stop offset="1" stop-color="${LIME}" stop-opacity="0"/></radialGradient>
  <radialGradient id="g2"><stop offset="0" stop-color="#4FD6C6" stop-opacity="0.14"/><stop offset="1" stop-color="#4FD6C6" stop-opacity="0"/></radialGradient>
  <filter id="ds" x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx="0" dy="24" stdDeviation="30" flood-color="#000" flood-opacity="0.55"/></filter>
</defs>`;

const aurora = (local) => {
  const t = local / 60;
  return `<rect width="1920" height="1080" fill="#0E100B"/>
    <ellipse cx="${230 + Math.sin(t) * 30}" cy="${90 + Math.cos(t) * 20}" rx="900" ry="700" fill="url(#g1)"/>
    <ellipse cx="${1770 + Math.cos(t) * 30}" cy="${1040 + Math.sin(t) * 20}" rx="1000" ry="820" fill="url(#g2)"/>`;
};

function content(scene, index, total, local) {
  let b = aurora(local);
  if (scene.id === "intro") {
    const mp = eoc(seg(local, 6, 26)); const sc = 0.7 + mp * 0.3;
    b += leaf(960, 330, 150, LIME, mp, sc);
    const wm = up(local, 22, 26, 30); b += T(960, 560, spec.appName, 92, 800, PAPER, "middle", -2, wm.ty, wm.p);
    b += `<rect x="850" y="592" width="${lerp(seg(local, 40, 76), 0, 220)}" height="6" rx="3" fill="${LIME}"/>`;
    const tg = up(local, 52, 26, 26); b += T(960, 690, `${spec.tagline1} ${spec.tagline2}`, 46, 700, LIME, "middle", 0, tg.ty, tg.p);
  } else if (scene.id === "outro") {
    const lf = up(local, 4, 24, 26); b += leaf(960, 300, 120, LIME, lf.p);
    const t1 = up(local, 14, 28, 40); b += T(960, 480, scene ? spec.tagline1 : "", 104, 800, PAPER, "middle", -3, t1.ty, t1.p);
    b += T(960, 600, spec.tagline2, 104, 800, LIME, "middle", -3, t1.ty, t1.p);
    const nm = up(local, 40, 26, 26); b += T(960, 700, spec.appName.toUpperCase(), 34, 700, SUB, "middle", 6, nm.ty, nm.p);
  } else {
    b += `<rect x="300" y="372" width="4" height="${lerp(seg(local, 6, 34), 0, 150)}" rx="2" fill="${LIME}"/>`;
    const eb = up(local, 4, 22, 34); b += T(336, 402, scene.eyebrow.toUpperCase(), 24, 700, LIME, "start", 4, eb.ty, eb.p);
    const hl = up(local, 12, 26, 44); let y = 480;
    for (const ln of wrap(scene.headline, 15)) { b += T(336, y, ln, 82, 800, PAPER, "start", -2, hl.ty, hl.p); y += 86; }
    const sl = up(local, 22, 24, 30); y += 26;
    for (const ln of wrap(scene.subline, 38)) { b += T(336, y, ln, 30, 400, SUB, "start", 0, sl.ty, sl.p); y += 41; }
    // phone (slide + pop + fade)
    const sp = eoc(seg(local - 6, 0, 26)); const slide = 90 * (1 - sp);
    const scale = 0.96 + 0.04 * eoc(seg(local - 6, 0, 30)); const pop = seg(local - 6, 0, 16);
    b += `<g opacity="${pop.toFixed(3)}" transform="translate(${phoneX + slide},${phoneY})">
      <g transform="translate(${PHONE_W / 2},${PHONE_H / 2}) scale(${scale.toFixed(3)}) translate(${-PHONE_W / 2},${-PHONE_H / 2})">
        <image href="public/screens/${scene.phone}" x="0" y="0" width="${PHONE_W}" height="${PHONE_H}" filter="url(#ds)"/></g></g>`;
    // dots
    const dw = total * 22 - 12; let dx = 960 - dw / 2; const dy = SAFE.y + SAFE.h - 24;
    for (let i = 0; i < total; i++) { const on = i === index; const ww = on ? 30 : 10; b += `<rect x="${dx}" y="${dy - 5}" width="${ww}" height="10" rx="5" fill="${on ? LIME : "rgba(242,244,236,0.25)"}"/>`; dx += ww + 12; }
  }
  return b;
}

function frameSVG(frame) {
  let cur = spec.scenes[0];
  for (const s of spec.scenes) if (frame >= s.start) cur = s;
  const local = frame - cur.start;
  const fade = Math.min(seg(local, 0, 14), 1 - seg(local, cur.dur - 14, cur.dur));
  let zoom = cur.id === "intro" ? lerp(seg(local, 0, cur.dur), 1.04, 1.0)
    : cur.id === "outro" ? lerp(seg(local, 0, cur.dur), 1.07, 1.0)
    : lerp(seg(local, 0, cur.dur), 1.0, 1.05);
  const index = cur.phone ? spec.scenes.slice(0, spec.scenes.indexOf(cur)).filter((s) => s.phone).length : 0;
  const total = spec.scenes.filter((s) => s.phone).length;
  const inner = content(cur, index, total, local);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${OW}" height="${OH}" viewBox="0 0 1920 1080" font-family="Inter, Helvetica, Arial, sans-serif">${defs}
    <g opacity="${fade.toFixed(3)}"><g transform="translate(960 540) scale(${zoom.toFixed(4)}) translate(-960 -540)">${inner}</g></g></svg>`;
}

const gif = GIFEncoder();
let n = 0;
for (let f = 0; f < spec.durationInFrames; f += STEP) {
  const svg = frameSVG(f);
  const res = new Resvg(svg, { fitTo: { mode: "width", value: OW } });
  const img = res.render();
  const { pixels, width, height } = img;
  const palette = quantize(pixels, 128);
  const index = applyPalette(pixels, palette);
  gif.writeFrame(index, width, height, { palette, delay: DELAY });
  n++;
  if (n % 60 === 0) console.log(`  frame ${n} (t=${(f / spec.fps).toFixed(1)}s)`);
}
gif.finish();
const bytes = gif.bytes();
const out = path.join(outDir, "preview.gif");
fs.writeFileSync(out, bytes);
console.log(`preview.gif  ${n} frames  ${(bytes.length / 1048576).toFixed(2)} MB`);
