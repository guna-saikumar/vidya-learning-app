"use client";

import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleBookmarkAction } from "@/app/actions";

interface BookmarkButtonProps {
  chapterId: string;
  sectionId?: string | null;
  type: "chapter" | "section";
  title: string;
  subtitle: string;
  previewText?: string;
  initialBookmarked: boolean;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function BookmarkButton({
  chapterId,
  sectionId,
  type,
  title,
  subtitle,
  previewText,
  initialBookmarked,
  size = "md",
  showLabel = false,
}: BookmarkButtonProps) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await toggleBookmarkAction({
        chapterId,
        sectionId: sectionId ?? null,
        type,
        title,
        subtitle,
        previewText,
      });
      if (result.ok) {
        setBookmarked(result.bookmarked);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const iconSize = size === "sm" ? 15 : 17;

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={bookmarked}
        aria-label={bookmarked ? "Remove bookmark" : "Save bookmark"}
        title={bookmarked ? "Remove bookmark" : "Save bookmark"}
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl border font-extrabold transition-colors disabled:opacity-60 ${
          size === "sm" ? "h-8 px-2 text-[10px]" : "h-10 px-3 text-[11px]"
        } ${
          bookmarked
            ? "border-primary bg-pale-peach text-primary-dark"
            : "border-border bg-white text-text-secondary hover:border-primary hover:text-primary"
        }`}
      >
        {pending ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : bookmarked ? (
          <BookmarkCheck size={iconSize} />
        ) : (
          <Bookmark size={iconSize} />
        )}
        {showLabel ? <span>{bookmarked ? "Saved" : "Save"}</span> : null}
      </button>
      {error ? (
        <span className="mt-1 max-w-[160px] text-right text-[10px] font-bold text-error">
          {error}
        </span>
      ) : null}
    </div>
  );
}
