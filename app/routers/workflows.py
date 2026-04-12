"""POST /api/workflows  — create and launch a workflow
GET  /api/workflows/{id} — get workflow status
POST /api/workflows/{id}/approve — approve artifacts
"""

from __future__ import annotations

import asyncio
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.orchestrator.orchestrate import approve_workflow, create_workflow, run_workflow
from app.services.redis_client import get_workflow

router = APIRouter(prefix="/api/workflows", tags=["workflows"])


@router.post("")
async def start_workflow(background_tasks: BackgroundTasks):
    """Create a new workflow. Documents are uploaded separately."""
    workflow_id = create_workflow()
    return {"workflow_id": workflow_id, "status": "CREATED"}


@router.get("/{workflow_id}")
async def get_workflow_status(workflow_id: str):
    """Get current status and metadata for a workflow."""
    wf = get_workflow(workflow_id)
    if not wf:
        raise HTTPException(404, f"Workflow {workflow_id} not found")
    return wf


@router.post("/{workflow_id}/approve")
async def approve(workflow_id: str, user: str = "demo_user"):
    """Approve all draft artifacts and complete the workflow."""
    try:
        result = approve_workflow(workflow_id, user)
        return {"status": "APPROVED", "workflow_id": workflow_id}
    except ValueError as e:
        raise HTTPException(404, str(e))
