# Workflow Overview

ContractIQ supports five end-to-end workflows. Each one runs through the full multi-agent pipeline but with different entry points, priorities, and output focuses.

---

## Workflow Roster

| Workflow | Entry Point | Primary Output | Flagship Use |
|---|---|---|---|
| [Renewal Rescue](renewal_rescue.md) | Renewal alert or manual trigger | Decision package + all stakeholder artifacts | ✅ Demo workflow |
| [Contract Q&A](contract_qa.md) | Natural language question | Direct answer with clause citations + recommended action | — |
| [New Vendor Review](new_vendor_review.md) | New contract uploaded | Approval recommendation + follow-up item list | — |
| [Spend Optimization](spend_optimization.md) | Manager request or scheduled | Prioritized savings opportunity list | — |
| [Executive Reporting](executive_reporting.md) | CFO / VP request | Board-ready portfolio summary | — |

---

## Common Principles Across All Workflows

**1. Everything flows through Watsonx Orchestrate.**  
No workflow bypasses the orchestrator. Orchestrate manages state, routes agents, enforces confidence thresholds, and controls the human approval gate.

**2. All state lives in Redis.**  
A workflow can be paused mid-run (e.g. waiting for human confirmation), and the full state is preserved. If the server restarts, workflows resume from where they stopped.

**3. Nothing external happens without approval.**  
No email is drafted as final. No escalation is sent. No decision is logged as confirmed until a human explicitly approves it in the UI.

**4. The Live Agent Feed shows all workflows.**  
Every workflow produces a stream of agent events visible in the UI. Users always know what's happening and why.

**5. Confidence thresholds are consistent across workflows.**  
The same routing logic applies regardless of which workflow triggered the agent pipeline.

---

## Workflow State Lifecycle

All workflows pass through the same state machine:

```
INITIATED
    │
INGESTED          (Ingestion Agent complete)
    │
EXTRACTED         (Extraction Agent complete)
    │                ↓ if low confidence on critical field
    │           HUMAN_REVIEW_REQUIRED
    │                ↓ user confirms
    │
ANALYZED          (Risk Agent + Vendor Research Agent complete)
    │
DECISION_READY    (Decision Agent complete)
    │                ↓ if low confidence
    │           HUMAN_REVIEW_REQUIRED
    │                ↓ user confirms
    │
ARTIFACTS_DRAFTED (Action Agent complete — all artifacts in Draft status)
    │
PENDING_APPROVAL  (Waiting for user to review and approve artifacts)
    │
APPROVED          (User approved — audit log written)
    │
COMPLETE          (Workflow closed — Renewal Command Center updated)
```

Any workflow can also reach:
- `ESCALATED` — routed to Legal, Security, or Finance for additional review
- `BLOCKED` — missing critical documents; user must upload before workflow can continue
- `CANCELLED` — user abandoned the workflow

---

## Detailed Workflow Docs

- [Renewal Rescue](renewal_rescue.md) — full step-by-step demo flow
- [Contract Q&A](contract_qa.md)
- [New Vendor Review](new_vendor_review.md)
- [Spend Optimization](spend_optimization.md)
- [Executive Reporting](executive_reporting.md)
