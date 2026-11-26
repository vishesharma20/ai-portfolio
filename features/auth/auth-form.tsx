"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signIn, signUp } from "@/lib/auth/auth-client";

const emailSchema = z.string().trim().min(1, "Email is required").email("Enter a valid email address");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

interface Props {
  mode: "login" | "signup";
}

/**
 * Shared shell for /login and /signup — same fields, same validation
 * approach, just a different submit handler and a couple of copy swaps.
 * Client-side zod validation gives instant feedback; the actual
 * authoritative validation (email format, password strength, "does this
 * email already exist") happens server-side in Better Auth regardless of
 * what passes here.
 */
export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors: typeof fieldErrors = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) errors.email = emailResult.error.issues[0].message;
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) errors.password = passwordResult.error.issues[0].message;
    if (mode === "signup" && password !== confirmPassword) errors.confirmPassword = "Passwords don't match";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    const result =
      mode === "login"
        ? await signIn.email({ email, password })
        : await signUp.email({ email, password, name: email.split("@")[0] });

    setIsSubmitting(false);

    if (result.error) {
      setFormError(friendlyAuthError(result.error.message, mode));
      return;
    }

    router.push(next);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(fieldErrors.email)}
        />
        {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(fieldErrors.password)}
        />
        {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
      </div>

      {mode === "signup" && (
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
          />
          {fieldErrors.confirmPassword && <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>}
        </div>
      )}

      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === "login" ? "Log in" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href={`/signup${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-foreground hover:underline">
              Create account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={`/login${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-foreground hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

/** Better Auth's raw error messages are accurate but a bit terse/internal-sounding — soften the common ones for a normal user. */
function friendlyAuthError(message: string | undefined, mode: "login" | "signup"): string {
  const raw = (message || "").toLowerCase();
  if (raw.includes("invalid email or password") || raw.includes("invalid credentials")) {
    return "That email and password don't match our records.";
  }
  if (raw.includes("already exists") || raw.includes("already registered") || raw.includes("user already")) {
    return "An account with that email already exists — try logging in instead.";
  }
  if (raw.includes("password") && raw.includes("least")) {
    return "Password must be at least 8 characters.";
  }
  return mode === "login"
    ? "Couldn't log you in. Please check your details and try again."
    : "Couldn't create your account. Please try again.";
}
