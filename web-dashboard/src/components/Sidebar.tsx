"use client";

import {
  Bookmark,
  BookOpen,
  GraduationCap,
  Home,
  LogOut,
  School,
  Settings2,
  TrendingUp,
  Bell,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ClassItem, ShellData } from "@/lib/types";
import { logoutAction } from "@/app/actions";
import { Avatar } from "./ui/Avatar";
import { ProgressBar } from "./ui/ProgressBar";

interface SidebarProps {
  shell: ShellData;
  variant?: "desktop" | "drawer";
  onNavigate?: () => void;
}

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  exact?: boolean;
};

const navItems = (shell: ShellData): NavItem[] => [
  { label: "Home", href: "/", icon: Home, exact: true },
  { label: "Learn", href: "/learn", icon: BookOpen },
  { label: "My Learning", href: "/my-learning", icon: TrendingUp },
  { label: "Bookmarks", href: "/bookmarks", icon: Bookmark, badge: shell.bookmarksCount },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    badge: shell.unreadNotifications,
  },
  { label: "Profile", href: "/profile", icon: Settings2 },
];

const isActive = (pathname: string, item: NavItem) => {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="px-3 pb-2 pt-5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
    {children}
  </p>
);

export function Sidebar({ shell, variant = "desktop", onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { profile, activeClass, classes, overallPercent, completedChapters, totalChapters } =
    shell;

  const classLabel = activeClass?.title ?? `Class ${profile.grade ?? "8"}`;
  const section = profile.section ?? "A";
  const school = profile.schoolName ?? "School not set";
  const studentId = profile.id ? `VDY-${profile.id.slice(-6).toUpperCase()}` : "VDY-000000";
  const otherClasses = classes.filter((item) => item.id !== activeClass?.id).slice(0, 5);

  return (
    <aside
      className={`flex h-full w-[276px] shrink-0 flex-col border-r border-border bg-white ${
        variant === "desktop" ? "hidden lg:flex" : ""
      }`}
    >
      <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-border px-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f2ded3] bg-pale-peach">
          <BookOpen size={22} strokeWidth={2.2} className="text-primary" />
        </div>
        <div className="leading-tight">
          <p className="font-manrope text-[15px] font-extrabold tracking-tight text-text-primary">
            Vidya Learning
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
            AP SCERT Division
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <SectionLabel>Menu</SectionLabel>
        <ul className="space-y-1">
          {navItems(shell).map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`group flex h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-bold transition-colors ${
                    active
                      ? "bg-pale-peach text-primary-dark"
                      : "text-text-secondary hover:bg-soft-warm hover:text-primary-dark"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={2}
                    className={active ? "text-primary" : "text-text-muted group-hover:text-primary"}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-primary-dark ring-1 ring-border">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        <SectionLabel>Curriculum</SectionLabel>
        <ul className="space-y-1">
          {[activeClass, ...otherClasses]
            .filter((item): item is ClassItem => Boolean(item))
            .map((item) => {
              const href = `/learn/${item.id}`;
              const active = pathname === href;
              return (
                <li key={item.id}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className={`flex h-10 items-center gap-3 rounded-xl px-3 text-[12px] font-bold transition-colors ${
                      active
                        ? "bg-soft-warm text-primary-dark"
                        : "text-text-secondary hover:bg-soft-warm hover:text-primary-dark"
                    }`}
                  >
                    <Layers
                      size={16}
                      className={active ? "text-primary" : "text-text-muted"}
                    />
                    <span className="flex-1 truncate">{item.title}</span>
                    <span className="text-[10px] font-extrabold text-text-muted">
                      {item.subjectsCount}
                    </span>
                  </Link>
                </li>
              );
            })}
        </ul>

        <SectionLabel>Learning plan</SectionLabel>
        <div className="rounded-2xl border border-border bg-surface-soft p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-text-muted">
              {classLabel} syllabus
            </p>
            <span className="rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-extrabold text-success">
              {overallPercent}% done
            </span>
          </div>
          <p className="mt-2 font-manrope text-[13px] font-extrabold text-text-primary">
            {completedChapters} of {totalChapters} chapters completed
          </p>
          <ProgressBar percent={overallPercent} className="mt-2" />
          <Link
            href="/learn"
            onClick={onNavigate}
            className="mt-3 inline-flex text-[11px] font-extrabold text-primary-dark underline decoration-primary-light underline-offset-2 hover:text-primary"
          >
            Continue where you left off →
          </Link>
        </div>

        <SectionLabel>School</SectionLabel>
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-white p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft-warm">
            <School size={19} className="text-primary-dark" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-manrope text-[12px] font-extrabold text-text-primary">
              {school}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold leading-4 text-text-secondary">
              {classLabel} · Section {section}
              <br />
              Roll No. {profile.rollNumber ?? "—"} · {profile.district ?? "AP"}
            </p>
          </div>
        </div>
      </nav>

      <div className="shrink-0 border-t border-border p-4">
        <div className="rounded-2xl bg-primary-dark p-3 text-white">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-primary-light" />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary-light">
              Student ID
            </p>
          </div>
          <p className="mt-2 font-manrope text-[13px] font-extrabold tracking-wide">
            {studentId}
          </p>
          <p className="mt-1 truncate text-[10px] font-semibold text-primary-light">
            {profile.name} · {classLabel} · {section}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-border bg-white p-2">
          <Avatar name={profile.name} src={profile.avatarUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-extrabold text-text-primary">
              {profile.name}
            </p>
            <p className="truncate text-[10px] font-semibold text-text-muted">
              {profile.email}
            </p>
          </div>
        </div>

        <form action={logoutAction} className="mt-3">
          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-white text-[12px] font-extrabold text-text-secondary transition-colors hover:border-primary hover:text-primary"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
