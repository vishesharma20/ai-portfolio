"use client";

import { createContext, useContext, ReactNode } from "react";
import { ResumeData, Experience, Project, Link } from "@/types/resume";
import { Decoration, TextStyleOverride, SectionCopy } from "@/types/portfolio";

/**
 * The narrow mutation surface the *rendering tree* (PortfolioTemplate,
 * section components, DecorationsLayer, EditableText) is allowed to call.
 * Deliberately a subset of the full Zustand `GeneratorActions` shape —
 * wizard-only concerns (step navigation, asset uploads, bulk resumeData
 * replacement, reset) live in the editor/wizard layer, not here.
 *
 * When no `PortfolioEditProvider` wraps the tree, `usePortfolioEdit()`
 * returns `null` and every consumer renders **read-only**: EditableText
 * falls back to plain static text, add/remove/reorder controls simply
 * don't render. That's what makes it safe to render a `Portfolio` object
 * with zero Zustand involvement — a future public portfolio page, a static
 * export, or a server-rendered preview all render through the exact same
 * components, just without a provider.
 */
export interface PortfolioEditHandlers {
  textStyles: Record<string, TextStyleOverride>;
  setTextStyle: (key: string, partial: Partial<TextStyleOverride>) => void;
  clearTextStyle: (key: string) => void;

  updateResumeField: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
  updateSectionCopy: (key: keyof SectionCopy, value: string) => void;

  addExperience: () => void;
  updateExperience: (id: string, partial: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  addHighlight: (experienceId: string) => void;
  updateHighlight: (experienceId: string, index: number, value: string) => void;
  removeHighlight: (experienceId: string, index: number) => void;

  addProject: () => void;
  updateProject: (id: string, partial: Partial<Project>) => void;
  removeProject: (id: string) => void;
  addProjectTag: (projectId: string) => void;
  updateProjectTag: (projectId: string, index: number, value: string) => void;
  removeProjectTag: (projectId: string, index: number) => void;

  addSkill: () => void;
  updateSkill: (index: number, value: string) => void;
  removeSkill: (index: number) => void;

  addLink: () => void;
  updateLink: (id: string, partial: Partial<Link>) => void;
  removeLink: (id: string) => void;

  updateDecoration: (id: string, partial: Partial<Decoration>) => void;
  removeDecoration: (id: string) => void;
}

const PortfolioEditContext = createContext<PortfolioEditHandlers | null>(null);

export function PortfolioEditProvider({
  handlers,
  children,
}: {
  handlers: PortfolioEditHandlers;
  children: ReactNode;
}) {
  return <PortfolioEditContext.Provider value={handlers}>{children}</PortfolioEditContext.Provider>;
}

/** Returns edit handlers, or `null` when the tree is being rendered read-only. Every render-tree component must handle the `null` case. */
export function usePortfolioEdit(): PortfolioEditHandlers | null {
  return useContext(PortfolioEditContext);
}
