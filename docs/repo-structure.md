## Repo Structure

- `apps/student-mobile`: Existing Expo student app (classes 6–10).
- `apps/admin-mobile`: Minimal Expo admin shell.
- `apps/api`: NestJS v11 API (`src/main.ts`) using `@nestjs/platform-fastify`, Swagger at `/docs`, JWT auth, Zod validation, raw `pg` SQL, and PostgreSQL.
- `packages/design-tokens`: Shared colors/spacing/shadows.
- `packages/curriculum`: Shared curriculum types, data, and service helpers.
- `packages/auth`: Role types (`STUDENT`, `ADMIN`) and helpers.
- `packages/api-client`: Thin REST client wrapper.
- `packages/config`: Env helper (`getEnv`).
- `packages/db`: SQL migrations and seed (`pg`).
- `packages/ui`: Shared UI primitives (placeholder for now).
