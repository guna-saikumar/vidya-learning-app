# @vidya/api

NestJS + Fastify API for Vidya (student-only).

## Structure

```
src/
  main.ts                 # bootstrap (CORS, filters, listen)
  app.module.ts           # root module wiring
  docs.ts                 # CDN Swagger UI at /docs + /docs-json
  env.ts                  # root .env loading
  common/                 # pipes, filters, ids
  auth/                   # JWT, student auth, StudentRoleGuard
  db/                     # DbService (pg.Pool, raw SQL)
  mailer/                 # SMTP or console fallback
  modules/                # feature domains (match app / Postman)
    health/               # /health, /health/db
    curriculum/           # public curriculum GETs
    materials/            # published materials (GET)
    dashboard/            # student dashboard
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
| * | `/api/me/*` | student JWT |
| * | `/api/quizzes`, `/api/me/quiz-attempts` | JWT |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | student JWT |
| GET | `/api/dashboard` | student JWT |

There is no admin API surface. Student accounts are provisioned (no self-registration).

## Local

```bash
npm start                 # from repo root: Postgres + migrate + seed + this API
npm run db:psql           # interactive psql
pnpm --dir apps/api test
pnpm --dir apps/api typecheck
```
