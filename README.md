# vidya-learning-app

learning platform monorepo: an expo student app, an expo admin app and a nestjs (fastify adapter) api on postgres, with shared typescript packages.

## features

- student app: classes and learning content
- admin app: stats and approvals
- api: jwt auth, zod validation, prisma, swagger at `/docs`
- shared packages for auth, api client, curriculum, design tokens and ui

| path | what it is |
|---|---|
| `apps/student-mobile` | expo student app |
| `apps/admin-mobile` | expo admin shell |
| `apps/api` | nestjs 11 + fastify 5 api |
| `packages/db` | prisma schema, migrations, seed |
| `packages/auth`, `api-client`, `curriculum`, `design-tokens`, `ui`, `config` | shared code |

more: [docs/architecture.md](docs/architecture.md), [docs/tech-stack.md](docs/tech-stack.md), [docs/repo-structure.md](docs/repo-structure.md)

## stack

expo + react native · nestjs on fastify · prisma · postgres · pnpm workspaces + turbo · docker

## run locally

needs node 22.12+, pnpm 8 and docker (colima or docker desktop).

```bash
pnpm start          # postgres, api, both expo web apps, mailhog
pnpm docker:logs    # follow logs
pnpm docker:down    # stop
```

| service | url |
|---|---|
| api / swagger | http://localhost:4000, http://localhost:4000/docs |
| student web | http://localhost:8081 |
| admin web | http://localhost:8082 |
| mailhog | http://localhost:8025 |

seeded logins: `student@vidya.test` / `StudentDemo1!`, `admin@example.com` / `AdminDemo1!`. on a phone with expo go, the api url is your machine's lan ip (`VIDYA_DEV_HOST`), not `localhost`.

tests:

```bash
pnpm exec tsc --noEmit
pnpm --dir apps/api test
pnpm --dir packages/auth test
pnpm --dir apps/student-mobile test
```

last run (19 oct 2026): api 7/7, auth 16/16, student-mobile 11/11, typecheck clean ([output](benchmarks/results-2026-10-19/tests.txt)).

## env

copy `.env.example` to `.env`.

## performance (measured)

Measured on a single machine (8 vCPU Intel Xeon, 16 GB RAM, Linux) with k6 on the same box against one Node process (`pnpm --dir apps/api start`) and a local PostgreSQL 17 with the seed data. Raw output: [`benchmarks/results-2026-10-19/`](benchmarks/results-2026-10-19/), environment: [`environment.txt`](benchmarks/results-2026-10-19/environment.txt), reproduce: [`benchmarks/run.sh`](benchmarks/run.sh).

| Endpoint | VUs | req/s | p50 | p95 | p99 | Errors |
|---|---|---|---|---|---|---|
| `GET /api/auth/me` (JWT + user lookup) | 50 | 7,575 | 6.2 ms | 9.2 ms | 11.9 ms | 0% |
| `GET /api/classes` | 50 | 5,621 | 8.4 ms | 11.2 ms | 17.4 ms | 0% |
| `POST /api/auth/login` (bcrypt) | 20 | 72 | 274.7 ms | 286.2 ms | 296.3 ms | 0% |
| `GET /health` | 50 | 37,697 | 1.1 ms | 2.2 ms | 3.2 ms | 0% |

## known issues

- thin test coverage: one api e2e file (admin rbac) plus unit tests in `packages/auth`, `packages/api-client` and the student app.
- `pnpm audit` reports 11 high, 14 moderate and 1 low advisories (19 oct 2026).
- prisma warns that `package.json#prisma` config is deprecated ahead of prisma 7.

## license

[mit](LICENSE)
