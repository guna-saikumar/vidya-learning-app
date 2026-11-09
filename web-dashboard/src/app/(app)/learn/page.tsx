import { Layers, Search } from "lucide-react";
import Link from "next/link";
import { getLearnData } from "@/lib/data";
import { withQuery } from "@/lib/strings";
import { PageIntro } from "@/components/ui/PageIntro";
import { ProgressRing } from "@/components/ProgressRing";
import { SubjectCard } from "@/components/ui/SubjectCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const instant = false;

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "stem", label: "Science & Math" },
  { id: "languages", label: "Languages" },
  { id: "social", label: "Social Studies" },
];

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "all" } = await searchParams;
  const data = await getLearnData();
  const { profile, activeClass, classes, subjects, subjectProgress, stats } = data;

  const classId = activeClass?.id ?? profile.classId ?? "";
  const query = q.trim().toLowerCase();
  const selectedCategory = CATEGORIES.some((item) => item.id === category) ? category : "all";

  const filtered = subjectProgress.filter((subject) => {
    const detail = subjects.find((item) => item.id === subject.id);
    const matchesCategory = selectedCategory === "all" || subject.category === selectedCategory;
    const haystack = `${subject.title} ${detail?.description ?? ""} ${detail?.code ?? ""}`.toLowerCase();
    const matchesQuery = query.length === 0 || haystack.includes(query);
    return matchesCategory && matchesQuery;
  });

  const categoryCount = (id: string) =>
    id === "all"
      ? subjectProgress.length
      : subjectProgress.filter((subject) => subject.category === id).length;

  const classLabel = activeClass?.title ?? `Class ${profile.grade ?? "8"}`;

  return (
    <div className="space-y-4">
      <PageIntro
        eyebrow="AP State Board · SCERT 2026–27"
        badge={`${subjectProgress.length} Subjects`}
        title="Curriculum"
        description="Browse your enrolled class syllabus, filter by subject group and jump into any chapter."
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-sand/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-primary">
            <Layers size={14} /> {profile.schoolName ?? "Enrolled school"}
          </p>
          <p className="mt-1 font-manrope text-xl font-extrabold tracking-tight text-text-primary">
            {classLabel} · Section {profile.section ?? "A"}
          </p>
          <p className="mt-0.5 text-[12px] font-medium text-text-secondary">
            {profile.medium ?? "English"} Medium · Roll #{profile.rollNumber ?? "—"} ·{" "}
            {[profile.location, profile.district].filter(Boolean).join(", ") || "Andhra Pradesh"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ProgressRing percent={stats.overallPercent} size={64} stroke={7} label="Done" />
          <div className="text-[11px] font-bold text-text-secondary">
            <p>
              {stats.completedChapters}/{stats.chapters} chapters
            </p>
            <p className="text-text-muted">
              {stats.inProgressChapters} in progress
            </p>
          </div>
        </div>
      </div>

      <form
        action="/learn"
        method="get"
        className="flex items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2.5 shadow-card focus-within:border-primary"
        role="search"
      >
        <Search size={18} className="shrink-0 text-text-muted" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={`Search ${classLabel} subjects…`}
          className="w-full bg-transparent text-[13px] font-semibold text-text-primary outline-none placeholder:text-text-placeholder"
          aria-label="Search subjects"
        />
        {selectedCategory !== "all" ? (
          <input type="hidden" name="category" value={selectedCategory} />
        ) : null}
        <button
          type="submit"
          className="h-8 shrink-0 rounded-lg bg-primary px-3 text-[11px] font-extrabold text-white transition-colors hover:bg-primary-dark"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((item) => {
          const active = item.id === selectedCategory;
          return (
            <Link
              key={item.id}
              href={withQuery("/learn", { q, category: item.id === "all" ? undefined : item.id })}
              className={`inline-flex h-9 items-center rounded-full border px-4 text-[11px] font-extrabold transition-colors ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-soft-warm text-text-secondary hover:border-primary/40 hover:text-primary-dark"
              }`}
            >
              {item.label} ({categoryCount(item.id)})
            </Link>
          );
        })}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-manrope text-lg font-extrabold tracking-tight text-text-primary">
            {classLabel} Subjects
          </h2>
          <span className="rounded-full border border-border bg-pale-peach px-2.5 py-0.5 text-[11px] font-extrabold text-primary-dark">
            {filtered.length} available
          </span>
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((subject) => (
              <SubjectCard key={subject.id} classId={classId} subject={subject} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-white shadow-card">
            <EmptyState
              icon={Search}
              title="No subjects match"
              description="Try a different search term or clear the category filter."
              action={
                <Link
                  href="/learn"
                  className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-[12px] font-extrabold text-white hover:bg-primary-dark"
                >
                  Reset filters
                </Link>
              }
            />
          </div>
        )}
      </section>

      {classes.length > 1 ? (
        <section className="rounded-2xl border border-border bg-white p-4 shadow-card">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
            Explore other classes
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {classes.map((item) => (
              <Link
                key={item.id}
                href={`/learn/${item.id}`}
                className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[11px] font-extrabold transition-colors ${
                  item.id === activeClass?.id
                    ? "border-primary bg-pale-peach text-primary-dark"
                    : "border-border bg-white text-text-secondary hover:border-primary/40 hover:text-primary-dark"
                }`}
              >
                {item.title}
                <span className="text-[10px] font-bold text-text-muted">
                  {item.subjectsCount}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
