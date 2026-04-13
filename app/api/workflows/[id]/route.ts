import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Derive the workflow status from the elapsed time since creation.
 * The workflow ID encodes the creation timestamp: WF-DEMO-{timestamp}
 */
function deriveStatus(workflowId: string) {
  const parts = workflowId.split("-");
  const ts = Number(parts[parts.length - 1]);
  const elapsed = (Date.now() - ts) / 1000;

  if (elapsed < 3)
    return { status: "INGESTING", current_agent: "Ingestion Agent" };
  if (elapsed < 6)
    return { status: "EXTRACTING", current_agent: "Extraction Agent" };
  if (elapsed < 9)
    return { status: "ANALYZING_RISK", current_agent: "Risk Agent" };
  if (elapsed < 12)
    return { status: "RESEARCHING", current_agent: "Vendor Research Agent" };
  if (elapsed < 15)
    return { status: "DECIDING", current_agent: "Decision Agent" };
  if (elapsed < 18)
    return { status: "GENERATING", current_agent: "Generation Agent" };

  return { status: "PENDING_APPROVAL", current_agent: null };
}

export function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return params.then(({ id }) => {
    const { status, current_agent } = deriveStatus(id);
    return NextResponse.json({
      workflow_id: id,
      status,
      vendor_id: "zoom",
      vendor_name: "Zoom",
      current_agent,
      document_count: "4",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: status === "PENDING_APPROVAL" ? new Date().toISOString() : null,
      error: null,
    });
  });
}

export function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return params.then(({ id }) =>
    NextResponse.json({ status: "deleted", workflow_id: id }),
  );
}
