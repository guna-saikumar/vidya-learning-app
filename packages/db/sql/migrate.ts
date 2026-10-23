import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";

const migrationsDir = join(__dirname, "migrations");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_migrations" (
        "id" TEXT PRIMARY KEY,
        "applied_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Existing Prisma-managed DBs: stamp baseline so we don't re-run DDL.
    const { rows: userTable } = await client.query<{ exists: boolean }>(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'User'
      ) AS exists
    `);
    const { rows: applied } = await client.query<{ id: string }>(
      `SELECT "id" FROM "_migrations"`
    );
    const appliedSet = new Set(applied.map((r) => r.id));
    if (userTable[0]?.exists && !appliedSet.has("001_init.sql")) {
      await client.query(
        `INSERT INTO "_migrations" ("id") VALUES ($1) ON CONFLICT DO NOTHING`,
        ["001_init.sql"]
      );
      appliedSet.add("001_init.sql");
      console.log(
        "Stamped 001_init.sql (existing schema detected — skipping DDL)."
      );
    }

    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`skip ${file}`);
        continue;
      }
      const sql = readFileSync(join(migrationsDir, file), "utf8");
      console.log(`apply ${file}`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(`INSERT INTO "_migrations" ("id") VALUES ($1)`, [
          file,
        ]);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }
    console.log("Migrations complete.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
