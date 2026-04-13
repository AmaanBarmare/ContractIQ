import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return params.then(({ id }) =>
    NextResponse.json({
      workflow_id: id,
      recommendation: "RENEGOTIATE",
      confidence: 0.91,
      urgency: "CRITICAL",
      days_to_act: 34,
      primary_reason:
        "The auto-renewal deadline is 34 days away and the current pricing is 11-14% above market benchmarks.",
      reasoning: [
        "The notice window is closing and the auto-renewal clause is still live.",
        "The quoted renewal price on Zoom appears above current benchmark ranges.",
        "Termination for cause only after cure period leaves too little flexibility if usage changes.",
        "Microsoft Teams, Google Meet, and Webex Suite give us real negotiating leverage.",
      ],
      risks_if_no_action:
        "Missing the 45-day notice deadline auto-renews the contract for another 12 months at an 8% uplift with no downgrade flexibility.",
      potential_savings: "$23,000 - $30,000 annually",
      negotiation_leverage: [
        "Above-market pricing gives strong grounds for a reset to current benchmarks.",
        "Three viable alternatives (Teams, Meet, Webex) provide real switching leverage.",
        "Unused webinar licenses can be traded for lower per-host pricing.",
      ],
      next_steps: [
        "Confirm the 45-day notice period in the uploaded packet today.",
        "Push Zoom for lower pricing, a capped uplift, and better exit flexibility.",
        "Send the vendor email before the notice deadline tightens further.",
      ],
      stakeholder_checklist: {
        procurement: [
          "Send intent-to-renegotiate notice",
          "Request updated pricing",
        ],
        legal: ["Review revised termination language", "Update liability cap"],
        it: ["Assess usage data for right-sizing", "Evaluate alternatives"],
      },
    }),
  );
}
