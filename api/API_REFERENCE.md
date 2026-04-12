# API Reference

FastAPI backend endpoint reference for ContractIQ.

**Base URL:** `http://localhost:8000` (development)  
**Content-Type:** `application/json`  
**Implementation:** All endpoints are live in `app/routers/`. Start with `uvicorn app.main:app --reload --port 8000`.

### Health Check

```
GET /health
```

Returns `{"status": "ok", "service": "contractiq"}`.

---

## Workflows

### Start a Workflow

```
POST /api/workflows
```

Creates a new workflow session. Returns a `workflow_id` used for all subsequent calls.

No request body required — workflow is created and documents are uploaded separately.

**Response:**
```json
{
  "workflow_id": "WF-a1b2c3d4",
  "status": "CREATED"
}
```

---

### Get Workflow Status

```
GET /api/workflows/{workflow_id}
```

Returns the Redis hash for the workflow. Fields are stored as key-value pairs.

**Response:**
```json
{
  "workflow_id": "WF-a1b2c3d4",
  "status": "PENDING_APPROVAL",
  "current_agent": "generation_agent",
  "document_count": "4",
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
  "workflow_id": "WF-a1b2c3d4",
  "documents_uploaded": 4,
  "status": "PROCESSING"
}
```

The full agent pipeline runs in the background. Connect to `/ws/agent-feed/{workflow_id}` for real-time progress updates.

---

## Contract Records

### Get Contract Record

```
GET /api/contracts/{workflow_id}
```

Returns the full extracted contract data for a workflow. The data is the serialized `ContractRecord` Pydantic model with per-field confidence scores.

**Response:**
```json
{
  "vendor_name": { "value": "Zoom Video Communications", "confidence": 0.97 },
  "annual_value": { "value": "$84,000", "confidence": 0.96 },
  "renewal_date": { "value": "2026-08-15", "confidence": 0.97 },
  "notice_period": { "value": "60 days", "confidence": 0.58 },
  "auto_renewal": { "value": "Yes", "confidence": 0.99 },
  "overall_confidence": 0.91,
  "flagged_fields": ["notice_period"]
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
  "workflow_id": "WF-a1b2c3d4",
  "artifacts": [
    {
      "artifact_id": "a1b2c3d4e5f6",
      "artifact_type": "EXECUTIVE_SUMMARY",
      "title": "Executive Summary — Zoom Video Communications Contract Review",
      "content": "...",
      "approval_status": "DRAFT_PENDING_APPROVAL",
      "approved_by": null,
      "approved_at": null
    }
  ]
}
```

Artifact types: `EXECUTIVE_SUMMARY`, `RISK_SUMMARY`, `RENEGOTIATION_BRIEF`, `COST_COMPARISON`, `CANCELLATION_LETTER`.

---

### Approve Single Artifact

```
POST /api/workflows/{workflow_id}/artifacts/{artifact_id}/approve?user=demo_user
```

**Response:**
```json
{
  "status": "APPROVED",
  "artifact_id": "a1b2c3d4e5f6"
}
```

---

### Approve All Artifacts (Complete Workflow)

```
POST /api/workflows/{workflow_id}/approve?user=demo_user
```

Approves all artifacts and marks the workflow as COMPLETED.

**Response:**
```json
{
  "status": "APPROVED",
  "workflow_id": "WF-a1b2c3d4"
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
  "question": "What is the notice period and auto-renewal status?",
  "workflow_id": "WF-a1b2c3d4"
}
```

**Response:**
```json
{
  "question": "What is the notice period and auto-renewal status?",
  "answer": "Based on the contract data, the notice period is 60 days and auto-renewal is enabled...",
  "workflow_id": "WF-a1b2c3d4"
}
```

---

## Spend Intelligence

### Get Portfolio Summary

```
GET /api/spend/summary
```

Scans all `contract:*` keys in Redis and aggregates spend data.

**Response:**
```json
{
  "total_annual_spend": 168000.0,
  "vendor_count": 2,
  "vendors": [
    {
      "vendor": "Zoom Video Communications",
      "annual_value": 84000.0,
      "workflow_id": "WF-a1b2c3d4"
    }
  ]
}
```

---

## Renewal Command Center

### Get Urgent Renewals

```
GET /api/renewals/urgent?max_days=90
```

Returns vendors with renewal deadlines within max_days, sorted by urgency. Reads from the `renewals_by_deadline` Redis Sorted Set.

**Response:**
```json
{
  "urgent_renewals": [
    {
      "vendor_id": "zoom_video_communications",
      "days_until_deadline": 5
    }
  ],
  "count": 1
}
```

---

## WebSocket: Live Agent Feed

```
WS /ws/agent-feed/{workflow_id}
```

Subscribe to real-time agent events for a workflow. Receives a message for every agent action.

Events are filtered by `workflow_id` server-side. The WebSocket closes automatically when the workflow reaches `WORKFLOW_APPROVED` or `WORKFLOW_FAILED`.

**Message format:**
```json
{
  "event_id": "1712846477000-0",
  "workflow_id": "WF-a1b2c3d4",
  "source_agent": "extraction_agent",
  "event_type": "EXTRACTION_COMPLETE",
  "payload": {
    "overall_confidence": 0.91,
    "flagged_fields": ["notice_period"]
  },
  "timestamp": "2026-04-11T14:30:24Z"
}
```

**Event types:**
- `WORKFLOW_CREATED` — workflow initialized
- `INGESTION_COMPLETE` — Agent 1 finished
- `EXTRACTION_COMPLETE` — Agent 2 finished
- `RISK_COMPLETE` — Agent 3 finished
- `RESEARCH_COMPLETE` / `RESEARCH_SKIPPED` — Agent 4 finished or unavailable
- `DECISION_COMPLETE` — Agent 5 finished
- `GENERATION_COMPLETE` — Agent 6 finished
- `AWAITING_APPROVAL` — all artifacts ready for review
- `WORKFLOW_APPROVED` — user approved, workflow complete
- `WORKFLOW_FAILED` — an agent failed; see `payload.error`
