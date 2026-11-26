import { describe, it, expect, beforeEach, vi } from "vitest";
import { portfolioFromEditorState, EditorPortfolioState } from "@/lib/portfolio/convert";
import { useGeneratorStore } from "@/lib/store/generator-store";
import { emptyResumeData } from "@/types/resume";
import { defaultDesignTokens } from "@/types/design-tokens";
import { DEFAULT_SECTION_ORDER, defaultSectionCopy } from "@/types/portfolio";

function baseEditorState(templateId: string): EditorPortfolioState {
  return {
    resumeData: {
      ...emptyResumeData,
      name: "Ada Lovelace",
      title: "Software Engineer",
      experience: [
        { id: "e1", role: "Engineer", company: "Acme", location: "", startDate: "", endDate: "Present", description: "", highlights: [] },
      ],
      projects: [{ id: "p1", title: "A cool project", description: "", tags: [], link: "", year: "" }],
      skills: ["TypeScript", "React"],
    },
    designTokens: defaultDesignTokens,
    textStyles: {},
    decorations: [],
    inspirationImages: [],
    sectionBackgrounds: {},
    sectionAnimations: {},
    sectionVisibility: {},
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    sectionCopy: defaultSectionCopy,
    templateId,
  };
}

describe("template switching — pure conversion", () => {
  it("changes only the template, never resume/projects/experience content", () => {
    const before = portfolioFromEditorState(baseEditorState("default"), { id: "p", slug: "p", createdAt: "2024-01-01" });
    const after = portfolioFromEditorState(baseEditorState("cinematic"), { id: "p", slug: "p", createdAt: "2024-01-01" });

    expect(before.template.templateId).toBe("default");
    expect(after.template.templateId).toBe("cinematic");

    // Content is byte-identical across the switch.
    expect(after.content.resume).toEqual(before.content.resume);
    expect(after.content.resume.experience).toEqual(before.content.resume.experience);
    expect(after.content.resume.projects).toEqual(before.content.resume.projects);
    expect(after.content.resume.skills).toEqual(before.content.resume.skills);
  });

  it("an unknown/foreign templateId still round-trips through the canonical snapshot without crashing", () => {
    const portfolio = portfolioFromEditorState(baseEditorState("some-template-from-the-future"), {
      id: "p",
      slug: "p",
      createdAt: "2024-01-01",
    });
    expect(portfolio.template.templateId).toBe("some-template-from-the-future");
    expect(portfolio.content.resume.name).toBe("Ada Lovelace");
  });
});

describe("template switching — real Zustand store", () => {
  beforeEach(() => {
    useGeneratorStore.getState().actions.reset();
  });

  it("setTemplateId changes only templateId, leaving resume/projects/experience untouched", () => {
    const { actions } = useGeneratorStore.getState();
    actions.updateResumeField("name", "Grace Hopper");
    actions.addExperience();
    actions.addProject();

    const beforeResume = useGeneratorStore.getState().resumeData;
    expect(useGeneratorStore.getState().templateId).toBe("default");

    actions.setTemplateId("glass");

    const afterState = useGeneratorStore.getState();
    expect(afterState.templateId).toBe("glass");
    expect(afterState.resumeData).toEqual(beforeResume);
    expect(afterState.resumeData.experience).toHaveLength(1);
    expect(afterState.resumeData.projects).toHaveLength(1);
  });

  it("the selected template persists through the canonical portfolio snapshot (buildPortfolioSnapshot)", async () => {
    const { actions } = useGeneratorStore.getState();
    actions.setTemplateId("brutalist");

    const { buildPortfolioSnapshot } = await import("@/lib/portfolio/convert");
    const snapshot = buildPortfolioSnapshot();
    expect(snapshot.template.templateId).toBe("brutalist");
  });

  it("reset() returns templateId to the default", () => {
    const { actions } = useGeneratorStore.getState();
    actions.setTemplateId("whimsical");
    expect(useGeneratorStore.getState().templateId).toBe("whimsical");

    actions.reset();
    expect(useGeneratorStore.getState().templateId).toBe("default");
  });

  it("loadPortfolio hydrates templateId from the loaded portfolio", async () => {
    const { createEmptyPortfolio } = await import("@/lib/portfolio/defaults");
    const portfolio = createEmptyPortfolio();
    portfolio.template.templateId = "cinematic";

    useGeneratorStore.getState().actions.loadPortfolio(portfolio);
    expect(useGeneratorStore.getState().templateId).toBe("cinematic");
  });

  it("template switches participate in undo/redo", async () => {
    vi.useFakeTimers();
    try {
      const { actions } = useGeneratorStore.getState();
      // Undo/redo history is debounced (see generator-store.ts's `handleSet`)
      // to collapse rapid changes into one entry — advance past that window
      // between each change so this test produces two distinct history
      // entries, the same way two real, separated edits would.
      actions.setTemplateId("cinematic");
      await vi.advanceTimersByTimeAsync(600);
      expect(useGeneratorStore.getState().templateId).toBe("cinematic");

      actions.setTemplateId("glass");
      await vi.advanceTimersByTimeAsync(600);
      expect(useGeneratorStore.getState().templateId).toBe("glass");

      useGeneratorStore.temporal.getState().undo();
      expect(useGeneratorStore.getState().templateId).toBe("cinematic");

      useGeneratorStore.temporal.getState().redo();
      expect(useGeneratorStore.getState().templateId).toBe("glass");
    } finally {
      vi.useRealTimers();
    }
  });
});
