# Vidya Student Web

React + Vite student profile web app connected to the existing Vidya backend API.

## Run

1. Start the backend API (and Postgres) from the repo root:
   - `pnpm dev:api` (or `npm run dev:backend`)
2. Install dependencies (from repo root):
   - `pnpm install`
3. Start the web app:
   - `pnpm --dir apps/student-web dev`
   - or `pnpm dev:student-web` from repo root

The app runs at `http://localhost:5173` and calls the API at `VITE_API_BASE_URL` (default `http://localhost:4000`).

## Environment

Copy `.env.example` to `.env` and adjust:

```
VITE_API_BASE_URL=http://localhost:4000
```

## Build

```
pnpm --dir apps/student-web build
```