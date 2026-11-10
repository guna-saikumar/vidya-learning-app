import {
  ArrowRight,
  Bell,
  Bookmark,
  BookOpen,
  CheckCircle2,
  Flame,
  Layers,
  Play,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { DashboardData } from "@/lib/types";
import { formatIndianDate, greeting, initials } from "@/lib/strings";
import { ProgressRing } from "./ProgressRing";
import { StatCard } from "./StatCard";
import { SectionCard } from "./ui/SectionCard";
import { ProgressBar } from "./ui/ProgressBar";
import { EmptyState } from "./ui/EmptyState";

const SUBJECT_TONES = [
  "bg-[#b95d3f]",
  "bg-[#d6a84f]",
  "bg-[#24845d]",
  "bg-[#79675f]",
  "bg-[#b84040]",
  "bg-[#4f46e5]",
  "bg-[#0f766e]",
];

const CATEGORY_LABEL: Record<string, string> = {
  stem: "Science & Math",
  languages: "Languages",
  social: "Social Studies",
  all: "All subjects",
};

export default function Dashboard({ data }: { data: DashboardData }) {
  const {
    profile,
    activeClass,
    subjectProgress,
    continueLearning,
    bookmarks,
    notifications,
    stats,
    unreadNotifications,
  } = data;

  const classLabel = activeClass?.title ?? `Class ${profile.grade ?? "8"}`;
  const section = profile.section ?? "A";
  const school = profile.schoolName ?? "School not set";
  const streak = profile.streakDays ?? 0;
  const resumeHref = continueLearning
    ? `/learn/${continueLearning.classId}/${continueLearning.subjectId}/${continueLearning.chapterId}`
    : "/learn";

  const statsCards = [
    {
      label: "Subjects",
      value: String(stats.subjects),
      note: `${classLabel} curriculum`,
      icon: Layers,
    },
    {
      label: "Chapters",
      value: String(stats.chapters),
      note: "Total this term",
      icon: BookOpen,
    },
    {
      label: "Completed",
      value: String(stats.completedChapters),
      note: "Chapters finished",
      icon: CheckCircle2,
    },
    {
      label: "Progress",
      value: `${stats.overallPercent}%`,
      note: "Across all subjects",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-card md:p-6 xl:col-span-2">
          <div aria-hidden className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-pale-peach" />
          <div aria-hidden className="absolute -right-4 top-16 h-14 w-14 rounded-full bg-soft-warm" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-pale-peach px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary-dark">
                {classLabel} · Section {section}
              </span>
              <span className="rounded-full border border-border bg-white px-3 py-1 text-[10px] font-bold text-text-secondary">
                {school}
              </span>
            </div>
            <h1 className="mt-3 max-w-xl font-manrope text-[26px] font-extrabold leading-8 tracking-tight text-text-primary md:text-[30px] md:leading-9">
              {greeting()}, {profile.firstName ?? profile.name}.
            </h1>
            <p className="mt-1 max-w-md text-[13px] font-medium leading-5 text-text-secondary">
              What would you like to learn today? Your {classLabel} syllabus is waiting,
              and {stats.completedChapters} chapter{stats.completedChapters === 1 ? " is" : "s are"}{" "}
              already complete.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href={resumeHref}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[13px] font-extrabold text-white shadow-sm transition-colors hover:bg-primary-dark"
              >
                Resume learning <ArrowRight size={16} />
              </Link>
              <Link
                href="/bookmarks"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-border-secondary bg-white px-5 text-[13px] font-extrabold text-primary-dark transition-colors hover:border-primary"
              >
                <Bookmark size={16} /> View bookmarks
              </Link>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold text-accent-gold-dark">
              <Flame size={15} />
              {streak}-day study streak
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
                Syllabus Progress
              </p>
              <p className="mt-1 font-manrope text-[15px] font-extrabold text-text-primary">
                {classLabel} overview
              </p>
            </div>
            <TrendingUp size={22} className="text-primary" />
          </div>
          <div className="mt-4 flex items-center gap-5">
            <ProgressRing percent={stats.overallPercent} size={112} stroke={12} label="Syllabus" />
            <div className="space-y-2 text-[11px] font-semibold text-text-secondary">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                {stats.completedChapters} chapter{stats.completedChapters === 1 ? "" : "s"} completed
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                {Math.max(0, stats.chapters - stats.completedChapters)} remaining
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-gold" />
                Live from your account
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-surface-soft p-3 text-[11px] font-semibold leading-4 text-text-secondary">
            Keep going — every chapter you finish updates your progress here in real time.
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statsCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SectionCard
            icon={BookOpen}
            title="Continue Learning"
            action={
              <Link href="/learn" className="text-[11px] font-extrabold text-primary-dark hover:text-primary">
                View all →
              </Link>
            }
          >
            <div className="p-5">
              {continueLearning ? (
                <>
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">
                        {continueLearning.subjectName}
                      </p>
                      <h3 className="mt-1 font-manrope text-[20px] font-extrabold leading-7 text-text-primary">
                        {continueLearning.chapterTitle}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-text-secondary">
                        <span className="rounded-full bg-soft-warm px-3 py-1">
                          {continueLearning.completedSections} of {continueLearning.totalSections} topics
                          completed
                        </span>
                        {continueLearning.durationMinutes ? (
                          <span className="rounded-full bg-soft-warm px-3 py-1">
                            ~{continueLearning.durationMinutes} mins
                          </span>
                        ) : null}
                        <span className="rounded-full bg-success-bg px-3 py-1 text-success">
                          {continueLearning.progressPercent}% done
                        </span>
                      </div>
                    </div>
                    <Link
                      href={resumeHref}
                      className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-primary px-6 font-manrope text-[14px] font-extrabold text-white transition-colors hover:bg-primary-dark"
                    >
                      <Play size={18} fill="currentColor" /> Resume
                    </Link>
                  </div>
                  <ProgressBar
                    percent={continueLearning.progressPercent}
                    size="lg"
                    label="Chapter progress"
                    className="mt-5"
                  />
                </>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  compact
                  title="Nothing started yet"
                  description="Open the Learn tab and pick a chapter to begin."
                  action={
                    <Link
                      href="/learn"
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[12px] font-extrabold text-white hover:bg-primary-dark"
                    >
                      Browse curriculum <ArrowRight size={14} />
                    </Link>
                  }
                />
              )}
            </div>
          </SectionCard>

          <SectionCard
            icon={Layers}
            title="Syllabus Overview"
            action={<span className="text-[11px] font-bold text-text-muted">AP SCERT</span>}
          >
            {subjectProgress.length > 0 ? (
              <ul className="divide-y divide-border">
                {subjectProgress.map((subject, index) => (
                  <li key={subject.id}>
                    <Link
                      href={`/learn/${activeClass?.id ?? profile.classId ?? ""}/${subject.id}`}
                      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-soft"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-manrope text-[13px] font-extrabold text-text-primary">
                            {subject.name}
                          </p>
                          <p className="shrink-0 text-[11px] font-bold text-text-secondary">
                            {subject.completedChapters}/{subject.totalChapters} chapters ·{" "}
                            {subject.progressPercent}%
                          </p>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
                          <div
                            className={`h-full rounded-full ${SUBJECT_TONES[index % SUBJECT_TONES.length]}`}
                            style={{ width: `${subject.progressPercent}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                          {CATEGORY_LABEL[subject.category] ?? subject.category}
                        </p>
                      </div>
                      <CheckCircle2
                        size={20}
                        className={
                          subject.completedChapters > 0 ? "text-success" : "text-border-secondary"
                        }
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Layers}
                compact
                title="No subjects loaded"
                description="Your class curriculum will appear here once it is assigned."
              />
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard
            icon={Bookmark}
            title="Saved Bookmarks"
            action={
              <Link href="/bookmarks" className="text-[11px] font-extrabold text-primary-dark hover:text-primary">
                View all →
              </Link>
            }
          >
            {bookmarks.length > 0 ? (
              <ul className="divide-y divide-border">
                {bookmarks.slice(0, 4).map((item) => {
                  const href =
                    item.type === "section" && item.sectionId
                      ? `/learn/${item.classId}/${item.subjectId}/${item.chapterId}/${item.sectionId}`
                      : `/learn/${item.classId}/${item.subjectId}/${item.chapterId}`;
                  return (
                    <li key={item.id}>
                      <Link href={href} className="block px-5 py-4 transition-colors hover:bg-surface-soft">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary">
                              {item.subjectName}
                            </p>
                            <p className="mt-0.5 truncate font-manrope text-[12px] font-extrabold text-text-primary">
                              {item.chapterTitle}
                            </p>
                            <p className="mt-0.5 line-clamp-1 text-[11px] font-medium leading-4 text-text-secondary">
                              {item.sectionTitle ?? item.title}
                            </p>
                          </div>
                          <span className="shrink-0 text-[10px] font-bold text-text-muted">
                            {formatIndianDate(item.dateAdded)}
                          </span>
                        </div>
                        <ProgressBar percent={item.progressPercent} size="sm" tone="primary" className="mt-2" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={Bookmark}
                compact
                title="No bookmarks yet"
                description="Bookmark chapters or sections while reading and they will show up here."
              />
            )}
          </SectionCard>

          <SectionCard
            icon={Bell}
            title="Latest Notifications"
            action={
              <span className="rounded-full bg-pale-peach px-2 py-0.5 text-[10px] font-extrabold text-primary-dark">
                {unreadNotifications} unread
              </span>
            }
          >
            {notifications.length > 0 ? (
              <ul className="divide-y divide-border">
                {notifications.slice(0, 3).map((notification) => (
                  <li key={notification.id}>
                    <Link
                      href={`/notifications/${notification.id}`}
                      className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-surface-soft"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-soft-warm">
                        <Sparkles size={17} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-[12px] font-extrabold leading-5 text-text-primary">
                          {notification.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-4 text-text-secondary">
                          {notification.body}
                        </p>
                        <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-text-muted">
                          {formatIndianDate(notification.createdAt)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Bell}
                compact
                title="You're all caught up"
                description="No notifications right now."
              />
            )}
          </SectionCard>

          <div className="rounded-2xl border border-[#efe2bd] bg-accent-gold-bg p-4">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-accent-gold-dark" />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-accent-gold-dark">
                Study Streak
              </p>
            </div>
            <p className="mt-2 font-manrope text-[22px] font-extrabold leading-7 text-[#5b4a17]">
              {streak} day{streak === 1 ? "" : "s"} in a row
            </p>
            <p className="mt-1 text-[11px] font-semibold leading-4 text-accent-gold-dark">
              A little every day beats cramming the night before.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary font-manrope text-[14px] font-extrabold text-white">
                {initials(profile.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-manrope text-[13px] font-extrabold text-text-primary">
                  {profile.name}
                </p>
                <p className="truncate text-[11px] font-semibold text-text-muted">
                  {profile.email}
                </p>
              </div>
            </div>
            <Link
              href="/profile"
              className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-xl border border-border text-[11px] font-extrabold text-primary-dark hover:border-primary"
            >
              Manage profile
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
