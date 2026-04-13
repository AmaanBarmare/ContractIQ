import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return params.then(({ id }) =>
    NextResponse.json({
      workflow_id: id,
      documents_uploaded: 4,
      status: "UPLOADED",
    }),
  );
}
