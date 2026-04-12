"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavSidebar } from "@/components/nav-sidebar";

function MobileTopBar() {
  const pathname = usePathname();
  const workflowMatch = pathname.match(/^\/workflows\/([^/]+)/);
  const activeWorkflowId = workflowMatch ? workflowMatch[1] : null;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/90 px-4 py-3.5 backdrop-blur-2xl lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="font-display shrink-0 text-[0.68rem] font-bold tracking-[0.28em] uppercase text-teal-300"
        >
          ContractIQ
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5 text-[0.8rem] font-semibold">
          <Link
            href="/"
            className={`transition-colors ${pathname === "/" ? "text-white" : "text-zinc-500 hover:text-zinc-200"}`}
          >
            Home
          </Link>
          <Link
            href="/renewals"
            className={`transition-colors ${pathname === "/renewals" ? "text-white" : "text-zinc-500 hover:text-zinc-200"}`}
          >
            Renewals
          </Link>
          {activeWorkflowId ? (
            <>
              <span className="hidden h-3 w-px bg-white/15 sm:inline" aria-hidden />
              <Link
                href={`/workflows/${activeWorkflowId}`}
                className={`transition-colors ${
                  pathname === `/workflows/${activeWorkflowId}` ? "text-teal-300" : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                Pipeline
              </Link>
              <Link
                href={`/workflows/${activeWorkflowId}/results`}
                className={`transition-colors ${
                  pathname.endsWith("/results") ? "text-teal-300" : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                Results
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 lg:flex-row">
      <NavSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileTopBar />
        <main className="mesh-backdrop relative flex-1 overflow-y-auto overflow-x-hidden">
          <div className="aurora-blob" aria-hidden />
          <div className="aurora-blob" aria-hidden />
          <div className="aurora-blob" aria-hidden />
          <div className="grain-overlay" aria-hidden />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.95),transparent)]"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" aria-hidden />
          <div className="relative z-[1]">{children}</div>
        </main>
      </div>
    </div>
  );
}
