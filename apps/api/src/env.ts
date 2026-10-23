import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Resolve monorepo-root `.env` so Nest can run from apps/api.
 * Local-only: prefer root `.env` (created by `npm start` / scripts/local.sh).
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
