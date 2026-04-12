import type { Recommendation, VendorResearch } from "@/lib/types";

const urgencyStyles: Record<Recommendation["urgency"], string> = {
  LOW: "text-sky-100 bg-sky-400/12 border-sky-300/25",
  MEDIUM: "text-amber-100 bg-amber-400/12 border-amber-300/25",
  HIGH: "text-rose-100 bg-rose-400/12 border-rose-300/25",
  CRITICAL: "text-rose-50 bg-rose-500/18 border-rose-300/30",
};

export function RecommendationCard({
  recommendation,
  vendorResearch,
  deadlineCallout,
}: {
  recommendation: Recommendation;
  vendorResearch: VendorResearch;
  deadlineCallout: {
    label: string;
    value: string;
    detail: string;
  };
}) {
  return (
    <section className="panel-surface h-full border-rose-500/25 bg-[linear-gradient(165deg,rgba(63,10,26,0.5)_0%,rgba(9,9,11,0.95)_45%,rgba(3,7,18,1)_100%)] shadow-[0_32px_100px_rgba(190,18,60,0.22)]">
      <p className="eyebrow">Recommendation</p>
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.22em] text-zinc-600">
        Step 4 · Decide the action
      </p>
      <h2 className="panel-title">Take action now</h2>
      <p className="panel-copy">
        This contract is likely to auto-renew at above-market pricing. Renegotiate
        before the notice window closes.
      </p>

      <article className="mt-6 rounded-[30px] border border-rose-300/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(120,17,45,0.1))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-rose-100/70">
              Recommended decision
            </p>
            <h3 className="font-display mt-2 text-4xl font-extrabold tracking-[-0.05em] text-white sm:text-6xl">
              {recommendation.decision}
            </h3>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${urgencyStyles[recommendation.urgency]}`}
          >
            {recommendation.urgency}
          </span>
        </div>

        <div className="mt-5 rounded-3xl border border-amber-300/24 bg-amber-300/12 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-amber-100/75">
                {deadlineCallout.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                {deadlineCallout.value}
              </p>
            </div>
            <span className="rounded-full border border-amber-300/30 bg-amber-200/12 px-3 py-1 text-xs font-semibold text-amber-100">
              confirm notice period
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-50/85">
            {deadlineCallout.detail}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-white/8 bg-black/10 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Confidence
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {Math.round(recommendation.confidence * 100)}%
            </p>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-300">
            The pricing gap, renewal timing, and weak contract terms are clear
            enough to move now while the notice clause is being confirmed.
          </p>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Why act now
            </p>
            <div className="mt-3 space-y-3">
              {recommendation.reasons.map((reason, idx) => (
                <p
                  key={idx}
                  className="glass-subtle rounded-2xl px-4 py-3 text-sm leading-6 text-slate-200"
                >
                  {reason}
                </p>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Next moves
            </p>
            <div className="mt-3 space-y-2">
              {recommendation.nextSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-cyan-300/14 bg-cyan-300/8 px-4 py-3 text-sm text-slate-100"
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        <details className="mt-6 rounded-2xl border border-white/8 bg-slate-950/28 px-4 py-3">
          <summary className="cursor-pointer list-none text-sm font-medium text-slate-200">
            View supporting vendor research
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-cyan-100">Recent news</p>
              <div className="mt-2 space-y-2">
                {vendorResearch.recentNews.map((item, idx) => (
                  <div
                    key={idx}
                    className="glass-subtle rounded-2xl px-4 py-3 text-sm text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-cyan-100">Pricing signals</p>
              <div className="mt-2 space-y-2">
                {vendorResearch.pricingSignals.map((item, idx) => (
                  <div
                    key={idx}
                    className="glass-subtle rounded-2xl px-4 py-3 text-sm text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="glass-subtle rounded-2xl p-4">
                <p className="text-sm font-medium text-cyan-100">Alternatives</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {vendorResearch.alternatives.join(", ")}
                </p>
              </div>
              <div className="glass-subtle rounded-2xl p-4">
                <p className="text-sm font-medium text-cyan-100">Sources</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {vendorResearch.sources.join(" · ")}
                </p>
              </div>
            </div>
          </div>
        </details>
      </article>
    </section>
  );
}
