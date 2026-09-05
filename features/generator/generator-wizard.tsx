"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useGeneratorStore } from "@/lib/store/generator-store";
import { GENERATOR_STEPS, GeneratorStep } from "@/types/generator";
import { Progress } from "@/components/ui/progress";
import { StepUpload } from "./steps/step-upload";
import { StepConfirmResume } from "./steps/step-confirm-resume";
import { StepInspiration } from "./steps/step-inspiration";
import { StepGenerating } from "./steps/step-generating";
import { StepEditorPreview } from "./steps/step-editor-preview";

const STEP_LABELS: Record<GeneratorStep, string> = {
  upload: "Upload",
  confirm: "Confirm details",
  inspiration: "Inspiration",
  generating: "Generating",
  editor: "Edit & preview",
};

const STEP_COMPONENTS: Record<GeneratorStep, React.ComponentType> = {
  upload: StepUpload,
  confirm: StepConfirmResume,
  inspiration: StepInspiration,
  generating: StepGenerating,
  editor: StepEditorPreview,
};

export function GeneratorWizard() {
  const step = useGeneratorStore((s) => s.step);
  const stepIndex = GENERATOR_STEPS.indexOf(step);
  const progressValue = ((stepIndex + 1) / GENERATOR_STEPS.length) * 100;
  const isFullBleed = step === "editor";

  const StepComponent = STEP_COMPONENTS[step];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 font-display text-sm font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-background">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">Portfolio AI</span>
          </Link>

          {step !== "editor" && (
            <div className="hidden flex-1 items-center justify-center gap-2 text-xs text-muted-foreground sm:flex">
              {GENERATOR_STEPS.filter((s) => s !== "editor").map((s, i) => (
                <span key={s} className={i <= stepIndex ? "text-foreground" : ""}>
                  {STEP_LABELS[s]}
                  {i < GENERATOR_STEPS.length - 2 && <span className="mx-2 text-border">&rarr;</span>}
                </span>
              ))}
            </div>
          )}

          <Link href="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Exit
          </Link>
        </div>
        {step !== "editor" && <Progress value={progressValue} className="h-[3px] rounded-none" />}
      </header>

      <main className={isFullBleed ? "flex-1" : "container flex flex-1 items-start justify-center py-14"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={isFullBleed ? "h-full" : "w-full max-w-2xl"}
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
