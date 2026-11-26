"use client";

import { getFontFamily, getSectionSpacing } from "@/lib/design-tokens";
import { Portfolio, PortfolioSectionKey } from "@/types/portfolio";
import { HeroSection } from "./sections/hero-section";
import { AboutSection } from "./sections/about-section";
import { SkillsSection } from "./sections/skills-section";
import { ExperienceSection } from "./sections/experience-section";
import { ProjectsSection } from "./sections/projects-section";
import { ContactSection } from "./sections/contact-section";
import { DecorationsLayer } from "./decorations-layer";
import { AmbientBackground } from "@/components/portfolio/ambient-background";
import { SelectableSection } from "./selectable-section";
import { useEditorChrome } from "./editor-chrome-context";

export interface ResolvedBackdrop {
  url?: string;
  intensity: number;
  focusX: number;
  focusY: number;
  zoom: number;
}

/** Stable per-section offset into the inspiration-image cycle — independent of render order. */
const SECTION_AUTO_OFFSET: Partial<Record<PortfolioSectionKey, number>> = {
  about: 1,
  skills: 2,
  experience: 3,
  projects: 4,
  contact: 5,
};

interface PortfolioTemplateProps {
  /** The canonical portfolio to render. This component reads only from this prop — never from Zustand — so it can render with or without a generator wizard/editor around it. */
  portfolio: Portfolio;
}

/**
 * The "default" template — the only one that exists today, registered as
 * `"default"` in features/portfolio/templates/registry.ts. Renders purely
 * from the `portfolio` prop: content, appearance, section order/visibility/
 * backgrounds/animations all come from there. Any inline-editing capability
 * comes from a `PortfolioEditProvider` an ancestor may have set up — this
 * component never touches the store directly (see
 * features/portfolio/portfolio-editor-context.tsx).
 */
export function PortfolioTemplate({ portfolio }: PortfolioTemplateProps) {
  const { resume: resumeData } = portfolio.content;
  const tokens = portfolio.appearance.tokens;
  const { order, visibility, backgrounds, animations, copy: sectionCopy } = portfolio.sections;
  const decorations = portfolio.appearance.decorations;
  const inspirationImages = portfolio.appearance.inspirationImages;
  const chrome = useEditorChrome();
  const isEditing = Boolean(chrome && chrome.mode === "edit");

  const spacing = getSectionSpacing(tokens.layoutDensity);
  // Missing key = visible; a section only disappears once explicitly set to `false`. Hero can't be hidden.
  const isVisible = (key: PortfolioSectionKey) => key === "hero" || visibility[key] !== false;

  // Thread the whole moodboard through the page instead of a dedicated gallery:
  // every section below the hero gets a different uploaded image as a quiet
  // backdrop, cycling through whatever was provided (falls back to the single
  // primary image when only one was uploaded) — unless the person picked a
  // specific image (or explicitly "none") for that section in the sidebar.
  // Each section can also carry its own blur/crop, falling back to the global
  // appearance.tokens background blur/crop values when it doesn't set its own.
  const pick = (offset: number) =>
    inspirationImages.length > 0 ? inspirationImages[offset % inspirationImages.length] : undefined;

  const backdropFor = (key: PortfolioSectionKey): ResolvedBackdrop => {
    const override = backgrounds[key];
    return {
      url: override ? override.url || undefined : pick(SECTION_AUTO_OFFSET[key] ?? 0),
      intensity: override?.blur ?? tokens.backgroundBlur,
      focusX: override?.focusX ?? tokens.backgroundFocusX,
      focusY: override?.focusY ?? tokens.backgroundFocusY,
      zoom: override?.zoom ?? tokens.backgroundZoom,
    };
  };

  const renderSection = (key: PortfolioSectionKey, index: number) => {
    const hidden = !isVisible(key);
    // Outside the editor (or in Preview mode), a hidden section is fully
    // absent — that's the whole point of "hidden". While actively editing,
    // keep it mounted (dimmed, with a restore control) so it stays reachable.
    if (hidden && !isEditing) return null;

    const animationOverride = animations[key];
    let content: React.ReactNode;

    switch (key) {
      case "hero":
        content = <HeroSection resumeData={resumeData} tokens={tokens} animationOverride={animationOverride} />;
        break;
      case "about":
        content = (
          <AboutSection
            resumeData={resumeData}
            tokens={tokens}
            sectionCopy={sectionCopy}
            backdrop={backdropFor(key)}
            animationOverride={animationOverride}
          />
        );
        break;
      case "skills":
        content = (
          <SkillsSection
            resumeData={resumeData}
            tokens={tokens}
            sectionCopy={sectionCopy}
            backdrop={backdropFor(key)}
            animationOverride={animationOverride}
          />
        );
        break;
      case "experience":
        content = (
          <ExperienceSection
            resumeData={resumeData}
            tokens={tokens}
            sectionCopy={sectionCopy}
            backdrop={backdropFor(key)}
            animationOverride={animationOverride}
          />
        );
        break;
      case "projects":
        content = (
          <ProjectsSection
            resumeData={resumeData}
            tokens={tokens}
            sectionCopy={sectionCopy}
            backdrop={backdropFor(key)}
            animationOverride={animationOverride}
          />
        );
        break;
      case "contact":
        content = (
          <ContactSection
            resumeData={resumeData}
            tokens={tokens}
            sectionCopy={sectionCopy}
            backdrop={backdropFor(key)}
            animationOverride={animationOverride}
          />
        );
        break;
      default:
        return null;
    }

    return (
      <SelectableSection key={key} sectionKey={key} isFirst={index === 0} isLast={index === order.length - 1} isHidden={hidden}>
        {content}
      </SelectableSection>
    );
  };

  return (
    <div
      className="relative min-h-full w-full"
      style={
        {
          fontFamily: getFontFamily(tokens.typographyStyle),
          background: tokens.backgroundColor,
          color: "#F5F3EE",
          "--p-section-padding": spacing.sectionPadding,
          "--p-gap": spacing.gap,
        } as React.CSSProperties
      }
    >
      <AmbientBackground tokens={tokens} />
      {order.map(renderSection)}
      <DecorationsLayer decorations={decorations} />
    </div>
  );
}

