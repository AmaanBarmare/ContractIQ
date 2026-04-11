# Agent 5: Decision Agent

**Single job:** Synthesize everything into one structured recommendation. This agent does not generate artifacts — it only decides. That separation keeps its logic clean and independently auditable.

---

## Responsibilities

1. Receive risk report (from Risk Agent) and vendor intelligence (from Vendor Research Agent)
2. Read the contract record from Redis
3. Synthesize all inputs into a single recommendation
4. Assign a confidence score to the recommendation
5. Determine urgency level and days-until-deadline
6. Produce a reasoning chain (not just a conclusion)
7. Emit the decision package to the Action Agent via Watsonx Orchestrate
8. If confidence is below threshold, route to human review queue instead

---

## Decision Types

| Decision | When Used |
|---|---|
| `RENEW` | Contract is in good standing, pricing is fair, no material risk, no better alternatives |
| `RENEGOTIATE` | Contract has renewal risk AND commercial or legal issues that can be addressed before deadline |
| `CANCEL` | Better alternatives exist, cost is not justified, or relationship quality is poor |
| `ESCALATE_LEGAL` | High-severity legal flags (uncapped liability, missing DPA, one-sided indemnity) require legal review before any decision |
| `ESCALATE_SECURITY` | High-severity security flags require IT security review before any decision |
| `ESCALATE_FINANCE` | Spend impact is large enough (typically > $200K) that Finance leadership should be in the loop |
| `REQUEST_MISSING_DOCUMENTS` | Critical fields could not be extracted and required documents are not uploaded |
| `DEFER` | Not enough information to decide; deadline is not imminent; more time needed |

---

## Decision Logic

The Decision Agent uses a structured reasoning prompt:

```
You are a senior procurement strategist. Based on the following contract data, risk 
analysis, and vendor research, produce a structured renewal recommendation.

CONTRACT RECORD:
{contract_record}

RISK ANALYSIS:
- Overall risk score: {overall_risk_score}/100
- Risk level: {risk_level}
- Critical flags: {critical_flags}
- High flags: {high_flags}

VENDOR INTELLIGENCE:
- Company health: {company_health_summary}
- Pricing vs. benchmark: {pricing_assessment}
- Alternatives available: {alternatives_summary}
- Key finding: {key_finding}

TIMING CONTEXT:
- Days until cancellation deadline: {days_to_deadline}
- Annual contract value: {annual_value}
- Contract status: {renewal_or_cancel}

Produce a JSON recommendation with this exact structure:
{
  "recommendation": "RENEW | RENEGOTIATE | CANCEL | ESCALATE_LEGAL | ESCALATE_SECURITY | ESCALATE_FINANCE | REQUEST_MISSING_DOCUMENTS | DEFER",
  "confidence": 0.0-1.0,
  "urgency": "CRITICAL | HIGH | MEDIUM | LOW",
  "days_to_act": integer,
  "primary_reason": "One sentence — the single most important factor driving this recommendation",
  "reasoning": ["Point 1", "Point 2", "Point 3"],
  "risks_if_no_action": "What happens if the team does nothing",
  "potential_savings": "Estimated annual savings from this recommendation (or null)",
  "stakeholder_checklist": {
    "procurement_manager": ["Action 1", "Action 2"],
    "finance_director": ["Action 1"],
    "legal": ["Action 1"],
    "it_security": []
  },
  "negotiation_leverage": ["Leverage point 1", "Leverage point 2"],
  "next_steps": ["Step 1 (owner, deadline)", "Step 2", "Step 3"]
}
```

---

## Output (Decision Package)

```json
{
  "workflow_id": "WF-2026-0411-ZM-001",
  "vendor_id": "zoom_video_communications",
  "vendor_name": "Zoom Video Communications",
  "recommendation": "RENEGOTIATE",
  "confidence": 0.91,
  "urgency": "CRITICAL",
  "days_to_act": 34,
  "primary_reason": "Auto-renewal fires in 34 days, pricing is 12-13% above market, and two alternatives may already be licensed through existing agreements.",
  "reasoning": [
    "Cancellation deadline is June 15 — only 34 days from today. This is within the critical action window.",
    "Current seat rate of $467/seat/year is 12-13% above the market midpoint of $415/seat/year. Annual overpayment: approximately $9,360.",
    "Tavily research identifies that Microsoft Teams and Google Meet may already be licensed at the company through existing M365 or Google Workspace agreements — this is strong negotiation leverage.",
    "Zoom announced a pricing increase effective Q2 2026. Without renegotiation, next renewal is likely to cost more.",
    "Contract has no termination for convenience clause — if the company misses this window, they are locked in for another 12 months.",
    "No renewal owner is currently assigned — this creates execution risk."
  ],
  "risks_if_no_action": "Contract auto-renews at current pricing ($84K) or higher for another 12 months. Team loses the opportunity to negotiate pricing reduction or exit clause. Estimated cost of inaction: $9,360–$15,660 in above-market spend.",
  "potential_savings": "$9,360–$15,660 annually (pricing renegotiation) + possible elimination of seat count above current usage",
  "stakeholder_checklist": {
    "procurement_manager": [
      "Assign renewal owner by end of day",
      "Initiate renegotiation with Zoom account rep this week",
      "Check if Teams or Meet is already licensed — confirm with IT"
    ],
    "finance_director": [
      "Approve budget for continued Zoom usage at renegotiated pricing",
      "Review Zoom vs. included video tool cost comparison"
    ],
    "legal": [],
    "it_security": [
      "Confirm current Zoom usage count vs. 180 licensed seats",
      "Advise on Teams/Meet readiness if migration is considered"
    ]
  },
  "negotiation_leverage": [
    "Microsoft Teams and Google Meet may be included in existing licenses — credible alternative to walk away",
    "Zoom growth is slowing — they have incentive to retain customers at current seat counts",
    "Company-wide price increase makes a pricing freeze request reasonable and well-timed",
    "180-seat volume is meaningful — request volume discount"
  ],
  "next_steps": [
    "Assign renewal owner (Procurement Manager, today)",
    "Confirm Teams/Meet license status (IT, within 48 hours)",
    "Contact Zoom account rep to open renegotiation (Procurement Manager, by June 1)",
    "Submit CFO summary for awareness (Procurement Manager, by June 3)",
    "Decision deadline: June 10 (5 days before June 15 notice deadline)"
  ],
  "agent": "decision_agent",
  "timestamp": "2026-04-11T14:31:08Z"
}
```

---

## Confidence Routing

```python
THRESHOLD_AUTO_PROCEED = 0.80
THRESHOLD_HUMAN_REVIEW = 0.50

if decision["confidence"] >= THRESHOLD_AUTO_PROCEED:
    # Route to Action Agent via Watsonx Orchestrate
    orchestrate.dispatch("action_agent", payload=decision_package)
    
elif decision["confidence"] >= THRESHOLD_HUMAN_REVIEW:
    # Route to human review queue — show decision and ask for confirmation
    orchestrate.route_to_human_review(
        decision_package=decision_package,
        prompt=f"AI recommends {decision['recommendation']} with {decision['confidence']:.0%} confidence. Key uncertainty: {decision['uncertainty_reason']}. Do you want to proceed?"
    )
    
else:
    # Escalate — not enough information to make a reliable recommendation
    orchestrate.escalate(
        reason=decision["escalation_reason"],
        missing_data=decision["missing_data"],
        message="Additional information required before a recommendation can be made."
    )
```

---

## Communicates To

**Target:** Action & Generation Agent (via Watsonx Orchestrate)  
**Condition:** Only if confidence ≥ 80% AND user has approved the decision (or confidence is 50–79% and user confirmed via human review queue)  
**Channel:** Watsonx Orchestrate workflow (not directly via Redis Stream — Orchestrate manages this handoff to enforce the approval gate)
