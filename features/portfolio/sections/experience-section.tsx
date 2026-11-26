"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";
import { Experience, ResumeData } from "@/types/resume";
import { DesignTokens } from "@/types/design-tokens";
import { getMotionConfig } from "@/lib/design-tokens";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { EditableText, focusEditableAtEnd } from "@/components/ui/editable-text";
import { SectionImageBackdrop } from "@/components/portfolio/section-image-backdrop";
import { SectionCopy } from "@/types/portfolio";
import { usePortfolioEdit } from "@/features/portfolio/portfolio-editor-context";
import { cn } from "@/lib/utils";

interface Props {
  resumeData: ResumeData;
  tokens: DesignTokens;
  sectionCopy: SectionCopy;
  backdrop?: import("../portfolio-template").ResolvedBackdrop;
  animationOverride?: DesignTokens["animationStyle"];
}

export function ExperienceSection({ resumeData, tokens, sectionCopy, backdrop, animationOverride }: Props) {
  const motionCfg = useSectionMotion(animationOverride, tokens);
  const editCtx = usePortfolioEdit();
  const experienceLabel = sectionCopy.experienceLabel;

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
      <div className={cn("mx-auto max-w-3xl", backdrop?.url && "backdrop-legible")}>
        <div className="mb-10 flex items-center justify-between">
          <EditableText
            as="p"
            value={experienceLabel}
            onCommit={(v) => editCtx?.updateSectionCopy("experienceLabel", v)}
            placeholder="Experience"
            styleKey="experience.label"
            ringColor={tokens.accentColor}
            className="text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: tokens.accentColor }}
          />
          {editCtx && (
            <button
              type="button"
              onClick={editCtx.addExperience}
              className="flex items-center gap-1 text-xs opacity-50 transition-opacity hover:opacity-100"
            >
              <Plus className="h-3.5 w-3.5" /> Add role
            </button>
          )}
        </div>
        <div className="flex flex-col gap-[var(--p-gap)]">
          {resumeData.experience.map((exp, i) => (
            <ExperienceEntry
              key={exp.id}
              exp={exp}
              index={i}
              tokens={tokens}
              motionCfg={motionCfg}
              editable={Boolean(editCtx)}
              onUpdate={(partial) => editCtx?.updateExperience(exp.id, partial)}
              onRemove={() => editCtx?.removeExperience(exp.id)}
              onUpdateHighlight={(hi, v) => editCtx?.updateHighlight(exp.id, hi, v)}
              onAddHighlight={() => editCtx?.addHighlight(exp.id)}
              onRemoveHighlight={(hi) => editCtx?.removeHighlight(exp.id, hi)}
            />
          ))}
          {resumeData.experience.length === 0 && editCtx && (
            <button
              type="button"
              onClick={editCtx.addExperience}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-current py-8 text-sm opacity-40 transition-opacity hover:opacity-80"
            >
              <Plus className="h-4 w-4" /> Add your first role
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ExperienceEntry({
  exp,
  index,
  tokens,
  motionCfg,
  editable,
  onUpdate,
  onRemove,
  onUpdateHighlight,
  onAddHighlight,
  onRemoveHighlight,
}: {
  exp: Experience;
  index: number;
  tokens: DesignTokens;
  motionCfg: ReturnType<typeof getMotionConfig>;
  editable: boolean;
  onUpdate: (partial: Partial<Experience>) => void;
  onRemove: () => void;
  onUpdateHighlight: (i: number, v: string) => void;
  onAddHighlight: () => void;
  onRemoveHighlight: (i: number) => void;
}) {
  const highlightsRef = useRef<HTMLUListElement>(null);

  const handleAddHighlight = () => {
    onAddHighlight();
    requestAnimationFrame(() => {
      const nodes = highlightsRef.current?.querySelectorAll<HTMLElement>(".editable-text");
      focusEditableAtEnd(nodes?.[nodes.length - 1]);
    });
  };

  return (
    <motion.div
      initial={motionCfg.initial}
      whileInView={motionCfg.animate}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ ...motionCfg.transition, delay: (index % 6) * motionCfg.stagger }}
      className="group relative grid grid-cols-1 gap-2 border-b pb-[var(--p-gap)] sm:grid-cols-[140px_1fr]"
      style={{ borderColor: "rgba(255,255,255,0.08)" }}
    >
      {editable && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove this role"
          className="absolute -right-1 -top-1 rounded-full p-1 opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-50 hover:!opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="flex items-center gap-1.5 text-sm opacity-50">
        <EditableText
          value={exp.startDate}
          onCommit={(v) => onUpdate({ startDate: v })}
          placeholder="Start"
          ringColor={tokens.accentColor}
          styleKey={`experience.${exp.id}.startDate`}
        />
        <span>→</span>
        <EditableText
          value={exp.endDate}
          onCommit={(v) => onUpdate({ endDate: v })}
          placeholder="Present"
          ringColor={tokens.accentColor}
          styleKey={`experience.${exp.id}.endDate`}
        />
      </p>
      <div>
        <EditableText
          as="p"
          value={exp.role}
          onCommit={(v) => onUpdate({ role: v })}
          placeholder="Role"
          ringColor={tokens.accentColor}
          styleKey={`experience.${exp.id}.role`}
          className="text-lg font-medium"
        />
        <EditableText
          as="p"
          value={exp.company}
          onCommit={(v) => onUpdate({ company: v })}
          placeholder="Company"
          ringColor={tokens.accentColor}
          styleKey={`experience.${exp.id}.company`}
          className="text-sm opacity-60"
        />
        <EditableText
          as="p"
          multiline
          value={exp.description}
          onCommit={(v) => onUpdate({ description: v })}
          placeholder="What did you do?"
          ringColor={tokens.accentColor}
          styleKey={`experience.${exp.id}.description`}
          className="mt-3 text-sm leading-relaxed opacity-70"
        />
        <ul ref={highlightsRef} className="mt-3 space-y-1.5">
          {exp.highlights.map((h, hi) => (
            <li key={hi} className="group/h flex items-center gap-2 text-sm opacity-70">
              <span style={{ color: tokens.accentColor }}>•</span>
              <EditableText
                value={h}
                onCommit={(v) => onUpdateHighlight(hi, v)}
                placeholder="Highlight"
                ringColor={tokens.accentColor}
                styleKey={`experience.${exp.id}.highlight.${hi}`}
                className="flex-1"
              />
              {editable && (
                <button
                  type="button"
                  onClick={() => onRemoveHighlight(hi)}
                  aria-label="Remove highlight"
                  className="shrink-0 rounded-full p-0.5 opacity-0 transition-opacity hover:bg-black/10 group-hover/h:opacity-60 hover:!opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </li>
          ))}
        </ul>
        {editable && (
          <button
            type="button"
            onClick={handleAddHighlight}
            className="mt-2 flex items-center gap-1 text-xs opacity-40 transition-opacity hover:opacity-80"
          >
            <Plus className="h-3 w-3" /> Add highlight
          </button>
        )}
      </div>
    </motion.div>
  );
}
