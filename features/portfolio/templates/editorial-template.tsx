"use client";

import { Portfolio, PortfolioSectionKey } from "@/types/portfolio";
import { TemplateShell } from "./shared/template-shell";
import { TemplateSectionList } from "./shared/template-section-list";

const EDITORIAL_ORDER: PortfolioSectionKey[] = ["hero", "about", "experience", "projects", "skills", "contact"];

export function EditorialTemplate({ portfolio }: { portfolio: Portfolio }) {
  const accent = portfolio.appearance.tokens.accentColor;
  return (
    <TemplateShell portfolio={portfolio} className="editorial-layout">
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-[42rem] w-full bg-gradient-to-b from-white/[0.035] to-transparent" />
      <TemplateSectionList
        portfolio={portfolio}
        defaultOrder={EDITORIAL_ORDER}
        heroVariant="cinematic"
        wrapSection={({ sectionKey, index, content }) => {
          if (sectionKey === "hero") return <div className="border-b border-white/10">{content}</div>;
          return (
            <article className="relative mx-auto max-w-5xl border-l border-white/15 py-5 pl-6 sm:py-10 sm:pl-12">
              <span aria-hidden className="absolute -left-[1.05rem] top-12 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-background text-[10px] font-semibold" style={{ color: accent }}>
                {String(index).padStart(2, "0")}
              </span>
              <div className="overflow-hidden rounded-r-2xl border-y border-white/10 bg-white/[0.02]">
                {content}
              </div>
            </article>
          );
        }}
      />
    </TemplateShell>
  );
}
