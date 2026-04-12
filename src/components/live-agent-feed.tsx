import type { AgentEvent } from "@/lib/types";

const toneStyles: Record<AgentEvent["tone"], string> = {
  neutral: "from-zinc-600/15 to-transparent",
  positive: "from-emerald-500/18 to-transparent",
  alert: "from-rose-500/22 to-transparent",
};

export function LiveAgentFeed({ events }: { events: AgentEvent[] }) {
  return (
    <section className="panel-surface h-full">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Live agent feed</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.22em] text-zinc-600">Redis stream</p>
          <h2 className="panel-title">Trace every hop</h2>
          <p className="panel-copy max-w-md">
            Judges should hear: orchestration dispatches work, agents publish events, the UI renders the same timeline you
            could replay from the stream.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-200">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50 opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.85)]" />
          </span>
          Live
        </div>
      </div>

      <div className="relative mt-8 space-y-0">
        {events.map((event, index) => (
          <article
            key={event.id}
            style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
            className={`animate-rise relative border-b border-white/10 bg-gradient-to-r py-5 pl-1 pr-2 last:border-b-0 md:pl-2 ${toneStyles[event.tone]}`}
          >
            {index < events.length - 1 ? (
              <span className="absolute bottom-0 left-[13px] top-[3.25rem] w-px bg-gradient-to-b from-teal-500/50 to-white/10 md:left-[15px]" />
            ) : null}
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative z-[1] mt-0.5 inline-flex h-3 w-3 shrink-0 rounded-full bg-teal-400 shadow-[0_0_18px_rgba(45,212,191,0.65)] ring-4 ring-zinc-950" />
                <p className="truncate text-sm font-bold text-white">{event.agent}</p>
              </div>
              <span className="shrink-0 font-mono text-[0.7rem] text-zinc-500">{event.time}</span>
            </div>
            <p className="mt-3 text-[0.95rem] font-bold leading-snug text-zinc-100">{event.action}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">{event.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
