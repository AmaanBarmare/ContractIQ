"""Agent 3 — Risk & Compliance.

Pure rule-based scoring. Takes a :class:`ContractRecord` and produces a
:class:`RiskReport` by walking the signal library in
``modules/risk_engine.md``. Category weights (renewal 40%, commercial 25%,
legal 25%, security 10%) and severity weights (Critical 40, High 20,
Medium 10, Low 5) match that document.

Commercial risk from above-market pricing is intentionally NOT computed here
— that depends on Vendor Research (Agent 4, Person 2's scope). We only flag
contract-level commercial signals like short notice period.
"""

from __future__ import annotations

from datetime import date
from typing import Optional

from app.models.contract import ContractRecord
from app.models.risk import RiskCategory, RiskFlag, RiskLevel, RiskReport, RiskSeverity

SEVERITY_WEIGHTS: dict[RiskSeverity, int] = {
    "Critical": 40,
    "High": 20,
    "Medium": 10,
    "Low": 5,
}

CATEGORY_WEIGHTS: dict[RiskCategory, float] = {
    "renewal": 0.40,
    "commercial": 0.25,
    "legal": 0.25,
    "security": 0.10,
}


def _days_until(date_str: Optional[str]) -> Optional[int]:
    if not date_str:
        return None
    try:
        return (date.fromisoformat(date_str) - date.today()).days
    except (ValueError, TypeError):
        return None


def _color_for(severity: RiskSeverity) -> str:
    return "RED" if severity in ("Critical", "High") else "YELLOW"


def _risk_level(score: int) -> RiskLevel:
    if score >= 75:
        return "CRITICAL"
    if score >= 50:
        return "HIGH"
    if score >= 25:
        return "MEDIUM"
    return "LOW"


def run_risk_analysis(contract: ContractRecord) -> RiskReport:
    """Evaluate every risk signal against a contract record."""
    flags: list[RiskFlag] = []
    green: list[str] = []
    next_id = 0

    def add(
        category: RiskCategory,
        severity: RiskSeverity,
        signal: str,
        detail: str,
        action: str,
    ) -> None:
        nonlocal next_id
        flags.append(
            RiskFlag(
                id=f"flag_{next_id:03d}",
                category=category,
                severity=severity,
                signal=signal,
                detail=detail,
                color=_color_for(severity),
                recommended_action=action,
            )
        )
        next_id += 1

    # ------------------------------------------------------------------
    # Renewal signals
    # ------------------------------------------------------------------
    days_to_deadline = _days_until(contract.cancellation_deadline.value)
    if days_to_deadline is not None:
        if days_to_deadline <= 0:
            add(
                "renewal",
                "Critical",
                "Cancellation deadline has PASSED",
                f"The notice deadline passed {abs(days_to_deadline)} days ago — "
                f"contract will auto-renew unless an exception is negotiated.",
                "Contact the vendor today to negotiate post-deadline options.",
            )
        elif days_to_deadline <= 30:
            add(
                "renewal",
                "Critical",
                f"Cancellation deadline in {days_to_deadline} days",
                f"Deadline is {contract.cancellation_deadline.value}. "
                f"Immediate action required.",
                "Initiate renegotiation or cancellation this week.",
            )
        elif days_to_deadline <= 45:
            add(
                "renewal",
                "High",
                f"Cancellation deadline in {days_to_deadline} days",
                f"Deadline is {contract.cancellation_deadline.value}. "
                f"Action needed within two weeks.",
                "Schedule a vendor review call this week.",
            )
        elif days_to_deadline <= 90:
            add(
                "renewal",
                "Medium",
                f"Cancellation deadline in {days_to_deadline} days",
                f"Deadline is {contract.cancellation_deadline.value}. "
                f"Begin renewal planning now.",
                "Assign a renewal owner and draft negotiation goals.",
            )

    if contract.auto_renewal.value == "Yes":
        add(
            "renewal",
            "High",
            "Auto-renewal active",
            "Contract will renew automatically unless cancelled before the notice deadline.",
            "Confirm action (renew / renegotiate / cancel) before the deadline.",
        )

    if not contract.renewal_owner.value:
        add(
            "renewal",
            "High",
            "No renewal owner assigned",
            "No one is currently responsible for this renewal decision.",
            "Assign a renewal owner immediately.",
        )

    if contract.termination_for_convenience.value == "No":
        add(
            "renewal",
            "Medium",
            "No termination for convenience",
            "Company cannot exit early without cause. Missing a renewal window "
            "means a 12+ month lock-in.",
            "Negotiate a termination for convenience clause at renewal.",
        )

    # ------------------------------------------------------------------
    # Commercial signals (contract-level only; pricing benchmarks come
    # from Vendor Research — not our scope)
    # ------------------------------------------------------------------
    try:
        notice_days = int(contract.notice_period_days.value or "0")
    except (ValueError, TypeError):
        notice_days = 0
    if 0 < notice_days <= 30:
        add(
            "commercial",
            "High",
            f"Short notice period ({notice_days} days)",
            "Very short window to act on renewal — easy to miss.",
            "Request an extended notice period at next renewal.",
        )

    # ------------------------------------------------------------------
    # Legal signals
    # ------------------------------------------------------------------
    liability = (contract.liability_cap.value or "").lower()
    if not contract.liability_cap.value or "uncapped" in liability or "no cap" in liability:
        add(
            "legal",
            "Critical",
            "No liability cap or uncapped liability",
            "Contract does not limit the company's exposure — significant "
            "financial risk in the event of a dispute.",
            "Escalate to legal; negotiate a cap of 12 months' fees at renewal.",
        )

    if contract.dpa_present.value != "Yes":
        add(
            "legal",
            "Critical",
            "No Data Processing Addendum",
            "Vendor processes customer data but no DPA is attached or "
            "referenced. GDPR / CCPA compliance risk.",
            "Request a signed DPA from the vendor before renewal.",
        )

    # ------------------------------------------------------------------
    # Security / Compliance signals
    # ------------------------------------------------------------------
    if contract.soc2_type2.value not in ("Yes", "Referenced"):
        add(
            "security",
            "High",
            "No SOC 2 Type II on file",
            "Vendor security posture cannot be verified.",
            "Request the current SOC 2 Type II report from the vendor.",
        )

    if not contract.breach_notification_sla.value:
        add(
            "security",
            "High",
            "No breach notification SLA",
            "Contract does not specify how quickly the vendor must notify the "
            "company of a security incident.",
            "Add a breach notification requirement (72-hour SLA standard) at renewal.",
        )

    # ------------------------------------------------------------------
    # Green signals
    # ------------------------------------------------------------------
    if contract.dpa_present.value == "Yes":
        green.append("Data Processing Addendum present")
    if contract.liability_cap.value and "uncapped" not in liability:
        green.append(f"Liability cap present: {contract.liability_cap.value}")
    if contract.soc2_type2.value in ("Yes", "Referenced"):
        green.append("SOC 2 Type II referenced")
    if contract.breach_notification_sla.value:
        green.append(
            f"Breach notification SLA: {contract.breach_notification_sla.value}"
        )

    # ------------------------------------------------------------------
    # Scoring
    # ------------------------------------------------------------------
    def category_score(cat: RiskCategory) -> int:
        cat_flags = [f for f in flags if f.category == cat]
        return min(sum(SEVERITY_WEIGHTS[f.severity] for f in cat_flags), 100)

    category_scores: dict[str, int] = {
        cat: category_score(cat) for cat in CATEGORY_WEIGHTS
    }

    overall = int(
        sum(category_scores[cat] * weight for cat, weight in CATEGORY_WEIGHTS.items())
    )

    return RiskReport(
        overall_risk_score=overall,
        risk_level=_risk_level(overall),
        category_scores=category_scores,
        flags=flags,
        green_signals=green,
        confidence=0.88,
    )
