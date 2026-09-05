"use client";

import { motion } from "framer-motion";
import { DesignTokens } from "@/types/design-tokens";
import { hexToRgba } from "@/lib/design-tokens";

interface Props {
  tokens: DesignTokens;
}

/**
 * A full-page ambient backdrop layer, independent of any uploaded photo
 * backdrop (SectionImageBackdrop). This is what gives the page a "designed"
 * feel even with zero uploads — a gradient wash, a mesh of soft color blobs,
 * a slow-drifting aurora, a technical grid, a dot field, film-grain noise,
 * or rotating rays. Sits behind everything, ignores pointer events, and
 * respects `backgroundAnimated` for the styles that loop continuously.
 */
export function AmbientBackground({ tokens }: Props) {
  const { backgroundStyle, backgroundAnimated, primaryColor, accentColor, backgroundColor } = tokens;

  if (backgroundStyle === "plain") return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {backgroundStyle === "gradient" && (
        <motion.div
          className="absolute inset-[-20%]"
          style={{
            background: `linear-gradient(120deg, ${hexToRgba(primaryColor, 0.22)}, transparent 45%, ${hexToRgba(
              accentColor,
              0.2
            )})`,
          }}
          animate={backgroundAnimated ? { rotate: [0, 8, 0, -8, 0] } : undefined}
          transition={backgroundAnimated ? { duration: 26, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
      )}

      {backgroundStyle === "mesh" && (
        <>
          <motion.div
            className="absolute -left-[10%] -top-[15%] h-[55%] w-[55%] rounded-full blur-[100px]"
            style={{ background: hexToRgba(primaryColor, 0.28) }}
            animate={backgroundAnimated ? { x: [0, 40, -10, 0], y: [0, 20, -20, 0] } : undefined}
            transition={backgroundAnimated ? { duration: 22, repeat: Infinity, ease: "easeInOut" } : undefined}
          />
          <motion.div
            className="absolute -right-[10%] top-[10%] h-[50%] w-[50%] rounded-full blur-[100px]"
            style={{ background: hexToRgba(accentColor, 0.22) }}
            animate={backgroundAnimated ? { x: [0, -30, 15, 0], y: [0, -25, 10, 0] } : undefined}
            transition={backgroundAnimated ? { duration: 28, repeat: Infinity, ease: "easeInOut" } : undefined}
          />
          <motion.div
            className="absolute bottom-[-15%] left-[25%] h-[45%] w-[45%] rounded-full blur-[100px]"
            style={{ background: hexToRgba(primaryColor, 0.16) }}
            animate={backgroundAnimated ? { x: [0, 20, -20, 0], y: [0, -15, 15, 0] } : undefined}
            transition={backgroundAnimated ? { duration: 24, repeat: Infinity, ease: "easeInOut" } : undefined}
          />
        </>
      )}

      {backgroundStyle === "aurora" && (
        <>
          <motion.div
            className="absolute left-1/2 top-[-30%] h-[900px] w-[500px] -translate-x-1/2 rounded-[50%] blur-[120px]"
            style={{ background: `linear-gradient(180deg, ${hexToRgba(primaryColor, 0.35)}, transparent)` }}
            animate={backgroundAnimated ? { rotate: [-8, 8, -8], x: ["-50%", "-46%", "-54%", "-50%"] } : undefined}
            transition={backgroundAnimated ? { duration: 18, repeat: Infinity, ease: "easeInOut" } : undefined}
          />
          <motion.div
            className="absolute left-1/2 top-[-25%] h-[800px] w-[420px] -translate-x-1/2 rounded-[50%] blur-[120px]"
            style={{ background: `linear-gradient(180deg, ${hexToRgba(accentColor, 0.3)}, transparent)` }}
            animate={backgroundAnimated ? { rotate: [10, -10, 10], x: ["-50%", "-56%", "-44%", "-50%"] } : undefined}
            transition={backgroundAnimated ? { duration: 21, repeat: Infinity, ease: "easeInOut" } : undefined}
          />
        </>
      )}

      {backgroundStyle === "grid" && (
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${hexToRgba(primaryColor, 0.14)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(
              primaryColor,
              0.14
            )} 1px, transparent 1px)`,
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 20%, black 40%, transparent 90%)",
          }}
          animate={backgroundAnimated ? { opacity: [0.6, 1, 0.6] } : undefined}
          transition={backgroundAnimated ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
      )}

      {backgroundStyle === "dots" && (
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(${hexToRgba(accentColor, 0.35)} 1.5px, transparent 1.5px)`,
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 90%)",
          }}
          animate={backgroundAnimated ? { backgroundPosition: ["0px 0px", "26px 26px"] } : undefined}
          transition={backgroundAnimated ? { duration: 14, repeat: Infinity, ease: "linear" } : undefined}
        />
      )}

      {backgroundStyle === "noise" && (
        <>
          <svg className="absolute inset-0 h-full w-full opacity-[0.05]">
            <filter id="portfolio-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#portfolio-noise)" />
          </svg>
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(circle at 50% 0%, transparent, ${hexToRgba(backgroundColor, 0.6)})` }}
          />
        </>
      )}

      {backgroundStyle === "rays" && (
        <motion.div
          className="absolute left-1/2 top-1/2 h-[220%] w-[220%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: `conic-gradient(from 0deg, ${hexToRgba(primaryColor, 0.16)} 0deg, transparent 40deg, transparent 80deg, ${hexToRgba(
              accentColor,
              0.14
            )} 120deg, transparent 160deg, transparent 220deg, ${hexToRgba(primaryColor, 0.14)} 260deg, transparent 300deg, transparent 340deg)`,
          }}
          animate={backgroundAnimated ? { rotate: 360 } : undefined}
          transition={backgroundAnimated ? { duration: 90, repeat: Infinity, ease: "linear" } : undefined}
        />
      )}
    </div>
  );
}
