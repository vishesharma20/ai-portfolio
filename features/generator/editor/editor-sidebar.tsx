"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TemplateGallery } from "@/features/portfolio/templates/template-gallery";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useShallow } from "zustand/react/shallow";
import { useGeneratorStore, useGeneratorActions, PortfolioSectionKey } from "@/lib/store/generator-store";
import { portfolioSectionLabels } from "@/types/portfolio";
import { getPresetForMood } from "@/lib/mood-presets";
import { getFontFamily } from "@/lib/design-tokens";
import { readFileAsDataUrl } from "@/lib/utils";
import { Upload, Settings2, Eye, EyeOff } from "lucide-react";
import { svgToDataUrl } from "@/lib/svg-utils";
import {
  moodOptions,
  typographyStyleOptions,
  layoutDensityOptions,
  animationStyleOptions,
  backgroundStyleOptions,
} from "@/types/design-tokens";
import type { DesignTokens } from "@/types/design-tokens";

const TYPOGRAPHY_LABELS: Record<string, string> = {
  "modern-sans": "Modern sans",
  "classic-serif": "Classic serif",
  geometric: "Geometric",
  "monospace-technical": "Monospace",
  "elegant-serif": "Elegant serif",
  "rounded-friendly": "Rounded",
  "bold-display": "Bold display",
  handwritten: "Handwritten",
  condensed: "Condensed",
  "space-grotesk": "Space Grotesk",
  "dm-sans": "DM Sans",
  "lora-serif": "Lora",
  rubik: "Rubik",
  "ibm-plex-mono": "IBM Plex Mono",
  fraunces: "Fraunces",
  manrope: "Manrope",
  outfit: "Outfit",
  merriweather: "Merriweather",
  syne: "Syne",
};

const SECTION_BG_KEYS: PortfolioSectionKey[] = ["about", "skills", "experience", "projects", "contact"];
const SECTION_ANIM_KEYS: PortfolioSectionKey[] = ["hero", "about", "skills", "experience", "projects", "contact"];
const ANIMATION_STYLE_LABELS: Record<string, string> = {
  rise: "Rise",
  fade: "Fade",
  slide: "Slide",
  zoom: "Zoom",
  blur: "Blur",
  bounce: "Bounce",
  pop: "Pop",
  drop: "Drop",
  unfold: "Unfold",
  flip: "Flip",
  none: "None",
  swing: "Swing",
  rotate: "Rotate",
  squash: "Squash",
  tilt: "Tilt",
  spring: "Spring",
  wipe: "Wipe",
  glide: "Glide",
  fold: "Fold",
  curtain: "Curtain",
  elastic: "Elastic",
};

const BACKGROUND_STYLE_LABELS: Record<string, string> = {
  plain: "Plain",
  gradient: "Gradient",
  mesh: "Mesh",
  aurora: "Aurora",
  grid: "Grid",
  dots: "Dots",
  noise: "Noise",
  rays: "Rays",
  stripes: "Stripes",
  rings: "Rings",
  checker: "Checker",
};

const STICKER_EMOJIS = [
  "✨", "🌸", "🦋", "💫", "⭐", "🌟", "💜", "🔥",
  "🌈", "🎨", "😊", "🌻", "🍄", "🐝", "🌙", "☁️",
  "🎈", "💐", "🌊", "🍓", "🍀", "⚡", "🌷", "🎀",
  "🪐", "☀️", "🌼", "🌵", "🪻", "🍊", "🍉", "🍒",
  "🧋", "🍰", "🎧", "🎸", "📚", "💡", "🪄", "🧸",
  "🛼", "🚀", "🪁", "🎮", "💎", "🫧", "🪩", "🧩",
  "🐬", "🦕", "🐸", "🐼", "🐧", "🦉", "🦋", "🐞",
];

const CHARACTER_STICKERS = [
  "🐱", "🐻", "🐰", "🦊", "🐸", "🐼", "🐧", "🐢", "🐝", "🦄", "🐙", "🦖",
  "🦝", "🐹", "🐨", "🦁", "🐯", "🐮", "🐷", "🐵", "🐺", "🦭", "🦩", "🦜",
];

const QUICK_LOOKS: { name: string; templateId: string; colors: [string, string, string]; tokens: Partial<DesignTokens> }[] = [
  {
    name: "Ocean Pop",
    templateId: "glass",
    colors: ["#38BDF8", "#A7F3D0", "#071522"],
    tokens: { primaryColor: "#38BDF8", accentColor: "#A7F3D0", backgroundColor: "#071522", surfaceColor: "#10283A", typographyStyle: "geometric", layoutDensity: "balanced", mood: "technical", animationStyle: "fade", animationIntensity: 55, backgroundStyle: "aurora" },
  },
  {
    name: "Retro Studio",
    templateId: "brutalist",
    colors: ["#F97316", "#FDE047", "#24140E"],
    tokens: { primaryColor: "#F97316", accentColor: "#FDE047", backgroundColor: "#24140E", surfaceColor: "#352017", typographyStyle: "bold-display", layoutDensity: "dense", mood: "bold", animationStyle: "pop", animationIntensity: 65, backgroundStyle: "grid" },
  },
  {
    name: "Soft Garden",
    templateId: "whimsical",
    colors: ["#86A98B", "#F3B7C8", "#172019"],
    tokens: { primaryColor: "#86A98B", accentColor: "#F3B7C8", backgroundColor: "#172019", surfaceColor: "#202B22", typographyStyle: "rounded-friendly", layoutDensity: "airy", mood: "playful", animationStyle: "rise", animationIntensity: 40, backgroundStyle: "mesh" },
  },
  {
    name: "After Hours",
    templateId: "cinematic",
    colors: ["#C084FC", "#F0ABFC", "#120D1C"],
    tokens: { primaryColor: "#C084FC", accentColor: "#F0ABFC", backgroundColor: "#120D1C", surfaceColor: "#21172B", typographyStyle: "elegant-serif", layoutDensity: "airy", mood: "luxury", animationStyle: "blur", animationIntensity: 45, backgroundStyle: "rays" },
  },
  {
    name: "Paper & Ink",
    templateId: "default",
    colors: ["#E5A94D", "#D4D4D8", "#18181B"],
    tokens: { primaryColor: "#E5A94D", accentColor: "#D4D4D8", backgroundColor: "#18181B", surfaceColor: "#27272A", typographyStyle: "classic-serif", layoutDensity: "balanced", mood: "editorial", animationStyle: "slide", animationIntensity: 35, backgroundStyle: "plain" },
  },
  {
    name: "Cyber Mint",
    templateId: "glass",
    colors: ["#2DD4BF", "#A3E635", "#071A1A"],
    tokens: { primaryColor: "#2DD4BF", accentColor: "#A3E635", backgroundColor: "#071A1A", surfaceColor: "#102727", typographyStyle: "space-grotesk", layoutDensity: "compact", mood: "technical", animationStyle: "tilt", animationIntensity: 50, backgroundStyle: "checker" },
  },
  {
    name: "Cherry Soda",
    templateId: "whimsical",
    colors: ["#FB7185", "#FDBA74", "#24131A"],
    tokens: { primaryColor: "#FB7185", accentColor: "#FDBA74", backgroundColor: "#24131A", surfaceColor: "#38202A", typographyStyle: "rubik", layoutDensity: "airy", mood: "playful", animationStyle: "squash", animationIntensity: 55, backgroundStyle: "dots" },
  },
  {
    name: "Desert Modern",
    templateId: "cinematic",
    colors: ["#E9A66A", "#E9D8A6", "#211A16"],
    tokens: { primaryColor: "#E9A66A", accentColor: "#E9D8A6", backgroundColor: "#211A16", surfaceColor: "#342921", typographyStyle: "dm-sans", layoutDensity: "spacious", mood: "editorial", animationStyle: "wipe", animationIntensity: 30, backgroundStyle: "stripes" },
  },
  {
    name: "Signal Boost",
    templateId: "brutalist",
    colors: ["#F43F5E", "#F8FAFC", "#111827"],
    tokens: { primaryColor: "#F43F5E", accentColor: "#F8FAFC", backgroundColor: "#111827", surfaceColor: "#1F2937", typographyStyle: "ibm-plex-mono", layoutDensity: "dense", mood: "bold", animationStyle: "spring", animationIntensity: 75, backgroundStyle: "rings" },
  },
  {
    name: "Lavender Paper",
    templateId: "default",
    colors: ["#A78BFA", "#F0ABFC", "#191522"],
    tokens: { primaryColor: "#A78BFA", accentColor: "#F0ABFC", backgroundColor: "#191522", surfaceColor: "#292238", typographyStyle: "fraunces", layoutDensity: "balanced", mood: "luxury", animationStyle: "rotate", animationIntensity: 38, backgroundStyle: "mesh" },
  },
  {
    name: "Prism Bento",
    templateId: "bento",
    colors: ["#60A5FA", "#F472B6", "#101426"],
    tokens: { primaryColor: "#60A5FA", accentColor: "#F472B6", backgroundColor: "#101426", surfaceColor: "#1C2340", typographyStyle: "outfit", layoutDensity: "compact", mood: "playful", animationStyle: "elastic", animationIntensity: 60, backgroundStyle: "rings" },
  },
  {
    name: "Neon Circuit",
    templateId: "neon",
    colors: ["#A3E635", "#22D3EE", "#0B1118"],
    tokens: { primaryColor: "#A3E635", accentColor: "#22D3EE", backgroundColor: "#0B1118", surfaceColor: "#131D27", typographyStyle: "syne", layoutDensity: "dense", mood: "technical", animationStyle: "glide", animationIntensity: 65, backgroundStyle: "grid" },
  },
  {
    name: "Sunday Journal",
    templateId: "editorial",
    colors: ["#D9A66D", "#A3B18A", "#1E1B18"],
    tokens: { primaryColor: "#D9A66D", accentColor: "#A3B18A", backgroundColor: "#1E1B18", surfaceColor: "#2B2621", typographyStyle: "merriweather", layoutDensity: "spacious", mood: "editorial", animationStyle: "curtain", animationIntensity: 32, backgroundStyle: "noise" },
  },
];

// Small original line-art doodles (hand-authored here, not sourced from any
// third-party pack) so there's a "cute decorative element" option that's
// safe to ship without any licensing question.
const DOODLES: { id: string; label: string; svg: string }[] = [
  {
    id: "sparkle",
    label: "Sparkle",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 5 L58 42 L95 50 L58 58 L50 95 L42 58 L5 50 L42 42 Z" fill="#F5F3EE"/></svg>`,
  },
  {
    id: "star",
    label: "Star",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 6 L61 38 L96 38 L68 59 L79 92 L50 71 L21 92 L32 59 L4 38 L39 38 Z" fill="none" stroke="#F5F3EE" stroke-width="5" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "heart",
    label: "Heart",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 88 C20 65 5 45 5 28 C5 12 18 3 32 3 C42 3 48 9 50 15 C52 9 58 3 68 3 C82 3 95 12 95 28 C95 45 80 65 50 88 Z" fill="none" stroke="#F5F3EE" stroke-width="5" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "squiggle",
    label: "Squiggle",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><path d="M5 20 Q20 2 35 20 T65 20 T95 20 T115 20" fill="none" stroke="#F5F3EE" stroke-width="6" stroke-linecap="round"/></svg>`,
  },
  {
    id: "ring",
    label: "Dotted ring",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="#F5F3EE" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 14"/></svg>`,
  },
  {
    id: "blob",
    label: "Blob",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 8 C75 8 92 28 90 52 C88 76 68 92 46 90 C24 88 8 70 10 48 C12 26 28 8 50 8 Z" fill="#F5F3EE" opacity="0.9"/></svg>`,
  },
  {
    id: "swoosh",
    label: "Swoosh",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><path d="M5 45 C30 5 70 5 115 30" fill="none" stroke="#F5F3EE" stroke-width="6" stroke-linecap="round"/><path d="M100 20 L118 30 L102 42" fill="none" stroke="#F5F3EE" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "flower",
    label: "Flower",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="none" stroke="#F5F3EE" stroke-width="5"><circle cx="50" cy="30" r="14"/><circle cx="50" cy="70" r="14"/><circle cx="30" cy="50" r="14"/><circle cx="70" cy="50" r="14"/><circle cx="50" cy="50" r="10" fill="#F5F3EE" stroke="none"/></g></svg>`,
  },
  {
    id: "bunny",
    label: "Bunny",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="none" stroke="#F5F3EE" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="38" cy="20" rx="7" ry="18"/><ellipse cx="62" cy="20" rx="7" ry="18"/><circle cx="50" cy="60" r="28"/><circle cx="40" cy="55" r="2.5" fill="#F5F3EE"/><circle cx="60" cy="55" r="2.5" fill="#F5F3EE"/><path d="M45 68 Q50 72 55 68"/></g></svg>`,
  },
  {
    id: "cat",
    label: "Cat",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="none" stroke="#F5F3EE" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M30 38 L20 15 L42 30 Z"/><path d="M70 38 L80 15 L58 30 Z"/><circle cx="50" cy="55" r="30"/><circle cx="40" cy="52" r="2.5" fill="#F5F3EE"/><circle cx="60" cy="52" r="2.5" fill="#F5F3EE"/><path d="M46 62 Q50 65 54 62"/><path d="M20 58 L34 55 M20 65 L34 62 M80 58 L66 55 M80 65 L66 62"/></g></svg>`,
  },
  {
    id: "bear",
    label: "Bear",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="none" stroke="#F5F3EE" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="26" cy="22" r="11"/><circle cx="74" cy="22" r="11"/><circle cx="50" cy="55" r="32"/><circle cx="40" cy="50" r="2.5" fill="#F5F3EE"/><circle cx="60" cy="50" r="2.5" fill="#F5F3EE"/><ellipse cx="50" cy="62" rx="9" ry="7" fill="#F5F3EE" stroke="none"/></g></svg>`,
  },
  {
    id: "fox",
    label: "Fox",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="none" stroke="#F5F3EE" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M28 35 L14 8 L40 26 Z"/><path d="M72 35 L86 8 L60 26 Z"/><path d="M50 30 C72 30 82 50 76 68 C70 84 30 84 24 68 C18 50 28 30 50 30 Z"/><circle cx="40" cy="52" r="2.5" fill="#F5F3EE"/><circle cx="60" cy="52" r="2.5" fill="#F5F3EE"/><path d="M50 58 L50 66 M44 70 Q50 74 56 70"/></g></svg>`,
  },
  {
    id: "owl",
    label: "Owl",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="none" stroke="#F5F3EE" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M30 20 L38 32 M70 20 L62 32"/><ellipse cx="50" cy="55" rx="34" ry="38"/><circle cx="38" cy="48" r="10"/><circle cx="62" cy="48" r="10"/><circle cx="38" cy="48" r="3" fill="#F5F3EE" stroke="none"/><circle cx="62" cy="48" r="3" fill="#F5F3EE" stroke="none"/><path d="M50 55 L44 65 L56 65 Z" fill="#F5F3EE" stroke="none"/></g></svg>`,
  },
];

// Small original patterns designed to tile seamlessly with background-repeat:
// repeat-x, so a person can "stretch" one into a continuous decorative line.
const BORDERS: { id: string; label: string; svg: string; tileHeight: number }[] = [
  {
    id: "dots",
    label: "Dots",
    tileHeight: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20"><circle cx="20" cy="10" r="4" fill="#F5F3EE"/></svg>`,
  },
  {
    id: "dashes",
    label: "Dashes",
    tileHeight: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20"><rect x="10" y="8" width="20" height="4" rx="2" fill="#F5F3EE"/></svg>`,
  },
  {
    id: "scallop",
    label: "Scallop",
    tileHeight: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20"><path d="M0 4 Q20 20 40 4" fill="none" stroke="#F5F3EE" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
  {
    id: "zigzag",
    label: "Zigzag",
    tileHeight: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20"><path d="M0 16 L10 4 L20 16 L30 4 L40 16" fill="none" stroke="#F5F3EE" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "hearts",
    label: "Hearts",
    tileHeight: 24,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 24"><g fill="#F5F3EE"><circle cx="15" cy="9" r="6"/><circle cx="25" cy="9" r="6"/><path d="M9 11 L20 22 L31 11 Z"/></g></svg>`,
  },
  {
    id: "flowers",
    label: "Flowers",
    tileHeight: 30,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 30"><g fill="none" stroke="#F5F3EE" stroke-width="3"><circle cx="20" cy="9" r="6"/><circle cx="20" cy="21" r="6"/><circle cx="11" cy="15" r="6"/><circle cx="29" cy="15" r="6"/><circle cx="20" cy="15" r="4" fill="#F5F3EE" stroke="none"/></g></svg>`,
  },
  {
    id: "daisy",
    label: "Daisy",
    tileHeight: 30,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 30"><g fill="#F5F3EE"><ellipse cx="20" cy="8" rx="4" ry="6"/><ellipse cx="20" cy="22" rx="4" ry="6"/><ellipse cx="10" cy="15" rx="6" ry="4"/><ellipse cx="30" cy="15" rx="6" ry="4"/></g></svg>`,
  },
  {
    id: "vine",
    label: "Vine",
    tileHeight: 26,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 26"><path d="M0 13 Q12.5 2 25 13 T50 13" fill="none" stroke="#F5F3EE" stroke-width="2.5"/><path d="M12 9 C8 4 4 6 6 11 C9 11 11 10 12 9 Z" fill="#F5F3EE"/><path d="M38 17 C42 22 46 20 44 15 C41 15 39 16 38 17 Z" fill="#F5F3EE"/></svg>`,
  },
  {
    id: "leaves",
    label: "Leaves",
    tileHeight: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20"><line x1="0" y1="10" x2="40" y2="10" stroke="#F5F3EE" stroke-width="2"/><path d="M20 10 C20 2 30 4 30 10 C30 16 20 18 20 10 Z" fill="#F5F3EE"/></svg>`,
  },
  {
    id: "laurel",
    label: "Laurel",
    tileHeight: 24,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 24"><g fill="none" stroke="#F5F3EE" stroke-width="2.5" stroke-linecap="round"><path d="M20 20 Q10 14 14 4"/><path d="M20 20 Q30 14 26 4"/><path d="M15 12 L11 10 M17 8 L13 6 M25 12 L29 10 M23 8 L27 6"/></g></svg>`,
  },
  {
    id: "tulip",
    label: "Tulip",
    tileHeight: 26,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 26"><line x1="20" y1="26" x2="20" y2="14" stroke="#F5F3EE" stroke-width="2"/><path d="M20 4 C14 4 13 10 13 13 C13 15 16 15 16 12 C16 15 20 16 20 12 C20 16 24 15 24 12 C24 15 27 15 27 13 C27 10 26 4 20 4 Z" fill="#F5F3EE"/></svg>`,
  },
];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs" />
      </div>
    </div>
  );
}

export function EditorSidebar() {
  const [expandedBgSection, setExpandedBgSection] = useState<PortfolioSectionKey | null>(null);
  const [expandedAnimSection, setExpandedAnimSection] = useState<PortfolioSectionKey | null>(null);
  const { resumeData, designTokens, assets, sectionBackgrounds, sectionAnimations, sectionVisibility, templateId } = useGeneratorStore(
    useShallow((s) => ({
      resumeData: s.resumeData,
      designTokens: s.designTokens,
      assets: s.assets,
      sectionBackgrounds: s.sectionBackgrounds,
      sectionAnimations: s.sectionAnimations,
      sectionVisibility: s.sectionVisibility,
      templateId: s.templateId,
    }))
  );
  const actions = useGeneratorActions();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <Tabs defaultValue="content">
          <TabsList className="w-full">
            <TabsTrigger value="template" className="flex-1">Template</TabsTrigger>
            <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
            <TabsTrigger value="design" className="flex-1">Design</TabsTrigger>
            <TabsTrigger value="motion" className="flex-1">Motion</TabsTrigger>
            <TabsTrigger value="stickers" className="flex-1">Stickers</TabsTrigger>
          </TabsList>

          <div className="mt-5 max-h-[calc(100vh-13rem)] overflow-y-auto pr-1 scrollbar-thin">
            <TabsContent value="template" className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Changes how your portfolio looks and is laid out — your content, projects, and experience stay exactly the same.
              </p>
              <div className="space-y-2">
                <Label>Quick looks</Label>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_LOOKS.map((look) => (
                    <button
                      key={look.name}
                      type="button"
                      onClick={() => {
                        actions.setDesignTokens(look.tokens);
                        actions.setTemplateId(look.templateId);
                      }}
                      className="rounded-xl border border-border p-2.5 text-left transition-colors hover:border-primary/60 hover:bg-primary/5"
                    >
                      <span className="mb-2 flex gap-1.5" aria-hidden="true">
                        {look.colors.map((color) => <span key={color} className="h-4 w-4 rounded-full border border-white/10" style={{ background: color }} />)}
                      </span>
                      <span className="block text-xs font-medium">{look.name}</span>
                      <span className="block text-[10px] text-muted-foreground">Colors, type & motion</span>
                    </button>
                  ))}
                </div>
              </div>
              <TemplateGallery
                resumeData={resumeData}
                tokens={designTokens}
                selectedTemplateId={templateId}
                onSelect={actions.setTemplateId}
              />
            </TabsContent>

            <TabsContent value="content" className="space-y-5">
              <div className="space-y-2">
                <Label>Sections</Label>
                <div className="space-y-1 rounded-lg border border-border/60 p-1.5">
                  <div className="flex items-center justify-between px-2 py-1 text-sm text-muted-foreground">
                    <span>Hero</span>
                    <span className="text-[10px] uppercase tracking-wide">Always shown</span>
                  </div>
                  {SECTION_BG_KEYS.map((key) => {
                    const visible = sectionVisibility[key] !== false;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => actions.setSectionVisibility(key, !visible)}
                        className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary ${
                          visible ? "text-foreground" : "text-muted-foreground line-through"
                        }`}
                      >
                        {portfolioSectionLabels[key]}
                        {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  defaultValue={resumeData.name}
                  onBlur={(e) => actions.updateResumeField("name", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  defaultValue={resumeData.title}
                  onBlur={(e) => actions.updateResumeField("title", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Bio</Label>
                <Textarea
                  rows={4}
                  defaultValue={resumeData.summary}
                  onBlur={(e) => actions.updateResumeField("summary", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Skills</Label>
                <Textarea
                  rows={2}
                  defaultValue={resumeData.skills.join(", ")}
                  onBlur={(e) =>
                    actions.updateResumeField(
                      "skills",
                      e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                    )
                  }
                />
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Experience, projects, and education can also be edited directly in the live preview
                on the right.
              </p>
            </TabsContent>

            <TabsContent value="design" className="space-y-6">
              <ColorField
                label="Primary color"
                value={designTokens.primaryColor}
                onChange={(v) => actions.setDesignTokens({ primaryColor: v })}
              />
              <ColorField
                label="Accent color"
                value={designTokens.accentColor}
                onChange={(v) => actions.setDesignTokens({ accentColor: v })}
              />
              <ColorField
                label="Background"
                value={designTokens.backgroundColor}
                onChange={(v) => actions.setDesignTokens({ backgroundColor: v })}
              />

              <div className="space-y-1.5">
                <Label>Ambient background</Label>
                <div className="grid grid-cols-4 gap-2">
                  {backgroundStyleOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => actions.setDesignTokens({ backgroundStyle: opt })}
                      className={`rounded-lg border px-2.5 py-2 text-xs transition-colors ${
                        designTokens.backgroundStyle === opt
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {BACKGROUND_STYLE_LABELS[opt]}
                    </button>
                  ))}
                </div>
                {designTokens.backgroundStyle !== "plain" && (
                  <label className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={designTokens.backgroundAnimated}
                      onChange={(e) => actions.setDesignTokens({ backgroundAnimated: e.target.checked })}
                      className="h-3.5 w-3.5 accent-primary"
                    />
                    Keep it drifting
                  </label>
                )}
                <p className="text-xs text-muted-foreground">
                  A full-page ambient layer behind everything, using your primary and accent colors.
                  Independent of any uploaded background image below.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>Background image</Label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => actions.setDesignTokens({ backgroundImageUrl: "" })}
                    className={`flex aspect-square items-center justify-center rounded-lg border text-[10px] transition-colors ${
                      !designTokens.backgroundImageUrl
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    None
                  </button>
                  {assets.inspirationImages.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => actions.setDesignTokens({ backgroundImageUrl: url })}
                      aria-label={`Use inspiration image ${i + 1} as background`}
                      className={`aspect-square overflow-hidden rounded-lg border transition-colors ${
                        designTokens.backgroundImageUrl === url
                          ? "border-primary ring-2 ring-primary/40"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Inspiration ${i + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                  <label
                    className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    title="Upload a new background image"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        const dataUrl = await readFileAsDataUrl(file);
                        if (dataUrl) {
                          actions.setAssets({ inspirationImages: [...assets.inspirationImages, dataUrl] });
                          actions.setDesignTokens({ backgroundImageUrl: dataUrl });
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Used as a subtle full-page backdrop and hero banner. Upload a new image any time to
                  replace it.
                </p>
              </div>

              {assets.inspirationImages.length > 0 && (
                <div className="space-y-1.5">
                  <Label>About photo</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => actions.updateResumeField("photoUrl", "")}
                      className={`flex aspect-square items-center justify-center rounded-lg border text-[10px] transition-colors ${
                        !resumeData.photoUrl
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      None
                    </button>
                    {assets.inspirationImages.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => actions.updateResumeField("photoUrl", url)}
                        aria-label={`Use inspiration image ${i + 1} as About photo`}
                        className={`aspect-square overflow-hidden rounded-lg border transition-colors ${
                          resumeData.photoUrl === url
                            ? "border-primary ring-2 ring-primary/40"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Inspiration ${i + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shown in the About section&apos;s photo slot. Pick a different image than the background.
                  </p>
                </div>
              )}

              {assets.inspirationImages.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Background blur</Label>
                    <span className="text-xs text-muted-foreground">{designTokens.backgroundBlur}</span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[designTokens.backgroundBlur]}
                    onValueChange={([v]) => actions.setDesignTokens({ backgroundBlur: v })}
                  />
                  <p className="text-xs text-muted-foreground">
                    0 is clean and sharp, 100 is very soft. Applies to the About, Skills, Experience,
                    Projects, and Contact backgrounds below.
                  </p>
                </div>
              )}

              {designTokens.backgroundImageUrl && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Background crop</Label>
                    <span className="text-xs text-muted-foreground">{designTokens.backgroundZoom.toFixed(1)}x</span>
                  </div>
                  <Slider
                    min={1}
                    max={2.5}
                    step={0.1}
                    value={[designTokens.backgroundZoom]}
                    onValueChange={([v]) => actions.setDesignTokens({ backgroundZoom: v })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">Horizontal</span>
                      <Slider
                        min={0}
                        max={100}
                        step={2}
                        value={[designTokens.backgroundFocusX]}
                        onValueChange={([v]) => actions.setDesignTokens({ backgroundFocusX: v })}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">Vertical</span>
                      <Slider
                        min={0}
                        max={100}
                        step={2}
                        value={[designTokens.backgroundFocusY]}
                        onValueChange={([v]) => actions.setDesignTokens({ backgroundFocusY: v })}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Zoom in and pan to choose exactly what part of the image shows, across the hero
                    banner and every section backdrop.
                  </p>
                </div>
              )}

              {assets.inspirationImages.length > 0 && (
                <div className="space-y-2">
                  <Label>Page backgrounds</Label>
                  <p className="text-xs text-muted-foreground">
                    Each section below auto-cycles through your uploads by default. Pick a specific
                    image (or none) to override any of them individually — each can also have its own
                    blur and crop.
                  </p>
                  {SECTION_BG_KEYS.map((key) => {
                    const config = sectionBackgrounds[key];
                    const isExpanded = expandedBgSection === key;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-muted-foreground">{portfolioSectionLabels[key]}</span>
                          {config?.url && (
                            <button
                              type="button"
                              onClick={() => setExpandedBgSection(isExpanded ? null : key)}
                              className={`rounded p-1 transition-colors hover:bg-secondary ${isExpanded ? "text-primary" : "text-muted-foreground"}`}
                              aria-label={`Adjust ${portfolioSectionLabels[key]} background`}
                              title="Adjust blur & crop"
                            >
                              <Settings2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => actions.clearSectionBackground(key)}
                            className={`rounded-md border px-2 py-1 text-[10px] transition-colors ${
                              !config
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            Auto
                          </button>
                          <button
                            type="button"
                            onClick={() => actions.setSectionBackground(key, "")}
                            className={`rounded-md border px-2 py-1 text-[10px] transition-colors ${
                              config && !config.url
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            None
                          </button>
                          {assets.inspirationImages.map((url, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => actions.setSectionBackground(key, url)}
                              aria-label={`Use inspiration image ${i + 1} for ${portfolioSectionLabels[key]}`}
                              className={`h-7 w-7 overflow-hidden rounded-md border transition-colors ${
                                config?.url === url
                                  ? "border-primary ring-2 ring-primary/40"
                                  : "border-border hover:border-primary/40"
                              }`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt={`Inspiration ${i + 1}`} className="h-full w-full object-cover" />
                            </button>
                          ))}
                        </div>
                        {isExpanded && config?.url && (
                          <div className="space-y-2 rounded-lg border border-border p-2">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">Blur</span>
                                <span className="text-[10px] text-muted-foreground">{config.blur ?? designTokens.backgroundBlur}</span>
                              </div>
                              <Slider
                                min={0}
                                max={100}
                                step={5}
                                value={[config.blur ?? designTokens.backgroundBlur]}
                                onValueChange={([v]) => actions.updateSectionBackgroundConfig(key, { blur: v })}
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">Zoom</span>
                                <span className="text-[10px] text-muted-foreground">{(config.zoom ?? designTokens.backgroundZoom).toFixed(1)}x</span>
                              </div>
                              <Slider
                                min={1}
                                max={2.5}
                                step={0.1}
                                value={[config.zoom ?? designTokens.backgroundZoom]}
                                onValueChange={([v]) => actions.updateSectionBackgroundConfig(key, { zoom: v })}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <span className="text-[10px] text-muted-foreground">Horizontal</span>
                                <Slider
                                  min={0}
                                  max={100}
                                  step={2}
                                  value={[config.focusX ?? designTokens.backgroundFocusX]}
                                  onValueChange={([v]) => actions.updateSectionBackgroundConfig(key, { focusX: v })}
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-muted-foreground">Vertical</span>
                                <Slider
                                  min={0}
                                  max={100}
                                  step={2}
                                  value={[config.focusY ?? designTokens.backgroundFocusY]}
                                  onValueChange={([v]) => actions.updateSectionBackgroundConfig(key, { focusY: v })}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Typography</Label>
                <div className="grid grid-cols-3 gap-2">
                  {typographyStyleOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => actions.setDesignTokens({ typographyStyle: opt })}
                      style={{ fontFamily: getFontFamily(opt) }}
                      className={`rounded-lg border px-2.5 py-2 text-left text-xs transition-colors ${
                        designTokens.typographyStyle === opt
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {TYPOGRAPHY_LABELS[opt]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Layout density</Label>
                <div className="grid grid-cols-3 gap-2">
                  {layoutDensityOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => actions.setDesignTokens({ layoutDensity: opt })}
                      className={`rounded-lg border px-3 py-2 text-xs capitalize transition-colors ${
                        designTokens.layoutDensity === opt
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Border radius</Label>
                  <span className="text-xs text-muted-foreground">{designTokens.borderRadius}px</span>
                </div>
                <Slider
                  min={0}
                  max={32}
                  step={2}
                  value={[designTokens.borderRadius]}
                  onValueChange={([v]) => actions.setDesignTokens({ borderRadius: v })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Mood</Label>
                <div className="flex flex-wrap gap-2">
                  {moodOptions.map((m) => (
                    <button
                      key={m}
                      onClick={() => actions.setDesignTokens(getPresetForMood(m))}
                      className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                        designTokens.mood === m
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Applies a full curated palette + typography pairing for that mood.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="motion" className="space-y-4">
              <div className="space-y-1.5">
                <Label>Animation style</Label>
                <div className="grid grid-cols-4 gap-2">
                  {animationStyleOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => actions.setDesignTokens({ animationStyle: opt })}
                      className={`rounded-lg border px-3 py-2 text-xs capitalize transition-colors ${
                        designTokens.animationStyle === opt
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {ANIMATION_STYLE_LABELS[opt]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Animation intensity</Label>
                <span className="text-xs text-muted-foreground">{designTokens.animationIntensity}</span>
              </div>
              <Slider
                min={0}
                max={100}
                step={5}
                value={[designTokens.animationIntensity]}
                onValueChange={([v]) => actions.setDesignTokens({ animationIntensity: v })}
                disabled={designTokens.animationStyle === "none"}
              />
              <p className="text-xs text-muted-foreground">
                {designTokens.animationStyle === "none"
                  ? "Animations are off. Everything renders instantly."
                  : "Controls reveal distance, duration, and stagger across every section."}
              </p>

              <Separator />

              <div className="space-y-2">
                <Label>Per-section animation</Label>
                <p className="text-xs text-muted-foreground">
                  Each section uses the global style above by default. Override any of them
                  individually to mix animation styles across the page.
                </p>
                {SECTION_ANIM_KEYS.map((key) => {
                  const override = sectionAnimations[key];
                  const isExpanded = expandedAnimSection === key;
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-muted-foreground">{portfolioSectionLabels[key]}</span>
                        <button
                          type="button"
                          onClick={() => setExpandedAnimSection(isExpanded ? null : key)}
                          className={`rounded p-1 transition-colors hover:bg-secondary ${isExpanded ? "text-primary" : "text-muted-foreground"}`}
                          aria-label={`Choose ${portfolioSectionLabels[key]} animation`}
                          title="Choose animation style"
                        >
                          <Settings2 className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => actions.setSectionAnimation(key, null)}
                          className={`rounded-md border px-2 py-1 text-[10px] transition-colors ${
                            !override
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          Auto{!override ? ` (${ANIMATION_STYLE_LABELS[designTokens.animationStyle]})` : ""}
                        </button>
                        {override && (
                          <span
                            className="rounded-md border border-primary bg-primary/10 px-2 py-1 text-[10px] text-foreground"
                          >
                            {ANIMATION_STYLE_LABELS[override]}
                          </span>
                        )}
                      </div>
                      {isExpanded && (
                        <div className="grid grid-cols-4 gap-1.5 rounded-lg border border-border/60 p-2">
                          {animationStyleOptions.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                actions.setSectionAnimation(key, opt);
                                setExpandedAnimSection(null);
                              }}
                              className={`rounded-md border px-2 py-1.5 text-[10px] transition-colors ${
                                override === opt
                                  ? "border-primary bg-primary/10 text-foreground"
                                  : "border-border text-muted-foreground hover:border-primary/40"
                              }`}
                            >
                              {ANIMATION_STYLE_LABELS[opt]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="stickers" className="space-y-6">
              <div className="space-y-1.5">
                <Label>Interactive characters</Label>
                <p className="text-xs text-muted-foreground">These characters wiggle when visitors hover or tap them.</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {CHARACTER_STICKERS.map((character) => (
                    <button
                      key={character}
                      type="button"
                      onClick={() => actions.addDecoration("emoji", character, { interactive: true })}
                      aria-label={`Add interactive ${character} character`}
                      className="flex aspect-square items-center justify-center rounded-lg border border-primary/25 bg-primary/5 text-xl transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/10"
                    >
                      {character}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Emoji</Label>
                <div className="grid grid-cols-6 gap-1.5">
                  {STICKER_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => actions.addDecoration("emoji", e)}
                      aria-label={`Add ${e} sticker`}
                      className="flex aspect-square items-center justify-center rounded-lg border border-border text-lg transition-colors hover:border-primary/40 hover:bg-primary/10"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Doodles</Label>
                <div className="grid grid-cols-4 gap-2">
                  {DOODLES.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => actions.addDecoration("image", d.svg)}
                      aria-label={`Add ${d.label} doodle`}
                      title={d.label}
                      className="flex aspect-square items-center justify-center rounded-lg border border-border p-2.5 transition-colors hover:border-primary/40 hover:bg-primary/10"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={svgToDataUrl(d.svg)} alt={d.label} className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Borders</Label>
                <div className="grid grid-cols-3 gap-2">
                  {BORDERS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => actions.addDecoration("border", b.svg)}
                      aria-label={`Add ${b.label} border`}
                      title={b.label}
                      className="flex h-9 items-center justify-center rounded-lg border border-border transition-colors hover:border-primary/40 hover:bg-primary/10"
                      style={{
                        backgroundImage: `url(${svgToDataUrl(b.svg)})`,
                        backgroundRepeat: "repeat-x",
                        backgroundPosition: "center",
                        backgroundSize: `auto ${b.tileHeight}px`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Adds a short strip — use the Length control on the selected border to repeat the
                  pattern into a longer continuous line.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>Your own image</Label>
                <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-border px-3 py-3 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                  Upload PNG or SVG stickers (select multiple)
                  <input
                    type="file"
                    accept="image/png,image/svg+xml,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files ?? []);
                      e.target.value = "";
                      if (files.length === 0) return;
                      const dataUrls = await Promise.all(files.map((f) => readFileAsDataUrl(f)));
                      dataUrls.forEach((url) => {
                        if (url) actions.addDecoration("image", url);
                      });
                    }}
                  />
                </label>
              </div>

              <p className="text-xs text-muted-foreground">
                Click any sticker to drop it onto the page, then drag it into place. Use the floating
                toolbar on a selected sticker to resize or remove it.
              </p>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
