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

const inject = (file) => {
  const full = path.join(dist, file);
  if (!fs.existsSync(full)) return;
  let html = fs.readFileSync(full, "utf8");
  // Drop any previously injected block so repeated builds stay clean.
  html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}\\s*`, "g"), "");
  if (!html.includes("</head>")) {
    console.error(`${file}: no </head> found, skipped`);
    return;
  }
  html = html.replace("</head>", `${TAGS}\n  </head>`);
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
