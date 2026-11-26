"use client";

import { createContext, useContext, ReactNode } from "react";
import { PortfolioSectionKey } from "@/types/portfolio";

export type EditorMode = "edit" | "preview";

/**
 * Editor-only UI state for the render tree — which section is selected,
 * whether we're in "Edit" or "Preview" mode, and the section-level actions
 * (move/hide) the selection toolbar needs. Deliberately separate from
 * `PortfolioEditHandlers` (portfolio-editor-context.tsx): that context is
 * about *content* mutation (text, images, decorations), this one is about
 * *editor chrome* (what's selected, what mode we're in). Splitting them
 * keeps each focused and means a future template can use one without the
 * other if it needs to.
 *
 * Like `PortfolioEditHandlers`, absence (no provider) means "render plain" —
 * `portfolio-template.tsx` skips all selection UI entirely when this
 * context isn't present, so a read-only/public render never pays for it.
 */
export interface EditorChrome {
  mode: EditorMode;
  selectedSection: PortfolioSectionKey | null;
  setSelectedSection: (key: PortfolioSectionKey | null) => void;
  moveSectionUp: (key: PortfolioSectionKey) => void;
  moveSectionDown: (key: PortfolioSectionKey) => void;
  toggleSectionVisibility: (key: PortfolioSectionKey) => void;
}

const EditorChromeContext = createContext<EditorChrome | null>(null);

export function EditorChromeProvider({ value, children }: { value: EditorChrome; children: ReactNode }) {
  return <EditorChromeContext.Provider value={value}>{children}</EditorChromeContext.Provider>;
}

export function useEditorChrome(): EditorChrome | null {
  return useContext(EditorChromeContext);
}
