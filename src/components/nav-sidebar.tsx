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
    <aside className="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col border-r border-white/8 bg-[rgba(7,17,31,0.92)] backdrop-blur-xl max-lg:hidden">
      {/* Logo */}
      <div className="px-5 pt-7 pb-6">
        <Link href="/" className="block">
          <p className="text-[0.68rem] font-semibold tracking-[0.28em] uppercase text-cyan-300/90">
            ContractIQ
          </p>
          <p className="mt-1 text-[0.65rem] tracking-wide text-slate-500">
            AI Contract Intelligence
          </p>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/6" />

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 pt-4">
        {navItems.map(({ href, label, icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.82rem] font-medium transition-colors ${
                isActive
                  ? "bg-white/8 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <span className={isActive ? "text-cyan-300" : "text-slate-500"}>
                {icons[icon]}
              </span>
              {label}
            </Link>
          );
        })}

        {/* Active workflow link */}
        {activeWorkflowId && (
          <>
            <div className="mx-1 mt-3 mb-2 h-px bg-white/6" />
            <p className="px-3 text-[0.62rem] font-semibold tracking-[0.22em] uppercase text-slate-500">
              Active Workflow
            </p>
            <Link
              href={`/workflows/${activeWorkflowId}`}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.82rem] font-medium transition-colors ${
                pathname === `/workflows/${activeWorkflowId}`
                  ? "bg-white/8 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <span className={pathname.includes("/workflows/") ? "text-cyan-300" : "text-slate-500"}>
                {icons.workflow}
              </span>
              Pipeline
            </Link>
            <Link
              href={`/workflows/${activeWorkflowId}/results`}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.82rem] font-medium transition-colors ${
                pathname.endsWith("/results")
                  ? "bg-white/8 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <span className={pathname.endsWith("/results") ? "text-cyan-300" : "text-slate-500"}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </span>
              Full Results
            </Link>
          </>
        )}
      </nav>

      {/* Bottom branding */}
      <div className="mt-auto px-5 pb-5">
        <div className="rounded-xl border border-white/6 bg-white/3 px-3 py-3">
          <p className="text-[0.65rem] text-slate-500">
            Enterprise Agents Hackathon
          </p>
          <p className="mt-0.5 text-[0.62rem] text-slate-600">
            IBM Watsonx + Redis + Tavily
          </p>
        </div>
      </div>
    </aside>
  );
}
