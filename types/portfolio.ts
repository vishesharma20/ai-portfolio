import { z } from "zod";
import { resumeDataSchema } from "./resume";
import { designTokensSchema, animationStyleOptions, typographyStyleOptions } from "./design-tokens";

/**
 * This file is the canonical, runtime-validated representation of a
 * portfolio — the single source of truth the editor, renderer, templates,
 * and (eventually) a database all agree on. Types are inferred from Zod
 * schemas rather than hand-written, so the compile-time contract and the
 * runtime validation can never drift apart.
 *
 * `lib/store/generator-store.ts` (the Zustand editor state) imports the
 * shared pieces — `PortfolioSectionKey`, `Decoration`, `TextStyleOverride`,
 * `SectionCopy`, etc. — from here rather than redeclaring them, so there is
 * exactly one definition of each. The store still keeps its own flat slices
 * for editing ergonomics; `lib/portfolio/convert.ts` is what reshapes those
 * slices into (and out of) the `Portfolio` shape defined below.
 */

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export const portfolioSectionKeys = ["hero", "about", "skills", "experience", "projects", "contact"] as const;
export const portfolioSectionKeySchema = z.enum(portfolioSectionKeys);
export type PortfolioSectionKey = z.infer<typeof portfolioSectionKeySchema>;

/** Human-readable label for each section, used in editor UI (sidebar, section toolbar). */
export const portfolioSectionLabels: Record<PortfolioSectionKey, string> = {
  hero: "Hero",
  about: "About",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  contact: "Contact",
};

/** Safe default render order. Nothing in the renderer assumes hero must be first — it's just first here. */
export const DEFAULT_SECTION_ORDER: PortfolioSectionKey[] = [...portfolioSectionKeys];

// ---------------------------------------------------------------------------
// Decorations (stickers/borders placed over the page)
// ---------------------------------------------------------------------------

export const stickerMotionSchema = z.enum([
  "none",
  "float",
  "pulse",
  "spin",
  "wiggle",
  "bounce",
  "shake",
  "swing",
  "orbit",
  "drift",
  "tada",
  "heartbeat",
  "wobble",
  "twinkle",
  "bob",
  "breathe",
  "flip",
  "levitate",
]);
export type StickerMotion = z.infer<typeof stickerMotionSchema>;

export const decorationSchema = z.object({
  id: z.string(),
  kind: z.enum(["emoji", "image", "border"]),
  content: z.string(),
  xPercent: z.number(),
  yPercent: z.number(),
  motion: stickerMotionSchema.optional(),
  /** Character stickers can react to hover/tap in the read-only portfolio preview. */
  interactive: z.boolean().optional(),
  scale: z.number(),
  rotation: z.number(),
  widthPx: z.number().optional(),
  heightPx: z.number().optional(),
  cropScale: z.number().optional(),
  cropX: z.number().optional(),
  cropY: z.number().optional(),
  color: z.string().optional(),
});
export type Decoration = z.infer<typeof decorationSchema>;

// ---------------------------------------------------------------------------
// Inline text styling overrides (per-field color/size/animation from the toolbar)
// ---------------------------------------------------------------------------

export const textAnimationSchema = z.enum(["none", "typewriter", "fade", "bounce", "slide", "zoom", "flip", "pulse", "rotate"]);
export type TextAnimation = z.infer<typeof textAnimationSchema>;

export const textStyleOverrideSchema = z.object({
  color: z.string().optional(),
  fontSizePx: z.number().optional(),
  typographyStyle: z.enum(typographyStyleOptions).optional(),
  animation: textAnimationSchema.optional(),
});
export type TextStyleOverride = z.infer<typeof textStyleOverrideSchema>;

// ---------------------------------------------------------------------------
// Section-level configuration
// ---------------------------------------------------------------------------

export const sectionBackgroundConfigSchema = z.object({
  url: z.string(),
  blur: z.number().optional(),
  focusX: z.number().optional(),
  focusY: z.number().optional(),
  zoom: z.number().optional(),
});
export type SectionBackgroundConfig = z.infer<typeof sectionBackgroundConfigSchema>;

export const sectionCopySchema = z.object({
  aboutLabel: z.string().default("About"),
  skillsLabel: z.string().default("Skills"),
  experienceLabel: z.string().default("Experience"),
  projectsLabel: z.string().default("Projects"),
  contactLabel: z.string().default("Contact"),
  contactHeading: z.string().default("Let's work together."),
});
export type SectionCopy = z.infer<typeof sectionCopySchema>;

/** `sectionCopySchema` parsed with no input — the one place its field defaults are materialized into a real object. */
export const defaultSectionCopy: SectionCopy = sectionCopySchema.parse({});

export const sectionAnimationOverrideSchema = z.enum(animationStyleOptions);

export const portfolioSectionsConfigSchema = z.object({
  order: z.array(portfolioSectionKeySchema).default([...DEFAULT_SECTION_ORDER]),
  visibility: z.record(portfolioSectionKeySchema, z.boolean()).default({}),
  backgrounds: z.record(portfolioSectionKeySchema, sectionBackgroundConfigSchema).default({}),
  animations: z.record(portfolioSectionKeySchema, sectionAnimationOverrideSchema).default({}),
  copy: sectionCopySchema.default(defaultSectionCopy),
});
export type PortfolioSectionsConfig = z.infer<typeof portfolioSectionsConfigSchema>;

// ---------------------------------------------------------------------------
// Reserved content — see doc comment on `portfolioContentSchema` below.
// ---------------------------------------------------------------------------

export const portfolioAchievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  date: z.string().optional(),
});
export type PortfolioAchievement = z.infer<typeof portfolioAchievementSchema>;

export const portfolioCertificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
});
export type PortfolioCertification = z.infer<typeof portfolioCertificationSchema>;

export const portfolioTestimonialSchema = z.object({
  id: z.string(),
  quote: z.string(),
  author: z.string(),
  role: z.string().optional(),
});
export type PortfolioTestimonial = z.infer<typeof portfolioTestimonialSchema>;

/**
 * `achievements`/`certifications`/`testimonials` are reserved for a future
 * content phase: not editable in the UI, not populated by AI extraction or
 * GitHub import, not rendered by any template. They default to empty arrays
 * so nothing changes today — they exist so the schema won't need a breaking
 * change when that work starts.
 */
export const portfolioContentSchema = z.object({
  resume: resumeDataSchema,
  achievements: z.array(portfolioAchievementSchema).default([]),
  certifications: z.array(portfolioCertificationSchema).default([]),
  testimonials: z.array(portfolioTestimonialSchema).default([]),
});
export type PortfolioContent = z.infer<typeof portfolioContentSchema>;

// ---------------------------------------------------------------------------
// Appearance
// ---------------------------------------------------------------------------

export const portfolioAppearanceSchema = z.object({
  tokens: designTokensSchema,
  textStyles: z.record(z.string(), textStyleOverrideSchema).default({}),
  decorations: z.array(decorationSchema).default([]),
  /** Uploaded moodboard images. Affects rendering directly — PortfolioTemplate cycles through these as an automatic per-section backdrop wherever a section has no explicit background override — so it belongs on the canonical portfolio, not just wizard-only asset state. */
  inspirationImages: z.array(z.string()).default([]),
});
export type PortfolioAppearance = z.infer<typeof portfolioAppearanceSchema>;

// ---------------------------------------------------------------------------
// Template selection
// ---------------------------------------------------------------------------

/** Deliberately a bare string, not an enum — the template registry (features/portfolio/templates/registry.ts) owns which ids exist and falls back safely for an unknown one. */
export const portfolioTemplateConfigSchema = z.object({
  templateId: z.string().default("default"),
});
export type PortfolioTemplateConfig = z.infer<typeof portfolioTemplateConfigSchema>;

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const portfolioStatusSchema = z.enum(["draft", "published"]);
export type PortfolioStatus = z.infer<typeof portfolioStatusSchema>;

export const portfolioMetadataSchema = z.object({
  /** Client-generated for now (see lib/portfolio/defaults.ts) — swap for a real DB id once persistence exists. */
  id: z.string(),
  /** URL-safe identifier for the future public route, e.g. portfolio.ai/p/{slug}. */
  slug: z.string(),
  name: z.string().default("Untitled portfolio"),
  status: portfolioStatusSchema.default("draft"),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PortfolioMetadata = z.infer<typeof portfolioMetadataSchema>;

// ---------------------------------------------------------------------------
// The canonical Portfolio
// ---------------------------------------------------------------------------

/**
 * The full, structured representation of one portfolio — everything needed
 * to render it, independent of the in-memory editing store or the generator
 * wizard. This is what a future "Save" action sends to a database and what
 * a future public portfolio page/export renders from.
 */
export const portfolioSchema = z.object({
  metadata: portfolioMetadataSchema,
  content: portfolioContentSchema,
  appearance: portfolioAppearanceSchema,
  sections: portfolioSectionsConfigSchema,
  // `.default(...)` at THIS level (not just on templateId inside the nested
  // schema) matters: without it, a stored portfolio JSON blob that predates
  // the template field entirely (no `template` key at all) would fail this
  // whole schema's parse — and lib/db/portfolios.ts's rowToPortfolio()
  // reacts to a failed parse by discarding the ENTIRE portfolio body, not
  // just filling in a missing template. This default is what makes an
  // old/foreign row degrade to "safe default template", not "empty
  // portfolio" — see Stage 6 requirement 16/17.
  template: portfolioTemplateConfigSchema.default({ templateId: "default" }),
});
export type Portfolio = z.infer<typeof portfolioSchema>;
