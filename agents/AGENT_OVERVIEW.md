# Agent Overview

ContractIQ uses six specialized agents, each with a single clearly defined responsibility. IBM Watsonx Orchestrate coordinates all of them.

---

## Why Six Agents Instead of One

A single "do everything" agent would be:
- Harder to debug (failure anywhere is failure everywhere)
- Harder to test (you can't isolate one capability)
- Impossible to parallelize (Risk and Research need to run simultaneously)
- Opaque to users (the Live Agent Feed would show nothing meaningful)
- Less trustworthy (no separation between extraction and decision)

Six specialized agents let each one be independently tested, independently confident-scored, and independently routed. They also make the Live Agent Feed genuinely informative — users can see exactly which agent is working, what it received, and what it produced.

---

## Agent Roster

| # | Agent | Single Job | Input | Output |
|---|---|---|---|---|
| 1 | Ingestion & Classification | Classify documents and link to vendor | Raw uploaded files | Document envelope with metadata |
| 2 | Extraction | Parse contracts into structured records | Classified documents | Normalized contract record (40+ fields) |
| 3 | Risk & Compliance | Identify risk across 4 dimensions | Contract record | Risk flags, score, escalation routing |
| 4 | Vendor Research | Pull real-time external intel via Tavily | Vendor name + category | Vendor intelligence object |
| 5 | Decision | Synthesize everything into one recommendation | Risk flags + vendor intel + spend data | Structured recommendation |
| 6 | Action & Generation | Generate all stakeholder artifacts | Decision package | Draft artifacts (renewal brief, email, CFO summary, etc.) |

---

## Execution Sequence

```
User Intent / Upload Event
        │
        ▼
IBM Watsonx Orchestrate creates workflow_id, initializes Redis state
        │
        ▼
Agent 1: Ingestion & Classification
        │
        ▼
Agent 2: Extraction
        │ ← confidence routing check
        │   below 70% → human review queue → user confirms → resume
        │
        ├──────────────────────────────────┐
        ▼                                  ▼
Agent 3: Risk & Compliance         Agent 4: Vendor Research
(reads Redis contract record)      (calls Tavily API)
        │                                  │
        └──────────────┬───────────────────┘
                       ▼
              Agent 5: Decision
                       │ ← confidence routing check
                       │   below 80% → human review queue
                       │
              IBM Watsonx Orchestrate: approval gate
                       │ ← no external action without user approval
                       ▼
              Agent 6: Action & Generation
                       │
              User reviews and approves artifacts
                       │
              Watsonx logs to Redis audit stream
              Workflow marked COMPLETE
```

---

## Message Envelope

Every inter-agent message published to Redis Streams uses this structure:

```json
{
  "workflow_id": "WF-2026-0411-ZM-001",
  "source_agent": "extraction_agent",
  "target_agent": "risk_agent",
  "event_type": "EXTRACTION_COMPLETE",
  "payload": {
    "vendor_id": "zoom",
    "contract_record": { ... },
    "missing_fields": ["renewal_owner"],
    "flagged_fields": {
      "notice_period": { "value": "60 days", "confidence": 0.58 }
    }
  },
  "confidence": 0.94,
  "timestamp": "2026-04-11T14:32:01Z",
  "trace_id": "TRC-abc123def456"
}
```

The `trace_id` is the same across every message in a workflow. The Live Agent Feed uses it to group all messages for a single contract review session.

---

## Confidence Threshold Reference

| Agent | Critical Fields | Threshold to Auto-Proceed | Threshold to Escalate |
|---|---|---|---|
| Extraction | renewal_date, notice_period, annual_value, auto_renewal | 70% | < 50% |
| Risk | overall_risk_score | 60% | < 40% |
| Vendor Research | vendor_identified, pricing_data_found | 50% | < 30% |
| Decision | recommendation | 80% | < 50% |

---

## Detailed Agent Docs

- [Agent 1: Ingestion & Classification](agent_1_ingestion.md)
- [Agent 2: Extraction](agent_2_extraction.md)
- [Agent 3: Risk & Compliance](agent_3_risk.md)
- [Agent 4: Vendor Research](agent_4_research.md)
- [Agent 5: Decision](agent_5_decision.md)
- [Agent 6: Action & Generation](agent_6_action.md)
