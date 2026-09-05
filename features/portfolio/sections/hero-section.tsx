"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { ResumeData } from "@/types/resume";
import { DesignTokens } from "@/types/design-tokens";
import { hexToRgba } from "@/lib/design-tokens";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { EditableText } from "@/components/ui/editable-text";
import { useGeneratorActions } from "@/lib/store/generator-store";
import { cn } from "@/lib/utils";

interface Props {
  resumeData: ResumeData;
  tokens: DesignTokens;
}

export function HeroSection({ resumeData, tokens }: Props) {
  const blobRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const motionCfg = useSectionMotion("hero", tokens);
  const actions = useGeneratorActions();

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
        // eslint-disable-next-line @next/next/no-img-element
        <div aria-hidden className="absolute inset-0">
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
        className={cn("relative mx-auto max-w-3xl text-center", tokens.backgroundImageUrl && "backdrop-legible")}
      >
        <EditableText
          as="p"
          value={resumeData.title}
          onCommit={(v) => actions.updateResumeField("title", v)}
          placeholder="Your title"
          ringColor={tokens.accentColor}
          styleKey="hero.title"
          className="mb-5 text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: tokens.accentColor }}
        />
        <EditableText
          as="h1"
          value={resumeData.name}
          onCommit={(v) => actions.updateResumeField("name", v)}
          placeholder="Your Name"
          ringColor={tokens.accentColor}
          styleKey="hero.name"
          className="text-balance text-[clamp(2.5rem,7vw,5rem)] font-medium leading-[1.05] tracking-tight"
        />
        <EditableText
          as="p"
          multiline
          value={resumeData.summary}
          onCommit={(v) => actions.updateResumeField("summary", v)}
          placeholder="Add a short, compelling summary"
          ringColor={tokens.accentColor}
          styleKey="hero.summary"
          className="mx-auto mt-6 max-w-xl text-balance text-lg opacity-70"
        />
        <div className="mt-10 flex items-center justify-center gap-2 opacity-50">
          <ArrowDown className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wide">Scroll</span>
        </div>
      </motion.div>
    </section>
  );
}
