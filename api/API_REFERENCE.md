# API Reference

FastAPI backend endpoint reference for ContractIQ.

**Base URL:** `http://localhost:8000` (development)  
**Content-Type:** `application/json`  
**Auth:** `Authorization: Bearer {session_token}` (simplified for hackathon demo)

---

## Workflows

### Start a Workflow

```
POST /api/workflows
```

Creates a new workflow session. Returns a `workflow_id` used for all subsequent calls.

**Request:**
```json
{
  "workflow_type": "RENEWAL_RESCUE | NEW_VENDOR_REVIEW | SPEND_OPTIMIZATION | EXECUTIVE_REPORT",
  "vendor_name": "Zoom Video Communications",
  "triggered_by": "MANUAL | AUTO_RENEWAL_ALERT | SCHEDULED"
}
```

**Response:**
```json
{
  "workflow_id": "WF-2026-0411-ZM-001",
  "status": "INITIATED",
  "created_at": "2026-04-11T14:30:00Z"
}
```

---

### Get Workflow Status

```
GET /api/workflows/{workflow_id}
```

**Response:**
```json
{
  "workflow_id": "WF-2026-0411-ZM-001",
  "status": "ARTIFACTS_DRAFTED",
  "vendor_id": "zoom_video_communications",
  "current_agent": "action_agent",
  "steps_completed": ["ingestion", "extraction", "risk", "vendor_research", "decision"],
  "steps_pending": ["approval"],
  "flagged_fields": {
    "notice_period": { "value": "60 days", "confidence": 0.58, "confirmed": false }
  },
  "created_at": "2026-04-11T14:30:00Z",
  "updated_at": "2026-04-11T14:30:52Z"
}
```

---

## Documents

### Upload Documents

```
POST /api/workflows/{workflow_id}/documents
Content-Type: multipart/form-data
```

**Request:**
```
files: [file1.pdf, file2.pdf, ...]  (multipart)
```

**Response:**
```json
{
  "workflow_id": "WF-2026-0411-ZM-001",
  "uploaded": [
    { "file_id": "f001", "filename": "Zoom_MSA_2024.pdf", "status": "QUEUED" },
    { "file_id": "f002", "filename": "Zoom_OrderForm.pdf", "status": "QUEUED" }
  ],
  "message": "Documents queued for ingestion. Connect to /ws/agent-feed/{workflow_id} for real-time updates."
}
```

---

## Contract Records

### Get Contract Record

```
GET /api/contracts/{vendor_id}
```

Returns the full extracted contract record for a vendor.

**Response:**
```json
{
  "vendor_id": "zoom_video_communications",
  "vendor_name": "Zoom Video Communications",
  "extraction_status": "COMPLETE",
  "overall_confidence": 0.91,
  "contract_record": {
    "annual_value": { "value": "$84,000", "confidence": 0.96 },
    "renewal_date": { "value": "2026-08-15", "confidence": 0.97 },
    "notice_period": { "value": "60 days", "confidence": 0.58, "confirmed": true },
    "auto_renewal": { "value": "Yes", "confidence": 0.99 }
  },
  "missing_fields": ["renewal_owner", "iso_27001"],
  "last_updated": "2026-04-11T14:30:24Z"
}
```

---

## Human Review

### Confirm a Flagged Field

```
POST /api/workflows/{workflow_id}/confirm-field
```

Called when a user confirms or corrects a low-confidence extracted field.

**Request:**
```json
{
  "field": "notice_period",
  "confirmed_value": "60 days",
  "action": "CONFIRM | CORRECT",
  "corrected_value": null
}
```

**Response:**
```json
{
  "workflow_id": "WF-2026-0411-ZM-001",
  "field": "notice_period",
  "confirmed": true,
  "confirmed_value": "60 days",
  "workflow_resumed": true
}
```

---

## Risk

### Get Risk Report

```
GET /api/workflows/{workflow_id}/risk
```

**Response:**
```json
{
  "workflow_id": "WF-2026-0411-ZM-001",
  "overall_risk_score": 74,
  "risk_level": "HIGH",
  "category_scores": {
    "renewal": 80,
    "commercial": 65,
    "legal": 55,
    "security": 40
  },
  "flags": [
    {
      "id": "flag_001",
      "category": "renewal",
      "severity": "Critical",
      "signal": "Cancellation deadline in 34 days",
      "color": "RED"
    }
  ]
}
```

---

## Decision

### Get Decision

```
GET /api/workflows/{workflow_id}/decision
```

**Response:**
```json
{
  "workflow_id": "WF-2026-0411-ZM-001",
  "recommendation": "RENEGOTIATE",
  "confidence": 0.91,
  "urgency": "CRITICAL",
  "days_to_act": 34,
  "primary_reason": "Auto-renewal + above-market pricing + imminent deadline",
  "reasoning": ["...", "..."],
  "potential_savings": "$9,360–$15,660 annually"
}
```

---

## Artifacts

### Get Artifacts

```
GET /api/workflows/{workflow_id}/artifacts
```

Returns all generated artifacts with their current approval status.

**Response:**
```json
{
  "workflow_id": "WF-2026-0411-ZM-001",
  "artifacts": [
    {
      "id": "art_001",
      "type": "RENEWAL_BRIEF",
      "title": "Vendor Renewal Brief: Zoom Video Communications",
      "status": "DRAFT_PENDING_APPROVAL",
      "content": "...",
      "created_at": "2026-04-11T14:30:45Z"
    },
    {
      "id": "art_002",
      "type": "NEGOTIATION_PREP",
      "title": "Negotiation Preparation: Zoom Video Communications",
      "status": "DRAFT_PENDING_APPROVAL",
      "content": "...",
      "created_at": "2026-04-11T14:30:47Z"
    }
  ]
}
```

---

### Approve Artifacts

```
POST /api/workflows/{workflow_id}/approve
```

**Request:**
```json
{
  "approved_artifact_ids": ["art_001", "art_002", "art_003", "art_004", "art_005"],
  "edits": {
    "art_003": "Hi Sarah,\n\nI wanted to reach out..."
  }
}
```

**Response:**
```json
{
  "workflow_id": "WF-2026-0411-ZM-001",
  "status": "COMPLETE",
  "approved_count": 5,
  "approval_timestamp": "2026-04-11T14:31:17Z",
  "audit_log_id": "audit_stream_1712846477000-0"
}
```

---

## Contract Q&A

### Ask a Question

```
POST /api/qa
```

**Request:**
```json
{
  "question": "Which contracts have auto-renewal with a notice period under 45 days?",
  "scope": "ALL | vendor:{vendor_id}"
}
```

**Response:**
```json
{
  "question": "Which contracts have auto-renewal with a notice period under 45 days?",
  "answer": "3 contracts: HubSpot (30 days, renews Aug 1), Figma (30 days, renews Sep 15), Loom (notice period unclear — flagged)",
  "supporting_evidence": [
    { "vendor": "HubSpot", "clause": "...automatic renewal unless 30 days notice...", "relevance": "Confirms auto-renewal with 30-day notice" }
  ],
  "confidence": 0.89,
  "recommended_action": "Open Renewal Rescue for HubSpot — renewal is 22 days away",
  "caveats": "Loom notice period was not found in uploaded documents."
}
```

---

## Spend Intelligence

### Get Portfolio Summary

```
GET /api/spend/summary
```

**Response:**
```json
{
  "total_annual_spend": 2340000,
  "currency": "USD",
  "contract_count": 287,
  "spend_by_category": {
    "Communication & Collaboration": 320000,
    "Cloud Infrastructure": 580000,
    "Sales & CRM": 410000,
    "Security": 190000,
    "Other": 840000
  },
  "renewal_pipeline": {
    "Q3_2026": 487000,
    "Q4_2026": 312000
  },
  "top_vendors": [
    { "vendor": "AWS", "annual_spend": 580000 },
    { "vendor": "Salesforce", "annual_spend": 210000 }
  ]
}
```

---

## Renewal Command Center

### Get Urgent Renewals

```
GET /api/renewals/urgent?days=90
```

Returns contracts with cancellation deadlines within the specified number of days, ordered by urgency.

**Response:**
```json
{
  "renewals": [
    {
      "vendor_id": "zoom_video_communications",
      "vendor_name": "Zoom Video Communications",
      "annual_value": 84000,
      "cancellation_deadline": "2026-06-15",
      "days_until_deadline": 34,
      "urgency": "CRITICAL",
      "auto_renewal": true,
      "renewal_owner": null,
      "risk_score": 74,
      "status": "IN_PROGRESS"
    }
  ],
  "total_spend_at_risk": 487000,
  "critical_count": 3,
  "high_count": 8
}
```

---

## WebSocket: Live Agent Feed

```
WS /ws/agent-feed/{workflow_id}
```

Subscribe to real-time agent events for a workflow. Receives a message for every agent action.

**Message format:**
```json
{
  "workflow_id": "WF-2026-0411-ZM-001",
  "event_type": "AGENT_ACTION",
  "source_agent": "extraction_agent",
  "message": "Extracted 38 fields from 4 documents — confidence 0.91",
  "data": {
    "fields_extracted": 38,
    "flagged_fields": ["notice_period"],
    "confidence": 0.91
  },
  "timestamp": "2026-04-11T14:30:24Z",
  "trace_id": "TRC-abc123def456"
}
```

**Event types:**
- `WORKFLOW_STARTED`
- `AGENT_STARTED` — agent begins processing
- `AGENT_ACTION` — agent produces an intermediate result
- `AGENT_COMPLETE` — agent finishes and publishes to next agent
- `HUMAN_REVIEW_REQUIRED` — confidence threshold triggered, user input needed
- `HUMAN_CONFIRMED` — user confirmed or corrected a field
- `ARTIFACTS_READY` — all artifacts generated, awaiting approval
- `WORKFLOW_COMPLETE` — user approved, workflow closed
- `WORKFLOW_ERROR` — an agent failed; see `data.error`
