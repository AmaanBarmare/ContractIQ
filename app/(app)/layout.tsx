"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavSidebar } from "@/components/nav-sidebar";

function MobileTopBar() {
  const pathname = usePathname();
  return (
    <div className="flex items-center justify-between border-b border-white/8 bg-[rgba(7,17,31,0.95)] px-4 py-3 backdrop-blur-xl lg:hidden">
      <Link href="/" className="text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-cyan-300/90">
        ContractIQ
      </Link>
      <nav className="flex gap-4">
        <Link
          href="/"
          className={`text-xs font-medium ${pathname === "/" ? "text-white" : "text-slate-400"}`}
        >
          Dashboard
        </Link>
        <Link
          href="/renewals"
          className={`text-xs font-medium ${pathname === "/renewals" ? "text-white" : "text-slate-400"}`}
        >
          Renewals
        </Link>
      </nav>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <NavSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileTopBar />
        <main className="relative flex-1 overflow-y-auto overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_24%),radial-gradient(circle_at_80%_20%,_rgba(251,191,36,0.16),_transparent_20%),linear-gradient(180deg,_#07111f_0%,_#020817_52%,_#020617_100%)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.9),transparent)]" />
          <div className="relative">{children}</div>
        </main>
      </div>
    </div>
  );
}
