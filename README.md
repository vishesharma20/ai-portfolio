# Portfolio AI — MVP

Turn a resume into a polished, fully editable one-page portfolio in under a minute.

This is a complete, working slice of the larger Portfolio AI product: **upload → extract →
style → generate → edit → preview**, built to be extended rather than thrown away.

## Quick start

You can open the landing page and try the generator without Docker or a database:

```bash
npm install
npm run dev
```

Open http://localhost:3000. In this mode, generated work is temporary and stays in the browser
session. Accounts, the dashboard, and saving portfolios need PostgreSQL.

### Turn on accounts and saving

Copy the example environment file and set `DATABASE_URL` to a running PostgreSQL database plus
`BETTER_AUTH_SECRET` in `.env.local`:

```powershell
Copy-Item .env.example .env.local
npm run db:push   # creates the tables, once
npm run dev
```

Resume/inspiration-image AI extraction is separately optional (see below).

### Optional: real AI extraction

```bash
# in .env.local, set GROQ_API_KEY=...
```

With a key set, resume extraction and inspiration analysis go through Groq's OpenAI-compatible
API. Without a key, both fall back automatically to deterministic local logic — that part of the
product never breaks or blocks on missing configuration. See `.env.example` for the full list of
optional keys (`GROQ_API_KEY`, `GITHUB_TOKEN`).

## The flow

1. **Landing** (`/`) — marketing page: hero, features, example preview, CTA.
2. **Login / signup** (`/login`, `/signup`) — Better Auth email/password.
3. **Dashboard** (`/dashboard`) — lists the signed-in user's saved portfolios.
4. **Generator** (`/generator`) — a multi-step wizard:
   - **Upload** — resume (PDF/DOCX), GitHub import, or manual entry, optional profile photo
   - **Confirm** — review/edit extracted data (React Hook Form + Zod on the core fields,
     direct store editing for dynamic lists)
   - **Inspiration** — optional image upload, simulated/AI style analysis → design tokens
   - **Generating** — a short animated transition
   - **Editor & Preview** (`/dashboard/portfolio/[id]`) — sidebar editor (content / design /
     motion tabs) + live desktop/mobile preview, with inline text editing, undo/redo, and
     autosave (debounced, race-safe — see `lib/portfolio/save-coordinator.ts`) persisting to
     Postgres as you edit. A save-status indicator (saving / saved / error, with retry) sits in
     the editor header.

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

types/                  Zod schemas + inferred types (ResumeData, DesignTokens, GeneratorState,
                        Portfolio — the canonical persisted model) — the contracts every layer
                        above builds on
hooks/                  useFileUpload, usePortfolioGeneration (orchestrates the two API calls),
                        usePortfolioPersistence (autosave — see below)
```

Persistence and auth (added after the original MVP slice above, not reflected in the tree):

```
lib/auth/               Better Auth setup + getCurrentUserId() helper
lib/db/                 Drizzle schema, portfolios.ts (ownership-scoped CRUD), actions.ts
                        (the "use server" actions the client calls)
lib/portfolio/          convert.ts (canonical Portfolio <-> editor-state), defaults.ts,
                        save-coordinator.ts (race-safe autosave queue — see its own doc comment)
app/dashboard/          Portfolio list + the editor/preview routes
middleware.ts           Route protection (redirects signed-out users away from /dashboard)
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

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · shadcn/ui-pattern components ·
Framer Motion · GSAP (ScrollTrigger, used in the generated portfolio's hero) · React Hook Form +
Zod · Zustand · Better Auth · PostgreSQL + Drizzle ORM · Vitest · unpdf + mammoth · Groq
(OpenAI-compatible SDK, optional)

## Testing

```bash
npm run test
```

Runs Vitest: unit tests for the autosave save coordinator (`lib/portfolio/save-coordinator.ts`)
plus a hook-level test that exercises the portfolio-creation race condition
(`hooks/use-portfolio-persistence.ts`). `npx tsc --noEmit` and `npm run lint` are also available
for type-checking and linting respectively.
