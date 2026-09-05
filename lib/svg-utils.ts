/** The fixed color used in every doodle/border SVG source — swapped out at render time to recolor. */
export const SVG_TEMPLATE_COLOR = "#F5F3EE";

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** True for our own doodle/border SVG markup (recolorable); false for uploaded photos/data URLs. */
export function isRecolorableSvg(content: string): boolean {
  return content.trim().startsWith("<svg");
}

/** Swaps the template color for the chosen one, then encodes to a data URL ready for <img src> or a CSS url(). */
export function recolorSvgToDataUrl(svg: string, color: string): string {
  const recolored = svg.split(SVG_TEMPLATE_COLOR).join(color);
  return svgToDataUrl(recolored);
}
