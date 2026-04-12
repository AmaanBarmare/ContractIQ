"""POST /api/qa — Contract Q&A powered by Claude."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.llm_client import call_llm
from app.services.redis_client import get_contract

router = APIRouter(prefix="/api/qa", tags=["qa"])


class QARequest(BaseModel):
    question: str
    workflow_id: str


@router.post("")
async def ask_question(req: QARequest):
    """Answer a question about an extracted contract."""
    contract = get_contract(req.workflow_id)
    if not contract:
        raise HTTPException(404, f"No contract data for workflow {req.workflow_id}")

    prompt = f"""You are a contract analysis assistant. Answer the user's question
based ONLY on the contract data below. If the answer is not in the data, say so.

CONTRACT DATA:
{contract}

USER QUESTION: {req.question}

Answer concisely and cite specific contract fields where possible."""

    answer = call_llm(prompt)
    return {"question": req.question, "answer": answer, "workflow_id": req.workflow_id}
