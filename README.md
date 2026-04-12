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
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Fill in: ORCHESTRATE_API_KEY, ORCHESTRATE_INSTANCE_URL,
#         ANTHROPIC_API_KEY, REDIS_URL, SECRET_KEY

# Start Redis (local)
docker run -d -p 6379:6379 redis/redis-stack

# Run the pipeline end-to-end on the Zoom sample
python scripts/run_pipeline.py
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
│   ├── spend_optimization.md    ← Spend analysis workflow
│   └── executive_reporting.md  ← CFO/VP reporting workflow
│
├── modules/
│   ├── ingestion_layer.md       ← Document ingestion specs
│   ├── knowledge_layer.md       ← Contract Q&A and search
│   ├── extraction_engine.md     ← Structured extraction field reference
│   ├── risk_engine.md           ← Risk detection categories and scoring
│   ├── spend_intelligence.md    ← Spend analytics
│   ├── renewal_command_center.md← Renewal dashboard
│   └── live_agent_feed.md       ← Real-time agent activity UI
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
