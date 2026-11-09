"use client";

import { Bell, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ShellData } from "@/lib/types";
import { Avatar } from "./ui/Avatar";

interface HeaderProps {
  shell: ShellData;
  onMenu: () => void;
}

const TITLES: Array<{ match: (path: string) => boolean; eyebrow: string; title: string }> = [
  { match: (p) => p === "/", eyebrow: "Home", title: "Student Dashboard" },
  { match: (p) => p === "/learn", eyebrow: "Curriculum", title: "Learn" },
  { match: (p) => p.startsWith("/learn/"), eyebrow: "Curriculum", title: "Subject & Chapters" },
  { match: (p) => p === "/my-learning", eyebrow: "Study log", title: "My Learning" },
  { match: (p) => p === "/bookmarks", eyebrow: "Study vault", title: "Bookmarks" },
  { match: (p) => p.startsWith("/notifications"), eyebrow: "Notices", title: "Notifications" },
  { match: (p) => p === "/profile/edit", eyebrow: "Account", title: "Edit Profile" },
  { match: (p) => p === "/profile", eyebrow: "Account", title: "Profile & Settings" },
];

export function Header({ shell, onMenu }: HeaderProps) {
  const pathname = usePathname();
  const meta =
    TITLES.find((entry) => entry.match(pathname)) ?? {
      eyebrow: "Vidya",
      title: "Student Dashboard",
    };

  const { profile, unreadNotifications } = shell;

  return (
    <header className="sticky top-0 z-20 flex h-[72px] shrink-0 items-center gap-2 border-b border-border bg-white/90 px-3 backdrop-blur md:gap-3 md:px-6">
      <button
        type="button"
        onClick={onMenu}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-text-secondary lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu size={18} />
      </button>

      <div className="hidden min-w-0 md:block">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
          {meta.eyebrow}
        </p>
        <p className="truncate font-manrope text-[13px] font-extrabold text-text-primary">
          {meta.title}
        </p>
      </div>

      <form
        action="/learn"
        method="get"
        className="mx-auto flex w-full max-w-xl flex-1 items-center gap-2 rounded-2xl border border-border bg-soft-warm px-3 py-2.5 focus-within:border-primary focus-within:bg-white"
        role="search"
      >
        <Search size={18} className="shrink-0 text-text-muted" />
        <input
          type="search"
          name="q"
          placeholder="Search subjects, chapters, bookmarks…"
          className="w-full bg-transparent text-[13px] font-semibold text-text-primary outline-none placeholder:text-text-placeholder"
          aria-label="Search curriculum"
        />
        <kbd className="hidden rounded-md border border-border bg-white px-2 py-0.5 text-[10px] font-bold text-text-muted sm:inline-block">
          /
        </kbd>
      </form>

      <Link
        href="/notifications"
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-text-secondary transition-colors hover:text-primary"
        aria-label={`Notifications (${unreadNotifications} unread)`}
      >
        <Bell size={19} />
        {unreadNotifications > 0 ? (
          <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[9px] font-extrabold text-white ring-2 ring-white">
            {unreadNotifications > 9 ? "9+" : unreadNotifications}
          </span>
        ) : null}
      </Link>

      <Link
        href="/profile"
        className="flex items-center gap-2 rounded-2xl border border-border bg-white py-1.5 pl-1.5 pr-2 transition-colors hover:border-primary md:pr-3"
      >
        <Avatar name={profile.name} src={profile.avatarUrl} size="sm" />
        <div className="hidden leading-tight sm:block">
          <p className="max-w-[130px] truncate font-manrope text-[12px] font-extrabold text-text-primary">
            {profile.name}
          </p>
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            Class {profile.grade ?? "8"} · {profile.section ?? "A"}
          </p>
        </div>
      </Link>
    </header>
  );
}
