"use client";

import { useState } from "react";
import { Monitor, Smartphone, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useShallow } from "zustand/react/shallow";
import { useGeneratorStore, useGeneratorActions } from "@/lib/store/generator-store";
import { EditorSidebar } from "@/features/generator/editor/editor-sidebar";
import { PortfolioTemplate } from "@/features/portfolio/portfolio-template";

export function StepEditorPreview() {
  const { resumeData, designTokens, assets } = useGeneratorStore(
    useShallow((s) => ({
      resumeData: s.resumeData,
      designTokens: s.designTokens,
      assets: s.assets,
    }))
  );
  const actions = useGeneratorActions();
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <aside className="hidden w-[340px] shrink-0 border-r border-border bg-card/40 lg:block">
        <EditorSidebar />
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-4">
            <Tabs value={viewport} onValueChange={(v) => setViewport(v as "desktop" | "mobile")}>
              <TabsList>
                <TabsTrigger value="desktop" className="gap-1.5">
                  <Monitor className="h-3.5 w-3.5" /> Desktop
                </TabsTrigger>
                <TabsTrigger value="mobile" className="gap-1.5">
                  <Smartphone className="h-3.5 w-3.5" /> Mobile
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="hidden text-xs text-muted-foreground lg:block">
              Click any text below to edit it directly
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={actions.reset}>
              <RotateCcw className="h-3.5 w-3.5" /> Start over
            </Button>
            <Button size="sm" disabled title="Export coming soon">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>

        <div className="flex flex-1 items-start justify-center overflow-y-auto bg-secondary/20 p-6">
          <div
            className="overflow-hidden rounded-2xl border border-border shadow-2xl shadow-black/30 transition-all duration-300"
            style={{
              width: viewport === "desktop" ? "100%" : "390px",
              maxWidth: viewport === "desktop" ? "1400px" : "390px",
            }}
          >
            <div className="max-h-[calc(100vh-9rem)] overflow-y-auto scrollbar-thin">
              <PortfolioTemplate
                key={`${designTokens.animationStyle}-${designTokens.animationIntensity}`}
                resumeData={resumeData}
                tokens={designTokens}
                inspirationImages={assets.inspirationImages}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
