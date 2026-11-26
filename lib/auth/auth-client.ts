"use client";

import { createAuthClient } from "better-auth/react";

/**
 * The client-side counterpart to lib/auth/auth.ts — talks to the
 * /api/auth/* routes. Used from Client Components: login/signup forms, the
 * logout button, the dashboard user menu. Server Components and Server
 * Actions use lib/auth/current-user.ts instead, never this.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
