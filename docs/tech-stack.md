# Vidya Tech Stack

This document is the source of truth for implementation tasks across the Vidya monorepo.

## Frontend

### Mobile Apps

- **Expo + React Native** for student and admin mobile applications.
- **Expo Router** for mobile navigation and routing.
- **NativeWind** for Tailwind CSS-style utility classes.
- **React Native Paper** for ready-made mobile UI components.
- **Tamagui** for theming and reusable design elements.
- **UI Kitten** for themed forms, buttons, layouts, and application screens.
- **Restyle** for type-safe design tokens and themes.
- **Gluestack UI** for customizable Expo and React Native components.
- **Dripsy** for responsive styling and theming.
- **Unistyles** for themes, breakpoints, and responsive styling.

## Backend

- **NestJS v11** as the backend application framework.
- **Fastify adapter** via `@nestjs/platform-fastify` with `fastify` v5.
- **PostgreSQL** as the primary relational database.
- **Raw SQL via `pg`** for data access and migrations (no ORM).
- **Zod** for schema validation where explicit runtime validation is needed.
- **JWT** for authentication and protected API routes.
- **CORS** for controlled cross-origin access.
- **Swagger / OpenAPI** for API documentation.
- **bcrypt** for password hashing.
- Admin domain APIs are **GET-only with static fixtures** (plus static demo login). Student APIs are DB-backed.

## Official Docs

- Fastify: https://fastify.dev/
- NestJS: https://nestjs.com/
- PostgreSQL: https://www.postgresql.org/
- node-postgres: https://node-postgres.com/
- Swagger: https://swagger.io/specification/

## Local Runtime

Default local path (Homebrew Postgres + `psql` CLI, no GUI):

```bash
npm start              # postgres + migrate + seed + API
npm run db:psql        # interactive psql
```

Deployment scripts and deployment platform config are intentionally out of scope for now.
