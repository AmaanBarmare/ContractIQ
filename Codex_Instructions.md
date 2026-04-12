# Codex Instructions for ContractIQ

You are helping build a hackathon MVP called ContractIQ.

## Product goal
ContractIQ helps procurement teams review vendor contracts and decide whether to renew, renegotiate, cancel, or escalate. The MVP should demonstrate one flagship workflow, not a full enterprise platform.

## What to optimize for
- demoability
- clarity
- speed of implementation
- reliability of the happy path
- simple, modular code
- visually clean UI

## What NOT to optimize for
- production scale
- complex abstractions
- overengineered multi-agent systems
- broad feature coverage
- premature optimization

## Current build order
1. Create the UI shell with mock data
2. Create shared TypeScript types for the core objects
3. Wire screens together
4. Add mock API routes if needed
5. Keep all interactions deterministic and stable
6. Use placeholders where backend integrations are not ready

## MVP screens
- upload/contracts page
- live agent feed panel
- contract summary card
- recommendation card
- artifact review panel

## Core types
Implement these as shared types:

### ContractRecord
- vendorName: string
- annualValue: number | null
- renewalDate: string | null
- noticePeriodDays: number | null
- autoRenewal: boolean | null
- pricingModel: string | null
- terminationRights: string | null
- liabilityCap: string | null
- dpaPresent: boolean | null
- soc2Present: boolean | null
- extractionConfidence: Record<string, number>

### VendorResearch
- vendorName: string
- recentNews: string[]
- pricingSignals: string[]
- alternatives: string[]
- sources: string[]

### Recommendation
- decision: "RENEW" | "RENEGOTIATE" | "CANCEL" | "ESCALATE"
- confidence: number
- urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
- reasons: string[]
- nextSteps: string[]

### ArtifactPack
- negotiationPoints: string[]
- draftEmail: string
- approvalStatus: "PENDING" | "APPROVED" | "REJECTED"

## UI principles
- keep styling modern and simple
- prioritize readability over flashy effects
- use cards and clear hierarchy
- do not add unnecessary screens
- show a clean demo path on a single page first if possible

## Engineering principles
- keep files modular
- use mock data first
- do not invent new dependencies unless necessary
- do not add backend complexity before the frontend flow works
- prefer small components and explicit props
- avoid vague TODO-heavy code

## Important constraint
This is a hackathon project with a short deadline. Every feature should support the flagship demo flow.