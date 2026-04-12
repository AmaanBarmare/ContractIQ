"""GET /api/workflows/{id}/risk — retrieve risk analysis results."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.services.redis_client import get_risk_report

router = APIRouter(prefix="/api/workflows", tags=["risk"])


@router.get("/{workflow_id}/risk")
async def get_workflow_risk(workflow_id: str):
    """Return the risk report for a workflow."""
    data = get_risk_report(workflow_id)
    if not data:
        raise HTTPException(404, f"No risk report for workflow {workflow_id}")
    data["workflow_id"] = workflow_id
    return data
