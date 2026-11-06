# NutriTrack

A mobile-first nutrition and activity tracker built with Expo and React Native.

## Run locally

1. Install dependencies with npm ci.
2. Start Expo with npx expo start.
3. To open it on a phone, connect the phone and development computer to the same network and scan the QR code. Use npx expo start --tunnel if the network blocks local connections.

Personal tracking works without a backend and stays on the device.

## Website version

The web build uses the same NutriTrack screens and account system as the mobile app.

1. Run `npm run build:web` to create the website in `dist/`.
2. Publish the `dist/` folder with a static host such as Netlify.
3. When the host builds from Git, add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as build environment variables so login and Community can connect.

The app uses a single-page web build. The `public/_redirects` file sends direct route requests back to the app so URLs like `/login` continue to work after refresh.

### Routes

| Path | Screen |
|---|---|
| `/` | Landing page (web only; native opens the tracker directly) |
| `/app` | Tracker entry — onboarding, or a redirect to `/home` once done |
| `/home` | Dashboard |
| `/nutrition`, `/progress`, `/activity`, `/profile` | Main tabs |
| `/login` | Sign in / sign up |
| `/community/[userId]` | A member's shared daily summaries |

### Build pipeline

`npm run build:web` runs `expo export --platform web` and then
`scripts/finalize-web.mjs`, which:

- copies `index.html` to `404.html` so deep links survive a refresh on GitHub
  Pages (single-page app),
- injects the social/SEO/PWA tags (Open Graph, Twitter card, canonical, web
  manifest, apple-touch-icon) into both files,
- injects the browser-surface CSS — selection, caret, focus-visible rings,
  scrollbar, font smoothing and tap highlight — because Expo's static export
  ships no stylesheet of its own and those UA defaults belong to no design
  system.

The Pages workflow runs the same finalize step, so a local build and a
deployed build are identical.

The 1200x630 share card (`public/og-image.png`) and the PWA icons are rendered
from the real app mockup by `npm run og` (`scripts/build-og-card.mjs`); Expo
does not copy `assets/` into `dist/`, so they are committed under `public/`.
Re-run it after changing the brand or the home screen. Set `SITE_URL` when
serving from a custom domain.

## Optional Community setup (free tier only)

Community requires a shared Supabase project. It is disabled until both environment values are configured.

1. Create a Supabase project on the Free plan. Do not enable paid billing or paid add-ons. Free quotas apply and the project can pause after inactivity.
2. Copy .env.example to .env and replace the placeholders with the project URL and publishable key from the Supabase dashboard.
3. Never put a service_role key or secret key in this app. Never commit .env.
4. Run supabase/migrations/202611010001_community_sharing.sql in the project’s SQL editor.
5. Enable email/password sign-in in Supabase Auth. Keep email confirmation enabled for real users and configure the project’s rate limits.
6. Restart Expo after changing .env.

Community account holders can search by exact display name and send or accept joining requests. Only accepted group members can read shared reports. Each person must enable “Share daily summaries”; turning it off hides and deletes their published summaries. Shared reports contain daily calories, protein, carbs, fat, fiber, and water for up to 30 days. Meal-level logs, weight, and profile details are not shared.

## Accounts & cloud backup (MongoDB, optional)

NutriTrack can offer real sign-up / sign-in and back up your goals and daily
totals to a MongoDB database. This is optional and off by default.

1. Run the reference API in `server/`: `cd server && cp .env.example .env`, set
   `MONGODB_URI` (local or MongoDB Atlas) and a random `JWT_SECRET`, then
   `npm install && npm start`.
2. Point the app at it by setting `EXPO_PUBLIC_SUPABASE_URL`'s neighbour
   `EXPO_PUBLIC_MONGODB_API_URL` to the API base URL (see `.env.example`), and
   restart Expo.
3. Open **Profile → Account → Sign in or create account**.

When the API URL is set, the Profile shows a "Cloud" badge and accounts are
stored in MongoDB. When it is not set, the app runs in local-only mode and the
account stays on the device. See `server/README.md` for the full endpoint list.
The connection string and `JWT_SECRET` live only on the server, never in the app.

## Build checks

- npm run lint
- npm run build:web

## Before a public release

Before a public release, add password recovery and an approved self-service Community account deletion flow, set unique iOS and Android application identifiers and signing credentials, apply the Supabase migration to the intended production project, and verify sign-up, request acceptance, report access, and sharing revocation with two accounts on real devices. Publish a privacy policy that explains local health-data storage and Community sharing.

The core tracker currently stores its local data with AsyncStorage. Review and migrate that storage to an encrypted database before handling real users’ health data. The production-only npm audit reports zero vulnerabilities. The full dependency audit still reports 14 moderate findings in ESLint developer tooling; npm reports no compatible automatic fix for those packages.




