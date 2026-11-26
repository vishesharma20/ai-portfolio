"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ExternalLink, Plus, Trash2, X } from "lucide-react";
import { Project, ResumeData } from "@/types/resume";
import { DesignTokens } from "@/types/design-tokens";
import { getMotionConfig, hexToRgba } from "@/lib/design-tokens";
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

export function ProjectsSection({ resumeData, tokens, sectionCopy, backdrop, animationOverride }: Props) {
  const motionCfg = useSectionMotion(animationOverride, tokens);
  const editCtx = usePortfolioEdit();
  const projectsLabel = sectionCopy.projectsLabel;

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
        <div className="mb-8 flex items-center justify-between">
          <EditableText
            as="p"
            value={projectsLabel}
            onCommit={(v) => editCtx?.updateSectionCopy("projectsLabel", v)}
            placeholder="Projects"
            styleKey="projects.label"
            ringColor={tokens.accentColor}
            className="text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: tokens.accentColor }}
          />
          {editCtx && (
            <button
              type="button"
              onClick={editCtx.addProject}
              className="flex items-center gap-1 text-xs opacity-50 transition-opacity hover:opacity-100"
            >
              <Plus className="h-3.5 w-3.5" /> Add project
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-[var(--p-gap)] sm:grid-cols-2">
          {resumeData.projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              tokens={tokens}
              motionCfg={motionCfg}
              editable={Boolean(editCtx)}
              onUpdate={(partial) => editCtx?.updateProject(project.id, partial)}
              onRemove={() => editCtx?.removeProject(project.id)}
              onUpdateTag={(ti, v) => editCtx?.updateProjectTag(project.id, ti, v)}
              onAddTag={() => editCtx?.addProjectTag(project.id)}
              onRemoveTag={(ti) => editCtx?.removeProjectTag(project.id, ti)}
            />
          ))}
        </div>
        {resumeData.projects.length === 0 && editCtx && (
          <button
            type="button"
            onClick={editCtx.addProject}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-current py-8 text-sm opacity-40 transition-opacity hover:opacity-80"
          >
            <Plus className="h-4 w-4" /> Add your first project
          </button>
        )}
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  index,
  tokens,
  motionCfg,
  editable,
  onUpdate,
  onRemove,
  onUpdateTag,
  onAddTag,
  onRemoveTag,
}: {
  project: Project;
  index: number;
  tokens: DesignTokens;
  motionCfg: ReturnType<typeof getMotionConfig>;
  editable: boolean;
  onUpdate: (partial: Partial<Project>) => void;
  onRemove: () => void;
  onUpdateTag: (i: number, v: string) => void;
  onAddTag: () => void;
  onRemoveTag: (i: number) => void;
}) {
  const tagsRef = useRef<HTMLDivElement>(null);

  // Subtle pointer-follow 3D tilt, independent of the chosen entrance
  // animation style — always on, since it reads as "polish" on any theme.
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springX = useSpring(pointerX, { stiffness: 300, damping: 30 });
  const springY = useSpring(pointerY, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(springY, [0, 1], [7, -7]);
  const rotateY = useTransform(springX, [0, 1], [-7, 7]);

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - rect.left) / rect.width);
    pointerY.set((e.clientY - rect.top) / rect.height);
  };
  const handlePointerLeave = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  const handleAddTag = () => {
    onAddTag();
    requestAnimationFrame(() => {
      const nodes = tagsRef.current?.querySelectorAll<HTMLElement>(".editable-text");
      focusEditableAtEnd(nodes?.[nodes.length - 1]);
    });
  };

  return (
    <motion.div
      initial={motionCfg.initial}
      whileInView={motionCfg.animate}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ ...motionCfg.transition, delay: (index % 6) * motionCfg.stagger }}
      whileHover={{ ...motionCfg.hoverLift, scale: (motionCfg.hoverLift as { scale?: number })?.scale ?? 1.015 }}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      style={{
        borderRadius: `${tokens.borderRadius}px`,
        background: hexToRgba("#ffffff", 0.02),
        border: `1px solid ${hexToRgba("#ffffff", 0.08)}`,
        rotateX,
        rotateY,
        transformPerspective: 800,
      }}
      className="group relative flex flex-col justify-between p-6"
    >
      {editable && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove this project"
          className="absolute -right-2 -top-2 rounded-full p-1.5 opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-50 hover:!opacity-100"
          style={{ background: hexToRgba("#000000", 0.3) }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <EditableText
            as="p"
            value={project.title}
            onCommit={(v) => onUpdate({ title: v })}
            placeholder="Project title"
            ringColor={tokens.accentColor}
            styleKey={`project.${project.id}.title`}
            className="flex-1 text-lg font-medium"
          />
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Open project link"
              className="shrink-0 opacity-40 transition-opacity hover:opacity-100"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
        <EditableText
          as="p"
          multiline
          value={project.description}
          onCommit={(v) => onUpdate({ description: v })}
          placeholder="What's it about?"
          ringColor={tokens.accentColor}
          styleKey={`project.${project.id}.description`}
          className="text-sm leading-relaxed opacity-65"
        />
      </div>

      <div ref={tagsRef} className="mt-5 flex flex-wrap items-center gap-2">
        {project.tags.map((tag, ti) => (
          <span
            key={ti}
            className="group/tag relative flex items-center rounded-full px-2.5 py-0.5 text-[11px]"
            style={{ background: hexToRgba(tokens.accentColor, 0.12), color: tokens.accentColor }}
          >
            <EditableText
              value={tag}
              onCommit={(v) => onUpdateTag(ti, v)}
              placeholder="Tag"
              ringColor={tokens.accentColor}
              styleKey={`project.${project.id}.tag.${ti}`}
              className="min-w-[2ch]"
            />
            {editable && (
              <button
                type="button"
                onClick={() => onRemoveTag(ti)}
                aria-label="Remove tag"
                className="ml-1 shrink-0 rounded-full opacity-0 transition-opacity group-hover/tag:opacity-70 hover:!opacity-100"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </span>
        ))}
        {editable && (
          <button
            type="button"
            onClick={handleAddTag}
            className="flex items-center rounded-full border border-dashed px-2.5 py-0.5 text-[11px] opacity-40 transition-opacity hover:opacity-90"
            style={{ borderColor: hexToRgba(tokens.accentColor, 0.4) }}
          >
            <Plus className="h-2.5 w-2.5" />
          </button>
        )}
      </div>

      <EditableText
        value={project.link}
        onCommit={(v) => onUpdate({ link: v })}
        placeholder="Add a link (https://…)"
        ringColor={tokens.accentColor}
        className="mt-3 block truncate font-mono text-[11px] opacity-40"
      />
    </motion.div>
  );
}
