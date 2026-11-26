"use client";

import { Portfolio } from "@/types/portfolio";
import { getTemplate } from "@/features/portfolio/templates/registry";
import { PortfolioEditProvider, PortfolioEditHandlers } from "@/features/portfolio/portfolio-editor-context";

interface PortfolioRendererProps {
  portfolio: Portfolio;
  /**
   * Pass this to make the render tree editable in place (the live editor
   * preview). Omit it — or don't render behind a provider at all — for a
   * read-only render: a public portfolio page, a static export, or a
   * server-rendered preview. Either way this is the same component tree;
   * only whether editing chrome shows up changes.
   */
  editHandlers?: PortfolioEditHandlers;
}

/**
 * The single, reusable entry point for turning a `Portfolio` object into
 * pixels. This is deliberately the only place that (a) knows the template
 * registry exists and (b) wires up edit handlers — every consumer just
 * renders `<PortfolioRenderer portfolio={...} />`:
 *
 *   - the live editor preview (features/generator/steps/step-editor-preview.tsx)
 *   - a future full-screen preview
 *   - a future public portfolio page
 *   - a future export/static-generation path
 *
 * all render through this one component. None of them — and nothing inside
 * the template/section tree it renders — ever imports the generator wizard
 * or Zustand directly.
 */
export function PortfolioRenderer({ portfolio, editHandlers }: PortfolioRendererProps) {
  const Template = getTemplate(portfolio.template.templateId).render;
  const tree = <Template portfolio={portfolio} />;

  if (!editHandlers) return tree;
  return <PortfolioEditProvider handlers={editHandlers}>{tree}</PortfolioEditProvider>;
}
