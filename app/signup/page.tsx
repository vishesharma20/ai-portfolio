import { Suspense } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AuthForm } from "@/features/auth/auth-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <Link href="/" className="flex items-center gap-2 font-display text-sm font-semibold">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-background">
          <Sparkles className="h-4 w-4" />
        </span>
        Portfolio AI
      </Link>

      <div className="w-full max-w-sm space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">Free to start. No profile setup, straight to your dashboard.</p>
      </div>

      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
