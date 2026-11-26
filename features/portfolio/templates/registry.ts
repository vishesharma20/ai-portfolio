import { ComponentType } from "react";
import { Portfolio } from "@/types/portfolio";
import { PortfolioTemplate } from "@/features/portfolio/portfolio-template";
import { CinematicTemplate } from "@/features/portfolio/templates/cinematic-template";
import { WhimsicalTemplate } from "@/features/portfolio/templates/whimsical-template";
import { BrutalistTemplate } from "@/features/portfolio/templates/brutalist-template";
import { GlassTemplate } from "@/features/portfolio/templates/glass-template";
import { BentoTemplate } from "@/features/portfolio/templates/bento-template";
import { EditorialTemplate } from "@/features/portfolio/templates/editorial-template";
import { NeonTemplate } from "@/features/portfolio/templates/neon-template";

/** What a template receives to render a portfolio. Every template gets the same props — only the layout/JSX differs. Templates read ONLY this prop: never Zustand, never the database, never a server action, and never mutate global editor state directly (inline editing, when enabled, flows through the `PortfolioEditProvider` an ancestor sets up — see portfolio-renderer.tsx and portfolio-editor-context.tsx — not through anything a template touches itself). */
export interface PortfolioTemplateRenderProps {
  portfolio: Portfolio;
}

export interface PortfolioTemplateCapabilities {
  supportsHero: boolean;
  supportsAbout: boolean;
  supportsSkills: boolean;
  supportsExperience: boolean;
  supportsProjects: boolean;
  supportsContact: boolean;
  supportsAnimations: boolean;
}

/** Every current template supports every canonical section plus animation — this is the shared baseline; a future template with narrower support overrides just the fields that differ. */
const FULL_CAPABILITIES: PortfolioTemplateCapabilities = {
  supportsHero: true,
  supportsAbout: true,
  supportsSkills: true,
  supportsExperience: true,
  supportsProjects: true,
  supportsContact: true,
  supportsAnimations: true,
};

export interface PortfolioTemplateDefinition {
  id: string;
  name: string;
  description: string;
  /** Groups templates in a future filterable gallery (Stage 6 requirement 15). Not used for filtering yet — just data. */
  category: string;
  /** Path to a static preview thumbnail. None exist yet — the template gallery renders a live mini-preview from real portfolio data instead (see features/portfolio/templates/template-gallery.tsx). Reserved for when static thumbnails are worth the asset-management cost. */
  preview?: string;
  capabilities: PortfolioTemplateCapabilities;
  /**
   * The template's own render component. Named `render` (not `component`)
   * to match the one that already existed here before Stage 6 — every
   * caller (portfolio-renderer.tsx) already depends on this name, and
   * there's no behavioral difference, so renaming it would just be
   * unnecessary churn.
   */
  render: ComponentType<PortfolioTemplateRenderProps>;
}

/**
 * The template registry — the single source of truth for which templates
 * exist. `portfolio.template.templateId` selects an entry here;
 * `PortfolioRenderer` is the only thing that reads this registry. Adding a
 * another template later means adding one entry here (plus the template's own
 * component file) — nothing else in the render tree, editor, or persistence
 * layer needs to change.
 *
 * `"default"` is kept as a permanent alias for `"minimal"` (same
 * definition, same `render` component) so every portfolio saved before
 * Stage 6 — whose `template.templateId` is `"default"`, the schema's
 * long-standing default — keeps rendering exactly as it always has. New
 * code should refer to `"minimal"`; `"default"` exists purely for backward
 * compatibility with already-persisted data.
 */
const minimalDefinition: PortfolioTemplateDefinition = {
  id: "default",
  name: "Minimal",
  description: "The original single-page layout: generous whitespace, elegant typography, a clean resume-like hierarchy.",
  category: "professional",
  capabilities: FULL_CAPABILITIES,
  render: PortfolioTemplate,
};

export const TEMPLATE_REGISTRY: Record<string, PortfolioTemplateDefinition> = {
  default: minimalDefinition,
  minimal: minimalDefinition,
  cinematic: {
    id: "cinematic",
    name: "Cinematic",
    description: "Dark editorial aesthetic with large typography, a dramatic hero, and premium project presentation.",
    category: "creative",
    capabilities: FULL_CAPABILITIES,
    render: CinematicTemplate,
  },
  whimsical: {
    id: "whimsical",
    name: "Whimsical",
    description: "Friendly, rounded, personality-driven — playful without becoming childish.",
    category: "creative",
    capabilities: FULL_CAPABILITIES,
    render: WhimsicalTemplate,
  },
  brutalist: {
    id: "brutalist",
    name: "Brutalist",
    description: "High-contrast, grid-driven, intentionally raw — bold typography and sharp section dividers.",
    category: "creative",
    capabilities: FULL_CAPABILITIES,
    render: BrutalistTemplate,
  },
  glass: {
    id: "glass",
    name: "Glass",
    description: "Modern, futuristic, translucent surfaces with depth and layered cards — a premium technology feel.",
    category: "technology",
    capabilities: FULL_CAPABILITIES,
    render: GlassTemplate,
  },
  bento: {
    id: "bento",
    name: "Bento Grid",
    description: "A flexible grid of rounded content cards that makes projects and skills easy to scan.",
    category: "creative",
    capabilities: FULL_CAPABILITIES,
    render: BentoTemplate,
  },
  editorial: {
    id: "editorial",
    name: "Editorial",
    description: "Magazine-like typography and a guided timeline for a polished personal story.",
    category: "professional",
    capabilities: FULL_CAPABILITIES,
    render: EditorialTemplate,
  },
  neon: {
    id: "neon",
    name: "Neon Circuit",
    description: "A bright, high-energy portfolio with glowing outlines and technical details.",
    category: "technology",
    capabilities: FULL_CAPABILITIES,
    render: NeonTemplate,
  },
};

export const DEFAULT_TEMPLATE_ID = "default";

/** Every distinct template, deduplicated — `"default"`/`"minimal"` share one definition and appear once, keyed by their canonical `"default"` id. Used by the template gallery. */
export function listTemplates(): PortfolioTemplateDefinition[] {
  const seen = new Set<PortfolioTemplateDefinition>();
  const out: PortfolioTemplateDefinition[] = [];
  for (const def of Object.values(TEMPLATE_REGISTRY)) {
    if (seen.has(def)) continue;
    seen.add(def);
    out.push(def);
  }
  return out;
}

export function templateExists(templateId: string | undefined): boolean {
  return Boolean(templateId && templateId in TEMPLATE_REGISTRY);
}

/** Looks up a template by id, falling back to the default template for an unknown/missing id rather than throwing. This is what makes an old, foreign, or corrupted `templateId` degrade safely instead of crashing the portfolio (Stage 6 requirement 17). */
export function getTemplate(templateId: string | undefined): PortfolioTemplateDefinition {
  return (templateId && TEMPLATE_REGISTRY[templateId]) || TEMPLATE_REGISTRY[DEFAULT_TEMPLATE_ID];
}
