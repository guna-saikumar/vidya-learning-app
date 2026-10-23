import { Pool } from "pg";

export const createPool = (connectionString?: string) =>
  new Pool({
    connectionString: connectionString ?? process.env.DATABASE_URL,
  });

export { Pool };
