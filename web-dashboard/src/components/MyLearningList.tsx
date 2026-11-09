"use client";

import { CheckCircle2, ChevronRight, Clock3, GraduationCap, BookOpen } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { LearningEntry } from "@/lib/types";
import { formatRelativeTime } from "@/lib/strings";
import { EmptyState } from "./ui/EmptyState";

type Tab = "all" | "in-progress" | "completed";

interface MyLearningListProps {
  entries: LearningEntry[];
}

export function MyLearningList({ entries }: MyLearningListProps) {
  const [tab, setTab] = useState<Tab>("all");

  const completed = useMemo(() => entries.filter((entry) => entry.progress.completed), [entries]);
  const inProgress = useMemo(
    () => entries.filter((entry) => !entry.progress.completed && entry.progress.progressPercent > 0),
    [entries],
  );

  const visible = tab === "completed" ? completed : tab === "in-progress" ? inProgress : entries;

  const tabs: Array<{ id: Tab; label: string; count: number }> = [
    { id: "all", label: "All", count: entries.length },
    { id: "in-progress", label: "In progress", count: inProgress.length },
    { id: "completed", label: "Completed", count: completed.length },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => {
          const active = item.id === tab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-pressed={active}
              className={`inline-flex h-9 items-center rounded-full border px-4 text-[11px] font-extrabold transition-colors ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-soft-warm text-text-secondary hover:border-primary/40 hover:text-primary-dark"
              }`}
            >
              {item.label} ({item.count})
            </button>
          );
        })}
      </div>

      {visible.length > 0 ? (
        <div className="space-y-3">
          {visible.map((entry) => {
            const { progress, chapter, subject, classItem } = entry;
            const percent = progress.completed ? 100 : progress.progressPercent;
            return (
              <Link
                key={progress.chapterId}
                href={`/learn/${classItem.id}/${subject.id}/${chapter.id}`}
                className="flex items-center gap-3.5 rounded-2xl border border-border bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-hover"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    progress.completed ? "bg-success-bg text-success" : "bg-pale-peach text-primary"
                  }`}
                >
                  {progress.completed ? <CheckCircle2 size={19} /> : <BookOpen size={19} />}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.12em] text-text-muted">
                    {classItem.title} · {subject.title}
                  </p>
                  <p className="mt-0.5 truncate font-manrope text-[13px] font-extrabold text-text-primary">
                    {chapter.title}
                  </p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
                    <div
                      className={`h-full rounded-full ${
                        progress.completed ? "bg-success" : "bg-primary"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] font-bold text-text-muted">
                    <span>{percent}% complete</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={11} /> {formatRelativeTime(progress.lastAccessedAt)}
                    </span>
                    <span>
                      {progress.completedSections.length}/{chapter.sections.length} sections
                    </span>
                  </div>
                </div>

                <ChevronRight size={18} className="shrink-0 text-text-muted" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white shadow-card">
          <EmptyState
            icon={GraduationCap}
            title="No activity yet"
            description="Open a chapter from the curriculum and your study log will start filling up."
            action={
              <Link
                href="/learn"
                className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-[12px] font-extrabold text-white hover:bg-primary-dark"
              >
                Browse curriculum
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}
