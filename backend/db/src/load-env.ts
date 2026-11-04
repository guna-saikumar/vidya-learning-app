import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Load root `.env` / `.env.local` into process.env (no-op if already set). */
export function loadRootEnv(cwd = process.cwd()): void {
  const candidates = [
    // 2 levels up (when running from backend/db)
    resolve(cwd, "../..", ".env"),
    resolve(cwd, "../..", ".env.local"),
    // 1 level up (when running from backend)
    resolve(cwd, "..", ".env"),
    resolve(cwd, "..", ".env.local"),
    // current directory (when running from root)
    resolve(cwd, ".env"),
    resolve(cwd, ".env.local"),
  ];

  for (const path of Array.from(new Set(candidates))) {
    if (!existsSync(path)) continue;
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
}
