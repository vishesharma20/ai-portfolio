"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Plus, X } from "lucide-react";
import { ResumeData } from "@/types/resume";
import { DesignTokens } from "@/types/design-tokens";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { EditableText, focusEditableAtEnd } from "@/components/ui/editable-text";
import { SectionImageBackdrop } from "@/components/portfolio/section-image-backdrop";
import { SectionCopy } from "@/types/portfolio";
import { usePortfolioEdit } from "@/features/portfolio/portfolio-editor-context";
import { cn } from "@/lib/utils";

interface Props {
  resumeData: ResumeData;
  tokens: DesignTokens;
  sectionCopy: SectionCopy;
  backdrop?: import("../portfolio-template").ResolvedBackdrop;
  animationOverride?: DesignTokens["animationStyle"];
}

export function ContactSection({ resumeData, tokens, sectionCopy, backdrop, animationOverride }: Props) {
  const motionCfg = useSectionMotion(animationOverride, tokens);
  const editCtx = usePortfolioEdit();
  const contactLabel = sectionCopy.contactLabel;
  const contactHeading = sectionCopy.contactHeading;
  const linksRef = useRef<HTMLDivElement>(null);

  const handleAddLink = () => {
    if (!editCtx) return;
    editCtx.addLink();
    requestAnimationFrame(() => {
      const nodes = linksRef.current?.querySelectorAll<HTMLElement>(".editable-text");
      focusEditableAtEnd(nodes?.[nodes.length - 2]); // label field of the newly added chip
    });
  };

  return (
    <section className="relative flex min-h-[55vh] flex-col justify-center overflow-hidden px-6 py-[var(--p-section-padding)] sm:px-12">
      <SectionImageBackdrop
        src={backdrop?.url}
        backgroundColor={tokens.backgroundColor}
        intensity={backdrop?.intensity}
        focusX={backdrop?.focusX}
        focusY={backdrop?.focusY}
        zoom={backdrop?.zoom}
      />
      <motion.div
        initial={motionCfg.initial}
        whileInView={motionCfg.animate}
        viewport={{ once: true, margin: "-60px" }}
        transition={motionCfg.transition}
        className={cn("mx-auto max-w-3xl text-center", backdrop?.url && "backdrop-legible")}
      >
        <EditableText
          as="p"
          value={contactLabel}
          onCommit={(v) => editCtx?.updateSectionCopy("contactLabel", v)}
          placeholder="Contact"
          styleKey="contact.label"
          ringColor={tokens.accentColor}
          className="mb-4 text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: tokens.accentColor }}
        />
        <EditableText
          as="h2"
          value={contactHeading}
          onCommit={(v) => editCtx?.updateSectionCopy("contactHeading", v)}
          placeholder="Let's work together."
          styleKey="contact.heading"
          ringColor={tokens.accentColor}
          className="text-balance text-[clamp(1.75rem,5vw,3rem)] font-medium leading-tight"
        />

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <div
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
            style={{ borderRadius: `${tokens.borderRadius}px`, background: tokens.primaryColor, color: tokens.backgroundColor }}
          >
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <EditableText
              value={resumeData.email}
              onCommit={(v) => editCtx?.updateResumeField("email", v)}
              placeholder="you@example.com"
              ringColor={tokens.backgroundColor}
              styleKey="contact.email"
              style={{ color: tokens.backgroundColor }}
            />
          </div>
          <span className="flex items-center gap-2 text-sm opacity-70">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <EditableText
              value={resumeData.phone}
              onCommit={(v) => editCtx?.updateResumeField("phone", v)}
              placeholder="+1 555 000 0000"
              ringColor={tokens.accentColor}
              styleKey="contact.phone"
            />
          </span>
        </div>

        <div ref={linksRef} className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm opacity-70">
          {resumeData.links.map((link) => (
            <div key={link.id} className="group relative flex flex-col items-center rounded-lg px-2 py-1">
              {editCtx && (
                <button
                  type="button"
                  onClick={() => editCtx.removeLink(link.id)}
                  aria-label="Remove link"
                  className="absolute -right-1.5 -top-1.5 rounded-full p-0.5 opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-60 hover:!opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <EditableText
                value={link.label}
                onCommit={(v) => editCtx?.updateLink(link.id, { label: v })}
                placeholder="Label"
                ringColor={tokens.accentColor}
                styleKey={`contact.link.${link.id}.label`}
              />
              <EditableText
                value={link.url}
                onCommit={(v) => editCtx?.updateLink(link.id, { url: v })}
                placeholder="https://…"
                ringColor={tokens.accentColor}
                styleKey={`contact.link.${link.id}.url`}
                className="font-mono text-[11px] opacity-50"
              />
            </div>
          ))}
          {editCtx && (
            <button
              type="button"
              onClick={handleAddLink}
              className="flex items-center gap-1 rounded-full border border-dashed px-3 py-1 text-xs opacity-40 transition-opacity hover:opacity-90"
            >
              <Plus className="h-3 w-3" /> Add link
            </button>
          )}
        </div>

        <p className="mt-16 text-xs opacity-30">
          {resumeData.name || "Your Name"} &middot; Built with Portfolio AI
        </p>
      </motion.div>
    </section>
  );
}
