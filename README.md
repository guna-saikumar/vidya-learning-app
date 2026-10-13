## Vidya Monorepo

This repository contains the complete Vidya learning platform:

- `apps/student-mobile`: Expo student app (existing prototype, now inside `apps/`).
- `apps/admin-mobile`: Minimal Expo admin shell for quick stats and approvals.
- `apps/student-web`: Next.js 16 student portal.
- `apps/admin-web`: Next.js 16 admin dashboard.
- `apps/api`: Fastify + TypeScript backend.
- `packages/*`: Shared curriculum, design tokens, auth types, API client, db schema, config, and UI primitives.

### Local development

- **Student mobile (Expo):** `pnpm dev:student-mobile`
- **Admin mobile (Expo):** `pnpm dev:admin-mobile`
- **API (Fastify):** `pnpm dev:api`
- **Student web (Next.js):** `pnpm dev:student-web`
- **Admin web (Next.js):** `pnpm dev:admin-web`

### Quality checks

- **Typecheck:** `pnpm exec tsc --noEmit`
- **(Later) Lint/tests:** wired via Turborepo and GitHub Actions.
