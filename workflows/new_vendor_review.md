# Workflow: New Vendor Review

Triggered when a new vendor contract is uploaded for the first time. Extracts all terms, flags risks, researches the vendor, and produces an approval recommendation before the contract is signed or activated.

---

## When It Triggers

- A new vendor workspace is created (no prior contracts in system)
- A new contract document is uploaded for a vendor with no existing agreements
- A user explicitly starts a "New Vendor Review" from the dashboard

---

## Key Difference from Renewal Rescue

Renewal Rescue is about a decision deadline — action must happen by a specific date.

New Vendor Review is about a quality gate — a contract should not be executed until ContractIQ has reviewed it and produced an approval recommendation. There is no deadline pressure, but there is a decision gate.

---

## Flow

```
New vendor contract uploaded
        │
Ingestion Agent → Extraction Agent
        │
        ├── Missing fields?
        │   └── Generate "Document Request List" — ask for missing items
        │       (e.g. "DPA not found — request from vendor", "SOC 2 not uploaded")
        │
        ├── Risk Agent: flag all issues in the new contract
        │
        ├── Vendor Research Agent: research the vendor from scratch
        │
        └── Decision Agent:
            APPROVE / APPROVE_WITH_CONDITIONS / REQUEST_REVISIONS / ESCALATE
```

---

## Decision Types for New Vendor Review

| Decision | Meaning |
|---|---|
| `APPROVE` | Contract terms are acceptable, vendor checks out, proceed to execution |
| `APPROVE_WITH_CONDITIONS` | Acceptable if specific items are addressed (e.g. "add DPA before signing") |
| `REQUEST_REVISIONS` | Key terms need to be renegotiated before this can be approved |
| `ESCALATE_LEGAL` | Legal review required before any approval can be issued |
| `ESCALATE_SECURITY` | IT security review required due to data handling concerns |

---

## Output

- Vendor approval recommendation with reasoning
- Missing document checklist (what to request from vendor)
- Redline suggestions (specific clauses that should be changed)
- Legal review request (if legal flags present)
- Security review request (if security flags present)
- Vendor research summary (who is this vendor?)
