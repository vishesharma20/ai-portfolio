import { DEFAULT_SECTION_ORDER, Portfolio, PortfolioSectionKey, portfolioSectionKeys } from "@/types/portfolio";

/** What a resolved section backdrop looks like — same shape `portfolio-template.tsx` has always produced, just given a shared name so templates other than the original one can use it too. */
export interface ResolvedBackdrop {
  url?: string;
  intensity: number;
  focusX: number;
  focusY: number;
  zoom: number;
}

/** Stable per-section offset into the inspiration-image cycle — independent of render/section order. */
const SECTION_AUTO_OFFSET: Partial<Record<PortfolioSectionKey, number>> = {
  about: 1,
  skills: 2,
  experience: 3,
  projects: 4,
  contact: 5,
};

/**
 * Resolves which order to render sections in for a given template.
 *
 * `portfolio.sections.order` is the single source of truth once a person
 * has actually reordered sections (via the section toolbar's move up/down
 * controls) — that explicit choice always wins, for every template. Until
 * then, `portfolio.sections.order` just holds the untouched canonical
 * default (`DEFAULT_SECTION_ORDER`), so it's safe for a template to prefer
 * its own natural default order in that case (Stage 6 requirement 6) without
 * ever overriding a real user choice.
 *
 * Defensive against a corrupted/partial stored order (e.g. from an older
 * schema revision): any section key missing from the resolved order is
 * appended at the end, so a template can never silently drop content.
 */
export function resolveSectionOrder(portfolio: Portfolio, templateDefaultOrder: PortfolioSectionKey[]): PortfolioSectionKey[] {
  const stored = portfolio.sections.order;
  const isUntouched =
    stored.length === DEFAULT_SECTION_ORDER.length && stored.every((key, i) => key === DEFAULT_SECTION_ORDER[i]);
  const base = isUntouched ? templateDefaultOrder : stored;
  const missing = portfolioSectionKeys.filter((key) => !base.includes(key));
  return missing.length ? [...base, ...missing] : base;
}

/**
 * The visibility/backdrop resolution every template needs, in one place.
 * Extracted verbatim from the original (now "minimal") template so every
 * new template gets identical, correct behavior — per-section visibility,
 * the "hero can't be hidden" rule, and the inspiration-image auto-cycling
 * backdrop — without re-deriving any of it.
 */
export function useSectionRuntime(portfolio: Portfolio) {
  const { visibility, backgrounds } = portfolio.sections;
  const tokens = portfolio.appearance.tokens;
  const inspirationImages = portfolio.appearance.inspirationImages;

  const isVisible = (key: PortfolioSectionKey) => key === "hero" || visibility[key] !== false;

  const pick = (offset: number) =>
    inspirationImages.length > 0 ? inspirationImages[offset % inspirationImages.length] : undefined;

  const backdropFor = (key: PortfolioSectionKey): ResolvedBackdrop => {
    const override = backgrounds[key];
    return {
      url: override ? override.url || undefined : pick(SECTION_AUTO_OFFSET[key] ?? 0),
      intensity: override?.blur ?? tokens.backgroundBlur,
      focusX: override?.focusX ?? tokens.backgroundFocusX,
      focusY: override?.focusY ?? tokens.backgroundFocusY,
      zoom: override?.zoom ?? tokens.backgroundZoom,
    };
  };

  return { isVisible, backdropFor };
}
