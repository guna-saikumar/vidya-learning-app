import { Flame, TrendingUp } from "lucide-react";
import { getMyLearningData } from "@/lib/data";
import { PageIntro } from "@/components/ui/PageIntro";
import { ProgressRing } from "@/components/ProgressRing";
import { MyLearningList } from "@/components/MyLearningList";

export const instant = false;

export default async function MyLearningPage() {
  const { entries, stats, profile } = await getMyLearningData();

  return (
    <div className="space-y-4">
      <PageIntro
        eyebrow="Student study log"
        badge={`${stats.completed}/${stats.totalChapters} done`}
        title="My Learning Journey"
        description="Every chapter you open is tracked here so you can pick up right where you left off."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-primary-dark p-5 text-white shadow-card md:col-span-2">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary-light">
              Your journey so far
            </p>
            <p className="mt-1 font-manrope text-[22px] font-extrabold tracking-tight">
              Learning progress
            </p>
            <p className="mt-1 text-[12px] font-medium text-primary-light">
              {stats.completed} of {stats.totalChapters} chapters completed ·{" "}
              {stats.inProgress} in progress
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-extrabold">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-primary-light">
                <Flame size={12} /> {profile.streakDays}-day streak
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-primary-light">
                <TrendingUp size={12} /> {stats.overallPercent}% syllabus
              </span>
            </div>
          </div>
          <ProgressRing
            percent={stats.overallPercent}
            size={92}
            stroke={9}
            label="Overall"
            trackClassName="stroke-white/20"
            barClassName="stroke-[#f0d79a]"
            valueClassName="text-white"
            labelClassName="text-primary-light"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
          {[
            { label: "Completed", value: stats.completed, tone: "text-success" },
            { label: "In progress", value: stats.inProgress, tone: "text-primary" },
            { label: "Tracked", value: entries.length, tone: "text-text-primary" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border bg-white p-3 text-center shadow-card"
            >
              <p className={`font-manrope text-[20px] font-extrabold ${item.tone}`}>
                {item.value}
              </p>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-text-muted">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <MyLearningList entries={entries} />
    </div>
  );
}
