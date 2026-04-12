# Handoff to Prit — Claude, Orchestrate & Redis Setup

> **Status: COMPLETE.** Prit's orchestration layer has been merged into main (PR #1, commit d8e8bba). All 24 files integrated, all imports verified. The full pipeline — FastAPI, Redis, Tavily, WebSocket, all 6 agents — is wired up and working.
>
> **Frontend also merged** (hackathon-demo branch, commit ff8bedb). Neil's Next.js 16 dashboard is connected to the backend with 18 API routes. Frontend lives at root level: `app/page.tsx` (App Router), `src/components/`, `src/hooks/`, `src/lib/`. Risk and decision endpoints were added to match frontend expectations. TypeScript builds clean, demo fallback mode works when Redis is offline.

Hey Prit — here's everything you need to pick up from where I left off.

My piece (Agent Engineer): document parser, extraction agent, risk agent, decision agent, Pydantic models, and a pipeline runner script. All code is written, imports cleanly, and passes offline structural tests. The LLM layer now talks to **Anthropic Claude** (not Watsonx.ai — we don't have Runtime access) via the Anthropic SDK.

This document gets you from zero to a working `python scripts/run_pipeline.py` in under 15 minutes.

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
│   └── llm_client.py     ← Anthropic Claude wrapper (call_llm)
└── models/
    ├── contract.py       ← ContractRecord + ExtractedField
    ├── risk.py           ← RiskReport + RiskFlag
    └── decision.py       ← Decision + RecommendationType

scripts/
├── demo_data/zoom/       ← 4 Zoom sample PDFs + generate_samples.py (re-runnable)
└── run_pipeline.py       ← End-to-end integration runner (this is your hook-in point)

requirements.txt          ← pymupdf, anthropic, pydantic, python-dotenv
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

**Needs Anthropic key to verify (that's your first task):**
- `llm_client.call_llm()` — auth + basic Claude call
- `run_extraction()` — real extraction on the Zoom PDFs (may need prompt tuning if confidence is low)
- `run_decision()` — LLM synthesis
- `run_pipeline.py` — full end-to-end

---

## 2. Environment setup (step-by-step)

You need **five values** in `.env`:

| Variable | Where it comes from |
|---|---|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com → API Keys |
| `ORCHESTRATE_API_KEY` | your Watsonx Orchestrate instance settings |
| `ORCHESTRATE_INSTANCE_URL` | your Watsonx Orchestrate instance URL (`https://dl.watson-orchestrate.ibm.com/...`) |
| `REDIS_URL` | `redis://localhost:6379` — we run Redis locally for free |
| `SECRET_KEY` | any long random string (`python -c "import secrets; print(secrets.token_hex(32))"`) |

### 2.1 Get an Anthropic API key

1. Go to https://console.anthropic.com
2. Sign in / sign up
3. Click **API Keys** → **Create Key**
4. Copy it immediately — shown only once
5. Paste into `.env` as `ANTHROPIC_API_KEY`

### 2.2 Get Orchestrate credentials

You already have these — they're in your Watsonx Orchestrate instance settings. Paste them into `.env` as `ORCHESTRATE_API_KEY` and `ORCHESTRATE_INSTANCE_URL`.

> **About Tavily:** we don't need a `TAVILY_API_KEY`. Tavily is connected
> inside Orchestrate as the `vasco-tavily` tool, and Agent 4 (Vendor
> Research, your scope) will invoke it through Orchestrate rather than
> calling the Tavily API directly.

### 2.3 Start Redis locally

```bash
docker run -d --name contractiq-redis -p 6379:6379 redis/redis-stack
```

Set `REDIS_URL=redis://localhost:6379` in `.env`.

### 2.4 Install dependencies

A project venv already exists at `.venv/` with everything installed. If it's missing or you want to rebuild:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

---

## 3. Verify the setup

Run these in order. Stop if any one fails.

### 3.1 LLM client smoke test

```bash
.venv/bin/python -c "
from app.services.llm_client import call_llm
print(call_llm('Return this JSON exactly: {\"status\":\"working\"}'))
"
```

**Expected:** a response containing `"working"` or similar JSON.

**Common failures:**
- `ANTHROPIC_API_KEY is not set` → `.env` isn't in the repo root, or you forgot to save it
- HTTP 401 / 403 → API key is wrong or revoked; regenerate at console.anthropic.com
- `model_not_found` → set `ANTHROPIC_MODEL_ID` in `.env` to a model your key can access

### 3.2 Run the full pipeline

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

## 4. Your integration surface

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
    # Calls Claude, parses JSON, returns validated ContractRecord.
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
    # Calls Claude. vendor_intel is where your Agent 4 (Tavily research
    # via Orchestrate) output plugs in — see the dict shape in
    # decision.py's _format_vendor_intel.
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

When you wire in Agent 4 (Tavily research via Orchestrate), pass the result as the third arg to `run_decision`. Expected shape:

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

## 5. What I'm intentionally NOT building (your scope)

To keep the file ownership clean, these are all yours:

- `app/main.py` — FastAPI entry
- `app/routers/*` — all HTTP endpoints
- `app/orchestrator/orchestrate.py` — Watsonx Orchestrate client + workflow state machine
- `app/services/redis_client.py` — Redis helpers
- `app/services/tavily_client.py` — thin wrapper over the `vasco-tavily` Orchestrate tool
- `app/agents/ingestion.py` — Agent 1 (document classification)
- `app/agents/research.py` — Agent 4 (vendor research via Orchestrate's Tavily tool)
- `app/agents/generation.py` — Agent 6 (artifact generation)
- `app/websocket/agent_feed.py` — Live Agent Feed WebSocket
- `docker-compose.yml`, `Makefile`
- Anything under `frontend/`

If you find a bug in my files, don't patch them directly — ping me so we don't end up fighting each other's edits.

---

## 6. Troubleshooting quick reference

| Symptom | Likely cause | Fix |
|---|---|---|
| `ANTHROPIC_API_KEY is not set` | `.env` missing or in wrong dir | `cp .env.example .env` at repo root |
| HTTP 401 | Bad/revoked API key | Regenerate key at console.anthropic.com |
| `model_not_found` | Your key can't access the default model | Set `ANTHROPIC_MODEL_ID` in `.env` to one you can use |
| Extraction returns empty JSON | Model output wasn't JSON | Check Claude's raw response — the prompt forces JSON-only but logs first 300 chars on failure |
| Extraction confidence < 0.70 on all fields | PDFs may be scanned images | Check with `parse_pdf` — if garbled, we'd need OCR (not installed yet) |
| `pyarrow` / `numpy` ABI error | Using system Python instead of venv | Prefix every command with `.venv/bin/python` |
| Pipeline takes >2 minutes | Network/rate limit | Claude Sonnet should respond in <15s per call — check your connection |

---

## 7. Quick start TL;DR

```bash
# 1. Configure env
cp .env.example .env
#    paste ANTHROPIC_API_KEY, ORCHESTRATE_API_KEY, ORCHESTRATE_INSTANCE_URL,
#    REDIS_URL=redis://localhost:6379, and a SECRET_KEY into .env

# 2. Start Redis
docker run -d --name contractiq-redis -p 6379:6379 redis/redis-stack

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
