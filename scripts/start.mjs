#!/usr/bin/env node
/**
 * Cross-platform local stack — no Docker.
 *
 *   npm start
 *
 * macOS / Linux / Windows: native Postgres + migrate/seed + pgweb (if installed)
 * + Nest API + student Expo (LAN). Auto-detects LAN IP (no typing).
 */
import { spawn, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { networkInterfaces, platform } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IS_WIN = platform() === "win32";
const IS_MAC = platform() === "darwin";
const IS_LINUX = platform() === "linux";

const PG_USER = "vidya";
const PG_PASSWORD = "vidya";
const PG_DB = "vidya";
const PG_PORT = Number(process.env.VIDYA_PG_PORT || 5432);
const PG_VERSION = process.env.VIDYA_PG_VERSION || "17";
const API_PORT = Number(process.env.PORT || 4000);
const PGWEB_PORT = Number(process.env.VIDYA_PGWEB_PORT || 8083);
const EXPO_PORT = Number(process.env.VIDYA_EXPO_PORT || 8081);

/** @type {import('node:child_process').ChildProcess[]} */
const children = [];
let shuttingDown = false;

function have(cmd) {
  try {
    execFileSync(IS_WIN ? "where" : "which", [cmd], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, {
    cwd: opts.cwd ?? ROOT,
    encoding: "utf8",
    stdio: opts.stdio ?? "pipe",
    env: { ...process.env, ...opts.env },
    shell: opts.shell ?? false,
  });
}

function detectLanIp() {
  if (process.env.VIDYA_DEV_HOST) return process.env.VIDYA_DEV_HOST;
  const nets = networkInterfaces();
  const preferred = [];
  const fallback = [];
  for (const [name, list] of Object.entries(nets)) {
    for (const net of list || []) {
      const family = net.family;
      if ((family !== "IPv4" && family !== 4) || net.internal) continue;
      if (/en\d|eth|wlan|wifi|wi-fi|ethernet|local area/i.test(name)) {
        preferred.push(net.address);
      } else {
        fallback.push(net.address);
      }
    }
  }
  return preferred[0] || fallback[0] || "127.0.0.1";
}

function detectLanHost(lanIp) {
  if (process.env.VIDYA_LAN_HOST) return process.env.VIDYA_LAN_HOST;
  if (IS_MAC) {
    try {
      const mdns = sh("scutil", ["--get", "LocalHostName"]).trim();
      if (mdns) return `${mdns}.local`;
    } catch {
      /* ignore */
    }
  }
  return lanIp;
}

function pgIsReady() {
  if (!have("pg_isready")) return false;
  try {
    sh("pg_isready", ["-h", "127.0.0.1", "-p", String(PG_PORT)], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function ensurePsqlOnPath() {
  if (have("psql") && have("pg_isready")) return;

  if (IS_MAC && have("brew")) {
    try {
      const prefix = sh("brew", ["--prefix", `postgresql@${PG_VERSION}`]).trim();
      const bin = join(prefix, "bin");
      if (existsSync(bin)) {
        process.env.PATH = `${bin}:${process.env.PATH || ""}`;
      }
    } catch {
      /* ignore */
    }
  }

  if (IS_WIN) {
    for (const ver of [PG_VERSION, "16", "15", "14"]) {
      const bin = `C:\\Program Files\\PostgreSQL\\${ver}\\bin`;
      if (existsSync(join(bin, "psql.exe"))) {
        process.env.PATH = `${bin};${process.env.PATH || ""}`;
        break;
      }
    }
  }

  if (IS_LINUX) {
    for (const bin of [
      `/usr/lib/postgresql/${PG_VERSION}/bin`,
      "/usr/lib/postgresql/16/bin",
      "/usr/bin",
    ]) {
      if (existsSync(join(bin, "psql"))) {
        process.env.PATH = `${bin}:${process.env.PATH || ""}`;
        break;
      }
    }
  }

  if (!have("psql")) {
    throw new Error(
      [
        "psql not found. Install native PostgreSQL, then re-run npm start:",
        IS_MAC ? "  brew install postgresql@17 && brew services start postgresql@17" : null,
        IS_LINUX ? "  sudo apt install postgresql postgresql-contrib" : null,
        IS_WIN
          ? "  https://www.postgresql.org/download/windows/ (add bin/ to PATH)"
          : null,
      ]
        .filter(Boolean)
        .join("\n")
    );
  }
}

async function startPostgresService() {
  if (pgIsReady()) {
    console.log(`Postgres already accepting connections on :${PG_PORT}.`);
    return;
  }

  console.log("Starting Postgres...");
  if (IS_MAC && have("brew")) {
    try {
      sh("brew", ["list", `postgresql@${PG_VERSION}`], { stdio: "ignore" });
    } catch {
      console.log(`Installing postgresql@${PG_VERSION} via Homebrew...`);
      sh("brew", ["install", `postgresql@${PG_VERSION}`], { stdio: "inherit" });
    }
    sh("brew", ["services", "start", `postgresql@${PG_VERSION}`], {
      stdio: "inherit",
    });
  } else if (IS_LINUX) {
    try {
      sh("systemctl", ["start", "postgresql"], { stdio: "inherit" });
    } catch {
      try {
        sh("sudo", ["systemctl", "start", "postgresql"], { stdio: "inherit" });
      } catch {
        console.warn("Could not start postgresql via systemctl.");
      }
    }
  } else if (IS_WIN) {
    for (const name of [
      `postgresql-x64-${PG_VERSION}`,
      "postgresql-x64-16",
      "postgresql-x64-15",
      "postgresql-x64-14",
    ]) {
      try {
        sh("net", ["start", name], { stdio: "ignore", shell: true });
        break;
      } catch {
        /* try next */
      }
    }
  }

  for (let i = 0; i < 45; i++) {
    if (pgIsReady()) {
      console.log("Postgres is ready.");
      return;
    }
    await sleep(1000);
  }
  throw new Error(
    `Timed out waiting for Postgres on :${PG_PORT}. Start the PostgreSQL service, then re-run npm start.`
  );
}

function psqlAs(user, db, sql, password = "") {
  return sh(
    "psql",
    [
      "-h",
      "127.0.0.1",
      "-p",
      String(PG_PORT),
      "-U",
      user,
      "-d",
      db,
      "-v",
      "ON_ERROR_STOP=1",
      "-Atc",
      sql,
    ],
    { env: { PGPASSWORD: password } }
  ).trim();
}

function ensureRoleAndDb() {
  console.log(`Ensuring role '${PG_USER}' and database '${PG_DB}'...`);

  try {
    sh(
      "psql",
      [
        "-h",
        "127.0.0.1",
        "-p",
        String(PG_PORT),
        "-U",
        PG_USER,
        "-d",
        PG_DB,
        "-Atc",
        "SELECT 1",
      ],
      { stdio: "ignore", env: { PGPASSWORD: PG_PASSWORD } }
    );
    console.log(`Database ${PG_DB} is reachable as ${PG_USER}.`);
    return;
  } catch {
    /* need bootstrap */
  }

  const superCandidates = IS_WIN
    ? ["postgres"]
    : [process.env.USER, "postgres"].filter(Boolean);
  const superPass = process.env.VIDYA_PG_SUPER_PASSWORD || process.env.PGPASSWORD || "";

  let superUser = null;
  for (const u of superCandidates) {
    try {
      sh(
        "psql",
        ["-h", "127.0.0.1", "-p", String(PG_PORT), "-U", u, "-d", "postgres", "-Atc", "SELECT 1"],
        { stdio: "ignore", env: { PGPASSWORD: superPass } }
      );
      superUser = u;
      break;
    } catch {
      /* next */
    }
  }

  if (!superUser) {
    throw new Error(
      [
        "Cannot connect to Postgres to create the vidya role/database.",
        IS_WIN
          ? "Set VIDYA_PG_SUPER_PASSWORD to your postgres user password, then re-run npm start."
          : "Ensure your OS user can connect locally (peer/trust), then re-run.",
      ].join("\n")
    );
  }

  const roleExists = psqlAs(
    superUser,
    "postgres",
    `SELECT 1 FROM pg_roles WHERE rolname='${PG_USER}'`,
    superPass
  );
  if (roleExists !== "1") {
    psqlAs(
      superUser,
      "postgres",
      `CREATE USER ${PG_USER} WITH PASSWORD '${PG_PASSWORD}' CREATEDB;`,
      superPass
    );
  } else {
    psqlAs(
      superUser,
      "postgres",
      `ALTER USER ${PG_USER} WITH PASSWORD '${PG_PASSWORD}';`,
      superPass
    );
  }

  const dbExists = psqlAs(
    superUser,
    "postgres",
    `SELECT 1 FROM pg_database WHERE datname='${PG_DB}'`,
    superPass
  );
  if (dbExists !== "1") {
    psqlAs(superUser, "postgres", `CREATE DATABASE ${PG_DB} OWNER ${PG_USER};`, superPass);
  } else {
    psqlAs(superUser, "postgres", `ALTER DATABASE ${PG_DB} OWNER TO ${PG_USER};`, superPass);
  }

  sh(
    "psql",
    ["-h", "127.0.0.1", "-p", String(PG_PORT), "-U", PG_USER, "-d", PG_DB, "-c", "SELECT 1;"],
    { stdio: "ignore", env: { PGPASSWORD: PG_PASSWORD } }
  );
  console.log(`Database ${PG_DB} is reachable as ${PG_USER}.`);
}

function configurePostgresLan() {
  try {
    const conf = psqlAs(PG_USER, PG_DB, "SHOW config_file;", PG_PASSWORD);
    if (!conf || !existsSync(conf)) return;
    let text = readFileSync(conf, "utf8");
    if (/^\s*listen_addresses\s*=/m.test(text)) {
      text = text.replace(/^\s*listen_addresses\s*=.*/m, "listen_addresses = '*'");
    } else {
      text += "\nlisten_addresses = '*'\n";
    }
    try {
      writeFileSync(conf, text);
    } catch {
      return;
    }
    try {
      psqlAs(PG_USER, PG_DB, "SELECT pg_reload_conf();", PG_PASSWORD);
    } catch {
      /* ignore */
    }
    console.log("Postgres config updated for LAN (listen_addresses=*).");
  } catch {
    /* optional */
  }
}

function writeEnv(lanIp, lanHost) {
  const localDb = `postgresql://${PG_USER}:${PG_PASSWORD}@127.0.0.1:${PG_PORT}/${PG_DB}`;
  const apiUrl = `http://${lanIp}:${API_PORT}`;
  const jwt = process.env.JWT_SECRET || "dev-only-jwt-secret-change-me";

  writeFileSync(
    join(ROOT, ".env"),
    [
      "# Auto-generated by npm start — do not type a LAN IP; re-run npm start to refresh.",
      `DATABASE_URL="${localDb}"`,
      `PORT=${API_PORT}`,
      `JWT_SECRET="${jwt}"`,
      `VIDYA_DEV_HOST="${lanIp}"`,
      `VIDYA_LAN_HOST="${lanHost}"`,
      `EXPO_PUBLIC_API_URL="${apiUrl}"`,
      `NEXT_PUBLIC_API_URL="${apiUrl}"`,
      "",
    ].join("\n")
  );

  const mobileDir = join(ROOT, "apps/student-mobile");
  mkdirSync(mobileDir, { recursive: true });
  writeFileSync(
    join(mobileDir, ".env"),
    [
      "# Auto-generated by npm start — API host detected; no manual LAN IP.",
      `EXPO_PUBLIC_API_URL="${apiUrl}"`,
      "",
    ].join("\n")
  );
  writeFileSync(
    join(mobileDir, ".env.local"),
    [
      "# Auto-generated by npm start — LAN packager host (Expo requires .local).",
      `REACT_NATIVE_PACKAGER_HOSTNAME="${lanIp}"`,
      "",
    ].join("\n")
  );

  process.env.DATABASE_URL = localDb;
  process.env.JWT_SECRET = jwt;
  process.env.VIDYA_DEV_HOST = lanIp;
  process.env.VIDYA_LAN_HOST = lanHost;
  process.env.EXPO_PUBLIC_API_URL = apiUrl;
  process.env.REACT_NATIVE_PACKAGER_HOSTNAME = lanIp;
  process.env.EXPO_NO_TELEMETRY = "1";
  delete process.env.SMTP_HOST;
}

function ensureDeps() {
  if (!have("pnpm")) {
    throw new Error(
      "pnpm is required. Run: corepack enable && corepack prepare pnpm@8.15.8 --activate"
    );
  }
  if (!existsSync(join(ROOT, "node_modules"))) {
    console.log("Installing dependencies...");
    sh("pnpm", ["install"], { stdio: "inherit", shell: IS_WIN });
  }
}

function migrateAndSeed() {
  console.log("Running SQL migrations...");
  sh("pnpm", ["--dir", "packages/db", "migrate"], {
    stdio: "inherit",
    shell: IS_WIN,
  });
  console.log("Seeding demo data...");
  sh("pnpm", ["--dir", "packages/db", "seed"], {
    stdio: "inherit",
    shell: IS_WIN,
  });
}

function ensurePgweb() {
  if (have("pgweb")) return true;
  if (IS_MAC && have("brew")) {
    console.log("Installing pgweb via Homebrew...");
    try {
      sh("brew", ["install", "pgweb"], { stdio: "inherit" });
    } catch {
      /* ignore */
    }
  }
  return have("pgweb");
}

function spawnProc(label, cmd, args) {
  const child = spawn(cmd, args, {
    cwd: ROOT,
    env: process.env,
    stdio: "inherit",
    shell: IS_WIN,
    windowsHide: true,
  });
  child.on("exit", (code, signal) => {
    if (!shuttingDown && code && code !== 0) {
      console.error(`[${label}] exited (${signal || code})`);
    }
  });
  children.push(child);
  return child;
}

function killTree(child) {
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

function cleanup() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("\nStopping API / Expo / pgweb...");
  for (const child of children) killTree(child);
}

function startServices(lanIp, lanHost) {
  const localDb = `postgresql://${PG_USER}:${PG_PASSWORD}@127.0.0.1:${PG_PORT}/${PG_DB}`;
  const shareDb = `postgresql://${PG_USER}:${PG_PASSWORD}@${lanHost}:${PG_PORT}/${PG_DB}`;
  const shareApi = `http://${lanHost}:${API_PORT}`;
  const pgwebUrl = `http://${lanHost}:${PGWEB_PORT}`;
  const expoUrl = `http://${lanIp}:${EXPO_PORT}`;

  console.log(`Starting API on 0.0.0.0:${API_PORT}...`);
  spawnProc("api", "pnpm", ["--dir", "apps/api", "dev"]);

  if (ensurePgweb()) {
    console.log(`Starting pgweb on 0.0.0.0:${PGWEB_PORT}...`);
    spawnProc("pgweb", "pgweb", [
      "--bind=0.0.0.0",
      `--listen=${PGWEB_PORT}`,
      "--url",
      localDb,
      "--skip-open",
      "--lock-session",
    ]);
  } else {
    console.warn(
      "pgweb not found — DB UI skipped. Releases: https://github.com/sosedoff/pgweb/releases"
    );
  }

  console.log(`Starting student Expo (LAN) on :${EXPO_PORT}...`);
  spawnProc("expo", "pnpm", [
    "--dir",
    "apps/student-mobile",
    "exec",
    "expo",
    "start",
    "--lan",
    "--port",
    String(EXPO_PORT),
  ]);

  console.log(`
==> Vidya local stack (${platform()} — native, no Docker)
  Detected IP:   ${lanIp}
  Share host:    ${lanHost}

  API:           ${shareApi}     (docs: ${shareApi}/docs)
  Postgres:      ${shareDb}
  psql:          npm run db:psql
  DB UI:         ${pgwebUrl}     (pgweb)
  Student Expo:  ${expoUrl}

  Login:         student@vidya.test / StudentDemo1!
  Ctrl+C stops API, pgweb, and Expo.
`);
}

async function main() {
  console.log(
    "==> Vidya: Postgres + API + student app + pgweb (cross-platform, no Docker)"
  );
  const lanIp = detectLanIp();
  const lanHost = detectLanHost(lanIp);
  console.log(`Auto-detected LAN IP: ${lanIp}`);
  if (lanHost !== lanIp) console.log(`Share hostname:     ${lanHost}`);

  process.on("SIGINT", () => {
    cleanup();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    cleanup();
    process.exit(0);
  });

  ensurePsqlOnPath();
  await startPostgresService();
  ensureRoleAndDb();
  configurePostgresLan();
  writeEnv(lanIp, lanHost);
  ensureDeps();
  migrateAndSeed();
  startServices(lanIp, lanHost);

  await new Promise(() => {});
}

main().catch((err) => {
  console.error(err?.message || err);
  cleanup();
  process.exit(1);
});
