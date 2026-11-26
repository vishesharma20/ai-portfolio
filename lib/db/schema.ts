import { pgTable, text, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

/**
 * The persistence schema. Deliberately minimal — the canonical `Portfolio`
 * object (types/portfolio.ts) is stored whole as JSONB rather than
 * normalized across dozens of relational tables. That object is already
 * the application-level contract (validated with Zod on every read/write in
 * lib/db/portfolios.ts); duplicating its fields into columns here would
 * just create a second source of truth to keep in sync for no real benefit
 * at this stage.
 *
 * Only the columns the *database* actually needs to know about — for
 * ownership, lookup, and listing without deserializing every JSON blob —
 * are broken out: id, ownerId, slug, name, status, timestamps.
 *
 * User identity lives in `auth-schema.ts` (Better Auth's `user` table) —
 * see lib/auth/current-user.ts. There used to be a standalone dev-only
 * `users` table here; it's gone (see scripts/migrate-dev-user.ts for how
 * any portfolios that belonged to it were reassigned to a real account).
 */

export const portfolios = pgTable("portfolios", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull().default("Untitled portfolio"),
  status: text("status").notNull().default("draft"), // "draft" | "published" — mirrors PortfolioStatus
  /** The full canonical Portfolio object (types/portfolio.ts), Zod-validated on every read and write. */
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PortfolioRow = typeof portfolios.$inferSelect;
export type NewPortfolioRow = typeof portfolios.$inferInsert;
