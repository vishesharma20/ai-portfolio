"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getFontFamily, hexToRgba } from "@/lib/design-tokens";
import { typographyStyleOptions } from "@/types/design-tokens";
import { TextAnimation } from "@/types/portfolio";
import { usePortfolioEdit } from "@/features/portfolio/portfolio-editor-context";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { TextFormatToolbar } from "@/components/ui/text-format-toolbar";

const TEXT_ANIM_VARIANTS: Record<
  Exclude<TextAnimation, "none" | "typewriter">,
  { initial: object; animate: object; transition: object }
> = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.6, ease: "easeOut" } },
  zoom: { initial: { opacity: 0, scale: 0.72 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.6, ease: "easeOut" } },
  flip: { initial: { opacity: 0, rotateX: -80 }, animate: { opacity: 1, rotateX: 0 }, transition: { duration: 0.7, ease: "easeOut" } },
  pulse: { initial: { opacity: 0, scale: 0.88 }, animate: { opacity: 1, scale: [1, 1.06, 1] }, transition: { duration: 0.8, ease: "easeOut" } },
  rotate: { initial: { opacity: 0, rotate: -14 }, animate: { opacity: 1, rotate: 0 }, transition: { duration: 0.65, ease: "easeOut" } },
  bounce: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring", stiffness: 220, damping: 15 },
  },
  slide: { initial: { opacity: 0, x: -28 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.55, ease: "easeOut" } },
};

type EditableTag = "span" | "p" | "h1" | "h2" | "h3" | "div";

interface EditableTextProps {
  value: string;
  onCommit: (value: string) => void;
  as?: EditableTag;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Theme color used to tint the hover/focus affordance so it matches the generated palette. */
  ringColor?: string;
  /**
   * Unique, stable identifier for this field. When provided, a floating
   * color/size formatting toolbar appears while editing, and any changes
   * persist keyed to this string. Omit for dynamic array items with no
   * stable id (formatting is skipped there, editing still works normally).
   */
  styleKey?: string;
}

/**
 * Renders `value` as a contentEditable element that commits back to the store
 * on blur. Click-to-edit, directly in the live preview — no separate
 * "edit mode" or form field required.
 *
 * The DOM is treated as the source of truth for keystrokes; React only ever
 * writes into it when the value changed externally and the element isn't
 * currently focused, so we never fight the browser's caret/selection while
 * someone is actively typing.
 */
export function EditableText({
  value,
  onCommit,
  as: Tag = "span",
  multiline = false,
  placeholder = "Click to edit",
  className = "",
  style,
  ringColor = "#7C5CFC",
  styleKey,
}: EditableTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const editCtx = usePortfolioEdit();
  const editable = Boolean(editCtx);
  const prefersReducedMotion = usePrefersReducedMotion();
  const override = styleKey ? editCtx?.textStyles[styleKey] : undefined;
  const animation: TextAnimation = override?.animation ?? "none";
  const hasPlayedTypewriter = useRef(false);
  const typewriterTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const suppressBlurRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return; // don't clobber an active edit
    if (animation === "typewriter" && !hasPlayedTypewriter.current) return; // deferred to the reveal below
    if (el.textContent !== value) el.textContent = value;
  }, [value, animation]);

  useEffect(() => {
    return () => {
      if (typewriterTimer.current) clearInterval(typewriterTimer.current);
    };
  }, []);

  const startTypewriter = useCallback(() => {
    const el = ref.current;
    if (!el || hasPlayedTypewriter.current || document.activeElement === el || !value) return;
    hasPlayedTypewriter.current = true;
    if (prefersReducedMotion) {
      el.textContent = value; // show the final text immediately, no character-by-character reveal
      return;
    }
    let i = 0;
    const stepMs = Math.min(55, Math.max(12, 1400 / value.length));
    el.textContent = "";
    typewriterTimer.current = setInterval(() => {
      i++;
      el.textContent = value.slice(0, i);
      if (i >= value.length && typewriterTimer.current) {
        clearInterval(typewriterTimer.current);
        typewriterTimer.current = null;
      }
    }, stepMs);
  }, [value, prefersReducedMotion]);

  const updateRect = useCallback(() => {
    if (ref.current) setRect(ref.current.getBoundingClientRect());
  }, []);

  // Keep the floating toolbar glued to the field while editing, through scroll,
  // resize, and size changes triggered by the toolbar itself.
  useEffect(() => {
    if (!isFocused) return;
    updateRect();
    const onScrollOrResize = () => updateRect();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [isFocused, updateRect, override?.color, override?.fontSizePx]);

  const commit = useCallback(() => {
    if (!editable) return;
    const el = ref.current;
    if (!el) return;
    const raw = (multiline ? el.innerText : el.textContent) ?? "";
    const clean = multiline
      ? raw.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+$/gm, "").trim()
      : raw.replace(/\s+/g, " ").trim();
    if (clean !== value) onCommit(clean);
    if (el.textContent !== clean) el.textContent = clean; // normalize stray <br>/<div> from typing
  }, [editable, multiline, onCommit, value]);

  const handleFocus = useCallback(() => {
    if (!editable) return;
    if (typewriterTimer.current) {
      clearInterval(typewriterTimer.current);
      typewriterTimer.current = null;
      if (ref.current) ref.current.textContent = value;
    }
    if (styleKey) setIsFocused(true);
  }, [editable, styleKey, value]);

  const handleBlur = useCallback(() => {
    if (suppressBlurRef.current) return; // a toolbar interaction is in progress — stay focused
    commit();
    setIsFocused(false);
  }, [commit]);

  const handleToolbarInteractionStart = useCallback(() => {
    suppressBlurRef.current = true;
  }, []);

  const handleToolbarInteractionEnd = useCallback(() => {
    // Let the click/change handler run first, then re-arm normal blur behavior.
    setTimeout(() => {
      suppressBlurRef.current = false;
    }, 0);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" && !multiline) {
        e.preventDefault();
        (e.currentTarget as HTMLElement).blur();
      }
      if (e.key === "Escape") {
        const el = ref.current;
        if (el) el.textContent = value;
        (e.currentTarget as HTMLElement).blur();
      }
    },
    [multiline, value]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLElement>) => {
      e.preventDefault();
      const raw = e.clipboardData.getData("text/plain");
      const text = multiline ? raw : raw.replace(/[\r\n]+/g, " ");
      if (typeof document.execCommand === "function") {
        document.execCommand("insertText", false, text);
      } else {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(text));
          range.collapse(false);
        }
      }
    },
    [multiline]
  );

  const handleGrow = useCallback(() => {
    if (!styleKey || !editCtx) return;
    const el = ref.current;
    const current = override?.fontSizePx ?? (el ? parseFloat(getComputedStyle(el).fontSize) : 16);
    editCtx.setTextStyle(styleKey, { fontSizePx: Math.min(96, Math.round(current * 1.15)) });
  }, [styleKey, override?.fontSizePx, editCtx]);

  const handleShrink = useCallback(() => {
    if (!styleKey || !editCtx) return;
    const el = ref.current;
    const current = override?.fontSizePx ?? (el ? parseFloat(getComputedStyle(el).fontSize) : 16);
    editCtx.setTextStyle(styleKey, { fontSizePx: Math.max(10, Math.round(current * 0.87)) });
  }, [styleKey, override?.fontSizePx, editCtx]);

  const handleColorChange = useCallback(
    (color: string) => {
      if (styleKey && editCtx) editCtx.setTextStyle(styleKey, { color });
    },
    [styleKey, editCtx]
  );

  const handleReset = useCallback(() => {
    if (styleKey && editCtx) editCtx.clearTextStyle(styleKey);
  }, [styleKey, editCtx]);

  const handleAnimationChange = useCallback(
    (next: TextAnimation) => {
      if (styleKey && editCtx) editCtx.setTextStyle(styleKey, { animation: next });
    },
    [styleKey, editCtx]
  );

  const handleTypographyChange = useCallback(
    (typographyStyle: (typeof typographyStyleOptions)[number]) => {
      if (styleKey && editCtx) editCtx.setTextStyle(styleKey, { typographyStyle });
    },
    [styleKey, editCtx]
  );

  const themeStyle = {
    "--edit-hover-bg": hexToRgba(ringColor, 0.08),
    "--edit-hover-ring": hexToRgba(ringColor, 0.32),
    "--edit-focus-bg": hexToRgba(ringColor, 0.1),
    "--edit-focus-ring": hexToRgba(ringColor, 0.75),
  } as React.CSSProperties;

  const MotionTag = (motion as unknown as Record<EditableTag, React.ElementType>)[Tag];
  const animVariant =
    animation !== "none" && animation !== "typewriter" && !prefersReducedMotion ? TEXT_ANIM_VARIANTS[animation] : null;
  const motionProps =
    styleKey && animation !== "none"
      ? {
          viewport: { once: true, margin: "-40px" },
          ...(animVariant
            ? { initial: animVariant.initial, whileInView: animVariant.animate, transition: animVariant.transition }
            : {}),
          ...(animation === "typewriter" ? { onViewportEnter: startTypewriter } : {}),
        }
      : {};

  return (
    <>
      <MotionTag
        ref={ref as React.Ref<never>}
        contentEditable={editable}
        suppressContentEditableWarning={editable}
        role="textbox"
        aria-label={placeholder}
        aria-multiline={multiline}
        aria-readonly={!editable}
        data-placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={`${editable ? "editable-text" : ""} ${className}`}
        style={{
          ...themeStyle,
          whiteSpace: multiline ? "pre-wrap" : style?.whiteSpace,
          ...style,
          ...(override?.color ? { color: override.color } : {}),
          ...(override?.fontSizePx ? { fontSize: `${override.fontSizePx}px` } : {}),
          ...(override?.typographyStyle ? { fontFamily: getFontFamily(override.typographyStyle) } : {}),
        }}
        {...motionProps}
      />
      {isFocused && styleKey && rect && (
        <TextFormatToolbar
          rect={rect}
          color={override?.color ?? "#F5F3EE"}
          animation={animation}
          typographyStyle={override?.typographyStyle ?? "modern-sans"}
          hasOverride={Boolean(override?.color || override?.fontSizePx || override?.typographyStyle || (override?.animation && override.animation !== "none"))}
          onColorChange={handleColorChange}
          onAnimationChange={handleAnimationChange}
          onTypographyChange={handleTypographyChange}
          onGrow={handleGrow}
          onShrink={handleShrink}
          onReset={handleReset}
          onInteractionStart={handleToolbarInteractionStart}
          onInteractionEnd={handleToolbarInteractionEnd}
        />
      )}
    </>
  );
}

/** Focuses a contentEditable node and places the caret at the end of its text. */
export function focusEditableAtEnd(el: HTMLElement | null | undefined) {
  if (!el) return;
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}
