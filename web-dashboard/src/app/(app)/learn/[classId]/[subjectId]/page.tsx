import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getSubjectPageData } from "@/lib/data";
import { formatHours, withQuery } from "@/lib/strings";
import { PageIntro } from "@/components/ui/PageIntro";
import { ProgressRing } from "@/components/ProgressRing";
import { BookmarkButton } from "@/components/BookmarkButton";
import { ChapterCompleteButton } from "@/components/ChapterCompleteButton";
import { EmptyState } from "@/components/ui/EmptyState";

export const instant = false;

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "in-progress", label: "In progress" },
  { id: "completed", label: "Completed" },
  { id: "unread", label: "Not started" },
];

export default async function SubjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ classId: string; subjectId: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { classId, subjectId } = await params;
  const { q = "", status = "all" } = await searchParams;

  let data;
  try {
    data = await getSubjectPageData(classId, subjectId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { subject, chapterProgress, bookmarks, stats, activeClass } = data;
  const query = q.trim().toLowerCase();
  const selectedStatus = STATUS_FILTERS.some((item) => item.id === status) ? status : "all";
  const classLabel = activeClass?.title ?? "Class";

  const statusOf = (chapterId: string): "completed" | "in-progress" | "unread" => {
    const entry = chapterProgress[chapterId];
    if (entry?.completed) return "completed";
    if (entry && entry.progressPercent > 0) return "in-progress";
    return "unread";
  };

  const filtered = subject.chapters.filter((chapter) => {
    const matchesQuery =
      query.length === 0 ||
      `${chapter.title} ${chapter.description ?? ""} ${chapter.unitName ?? ""}`
        .toLowerCase()
        .includes(query);
    const matchesStatus = selectedStatus === "all" || statusOf(chapter.id) === selectedStatus;
    return matchesQuery && matchesStatus;
  });

  const statusCount = (id: string) =>
    id === "all"
      ? subject.chapters.length
      : subject.chapters.filter((chapter) => statusOf(chapter.id) === id).length;

  const isBookmarked = (chapterId: string, sectionId?: string | null) =>
    bookmarks.some(
      (bookmark) =>
        bookmark.chapterId === chapterId &&
        (bookmark.sectionId ?? null) === (sectionId ?? null) &&
        bookmark.type === (sectionId ? "section" : "chapter"),
    );

  return (
    <div className="space-y-4">
      <Link
        href={`/learn/${classId}`}
        className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-text-muted hover:text-primary"
      >
        <ArrowLeft size={14} /> Back to {classLabel} subjects
      </Link>

      <PageIntro
        eyebrow={`${classLabel} · ${subject.code}`}
        badge={`${subject.totalChapters} Chapters`}
        title={subject.title}
        description={subject.description ?? "Open a chapter to start reading."}
        action={<ProgressRing percent={stats.percent} size={70} stroke={8} label="Done" />}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Chapters", value: subject.totalChapters, icon: BookOpen },
          { label: "Completed", value: stats.completed, icon: CheckCircle2 },
          { label: "In progress", value: stats.inProgress, icon: Sparkles },
          { label: "Estimated", value: formatHours(subject.estimatedHours), icon: Clock3 },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3.5 shadow-card"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pale-peach">
                <Icon size={17} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-muted">
                  {item.label}
                </p>
                <p className="font-manrope text-[15px] font-extrabold text-text-primary">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form
        action={`/learn/${classId}/${subjectId}`}
        method="get"
        className="flex items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2.5 shadow-card focus-within:border-primary"
        role="search"
      >
        <Search size={18} className="shrink-0 text-text-muted" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search chapters in this subject…"
          className="w-full bg-transparent text-[13px] font-semibold text-text-primary outline-none placeholder:text-text-placeholder"
          aria-label="Search chapters"
        />
        {selectedStatus !== "all" ? (
          <input type="hidden" name="status" value={selectedStatus} />
        ) : null}
        <button
          type="submit"
          className="h-8 shrink-0 rounded-lg bg-primary px-3 text-[11px] font-extrabold text-white transition-colors hover:bg-primary-dark"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((item) => {
          const active = item.id === selectedStatus;
          return (
            <Link
              key={item.id}
              href={withQuery(`/learn/${classId}/${subjectId}`, {
                q,
                status: item.id === "all" ? undefined : item.id,
              })}
              className={`inline-flex h-9 items-center rounded-full border px-4 text-[11px] font-extrabold transition-colors ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-soft-warm text-text-secondary hover:border-primary/40 hover:text-primary-dark"
              }`}
            >
              {item.label} ({statusCount(item.id)})
            </Link>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((chapter, index) => {
            const state = statusOf(chapter.id);
            const entry = chapterProgress[chapter.id];
            const percent = entry?.completed ? 100 : entry?.progressPercent ?? 0;
            const href = `/learn/${classId}/${subjectId}/${chapter.id}`;

            return (
              <article
                key={chapter.id}
                className="rounded-2xl border border-border bg-white p-4 shadow-card transition-colors hover:border-primary/30"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pale-peach font-manrope text-[13px] font-extrabold text-primary-dark">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {chapter.unitName ? (
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary">
                          {chapter.unitName}
                        </span>
                      ) : null}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em] ${
                          state === "completed"
                            ? "bg-success-bg text-success"
                            : state === "in-progress"
                              ? "bg-accent-gold-bg text-accent-gold-dark"
                              : "bg-soft-warm text-text-muted"
                        }`}
                      >
                        {state === "completed"
                          ? "Completed"
                          : state === "in-progress"
                            ? "In progress"
                            : "Not started"}
                      </span>
                    </div>

                    <Link href={href} className="group block">
                      <h3 className="mt-1 font-manrope text-[15px] font-extrabold leading-5 text-text-primary group-hover:text-primary-dark">
                        {chapter.title}
                      </h3>
                      {chapter.description ? (
                        <p className="mt-0.5 line-clamp-2 text-[12px] font-medium leading-4 text-text-secondary">
                          {chapter.description}
                        </p>
                      ) : null}
                    </Link>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen size={12} /> {chapter.sectionCount} sections
                      </span>
                      {chapter.durationMinutes ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={12} /> {chapter.durationMinutes} min
                        </span>
                      ) : null}
                      <span>{percent}% complete</span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                      <div
                        className={`h-full rounded-full ${
                          state === "completed" ? "bg-success" : "bg-primary"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <BookmarkButton
                      chapterId={chapter.id}
                      type="chapter"
                      title={chapter.title}
                      subtitle={subject.title}
                      previewText={chapter.description}
                      initialBookmarked={isBookmarked(chapter.id)}
                      size="sm"
                    />
                    <ChapterCompleteButton
                      chapterId={chapter.id}
                      initialCompleted={Boolean(entry?.completed)}
                      size="sm"
                      showLabel={false}
                    />
                    <Link
                      href={href}
                      aria-label={`Open ${chapter.title}`}
                      className="inline-flex h-8 items-center gap-1 rounded-xl border border-border bg-white px-2 text-[10px] font-extrabold text-primary-dark hover:border-primary"
                    >
                      Open <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-border bg-white shadow-card">
            <EmptyState
              icon={Search}
              title="No chapters match"
              description="Try another search term or switch the status filter."
              action={
                <Link
                  href={`/learn/${classId}/${subjectId}`}
                  className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-[12px] font-extrabold text-white hover:bg-primary-dark"
                >
                  Reset filters
                </Link>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
