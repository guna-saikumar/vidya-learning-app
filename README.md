## Vidya Monorepo

This repository contains the complete Vidya learning platform:

- `apps/student-mobile`: Expo student app (existing prototype, now inside `apps/`).
- `apps/admin-mobile`: Minimal Expo admin shell for quick stats and approvals.
- `apps/api`: Fastify + TypeScript backend.
- `packages/*`: Shared curriculum, design tokens, auth types, API client, db schema, config, and UI primitives.

### Local development

Docker is the default local development path.

```bash
pnpm docker:up
```

Services:

- **API:** http://localhost:4000
- **PostgreSQL:** localhost:5432 (`vidya` / `vidya`, database `vidya`)
- **Student mobile web:** http://localhost:8081
- **Admin mobile web:** http://localhost:8082

Useful commands:

- **Start all services:** `pnpm docker:up`
- **Stop services:** `pnpm docker:down`
- **Follow logs:** `pnpm docker:logs`

### Quality checks

- **Typecheck:** `pnpm exec tsc --noEmit`
- **(Later) Lint/tests:** wired via Turborepo and GitHub Actions.
