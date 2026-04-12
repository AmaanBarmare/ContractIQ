# MVP Scope

Priority framework for the 48-hour build window. P0 must work perfectly before P1 is touched. P1 before P2.

**Rule:** Depth on the demo flow beats breadth across all features.

---

## P0 — Must Ship (The Demo Must Work)

Everything in P0 is required for the Renewal Rescue demo to run end-to-end.

| Feature | Owner | Status |
|---|---|---|
| Contract upload (drag-and-drop, 4 files) | Frontend | **Done** (`src/components/upload-panel.tsx`) |
| Ingestion Agent: classify documents, link to vendor | Agent Engineer | **Done** (`app/agents/ingestion.py`) |
| Extraction Agent: 15+ key fields from PDF | Agent Engineer | **Done** (`app/agents/extraction.py`) |
| Watsonx Orchestrate: route between agents, confidence threshold | Integration Engineer | **Done** (`app/orchestrator/orchestrate.py`) |
| Redis: contract Hash storage, Streams message bus | Integration Engineer | **Done** (`app/services/redis_client.py`) |
| Risk Agent: renewal risk + commercial risk flags | Agent Engineer | **Done** (`app/agents/risk.py`) |
| Vendor Research Agent: Tavily integration (news + pricing + alternatives) | Integration Engineer | **Done** (`app/agents/research.py`, `app/services/tavily_client.py`) |
| Decision Agent: structured recommendation with reasoning | Agent Engineer | **Done** (`app/agents/decision.py`) |
| Action Agent: negotiation prep sheet + vendor email draft | Agent Engineer | **Done** (`app/agents/generation.py`) |
| Live Agent Feed: real-time Redis Stream → WebSocket → UI | Frontend + Integration | **Done** (`app/websocket/agent_feed.py` + `src/components/live-agent-feed.tsx`) |
| Artifact Approval UI: review, edit, approve artifacts | Frontend | **Done** (`src/components/artifact-review-panel.tsx`) |
| Confidence routing: confirmation prompt for flagged fields | Integration + Frontend | Pending |

---

## P1 — Should Ship (Adds Depth and Demo Quality)

| Feature | Owner | Status |
|---|---|---|
| Full 40+ field extraction | Agent Engineer | Pending |
| Contract Q&A (natural language questions via Claude) | Integration + Agent | **Done** (`app/routers/qa.py`) |
| Renewal Command Center: 30/60/90-day view, priority sorted | Frontend | **Backend done** (`app/routers/renewals.py`); frontend page pending |
| Spend intelligence: total spend aggregation, category breakdown | Agent Engineer | **Done** (`app/routers/spend.py`) |
| CFO Summary artifact | Agent Engineer | **Done** (executive summary in `generation.py`) |
| Full Internal Renewal Brief artifact | Agent Engineer | **Done** (renegotiation brief in `generation.py`) |
| Full three-tier confidence routing (auto / human-review / escalate) | Integration | Pending |

---

## P2 — Nice to Have (Only If P0 and P1 Are Fully Working)

| Feature | Owner | Status |
|---|---|---|
| Portfolio dashboard with top-line metrics | Frontend | Pending |
| Vendor workspace view with document history | Frontend | Pending |
| Executive summary generator | Agent Engineer | **Done** (`generation.py`) |
| Duplicate detection during ingestion | Agent Engineer | Pending |
| Redis TTL-based vendor research caching | Integration | **Done** (`redis_client.py`, 24h TTL) |

---

## Hard Cuts (Not in MVP)

These were considered and deliberately excluded:

- Multi-tenant support (single team demo only)
- Real email sending (artifacts are drafts only — no actual email integration)
- SSO / authentication (simple session token for demo)
- Historical trend analysis (requires multiple time periods of data)
- Contract redlining (requires document editing library)
- Mobile interface
