import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Lightbulb,
  ListChecks,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getSectionPageData } from "@/lib/data";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BookmarkButton } from "@/components/BookmarkButton";
import { SectionCompleteButton } from "@/components/SectionCompleteButton";

export const instant = false;

export default async function SectionPage({
  params,
}: {
  params: Promise<{
    classId: string;
    subjectId: string;
    chapterId: string;
    sectionId: string;
  }>;
}) {
  const { classId, subjectId, sectionId } = await params;

  let data;
  try {
    data = await getSectionPageData(sectionId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { section, chapter, subject, chapterProgress, bookmarks, prevSection, nextSection } = data;
  const totalSections = chapter.sections.length;
  const completedSections = chapterProgress?.completedSections ?? [];
  const done = completedSections.includes(section.id);
  const percent = chapterProgress?.completed
    ? 100
    : chapterProgress?.progressPercent ?? 0;

  const sectionBookmarked = bookmarks.some(
    (bookmark) => bookmark.sectionId === section.id && bookmark.type === "section",
  );

  const chapterHref = `/learn/${classId}/${subjectId}/${chapter.id}`;
  const keyPoints = section.keyPoints ?? [];
  const diagrams = (section.diagrams ?? []) as Array<Record<string, unknown>>;

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
        <Link href={chapterHref} className="hover:text-primary">
          Chapter
        </Link>
        <span>/</span>
        <span className="text-primary-dark">Section {section.order}</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
            <div className="border-b border-border bg-surface-soft p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-pale-peach px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary-dark">
                  Section {section.order} of {totalSections}
                </span>
                {done ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-3 py-1 text-[10px] font-extrabold text-success">
                    <CheckCircle2 size={12} /> Completed
                  </span>
                ) : null}
                {section.durationMinutes ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10px] font-bold text-text-muted ring-1 ring-border">
                    <Clock3 size={12} /> {section.durationMinutes} min
                  </span>
                ) : null}
              </div>
              <h1 className="mt-2 font-manrope text-[23px] font-extrabold leading-8 tracking-tight text-text-primary">
                {section.title}
              </h1>
              <Link
                href={chapterHref}
                className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-text-muted hover:text-primary"
              >
                <BookOpen size={13} /> {chapter.title}
              </Link>
            </div>

            <div className="space-y-4 p-5">
              <div className="whitespace-pre-line text-[13.5px] font-medium leading-7 text-text-primary">
                {section.contentMarkdown}
              </div>

              {section.summaryPoint ? (
                <div className="rounded-xl border border-[#efe2bd] bg-accent-gold-bg p-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-accent-gold-dark">
                    <Lightbulb size={14} /> Summary
                  </p>
                  <p className="mt-1.5 text-[12.5px] font-semibold leading-5 text-[#5b4a17]">
                    {section.summaryPoint}
                  </p>
                </div>
              ) : null}

              {section.keyAxiom ? (
                <div className="rounded-xl border border-border bg-surface-soft p-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
                    <Sparkles size={14} /> Key axiom
                  </p>
                  <p className="mt-1.5 text-[12.5px] font-semibold leading-5 text-text-primary">
                    {section.keyAxiom}
                  </p>
                </div>
              ) : null}

              {keyPoints.length > 0 ? (
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-text-muted">
                    <ListChecks size={14} /> Key points
                  </p>
                  <ul className="mt-2 space-y-2">
                    {keyPoints.map((point, index) => (
                      <li
                        key={`${point}-${index}`}
                        className="flex items-start gap-2.5 rounded-xl border border-border bg-white px-3 py-2.5 text-[12px] font-semibold leading-5 text-text-secondary"
                      >
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {diagrams.length > 0 ? (
                <div className="rounded-xl border border-dashed border-border-secondary bg-surface-soft p-4 text-[12px] font-semibold text-text-muted">
                  This section includes {diagrams.length} diagram
                  {diagrams.length === 1 ? "" : "s"} in the mobile reader.
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <Link
                  href={chapterHref}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-4 text-[11px] font-extrabold text-text-secondary hover:border-primary hover:text-primary"
                >
                  <ArrowLeft size={14} /> Back to chapter
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <BookmarkButton
                    chapterId={chapter.id}
                    sectionId={section.id}
                    type="section"
                    title={section.title}
                    subtitle={`${subject.title} · ${chapter.title}`}
                    previewText={section.contentMarkdown}
                    initialBookmarked={sectionBookmarked}
                    showLabel
                  />
                  <SectionCompleteButton
                    chapterId={chapter.id}
                    sectionId={section.id}
                    totalSections={totalSections}
                    initialCompleted={done}
                  />
                </div>
              </div>
            </div>
          </article>

          <div className="grid gap-3 sm:grid-cols-2">
            {prevSection ? (
              <Link
                href={`/learn/${classId}/${subjectId}/${chapter.id}/${prevSection.id}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-card transition-colors hover:border-primary/40"
              >
                <ArrowLeft size={18} className="shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-muted">
                    Previous section
                  </p>
                  <p className="truncate font-manrope text-[12px] font-extrabold text-text-primary">
                    {prevSection.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
            {nextSection ? (
              <Link
                href={`/learn/${classId}/${subjectId}/${chapter.id}/${nextSection.id}`}
                className="flex items-center justify-end gap-3 rounded-2xl border border-border bg-white p-4 text-right shadow-card transition-colors hover:border-primary/40"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-muted">
                    Next section
                  </p>
                  <p className="truncate font-manrope text-[12px] font-extrabold text-text-primary">
                    {nextSection.title}
                  </p>
                </div>
                <ArrowRight size={18} className="shrink-0 text-primary" />
              </Link>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
              Chapter progress
            </p>
            <p className="mt-1 font-manrope text-[16px] font-extrabold text-text-primary">
              {completedSections.length} of {totalSections} sections
            </p>
            <ProgressBar percent={percent} size="lg" className="mt-3" />
            <p className="mt-2 text-[11px] font-semibold text-text-secondary">
              {done
                ? "You have marked this section complete."
                : "Mark this section done to update your chapter progress."}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
              All sections
            </p>
            <ul className="mt-2 space-y-1.5">
              {chapter.sections.map((item) => {
                const active = item.id === section.id;
                const itemDone = completedSections.includes(item.id);
                return (
                  <li key={item.id}>
                    <Link
                      href={`/learn/${classId}/${subjectId}/${chapter.id}/${item.id}`}
                      className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-[11px] font-bold transition-colors ${
                        active
                          ? "bg-pale-peach text-primary-dark"
                          : "text-text-secondary hover:bg-soft-warm hover:text-primary-dark"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-extrabold ${
                          itemDone ? "bg-success-bg text-success" : "bg-soft-warm text-text-muted"
                        }`}
                      >
                        {itemDone ? <CheckCircle2 size={11} /> : item.order}
                      </span>
                      <span className="line-clamp-2">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
