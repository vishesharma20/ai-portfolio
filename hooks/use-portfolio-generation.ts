"use client";

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGeneratorStore, useGeneratorActions } from "@/lib/store/generator-store";
import { ResumeData } from "@/types/resume";
import { DesignTokens } from "@/types/design-tokens";

interface ParseResumeResponse {
  data: ResumeData;
  usedAi: boolean;
}
interface AnalyzeInspirationResponse {
  tokens: DesignTokens;
  usedAi: boolean;
}

/**
 * Runs the "extract resume" + "analyze inspiration" pipeline and pushes
 * results into the generator store. Kept out of UI components so the flow
 * can be triggered from the upload step, retried from the confirm step,
 * or re-run later (e.g. a future "regenerate" action).
 */
export function usePortfolioGeneration() {
  const { assets, entryMode } = useGeneratorStore(
    useShallow((s) => ({ assets: s.assets, entryMode: s.entryMode }))
  );
  const actions = useGeneratorActions();

  const runResumeExtraction = useCallback(async () => {
    if (entryMode !== "resume" || !assets.resumeFile) return;
    actions.setProcessing(true);
    actions.setError(null);
    try {
      const formData = new FormData();
      formData.append("file", assets.resumeFile);

      const res = await fetch("/api/parse-resume", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Resume parsing failed");

      const json: ParseResumeResponse = await res.json();
      // The resume parser can't extract a photo from a PDF/DOCX, so carry
      // over whatever was uploaded separately in the "Profile photo" card
      // (unless the parser somehow already found one).
      actions.setResumeData({
        ...json.data,
        photoUrl: json.data.photoUrl || assets.photoDataUrl || "",
      });
    } catch (err) {
      actions.setError("We couldn't read that resume. You can fill the details in manually below.");
    } finally {
      actions.setProcessing(false);
    }
  }, [entryMode, assets.resumeFile, assets.photoDataUrl, actions]);

  const runInspirationAnalysis = useCallback(async () => {
    const primaryImage = assets.inspirationImages[0] ?? null;
    actions.setProcessing(true);
    actions.setError(null);
    try {
      const res = await fetch("/api/analyze-inspiration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: primaryImage }),
      });
      if (!res.ok) throw new Error("Inspiration analysis failed");

      const json: AnalyzeInspirationResponse = await res.json();
      actions.setDesignTokens({ ...json.tokens, backgroundImageUrl: primaryImage ?? "" });
    } catch (err) {
      actions.setError("We couldn't analyze that image, so we're using our default style instead.");
    } finally {
      actions.setProcessing(false);
    }
  }, [assets.inspirationImages, actions]);

  return { runResumeExtraction, runInspirationAnalysis };
}
