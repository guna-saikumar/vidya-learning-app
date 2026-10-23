#!/usr/bin/env node
/** Cross-platform psql against local Vidya Postgres. Usage: npm run db:psql */
import { spawnSync, execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { platform } from "node:os";
import { join } from "node:path";

const IS_WIN = platform() === "win32";
const PG_USER = "vidya";
const PG_PASSWORD = "vidya";
const PG_DB = "vidya";
const PG_PORT = process.env.VIDYA_PG_PORT || "5432";
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
  ["-h", "127.0.0.1", "-p", PG_PORT, "-U", PG_USER, "-d", PG_DB, ...extra],
  {
    stdio: "inherit",
    env: { ...process.env, PGPASSWORD: PG_PASSWORD },
    shell: IS_WIN,
  }
);
process.exit(result.status ?? 1);
