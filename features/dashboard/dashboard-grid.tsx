"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortfolioSummary } from "@/lib/db/portfolios";
import { PortfolioCard } from "./portfolio-card";

/**
 * Client-side island so a delete can remove a card immediately without a
 * full page reload, while the initial list still comes from the server
 * (app/dashboard/page.tsx) — no client-side fetch-on-mount waterfall.
 */
export function DashboardGrid({ initialPortfolios }: { initialPortfolios: PortfolioSummary[] }) {
  const [portfolios, setPortfolios] = useState(initialPortfolios);

  const handleDeleted = (id: string) => {
    setPortfolios((prev) => prev.filter((p) => p.id !== id));
  };

  if (portfolios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-24 text-center">
        <p className="text-sm text-muted-foreground">You haven&apos;t created a portfolio yet.</p>
        <Button asChild>
          <Link href="/generator">
            <Plus className="h-4 w-4" /> Create your first portfolio
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {portfolios.map((p) => (
        <PortfolioCard key={p.id} portfolio={p} onDeleted={handleDeleted} />
      ))}

      <Link
        href="/generator"
        className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
      >
        <Plus className="h-6 w-6" />
        <span className="text-sm font-medium">Create Portfolio</span>
      </Link>
    </div>
  );
}
