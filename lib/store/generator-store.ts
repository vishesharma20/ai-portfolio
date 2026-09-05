"use client";

import { create } from "zustand";
import { GeneratorStep, EntryMode, UploadedAssets } from "@/types/generator";
import { ResumeData, emptyResumeData, Experience, Education, Project, Link } from "@/types/resume";
import { DesignTokens, defaultDesignTokens } from "@/types/design-tokens";
import { generateId } from "@/lib/utils";
import { SVG_TEMPLATE_COLOR } from "@/lib/svg-utils";

export type TextAnimation = "none" | "typewriter" | "fade" | "bounce" | "slide";

export interface TextStyleOverride {
  color?: string;
  fontSizePx?: number;
  animation?: TextAnimation;
}

export type StickerMotion =
  | "none"
  | "float"
  | "pulse"
  | "spin"
  | "wiggle"
  | "bounce"
  | "shake"
  | "swing"
  | "orbit"
  | "drift"
  | "tada";

export interface Decoration {
  id: string;
  kind: "emoji" | "image" | "border";
  /** An emoji character, a data URL for a sticker image, or a data URL for a tileable border pattern. */
  content: string;
  xPercent: number;
  yPercent: number;
  /** Continuous looping motion — emoji/image only. */
  motion?: StickerMotion;
  /** Used by "emoji" and "image" stickers. */
  scale: number;
  rotation: number;
  /** Used by "border" — an independently resizable strip that tiles `content` horizontally. */
  widthPx?: number;
  heightPx?: number;
  /** Crop framing for "image" stickers — zoom (1 = fit, higher = zoomed in) and pan offset in %. */
  cropScale?: number;
  cropX?: number;
  cropY?: number;
  /** Recolor target — only meaningful when content is our own SVG source (doodles/borders), not uploaded photos. */
  color?: string;
}

export type PortfolioSectionKey = "hero" | "about" | "skills" | "experience" | "projects" | "contact";

export interface SectionBackgroundConfig {
  url: string;
  /** Any of these left unset falls back to the global Design > Background blur/crop values. */
  blur?: number;
  focusX?: number;
  focusY?: number;
  zoom?: number;
}

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

  addDecoration: (kind: Decoration["kind"], content: string) => void;
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

  setDesignTokens: (tokens: Partial<DesignTokens>) => void;
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export interface SectionCopy {
  aboutLabel: string;
  skillsLabel: string;
  experienceLabel: string;
  projectsLabel: string;
  contactLabel: string;
  contactHeading: string;
}

export const defaultSectionCopy: SectionCopy = {
  aboutLabel: "About",
  skillsLabel: "Skills",
  experienceLabel: "Experience",
  projectsLabel: "Projects",
  contactLabel: "Contact",
  contactHeading: "Let's work together.",
};

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
  sectionCopy: SectionCopy;
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

export const useGeneratorStore = create<GeneratorStore>((set) => ({
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
  sectionCopy: defaultSectionCopy,
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

    addDecoration: (kind, content) =>
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
        sectionCopy: defaultSectionCopy,
        isProcessing: false,
        error: null,
      }),
  },
}));

// Convenience selector hooks so components only re-render on what they use.
export const useGeneratorActions = () => useGeneratorStore((s) => s.actions);
