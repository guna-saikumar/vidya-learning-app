## Vidya Monorepo

This repository contains the complete Vidya learning platform:

- `apps/student-mobile`: Expo student app (existing prototype, now inside `apps/`).
- `apps/admin-mobile`: Minimal Expo admin shell for quick stats and approvals.
- `apps/api`: Fastify + TypeScript backend.
- `packages/*`: Shared curriculum, design tokens, auth types, API client, db schema, config, and UI primitives.

### Local development

One command starts Colima/Docker (if needed) plus the full stack:

```bash
pnpm start
```

Services:

- **API:** http://localhost:4000
- **API docs:** http://localhost:4000/docs
- **PostgreSQL:** localhost:5432 (`vidya` / `vidya`, database `vidya`)
- **Student mobile web:** http://localhost:8081
- **Admin mobile web:** http://localhost:8082
- **Mailhog:** http://localhost:8025

Seeded logins:

- Student: `student@vidya.test` / `StudentDemo1!`
- Admin: `admin@example.com` / `AdminDemo1!`

### Expo Go (phone)

1. Run `pnpm start` (Mac and phone on the same Wi‑Fi).
2. Open the student Metro logs and scan the QR code with Expo Go:
   `pnpm docker:logs student-mobile-web`
3. Login with the seeded credentials above.

The API URL is your Mac’s LAN IP (auto-detected as `VIDYA_DEV_HOST`), not `localhost` — phones cannot reach the API via localhost.

Useful commands:

- **Start all services:** `pnpm start` (alias: `pnpm docker:up`)
- **Stop services:** `pnpm docker:down`
- **Follow logs:** `pnpm docker:logs`

Requires Docker CLI plus either [Colima](https://github.com/abiosoft/colima) (`brew install colima docker`) or Docker Desktop. `pnpm start` boots Colima automatically when the daemon is down.

### Quality checks

- **Typecheck:** `pnpm exec tsc --noEmit`
- **(Later) Lint/tests:** wired via Turborepo and GitHub Actions.
