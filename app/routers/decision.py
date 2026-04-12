"""GET /api/workflows/{id}/decision — retrieve decision results."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.services.redis_client import get_decision

router = APIRouter(prefix="/api/workflows", tags=["decision"])


@router.get("/{workflow_id}/decision")
async def get_workflow_decision(workflow_id: str):
    """Return the decision for a workflow."""
    data = get_decision(workflow_id)
    if not data:
        raise HTTPException(404, f"No decision for workflow {workflow_id}")
    data["workflow_id"] = workflow_id
    return data
