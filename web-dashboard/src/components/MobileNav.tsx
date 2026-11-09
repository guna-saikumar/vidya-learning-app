"use client";

import { Bookmark, BookOpen, Home, TrendingUp, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Home", href: "/", icon: Home, exact: true },
  { label: "Learn", href: "/learn", icon: BookOpen },
  { label: "Learning", href: "/my-learning", icon: TrendingUp },
  { label: "Saved", href: "/bookmarks", icon: Bookmark },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-extrabold uppercase tracking-[0.1em] transition-colors ${
                  active ? "text-primary" : "text-text-muted"
                }`}
              >
                <span
                  className={`flex h-8 w-10 items-center justify-center rounded-xl ${
                    active ? "bg-pale-peach" : ""
                  }`}
                >
                  <Icon size={19} strokeWidth={2.1} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
