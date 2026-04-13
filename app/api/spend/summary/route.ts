import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    total_annual_spend: 214800,
    vendor_count: 1,
    vendors: [],
  });
}
