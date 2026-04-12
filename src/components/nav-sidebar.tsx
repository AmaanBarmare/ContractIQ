"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "grid" },
  { href: "/renewals", label: "Renewals", icon: "clock" },
];

const icons: Record<string, React.ReactNode> = {
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  clock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  workflow: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
};

export function NavSidebar() {
  const pathname = usePathname();
  const workflowMatch = pathname.match(/^\/workflows\/([^/]+)/);
  const activeWorkflowId = workflowMatch ? workflowMatch[1] : null;

  return (
    <aside className="relative sticky top-0 z-30 hidden h-screen w-[260px] shrink-0 flex-col border-r border-white/10 bg-zinc-950 lg:flex">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-teal-500/80 via-teal-500/15 to-orange-500/30"
        aria-hidden
      />
      <div className="flex min-h-0 flex-1 flex-col pl-[3px] pr-4 pt-9">
        <Link href="/" className="group ml-2 block">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-teal-500/35 bg-gradient-to-br from-teal-500/25 to-zinc-900 font-display text-sm font-extrabold tracking-tight text-teal-200 shadow-[0_0_32px_rgba(20,184,166,0.25)]">
              CI
            </span>
            <div>
              <p className="font-display text-[0.72rem] font-bold tracking-[0.2em] text-teal-300">CONTRACTIQ</p>
              <p className="mt-0.5 max-w-[11rem] text-[0.68rem] leading-snug text-zinc-500">
                Renewal rescue · multi-agent
              </p>
            </div>
          </div>
        </Link>

        <div className="mx-2 mt-8 mb-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <nav className="flex flex-col gap-1.5">
          {navItems.map(({ href, label, icon }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`group relative flex items-center gap-3 rounded-xl py-2.5 pl-3 pr-3 text-[0.88rem] font-semibold transition-colors ${
                  isActive
                    ? "bg-white/[0.07] text-white"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                }`}
              >
                {isActive ? (
                  <span className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-gradient-to-b from-teal-400 to-orange-400 shadow-[0_0_18px_rgba(45,212,191,0.5)]" />
                ) : null}
                <span
                  className={`transition-colors ${
                    isActive ? "text-teal-300" : "text-zinc-600 group-hover:text-zinc-400"
                  }`}
                >
                  {icons[icon]}
                </span>
                {label}
              </Link>
            );
          })}

          {activeWorkflowId && (
            <>
              <div className="mx-2 my-4 h-px bg-white/10" />
              <p className="mb-1 px-3 text-[0.62rem] font-bold tracking-[0.22em] text-zinc-600">LIVE WORKFLOW</p>
              <Link
                href={`/workflows/${activeWorkflowId}`}
                className={`group relative flex items-center gap-3 rounded-xl py-2.5 pl-3 pr-3 text-[0.88rem] font-semibold transition-colors ${
                  pathname === `/workflows/${activeWorkflowId}`
                    ? "bg-white/[0.07] text-white"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                }`}
              >
                {pathname === `/workflows/${activeWorkflowId}` ? (
                  <span className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-gradient-to-b from-teal-400 to-orange-400 shadow-[0_0_18px_rgba(45,212,191,0.5)]" />
                ) : null}
                <span
                  className={
                    pathname === `/workflows/${activeWorkflowId}`
                      ? "text-teal-300"
                      : "text-zinc-600 group-hover:text-zinc-400"
                  }
                >
                  {icons.workflow}
                </span>
                Pipeline
              </Link>
              <Link
                href={`/workflows/${activeWorkflowId}/results`}
                className={`group relative flex items-center gap-3 rounded-xl py-2.5 pl-3 pr-3 text-[0.88rem] font-semibold transition-colors ${
                  pathname.endsWith("/results")
                    ? "bg-white/[0.07] text-white"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                }`}
              >
                {pathname.endsWith("/results") ? (
                  <span className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-gradient-to-b from-teal-400 to-orange-400 shadow-[0_0_18px_rgba(45,212,191,0.5)]" />
                ) : null}
                <span
                  className={
                    pathname.endsWith("/results")
                      ? "text-teal-300"
                      : "text-zinc-600 group-hover:text-zinc-400"
                  }
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </span>
                Full results
              </Link>
            </>
          )}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-6 pb-8">
          <div className="ml-2 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-zinc-900/80 p-4">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-orange-200/90">Judge narrative</p>
            <p className="mt-2 text-[0.72rem] leading-relaxed text-zinc-400">
              Say: <span className="text-zinc-200">Orchestrate</span> dispatches agents →{" "}
              <span className="text-zinc-200">Redis Streams</span> feed the UI →{" "}
              <span className="text-zinc-200">Tavily</span> grounds research.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
