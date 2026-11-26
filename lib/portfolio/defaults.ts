import { emptyResumeData } from "@/types/resume";
import { defaultDesignTokens } from "@/types/design-tokens";
import { generateId } from "@/lib/utils";
import { Portfolio, DEFAULT_SECTION_ORDER, defaultSectionCopy } from "@/types/portfolio";

/**
 * The single place every "blank portfolio" default is defined. Anywhere
 * that needs a valid, empty starting point — a brand new generator session,
 * a test, a future "create portfolio" API — should call this rather than
 * hand-assembling defaults itself.
 */
export function createEmptyPortfolio(): Portfolio {
  const now = new Date().toISOString();
  const id = generateId();

  return {
    metadata: {
      id,
      slug: id,
      name: "Untitled portfolio",
      status: "draft",
      createdAt: now,
      updatedAt: now,
    },
    content: {
      resume: emptyResumeData,
      achievements: [],
      certifications: [],
      testimonials: [],
    },
    appearance: {
      tokens: defaultDesignTokens,
      textStyles: {},
      decorations: [],
      inspirationImages: [],
    },
    sections: {
      order: [...DEFAULT_SECTION_ORDER],
      visibility: {},
      backgrounds: {},
      animations: {},
      copy: defaultSectionCopy,
    },
    template: {
      templateId: "default",
    },
  };
}
