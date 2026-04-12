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
      <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-400">
        Step 5 · Review and approve
      </p>
      <h2 className="panel-title">Approval-ready outputs</h2>
      <p className="panel-copy">
        Review the negotiation points and vendor email, then approve the draft
        you want to send.
      </p>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="glass-subtle rounded-[26px] p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">
              Negotiation talking points
            </h3>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                isApproved
                  ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                  : "border-amber-300/30 bg-amber-400/10 text-amber-100"
              }`}
            >
              {artifactPack.approvalStatus}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {artifactPack.negotiationPoints.map((point) => (
              <div
                key={point}
                className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm leading-6 text-slate-200"
              >
                {point}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(15,23,42,0.48))] p-5 shadow-[0_18px_50px_rgba(8,47,73,0.22)]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">Draft vendor email</h3>
            <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-medium text-slate-200">
              {isApproved ? "Approved" : "Draft ready"}
            </span>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/55 p-5">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-200">
              {artifactPack.draftEmail}
            </pre>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {isApproved ? (
              <span className="rounded-full bg-emerald-500/20 px-5 py-2.5 text-sm font-semibold text-emerald-100">
                Approved
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onApprove?.()}
                disabled={!workflowId}
                className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-cyan-300/40"
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
