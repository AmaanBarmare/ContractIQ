import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return params.then(({ id: _id }) =>
    NextResponse.json({
      vendor_name: { value: "Zoom", confidence: 0.99, confirmed: true },
      annual_value: { value: "214800", confidence: 0.96, confirmed: true },
      pricing_model: {
        value:
          "Annual enterprise subscription with named host licenses and webinar add-ons",
        confidence: 0.89,
        confirmed: true,
      },
      seat_count: { value: "850", confidence: 0.92, confirmed: true },
      renewal_date: { value: "2026-07-31", confidence: 0.95, confirmed: true },
      cancellation_deadline: {
        value: "2026-06-16",
        confidence: 0.88,
        confirmed: true,
      },
      notice_period: {
        value: "45 days written notice prior to renewal",
        confidence: 0.58,
        confirmed: false,
      },
      notice_period_days: { value: "45", confidence: 0.58, confirmed: false },
      auto_renewal: { value: "true", confidence: 0.91, confirmed: true },
      termination_for_convenience: {
        value:
          "Termination for cause only after cure period; no convenience termination right",
        confidence: 0.87,
        confirmed: true,
      },
      liability_cap: {
        value:
          "18 months of fees with carve-outs for confidentiality, IP, and data incidents",
        confidence: 0.83,
        confirmed: true,
      },
      dpa_present: { value: "true", confidence: 0.98, confirmed: true },
      governing_law: {
        value: "State of California",
        confidence: 0.94,
        confirmed: true,
      },
      soc2_type2: { value: "true", confidence: 0.96, confirmed: true },
      breach_notification_sla: {
        value: "72 hours",
        confidence: 0.85,
        confirmed: true,
      },
      renewal_owner: {
        value: "Procurement Team",
        confidence: 0.78,
        confirmed: true,
      },
      overall_confidence: 0.88,
      flagged_fields: ["notice_period", "notice_period_days"],
      missing_fields: [],
    }),
  );
}
