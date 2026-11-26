import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Fast, cookie-presence-only pre-check for protected routes — this runs on
 * the edge before a page even starts rendering, so an obviously-logged-out
 * visitor gets redirected without a database round trip. This is *not* the
 * authoritative check: it only proves a session cookie exists, not that the
 * session is still valid. lib/auth/require-user.ts (called at the top of
 * every protected Server Component) does the real, database-backed
 * validation — this middleware is defense-in-depth on top of that, not a
 * replacement for it.
 */
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
