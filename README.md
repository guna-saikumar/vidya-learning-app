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

That auto-detects your Wi‑Fi host (no LAN IP to type), writes `.env` + `apps/student-mobile/.env`, and prints ready-to-use URLs:

| Service | How you get it |
|---|---|
| API / Swagger | printed `http://…:4000` / `/docs` |
| Postgres | printed `postgresql://vidya:vidya@…:5432/vidya` |
| DB UI (**pgweb**) | printed `http://…:8083` |
| Student Expo | QR / printed URL — app uses Expo’s LAN host automatically |

```bash
npm run db:psql     # interactive psql on this machine
```

Login: `student@vidya.test` / `StudentDemo1!`

On Apple networks, share URLs often use `YourMac.local` (Bonjour) so teammates never type an IP. Anyone who clones runs `npm start` for their own full stack.

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
