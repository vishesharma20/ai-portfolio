import { DesignTokens, defaultDesignTokens, layoutDensityOptions } from "@/types/design-tokens";
import { MOOD_PRESETS } from "@/lib/mood-presets";

/** Simple deterministic hash so the same image always yields the same tokens. */
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function mockAnalyzeInspiration(seed: string): DesignTokens {
  const hash = hashString(seed || String(Date.now()));
  const preset = MOOD_PRESETS[hash % MOOD_PRESETS.length];
  const density = layoutDensityOptions[hash % layoutDensityOptions.length];
  const borderRadius = [8, 12, 16, 20, 24][hash % 5];
  const animationIntensity = 40 + (hash % 5) * 12; // 40-88

  return {
    ...defaultDesignTokens,
    ...preset,
    layoutDensity: density,
    borderRadius,
    animationIntensity,
  };
}
