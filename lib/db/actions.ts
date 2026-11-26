"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId, UnauthorizedError } from "@/lib/auth/current-user";
import { createPortfolio, updatePortfolio, deletePortfolio } from "@/lib/db/portfolios";
import { portfolioSchema } from "@/types/portfolio";

/**
 * Server Actions — the bridge Client Components use to reach the database
 * for mutations. Each one resolves the current user itself via
 * lib/auth/current-user.ts (never trusts a client-supplied ownerId) and
 * delegates straight to lib/db/portfolios.ts. Reads (listing, loading one
 * portfolio) happen directly in Server Components instead — see
 * app/dashboard/**\/page.tsx — since they're already running server-side
 * and don't need the extra RPC hop.
 */

export async function createPortfolioAction(): Promise<{ id: string } | { error: string }> {
  try {
    const userId = await getCurrentUserId();
    const portfolio = await createPortfolio(userId);
    revalidatePath("/dashboard");
    return { id: portfolio.metadata.id };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { error: "You're signed out. Please log in again." };
    return { error: "Couldn't create a new portfolio. Try again." };
  }
}

export interface SavePortfolioResult {
  ok: boolean;
  updatedAt?: string;
  error?: string;
}

export async function savePortfolioAction(id: string, data: unknown): Promise<SavePortfolioResult> {
  let userId: string;
  try {
    userId = await getCurrentUserId();
  } catch {
    return { ok: false, error: "You're signed out. Please log in again to keep saving." };
  }

  const parsed = portfolioSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "Portfolio data failed validation — nothing was saved." };
  }

  try {
    const saved = await updatePortfolio(id, userId, parsed.data);
    if (!saved) return { ok: false, error: "Portfolio not found." };
    revalidatePath("/dashboard");
    return { ok: true, updatedAt: saved.metadata.updatedAt };
  } catch {
    return { ok: false, error: "Save failed. Your changes are still here — try again." };
  }
}

export async function deletePortfolioAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    const ok = await deletePortfolio(id, userId);
    revalidatePath("/dashboard");
    return { ok };
  } catch {
    return { ok: false, error: "Couldn't delete this portfolio. Try again." };
  }
}

