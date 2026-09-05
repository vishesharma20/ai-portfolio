export const DOODLE_COLOR_PLACEHOLDER = "{{COLOR}}";

export interface DoodleAsset {
  id: string;
  label: string;
  /** SVG markup with DOODLE_COLOR_PLACEHOLDER wherever the fill/stroke color goes. */
  svg: string;
}

export interface BorderAsset extends DoodleAsset {
  tileHeight: number;
}

// Small original line-art doodles (hand-authored here, not sourced from any
// third-party pack) so there's a "cute decorative element" option that's
// safe to ship without any licensing question. Color is a placeholder so
// each placed sticker can be recolored independently.
export const DOODLES: DoodleAsset[] = [
  {
    id: "sparkle",
    label: "Sparkle",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 5 L58 42 L95 50 L58 58 L50 95 L42 58 L5 50 L42 42 Z" fill="${DOODLE_COLOR_PLACEHOLDER}"/></svg>`,
  },
  {
    id: "star",
    label: "Star",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 6 L61 38 L96 38 L68 59 L79 92 L50 71 L21 92 L32 59 L4 38 L39 38 Z" fill="none" stroke="${DOODLE_COLOR_PLACEHOLDER}" stroke-width="5" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "heart",
    label: "Heart",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 88 C20 65 5 45 5 28 C5 12 18 3 32 3 C42 3 48 9 50 15 C52 9 58 3 68 3 C82 3 95 12 95 28 C95 45 80 65 50 88 Z" fill="none" stroke="${DOODLE_COLOR_PLACEHOLDER}" stroke-width="5" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "squiggle",
    label: "Squiggle",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><path d="M5 20 Q20 2 35 20 T65 20 T95 20 T115 20" fill="none" stroke="${DOODLE_COLOR_PLACEHOLDER}" stroke-width="6" stroke-linecap="round"/></svg>`,
  },
  {
    id: "ring",
    label: "Dotted ring",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="${DOODLE_COLOR_PLACEHOLDER}" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 14"/></svg>`,
  },
  {
    id: "blob",
    label: "Blob",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 8 C75 8 92 28 90 52 C88 76 68 92 46 90 C24 88 8 70 10 48 C12 26 28 8 50 8 Z" fill="${DOODLE_COLOR_PLACEHOLDER}" opacity="0.9"/></svg>`,
  },
  {
    id: "swoosh",
    label: "Swoosh",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><path d="M5 45 C30 5 70 5 115 30" fill="none" stroke="${DOODLE_COLOR_PLACEHOLDER}" stroke-width="6" stroke-linecap="round"/><path d="M100 20 L118 30 L102 42" fill="none" stroke="${DOODLE_COLOR_PLACEHOLDER}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "flower",
    label: "Flower",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="none" stroke="${DOODLE_COLOR_PLACEHOLDER}" stroke-width="5"><circle cx="50" cy="30" r="14"/><circle cx="50" cy="70" r="14"/><circle cx="30" cy="50" r="14"/><circle cx="70" cy="50" r="14"/><circle cx="50" cy="50" r="10" fill="${DOODLE_COLOR_PLACEHOLDER}" stroke="none"/></g></svg>`,
  },
];

// Small original patterns designed to tile seamlessly with background-repeat:
// repeat-x, so a person can "stretch" one into a continuous decorative line.
export const BORDERS: BorderAsset[] = [
  {
    id: "dots",
    label: "Dots",
    tileHeight: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20"><circle cx="20" cy="10" r="4" fill="${DOODLE_COLOR_PLACEHOLDER}"/></svg>`,
  },
  {
    id: "dashes",
    label: "Dashes",
    tileHeight: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20"><rect x="10" y="8" width="20" height="4" rx="2" fill="${DOODLE_COLOR_PLACEHOLDER}"/></svg>`,
  },
  {
    id: "scallop",
    label: "Scallop",
    tileHeight: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20"><path d="M0 4 Q20 20 40 4" fill="none" stroke="${DOODLE_COLOR_PLACEHOLDER}" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
  {
    id: "zigzag",
    label: "Zigzag",
    tileHeight: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20"><path d="M0 16 L10 4 L20 16 L30 4 L40 16" fill="none" stroke="${DOODLE_COLOR_PLACEHOLDER}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "hearts",
    label: "Hearts",
    tileHeight: 24,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 24"><g fill="${DOODLE_COLOR_PLACEHOLDER}"><circle cx="15" cy="9" r="6"/><circle cx="25" cy="9" r="6"/><path d="M9 11 L20 22 L31 11 Z"/></g></svg>`,
  },
  {
    id: "flowers",
    label: "Flowers",
    tileHeight: 30,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 30"><g fill="none" stroke="${DOODLE_COLOR_PLACEHOLDER}" stroke-width="3"><circle cx="20" cy="9" r="6"/><circle cx="20" cy="21" r="6"/><circle cx="11" cy="15" r="6"/><circle cx="29" cy="15" r="6"/><circle cx="20" cy="15" r="4" fill="${DOODLE_COLOR_PLACEHOLDER}" stroke="none"/></g></svg>`,
  },
  {
    id: "daisy",
    label: "Daisy",
    tileHeight: 30,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 30"><g fill="${DOODLE_COLOR_PLACEHOLDER}"><ellipse cx="20" cy="8" rx="4" ry="6"/><ellipse cx="20" cy="22" rx="4" ry="6"/><ellipse cx="10" cy="15" rx="6" ry="4"/><ellipse cx="30" cy="15" rx="6" ry="4"/></g></svg>`,
  },
  {
    id: "vine",
    label: "Vine",
    tileHeight: 26,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 26"><path d="M0 13 Q12.5 2 25 13 T50 13" fill="none" stroke="${DOODLE_COLOR_PLACEHOLDER}" stroke-width="2.5"/><path d="M12 9 C8 4 4 6 6 11 C9 11 11 10 12 9 Z" fill="${DOODLE_COLOR_PLACEHOLDER}"/><path d="M38 17 C42 22 46 20 44 15 C41 15 39 16 38 17 Z" fill="${DOODLE_COLOR_PLACEHOLDER}"/></svg>`,
  },
  {
    id: "leaves",
    label: "Leaves",
    tileHeight: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20"><line x1="0" y1="10" x2="40" y2="10" stroke="${DOODLE_COLOR_PLACEHOLDER}" stroke-width="2"/><path d="M20 10 C20 2 30 4 30 10 C30 16 20 18 20 10 Z" fill="${DOODLE_COLOR_PLACEHOLDER}"/></svg>`,
  },
  {
    id: "laurel",
    label: "Laurel",
    tileHeight: 24,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 24"><g fill="none" stroke="${DOODLE_COLOR_PLACEHOLDER}" stroke-width="2.5" stroke-linecap="round"><path d="M20 20 Q10 14 14 4"/><path d="M20 20 Q30 14 26 4"/><path d="M15 12 L11 10 M17 8 L13 6 M25 12 L29 10 M23 8 L27 6"/></g></svg>`,
  },
  {
    id: "tulip",
    label: "Tulip",
    tileHeight: 26,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 26"><line x1="20" y1="26" x2="20" y2="14" stroke="${DOODLE_COLOR_PLACEHOLDER}" stroke-width="2"/><path d="M20 4 C14 4 13 10 13 13 C13 15 16 15 16 12 C16 15 20 16 20 12 C20 16 24 15 24 12 C24 15 27 15 27 13 C27 10 26 4 20 4 Z" fill="${DOODLE_COLOR_PLACEHOLDER}"/></svg>`,
  },
];

export function svgToDataUrl(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Fills in a doodle/border SVG template with an actual color and returns a ready-to-use data URL. */
export function renderDoodleDataUrl(svgTemplate: string, color: string) {
  return svgToDataUrl(svgTemplate.split(DOODLE_COLOR_PLACEHOLDER).join(color));
}
