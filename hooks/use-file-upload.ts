"use client";

import { useCallback, useState } from "react";
import { readFileAsDataUrl } from "@/lib/utils";

export function useFileUpload() {
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readAsDataUrl = useCallback(async (file: File): Promise<string | null> => {
    setIsReading(true);
    setError(null);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      return dataUrl;
    } catch {
      setError("Couldn't read that file. Try a different one.");
      return null;
    } finally {
      setIsReading(false);
    }
  }, []);

  return { readAsDataUrl, isReading, error };
}
