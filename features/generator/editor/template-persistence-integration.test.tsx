// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGeneratorStore } from "@/lib/store/generator-store";
import type { Portfolio } from "@/types/portfolio";

/**
 * The pure-conversion tests (template-switching.test.ts) prove
 * `portfolioFromEditorState` handles template ids correctly in isolation.
 * This file proves the *real, wired-up* path the actual editor uses:
 *
 *   Template Gallery selection (-> store.actions.setTemplateId, exactly
 *   what features/portfolio/templates/template-gallery.tsx calls)
 *       -> real Zustand editor state (@/lib/store/generator-store, not a
 *          fake/mock store)
 *       -> real canonical snapshot (usePortfolioSnapshot, @/lib/portfolio/convert)
 *       -> real autosave (usePortfolioPersistence + SaveCoordinator,
 *          unmodified)
 *       -> the database boundary (mocked here, since there's no Postgres in
 *          this sandbox — createPortfolioAction/savePortfolioAction are the
 *          only two things standing in for it)
 *       -> "reload" (simulated by feeding the last thing actually saved
 *          back into actions.loadPortfolio on the same real store)
 *       -> selected template restored
 *
 * Nothing here introduces a second persistence mechanism — this exercises
 * the one that already exists.
 */

const createPortfolioAction = vi.fn();
const savePortfolioAction = vi.fn();
vi.mock("@/lib/db/actions", () => ({
  createPortfolioAction: (...args: unknown[]) => createPortfolioAction(...args),
  savePortfolioAction: (...args: unknown[]) => savePortfolioAction(...args),
}));

beforeEach(() => {
  useGeneratorStore.getState().actions.reset();
  createPortfolioAction.mockReset();
  savePortfolioAction.mockReset();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

/** Populates the real store with a rich, realistic portfolio — the same shape a real editing session builds up. */
function buildRichPortfolio() {
  const { actions } = useGeneratorStore.getState();
  actions.updateResumeField("name", "Dr. Evelyn Rosalind Whitfield-Nakamura");
  actions.updateResumeField("title", "Principal Staff Software Engineer & AI Research Lead");
  actions.updateResumeField("summary", "Building things that matter, one careful decision at a time.");
  actions.updateResumeField("email", "evelyn@example.com");
  actions.updateResumeField("phone", "+1 555 0100");
  actions.updateResumeField("skills", ["TypeScript", "React", "Rust", "Distributed Systems", "ML Infra"]);
  actions.addExperience();
  actions.addExperience();
  actions.addExperience();
  actions.addProject();
  actions.addProject();
  actions.addProject();
  actions.addProject();
  actions.setSectionVisibility("skills", false);
  actions.setSectionOrder(["hero", "projects", "about", "experience", "skills", "contact"]);
  actions.setDesignTokens({ primaryColor: "#FF6B35", accentColor: "#00E5FF", backgroundColor: "#0A0A12" });
  actions.addDecoration("emoji", "✨");
}

async function flushAutosave() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
}

describe("real template switching -> autosave -> reload integration", () => {
  it("carries the full flow: gallery selection -> store -> snapshot -> autosave -> DB -> reload restores the template", async () => {
    const { usePortfolioPersistence } = await import("@/hooks/use-portfolio-persistence");

    buildRichPortfolio();

    let capturedId: string | null = null;
    createPortfolioAction.mockImplementation(async () => {
      capturedId = "portfolio-int-1";
      return { id: capturedId };
    });
    let lastSaved: Portfolio | null = null;
    savePortfolioAction.mockImplementation(async (_id: string, snapshot: Portfolio) => {
      lastSaved = snapshot;
      return { ok: true, updatedAt: new Date().toISOString() };
    });

    const { result } = renderHook(() => usePortfolioPersistence());

    // Initial creation (empty-ish template id "default") + first autosave of the rich content.
    expect(createPortfolioAction).toHaveBeenCalledTimes(1);
    await flushAutosave();
    expect(savePortfolioAction).toHaveBeenCalled();
    expect(lastSaved!.template.templateId).toBe("default");

    // --- This is exactly what clicking a card in TemplateGallery does. ---
    act(() => {
      useGeneratorStore.getState().actions.setTemplateId("cinematic");
    });
    // Changing the template alone must mark the portfolio unsaved and
    // (after the debounce) trigger the existing autosave mechanism.
    expect(result.current.status === "unsaved" || result.current.status === "saving").toBe(true);

    await flushAutosave();
    expect(lastSaved!.template.templateId).toBe("cinematic");
    expect(result.current.status).toBe("saved");

    // Only one portfolio row ever created, across the whole session.
    expect(createPortfolioAction).toHaveBeenCalledTimes(1);
    expect(savePortfolioAction.mock.calls.every(([id]) => id === "portfolio-int-1")).toBe(true);

    // Content untouched by the template switch.
    expect(lastSaved!.content.resume.name).toBe("Dr. Evelyn Rosalind Whitfield-Nakamura");
    expect(lastSaved!.content.resume.experience).toHaveLength(3);
    expect(lastSaved!.content.resume.projects).toHaveLength(4);
    expect(lastSaved!.sections.visibility.skills).toBe(false);
    expect(lastSaved!.sections.order).toEqual(["hero", "projects", "about", "experience", "skills", "contact"]);
    expect(lastSaved!.appearance.tokens.primaryColor).toBe("#FF6B35");
    expect(lastSaved!.appearance.decorations).toHaveLength(1);

    // --- "Reload the page": the persisted snapshot goes back into the store via loadPortfolio,
    // exactly like app/dashboard/portfolio/[id]/page.tsx -> LoadPortfolioIntoEditor does. ---
    act(() => {
      useGeneratorStore.getState().actions.loadPortfolio(lastSaved!);
    });
    expect(useGeneratorStore.getState().templateId).toBe("cinematic");

    // Chain: Cinematic -> Whimsical -> Brutalist -> Glass -> Minimal, saving and
    // "reloading" after each, confirming the selection survives every hop.
    const chain = ["whimsical", "brutalist", "glass", "default"] as const;
    for (const next of chain) {
      useGeneratorStore.getState().actions.setTemplateId(next);
      await flushAutosave();
      expect(lastSaved!.template.templateId).toBe(next);

      act(() => {
        useGeneratorStore.getState().actions.loadPortfolio(lastSaved!);
      });
      expect(useGeneratorStore.getState().templateId).toBe(next);

      // Content still intact after every hop in the chain.
      expect(useGeneratorStore.getState().resumeData.name).toBe("Dr. Evelyn Rosalind Whitfield-Nakamura");
      expect(useGeneratorStore.getState().resumeData.experience).toHaveLength(3);
      expect(useGeneratorStore.getState().resumeData.projects).toHaveLength(4);
    }
  });

  it("a template-only change does not overwrite content changed after it was queued (newest snapshot wins)", async () => {
    const { usePortfolioPersistence } = await import("@/hooks/use-portfolio-persistence");
    buildRichPortfolio();

    createPortfolioAction.mockResolvedValue({ id: "portfolio-int-2" });
    let lastSaved: Portfolio | null = null;
    savePortfolioAction.mockImplementation(async (_id: string, snapshot: Portfolio) => {
      lastSaved = snapshot;
      return { ok: true };
    });

    renderHook(() => usePortfolioPersistence());
    await flushAutosave();
    expect(savePortfolioAction).toHaveBeenCalled();

    // Switch template, then immediately make a real content edit before the debounce fires.
    useGeneratorStore.getState().actions.setTemplateId("brutalist");
    useGeneratorStore.getState().actions.updateResumeField("name", "Edited After Template Switch");

    await flushAutosave();
    expect(lastSaved!.content.resume.name).toBe("Edited After Template Switch");
    // The template choice is still carried along with that newer snapshot — it wasn't lost either.
    expect(lastSaved!.template.templateId).toBe("brutalist");
  });
});
