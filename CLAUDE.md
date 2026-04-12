# CLAUDE.md

This file is read automatically by Claude Code. It contains everything needed to understand, run, and contribute to ContractIQ without asking the team for context.

---

## Working Rules (Must Follow)

**1. The 95% Confidence Rule.**
Do not take action, make changes, or commit to a direction unless you are at least 95% confident it is correct. If you are not that certain, stop and investigate further (read more code, check docs, ask the user) before proceeding. Guessing, "probably this," or plausible-sounding assumptions are not acceptable substitutes for certainty. When confidence is below the bar, say so and surface the uncertainty rather than pushing forward.

**2. Plan → Build → Test, One Step at a Time.**
For any non-trivial change, follow this loop strictly:
  1. **Plan** the specific piece of work before touching code — know exactly what you're changing and why.
  2. **Build** only that piece.
  3. **Test** it (run it, execute the relevant tests, verify the behavior end-to-end) and confirm it actually works before moving on.
  4. Only then move to the next piece.

Do not stack multiple untested changes on top of each other. Do not assume code works because it "looks right" — verify it. If a step cannot be tested yet, state that explicitly and explain how it will be validated later.

---

## What This Project Is

ContractIQ is a multi-agent AI platform for procurement teams. Six specialized agents — orchestrated by IBM Watsonx Orchestrate — work together to extract contract data, detect risk, research vendors in real time via Tavily, recommend decisions, and generate stakeholder-ready artifacts. All inter-agent communication flows through Redis Streams. All state lives in Redis.

**This was built for the Enterprise Agents Hackathon (April 10–12, 2026) — IBM Watsonx Orchestrate · Redis · Tavily.**

The flagship demo is the **Renewal Rescue workflow**: user uploads four Zoom contracts → six agents fire in sequence → complete renegotiation decision package in under 90 seconds.

---

## Repo Structure

```
contractiq/
├── CLAUDE.md                    ← you are here
├── README.md
├── ARCHITECTURE.md
├── TECH_STACK.md
├── BUSINESS_CASE.md
│
├── app/                         ← FastAPI backend
│   ├── main.py                  ← app entry point, route registration
│   ├── routers/
│   │   ├── workflows.py         ← POST /api/workflows, GET /api/workflows/{id}
│   │   ├── documents.py         ← POST /api/workflows/{id}/documents
│   │   ├── contracts.py         ← GET /api/contracts/{vendor_id}
│   │   ├── qa.py                ← POST /api/qa
│   │   ├── spend.py             ← GET /api/spend/summary
│   │   ├── renewals.py          ← GET /api/renewals/urgent
│   │   └── artifacts.py        ← GET/POST /api/workflows/{id}/artifacts
│   ├── agents/
│   │   ├── ingestion.py         ← Agent 1
│   │   ├── extraction.py        ← Agent 2
│   │   ├── risk.py              ← Agent 3
│   │   ├── research.py          ← Agent 4 (Tavily)
│   │   ├── decision.py          ← Agent 5
│   │   └── generation.py        ← Agent 6
│   ├── orchestrator/
│   │   └── orchestrate.py       ← IBM Watsonx Orchestrate client + workflow dispatch
│   ├── services/
│   │   ├── redis_client.py      ← Redis connection + helper functions
│   │   ├── llm_client.py        ← Anthropic Claude wrapper (call_llm)
│   │   ├── parser.py            ← PyMuPDF document parsing
│   │   └── tavily_client.py     ← Tavily (via Orchestrate vasco-tavily tool)
│   ├── models/
│   │   ├── contract.py          ← Pydantic models for contract records
│   │   ├── workflow.py          ← Workflow state models
│   │   ├── risk.py              ← Risk flag models
│   │   └── artifacts.py        ← Artifact models
│   └── websocket/
│       └── agent_feed.py        ← WebSocket handler for Live Agent Feed
│
├── app/                         ← FastAPI backend + Next.js App Router (colocated)
│   │                              Python (.py) = backend; TypeScript (.tsx) = frontend
│   ├── layout.tsx               ← Next.js root layout (App Router)
│   ├── page.tsx                 ← Dashboard (single-page app)
│   ├── globals.css              ← Tailwind v4 global styles
│   │   ... (Python backend files listed above)
│
├── src/                         ← Frontend source (Next.js 16 + React 19)
│   ├── components/
│   │   ├── nav-sidebar.tsx      ← Desktop navigation + “judge narrative”
│   │   ├── demo-runway.tsx      ← Six-agent runway strip (dashboard)
│   │   ├── upload-panel.tsx     ← Drag-and-drop file upload
│   │   ├── live-agent-feed.tsx  ← Live Agent Feed (real-time events)
│   │   ├── contract-summary-card.tsx ← Extracted contract terms display
│   │   ├── recommendation-card.tsx   ← Decision + vendor research panel
│   │   └── artifact-review-panel.tsx ← Artifact approval UI
│   ├── hooks/
│   │   └── use-workflow.ts      ← Workflow state machine + API polling
│   └── lib/
│       ├── api-client.ts        ← Backend API client (fetch-based)
│       ├── api-types.ts         ← TypeScript types matching backend responses
│       ├── adapters.ts          ← Backend → UI data transforms
│       ├── mock-data.ts         ← Demo fallback data (Zoom scenario)
│       ├── types.ts             ← UI-level type definitions
│       └── workflow-state.ts    ← Workflow phase enum + state shape
│
├── agents/                      ← Agent documentation (markdown)
├── workflows/                   ← Workflow documentation (markdown)
├── modules/                     ← Module documentation (markdown)
├── docs/                        ← Demo, build plan, guardrails docs
├── api/                         ← API reference
│
├── scripts/
│   ├── seed_demo.py             ← Seeds Redis with Zoom demo contracts for hackathon
│   ├── reset_demo.py            ← Clears Redis and resets to clean state
│   └── test_agents.py           ← Runs each agent in isolation with sample data
│
├── tests/
│   ├── test_extraction.py
│   ├── test_risk.py
│   ├── test_decision.py
│   └── test_workflows.py
│
├── .env.example                 ← All required env vars with descriptions
├── requirements.txt
├── docker-compose.yml           ← Redis Stack + backend + frontend
└── Makefile                     ← Common commands (see below)
```

---

## Frontend UI (mission control)

The Next.js layer is built for **on-stage narration**: dark zinc canvas, teal/orange accents, **Syne** display type for headlines, **Outfit** for UI chrome, **IBM Plex Mono** for code and timestamps. The shell uses animated aurora blobs plus a light grain overlay — it should read as a live ops console, not generic “AI slop” glass.

**Demo affordances (see `design.md` for the full spec):**

- **Dashboard** — hero band + **90-second story arc** (what to say: upload → feed → approve) + **six-agent runway** (`src/components/demo-runway.tsx`) so judges see the pipeline before a file is dropped.
- **Sidebar** — includes a compact **judge narrative** card: Orchestrate → Redis Streams → Tavily.
- **Workflow** — pipeline and feed copy reinforce that the UI trace is the same stream you could replay from Redis.

---

## Environment Setup

### 1. Copy and fill env vars

```bash
cp .env.example .env
```

Required values in `.env`:

```bash
# IBM Watsonx Orchestrate — for workflow orchestration + Tavily tool access
ORCHESTRATE_API_KEY=       # from your Watsonx Orchestrate instance
ORCHESTRATE_INSTANCE_URL=  # e.g. https://dl.watson-orchestrate.ibm.com/...

# Anthropic Claude — LLM backbone for Extraction and Decision agents
ANTHROPIC_API_KEY=         # from console.anthropic.com
# Optional override; defaults to claude-sonnet-4-6
# ANTHROPIC_MODEL_ID=claude-sonnet-4-6

# Redis (local, free)
REDIS_URL=redis://localhost:6379

# App
SECRET_KEY=your-secret-key-here
```

> **Note:** Tavily is not configured directly. It's accessed through the
> `vasco-tavily` tool connected inside Watsonx Orchestrate, so no
> `TAVILY_API_KEY` is required in this repo.

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

Key packages: `anthropic`, `pymupdf`, `pydantic`, `python-dotenv`, `fastapi`, `redis`, `uvicorn`, `httpx`, `websockets`, `python-multipart`.

### 3. Start Redis Stack

```bash
docker run -d --name contractiq-redis -p 6379:6379 redis/redis-stack
```

Or with docker-compose (runs everything):

```bash
docker-compose up
```

### 4. Start backend

```bash
uvicorn app.main:app --reload --port 8000
```

### 5. Start frontend

```bash
npm install && npm run dev
```

Frontend runs on `http://localhost:3000`. Next.js 16 uses the App Router with files in `app/` (colocated with Python backend) and `src/` for components/hooks/lib.

---

## Common Commands (Makefile)

```bash
make dev          # Start backend + frontend in parallel
make redis        # Start Redis Stack via Docker
make seed         # Seed demo data (Zoom contracts) into Redis
make reset        # Clear all Redis data and reseed
make test         # Run all tests
make test-agents  # Run agent integration tests with sample Zoom data
make lint         # Run ruff + mypy on backend
```

---

## Running the Demo

The demo uses pre-seeded Zoom contract data. Run this before any demo:

```bash
make seed
# or
python scripts/seed_demo.py
```

Then:
1. Open `http://localhost:3000`
2. Go to the Upload area
3. Upload the four files from `scripts/demo_data/zoom/`
4. Watch the Live Agent Feed

Expected output: RENEGOTIATE recommendation with 5 draft artifacts in under 90 seconds.

To reset and run again:

```bash
make reset
```

---

## Architecture in One Paragraph

User uploads contracts → FastAPI receives files and creates a workflow ID → IBM Watsonx Orchestrate dispatches Agent 1 (Ingestion) → Agent 2 (Extraction) parses all documents into a structured Redis Hash and flags any low-confidence fields for human confirmation → Agents 3 (Risk) and 4 (Vendor Research via Tavily) fire in parallel → Agent 5 (Decision) synthesizes both outputs into a recommendation → Watsonx Orchestrate checks confidence and routes to Agent 6 (Action & Generation) → all artifacts are marked Draft and held behind an approval gate → user approves → workflow is logged to Redis audit stream and marked complete. Every inter-agent message is published to a Redis Stream, which the Live Agent Feed reads in real time via WebSocket.

**Read these files in order if you're new:**
1. `ARCHITECTURE.md` — system diagram and data flow
2. `agents/AGENT_OVERVIEW.md` — agent roster and communication protocol
3. `workflows/renewal_rescue.md` — the flagship demo step-by-step
4. `TECH_STACK.md` — how every technology is used with code examples

---

## Key Design Decisions

**Why six agents instead of one big agent?**
Each agent owns exactly one responsibility. This makes confidence scoring meaningful (you know which step failed), enables parallel execution (Risk and Research run simultaneously), and makes the Live Agent Feed genuinely informative. One monolithic agent would be impossible to debug and would show nothing useful in the UI.

**Why Redis Streams for inter-agent communication instead of direct function calls?**
Streams give us: (1) the Live Agent Feed for free — the UI subscribes to the same stream the agents write to, (2) workflow state that survives server restarts — a paused workflow can resume from the last completed step, (3) a built-in audit log of every agent action, and (4) true async — agents do not need to be in the same process or even on the same server.

**Why is the approval gate enforced by Watsonx Orchestrate rather than the application layer?**
Because application-layer guardrails can be bypassed by bugs or by developers editing code. Orchestrate's workflow definition is the authoritative description of what is and isn't allowed. The approval gate is a workflow state, not a conditional in a function. This is what "enterprise guardrails" means.

**Why does the Extraction Agent flag low-confidence fields but not block the rest of the pipeline?**
Because blocking everything on one uncertain field wastes time and frustrates users. If 37 out of 38 fields extracted at 95% confidence, those 37 fields should immediately be available to Risk and Research agents. Only the flagged field (e.g. notice period at 58%) needs human confirmation. The downstream agents receive the record with that field marked `confirmed: false` and treat it conservatively.

**Why Tavily and not a generic web search?**
Tavily is purpose-built for AI agents — it returns clean, structured, citation-rich results and filters noise. Generic search (Google, Bing) returns SEO-heavy pages that require significant post-processing. For the vendor research use case (find news, pricing benchmarks, security incidents), Tavily is meaningfully more accurate and efficient.

---

## Agent Quick Reference

| File | Agent | Input | Output |
|---|---|---|---|
| `app/agents/ingestion.py` | Ingestion & Classification | Raw uploaded files | Document envelope with metadata |
| `app/agents/extraction.py` | Extraction | Document envelope | Normalized contract record (40+ fields) |
| `app/agents/risk.py` | Risk & Compliance | Contract record (Redis) | Risk flags, scores, escalation routing |
| `app/agents/research.py` | Vendor Research (Tavily) | Vendor name + category | Vendor intelligence object |
| `app/agents/decision.py` | Decision | Risk report + vendor intel | Structured recommendation |
| `app/agents/generation.py` | Action & Generation | Decision package | Draft artifacts (all types) |

---

## Redis Key Reference

| Key Pattern | Type | Contents |
|---|---|---|
| `workflow:{workflow_id}` | Hash | Workflow state, status, metadata |
| `contract:{workflow_id}` | Hash | All extracted contract fields with confidence scores |
| `doc:{file_id}` | Hash | Document metadata (type, vendor, hash, upload info) |
| `vendor:{vendor_id}:docs` | Set | All file_ids associated with this vendor |
| `risk:{workflow_id}` | String (JSON, TTL 7d) | Risk report (RiskReport.model_dump()) |
| `decision:{workflow_id}` | String (JSON, TTL 7d) | Decision (Decision.model_dump()) |
| `artifacts:{workflow_id}` | String (JSON, TTL 7d) | All generated artifacts with approval status |
| `vendor_research:{vendor_id}` | String (JSON, TTL 24h) | Cached Tavily results |
| `renewals_by_deadline` | Sorted Set | vendor_id → days_until_cancellation_deadline |
| `agent_events` | Stream | All inter-agent messages (Live Agent Feed source) |
| `audit_log` | Stream | All human actions (confirmations, approvals) |

---

## Testing

### Run all tests
```bash
pytest tests/
```

### Test a single agent with the Zoom sample data
```bash
python scripts/test_agents.py --agent extraction --input scripts/demo_data/zoom/
```

### Test the full pipeline end-to-end
```bash
python scripts/test_agents.py --workflow renewal_rescue --vendor zoom
```

### Expected output for the Zoom demo scenario
- Extraction: 38+ fields, notice_period flagged at ~58% confidence
- Risk: overall score 70–80, 2 critical flags (deadline + auto-renewal)
- Research: above-market pricing detected, 2–3 alternatives returned
- Decision: RENEGOTIATE, confidence > 0.85, urgency CRITICAL
- Generation: 5 artifacts produced, all marked DRAFT_PENDING_APPROVAL

---

## Common Issues

**Redis connection refused**
```bash
docker ps | grep redis  # check if container is running
docker start contractiq-redis
```

**Anthropic API key invalid / missing**
Check that `ANTHROPIC_API_KEY` is set in `.env` at the repo root. Smoke test:
`python -c "from app.services.llm_client import call_llm; print(call_llm('say hello'))"`.
401/403 means the key is wrong or revoked — regenerate at console.anthropic.com.

**Tavily returning no results**
Tavily is accessed via the `vasco-tavily` tool in Watsonx Orchestrate, not directly. If vendor research comes back empty, verify the tool is still connected in the Orchestrate console and that `ORCHESTRATE_API_KEY` / `ORCHESTRATE_INSTANCE_URL` are correct.

**Extraction returning low confidence across all fields**
Check that PyMuPDF is extracting text correctly from the sample PDFs: `python -c "import fitz; doc = fitz.open('path/to/pdf'); print(doc[0].get_text()[:500])"`. If text is garbled or empty, the PDF may be scanned — use LlamaParse instead.

**Live Agent Feed not updating**
Check the WebSocket connection in the browser console. Ensure the backend is running and Redis pub/sub is working: `redis-cli subscribe "workflow:WF-test:events"` and then trigger an agent action.

---

## Hackathon Context

- **Event:** Enterprise Agents Hackathon — IBM Watsonx Orchestrate, Redis, Tavily
- **Dates:** April 10–12, 2026
- **Theme:** Finance / Procurement
- **Team size:** 3 people
- **Demo:** Sunday April 12, 5–6pm ET via Zoom
- **Submission deadline:** Sunday April 12, 3:00pm ET
- **Submission:** GitHub repo + README + business case slide deck or demo video
- **Demo scenario:** Zoom renewal — upload 4 docs, get RENEGOTIATE recommendation + 5 artifacts in < 90 seconds
- **Backup video:** Record Saturday night, store in `scripts/demo_data/backup_demo.mp4`

**Judging criteria (inferred from hackathon brief):**
- Multi-agent orchestration using IBM Watsonx Orchestrate ← highest weight
- Creative and deep use of Redis ← high weight
- Integration of Tavily for real-time grounding ← high weight
- Measurable business impact with KPIs ← required
- Working demo that shows agents performing verifiable actions ← required
- Enterprise guardrails (human-in-the-loop, audit trail) ← required

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
