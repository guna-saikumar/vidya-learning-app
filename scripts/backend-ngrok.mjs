#!/usr/bin/env node
/**
 * Expose only the Nest API via ngrok and print a clean URL board.
 * Does not tunnel Expo, pgweb, or Postgres.
 *
 * Usage: npm run backend:ngrok
 */
import { spawn, execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IS_WIN = process.platform === "win32";

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

const API_PORT = Number(process.env.PORT || 4000);
const LOCAL_API = `http://127.0.0.1:${API_PORT}`;

function have(bin) {
  try {
    execFileSync(IS_WIN ? "where" : "which", [bin], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function apiHealthy() {
  try {
    const res = await fetch(`${LOCAL_API}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

async function ensureApi() {
  if (await apiHealthy()) {
    console.log(`  API already up on :${API_PORT}`);
    return null;
  }
  console.log(`  Starting API on :${API_PORT}…`);
  const child = spawn("pnpm", ["--dir", "apps/api", "dev"], {
    cwd: ROOT,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    shell: IS_WIN,
  });
  child.stdout?.on("data", (c) => {
    for (const line of c.toString().split(/\r?\n/)) {
      if (line) process.stdout.write(`[api] ${line}\n`);
    }
  });
  child.stderr?.on("data", (c) => {
    for (const line of c.toString().split(/\r?\n/)) {
      if (line) process.stderr.write(`[api] ${line}\n`);
    }
  });
  for (let i = 0; i < 60; i++) {
    if (await apiHealthy()) {
      console.log("  API ready");
      return child;
    }
    await sleep(1000);
  }
  throw new Error(`API did not become healthy at ${LOCAL_API}/health`);
}

async function waitForNgrokUrl(attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch("http://127.0.0.1:4040/api/tunnels");
      if (res.ok) {
        const data = await res.json();
        const tunnels = data?.tunnels ?? [];
        const https =
          tunnels.find((t) => t.public_url?.startsWith("https://")) ??
          tunnels[0];
        if (https?.public_url) return https.public_url.replace(/\/$/, "");
      }
    } catch {
      /* retry */
    }
    await sleep(500);
  }
  return null;
}

function printBoard(publicBase) {
  const line = (label, value) => `  ${label.padEnd(14)} ${value}`;
  console.log(`
┌─────────────────────────────────────────────────────────────
│  Vidya API  ·  ngrok
├─────────────────────────────────────────────────────────────
${line("Public API", publicBase)}
${line("Docs", `${publicBase}/docs`)}
${line("Health", `${publicBase}/health`)}
${line("OpenAPI", `${publicBase}/docs-json`)}
│
${line("Local API", LOCAL_API)}
${line("Local docs", `${LOCAL_API}/docs`)}
│
  Only the Nest API is tunneled (not Expo / pgweb / Postgres).
  Ctrl+C stops ngrok${publicBase ? " (and the API if we started it)" : ""}.
└─────────────────────────────────────────────────────────────
`);
}

function kill(child) {
  if (!child?.pid) return;
  try {
    if (IS_WIN) {
      execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } else {
      child.kill("SIGTERM");
    }
  } catch {
    try {
      child.kill("SIGKILL");
    } catch {
      /* ignore */
    }
  }
}

async function main() {
  console.log("==> npm run backend:ngrok — tunnel Nest API only");

  if (!have("ngrok")) {
    throw new Error(
      "ngrok not found. Install: https://ngrok.com/download (or `brew install ngrok`)"
    );
  }

  const apiChild = await ensureApi();

  console.log(`  Starting ngrok → ${LOCAL_API}`);
  const ngrok = spawn(
    "ngrok",
    ["http", String(API_PORT), "--log=stdout", "--log-format=term"],
    {
      cwd: ROOT,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: IS_WIN,
    }
  );

  let shuttingDown = false;
  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("\nStopping ngrok…");
    kill(ngrok);
    kill(apiChild);
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  ngrok.on("exit", (code) => {
    if (!shuttingDown) {
      console.error(`ngrok exited (${code ?? "?"})`);
      kill(apiChild);
      process.exit(code || 1);
    }
  });

  // Keep ngrok logs quiet until we have the URL; then only show errors.
  ngrok.stderr?.on("data", (c) => {
    const text = c.toString();
    if (/err|error|fail/i.test(text)) process.stderr.write(`[ngrok] ${text}`);
  });

  const publicUrl = await waitForNgrokUrl();
  if (!publicUrl) {
    kill(ngrok);
    kill(apiChild);
    throw new Error(
      "Could not read ngrok public URL from http://127.0.0.1:4040 — is another ngrok already running?"
    );
  }

  printBoard(publicUrl);
  await new Promise(() => {});
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
