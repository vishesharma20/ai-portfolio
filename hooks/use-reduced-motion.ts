"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the OS/browser-level `prefers-reduced-motion` setting. Used
 * wherever the portfolio renders continuous or entrance animation — section
 * reveals (hooks/use-section-motion.ts), the ambient background, sticker
 * motion, and EditableText's typewriter/fade/bounce/slide effects — so
 * someone who has asked their system for less motion actually gets less
 * motion, not just a suggestion the portfolio ignores.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(query.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return prefersReduced;
}
