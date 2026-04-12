"""Artifact models for generated documents."""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

ArtifactType = Literal[
    "RENEGOTIATION_BRIEF",
    "RISK_SUMMARY",
    "COST_COMPARISON",
    "CANCELLATION_LETTER",
    "EXECUTIVE_SUMMARY",
]

ApprovalStatus = Literal["DRAFT_PENDING_APPROVAL", "APPROVED", "REJECTED"]


class Artifact(BaseModel):
    """A single generated artifact held behind the approval gate."""

    artifact_id: str
    artifact_type: ArtifactType
    title: str
    content: str
    approval_status: ApprovalStatus = "DRAFT_PENDING_APPROVAL"
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None


class ArtifactBundle(BaseModel):
    """All artifacts for a workflow."""

    workflow_id: str
    artifacts: list[Artifact] = Field(default_factory=list)
