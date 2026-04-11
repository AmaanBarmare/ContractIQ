# Agent 2: Extraction Agent

**Single job:** Convert all documents associated with a vendor into one normalized, structured contract record. Every field gets a confidence score. Every critical field below threshold gets flagged for human confirmation.

---

## Responsibilities

1. Receive the document envelope from the Ingestion Agent
2. Parse all associated documents into clean text using PyMuPDF / LlamaParse
3. Extract 40+ structured fields from the combined document set
4. Assign a confidence score (0–100%) to every field
5. Flag any critical field below the 70% confidence threshold
6. Store the completed contract record in Redis
7. Publish completion event with flagged fields highlighted

---

## Extraction Field Reference

### Commercial Fields

| Field | Key | Example Value |
|---|---|---|
| Annual contract value | `annual_value` | `$84,000` |
| Monthly contract value | `monthly_value` | `$7,000` |
| Pricing model | `pricing_model` | `Per-seat, annual` |
| Seat count | `seat_count` | `180` |
| Unit rate | `unit_rate` | `$467/seat/year` |
| Minimum commitment | `min_commitment` | `150 seats` |
| Billing frequency | `billing_frequency` | `Annual, paid upfront` |
| Payment terms | `payment_terms` | `Net 30` |
| Currency | `currency` | `USD` |
| Price escalator / uplift | `price_uplift` | `5% annually` |
| Discounts | `discounts` | `10% multi-year` |
| Trial period | `trial_period` | `None` |

### Timeline Fields

| Field | Key | Example Value |
|---|---|---|
| Effective date | `effective_date` | `2024-08-15` |
| Initial term | `initial_term` | `24 months` |
| Renewal date | `renewal_date` | `2026-08-15` |
| Renewal frequency | `renewal_frequency` | `Annual` |
| Cancellation / action deadline | `cancellation_deadline` | `2026-06-15` |
| Notice period | `notice_period` | `60 days` |
| Termination rights | `termination_rights` | `For cause only, 30-day cure` |
| Expiration date | `expiration_date` | `2026-08-15` |

### Legal Fields

| Field | Key | Example Value |
|---|---|---|
| Governing law | `governing_law` | `California` |
| Liability cap | `liability_cap` | `12 months of fees paid` |
| Indemnity terms | `indemnity_terms` | `Mutual, limited to direct damages` |
| Auto-renewal clause | `auto_renewal` | `Yes` |
| Termination for convenience | `termination_for_convenience` | `No` |
| Termination for cause | `termination_for_cause` | `Yes, 30-day cure period` |
| DPA present | `dpa_present` | `Yes — Exhibit B` |
| Confidentiality provisions | `confidentiality` | `Standard NDA terms` |
| Assignment language | `assignment` | `Consent required` |
| Notice clause | `notice_clause` | `Written notice to legal@zoom.us` |

### Security / Compliance Fields

| Field | Key | Example Value |
|---|---|---|
| SOC 2 Type II | `soc2_type2` | `Referenced, not attached` |
| ISO 27001 | `iso_27001` | `Not mentioned` |
| Breach notification SLA | `breach_notification_sla` | `72 hours` |
| Subprocessor disclosure | `subprocessor_disclosure` | `List available at zoom.us/legal` |
| Data retention terms | `data_retention` | `90 days post-termination` |
| SSO / SAML support | `sso_saml` | `Yes` |
| Audit rights | `audit_rights` | `Yes, 30-day notice` |
| Data residency | `data_residency` | `US and EU available` |

### Operational Fields

| Field | Key | Example Value |
|---|---|---|
| Support SLA | `support_sla` | `Business hours, 8-hour response` |
| Service credits | `service_credits` | `10% monthly fee per SLA breach` |
| Implementation timeline | `implementation_timeline` | `N/A (existing deployment)` |
| Renewal owner | `renewal_owner` | `[NOT ASSIGNED — FLAGGED]` |
| Business criticality | `business_criticality` | `High` |

---

## Extraction Prompt Structure

The agent uses a structured extraction prompt against the full combined document text:

```
You are a contract data extraction specialist. Extract the following fields from the 
contract documents provided. For each field, return the value as found in the document 
and a confidence score between 0.0 and 1.0 indicating your certainty.

If a field is not present or cannot be determined, return null for the value and 0.0 
for confidence. Do not infer or guess values — only extract what is explicitly stated.

Return valid JSON matching this schema exactly:
{
  "annual_value": { "value": "...", "confidence": 0.0, "source_text": "..." },
  "renewal_date": { "value": "...", "confidence": 0.0, "source_text": "..." },
  ...
}

Contract documents:
{combined_document_text}
```

The `source_text` field captures the exact clause or sentence the value was extracted from — this is used for clause citations in the Knowledge Layer and for human confirmation prompts.

---

## Confidence Routing

After extraction, each field's confidence is evaluated:

```python
CRITICAL_FIELDS = ["renewal_date", "notice_period", "annual_value", "auto_renewal", "cancellation_deadline"]
THRESHOLD_PROCEED = 0.70
THRESHOLD_ESCALATE = 0.50

flagged_fields = {}
for field in CRITICAL_FIELDS:
    conf = extracted[field]["confidence"]
    if conf < THRESHOLD_ESCALATE:
        flagged_fields[field] = {"status": "ESCALATE", "confidence": conf}
    elif conf < THRESHOLD_PROCEED:
        flagged_fields[field] = {"status": "NEEDS_CONFIRMATION", "confidence": conf}
```

Flagged fields are included in the output payload. Watsonx Orchestrate reads the flags and presents confirmation prompts to the user before allowing downstream agents to proceed with those specific values.

**The rest of the contract record is not held up.** If `notice_period` is at 58% but all other fields are above 80%, Risk and Research agents receive the partial record and proceed — only the `notice_period` field is marked as `UNCONFIRMED` in their payloads.

---

## Output (Contract Record)

```json
{
  "workflow_id": "WF-2026-0411-ZM-001",
  "vendor_id": "zoom_video_communications",
  "extraction_complete": true,
  "overall_confidence": 0.91,
  "flagged_fields": {
    "notice_period": {
      "value": "60 days",
      "confidence": 0.58,
      "source_text": "Either party may terminate this Agreement upon sixty (60) days written notice...",
      "status": "NEEDS_CONFIRMATION"
    }
  },
  "contract_record": {
    "annual_value": { "value": "$84,000", "confidence": 0.96 },
    "renewal_date": { "value": "2026-08-15", "confidence": 0.97 },
    "notice_period": { "value": "60 days", "confidence": 0.58, "confirmed": false },
    "auto_renewal": { "value": "Yes", "confidence": 0.99 },
    "cancellation_deadline": { "value": "2026-06-15", "confidence": 0.97 },
    "pricing_model": { "value": "Per-seat, annual", "confidence": 0.95 },
    "seat_count": { "value": "180", "confidence": 0.94 },
    "termination_for_convenience": { "value": "No", "confidence": 0.88 },
    "liability_cap": { "value": "12 months of fees paid", "confidence": 0.91 },
    "dpa_present": { "value": "Yes — Exhibit B", "confidence": 0.99 },
    "governing_law": { "value": "California", "confidence": 0.99 },
    "renewal_owner": { "value": null, "confidence": 1.0 }
  },
  "missing_fields": ["renewal_owner", "iso_27001", "trial_period"],
  "agent": "extraction_agent",
  "timestamp": "2026-04-11T14:30:24Z"
}
```

---

## Redis Operations

```python
# Store full contract record as Redis Hash
redis.hset(f"contract:{workflow_id}", mapping={
    field: json.dumps({"value": data["value"], "confidence": data["confidence"]})
    for field, data in contract_record.items()
})

# Store text chunks as vectors for semantic search
for chunk in document_chunks:
    embedding = watsonx_embeddings.embed(chunk["text"])
    redis.hset(f"chunk:{chunk_id}", mapping={
        "text": chunk["text"],
        "vendor_id": vendor_id,
        "workflow_id": workflow_id,
        "embedding": np.array(embedding, dtype=np.float32).tobytes()
    })

# Update renewal deadline tracker
days_until = (renewal_date - today).days - notice_period_days
redis.zadd("renewals_by_deadline", {vendor_id: days_until})
```

---

## Communicates To

**Targets:** Risk Agent AND Vendor Research Agent (in parallel)  
**Trigger:** Immediately on extraction completion (even if some fields are flagged — flagged fields do not block the other agents)  
**Channel:** Redis Stream (`agent_events`)
