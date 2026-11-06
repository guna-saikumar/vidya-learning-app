# Vidya Learning — Complaints & Help (standalone)

Standalone module for the Vidya learning app (classes 6–10). Runs fully locally with:

- **React Native (Expo)** — phone app + web (browser renders at **420 px**, like a phone)
- **NestJS v11 + Fastify + raw `pg` (no ORM)** — API
- **PostgreSQL** — database `vidya_contact` on `localhost:5432`

## Layout

```
contact-us/
├── api/                 # NestJS + Fastify + raw pg API
├── mobile/              # Expo React Native app (Expo Go + web)
├── db/schema.sql        # local PostgreSQL schema
├── scripts/setup-db.ps1 # create role + database + schema (Windows)
├── scripts/setup-db.sh  # same for macOS/Linux
├── .env                 # local config (git-ignored)
├── .env.example
└── README.md
```

## 1) Set up local PostgreSQL

The app uses its own dedicated database and role:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vidya_contact
DB_USER=vidya_contact
DB_PASSWORD=
```

Set `DB_PASSWORD` in your environment or in `contact-us/.env` (git-ignored). Copy `.env.example` and fill it in locally. The setup scripts refuse to run without `DB_PASSWORD`.

Create the role and database (or re-apply the schema) with:

```powershell
.\scripts\setup-db.ps1
```

or, on macOS/Linux:

```bash
./scripts/setup-db.sh
```

The script needs a PostgreSQL superuser (default `postgres`). It creates role `vidya_contact`, database `vidya_contact`, and applies `db/schema.sql`.

To inspect data:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d vidya_contact
\dt
SELECT ticket_ref, full_name, category, status, created_at FROM contact_tickets ORDER BY created_at DESC;
```

## One-command run

From the repo root (`contact-us/`), run:

```powershell
npm start
```

This starts both the NestJS API and the Expo app in one terminal (API on `:4100`, Expo on `:8081`). You'll see the QR code and the web URL in the same output. Press `Ctrl+C` to stop both.

## 2) Run the API

```powershell
cd api
npm install
npm start
```

Endpoints (Swagger at http://localhost:4100/docs):

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | none | liveness |
| GET | `/health/db` | none | DB connectivity |
| GET | `/api/v1/support/config` | none | support email/phone/hours |
| POST | `/api/v1/support/complaints` | none | file complaint |
| GET | `/api/v1/support/complaints` | `x-admin-token` | list latest 200 |
| PATCH | `/api/v1/support/complaints/:ref/status` | `x-admin-token` | update status |

## 3) Run the mobile app

If you used `npm start` above, you're already running the app. To run it alone:

```powershell
cd mobile
npm install
npx expo start
```

Then:

- **Expo Go on phone** — scan the QR (same Wi‑Fi). Edit `mobile/.env` first:
  ```
  EXPO_PUBLIC_CONTACT_API_URL=http://192.168.0.119:4100
  ```
  Use your computer's LAN IP, not `localhost`.
- **Web browser** — press `w` in the Expo terminal, or:
  ```powershell
  npm run web
  ```
  The app is centered at **420 px** with a subtle phone frame. For web on the same machine, `http://localhost:4100` is used automatically.

## 4) `.env` files

**`contact-us/.env`** (used by the API):

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vidya_contact
DB_USER=vidya_contact
DB_PASSWORD=
PORT=4100
HOST=0.0.0.0
ADMIN_TOKEN=...
SUPPORT_EMAIL=support@vidya.school
SUPPORT_PHONE=+91 98765 43210
SUPPORT_HOURS=Mon-Sat, 8:00 AM - 5:00 PM
```

**`mobile/.env`** (used by the app):

```
EXPO_PUBLIC_CONTACT_API_URL=http://192.168.0.119:4100
```