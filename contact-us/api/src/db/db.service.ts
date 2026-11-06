import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type PoolConfig, type QueryResultRow } from "pg";

export type DbQueryResult<T> = { rows: T[]; rowCount: number };

function poolConfigFromEnv(): PoolConfig {
  const host = process.env.DB_HOST?.trim();
  const user = process.env.DB_USER?.trim() ?? process.env.DB_USERNAME?.trim();
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME?.trim();
  if (host && user && password !== undefined && database) {
    return {
      host,
      port: Number(process.env.DB_PORT?.trim() || 5432),
      user,
      password,
      database,
    };
  }
  const connectionString = process.env.DATABASE_URL?.trim();
  if (connectionString) return { connectionString };
  throw new Error(
    "Database config missing. Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME (or DATABASE_URL)."
  );
}

@Injectable()
export class DbService implements OnModuleDestroy {
  private readonly pool = new Pool(poolConfigFromEnv());

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: unknown[] = []
  ): Promise<DbQueryResult<T>> {
    const result = await this.pool.query<T>(sql, params);
    return { rows: result.rows, rowCount: result.rowCount ?? 0 };
  }

  async queryOne<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: unknown[] = []
  ): Promise<T | null> {
    const { rows } = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
