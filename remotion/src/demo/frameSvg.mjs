// Draws one 1920x1080 frame of the promo as a single SVG string.
//
// Pure string building - no DOM, no fs - so the Remotion MP4 and the QC
// preview GIF are rendered from byte-identical markup. That is what makes the
// downloadable preview a faithful stand-in for the real render.

import { patchScreen } from "./patches.mjs";
import {
  DURATION,
  H,
  PHONE_H,
  PHONE_S,
  PHONE_W,
  PHONE_X,
  PHONE_Y,
  W,
} from "./storyboard.mjs";

const LIME = "#C6F24E";
const PAPER = "#F2F4EC";
const SUB = "#B9C0AC";
const MUTED = "#8A9078";
const FONT =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// The app's own leaf mark, reused as the brand symbol.
const LEAF =
  "M12 2C9.5 6 6 8.2 6 12.7A6 6 0 0 0 18 12.7C18 9.8 16 7.9 14.2 6.1 13.7 7.7 12.6 8.6 11.4 8.9 11.9 6.7 11.7 4.3 12 2Z";

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const T = (x, y, s, size, weight, fill, anchor = "start", ls = 0) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}">${esc(
    s
  )}</text>`;

const leafMark = (cx, cy, size, fill) =>
  `<g transform="translate(${cx - size / 2},${cy - size / 2}) scale(${size / 24})" fill="${fill}"><path d="${LEAF}"/></g>`;

// Pull a screen's markup into the frame's tree. resvg drops <text> for SVGs
// embedded via <image href>, so the markup has to be inlined to render at all.
const inlineScreen = (svg) => {
  let s = svg;
  const ff = /font-family:\s*([^;"]+)/.exec(s);
  const fontFamily = ff ? ff[1].trim() : FONT;
  s = s
    .replace(/\bid="([^"]+)"/g, 'id="s_$1"')
    .replace(/url\(#([^)]+)\)/g, "url(#s_$1)");
  s = s.replace(/<svg\b[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return `<g font-family="${fontFamily}">${s}</g>`;
};

const DEFS = `<defs>
  <radialGradient id="fa1"><stop offset="0" stop-color="${LIME}" stop-opacity="0.20"/><stop offset="1" stop-color="${LIME}" stop-opacity="0"/></radialGradient>
  <radialGradient id="fa2"><stop offset="0" stop-color="#4FD6C6" stop-opacity="0.16"/><stop offset="1" stop-color="#4FD6C6" stop-opacity="0"/></radialGradient>
  <radialGradient id="fglow"><stop offset="0" stop-color="${LIME}" stop-opacity="0.30"/><stop offset="1" stop-color="${LIME}" stop-opacity="0"/></radialGradient>
  <linearGradient id="fprog" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A8D62E"/><stop offset="1" stop-color="#D4F75E"/></linearGradient>
  <filter id="fds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="34" stdDeviation="46" flood-color="#000" flood-opacity="0.6"/></filter>
</defs>`;

// A pointing hand cursor whose fingertip sits at the local origin.
const HAND = (press) => `<g>
  <ellipse cx="16" cy="54" rx="12" ry="8.5" transform="rotate(22 16 54)" fill="${PAPER}" stroke="#0E100B" stroke-width="1.8"/>
  <path d="M -7 0 L 7 0 L 7 38 C 7 52, 17 58, 17 71 C 17 80, 9 84, 0 84 C -9 84, -17 80, -17 71 C -17 58, -7 52, -7 38 Z" fill="${PAPER}" stroke="#0E100B" stroke-width="1.8" stroke-linejoin="round"/>
</g>`;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const seg = (v, a, b) => clamp01((v - a) / (b - a));

// Brand bookend card: mark + wordmark + tagline.
const cardSlide = (L) => {
  const s = 0.94 + 0.06 * L.enter - 0.05 * L.exit;
  return `<g transform="translate(${W / 2},${H / 2}) scale(${s.toFixed(
    4
  )}) translate(${-W / 2},${-H / 2})" opacity="${L.opacity.toFixed(3)}">
    ${leafMark(W / 2, 372, 132, LIME)}
    ${T(W / 2, 556, "Eat Better.", 98, 800, PAPER, "middle", -3)}
    ${T(W / 2, 662, "Live Healthier.", 98, 800, LIME, "middle", -3)}
    ${T(W / 2, 748, "NUTRITRACK", 28, 700, L.slide.id === "outro" ? SUB : MUTED, "middle", 9)}
  </g>`;
};

// Demo slide: the live phone.
const demoSlide = (L, screens) => {
  const raw = screens[L.slide.screen];
  const live = raw ? patchScreen(L.slide.screen, raw, L.data) : "";
  const cx = PHONE_X + PHONE_W / 2;
  const cy = PHONE_Y + PHONE_H / 2;
  return `<g opacity="${L.opacity.toFixed(3)}">
    <ellipse cx="${cx}" cy="${cy}" rx="${PHONE_W * 1.05}" ry="${PHONE_H * 0.6}" fill="url(#fglow)"/>
    <g transform="translate(${PHONE_X},${PHONE_Y})">
      <g transform="scale(${PHONE_S})"><g filter="url(#fds)">${inlineScreen(
    live
  )}</g></g>
    </g>
  </g>`;
};

const chrome = (state) => {
  // Slide chrome belongs to the demo slides; the bookend cards stay clean.
  const a = state.active;
  if (!a || a.slide.kind !== "demo") return "";
  const f = state.frame;
  const dots = [];
  const total = state.dots.total;
  const dw = total * 30 - 16;
  let dx = W / 2 - dw / 2;
  for (let i = 0; i < total; i++) {
    const on = i === state.dots.active;
    const w = on ? 34 : 12;
    dots.push(
      `<rect x="${dx.toFixed(1)}" y="1046" width="${w}" height="10" rx="5" fill="${
        on ? LIME : "rgba(242,244,236,0.22)"
      }"/>`
    );
    dx += w + 14;
  }
  return `<g>
    ${leafMark(150, 92, 40, LIME)}
    ${T(182, 101, "NutriTrack", 27, 700, PAPER, "start", -0.4)}
    ${T(W - 120, 101, state.counter, 23, 600, MUTED, "end", 2)}
    ${dots.join("")}
    <rect x="0" y="${H - 6}" width="${(W * state.progress).toFixed(
    1
  )}" height="6" fill="url(#fprog)"/>
  </g>`;
};

const badgeLayer = (L) => {
  const b = L.badge;
  if (!b) return "";
  const op = Math.min(seg(b.p, 0, 0.14), 1 - seg(b.p, 0.5, 1)) * L.opacity;
  if (op <= 0.01) return "";
  return `<g transform="translate(${b.x.toFixed(1)},${b.y.toFixed(
    1
  )})" opacity="${op.toFixed(3)}">
    <rect x="-78" y="-24" width="156" height="48" rx="24" fill="${LIME}"/>
    ${T(0, 8, b.text, 23, 800, "#0E100B", "middle", 0)}
  </g>`;
};

const handLayer = (L) => {
  const h = L.hand;
  if (!h) return "";
  const press = 1 - 0.16 * h.press;
  return `<g opacity="${L.opacity.toFixed(3)}"><g transform="translate(${h.x.toFixed(
    1
  )},${h.y.toFixed(1)}) scale(${press.toFixed(3)})">
    ${
      h.ripple > 0
        ? `<circle cx="0" cy="0" r="${(9 + 40 * h.ripple).toFixed(
            1
          )}" fill="none" stroke="${LIME}" stroke-width="2.6" opacity="${(
            0.65 *
            (1 - h.ripple)
          ).toFixed(3)}"/>
         <circle cx="0" cy="0" r="${(4 + 9 * h.ripple).toFixed(
            1
          )}" fill="${LIME}" opacity="${(0.5 * (1 - h.ripple)).toFixed(3)}"/>`
        : ""
    }
    <ellipse cx="8" cy="86" rx="21" ry="7" fill="#000" opacity="0.35"/>
    ${HAND(h.press)}
  </g></g>`;
};

/**
 * @param {ReturnType<import("./storyboard.mjs").stateAt>} state
 * @param {Record<string,string>} screens  raw screen SVG sources, keyed by file
 * @returns {string} a complete 1920x1080 SVG document
 */
export function frameSvg(state, screens) {
  const f = state.frame;
  const body = state.layers
    .map((L) => {
      if (L.slide.kind === "card") return cardSlide(L);
      // Slides glide in from the right and out to the left, like a deck.
      const dx = (1 - L.enter) * 170 - L.exit * 170;
      return `<g transform="translate(${dx.toFixed(1)},0)">${demoSlide(
        L,
        screens
      )}</g>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">${DEFS}
<rect width="${W}" height="${H}" fill="#0E100B"/>
<ellipse cx="${(250 + 46 * Math.sin(f / 92)).toFixed(1)}" cy="${(
    140 +
    30 * Math.cos(f / 118)
  ).toFixed(1)}" rx="840" ry="640" fill="url(#fa1)"/>
<ellipse cx="${(1790 - 52 * Math.cos(f / 104)).toFixed(1)}" cy="${(
    990 +
    34 * Math.sin(f / 130)
  ).toFixed(1)}" rx="920" ry="720" fill="url(#fa2)"/>
${body}
${chrome(state)}
${state.layers.map(badgeLayer).join("")}
${state.layers.map(handLayer).join("")}
</svg>`;
}

export { DURATION };
