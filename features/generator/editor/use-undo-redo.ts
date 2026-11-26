"use client";

import { useEffect } from "react";
import { useGeneratorStore, useTemporalStore } from "@/lib/store/generator-store";

/**
 * Wires undo/redo to Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (also accepts Ctrl+Y,
 * the common Windows redo binding) and exposes button-friendly state.
 * History itself lives in Zustand via zundo (see generator-store.ts) —
 * this hook just adds the keyboard layer and a small convenience API.
 */
export function useUndoRedo() {
  const canUndo = useTemporalStore((s) => s.pastStates.length > 0);
  const canRedo = useTemporalStore((s) => s.futureStates.length > 0);

  const undo = () => useGeneratorStore.temporal.getState().undo();
  const redo = () => useGeneratorStore.temporal.getState().redo();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.metaKey || e.ctrlKey;
      if (!isModifier) return;

      const target = e.target as HTMLElement | null;
      const isEditingText = target?.isContentEditable || target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";

      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        // Inside a contentEditable field, let the browser's native undo run
        // first (undoing the last keystroke) rather than jumping straight to
        // portfolio-level history — feels much less jarring while typing.
        if (isEditingText) return;
        e.preventDefault();
        undo();
      } else if ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y") {
        if (isEditingText) return;
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { canUndo, canRedo, undo, redo };
}
