# Portfolio AI — MVP

Turn a resume into a polished, fully editable one-page portfolio in under a minute.

This is a complete, working slice of the larger Portfolio AI product: **upload → extract →
style → generate → edit → preview**, built to be extended rather than thrown away.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. No configuration is required — the app works fully out of the box
using a deterministic mock AI layer (see below).

### Optional: real AI extraction

```bash
cp .env.example .env.local
# then set OPENAI_API_KEY=sk-...
```

With a key set, resume extraction uses `gpt-4o-mini` (structured JSON output) and inspiration
analysis uses vision. Without a key, both fall back automatically to deterministic local logic —
the product never breaks or blocks on missing configuration.

## The flow

1. **Landing** (`/`) — marketing page: hero, features, example preview, CTA.
2. **Generator** (`/generator`) — a 5-step wizard:
   - **Upload** — resume (PDF/DOCX) or manual entry, optional profile photo
   - **Confirm** — review/edit extracted data (React Hook Form + Zod on the core fields,
     direct store editing for dynamic lists)
   - **Inspiration** — optional image upload, simulated/AI style analysis → design tokens
   - **Generating** — a short animated transition
   - **Editor & Preview** — sidebar editor (content / design / motion tabs) + live desktop/mobile
     preview of the generated portfolio, updating instantly

## Architecture

```
app/                   Routes only — thin, delegates to features/
  page.tsx             Landing page
  generator/page.tsx   Mounts the wizard
  api/
    parse-resume/      POST: File -> { ResumeData }
    analyze-inspiration/ POST: { imageDataUrl } -> { DesignTokens }

components/ui/         Design-system primitives (shadcn/ui pattern): Button, Card,
                        Input, Tabs, Slider, Dropzone, etc. No business logic.
components/site/       Navbar, Footer

features/
  landing/             Landing page sections
  generator/            The wizard shell, one component per step, the editor sidebar
  portfolio/            The generated portfolio itself: portfolio-template.tsx composes
                        six section components (hero/about/skills/experience/projects/contact),
                        each driven entirely by (ResumeData, DesignTokens) props.

lib/
  ai/                  extraction + analysis, each with a mock implementation and an
                        OpenAI implementation behind one dispatcher function per capability
  parse/               PDF (unpdf) and DOCX (mammoth) -> raw text
  store/               Zustand store — single source of truth for the wizard
  design-tokens.ts      Pure functions mapping tokens -> font stacks / spacing / motion config
  utils.ts              cn(), id generation, file->dataURL

types/                  Zod schemas + inferred types (ResumeData, DesignTokens, GeneratorState) —
                        the contracts every layer above builds on
hooks/                  useFileUpload, usePortfolioGeneration (orchestrates the two API calls)
```

**Why it's structured this way:** business logic (`lib/`) never imports from `components/` or
`features/`, and UI primitives (`components/ui`) never import app-specific logic. The generated
portfolio (`features/portfolio`) only ever depends on its two input props — resume data and
design tokens — never on wizard state. That's what makes it reusable for export, and safe to
swap in new templates later without touching the generator.

## The mock AI layer

Two capabilities, each with the same shape:

- `lib/ai/resume-extraction.ts` — tries OpenAI (`gpt-4o-mini`, JSON mode) first if
  `OPENAI_API_KEY` is set; on any failure or absence, falls back to
  `lib/ai/mock-resume-parser.ts`, a heuristic parser (section-header detection, regex for
  email/phone/links, date-range parsing) that produces genuinely structured output from plain
  resume text — not placeholder data.
- `lib/ai/style-extraction.ts` — same pattern; the mock (`mock-style-analyzer.ts`) hashes the
  image data to deterministically select from six curated design-token presets, so results are
  stable per image and still feel intentional rather than random.

Both dispatchers return `{ data, usedAi }` / `{ tokens, usedAi }` so the UI could surface which
path was used if desired.

## PDF/DOCX parsing note

Resume text extraction uses `unpdf` (actively maintained, built on current `pdfjs-dist`) rather
than the commonly-recommended `pdf-parse`, which bundles a 2018-era pdf.js build that throws on
xref table variations produced by several real-world PDF generators. Lines are reconstructed from
each text item's on-page coordinates rather than relying on the extractor's own EOL heuristics,
which materially improves extraction quality across PDFs from different sources (Word, Google
Docs, Pages, design tools).

## Prepared, not built: future extensibility

Per the brief, these are structurally anticipated but intentionally not implemented:

- **Multiple templates** — `PortfolioTemplate` already takes `(resumeData, tokens)` as its only
  inputs; a template registry + selector is a small addition, not a rewrite.
- **AI chat editing** — the editor sidebar is tabbed (`content`/`design`/`motion`); a `chat` tab
  calling a new `lib/ai/chat-edit.ts` (same dispatcher pattern) would plug in directly.
- **Multiple inspiration images** — `UploadedAssets.inspirationDataUrl` is a single field by
  design; extending to an array only touches `types/generator.ts` and the upload step.
- **Drag-and-drop editor** — sections are already discrete, prop-driven components; reordering
  is a matter of an array of section keys plus a DnD library.
- **Export to Next.js / GitHub / Vercel** — `PortfolioTemplate` has zero dependency on wizard or
  editor state, so a codegen step can render it to static files independently.

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui-pattern components · Framer
Motion · GSAP (ScrollTrigger, used in the generated portfolio's hero) · React Hook Form + Zod ·
Zustand · unpdf + mammoth · OpenAI SDK (optional)
