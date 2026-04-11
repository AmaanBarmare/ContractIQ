"""Risk analysis data models.

The Risk Agent converts a ``ContractRecord`` into a ``RiskReport`` by running
rule-based checks against the risk signal library in ``modules/risk_engine.md``.
Every flag is categorized, scored by severity, and carries a recommended action
so the Decision Agent and Renewal Command Center can render them directly.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

RiskSeverity = Literal["Critical", "High", "Medium", "Low"]
RiskCategory = Literal["renewal", "commercial", "legal", "security"]
RiskColor = Literal["RED", "YELLOW", "GREEN"]
RiskLevel = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]


class RiskFlag(BaseModel):
    """A single risk finding raised by the Risk Agent."""

    id: str
    category: RiskCategory
    severity: RiskSeverity
    signal: str  # short title, e.g. "Auto-renewal active"
    detail: str  # full explanation with specifics
    color: RiskColor
    recommended_action: str


class RiskReport(BaseModel):
    """Complete risk assessment for one contract."""

    overall_risk_score: int = Field(0, ge=0, le=100)
    risk_level: RiskLevel
    category_scores: dict[str, int]
    flags: list[RiskFlag]
    green_signals: list[str]
    confidence: float = Field(0.0, ge=0.0, le=1.0)
