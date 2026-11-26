"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Eye, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortfolioSummary } from "@/lib/db/portfolios";
import { deletePortfolioAction } from "@/lib/db/actions";
import { formatRelativeTime } from "@/lib/utils";

/**
 * One portfolio card on the dashboard. Delete requires a deliberate second
 * click (turns into "Confirm delete?" rather than firing immediately) so a
 * stray click never destroys work. On success the card removes itself from
 * the list via the parent's `onDeleted` callback — no full page reload.
 */
export function PortfolioCard({ portfolio, onDeleted }: { portfolio: PortfolioSummary; onDeleted: (id: string) => void }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deletePortfolioAction(portfolio.id);
      if (result.ok) {
        onDeleted(portfolio.id);
      } else {
        setError("Couldn't delete this portfolio. Try again.");
        setConfirmingDelete(false);
      }
    });
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 transition-colors hover:border-primary/40">
      <Link
        href={`/dashboard/portfolio/${portfolio.id}`}
        className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-primary/15 to-accent/10 text-4xl font-semibold text-foreground/20"
      >
        {(portfolio.name || "?").charAt(0).toUpperCase()}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium">{portfolio.name || "Untitled portfolio"}</h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
              portfolio.status === "published" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
            }`}
          >
            {portfolio.status}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Last edited {formatRelativeTime(portfolio.updatedAt)}</p>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" variant="outline" asChild className="flex-1">
            <Link href={`/dashboard/portfolio/${portfolio.id}`}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild className="flex-1">
            <Link href={`/dashboard/portfolio/${portfolio.id}/preview`}>
              <Eye className="h-3.5 w-3.5" /> Preview
            </Link>
          </Button>

          {!confirmingDelete ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirmingDelete(true)}
              aria-label="Delete portfolio"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
                aria-label="Confirm delete"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmingDelete(false)}
                disabled={isPending}
                aria-label="Cancel delete"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
