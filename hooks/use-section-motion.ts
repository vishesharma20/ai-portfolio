import { DesignTokens } from "@/types/design-tokens";
import { getMotionConfig } from "@/lib/design-tokens";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Resolves the Framer Motion config for one portfolio section: an explicit
 * per-section override (from portfolio.sections.animations) if given,
 * otherwise the global animation style + intensity from the design tokens.
 * Respects `prefers-reduced-motion` — entrance animations are skipped
 * entirely for anyone whose OS/browser has that set, regardless of what the
 * portfolio's own animation settings say.
 *
 * The render tree (portfolio-template.tsx, section components) must only
 * depend on props/data, never on the store directly, so it can render a
 * Portfolio object with no generator wizard involved — PortfolioTemplate
 * resolves the override from portfolio.sections.animations[section] and
 * passes it down; this hook only ever reads the browser's media query, not
 * Zustand.
 */
export function useSectionMotion(overrideStyle: DesignTokens["animationStyle"] | undefined, tokens: DesignTokens) {
  const prefersReducedMotion = usePrefersReducedMotion();
  return getMotionConfig(prefersReducedMotion ? 0 : tokens.animationIntensity, overrideStyle ?? tokens.animationStyle);
}
