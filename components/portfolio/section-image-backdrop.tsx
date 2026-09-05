"use client";

import { hexToRgba } from "@/lib/design-tokens";

interface Props {
  src?: string;
  backgroundColor: string;
  /** 0-100, straight from tokens.backgroundBlur — drives blur, image visibility, and tint together so 0 truly reads as clean and sharp. */
  intensity?: number;
  /** Pan/zoom framing, 0-100 / 0-100 / 1-2.5 — shared across every section unless overridden. */
  focusX?: number;
  focusY?: number;
  zoom?: number;
}

/** A soft image backdrop behind a section's content — used to carry the inspiration imagery through the whole page, not just the hero. */
export function SectionImageBackdrop({
  src,
  backgroundColor,
  intensity = 45,
  focusX = 50,
  focusY = 50,
  zoom = 1.1,
}: Props) {
  if (!src) return null;
  const t = Math.min(100, Math.max(0, intensity)) / 100;
  const blurPx = Math.round(t * 28);
  const imageOpacity = 0.8 - t * 0.4; // 0.80 (crisp) down to 0.40 (soft)
  const overlayOpacity = 0.28 + t * 0.34; // 0.28 (still tinted enough for contrast) up to 0.62

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        style={{
          opacity: imageOpacity,
          filter: `blur(${blurPx}px)`,
          objectPosition: `${focusX}% ${focusY}%`,
          transform: `scale(${zoom})`,
        }}
      />
      <div className="absolute inset-0" style={{ background: hexToRgba(backgroundColor, overlayOpacity) }} />
    </div>
  );
}
