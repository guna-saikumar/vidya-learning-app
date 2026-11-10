"use client";

import { useEffect, useState } from "react";
import type { ShellData } from "@/lib/types";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

export function AppShell({
  shell,
  children,
}: {
  shell: ShellData;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen bg-[#f4ece6]">
      <Sidebar shell={shell} />

      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-[#2b1f1b]/40 backdrop-blur-[2px]"
          />
          <div className="relative h-full w-[282px] animate-fade-up bg-white shadow-2xl">
            <Sidebar shell={shell} variant="drawer" onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header shell={shell} onMenu={() => setMenuOpen(true)} />
        <main className="flex-1 px-3 pb-24 pt-4 md:px-6 md:pb-8 md:pt-5 lg:pb-8">
          <div className="mx-auto max-w-7xl space-y-4">{children}</div>
        </main>
        <footer className="hidden items-center justify-between border-t border-border px-6 py-4 text-[11px] font-semibold text-text-muted lg:flex">
          <p>Vidya Learning · Student Dashboard</p>
          <p>Live from local API · {shell.profile.email}</p>
        </footer>
      </div>

      <MobileNav />
    </div>
  );
}
