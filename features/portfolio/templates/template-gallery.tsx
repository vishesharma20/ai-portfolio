"use client";

import { Check } from "lucide-react";
import { ResumeData } from "@/types/resume";
import { DesignTokens } from "@/types/design-tokens";
import { getFontFamily } from "@/lib/design-tokens";
import { listTemplates, PortfolioTemplateDefinition } from "./registry";
import { cn } from "@/lib/utils";

interface TemplateGalleryProps {
  resumeData: ResumeData;
  tokens: DesignTokens;
  selectedTemplateId: string;
  onSelect: (templateId: string) => void;
}

/**
 * A small, cheap, per-template preview built from the portfolio's *real*
 * name/title/colors/typography — not a full live render of the template
 * (which would mean mounting all animated, GSAP-wired hero sections just to
 * show a picker, every time the Template tab opens). This is the
 * "lightweight preview representation" Stage 6 explicitly allows for when
 * full live rendering would be unnecessary overhead: it still reflects this
 * portfolio's actual content and design tokens, it's just a stylized
 * swatch of each template's signature framing rather than the whole page.
 */
function TemplateSwatch({ def, resumeData, tokens }: { def: PortfolioTemplateDefinition; resumeData: ResumeData; tokens: DesignTokens }) {
  const name = resumeData.name.trim() || "Your Name";
  const title = resumeData.title.trim() || "Your title";
  const fontFamily = getFontFamily(tokens.typographyStyle);

  const nameStyle: React.CSSProperties = { fontFamily, color: "#F5F3EE" };
  const titleStyle: React.CSSProperties = { fontFamily, color: tokens.accentColor };

  return (
    <div
      className="relative h-28 w-full overflow-hidden rounded-lg border border-border/60"
      style={{ background: tokens.backgroundColor }}
    >
      {def.id === "glass" && (
        <>
          <div className="pointer-events-none absolute -left-4 top-2 h-16 w-16 rounded-full opacity-40 blur-2xl" style={{ background: tokens.primaryColor }} />
          <div className="pointer-events-none absolute right-2 bottom-0 h-14 w-14 rounded-full opacity-30 blur-2xl" style={{ background: tokens.accentColor }} />
          <div className="absolute inset-3 flex flex-col items-center justify-center rounded-md border border-white/15 bg-white/5 text-center backdrop-blur-md">
            <p className="text-[11px] font-medium leading-tight" style={nameStyle}>{name}</p>
            <p className="mt-0.5 text-[8px] uppercase tracking-wide" style={titleStyle}>{title}</p>
          </div>
        </>
      )}

      {def.id === "bento" && (
        <div className="absolute inset-2 grid grid-cols-3 grid-rows-2 gap-1.5">
          <div className="col-span-2 row-span-2 rounded-md border border-white/15 bg-white/[0.08] p-2"><p className="text-[10px] font-semibold" style={nameStyle}>{name}</p><p className="mt-1 text-[7px]" style={titleStyle}>{title}</p></div>
          <div className="rounded-md border border-white/10 bg-white/[0.05]" />
          <div className="rounded-md border border-white/10 bg-white/[0.05]" />
        </div>
      )}

      {def.id === "editorial" && (
        <div className="absolute inset-3 flex gap-2">
          <div className="mt-1 w-px" style={{ background: tokens.accentColor }} />
          <div className="flex flex-col justify-center">
            <p className="text-[7px] uppercase tracking-[0.3em]" style={titleStyle}>{title}</p>
            <p className="mt-1 text-[14px] font-semibold leading-none" style={nameStyle}>{name}</p>
            <div className="mt-2 h-px w-7 bg-white/25" />
          </div>
        </div>
      )}

      {def.id === "neon" && (
        <div className="absolute inset-2 flex flex-col justify-between rounded-md border border-dashed bg-black/20 p-2" style={{ borderColor: `${tokens.accentColor}99`, boxShadow: `0 0 18px -12px ${tokens.accentColor}` }}>
          <p className="text-[7px] font-mono uppercase tracking-widest" style={titleStyle}>{"// "}{title}</p>
          <p className="truncate text-[12px] font-bold uppercase" style={nameStyle}>{name}</p>
        </div>
      )}

      {def.id === "brutalist" && (
        <div className="absolute inset-2 flex flex-col justify-between border-2" style={{ borderColor: "#F5F3EE" }}>
          <div className="border-b-2 px-1.5 py-1" style={{ borderColor: "#F5F3EE" }}>
            <p className="truncate text-[11px] font-black uppercase leading-tight" style={nameStyle}>{name}</p>
          </div>
          <p className="px-1.5 pb-1 text-[8px] font-bold uppercase tracking-wide" style={titleStyle}>{title}</p>
        </div>
      )}

      {def.id === "whimsical" && (
        <>
          <div className="pointer-events-none absolute -left-3 -top-3 h-10 w-10 rounded-full opacity-30" style={{ background: tokens.primaryColor }} />
          <div className="pointer-events-none absolute -right-3 -bottom-3 h-12 w-12 rounded-full opacity-30" style={{ background: tokens.accentColor }} />
          <div className="absolute inset-3 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-center">
            <span className="mb-1 rounded-full bg-white/10 px-2 py-0.5 text-[8px] font-semibold uppercase" style={titleStyle}>{title}</span>
            <p className="text-[11px] font-bold leading-tight" style={nameStyle}>{name}</p>
          </div>
        </>
      )}

      {def.id === "cinematic" && (
        <div className="absolute inset-0 flex flex-col justify-end gap-0.5 bg-gradient-to-t from-black/40 to-transparent p-2.5">
          <p className="text-[7px] font-semibold uppercase tracking-[0.3em]" style={titleStyle}>{title}</p>
          <p className="text-[15px] font-semibold leading-none tracking-tight" style={nameStyle}>{name}</p>
          <div className="mt-1 h-px w-8" style={{ background: tokens.accentColor }} />
        </div>
      )}

      {def.id === "default" && (
        <div className="absolute inset-3 flex flex-col items-center justify-center text-center">
          <p className="text-[8px] font-medium uppercase tracking-[0.2em]" style={titleStyle}>{title}</p>
          <p className="mt-1 text-[13px] font-medium leading-tight" style={nameStyle}>{name}</p>
        </div>
      )}
    </div>
  );
}

/**
 * The template picker: every registered template (deduplicated — see
 * `listTemplates()`) as a card with a live-data swatch, name, description,
 * and selected state. Clicking a card is the only thing this component
 * does — it hands the chosen id to `onSelect`, which the caller (the
 * editor sidebar) wires to `useGeneratorActions().setTemplateId`. Applying
 * it, persisting it, and undo/redo all happen through the normal editor
 * state -> autosave pipeline, not here.
 */
export function TemplateGallery({ resumeData, tokens, selectedTemplateId, onSelect }: TemplateGalleryProps) {
  const templates = listTemplates();

  return (
    <div className="space-y-3">
      {templates.map((def) => {
        const isSelected = def.id === selectedTemplateId;
        return (
          <button
            key={def.id}
            type="button"
            onClick={() => onSelect(def.id)}
            aria-pressed={isSelected}
            aria-label={`${def.name} template${isSelected ? " (currently selected)" : ""}`}
            className={cn(
              "w-full overflow-hidden rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isSelected ? "border-primary ring-1 ring-primary" : "border-border/60 hover:border-border"
            )}
          >
            <TemplateSwatch def={def} resumeData={resumeData} tokens={tokens} />
            <div className="flex items-start justify-between gap-2 p-3">
              <div>
                <p className="text-sm font-medium">{def.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{def.description}</p>
              </div>
              {isSelected && (
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
