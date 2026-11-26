import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db/client";
import * as authSchema from "@/lib/db/auth-schema";

/**
 * The single Better Auth server instance. Everything that needs to check or
 * mutate authentication state goes through this — API routes
 * (app/api/auth/[...all]/route.ts) and lib/auth/current-user.ts are the only
 * two places that import it directly.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  session: {
    // Server re-validates against the database on every protected request
    // (lib/auth/current-user.ts) rather than trusting the cookie alone.
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh the expiry once per day of activity
  },
});
