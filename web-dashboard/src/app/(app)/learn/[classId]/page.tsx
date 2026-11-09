import { ArrowLeft, BookOpen, Layers } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClassPageData } from "@/lib/data";
import { PageIntro } from "@/components/ui/PageIntro";
import { SubjectCard } from "@/components/ui/SubjectCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const instant = false;

export default async function ClassSubjectsPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const data = await getClassPageData(classId);
  const { classItem, classes, subjects, subjectProgress, profile } = data;

  if (!classItem) notFound();

  const totalChapters = subjects.reduce((sum, subject) => sum + subject.totalChapters, 0);
  const completed = subjectProgress.reduce(
    (sum, subject) => sum + subject.completedChapters,
    0,
  );

  return (
    <div className="space-y-4">
      <Link
        href="/learn"
        className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-text-muted hover:text-primary"
      >
        <ArrowLeft size={14} /> Back to curriculum
      </Link>

      <PageIntro
        eyebrow={`${classItem.badge ?? "AP SCERT"} · ${classItem.grade}th grade`}
        badge={`${subjects.length} Subjects`}
        title={classItem.title}
        description={classItem.subtitle ?? "Core subjects for this class."}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-sand/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-primary">
            <Layers size={14} /> {classItem.title} syllabus
          </p>
          <p className="mt-1 font-manrope text-lg font-extrabold text-text-primary">
            {completed} of {totalChapters} chapters completed
          </p>
          <p className="mt-0.5 text-[12px] font-medium text-text-secondary">
            {subjects.length} subjects · {totalChapters} chapters · {profile.medium ?? "English"}{" "}
            medium
          </p>
        </div>
        <Link
          href={`/learn/${classItem.id}`}
          className="inline-flex h-10 items-center gap-2 self-start rounded-xl border border-border-secondary bg-white px-4 text-[12px] font-extrabold text-primary-dark hover:border-primary sm:self-auto"
        >
          <BookOpen size={15} /> Open first subject
        </Link>
      </div>

      {subjects.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {subjectProgress.map((subject) => (
            <SubjectCard key={subject.id} classId={classItem.id} subject={subject} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white shadow-card">
          <EmptyState
            icon={Layers}
            title="No subjects yet"
            description="This class curriculum has not been published."
          />
        </div>
      )}

      <section className="rounded-2xl border border-border bg-white p-4 shadow-card">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
          Switch class
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {classes.map((item) => (
            <Link
              key={item.id}
              href={`/learn/${item.id}`}
              className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[11px] font-extrabold transition-colors ${
                item.id === classItem.id
                  ? "border-primary bg-pale-peach text-primary-dark"
                  : "border-border bg-white text-text-secondary hover:border-primary/40 hover:text-primary-dark"
              }`}
            >
              {item.title}
              <span className="text-[10px] font-bold text-text-muted">{item.subjectsCount}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
