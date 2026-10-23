# vidya-learning-app

Student learning platform: Expo student app + NestJS (Fastify) API on Postgres, with shared TypeScript packages.

## Features

- Student app tabs/screens: **Home**, **Learn**, **Profile**, **Notifications** (plus tasks/progress/curriculum flows)
- API: JWT auth, Zod validation, raw `pg` SQL, Swagger at `/docs`
- Shared packages for auth, api client, curriculum, design tokens, and UI

| path | what it is |
|---|---|
| `apps/student-mobile` | Expo student app |
| `apps/api` | NestJS 11 + Fastify 5 API |
| `packages/db` | SQL migrations + seed (`pg`) |
| `packages/auth`, `api-client`, `curriculum`, `design-tokens`, `ui`, `config` | shared code |

More: [docs/architecture.md](docs/architecture.md), [docs/tech-stack.md](docs/tech-stack.md), [docs/repo-structure.md](docs/repo-structure.md)

## Stack

Expo + React Native · NestJS on Fastify · Postgres + raw SQL (`pg`) · pnpm workspaces + turbo

## Run locally (single command)

Works on **macOS, Linux, and Windows** (Node 22.12+, pnpm 8, native PostgreSQL — no Docker).

```bash
npm start
```

That auto-detects your Wi‑Fi host (no LAN IP to type), writes `.env` + `apps/student-mobile/.env` / `.env.local`, and prints ready-to-use URLs:

| Service | How you get it |
|---|---|
| API / Swagger | printed `http://…:4000` / `/docs` |
| Postgres | printed `postgresql://vidya:vidya@…:5432/vidya` |
| DB UI (**pgweb**) | printed `http://…:8083` (optional; skipped if not installed) |
| Student Expo | QR / printed URL — app uses Expo’s LAN host automatically |

**Postgres (one-time):**
- macOS: `brew install postgresql@17` (also auto-installed by `npm start` when Homebrew is present)
- Linux: `sudo apt install postgresql postgresql-contrib` (or distro equivalent)
- Windows: [PostgreSQL installer](https://www.postgresql.org/download/windows/) — add `bin` to PATH. If bootstrap needs the `postgres` superuser password, set `VIDYA_PG_SUPER_PASSWORD`.

```bash
npm run db:psql     # interactive psql on this machine
```

Login: `student@vidya.test` / `StudentDemo1!`

On Apple networks, share URLs often use `YourMac.local` (Bonjour) so teammates never type an IP.

## Tests

```bash
pnpm exec tsc --noEmit
pnpm --dir apps/api test
pnpm --dir packages/auth test
pnpm --dir apps/student-mobile test
```

## Env

`npm start` writes `.env` with your LAN IP. See `.env.example`.

## License

[MIT](LICENSE)
