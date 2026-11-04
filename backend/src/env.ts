import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Resolve project root `.env` / `.env.local` files whether running from root or backend/.
 */
export function rootEnvFilePaths(): string[] {
  const candidates = [
    // Project root when running from backend/
    resolve(process.cwd(), "..", ".env"),
    resolve(process.cwd(), "..", ".env.local"),
    // Project root when running from workspace root
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), ".env.local"),
    // Inside backend folder itself
    resolve(process.cwd(), "backend", ".env"),
    resolve(process.cwd(), "backend", ".env.local"),
    // 2 levels up (in case running from nested subfolder)
    resolve(process.cwd(), "../..", ".env"),
    resolve(process.cwd(), "../..", ".env.local"),
  ];

  // Return unique existing file paths
  const existing = Array.from(new Set(candidates)).filter((p) => existsSync(p));
  return existing;
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
