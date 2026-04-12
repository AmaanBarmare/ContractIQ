"""GET /api/contracts/{workflow_id} — retrieve extracted contract data."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.services.redis_client import get_contract

router = APIRouter(prefix="/api/contracts", tags=["contracts"])


@router.get("/{workflow_id}")
async def get_contract_data(workflow_id: str):
    """Return extracted contract fields for a workflow."""
    data = get_contract(workflow_id)
    if not data:
        raise HTTPException(404, f"No contract data for workflow {workflow_id}")
    return data
