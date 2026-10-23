#!/usr/bin/env node
/** Cross-platform psql against local Vidya Postgres. Usage: npm run db:psql */
import { spawnSync, execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { platform } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IS_WIN = platform() === "win32";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
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
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(join(ROOT, ".env"));
loadEnvFile(join(ROOT, ".env.local"));

const PG_USER = process.env.DB_USERNAME || "vidya";
const PG_PASSWORD = process.env.DB_PASSWORD || "vidya";
const PG_DB = process.env.DB_NAME || "vidya";
const PG_HOST = process.env.DB_HOST || "127.0.0.1";
const PG_PORT =
  process.env.DB_PORT || process.env.VIDYA_PG_PORT || "5432";
const PG_VERSION = process.env.VIDYA_PG_VERSION || "17";
const extra = process.argv.slice(2);

function have(cmd) {
  try {
    execFileSync(IS_WIN ? "where" : "which", [cmd], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function ensurePath() {
  if (have("psql")) return;
  if (IS_WIN) {
    for (const ver of [PG_VERSION, "16", "15", "14"]) {
      const bin = `C:\\Program Files\\PostgreSQL\\${ver}\\bin`;
      if (existsSync(join(bin, "psql.exe"))) {
        process.env.PATH = `${bin};${process.env.PATH || ""}`;
        return;
      }
    }
  }
  if (platform() === "darwin" && have("brew")) {
    try {
      const prefix = execFileSync("brew", ["--prefix", `postgresql@${PG_VERSION}`], {
        encoding: "utf8",
      }).trim();
      process.env.PATH = `${join(prefix, "bin")}:${process.env.PATH || ""}`;
    } catch {
      /* ignore */
    }
  }
}

ensurePath();
if (!have("psql")) {
  console.error("psql not found. Install PostgreSQL and re-run npm start.");
  process.exit(1);
}

const result = spawnSync(
  "psql",
  ["-h", PG_HOST, "-p", PG_PORT, "-U", PG_USER, "-d", PG_DB, ...extra],
  {
    stdio: "inherit",
    env: { ...process.env, PGPASSWORD: PG_PASSWORD },
    shell: IS_WIN,
  }
);
process.exit(result.status ?? 1);
