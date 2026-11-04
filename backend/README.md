# @vidya/api

NestJS + Fastify API for Vidya (student-only).

## Structure

```
src/
  main.ts                 # bootstrap (CORS, multipart, static /uploads, filters, listen)
  app.module.ts           # root module wiring
  docs.ts                 # CDN Swagger UI at /docs + /docs-json
  env.ts                  # root .env loading
  common/                 # pipes, filters, ids, uploads dir helpers
  auth/                   # JWT access tokens, refresh tokens, StudentRoleGuard
  db/                     # DbService (pg.Pool, raw SQL — no ORM)
  mailer/                 # SMTP or console fallback
  modules/
    health/               # /health, /health/db
    students/             # onboarding, profile, avatar, settings, progress, bookmarks
    schools/              # school directory
    curriculum/           # classes → subjects → chapters → sections
    notifications/        # student feed
```

## Key routes (`/api/v1`)

| Method | Path | Auth |
|--------|------|------|
| GET | `/health`, `/health/db` | public |
| GET | `/docs`, `/docs-json` | public |
| POST | `/api/v1/auth/login`, `/refresh`, `/logout` | public |
| GET | `/api/v1/auth/me` | student JWT |
| GET/PUT/PATCH/DELETE | `/api/v1/students/me/{profile,onboarding,settings,avatar}` | student JWT |
| GET/PUT | `/api/v1/students/me/progress[/:chapterId]` | student JWT |
| GET/POST/DELETE | `/api/v1/students/me/bookmarks[/:bookmarkId \| /by-section/:sectionId]` | student JWT |
| GET | `/api/v1/schools`, `/api/v1/schools/:id` | student JWT |
| GET | `/api/v1/curriculum/{classes,classes/:id/subjects,subjects/:id,chapters/:id,sections/:id}` | student JWT |
| GET/PATCH/POST | `/api/v1/notifications[/:id[/read]]`, `/read-all` | student JWT |
| GET | `/uploads/avatars/*` | public (static) |

Auth: access JWT lives 15 minutes (`ACCESS_TOKEN_TTL`); refresh tokens live 30 days
(`REFRESH_TOKEN_TTL_DAYS`), are stored as sha256 hashes in `"RefreshToken"` and rotate on every
`/auth/refresh`. Avatars are written to `apps/api/uploads/avatars/{userId}.{ext}` (override with
`UPLOADS_DIR`; git-ignored).

There is no admin API surface. Student accounts are provisioned (no self-registration).

## Local

```bash
npm start                 # from repo root: Postgres + migrate + seed + this API
npm run db:psql           # interactive psql
pnpm --dir apps/api test
pnpm --dir apps/api typecheck
```
