# @vidya/api

NestJS + Fastify API for Vidya (students + admins).

## Structure

```
src/
  main.ts                 # bootstrap (CORS, filters, listen)
  app.module.ts           # root module wiring
  docs.ts                 # CDN Swagger UI at /docs + /docs-json
  env.ts                  # root .env loading
  common/                 # pipes, filters, ids
  auth/                   # JWT, RBAC, student auth + static admin login
  db/                     # DbService (pg.Pool, raw SQL)
  mailer/                 # SMTP or console fallback
  modules/                # feature domains (match app / Postman)
    health/               # /health, /health/db
    admin/                # /api/admin/ping + static fixtures
    curriculum/           # public curriculum GETs
    materials/            # published materials + static admin GETs
    dashboard/            # student dashboard + static admin dashboard
    me/                   # profile, progress, bookmarks, study-stats
    quizzes/              # quizzes + attempts
    tasks/                # student tasks
    notifications/        # student feed
    exams/                # student schedule + results
```

## Key routes

| Method | Path | Auth |
|--------|------|------|
| GET | `/health`, `/health/db` | public |
| GET | `/docs`, `/docs-json` | public |
| GET | `/api/classes` (+ nested curriculum) | public / JWT |
| GET | `/api/materials` | JWT |
| GET | `/api/admin/materials`, `/api/admin/materials/:id` | admin JWT (static) |
| * | `/api/me/*` | student JWT |
| * | `/api/quizzes`, `/api/me/quiz-attempts` | JWT |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | student JWT |
| GET | `/api/dashboard` | any JWT |
| POST | `/api/admin/auth/login` | public (static demo) |
| GET | `/api/admin/auth/me` | admin JWT (static) |
| GET | `/api/admin/ping`, `/api/admin/dashboard` | admin JWT (static) |

Admin mutations (curriculum CMS, materials writes, OTP flows, etc.) are removed.

## Local

```bash
npm start                 # from repo root: Postgres + migrate + seed + this API
npm run db:psql           # interactive psql
pnpm --dir apps/api test
pnpm --dir apps/api typecheck
```
