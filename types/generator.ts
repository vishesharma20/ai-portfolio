export const GENERATOR_STEPS = [
  "upload",
  "confirm",
  "inspiration",
  "generating",
  "editor",
] as const;

export type GeneratorStep = (typeof GENERATOR_STEPS)[number];

export type EntryMode = "resume" | "manual";

export interface UploadedAssets {
  resumeFile: File | null;
  resumeFileName: string | null;
  photoDataUrl: string | null;
  inspirationImages: string[];
}
