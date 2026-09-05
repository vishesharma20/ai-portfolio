import { z } from "zod";

export const moodOptions = [
  "minimal",
  "bold",
  "editorial",
  "playful",
  "luxury",
  "technical",
] as const;

export const typographyStyleOptions = [
  "modern-sans",
  "classic-serif",
  "geometric",
  "monospace-technical",
  "elegant-serif",
  "rounded-friendly",
  "bold-display",
  "handwritten",
  "condensed",
] as const;

export const layoutDensityOptions = ["airy", "balanced", "dense"] as const;

export const backgroundStyleOptions = [
  "plain",
  "gradient",
  "mesh",
  "aurora",
  "grid",
  "dots",
  "noise",
  "rays",
] as const;

export const animationStyleOptions = [
  "rise",
  "fade",
  "slide",
  "zoom",
  "blur",
  "bounce",
  "pop",
  "drop",
  "unfold",
  "flip",
  "none",
] as const;

export const designTokensSchema = z.object({
  primaryColor: z.string(),
  accentColor: z.string(),
  backgroundColor: z.string(),
  surfaceColor: z.string(),
  typographyStyle: z.enum(typographyStyleOptions),
  layoutDensity: z.enum(layoutDensityOptions),
  borderRadius: z.number().min(0).max(32),
  mood: z.enum(moodOptions),
  animationIntensity: z.number().min(0).max(100),
  animationStyle: z.enum(animationStyleOptions),
  /** Ambient full-page backdrop layer, independent of any uploaded photo backdrop. */
  backgroundStyle: z.enum(backgroundStyleOptions),
  /** Whether the ambient backdrop layer (gradient/mesh/aurora/rays) drifts continuously. Grid/dots/noise ignore this and stay static either way. */
  backgroundAnimated: z.boolean(),
  /** Data URL of an uploaded inspiration image used as a background accent. Empty string = none. */
  backgroundImageUrl: z.string(),
  /** 0-100: how blurred/tinted per-section background images render. 0 = clean/sharp, 100 = very soft. */
  backgroundBlur: z.number().min(0).max(100),
  /** Crop/pan framing shared by the hero image and every section backdrop. */
  backgroundFocusX: z.number().min(0).max(100),
  backgroundFocusY: z.number().min(0).max(100),
  backgroundZoom: z.number().min(1).max(2.5),
});

export type DesignTokens = z.infer<typeof designTokensSchema>;

export const defaultDesignTokens: DesignTokens = {
  primaryColor: "#7C5CFC",
  accentColor: "#2FE0C4",
  backgroundColor: "#09090B",
  surfaceColor: "#121216",
  typographyStyle: "modern-sans",
  layoutDensity: "balanced",
  borderRadius: 16,
  mood: "minimal",
  animationIntensity: 60,
  animationStyle: "rise",
  backgroundStyle: "plain",
  backgroundAnimated: true,
  backgroundImageUrl: "",
  backgroundBlur: 45,
  backgroundFocusX: 50,
  backgroundFocusY: 50,
  backgroundZoom: 1.1,
};
