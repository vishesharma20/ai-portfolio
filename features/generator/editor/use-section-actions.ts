"use client";

import { useCallback } from "react";
import { useGeneratorStore, useGeneratorActions } from "@/lib/store/generator-store";
import { PortfolioSectionKey } from "@/types/portfolio";

/**
 * The editor-layer implementation behind the section toolbar's move/hide
 * buttons (features/portfolio/selectable-section.tsx, via EditorChrome).
 * Reads/writes the store directly — this is the one place allowed to,
 * since it's part of the editor, not the render tree itself.
 */
export function useSectionActions() {
  const sectionOrder = useGeneratorStore((s) => s.sectionOrder);
  const actions = useGeneratorActions();

  const moveSectionUp = useCallback(
    (key: PortfolioSectionKey) => {
      const index = sectionOrder.indexOf(key);
      if (index <= 0) return;
      const next = [...sectionOrder];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      actions.setSectionOrder(next);
    },
    [sectionOrder, actions]
  );

  const moveSectionDown = useCallback(
    (key: PortfolioSectionKey) => {
      const index = sectionOrder.indexOf(key);
      if (index === -1 || index >= sectionOrder.length - 1) return;
      const next = [...sectionOrder];
      [next[index + 1], next[index]] = [next[index], next[index + 1]];
      actions.setSectionOrder(next);
    },
    [sectionOrder, actions]
  );

  const toggleSectionVisibility = useCallback(
    (key: PortfolioSectionKey) => {
      const currentlyHidden = useGeneratorStore.getState().sectionVisibility[key] === false;
      actions.setSectionVisibility(key, currentlyHidden);
    },
    [actions]
  );

  return { moveSectionUp, moveSectionDown, toggleSectionVisibility };
}
