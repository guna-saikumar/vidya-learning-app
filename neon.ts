import { defineConfig } from "@neon/config/v1";

/**
 * Neon policy for Vidya (unused for local Homebrew Postgres).
 * Local: `npm start` / `.env` DATABASE_URL → postgresql://vidya:vidya@localhost:5432/vidya
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
