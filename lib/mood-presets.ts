import { DesignTokens, typographyStyleOptions, backgroundStyleOptions } from "@/types/design-tokens";

export interface MoodPreset {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  typographyStyle: (typeof typographyStyleOptions)[number];
  mood: DesignTokens["mood"];
  backgroundStyle: (typeof backgroundStyleOptions)[number];
}

// Curated color + typography pairings for each mood. Used by the simulated
// ("mock") inspiration analysis, and directly by UI controls that let
// someone apply a mood without uploading an image at all. Each mood also
// suggests a matching ambient background layer, so picking a mood changes
// the whole feel in one click rather than just recoloring text.
export const MOOD_PRESETS: MoodPreset[] = [
  { primaryColor: "#7C5CFC", accentColor: "#2FE0C4", backgroundColor: "#09090B", surfaceColor: "#121216", typographyStyle: "modern-sans", mood: "minimal", backgroundStyle: "plain" },
  { primaryColor: "#FF6B4A", accentColor: "#FFD166", backgroundColor: "#120A06", surfaceColor: "#1D120A", typographyStyle: "geometric", mood: "bold", backgroundStyle: "rays" },
  { primaryColor: "#D4AF37", accentColor: "#F3E9D2", backgroundColor: "#0B0B0A", surfaceColor: "#171614", typographyStyle: "elegant-serif", mood: "luxury", backgroundStyle: "mesh" },
  { primaryColor: "#4FE0D6", accentColor: "#E0A64E", backgroundColor: "#0A0C0A", surfaceColor: "#111411", typographyStyle: "monospace-technical", mood: "technical", backgroundStyle: "grid" },
  { primaryColor: "#FF4FA3", accentColor: "#5CE1FF", backgroundColor: "#0C0714", surfaceColor: "#170F26", typographyStyle: "rounded-friendly", mood: "playful", backgroundStyle: "aurora" },
  { primaryColor: "#EAEAEA", accentColor: "#9B8CFF", backgroundColor: "#0A0A0A", surfaceColor: "#151515", typographyStyle: "classic-serif", mood: "editorial", backgroundStyle: "noise" },
];

export function getPresetForMood(mood: DesignTokens["mood"]): MoodPreset {
  return MOOD_PRESETS.find((p) => p.mood === mood) ?? MOOD_PRESETS[0];
}
