"use client";

import { DesignTokens } from "@/types/design-tokens";
import { getMotionConfig } from "@/lib/design-tokens";
import { useGeneratorStore, PortfolioSectionKey } from "@/lib/store/generator-store";

/**
 * Resolves the Framer Motion config for one portfolio section: an explicit
 * per-section override from the Motion > Per-section list if set, otherwise
 * the global animation style + intensity from Design Tokens.
 */
export function useSectionMotion(section: PortfolioSectionKey, tokens: DesignTokens) {
  const override = useGeneratorStore((s) => s.sectionAnimations[section]);
  return getMotionConfig(tokens.animationIntensity, override ?? tokens.animationStyle);
}
