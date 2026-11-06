# NutriTrack API (MongoDB)

A small reference REST API that gives NutriTrack real accounts and cloud backup
using **MongoDB**. The mobile/web app talks to it over HTTPS. Without it, the app
runs fully in local-only mode (data stays on the device).

## What it stores

- **Users** — email, a bcrypt password hash, and a display name.
- **Profile** — a free-form JSON document per user (goals, preferences).
- **Snapshots** — your daily totals for the last 30 days, for cloud backup.

## Endpoints

| Method | Path          | Auth | Body                                   | Returns                       |
|--------|---------------|------|----------------------------------------|-------------------------------|
| GET    | `/health`     | –    | –                                      | `{ ok: true }`                |
| POST   | `/auth/signup`| –    | `{ email, password, displayName }`     | `{ token, user }`             |
| POST   | `/auth/signin`| –    | `{ email, password }`                  | `{ token, user }`             |
| GET    | `/me`         | ✅   | –                                      | `{ profile }`                 |
| PUT    | `/me`         | ✅   | `{ profile }`                          | `{ profile }`                 |
| GET    | `/snapshot`   | ✅   | –                                      | `{ goals, days }`             |
| PUT    | `/snapshot`   | ✅   | `{ goals, days }`                      | `{ ok: true }`                |

✅ = send `Authorization: Bearer <token>`.

## Run it locally

```bash
cd server
cp .env.example .env         # then edit MONGODB_URI and JWT_SECRET
npm install
npm start                    # listens on http://localhost:4000
```

You need a MongoDB connection string:

- **Local:** install MongoDB and use `mongodb://127.0.0.1:27017/nutritrack`.
- **Cloud (free):** create a MongoDB Atlas cluster, create a database user, and
  use the `mongodb+srv://...` connection string from Atlas.

## Connect the app

Set the API base URL as an environment variable for the Expo app, then restart:

```bash
EXPO_PUBLIC_MONGODB_API_URL=https://your-api.example.com
```

When this is set, the in-app **Sign in / Create account** screen uses your
MongoDB accounts and the Profile shows a "Cloud" badge. When it is not set, the
app stays in local-only mode and nothing is uploaded.

> Deploy this API to any Node host (Render, Railway, Fly.io, a VPS, etc.). For a
> public deployment, serve it over HTTPS and keep `JWT_SECRET` private. Never put
> your MongoDB connection string or `JWT_SECRET` in the mobile app — they belong
> only on the server.
