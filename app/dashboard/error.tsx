"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Scoped to /dashboard/** — if one portfolio's data is broken enough to escape its own render boundary, this keeps the crash from taking the rest of the app's chrome (nav, etc.) down with it. */
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[dashboard/error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="h-9 w-9 text-destructive" />
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Something went wrong loading this page</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Nothing you&apos;ve saved has been affected. You can try again or head back to your portfolios.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
        <Button asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
