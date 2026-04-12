# Frontend Design Document

Everything needed to understand, modify, or extend the ContractIQ frontend.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.2.3 |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS v4 (PostCSS plugin, no config file) | ^4 |
| Fonts | Space Grotesk (sans), IBM Plex Mono (mono) | Google Fonts |
| Language | TypeScript (strict) | ^5 |
| Path alias | `@/*` → `./src/*` | tsconfig.json |

No component library. No state management library. No CSS-in-JS.

---

## Design System

### Theme

Dark-first. Background `#020617` (slate-950), foreground `#e2e8f0` (slate-200).

### Color Palette

| Role | Color | Usage |
|---|---|---|
| Primary | Cyan (`#22d3ee`, 300) | Links, active states, progress indicators, eyebrow text |
| Alert / Danger | Rose (`#f43f5e`, 400) | Risk flags, critical urgency, error states |
| Success | Emerald (`#34d399`, 300) | Completed steps, green signals, approved status |
| Warning | Amber (`#fbbf24`, 300) | Low-confidence fields, demo mode banner, medium urgency |
| Neutral | Slate (400–600) | Secondary text, borders, inactive states |

### Glass Morphism

All cards and panels use a glassmorphic style:
- 1px border: `rgba(148, 163, 184, 0.14)` (slate-400 at 14%)
- Background: layered linear gradients over `rgba(15, 23, 42, 0.78)` (slate-900)
- `backdrop-filter: blur(24px)`
- `border-radius: 32px` (desktop), `24px` (mobile)
- `box-shadow: 0 18px 60px rgba(2, 6, 23, 0.36)`

### CSS Classes (globals.css)

| Class | Purpose |
|---|---|
| `.panel-surface` | Primary card container (glass border, blur, shadow, 32px radius) |
| `.eyebrow` | Uppercase label text (0.72rem, 0.28em tracking, cyan-300) |
| `.panel-title` | Card heading (1.65rem, semibold, white) |
| `.panel-copy` | Card body text (0.95rem, slate-300) |
| `.hero-chip` | Compact stat pill (gradient border, inner glow) |
| `.hero-chip-label` | Stat label inside hero-chip (0.68rem, uppercase) |
| `.hero-chip-value` | Stat value inside hero-chip (0.98rem, white, medium weight) |
| `.glass-subtle` | Lighter glass for secondary containers (5% white bg) |
| `.metric-label` | Small data label (0.72rem, uppercase, slate-400) |
| `.workflow-step` | Pipeline step pill (pill shape, flex row, numbered badge) |
| `.workflow-step-number` | Circular badge inside step (cyan bg, 1.8rem) |
| `.workflow-step-label` | Step category label (uppercase, slate-400) |
| `.workflow-step-title` | Step description (0.95rem, white, medium) |

### Background Pattern

Applied in `app/(app)/layout.tsx`, shared across all pages:
- Radial gradient: cyan glow top-left, amber glow top-right
- Linear gradient: `#07111f` → `#020817` → `#020617`
- Grid overlay: 80px grid lines at 8% opacity with fade mask

---

## Routing Architecture

Uses Next.js App Router with a **route group** `(app)` for shared layout.

```
app/
├── layout.tsx                          ← Root layout (fonts, metadata, globals.css)
├── globals.css                         ← Tailwind v4 + design system classes
└── (app)/                              ← Route group (shared sidebar layout)
    ├── layout.tsx                      ← Sidebar + mobile top bar + background
    ├── page.tsx                        ← Dashboard         → /
    ├── renewals/
    │   └── page.tsx                    ← Renewals           → /renewals
    └── workflows/
        └── [id]/
            ├── page.tsx                ← Workflow Pipeline   → /workflows/{id}
            └── results/
                └── page.tsx            ← Full Results        → /workflows/{id}/results
```

### Root Layout (`app/layout.tsx`)
- Loads Google Fonts (Space Grotesk + IBM Plex Mono)
- Sets CSS variables `--font-space-grotesk` and `--font-ibm-plex-mono`
- Applies to `<html>`: font variables, `h-full`, `antialiased`
- Server component (no "use client")

### App Layout (`app/(app)/layout.tsx`)
- Client component ("use client")
- Renders `<NavSidebar />` (desktop, ≥1024px) + `<MobileTopBar />` (< 1024px)
- Flex row: sidebar fixed left, main content scrollable right
- Background gradient + grid overlay applied here

---

## Pages

### 1. Dashboard (`/`)

**File:** `app/(app)/page.tsx`

**Purpose:** Entry point. Upload contracts here, get redirected to workflow page.

**Layout:**
- Hero section: "ContractIQ" eyebrow, headline, subtitle
- Stats row (3 `hero-chip` cards): total annual spend, vendors tracked, urgent renewals
- `<UploadPanel>` — drag-and-drop file upload, prominent
- Recent contracts section (shown when spend data has vendors)

**Data:**
- `GET /api/spend/summary` → stats row (fails silently, shows "--")
- `GET /api/renewals/urgent` → urgent count (fails silently, shows "--")

**Flow:**
1. User selects/drops files into UploadPanel
2. `startWorkflow(files)` → creates workflow, uploads documents, returns workflow ID
3. `router.push(/workflows/${id})` → navigates to pipeline page

### 2. Workflow Pipeline (`/workflows/[id]`)

**File:** `app/(app)/workflows/[id]/page.tsx`

**Purpose:** The main demo page. Shows the 6-agent pipeline processing in real time.

**Layout:**
- Header: workflow ID, status text, "View full results" link (when ready)
- Demo mode banner (amber, shown when using fallback data)
- Pipeline progress bar: 6 steps in a grid, each shows done/active/pending state
- Two-column grid: `<LiveAgentFeed>` (left) + stacked cards (right)
  - `<ContractSummaryCard>` always shown
  - `<RecommendationCard>` shown when pipeline completes
- `<ArtifactReviewPanel>` at bottom (shown when pipeline completes)

**Data:**
- `useWorkflow(id)` hook auto-hydrates on mount
- Polls `GET /api/workflows/{id}` every 2s until terminal status
- Then fetches contract, decision, artifacts in sequence
- Falls back to `primaryDemoScenario` on any error

**Pipeline Step States:**
- **Done:** `border-emerald-400/30 bg-emerald-400/8`, checkmark icon
- **Active:** `border-cyan-400/40 bg-cyan-400/12`, pulsing number badge
- **Pending:** default styling (slate borders)

**Step-to-status mapping:** Steps map to backend statuses: `INGESTING → EXTRACTING → ANALYZING_RISK → RESEARCHING → DECIDING → GENERATING`. Terminal statuses (`PENDING_APPROVAL`, `COMPLETED`, `APPROVED`, `FAILED`) mark all steps as done.

### 3. Full Results (`/workflows/[id]/results`)

**File:** `app/(app)/workflows/[id]/results/page.tsx`

**Purpose:** Deep-dive view for judges. Shows everything the pipeline produced.

**Layout:**
- Back link to pipeline page
- Header: "Full Analysis Results", workflow ID, vendor name
- Risk report section (`panel-surface`):
  - Overall score + risk level badge
  - 4 category scores (renewal, commercial, legal, security) in glass cards
  - Risk flags list with severity badges (Critical/High/Medium/Low)
  - Positive signals as emerald tags
- Two-column grid: `<ContractSummaryCard>` + `<RecommendationCard>`
- `<ArtifactReviewPanel>` at bottom

**Data:**
- `useWorkflow(id)` for contract, decision, artifacts
- `GET /api/workflows/{id}/risk` for risk report (separate fetch)

**Risk severity styles:**
- Critical: `bg-rose-500/15 text-rose-100 border-rose-400/30`
- High: `bg-amber-500/15 text-amber-100 border-amber-400/30`
- Medium: `bg-yellow-500/12 text-yellow-100 border-yellow-400/25`
- Low: `bg-slate-500/12 text-slate-200 border-slate-400/25`

### 4. Renewals (`/renewals`)

**File:** `app/(app)/renewals/page.tsx`

**Purpose:** Portfolio view of upcoming contract deadlines.

**Layout:**
- Header: "Renewal Command Center" eyebrow, headline, subtitle
- Stats row (3 `hero-chip` cards): total urgent, nearest deadline, tracking window
- Table inside `panel-surface`:
  - Column headers: Vendor, Days left, Urgency
  - Rows: `glass-subtle` cards with vendor ID, days count, urgency badge
  - Empty state: message + link to dashboard
  - Loading state: spinner

**Data:**
- `GET /api/renewals/urgent?max_days=180`

**Urgency badge mapping:**
- ≤14 days: CRITICAL (rose)
- ≤30 days: HIGH (amber)
- ≤60 days: MEDIUM (yellow)
- >60 days: LOW (emerald)

---

## Components

All in `src/components/`. All are client components (use hooks or browser APIs).

### NavSidebar (`nav-sidebar.tsx`)

Desktop-only (hidden below `lg` breakpoint). Fixed left sidebar, 220px wide.

- Logo: "ContractIQ" eyebrow + "AI Contract Intelligence" subtitle
- Nav links: Dashboard (`/`), Renewals (`/renewals`)
- Active workflow section: shown when URL matches `/workflows/[id]`
  - "Pipeline" link → `/workflows/{id}`
  - "Full Results" link → `/workflows/{id}/results`
- Bottom branding card: "Enterprise Agents Hackathon"
- Active state: `bg-white/8 text-white`, icon turns cyan
- Uses `usePathname()` for active detection

### UploadPanel (`upload-panel.tsx`)

File upload with drag-and-drop support.

**Props:**
```typescript
{
  items: UploadItem[];               // Display items (demo file list)
  workflowPhase: UiWorkflowPhase;   // Controls button label/disabled state
  errorMessage: string | null;       // Error display
  startWorkflow: (files: File[]) => Promise<string | null>;  // Callback
}
```

- Accepts PDF/DOCX, max 25MB each
- Shows file list with status badges (Ready/Scanning/Flagged)
- Button label changes per phase: "Start analysis" → "Creating workflow..." → "Uploading docs..." → "Processing..."
- Hidden file input triggered by button click

### LiveAgentFeed (`live-agent-feed.tsx`)

Real-time timeline of agent events.

**Props:**
```typescript
{ events: AgentEvent[] }
```

- Vertical timeline with connector lines
- Each event: agent name, action (bold), detail text, timestamp
- Tone-based gradient backgrounds:
  - `neutral`: slate gradient
  - `positive`: emerald gradient
  - `alert`: rose gradient
- "LIVE" indicator badge with glow effect at top

### ContractSummaryCard (`contract-summary-card.tsx`)

Displays extracted contract fields with confidence scores.

**Props:**
```typescript
{
  contract: ContractRecord;
  analysisSource: "parsed_content" | "fallback_demo" | "inferred_filenames";
}
```

- 2-column grid of extracted fields
- Fields shown: Vendor, Annual Value, Renewal Date, Notice Period, Auto-Renewal, Pricing Model, Termination Rights, Liability Cap, DPA, SOC2
- Confidence badges: `<70%` amber, `≥70%` emerald
- Low-confidence callout (amber border) for notice period
- Source attribution text at bottom

### RecommendationCard (`recommendation-card.tsx`)

Displays the AI decision and reasoning.

**Props:**
```typescript
{
  recommendation: Recommendation;
  vendorResearch: VendorResearch;
  deadlineCallout: { label: string; value: string; detail: string };
}
```

- Large decision text (RENEGOTIATE, CANCEL, etc.)
- Urgency badge (LOW/MEDIUM/HIGH/CRITICAL with color mapping)
- Notice deadline callout (amber box)
- Confidence percentage
- "Why act now" reasons in glass boxes
- "Next moves" action items in cyan glass boxes
- Collapsible vendor research: news, pricing signals, alternatives, sources

### ArtifactReviewPanel (`artifact-review-panel.tsx`)

Draft artifacts with approval gate.

**Props:**
```typescript
{
  artifactPack: ArtifactPack;
  onApprove?: () => Promise<void>;
  workflowId?: string | null;
}
```

- Two-column grid: negotiation points (left) + draft email (right)
- Negotiation points: list items in glass boxes
- Draft email: monospace `<pre>` with whitespace preservation
- Approval badge: "PENDING" (amber) or "APPROVED" (emerald)
- Approve button: disabled without workflowId, hidden when approved

---

## State Management

### useWorkflow Hook (`src/hooks/use-workflow.ts`)

Central state hook. Two modes of operation:

**Mode 1: Fresh workflow (no arguments)**
- Dashboard page calls `startWorkflow(files)` → creates workflow, uploads docs, returns ID
- Does NOT hydrate (page navigates away)

**Mode 2: Existing workflow (`useWorkflow(workflowId)`)**
- Auto-hydrates on mount via `useEffect`
- Polls `GET /api/workflows/{id}` every 2s (max 60 attempts)
- On terminal status: fetches contract → decision → artifacts
- Falls back to `primaryDemoScenario` on any error
- Sets `demoMode: true` with reason when using fallback

**Return type:**
```typescript
{
  workflowState: UiWorkflowState;      // Phase, IDs, status, flags
  contractRecord: ContractRecord;       // Extracted fields
  recommendation: Recommendation;       // Decision + reasoning
  artifactPack: ArtifactPack;          // Negotiation points + email
  agentEvents: AgentEvent[];           // Timeline events
  vendorResearch: VendorResearch;      // Vendor intel
  noticeDeadlineCallout: { label, value, detail };
  startWorkflow: (files: File[]) => Promise<string | null>;
  approveArtifacts: () => Promise<void>;
}
```

### Workflow Phases (`src/lib/workflow-state.ts`)

```
Idle → CreatingWorkflow → UploadingDocuments → Processing → Ready
                                                           → ReviewRequired
                                                           → Error
```

### Cross-Page State

**No global store.** The workflow ID is the URL. Each page that needs workflow data calls `useWorkflow(id)` independently. Data is re-fetched on each page mount, but since the pipeline is already complete, the poll resolves immediately on the first attempt.

---

## Data Flow

### Upload → Pipeline → Results

```
Dashboard (/)
  └─ User drops files into UploadPanel
  └─ startWorkflow(files)
       ├─ POST /api/workflows           → workflow_id
       ├─ POST /api/workflows/{id}/documents  → starts backend pipeline
       └─ returns workflow_id
  └─ router.push(/workflows/{id})

Workflow Page (/workflows/{id})
  └─ useWorkflow(id) mounts
       ├─ Polls GET /api/workflows/{id} every 2s
       │   (status: INGESTING → EXTRACTING → ANALYZING_RISK → ...)
       ├─ On terminal status:
       │   ├─ GET /api/contracts/{id}      → ContractRecord
       │   ├─ GET /api/workflows/{id}/decision  → Recommendation
       │   └─ GET /api/workflows/{id}/artifacts → ArtifactPack
       └─ Falls back to primaryDemoScenario on error

Results Page (/workflows/{id}/results)
  └─ useWorkflow(id) + GET /api/workflows/{id}/risk
  └─ Shows all data in detail

Approve
  └─ POST /api/workflows/{id}/approve
  └─ Updates artifactPack.approvalStatus → "APPROVED"
```

### Backend → Frontend Type Mapping

Backend responses are transformed by adapter functions in `src/lib/adapters.ts`:

| Backend Response | Adapter Function | UI Type |
|---|---|---|
| `ContractResponse` | `adaptContractResponse()` | `ContractRecord` |
| `WorkflowDecisionResponse` | `adaptWorkflowDecisionResponse()` | `Recommendation` |
| `WorkflowArtifactsResponse` | `adaptWorkflowArtifactsResponse()` | `ArtifactPack` |
| `BackendFlaggedField[]` | `adaptBackendFlaggedFields()` | `UiReviewField[]` |
| `AgentFeedEvent` | `adaptAgentFeedEvent()` | `AgentEvent` |

Key transformations:
- Currency strings → numbers (`$214,800` → `214800`)
- Boolean strings → booleans (`"Yes"` → `true`)
- `ESCALATE_LEGAL/ESCALATE_SECURITY/DEFER` → `ESCALATE`
- Artifact content split by newlines into negotiation points array

---

## Demo Fallback System

When the backend is unavailable or fails, the frontend falls back to hardcoded Zoom demo data.

**Source:** `src/lib/mock-data.ts`

**Primary demo scenario:**
- Vendor: Zoom
- Annual value: $214,800
- Notice period: 45 days (58% confidence — flagged)
- Decision: RENEGOTIATE, 91% confidence, CRITICAL urgency
- Alternatives: Microsoft Teams, Google Meet, Webex Suite

**How it works:**
1. `useWorkflow` initializes all state with `primaryDemoScenario`
2. If backend call fails → `applyDemoFallback(reason)` restores demo data
3. Dashboard shows `demoMode: true` with amber banner explaining why
4. `deriveDashboardScenarioFromContract()` can generate scenarios for any contract

---

## API Client (`src/lib/api-client.ts`)

Base URL: `NEXT_PUBLIC_CONTRACTIQ_API_BASE_URL` (default `http://localhost:8000`)

| Function | Method | Endpoint |
|---|---|---|
| `createWorkflow()` | POST | `/api/workflows` |
| `uploadWorkflowDocuments(id, files)` | POST | `/api/workflows/{id}/documents` |
| `getWorkflow(id)` | GET | `/api/workflows/{id}` |
| `getContract(id)` | GET | `/api/contracts/{id}` |
| `getWorkflowRisk(id)` | GET | `/api/workflows/{id}/risk` |
| `getWorkflowDecision(id)` | GET | `/api/workflows/{id}/decision` |
| `getWorkflowArtifacts(id)` | GET | `/api/workflows/{id}/artifacts` |
| `approveWorkflowArtifacts(id)` | POST | `/api/workflows/{id}/approve` |
| `getSpendSummary()` | GET | `/api/spend/summary` |
| `getUrgentRenewals(maxDays)` | GET | `/api/renewals/urgent?max_days={n}` |

All requests include `mode: "cors"`, `Accept: application/json`. Form data uploads omit `Content-Type` (browser sets multipart boundary). All errors are logged to console. `ApiClientError` includes HTTP status code.

---

## Type Definitions

### Domain Types (`src/lib/types.ts`)

```typescript
UploadItem     { name, type, size, status: "Ready"|"Scanning"|"Flagged" }
AgentEvent     { id, agent, action, detail, time, tone: "neutral"|"positive"|"alert" }
ContractRecord { vendorName, annualValue, renewalDate, noticePeriodDays, autoRenewal,
                 pricingModel, terminationRights, liabilityCap, dpaPresent, soc2Present,
                 extractionConfidence: Record<string, number> }
VendorResearch { vendorName, recentNews[], pricingSignals[], alternatives[], sources[] }
Recommendation { decision: "RENEW"|"RENEGOTIATE"|"CANCEL"|"ESCALATE",
                 confidence, urgency: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL",
                 reasons[], nextSteps[] }
ArtifactPack   { negotiationPoints[], draftEmail, approvalStatus: "PENDING"|"APPROVED"|"REJECTED" }
```

### Workflow State (`src/lib/workflow-state.ts`)

```typescript
UiWorkflowPhase: Idle | CreatingWorkflow | UploadingDocuments | Processing | ReviewRequired | Ready | Error

UiWorkflowState {
  phase, workflowId, vendorId, backendStatus, currentAgent,
  reviewFields: UiReviewField[], errorMessage,
  demoMode, demoModeReason, updatedAt
}
```

### UI Types (`src/lib/ui-types.ts`)

```typescript
UiReviewField { key, label, value, confidence, confirmed, needsReview, sourceText }
```

Aliases: `UiContractRecord = ContractRecord`, `UiRecommendation = Recommendation`, etc.

---

## File Reference

| File | Purpose |
|---|---|
| `app/layout.tsx` | Root layout: fonts, metadata, globals.css |
| `app/globals.css` | Tailwind v4 imports + design system CSS classes |
| `app/(app)/layout.tsx` | Shared layout: sidebar, mobile bar, background |
| `app/(app)/page.tsx` | Dashboard: upload + stats |
| `app/(app)/workflows/[id]/page.tsx` | Workflow pipeline: progress + feed + cards |
| `app/(app)/workflows/[id]/results/page.tsx` | Full results: risk + all detail cards |
| `app/(app)/renewals/page.tsx` | Renewals command center |
| `src/components/nav-sidebar.tsx` | Desktop sidebar navigation |
| `src/components/upload-panel.tsx` | File upload with drag-and-drop |
| `src/components/live-agent-feed.tsx` | Real-time agent event timeline |
| `src/components/contract-summary-card.tsx` | Extracted contract fields display |
| `src/components/recommendation-card.tsx` | Decision + vendor research panel |
| `src/components/artifact-review-panel.tsx` | Artifact approval UI |
| `src/hooks/use-workflow.ts` | Workflow state machine + API polling |
| `src/lib/api-client.ts` | Backend API client (fetch-based) |
| `src/lib/api-types.ts` | TypeScript types matching backend responses |
| `src/lib/adapters.ts` | Backend → UI data transforms |
| `src/lib/mock-data.ts` | Demo fallback data (Zoom scenario) |
| `src/lib/types.ts` | UI-level type definitions |
| `src/lib/ui-types.ts` | UI wrapper types + UiReviewField |
| `src/lib/workflow-state.ts` | Workflow phase enum + state shape |
