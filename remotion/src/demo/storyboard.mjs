// Timeline + interaction storyboard for the NutriTrack promo.
//
// Pure math only - no DOM, no fs - so the SAME module drives both renderers:
//   * the Remotion MP4 (browser)
//   * the QC preview GIF (resvg, no browser available)
// Keeping one source of truth means the preview is pixel-faithful to the MP4.

export const FPS = 60;
export const W = 1920;
export const H = 1080;

// Screen SVGs the video needs, in storyboard order.
export const SCREEN_FILES = [
  "03-home.svg",
  "05-nutrition.svg",
  "06-progress.svg",
  "07-activity.svg",
];

// The phone mockups are 430x884 SVGs; the video shows them large and centred.
export const PHONE_H = 980;
export const PHONE_W = Math.round((PHONE_H * 430) / 884);
export const PHONE_X = (W - PHONE_W) / 2;
export const PHONE_Y = (H - PHONE_H) / 2;
export const PHONE_S = PHONE_H / 884;

// Map a point inside the phone screen to composition coordinates.
export const toComp = (sx, sy) => [PHONE_X + sx * PHONE_S, PHONE_Y + sy * PHONE_S];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const seg = (v, a, b) => clamp((v - a) / (b - a), 0, 1);
const lerp = (t, a, b) => a + (b - a) * t;
const eoc = (t) => 1 - Math.pow(1 - t, 3);
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const fmt = (n) => Math.round(n).toLocaleString("en-US");

// ---------------------------------------------------------------------------
// Per-slide "live data". Every value is derived from the frame so the numbers
// count, bars fill and charts draw while the viewer watches.
// ---------------------------------------------------------------------------

// Slide 1 - Dashboard: the user logs a meal, the ring and macros react.
const homeData = (local) => {
  const TAP = 58;
  const p = eoc(seg(local, TAP, TAP + 46));
  const eaten = lerp(p, 1486, 1742);
  return {
    ringF: clamp(eaten / 2200, 0, 1),
    eaten: fmt(eaten),
    left: String(Math.round(lerp(p, 714, 458))),
    protein: Math.round(lerp(p, 96, 118)),
    carbs: Math.round(lerp(p, 180, 214)),
    fat: Math.round(lerp(p, 52, 61)),
    fiber: Math.round(lerp(p, 24, 29)),
    badge: p > 0.02 && p < 0.995 ? `+${fmt(256 * p)} kcal` : null,
    badgeP: seg(local, TAP + 6, TAP + 54),
  };
};

// Slide 2 - Nutrition: switch Today -> This Week, then add a food.
const nutritionData = (local) => {
  const TAP1 = 58;
  const TAP2 = 148;
  const w = eoc(seg(local, TAP1, TAP1 + 44));
  const a = eoc(seg(local, TAP2, TAP2 + 40));
  return {
    kcal: fmt(lerp(w, 1486, 9840) + 165 * a),
    of: fmt(lerp(w, 2200, 15400)),
    protein: fmt(lerp(w, 96, 712) + 31 * a),
    carbs: fmt(lerp(w, 180, 1340)),
    fat: fmt(lerp(w, 52, 388) + 4 * a),
    week: local > TAP1 + 8,
    badge: a > 0.02 && a < 0.995 ? `+165 kcal` : null,
    badgeP: seg(local, TAP2 + 6, TAP2 + 54),
  };
};

// Slide 3 - Progress: the chart draws itself in, then a weigh-in lands.
const progressData = (local) => {
  const TAP = 112;
  const p = eoc(seg(local, TAP, TAP + 46));
  const mag = lerp(eoc(seg(local, 18, 76)), 0.1, 4.2) + 0.4 * p;
  return {
    lost: `-${mag.toFixed(1)}`,
    streak: String(Math.round(lerp(eoc(seg(local, 24, 80)), 0, 12) + p)),
    kg: (79 - 0.4 * p).toFixed(1),
    waterF: clamp(seg(local, 34, 92), 0, 1),
    water: lerp(seg(local, 34, 92), 0, 1.5).toFixed(1),
    chartDraw: eoc(seg(local, 14, 78)),
    areaFade: seg(local, 20, 84),
    badge: p > 0.02 && p < 0.995 ? "-0.4 kg" : null,
    badgeP: seg(local, TAP + 6, TAP + 54),
  };
};

// Slide 4 - Activity: pick a workout, log it, the burn total climbs.
const activityData = (local) => {
  const TAP1 = 72;
  const TAP2 = 162;
  const c = eoc(seg(local, 12, 62));
  const a = eoc(seg(local, TAP2, TAP2 + 40));
  return {
    kcal: fmt(lerp(c, 0, 412) + 210 * a),
    chip: local > TAP1 + 6,
    badge: a > 0.02 && a < 0.995 ? "+210 kcal" : null,
    badgeP: seg(local, TAP2 + 6, TAP2 + 54),
  };
};

// ---------------------------------------------------------------------------
// Hand-cursor choreography. `at` is a point in phone-screen coordinates so the
// cursor lands exactly on the button being pressed.
// ---------------------------------------------------------------------------

const HAND = {
  home: [
    { t: 6, at: [520, 1010] },
    { t: 46, at: [138, 370] }, // "Log a meal"
    { t: 56, at: [138, 370], tap: 58 },
    { t: 104, at: [138, 370] },
    { t: 146, at: [117, 818] }, // Nutrition tab
    { t: 156, at: [117, 818], tap: 158 },
    { t: 186, at: [117, 818] },
    { t: 230, at: [-70, 1000] },
  ],
  nutrition: [
    { t: 8, at: [520, 1010] },
    { t: 48, at: [280.5, 144] }, // "This Week"
    { t: 56, at: [280.5, 144], tap: 58 },
    { t: 96, at: [280.5, 144] },
    { t: 136, at: [344, 448] }, // "+" on Chicken breast
    { t: 146, at: [344, 448], tap: 148 },
    { t: 176, at: [344, 448] },
    { t: 214, at: [195, 818] }, // Progress tab
    { t: 224, at: [195, 818], tap: 226 },
    { t: 240, at: [195, 818] },
  ],
  progress: [
    { t: 8, at: [-70, 1010] },
    { t: 100, at: [195, 627] }, // "Log Weight"
    { t: 110, at: [195, 627], tap: 112 },
    { t: 150, at: [195, 627] },
    { t: 190, at: [273, 818] }, // Activity tab
    { t: 200, at: [273, 818], tap: 202 },
    { t: 240, at: [273, 818] },
  ],
  activity: [
    { t: 8, at: [520, 1010] },
    { t: 60, at: [71.7, 482] }, // "Running" chip
    { t: 70, at: [71.7, 482], tap: 72 },
    { t: 110, at: [71.7, 482] },
    { t: 150, at: [195, 673] }, // "Log Activity"
    { t: 160, at: [195, 673], tap: 162 },
    { t: 240, at: [195, 673] },
  ],
};

const TRANS = 22;

// Slides overlap by TRANS frames so they cross-dissolve instead of dipping to
// black between them - the deck feel of a normal slide show.
export const SLIDES = [
  { id: "brand", kind: "card", start: 0, dur: 105, inDur: TRANS, outDur: TRANS },
  {
    id: "home",
    kind: "demo",
    screen: "03-home.svg",
    start: 84,
    dur: 246,
    inDur: TRANS,
    outDur: TRANS,
    data: homeData,
  },
  {
    id: "nutrition",
    kind: "demo",
    screen: "05-nutrition.svg",
    start: 309,
    dur: 246,
    inDur: TRANS,
    outDur: TRANS,
    data: nutritionData,
  },
  {
    id: "progress",
    kind: "demo",
    screen: "06-progress.svg",
    start: 534,
    dur: 246,
    inDur: TRANS,
    outDur: TRANS,
    data: progressData,
  },
  {
    id: "activity",
    kind: "demo",
    screen: "07-activity.svg",
    start: 759,
    dur: 246,
    inDur: TRANS,
    outDur: TRANS,
    data: activityData,
  },
  { id: "outro", kind: "card", start: 984, dur: 246, inDur: TRANS, outDur: 0 },
];

export const DURATION = 1230;
const DEMO_TOTAL = SLIDES.filter((s) => s.kind === "demo").length;

// Where a slide's floating "+value" badge sits, in phone-screen coordinates.
const BADGE_SPOT = {
  home: [138, 330],
  nutrition: [280, 112],
  activity: [195, 612],
};

// Resolve the hand cursor state for a frame.
function handState(wp, local) {
  if (!wp || wp.length === 0) return null;
  let i = 0;
  while (i < wp.length - 2 && local > wp[i + 1].t) i++;
  const a = wp[i];
  const b = wp[Math.min(i + 1, wp.length - 1)];
  const t = b.t === a.t ? 1 : eio(seg(local, a.t, b.t));
  const [ax, ay] = toComp(a.at[0], a.at[1]);
  const [bx, by] = toComp(b.at[0], b.at[1]);

  let press = 0;
  let ripple = 0;
  let rx = bx;
  let ry = by;
  for (const w of wp) {
    if (w.tap == null) continue;
    const d = local - w.tap;
    if (d < -3 || d > 28) continue;
    press = Math.max(press, clamp(1 - Math.abs(d - 5) / 9, 0, 1));
    if (d >= 0) ripple = Math.max(ripple, 1 - seg(d, 0, 28));
    const [tx, ty] = toComp(w.at[0], w.at[1]);
    rx = tx;
    ry = ty;
  }
  return { x: lerp(t, ax, bx), y: lerp(t, ay, by), press, ripple, rx, ry };
}

/**
 * Everything a renderer needs to draw frame `frame`.
 * `layers` holds every slide currently on screen (two while cross-dissolving),
 * oldest first; `active` is the newest and owns the slide chrome.
 */
export function stateAt(frame) {
  const layers = [];
  for (let i = 0; i < SLIDES.length; i++) {
    const slide = SLIDES[i];
    const local = frame - slide.start;
    if (local < 0 || local >= slide.dur) continue;
    const enter = eoc(seg(local, 0, slide.inDur));
    const exit = slide.outDur > 0 ? eoc(seg(local, slide.dur - slide.outDur, slide.dur)) : 0;
    const opacity = enter * (1 - exit);
    if (opacity < 0.002) continue;

    const data = slide.data ? slide.data(local) : null;
    const hand = slide.kind === "demo" ? handState(HAND[slide.id], local) : null;

    let badge = null;
    const spot = BADGE_SPOT[slide.id];
    if (data && data.badge && spot) {
      const [bx, by] = toComp(spot[0], spot[1]);
      badge = { x: bx, y: by - 54 * data.badgeP, text: data.badge, p: data.badgeP };
    }

    layers.push({ slide, index: i, local, enter, exit, opacity, data, hand, badge });
  }

  const active = layers.length ? layers[layers.length - 1] : null;
  const demoIndex = active && active.slide.kind === "demo"
    ? SLIDES.slice(0, active.index).filter((s) => s.kind === "demo").length
    : 0;

  return {
    frame,
    layers,
    active,
    dots: { total: DEMO_TOTAL, active: demoIndex },
    counter: `${String(demoIndex + 1).padStart(2, "0")} / ${String(DEMO_TOTAL).padStart(2, "0")}`,
    progress: frame / (DURATION - 1),
  };
}
