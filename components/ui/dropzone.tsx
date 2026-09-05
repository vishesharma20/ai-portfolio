"use client";

import * as React from "react";
import { UploadCloud, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  accept?: string;
  label: string;
  hint?: string;
  fileName?: string | null;
  previewUrl?: string | null;
  onFile: (file: File) => void;
  onClear?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export function Dropzone({
  accept,
  label,
  hint,
  fileName,
  previewUrl,
  onFile,
  onClear,
  className,
  icon,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) onFile(files[0]);
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-secondary/20 px-6 py-10 text-center transition-colors",
        isDragging && "border-primary bg-primary/5",
        fileName && "border-solid border-border bg-secondary/30",
        className
      )}
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
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="preview"
          className="mb-1 h-20 w-20 rounded-full object-cover ring-2 ring-border"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          {fileName ? <CheckCircle2 className="h-5 w-5 text-accent" /> : icon ?? <UploadCloud className="h-5 w-5" />}
        </div>
      )}

      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          {fileName ?? label}
        </p>
        {hint && !fileName && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs font-medium text-primary hover:underline"
        >
          {fileName ? "Replace file" : "Browse files"}
        </button>
        {fileName && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="h-3 w-3" /> Remove
          </button>
        )}
      </div>
    </div>
  );
}
