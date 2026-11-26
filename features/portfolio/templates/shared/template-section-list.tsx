"use client";

import { ReactNode } from "react";
import { Portfolio, PortfolioSectionKey } from "@/types/portfolio";
import { HeroVariant } from "../../sections/hero-section";
import { SelectableSection } from "../../selectable-section";
import { useEditorChrome } from "../../editor-chrome-context";
import { useSectionRuntime, resolveSectionOrder } from "./section-runtime";
import { renderSectionContent } from "./render-section-content";

interface TemplateSectionListProps {
  portfolio: Portfolio;
  /** This template's natural section order — only used when the person hasn't explicitly reordered sections (see resolveSectionOrder). */
  defaultOrder: PortfolioSectionKey[];
  /** Optional layout class for templates that need a parent grid. */
  listClassName?: string;
  /** Optional class for the outer selectable wrapper of each section. */
  sectionClassName?: (sectionKey: PortfolioSectionKey, index: number) => string;
  /** Purely visual hero-headline treatment; every other section is unaffected. */
  heroVariant: HeroVariant;
  /**
   * Lets each template give its sections their own frame (borders, cards,
   * ordinal markers, glass panels, ...) without re-implementing order
   * resolution, visibility, or the section dispatch itself. `content` is
   * already the fully-built section element; just wrap it.
   */
  wrapSection?: (args: { sectionKey: PortfolioSectionKey; index: number; isFirst: boolean; isLast: boolean; content: ReactNode }) => ReactNode;
}

/**
 * The part of "render this portfolio's sections" that's identical across
 * every template except "minimal" (which predates this extraction and is
 * left as-is — see the doc comment on portfolio-template.tsx): resolve
 * order, resolve visibility, resolve each section's backdrop, dispatch to
 * the right section component, and wrap the result in `SelectableSection`
 * so it stays selectable/reorderable/hideable in the editor exactly like
 * every other template.
 */
export function TemplateSectionList({ portfolio, defaultOrder, heroVariant, wrapSection, listClassName, sectionClassName }: TemplateSectionListProps) {
  const tokens = portfolio.appearance.tokens;
  const { isVisible, backdropFor } = useSectionRuntime(portfolio);
  const chrome = useEditorChrome();
  const isEditing = Boolean(chrome && chrome.mode === "edit");
  const order = resolveSectionOrder(portfolio, defaultOrder);

  const sections = order.map((key, index) => {
        const hidden = !isVisible(key);
        if (hidden && !isEditing) return null;

        const content = renderSectionContent({
          sectionKey: key,
          resumeData: portfolio.content.resume,
          tokens,
          sectionCopy: portfolio.sections.copy,
          backdrop: backdropFor(key),
          animationOverride: portfolio.sections.animations[key],
          heroVariant,
        });

        const isFirst = index === 0;
        const isLast = index === order.length - 1;
        const wrapped = wrapSection ? wrapSection({ sectionKey: key, index, isFirst, isLast, content }) : content;

        return (
        <SelectableSection key={key} sectionKey={key} isFirst={isFirst} isLast={isLast} isHidden={hidden} className={sectionClassName?.(key, index)}>
            {wrapped}
          </SelectableSection>
        );
      });

  return listClassName ? <div className={listClassName}>{sections}</div> : <>{sections}</>;
}
