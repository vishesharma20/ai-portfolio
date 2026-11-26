"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, TargetAndTransition, Transition } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  Maximize2,
  RotateCw,
  RotateCcw,
  Crop as CropIcon,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Waves,
  CircleDot,
  RefreshCw,
  Shuffle,
  Ban,
  ArrowUpDown,
  Vibrate,
  Wind,
  Orbit,
  Palette,
  Move,
  PartyPopper,
  Heart,
  Sparkles,
} from "lucide-react";
import { usePortfolioEdit } from "@/features/portfolio/portfolio-editor-context";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { Decoration, StickerMotion } from "@/types/portfolio";
import { isRecolorableSvg, recolorSvgToDataUrl, SVG_TEMPLATE_COLOR } from "@/lib/svg-utils";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Resolves the actual image src to render: recolors our own SVG doodles/borders on the fly, passes uploaded photos through untouched. */
function resolveImageSrc(content: string, color: string | undefined) {
  if (isRecolorableSvg(content)) return recolorSvgToDataUrl(content, color ?? SVG_TEMPLATE_COLOR);
  return content;
}

const RECOLOR_SWATCHES = ["#F5F3EE", "#0A0A0A", "#EF4444", "#3B82F6", "#22C55E", "#F59E0B", "#A855F7"];

const MOTION_LIST: StickerMotion[] = [
  "none",
  "float",
  "pulse",
  "spin",
  "wiggle",
  "bounce",
  "shake",
  "swing",
  "orbit",
  "drift",
  "tada",
  "heartbeat",
  "wobble",
  "twinkle",
  "bob",
  "breathe",
  "flip",
  "levitate",
];

const MOTION_ICONS: Record<StickerMotion, typeof Ban> = {
  none: Ban,
  float: Waves,
  pulse: CircleDot,
  spin: RefreshCw,
  wiggle: Shuffle,
  bounce: ArrowUpDown,
  shake: Vibrate,
  swing: Wind,
  orbit: Orbit,
  drift: Move,
  tada: PartyPopper,
  heartbeat: Heart,
  wobble: RefreshCw,
  twinkle: Sparkles,
  bob: ArrowUpDown,
  breathe: Wind,
  flip: RefreshCw,
  levitate: Orbit,
};

const MOTION_PRESETS: Record<Exclude<StickerMotion, "none">, { animate: TargetAndTransition; transition: Transition }> = {
  float: { animate: { y: [0, -10, 0] }, transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
  pulse: { animate: { scale: [1, 1.12, 1] }, transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" } },
  spin: { animate: { rotate: [0, 360] }, transition: { duration: 6, repeat: Infinity, ease: "linear" } },
  wiggle: { animate: { rotate: [-8, 8, -8] }, transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" } },
  bounce: { animate: { y: [0, -18, 0] }, transition: { duration: 0.8, repeat: Infinity, ease: "easeOut" } },
  shake: { animate: { x: [0, -4, 4, -4, 4, 0] }, transition: { duration: 0.5, repeat: Infinity, ease: "linear" } },
  swing: { animate: { rotate: [-12, 12, -12] }, transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  orbit: {
    animate: { x: [0, 8, 0, -8, 0], y: [0, -8, 0, 8, 0] },
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
  drift: {
    animate: { x: [0, 14, -6, 0], y: [0, -12, 6, 0] },
    transition: { duration: 7, repeat: Infinity, ease: "easeInOut" },
  },
  tada: {
    animate: { scale: [1, 1.2, 0.95, 1.15, 1], rotate: [0, -6, 6, -3, 0] },
    transition: { duration: 1.4, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" },
  },
  heartbeat: { animate: { scale: [1, 1.12, 0.98, 1.16, 1] }, transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" } },
  wobble: { animate: { rotate: [0, -10, 8, -6, 4, 0], x: [0, -3, 3, -2, 1, 0] }, transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" } },
  twinkle: { animate: { opacity: [0.45, 1, 0.6, 1], scale: [0.94, 1.08, 0.98, 1] }, transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  bob: { animate: { y: [0, -12, -4, 0], rotate: [0, 3, -3, 0] }, transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } },
  breathe: { animate: { scale: [1, 1.08, 1] }, transition: { duration: 3.6, repeat: Infinity, ease: "easeInOut" } },
  flip: { animate: { rotateY: [0, 180, 360] }, transition: { duration: 3.4, repeat: Infinity, ease: "easeInOut" } },
  levitate: { animate: { y: [0, -16, -6, 0], rotate: [0, -4, 4, 0] }, transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" } },
};

/**
 * Absolutely positioned over the whole portfolio (scrolls with the page).
 * The layer itself ignores pointer events so it never blocks clicks on the
 * real content underneath — only individual decorations opt back in.
 */
export function DecorationsLayer({ decorations }: { decorations: Decoration[] }) {
  const editCtx = usePortfolioEdit();
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const [openPanel, setOpenPanel] = useState<{ id: string; type: "motion" | "crop" | "color" } | null>(null);
  const resizeStartRef = useRef<{ scale: number; startDist: number } | null>(null);
  const rotateStartRef = useRef<{ rotation: number; startAngle: number } | null>(null);

  useEffect(() => {
    if (!selectedId) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest("[data-decoration]")) {
        setSelectedId(null);
        setOpenPanel(null);
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [selectedId]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (draggingId) {
        const xPercent = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
        const yPercent = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
        editCtx?.updateDecoration(draggingId, { xPercent, yPercent });
        return;
      }

      if (resizingId && resizeStartRef.current) {
        const d = decorations.find((x) => x.id === resizingId);
        if (!d) return;
        const centerX = rect.left + (d.xPercent / 100) * rect.width;
        const centerY = rect.top + (d.yPercent / 100) * rect.height;
        const dist = Math.max(1, Math.hypot(e.clientX - centerX, e.clientY - centerY));
        const ratio = dist / resizeStartRef.current.startDist;
        const newScale = clamp(+(resizeStartRef.current.scale * ratio).toFixed(2), 0.25, 8);
        editCtx?.updateDecoration(resizingId, { scale: newScale });
        return;
      }

      if (rotatingId && rotateStartRef.current) {
        const d = decorations.find((x) => x.id === rotatingId);
        if (!d) return;
        const centerX = rect.left + (d.xPercent / 100) * rect.width;
        const centerY = rect.top + (d.yPercent / 100) * rect.height;
        const angle = (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI;
        const delta = angle - rotateStartRef.current.startAngle;
        editCtx?.updateDecoration(rotatingId, { rotation: Math.round(rotateStartRef.current.rotation + delta) });
      }
    },
    [draggingId, resizingId, rotatingId, decorations, editCtx]
  );

  const endInteraction = useCallback(() => {
    setDraggingId(null);
    setResizingId(null);
    setRotatingId(null);
    resizeStartRef.current = null;
    rotateStartRef.current = null;
  }, []);

  if (decorations.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-20"
      onPointerMove={handlePointerMove}
      onPointerUp={endInteraction}
    >
      {decorations.map((d) => {
        const isSelected = selectedId === d.id;
        const panel = openPanel?.id === d.id ? openPanel.type : null;
        const flipBelow = d.yPercent < 20; // near the top of the page — open panels downward instead of clipping upward
        const nudgeCrop = (dx: number, dy: number) =>
          editCtx?.updateDecoration(d.id, {
            cropX: clamp((d.cropX ?? 0) + dx, -50, 50),
            cropY: clamp((d.cropY ?? 0) + dy, -50, 50),
          });

        return (
          <div
            key={d.id}
            data-decoration
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 touch-none select-none"
            style={{ left: `${d.xPercent}%`, top: `${d.yPercent}%`, zIndex: isSelected ? 30 : 20 }}
            onPointerDown={(e) => {
              if (!editCtx) return;
              e.stopPropagation();
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              setSelectedId(d.id);
              setDraggingId(d.id);
            }}
          >
            {d.kind === "border" ? (
              <div
                className="cursor-grab active:cursor-grabbing"
                style={{
                  width: d.widthPx ?? 260,
                  height: d.heightPx ?? 28,
                  backgroundImage: `url(${resolveImageSrc(d.content, d.color)})`,
                  backgroundRepeat: "repeat-x",
                  backgroundSize: `auto ${d.heightPx ?? 28}px`,
                  backgroundPosition: "left center",
                }}
              />
            ) : d.kind === "emoji" ? (
              <motion.span
                className="block cursor-grab leading-none drop-shadow-lg active:cursor-grabbing"
                style={{ fontSize: d.scale * 48, rotate: d.rotation }}
                animate={d.motion && d.motion !== "none" && !prefersReducedMotion ? MOTION_PRESETS[d.motion].animate : undefined}
                transition={d.motion && d.motion !== "none" && !prefersReducedMotion ? MOTION_PRESETS[d.motion].transition : undefined}
                whileHover={d.interactive && !prefersReducedMotion ? { scale: 1.3, rotate: [0, -10, 10, 0], transition: { duration: 0.35 } } : undefined}
                whileTap={d.interactive && !prefersReducedMotion ? { scale: 0.82, transition: { duration: 0.12 } } : undefined}
              >
                {d.content}
              </motion.span>
            ) : (
              <motion.div
                className="cursor-grab overflow-hidden drop-shadow-lg active:cursor-grabbing"
                style={{ width: d.scale * 96, height: d.scale * 96, borderRadius: 6, rotate: d.rotation }}
                animate={d.motion && d.motion !== "none" && !prefersReducedMotion ? MOTION_PRESETS[d.motion].animate : undefined}
                transition={d.motion && d.motion !== "none" && !prefersReducedMotion ? MOTION_PRESETS[d.motion].transition : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImageSrc(d.content, d.color)}
                  alt=""
                  draggable={false}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: `${(d.cropScale ?? 1) * 100}%`,
                    height: `${(d.cropScale ?? 1) * 100}%`,
                    objectFit: "cover",
                    transform: `translate(-50%, -50%) translate(${d.cropX ?? 0}%, ${d.cropY ?? 0}%)`,
                  }}
                />
              </motion.div>
            )}

            {/* Continuous drag-to-resize handle (emoji/image only — borders resize by width/height instead). */}
            {isSelected && d.kind !== "border" && (
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  (e.target as HTMLElement).setPointerCapture(e.pointerId);
                  if (!containerRef.current) return;
                  const rect = containerRef.current.getBoundingClientRect();
                  const centerX = rect.left + (d.xPercent / 100) * rect.width;
                  const centerY = rect.top + (d.yPercent / 100) * rect.height;
                  resizeStartRef.current = {
                    scale: d.scale,
                    startDist: Math.max(1, Math.hypot(e.clientX - centerX, e.clientY - centerY)),
                  };
                  setResizingId(d.id);
                }}
                aria-label="Drag to resize"
                title="Drag to resize"
                className="absolute -bottom-1 -right-1 flex h-5 w-5 cursor-nwse-resize items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow"
              >
                <Maximize2 className="h-2.5 w-2.5" />
              </div>
            )}

            {/* Drag-to-rotate handle (emoji/image only). */}
            {isSelected && d.kind !== "border" && (
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  (e.target as HTMLElement).setPointerCapture(e.pointerId);
                  if (!containerRef.current) return;
                  const rect = containerRef.current.getBoundingClientRect();
                  const centerX = rect.left + (d.xPercent / 100) * rect.width;
                  const centerY = rect.top + (d.yPercent / 100) * rect.height;
                  const angle = (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI;
                  rotateStartRef.current = { rotation: d.rotation, startAngle: angle };
                  setRotatingId(d.id);
                }}
                aria-label="Drag to rotate"
                title="Drag to rotate"
                className="absolute -top-1 left-1/2 flex h-5 w-5 -translate-x-1/2 cursor-grab items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow active:cursor-grabbing"
              >
                <RotateCw className="h-2.5 w-2.5" />
              </div>
            )}

            {/* Expanded crop panel */}
            {isSelected && panel === "crop" && d.kind === "image" && (
              <div
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-border bg-popover px-1.5 py-1.5 shadow-xl"
                style={{ top: flipBelow ? "calc(100% + 52px)" : "-96px" }}
              >
                <button
                  type="button"
                  onClick={() => editCtx?.updateDecoration(d.id, { cropScale: clamp((d.cropScale ?? 1) - 0.15, 1, 3) })}
                  aria-label="Zoom out"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => editCtx?.updateDecoration(d.id, { cropScale: clamp((d.cropScale ?? 1) + 0.15, 1, 3) })}
                  aria-label="Zoom in"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <div className="mx-0.5 h-4 w-px shrink-0 bg-border" />
                <button type="button" onClick={() => nudgeCrop(-8, 0)} aria-label="Pan left" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => nudgeCrop(0, -8)} aria-label="Pan up" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => nudgeCrop(0, 8)} aria-label="Pan down" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => nudgeCrop(8, 0)} aria-label="Pan right" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <div className="mx-0.5 h-4 w-px shrink-0 bg-border" />
                <button
                  type="button"
                  onClick={() => editCtx?.updateDecoration(d.id, { cropScale: 1, cropX: 0, cropY: 0 })}
                  aria-label="Reset crop"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Expanded motion panel */}
            {isSelected && panel === "motion" && d.kind !== "border" && (
              <div
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute left-1/2 grid -translate-x-1/2 grid-cols-5 gap-1 rounded-xl border border-border bg-popover p-1.5 shadow-xl"
                style={{ top: flipBelow ? "calc(100% + 52px)" : "-56px" }}
              >
                {MOTION_LIST.map((m) => {
                  const Icon = MOTION_ICONS[m];
                  const active = (d.motion ?? "none") === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => editCtx?.updateDecoration(d.id, { motion: m })}
                      title={m}
                      aria-label={`Motion: ${m}`}
                      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Expanded color panel — for our own SVG doodles/borders only, not uploaded photos. */}
            {isSelected && panel === "color" && isRecolorableSvg(d.content) && (
              <div
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-popover px-1.5 py-1.5 shadow-xl"
                style={{ top: flipBelow ? "calc(100% + 52px)" : "-56px" }}
              >
                {RECOLOR_SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => editCtx?.updateDecoration(d.id, { color: c })}
                    aria-label={`Recolor ${c}`}
                    className={`h-5 w-5 shrink-0 rounded-full border transition-transform hover:scale-110 ${
                      (d.color ?? SVG_TEMPLATE_COLOR).toLowerCase() === c.toLowerCase()
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
                    value={d.color ?? SVG_TEMPLATE_COLOR}
                    onChange={(e) => editCtx?.updateDecoration(d.id, { color: e.target.value })}
                    className="absolute -left-1 -top-1 h-7 w-7 cursor-pointer border-0 bg-transparent p-0"
                  />
                </label>
              </div>
            )}

            {isSelected && (
              <div
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-border bg-popover px-1.5 py-1.5 shadow-xl"
                style={{ top: flipBelow ? "calc(100% + 8px)" : "-40px" }}
              >
                {d.kind === "border" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => editCtx?.updateDecoration(d.id, { widthPx: Math.max(60, (d.widthPx ?? 260) - 40) })}
                      aria-label="Shorten"
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-0.5 text-[10px] text-muted-foreground">Length</span>
                    <button
                      type="button"
                      onClick={() => editCtx?.updateDecoration(d.id, { widthPx: Math.min(1200, (d.widthPx ?? 260) + 40) })}
                      aria-label="Lengthen (repeats the pattern to form a continuous line)"
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <div className="mx-0.5 h-4 w-px shrink-0 bg-border" />
                    <button
                      type="button"
                      onClick={() => editCtx?.updateDecoration(d.id, { heightPx: Math.max(10, (d.heightPx ?? 28) - 6) })}
                      aria-label="Thinner"
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-0.5 text-[10px] text-muted-foreground">Thickness</span>
                    <button
                      type="button"
                      onClick={() => editCtx?.updateDecoration(d.id, { heightPx: Math.min(120, (d.heightPx ?? 28) + 6) })}
                      aria-label="Thicker"
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <div className="mx-0.5 h-4 w-px shrink-0 bg-border" />
                    <button
                      type="button"
                      onClick={() => setOpenPanel(panel === "color" ? null : { id: d.id, type: "color" })}
                      aria-label="Change color"
                      title="Change color"
                      className={`rounded-md p-1.5 transition-colors hover:bg-secondary hover:text-foreground ${
                        panel === "color" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <Palette className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => editCtx?.updateDecoration(d.id, { scale: clamp(+(d.scale - 0.2).toFixed(2), 0.25, 8) })}
                      aria-label="Shrink"
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => editCtx?.updateDecoration(d.id, { scale: clamp(+(d.scale + 0.2).toFixed(2), 0.25, 8) })}
                      aria-label="Grow"
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <div className="mx-0.5 h-4 w-px shrink-0 bg-border" />
                    {d.kind === "image" && (
                      <button
                        type="button"
                        onClick={() => setOpenPanel(panel === "crop" ? null : { id: d.id, type: "crop" })}
                        aria-label="Crop and zoom"
                        title="Crop and zoom"
                        className={`rounded-md p-1.5 transition-colors hover:bg-secondary hover:text-foreground ${
                          panel === "crop" ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        <CropIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {isRecolorableSvg(d.content) && (
                      <button
                        type="button"
                        onClick={() => setOpenPanel(panel === "color" ? null : { id: d.id, type: "color" })}
                        aria-label="Change color"
                        title="Change color"
                        className={`rounded-md p-1.5 transition-colors hover:bg-secondary hover:text-foreground ${
                          panel === "color" ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        <Palette className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {(() => {
                      const current = d.motion ?? "none";
                      const MotionIcon = MOTION_ICONS[current];
                      return (
                        <button
                          type="button"
                          onClick={() => setOpenPanel(panel === "motion" ? null : { id: d.id, type: "motion" })}
                          aria-label={`Motion: ${current}. Click to choose.`}
                          title={`Motion: ${current}`}
                          className={`rounded-md p-1.5 transition-colors hover:bg-secondary hover:text-foreground ${
                            current !== "none" || panel === "motion" ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          <MotionIcon className="h-3.5 w-3.5" />
                        </button>
                      );
                    })()}
                  </>
                )}
                <div className="mx-0.5 h-4 w-px shrink-0 bg-border" />
                <button
                  type="button"
                  onClick={() => {
                    editCtx?.removeDecoration(d.id);
                    setSelectedId(null);
                    setOpenPanel(null);
                  }}
                  aria-label="Remove"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
