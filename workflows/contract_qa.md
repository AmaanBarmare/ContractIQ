# Workflow: Contract Q&A

Natural language questions answered instantly across all uploaded contracts, with clause citations and recommended next actions.

---

## Entry Point

User types a question in the Ask ContractIQ interface. No upload required — queries run against all indexed contracts in the Redis Vector index.

---

## Supported Question Types

### Portfolio-Level Questions
- "What is our total annual SaaS spend?"
- "How many active vendor contracts do we have?"
- "Which contracts renew in Q3?"
- "What is our spend renewal exposure next quarter?"

### Risk-Specific Questions
- "Which contracts have auto-renewal clauses?"
- "Which contracts have a notice period under 45 days?"
- "Do we have any contracts with uncapped liability?"
- "Which vendors have auto-renewal with no termination for convenience?"

### Compliance Questions
- "Which vendors process customer data but don't have a DPA?"
- "Which contracts are missing a breach notification SLA?"
- "Which vendors don't have a current SOC 2 Type II?"

### Vendor-Specific Questions
- "What are the key terms of our Salesforce agreement?"
- "When does our AWS contract expire?"
- "Do we have an MSA with Acme Corp?"
- "What is our annual spend on Atlassian?"

### Spend Questions
- "Who are our top 10 vendors by annual spend?"
- "What is our total cloud infrastructure spend?"
- "Which SaaS tools overlap in functionality?"
- "Are there any duplicate vendors in the same category?"

---

## Flow

```
User types question
        │
FastAPI receives query
        │
Search Agent (lightweight — not a full pipeline run)
        │
├── Route: portfolio/spend question?
│        └── Query Redis Hash index directly → aggregate across all contracts
│
├── Route: risk/compliance question?
│        └── Redis Vector Search for matching clause patterns across all contracts
│
└── Route: specific vendor question?
         └── Retrieve vendor workspace → Redis Hash for that vendor's contracts
                   │
                   ▼
         Watsonx.ai synthesizes answer from retrieved context
                   │
                   ▼
         Return: direct answer + supporting clauses + vendor refs + recommended action
```

---

## Retrieval: Redis Vector Search

For semantic questions (anything beyond simple field lookups), the system uses Redis Vector Search:

```python
def semantic_search(question: str, top_k: int = 10) -> list[dict]:
    # Embed the question
    query_embedding = watsonx_embeddings.embed(question)
    
    # Search across all indexed contract chunks
    query = (
        Query(f"*=>[KNN {top_k} @embedding $vec AS score]")
        .return_fields("text", "vendor_id", "contract_id", "doc_type", "score")
        .sort_by("score")
        .dialect(2)
    )
    
    results = redis.ft("contract_idx").search(
        query,
        query_params={"vec": np.array(query_embedding, dtype=np.float32).tobytes()}
    )
    
    return [
        {
            "text": r.text,
            "vendor_id": r.vendor_id,
            "doc_type": r.doc_type,
            "relevance_score": float(r.score)
        }
        for r in results.docs
    ]
```

---

## Answer Generation Prompt

```
You are a procurement intelligence assistant. Answer the following question based 
only on the contract data provided. Be direct and specific. If the answer cannot 
be determined from the data, say so clearly.

After your answer, suggest one relevant next action the user should take.

QUESTION:
{user_question}

RELEVANT CONTRACT EXCERPTS:
{retrieved_chunks}

PORTFOLIO METADATA:
{portfolio_summary}

Format your answer as JSON:
{
  "answer": "Direct answer to the question",
  "supporting_evidence": [
    { "vendor": "...", "clause": "...", "relevance": "why this supports the answer" }
  ],
  "confidence": 0.0-1.0,
  "caveats": "Any limitations or missing data that affects this answer",
  "recommended_action": "One specific next step the user should take"
}
```

---

## Example Interactions

### Example 1: Portfolio Risk Question

**Question:** "Which contracts have auto-renewal with a notice period under 45 days?"

**Answer:**
```json
{
  "answer": "3 contracts have auto-renewal and a notice period under 45 days: HubSpot (30-day notice, renews Aug 1), Figma (30-day notice, renews Sep 15), and Loom (no explicit notice period found — defaulting to 30 days per governing law).",
  "supporting_evidence": [
    { "vendor": "HubSpot", "clause": "This Agreement will automatically renew unless either party provides 30 days written notice...", "relevance": "Confirms auto-renewal with 30-day notice" },
    { "vendor": "Figma", "clause": "...automatic renewal for successive one-year terms unless cancelled 30 days prior...", "relevance": "Confirms 30-day notice window" }
  ],
  "confidence": 0.89,
  "caveats": "Loom notice period was not explicitly stated in the uploaded documents. California default applies.",
  "recommended_action": "Open Renewal Rescue workflow for HubSpot immediately — renewal is 22 days away."
}
```

---

### Example 2: Compliance Gap Question

**Question:** "Which vendors process customer data but don't have a DPA on file?"

**Answer:**
```json
{
  "answer": "2 vendors appear to process customer data but have no DPA in ContractIQ: Intercom and Segment. 5 other data-processing vendors have confirmed DPAs on file.",
  "supporting_evidence": [
    { "vendor": "Intercom", "clause": "...processes end-user communication data on behalf of Customer...", "relevance": "Indicates customer data processing without a DPA uploaded" },
    { "vendor": "Segment", "clause": "...Customer Data includes any data transmitted through the Service...", "relevance": "Data processing confirmed; no DPA document found in workspace" }
  ],
  "confidence": 0.84,
  "caveats": "A DPA may exist but not yet be uploaded to ContractIQ. Verify before taking compliance action.",
  "recommended_action": "Request DPAs from Intercom and Segment account teams and upload to ContractIQ."
}
```

---

## Output Format in UI

Each answer in the Ask ContractIQ interface shows:

1. **Direct answer** — the most important content, immediately visible
2. **Supporting clauses** — expandable, shows the exact contract text that supports the answer
3. **Confidence indicator** — green/yellow/red badge
4. **Caveats** — if any data is missing or uncertain
5. **Recommended next action** — one clear step with a link to the relevant workflow if applicable

---

## Saved Questions

Users can save frequently used questions. Common saved questions to pre-populate:

- "Which contracts renew in the next 90 days?"
- "Show all contracts by annual spend (highest first)"
- "Which vendors have auto-renewal active?"
- "Which contracts are missing a DPA?"
- "What is our total SaaS spend this quarter?"
