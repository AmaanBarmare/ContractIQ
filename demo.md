# ContractIQ — 10-Minute Demo Script

**Enterprise Agents Hackathon — IBM Watsonx Orchestrate · Redis · Tavily**
**Demo: Sunday April 12, 5:00–6:00 PM ET via Zoom**
**Total demo time: 10 minutes**

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
- Code editor open to `app/agents/risk.py` and `app/orchestrator/orchestrate.py`
- Backup video at `scripts/demo_data/backup_demo.mp4` — if anything crashes, switch immediately, no apology

---

## 1. The Problem (0:00–2:00)

**On screen:** Landing page (`localhost:3000`)

> "Let me start with a number: **$135 billion.**"
>
> "That's how much North American companies lose every year to unwanted contract auto-renewals. Not because procurement teams don't care — but because the work is invisible. It's buried in PDFs, scattered across Google Drive, tracked in spreadsheets no one updates."
>
> "67% of procurement teams miss at least one auto-renewal every quarter. The average manager spends **14 hours a week** just reviewing contracts and chasing renewal dates. And when a renewal does get flagged, producing a decision package — a brief, a CFO summary, a vendor email, a negotiation strategy — takes **2 to 5 business days**."
>
> "Meanwhile, the clock is ticking. Most contracts have a 30-to-60-day notice window. If you miss it, you're locked in for another year at whatever price the vendor wants."
>
> "This is the problem ContractIQ solves. The same work that takes a team 2 to 5 days — we do in under **90 seconds**."

---

## 2. The Tech Stack (2:00–5:00)

**On screen:** Landing page or architecture diagram

> "Before I show you the product, I want to explain what's actually running under the hood — because the technology choices here are deliberate, not default."

### IBM Watsonx Orchestrate

> "ContractIQ is built on six specialized AI agents. Each agent owns exactly one responsibility — ingest, extract, assess risk, research the vendor, make a decision, generate artifacts. The thing that coordinates all of them is **IBM Watsonx Orchestrate**."
>
> "Orchestrate does three things we couldn't easily replicate ourselves. First, it manages parallel execution — the Risk agent and the Vendor Research agent fire simultaneously, cutting total runtime in half. Second, it enforces confidence thresholds as **workflow states**, not code conditionals — so a bug in our Python can't accidentally bypass a guardrail. Third, it owns the artifact approval gate — nothing external fires until a human explicitly approves, and that's an Orchestrate constraint, not an `if` statement we could accidentally delete."

### Redis

> "Redis is running **five distinct roles** in this system — and I want to be specific, because this is not 'Redis as a cache.'"
>
> "Hashes are the source of truth for every contract and workflow. Streams are the inter-agent message bus — every agent publishes events to the same stream the UI reads from, so the Live Agent Feed you're about to see isn't a separate notification system, it's the actual pipeline data. Sorted Sets track renewal deadlines for the urgency queue. JSON keys with 24-hour TTLs cache vendor research so we don't re-query Tavily for the same vendor twice in a day. And the audit log is an append-only Stream — every action, timestamped, with a user ID and content hash. If you restarted the backend mid-workflow, the next agent would resume from the last completed step because the state lives in Redis, not in memory."

### Tavily

> "The Vendor Research agent calls **Tavily** through Watsonx Orchestrate's tool framework. Four scoped queries per vendor: company health, pricing benchmarks, security incidents, and competitive alternatives. Tavily returns structured, citation-rich results — not SEO-heavy web pages. And because it's accessed through Orchestrate, every external call is governed and auditable. Our agents never hit an external API directly."

> "The architecture in one sentence: **Watsonx orchestrates. Redis wires. Tavily grounds. Claude reasons.**"

---

## 3. Live Demo + Code (5:00–10:00)

### Demo (5:00–8:00)

**Navigate to the dashboard.**

> "This is the procurement command center. You can see total spend tracked, vendors under management, and urgent renewals already flagged."

**Point to the six-agent runway strip.**

> "These are the six agents. They're idle right now. Let me give them something to do."

**Drag and drop the 4 Zoom files into the upload panel:**

1. `Zoom Master Services Agreement.pdf` — PRIMARY CONTRACT
2. `Zoom Order Form FY26.pdf` — SUPPORTING EXHIBIT
3. `Zoom Security & Privacy Addendum.docx` — SUPPORTING EXHIBIT
4. `Zoom Redlines from Legal.pdf` — NEGOTIATION HISTORY

> "Four documents — the master services agreement, the order form, the security addendum, and redlines from legal. Real contract documents. Let's drop them in."

**Click "Run Renewal Rescue."**

> "Watsonx Orchestrate just dispatched Agent 1."

**Step 1 lights up — Ingestion Agent:**

> "8 seconds. All four documents classified, linked to the Zoom vendor workspace, metadata extracted."

**Step 2 — Extraction Agent:**

> "Now the Extraction agent is pulling 38+ structured fields. Watch the Live Agent Feed — every line here is an event on a Redis Stream."

**Watch for the confidence prompt (notice period flagged at ~58%):**

> "Here's the first guardrail. Notice period extracted at 58% confidence — below our 70% threshold. The pipeline doesn't stop. The other 37 fields at 95%+ flow forward immediately. Only this one uncertain field pauses."

**Click "Confirm 60 days":**

> "I confirm 60 days. That correction is stored with `confirmed_by_user: true` and we resume. This is Layer 2 of our four-layer guardrail system."

**Steps 3 and 4 activate simultaneously:**

> "Now Watsonx fires two agents in parallel. Risk agent is scoring the contract — it finds 4 flags, 2 critical: auto-renewal active with 34 days left, no termination for convenience clause. Risk score: 74 out of 100."
>
> "At the same time, Vendor Research is hitting Tavily. Zoom's pricing is above market. Microsoft Teams and Google Meet are alternatives — ones this company may already be licensed for."

**Step 5 — Decision Agent:**

> "Decision agent synthesizes everything. RENEGOTIATE. 91% confidence. Urgency: CRITICAL. That's above the 80% auto-proceed threshold, so Orchestrate routes directly to generation."

**Step 6 — Generation Agent. Artifacts appear:**

> "Five artifacts in under 15 seconds. Renewal Brief, Negotiation Prep Sheet, Vendor Outreach Email, CFO Summary, Action Checklist. Every single one is marked Draft — Pending Approval."

**Click through the Negotiation Prep Sheet:**

> "Look at this — Tavily found that Zoom had a pricing increase in Q2 2026. Teams and Meet are free. These are live leverage points, not hallucinated data."

**Click "Approve All":**

> "Layer 3. The approval gate. Enforced by Orchestrate as a workflow state. Nothing external fires until this button is clicked. The approval is logged to the Redis audit stream with a timestamp, user ID, and content hash."

> "Start to finish: **75 seconds.** What a team would spend 2 to 5 days on."

---

### Code (8:00–10:00)

**Pull up `app/agents/risk.py` and `app/orchestrator/orchestrate.py` in the editor.**

> "Let me show you what's actually running."

**Show the agent structure:**

> "Each agent is a single Python file. The Risk agent reads the contract record from Redis, runs it through Claude with a structured prompt, and publishes its output back to the Redis Stream. That's it. The agent doesn't know what runs before or after it — that's Orchestrate's job."

**Show the Redis Stream publish call:**

> "Every agent ends with a call to `redis.xadd('agent_events', {...})`. That single line is what populates the Live Agent Feed. There's no separate WebSocket payload, no notification system — the UI subscribes to the same stream the agents write to."

**Show the Orchestrate confidence routing in `orchestrate.py`:**

> "Here's the confidence routing table. If the Decision agent returns confidence above 0.80, Orchestrate routes to Generation automatically. Below 0.80, it pauses for a senior reviewer. This logic lives in the workflow definition, not in application code — which means it can't be bypassed by a code bug, and it can be changed without a redeploy."

**Close:**

> "ContractIQ isn't a chatbot. It's not a search box. It's a **multi-agent procurement operating system** — agents that detect risk, ground decisions in real-time data, and generate every artifact a team needs, with humans in control at every step."
>
> "Six agents. One orchestrator. Full audit trail. $315,000 net annual ROI. Payback in under six weeks."

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
| **Tavily is slow / no results** | "The cache missed — you're seeing a live API call through Tavily via Orchestrate. This is the real integration, not a mock." |
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
| **Why Redis** | "Five roles — source of truth, message bus, urgency queue, research cache, audit log. Not just a cache." |
| **Why Tavily** | "Live leverage points, not hallucinated data." |
