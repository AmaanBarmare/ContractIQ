# Business Case

ContractIQ targets mid-market procurement teams that manage hundreds of vendor contracts manually. This document lays out the market context, financial model, and measurable KPIs for the hackathon submission.

---

## Target Customer

**Company profile:**
- 500–5,000 employees
- 200–1,000 active vendor contracts
- Contracts scattered across Google Drive, email, shared folders, spreadsheets
- No dedicated CLM, or an underused CLM
- Procurement team of 2–8 people

**Primary users:** VP Procurement, Procurement Managers, Strategic Sourcing, Finance Directors, Legal Ops, IT Vendor Management, COO/CFO office.

---

## Market Context

| Statistic | Source Context |
|---|---|
| $135 billion/year | Estimated annual SaaS spend lost to unwanted auto-renewals in North America |
| 67% | Companies that miss at least one auto-renewal per quarter |
| 14 hours/week | Average procurement manager time on manual contract review, renewal tracking, and document drafting |
| 5 days | Average legal review turnaround per contract at mid-market companies |
| 12–18% | Average price reduction achievable via renegotiation when armed with benchmark data |
| $2.5M | Average total annual SaaS spend at a 1,000-person company |

---

## Baseline: Life Without ContractIQ

For a target customer — a 1,000-person company, 300 active vendor contracts, 3-person procurement team:

| Activity | Hours/Week | Annual Cost (at $85/hr fully loaded) |
|---|---|---|
| Manual contract review and renewal tracking | 14 hrs × 3 people = 42 hrs | $185,640 |
| Responding to "do we have a contract with X?" questions from other teams | 4 hrs × 3 = 12 hrs | $53,040 |
| Drafting renewal briefs, CFO summaries, vendor emails | 5 hrs × 3 = 15 hrs | $66,300 |
| Missed auto-renewals (avg 4/quarter at $18K avg unwanted spend) | — | $72,000 |
| Above-market pricing on contracts due to no benchmark data | — | $60,000+ |
| **Total Annual Cost of Manual Process** | | **~$437,000** |

---

## With ContractIQ

| Activity | Hours/Week After | Annual Saving |
|---|---|---|
| Contract review (agents handle extraction and risk flagging) | 2 hrs × 3 people = 6 hrs | $132,600 |
| Contract Q&A (instant answers via Knowledge Layer) | 0.5 hrs × 3 = 1.5 hrs | $63,765 |
| Artifact drafting (agents generate all outputs) | 0.5 hrs × 3 = 1.5 hrs | $62,985 |
| Auto-renewal misses prevented | 0 misses | $72,000 |
| Renegotiation savings (15% avg on 5 contracts × $80K avg) | — | $60,000 |
| **Total Annual Value** | | **~$391,350** |

---

## ROI Summary

| Value Driver | Annual Value |
|---|---|
| Recovered procurement team productivity | $153,000 |
| Avoided unwanted auto-renewal spend | $72,000 |
| Renegotiation savings via benchmark data | $60,000 |
| Legal review efficiency (2 fewer external hours × 50 contracts) | $30,000 |
| Reduced cross-functional interruption overhead | $36,000 |
| **Total Annual Value** | **$351,000** |
| Estimated annual platform cost (SaaS) | ~$36,000 |
| **Net Annual ROI** | **$315,000** |
| **Payback period** | **< 6 weeks** |

---

## Key Performance Indicators

These are the metrics ContractIQ is designed to move. All are measurable.

### Operational KPIs

| KPI | Baseline | ContractIQ Target |
|---|---|---|
| Procurement manager weekly contract review time | 14 hrs/week | < 2 hrs/week |
| Time from contract upload to decision recommendation | 2–5 days (manual) | < 2 minutes |
| Auto-renewal miss rate | ~67% of companies miss ≥1/quarter | 0% |
| Days in advance of deadline that renewal risk is surfaced | 0–5 days (reactive) | 30+ days |
| Contract fields with structured data available | < 20% (manual tracking) | 95%+ within 48 hrs of upload |

### Quality KPIs

| KPI | Target |
|---|---|
| Extraction confidence on critical fields (spend, renewal date, notice period) | ≥ 90% average |
| User approval rate on AI-generated recommendations | ≥ 75% (measures recommendation quality) |
| False positive risk flags (flagged as risky but actually fine) | < 10% |
| Vendor research cache hit rate (Tavily cost efficiency) | > 60% within a 7-day window |

### Business KPIs

| KPI | Target |
|---|---|
| Renegotiation win rate when ContractIQ identifies above-market pricing | ≥ 60% of flagged contracts |
| Reduction in legal review time per contract | 40% (pre-flagged issues reduce legal scope) |
| CFO summary generation time | < 60 seconds on demand |
| Portfolio spend visibility (% of spend in structured, queryable format) | 95%+ within 30 days of deployment |

---

## Why Now

Three forces are converging to make ContractIQ viable in 2026:

**1. LLM extraction quality is now production-ready.** Contract extraction with Watsonx.ai achieves 90%+ field-level accuracy on standard commercial agreements — a threshold that was not reliably achievable 18 months ago.

**2. Mid-market SaaS sprawl has hit a breaking point.** The average 1,000-person company now manages 130+ SaaS tools. The contracts behind those tools are completely unmanaged in most procurement teams.

**3. Multi-agent orchestration is now accessible.** IBM Watsonx Orchestrate provides enterprise-grade multi-agent coordination without requiring a team to build the orchestration infrastructure from scratch. ContractIQ can focus on procurement domain logic rather than plumbing.
