import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/auth";

/**
 * Mounts every Better Auth endpoint (sign-in, sign-up, sign-out, session,
 * etc.) under /api/auth/*. The auth client (lib/auth/auth-client.ts) talks
 * to these routes; nothing else should call better-auth's HTTP API directly.
 */
export const { GET, POST } = toNextJsHandler(auth);
