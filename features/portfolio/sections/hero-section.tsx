"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { ResumeData } from "@/types/resume";
import { DesignTokens } from "@/types/design-tokens";
import { hexToRgba } from "@/lib/design-tokens";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { EditableText } from "@/components/ui/editable-text";
import { usePortfolioEdit } from "@/features/portfolio/portfolio-editor-context";
import { cn } from "@/lib/utils";

interface Props {
  resumeData: ResumeData;
  tokens: DesignTokens;
  animationOverride?: DesignTokens["animationStyle"];
  /** Purely visual headline treatment — scale/alignment/tracking only. Omitted (or "minimal") reproduces this component's original, unchanged markup/classes exactly. Every other prop, all data handling, and inline-editing behavior stays identical across variants. */
  variant?: HeroVariant;
}

export type HeroVariant = "minimal" | "cinematic" | "whimsical" | "brutalist" | "glass";

/** className fragments per variant. Only the hero headline block differs — everything else in this file (backdrop, blob glow, scroll hint, EditableText wiring) is shared by every variant. */
const HERO_VARIANT_CLASSES: Record<HeroVariant, { wrap: string; eyebrow: string; name: string; summary: string }> = {
  minimal: {
    wrap: "relative mx-auto max-w-3xl text-center",
    eyebrow: "mb-5 text-xs font-medium uppercase tracking-[0.2em]",
    name: "text-balance text-[clamp(2.5rem,7vw,5rem)] font-medium leading-[1.05] tracking-tight",
    summary: "mx-auto mt-6 max-w-xl text-balance text-lg opacity-70",
  },
  cinematic: {
    wrap: "relative mx-auto max-w-5xl text-left",
    eyebrow: "mb-6 text-xs font-semibold uppercase tracking-[0.35em]",
    name: "text-balance text-[clamp(3rem,9vw,7.5rem)] font-semibold leading-[0.95] tracking-tight",
    summary: "mt-8 max-w-2xl text-balance text-xl opacity-70",
  },
  whimsical: {
    wrap: "relative mx-auto max-w-2xl text-center",
    eyebrow: "mb-4 inline-block rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide",
    name: "text-balance text-[clamp(2.25rem,6.5vw,4.25rem)] font-bold leading-[1.08] tracking-tight",
    summary: "mx-auto mt-5 max-w-md text-balance text-lg opacity-75",
  },
  brutalist: {
    wrap: "relative mx-auto max-w-4xl text-left",
    eyebrow: "mb-4 text-xs font-bold uppercase tracking-[0.3em]",
    name: "text-balance text-[clamp(2.75rem,8vw,6.5rem)] font-black uppercase leading-[0.92] tracking-tight",
    summary: "mt-6 max-w-xl text-balance text-lg opacity-80",
  },
  glass: {
    wrap: "relative mx-auto max-w-3xl rounded-[2rem] border border-white/15 bg-white/5 px-8 py-12 text-center backdrop-blur-2xl sm:px-14 sm:py-16",
    eyebrow: "mb-5 text-xs font-medium uppercase tracking-[0.25em]",
    name: "text-balance text-[clamp(2.25rem,6.5vw,4.5rem)] font-medium leading-[1.05] tracking-tight",
    summary: "mx-auto mt-6 max-w-xl text-balance text-lg opacity-70",
  },
};

export function HeroSection({ resumeData, tokens, animationOverride, variant = "minimal" }: Props) {
  const heroClasses = HERO_VARIANT_CLASSES[variant];
  const blobRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const motionCfg = useSectionMotion(animationOverride, tokens);
  const editCtx = usePortfolioEdit();

  useEffect(() => {
    if (!motionCfg.enabled) return;
    let ctx: { revert: () => void } | undefined;
    (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        if (!blobRef.current || !sectionRef.current) return;
        gsap.to(blobRef.current, {
          yPercent: 30 * (tokens.animationIntensity / 100),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      }, sectionRef);
    })();
    return () => ctx?.revert?.();
  }, [motionCfg.enabled, tokens.animationIntensity]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[90vh] flex-col justify-center overflow-hidden px-6 sm:px-12"
    >
      {tokens.backgroundImageUrl && (
        <div aria-hidden className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- user-supplied
              background image (arbitrary URL or data URL), not a static asset
              next/image can optimize at build time */}
          <img
            src={tokens.backgroundImageUrl}
            alt=""
            className="h-full w-full object-cover"
            style={{
              objectPosition: `${tokens.backgroundFocusX}% ${tokens.backgroundFocusY}%`,
              transform: `scale(${tokens.backgroundZoom})`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${hexToRgba(tokens.backgroundColor, 0.55)} 0%, ${hexToRgba(tokens.backgroundColor, 0.8)} 55%, ${tokens.backgroundColor} 100%)`,
            }}
          />
        </div>
      )}
      <div
        ref={blobRef}
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[480px] w-[720px] -translate-x-1/2 rounded-full blur-[110px]"
        style={{ background: `radial-gradient(circle, ${tokens.primaryColor}33, transparent 70%)` }}
      />

      <motion.div
        initial={motionCfg.initial}
        animate={motionCfg.animate}
        transition={motionCfg.transition}
        className={cn(heroClasses.wrap, tokens.backgroundImageUrl && "backdrop-legible")}
      >
        <EditableText
          as="p"
          value={resumeData.title}
          onCommit={(v) => editCtx?.updateResumeField("title", v)}
          placeholder="Your title"
          ringColor={tokens.accentColor}
          styleKey="hero.title"
          className={heroClasses.eyebrow}
          style={{ color: tokens.accentColor }}
        />
        <EditableText
          as="h1"
          value={resumeData.name}
          onCommit={(v) => editCtx?.updateResumeField("name", v)}
          placeholder="Your Name"
          ringColor={tokens.accentColor}
          styleKey="hero.name"
          className={heroClasses.name}
        />
        <EditableText
          as="p"
          multiline
          value={resumeData.summary}
          onCommit={(v) => editCtx?.updateResumeField("summary", v)}
          placeholder="Add a short, compelling summary"
          ringColor={tokens.accentColor}
          styleKey="hero.summary"
          className={heroClasses.summary}
        />
        <div className="mt-10 flex items-center justify-center gap-2 opacity-50">
          <ArrowDown className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wide">Scroll</span>
        </div>
      </motion.div>
    </section>
  );
}
