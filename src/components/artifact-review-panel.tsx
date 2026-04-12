import type { ArtifactPack } from "@/lib/types";

export function ArtifactReviewPanel({
  artifactPack,
  onApprove,
  workflowId,
}: {
  artifactPack: ArtifactPack;
  onApprove?: () => Promise<void>;
  workflowId?: string | null;
}) {
  const isApproved = artifactPack.approvalStatus === "APPROVED";

  return (
    <section className="panel-surface h-full">
      <p className="eyebrow">Artifact review</p>
      <p className="mt-3 text-xs font-bold uppercase tracking-widest text-gray-400">
        Step 5 · Review and approve
      </p>
      <h2 className="panel-title">Approval-ready outputs</h2>
      <p className="panel-copy">
        Review the negotiation points and vendor email, then approve the draft
        you want to send.
      </p>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="glass-subtle rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Negotiation talking points
            </h3>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                isApproved
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              {artifactPack.approvalStatus}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {artifactPack.negotiationPoints.map((point, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-gray-700"
              >
                {point}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-linear-to-b from-blue-50/60 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Draft vendor email</h3>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-gray-500">
              {isApproved ? "Approved" : "Draft ready"}
            </span>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
            <pre className="whitespace-pre-wrap font-mono text-[0.8125rem] leading-relaxed text-gray-700">
              {artifactPack.draftEmail}
            </pre>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {isApproved ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700">
                Approved
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onApprove?.()}
                disabled={!workflowId}
                className="btn-primary disabled:pointer-events-none"
              >
                Approve all artifacts
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
