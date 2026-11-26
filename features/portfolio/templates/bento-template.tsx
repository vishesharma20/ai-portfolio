"use client";

import { DEFAULT_SECTION_ORDER, Portfolio } from "@/types/portfolio";
import { TemplateShell } from "./shared/template-shell";
import { TemplateSectionList } from "./shared/template-section-list";

export function BentoTemplate({ portfolio }: { portfolio: Portfolio }) {
  return (
    <TemplateShell portfolio={portfolio}>
      <TemplateSectionList
        portfolio={portfolio}
        defaultOrder={[...DEFAULT_SECTION_ORDER]}
        heroVariant="glass"
        listClassName="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-8 sm:px-8 lg:grid-cols-12 lg:gap-6"
        sectionClassName={(sectionKey) => {
          if (sectionKey === "hero" || sectionKey === "contact") return "lg:col-span-12";
          if (sectionKey === "skills" || sectionKey === "projects") return "lg:col-span-5";
          return "lg:col-span-7";
        }}
        wrapSection={({ sectionKey, content }) => {
          if (sectionKey === "hero") return <div className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">{content}</div>;
          return (
            <div className="h-full min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] shadow-[0_20px_70px_-45px_rgba(0,0,0,0.8)] transition-colors hover:bg-white/[0.065]">
              {content}
            </div>
          );
        }}
      />
    </TemplateShell>
  );
}
