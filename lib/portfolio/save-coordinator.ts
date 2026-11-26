/**
 * `SaveCoordinator` is the piece that makes autosave safe under concurrent
 * edits. It owns exactly one invariant: **at most one save request is in
 * flight. If newer edits arrive while it is running, they remain as the
 * latest pending snapshot and are saved after the current request
 * completes** — never dropped, and never overtaken by an older request that
 * happens to resolve later.
 *
 * Deliberately framework-independent (no React, no Zustand, no timers other
 * than the DOM/Node-compatible `setTimeout`) so it can be unit-tested with
 * plain objects and fake timers, and reused from `usePortfolioPersistence`
 * without dragging React into the test surface.
 *
 * How it prevents the "older save overwrites newer save" race described in
 * the autosave bug report:
 *
 * - `enqueue()` never starts a network call itself — it only records the
 *   latest snapshot (`pending`) and (re)starts a debounce timer.
 * - `drain()` is the only place a save is actually fired, and it bails
 *   immediately if `inFlight` is already true. There is structurally never
 *   a second call in flight, so there is nothing for a "slow" response to
 *   race against — the question "did an older save finish after a newer
 *   one?" cannot arise because a newer save is never started until the
 *   older one has fully resolved.
 * - When a save resolves, `drain()` checks whether `pending` has moved on
 *   to something newer (edits that arrived while the request was in
 *   flight). If so, it immediately drains again with that newest snapshot
 *   — no extra debounce wait, and no intermediate snapshots in between are
 *   ever sent. If nothing changed, it reports "saved" and stops.
 * - A failed save leaves `pending` exactly as it was (or newer, if edits
 *   arrived during the failed attempt) so the next edit — or an explicit
 *   `retry()` — resends the newest snapshot, never a stale one.
 */

export type SaveCoordinatorStatus = "saving" | "saved" | "unsaved" | "error";

export interface SaveOutcome {
  ok: boolean;
  error?: string;
}

export interface SaveCoordinatorOptions<T> {
  /** Performs the actual persistence call. Must not throw for expected failures — return `{ ok: false }` instead. Coordinator also catches unexpected throws defensively. */
  save: (snapshot: T) => Promise<SaveOutcome>;
  /** Milliseconds of inactivity before an enqueued snapshot is sent. Defaults to 1500. */
  debounceMs?: number;
  /**
   * Produces a comparison key for a snapshot. Defaults to `JSON.stringify`.
   * Override this to exclude volatile fields (e.g. a client-side
   * `updatedAt` timestamp that changes on every render even when the
   * actual content hasn't) — otherwise those fields make every snapshot
   * look "new" forever and the coordinator will never settle into
   * "saved", re-triggering a save on every enqueue call indefinitely.
   */
  getKey?: (snapshot: T) => string;
  /** Called whenever status changes. `errorMessage` is non-null only for "error". */
  onStatusChange?: (status: SaveCoordinatorStatus, errorMessage: string | null) => void;
}

export class SaveCoordinator<T> {
  private readonly saveFn: SaveCoordinatorOptions<T>["save"];
  private readonly debounceMs: number;
  private readonly getKey: (snapshot: T) => string;
  private readonly onStatusChange?: SaveCoordinatorOptions<T>["onStatusChange"];

  private pending: T | null = null;
  private inFlight = false;
  private lastSavedKey: string | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;

  constructor(options: SaveCoordinatorOptions<T>) {
    this.saveFn = options.save;
    this.debounceMs = options.debounceMs ?? 1500;
    this.getKey = options.getKey ?? ((snapshot) => JSON.stringify(snapshot));
    this.onStatusChange = options.onStatusChange;
  }

  /** True while a save request is actually in flight (not just debouncing). */
  isSaving(): boolean {
    return this.inFlight;
  }

  /** True if there is a snapshot that hasn't been confirmed saved yet. */
  hasPending(): boolean {
    return this.pending !== null;
  }

  /**
   * Marks a snapshot as already persisted without sending it — for example,
   * right after loading an existing portfolio, so the coordinator doesn't
   * treat the just-loaded content as an unsaved edit.
   */
  markSaved(snapshot: T): void {
    this.lastSavedKey = this.getKey(snapshot);
    if (this.pending && this.getKey(this.pending) === this.lastSavedKey) {
      this.pending = null;
    }
  }

  /**
   * Call this whenever the live snapshot changes. Debounces; the *newest*
   * snapshot at the time the debounce elapses is what gets saved, even if
   * several calls to `enqueue` happened in between.
   */
  enqueue(snapshot: T): void {
    if (this.disposed) return;

    const key = this.getKey(snapshot);
    if (key === this.lastSavedKey) {
      // Back to (or still at) the last confirmed-saved content — e.g. an
      // undo, or a render that only changed a volatile field the caller's
      // getKey ignores. Nothing to save.
      this.pending = null;
      return;
    }

    this.pending = snapshot;
    if (!this.inFlight) {
      this.onStatusChange?.("unsaved", null);
    }
    this.scheduleDrain(this.debounceMs);
  }

  /**
   * Retries the newest pending snapshot immediately (skips the debounce).
   * No-op if there's nothing unsaved or a save is already running — in the
   * latter case the in-flight request finishing will itself trigger a
   * follow-up save of whatever is newest at that point (see `drain()`), so
   * there's nothing extra for `retry()` to do.
   */
  retry(): void {
    if (this.disposed || !this.pending || this.inFlight) return;
    this.scheduleDrain(0);
  }

  /** Stops the debounce timer and prevents any further saves or callbacks. Call on unmount. */
  dispose(): void {
    this.disposed = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private scheduleDrain(delay: number): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.drain();
    }, delay);
  }

  private async drain(): Promise<void> {
    if (this.disposed || this.inFlight) return;
    const snapshot = this.pending;
    if (snapshot === null) return;

    this.inFlight = true;
    this.onStatusChange?.("saving", null);

    let outcome: SaveOutcome;
    try {
      outcome = await this.saveFn(snapshot);
    } catch {
      outcome = { ok: false, error: "Save failed unexpectedly. Your changes are still here — try again." };
    }

    if (this.disposed) return;
    this.inFlight = false;

    if (outcome.ok) {
      this.lastSavedKey = this.getKey(snapshot);
      if (this.pending && this.getKey(this.pending) === this.lastSavedKey) {
        this.pending = null;
      }

      if (this.pending) {
        // Newer edits arrived while this save was in flight. Persist them
        // right away — the user already waited out one debounce window.
        void this.drain();
      } else {
        this.onStatusChange?.("saved", null);
      }
    } else {
      // Leave `pending` untouched (it's still the newest unsaved snapshot,
      // possibly newer than `snapshot` if edits landed mid-request) so the
      // next edit, or an explicit retry(), resends the right thing.
      this.onStatusChange?.("error", outcome.error ?? "Save failed.");
    }
  }
}
