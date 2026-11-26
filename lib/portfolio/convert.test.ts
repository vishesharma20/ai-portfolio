import { describe, it, expect } from "vitest";
import { portfolioFromEditorState, EditorPortfolioState } from "./convert";
import { emptyResumeData } from "@/types/resume";
import { defaultDesignTokens } from "@/types/design-tokens";
import { DEFAULT_SECTION_ORDER, defaultSectionCopy } from "@/types/portfolio";

function state(): EditorPortfolioState {
  return {
    resumeData: { ...emptyResumeData, name: "Ada Lovelace" },
    designTokens: defaultDesignTokens,
    textStyles: {},
    decorations: [],
    inspirationImages: [],
    sectionBackgrounds: {},
    sectionAnimations: {},
    sectionVisibility: {},
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    sectionCopy: defaultSectionCopy,
    templateId: "default",
  };
}

describe("portfolioFromEditorState — snapshot stability (regression)", () => {
  /**
   * The live editor rebuilds this snapshot on every render
   * (usePortfolioSnapshot), and SaveCoordinator's default dedup key is
   * `JSON.stringify(snapshot)` (see save-coordinator.ts). If any field is
   * re-stamped with a fresh value on every call regardless of actual
   * content — `metadata.updatedAt` used to be `new Date().toISOString()`
   * on every call — the coordinator can never recognize "nothing actually
   * changed", and ends up scheduling a redundant save after every single
   * render, forever. This test pins that invariant directly so it can't
   * regress silently.
   */
  it("produces byte-identical JSON for the same input + identity across repeated calls", () => {
    const existing = { id: "p1", slug: "p1", createdAt: "2024-01-01T00:00:00.000Z" };
    const first = JSON.stringify(portfolioFromEditorState(state(), existing));
    const second = JSON.stringify(portfolioFromEditorState(state(), existing));
    const third = JSON.stringify(portfolioFromEditorState(state(), existing));

    expect(second).toBe(first);
    expect(third).toBe(first);
  });

  it("does change when the actual content changes", () => {
    const existing = { id: "p1", slug: "p1", createdAt: "2024-01-01T00:00:00.000Z" };
    const before = JSON.stringify(portfolioFromEditorState(state(), existing));
    const changed = state();
    changed.templateId = "cinematic";
    const after = JSON.stringify(portfolioFromEditorState(changed, existing));

    expect(after).not.toBe(before);
  });
});
