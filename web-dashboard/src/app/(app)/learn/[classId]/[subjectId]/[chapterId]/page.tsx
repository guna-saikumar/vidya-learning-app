import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  Target,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getChapterPageData } from "@/lib/data";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BookmarkButton } from "@/components/BookmarkButton";
import { ChapterCompleteButton } from "@/components/ChapterCompleteButton";
import { SectionCompleteButton } from "@/components/SectionCompleteButton";
import { SectionCard } from "@/components/ui/SectionCard";

export const instant = false;

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ classId: string; subjectId: string; chapterId: string }>;
}) {
  const { classId, subjectId, chapterId } = await params;

  let data;
  try {
    data = await getChapterPageData(chapterId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { chapter, subject, progress, bookmarks, prevChapter, nextChapter } = data;
  const completedSections = progress?.completedSections ?? [];
  const percent = progress?.completed ? 100 : progress?.progressPercent ?? 0;
  const firstSection = chapter.sections[0];
  const resumeHref = firstSection
    ? `/learn/${classId}/${subjectId}/${chapter.id}/${firstSection.id}`
    : null;

  const chapterBookmarked = bookmarks.some(
    (bookmark) =>
      bookmark.chapterId === chapter.id &&
      !bookmark.sectionId &&
      bookmark.type === "chapter",
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-text-muted">
        <Link href={`/learn/${classId}`} className="hover:text-primary">
          {data.activeClass?.title ?? "Class"}
        </Link>
        <span>/</span>
        <Link href={`/learn/${classId}/${subjectId}`} className="hover:text-primary">
          {subject.title}
        </Link>
        <span>/</span>
        <span className="text-primary-dark">Chapter</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
        <div className="relative bg-gradient-to-br from-primary-dark to-primary p-5 text-white md:p-6">
          <div aria-hidden className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
          <div aria-hidden className="absolute right-14 top-16 h-10 w-10 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              {chapter.unitName ? (
                <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary-light">
                  {chapter.unitName}
                </span>
              ) : null}
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold text-primary-light">
                Chapter {chapter.order}
              </span>
              {progress?.completed ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10px] font-extrabold text-success">
                  <CheckCircle2 size={12} /> Completed
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 max-w-3xl font-manrope text-[24px] font-extrabold leading-8 tracking-tight md:text-[28px] md:leading-9">
              {chapter.title}
            </h1>
            {chapter.description ? (
              <p className="mt-2 max-w-2xl text-[13px] font-medium leading-5 text-primary-light">
                {chapter.description}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-bold text-primary-light">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                <BookOpen size={13} /> {chapter.sections.length} sections
              </span>
              {chapter.durationMinutes ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                  <Clock3 size={13} /> {chapter.durationMinutes} min read
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                {percent}% complete
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <ProgressBar
            percent={percent}
            size="lg"
            label="Chapter progress"
            className="w-full sm:max-w-sm"
          />
          <div className="flex flex-wrap items-center gap-2">
            <BookmarkButton
              chapterId={chapter.id}
              type="chapter"
              title={chapter.title}
              subtitle={subject.title}
              previewText={chapter.description}
              initialBookmarked={chapterBookmarked}
              showLabel
            />
            <ChapterCompleteButton
              chapterId={chapter.id}
              initialCompleted={Boolean(progress?.completed)}
            />
            {resumeHref ? (
              <Link
                href={resumeHref}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[11px] font-extrabold text-white transition-colors hover:bg-primary-dark"
              >
                Start reading <ArrowRight size={14} />
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {chapter.learningGoals.length > 0 ? (
        <SectionCard icon={Target} title="Learning goals">
          <ul className="grid gap-2 p-5 sm:grid-cols-2">
            {chapter.learningGoals.map((goal, index) => (
              <li
                key={`${goal}-${index}`}
                className="flex items-start gap-2.5 rounded-xl bg-surface-soft px-3 py-2.5 text-[12px] font-semibold leading-5 text-text-secondary"
              >
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" />
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}

      <SectionCard
        icon={FileText}
        title="Sections"
        subtitle={`${completedSections.length} of ${chapter.sections.length} marked complete`}
        action={<span className="text-[11px] font-bold text-text-muted">{percent}%</span>}
      >
        <ul className="divide-y divide-border">
          {chapter.sections.map((section, index) => {
            const done = completedSections.includes(section.id);
            const sectionBookmarked = bookmarks.some(
              (bookmark) =>
                bookmark.sectionId === section.id && bookmark.type === "section",
            );
            const href = `/learn/${classId}/${subjectId}/${chapter.id}/${section.id}`;
            return (
              <li key={section.id} className="flex items-start gap-3 px-5 py-4">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-manrope text-[12px] font-extrabold ${
                    done ? "bg-success-bg text-success" : "bg-pale-peach text-primary-dark"
                  }`}
                >
                  {done ? <CheckCircle2 size={17} /> : String(index + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={href} className="group block">
                    <p className="font-manrope text-[13px] font-extrabold text-text-primary group-hover:text-primary-dark">
                      {section.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-4 text-text-secondary">
                      {section.contentMarkdown}
                    </p>
                  </Link>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] font-bold text-text-muted">
                    {section.durationMinutes ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={11} /> {section.durationMinutes} min
                      </span>
                    ) : null}
                    <Link href={href} className="text-primary-dark hover:text-primary">
                      Read section →
                    </Link>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <BookmarkButton
                    chapterId={chapter.id}
                    sectionId={section.id}
                    type="section"
                    title={section.title}
                    subtitle={`${subject.title} · ${chapter.title}`}
                    previewText={section.contentMarkdown}
                    initialBookmarked={sectionBookmarked}
                    size="sm"
                  />
                  <SectionCompleteButton
                    chapterId={chapter.id}
                    sectionId={section.id}
                    totalSections={chapter.sections.length}
                    initialCompleted={done}
                    size="sm"
                    showLabel={false}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </SectionCard>

      <div className="grid gap-3 sm:grid-cols-2">
        {prevChapter ? (
          <Link
            href={`/learn/${classId}/${subjectId}/${prevChapter.id}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-card transition-colors hover:border-primary/40"
          >
            <ArrowLeft size={18} className="shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-muted">
                Previous chapter
              </p>
              <p className="truncate font-manrope text-[12px] font-extrabold text-text-primary">
                {prevChapter.title}
              </p>
            </div>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}
        {nextChapter ? (
          <Link
            href={`/learn/${classId}/${subjectId}/${nextChapter.id}`}
            className="flex items-center justify-end gap-3 rounded-2xl border border-border bg-white p-4 text-right shadow-card transition-colors hover:border-primary/40"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-muted">
                Next chapter
              </p>
              <p className="truncate font-manrope text-[12px] font-extrabold text-text-primary">
                {nextChapter.title}
              </p>
            </div>
            <ArrowRight size={18} className="shrink-0 text-primary" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
