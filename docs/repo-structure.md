## Repo Structure

- `apps/student-mobile`: Existing Expo student app (classes 6–10).
- `apps/admin-mobile`: Minimal Expo admin shell.
- `apps/student-web`: Next.js student web portal.
- `apps/admin-web`: Next.js admin dashboard.
- `apps/api`: NestJS v11 API using the Fastify adapter, Swagger, JWT auth, Zod validation, Prisma, and PostgreSQL.
- `packages/design-tokens`: Shared colors/spacing/shadows.
- `packages/curriculum`: Shared curriculum types, data, and service helpers.
- `packages/auth`: Role types (`STUDENT`, `ADMIN`) and helpers.
- `packages/api-client`: Thin REST client wrapper.
- `packages/config`: Env helper (`getEnv`).
- `packages/db`: Prisma schema and seed stub.
- `packages/ui`: Shared UI primitives (placeholder for now).
