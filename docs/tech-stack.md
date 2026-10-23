# Vidya Tech Stack

This document is the source of truth for implementation tasks across the Vidya monorepo.

## Frontend

### Mobile Apps

- **Expo + React Native** for the student mobile application.
- **Expo Router / React Navigation** for student screens (Home, Learn, Profile, Notifications, and nested learning flows).
- Approved styling options: NativeWind, React Native Paper, Tamagui, UI Kitten, Restyle, Gluestack UI, Dripsy, Unistyles.

## Backend

- **NestJS v11** with `@nestjs/platform-fastify` / `fastify` v5.
- **PostgreSQL** with **raw `pg` SQL** (no ORM).
- **Zod**, **JWT**, **Swagger/OpenAPI**, **bcrypt**.
- Student-only API surface (admin app and admin routes removed).

## Local Runtime

One command after clone on **macOS, Linux, or Windows** (native Postgres — no Docker):

```bash
npm start
```

Starts (`scripts/start.mjs`):

1. Native Postgres (LAN bind when conf is writable)
2. SQL migrate + seed
3. **pgweb** DB UI on `:8083` (optional if installed)
4. Nest API on `:4000` (bound `0.0.0.0`)
5. Student Expo with `--lan` on `:8081`

```bash
npm run db:psql     # CLI against local DB
```

Teammates on the same Wi‑Fi use the LAN URLs printed by `npm start` (API, Postgres, pgweb, Expo).
