# ContractIQ MVP Brief

ContractIQ is a hackathon MVP for procurement / contract renewal decisions.

## Goal
Build a demoable workflow where a user uploads 3–4 vendor contract documents, the system extracts key renewal data, flags risk, pulls live vendor context, recommends an action, and generates draft artifacts for approval.

## Core demo flow
1. User uploads sample Zoom contract docs
2. System extracts key fields
3. One field is low-confidence and requires user confirmation
4. System flags renewal/commercial risk
5. System pulls live vendor research
6. System recommends Renew / Renegotiate / Cancel / Escalate
7. System generates:
   - negotiation talking points
   - draft vendor email
8. User reviews artifacts and approves them

## Build priorities
- First: UI and happy path with mock data
- Second: typed schemas and clean data flow
- Third: backend/API integration
- Fourth: real orchestration and tools

## Out of scope for now
- full CLM platform
- 40+ field extraction
- perfect PDF parsing
- portfolio analytics
- complex auth
- production infra

## Required screens
- Upload page
- Live Agent Feed
- Contract Summary
- Recommendation Card
- Artifact Review Panel

## Required data objects
- ContractRecord
- VendorResearch
- Recommendation
- ArtifactPack

## Hackathon principle
Depth over breadth. A polished end-to-end demo beats many half-built features.