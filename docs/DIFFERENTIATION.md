# Differentiation

How ContractIQ differs from everything else in the contract management space — from basic chatbots to expensive CLM platforms.

---

## The Spectrum of Contract Tools

```
Basic contract search          CLM platforms              ContractIQ
        │                           │                          │
"Ask questions                 "Store and manage          "Turn contracts
about your PDFs"               contracts in a system"     into decisions and action"

DocuSign + search           Ironclad, Icertis,            ← We are here
Contract ChatGPT wrappers   Conga, Agiloft, Coupa
```

---

## vs. Basic Contract Chatbots / RAG Apps

These are the most common hackathon submissions in the procurement space: upload a PDF, ask a question, get an answer. Many use LangChain or a simple vector store.

| Capability | Basic Contract RAG | ContractIQ |
|---|---|---|
| Answer questions about contracts | ✅ | ✅ with clause citations + recommended next action |
| Structured field extraction (40+ fields) | ❌ | ✅ |
| Confidence scoring per extracted field | ❌ | ✅ |
| Human confirmation for uncertain fields | ❌ | ✅ |
| Renewal risk detection with urgency scoring | ❌ | ✅ |
| Real-time vendor research (Tavily) | ❌ | ✅ |
| Decision recommendation with reasoning chain | ❌ | ✅ |
| Artifact generation (briefs, emails, prep sheets) | ❌ | ✅ |
| Human approval gate before any action | ❌ | ✅ |
| Immutable audit trail | ❌ | ✅ |
| Multi-agent orchestration via Watsonx | ❌ | ✅ |
| Inter-agent communication via Redis Streams | ❌ | ✅ |
| Portfolio-level spend analytics | ❌ | ✅ |

**How to answer "isn't this just a RAG chatbot?" in the Q&A:**

> "Three fundamental differences. First, we extract structured data — 40+ normalized fields per contract stored in Redis, not just raw text for retrieval. Second, we have true multi-agent orchestration with parallel execution, confidence routing, and an approval gate enforced by Watsonx Orchestrate. Third, we produce verifiable artifacts that the team can actually use — not just answers to read and forget. RAG chatbots answer questions. ContractIQ makes decisions and acts."

---

## vs. Enterprise CLM Platforms (Ironclad, Icertis, Conga)

Enterprise CLMs are expensive ($100K–$500K+/year), require 6–18 month implementations, and are designed for legal and procurement operations teams at large enterprises. They store and manage contracts well but are not AI-native decision systems.

| Capability | Enterprise CLM | ContractIQ |
|---|---|---|
| Contract storage and organization | ✅ (core feature) | ✅ |
| Structured data extraction | Partial — mostly manual entry | ✅ AI-powered, automatic |
| Natural language Q&A | ❌ or limited | ✅ |
| Real-time vendor intelligence | ❌ | ✅ (Tavily) |
| AI-generated decision recommendations | ❌ | ✅ |
| Artifact generation | ❌ | ✅ |
| Multi-agent orchestration | ❌ | ✅ |
| Time to first value | 6–18 months | Minutes after first upload |
| Price point | $100K–$500K+/year | SaaS, mid-market pricing |
| Implementation complexity | High — IT project | Upload and go |

**ContractIQ is not trying to replace a CLM.** It is the AI decision layer that sits on top of wherever contracts currently live — including existing CLMs that teams already have.

---

## vs. Other Hackathon Submissions (Expected Competition)

Based on past Enterprise Agents hackathon patterns, expected competing submissions in procurement/finance:

| Expected Competitor Type | Their Approach | ContractIQ's Advantage |
|---|---|---|
| Invoice processing agent | Automates AP workflow — single agent | ContractIQ is multi-agent with parallel execution and a visible orchestration layer |
| Spend analysis dashboard | Aggregates spend data from APIs | ContractIQ adds AI decisions and real-time vendor research on top of spend data |
| Contract chatbot | RAG over PDFs | See "vs. Basic Contract Chatbots" above |
| Procurement onboarding agent | Automates vendor setup | ContractIQ handles the full ongoing lifecycle, not just onboarding |

---

## The Real Differentiator

Every contract tool stores contracts. Many can search them. A few can extract data from them.

ContractIQ is the only one in this hackathon that:

1. **Decides** — produces a structured, reasoned recommendation (not just data)
2. **Acts** — generates every artifact needed to execute that decision
3. **Governs** — enforces confidence routing and human approval before any external action
4. **Shows its work** — the Live Agent Feed and audit trail make every step visible and traceable

The positioning is not "smarter contract search." It is "the AI system that tells you what to do about your contracts and helps you do it."

---

## One-Liner Options

Pick the one that fits the moment:

- **For the demo opening:** "ContractIQ turns scattered contracts into an active procurement operating system."
- **For the technical audience:** "Six specialized agents orchestrated by Watsonx, grounded by Tavily, and wired together with Redis — producing decisions, not just answers."
- **For the business audience:** "$315,000 in annual value for a 3-person procurement team. Payback in under 6 weeks."
- **For the Q&A:** "Not a chatbot. Not a search box. A multi-agent system that detects risk, recommends action, and generates every artifact your team needs — with humans in control at every step."
