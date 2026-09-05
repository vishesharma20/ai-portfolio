"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useGeneratorActions } from "@/lib/store/generator-store";

const STAGES = [
  "Reading your resume...",
  "Composing your layout...",
  "Applying your style...",
  "Polishing the details...",
];

export function StepGenerating() {
  const actions = useGeneratorActions();
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, STAGES.length - 1));
    }, 500);
    const timeout = setTimeout(() => actions.setStep("editor"), 500 * STAGES.length + 300);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent"
      >
        <Sparkles className="h-7 w-7 text-background" />
      </motion.div>

      <h1 className="font-display text-2xl font-medium">Generating your portfolio</h1>

      <div className="mt-6 h-6">
        <motion.p
          key={stageIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground"
        >
          {STAGES[stageIndex]}
        </motion.p>
      </div>

      <div className="mt-8 flex gap-1.5">
        {STAGES.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${
              i <= stageIndex ? "bg-primary" : "bg-secondary"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
