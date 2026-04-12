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
            className="flex w-37 shrink-0 flex-col rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition-shadow hover:shadow-md sm:w-40"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[0.65rem] font-bold text-blue-600">{a.n}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-linear-to-r from-blue-500 to-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
            </div>
            <p className="font-display mt-2 text-base font-bold tracking-tight text-gray-900">{a.name}</p>
            <p className="mt-1 text-[0.7rem] leading-snug text-gray-400">{a.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
