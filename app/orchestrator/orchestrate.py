"""IBM Watsonx Orchestrate client and workflow state machine.

Dispatches agents in the Renewal Rescue sequence:
  1. Ingestion → 2. Extraction → 3. Risk ∥ 4. Research → 5. Decision → 6. Generation
Agents 3 and 4 run in parallel. All state is persisted to Redis.
Every step publishes events to the agent_events stream for the Live Agent Feed.
"""

from __future__ import annotations

import json
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from typing import Optional

from app.agents.decision import run_decision
from app.agents.extraction import run_extraction
from app.agents.generation import run_generation
from app.agents.ingestion import run_ingestion
from app.agents.research import run_research
from app.agents.risk import run_risk_analysis
from app.models.artifacts import ArtifactBundle
from app.models.contract import ContractRecord
from app.models.decision import Decision
from app.models.risk import RiskReport
from app.services.redis_client import (
    get_artifacts,
    log_audit,
    publish_agent_event,
    save_artifacts,
    save_contract,
    save_decision,
    save_risk_report,
    save_workflow,
    set_renewal_deadline,
)


def create_workflow() -> str:
    """Create a new workflow and return its ID."""
    workflow_id = f"WF-{uuid.uuid4().hex[:8]}"
    save_workflow(workflow_id, {
        "workflow_id": workflow_id,
        "status": "CREATED",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    publish_agent_event(workflow_id, "system", "WORKFLOW_CREATED")
    return workflow_id


def run_workflow(workflow_id: str, file_paths: list[str]) -> dict:
    """Execute the full Renewal Rescue pipeline.

    This is the main entry point for the orchestrator. It runs all 6 agents
    in sequence (with 3 and 4 in parallel) and returns the final result.
    """
    result: dict = {"workflow_id": workflow_id}

    try:
        # --- Agent 1: Ingestion ---
        _update_status(workflow_id, "INGESTING", "ingestion_agent")
        envelope = run_ingestion(file_paths)
        merged_text = envelope["merged_text"]
        vendor_hint = _get_vendor_hint(envelope)
        publish_agent_event(workflow_id, "ingestion_agent", "INGESTION_COMPLETE", {
            "total_documents": envelope["total_documents"],
            "vendor_hint": vendor_hint,
        })
        result["ingestion"] = {
            "total_documents": envelope["total_documents"],
            "vendor_hint": vendor_hint,
        }

        # --- Agent 2: Extraction ---
        _update_status(workflow_id, "EXTRACTING", "extraction_agent")
        contract = run_extraction(merged_text)
        save_contract(workflow_id, contract.model_dump())
        # Store vendor info in workflow for frontend lookup
        vendor_name = contract.vendor_name.value or vendor_hint or "Unknown"
        vendor_id = vendor_name.lower().replace(" ", "_")
        save_workflow(workflow_id, {
            "vendor_id": vendor_id,
            "vendor_name": vendor_name,
        })
        publish_agent_event(workflow_id, "extraction_agent", "EXTRACTION_COMPLETE", {
            "overall_confidence": contract.overall_confidence,
            "flagged_fields": contract.flagged_fields,
            "vendor_name": contract.vendor_name.value,
        })
        result["extraction"] = {
            "overall_confidence": contract.overall_confidence,
            "flagged_fields": contract.flagged_fields,
        }

        # --- Agents 3 & 4: Risk + Research (parallel) ---
        risk_report: Optional[RiskReport] = None
        vendor_intel: Optional[dict] = None

        with ThreadPoolExecutor(max_workers=2) as pool:
            # Agent 3: Risk
            _update_status(workflow_id, "ANALYZING_RISK", "risk_agent")
            risk_future = pool.submit(run_risk_analysis, contract)

            # Agent 4: Research
            _update_status(workflow_id, "RESEARCHING", "research_agent")
            vendor_name = contract.vendor_name.value or vendor_hint or "Unknown"
            research_future = pool.submit(run_research, vendor_name)

            # Collect results
            risk_report = risk_future.result(timeout=60)
            publish_agent_event(workflow_id, "risk_agent", "RISK_COMPLETE", {
                "overall_risk_score": risk_report.overall_risk_score,
                "risk_level": risk_report.risk_level,
                "flag_count": len(risk_report.flags),
            })

            try:
                vendor_intel = research_future.result(timeout=30)
                publish_agent_event(workflow_id, "research_agent", "RESEARCH_COMPLETE", {
                    "vendor_name": vendor_name,
                    "has_data": bool(vendor_intel),
                })
            except Exception:
                # Research is best-effort — proceed without it
                vendor_intel = None
                publish_agent_event(workflow_id, "research_agent", "RESEARCH_SKIPPED", {
                    "reason": "Tavily unavailable or timed out",
                })

        save_risk_report(workflow_id, risk_report.model_dump())
        result["risk"] = {
            "overall_risk_score": risk_report.overall_risk_score,
            "risk_level": risk_report.risk_level,
        }

        # --- Agent 5: Decision ---
        _update_status(workflow_id, "DECIDING", "decision_agent")
        decision = run_decision(contract, risk_report, vendor_intel)
        save_decision(workflow_id, decision.model_dump())
        publish_agent_event(workflow_id, "decision_agent", "DECISION_COMPLETE", {
            "recommendation": decision.recommendation,
            "confidence": decision.confidence,
            "urgency": decision.urgency,
            "days_to_act": decision.days_to_act,
        })
        result["decision"] = {
            "recommendation": decision.recommendation,
            "confidence": decision.confidence,
            "urgency": decision.urgency,
            "days_to_act": decision.days_to_act,
            "primary_reason": decision.primary_reason,
        }

        # Track renewal deadline
        if decision.days_to_act and contract.vendor_name.value:
            vid = contract.vendor_name.value.lower().replace(" ", "_")
            set_renewal_deadline(vid, decision.days_to_act)

        # --- Agent 6: Generation ---
        _update_status(workflow_id, "GENERATING", "generation_agent")
        artifact_bundle = run_generation(
            workflow_id, contract, risk_report, decision, vendor_intel,
        )
        save_artifacts(workflow_id, artifact_bundle.model_dump())
        publish_agent_event(workflow_id, "generation_agent", "GENERATION_COMPLETE", {
            "artifact_count": len(artifact_bundle.artifacts),
            "artifact_types": [a.artifact_type for a in artifact_bundle.artifacts],
        })
        result["artifacts"] = {
            "count": len(artifact_bundle.artifacts),
            "types": [a.artifact_type for a in artifact_bundle.artifacts],
        }

        # --- Pending approval ---
        _update_status(workflow_id, "PENDING_APPROVAL", None)
        publish_agent_event(workflow_id, "system", "AWAITING_APPROVAL", {
            "artifact_count": len(artifact_bundle.artifacts),
        })
        result["status"] = "PENDING_APPROVAL"

    except Exception as e:
        save_workflow(workflow_id, {"status": "FAILED", "error": str(e)})
        publish_agent_event(workflow_id, "system", "WORKFLOW_FAILED", {
            "error": str(e),
        })
        result["status"] = "FAILED"
        result["error"] = str(e)
        raise

    return result


def approve_workflow(workflow_id: str, user: str = "system") -> dict:
    """Approve all artifacts and mark workflow complete."""
    artifacts_data = get_artifacts(workflow_id)
    if not artifacts_data:
        raise ValueError(f"No artifacts found for workflow {workflow_id}")

    # Mark all artifacts approved
    now = datetime.now(timezone.utc).isoformat()
    for art in artifacts_data.get("artifacts", []):
        art["approval_status"] = "APPROVED"
        art["approved_by"] = user
        art["approved_at"] = now

    save_artifacts(workflow_id, artifacts_data)
    save_workflow(workflow_id, {
        "status": "COMPLETED",
        "completed_at": now,
    })

    log_audit("WORKFLOW_APPROVED", user, {"workflow_id": workflow_id})
    publish_agent_event(workflow_id, "system", "WORKFLOW_APPROVED", {
        "approved_by": user,
    })

    return artifacts_data


def _update_status(workflow_id: str, status: str, agent: Optional[str]) -> None:
    data: dict = {"status": status}
    if agent:
        data["current_agent"] = agent
    save_workflow(workflow_id, data)


def _get_vendor_hint(envelope: dict) -> str:
    hints = [d.get("vendor_hint", "") for d in envelope.get("documents", [])]
    return hints[0] if hints else "Unknown"
