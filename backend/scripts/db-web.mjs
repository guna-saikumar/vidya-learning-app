#!/usr/bin/env node
/**
 * Starts PostgreSQL if needed, applies migrations, and launches pgweb
 * with the browser UI automatically opened.
 *
 * Usage: npm run dev:db (or npm run db)
 */
import { spawn, spawnSync, execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { platform } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const IS_WIN = platform() === "win32";
const IS_MAC = platform() === "darwin";

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
loadEnvFile(join(ROOT, "backend/.env"));

const PG_USER = process.env.DB_USERNAME || "vidya";
const PG_PASSWORD = process.env.DB_PASSWORD || "vidya";
const PG_DB = process.env.DB_NAME || "vidya";
const PG_HOST = process.env.DB_HOST || "127.0.0.1";
const PG_PORT = process.env.DB_PORT || process.env.VIDYA_PG_PORT || "5432";
const PGWEB_PORT = process.env.VIDYA_PGWEB_PORT || "8083";

function have(cmd) {
  try {
    execFileSync(IS_WIN ? "where" : "which", [cmd], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function pgIsReady() {
  if (!have("pg_isready")) return false;
  try {
    execFileSync("pg_isready", ["-h", PG_HOST, "-p", String(PG_PORT)], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

async function ensurePostgres() {
  if (pgIsReady()) {
    console.log(`✓ PostgreSQL is running on :${PG_PORT}`);
    return;
  }

  console.log(`Starting PostgreSQL service on :${PG_PORT}…`);
  if (IS_MAC && have("brew")) {
    try {
      execFileSync("brew", ["services", "start", "postgresql@17"], { stdio: "inherit" });
    } catch {
      try {
        execFileSync("brew", ["services", "start", "postgresql"], { stdio: "inherit" });
      } catch (err) {
        console.warn("Could not start postgres via brew services.");
      }
    }
  }

  // Wait a few seconds for PG to respond
  for (let i = 0; i < 15; i++) {
    if (pgIsReady()) {
      console.log(`✓ PostgreSQL is ready on :${PG_PORT}`);
      return;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.warn(`Note: Could not verify PostgreSQL on :${PG_PORT}. If pgweb fails to connect, please ensure PostgreSQL is running.`);
}

async function main() {
  await ensurePostgres();

  if (!have("pgweb")) {
    if (IS_MAC && have("brew")) {
      console.log("Installing pgweb via Homebrew…");
      try {
        execFileSync("brew", ["install", "pgweb"], { stdio: "inherit" });
      } catch {
        console.error("Could not install pgweb automatically. Run: brew install pgweb");
        process.exit(1);
      }
    } else {
      console.error("pgweb is not installed. Please install pgweb (brew install pgweb).");
      process.exit(1);
    }
  }

  const dbUrl =
    process.env.DATABASE_URL ||
    `postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}`;

  console.log("\n=======================================================");
  console.log("  Vidya Database Web UI (pgweb)");
  console.log(`  Opening browser: http://localhost:${PGWEB_PORT}`);
  console.log(`  Database URL:    ${dbUrl.replace(/:[^:]*@/, ":****@")}`);
  console.log("  Press Ctrl+C to stop.");
  console.log("=======================================================\n");

  const child = spawn(
    "pgweb",
    [
      "--bind=0.0.0.0",
      `--listen=${PGWEB_PORT}`,
      "--url",
      dbUrl,
      // Leaving out --skip-open so pgweb automatically opens browser!
    ],
    { stdio: "inherit" }
  );

  child.on("exit", (code) => {
    process.exit(code || 0);
  });
}

main().catch((err) => {
  console.error("Failed to run database web UI:", err);
  process.exit(1);
});

