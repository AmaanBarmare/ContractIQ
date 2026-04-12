# ContractIQ — Hackathon Demo Script

**Enterprise Agents Hackathon — IBM Watsonx Orchestrate · Redis · Tavily**
**Demo: Sunday April 12, 5:00–6:00 PM ET via Zoom**
**Total demo time: 5 minutes**

---

## Pre-Demo Checklist

Run this **before** going live. Every item must pass.

```bash
# 1. Redis running
redis-cli ping                          # → PONG

# 2. Seed demo data
make seed                               # or: python scripts/seed_demo.py

# 3. Backend running
uvicorn app.main:app --reload --port 8000

# 4. Frontend running
npm run dev                             # → http://localhost:3000

# 5. Smoke tests
curl -s http://localhost:8000/api/spend/summary | jq .vendor_count
curl -s http://localhost:8000/api/renewals/urgent | jq .count
```

**Have ready:**
- Browser open to `http://localhost:3000`
- 4 Zoom demo files from `scripts/demo_data/zoom/` in a Finder window, ready to drag
- Backup video at `scripts/demo_data/backup_demo.mp4` — if anything crashes, switch immediately, no apology

---

## The Demo (5 Minutes)

### 0:00–0:30 — The Problem

**On screen:** Landing page (`localhost:3000`)

> "67% of procurement teams miss at least one contract auto-renewal every quarter. That's $135 billion lost annually across North America — not because teams don't care, but because the work is buried in PDFs, spreadsheets, and email chains."
>
> "ContractIQ fixes this. Six specialized AI agents, orchestrated by IBM Watsonx Orchestrate, turn a stack of contract documents into a complete renegotiation decision package — in under 90 seconds."

**Click "Launch Dashboard"** to navigate to the dashboard.

---

### 0:30–1:00 — The Dashboard & Upload

**On screen:** Dashboard with stats, agent runway, and upload panel

> "This is the procurement command center. You can see total spend tracked, number of vendors, and urgent renewals flagged."

**Point to the six-agent runway strip:**

> "These six agents are the core of ContractIQ. Each one owns exactly one responsibility — that's what makes confidence scoring meaningful and the live feed genuinely useful."

**Drag and drop the 4 Zoom files into the upload panel:**

1. `Zoom Master Services Agreement.pdf` — PRIMARY CONTRACT
2. `Zoom Order Form FY26.pdf` — SUPPORTING EXHIBIT
3. `Zoom Security & Privacy Addendum.docx` — SUPPORTING EXHIBIT
4. `Zoom Redlines from Legal.pdf` — NEGOTIATION HISTORY

> "Four documents. Master agreement, order form, security addendum, and redlines from legal. Let's drop them in and watch what happens."

**Click "Run renewal rescue"** — browser navigates to the workflow pipeline page.

---

### 1:00–1:45 — Agents Running (Ingestion + Extraction)

**On screen:** Pipeline view with six step indicators and the Live Agent Feed

> "IBM Watsonx Orchestrate just dispatched the first agent."

**Step 1 lights up — Ingestion Agent:**

> "The Ingestion Agent classified all four documents in about 8 seconds — it identified the MSA, order form, addendum, and redlines, and linked them to the Zoom vendor workspace."

**Step 2 lights up — Extraction Agent:**

> "Now the Extraction Agent is pulling key terms. It parses 38+ structured fields — vendor name, contract value, renewal date, auto-renewal clause, notice period, termination rights, everything."

**Watch for the confidence prompt** (notice period flagged at ~58%):

> "Here's the first guardrail. The notice period extracted at 58% confidence — below our 70% threshold. The pipeline doesn't block entirely. The other 37 fields at 95%+ confidence flow forward immediately. Only this one uncertain field pauses for human confirmation."

**Click "Confirm 60 days":**

> "I confirm 60 days. That correction is stored with `confirmed_by_user: true` and the pipeline resumes. This is Layer 2 of our four-layer guardrail system — confidence threshold routing enforced by Watsonx Orchestrate."

---

### 1:45–2:30 — Risk & Research (Parallel Execution)

**On screen:** Steps 3 and 4 both activating

> "Now something interesting happens — Watsonx Orchestrate fires two agents in parallel."

**Step 3 — Risk & Compliance Agent:**

> "The Risk Agent analyzes the extracted contract against compliance rules. It finds 4 flags — 2 critical, 2 high. Auto-renewal is active with only 34 days left. No termination for convenience clause. Overall risk score: 74 out of 100."

**Step 4 — Vendor Research Agent (Tavily):**

> "At the same time, the Vendor Research Agent is calling Tavily — through Watsonx Orchestrate's `vasco-tavily` tool — to pull real-time market intelligence. Four scoped queries: company health, security incidents, pricing benchmarks, and competitive alternatives."

**Point to Tavily results appearing in the feed:**

> "Tavily returns structured, citation-rich data. It found that Zoom's pricing is above market. Microsoft Teams and Google Meet are identified as alternatives the company may already be licensed for. This is live data — not a static database. Every vendor research result is cached in Redis with a 24-hour TTL."

---

### 2:30–3:00 — The Decision

**On screen:** Step 5 activates, then the Decision card appears

> "The Decision Agent synthesizes everything — risk report, vendor intelligence, extracted terms, spend data."

**Decision card renders:**

| Field | Value |
|---|---|
| Recommendation | **RENEGOTIATE** |
| Confidence | **91%** |
| Urgency | **CRITICAL** |
| Days to act | **34** |

> "RENEGOTIATE at 91% confidence. That's above the 80% auto-proceed threshold, so Watsonx Orchestrate routes directly to artifact generation — no human escalation needed. If this had been 75%, it would have paused for a senior reviewer."

---

### 3:00–3:45 — Artifacts & Approval Gate

**On screen:** Step 6 — Generation Agent produces 5 artifacts

> "The Generation Agent drafts five stakeholder-ready artifacts. Every single one is marked Draft — Pending Approval."

**Click through the artifact tabs:**

1. **Renewal Brief** — 2-page summary of the contract, risk flags, timeline, and recommended action
2. **Negotiation Prep Sheet** — leverage points pulled from Tavily (pricing benchmark, Zoom's slowing growth, free alternatives), legal considerations, key renewal terms
3. **Vendor Outreach Email** — ready-to-send template for the Zoom account rep, with personalization fields
4. **CFO Summary** — spend context, risk materiality, and projected savings from renegotiation
5. **Action Checklist** — who does what, by when, to execute the renegotiation

> "Notice the Negotiation Prep Sheet — Tavily pulled specific leverage points. Zoom had a pricing increase in Q2 2026. Teams and Meet are free alternatives the company may already pay for. This is real-time grounding, not hallucinated data."

**Edit the vendor outreach email** (personalize the greeting or a sentence):

> "I can edit any artifact before approving. Let me personalize this email."

**Click "Approve All":**

> "Now I approve. This is Layer 3 — the artifact approval gate, enforced by Watsonx Orchestrate as a workflow state, not a conditional in code. Nothing external — no email, no escalation, no sharing — fires until this button is clicked. The approval is logged to Redis's append-only audit stream with a timestamp, user ID, and content hash."

---

### 3:45–4:15 — Architecture Callout

**On screen:** Completed workflow with all 6 steps checked

> "Let me show you what just happened under the hood."

**Point to the Live Agent Feed:**

> "Every line in this feed is an event published to a Redis Stream. The same stream the agents write to is the one the UI reads from — there's no separate notification system. You could replay this entire workflow from the Redis audit log."

**Architecture summary:**

> "Six specialized agents. One orchestrator — IBM Watsonx Orchestrate — coordinating every handoff, enforcing confidence thresholds, and governing the approval gate."
>
> "Redis ran three critical roles: the inter-agent message bus via Streams, the state store for all contract data via Hashes, and the real-time cache for Tavily results with automatic TTL expiry."
>
> "Tavily provided live vendor intelligence — pricing benchmarks, competitive landscape, company health — accessed through Watsonx Orchestrate's tool framework."

---

### 4:15–5:00 — Business Impact & Close

> "Let's talk about what this replaces."
>
> "Without ContractIQ, this Zoom renewal would have taken: 3 hours of manual contract review, a legal consult, independent pricing research, and 4 documents drafted from scratch. Calendar time? 2 to 5 business days. We did it in 75 seconds."

**Key numbers:**

> "For a typical 3-person procurement team managing 300 contracts:"
>
> - "12 hours per week recovered per manager — that's **$153,000** in productivity annually."
> - "Auto-renewal misses prevented — **$72,000** saved."
> - "Renegotiation savings from Tavily-grounded benchmarks — 12–18% on flagged contracts, roughly **$60,000**."
> - "Total annual value: **$315,000**. Payback period: **under 6 weeks**."

**Closing line:**

> "ContractIQ is not a chatbot. Not a search box. It's a multi-agent procurement operating system that detects risk, recommends action, and generates every artifact a team needs — with humans in control at every step."

---

## Handling Q&A

### "How is this different from a RAG chatbot?"

> "Three ways. First, structured extraction — 40+ normalized fields stored in Redis, not raw text chunks. Second, true multi-agent orchestration with parallel execution and confidence routing enforced by Watsonx Orchestrate — not a single prompt chain. Third, artifact generation with approval gates. We produce verifiable action items, not conversational answers. RAG chatbots answer questions. ContractIQ makes decisions and acts."

### "What happens if the AI gets something wrong?"

> "Four layers of guardrails. Layer 1: confidence threshold routing — low-confidence fields are flagged, not silently passed. Layer 2: human confirmation prompts — the user sees the extracted value, the source text, and the confidence score before confirming. Layer 3: artifact approval gate — nothing external fires without explicit approval. Layer 4: immutable audit trail in Redis Streams — every extraction, confirmation, decision, and approval is logged with timestamps and user IDs. The system is designed to surface uncertainty, not hide it."

### "How does Watsonx Orchestrate add value vs. just chaining function calls?"

> "Three things. First, the workflow definition is the authoritative source of truth — confidence thresholds, parallel routing, and the approval gate are workflow states, not conditionals buried in code. A bug in our Python code can't bypass the approval gate because Orchestrate enforces it. Second, the confidence routing table is configurable without redeploying — we can adjust thresholds per agent as we learn from production data. Third, Orchestrate manages the Tavily integration through its tool framework, so our agents never call external APIs directly — all external access is governed and auditable."

### "How does Redis fit beyond just caching?"

> "Redis is running five distinct roles. Hashes store all contract and workflow state — that's the source of truth, not a cache. Streams power the inter-agent message bus and the live feed you saw — same data structure, two consumers. Sorted Sets track renewal deadlines for the urgency queue. JSON keys with TTLs cache Tavily results so we don't re-query for the same vendor within 24 hours. And the audit log is an append-only Stream that survives server restarts. If we restarted the backend mid-workflow, the next agent would resume from the last completed step because the state is in Redis, not in memory."

### "What about data privacy — does contract data leave your system?"

> "Only vendor names and product category terms are sent to Tavily for research. No contract text, no pricing data, no PII. Tavily queries are scoped to public information: company news, pricing benchmarks, security incidents, and competitive alternatives. All contract content stays within our system boundary — extracted by Claude, stored in Redis, never sent to external search."

### "How would this scale to thousands of contracts?"

> "The architecture is already designed for it. Redis Streams handle high-throughput event processing. Agents are stateless — they read from and write to Redis, so you can run multiple instances. Watsonx Orchestrate manages workflow routing regardless of volume. The bottleneck today is LLM latency for extraction, which we'd address with batch processing and priority queuing. The data model, message bus, and orchestration layer all scale horizontally."

---

## Recovery Playbook

| Failure | Recovery |
|---|---|
| **Demo crashes entirely** | Switch to backup video immediately. No apology. "Let me show you the recording of a full run." |
| **Tavily is slow / no results** | "The cache missed — you're seeing a live API call through Watily via Orchestrate. This is the real integration, not a mock." |
| **Orchestrate latency** | Narrate the agent steps while waiting. "Watsonx is coordinating the handoff between Risk and Research — they're running in parallel." |
| **Confidence prompt doesn't fire** | "Confidence routing would normally pause here for human confirmation. The extraction was high-confidence on this run." |
| **Redis connection drops** | `docker start contractiq-redis`, refresh. If > 10 seconds, switch to backup video. |
| **Live Agent Feed not updating** | Check browser console for WebSocket errors. Narrate from the pipeline step indicators instead. |

---

## One-Liners to Memorize

| Context | Line |
|---|---|
| **Opening hook** | "67% of procurement teams miss at least one auto-renewal per quarter. $135 billion a year." |
| **Product pitch** | "Six AI agents. One orchestrator. Full audit trail. Complete decision package in 90 seconds." |
| **Architecture** | "Watsonx orchestrates. Redis wires. Tavily grounds. Claude reasons." |
| **Differentiator** | "Not a chatbot. Not a search box. A procurement operating system." |
| **ROI close** | "$315,000 annual value. Under 6 weeks to payback." |
| **Guardrail line** | "Nothing external fires until the user approves." |
| **Why six agents** | "One agent per responsibility. That's what makes confidence scoring meaningful and the live feed genuinely useful." |
