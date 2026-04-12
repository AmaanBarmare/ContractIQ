# Architecture

ContractIQ is a multi-agent system where each agent owns exactly one job. No agent does its neighbor's work. IBM Watsonx Orchestrate sits above all of them as the master coordinator — routing intent, managing state, enforcing guardrails, and assembling final outputs.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│  Dashboard · Ask ContractIQ · Vendor Workspace · Renewal Command    │
│  Center · Risk Review · Artifact Approval UI · Live Agent Feed      │
└────────────────────────┬────────────────────────────────────────────┘
                         │ HTTP / WebSocket
┌────────────────────────▼────────────────────────────────────────────┐
│                       FASTAPI BACKEND                                │
│              Session management · File upload · Auth                 │
└────────────────────────┬────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────────┐
│               IBM WATSONX ORCHESTRATE                                │
│                                                                      │
│  • Receives user intent (query or triggered renewal alert)           │
│  • Breaks intent into task plan                                      │
│  • Dispatches sub-agents in correct sequence                         │
│  • Manages dependencies between agents                               │
│  • Enforces confidence thresholds → routes to human review           │
│  • Blocks all external actions until user explicitly approves        │
│  • Assembles final decision package                                  │
│  • Writes audit trail to Redis                                       │
└──────────────┬──────────────────────────────┬───────────────────────┘
               │                              │
    ┌──────────▼──────────┐       ┌───────────▼───────────┐
    │    AGENT PIPELINE   │       │     REDIS BACKBONE     │
    │                     │       │                        │
    │  1. Ingestion       │◄─────►│  Hash: contract records│
    │  2. Extraction      │       │  Streams: message bus  │
    │  3. Risk        ─┐  │       │  Vector: clause search │
    │  4. Research    ─┼──┤       │  Sorted Sets: deadlines│
    │  5. Decision  ◄─┘  │       │  TTL: research cache   │
    │  6. Generation      │       │  Pub/Sub: Live Feed    │
    └─────────────────────┘       └────────────────────────┘
                                           ▲
                               ┌───────────┴──────────┐
                               │   EXTERNAL SERVICES   │
                               │                       │
                               │  Anthropic Claude LLM │
                               │  Tavily (via Orch.)   │
                               │  PyMuPDF              │
                               └───────────────────────┘
```

---

## Agent Execution Model

### Sequential with Parallel Branches

The pipeline is mostly sequential but fans out at step 3:

```
Ingestion → Extraction → ┌── Risk Agent         ──┐
                         │                         ├──► Decision → Generation
                         └── Vendor Research Agent ─┘
```

Risk and Vendor Research run in parallel because they are independent — Risk reads only the extracted contract record, Vendor Research only calls the Tavily tool through Watsonx Orchestrate. Both complete before the Decision Agent begins.

### Orchestrate as State Machine

Watsonx Orchestrate models the workflow as a state machine. Each state corresponds to an agent completing its task. State transitions are conditional on confidence scores:

```
INGESTED → EXTRACTED → ANALYZED → RESEARCH_COMPLETE → DECISION_READY → ARTIFACTS_DRAFTED → APPROVED → COMPLETE
                ↓ (low confidence)
          HUMAN_REVIEW_REQUIRED
                ↓ (user confirms)
          EXTRACTED (resume)
```

State is persisted in Redis so any workflow can be paused, resumed, or replayed.

---

## Inter-Agent Communication

All agent-to-agent communication flows through Redis Streams. Every message uses a consistent envelope:

```json
{
  "workflow_id": "WF-2026-0411-ZM-001",
  "source_agent": "extraction_agent",
  "target_agent": "risk_agent",
  "payload": { ... },
  "confidence": 0.94,
  "timestamp": "2026-04-11T14:32:01Z",
  "trace_id": "TRC-abc123"
}
```

The `trace_id` threads through every message in a workflow. The Live Agent Feed subscribes to the Redis Stream and renders each message as it arrives — this is what makes agent communication visible in the UI.

---

## Confidence Routing

Every agent output carries a confidence score. Watsonx Orchestrate uses this to decide what happens next:

| Confidence | Decision |
|---|---|
| 80–100% | Auto-proceed to next agent |
| 50–79% | Pause — display field and source to user for confirmation |
| < 50% | Escalate — request additional document or user input |

This prevents the system from silently passing bad data forward. Extraction might succeed at 94% confidence on spend value but flag the notice period at 58% — only that one field pauses for human confirmation; everything else proceeds.

---

## Human Approval Gate

Before any artifact is marked final or any external action fires, Watsonx Orchestrate enforces a mandatory approval gate:

```
Action Agent produces artifacts (all marked "Draft — Pending Approval")
          │
          ▼
User reviews artifacts in Approval UI
          │
    ┌─────┴──────┐
    │            │
  Approve      Reject / Edit
    │            │
    ▼            ▼
Watsonx logs   Return to
approval to    Action Agent
Redis audit    for revision
stream
    │
    ▼
Workflow marked COMPLETE
Renewal Command Center updated
```

No vendor email is sent. No legal escalation is issued. No decision is logged as final until this gate is passed.

---

## Redis Architecture Detail

Redis is the connective tissue of the system — not just a cache.

```
Redis Instance
│
├── HASH  contract:{workflow_id}
│         field → value for every extracted contract field
│         Enables O(1) field-level lookups by any agent
│
├── STREAM  agent_events
│           All inter-agent messages published here
│           Live Agent Feed subscribes to this stream
│           Audit log reads from this stream
│
├── VECTOR INDEX  contract_chunks
│                 Embeddings of all contract text chunks
│                 Powers semantic clause search in the Knowledge Layer
│
├── SORTED SET  renewals_by_deadline
│               vendor_id → days_until_deadline (score)
│               Renewal Command Center reads this for priority ordering
│
└── KEY (with TTL)  vendor_research:{vendor_id}
                    Cached Tavily results, expires after 24 hours
                    Avoids redundant API calls within a session
```

---

## Data Flow: Full Renewal Rescue

```
1. User uploads 4 Zoom documents
        │
2. Ingestion Agent classifies → links to vendor "Zoom"
        │
3. Extraction Agent parses → produces contract record
        │ ← notice period field at 58% confidence
        │
4. Watsonx pauses → user confirms notice period = 60 days
        │
5. Risk Agent (starts) ──────────── Vendor Research Agent (starts, parallel)
   reads Redis contract hash         invokes vasco-tavily tool via Orchestrate
   computes risk flags               fetches vendor intel + benchmarks
        │                                    │
        └──────────────┬─────────────────────┘
                       │
6. Decision Agent receives both payloads
   synthesizes → RENEGOTIATE, 91% confidence, CRITICAL urgency
                       │
7. Watsonx routes to Action Agent (confidence above threshold)
                       │
8. Action Agent generates 5 artifacts, marks all as Draft
                       │
9. User reviews → approves
                       │
10. Watsonx logs approval to Redis audit stream
    Marks workflow COMPLETE
    Updates renewals_by_deadline sorted set
```

---

## Security & Governance

- All contract data stays within the team's cloud tenancy — no contract text is sent to Tavily (only vendor names and category terms are used in search queries)
- Anthropic Claude processes contract text; data handling follows Anthropic's enterprise data processing and retention policies
- Audit trail in Redis is append-only — no entry can be modified after it is written
- User identity is attached to every human action in the audit log
- No external action (email, escalation) can fire without a logged human approval
