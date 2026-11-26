import "server-only";
import { randomUUID } from "crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { portfolios, PortfolioRow } from "./schema";
import { Portfolio, portfolioSchema } from "@/types/portfolio";
import { createEmptyPortfolio } from "@/lib/portfolio/defaults";

/**
 * The database service layer — the only place in the app that runs a query
 * against the `portfolios`/`users` tables. Every function here:
 *   1. Requires an `ownerId` and filters by it — ownership is enforced in
 *      the query itself, not checked afterwards, so there's no path that
 *      accidentally skips it.
 *   2. Validates with `portfolioSchema` at the boundary — parsed strictly
 *      (throws) on write, parsed leniently (falls back rather than crashes)
 *      on read, per the read/write validation split the architecture calls
 *      for.
 *
 * Nothing outside `lib/db/` and `lib/db/actions.ts` should import `db` or
 * the `portfolios`/`users` tables directly.
 */

export interface PortfolioSummary {
  id: string;
  slug: string;
  name: string;
  status: Portfolio["metadata"]["status"];
  updatedAt: string;
}

/**
 * Reassembles a canonical `Portfolio` from a DB row. The `data` JSONB blob
 * holds content/appearance/sections/template; id/slug/name/status/timestamps
 * are always re-derived from the row's own columns rather than trusted from
 * inside the blob, so those two representations can never silently drift —
 * the columns are what ownership checks, uniqueness, and listing rely on.
 *
 * If `data` fails validation (corrupted row, manual edit, schema evolved
 * incompatibly), this falls back to an empty portfolio body rather than
 * throwing — a broken row should degrade to "an empty portfolio with the
 * right identity", not take down the page that loads it.
 */
function rowToPortfolio(row: PortfolioRow): Portfolio {
  const parsed = portfolioSchema.safeParse(row.data);
  const base = parsed.success ? parsed.data : createEmptyPortfolio();
  return {
    ...base,
    metadata: {
      ...base.metadata,
      id: row.id,
      slug: row.slug,
      name: row.name,
      status: row.status === "published" ? "published" : "draft",
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    },
  };
}

function summaryFromRow(row: Pick<PortfolioRow, "id" | "slug" | "name" | "status" | "updatedAt">): PortfolioSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status === "published" ? "published" : "draft",
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Creates a new portfolio row owned by `ownerId`, seeded from `initial` (defaults to a blank portfolio via createEmptyPortfolio()). The DB assigns the real id — any placeholder id/slug/timestamps on `initial` are overwritten. */
export async function createPortfolio(ownerId: string, initial?: Portfolio): Promise<Portfolio> {
  const id = randomUUID();
  const now = new Date();
  const seed = initial ?? createEmptyPortfolio();
  const name = seed.content.resume.name.trim() || "Untitled portfolio";

  const portfolio: Portfolio = {
    ...seed,
    metadata: { ...seed.metadata, id, slug: id, name, createdAt: now.toISOString(), updatedAt: now.toISOString() },
  };
  const validated = portfolioSchema.parse(portfolio);

  const [row] = await db
    .insert(portfolios)
    .values({
      id,
      ownerId,
      slug: validated.metadata.slug,
      name: validated.metadata.name,
      status: validated.metadata.status,
      data: validated,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return rowToPortfolio(row);
}

/** Loads one portfolio by id — returns `null` if it doesn't exist OR belongs to a different owner. Callers must treat both cases identically (a 404, not a 403) to avoid leaking whether an id exists. */
export async function getPortfolio(id: string, ownerId: string): Promise<Portfolio | null> {
  const row = await db.query.portfolios.findFirst({
    where: and(eq(portfolios.id, id), eq(portfolios.ownerId, ownerId)),
  });
  return row ? rowToPortfolio(row) : null;
}

/** Lists every portfolio owned by `ownerId`, most recently updated first. Returns lightweight summaries (no `data` blob) — the dashboard doesn't need full content for every card. */
export async function getUserPortfolios(ownerId: string): Promise<PortfolioSummary[]> {
  const rows = await db.query.portfolios.findMany({
    where: eq(portfolios.ownerId, ownerId),
    orderBy: [desc(portfolios.updatedAt)],
  });
  return rows.map(summaryFromRow);
}

/** Updates an existing portfolio's content, preserving id/slug/createdAt regardless of what `updated` contains — those must never change on a routine save. Returns `null` if the portfolio doesn't exist or isn't owned by `ownerId`. */
export async function updatePortfolio(id: string, ownerId: string, updated: Portfolio): Promise<Portfolio | null> {
  const existing = await db.query.portfolios.findFirst({
    where: and(eq(portfolios.id, id), eq(portfolios.ownerId, ownerId)),
  });
  if (!existing) return null;

  const now = new Date();
  const name = updated.content.resume.name.trim() || "Untitled portfolio";
  const finalPortfolio: Portfolio = {
    ...updated,
    metadata: {
      ...updated.metadata,
      id: existing.id,
      slug: existing.slug,
      name,
      createdAt: existing.createdAt.toISOString(),
      updatedAt: now.toISOString(),
    },
  };
  const validated = portfolioSchema.parse(finalPortfolio);

  const [row] = await db
    .update(portfolios)
    .set({ name: validated.metadata.name, status: validated.metadata.status, data: validated, updatedAt: now })
    .where(and(eq(portfolios.id, id), eq(portfolios.ownerId, ownerId)))
    .returning();

  return row ? rowToPortfolio(row) : null;
}

/** Deletes a portfolio. Returns whether a row was actually deleted (false if it didn't exist or wasn't owned by `ownerId`) so callers can tell a no-op from a real deletion. */
export async function deletePortfolio(id: string, ownerId: string): Promise<boolean> {
  const result = await db
    .delete(portfolios)
    .where(and(eq(portfolios.id, id), eq(portfolios.ownerId, ownerId)))
    .returning({ id: portfolios.id });
  return result.length > 0;
}
