"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useShallow } from "zustand/react/shallow";
import { useGeneratorStore, useGeneratorActions } from "@/lib/store/generator-store";
import { usePortfolioGeneration } from "@/hooks/use-portfolio-generation";
import { useFileUpload } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
import { getPresetForMood } from "@/lib/mood-presets";
import { moodOptions } from "@/types/design-tokens";

const MOOD_ORDER: (typeof moodOptions)[number][] = [
  "minimal",
  "bold",
  "editorial",
  "luxury",
  "technical",
  "playful",
];
const MOOD_LABELS: Record<string, string> = {
  minimal: "Minimal",
  bold: "Bold",
  editorial: "Editorial",
  luxury: "Luxury",
  technical: "Technical",
  playful: "Playful",
};
const MAX_IMAGES = 6;

export function StepInspiration() {
  const { assets, isProcessing, designTokens } = useGeneratorStore(
    useShallow((s) => ({ assets: s.assets, isProcessing: s.isProcessing, designTokens: s.designTokens }))
  );
  const actions = useGeneratorActions();
  const { runInspirationAnalysis } = usePortfolioGeneration();
  const { readAsDataUrl } = useFileUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const remainingSlots = MAX_IMAGES - assets.inspirationImages.length;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || remainingSlots <= 0) return;
    const toRead = Array.from(files).slice(0, remainingSlots);
    const dataUrls = await Promise.all(toRead.map((f) => readAsDataUrl(f)));
    const valid = dataUrls.filter((d): d is string => Boolean(d));
    if (valid.length) {
      actions.setAssets({ inspirationImages: [...assets.inspirationImages, ...valid] });
    }
  };

  const handleRemove = (index: number) => {
    actions.setAssets({ inspirationImages: assets.inspirationImages.filter((_, i) => i !== index) });
  };

  const handleContinue = async () => {
    if (assets.inspirationImages.length > 0) {
      await runInspirationAnalysis();
    }
    actions.setStep("generating");
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Show us a vibe.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Optional. Upload one or more moodboard images, screenshots, or reference shots and we'll
          derive colors, type, and mood from them. The first image also becomes your portfolio's
          background.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inspiration images</CardTitle>
          <CardDescription>
            Add up to {MAX_IMAGES}. The first is used as the primary style &amp; background reference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {assets.inspirationImages.map((url, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary/20"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Inspiration ${i + 1}`} className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  aria-label={`Remove inspiration image ${i + 1}`}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {remainingSlots > 0 && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFiles(e.dataTransfer.files);
                }}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground",
                  isDragging && "border-primary bg-primary/5 text-foreground"
                )}
              >
                <Plus className="h-5 w-5" />
                <span className="text-[11px]">
                  {assets.inspirationImages.length === 0 ? "Add images" : "Add more"}
                </span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Or skip the image and start from a preset vibe
            </p>
            <div className="flex flex-wrap gap-2">
              {MOOD_ORDER.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => actions.setDesignTokens(getPresetForMood(m))}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    designTokens.mood === m
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {MOOD_LABELS[m]}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => actions.setStep("confirm")}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button size="lg" disabled={isProcessing} onClick={handleContinue}>
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
            </>
          ) : assets.inspirationImages.length > 0 ? (
            <>
              Analyze &amp; generate <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              Skip &amp; generate <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
