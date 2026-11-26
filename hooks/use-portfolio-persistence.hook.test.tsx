// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useSyncExternalStore } from "react";
import { act, renderHook } from "@testing-library/react";
import { createEmptyPortfolio } from "@/lib/portfolio/defaults";
import type { Portfolio, PortfolioMetadata } from "@/types/portfolio";

/**
 * This test exercises the *hook*, not just the coordinator: it verifies the
 * bootstrap-creation path in hooks/use-portfolio-persistence.ts is race-safe
 * when edits land while `createPortfolioAction()` is still in flight.
 *
 * The generator store, the reactive snapshot, and the server actions are
 * all real collaborators in production but none are unit-testable in
 * isolation (Zustand global state, "use server" actions needing a DB) —
 * so they're mocked here with the minimum needed to reproduce the race:
 * a subscribable fake store (so setPortfolioMeta actually triggers a
 * re-render, exactly like Zustand does) and a controllable, deferred
 * createPortfolioAction/savePortfolioAction.
 */

type PortfolioMeta = Pick<PortfolioMetadata, "id" | "slug" | "createdAt">;

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

// ---------------------------------------------------------------------------
// Fake generator store: minimal Zustand look-alike using useSyncExternalStore
// so `setPortfolioMeta` triggers real re-renders of the hook under test.
// ---------------------------------------------------------------------------
let fakeMeta: PortfolioMeta | null = null;
let fakeContent = createEmptyPortfolio();
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function resetFakeStore() {
  fakeMeta = null;
  fakeContent = createEmptyPortfolio();
  listeners.clear();
}

vi.mock("@/lib/store/generator-store", () => {
  return {
    useGeneratorStore: (selector: (s: { portfolioMeta: PortfolioMeta | null }) => unknown) => {
      return useSyncExternalStore(
        (onStoreChange: () => void) => {
          listeners.add(onStoreChange);
          return () => listeners.delete(onStoreChange);
        },
        () => selector({ portfolioMeta: fakeMeta })
      );
    },
    useGeneratorActions: () => ({
      setPortfolioMeta: (meta: PortfolioMeta | null) => {
        fakeMeta = meta;
        notify();
      },
    }),
  };
});

vi.mock("@/lib/portfolio/convert", () => {
  return {
    usePortfolioSnapshot: (existing?: Partial<PortfolioMeta>) => {
      const content = useSyncExternalStore(
        (onStoreChange: () => void) => {
          listeners.add(onStoreChange);
          return () => listeners.delete(onStoreChange);
        },
        () => fakeContent
      );
      return { ...content, metadata: { ...content.metadata, ...existing } };
    },
  };
});

const createPortfolioAction = vi.fn();
const savePortfolioAction = vi.fn();
vi.mock("@/lib/db/actions", () => ({
  createPortfolioAction: (...args: unknown[]) => createPortfolioAction(...args),
  savePortfolioAction: (...args: unknown[]) => savePortfolioAction(...args),
}));

/** Simulates a user edit: replaces the live editor content and notifies. */
function editPortfolio(patch: Partial<Portfolio["content"]["resume"]>) {
  fakeContent = {
    ...fakeContent,
    content: { ...fakeContent.content, resume: { ...fakeContent.content.resume, ...patch } },
  };
  act(() => notify());
}

beforeEach(() => {
  resetFakeStore();
  createPortfolioAction.mockReset();
  savePortfolioAction.mockReset();
  savePortfolioAction.mockResolvedValue({ ok: true, updatedAt: new Date().toISOString() });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.resetModules();
});

describe("usePortfolioPersistence — creation race", () => {
  it("creates exactly once under concurrent edits, and reuses the id for the newest snapshot", async () => {
    const { usePortfolioPersistence } = await import("./use-portfolio-persistence");

    const create = deferred<{ id: string }>();
    createPortfolioAction.mockReturnValue(create.promise);

    const { result } = renderHook(() => usePortfolioPersistence());

    // 1. Initial creation starts as soon as the hook mounts (no db identity yet).
    expect(createPortfolioAction).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("creating");

    // 2. Multiple edits arrive while creation is still in progress.
    editPortfolio({ name: "Ada Lovelace" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    editPortfolio({ name: "Ada L." });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    editPortfolio({ name: "Ada Lovelace (final)" });

    // 3. Still only one create call — edits during creation never trigger a
    //    second createPortfolioAction, and no save can fire without an id yet.
    expect(createPortfolioAction).toHaveBeenCalledTimes(1);
    expect(savePortfolioAction).not.toHaveBeenCalled();

    // Creation now resolves. `advanceTimersByTimeAsync(0)` flushes the
    // microtask chain (the `await createPortfolioAction()` continuation)
    // together with React's commit, so `portfolioMeta` is set by the time
    // this resolves.
    await act(async () => {
      create.resolve({ id: "portfolio-123" });
      await vi.advanceTimersByTimeAsync(0);
    });

    // 6. The returned id is reused — portfolioId reflects it immediately.
    expect(result.current.portfolioId).toBe("portfolio-123");

    // 4. The newest snapshot is eventually saved (after the debounce the
    //    autosave effect scheduled once portfolioMeta became available).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });

    expect(savePortfolioAction).toHaveBeenCalledTimes(1);
    const [savedId, savedSnapshot] = savePortfolioAction.mock.calls.at(-1) as [string, Portfolio];
    expect(savedId).toBe("portfolio-123");
    expect(savedSnapshot.content.resume.name).toBe("Ada Lovelace (final)");

    // 5. No duplicate portfolio row: createPortfolioAction was called exactly
    //    once for the whole session, including after the save above.
    expect(createPortfolioAction).toHaveBeenCalledTimes(1);

    // A further edit after creation reuses the same id again — never re-creates.
    editPortfolio({ name: "Ada Lovelace (v2)" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });
    expect(savePortfolioAction).toHaveBeenCalledTimes(2);
    const [secondSavedId] = savePortfolioAction.mock.calls.at(-1) as [string, Portfolio];
    expect(secondSavedId).toBe("portfolio-123");
    expect(createPortfolioAction).toHaveBeenCalledTimes(1);
  });
});
