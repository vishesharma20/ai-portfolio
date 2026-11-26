"use client";

import { ReactNode } from "react";
import { ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import { PortfolioSectionKey, portfolioSectionLabels } from "@/types/portfolio";
import { useEditorChrome } from "@/features/portfolio/editor-chrome-context";
import { cn } from "@/lib/utils";

interface Props {
  sectionKey: PortfolioSectionKey;
  isFirst: boolean;
  isLast: boolean;
  isHidden: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Wraps one rendered section with selection/hover chrome — a subtle
 * boundary, a floating label, and a small toolbar (move up/down, hide/show)
 * — when there's an `EditorChrome` context to read (i.e. we're in the live
 * editor, in "edit" mode). In every other case — preview mode, or no
 * provider at all (a read-only/public render) — this renders `children`
 * completely unwrapped, so there's zero chrome overhead or visual residue
 * outside the editor.
 *
 * Lives in the template layer rather than inside each section component so
 * individual sections stay exactly as "dumb" as before — none of them had
 * to change to gain selectability.
 */
export function SelectableSection({ sectionKey, isFirst, isLast, isHidden, className, children }: Props) {
  const chrome = useEditorChrome();

  if (!chrome || chrome.mode === "preview") return className ? <div className={className}>{children}</div> : <>{children}</>;

  const isSelected = chrome.selectedSection === sectionKey;
  const label = portfolioSectionLabels[sectionKey];
  const canReorder = sectionKey !== "hero"; // hero anchors the page; not reorderable or hideable
  const canHide = sectionKey !== "hero";

  return (
    <div
      className={cn(
        "group/section relative outline outline-2 -outline-offset-2 outline-transparent transition-[outline-color]",
        className,
        isSelected ? "outline-primary" : "hover:outline-primary/30",
        isHidden && "opacity-40"
      )}
      onClick={(e) => {
        e.stopPropagation();
        chrome.setSelectedSection(isSelected ? null : sectionKey);
      }}
    >
      {(isSelected || isHidden) && (
        <div
          className={cn(
            "absolute left-2 top-2 z-[60] flex items-center gap-0.5 rounded-lg border shadow-lg backdrop-blur-md",
            isSelected ? "border-primary/40 bg-primary text-primary-foreground" : "border-border bg-card/95 text-muted-foreground"
          )}
        >
          <span className="px-2.5 py-1.5 text-xs font-medium">
            {label}
            {isHidden && " (hidden)"}
          </span>

          {isSelected && (
            <div className="flex items-center border-l border-current/20 pl-0.5 pr-1">
              {canReorder && (
                <>
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={(e) => {
                      e.stopPropagation();
                      chrome.moveSectionUp(sectionKey);
                    }}
                    aria-label={`Move ${label} up`}
                    title="Move up"
                    className="rounded p-1.5 transition-colors hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={(e) => {
                      e.stopPropagation();
                      chrome.moveSectionDown(sectionKey);
                    }}
                    aria-label={`Move ${label} down`}
                    title="Move down"
                    className="rounded p-1.5 transition-colors hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
              {canHide && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    chrome.toggleSectionVisibility(sectionKey);
                  }}
                  aria-label={isHidden ? `Show ${label}` : `Hide ${label}`}
                  title={isHidden ? "Show section" : "Hide section"}
                  className="rounded p-1.5 transition-colors hover:bg-white/15"
                >
                  {isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
