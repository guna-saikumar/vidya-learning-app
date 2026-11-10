"use client";

import {
  ArrowRight,
  Bookmark,
  BookmarkX,
  BookOpen,
  FileText,
  Loader2,
  Sigma,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeBookmarkAction } from "@/app/actions";
import type { Bookmark as BookmarkItem } from "@/lib/types";
import { formatIndianDate } from "@/lib/strings";
import { EmptyState } from "./ui/EmptyState";
import { ProgressBar } from "./ui/ProgressBar";

interface BookmarksListProps {
  bookmarks: Array<BookmarkItem & { progressPercent: number }>;
}

const iconFor = (type: BookmarkItem["type"]) =>
  type === "formula" ? Sigma : type === "section" ? FileText : BookOpen;

export function BookmarksList({ bookmarks }: BookmarksListProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const remove = (id: string) => {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await removeBookmarkAction(id);
      setPendingId(null);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  if (bookmarks.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white shadow-card">
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet"
          description="Save important chapters or sections while reading and they will show up here."
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
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-xl border border-error/40 bg-error-bg px-4 py-3 text-[12px] font-semibold text-error">
          {error}
        </div>
      ) : null}

      {bookmarks.map((bookmark) => {
        const Icon = iconFor(bookmark.type);
        const href =
          bookmark.type === "section" && bookmark.sectionId
            ? `/learn/${bookmark.classId}/${bookmark.subjectId}/${bookmark.chapterId}/${bookmark.sectionId}`
            : `/learn/${bookmark.classId}/${bookmark.subjectId}/${bookmark.chapterId}`;
        const busy = pendingId === bookmark.id;

        return (
          <article
            key={bookmark.id}
            className="rounded-2xl border border-border bg-white p-4 shadow-card"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pale-peach text-primary">
                <Icon size={19} />
              </div>

              <Link href={href} className="group min-w-0 flex-1">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-muted">
                  {bookmark.subtitle ?? bookmark.subjectName}
                </p>
                <p className="mt-0.5 font-manrope text-[15px] font-extrabold text-text-primary group-hover:text-primary-dark">
                  {bookmark.title}
                </p>
                {bookmark.previewText ? (
                  <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-4 text-text-secondary">
                    {bookmark.previewText}
                  </p>
                ) : null}
              </Link>

              <span className="shrink-0 rounded-full bg-soft-warm px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-text-muted">
                {bookmark.type}
              </span>
            </div>

            <ProgressBar
              percent={bookmark.progressPercent}
              size="sm"
              label="Chapter progress"
              className="mt-3"
            />

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-3">
                <Link
                  href={href}
                  className="inline-flex items-center gap-1 text-[11px] font-extrabold text-primary hover:text-primary-dark"
                >
                  Open <ArrowRight size={13} />
                </Link>
                <span className="text-[10px] font-bold text-text-muted">
                  Saved {formatIndianDate(bookmark.dateAdded)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => remove(bookmark.id)}
                disabled={busy}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#f0c9c5] bg-error-bg px-3 text-[10px] font-extrabold text-error transition-colors hover:bg-[#f8e2e0] disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <BookmarkX size={14} />
                )}
                Remove
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
