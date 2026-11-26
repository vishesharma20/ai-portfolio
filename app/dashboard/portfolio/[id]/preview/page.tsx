import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { getPortfolio } from "@/lib/db/portfolios";
import { PortfolioRenderer } from "@/features/portfolio/portfolio-renderer";
import { PortfolioRenderErrorBoundary } from "@/features/portfolio/portfolio-render-error-boundary";

export const dynamic = "force-dynamic";

/**
 * A read-only render of a saved portfolio — no `editHandlers` passed to
 * `PortfolioRenderer`, so the entire render tree (template, sections,
 * decorations, EditableText) renders in its plain, non-interactive mode
 * with zero Zustand involvement. This is the same code path a future public
 * portfolio page would use; the only difference here is the ownership check
 * above it, since this route isn't public yet.
 */
export default async function PreviewPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/dashboard/portfolio/${id}/preview`);

  const portfolio = await getPortfolio(id, user.id);
  if (!portfolio) notFound();

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-2.5 backdrop-blur-lg">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </Link>
        <span className="text-xs text-muted-foreground">Preview — read-only</span>
        <Link
          href={`/dashboard/portfolio/${id}`}
          className="ml-auto text-xs font-medium text-primary hover:underline"
        >
          Edit this portfolio
        </Link>
      </div>
      <PortfolioRenderErrorBoundary>
        <PortfolioRenderer portfolio={portfolio} />
      </PortfolioRenderErrorBoundary>
    </div>
  );
}
