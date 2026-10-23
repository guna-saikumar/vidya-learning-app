import type { PoolConfig } from "pg";

/**
 * Build a `pg` pool config from discrete env fields
 * (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`).
 * Falls back to `DATABASE_URL` when present (e.g. Neon CI).
 */
export function getPoolConfig(env: NodeJS.ProcessEnv = process.env): PoolConfig {
  const host = env.DB_HOST?.trim();
  const user = env.DB_USERNAME?.trim();
  const password = env.DB_PASSWORD;
  const database = env.DB_NAME?.trim();
  const portRaw = env.DB_PORT?.trim();

  if (host && user && password !== undefined && database) {
    return {
      host,
      port: Number(portRaw || 5432),
      user,
      password,
      database,
    };
  }

  const connectionString = env.DATABASE_URL?.trim();
  if (connectionString) {
    return { connectionString };
  }

  throw new Error(
    "Database config missing. Set DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME (or DATABASE_URL)."
  );
}

/** Connection string for tools that need a URL (pgweb, logs). */
export function getDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const config = getPoolConfig(env);
  if (config.connectionString) {
    return config.connectionString;
  }
  const user = encodeURIComponent(config.user ?? "");
  const rawPassword =
    typeof config.password === "string" ? config.password : "";
  const password = encodeURIComponent(rawPassword);
  const host = config.host ?? "127.0.0.1";
  const port = config.port ?? 5432;
  const database = config.database ?? "";
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}
