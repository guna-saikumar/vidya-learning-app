import path from "node:path";
import fs from "node:fs";
import { config } from "dotenv";

/** contact-us/api/.env, then the shared contact-us/.env next to it. */
export const envFilePaths = () => [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
];

/** Load env before Nest reads process.env (idempotent). */
export function loadEnv() {
  for (const file of envFilePaths()) {
    if (fs.existsSync(file)) config({ path: file, override: false });
  }
}
