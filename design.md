# Frontend Design Document

Everything needed to understand, modify, or extend the ContractIQ frontend — including **how the UI supports the hackathon demo narrative**.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.2.3 |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS v4 (PostCSS plugin, no config file) | ^4 |
| Fonts | **Syne** (display), **Outfit** (UI), **IBM Plex Mono** (mono) | Google Fonts |
| Language | TypeScript (strict) | ^5 |
| Path alias | `@/*` → `./src/*` | tsconfig.json |

No component library. No state management library. No CSS-in-JS.

---

## Visual Direction (v2 — “Mission control”)

The UI is intentionally **not** generic glassmorphism-on-slate. It reads as a **live operations console** for a procurement demo:

- **Zinc/black canvas** (`#030712`, `#09090b`) — high contrast, “serious tool” feel.
- **Teal primary** (`#14b8a6` / `#2dd4bf`) — actions, active nav, positive motion.
- **Orange/amber** — urgency, deadlines, judge “talk track” callouts (distinct from a pure cyan-only palette).
- **Rose** — risk/recommendation tension (especially the decision card).
- **Slab surfaces** — cards use **defined edges**, a **top highlight stroke** (teal → orange gradient), and deep shadow — not anonymous frosted panels.

Typography:

- **Syne** (`.font-display` / `--font-syne`) — headlines, pipeline emphasis, big decision text.
- **Outfit** — body UI, dense tables, navigation.
- **IBM Plex Mono** — timestamps, codes, draft email.

Background:

- **Animated aurora blobs** (teal / orange / soft violet) + **grain** + **subtle grid** in `app/(app)/layout.tsx` via `.mesh-backdrop` and `.grain-overlay`.

---

## Design System

### Theme

Dark-first. Page background **`#030712`**. Foreground **zinc-200** (`#e4e4e7`).

### Color Roles

| Role | Color | Usage |
|---|---|---|
| Primary | Teal (`#14b8a6`, `#2dd4bf`) | CTAs, active nav, pipeline “running”, eyebrow labels |
| Warm accent | Orange (`#fb923c`) | Demo script, deadlines, sidebar “judge narrative” |
| Alert / danger | Rose | Risk, critical urgency, recommendation card cast |
| Success | Emerald | Completed steps, approved artifacts, positive feed tone |
| Neutral | Zinc 500–700 | Secondary text, borders |

### Surfaces

**`.panel-surface`** — primary container:

- Dark zinc gradient fill, **1px** `panel-edge` border, **heavy shadow**.
- **Top highlight**: `::before` pseudo-element — horizontal teal → orange gradient line (the “console” cue).

**`.hero-chip`** — dashboard stats:

- Left **teal bar** (`::after`), not a soft pill on all sides.

**`.workflow-step`** — pipeline chips:

- Squared **mono badge** numbers, rounded rectangle body (not infinite pills).

### CSS Classes (`globals.css`)

| Class | Purpose |
|---|---|
| `.font-display` | Syne headlines |
| `.panel-surface` | Primary card / section (slab + top highlight) |
| `.eyebrow` | Uppercase teal section label |
| `.panel-title` | Syne subhead inside panels |
| `.panel-copy` | Muted zinc body copy |
| `.hero-chip` | Stat tiles with left accent bar |
| `.hero-chip-label` / `.hero-chip-value` | Stat typography |
| `.glass-subtle` | Secondary inset regions |
| `.metric-label` | Field labels in grids |
| `.workflow-step` / `-number` / `-label` / `-title` | Pipeline step layout |
| `.mesh-backdrop` | Main content animated aurora + base |
| `.grain-overlay` | Film grain |
| `.page-shell` | Horizontal padding + max width |
| `.btn-primary` | Teal gradient pill CTA |
| `.btn-ghost` | Neutral outline button |
| `.drop-brackets` | Upload zone corner brackets |
| `.animate-rise` / `.stagger-in` | Entry motion |

---

## Demo-First UI (why certain screens exist)

### Dashboard (`/`)

Beyond upload, the dashboard now includes:

1. **Hero band** — full-width, asymmetric gradient frame; **Syne** headline; copy explicitly names **Watsonx Orchestrate**, **Redis**, **Tavily** for judges.
2. **90-second story arc** — three beat checklist: Upload → Feed → Approve (the narrative you say out loud).
3. **Six-agent runway** (`src/components/demo-runway.tsx`) — horizontal strip of agent stages so the pipeline is **visible before** anyone uploads a file.
4. **Stats** — `hero-chip` row for portfolio context.

### Workflow (`/workflows/[id]`)

- Pipeline is **horizontally scrollable + snap** on small viewports; **6-column grid** on large.
- Live feed copy stresses **Redis Streams** as the single source of truth for the UI trace.

### Sidebar

- **Teal/orange vertical rail** + **active left marker** on current route.
- **“Judge narrative”** card at bottom: one sentence reminding presenters what to say (Orchestrate → Redis → Tavily).

---

## Routing Architecture

Uses Next.js App Router with route group `(app)` for shared layout.

```
app/
├── layout.tsx                          ← Root: Syne + Outfit + IBM Plex Mono, globals.css
├── globals.css                         ← Design tokens + slab / motion / backdrop
└── (app)/
    ├── layout.tsx                      ← Sidebar, mobile bar, aurora + grain background
    ├── page.tsx                        ← Dashboard + runway + upload
    ├── renewals/page.tsx
    └── workflows/[id]/
        ├── page.tsx                    ← Pipeline + feed + cards
        └── results/page.tsx            ← Risk + full detail
```

### Root Layout (`app/layout.tsx`)

- Loads **Syne**, **Outfit**, **IBM Plex Mono**.
- CSS variables: `--font-syne`, `--font-outfit`, `--font-ibm-plex-mono`.

### App Layout (`app/(app)/layout.tsx`)

- Client component.
- `<NavSidebar />` (desktop) + `<MobileTopBar />` (mobile; includes workflow links when applicable).
- **Aurora** layers: three `.aurora-blob` divs + grain + grid + bottom vignette.

---

## Components (selected)

| File | Purpose |
|---|---|
| `src/components/demo-runway.tsx` | **NEW** — visual six-agent runway for the dashboard |
| `src/components/nav-sidebar.tsx` | Rail sidebar + judge narrative |
| `src/components/upload-panel.tsx` | Bracket dropzone, teal/orange drag state |
| `src/components/live-agent-feed.tsx` | Timeline emphasizing Redis / stream story |
| `src/components/contract-summary-card.tsx` | Extracted fields |
| `src/components/recommendation-card.tsx` | Decision + urgency (Syne decision wordmark) |
| `src/components/artifact-review-panel.tsx` | Approval gate; draft email in mono |

---

## Presenter Cheat Sheet (10× demo effectiveness)

Use the UI as your script:

1. **Dashboard hero** — read the headline once; it frames the product in one breath.
2. **Story arc card** — point at the three bullets in order; they match your slide timeline.
3. **Runway** — drag a finger across the six tiles: “This is the orchestrated graph.”
4. **Upload** — “This is the only human action before automation.”
5. **Workflow** — keep **Live agent feed** on screen during ingestion; narrate events as **stream replay**.
6. **Recommendation + artifacts** — “Human-in-the-loop” — expand research, then **Approve** for guardrails.

---

## API & State

Unchanged from prior architecture: `useWorkflow`, `api-client`, adapters, mock fallback. See earlier sections of this file and `CLAUDE.md` for endpoints and Redis keys.

---

## File Reference (frontend)

| File | Purpose |
|---|---|
| `app/layout.tsx` | Fonts, metadata |
| `app/globals.css` | Tokens, panels, backdrop, buttons |
| `app/(app)/layout.tsx` | Shell + aurora |
| `app/(app)/page.tsx` | Dashboard |
| `app/(app)/workflows/[id]/page.tsx` | Pipeline page |
| `app/(app)/workflows/[id]/results/page.tsx` | Full results |
| `app/(app)/renewals/page.tsx` | Renewals |
| `src/components/*.tsx` | UI components |
