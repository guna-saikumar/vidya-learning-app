## Vidya Monorepo Architecture

- **Mobile (Expo):** `apps/student-mobile`, `apps/admin-mobile`.
- **Web (Next.js):** `apps/student-web`, `apps/admin-web`.
- **Backend (NestJS v11 + Fastify):** `apps/api` uses NestJS with `@nestjs/platform-fastify`, `fastify` v5, Swagger, JWT auth, Zod validation, Prisma, and PostgreSQL.
- **Shared packages:** `packages/design-tokens`, `packages/curriculum`, `packages/auth`, `packages/api-client`, `packages/config`, `packages/db`, `packages/ui`.

See `docs/tech-stack.md` for the locked project stack.
