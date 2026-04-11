"""Decision synthesis data model.

The Decision Agent combines a ``ContractRecord``, a ``RiskReport``, and
(optionally) vendor intelligence from the Research Agent into a single
structured recommendation. Person 2's Orchestrate layer reads ``confidence``
to decide whether to auto-proceed or route to human review.
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

RecommendationType = Literal[
    "RENEW",
    "RENEGOTIATE",
    "CANCEL",
    "ESCALATE_LEGAL",
    "ESCALATE_SECURITY",
    "DEFER",
]

Urgency = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]


class Decision(BaseModel):
    """Structured recommendation produced by the Decision Agent."""

    recommendation: RecommendationType
    confidence: float = Field(0.0, ge=0.0, le=1.0)
    urgency: Urgency
    days_to_act: int
    primary_reason: str
    reasoning: list[str]
    risks_if_no_action: str
    potential_savings: Optional[str] = None
    negotiation_leverage: list[str] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)
    stakeholder_checklist: dict[str, list[str]] = Field(default_factory=dict)
