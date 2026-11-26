import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser, CurrentUser } from "@/lib/auth/current-user";

/**
 * Server-side route guard for protected pages. Redirects to /login
 * (preserving where the person was headed, via `next`) if there's no
 * session — this is the actual enforcement point Step 6 requires (server
 * component, runs before any protected data is fetched or rendered), not
 * just a client-side check that could be bypassed.
 */
export async function requireUser(currentPath: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }
  return user;
}
