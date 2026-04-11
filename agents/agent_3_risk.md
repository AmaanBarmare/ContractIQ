# Agent 3: Risk & Compliance Agent

**Single job:** Identify risks across four dimensions — renewal, commercial, legal, and security — before they become problems. Produce a scored, routed, actionable risk report.

---

## Responsibilities

1. Read the extracted contract record from Redis
2. Evaluate risk across four categories
3. Assign a risk score (0–100) per category and an overall score
4. Produce red / yellow / green flags with rationale
5. Route flags to the appropriate stakeholder queue (legal, security, finance, owner)
6. Emit a structured risk report to the Decision Agent

---

## Risk Categories

### Renewal Risk

| Signal | Severity | Logic |
|---|---|---|
| Auto-renewal present | High | `auto_renewal == "Yes"` |
| Notice period ≤ 45 days | Critical | `notice_period_days <= 45` |
| Days until cancellation deadline ≤ 30 | Critical | `days_to_deadline <= 30` |
| Days until cancellation deadline 31–60 | High | `30 < days_to_deadline <= 60` |
| Renewal owner not assigned | High | `renewal_owner == null` |
| Renewal date buried in amendment (not main agreement) | Medium | `renewal_date_source == "AMENDMENT"` |
| No termination for convenience clause | Medium | `termination_for_convenience == "No"` |

### Commercial Risk

| Signal | Severity | Logic |
|---|---|---|
| Pricing appears above market benchmark | High | Flagged by Vendor Research Agent or rule-based on category averages |
| Price escalator > 5% annually | Medium | `price_uplift_percent > 5` |
| Minimum commitment > current estimated usage | High | `min_commitment > estimated_usage` (if usage data available) |
| No plan size flexibility / no add/remove seats | Medium | Extracted clause indicates fixed seat count |
| Payment terms < Net 30 | Low | `payment_terms_days < 30` |
| Multi-year lock-in without exit ramp | High | `initial_term > 24 months AND termination_for_convenience == "No"` |

### Legal Risk

| Signal | Severity | Logic |
|---|---|---|
| Liability cap is uncapped | Critical | `liability_cap == null OR liability_cap == "uncapped"` |
| DPA not present for a data-processing vendor | Critical | `data_processing_vendor == true AND dpa_present == false` |
| Indemnity is one-sided (vendor-favorable) | High | Extracted indemnity language analyzed by LLM |
| Termination terms are vendor-favorable | High | Only vendor can terminate for convenience |
| Missing notice clause | Medium | `notice_clause == null` |
| Assignment without consent allowed | Medium | Assignment language does not require consent |
| Governing law is non-local and high-friction | Low | Governing law is outside team's home jurisdiction |

### Security / Compliance Risk

| Signal | Severity | Logic |
|---|---|---|
| No current SOC 2 Type II | High | `soc2_type2 == null OR soc2_type2 == "Not mentioned"` |
| Breach notification SLA > 72 hours or absent | High | `breach_notification_sla_hours > 72 OR null` |
| Subprocessor disclosure not present | Medium | `subprocessor_disclosure == null` |
| Data retention terms absent | Medium | `data_retention == null` |
| Data residency not specified for regulated data | High | Context-dependent; flagged if vendor processes PII |
| Audit rights not granted | Medium | `audit_rights == null OR audit_rights == "No"` |

---

## Risk Scoring

Each category receives a score from 0 (no risk) to 100 (critical risk):

```python
def calculate_category_score(flags: list[dict]) -> int:
    severity_weights = {"Critical": 40, "High": 20, "Medium": 10, "Low": 5}
    raw_score = sum(severity_weights[f["severity"]] for f in flags)
    return min(raw_score, 100)

def calculate_overall_score(category_scores: dict) -> int:
    # Renewal risk weighted highest — most time-sensitive
    weights = {"renewal": 0.40, "commercial": 0.25, "legal": 0.25, "security": 0.10}
    return int(sum(category_scores[cat] * weight for cat, weight in weights.items()))
```

---

## Output (Risk Report)

```json
{
  "workflow_id": "WF-2026-0411-ZM-001",
  "vendor_id": "zoom_video_communications",
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
      "detail": "Auto-renewal triggers August 15. Notice deadline is June 15, which is 34 days from today. Action required immediately.",
      "color": "RED",
      "impacted_stakeholders": ["procurement_manager", "renewal_owner"],
      "escalation_queue": "renewal_action_queue",
      "recommended_action": "Initiate renegotiation or cancellation process this week"
    },
    {
      "id": "flag_002",
      "category": "renewal",
      "severity": "High",
      "signal": "Auto-renewal active, no termination for convenience",
      "detail": "Contract will auto-renew for another 12 months unless cancelled by June 15. No termination for convenience clause means company cannot exit early.",
      "color": "RED",
      "impacted_stakeholders": ["procurement_manager"],
      "escalation_queue": "renewal_action_queue",
      "recommended_action": "Negotiate termination for convenience in any renewal"
    },
    {
      "id": "flag_003",
      "category": "commercial",
      "severity": "High",
      "signal": "Pricing likely above market benchmark",
      "detail": "Current seat rate of $467/seat/year. Market benchmark for comparable video conferencing tools: approximately $380–$420/seat/year. Estimated overpayment: $8,460–$15,660 annually.",
      "color": "YELLOW",
      "impacted_stakeholders": ["procurement_manager", "finance_director"],
      "escalation_queue": "negotiation_queue",
      "recommended_action": "Request pricing review and present benchmark data in negotiation"
    },
    {
      "id": "flag_004",
      "category": "renewal",
      "severity": "High",
      "signal": "No renewal owner assigned",
      "detail": "Contract record has no assigned renewal owner. No one is currently responsible for this renewal decision.",
      "color": "YELLOW",
      "impacted_stakeholders": ["procurement_manager"],
      "escalation_queue": "admin_queue",
      "recommended_action": "Assign renewal owner immediately"
    }
  ],
  "green_signals": [
    "DPA present (Exhibit B)",
    "Breach notification SLA: 72 hours (compliant)",
    "Liability cap present: 12 months of fees paid",
    "SSO/SAML supported"
  ],
  "confidence": 0.88,
  "agent": "risk_agent",
  "timestamp": "2026-04-11T14:30:41Z"
}
```

---

## Escalation Routing

The Risk Agent does not treat all risk the same. Each flag routes to the appropriate queue:

| Queue | Triggered By | Who Sees It |
|---|---|---|
| `renewal_action_queue` | Any renewal risk flag | Procurement Manager, assigned Renewal Owner |
| `negotiation_queue` | Commercial risk flags | Procurement Manager, Finance Director |
| `legal_review_queue` | Legal risk flags (High or Critical) | Legal Ops team |
| `security_review_queue` | Security/compliance flags (High or Critical) | IT Security team |
| `admin_queue` | Missing owner, missing document flags | Procurement Admin |

---

## Communicates To

**Target:** Decision Agent  
**Trigger:** On completion of risk analysis  
**Channel:** Redis Stream (`agent_events`)  
**Note:** Runs in parallel with Vendor Research Agent — both must complete before the Decision Agent begins.
