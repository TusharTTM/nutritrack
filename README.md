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

## Optional Community setup (free tier only)

Community requires a shared Supabase project. It is disabled until both environment values are configured.

1. Create a Supabase project on the Free plan. Do not enable paid billing or paid add-ons. Free quotas apply and the project can pause after inactivity.
2. Copy .env.example to .env and replace the placeholders with the project URL and publishable key from the Supabase dashboard.
3. Never put a service_role key or secret key in this app. Never commit .env.
4. Run supabase/migrations/202611010001_community_sharing.sql in the project’s SQL editor.
5. Enable email/password sign-in in Supabase Auth. Keep email confirmation enabled for real users and configure the project’s rate limits.
6. Restart Expo after changing .env.

Community account holders can search by exact display name and send or accept joining requests. Only accepted group members can read shared reports. Each person must enable “Share daily summaries”; turning it off hides and deletes their published summaries. Shared reports contain daily calories, protein, carbs, fat, fiber, and water for up to 30 days. Meal-level logs, weight, and profile details are not shared.

## Build checks

- npm run lint
- npm run build:web

## Before a public release

Before a public release, add password recovery and an approved self-service Community account deletion flow, set unique iOS and Android application identifiers and signing credentials, apply the Supabase migration to the intended production project, and verify sign-up, request acceptance, report access, and sharing revocation with two accounts on real devices. Publish a privacy policy that explains local health-data storage and Community sharing.

The core tracker currently stores its local data with AsyncStorage. Review and migrate that storage to an encrypted database before handling real users’ health data. The production-only npm audit reports zero vulnerabilities. The full dependency audit still reports 14 moderate findings in ESLint developer tooling; npm reports no compatible automatic fix for those packages.




