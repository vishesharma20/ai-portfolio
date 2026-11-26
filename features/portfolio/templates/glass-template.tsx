"use client";

import { Portfolio, PortfolioSectionKey, DEFAULT_SECTION_ORDER } from "@/types/portfolio";
import { TemplateShell } from "./shared/template-shell";
import { TemplateSectionList } from "./shared/template-section-list";

interface Props {
  /** The canonical portfolio to render. Reads only this prop — never Zustand, never the database — so it renders identically with or without an editor around it. */
  portfolio: Portfolio;
}

/** Glass doesn't ask for a different natural order than the canonical default. An explicit reorder still always wins (see resolveSectionOrder). */
const GLASS_DEFAULT_ORDER: PortfolioSectionKey[] = [...DEFAULT_SECTION_ORDER];

/**
 * Modern and futuristic: every non-hero section floats as its own
 * translucent, blurred, layered panel over a soft ambient glow — depth
 * through stacked glass surfaces rather than hard edges. Composes the same
 * shared section components as every other template; only the framing,
 * layered background glow, and hero headline treatment differ.
 */
export function GlassTemplate({ portfolio }: Props) {
  const tokens = portfolio.appearance.tokens;

  return (
    <TemplateShell portfolio={portfolio}>
      {/* Layered ambient glow behind the glass panels — purely decorative, ignores pointer events. */}
      <div aria-hidden className="pointer-events-none absolute left-1/4 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full opacity-25 blur-[120px]" style={{ background: tokens.primaryColor }} />
      <div aria-hidden className="pointer-events-none absolute right-0 top-[65%] h-80 w-80 rounded-full opacity-20 blur-[110px]" style={{ background: tokens.accentColor }} />

      <TemplateSectionList
        portfolio={portfolio}
        defaultOrder={GLASS_DEFAULT_ORDER}
        heroVariant="glass"
        wrapSection={({ sectionKey, content }) => {
          if (sectionKey === "hero") return content;
          return (
            <div className="px-4 py-6 sm:px-8">
              <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.04] shadow-[0_8px_40px_-8px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                {content}
              </div>
            </div>
          );
        }}
      />
    </TemplateShell>
  );
}
