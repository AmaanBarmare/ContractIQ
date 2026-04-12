const AGENTS = [
  { n: "01", name: "Ingest", detail: "Classify & envelope" },
  { n: "02", name: "Extract", detail: "40+ fields + confidence" },
  { n: "03", name: "Risk", detail: "Flags & scoring" },
  { n: "04", name: "Research", detail: "Tavily-grounded intel" },
  { n: "05", name: "Decide", detail: "Recommendation" },
  { n: "06", name: "Generate", detail: "Draft artifacts" },
] as const;

export function DemoRunway() {
  return (
    <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max gap-3 sm:gap-4">
        {AGENTS.map((a) => (
          <div
            key={a.n}
            className="flex w-[9.25rem] shrink-0 flex-col rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)] sm:w-[10rem]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[0.65rem] font-bold text-teal-400/90">{a.n}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-teal-400 to-orange-400 shadow-[0_0_12px_rgba(45,212,191,0.6)]" />
            </div>
            <p className="font-display mt-2 text-base font-bold tracking-tight text-white">{a.name}</p>
            <p className="mt-1 text-[0.7rem] leading-snug text-zinc-500">{a.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
