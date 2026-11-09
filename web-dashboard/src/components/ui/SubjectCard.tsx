import { ArrowRight, BookOpen, CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";
import type { SubjectProgress } from "@/lib/types";
import { formatHours } from "@/lib/strings";
import { ProgressBar } from "./ProgressBar";

const TONES: Record<string, string> = {
  stem: "bg-[#e8f1fb] text-[#2563a8]",
  languages: "bg-[#fdf2e4] text-[#b7791f]",
  social: "bg-[#eaf5ee] text-[#24845d]",
};

const CATEGORY_LABEL: Record<string, string> = {
  stem: "Science & Math",
  languages: "Languages",
  social: "Social Studies",
};

interface SubjectCardProps {
  classId: string;
  subject: SubjectProgress;
}

export function SubjectCard({ classId, subject }: SubjectCardProps) {
  const tone = TONES[subject.category] ?? "bg-pale-peach text-primary";
  return (
    <Link
      href={`/learn/${classId}/${subject.id}`}
      className="group flex flex-col rounded-2xl border border-border bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
          <BookOpen size={21} />
        </div>
        <span className="rounded-full bg-soft-warm px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-text-muted">
          {CATEGORY_LABEL[subject.category] ?? subject.category}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 font-manrope text-[15px] font-extrabold leading-5 text-text-primary group-hover:text-primary-dark">
        {subject.title}
      </h3>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-text-muted">
        <span className="inline-flex items-center gap-1">
          <BookOpen size={12} /> {subject.totalChapters} chapters
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock3 size={12} /> {formatHours(subject.estimatedHours)}
        </span>
        {subject.completedChapters > 0 ? (
          <span className="inline-flex items-center gap-1 text-success">
            <CheckCircle2 size={12} /> {subject.completedChapters} done
          </span>
        ) : null}
      </div>

      <div className="mt-auto pt-3">
        <ProgressBar
          percent={subject.progressPercent}
          size="sm"
          tone={subject.progressPercent >= 100 ? "success" : "primary"}
          label="Progress"
        />
        <div className="mt-2.5 flex items-center justify-between text-[11px] font-extrabold text-primary-dark">
          <span>
            {subject.completedChapters}/{subject.totalChapters} completed
          </span>
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
