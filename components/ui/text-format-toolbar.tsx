"use client";

import { createPortal } from "react-dom";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { TextAnimation } from "@/lib/store/generator-store";
import { typographyStyleOptions } from "@/types/design-tokens";

const SWATCHES = ["#F5F3EE", "#0A0A0A", "#EF4444", "#3B82F6", "#22C55E", "#F59E0B", "#A855F7"];
const ANIMATIONS: { value: TextAnimation; label: string }[] = [
  { value: "none", label: "None" },
  { value: "typewriter", label: "Typewriter" },
  { value: "fade", label: "Fade" },
  { value: "bounce", label: "Bounce" },
  { value: "slide", label: "Slide" },
  { value: "zoom", label: "Zoom" },
  { value: "flip", label: "Flip" },
  { value: "pulse", label: "Pulse" },
  { value: "rotate", label: "Rotate" },
];

interface TextFormatToolbarProps {
  rect: DOMRect;
  color: string;
  animation: TextAnimation;
  typographyStyle: (typeof typographyStyleOptions)[number];
  hasOverride: boolean;
  onColorChange: (color: string) => void;
  onAnimationChange: (animation: TextAnimation) => void;
  onTypographyChange: (typographyStyle: (typeof typographyStyleOptions)[number]) => void;
  onGrow: () => void;
  onShrink: () => void;
  onReset: () => void;
  onInteractionStart: () => void;
  onInteractionEnd: () => void;
}

/** Renders via portal to document.body so it always sits above the content, unclipped by any scroll container. */
export function TextFormatToolbar({
  rect,
  color,
  animation,
  typographyStyle,
  hasOverride,
  onColorChange,
  onAnimationChange,
  onTypographyChange,
  onGrow,
  onShrink,
  onReset,
  onInteractionStart,
  onInteractionEnd,
}: TextFormatToolbarProps) {
  if (typeof document === "undefined") return null;

  const top = Math.max(8, rect.top - 126);
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - 280);

  return createPortal(
    <div
      // Belt-and-suspenders against the underlying contentEditable losing focus (and this
      // toolbar unmounting mid-click) when interacting with it: preventDefault blocks the
      // browser's default focus-shift on mousedown, and the interaction guard covers any
      // browser/portal edge case where that isn't enough.
      onMouseDown={(e) => {
        e.preventDefault();
        onInteractionStart();
      }}
      onMouseUp={onInteractionEnd}
      className="fixed z-[100] flex w-64 flex-col gap-1.5 rounded-xl border border-border bg-popover p-1.5 shadow-xl"
      style={{ top, left }}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onShrink}
          aria-label="Decrease text size"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onGrow}
          aria-label="Increase text size"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        <div className="mx-0.5 h-4 w-px shrink-0 bg-border" />

        {SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onColorChange(c)}
            aria-label={`Set text color ${c}`}
            className={`h-5 w-5 shrink-0 rounded-full border transition-transform hover:scale-110 ${
              color.toLowerCase() === c.toLowerCase()
                ? "border-foreground ring-2 ring-foreground/30"
                : "border-border"
            }`}
            style={{ background: c }}
          />
        ))}
        <label
          className="relative h-5 w-5 shrink-0 cursor-pointer overflow-hidden rounded-full border border-border"
          title="Custom color"
        >
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="absolute -left-1 -top-1 h-7 w-7 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>

        {hasOverride && (
          <>
            <div className="mx-0.5 h-4 w-px shrink-0 bg-border" />
            <button
              type="button"
              onClick={onReset}
              aria-label="Reset formatting"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {ANIMATIONS.map((a) => (
          <button
            key={a.value}
            type="button"
            onClick={() => onAnimationChange(a.value)}
            className={`rounded-md border px-1.5 py-0.5 text-[10px] transition-colors ${
              animation === a.value
                ? "border-primary bg-primary/10 text-foreground"
                : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 px-1 text-[10px] text-muted-foreground">
        Font
        <select
          aria-label="Choose font for selected text"
          value={typographyStyle}
          onChange={(event) => onTypographyChange(event.target.value as (typeof typographyStyleOptions)[number])}
          onMouseDown={(event) => {
            event.stopPropagation();
            onInteractionStart();
          }}
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
        >
          {typographyStyleOptions.map((option) => (
            <option key={option} value={option}>{option.replace(/-/g, " ")}</option>
          ))}
        </select>
      </label>
    </div>,
    document.body
  );
}
