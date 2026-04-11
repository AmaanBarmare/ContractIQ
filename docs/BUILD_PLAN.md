# Build Plan

48-hour timeline and role assignments for the Enterprise Agents Hackathon.

---

## Team Roles

| Role | Focus Area | Responsibilities |
|---|---|---|
| **Agent Engineer** | Backend / AI | All six agent implementations, LLM prompts, structured output schemas, confidence scoring logic, extraction field coverage |
| **Integration Engineer** | Infrastructure / Orchestration | IBM Watsonx Orchestrate workflow configuration, Redis setup (Streams, Vector, Pub/Sub, Sorted Sets), Tavily integration, FastAPI backend, inter-agent message routing, WebSocket for Live Agent Feed |
| **Frontend & Demo** | UI / Presentation | React frontend, Live Agent Feed component, Artifact Approval UI, Renewal Command Center, upload interface, slide deck, backup demo recording |

---

## Friday Evening — Kickoff (5–7pm)

**Goal:** Environment working. Everyone unblocked. Zoom scenario agreed.

### All Three Team Members
- [ ] Confirm roles and communication channel (Discord / group chat)
- [ ] Agree on demo scenario — **Zoom renewal** is the default; confirm this
- [ ] Prepare sample contracts: Zoom MSA, Order Form, Amendment, Pricing Sheet (fabricated, clearly structured)
- [ ] Create shared GitHub repo, add all three as collaborators
- [ ] Copy `.env.example` to `.env` and distribute API keys

### Integration Engineer
- [ ] IBM Cloud account active — Watsonx Orchestrate workspace created
- [ ] Test simplest Watsonx Orchestrate workflow: dispatch one dummy agent and confirm it returns
- [ ] Redis Cloud instance provisioned — test `redis-cli ping`
- [ ] Tavily API key tested: run one search for "Zoom company news" and confirm results return
- [ ] FastAPI skeleton running on localhost

### Agent Engineer
- [ ] Python environment with `ibm-watsonx-ai`, `langgraph`, `pymupdf`, `redis` installed
- [ ] Test Watsonx.ai model call: send a simple extraction prompt, confirm structured JSON returns
- [ ] Confirm Granite model is accessible in the project

### Frontend
- [ ] Next.js project initialized with Tailwind + shadcn/ui
- [ ] Upload component renders and sends file to FastAPI endpoint
- [ ] Placeholder for Live Agent Feed renders without error

---

## Saturday — Full Build Day

### Morning (9am–1pm) — Core Pipeline

**Agent Engineer:**
- [ ] Ingestion Agent: classification prompt working, outputs clean document envelope
- [ ] Extraction Agent: parses Zoom MSA and returns 15+ fields as structured JSON
- [ ] Confidence scoring on extraction output working

**Integration Engineer:**
- [ ] Redis Hash: Extraction Agent writes contract record, reads correctly
- [ ] Redis Streams: Ingestion Agent publishes, Extraction Agent subscribes and triggers
- [ ] Watsonx Orchestrate: workflow dispatches Ingestion → Extraction in sequence

**Frontend:**
- [ ] File upload sends files to backend, receives workflow_id
- [ ] WebSocket connects to `/ws/agent-feed/{workflow_id}`
- [ ] Live Agent Feed renders first two events (Ingestion, Extraction)

**Midday checkpoint (1pm):** Full Ingestion → Extraction → Redis → Live Feed working end-to-end.

---

### Afternoon (1pm–6pm) — Parallel Agents + Decision

**Agent Engineer:**
- [ ] Risk Agent: reads Redis contract record, produces flags for Zoom scenario
- [ ] Decision Agent: receives risk report + vendor intel, produces RENEGOTIATE recommendation
- [ ] Action Agent: generates at minimum negotiation prep sheet and vendor email draft

**Integration Engineer:**
- [ ] Watsonx Orchestrate: parallel dispatch of Risk Agent + Vendor Research Agent
- [ ] Vendor Research Agent: Tavily integration returning results for Zoom
- [ ] Watsonx Orchestrate: routes to Action Agent after Decision Agent completes
- [ ] Confidence routing: flagged field confirmation prompt works end-to-end

**Frontend:**
- [ ] Live Agent Feed showing all 6 agents in sequence
- [ ] Confidence confirmation prompt renders and user input flows back to backend
- [ ] Artifact Approval UI: shows 2+ draft artifacts (at minimum negotiation prep + email)

**Evening checkpoint (6pm):** Full Zoom renewal flow works top-to-bottom once. No breaks.

---

### Evening (6pm–10pm) — Polish + P1 Features

**Agent Engineer:**
- [ ] Action Agent: generate CFO Summary and full Renewal Brief
- [ ] Tune extraction prompt for better confidence on Zoom documents
- [ ] Add legal risk flags to Risk Agent

**Integration Engineer:**
- [ ] Redis audit log writing correctly on workflow completion
- [ ] Renewal Command Center data: Redis Sorted Set updating on workflow complete
- [ ] Redis TTL cache for Tavily results

**Frontend:**
- [ ] Artifact Approval UI: all 5 artifacts visible, edit + approve flow working
- [ ] Renewal Command Center: shows 30/60/90-day view with Zoom in the queue
- [ ] UI polish: loading states, error states, clean typography

**End of Saturday:** Record backup demo video of the full 90-second Zoom flow.

---

## Sunday — Polish and Submission

### Morning (9am–12pm)

**All:**
- [ ] Fix any bugs from overnight
- [ ] Run the full demo flow 3 times in a row without failure

**Agent Engineer:**
- [ ] P1: Contract Q&A — at least 3 example questions working
- [ ] Extraction: increase field count to 25+

**Integration Engineer:**
- [ ] Redis Vector Search: index Zoom contract chunks, test one semantic query
- [ ] GitHub README: setup instructions, architecture diagram, env vars documented

**Frontend:**
- [ ] Slide deck finalized: Problem → Solution → Demo → Architecture → Business Case
- [ ] All UI states handled gracefully (no crashes, no blank screens)

---

### Midday (12pm–2:30pm) — Final Prep

- [ ] Run full demo 5 times, rehearse the 5-minute pitch out loud
- [ ] Time the pitch: must be under 5 minutes with the live demo
- [ ] Prepare 2-minute version as backup
- [ ] Test backup video playback
- [ ] Final commit: clean up debug logs, remove test data

---

### 2:30pm — Submission

Submit before 3:00pm ET:
- [ ] GitHub repo URL (public)
- [ ] README with setup instructions
- [ ] Business case slide deck OR demo video
- [ ] Any additional context required by the submission form

---

### 5:00pm — Zoom Demo to Judges

- One team member drives the demo (practiced 5+ times)
- One team member handles Q&A on architecture
- One team member handles Q&A on business case and implementation details
- Backup video ready to share screen if needed
