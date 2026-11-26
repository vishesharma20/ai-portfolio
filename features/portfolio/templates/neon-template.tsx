"use client";

import { DEFAULT_SECTION_ORDER, Portfolio } from "@/types/portfolio";
import { TemplateShell } from "./shared/template-shell";
import { TemplateSectionList } from "./shared/template-section-list";

export function NeonTemplate({ portfolio }: { portfolio: Portfolio }) {
  const { primaryColor, accentColor } = portfolio.appearance.tokens;
  return (
    <TemplateShell portfolio={portfolio} className="neon-layout">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] opacity-30" style={{ background: `radial-gradient(ellipse at 50% 0%, ${primaryColor}55, transparent 65%)` }} />
      <TemplateSectionList
        portfolio={portfolio}
        defaultOrder={[...DEFAULT_SECTION_ORDER]}
        heroVariant="brutalist"
        wrapSection={({ sectionKey, index, content }) => {
          if (sectionKey === "hero") return <div className="border-b border-dashed border-white/20">{content}</div>;
          return (
            <div className="mx-auto max-w-6xl px-4 py-5 sm:px-8 sm:py-8">
              <div className="relative overflow-hidden rounded-2xl border border-dashed bg-black/25" style={{ borderColor: `${accentColor}75`, boxShadow: `0 0 36px -24px ${accentColor}` }}>
                <span aria-hidden className="absolute right-4 top-2 font-mono text-5xl font-bold opacity-[0.08] sm:right-8 sm:text-7xl">{String(index).padStart(2, "0")}</span>
                {content}
              </div>
            </div>
          );
        }}
      />
    </TemplateShell>
  );
}
