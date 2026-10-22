import { defineConfig } from "@neon/config/v1";

/**
 * Neon policy for Vidya.
 * Postgres is always on every branch. NestJS + Prisma use:
 *   DATABASE_URL           → pooled (app runtime / Vercel)
 *   DATABASE_URL_UNPOOLED  → direct (prisma migrate; aliased to DIRECT_URL)
 *
 * Local Docker Postgres stays in `.env` (see .env.example) for pgAdmin.
 * Production/preview use Neon via Vercel env or `neon env pull` → `.env.local`.
 */
export default defineConfig({
  auth: false,
  branch: (branch) => {
    if (branch.isDefault) {
      return {};
    }
    if (!branch.exists) {
      return { ttl: "7d" };
    }
    return {};
  },
});
