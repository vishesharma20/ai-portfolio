import { ReactNode } from "react";
import { ResumeData } from "@/types/resume";
import { DesignTokens } from "@/types/design-tokens";
import { PortfolioSectionKey, SectionCopy } from "@/types/portfolio";
import { HeroSection, HeroVariant } from "../../sections/hero-section";
import { AboutSection } from "../../sections/about-section";
import { SkillsSection } from "../../sections/skills-section";
import { ExperienceSection } from "../../sections/experience-section";
import { ProjectsSection } from "../../sections/projects-section";
import { ContactSection } from "../../sections/contact-section";
import { ResolvedBackdrop } from "./section-runtime";

interface RenderSectionContentArgs {
  sectionKey: PortfolioSectionKey;
  resumeData: ResumeData;
  tokens: DesignTokens;
  sectionCopy: SectionCopy;
  backdrop: ResolvedBackdrop;
  animationOverride?: DesignTokens["animationStyle"];
  /** Purely visual hero-headline treatment (alignment/scale) — every other section stays byte-identical across templates; see hero-section.tsx. */
  heroVariant?: HeroVariant;
}

/**
 * The one place that maps a `PortfolioSectionKey` to its section component —
 * every template calls this instead of re-implementing the same switch,
 * so adding a 7th section later means editing this function once, not
 * every template.
 */
export function renderSectionContent({
  sectionKey,
  resumeData,
  tokens,
  sectionCopy,
  backdrop,
  animationOverride,
  heroVariant,
}: RenderSectionContentArgs): ReactNode {
  switch (sectionKey) {
    case "hero":
      return <HeroSection resumeData={resumeData} tokens={tokens} animationOverride={animationOverride} variant={heroVariant} />;
    case "about":
      return (
        <AboutSection
          resumeData={resumeData}
          tokens={tokens}
          sectionCopy={sectionCopy}
          backdrop={backdrop}
          animationOverride={animationOverride}
        />
      );
    case "skills":
      return (
        <SkillsSection
          resumeData={resumeData}
          tokens={tokens}
          sectionCopy={sectionCopy}
          backdrop={backdrop}
          animationOverride={animationOverride}
        />
      );
    case "experience":
      return (
        <ExperienceSection
          resumeData={resumeData}
          tokens={tokens}
          sectionCopy={sectionCopy}
          backdrop={backdrop}
          animationOverride={animationOverride}
        />
      );
    case "projects":
      return (
        <ProjectsSection
          resumeData={resumeData}
          tokens={tokens}
          sectionCopy={sectionCopy}
          backdrop={backdrop}
          animationOverride={animationOverride}
        />
      );
    case "contact":
      return (
        <ContactSection
          resumeData={resumeData}
          tokens={tokens}
          sectionCopy={sectionCopy}
          backdrop={backdrop}
          animationOverride={animationOverride}
        />
      );
    default:
      return null;
  }
}
