/**
 * Database connection.
 *
 * - With DATABASE_URL set (production, e.g. Supabase): Postgres via postgres.js.
 *   DB_SCHEMA puts the site's tables in their own schema, out of reach of
 *   Supabase's public web API.
 * - Without it (your computer): an embedded Postgres (PGlite) stored in .pglite/,
 *   so the site runs with no setup. Delete .pglite/ to start fresh.
 *
 * Tables are created and filled with first-run content automatically.
 */
import "server-only";
import { sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";
import { DDL } from "./ddl";
import { seed } from "./seed";

export type DB = PgDatabase<PgQueryResultHKT, typeof schema>;

const g = globalThis as unknown as { __cmsDb?: Promise<DB> };

function schemaName(): string | null {
  const name = (process.env.DB_SCHEMA ?? "").trim();
  if (!name) return null;
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error("DB_SCHEMA may only contain letters, numbers and underscores");
  }
  return name;
}

async function connect(): Promise<DB> {
  const url = process.env.DATABASE_URL;
  const dbSchema = schemaName();
  let db: DB;

  if (url) {
    const { default: postgres } = await import("postgres");
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const client = postgres(url, {
      max: 5,
      // Supabase's transaction pooler (port 6543) does not support prepared statements.
      prepare: false,
      connection: dbSchema ? { search_path: dbSchema } : undefined,
    });
    db = drizzle(client, { schema }) as unknown as DB;
    if (dbSchema) await db.execute(sql.raw(`CREATE SCHEMA IF NOT EXISTS "${dbSchema}"`));
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const client = new PGlite(process.env.PGLITE_DIR || "./.pglite");
    db = drizzle(client, { schema }) as unknown as DB;
  }

  for (const statement of DDL.split(";").map((s) => s.trim()).filter(Boolean)) {
    await db.execute(sql.raw(statement));
  }
  await seed(db);
  return db;
}

/** The shared database handle. The first call creates tables and seeds content. */
export function getDb(): Promise<DB> {
  if (!g.__cmsDb) {
    g.__cmsDb = connect().catch((err) => {
      g.__cmsDb = undefined; // let the next request try again
      throw err;
    });
  }
  return g.__cmsDb;
}

export { schema };
