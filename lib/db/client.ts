import "server-only";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/**
 * Server-only Postgres connection. `import "server-only"` makes any
 * accidental import from a Client Component a build-time error rather than
 * a silent credential leak — DATABASE_URL never reaches the browser.
 *
 * A single Pool is reused across requests via a global in dev (Next.js hot
 * reload would otherwise open a fresh pool on every edit) and a plain
 * module-level singleton in production.
 */
declare global {
  var __pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and point it at a Postgres database."
    );
  }
  return new Pool({ connectionString });
}

const pool = globalThis.__pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalThis.__pgPool = pool;

export const db = drizzle(pool, { schema });
