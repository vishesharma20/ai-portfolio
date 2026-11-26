"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGeneratorStore, useGeneratorActions } from "@/lib/store/generator-store";
import { usePortfolioSnapshot } from "@/lib/portfolio/convert";
import { createPortfolioAction, savePortfolioAction } from "@/lib/db/actions";
import { Portfolio } from "@/types/portfolio";
import { SaveCoordinator } from "@/lib/portfolio/save-coordinator";

export type SaveStatus = "creating" | "saving" | "saved" | "unsaved" | "error";

const AUTOSAVE_DEBOUNCE_MS = 1500;

/**
 * Owns the entire "editor state -> database" side of the app:
 *
 * 1. **Bootstrap** — if this editing session has no database row yet
 *    (`portfolioMeta` is null, i.e. a brand-new portfolio fresh out of the
 *    generator), creates one via `createPortfolioAction()` and records its
 *    id/slug/createdAt so every future save updates the same row instead of
 *    minting a new one. Guarded by `creatingRef`/`portfolioIdRef` so
 *    concurrent renders/edits can never trigger a second
 *    `createPortfolioAction()` call.
 * 2. **Debounced, race-safe autosave** — whenever the live `Portfolio`
 *    snapshot changes, it's handed to a `SaveCoordinator` (see
 *    lib/portfolio/save-coordinator.ts), which owns the actual "wait
 *    `AUTOSAVE_DEBOUNCE_MS`, then send" logic plus the invariant that makes
 *    autosave safe under rapid edits: **at most one save request is in
 *    flight. If newer edits arrive while it is running, they remain as the
 *    latest pending snapshot and are saved after the current request
 *    completes** — an older snapshot can never land after a newer one.
 *    `status` surfaces "creating" / "saving" / "saved" /
 *    "unsaved" / "error" for the UI to show, and a failed save leaves the
 *    local editor state completely untouched — nothing is lost, the person
 *    just sees an error and can retry (typing again, or calling
 *    `retrySave()`, re-sends the newest snapshot).
 *
 * Used once, in the editor step — see step-editor-preview.tsx.
 */
export function usePortfolioPersistence() {
  const portfolioMeta = useGeneratorStore((s) => s.portfolioMeta);
  const actions = useGeneratorActions();
  const portfolio = usePortfolioSnapshot(portfolioMeta ?? undefined);

  const [status, setStatus] = useState<SaveStatus>("saved");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const creatingRef = useRef(false);

  // The database id this session is saving to. Read by the coordinator's
  // `save` function *at call time* (not captured in a closure at
  // construction time), so a save fired right after creation completes
  // always targets the freshly-created row, never a stale/empty id.
  const portfolioIdRef = useRef<string | null>(portfolioMeta?.id ?? null);
  portfolioIdRef.current = portfolioMeta?.id ?? portfolioIdRef.current;

  // One SaveCoordinator per hook instance, created lazily on first render
  // and reused for the component's lifetime. It — not this hook — owns the
  // debounce timer, the "one save in flight" invariant, and which snapshot
  // is the newest pending one.
  const coordinatorRef = useRef<SaveCoordinator<Portfolio> | null>(null);
  if (coordinatorRef.current === null) {
    coordinatorRef.current = new SaveCoordinator<Portfolio>({
      debounceMs: AUTOSAVE_DEBOUNCE_MS,
      save: async (snapshot) => {
        const id = portfolioIdRef.current;
        if (!id) {
          // Defensive only: enqueue() below is gated on portfolioMeta
          // existing, so the coordinator should never attempt a save
          // before there's a row to save to.
          return { ok: false, error: "Portfolio isn't ready to save yet." };
        }
        const result = await savePortfolioAction(id, snapshot);
        return { ok: result.ok, error: result.error };
      },
      onStatusChange: (coordinatorStatus, message) => {
        // Guard against a resolved save/timer firing after unmount.
        if (!mountedRef.current) return;
        setStatus(coordinatorStatus);
        setErrorMessage(message);
      },
    });
  }

  // Tears down the coordinator's debounce timer (and prevents any further
  // status callbacks) when the editor is left.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      coordinatorRef.current?.dispose();
    };
  }, []);

  const attemptCreate = useCallback(async () => {
    if (portfolioIdRef.current || creatingRef.current) return;
    creatingRef.current = true;
    if (mountedRef.current) {
      setStatus("creating");
      setErrorMessage(null);
    }
    try {
      const result = await createPortfolioAction();
      if (!mountedRef.current) return;
      if ("error" in result) {
        setStatus("error");
        setErrorMessage(result.error);
        creatingRef.current = false; // allow a retry to try creating again
        return;
      }
      portfolioIdRef.current = result.id;
      actions.setPortfolioMeta({ id: result.id, slug: result.id, createdAt: new Date().toISOString() });
      // Falling through: the autosave effect below re-runs once
      // `portfolioMeta` updates and enqueues whatever's currently in the
      // editor (including any edits made while creation was in flight),
      // so no separate "flush" call is needed here.
    } catch {
      if (!mountedRef.current) return;
      setStatus("error");
      setErrorMessage("Couldn't create this portfolio. Your work is still here in the editor — try again in a moment.");
      creatingRef.current = false; // allow retry
    }
  }, [actions]);

  // Bootstrap: the very first time this session has content but no database
  // identity, create the row. `attemptCreate` itself is idempotent
  // (`creatingRef`/`portfolioIdRef` guards), so this is safe even if the
  // effect somehow re-ran concurrently.
  useEffect(() => {
    if (!portfolioMeta) {
      void attemptCreate();
    }
  }, [portfolioMeta, attemptCreate]);

  // Feed every live snapshot to the coordinator once we have a database
  // identity to save it under. The coordinator itself debounces and
  // serializes the actual network calls — this effect's only job is
  // "something changed, here's the newest version."
  useEffect(() => {
    if (!portfolioMeta) return;
    coordinatorRef.current?.enqueue(portfolio);
  }, [portfolio, portfolioMeta]);

  // Retries the newest unsaved snapshot. If creation itself failed (no
  // portfolioMeta yet), retries creation instead — there's nothing to save
  // to until a row exists.
  const retrySave = useCallback(() => {
    if (!portfolioIdRef.current) {
      creatingRef.current = false;
      void attemptCreate();
      return;
    }
    coordinatorRef.current?.retry();
  }, [attemptCreate]);

  // Warn before leaving only while there's something not yet confirmed
  // saved — never for its own sake. "creating"/"saving"/"unsaved" all mean
  // the database doesn't yet reflect what's on screen.
  useEffect(() => {
    const isDirty = status === "unsaved" || status === "saving" || status === "creating";
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status]);

  return { status, errorMessage, portfolioId: portfolioMeta?.id ?? null, portfolio, retrySave };
}
