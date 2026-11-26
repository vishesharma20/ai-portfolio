import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGeneratorStore } from "@/lib/store/generator-store";
import { ResumeData } from "@/types/resume";
import { DesignTokens } from "@/types/design-tokens";
import {
  Portfolio,
  PortfolioSectionKey,
  Decoration,
  TextStyleOverride,
  SectionBackgroundConfig,
  SectionCopy,
} from "@/types/portfolio";
import { generateId } from "@/lib/utils";

/**
 * Centralizes the two-way conversion between the editor-friendly Zustand
 * slices (lib/store/generator-store.ts) and the canonical `Portfolio` shape
 * (types/portfolio.ts). Every "Editor State -> Portfolio" and
 * "Portfolio -> Editor State" boundary in the app should go through here
 * rather than reassembling the shape ad hoc, so there's exactly one place
 * that knows how the two representations line up.
 *
 * `portfolioFromEditorState` is a pure function — no Zustand import, no
 * hooks — so it's trivially testable with plain objects.
 */

/** The subset of store state needed to assemble a Portfolio. Deliberately narrower than the full store: wizard-only concerns (step, entryMode, assets, isProcessing, error) aren't part of the portfolio. */
export interface EditorPortfolioState {
  resumeData: ResumeData;
  designTokens: DesignTokens;
  textStyles: Record<string, TextStyleOverride>;
  decorations: Decoration[];
  inspirationImages: string[];
  sectionBackgrounds: Partial<Record<PortfolioSectionKey, SectionBackgroundConfig>>;
  sectionAnimations: Partial<Record<PortfolioSectionKey, DesignTokens["animationStyle"]>>;
  sectionVisibility: Partial<Record<PortfolioSectionKey, boolean>>;
  sectionOrder: PortfolioSectionKey[];
  sectionCopy: SectionCopy;
  /** Which registered template (features/portfolio/templates/registry.ts) renders this portfolio's presentation. Stage 6. */
  templateId: string;
}

/**
 * Pure "Editor State -> Portfolio" conversion. Pass the existing metadata
 * when re-saving a portfolio that already has an id/slug/createdAt/template
 * so those stay stable across edits; omit it for a brand new portfolio.
 */
export function portfolioFromEditorState(
  state: EditorPortfolioState,
  existing?: Partial<Pick<Portfolio["metadata"], "id" | "slug" | "createdAt">> & { templateId?: string }
): Portfolio {
  const now = new Date().toISOString();
  const id = existing?.id ?? generateId();

  return {
    metadata: {
      id,
      slug: existing?.slug ?? id,
      name: state.resumeData.name.trim() || "Untitled portfolio",
      status: "draft",
      createdAt: existing?.createdAt ?? now,
      // Deliberately NOT re-stamped with `now` on every call: this function
      // runs on every render of the live editor snapshot (usePortfolioSnapshot),
      // and the database never trusts this value anyway — updatePortfolio()
      // always computes its own server-side timestamp on save (see
      // lib/db/portfolios.ts). A fresh value here on every render made the
      // snapshot's JSON never stable across renders, which defeated
      // SaveCoordinator's default JSON.stringify dedup key (getKey) and
      // caused it to treat every render as a genuinely new, unsaved
      // snapshot — an unbounded, if slow, redundant-autosave cycle. Pinning
      // it to the same stable placeholder as createdAt keeps the field
      // schema-valid without that volatility.
      updatedAt: existing?.createdAt ?? now,
    },
    content: {
      resume: state.resumeData,
      // Reserved — see types/portfolio.ts. Not yet populated by anything.
      achievements: [],
      certifications: [],
      testimonials: [],
    },
    appearance: {
      tokens: state.designTokens,
      textStyles: state.textStyles,
      decorations: state.decorations,
      inspirationImages: state.inspirationImages,
    },
    sections: {
      order: state.sectionOrder,
      visibility: state.sectionVisibility,
      animations: state.sectionAnimations,
      backgrounds: state.sectionBackgrounds,
      copy: state.sectionCopy,
    },
    template: {
      // `state.templateId` is the live, editable source of truth (Stage 6);
      // `existing?.templateId` remains as a fallback for any caller that
      // still passes it in directly (e.g. constructing a Portfolio outside
      // the store, in a test).
      templateId: state.templateId || existing?.templateId || "default",
    },
  };
}

/** The inverse: reshapes a canonical Portfolio into the flat slices the store expects (see `loadPortfolio` action). */
export function editorStateFromPortfolio(portfolio: Portfolio): EditorPortfolioState {
  return {
    resumeData: portfolio.content.resume,
    designTokens: portfolio.appearance.tokens,
    textStyles: portfolio.appearance.textStyles,
    decorations: portfolio.appearance.decorations,
    inspirationImages: portfolio.appearance.inspirationImages,
    sectionBackgrounds: portfolio.sections.backgrounds,
    sectionAnimations: portfolio.sections.animations,
    sectionVisibility: portfolio.sections.visibility,
    sectionOrder: portfolio.sections.order,
    sectionCopy: portfolio.sections.copy,
    templateId: portfolio.template.templateId,
  };
}

/**
 * One-off snapshot of the current store state, e.g. right before calling a
 * future "Save" API. Not reactive — for a live-updating Portfolio object in
 * a render tree, use `usePortfolioSnapshot()` instead.
 */
export function buildPortfolioSnapshot(
  existing?: Partial<Pick<Portfolio["metadata"], "id" | "slug" | "createdAt">> & { templateId?: string }
): Portfolio {
  const state = useGeneratorStore.getState();
  return portfolioFromEditorState({ ...state, inspirationImages: state.assets.inspirationImages }, existing);
}

/**
 * Reactive version for use inside React components/hooks — re-renders
 * whenever any of the underlying slices change. This is what the live
 * editor preview uses to get a `Portfolio` object to hand to
 * `PortfolioRenderer` without the renderer ever touching Zustand itself.
 */
export function usePortfolioSnapshot(
  existing?: Partial<Pick<Portfolio["metadata"], "id" | "slug" | "createdAt">> & { templateId?: string }
): Portfolio {
  // A stable identity for the session so the id/slug/createdAt don't change
  // on every keystroke — `portfolioFromEditorState` would otherwise mint a
  // fresh random id each call. Callers that already know the real metadata
  // (loading an existing portfolio) pass it via `existing` and override this.
  const [sessionDefaults] = useState<Pick<Portfolio["metadata"], "id" | "slug" | "createdAt">>(() => {
    const id = generateId();
    return { id, slug: id, createdAt: new Date().toISOString() };
  });

  const state = useGeneratorStore(
    useShallow((s) => ({
      resumeData: s.resumeData,
      designTokens: s.designTokens,
      textStyles: s.textStyles,
      decorations: s.decorations,
      inspirationImages: s.assets.inspirationImages,
      sectionBackgrounds: s.sectionBackgrounds,
      sectionAnimations: s.sectionAnimations,
      sectionVisibility: s.sectionVisibility,
      sectionOrder: s.sectionOrder,
      sectionCopy: s.sectionCopy,
      templateId: s.templateId,
    }))
  );
  return portfolioFromEditorState(state, { ...sessionDefaults, ...existing });
}
