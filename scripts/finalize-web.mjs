// Post-export step for the web build.
//
// Expo's static export writes index.html and 404.html from app.json, which only
// carries a title, description, theme-color and favicon. A finished website
// also needs the tags that make shared links preview properly and that let the
// browser install it. This step injects them into the exported HTML.
//
// Runs after `expo export` (see the build:web script and the Pages workflow)
// and is idempotent, so re-running the build never duplicates tags.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

// Public origin of the deployed site (origin + the app's baseUrl). Override
// with SITE_URL when serving from a custom domain.
const SITE_URL = (process.env.SITE_URL || "https://tusharttm.github.io/nutritrack").replace(/\/$/, "");
const BASE = "/nutritrack"; // must match app.json -> experiments.baseUrl

const TITLE = "NutriTrack — Eat Better. Live Healthier.";
const DESCRIPTION =
  "Track meals, macros, water and habits — all in one calm, beautiful place.";
const IMAGE = `${SITE_URL}/og-image.png`;

const START = "<!-- nutritrack:social -->";
const END = "<!-- /nutritrack:social -->";

// Browser surfaces the app never draws itself. A React Native web build leaves
// text selection, the caret, the scrollbar, focus rings and font smoothing at
// their UA defaults, which belong to no design system — and are the cheapest
// signal that a page was assembled rather than built. Expo's static export has
// no stylesheet of its own to put these in, so they ship with the head tags.
const INK = "#0E100B";
const PAPER = "#F5F5F0";
const LIME = "#C6F24E";
const DEEP_LIME = "#A3E635";

const CSS_START = "<!-- nutritrack:browser-css -->";
const CSS_END = "<!-- /nutritrack:browser-css -->";

const BROWSER_CSS = `${CSS_START}
    <style id="nutritrack-browser">
      /* Selection and caret carry the brand instead of the UA blue. */
      ::selection { background: ${LIME}; color: ${INK}; }
      ::-moz-selection { background: ${LIME}; color: ${INK}; }
      input, textarea, [contenteditable] { caret-color: ${DEEP_LIME}; }

      /* Keyboard focus stays visible; pointer focus stays quiet. */
      :focus { outline: none; }
      :focus-visible {
        outline: 2px solid ${DEEP_LIME};
        outline-offset: 3px;
        border-radius: 4px;
      }

      /* One scrollbar for the whole shell, themed from the palette. */
      * { scrollbar-color: rgba(198, 242, 78, 0.35) transparent; }
      ::-webkit-scrollbar { width: 11px; height: 11px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb {
        background: rgba(198, 242, 78, 0.28);
        border-radius: 999px;
        border: 3px solid transparent;
        background-clip: content-box;
      }
      ::-webkit-scrollbar-thumb:hover { background: rgba(198, 242, 78, 0.45); background-clip: content-box; }

      /* Underlines sit clear of the descenders, and the type renders crisply. */
      a, [role="link"] { text-underline-offset: 3px; text-decoration-thickness: 1px; }
      html { -webkit-text-size-adjust: 100%; }
      body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        overscroll-behavior-y: none;
      }
      /* Touch taps should not flash a highlight the design never asked for. */
      a, button, [role="button"], [role="link"] { -webkit-tap-highlight-color: transparent; }
    </style>
    ${CSS_END}`;


const TAGS = `${START}
    <link rel="canonical" href="${SITE_URL}/" />
    <link rel="manifest" href="${BASE}/site.webmanifest" />
    <link rel="apple-touch-icon" href="${BASE}/icon-192.png" />
    <meta name="application-name" content="NutriTrack" />
    <meta name="apple-mobile-web-app-title" content="NutriTrack" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="NutriTrack" />
    <meta property="og:locale" content="en" />
    <meta property="og:url" content="${SITE_URL}/" />
    <meta property="og:title" content="${TITLE}" />
    <meta property="og:description" content="${DESCRIPTION}" />
    <meta property="og:image" content="${IMAGE}" />
    <meta property="og:image:secure_url" content="${IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="NutriTrack — Eat Better. Live Healthier." />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${TITLE}" />
    <meta name="twitter:description" content="${DESCRIPTION}" />
    <meta name="twitter:image" content="${IMAGE}" />
    ${END}`;

if (!fs.existsSync(dist)) {
  console.error("dist/ not found - run `npx expo export --platform web` first.");
  process.exit(1);
}

// Single-page app: the app shell doubles as the 404 fallback so deep links like
// /login survive a refresh on GitHub Pages. This lives here rather than in the
// build script so one command produces the complete site, and so a local build
// can never silently ship without the fallback.
const shell = path.join(dist, "index.html");
if (fs.existsSync(shell)) {
  fs.copyFileSync(shell, path.join(dist, "404.html"));
  console.log("index.html -> 404.html (SPA fallback)");
}

const inject = (file) => {
  const full = path.join(dist, file);
  if (!fs.existsSync(full)) return;
  let html = fs.readFileSync(full, "utf8");
  // Drop any previously injected block so repeated builds stay clean.
  html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}\\s*`, "g"), "");
  html = html.replace(new RegExp(`${CSS_START}[\\s\\S]*?${CSS_END}\\s*`, "g"), "");
  if (!html.includes("</head>")) {
    console.error(`${file}: no </head> found, skipped`);
    return;
  }
  html = html.replace("</head>", `${TAGS}\n${BROWSER_CSS}\n  </head>`);
  fs.writeFileSync(full, html);
  console.log(`${file}: social/SEO tags injected`);
};

// The export writes the app shell twice; the SPA fallback needs them too.
["index.html", "404.html"].forEach(inject);

// Crawl directives. The app shell is client-rendered, so point crawlers at the
// canonical entry rather than letting them index deep-linked client routes.
const robots = `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`;
fs.writeFileSync(path.join(dist, "robots.txt"), robots);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>
</urlset>
`;
fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);

console.log("web build finalized");
