# ContractIQ

ContractIQ is a hackathon project for procurement teams dealing with SaaS renewals. The repo now includes:

- a polished single-page Next.js demo frontend
- backend architecture, API contracts, agent specs, and workflow docs
- FastAPI-oriented backend source directories and models from the orchestration workstream

The main demo flow is:

1. upload a vendor packet
2. extract key contract terms
3. surface renewal risk
4. recommend an action
5. review negotiation artifacts

The frontend is optimized for a Zoom renewal scenario and automatically falls back to a built-in demo mode if backend workflow calls are unavailable.

## Repo Layout

```text
ContractIQ/
├── src/                     # Next.js frontend app
├── public/                  # Frontend static assets
├── app/                     # Backend source package
├── api/                     # Backend API reference
├── agents/                  # Agent design docs
├── workflows/               # Workflow design docs
├── modules/                 # Extraction/risk module docs
├── docs/                    # Demo guide and project context
├── package.json             # Frontend package manifest
└── requirements.txt         # Backend Python dependencies
```

## Frontend Demo

Install frontend dependencies:

```bash
npm install
```

Run the demo frontend:

```bash
PORT=3003 npm run dev
```

Open [http://localhost:3003](http://localhost:3003).

## Backend Integration

The frontend is configured to call a backend at:

```text
http://localhost:8000
```

It expects the workflow-oriented endpoints documented in [api/API_REFERENCE.md](api/API_REFERENCE.md), including:

- `POST /api/workflows`
- `POST /api/workflows/{workflow_id}/documents`
- `GET /api/workflows/{workflow_id}`
- `GET /api/contracts/{vendor_id}`
- `GET /api/workflows/{workflow_id}/decision`
- `GET /api/workflows/{workflow_id}/artifacts`

If those endpoints are not available, the UI automatically switches to a reliable Zoom demo state so the live walkthrough still works.

## Demo Notes

- The default polished scenario is a Zoom renewal packet.
- The page is intentionally single-page and demo-first.
- Recommendation, agent feed, contract summary, and artifact review stay coherent in fallback mode.

## Key Files

- `src/app/page.tsx`
  Single-page dashboard composition.
- `src/hooks/use-workflow.ts`
  Frontend orchestration hook for workflow creation, upload, polling, and fallback.
- `src/lib/api-client.ts`
  Typed frontend client for backend calls.
- `src/lib/adapters.ts`
  Adapter boundary between raw backend responses and UI models.
- `src/lib/mock-data.ts`
  Zoom-first demo scenario and deterministic fallback content.

## Supporting Docs

- [api/API_REFERENCE.md](api/API_REFERENCE.md)
- [docs/DEMO_GUIDE.md](docs/DEMO_GUIDE.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [TECH_STACK.md](TECH_STACK.md)
