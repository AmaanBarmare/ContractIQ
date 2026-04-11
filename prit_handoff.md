# Handoff to Prit — IBM Watsonx Setup & Integration

Hey Prit — here's everything you need to pick up from where I left off.

My piece (Agent Engineer): document parser, extraction agent, risk agent, decision agent, Pydantic models, and a pipeline runner script. All code is written, imports cleanly, and passes offline structural tests. What's **not** yet verified is the actual Watsonx.ai calls — we need your IBM credentials for that, and you'll be the first one to run the full pipeline end-to-end.

This document gets you from zero to a working `python scripts/run_pipeline.py` in under 30 minutes.

---

## 1. What's already done

```
app/
├── agents/
│   ├── extraction.py     ← Agent 2: parses contracts → ContractRecord (16 fields, per-field confidence)
│   ├── risk.py           ← Agent 3: rule-based risk scoring → RiskReport (no LLM call)
│   └── decision.py       ← Agent 5: LLM synthesis → Decision (RENEGOTIATE / CANCEL / etc.)
├── services/
│   ├── parser.py         ← PyMuPDF wrapper (parse_pdf, parse_multiple_pdfs)
│   └── llm_client.py     ← Watsonx.ai wrapper (call_llm)
└── models/
    ├── contract.py       ← ContractRecord + ExtractedField
    ├── risk.py           ← RiskReport + RiskFlag
    └── decision.py       ← Decision + RecommendationType

scripts/
├── demo_data/zoom/       ← 4 Zoom sample PDFs + generate_samples.py (re-runnable)
└── run_pipeline.py       ← End-to-end integration runner (this is your hook-in point)

requirements.txt          ← pymupdf, ibm-watsonx-ai, pydantic, python-dotenv
.env.example              ← Copy to .env and fill in
```

**Offline-verified (already confirmed working):**
- Pydantic models validate
- Parser reads all 4 Zoom PDFs cleanly
- JSON extraction logic handles markdown fences and prose wrappers
- `cancellation_deadline` derivation: `renewal_date - notice_period_days` → `2026-04-16`
- Risk agent on Zoom scenario: **HIGH (56/100)**, 3 Critical flags + 2 green signals
- Risk agent on clean contract: **LOW (0/100)**, 4 greens, 0 flags (false-positive guard)
- Decision agent's JSON parser handles well-formed AND garbage LLM output

**Needs Watsonx to verify (that's your first task):**
- `llm_client.call_llm()` — auth + model availability
- `run_extraction()` — real extraction on the Zoom PDFs (may need prompt tuning if confidence is low)
- `run_decision()` — LLM synthesis
- `run_pipeline.py` — full end-to-end

---

## 2. IBM Watsonx setup (step-by-step)

You need **three values**: `WATSONX_API_KEY`, `WATSONX_URL`, `WATSONX_PROJECT_ID`. Here's how to get each.

### 2.1 Create an IBM Cloud account

1. Go to https://cloud.ibm.com/registration
2. Sign up with your email (free tier works — no credit card needed for Watsonx trial)
3. Verify your email and log in

### 2.2 Provision Watsonx.ai

1. In IBM Cloud, open the catalog: https://cloud.ibm.com/catalog
2. Search for **"Watsonx.ai Runtime"** (sometimes listed as "watsonx.ai" or "Machine Learning")
3. Click it → select the **Lite** plan (free tier)
4. Pick a region — **Dallas (us-south)** is the default and what our code is configured for
5. Click **Create**

This provisions the ML service. Takes ~1 minute.

### 2.3 Create a Watsonx project

Watsonx requires every API call to be scoped to a project. This is where your `WATSONX_PROJECT_ID` comes from.

1. Go to https://dataplatform.cloud.ibm.com/projects
2. Click **New project** → **Create an empty project**
3. Name it something like `contractiq-hackathon`
4. When prompted to associate a storage service, pick **Cloud Object Storage (Lite)** — free tier
5. Click **Create**
6. Once the project opens, go to the **Manage** tab → **General**
7. Scroll to **Details** → copy the **Project ID** (UUID format, looks like `a1b2c3d4-...`)

**Save this as `WATSONX_PROJECT_ID`.**

### 2.4 Associate the Watsonx.ai service with the project

Critical step — easy to miss.

1. Still in your project, go to **Manage** → **Services & integrations**
2. Click **Associate service**
3. Pick the Watsonx.ai Runtime instance you created in 2.2
4. Click **Associate**

Without this, API calls return a 403 "project not authorized" error.

### 2.5 Create an API key

1. Go to https://cloud.ibm.com/iam/apikeys
2. Click **Create** (top right)
3. Name it `contractiq-hackathon`
4. Click **Create**
5. **Copy the key immediately** — it's shown only once. If you close the dialog without copying, you have to create a new one.

**Save this as `WATSONX_API_KEY`.**

### 2.6 Confirm the URL

The `WATSONX_URL` value depends on your region:

| Region | URL |
|---|---|
| Dallas (us-south) — default | `https://us-south.ml.cloud.ibm.com` |
| Frankfurt (eu-de) | `https://eu-de.ml.cloud.ibm.com` |
| London (eu-gb) | `https://eu-gb.ml.cloud.ibm.com` |
| Tokyo (jp-tok) | `https://jp-tok.ml.cloud.ibm.com` |

If you picked Dallas in step 2.2, leave the default in `.env.example` as-is.

### 2.7 Confirm a model is accessible

Our default model is `ibm/granite-3-8b-instruct` (a current Granite 3 instruct model). To confirm it's available in your project:

1. In your Watsonx project, open the **Assets** tab
2. Click **New asset** → **Prompt Lab** (or just go to https://dataplatform.cloud.ibm.com/wx/prompts)
3. Look at the model dropdown — you should see `granite-3-8b-instruct` (or similar). Try sending a test prompt.

If `granite-3-8b-instruct` isn't listed, pick any available Granite instruct model or Llama model and note its model ID. Common working alternatives:
- `ibm/granite-3-2b-instruct` (smaller, faster)
- `ibm/granite-13b-instruct-v2` (legacy but often still available)
- `meta-llama/llama-3-3-70b-instruct` (more capable, slightly slower)

---

## 3. Configure the project

### 3.1 Copy the env template

From the repo root:

```bash
cp .env.example .env
```

### 3.2 Fill in `.env`

Open `.env` and paste in the three values:

```bash
WATSONX_API_KEY=<paste from step 2.5>
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_PROJECT_ID=<paste from step 2.3>

# Only uncomment if granite-3-8b-instruct isn't available in your project:
# WATSONX_MODEL_ID=ibm/granite-3-2b-instruct
```

`.env` is already in `.gitignore` — do **not** commit it.

### 3.3 Install dependencies

A project venv already exists at `.venv/` with everything installed. If it's missing or you want to rebuild:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

---

## 4. Verify the setup

Run these in order. Stop if any one fails — no point running later steps until earlier ones work.

### 4.1 LLM client smoke test

```bash
.venv/bin/python -c "
from app.services.llm_client import call_llm
print(call_llm('Return this JSON exactly: {\"status\":\"working\"}'))
"
```

**Expected:** a response containing `"working"` or similar JSON.

**Common failures:**
- `WATSONX_API_KEY is not set` → `.env` isn't in the repo root, or you forgot to save it
- HTTP 401 / 403 → API key is wrong, or the service isn't associated with the project (step 2.4)
- `Model not found` → set `WATSONX_MODEL_ID` to a model that exists in your project (step 2.7)

### 4.2 Run the full pipeline

```bash
.venv/bin/python scripts/run_pipeline.py
```

**Expected final line:**
```
RESULT: RENEGOTIATE — ≥85% confidence — CRITICAL urgency
   Risk level:     HIGH (56/100)
   Days to act:    5
```

Each of the 4 stages prints its output as JSON. Total runtime should be under 60 seconds.

**If extraction confidence is low** (e.g. critical fields below 70%), we'll need to tune the extraction prompt in `app/agents/extraction.py`. Ping me before making changes — I'll have context on which fields matter most.

---

## 5. Your integration surface

For your Watsonx Orchestrate + Redis work, these are the **only four functions** you need to import. Do not modify the files behind them:

```python
from app.services.parser import parse_multiple_pdfs
from app.agents.extraction import run_extraction
from app.agents.risk import run_risk_analysis
from app.agents.decision import run_decision
```

### Function signatures

```python
parse_multiple_pdfs(file_paths: Iterable[str]) -> str
    # Reads 1+ PDF files, returns merged text tagged with
    # "=== DOCUMENT: filename ===" delimiters.

run_extraction(contract_text: str) -> ContractRecord
    # Calls Watsonx, parses JSON, returns validated ContractRecord.
    # Every field is an ExtractedField with value/confidence/source_text.
    # .flagged_fields lists critical fields below 70% confidence.

run_risk_analysis(contract: ContractRecord) -> RiskReport
    # Pure Python, no LLM call, no network. Safe to call from any worker.
    # Returns overall score, risk level, category scores, flags, green signals.

run_decision(
    contract: ContractRecord,
    risk_report: RiskReport,
    vendor_intel: Optional[dict] = None,
) -> Decision
    # Calls Watsonx. vendor_intel is where your Agent 4 (Tavily research)
    # output plugs in — see the dict shape in decision.py's _format_vendor_intel.
```

### Serializing to Redis

Every return type is a Pydantic model. Use `.model_dump()` to get a JSON-safe dict:

```python
contract = run_extraction(text)
redis.hset(f"contract:{workflow_id}", mapping={
    "data": json.dumps(contract.model_dump(), default=str)
})
```

For the Live Agent Feed (Redis Stream), each agent completion can publish an event like:

```python
redis.xadd("agent_events", {
    "workflow_id": workflow_id,
    "source_agent": "extraction_agent",
    "event_type": "EXTRACTION_COMPLETE",
    "payload": json.dumps({
        "overall_confidence": contract.overall_confidence,
        "flagged_fields": contract.flagged_fields,
    }),
})
```

### Vendor intel dict shape

When you wire in Agent 4 (Tavily research), pass the result as the third arg to `run_decision`. Expected shape:

```python
vendor_intel = {
    "company_health": {"summary": "Stable, profitable"},
    "pricing_benchmark": {"benchmark_assessment": "ABOVE_MARKET (+15%)"},
    "key_finding": "Recent pressure from Teams and Google Meet",
    "alternatives": [
        {"vendor": "Google Meet"},
        {"vendor": "Microsoft Teams"},
    ],
}
```

If you pass `None` (or omit it), the decision agent falls back to reasoning from contract + risk only — which is how it's wired in `scripts/run_pipeline.py` today.

---

## 6. What I'm intentionally NOT building (your scope)

To keep the file ownership clean, these are all yours:

- `app/main.py` — FastAPI entry
- `app/routers/*` — all HTTP endpoints
- `app/orchestrator/watsonx.py` — Watsonx Orchestrate client + workflow state machine
- `app/services/redis_client.py` — Redis helpers
- `app/services/tavily_client.py` — Tavily wrapper
- `app/agents/ingestion.py` — Agent 1 (document classification)
- `app/agents/research.py` — Agent 4 (Tavily research)
- `app/agents/generation.py` — Agent 6 (artifact generation)
- `app/websocket/agent_feed.py` — Live Agent Feed WebSocket
- `docker-compose.yml`, `Makefile`
- Anything under `frontend/`

If you find a bug in my files, don't patch them directly — ping me so we don't end up fighting each other's edits.

---

## 7. Troubleshooting quick reference

| Symptom | Likely cause | Fix |
|---|---|---|
| `WATSONX_API_KEY is not set` | `.env` missing or in wrong dir | `cp .env.example .env` at repo root |
| HTTP 401 | Bad API key | Regenerate key (step 2.5), paste fresh |
| HTTP 403 "project not authorized" | Service not associated with project | Step 2.4 — associate Watsonx.ai Runtime |
| `Model not found` / `model_id invalid` | Model unavailable in region | Set `WATSONX_MODEL_ID` in `.env` to a model from step 2.7 |
| Extraction returns empty JSON | Prompt too long for model context | Model has <8k token limit — try a larger model via `WATSONX_MODEL_ID` |
| Extraction confidence < 0.70 on all fields | PDFs may be scanned images | Check with `parse_pdf` — if garbled, we'd need LlamaParse (not installed yet) |
| `pyarrow` / `numpy` ABI error | Using system Python instead of venv | Prefix every command with `.venv/bin/python` |
| Pipeline takes >2 minutes | Using a 70B model | Switch to a Granite 3 8B model |

---

## 8. Quick start TL;DR

```bash
# 1. Set up IBM Cloud + Watsonx (steps 2.1-2.7)
# 2. Configure env
cp .env.example .env
#    (paste your 3 Watsonx values into .env)

# 3. Verify
.venv/bin/python -c "from app.services.llm_client import call_llm; print(call_llm('say hello'))"

# 4. Run full demo
.venv/bin/python scripts/run_pipeline.py
```

Expected output ending:
```
RESULT: RENEGOTIATE — 91% confidence — CRITICAL urgency
   Risk level:     HIGH (56/100)
   Days to act:    5
   Primary reason: Cancellation deadline 5 days out with 3 Critical legal flags
```

---

Ping me (Amaan) if anything breaks. Good luck with the orchestrator piece.
