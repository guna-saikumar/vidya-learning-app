import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, types, type PoolClient, type QueryResultRow } from "pg";

/**
 * `TIMESTAMP(3)` columns (Prisma `DateTime`) hold UTC wall-clock values without a
 * zone. `pg` would otherwise parse them as local time, so force UTC.
 */
const TIMESTAMP_OID = 1114;
const DATE_OID = 1082;
const parseUtcTimestamp = (value: string) => new Date(`${value.replace(" ", "T")}Z`);

/** SQL fragment for "now" in UTC, matching how Prisma stores `DateTime`. */
export const SQL_NOW_UTC = "(NOW() AT TIME ZONE 'UTC')";

/** `Date` params become ISO strings so `timestamp` casts never depend on the local zone. */
const normalizeParam = (value: unknown): unknown =>
  value instanceof Date ? value.toISOString() : value;

export type DbQueryResult<T> = { rows: T[]; rowCount: number };

@Injectable()
export class DbService implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    types: {
      getTypeParser: (oid: number, format?: "text" | "binary") => {
        if (oid === TIMESTAMP_OID) return parseUtcTimestamp;
        // `date` columns are returned as plain `YYYY-MM-DD` strings.
        if (oid === DATE_OID) return (value: string) => value;
        return types.getTypeParser(oid, format as "text");
      },
    },
  });

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: unknown[] = []
  ): Promise<DbQueryResult<T>> {
    const result = await this.pool.query<T>(sql, params.map(normalizeParam));
    return { rows: result.rows, rowCount: result.rowCount ?? 0 };
  }

  async queryOne<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: unknown[] = []
  ): Promise<T | null> {
    const { rows } = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  /** Runs `fn` in a transaction; commits on success, rolls back on error. */
  async tx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}

/** Helper for queries run inside `DbService.tx` on a raw client. */
export const clientQuery = async <T extends QueryResultRow = QueryResultRow>(
  client: PoolClient,
  sql: string,
  params: unknown[] = []
): Promise<DbQueryResult<T>> => {
  const result = await client.query<T>(sql, params.map(normalizeParam));
  return { rows: result.rows, rowCount: result.rowCount ?? 0 };
};
