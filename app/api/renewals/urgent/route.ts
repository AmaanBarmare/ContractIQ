import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    urgent_renewals: [
      { vendor_id: "zoom", days_until_deadline: 34 },
    ],
    count: 1,
  });
}
