import type { AgentEvent } from "@/lib/types";

const toneStyles: Record<AgentEvent["tone"], string> = {
  neutral: "from-slate-300/10 to-slate-300/5",
  positive: "from-emerald-300/15 to-transparent",
  alert: "from-rose-300/18 to-transparent",
};

export function LiveAgentFeed({ events }: { events: AgentEvent[] }) {
  return (
    <section className="panel-surface h-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Live analysis</p>
          <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-400">
            Step 2 · Extract and evaluate
          </p>
          <h2 className="panel-title">Agent feed</h2>
          <p className="panel-copy max-w-md">
            This is the live trace from upload to decision: extract terms, flag
            uncertainty, and surface risk before the recommendation lands.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-emerald-200">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.8)]" />
          Live
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {events.map((event, index) => (
          <article
            key={event.id}
            className={`relative rounded-2xl border border-white/10 bg-gradient-to-r ${toneStyles[event.tone]} p-4 pl-5`}
          >
            {index < events.length - 1 ? (
              <span className="absolute bottom-[-18px] left-[15px] top-[44px] w-px bg-white/10" />
            ) : null}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.65)]" />
                <p className="text-sm font-medium text-white">{event.agent}</p>
              </div>
              <span className="font-mono text-xs text-slate-400">{event.time}</span>
            </div>
            <p className="mt-3 text-base font-semibold text-slate-100">
              {event.action}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{event.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
