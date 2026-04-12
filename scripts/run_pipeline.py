"""Run the ContractIQ agent pipeline on the Zoom sample contracts.

This script is the **handoff contract** between Person 1 (Agent Engineer) and
Person 2 (Integration Engineer). Person 2 should not need to modify any of the
agent/service/model files — instead, import the four public functions below
into the Watsonx Orchestrate worker:

    from app.services.parser import parse_multiple_pdfs
    from app.agents.extraction import run_extraction
    from app.agents.risk import run_risk_analysis
    from app.agents.decision import run_decision

Each function is pure (no Redis, no FastAPI state) — they take Python objects
in and return Pydantic models out, which can be serialized with
``.model_dump()`` for storage in Redis or transmission over WebSocket.

Usage (from repo root):

    python scripts/run_pipeline.py

Requires a populated ``.env`` with ``ANTHROPIC_API_KEY`` — the Extraction and
Decision agents call Claude via the Anthropic SDK.

Expected output on the Zoom demo scenario:
    * Extraction: ~16 fields, ``notice_period`` flagged ~58% confidence
    * Risk: HIGH (~56/100), 3 Critical flags, 2 green signals
    * Decision: RENEGOTIATE, ≥85% confidence, CRITICAL urgency, ~5 days to act
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

# Ensure the repo root is on sys.path so ``app.*`` imports work when the
# script is invoked directly (e.g. ``python scripts/run_pipeline.py``).
REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from app.agents.decision import run_decision  # noqa: E402
from app.agents.extraction import run_extraction  # noqa: E402
from app.agents.risk import run_risk_analysis  # noqa: E402
from app.services.parser import parse_multiple_pdfs  # noqa: E402

DEMO_DIR = REPO_ROOT / "scripts" / "demo_data" / "zoom"
DEMO_DOCS = [
    str(DEMO_DIR / "Zoom_MSA.pdf"),
    str(DEMO_DIR / "Zoom_OrderForm.pdf"),
    str(DEMO_DIR / "Zoom_Amendment.pdf"),
    str(DEMO_DIR / "Zoom_PricingSheet.pdf"),
]


def _section(title: str) -> None:
    print(f"\n=== {title} ===")


def run(docs: list[str] | None = None, vendor_intel: dict | None = None) -> None:
    docs = docs or DEMO_DOCS
    t0 = time.perf_counter()

    _section("STEP 1: PARSING")
    text = parse_multiple_pdfs(docs)
    print(f"Parsed {len(text)} characters from {len(docs)} documents")

    _section("STEP 2: EXTRACTION")
    contract = run_extraction(text)
    print(json.dumps(contract.model_dump(), indent=2, default=str))

    _section("STEP 3: RISK ANALYSIS")
    risk = run_risk_analysis(contract)
    print(json.dumps(risk.model_dump(), indent=2))

    _section("STEP 4: DECISION")
    decision = run_decision(contract, risk, vendor_intel)
    print(json.dumps(decision.model_dump(), indent=2))

    elapsed = time.perf_counter() - t0
    print(
        f"\nRESULT: {decision.recommendation} — "
        f"{decision.confidence:.0%} confidence — "
        f"{decision.urgency} urgency"
    )
    print(f"   Risk level:     {risk.risk_level} ({risk.overall_risk_score}/100)")
    print(f"   Days to act:    {decision.days_to_act}")
    print(f"   Primary reason: {decision.primary_reason}")
    print(f"   Elapsed:        {elapsed:.1f}s")


if __name__ == "__main__":
    run()
