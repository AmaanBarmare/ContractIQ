import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return params.then(({ id }) =>
    NextResponse.json({
      status: "approved",
      workflow_id: id,
    }),
  );
}
