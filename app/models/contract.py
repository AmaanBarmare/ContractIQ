"""Contract extraction data models.

Every extractable field is wrapped in an ``ExtractedField`` so downstream agents
can reason about confidence per-field instead of per-document. The field set here
is a tight subset (~16) of the 40+ fields catalogued in
``modules/extraction_engine.md``; we extract only what the Risk and Decision
agents actually consume for the Renewal Rescue demo.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class ExtractedField(BaseModel):
    """A single extracted field with confidence and provenance."""

    value: Optional[str] = None
    confidence: float = Field(0.0, ge=0.0, le=1.0)
    source_text: Optional[str] = None


class ContractRecord(BaseModel):
    """Normalized contract record produced by the Extraction Agent.

    Field names match ``agents/agent_2_extraction.md`` so downstream agents
    and Person 2's Redis layer can use them without translation.
    """

    # Identity
    vendor_name: ExtractedField = ExtractedField()

    # Commercial
    annual_value: ExtractedField = ExtractedField()
    pricing_model: ExtractedField = ExtractedField()
    seat_count: ExtractedField = ExtractedField()

    # Timeline
    renewal_date: ExtractedField = ExtractedField()
    cancellation_deadline: ExtractedField = ExtractedField()
    notice_period: ExtractedField = ExtractedField()
    notice_period_days: ExtractedField = ExtractedField()
    auto_renewal: ExtractedField = ExtractedField()

    # Legal
    termination_for_convenience: ExtractedField = ExtractedField()
    liability_cap: ExtractedField = ExtractedField()
    dpa_present: ExtractedField = ExtractedField()
    governing_law: ExtractedField = ExtractedField()

    # Security / Compliance
    soc2_type2: ExtractedField = ExtractedField()
    breach_notification_sla: ExtractedField = ExtractedField()

    # Operational
    renewal_owner: ExtractedField = ExtractedField()

    # Meta
    overall_confidence: float = Field(0.0, ge=0.0, le=1.0)
    flagged_fields: list[str] = Field(default_factory=list)
    missing_fields: list[str] = Field(default_factory=list)
