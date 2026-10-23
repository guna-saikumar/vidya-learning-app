import { defineConfig } from "@neon/config/v1";

/**
 * Neon policy for Vidya (unused for local Homebrew Postgres).
 * Local: `npm start` / `.env` DB_HOST+DB_PORT+DB_USERNAME+DB_PASSWORD+DB_NAME
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
