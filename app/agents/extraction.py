"""Agent 2 — Extraction.

Takes the combined text of all contract documents for a vendor and returns a
normalized :class:`ContractRecord`. Each field has its own confidence score;
critical fields below ``CONFIDENCE_THRESHOLD`` are added to ``flagged_fields``
for human confirmation, but the rest of the record is still released to the
downstream Risk and Decision agents.

Design rules:
* Temperature is near-zero (0.05) — extraction is a deterministic task.
* The LLM is instructed to return JSON only; the parser accepts either a raw
  JSON document or a JSON block surrounded by prose / markdown fences.
* ``cancellation_deadline`` is derived from ``renewal_date - notice_period_days``
  when the LLM can't find it explicitly in the text.
"""

from __future__ import annotations

import json
import re
from datetime import date, timedelta
from typing import Any

from app.models.contract import ContractRecord, ExtractedField
from app.services.llm_client import call_llm

CONFIDENCE_THRESHOLD = 0.70
MAX_PROMPT_CHARS = 12000

CRITICAL_FIELDS: tuple[str, ...] = (
    "annual_value",
    "renewal_date",
    "cancellation_deadline",
    "notice_period",
    "auto_renewal",
)

# Fields the LLM should populate, in the order we show them in the prompt.
EXTRACTION_FIELD_NAMES: tuple[str, ...] = (
    "vendor_name",
    "annual_value",
    "pricing_model",
    "seat_count",
    "renewal_date",
    "cancellation_deadline",
    "notice_period",
    "notice_period_days",
    "auto_renewal",
    "termination_for_convenience",
    "liability_cap",
    "dpa_present",
    "governing_law",
    "soc2_type2",
    "breach_notification_sla",
    "renewal_owner",
)

EXTRACTION_PROMPT = """You are a contract data extraction specialist. Extract the fields listed below from the contract documents at the end of this prompt. For every field return the extracted value, your confidence (0.0 to 1.0), and the exact source sentence or clause it came from.

STRICT RULES:
- Only extract values that are EXPLICITLY stated in the documents. Never infer or guess.
- If a field is not present, return null for value, 0.0 for confidence, and null for source_text.
- source_text must be the exact sentence or clause you pulled the value from (max 200 chars).
- Normalize dates to YYYY-MM-DD format.
- For notice_period_days, return the integer number only, as a string (e.g. "60" not "60 days").
- For boolean-ish fields (auto_renewal, termination_for_convenience, dpa_present) return exactly "Yes" or "No".
- For soc2_type2 return exactly "Yes", "No", or "Referenced".
- Return ONLY a single valid JSON object. No markdown fences, no explanation, no prose before or after.

FIELDS TO EXTRACT:
- vendor_name: Legal name of the vendor / supplier entity.
- annual_value: Total annual contract value including currency (e.g. "$84,000 USD").
- pricing_model: How pricing is structured (e.g. "Per-seat, annual").
- seat_count: Number of licensed seats / users as a string (e.g. "180").
- renewal_date: Date the contract renews or expires (YYYY-MM-DD).
- cancellation_deadline: Last date the Customer can give notice to cancel / non-renew (YYYY-MM-DD).
- notice_period: Written notice period required to cancel, as stated (e.g. "60 days").
- notice_period_days: Notice period as integer days (e.g. "60").
- auto_renewal: Does the contract auto-renew? ("Yes" / "No")
- termination_for_convenience: Can either party terminate without cause? ("Yes" / "No")
- liability_cap: Cap on direct damages (e.g. "12 months of fees"). Use "Uncapped" if the contract says so; use null if not mentioned at all.
- dpa_present: Is a Data Processing Addendum present? ("Yes" / "No")
- governing_law: Jurisdiction whose law governs the agreement (e.g. "California").
- soc2_type2: Is a SOC 2 Type II report mentioned? ("Yes" / "No" / "Referenced")
- breach_notification_sla: Required time to notify customer of a security incident (e.g. "72 hours").
- renewal_owner: Name or role of the person responsible for the renewal decision. Usually absent from contracts — return null if not explicitly named.

RETURN FORMAT — JSON only, with exactly these keys:
{
  "vendor_name": {"value": "...", "confidence": 0.0, "source_text": "..."},
  "annual_value": {"value": "...", "confidence": 0.0, "source_text": "..."},
  "pricing_model": {"value": "...", "confidence": 0.0, "source_text": "..."},
  "seat_count": {"value": "...", "confidence": 0.0, "source_text": "..."},
  "renewal_date": {"value": "...", "confidence": 0.0, "source_text": "..."},
  "cancellation_deadline": {"value": "...", "confidence": 0.0, "source_text": "..."},
  "notice_period": {"value": "...", "confidence": 0.0, "source_text": "..."},
  "notice_period_days": {"value": "...", "confidence": 0.0, "source_text": "..."},
  "auto_renewal": {"value": "...", "confidence": 0.0, "source_text": "..."},
  "termination_for_convenience": {"value": "...", "confidence": 0.0, "source_text": "..."},
  "liability_cap": {"value": "...", "confidence": 0.0, "source_text": "..."},
  "dpa_present": {"value": "...", "confidence": 0.0, "source_text": "..."},
  "governing_law": {"value": "...", "confidence": 0.0, "source_text": "..."},
  "soc2_type2": {"value": "...", "confidence": 0.0, "source_text": "..."},
  "breach_notification_sla": {"value": "...", "confidence": 0.0, "source_text": "..."},
  "renewal_owner": {"value": "...", "confidence": 0.0, "source_text": "..."}
}

CONTRACT DOCUMENTS:
{contract_text}
"""


def extract_json(raw: str) -> dict[str, Any]:
    """Pull a JSON object out of an LLM response even if it has surrounding prose.

    Tries a direct ``json.loads`` first, then falls back to regex extraction of
    the outermost ``{ ... }`` block. Raises ``ValueError`` with a preview of the
    raw output if neither approach works — the caller is expected to log it.
    """
    stripped = raw.strip()
    # Strip markdown fences if present
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*", "", stripped)
        stripped = re.sub(r"\s*```$", "", stripped)
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{[\s\S]*\}", raw)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    raise ValueError(
        f"Could not extract JSON from LLM response. First 300 chars:\n{raw[:300]}"
    )


def _derive_cancellation_deadline(
    renewal_date_str: str | None, notice_days_str: str | None
) -> str | None:
    """Compute cancellation_deadline = renewal_date - notice_period_days."""
    if not renewal_date_str or not notice_days_str:
        return None
    try:
        renewal = date.fromisoformat(renewal_date_str)
        days = int(str(notice_days_str).strip())
        return (renewal - timedelta(days=days)).isoformat()
    except (ValueError, TypeError):
        return None


def _build_field(raw_field: Any) -> ExtractedField:
    """Coerce the LLM's field payload into an ``ExtractedField``."""
    if not isinstance(raw_field, dict):
        return ExtractedField()
    value = raw_field.get("value")
    if value in ("", "null", "None"):
        value = None
    try:
        confidence = float(raw_field.get("confidence") or 0.0)
    except (TypeError, ValueError):
        confidence = 0.0
    confidence = max(0.0, min(1.0, confidence))
    source = raw_field.get("source_text")
    if source in ("", "null"):
        source = None
    return ExtractedField(
        value=None if value is None else str(value),
        confidence=confidence,
        source_text=None if source is None else str(source),
    )


def build_contract_record(data: dict[str, Any]) -> ContractRecord:
    """Convert parsed LLM JSON into a validated ``ContractRecord``.

    Handles:
    * coercing every field to ``ExtractedField``
    * deriving ``cancellation_deadline`` when missing
    * computing ``overall_confidence`` across found fields
    * populating ``flagged_fields`` (present but below threshold) and
      ``missing_fields`` (entirely absent)

    Exposed as a separate function so tests can validate the post-processing
    logic without actually calling Watsonx.
    """
    fields: dict[str, ExtractedField] = {
        name: _build_field(data.get(name)) for name in EXTRACTION_FIELD_NAMES
    }

    # Derive cancellation_deadline if the model didn't find it but we have the
    # ingredients for it.
    cancel = fields["cancellation_deadline"]
    if not cancel.value:
        derived = _derive_cancellation_deadline(
            fields["renewal_date"].value,
            fields["notice_period_days"].value,
        )
        if derived:
            fields["cancellation_deadline"] = ExtractedField(
                value=derived,
                confidence=0.75,
                source_text="Derived: renewal_date minus notice_period_days",
            )

    flagged = [
        name
        for name in CRITICAL_FIELDS
        if fields[name].value and fields[name].confidence < CONFIDENCE_THRESHOLD
    ]
    missing = [name for name in CRITICAL_FIELDS if not fields[name].value]

    found_confidences = [f.confidence for f in fields.values() if f.value]
    overall = (
        round(sum(found_confidences) / len(found_confidences), 3)
        if found_confidences
        else 0.0
    )

    return ContractRecord(
        **fields,
        overall_confidence=overall,
        flagged_fields=flagged,
        missing_fields=missing,
    )


def run_extraction(contract_text: str) -> ContractRecord:
    """Run the Extraction Agent end-to-end.

    1. Trim to ``MAX_PROMPT_CHARS`` to stay inside the token budget.
    2. Call Watsonx with the extraction prompt at temperature 0.05.
    3. Parse the JSON response and assemble a ``ContractRecord``.
    """
    prompt = EXTRACTION_PROMPT.replace("{contract_text}", contract_text[:MAX_PROMPT_CHARS])
    raw = call_llm(prompt, temperature=0.05)
    data = extract_json(raw)
    return build_contract_record(data)
