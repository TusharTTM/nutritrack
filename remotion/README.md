# NutriTrack — App Promo (Remotion)

A 30-second product promo built with **Remotion** (React), using the app's real
UI (the SVG screens in `public/screens/`) as the on-screen app.

- **Master composition:** `NutriTrackPromo` — **1920 × 1080**, **60 fps**, **1800 frames** (30 s)
- **Safe area:** all key content (logos, headlines, tagline) stays inside the
  central safe area (`src/theme.ts` → `CORE`) so the video can be re-framed for
  **9:16** and **1:1** without losing anything.
- **Fonts:** Inter is loaded and rendering is **blocked until fonts are ready**
  (`src/components/FontLoader.tsx`).
- **Motion:** eased (`Easing`) entrances, staggered text, phone slide-in, scene
  cross-dissolves, and a slow camera push/zoom per scene.

## Scenes (storyboard)
1. **Brand intro** — leaf mark, wordmark, tagline
2. **Dashboard** — Home screen
3. **Nutrition** — macros + recent foods
4. **Progress** — weight trend
5. **Activity & Diary** — workouts & meals
6. **Outro** — tagline + wordmark

## Requirements
Node 18+. Remotion auto-downloads its own headless Chrome on first render
(needs internet once).

## Commands
```bash
npm install
npm run dev      # Remotion Studio (scrub/preview in browser)
npm run still    # one still: out/still.png
npm run stills   # one still per scene: out/scene-*.jpeg
npm run render   # full video: out/promo.mp4 (1920x1080 @ 60fps, 1800 frames)
```

## Vertical / square versions
Re-render with a different size, keeping the central safe area:
```bash
npx remotion render NutriTrackPromo out/promo-9x16.mp4 --width=1080 --height=1920
npx remotion render NutriTrackPromo out/promo-1x1.mp4  --width=1080 --height=1080
```

## Layout / QC
`qc/render-stills.mjs` renders one PNG still per scene (resvg) and
`qc/render-preview.mjs` renders an animated preview GIF — used to check for
overlaps, clipped content, unreadable text and UI size without a full render.
