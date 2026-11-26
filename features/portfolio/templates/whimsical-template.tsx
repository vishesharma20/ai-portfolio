"use client";

import { PortfolioSectionKey } from "@/types/portfolio";
import { TemplateShell } from "./shared/template-shell";
import { TemplateSectionList } from "./shared/template-section-list";

interface Props {
  portfolio: import("@/types/portfolio").Portfolio;
}

/** Whimsical's own natural section order (Stage 6 requirement 6) — used only when the person hasn't explicitly reordered sections. */
const WHIMSICAL_DEFAULT_ORDER: PortfolioSectionKey[] = ["hero", "about", "skills", "projects", "experience", "contact"];

/**
 * Friendly, rounded, personality-driven — soft accent blobs, gently rounded
 * section cards, and a playful (never childish) hero. Composes the exact
 * same section components every template does; only the framing, default
 * order, and hero headline treatment differ.
 */
export function WhimsicalTemplate({ portfolio }: Props) {
  const tokens = portfolio.appearance.tokens;

  return (
    <TemplateShell portfolio={portfolio}>
      {/* Soft decorative blobs — purely ambient, ignore pointer events, respect the same "plain" opt-out other ambient chrome does by just being very low-opacity. */}
      <div aria-hidden className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full opacity-20 blur-[90px]" style={{ background: tokens.primaryColor }} />
      <div aria-hidden className="pointer-events-none absolute -right-20 top-[60%] h-80 w-80 rounded-full opacity-20 blur-[100px]" style={{ background: tokens.accentColor }} />

      <TemplateSectionList
        portfolio={portfolio}
        defaultOrder={WHIMSICAL_DEFAULT_ORDER}
        heroVariant="whimsical"
        wrapSection={({ sectionKey, content }) =>
          sectionKey === "hero" ? (
            content
          ) : (
            <div className="px-4 py-6 sm:px-8">
              <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.03] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]">
                {content}
              </div>
            </div>
          )
        }
      />
    </TemplateShell>
  );
}
