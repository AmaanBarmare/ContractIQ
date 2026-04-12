import type { Recommendation, VendorResearch } from "@/lib/types";

const urgencyStyles: Record<Recommendation["urgency"], string> = {
  LOW: "text-blue-700 bg-blue-50 border-blue-200",
  MEDIUM: "text-amber-700 bg-amber-50 border-amber-200",
  HIGH: "text-red-600 bg-red-50 border-red-200",
  CRITICAL: "text-red-700 bg-red-100 border-red-300",
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
    <section className="panel-surface h-full border-red-200 bg-linear-to-br from-red-50/60 via-white to-amber-50/30 shadow-[0_8px_32px_rgba(239,68,68,0.08)]">
      <p className="eyebrow">Recommendation</p>
      <p className="mt-3 text-xs font-bold uppercase tracking-widest text-gray-400">
        Step 4 · Decide the action
      </p>
      <h2 className="panel-title">Take action now</h2>
      <p className="panel-copy">
        This contract is likely to auto-renew at above-market pricing. Renegotiate
        before the notice window closes.
      </p>

      <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Recommended decision
            </p>
            <h3 className="font-display mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
              {recommendation.decision}
            </h3>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${urgencyStyles[recommendation.urgency]}`}
          >
            {recommendation.urgency}
          </span>
        </div>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                {deadlineCallout.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                {deadlineCallout.value}
              </p>
            </div>
            <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              confirm notice period
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-800/80">
            {deadlineCallout.detail}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Confidence
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {Math.round(recommendation.confidence * 100)}%
            </p>
          </div>
          <p className="max-w-sm text-sm leading-6 text-gray-500">
            The pricing gap, renewal timing, and weak contract terms are clear
            enough to move now while the notice clause is being confirmed.
          </p>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Why act now
            </p>
            <div className="mt-3 space-y-3">
              {recommendation.reasons.map((reason, idx) => (
                <p
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-gray-700"
                >
                  {reason}
                </p>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Next moves
            </p>
            <div className="mt-3 space-y-2">
              {recommendation.nextSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800"
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        <details className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <summary className="cursor-pointer list-none text-sm font-medium text-gray-700">
            View supporting vendor research
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-blue-700">Recent news</p>
              <div className="mt-2 space-y-2">
                {vendorResearch.recentNews.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-gray-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-blue-700">Pricing signals</p>
              <div className="mt-2 space-y-2">
                {vendorResearch.pricingSignals.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-gray-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-blue-700">Alternatives</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {vendorResearch.alternatives.join(", ")}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-blue-700">Sources</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
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
