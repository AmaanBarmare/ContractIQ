# Module: Structured Extraction Engine

The extraction engine is the foundation of ContractIQ's intelligence. Without accurate, structured, confidence-scored data, no downstream agent can reason reliably. This module documents the extraction design, field coverage, prompt strategy, and quality controls.

---

## Design Principles

**1. Extract, don't infer.**  
If a field is not explicitly stated in the contract, the value is `null` and confidence is `0.0`. The engine never guesses or infers from context.

**2. Every field gets a confidence score.**  
Not a binary found/not-found. A score from 0.0 to 1.0, so downstream systems can route accordingly.

**3. Always capture the source text.**  
Every extracted value comes with the exact clause or sentence it was pulled from. This enables clause citations in Q&A, human confirmation prompts, and audit trails.

**4. Multi-document merging.**  
When a vendor has four uploaded documents (MSA, Order Form, Amendment, Pricing Sheet), the engine merges them into one unified record. The most recent or most specific document wins on conflicts (Amendment overrides MSA for changed terms).

---

## Field Categories and Coverage

See [Agent 2: Extraction Agent](../agents/agent_2_extraction.md) for the complete field reference with examples.

**Summary:** 40+ fields across five categories:
- Commercial (12 fields)
- Timeline (8 fields)
- Legal (10 fields)
- Security / Compliance (8 fields)
- Operational (5 fields)

---

## Document Merging Logic

When multiple documents exist for one vendor, they are processed in this order:

```
Amendment (most recent) → overrides any field it contains
Order Form              → overrides MSA for commercial terms
Pricing Sheet           → overrides Order Form for pricing fields
MSA                     → fills any field not covered above
DPA                     → fills security/compliance fields
```

If the same field appears in two documents with conflicting values:
- The more recent document's value is used
- Both values and their sources are recorded
- A `CONFLICT_DETECTED` flag is set for that field

---

## Extraction Quality Controls

### Confidence Scoring Heuristics

The LLM is prompted to score its own confidence, but the engine also applies rule-based adjustments:

| Condition | Confidence Adjustment |
|---|---|
| Value exactly matches a known format (date YYYY-MM-DD, currency $X,XXX) | +0.10 |
| Value appears in multiple documents consistently | +0.15 |
| Value conflicts between documents | -0.20 |
| Source clause is ambiguous or uses hedging language | -0.15 |
| Field extracted from an amendment (not main agreement) | -0.05 |

### Post-Extraction Validation

After extraction, the engine runs validation checks:

```python
def validate_contract_record(record: dict) -> list[str]:
    issues = []
    
    # Date logic
    if record.get("renewal_date") and record.get("effective_date"):
        if renewal_date <= effective_date:
            issues.append("renewal_date must be after effective_date")
    
    # Notice period logic
    if record.get("cancellation_deadline") and record.get("renewal_date"):
        implied_notice = (renewal_date - cancellation_deadline).days
        if extracted_notice_days and abs(implied_notice - extracted_notice_days) > 5:
            issues.append(f"notice_period ({extracted_notice_days}d) inconsistent with calculated gap ({implied_notice}d)")
    
    # Spend sanity
    if record.get("annual_value") and record.get("monthly_value"):
        if abs(annual_value - (monthly_value * 12)) > annual_value * 0.05:
            issues.append("annual_value and monthly_value are inconsistent (>5% gap)")
    
    return issues
```

Validation issues are attached to the contract record and shown in the Vendor Workspace view.
