# Agent 1: Ingestion & Classification Agent

**Single job:** Every document that enters ContractIQ passes through here first. Classify it, link it to the right vendor, and emit a clean document envelope for downstream agents.

---

## Responsibilities

1. Accept uploaded files (PDF, DOCX, PNG, JPG)
2. Classify the document type with a confidence score
3. Link the document to the correct vendor workspace (create vendor record if new)
4. Detect duplicates and manage contract versioning
5. Tag metadata: upload timestamp, document hash, uploader identity, source
6. Emit a structured document envelope to the Redis task queue

---

## Supported Document Types

| Type | Classifier Label | Description |
|---|---|---|
| Master Service Agreement | `MSA` | Top-level commercial agreement |
| Statement of Work | `SOW` | Project or service scope document |
| Order Form | `ORDER_FORM` | Signed purchase or subscription form |
| Pricing Sheet | `PRICING_SHEET` | Rate card or pricing exhibit |
| Amendment | `AMENDMENT` | Modification to an existing agreement |
| Data Processing Addendum | `DPA` | Data protection and privacy terms |
| Security Questionnaire | `SECURITY_QUESTIONNAIRE` | Vendor security assessment |
| SOC 2 Report Summary | `SOC2_SUMMARY` | Security compliance report |
| Renewal Notice | `RENEWAL_NOTICE` | Vendor-sent renewal communication |
| Insurance Certificate | `INSURANCE_CERT` | Vendor insurance documentation |
| Procurement Notes | `PROCUREMENT_NOTES` | Internal team notes on vendor |
| Unknown | `UNKNOWN` | Could not classify — flagged for manual review |

---

## Input

```json
{
  "workflow_id": "WF-2026-0411-ZM-001",
  "files": [
    { "file_id": "f001", "filename": "Zoom_MSA_2024.pdf", "size_bytes": 284923 },
    { "file_id": "f002", "filename": "Zoom_OrderForm_2025.pdf", "size_bytes": 91234 },
    { "file_id": "f003", "filename": "Zoom_Amendment_1.pdf", "size_bytes": 45678 },
    { "file_id": "f004", "filename": "Zoom_PricingSheet.pdf", "size_bytes": 22341 }
  ],
  "uploader_id": "user_abc123",
  "upload_timestamp": "2026-04-11T14:30:00Z"
}
```

---

## Output (Document Envelope)

```json
{
  "workflow_id": "WF-2026-0411-ZM-001",
  "vendor_id": "zoom_video_communications",
  "vendor_display_name": "Zoom Video Communications",
  "vendor_status": "existing",
  "documents": [
    {
      "file_id": "f001",
      "doc_type": "MSA",
      "doc_type_confidence": 0.97,
      "version": "v2024-01",
      "is_duplicate": false,
      "sha256": "a3f9c2..."
    },
    {
      "file_id": "f002",
      "doc_type": "ORDER_FORM",
      "doc_type_confidence": 0.95,
      "version": "v2025-01",
      "is_duplicate": false,
      "sha256": "b7e1d4..."
    },
    {
      "file_id": "f003",
      "doc_type": "AMENDMENT",
      "doc_type_confidence": 0.93,
      "version": "amendment-1",
      "is_duplicate": false,
      "sha256": "c2a8f1..."
    },
    {
      "file_id": "f004",
      "doc_type": "PRICING_SHEET",
      "doc_type_confidence": 0.91,
      "version": "v2025-pricing",
      "is_duplicate": false,
      "sha256": "d5b3e7..."
    }
  ],
  "total_documents": 4,
  "classification_complete": true,
  "confidence": 0.94,
  "agent": "ingestion_agent",
  "timestamp": "2026-04-11T14:30:08Z"
}
```

---

## Classification Logic

The agent uses a two-stage classification approach:

**Stage 1 — Filename heuristics (fast, ~80% of cases)**
Common patterns like "MSA", "Master Agreement", "Order Form", "Amendment", "DPA" in filenames allow immediate classification with high confidence.

**Stage 2 — Content classification (for ambiguous files)**
If filename confidence is below 75%, the agent extracts the first 500 words of the document and prompts Watsonx.ai:

```
You are a contract classification assistant. Based on the following document excerpt, 
classify the document type. Choose from: MSA, SOW, ORDER_FORM, PRICING_SHEET, AMENDMENT, 
DPA, SECURITY_QUESTIONNAIRE, SOC2_SUMMARY, RENEWAL_NOTICE, INSURANCE_CERT, 
PROCUREMENT_NOTES, UNKNOWN.

Return JSON: {"doc_type": "...", "confidence": 0.0-1.0, "reasoning": "..."}

Document excerpt:
{excerpt}
```

---

## Duplicate Detection

Before storing a document, the agent checks:

1. SHA-256 hash match against all existing documents for this vendor → exact duplicate
2. Fuzzy similarity of document type + date metadata → potential version conflict

If a duplicate is detected, the agent does not reject it — it stores it with `is_duplicate: true` and links it to the existing document, flagging for the user to review the version history.

---

## Redis Operations

```python
# Store document metadata
redis.hset(f"doc:{file_id}", mapping={
    "vendor_id": vendor_id,
    "doc_type": doc_type,
    "confidence": confidence,
    "sha256": sha256,
    "upload_timestamp": timestamp,
    "uploader_id": uploader_id
})

# Add to vendor's document list
redis.sadd(f"vendor:{vendor_id}:docs", file_id)

# Publish completion to agent stream
redis.xadd("agent_events", {
    "workflow_id": workflow_id,
    "source_agent": "ingestion_agent",
    "target_agent": "extraction_agent",
    "event_type": "INGESTION_COMPLETE",
    "payload": json.dumps(document_envelope),
    "confidence": str(overall_confidence)
})
```

---

## Error Handling

| Scenario | Behavior |
|---|---|
| File type not supported | Reject with clear error; suggest converting to PDF |
| Classification confidence < 50% | Classify as `UNKNOWN`, flag for manual review, still proceed |
| Vendor cannot be identified from content | Create new vendor record as `vendor_name_unknown_{hash}`, ask user to name it |
| Duplicate exact match | Store with `is_duplicate: true`, notify user, do not re-extract |
| File corrupt / unreadable | Reject immediately with error message |

---

## Communicates To

**Target:** Extraction Agent  
**Trigger:** Immediately on classification completion  
**Channel:** Redis Stream (`agent_events`)
