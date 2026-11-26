"use client";

import { motion } from "framer-motion";
import { ResumeData } from "@/types/resume";
import { DesignTokens } from "@/types/design-tokens";
import { SectionCopy } from "@/types/portfolio";
import { hexToRgba } from "@/lib/design-tokens";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { EditableText } from "@/components/ui/editable-text";
import { SectionImageBackdrop } from "@/components/portfolio/section-image-backdrop";
import { usePortfolioEdit } from "@/features/portfolio/portfolio-editor-context";
import { cn } from "@/lib/utils";

interface Props {
  resumeData: ResumeData;
  tokens: DesignTokens;
  sectionCopy: SectionCopy;
  backdrop?: import("../portfolio-template").ResolvedBackdrop;
  animationOverride?: DesignTokens["animationStyle"];
}

export function AboutSection({ resumeData, tokens, sectionCopy, backdrop, animationOverride }: Props) {
  const motionCfg = useSectionMotion(animationOverride, tokens);
  const editCtx = usePortfolioEdit();
  const aboutLabel = sectionCopy.aboutLabel;

  return (
    <section className="relative flex min-h-[55vh] flex-col justify-center overflow-hidden px-6 py-[var(--p-section-padding)] sm:px-12">
      <SectionImageBackdrop
        src={backdrop?.url}
        backgroundColor={tokens.backgroundColor}
        intensity={backdrop?.intensity}
        focusX={backdrop?.focusX}
        focusY={backdrop?.focusY}
        zoom={backdrop?.zoom}
      />
      <div className={cn("mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 sm:grid-cols-[0.7fr_1.3fr]", backdrop?.url && "backdrop-legible")}>
        <motion.div
          initial={motionCfg.initial}
          whileInView={motionCfg.animate}
          viewport={{ once: true, margin: "-80px" }}
          transition={motionCfg.transition}
          className="aspect-square overflow-hidden"
          style={{
            borderRadius: `${tokens.borderRadius}px`,
            background: resumeData.photoUrl || tokens.backgroundImageUrl
              ? `url(${resumeData.photoUrl || tokens.backgroundImageUrl}) center/cover`
              : `linear-gradient(135deg, ${hexToRgba(tokens.primaryColor, 0.4)}, ${hexToRgba(tokens.accentColor, 0.25)})`,
          }}
        />

        <motion.div
          initial={motionCfg.initial}
          whileInView={motionCfg.animate}
          viewport={{ once: true, margin: "-80px" }}
          transition={motionCfg.transition}
        >
          <EditableText
            as="p"
            value={aboutLabel}
            onCommit={(v) => editCtx?.updateSectionCopy("aboutLabel", v)}
            placeholder="About"
            styleKey="about.label"
            ringColor={tokens.accentColor}
            className="mb-3 text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: tokens.accentColor }}
          />
          <EditableText
            as="p"
            multiline
            value={resumeData.summary}
            onCommit={(v) => editCtx?.updateResumeField("summary", v)}
            placeholder="A short, compelling summary of your work and what drives it goes here."
            ringColor={tokens.accentColor}
            styleKey="about.summary"
            className="text-balance text-2xl font-medium leading-snug sm:text-3xl"
          />
          <EditableText
            as="p"
            value={resumeData.location}
            onCommit={(v) => editCtx?.updateResumeField("location", v)}
            placeholder="Your location"
            ringColor={tokens.accentColor}
            styleKey="about.location"
            className="mt-6 text-sm opacity-60"
          />
        </motion.div>
      </div>
    </section>
  );
}
