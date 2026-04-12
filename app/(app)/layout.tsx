"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavSidebar } from "@/components/nav-sidebar";

function MobileTopBar() {
  const pathname = usePathname();
  const workflowMatch = pathname.match(/^\/workflows\/([^/]+)/);
  const activeWorkflowId = workflowMatch ? workflowMatch[1] : null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-3.5 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="font-display shrink-0 text-[0.68rem] font-bold tracking-[0.28em] uppercase text-blue-600"
        >
          ContractIQ
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5 text-[0.8rem] font-semibold">
          <Link
            href="/"
            className={`transition-colors ${pathname === "/" ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`}
          >
            Home
          </Link>
          <Link
            href="/renewals"
            className={`transition-colors ${pathname === "/renewals" ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`}
          >
            Renewals
          </Link>
          {activeWorkflowId ? (
            <>
              <span className="hidden h-3 w-px bg-slate-200 sm:inline" aria-hidden />
              <Link
                href={`/workflows/${activeWorkflowId}`}
                className={`transition-colors ${
                  pathname === `/workflows/${activeWorkflowId}` ? "text-blue-600" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                Pipeline
              </Link>
              <Link
                href={`/workflows/${activeWorkflowId}/results`}
                className={`transition-colors ${
                  pathname.endsWith("/results") ? "text-blue-600" : "text-gray-400 hover:text-gray-700"
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
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] lg:flex-row">
      <NavSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileTopBar />
        <main className="app-grid-bg relative flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
          <div className="relative z-1">{children}</div>
        </main>
      </div>
    </div>
  );
}
