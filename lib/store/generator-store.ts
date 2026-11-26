"use client";

import { create } from "zustand";
import { temporal } from "zundo";
import { useStore } from "zustand";
import { GeneratorStep, EntryMode, UploadedAssets } from "@/types/generator";
import { ResumeData, emptyResumeData, Experience, Education, Project, Link } from "@/types/resume";
import { DesignTokens, defaultDesignTokens } from "@/types/design-tokens";
import {
  PortfolioSectionKey,
  Decoration,
  StickerMotion,
  TextStyleOverride,
  TextAnimation,
  SectionBackgroundConfig,
  SectionCopy,
  defaultSectionCopy,
  DEFAULT_SECTION_ORDER,
  Portfolio,
} from "@/types/portfolio";
import { generateId } from "@/lib/utils";
import { SVG_TEMPLATE_COLOR } from "@/lib/svg-utils";

// Re-exported so existing call sites (`import { Decoration } from
// "@/lib/store/generator-store"`) keep working unchanged — the actual
// definitions now live in types/portfolio.ts, the canonical schema, so
// there's exactly one copy of each.
export type { PortfolioSectionKey, Decoration, StickerMotion, TextStyleOverride, TextAnimation, SectionBackgroundConfig, SectionCopy };
export { defaultSectionCopy };

interface GeneratorActions {
  setStep: (step: GeneratorStep) => void;
  setEntryMode: (mode: EntryMode) => void;
  setAssets: (partial: Partial<UploadedAssets>) => void;
  setResumeData: (data: ResumeData) => void;
  updateResumeField: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
  addExperience: () => void;
  updateExperience: (id: string, partial: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, partial: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addProject: () => void;
  updateProject: (id: string, partial: Partial<Project>) => void;
  removeProject: (id: string) => void;

  updateSkill: (index: number, value: string) => void;
  addSkill: () => void;
  removeSkill: (index: number) => void;

  updateHighlight: (experienceId: string, index: number, value: string) => void;
  addHighlight: (experienceId: string) => void;
  removeHighlight: (experienceId: string, index: number) => void;

  updateProjectTag: (projectId: string, index: number, value: string) => void;
  addProjectTag: (projectId: string) => void;
  removeProjectTag: (projectId: string, index: number) => void;

  updateLink: (id: string, partial: Partial<Link>) => void;
  addLink: () => void;
  removeLink: (id: string) => void;

  setTextStyle: (key: string, partial: Partial<TextStyleOverride>) => void;
  clearTextStyle: (key: string) => void;

  addDecoration: (kind: Decoration["kind"], content: string, options?: Pick<Decoration, "interactive">) => void;
  updateDecoration: (id: string, partial: Partial<Decoration>) => void;
  removeDecoration: (id: string) => void;

  setSectionBackground: (section: PortfolioSectionKey, url: string) => void;
  clearSectionBackground: (section: PortfolioSectionKey) => void;
  updateSectionBackgroundConfig: (section: PortfolioSectionKey, partial: Partial<Omit<SectionBackgroundConfig, "url">>) => void;

  /** Overrides the global Motion > Animation style for a single section. `null` reverts to "Auto" (the global style). */
  setSectionAnimation: (section: PortfolioSectionKey, style: DesignTokens["animationStyle"] | null) => void;

  /** Hero is always shown — the UI never calls this with "hero", but the type stays permissive to keep the store simple. */
  setSectionVisibility: (section: PortfolioSectionKey, visible: boolean) => void;

  updateSectionCopy: (key: keyof SectionCopy, value: string) => void;

  /** Not reorderable via UI yet — this is the data model a future drag-and-drop control will write to. */
  setSectionOrder: (order: PortfolioSectionKey[]) => void;

  /** Selects which registered template (features/portfolio/templates/registry.ts) renders this portfolio's presentation/layout. Purely a presentation switch — never touches resume/appearance/section content. */
  setTemplateId: (templateId: string) => void;

  setDesignTokens: (tokens: Partial<DesignTokens>) => void;
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  /** Hydrates every editor slice from a canonical Portfolio object (see lib/portfolio/convert.ts). The inverse of buildPortfolioSnapshot(). Also records its DB identity as portfolioMeta. */
  loadPortfolio: (portfolio: Portfolio) => void;

  /** Records which database row this editing session is persisted as, once known — see hooks/use-portfolio-persistence.ts. */
  setPortfolioMeta: (meta: PortfolioIdentity | null) => void;
}

/** The subset of Portfolio.metadata that must stay stable across a save (see Step 14: id/slug/createdAt never change on a routine save). */
export interface PortfolioIdentity {
  id: string;
  slug: string;
  createdAt: string;
}

interface GeneratorStore {
  step: GeneratorStep;
  entryMode: EntryMode;
  assets: UploadedAssets;
  resumeData: ResumeData;
  designTokens: DesignTokens;
  textStyles: Record<string, TextStyleOverride>;
  decorations: Decoration[];
  sectionBackgrounds: Partial<Record<PortfolioSectionKey, SectionBackgroundConfig>>;
  sectionAnimations: Partial<Record<PortfolioSectionKey, DesignTokens["animationStyle"]>>;
  /** Missing key = visible. Only sections a person has explicitly hidden appear here (as `false`). */
  sectionVisibility: Partial<Record<PortfolioSectionKey, boolean>>;
  sectionOrder: PortfolioSectionKey[];
  sectionCopy: SectionCopy;
  /** Which registered template renders this portfolio. Kept in sync with `Portfolio.template.templateId` by lib/portfolio/convert.ts — see features/portfolio/templates/registry.ts for the set of valid ids and its safe fallback for an unknown one. */
  templateId: string;
  /** null = this editing session has no database row yet (a brand-new, not-yet-saved portfolio). */
  portfolioMeta: PortfolioIdentity | null;
  isProcessing: boolean;
  error: string | null;
  actions: GeneratorActions;
}

const initialAssets: UploadedAssets = {
  resumeFile: null,
  resumeFileName: null,
  photoDataUrl: null,
  inspirationImages: [],
};

/** Minimal debounce — used to collapse rapid-fire changes (typing, dragging a slider) into a single undo/redo history entry instead of one per keystroke. */
function debounce<T extends (...args: never[]) => void>(fn: T, delayMs: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  }) as T;
}

export const useGeneratorStore = create<GeneratorStore>()(
  temporal(
    (set) => ({
  step: "upload",
  entryMode: "resume",
  assets: initialAssets,
  resumeData: emptyResumeData,
  designTokens: defaultDesignTokens,
  textStyles: {},
  decorations: [],
  sectionBackgrounds: {},
  sectionAnimations: {},
  sectionVisibility: {},
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  sectionCopy: defaultSectionCopy,
  templateId: "default",
  portfolioMeta: null,
  isProcessing: false,
  error: null,
  actions: {
    setStep: (step) => set({ step }),
    setEntryMode: (entryMode) => set({ entryMode }),
    setAssets: (partial) => set((s) => ({ assets: { ...s.assets, ...partial } })),
    setResumeData: (resumeData) => set({ resumeData }),
    updateResumeField: (key, value) =>
      set((s) => ({ resumeData: { ...s.resumeData, [key]: value } })),

    addExperience: () =>
      set((s) => ({
        resumeData: {
          ...s.resumeData,
          experience: [
            ...s.resumeData.experience,
            { id: generateId(), role: "New role", company: "Company", location: "", startDate: "", endDate: "Present", description: "", highlights: [] },
          ],
        },
      })),
    updateExperience: (id, partial) =>
      set((s) => ({
        resumeData: {
          ...s.resumeData,
          experience: s.resumeData.experience.map((e) => (e.id === id ? { ...e, ...partial } : e)),
        },
      })),
    removeExperience: (id) =>
      set((s) => ({ resumeData: { ...s.resumeData, experience: s.resumeData.experience.filter((e) => e.id !== id) } })),

    addEducation: () =>
      set((s) => ({
        resumeData: {
          ...s.resumeData,
          education: [...s.resumeData.education, { id: generateId(), school: "School", degree: "", field: "", startDate: "", endDate: "" }],
        },
      })),
    updateEducation: (id, partial) =>
      set((s) => ({
        resumeData: {
          ...s.resumeData,
          education: s.resumeData.education.map((e) => (e.id === id ? { ...e, ...partial } : e)),
        },
      })),
    removeEducation: (id) =>
      set((s) => ({ resumeData: { ...s.resumeData, education: s.resumeData.education.filter((e) => e.id !== id) } })),

    addProject: () =>
      set((s) => ({
        resumeData: {
          ...s.resumeData,
          projects: [...s.resumeData.projects, { id: generateId(), title: "New project", description: "", tags: [], link: "", year: "" }],
        },
      })),
    updateProject: (id, partial) =>
      set((s) => ({
        resumeData: {
          ...s.resumeData,
          projects: s.resumeData.projects.map((p) => (p.id === id ? { ...p, ...partial } : p)),
        },
      })),
    removeProject: (id) =>
      set((s) => ({ resumeData: { ...s.resumeData, projects: s.resumeData.projects.filter((p) => p.id !== id) } })),

    updateSkill: (index, value) =>
      set((s) => ({
        resumeData: {
          ...s.resumeData,
          skills: s.resumeData.skills.map((sk, i) => (i === index ? value : sk)),
        },
      })),
    addSkill: () =>
      set((s) => ({ resumeData: { ...s.resumeData, skills: [...s.resumeData.skills, ""] } })),
    removeSkill: (index) =>
      set((s) => ({
        resumeData: { ...s.resumeData, skills: s.resumeData.skills.filter((_, i) => i !== index) },
      })),

    updateHighlight: (experienceId, index, value) =>
      set((s) => ({
        resumeData: {
          ...s.resumeData,
          experience: s.resumeData.experience.map((e) =>
            e.id === experienceId
              ? { ...e, highlights: e.highlights.map((h, i) => (i === index ? value : h)) }
              : e
          ),
        },
      })),
    addHighlight: (experienceId) =>
      set((s) => ({
        resumeData: {
          ...s.resumeData,
          experience: s.resumeData.experience.map((e) =>
            e.id === experienceId ? { ...e, highlights: [...e.highlights, ""] } : e
          ),
        },
      })),
    removeHighlight: (experienceId, index) =>
      set((s) => ({
        resumeData: {
          ...s.resumeData,
          experience: s.resumeData.experience.map((e) =>
            e.id === experienceId
              ? { ...e, highlights: e.highlights.filter((_, i) => i !== index) }
              : e
          ),
        },
      })),

    updateProjectTag: (projectId, index, value) =>
      set((s) => ({
        resumeData: {
          ...s.resumeData,
          projects: s.resumeData.projects.map((p) =>
            p.id === projectId ? { ...p, tags: p.tags.map((t, i) => (i === index ? value : t)) } : p
          ),
        },
      })),
    addProjectTag: (projectId) =>
      set((s) => ({
        resumeData: {
          ...s.resumeData,
          projects: s.resumeData.projects.map((p) =>
            p.id === projectId ? { ...p, tags: [...p.tags, ""] } : p
          ),
        },
      })),
    removeProjectTag: (projectId, index) =>
      set((s) => ({
        resumeData: {
          ...s.resumeData,
          projects: s.resumeData.projects.map((p) =>
            p.id === projectId ? { ...p, tags: p.tags.filter((_, i) => i !== index) } : p
          ),
        },
      })),

    updateLink: (id, partial) =>
      set((s) => ({
        resumeData: {
          ...s.resumeData,
          links: s.resumeData.links.map((l) => (l.id === id ? { ...l, ...partial } : l)),
        },
      })),
    addLink: () =>
      set((s) => ({
        resumeData: {
          ...s.resumeData,
          links: [...s.resumeData.links, { id: generateId(), label: "Link", url: "" }],
        },
      })),
    removeLink: (id) =>
      set((s) => ({
        resumeData: { ...s.resumeData, links: s.resumeData.links.filter((l) => l.id !== id) },
      })),

    setTextStyle: (key, partial) =>
      set((s) => ({ textStyles: { ...s.textStyles, [key]: { ...s.textStyles[key], ...partial } } })),
    clearTextStyle: (key) =>
      set((s) => {
        const next = { ...s.textStyles };
        delete next[key];
        return { textStyles: next };
      }),

    addDecoration: (kind, content, options) =>
      set((s) => ({
        decorations: [
          ...s.decorations,
          kind === "border"
            ? {
                id: generateId(),
                kind,
                content,
                xPercent: 50,
                yPercent: 20,
                scale: 1,
                rotation: 0,
                widthPx: 260,
                heightPx: 28,
                color: SVG_TEMPLATE_COLOR,
                ...options,
              }
            : {
                id: generateId(),
                kind,
                content,
                xPercent: 42 + Math.random() * 16,
                yPercent: 4 + Math.random() * 6,
                scale: 1,
                rotation: Math.round(Math.random() * 30 - 15),
                color: SVG_TEMPLATE_COLOR,
                ...options,
              },
        ],
      })),
    updateDecoration: (id, partial) =>
      set((s) => ({
        decorations: s.decorations.map((d) => (d.id === id ? { ...d, ...partial } : d)),
      })),
    removeDecoration: (id) =>
      set((s) => ({ decorations: s.decorations.filter((d) => d.id !== id) })),

    setSectionBackground: (section, url) =>
      set((s) => ({
        sectionBackgrounds: {
          ...s.sectionBackgrounds,
          // Setting a URL on an already-configured section keeps its blur/crop tweaks;
          // picking "None" (empty url) still creates an explicit override with no image.
          [section]: { ...s.sectionBackgrounds[section], url },
        },
      })),
    updateSectionBackgroundConfig: (section, partial) =>
      set((s) => {
        const existing = s.sectionBackgrounds[section];
        if (!existing) return s; // nothing to adjust until a URL/override exists
        return { sectionBackgrounds: { ...s.sectionBackgrounds, [section]: { ...existing, ...partial } } };
      }),
    clearSectionBackground: (section) =>
      set((s) => {
        const next = { ...s.sectionBackgrounds };
        delete next[section];
        return { sectionBackgrounds: next };
      }),

    setSectionAnimation: (section, style) =>
      set((s) => {
        if (style === null) {
          const next = { ...s.sectionAnimations };
          delete next[section];
          return { sectionAnimations: next };
        }
        return { sectionAnimations: { ...s.sectionAnimations, [section]: style } };
      }),

    setSectionVisibility: (section, visible) =>
      set((s) => ({ sectionVisibility: { ...s.sectionVisibility, [section]: visible } })),

    updateSectionCopy: (key, value) =>
      set((s) => ({ sectionCopy: { ...s.sectionCopy, [key]: value } })),

    setSectionOrder: (order) => set({ sectionOrder: order }),

    setTemplateId: (templateId) => set({ templateId }),

    setDesignTokens: (partial) => set((s) => ({ designTokens: { ...s.designTokens, ...partial } })),
    setProcessing: (isProcessing) => set({ isProcessing }),
    setError: (error) => set({ error }),
    reset: () =>
      set({
        step: "upload",
        entryMode: "resume",
        assets: initialAssets,
        resumeData: emptyResumeData,
        designTokens: defaultDesignTokens,
        textStyles: {},
        decorations: [],
        sectionBackgrounds: {},
        sectionAnimations: {},
        sectionVisibility: {},
        sectionOrder: [...DEFAULT_SECTION_ORDER],
        sectionCopy: defaultSectionCopy,
        templateId: "default",
        portfolioMeta: null,
        isProcessing: false,
        error: null,
      }),

    loadPortfolio: (portfolio) =>
      set((s) => ({
        resumeData: portfolio.content.resume,
        designTokens: portfolio.appearance.tokens,
        textStyles: portfolio.appearance.textStyles,
        decorations: portfolio.appearance.decorations,
        assets: { ...s.assets, inspirationImages: portfolio.appearance.inspirationImages },
        sectionBackgrounds: portfolio.sections.backgrounds,
        sectionAnimations: portfolio.sections.animations,
        sectionVisibility: portfolio.sections.visibility,
        sectionOrder: portfolio.sections.order,
        sectionCopy: portfolio.sections.copy,
        templateId: portfolio.template.templateId,
        portfolioMeta: {
          id: portfolio.metadata.id,
          slug: portfolio.metadata.slug,
          createdAt: portfolio.metadata.createdAt,
        },
        step: "editor",
        error: null,
      })),

    setPortfolioMeta: (meta) => set({ portfolioMeta: meta }),
      },
    }),
    {
      // Undo/redo tracks only the portfolio *content* — not wizard
      // navigation (step/entryMode/assets), not session bookkeeping
      // (portfolioMeta/isProcessing/error), and not the actions object.
      // Ctrl+Z should never accidentally rewind which step of the wizard
      // you're on.
      partialize: (state) => ({
        resumeData: state.resumeData,
        designTokens: state.designTokens,
        textStyles: state.textStyles,
        decorations: state.decorations,
        sectionBackgrounds: state.sectionBackgrounds,
        sectionAnimations: state.sectionAnimations,
        sectionVisibility: state.sectionVisibility,
        sectionOrder: state.sectionOrder,
        sectionCopy: state.sectionCopy,
        templateId: state.templateId,
      }),
      limit: 100,
      equality: (a, b) => JSON.stringify(a) === JSON.stringify(b),
      // Collapses rapid changes (typing, slider drags) into one history
      // entry every 500ms of inactivity, instead of one per keystroke.
      handleSet: (handleSet) => debounce(handleSet, 500),
    }
  )
);

/** Reactive access to the undo/redo history — see features/generator/editor/use-undo-redo.ts for the hook editor UI actually uses. */
export const useTemporalStore = <T,>(selector: (state: ReturnType<typeof useGeneratorStore.temporal.getState>) => T) =>
  useStore(useGeneratorStore.temporal, selector);

// Convenience selector hooks so components only re-render on what they use.
export const useGeneratorActions = () => useGeneratorStore((s) => s.actions);
