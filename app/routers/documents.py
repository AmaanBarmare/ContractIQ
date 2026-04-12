"""POST /api/workflows/{id}/documents — upload documents and trigger pipeline."""

from __future__ import annotations

import shutil
import tempfile
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile

from app.orchestrator.orchestrate import run_workflow
from app.services.redis_client import get_workflow, publish_agent_event, save_workflow

router = APIRouter(prefix="/api/workflows", tags=["documents"])

UPLOAD_DIR = Path(tempfile.gettempdir()) / "contractiq_uploads"


@router.post("/{workflow_id}/documents")
async def upload_documents(
    workflow_id: str,
    files: list[UploadFile],
    background_tasks: BackgroundTasks,
):
    """Upload contract documents and launch the agent pipeline."""
    wf = get_workflow(workflow_id)
    if not wf:
        raise HTTPException(404, f"Workflow {workflow_id} not found")

    # Save uploaded files to temp directory
    wf_dir = UPLOAD_DIR / workflow_id
    wf_dir.mkdir(parents=True, exist_ok=True)

    file_paths = []
    for f in files:
        dest = wf_dir / f.filename
        with open(dest, "wb") as out:
            content = await f.read()
            out.write(content)
        file_paths.append(str(dest))

    save_workflow(workflow_id, {
        "document_count": str(len(files)),
    })

    # Run pipeline in background so the upload returns immediately
    background_tasks.add_task(_run_pipeline_bg, workflow_id, file_paths)

    return {
        "workflow_id": workflow_id,
        "documents_uploaded": len(files),
        "status": "PROCESSING",
    }


def _run_pipeline_bg(workflow_id: str, file_paths: list[str]) -> None:
    """Background task that runs the full orchestration pipeline."""
    try:
        run_workflow(workflow_id, file_paths)
    except Exception as e:
        publish_agent_event(workflow_id, "system", "WORKFLOW_FAILED", {
            "error": str(e),
        })
