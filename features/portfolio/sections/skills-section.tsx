"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { ResumeData } from "@/types/resume";
import { DesignTokens } from "@/types/design-tokens";
import { hexToRgba } from "@/lib/design-tokens";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { EditableText, focusEditableAtEnd } from "@/components/ui/editable-text";
import { SectionImageBackdrop } from "@/components/portfolio/section-image-backdrop";
import { useGeneratorStore, useGeneratorActions } from "@/lib/store/generator-store";
import { cn } from "@/lib/utils";

interface Props {
  resumeData: ResumeData;
  tokens: DesignTokens;
  backdrop?: import("../portfolio-template").ResolvedBackdrop;
}

export function SkillsSection({ resumeData, tokens, backdrop }: Props) {
  const motionCfg = useSectionMotion("skills", tokens);
  const actions = useGeneratorActions();
  const skillsLabel = useGeneratorStore((s) => s.sectionCopy.skillsLabel);
  const listRef = useRef<HTMLDivElement>(null);

  const handleAdd = () => {
    actions.addSkill();
    requestAnimationFrame(() => {
      const nodes = listRef.current?.querySelectorAll<HTMLElement>(".editable-text");
      focusEditableAtEnd(nodes?.[nodes.length - 1]);
    });
  };

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
      <div className={cn("mx-auto max-w-5xl", backdrop?.url && "backdrop-legible")}>
        <EditableText
          as="p"
          value={skillsLabel}
          onCommit={(v) => actions.updateSectionCopy("skillsLabel", v)}
          placeholder="Skills"
          styleKey="skills.label"
          ringColor={tokens.accentColor}
          className="mb-8 text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: tokens.accentColor }}
        />
        <div ref={listRef} className="flex flex-wrap gap-3">
          {resumeData.skills.map((skill, i) => (
            <motion.span
              key={i}
              initial={motionCfg.initial}
              whileInView={motionCfg.animate}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ ...motionCfg.transition, delay: (i % 12) * motionCfg.stagger }}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex items-center px-4 py-2 text-sm"
              style={{
                borderRadius: `${tokens.borderRadius}px`,
                background: hexToRgba(tokens.primaryColor, 0.1),
                border: `1px solid ${hexToRgba(tokens.primaryColor, 0.25)}`,
              }}
            >
              <EditableText
                value={skill}
                onCommit={(v) => actions.updateSkill(i, v)}
                placeholder="Skill"
                ringColor={tokens.accentColor}
                styleKey={`skill.${i}`}
                className="min-w-[3ch]"
              />
              <button
                type="button"
                onClick={() => actions.removeSkill(i)}
                aria-label={`Remove ${skill || "skill"}`}
                className="ml-1.5 -mr-1 shrink-0 rounded-full p-0.5 opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-60 hover:!opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.span>
          ))}
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1 rounded-full border border-dashed px-4 py-2 text-sm opacity-50 transition-opacity hover:opacity-100"
            style={{ borderColor: hexToRgba(tokens.primaryColor, 0.4) }}
          >
            <Plus className="h-3.5 w-3.5" /> Add skill
          </button>
        </div>
      </div>
    </section>
  );
}
