# Meals

Invite-only meal planning PWA: recipes, weekly plans, shopping lists, Google sign-in.

Local stack: **Next.js (App Router) + TypeScript**, **Postgres 16**, **fake-gcs-server** (GCS stand-in), **Auth.js** Google OAuth, **Drizzle** migrations, **@ducanh2912/next-pwa**.

## Quick start (Docker)

Primary local path:

```bash
cd /path/to/meals   # repository root
cp .env.example .env
# Edit .env: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, SEED_ADMIN_EMAIL
openssl rand -base64 32   # paste into AUTH_SECRET

make run                  # docker compose up --build (foreground)
```

`make help` lists targets (`stop`, `down`, `logs`, `migrate`, `seed`, …). Migrations already run when the app container starts (`npm run dev:docker`); use `make migrate` / `make seed` from another terminal if you need them again:

```bash
make seed                 # docker compose exec app npm run db:seed
```

Then open [http://localhost:3000](http://localhost:3000) → **Sign in with Google** using the seeded admin email.

### Compose services

| Service | Purpose | Ports |
|---------|---------|-------|
| `app` | Next.js (dev) | `3000` |
| `db` | Postgres 16 | `5432` |
| `storage` | fake-gcs-server (GCS API) | `4443` |
| `createbuckets` | Ensures `meal-assets` bucket dir | one-shot |

> **Note:** Compose originally targeted MinIO; Docker Hub/Quay pulls for `minio/minio` failed on this machine, so local storage uses `fsouza/fake-gcs-server` (closer to prod GCS). Swap the `storage` service back to MinIO if your registry can pull it.

## Local without Docker (app only)

```bash
cp .env.example .env
# Start only infra:
docker compose up db storage createbuckets -d

npm install
npm run db:migrate
SEED_ADMIN_EMAIL=you@example.com npm run db:seed
npm run dev
```

## Required environment variables

| Variable | Required | Notes |
|----------|----------|--------|
| `AUTH_SECRET` | yes | `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | yes (for login) | Google OAuth Web client ID |
| `AUTH_GOOGLE_SECRET` | yes (for login) | Google OAuth client secret |
| `AUTH_URL` | yes | `http://localhost:3000` locally |
| `DATABASE_URL` | yes | Compose default: `postgres://meal:meal@localhost:5432/meal` |
| `SEED_ADMIN_EMAIL` | for seed | First admin Google email |
| `STORAGE_*` | for uploads later | fake-gcs defaults in `.env.example` |

Google Cloud Console → create OAuth **Web** client → authorized redirect URI:

`http://localhost:3000/api/auth/callback/google`

Without Google credentials the app still boots; sign-in will fail until they are set.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run dev:docker` | Migrate then `next dev` (Compose) |
| `npm run db:generate` | Generate Drizzle SQL from schema |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed first admin (`SEED_ADMIN_EMAIL`) |
| `npm run build` / `start` | Production build |

## Project layout

```text
src/app/           App Router (auth, meals, recipes, plans, shopping, admin)
src/lib/db/        Drizzle schema + client
src/lib/auth.ts    Auth.js Google + invite gate
drizzle/           SQL migrations
docker-compose.yml App + Postgres + fake-gcs-server
```


## Data model

Tables: `users`, `invites`, `ingredients`, `recipes`, `recipe_ingredients`, `meals`, `meal_plans`, `meal_plan_entries`, `shopping_lists`, `shopping_list_items`.

Schema: [`src/lib/db/schema.ts`](src/lib/db/schema.ts)

## Auth (invite-only)

1. Seed an admin (`npm run db:seed`).
2. Admin creates invites (UI stub at `/admin/invites`; API/UI create next).
3. Invitee signs in with Google → if open invite matches email, user row is created; otherwise `/denied`.

## PWA

- [`public/manifest.webmanifest`](public/manifest.webmanifest)
- Icons under `public/icons/`
- Service worker via `@ducanh2912/next-pwa` (enabled on production builds; disabled in `next dev`)

iOS: Safari → Share → Add to Home Screen (needs HTTPS in prod).

## GCP (placeholders only — not deployed yet)

See commented section in [`.env.example`](.env.example):

- Cloud Run for the Next.js container (`output: "standalone"`)
- Cloud SQL Postgres → `DATABASE_URL` with Unix socket / connector
- GCS bucket → `GCS_BUCKET` / `GCS_PROJECT_ID` (swap storage adapter in `src/lib/storage.ts`)
- Secret Manager for `AUTH_SECRET`, OAuth secret, DB URL
- Prod OAuth redirect: `https://<cloud-run-url>/api/auth/callback/google`

## Health

[http://localhost:3000/api/health](http://localhost:3000/api/health) — checks Postgres connectivity.
