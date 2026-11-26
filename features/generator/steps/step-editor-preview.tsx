"use client";

import { useState, useEffect } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  Download,
  RotateCcw,
  Loader2,
  Check,
  CloudOff,
  Undo2,
  Redo2,
  Eye,
  Pencil,
  PanelLeft,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGeneratorActions } from "@/lib/store/generator-store";
import { usePortfolioPersistence } from "@/hooks/use-portfolio-persistence";
import { useEditorHandlers } from "@/features/generator/editor/use-editor-handlers";
import { useSectionActions } from "@/features/generator/editor/use-section-actions";
import { useUndoRedo } from "@/features/generator/editor/use-undo-redo";
import { EditorSidebar } from "@/features/generator/editor/editor-sidebar";
import { PortfolioRenderer } from "@/features/portfolio/portfolio-renderer";
import { PortfolioRenderErrorBoundary } from "@/features/portfolio/portfolio-render-error-boundary";
import { EditorChromeProvider, EditorMode } from "@/features/portfolio/editor-chrome-context";
import { PortfolioSectionKey } from "@/types/portfolio";
import { cn } from "@/lib/utils";

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_WIDTH: Record<Viewport, number | null> = {
  desktop: null, // fluid, capped by the container's own max-width below
  tablet: 768,
  mobile: 375,
};

function SaveStatusIndicator({
  status,
  errorMessage,
  onRetry,
}: {
  status: string;
  errorMessage: string | null;
  onRetry: () => void;
}) {
  switch (status) {
    case "creating":
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Setting up...
        </span>
      );
    case "saving":
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Saving...
        </span>
      );
    case "saved":
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="h-3 w-3" /> Saved
        </span>
      );
    case "unsaved":
      return <span className="text-xs text-muted-foreground">Unsaved changes</span>;
    case "error":
      return (
        <span className="flex items-center gap-1.5 text-xs text-destructive" title={errorMessage ?? undefined}>
          <CloudOff className="h-3 w-3" /> Save failed
          <button
            type="button"
            onClick={onRetry}
            className="ml-1 underline underline-offset-2 hover:text-destructive/80"
          >
            Retry
          </button>
        </span>
      );
    default:
      return null;
  }
}

export function StepEditorPreview() {
  const { portfolio, status, errorMessage, retrySave } = usePortfolioPersistence();
  const editHandlers = useEditorHandlers();
  const sectionActions = useSectionActions();
  const { canUndo, canRedo, undo, redo } = useUndoRedo();
  const actions = useGeneratorActions();

  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [mode, setMode] = useState<EditorMode>("edit");
  const [selectedSection, setSelectedSection] = useState<PortfolioSectionKey | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Escape clears the current selection and closes the mobile drawer —
  // the one keyboard affordance every transient panel in the editor shares.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setSelectedSection(null);
      setMobileSidebarOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const chromeValue = {
    mode,
    selectedSection,
    setSelectedSection,
    moveSectionUp: sectionActions.moveSectionUp,
    moveSectionDown: sectionActions.moveSectionDown,
    toggleSectionVisibility: sectionActions.toggleSectionVisibility,
  };

  const widthPx = VIEWPORT_WIDTH[viewport];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Desktop sidebar */}
      {mode === "edit" && (
        <aside className="hidden w-[340px] shrink-0 border-r border-border bg-card/40 lg:block">
          <EditorSidebar />
        </aside>
      )}

      {/* Mobile sidebar drawer */}
      {mode === "edit" && mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[85vw] max-w-[340px] flex-col bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-medium">Edit portfolio</span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close panel"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <EditorSidebar />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {mode === "edit" && (
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open editor panel"
                className="rounded-md border border-border p-2 text-muted-foreground hover:text-foreground lg:hidden"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            )}

            <Tabs value={mode} onValueChange={(v) => setMode(v as EditorMode)}>
              <TabsList>
                <TabsTrigger value="edit" className="gap-1.5">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={viewport} onValueChange={(v) => setViewport(v as Viewport)}>
              <TabsList>
                <TabsTrigger value="desktop" className="gap-1.5" aria-label="Desktop preview" title="Desktop (~1280px)">
                  <Monitor className="h-3.5 w-3.5" />
                </TabsTrigger>
                <TabsTrigger value="tablet" className="gap-1.5" aria-label="Tablet preview" title="Tablet (768px)">
                  <Tablet className="h-3.5 w-3.5" />
                </TabsTrigger>
                <TabsTrigger value="mobile" className="gap-1.5" aria-label="Mobile preview" title="Mobile (375px)">
                  <Smartphone className="h-3.5 w-3.5" />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {mode === "edit" && (
              <div className="hidden items-center gap-0.5 rounded-lg border border-border p-0.5 md:flex">
                <button
                  type="button"
                  onClick={undo}
                  disabled={!canUndo}
                  aria-label="Undo"
                  title="Undo (Ctrl/Cmd+Z)"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={redo}
                  disabled={!canRedo}
                  aria-label="Redo"
                  title="Redo (Ctrl/Cmd+Shift+Z)"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                >
                  <Redo2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <p className="hidden text-xs text-muted-foreground xl:block">
              {mode === "edit" ? "Click a section to select it, or click any text to edit directly" : "Read-only preview"}
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <SaveStatusIndicator status={status} errorMessage={errorMessage} onRetry={retrySave} />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">Home</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={actions.reset}>
                <RotateCcw className="h-3.5 w-3.5" /> Start over
              </Button>
              <Button size="sm" disabled title="Export coming soon">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-1 items-start justify-center overflow-y-auto p-6",
            mode === "edit" ? "bg-secondary/20" : "bg-background"
          )}
          onClick={() => setSelectedSection(null)}
        >
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              mode === "edit" && "rounded-2xl border border-border shadow-2xl shadow-black/30"
            )}
            style={{
              width: widthPx ? `${widthPx}px` : "100%",
              maxWidth: widthPx ? `${widthPx}px` : "1280px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-[calc(100vh-9rem)] overflow-y-auto scrollbar-thin">
              <EditorChromeProvider value={chromeValue}>
                <PortfolioRenderErrorBoundary>
                  <PortfolioRenderer
                    key={`${portfolio.appearance.tokens.animationStyle}-${portfolio.appearance.tokens.animationIntensity}`}
                    portfolio={portfolio}
                    editHandlers={mode === "edit" ? editHandlers : undefined}
                  />
                </PortfolioRenderErrorBoundary>
              </EditorChromeProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
