import { useGeneratorStore } from "@/lib/store/generator-store";
import { Portfolio } from "@/types/portfolio";
import { generateId } from "@/lib/utils";

/**
 * Assembles the current in-memory editing state into the canonical
 * `Portfolio` shape (types/portfolio.ts). This is the seam a future "Save"
 * action calls before sending to a database, and what a future "Publish"
 * flow persists and renders from a public URL.
 *
 * Pass the existing metadata when re-saving a portfolio that already has an
 * id/slug/createdAt, so those stay stable across edits; omit it for a brand
 * new portfolio. This function only builds the object — it doesn't write
 * anywhere. Call it from a client component (it reads live store state).
 */
export function buildPortfolioSnapshot(
  existingMetadata?: Pick<Portfolio["metadata"], "id" | "slug" | "createdAt">
): Portfolio {
  const state = useGeneratorStore.getState();
  const now = new Date().toISOString();

  return {
    metadata: {
      id: existingMetadata?.id ?? generateId(),
      slug: existingMetadata?.slug ?? generateId(),
      name: state.resumeData.name.trim() || "Untitled portfolio",
      status: "draft",
      createdAt: existingMetadata?.createdAt ?? now,
      updatedAt: now,
    },
    content: {
      resume: state.resumeData,
      // Reserved — see types/portfolio.ts. Not yet populated by anything.
      achievements: [],
      certifications: [],
      testimonials: [],
    },
    design: {
      tokens: state.designTokens,
      textStyles: state.textStyles,
      decorations: state.decorations,
    },
    sections: {
      visibility: state.sectionVisibility,
      animations: state.sectionAnimations,
      backgrounds: state.sectionBackgrounds,
      copy: state.sectionCopy,
    },
  };
}
