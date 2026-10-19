# Vidya

Learning platform monorepo: an Expo student app, an Expo admin app and a NestJS (Fastify adapter) API on PostgreSQL, with shared TypeScript packages.

| Path | What it is |
|---|---|
| `apps/student-mobile` | Expo student app |
| `apps/admin-mobile` | Expo admin shell (stats, approvals) |
| `apps/api` | NestJS 11 + Fastify 5 API: JWT auth, Zod validation, Prisma, Swagger at `/docs` |
| `packages/db` | Prisma schema, migrations, seed |
| `packages/auth`, `api-client`, `curriculum`, `design-tokens`, `ui`, `config` | Shared code |

More detail: [docs/architecture.md](docs/architecture.md), [docs/tech-stack.md](docs/tech-stack.md), [docs/repo-structure.md](docs/repo-structure.md).

## Run locally

```bash
pnpm start          # boots Colima/Docker if needed, then Postgres, API, both Expo web apps, Mailhog
pnpm docker:logs    # follow logs
pnpm docker:down    # stop
```

| Service | URL |
|---|---|
| API / Swagger | http://localhost:4000, http://localhost:4000/docs |
| Student web | http://localhost:8081 |
| Admin web | http://localhost:8082 |
| Mailhog | http://localhost:8025 |
| Postgres | localhost:5432 (`vidya` / `vidya`) |

Seeded logins: `student@vidya.test` / `StudentDemo1!`, `admin@example.com` / `AdminDemo1!`.

On a phone with Expo Go, run `pnpm start`, open `pnpm docker:logs student-mobile-web` and scan the QR code. The API URL is your machine's LAN IP (`VIDYA_DEV_HOST`), not `localhost`.

Requires Node 22.12 or newer (Vite/rolldown's native binding is skipped on older 22.x), pnpm 8, and Docker (Colima or Docker Desktop).

## Tests

```bash
pnpm exec tsc --noEmit                 # whole repo
pnpm --dir apps/api test               # vitest
pnpm --dir packages/auth test          # node:test via tsx
pnpm --dir apps/student-mobile test    # node:test via tsx
```

Last run (19 Oct 2026): API 7/7, auth 16/16, student-mobile 11/11, typecheck clean. Output: [`benchmarks/results-2026-10-19/tests.txt`](benchmarks/results-2026-10-19/tests.txt).

## Performance (measured)

Measured on a single machine (8 vCPU Intel Xeon, 16 GB RAM, Linux) with k6 on the same box against one Node process (`pnpm --dir apps/api start`) and a local PostgreSQL 17 with the seed data. Raw output: [`benchmarks/results-2026-10-19/`](benchmarks/results-2026-10-19/), environment: [`environment.txt`](benchmarks/results-2026-10-19/environment.txt), reproduce: [`benchmarks/run.sh`](benchmarks/run.sh).

| Endpoint | VUs | req/s | p50 | p95 | p99 | Errors |
|---|---|---|---|---|---|---|
| `GET /api/auth/me` (JWT + user lookup) | 50 | 7,575 | 6.2 ms | 9.2 ms | 11.9 ms | 0% |
| `GET /api/classes` | 50 | 5,621 | 8.4 ms | 11.2 ms | 17.4 ms | 0% |
| `POST /api/auth/login` (bcrypt) | 20 | 72 | 274.7 ms | 286.2 ms | 296.3 ms | 0% |
| `GET /health` | 50 | 37,697 | 1.1 ms | 2.2 ms | 3.2 ms | 0% |

## Known issues

- Test coverage is thin: one API e2e file (admin RBAC) plus unit tests in `packages/auth`, `packages/api-client` and the student app. No coverage report is collected yet.
- `pnpm audit` reports 11 high, 14 moderate and 1 low advisories (19 Oct 2026).
- Prisma warns that `package.json#prisma` config is deprecated ahead of Prisma 7.

## License

[MIT](LICENSE)
