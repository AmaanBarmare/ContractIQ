"""Agent 6: Action & Generation.

Produces draft artifacts (renegotiation brief, risk summary, cost comparison,
cancellation letter, executive summary) based on the decision package.
All artifacts are marked DRAFT_PENDING_APPROVAL and held behind the approval gate.
"""

from __future__ import annotations

import uuid
from typing import Optional

from app.models.artifacts import Artifact, ArtifactBundle, ArtifactType
from app.models.contract import ContractRecord
from app.models.decision import Decision
from app.models.risk import RiskReport
from app.services.llm_client import call_llm


def run_generation(
    workflow_id: str,
    contract: ContractRecord,
    risk_report: RiskReport,
    decision: Decision,
    vendor_intel: Optional[dict] = None,
) -> ArtifactBundle:
    """Generate all artifacts for the decision package.

    Returns an ArtifactBundle with all artifacts in DRAFT_PENDING_APPROVAL status.
    """
    artifacts = []

    # Always generate executive summary and risk summary
    artifacts.append(_generate_executive_summary(contract, risk_report, decision))
    artifacts.append(_generate_risk_summary(contract, risk_report))

    # Conditional artifacts based on recommendation
    if decision.recommendation in ("RENEGOTIATE", "RENEW"):
        artifacts.append(_generate_renegotiation_brief(contract, risk_report, decision, vendor_intel))
        artifacts.append(_generate_cost_comparison(contract, decision, vendor_intel))

    if decision.recommendation in ("CANCEL", "RENEGOTIATE"):
        artifacts.append(_generate_cancellation_letter(contract, decision))

    return ArtifactBundle(workflow_id=workflow_id, artifacts=artifacts)


def _generate_executive_summary(
    contract: ContractRecord, risk: RiskReport, decision: Decision,
) -> Artifact:
    prompt = f"""Generate a concise executive summary for a contract review.

Vendor: {contract.vendor_name.value}
Annual Value: {contract.annual_value.value}
Recommendation: {decision.recommendation}
Confidence: {decision.confidence:.0%}
Urgency: {decision.urgency}
Risk Level: {risk.risk_level} ({risk.overall_risk_score}/100)
Days to Act: {decision.days_to_act}
Primary Reason: {decision.primary_reason}
Key Risks: {', '.join(f.signal for f in risk.flags[:3])}

Write 3-4 paragraphs suitable for a VP of Procurement. Include the recommendation,
key risks, timeline, and suggested next steps. Be direct and actionable."""

    content = call_llm(prompt)
    return Artifact(
        artifact_id=_uid(),
        artifact_type="EXECUTIVE_SUMMARY",
        title=f"Executive Summary — {contract.vendor_name.value} Contract Review",
        content=content,
    )


def _generate_risk_summary(contract: ContractRecord, risk: RiskReport) -> Artifact:
    flags_text = "\n".join(
        f"- [{f.severity}] {f.signal}: {f.detail}" for f in risk.flags
    )
    greens_text = "\n".join(f"- ✓ {g}" for g in risk.green_signals)

    prompt = f"""Generate a structured risk summary report for a contract.

Vendor: {contract.vendor_name.value}
Overall Risk Score: {risk.overall_risk_score}/100
Risk Level: {risk.risk_level}
Category Scores: {risk.category_scores}

Risk Flags:
{flags_text}

Positive Signals:
{greens_text}

Format as a professional risk assessment with sections for Critical Findings,
Category Breakdown, and Recommended Mitigations."""

    content = call_llm(prompt)
    return Artifact(
        artifact_id=_uid(),
        artifact_type="RISK_SUMMARY",
        title=f"Risk Assessment — {contract.vendor_name.value}",
        content=content,
    )


def _generate_renegotiation_brief(
    contract: ContractRecord,
    risk: RiskReport,
    decision: Decision,
    vendor_intel: Optional[dict],
) -> Artifact:
    intel_text = ""
    if vendor_intel:
        intel_text = f"""
Vendor Intelligence:
- Company Health: {vendor_intel.get('company_health', {}).get('summary', 'N/A')}
- Pricing Benchmark: {vendor_intel.get('pricing_benchmark', {}).get('benchmark_assessment', 'N/A')}
- Key Finding: {vendor_intel.get('key_finding', 'N/A')}
- Alternatives: {', '.join(a.get('vendor', '') for a in vendor_intel.get('alternatives', []))}"""

    prompt = f"""Generate a renegotiation brief for a procurement team.

Vendor: {contract.vendor_name.value}
Annual Value: {contract.annual_value.value}
Renewal Date: {contract.renewal_date.value}
Auto-Renewal: {contract.auto_renewal.value}
Leverage Points: {', '.join(decision.negotiation_leverage)}
Potential Savings: {decision.potential_savings or 'TBD'}
{intel_text}

Include: Opening position, key negotiation points, BATNA, target terms,
walk-away thresholds, and a timeline for the negotiation process."""

    content = call_llm(prompt)
    return Artifact(
        artifact_id=_uid(),
        artifact_type="RENEGOTIATION_BRIEF",
        title=f"Renegotiation Brief — {contract.vendor_name.value}",
        content=content,
    )


def _generate_cost_comparison(
    contract: ContractRecord,
    decision: Decision,
    vendor_intel: Optional[dict],
) -> Artifact:
    alternatives = ""
    if vendor_intel and vendor_intel.get("alternatives"):
        alternatives = ", ".join(
            a.get("vendor", "") for a in vendor_intel["alternatives"]
        )

    prompt = f"""Generate a cost comparison analysis.

Current Vendor: {contract.vendor_name.value}
Current Annual Value: {contract.annual_value.value}
Pricing Model: {contract.pricing_model.value}
Seat Count: {contract.seat_count.value}
Potential Savings: {decision.potential_savings or 'TBD'}
Alternative Vendors: {alternatives or 'To be researched'}

Create a comparison table and analysis covering: current costs, market benchmarks,
potential alternatives, switching costs, and total cost of ownership over 3 years."""

    content = call_llm(prompt)
    return Artifact(
        artifact_id=_uid(),
        artifact_type="COST_COMPARISON",
        title=f"Cost Comparison — {contract.vendor_name.value}",
        content=content,
    )


def _generate_cancellation_letter(
    contract: ContractRecord, decision: Decision,
) -> Artifact:
    prompt = f"""Draft a formal contract cancellation/non-renewal notice letter.

Vendor: {contract.vendor_name.value}
Notice Period: {contract.notice_period.value}
Cancellation Deadline: {contract.cancellation_deadline.value}
Renewal Date: {contract.renewal_date.value}
Governing Law: {contract.governing_law.value}
Reason: {decision.primary_reason}

Write a professional but firm notice letter. Include: reference to the agreement,
intent to not renew, effective date, transition expectations, and data return
requirements. Keep it under 1 page."""

    content = call_llm(prompt)
    return Artifact(
        artifact_id=_uid(),
        artifact_type="CANCELLATION_LETTER",
        title=f"Non-Renewal Notice — {contract.vendor_name.value}",
        content=content,
    )


def _uid() -> str:
    return uuid.uuid4().hex[:12]
