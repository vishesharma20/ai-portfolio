import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SaveCoordinator, SaveOutcome } from "./save-coordinator";

/** A snapshot type simple enough to assert on directly in test failures. */
type Snap = { version: string };

/** A save function whose resolution we control manually, so we can simulate
 * "save A takes longer than save B" races deterministically instead of
 * hoping real timers land in the right order. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("SaveCoordinator", () => {
  it("Scenario A — normal save: enqueue, debounce elapses, save succeeds, status becomes saved", async () => {
    const statuses: string[] = [];
    const save = vi.fn(async (): Promise<SaveOutcome> => ({ ok: true }));
    const coordinator = new SaveCoordinator<Snap>({
      save,
      debounceMs: 1500,
      onStatusChange: (s) => statuses.push(s),
    });

    coordinator.enqueue({ version: "A" });
    expect(statuses).toEqual(["unsaved"]);
    expect(save).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1500);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ version: "A" });
    expect(statuses).toEqual(["unsaved", "saving", "saved"]);
    expect(coordinator.hasPending()).toBe(false);
  });

  it("Scenario B — rapid changes: an older save can never overwrite a newer one", async () => {
    const saved: Snap[] = [];
    const saveA = deferred<SaveOutcome>();
    const saveB = deferred<SaveOutcome>();
    let call = 0;
    const save = vi.fn(async (snap: Snap): Promise<SaveOutcome> => {
      saved.push(snap);
      call += 1;
      return call === 1 ? saveA.promise : saveB.promise;
    });
    const coordinator = new SaveCoordinator<Snap>({ save, debounceMs: 1500 });

    // Snapshot A is queued and its debounce elapses, so its save starts.
    coordinator.enqueue({ version: "A" });
    await vi.advanceTimersByTimeAsync(1500);
    expect(save).toHaveBeenCalledTimes(1);
    expect(coordinator.isSaving()).toBe(true);

    // Snapshot B arrives while A is still in flight (in-flight guard means
    // this cannot start a second, concurrent request).
    coordinator.enqueue({ version: "B" });
    expect(save).toHaveBeenCalledTimes(1); // still just the A call — no overlap

    // A finishes first...
    saveA.resolve({ ok: true });
    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    expect(save).toHaveBeenNthCalledWith(2, { version: "B" });

    // ...then B finishes. The final persisted state must be B, and it must
    // never be followed by a late A overwriting it.
    saveB.resolve({ ok: true });
    await vi.waitFor(() => expect(coordinator.hasPending()).toBe(false));
    expect(saved).toEqual([{ version: "A" }, { version: "B" }]);
  });

  it("Scenario C — many rapid edits collapse to a single save of the latest snapshot", async () => {
    const save = vi.fn(async (): Promise<SaveOutcome> => ({ ok: true }));
    const coordinator = new SaveCoordinator<Snap>({ save, debounceMs: 1500 });

    coordinator.enqueue({ version: "A" });
    await vi.advanceTimersByTimeAsync(500);
    coordinator.enqueue({ version: "B" });
    await vi.advanceTimersByTimeAsync(500);
    coordinator.enqueue({ version: "C" });
    await vi.advanceTimersByTimeAsync(500);
    coordinator.enqueue({ version: "D" });

    // Debounce keeps getting reset by each new edit, so nothing has fired yet.
    expect(save).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1500);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ version: "D" });
  });

  it("Scenario D — a failed save leaves local state saveable and reports an error", async () => {
    const statuses: Array<{ status: string; error: string | null }> = [];
    const save = vi.fn(async (): Promise<SaveOutcome> => ({ ok: false, error: "network down" }));
    const coordinator = new SaveCoordinator<Snap>({
      save,
      debounceMs: 1500,
      onStatusChange: (status, error) => statuses.push({ status, error }),
    });

    coordinator.enqueue({ version: "A" });
    await vi.advanceTimersByTimeAsync(1500);

    expect(statuses.at(-1)).toEqual({ status: "error", error: "network down" });
    // The newest snapshot is still considered pending — nothing was lost,
    // and a later edit (or retry()) can resend it.
    expect(coordinator.hasPending()).toBe(true);

    // A later edit resends without needing another full debounce wait once
    // retried explicitly.
    save.mockResolvedValueOnce({ ok: true });
    coordinator.retry();
    await vi.advanceTimersByTimeAsync(0);
    expect(statuses.at(-1)).toEqual({ status: "saved", error: null });
  });

  it("An unexpected thrown error is treated the same as a returned failure", async () => {
    const statuses: string[] = [];
    const save = vi.fn(async (): Promise<SaveOutcome> => {
      throw new Error("boom");
    });
    const coordinator = new SaveCoordinator<Snap>({
      save,
      debounceMs: 1500,
      onStatusChange: (s) => statuses.push(s),
    });

    coordinator.enqueue({ version: "A" });
    await vi.advanceTimersByTimeAsync(1500);

    expect(statuses.at(-1)).toBe("error");
    expect(coordinator.hasPending()).toBe(true);
  });

  it("Scenario F — dispose() stops pending timers and prevents further saves/callbacks", async () => {
    const statuses: string[] = [];
    const save = vi.fn(async (): Promise<SaveOutcome> => ({ ok: true }));
    const coordinator = new SaveCoordinator<Snap>({
      save,
      debounceMs: 1500,
      onStatusChange: (s) => statuses.push(s),
    });

    coordinator.enqueue({ version: "A" });
    coordinator.dispose();

    await vi.advanceTimersByTimeAsync(5000);

    expect(save).not.toHaveBeenCalled();
    // Only the initial "unsaved" from enqueue() before dispose — nothing
    // fires after teardown, matching an unmounted component's expectations.
    expect(statuses).toEqual(["unsaved"]);

    // Further enqueue calls after dispose are no-ops too.
    coordinator.enqueue({ version: "B" });
    await vi.advanceTimersByTimeAsync(5000);
    expect(save).not.toHaveBeenCalled();
  });

  it("markSaved() treats an already-persisted snapshot as clean (no spurious save)", async () => {
    const save = vi.fn(async (): Promise<SaveOutcome> => ({ ok: true }));
    const coordinator = new SaveCoordinator<Snap>({ save, debounceMs: 1500 });

    coordinator.markSaved({ version: "A" });
    coordinator.enqueue({ version: "A" }); // identical to what's already saved

    await vi.advanceTimersByTimeAsync(5000);
    expect(save).not.toHaveBeenCalled();
    expect(coordinator.hasPending()).toBe(false);
  });
});
