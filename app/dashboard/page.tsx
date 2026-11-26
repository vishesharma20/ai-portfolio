import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { getUserPortfolios } from "@/lib/db/portfolios";
import { DashboardGrid } from "@/features/dashboard/dashboard-grid";
import { UserMenu } from "@/features/dashboard/user-menu";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const portfolios = await getUserPortfolios(user.id);

  return (
    <main className="min-h-screen">
      <header className="border-b border-border/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display text-sm font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-background"><Sparkles className="h-4 w-4" /></span>
            Portfolio AI
          </Link>
          <div className="flex items-center gap-3">
            <UserMenu email={user.email} />
            <Button size="sm" asChild><Link href="/generator"><Plus className="h-4 w-4" /> New portfolio</Link></Button>
          </div>
        </div>
      </header>
      <section className="container py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Your portfolios</h1>
          <p className="mt-2 text-sm text-muted-foreground">Pick up where you left off or start a new design.</p>
        </div>
        <DashboardGrid initialPortfolios={portfolios} />
      </section>
    </main>
  );
}
