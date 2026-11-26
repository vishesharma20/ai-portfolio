"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Loader2, User } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useGeneratorStore, useGeneratorActions } from "@/lib/store/generator-store";
import { usePortfolioGeneration } from "@/hooks/use-portfolio-generation";
import { useFileUpload } from "@/hooks/use-file-upload";
import { emptyResumeData } from "@/types/resume";

export function StepUpload() {
  const { entryMode, assets, isProcessing, error } = useGeneratorStore(
    useShallow((s) => ({
      entryMode: s.entryMode,
      assets: s.assets,
      isProcessing: s.isProcessing,
      error: s.error,
    }))
  );
  const actions = useGeneratorActions();
  const { runResumeExtraction } = usePortfolioGeneration();
  const { readAsDataUrl } = useFileUpload();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleResumeFile = (file: File) => {
    const validTypes = [".pdf", ".docx"];
    const isValid = validTypes.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!isValid) {
      setLocalError("Please upload a PDF or DOCX file.");
      return;
    }
    setLocalError(null);
    actions.setAssets({ resumeFile: file, resumeFileName: file.name });
  };

  const handlePhotoFile = async (file: File) => {
    const dataUrl = await readAsDataUrl(file);
    if (dataUrl) actions.setAssets({ photoDataUrl: dataUrl });
  };

  const handleContinue = async () => {
    if (entryMode === "resume" && assets.resumeFile) {
      await runResumeExtraction();
    } else {
      actions.setResumeData({ ...emptyResumeData, photoUrl: assets.photoDataUrl ?? "" });
    }
    actions.setStep("confirm");
  };

  const canContinue = entryMode === "manual" || Boolean(assets.resumeFile);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Let&apos;s start with what you&apos;ve got.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Upload a resume for instant extraction, or enter your details by hand.
        </p>
      </div>

      <div className="flex justify-center">
        <Tabs
          value={entryMode}
          onValueChange={(v) => actions.setEntryMode(v as "resume" | "manual")}
        >
          <TabsList>
            <TabsTrigger value="resume">Upload resume</TabsTrigger>
            <TabsTrigger value="manual">Enter manually</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {entryMode === "resume" ? (
        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
            <CardDescription>PDF or DOCX &middot; we extract everything automatically</CardDescription>
          </CardHeader>
          <CardContent>
            <Dropzone
              accept=".pdf,.docx"
              label="Drag your resume here, or browse"
              hint="PDF or DOCX, up to 10MB"
              fileName={assets.resumeFileName}
              onFile={handleResumeFile}
              onClear={() => actions.setAssets({ resumeFile: null, resumeFileName: null })}
            />
            {(localError || error) && (
              <p className="mt-3 text-sm text-destructive">{localError ?? error}</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Manual entry</CardTitle>
            <CardDescription>You&apos;ll fill in your details on the next step.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/20 p-5 text-sm text-muted-foreground">
            <User className="h-4 w-4 shrink-0" />
            No file needed. We&apos;ll show you an editable form with empty fields to fill in.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile photo</CardTitle>
          <CardDescription>Optional</CardDescription>
        </CardHeader>
        <CardContent>
          <Dropzone
            accept="image/*"
            label="Add a profile photo"
            hint="PNG or JPG"
            previewUrl={assets.photoDataUrl}
            fileName={assets.photoDataUrl ? "Photo added" : null}
            onFile={handlePhotoFile}
            onClear={() => actions.setAssets({ photoDataUrl: null })}
            className="py-6"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" disabled={!canContinue || isProcessing} onClick={handleContinue}>
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Reading resume...
            </>
          ) : (
            <>
              Continue <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
