"""GET/POST /api/workflows/{id}/artifacts — retrieve and manage artifacts."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.services.redis_client import get_artifacts, save_artifacts, log_audit

router = APIRouter(prefix="/api/workflows", tags=["artifacts"])


@router.get("/{workflow_id}/artifacts")
async def get_workflow_artifacts(workflow_id: str):
    """Return all artifacts for a workflow."""
    data = get_artifacts(workflow_id)
    if not data:
        return {"artifacts": [], "workflow_id": workflow_id}
    return data


@router.post("/{workflow_id}/artifacts/{artifact_id}/approve")
async def approve_artifact(workflow_id: str, artifact_id: str, user: str = "demo_user"):
    """Approve a single artifact."""
    data = get_artifacts(workflow_id)
    if not data:
        raise HTTPException(404, f"No artifacts for workflow {workflow_id}")

    from datetime import datetime, timezone
    found = False
    for art in data.get("artifacts", []):
        if art.get("artifact_id") == artifact_id:
            art["approval_status"] = "APPROVED"
            art["approved_by"] = user
            art["approved_at"] = datetime.now(timezone.utc).isoformat()
            found = True
            break

    if not found:
        raise HTTPException(404, f"Artifact {artifact_id} not found")

    save_artifacts(workflow_id, data)
    log_audit("ARTIFACT_APPROVED", user, {
        "workflow_id": workflow_id,
        "artifact_id": artifact_id,
    })
    return {"status": "APPROVED", "artifact_id": artifact_id}
