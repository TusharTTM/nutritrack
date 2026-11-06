// Turns the static app screens into live ones.
//
// Each screen is a real mockup SVG; these functions rewrite only the values
// that change while the user interacts (numbers, bar widths, arcs, toggles),
// so the video shows genuine app data responding to genuine taps.
//
// Pure string transforms - no DOM, no fs - shared by both renderers.

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Replace a whole element tag identified by its leading attributes.
const retag = (svg, head, tag) =>
  svg.replace(new RegExp(`<${escapeRe(head)}[^>]*?/>`), tag);

// Swap the fill of the <text> whose content is exactly `text`.
const setTextFill = (svg, text, fill) =>
  svg.replace(
    new RegExp(`(<text[^>]*?)fill="[^"]*"([^>]*>)${escapeRe(text)}<`),
    `$1fill="${fill}"$2${text}<`
  );

// Swap the fill of a <rect> identified by x/y.
const setRectFill = (svg, x, y, fill, stroke) =>
  svg.replace(
    new RegExp(`(<rect x="${escapeRe(x)}" y="${escapeRe(y)}"[^>]*?)fill="[^"]*"([^>]*?)stroke="[^"]*"`),
    `$1fill="${fill}"$2stroke="${stroke}"`
  );

// Scale a progress bar: rewrite `width="<old>"` to a new value.
const setBar = (svg, oldW, frac, track) =>
  svg.replace(
    new RegExp(`width="${escapeRe(oldW)}[\\d.]*"`),
    `width="${(frac * track).toFixed(2)}"`
  );

// Arc for the calorie ring: centre (88,556), r 44, starting at 12 o'clock.
const ringArc = (f) => {
  const th = Math.max(0.0001, Math.min(0.9999, f)) * Math.PI * 2;
  const ex = 88 + 44 * Math.sin(th);
  const ey = 556 - 44 * Math.cos(th);
  return `M 88 512.0 A 44 44 0 ${f > 0.5 ? 1 : 0} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
};

const HOME = {
  ring: (svg, d) =>
    svg.replace(
      /d="M 88 512\.0 A 44 44 0 1 1 [\d.]+ [\d.]+"/,
      `d="${ringArc(d.ringF)}"`
    ),
  eaten: (svg, d) => svg.split(">1,486<").join(`>${d.eaten}<`),
  left: (svg, d) => svg.split(">714<").join(`>${d.left}<`),
  protein: (svg, d) => setBar(svg, "88.96", d.protein / 150, 139),
  carbs: (svg, d) => setBar(svg, "100.08", d.carbs / 250, 139),
  fat: (svg, d) => setBar(svg, "103.25", d.fat / 70, 139),
  fiber: (svg, d) => setBar(svg, "111.2", d.fiber / 30, 139),
};

const NUTRITION = {
  kcal: (svg, d) => svg.split(">1,486<").join(`>${d.kcal}<`),
  of: (svg, d) => svg.split(">of 2200 kcal<").join(`>of ${d.of} kcal<`),
  protein: (svg, d) => svg.split(">96g<").join(`>${d.protein}g<`),
  carbs: (svg, d) => svg.split(">180g<").join(`>${d.carbs}g<`),
  fat: (svg, d) => svg.split(">52g<").join(`>${d.fat}g<`),
  bars: (svg, d) => {
    const wk = d.week ? 7 : 1;
    let s = setBar(svg, "35.84", Number(d.protein) / (150 * wk), 56);
    s = setBar(s, "40.32", Number(d.carbs) / (250 * wk), 56);
    s = setBar(s, "41.6", Number(d.fat) / (70 * wk), 56);
    return s;
  },
  // The Today / This Week segmented control swaps its active styling.
  toggle: (svg, d) => {
    const on = 'fill="rgba(198,242,78,0.14)" opacity="1" stroke="#C6F24E" stroke-width="1"';
    const off =
      'fill="rgba(220,235,180,0.04)" opacity="1" stroke="rgba(200,225,140,0.16)" stroke-width="1"';
    let s = svg;
    if (d.week) {
      s = retag(
        s,
        'rect x="20.0" y="124"',
        `<rect x="20.0" y="124" width="171.0" height="40" rx="12" ${off}/>`
      );
      s = retag(
        s,
        'rect x="195.0" y="124"',
        `<rect x="195.0" y="124" width="171.0" height="40" rx="12" ${on}/>`
      );
      s = setTextFill(s, "Today", "#C3C8B6");
      s = setTextFill(s, "This Week", "#C6F24E");
    }
    return s;
  },
};

const PROGRESS = {
  lost: (svg, d) => svg.split(">-4.2<").join(`>${d.lost}<`),
  streak: (svg, d) => svg.split(">12<").join(`>${d.streak}<`),
  kg: (svg, d) => svg.split(">79<").join(`>${d.kg}<`),
  water: (svg, d) => {
    let s = svg.split(">1.5 / 2.5 L<").join(`>${d.water} / 2.5 L<`);
    return setBar(s, "186.0", d.waterF, 310);
  },
  // The weight-history line draws itself in via stroke-dashoffset.
  chart: (svg, d) => {
    const off = (340 * (1 - d.chartDraw)).toFixed(1);
    let s = svg.replace(
      /(stroke-linejoin="round" stroke="#C6F24E" stroke-width="3")\/>/,
      `$1 stroke-dasharray="340" stroke-dashoffset="${off}"/>`
    );
    s = s.replace(
      /(<path d="M40\.0 412\.5[\s\S]*?Z" fill="url\(#aur1\)")\/>/,
      `$1 opacity="${d.areaFade.toFixed(3)}"/>`
    );
    return s;
  },
};

const ACTIVITY = {
  kcal: (svg, d) => svg.split(">412<").join(`>${d.kcal}<`),
  chip: (svg, d) => {
    if (!d.chip) return svg;
    let s = setRectFill(
      svg,
      "20.0",
      "440",
      "rgba(198,242,78,0.16)",
      "#C6F24E"
    );
    return setTextFill(s, "Running", "#C6F24E");
  },
};

const PATCHES = {
  "03-home.svg": HOME,
  "05-nutrition.svg": NUTRITION,
  "06-progress.svg": PROGRESS,
  "07-activity.svg": ACTIVITY,
};

// Apply a slide's live-data patch to a screen SVG.
export function patchScreen(file, svg, data) {
  const set = PATCHES[file];
  if (!set || !data) return svg;
  let out = svg;
  for (const fn of Object.values(set)) out = fn(out, data);
  return out;
}
