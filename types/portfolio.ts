import { ResumeData } from "./resume";
import { DesignTokens } from "./design-tokens";
import {
  Decoration,
  PortfolioSectionKey,
  SectionBackgroundConfig,
  SectionCopy,
  TextStyleOverride,
} from "@/lib/store/generator-store";

export type PortfolioStatus = "draft" | "published";

export interface PortfolioMetadata {
  /** Stable identifier. Currently client-generated (see buildPortfolioSnapshot) — swap for a real DB/UUID id once persistence exists. */
  id: string;
  /** URL-safe identifier for the future public route, e.g. portfolio.ai/p/{slug}. */
  slug: string;
  name: string;
  status: PortfolioStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Reserved content sections matching the long-term product model. None of
 * these are editable in the UI, populated by AI extraction/GitHub import, or
 * rendered by any template yet — that's future feature work. They exist here
 * now purely so the schema doesn't need a breaking change when that work
 * starts; every array defaults to empty and nothing currently reads them.
 */
export interface PortfolioAchievement {
  id: string;
  title: string;
  description?: string;
  date?: string;
}

export interface PortfolioCertification {
  id: string;
  name: string;
  issuer?: string;
  date?: string;
  url?: string;
}

export interface PortfolioTestimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
}

/**
 * The full, structured representation of one portfolio — everything needed
 * to re-render it, independent of the in-memory editing store. This is the
 * single source of truth the editor, preview, AI generator, templates, and
 * (eventually) a database should all agree on.
 *
 * The Zustand store (lib/store/generator-store.ts) keeps these as separate
 * top-level slices for editing ergonomics — fine-grained selectors, simpler
 * actions, less re-rendering. `buildPortfolioSnapshot()` is the seam that
 * assembles those slices into this shape, which is what a future "Save"
 * action would send to a database and a future "Publish" flow would render
 * from a public URL. Nothing calls it yet — there is nowhere to send the
 * result to until persistence exists.
 */
export interface Portfolio {
  metadata: PortfolioMetadata;
  content: {
    resume: ResumeData;
    achievements: PortfolioAchievement[];
    certifications: PortfolioCertification[];
    testimonials: PortfolioTestimonial[];
  };
  design: {
    tokens: DesignTokens;
    textStyles: Record<string, TextStyleOverride>;
    decorations: Decoration[];
  };
  sections: {
    visibility: Partial<Record<PortfolioSectionKey, boolean>>;
    animations: Partial<Record<PortfolioSectionKey, DesignTokens["animationStyle"]>>;
    backgrounds: Partial<Record<PortfolioSectionKey, SectionBackgroundConfig>>;
    copy: SectionCopy;
  };
}
