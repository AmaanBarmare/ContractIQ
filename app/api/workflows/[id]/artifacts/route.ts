import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return params.then(({ id }) =>
    NextResponse.json({
      workflow_id: id,
      artifacts: [
        {
          artifact_id: "art-1",
          artifact_type: "negotiation_brief",
          title: "Negotiation Talking Points",
          content:
            "1. Reset Zoom renewal pricing to current market benchmarks for enterprise collaboration.\n2. Cap annual uplift at 3% and preserve downgrade flexibility through the next term.\n3. Replace termination-for-cause-only language with stronger customer exit protections.\n4. Tighten the liability cap from 18 months of fees to standard 12-month SaaS terms.\n5. Keep pressure from Microsoft Teams and Google Meet explicit in the negotiation.",
          approval_status: "DRAFT_PENDING_APPROVAL",
          approved_by: null,
          approved_at: null,
        },
        {
          artifact_id: "art-2",
          artifact_type: "vendor_email",
          title: "Draft Vendor Email",
          content:
            "Hi Zoom team,\n\nWe reviewed the renewal packet and would like to reopen a few commercial items before we finalize the next term. Based on our internal benchmark review, the quoted pricing appears high for the current deployment, and the current contract language does not give us enough flexibility if usage changes during the term.\n\nTo move forward, we need updated pricing, a capped annual uplift, and better flexibility around termination or downgrade rights. We would also like to revisit the current liability position so it is more in line with our standard SaaS terms.\n\nIf you can send revised pricing and redlines this week, we can review quickly ahead of the notice deadline.\n\nBest,\nProcurement Team",
          approval_status: "DRAFT_PENDING_APPROVAL",
          approved_by: null,
          approved_at: null,
        },
        {
          artifact_id: "art-3",
          artifact_type: "risk_summary",
          title: "Risk Summary for Stakeholders",
          content:
            "Overall risk: HIGH (76/100). Two critical flags: approaching auto-renewal deadline (34 days) and above-market pricing (11-14% over benchmark). Legal risk is medium due to weak termination rights. Security posture is satisfactory with DPA and SOC 2 Type II in place.",
          approval_status: "DRAFT_PENDING_APPROVAL",
          approved_by: null,
          approved_at: null,
        },
        {
          artifact_id: "art-4",
          artifact_type: "savings_analysis",
          title: "Potential Savings Analysis",
          content:
            "Estimated annual savings from renegotiation: $23,000 - $30,000. Primary levers: per-host rate reset to benchmark (-11-14%), removal of unused webinar licenses, and capped annual uplift (3% vs current 8%).",
          approval_status: "DRAFT_PENDING_APPROVAL",
          approved_by: null,
          approved_at: null,
        },
        {
          artifact_id: "art-5",
          artifact_type: "approval_checklist",
          title: "Approval Checklist",
          content:
            "Procurement: Send intent-to-renegotiate notice, request updated pricing.\nLegal: Review revised termination language, update liability cap.\nIT: Assess usage data for right-sizing, evaluate alternatives.",
          approval_status: "DRAFT_PENDING_APPROVAL",
          approved_by: null,
          approved_at: null,
        },
      ],
    }),
  );
}
