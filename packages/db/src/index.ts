import { Pool } from "pg";
import { getPoolConfig } from "./connection";

export { getDatabaseUrl, getPoolConfig } from "./connection";
export { loadRootEnv } from "./load-env";

export const createPool = (connectionString?: string) =>
  new Pool(
    connectionString
      ? { connectionString }
      : getPoolConfig()
  );

export { Pool };
