# vidya-learning-app

learning platform monorepo: an expo student app, an expo admin app and a nestjs (fastify adapter) api on postgres, with shared typescript packages.

## features

- student app: classes and learning content
- admin app: stats and approvals
- api: jwt auth, zod validation, raw `pg` sql, swagger at `/docs`
- admin api: get-only static fixtures (+ static demo login)
- shared packages for auth, api client, curriculum, design tokens and ui

| path | what it is |
|---|---|
| `apps/student-mobile` | expo student app |
| `apps/admin-mobile` | expo admin shell |
| `apps/api` | nestjs 11 + fastify 5 api |
| `packages/db` | sql migrations + seed (`pg`) |
| `packages/auth`, `api-client`, `curriculum`, `design-tokens`, `ui`, `config` | shared code |

more: [docs/architecture.md](docs/architecture.md), [docs/tech-stack.md](docs/tech-stack.md), [docs/repo-structure.md](docs/repo-structure.md)

## stack

expo + react native · nestjs on fastify · postgres + raw sql (`pg`) · pnpm workspaces + turbo

## run locally

needs node 22.12+, pnpm 8, and homebrew postgres (installed by the start script on macOS).

```bash
npm start           # postgres + migrate + seed + api (foreground)
npm run db:psql     # interactive psql (no gui)
```

| service | url |
|---|---|
| api / swagger | http://localhost:4000, http://localhost:4000/docs |

seeded student: `student@vidya.test` / `StudentDemo1!`.  
static admin login: `admin@vidya.edu.in` / `AdminDemo1!` (admin gets return fixtures, not db).

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

## local benchmark

local benchmark, single run on one machine: 8 vCPU Intel Xeon, 16 GB RAM, Linux 6.12, node v22.20.0, PostgreSQL 17, k6 v0.54.0. k6 ran on the same box against one Node process (`pnpm --dir apps/api start`) and a local PostgreSQL 17 with the seed data. raw output: [`benchmarks/results-2026-10-19/`](benchmarks/results-2026-10-19/), environment: [`environment.txt`](benchmarks/results-2026-10-19/environment.txt), reproduce: [`benchmarks/run.sh`](benchmarks/run.sh). these are numbers from one local box, not a production deployment.

| Endpoint | VUs | req/s | p50 | p95 | p99 | Errors |
|---|---|---|---|---|---|---|
| `GET /api/auth/me` (JWT + user lookup) | 50 | 7,575 | 6.2 ms | 9.2 ms | 11.9 ms | 0% |
| `GET /api/classes` | 50 | 5,621 | 8.4 ms | 11.2 ms | 17.4 ms | 0% |
| `POST /api/auth/login` (bcrypt) | 20 | 72 | 274.7 ms | 286.2 ms | 296.3 ms | 0% |
| `GET /health` | 50 | 37,697 | 1.1 ms | 2.2 ms | 3.2 ms | 0% |

## known issues

- thin test coverage: one api e2e file (admin rbac) plus unit tests in `packages/auth`, `packages/api-client` and the student app.
- `pnpm audit` reports 11 high, 14 moderate and 1 low advisories (19 oct 2026).
## license

[mit](LICENSE)

---

built by [sreecharan desu](https://www.sreecharandesu.in) · [more projects](https://www.sreecharandesu.in/work)
