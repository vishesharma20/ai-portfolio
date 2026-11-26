"use client";

import { Portfolio, PortfolioSectionKey } from "@/types/portfolio";
import { TemplateShell } from "./shared/template-shell";
import { TemplateSectionList } from "./shared/template-section-list";

interface Props {
  /** The canonical portfolio to render. Reads only this prop — never Zustand, never the database — so it renders identically with or without an editor around it. */
  portfolio: Portfolio;
}

/** Cinematic's own natural section order (Stage 6 requirement 6) — used only when the person hasn't explicitly reordered sections; an explicit reorder always wins. */
const CINEMATIC_DEFAULT_ORDER: PortfolioSectionKey[] = ["hero", "about", "projects", "experience", "skills", "contact"];

/**
 * Dark editorial aesthetic: large type, a dramatic full-bleed hero, and
 * alternating-luminance panels with a large faint ordinal marker behind
 * each section — the kind of premium, image/visual-forward layout a
 * creative developer, motion designer, or AI engineer would reach for.
 *
 * Composes the exact same section components every other template does
 * (Hero/About/Skills/Experience/Projects/Contact) — nothing about resume
 * content, add/remove handlers, or inline editing is reimplemented here.
 * Only the framing around each section, the default order, and the hero's
 * headline treatment differ.
 */
export function CinematicTemplate({ portfolio }: Props) {
  return (
    <TemplateShell portfolio={portfolio}>
      <TemplateSectionList
        portfolio={portfolio}
        defaultOrder={CINEMATIC_DEFAULT_ORDER}
        heroVariant="cinematic"
        wrapSection={({ sectionKey, index, content }) => {
          if (sectionKey === "hero") return content;
          return (
            <div className={index % 2 === 0 ? "relative border-t border-white/10" : "relative border-t border-white/10 bg-black/20"}>
              <span
                aria-hidden
                className="pointer-events-none absolute left-4 top-4 select-none font-display text-[8rem] font-bold leading-none opacity-[0.04] sm:left-8 sm:text-[11rem]"
              >
                {String(index).padStart(2, "0")}
              </span>
              {content}
            </div>
          );
        }}
      />
    </TemplateShell>
  );
}
