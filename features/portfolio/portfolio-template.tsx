"use client";

import { ResumeData } from "@/types/resume";
import { DesignTokens } from "@/types/design-tokens";
import { getFontFamily, getSectionSpacing } from "@/lib/design-tokens";
import { useGeneratorStore, PortfolioSectionKey } from "@/lib/store/generator-store";
import { HeroSection } from "./sections/hero-section";
import { AboutSection } from "./sections/about-section";
import { SkillsSection } from "./sections/skills-section";
import { ExperienceSection } from "./sections/experience-section";
import { ProjectsSection } from "./sections/projects-section";
import { ContactSection } from "./sections/contact-section";
import { DecorationsLayer } from "./decorations-layer";
import { AmbientBackground } from "@/components/portfolio/ambient-background";

export interface ResolvedBackdrop {
  url?: string;
  intensity: number;
  focusX: number;
  focusY: number;
  zoom: number;
}

interface PortfolioTemplateProps {
  resumeData: ResumeData;
  tokens: DesignTokens;
  /** All uploaded inspiration images (optional — the live editor passes these; a bare template usage can omit them). */
  inspirationImages?: string[];
}

export function PortfolioTemplate({ resumeData, tokens, inspirationImages = [] }: PortfolioTemplateProps) {
  const spacing = getSectionSpacing(tokens.layoutDensity);
  const sectionBackgrounds = useGeneratorStore((s) => s.sectionBackgrounds);
  const sectionVisibility = useGeneratorStore((s) => s.sectionVisibility);
  // Missing key = visible; a section only disappears once explicitly set to `false`.
  const isVisible = (key: PortfolioSectionKey) => sectionVisibility[key] !== false;

  // Thread the whole moodboard through the page instead of a dedicated gallery:
  // every section below the hero gets a different uploaded image as a quiet
  // backdrop, cycling through whatever was provided (falls back to the single
  // primary image when only one was uploaded) — unless the person picked a
  // specific image (or explicitly "none") for that section in the sidebar.
  // Each section can also carry its own blur/crop, falling back to the global
  // Design > Background blur/crop values when it doesn't set its own.
  const pick = (offset: number) =>
    inspirationImages.length > 0 ? inspirationImages[offset % inspirationImages.length] : undefined;

  const backdropFor = (key: PortfolioSectionKey, autoOffset: number): ResolvedBackdrop => {
    const override = sectionBackgrounds[key];
    return {
      url: override ? override.url || undefined : pick(autoOffset),
      intensity: override?.blur ?? tokens.backgroundBlur,
      focusX: override?.focusX ?? tokens.backgroundFocusX,
      focusY: override?.focusY ?? tokens.backgroundFocusY,
      zoom: override?.zoom ?? tokens.backgroundZoom,
    };
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
      <HeroSection resumeData={resumeData} tokens={tokens} />
      {isVisible("about") && <AboutSection resumeData={resumeData} tokens={tokens} backdrop={backdropFor("about", 1)} />}
      {isVisible("skills") && <SkillsSection resumeData={resumeData} tokens={tokens} backdrop={backdropFor("skills", 2)} />}
      {isVisible("experience") && (
        <ExperienceSection resumeData={resumeData} tokens={tokens} backdrop={backdropFor("experience", 3)} />
      )}
      {isVisible("projects") && <ProjectsSection resumeData={resumeData} tokens={tokens} backdrop={backdropFor("projects", 4)} />}
      {isVisible("contact") && <ContactSection resumeData={resumeData} tokens={tokens} backdrop={backdropFor("contact", 5)} />}
      <DecorationsLayer />
    </div>
  );
}
