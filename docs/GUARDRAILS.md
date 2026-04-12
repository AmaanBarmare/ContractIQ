# Guardrails & Human-in-the-Loop Design

Enterprise procurement teams will not adopt a system that acts autonomously without oversight. ContractIQ is designed with four layers of human control — not as a limitation, but as a core feature that makes the system trustworthy enough to deploy in production.

This document also directly addresses one of the hackathon's core judging criteria: "AI agents that produce verifiable actions within enterprise guardrails."

---

## The Four Guardrail Layers

### Layer 1 — Confidence Threshold Routing

Every agent output carries a confidence score (0.0–1.0). Watsonx Orchestrate reads this score and decides what happens next. No agent can force the workflow forward when its own confidence is low.

```
Agent produces output with confidence score
              │
    ┌─────────┴──────────┐
    │                    │
conf ≥ 0.80          conf 0.50–0.79
    │                    │
Auto-proceed         Present to user for confirmation
    │                    │
    │                conf < 0.50
    │                    │
    │              Escalate — request
    │              additional information
    ▼
Next agent in pipeline
```

**Why this matters:** If the Extraction Agent extracts a notice period at 58% confidence and the system silently uses that value, it might recommend the wrong action with 5 days less notice than reality. Confidence routing catches this before it causes a missed deadline.

**Critical fields that trigger routing:**

| Agent | Critical Fields | Proceed Threshold | Escalate Threshold |
|---|---|---|---|
| Extraction | renewal_date, notice_period, annual_value, auto_renewal, cancellation_deadline | 70% | 50% |
| Risk | overall_risk_score | 60% | 40% |
| Vendor Research | vendor_identified | 50% | 30% |
| Decision | recommendation | 80% | 50% |

---

### Layer 2 — Human Confirmation Prompts

When a critical field is between 50–79% confidence, the workflow pauses and shows the user a confirmation card. The user sees:

1. The field name and extracted value
2. The exact source text from the contract that produced the extraction
3. The confidence score
4. Two options: Confirm or Correct

```
┌─────────────────────────────────────────────────────┐
│  ⚠  Please confirm this extracted value              │
│                                                      │
│  Field: Notice Period                                │
│  Extracted Value: 60 days                           │
│  Confidence: 58%                                    │
│                                                      │
│  Source text from Zoom_MSA_2024.pdf, page 14:       │
│  "Either party may terminate this Agreement upon    │
│  sixty (60) days written notice to the other..."    │
│                                                      │
│  [✓ Confirm: 60 days]   [✗ This is incorrect]       │
└─────────────────────────────────────────────────────┘
```

If the user clicks "This is incorrect," they are shown the contract PDF at the relevant page and can enter the correct value. The corrected value is stored in Redis with `confirmed_by_user: true` and `original_extracted_value: "60 days"`.

**The rest of the workflow is not held up.** Only the specific flagged field pauses. If 37 out of 38 fields extracted at high confidence, those 37 fields are immediately available to downstream agents.

---

### Layer 3 — Artifact Approval Gate

No generated artifact is ever marked final or sent externally without explicit user approval. This is enforced by Watsonx Orchestrate as a non-bypassable step in the workflow.

**What "external" means:**
- Vendor outreach email (cannot be composed as final, cannot trigger any send action)
- Legal escalation notification (cannot be issued to the legal team)
- Security review request (cannot be issued to IT security)
- CFO summary (cannot be shared or marked as approved)

**How it works:**

```
Action Agent produces 5 artifacts
        │
All artifacts marked: "DRAFT — PENDING APPROVAL"
        │
User opens Artifact Approval UI
        │
For each artifact:
  ├── Read the artifact
  ├── Edit if needed (free-text edit in UI)
  └── Click Approve or Reject
        │
All artifacts approved → Watsonx logs to Redis audit stream
        │
Workflow marked COMPLETE
```

**What gets logged on approval:**
```json
{
  "event": "ARTIFACT_APPROVED",
  "workflow_id": "WF-2026-0411-ZM-001",
  "artifact_id": "art_vendor_email_001",
  "artifact_type": "VENDOR_OUTREACH_EMAIL",
  "approved_by": "user_abc123",
  "approval_timestamp": "2026-04-11T14:31:15Z",
  "edited_before_approval": true,
  "original_hash": "sha256:a3f9...",
  "final_hash": "sha256:b7e1..."
}
```

---

### Layer 4 — Immutable Audit Trail

Every agent action, every confidence score, every human confirmation, and every approval is written to a Redis Stream. This stream is append-only — nothing in it can be modified after it is written.

The audit trail answers:

- What did ContractIQ extract from this contract and with what confidence?
- Which fields were flagged and what did the user confirm?
- What recommendation did the Decision Agent make and why?
- Who approved which artifacts and when?
- Was the artifact edited before approval? What changed?
- What is the complete chain of events for this workflow?

**Audit log entry format:**
```json
{
  "id": "1712846401234-0",
  "workflow_id": "WF-2026-0411-ZM-001",
  "event_type": "FIELD_CONFIRMED",
  "agent": "extraction_agent",
  "field": "notice_period",
  "extracted_value": "60 days",
  "confirmed_value": "60 days",
  "confirmed_by": "user_abc123",
  "original_confidence": 0.58,
  "final_confidence": 1.0,
  "timestamp": "2026-04-11T14:30:22Z",
  "trace_id": "TRC-abc123def456"
}
```

---

## What Guardrails Prevent

| Scenario | Guardrail That Prevents It |
|---|---|
| Wrong notice period used because extraction was uncertain | Confidence routing + human confirmation prompt |
| Decision Agent makes a low-confidence recommendation that gets auto-actioned | Confidence threshold — routes to human review instead of Action Agent |
| Vendor receives an unapproved email drafted by the AI | Artifact approval gate — email cannot be finalized without user approval |
| A compliance decision is made without a record | Immutable audit log — every decision is permanently recorded |
| User approves an artifact and later denies it | Audit log records the approval with timestamp and user identity — non-repudiable |

---

## Why This Approach Wins the Hackathon

The hackathon specifically requires agents that work "within enterprise guardrails." Most hackathon submissions build guardrails as an afterthought — a note in the README saying "we could add human review."

ContractIQ has guardrails as a core architectural feature:
- Confidence routing is in the data model, not the UI
- Approval gates are enforced by Watsonx Orchestrate, not just suggested by the UI
- The audit trail is in Redis Streams, not an optional log file

This is what real enterprise governance looks like.
