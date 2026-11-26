import { DesignTokens } from "@/types/design-tokens";

export function getFontFamily(style: DesignTokens["typographyStyle"]): string {
  switch (style) {
    case "classic-serif":
      return "'Newsreader', Georgia, 'Times New Roman', serif";
    case "geometric":
      return "'Poppins', 'Futura', system-ui, sans-serif";
    case "monospace-technical":
      return "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace";
    case "elegant-serif":
      return "'Playfair Display', Georgia, serif";
    case "rounded-friendly":
      return "'Quicksand', 'Nunito', system-ui, sans-serif";
    case "bold-display":
      return "'Archivo Black', 'Arial Black', sans-serif";
    case "handwritten":
      return "'Caveat', cursive";
    case "condensed":
      return "'Oswald', 'Arial Narrow', sans-serif";
    case "space-grotesk":
      return "'Space Grotesk', system-ui, sans-serif";
    case "dm-sans":
      return "'DM Sans', system-ui, sans-serif";
    case "lora-serif":
      return "'Lora', Georgia, serif";
    case "rubik":
      return "'Rubik', system-ui, sans-serif";
    case "ibm-plex-mono":
      return "'IBM Plex Mono', ui-monospace, monospace";
    case "fraunces":
      return "'Fraunces', Georgia, serif";
    case "manrope":
      return "'Manrope', system-ui, sans-serif";
    case "outfit":
      return "'Outfit', system-ui, sans-serif";
    case "merriweather":
      return "'Merriweather', Georgia, serif";
    case "syne":
      return "'Syne', system-ui, sans-serif";
    case "modern-sans":
    default:
      return "'Inter', system-ui, sans-serif";
  }
}

export function getSectionSpacing(density: DesignTokens["layoutDensity"]): {
  sectionPadding: string;
  gap: string;
} {
  switch (density) {
    case "spacious":
      return { sectionPadding: "clamp(5rem,12vw,9rem)", gap: "clamp(2.5rem,5vw,4rem)" };
    case "airy":
      return { sectionPadding: "clamp(4rem,10vw,8rem)", gap: "clamp(2rem,4vw,3.5rem)" };
    case "dense":
      return { sectionPadding: "clamp(2rem,5vw,4rem)", gap: "clamp(1rem,2vw,1.5rem)" };
    case "compact":
      return { sectionPadding: "clamp(1.5rem,4vw,3rem)", gap: "clamp(0.75rem,1.5vw,1.25rem)" };
    case "balanced":
    default:
      return { sectionPadding: "clamp(3rem,7vw,6rem)", gap: "clamp(1.5rem,3vw,2.5rem)" };
  }
}

/** Maps an animation style to the from/to values Framer Motion should animate between. */
function buildVariant(
  style: DesignTokens["animationStyle"],
  yOffset: number,
  xOffset: number,
  scaleFrom: number,
  blurFrom: number
) {
  switch (style) {
    case "fade":
      return { initial: { opacity: 0 }, animate: { opacity: 1 } };
    case "slide":
      return { initial: { opacity: 0, x: -xOffset }, animate: { opacity: 1, x: 0 } };
    case "zoom":
      return { initial: { opacity: 0, scale: scaleFrom }, animate: { opacity: 1, scale: 1 } };
    case "blur":
      return { initial: { opacity: 0, filter: `blur(${blurFrom}px)` }, animate: { opacity: 1, filter: "blur(0px)" } };
    case "bounce":
      return { initial: { opacity: 0, y: yOffset * 1.6 }, animate: { opacity: 1, y: 0 } };
    case "pop":
      return { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 } };
    case "drop":
      return { initial: { opacity: 0, y: -yOffset * 1.8 }, animate: { opacity: 1, y: 0 } };
    case "unfold":
      return { initial: { opacity: 0, scaleX: 0 }, animate: { opacity: 1, scaleX: 1 } };
    case "flip":
      return { initial: { opacity: 0, rotateX: -75 }, animate: { opacity: 1, rotateX: 0 } };
    case "swing":
      return { initial: { opacity: 0, rotate: -12, y: yOffset / 2 }, animate: { opacity: 1, rotate: 0, y: 0 } };
    case "rotate":
      return { initial: { opacity: 0, rotate: -18, scale: 0.9 }, animate: { opacity: 1, rotate: 0, scale: 1 } };
    case "squash":
      return { initial: { opacity: 0, scaleX: 1.12, scaleY: 0.78, y: yOffset / 2 }, animate: { opacity: 1, scaleX: 1, scaleY: 1, y: 0 } };
    case "tilt":
      return { initial: { opacity: 0, rotateY: -22, x: xOffset / 2 }, animate: { opacity: 1, rotateY: 0, x: 0 } };
    case "spring":
      return { initial: { opacity: 0, y: yOffset, scale: 0.88 }, animate: { opacity: 1, y: 0, scale: 1 } };
    case "wipe":
      return { initial: { opacity: 0, clipPath: "inset(0 100% 0 0)" }, animate: { opacity: 1, clipPath: "inset(0 0% 0 0)" } };
    case "glide":
      return { initial: { opacity: 0, x: xOffset, y: yOffset * 0.25 }, animate: { opacity: 1, x: 0, y: 0 } };
    case "fold":
      return { initial: { opacity: 0, rotateY: -75, scaleX: 0.75 }, animate: { opacity: 1, rotateY: 0, scaleX: 1 } };
    case "curtain":
      return { initial: { opacity: 0, clipPath: "inset(0 0 100% 0)" }, animate: { opacity: 1, clipPath: "inset(0 0 0% 0)" } };
    case "elastic":
      return { initial: { opacity: 0, scale: 0.65 }, animate: { opacity: 1, scale: 1 } };
    case "none":
      return { initial: undefined, animate: { opacity: 1 } };
    case "rise":
    default:
      return { initial: { opacity: 0, y: yOffset }, animate: { opacity: 1, y: 0 } };
  }
}

/** Maps 0-100 animation intensity + a chosen style to concrete Framer Motion variants. */
export function getMotionConfig(intensity: number, style: DesignTokens["animationStyle"] = "rise") {
  const clamped = Math.min(100, Math.max(0, intensity));
  const t = clamped / 100;
  const enabled = clamped > 4 && style !== "none";
  const yOffset = 12 + t * 28; // 12 - 40px
  const xOffset = 16 + t * 32; // 16 - 48px
  const scaleFrom = 0.94 - t * 0.1; // 0.94 - 0.84
  const blurFrom = 4 + t * 10; // 4 - 14px
  const variant = buildVariant(style, yOffset, xOffset, scaleFrom, blurFrom);
  const isSpring = style === "bounce" || style === "pop" || style === "drop" || style === "spring" || style === "squash" || style === "elastic";
  const duration = 0.4 + t * 0.5; // 0.4 - 0.9s

  return {
    enabled,
    style,
    duration,
    stagger: 0.04 + t * 0.1, // 0.04 - 0.14s
    yOffset,
    initial: enabled ? variant.initial : undefined,
    animate: variant.animate,
    // Spring gives bounce/pop/drop their overshoot; everything else uses a plain eased tween.
    transition: isSpring
      ? { type: "spring" as const, stiffness: 300 - t * 90, damping: 14 + t * 4 }
      : { duration, ease: "easeOut" as const },
    hoverLift: enabled ? (style === "zoom" || style === "pop" ? { scale: 1.03 } : { y: -4 }) : undefined,
  };
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
