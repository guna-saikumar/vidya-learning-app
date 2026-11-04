## Vidya Architecture

The repository is organized into a clean, two-tier architecture:

```
vidya-learning-app/
│
├── frontend/
│
├── backend/
│
├── docs/
│
└── README.md
```

- **Frontend (Expo):** `frontend/` (Home, Learn, Profile, Notifications, and learning flows).
- **Backend (NestJS v11 + Fastify):** `backend/` uses NestJS with `@nestjs/platform-fastify`, `fastify` v5, Swagger, JWT auth, Zod validation, raw `pg` SQL, and PostgreSQL. Also houses `backend/db/` (migrations & seeds) and `backend/scripts/`.

See `docs/tech-stack.md` for the locked project stack.
