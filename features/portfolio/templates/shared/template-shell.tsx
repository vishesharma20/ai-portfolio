import { ReactNode } from "react";
import { getFontFamily, getSectionSpacing } from "@/lib/design-tokens";
import { Portfolio } from "@/types/portfolio";
import { AmbientBackground } from "@/components/portfolio/ambient-background";
import { DecorationsLayer } from "../../decorations-layer";

interface TemplateShellProps {
  portfolio: Portfolio;
  /** Extra classes on the root — this is where a template adds its own signature (e.g. thick borders for Brutalist, extra padding for Glass). */
  className?: string;
  children: ReactNode;
}

/**
 * The outer page shell every template needs: font family, base background
 * color/text color, the `--p-section-padding`/`--p-gap` CSS variables
 * section components read, the ambient backdrop layer, and the decorations
 * layer on top. Identical to what `portfolio-template.tsx` (the "minimal"
 * template) has always done inline — pulled out here so the newer templates
 * share it instead of re-deriving it.
 */
export function TemplateShell({ portfolio, className, children }: TemplateShellProps) {
  const tokens = portfolio.appearance.tokens;
  const spacing = getSectionSpacing(tokens.layoutDensity);

  return (
    <div
      className={`relative min-h-full w-full ${className ?? ""}`}
      style={
        {
          fontFamily: getFontFamily(tokens.typographyStyle),
          background: tokens.backgroundColor,
          color: "#F5F3EE",
          "--p-section-padding": spacing.sectionPadding,
          "--p-gap": spacing.gap,
        } as React.CSSProperties
      }
    >
      <AmbientBackground tokens={tokens} />
      {children}
      <DecorationsLayer decorations={portfolio.appearance.decorations} />
    </div>
  );
}
