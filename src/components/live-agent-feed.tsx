import type { AgentEvent } from "@/lib/types";

const toneStyles: Record<AgentEvent["tone"], string> = {
  neutral: "from-slate-100/50 to-transparent",
  positive: "from-emerald-50/60 to-transparent",
  alert: "from-red-50/60 to-transparent",
};

export function LiveAgentFeed({ events }: { events: AgentEvent[] }) {
  return (
    <section className="panel-surface h-full">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Live agent feed</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-gray-400">Redis stream</p>
          <h2 className="panel-title">Trace every hop</h2>
          <p className="panel-copy max-w-md">
            Judges should hear: orchestration dispatches work, agents publish events, the UI renders the same timeline you
            could replay from the stream.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-emerald-700">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50 opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </span>
          Live
        </div>
      </div>

      <div className="relative mt-8 space-y-0">
        {events.map((event, index) => (
          <article
            key={event.id}
            style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
            className={`animate-rise relative border-b border-slate-200/80 bg-linear-to-r py-5 pl-1 pr-2 last:border-b-0 md:pl-2 ${toneStyles[event.tone]}`}
          >
            {index < events.length - 1 ? (
              <span className="absolute bottom-0 left-3.5 top-13 w-px bg-linear-to-b from-blue-300 to-slate-200 md:left-4" />
            ) : null}
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative z-1 mt-0.5 inline-flex h-3 w-3 shrink-0 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.35)] ring-4 ring-white" />
                <p className="truncate text-sm font-bold text-gray-900">{event.agent}</p>
              </div>
              <span className="shrink-0 font-mono text-[0.7rem] text-gray-400">{event.time}</span>
            </div>
            <p className="mt-3 text-[0.95rem] font-bold leading-snug text-gray-800">{event.action}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{event.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
