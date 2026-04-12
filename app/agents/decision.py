"""Agent 5 — Decision.

Synthesizes a :class:`ContractRecord`, a :class:`RiskReport`, and (optionally)
vendor intelligence from Agent 4 into a structured recommendation. The LLM is
asked to return a compact JSON payload — we parse it into a :class:`Decision`.

Vendor intel is passed in as a plain dict so Person 2's orchestration layer can
plug Agent 4's output in without touching this file. When it's absent the
prompt still works; the LLM just reasons from the contract + risk report.
"""

from __future__ import annotations

import json
import re
from datetime import date
from typing import Any, Optional

from app.agents.extraction import extract_json
from app.models.contract import ContractRecord
from app.models.decision import Decision, RecommendationType, Urgency
from app.models.risk import RiskReport
from app.services.llm_client import call_llm

VALID_RECOMMENDATIONS: set[str] = {
    "RENEW",
    "RENEGOTIATE",
    "CANCEL",
    "ESCALATE_LEGAL",
    "ESCALATE_SECURITY",
    "DEFER",
}
VALID_URGENCIES: set[str] = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}

DECISION_PROMPT = """You are a senior procurement strategist. Based on the contract data, risk analysis, and (optional) vendor research below, produce a structured renewal recommendation.

STRICT RULES:
- Be direct and specific. Reference the actual numbers (dates, amounts, day counts, flag counts) from the inputs.
- Each reasoning point must cite a concrete fact from the inputs.
- Return ONLY a single valid JSON object. No markdown, no prose, no fences.

ALLOWED recommendation values: RENEW, RENEGOTIATE, CANCEL, ESCALATE_LEGAL, ESCALATE_SECURITY, DEFER.
ALLOWED urgency values: CRITICAL, HIGH, MEDIUM, LOW.

CONTRACT SUMMARY:
- Vendor: {vendor_name}
- Annual Value: {annual_value}
- Renewal Date: {renewal_date}
- Cancellation Deadline: {cancellation_deadline}
- Days Until Deadline: {days_to_act}
- Notice Period: {notice_period}
- Auto-Renewal: {auto_renewal}
- Termination for Convenience: {termination_for_convenience}
- Seat Count: {seat_count}

RISK ANALYSIS:
- Overall Risk Score: {risk_score}/100 ({risk_level})
- Category Scores: {category_scores}
- Critical Flags: {critical_flags}
- High Flags: {high_flags}
- Medium Flags: {medium_flags}
- Green Signals: {green_signals}

VENDOR RESEARCH (from Tavily — optional):
{vendor_intel}

Return this exact JSON structure (keys in this order, no extra keys):
{{
  "recommendation": "RENEW | RENEGOTIATE | CANCEL | ESCALATE_LEGAL | ESCALATE_SECURITY | DEFER",
  "confidence": 0.0-1.0,
  "urgency": "CRITICAL | HIGH | MEDIUM | LOW",
  "days_to_act": <integer>,
  "primary_reason": "one sentence — the single most important factor",
  "reasoning": ["specific fact 1", "specific fact 2", "specific fact 3"],
  "risks_if_no_action": "what happens if the team does nothing",
  "potential_savings": "estimated savings description or null",
  "negotiation_leverage": ["leverage point 1", "leverage point 2"],
  "next_steps": ["Step 1 (owner, deadline)", "Step 2", "Step 3"],
  "stakeholder_checklist": {{
    "procurement_manager": ["action 1"],
    "finance_director": ["action 1"],
    "legal": [],
    "it_security": []
  }}
}}
"""


def _days_until(date_str: Optional[str]) -> int:
    if not date_str:
        return 999
    try:
        return (date.fromisoformat(date_str) - date.today()).days
    except (ValueError, TypeError):
        return 999


def _format_vendor_intel(vendor_intel: Optional[dict[str, Any]]) -> str:
    if not vendor_intel:
        return "Vendor research not yet available — reason from contract + risk only."
    health = (vendor_intel.get("company_health") or {}).get("summary", "Not available")
    pricing = (vendor_intel.get("pricing_benchmark") or {}).get(
        "benchmark_assessment", "Not available"
    )
    key_finding = vendor_intel.get("key_finding") or "No additional intel"
    alts = ", ".join(
        a.get("vendor", "?") for a in (vendor_intel.get("alternatives") or [])[:3]
    ) or "None identified"
    return (
        f"- Company health: {health}\n"
        f"- Pricing vs benchmark: {pricing}\n"
        f"- Key finding: {key_finding}\n"
        f"- Alternatives: {alts}"
    )


def _coerce_list(raw: Any) -> list[str]:
    if isinstance(raw, list):
        return [str(x) for x in raw if x is not None]
    if raw in (None, ""):
        return []
    return [str(raw)]


def _coerce_checklist(raw: Any) -> dict[str, list[str]]:
    if not isinstance(raw, dict):
        return {}
    return {str(k): _coerce_list(v) for k, v in raw.items()}


def _build_decision(data: dict[str, Any], fallback_days: int) -> Decision:
    """Turn LLM JSON into a validated Decision, with defensive fallbacks."""
    rec = str(data.get("recommendation", "DEFER")).upper().strip()
    if rec not in VALID_RECOMMENDATIONS:
        rec = "DEFER"

    urg = str(data.get("urgency", "MEDIUM")).upper().strip()
    if urg not in VALID_URGENCIES:
        urg = "MEDIUM"

    try:
        confidence = float(data.get("confidence") or 0.5)
    except (TypeError, ValueError):
        confidence = 0.5
    confidence = max(0.0, min(1.0, confidence))

    try:
        days_to_act = int(data.get("days_to_act") if data.get("days_to_act") is not None else fallback_days)
    except (TypeError, ValueError):
        days_to_act = fallback_days

    return Decision(
        recommendation=rec,  # type: ignore[arg-type]
        confidence=confidence,
        urgency=urg,  # type: ignore[arg-type]
        days_to_act=days_to_act,
        primary_reason=str(data.get("primary_reason") or ""),
        reasoning=_coerce_list(data.get("reasoning")),
        risks_if_no_action=str(data.get("risks_if_no_action") or ""),
        potential_savings=(
            str(data["potential_savings"])
            if data.get("potential_savings") not in (None, "", "null")
            else None
        ),
        negotiation_leverage=_coerce_list(data.get("negotiation_leverage")),
        next_steps=_coerce_list(data.get("next_steps")),
        stakeholder_checklist=_coerce_checklist(data.get("stakeholder_checklist")),
    )


def run_decision(
    contract: ContractRecord,
    risk_report: RiskReport,
    vendor_intel: Optional[dict[str, Any]] = None,
) -> Decision:
    """Run the Decision Agent end-to-end."""
    days_to_act = _days_until(contract.cancellation_deadline.value)

    critical_flags = [f.signal for f in risk_report.flags if f.severity == "Critical"]
    high_flags = [f.signal for f in risk_report.flags if f.severity == "High"]
    medium_flags = [f.signal for f in risk_report.flags if f.severity == "Medium"]

    prompt = DECISION_PROMPT.format(
        vendor_name=contract.vendor_name.value or "Unknown",
        annual_value=contract.annual_value.value or "Unknown",
        renewal_date=contract.renewal_date.value or "Unknown",
        cancellation_deadline=contract.cancellation_deadline.value or "Unknown",
        days_to_act=days_to_act,
        notice_period=contract.notice_period.value or "Unknown",
        auto_renewal=contract.auto_renewal.value or "Unknown",
        termination_for_convenience=contract.termination_for_convenience.value or "Unknown",
        seat_count=contract.seat_count.value or "Unknown",
        risk_score=risk_report.overall_risk_score,
        risk_level=risk_report.risk_level,
        category_scores=json.dumps(risk_report.category_scores),
        critical_flags=", ".join(critical_flags) or "None",
        high_flags=", ".join(high_flags) or "None",
        medium_flags=", ".join(medium_flags) or "None",
        green_signals=", ".join(risk_report.green_signals) or "None",
        vendor_intel=_format_vendor_intel(vendor_intel),
    )

    raw = call_llm(prompt, temperature=0.2)
    data = extract_json(raw)
    return _build_decision(data, fallback_days=days_to_act)
