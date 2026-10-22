import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Resolve monorepo-root env files so Nest can run from apps/api.
 * Order: `.env` (local Docker) then `.env.local` (neon deploy).
 * First defined value wins, so local Docker wins over Neon when both exist.
 */
export function rootEnvFilePaths(): string[] {
  const root = resolve(process.cwd(), "../..");
  return [resolve(root, ".env"), resolve(root, ".env.local")].filter((p) =>
    existsSync(p)
  );
}

function loadEnvFile(path: string): void {
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

/** Load root `.env` / `.env.local` into process.env (no-op if already set). */
export function loadRootEnv(): void {
  for (const path of rootEnvFilePaths()) {
    loadEnvFile(path);
  }
}

/** Map Neon CLI vars onto Prisma's DIRECT_URL when needed. */
export function applyDatabaseEnvAliases(): void {
  if (!process.env.DIRECT_URL && process.env.DATABASE_URL_UNPOOLED) {
    process.env.DIRECT_URL = process.env.DATABASE_URL_UNPOOLED;
  }
  if (!process.env.DATABASE_URL_UNPOOLED && process.env.DIRECT_URL) {
    process.env.DATABASE_URL_UNPOOLED = process.env.DIRECT_URL;
  }
  // Local Docker: same URL for pooled + direct
  if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
    process.env.DIRECT_URL = process.env.DATABASE_URL;
  }
}
