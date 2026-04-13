import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return params.then(({ id }) =>
    NextResponse.json({
      workflow_id: id,
      overall_risk_score: 76,
      risk_level: "HIGH",
      category_scores: {
        renewal: 85,
        commercial: 72,
        legal: 68,
        security: 35,
      },
      flags: [
        {
          id: "flag-1",
          category: "renewal",
          severity: "Critical",
          signal: "Auto-renewal deadline approaching",
          detail:
            "The 45-day notice period means the cancellation deadline is 34 days away. Missing it locks in another 12-month term at the current rate.",
          color: "RED",
          recommended_action:
            "Send notice of intent to renegotiate before the deadline.",
        },
        {
          id: "flag-2",
          category: "commercial",
          severity: "High",
          signal: "Above-market pricing detected",
          detail:
            "The per-host rate is 11-14% above comparable enterprise collaboration renewals this quarter.",
          color: "RED",
          recommended_action:
            "Request updated pricing aligned with current benchmarks.",
        },
        {
          id: "flag-3",
          category: "legal",
          severity: "Medium",
          signal: "Weak termination rights",
          detail:
            "Termination for cause only after cure period. No convenience termination right gives the vendor leverage.",
          color: "YELLOW",
          recommended_action:
            "Negotiate termination for convenience with 90-day notice.",
        },
      ],
      green_signals: [
        "DPA is present and covers required data processing terms.",
        "SOC 2 Type II certification is current.",
      ],
      confidence: 0.88,
    }),
  );
}
