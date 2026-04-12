"""Workflow state models."""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

WorkflowStatus = Literal[
    "CREATED",
    "INGESTING",
    "EXTRACTING",
    "ANALYZING_RISK",
    "RESEARCHING",
    "DECIDING",
    "GENERATING",
    "PENDING_APPROVAL",
    "APPROVED",
    "COMPLETED",
    "FAILED",
]


class WorkflowState(BaseModel):
    """Persistent state for a single workflow run."""

    workflow_id: str
    status: WorkflowStatus = "CREATED"
    vendor_name: Optional[str] = None
    document_count: int = 0
    current_agent: Optional[str] = None
    error: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    completed_at: Optional[str] = None


class WorkflowEvent(BaseModel):
    """Single event published to the agent_events Redis Stream."""

    workflow_id: str
    source_agent: str
    event_type: str
    payload: dict = Field(default_factory=dict)
    timestamp: Optional[str] = None
