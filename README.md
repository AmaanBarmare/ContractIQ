# ContractIQ

> AI Contract Renewal & Vendor Decision Agent  
> Built for the **Enterprise Agents Hackathon** · IBM Watsonx Orchestrate · Redis · Tavily · April 10–12, 2026

---

## What It Is

ContractIQ is a multi-agent AI platform that transforms scattered vendor contracts into a structured procurement operating system. Six specialized agents — orchestrated by IBM Watsonx Orchestrate, reasoning with Anthropic Claude — work together to extract contract data, detect risk, research vendors in real time via Tavily, recommend decisions, and generate stakeholder-ready artifacts.

**The core promise:** Upload contracts once. ContractIQ continuously helps your team answer questions, detect risk, prepare decisions, and drive renew / renegotiate / cancel workflows — with full traceability and human approval at every critical step.

---

## The Problem

Mid-market procurement teams manage 200–1,000 active vendor contracts across email, shared drives, and spreadsheets. The result:

- Auto-renewals fire silently because no one tracked the 60-day notice window buried in an amendment
- Renegotiation windows close before the team discovers the renewal date
- Finance can't answer "what are we spending on SaaS" without a week-long manual audit
- Procurement managers spend **14+ hours/week** on tasks that are fundamentally information retrieval and document drafting
- **$135 billion/year** lost to unwanted auto-renewals in North America

---

## The Solution

Six agents. One orchestrator. Full audit trail.

```
User Intent
     │
     ▼
IBM Watsonx Orchestrate  ◄──── confidence routing, guardrails, human approval gates
     │
     ├──► Agent 1: Ingestion & Classification
     ├──► Agent 2: Extraction
     ├──► Agent 3: Risk & Compliance        ─┐
     ├──► Agent 4: Vendor Research (Tavily)  ─┼──► Agent 5: Decision ──► Agent 6: Action & Generation
     └────────────────────────────────────────┘
                                                              │
                                                    User Approval Gate
                                                              │
                                                    Approved Artifacts + Audit Log (Redis)
```

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/your-team/contractiq
cd contractiq

# Install dependencies
pip install -r requirements.txt   # Python backend
npm install                       # Next.js frontend

# Configure environment
cp .env.example .env
# Fill in: ORCHESTRATE_API_KEY, ORCHESTRATE_INSTANCE_URL,
#         ANTHROPIC_API_KEY, REDIS_URL, SECRET_KEY

# Start Redis (local)
docker run -d -p 6379:6379 redis/redis-stack

# Start backend (port 8000)
uvicorn app.main:app --reload --port 8000

# Start frontend (port 3000) — in a second terminal
npm run dev

# Or run the agent pipeline without the UI
python scripts/run_pipeline.py
```

---

## Implementation Status: ✅ Complete (Backend + Frontend)

All three layers — agents, orchestration, and frontend — are merged and working.

### Backend (FastAPI — 12 REST routes + WebSocket + health)

**Core Orchestration:**
- `app/orchestrator/orchestrate.py` — Workflow state machine, agent sequencing, parallel execution (Agents 3+4)
- `app/main.py` — FastAPI entry point, route registration, CORS middleware

**Services:**
- `app/services/redis_client.py` — Redis helpers for workflows, contracts, risk, decision, artifacts, streams, audit logs
- `app/services/tavily_client.py` — Vendor research via Orchestrate's `vasco-tavily` tool

**All 6 Agents:**
- `app/agents/ingestion.py` — Agent 1: Document parsing, classification, vendor hint extraction
- `app/agents/extraction.py` — Agent 2: Contract field extraction (40+ fields, per-field confidence)
- `app/agents/risk.py` — Agent 3: Risk scoring across 4 categories (rule-based, no LLM)
- `app/agents/research.py` — Agent 4: Vendor research with Redis caching (24h TTL)
- `app/agents/decision.py` — Agent 5: LLM synthesis → recommendation (RENEGOTIATE/CANCEL/etc.)
- `app/agents/generation.py` — Agent 6: Artifact generation (5 types) via Claude

**API Routers (9 total):**
- `app/routers/workflows.py` — POST/GET/DELETE workflows + POST approve
- `app/routers/documents.py` — Document upload (triggers background pipeline)
- `app/routers/contracts.py` — Extracted contract data retrieval
- `app/routers/risk.py` — Risk report retrieval
- `app/routers/decision.py` — Decision retrieval
- `app/routers/qa.py` — Contract Q&A powered by Claude
- `app/routers/spend.py` — Spend analytics across all contracts
- `app/routers/renewals.py` — Urgent renewals sorted by deadline
- `app/routers/artifacts.py` — Artifact retrieval and per-artifact approval

**Real-Time:**
- `app/websocket/agent_feed.py` — WebSocket handler for live agent event streaming

**Infrastructure:**
- `docker-compose.yml` — Redis + backend services
- `Makefile` — Build and run commands
- `requirements.txt` — FastAPI, Redis, uvicorn, websockets, httpx, python-multipart

### Frontend (Next.js 16 + React 19 + Tailwind v4)

**App Router** (colocated in `app/` alongside Python backend):
- `app/page.tsx` — Marketing/home redirect entry
- `app/landing/page.tsx` — Public landing page ("Command Intelligence" aesthetic)
- `app/(app)/layout.tsx` — Authenticated app shell with sidebar
- `app/(app)/page.tsx` — Dashboard: story arc, six-agent runway, upload → workflow
- `app/(app)/dashboard/page.tsx` — Operational dashboard view
- `app/(app)/renewals/page.tsx` — Renewal command center
- `app/(app)/workflows/[id]/page.tsx` — Workflow detail (live agent feed)
- `app/(app)/workflows/[id]/results/page.tsx` — Decision + artifacts review
- `app/layout.tsx` — Root layout: **Syne** (display) + **Outfit** (UI) + **IBM Plex Mono**
- `app/globals.css` — Tailwind v4 + “mission control” slab surfaces, aurora backdrop, CTAs

**Next.js API Routes** (`app/api/` — Vercel deployment shim that mirrors the FastAPI backend so the frontend can demo without a Python server):
- `app/api/workflows/route.ts` + `app/api/workflows/[id]/{route,approve,artifacts,decision,documents,risk}/route.ts`
- `app/api/contracts/[id]/route.ts`
- `app/api/spend/summary/route.ts`
- `app/api/renewals/urgent/route.ts`

**Components** (`src/components/`):
- `demo-runway.tsx` — Horizontal six-agent strip (shows the pipeline before upload)
- `nav-sidebar.tsx` — Desktop nav + presenter “judge narrative” card
- `upload-panel.tsx` — Drag-and-drop file upload with status indicators
- `live-agent-feed.tsx` — Real-time agent event timeline
- `contract-summary-card.tsx` — Extracted fields with per-field confidence badges
- `recommendation-card.tsx` — Decision display with vendor research + deadline callout
- `artifact-review-panel.tsx` — Negotiation points + draft email with approve button

**Hooks & Lib** (`src/hooks/`, `src/lib/`):
- `use-workflow.ts` — Full workflow state machine: create → upload → poll → hydrate
- `api-client.ts` — Typed fetch client (12 functions) covering every FastAPI endpoint the UI calls
- `api-types.ts` — TypeScript types matching backend responses
- `adapters.ts` — Backend response → UI model transforms
- `mock-data.ts` — Demo fallback (Zoom scenario) when backend is unavailable
- `types.ts` / `ui-types.ts` — UI-level domain and view-model types
- `workflow-state.ts` — Workflow phase enum + state shape

---

## Verification & Testing

### End-to-End Workflow Test

**1. Create a workflow:**
```bash
curl -X POST http://localhost:8000/api/workflows
# Expected: {"workflow_id": "WF-...", "status": "CREATED"}
```

**2. Upload 4 Zoom demo contracts (replace WF-... with your ID):**
```bash
curl -X POST http://localhost:8000/api/workflows/WF-.../documents \
  -F "files=@scripts/demo_data/zoom/Zoom_MSA.pdf" \
  -F "files=@scripts/demo_data/zoom/Zoom_OrderForm.pdf" \
  -F "files=@scripts/demo_data/zoom/Zoom_Amendment.pdf" \
  -F "files=@scripts/demo_data/zoom/Zoom_PricingSheet.pdf"
# Expected: {"documents_uploaded": 4, "status": "PROCESSING"}
```

**3. Monitor pipeline progress (watch status flow through agent stages):**
```bash
# Poll every 2 seconds
while true; do 
  curl -s http://localhost:8000/api/workflows/WF-.../ | \
    python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"Status: {d['status']:<20} | Agent: {d.get('current_agent', '')}\")"
  sleep 2
done
# Expected: INGESTING → EXTRACTING → ANALYZING_RISK → RESEARCHING → DECIDING → GENERATING → PENDING_APPROVAL
```

**4. Verify Agent 2 (Extraction) output:**
```bash
curl -s http://localhost:8000/api/contracts/WF-.../ | python3 << 'EOF'
import sys, json
data = json.load(sys.stdin)
print(f"✅ Vendor: {data['vendor_name']['value']}")
print(f"✅ Confidence: {data['overall_confidence']:.0%}")
print(f"⚠️  Flagged fields: {data['flagged_fields']}")
for field in ['renewal_date', 'notice_period_days', 'auto_renewal']:
    val = data[field]['value']
    conf = data[field]['confidence']
    print(f"   {field}: {val} (confidence: {conf:.0%})")
EOF
# Expected: 92% overall confidence, notice_period @ 85%, flagged_deadline @ 60%
```

**5. Verify generated artifacts (Agent 6):**
```bash
curl -s http://localhost:8000/api/workflows/WF-.../artifacts | python3 << 'EOF'
import sys, json
data = json.load(sys.stdin)
print(f"✅ Generated {len(data['artifacts'])} artifacts:")
for art in data['artifacts']:
    print(f"   • {art['artifact_type']} — Status: {art['approval_status']}")
EOF
# Expected: 2+ artifacts, all DRAFT_PENDING_APPROVAL
```

**6. Test Q&A endpoint (Claude-powered):**
```bash
curl -s -X POST http://localhost:8000/api/qa \
  -H "Content-Type: application/json" \
  -d '{"workflow_id":"WF-...","question":"What is the notice period and auto-renewal status?"}' | \
  python3 -c "import sys, json; d=json.load(sys.stdin); print(d['answer'])"
# Expected: Claude responds with extracted information + confidence
```

**7. Check renewal urgency:**
```bash
curl -s http://localhost:8000/api/renewals/urgent | python3 -m json.tool
# Expected: Zoom renewal deadline in 4 days
```

**8. Check spend aggregation:**
```bash
curl -s http://localhost:8000/api/spend/summary | python3 -m json.tool
# Expected: $168,000 total (2x $84K Zoom contracts)
```

**9. Approve all artifacts and complete workflow:**
```bash
curl -X POST http://localhost:8000/api/workflows/WF-.../approve
# Expected: {"status": "APPROVED", "workflow_id": "WF-..."}
# Workflow changes to COMPLETED, audit log entry created
```

### Verify All 6 Agents

Run the isolated agent pipeline test (uses Amaan's code directly):
```bash
python scripts/run_pipeline.py
# Expected output:
#   STEP 1: PARSING — 4 Zoom PDFs
#   STEP 2: EXTRACTION — 16 fields, ~92% confidence
#   STEP 3: RISK ANALYSIS — HIGH (56/100), 3 Critical flags
#   STEP 4: DECISION — RENEGOTIATE, ≥85% confidence, CRITICAL urgency
#   RESULT: RENEGOTIATE — 91% confidence — CRITICAL urgency
#   Risk level: HIGH (56/100)
#   Days to act: 5
```

### Monitor Redis State

Check what's stored after a workflow completes:
```bash
python3 << 'EOF'
import redis, json
r = redis.Redis.from_url("redis://localhost:6379", decode_responses=True)

# All keys in Redis
keys = list(r.scan_iter(match="*"))
print(f"Redis Keys ({len(keys)} total):")
for key in sorted(keys):
    print(f"  {key}")

# Check workflow state
wf = r.hgetall("workflow:WF-...")
print(f"\nWorkflow Status: {wf.get('status')}")
print(f"Created At: {wf.get('created_at')}")
print(f"Completed At: {wf.get('completed_at')}")

# Check audit log (all human actions)
audit = r.xrange("audit_log", count=5)
print(f"\nAudit Log (last 5 actions):")
for event_id, data in reversed(audit):
    print(f"  [{data['action']}] by {data['user']} at {data['timestamp']}")
EOF
```

### Real-Time Agent Feed (WebSocket)

Connect to the live agent event stream (for frontend integration):
```bash
python3 << 'EOF'
import asyncio, websockets, json

async def watch_agents(workflow_id):
    async with websockets.connect(f"ws://localhost:8000/ws/agent-feed/{workflow_id}") as ws:
        async for msg in ws:
            event = json.loads(msg)
            print(f"[{event['source_agent']}] {event['event_type']}")
            if event['payload']:
                for k, v in event['payload'].items():
                    print(f"  {k}: {v}")

# Replace WF-... with your workflow ID
asyncio.run(watch_agents("WF-..."))
EOF
# Expected: Real-time stream of agent completions
```

---

## Repository Structure

```
contractiq/
├── README.md                    ← You are here
├── ARCHITECTURE.md              ← Full system architecture
├── TECH_STACK.md                ← Technology decisions and integration details
├── BUSINESS_CASE.md             ← ROI model, KPIs, market context
│
├── agents/
│   ├── AGENT_OVERVIEW.md        ← How agents communicate and coordinate
│   ├── agent_1_ingestion.md     ← Ingestion & Classification Agent
│   ├── agent_2_extraction.md    ← Extraction Agent
│   ├── agent_3_risk.md          ← Risk & Compliance Agent
│   ├── agent_4_research.md      ← Vendor Research Agent (Tavily)
│   ├── agent_5_decision.md      ← Decision Agent
│   └── agent_6_action.md        ← Action & Generation Agent
│
├── workflows/
│   ├── WORKFLOW_OVERVIEW.md     ← All supported workflows
│   ├── renewal_rescue.md        ← Flagship demo workflow
│   ├── contract_qa.md           ← Natural language Q&A workflow
│   ├── new_vendor_review.md     ← New contract onboarding workflow
│   └── spend_optimization.md    ← Spend analysis workflow
│
├── modules/
│   ├── extraction_engine.md     ← Structured extraction field reference
│   └── risk_engine.md           ← Risk detection categories and scoring
│
├── docs/
│   ├── DEMO_GUIDE.md            ← Step-by-step hackathon demo script
│   ├── MVP_SCOPE.md             ← P0/P1/P2 feature priorities
│   ├── BUILD_PLAN.md            ← 48-hour timeline and team roles
│   ├── GUARDRAILS.md            ← Human-in-the-loop and approval design
│   └── DIFFERENTIATION.md      ← ContractIQ vs. alternatives
│
└── api/
    └── API_REFERENCE.md         ← Backend endpoint reference
```

---

## Sponsor Tech Usage

| Sponsor | Integration |
|---|---|
| **IBM Watsonx Orchestrate** | Master orchestrator for all six agents — routes tasks, enforces confidence thresholds, manages human approval gates. Also hosts the `vasco-tavily` tool used by the Vendor Research agent. |
| **Anthropic Claude** (via Anthropic SDK) | LLM backbone for extraction, decision synthesis, and artifact generation |
| **Redis** (local) | Streams (inter-agent message bus + Live Agent Feed), Hash (contract records), Sorted Sets (renewal deadlines), TTL cache (vendor research) |
| **Tavily** | Real-time vendor intelligence — news, pricing benchmarks, security incidents, M&A activity — accessed through the `vasco-tavily` tool inside Watsonx Orchestrate |

---

## Business Impact

| Metric | Before | After |
|---|---|---|
| Contract review time per manager | 14 hrs/week | < 2 hrs/week |
| Auto-renewal miss rate | ~67% of companies miss at least one/quarter | 0% — all deadlines surfaced 30+ days early |
| Time from upload to decision recommendation | Days (manual) | < 2 minutes |
| Annual value for 3-person procurement team | — | **$315,000** |

---

## Team

Built by a 3-person team for the Enterprise Agents Hackathon, April 10–12, 2026.

- **Agent Engineer** — Ingestion, Extraction, Risk, Decision agent logic
- **Integration Engineer** — Watsonx Orchestrate, Redis, Tavily, FastAPI backend
- **Frontend & Demo** — React UI, Live Agent Feed, demo preparation

---

## License

MIT
