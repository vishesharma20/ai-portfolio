"use client";

import { Portfolio, PortfolioSectionKey, DEFAULT_SECTION_ORDER } from "@/types/portfolio";
import { TemplateShell } from "./shared/template-shell";
import { TemplateSectionList } from "./shared/template-section-list";

interface Props {
  /** The canonical portfolio to render. Reads only this prop — never Zustand, never the database — so it renders identically with or without an editor around it. */
  portfolio: Portfolio;
}

/** Brutalist doesn't ask for a different natural order than the canonical default — its identity is typographic/structural, not sequential. An explicit reorder still always wins (see resolveSectionOrder). */
const BRUTALIST_DEFAULT_ORDER: PortfolioSectionKey[] = [...DEFAULT_SECTION_ORDER];

/**
 * High-contrast, grid-driven, intentionally raw: thick hard-edged borders
 * between sections, a large printed-looking ordinal + section label in the
 * corner of every section, no rounded corners, no soft shadows. Composes
 * the same shared section components as every other template; only the
 * framing, and the hero's headline treatment, differ.
 */
export function BrutalistTemplate({ portfolio }: Props) {
  return (
    <TemplateShell portfolio={portfolio} className="brutalist-grid">
      <TemplateSectionList
        portfolio={portfolio}
        defaultOrder={BRUTALIST_DEFAULT_ORDER}
        heroVariant="brutalist"
        wrapSection={({ sectionKey, index, content }) => {
          if (sectionKey === "hero") {
            return <div className="border-b-4 border-[#F5F3EE]">{content}</div>;
          }
          return (
            <div className="relative border-b-4 border-[#F5F3EE]">
              <div className="pointer-events-none absolute left-0 top-0 flex items-center gap-2 border-b-4 border-r-4 border-[#F5F3EE] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em]">
                <span>{String(index).padStart(2, "0")}</span>
                <span className="opacity-50">/</span>
                <span className="opacity-70">{sectionKey}</span>
              </div>
              {content}
            </div>
          );
        }}
      />
    </TemplateShell>
  );
}
