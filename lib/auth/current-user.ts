import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

/**
 * The one application-level authentication boundary. Every server-side
 * piece of the app that needs "the current user" — dashboard, editor,
 * preview pages, lib/db/actions.ts — calls one of these two functions
 * rather than importing `auth` or touching Better Auth's session API
 * directly. That's what keeps provider-specific code from spreading across
 * the app: if the auth provider ever changes, this file is the only one
 * that has to.
 *
 * Session validation happens server-side on every call — this re-checks
 * against the database-backed session (via Better Auth), it does not trust
 * the cookie's mere presence.
 */

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
}

/** Returns the signed-in user, or `null` if there isn't one. Never throws for "not logged in" — that's an expected, ordinary state. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  return { id: session.user.id, email: session.user.email, name: session.user.name };
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Not signed in.");
    this.name = "UnauthorizedError";
  }
}

/**
 * Returns the signed-in user's id, or throws `UnauthorizedError` if there
 * isn't one. Use this (not `getCurrentUser`) in places that should be
 * unreachable without a session — e.g. lib/db/actions.ts mutations, where
 * an unauthenticated call getting this far would itself be a bug worth
 * surfacing loudly rather than silently no-op-ing.
 */
export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user.id;
}
