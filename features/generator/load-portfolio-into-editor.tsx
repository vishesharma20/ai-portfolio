"use client";

import { useState } from "react";
import { useGeneratorActions } from "@/lib/store/generator-store";
import { Portfolio } from "@/types/portfolio";
import { GeneratorWizard } from "@/features/generator/generator-wizard";

/**
 * The one hydration path for "open an existing portfolio in the editor"
 * (Step 9): loads the given `Portfolio` into the Zustand store exactly
 * once, then renders the same wizard shell the create flow uses — since
 * `loadPortfolio()` sets `step: "editor"`, it lands directly on the editor,
 * skipping upload/confirm/inspiration/generating entirely.
 *
 * The load happens inside a `useState` initializer (runs synchronously
 * during the first render, before anything paints) rather than a
 * `useEffect`, so there's no one-frame flash of whatever step the store
 * happened to be in before this component mounted.
 */
export function LoadPortfolioIntoEditor({ portfolio }: { portfolio: Portfolio }) {
  const actions = useGeneratorActions();
  useState(() => {
    actions.loadPortfolio(portfolio);
    return true;
  });

  return <GeneratorWizard />;
}
