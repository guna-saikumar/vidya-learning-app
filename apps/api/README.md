# @vidya/api

NestJS + Fastify API for Vidya (students + admins).

## Structure

```
src/
  main.ts                 # bootstrap (CORS, filters, listen)
  app.module.ts           # root module wiring
  docs.ts                 # CDN Swagger UI at /docs + /docs-json
  env.ts                  # root .env / .env.local + Neon→Prisma aliases
  common/                 # pipes, filters
  auth/                   # JWT, RBAC, student + admin auth
  prisma/                 # PrismaService
  mailer/                 # SMTP (Mailhog locally)
  curriculum/             # thin controllers (legacy path)
  admin/                  # thin controllers (legacy path)
  health/                 # thin controllers (legacy path)
  modules/
    dashboard/            # admin + student dashboard aggregations
    curriculum/           # CurriculumModule
    admin/                # AdminModule
    health/               # HealthModule
```

## Key routes

| Method | Path | Auth |
|--------|------|------|
| GET | `/health`, `/health/db` | public |
| GET | `/docs`, `/docs-json` | public |
| GET | `/api/classes` (+ `/:classId`, subjects/chapters/sections) | public / JWT |
| POST/PATCH/DELETE | `/api/admin/{classes,subjects,chapters,sections}` | admin JWT |
| GET | `/api/materials` | JWT |
| * | `/api/admin/materials` | admin JWT |
| * | `/api/me/{profile,progress,bookmarks,study-stats,tasks,notifications,exams,…}` | student JWT |
| * | `/api/quizzes`, `/api/me/quiz-attempts` | JWT |
| POST | `/api/admin/{quizzes,tasks,notifications,exams/*,students}` | admin JWT |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | student JWT |
| GET | `/api/dashboard` | any JWT |
| * | `/api/admin/auth/*` | admin flows |
| GET | `/api/admin/ping` | admin JWT |
| GET | `/api/admin/dashboard` (+ `/users`) | admin JWT |

Full interactive docs: `/docs` after `npm run backend` or `pnpm dev:api`.

## Local

```bash
# from repo root
npm run pg-admin         # Homebrew Postgres (no Docker) + open pgAdmin
npm run backend          # docker postgres + mailhog + api
# or
pnpm dev:api             # API only (uses .env DATABASE_URL)
```

Docs: http://localhost:4000/docs

## Production

Deployed on Vercel as Nest Fluid Function with Neon Postgres.
Env: `DATABASE_URL` (pooled), `DIRECT_URL` / `DATABASE_URL_UNPOOLED`, `JWT_SECRET`.
