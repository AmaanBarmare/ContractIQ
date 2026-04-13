import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** POST /api/workflows — create a new workflow with a timestamp-encoded ID */
export function POST() {
  const workflowId = `WF-DEMO-${Date.now()}`;
  return NextResponse.json({
    workflow_id: workflowId,
    status: "CREATED",
  });
}
