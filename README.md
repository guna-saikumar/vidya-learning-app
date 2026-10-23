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

Needs Node 22.12+, pnpm 8. On macOS, Homebrew installs Postgres + **pgweb** if missing.

```bash
npm start
```

That brings up on **your machine** (and exposes across the same Wi‑Fi):

| Service | URL (example) |
|---|---|
| API / Swagger | `http://<LAN-IP>:4000` / `/docs` |
| Postgres | `postgresql://vidya:vidya@<LAN-IP>:5432/vidya` |
| DB UI (**pgweb**) | `http://<LAN-IP>:8083` |
| Student Expo | `http://<LAN-IP>:8081` |

```bash
npm run db:psql     # interactive psql on this machine
```

Login: `student@vidya.test` / `StudentDemo1!`

Teammates on the same Wi‑Fi open the LAN URLs printed by `npm start` — no separate server needed on their phones for the API/DB if they point Expo/clients at your LAN IP. Anyone who clones can run `npm start` on their own machine for a full private stack.

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
