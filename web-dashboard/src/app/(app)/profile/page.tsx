import {
  BadgeCheck,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Flame,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Phone,
  School,
  Sparkles,
  Target,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { getProfilePageData } from "@/lib/data";
import { formatIndianDate } from "@/lib/strings";
import { PageIntro } from "@/components/ui/PageIntro";
import { Avatar } from "@/components/ui/Avatar";
import { SectionCard } from "@/components/ui/SectionCard";
import { ProfileSettings } from "@/components/ProfileSettings";

export const instant = false;

const Row = ({
  icon: Icon,
  label,
  value,
  strong = false,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3 py-2.5">
    <div className="flex items-center gap-2.5">
      <Icon size={16} className="shrink-0 text-primary" />
      <span className="text-[12px] font-medium text-text-secondary">{label}</span>
    </div>
    <span
      className={`min-w-0 truncate text-right text-[12px] ${
        strong ? "font-extrabold text-primary-dark" : "font-bold text-text-primary"
      }`}
    >
      {value}
    </span>
  </div>
);

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const { updated } = await searchParams;
  const { profile, activeClass, completedChapters, completedTopics, bookmarksCount } =
    await getProfilePageData();

  const classLabel = activeClass?.title ?? `Class ${profile.grade ?? "—"}`;
  const gender = profile.gender
    ? profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase()
    : "—";

  return (
    <div className="space-y-4">
      <PageIntro
        eyebrow="Student account"
        badge={activeClass ? `${activeClass.title} enrolled` : "Class not set"}
        title="Student Profile & Settings"
        description="Manage your personal details, study preferences and account information."
        action={
          <Link
            href="/profile/edit"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[12px] font-extrabold text-white transition-colors hover:bg-primary-dark"
          >
            <Pencil size={15} /> Edit profile
          </Link>
        }
      />

      {updated ? (
        <div className="rounded-xl border border-success/30 bg-success-bg px-4 py-3 text-[12px] font-semibold text-success">
          Profile updated successfully.
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="rounded-2xl border border-[#f2ded3] bg-pale-peach p-5 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar name={profile.name} src={profile.avatarUrl} size="xl" className="ring-2 ring-white" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-manrope text-[20px] font-extrabold tracking-tight text-text-primary">
                    {profile.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-primary-dark">
                    <BadgeCheck size={12} /> Student
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[12px] font-semibold text-text-secondary">
                  {profile.email}
                </p>
                <p className="mt-1 text-[11px] font-bold text-primary-dark">
                  {classLabel} · Section {profile.section ?? "—"} · {profile.medium ?? "—"} medium
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-text-secondary">
                  {profile.schoolName ?? "School not set"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <div className="rounded-xl bg-white/70 px-3 py-2 text-center">
                  <p className="font-manrope text-[16px] font-extrabold text-primary-dark">
                    {profile.streakDays}
                  </p>
                  <p className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-text-muted">
                    Streak
                  </p>
                </div>
                <div className="rounded-xl bg-white/70 px-3 py-2 text-center">
                  <p className="font-manrope text-[16px] font-extrabold text-primary-dark">
                    {completedChapters}
                  </p>
                  <p className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-text-muted">
                    Chapters
                  </p>
                </div>
              </div>
            </div>
          </div>

          <SectionCard icon={UserRound} title="Personal details">
            <div className="divide-y divide-border px-5">
              <Row
                icon={UserRound}
                label="Student name"
                value={`${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || profile.name}
              />
              <Row icon={CalendarDays} label="Date of birth" value={formatIndianDate(profile.dob ?? profile.dateOfBirth)} />
              <Row icon={Users} label="Gender" value={gender} />
              <Row icon={BadgeCheck} label="Roll number" value={`#${profile.rollNumber ?? "—"}`} />
              <Row icon={Mail} label="Login email" value={profile.email} />
            </div>
          </SectionCard>

          <SectionCard icon={School} title="Academic details">
            <div className="divide-y divide-border px-5">
              <Row icon={School} label="School" value={profile.schoolName ?? "—"} />
              <Row
                icon={MapPin}
                label="Location & district"
                value={[profile.location, profile.district].filter(Boolean).join(", ") || "—"}
              />
              <Row icon={GraduationCap} label="Class & section" value={`${classLabel} — ${profile.section ?? "—"}`} strong />
              <Row icon={Sparkles} label="Medium" value={profile.medium ?? "—"} />
              <Row icon={CalendarDays} label="Academic session" value="2026–27 (AP SCERT)" />
            </div>
          </SectionCard>

          <SectionCard icon={Users} title="Parent & guardian details">
            <div className="divide-y divide-border px-5">
              <Row icon={UserRound} label="Father's name" value={profile.fatherName ?? "—"} />
              <Row icon={UserRound} label="Mother's name" value={profile.motherName ?? "—"} />
              <Row icon={Phone} label="Parent contact" value={profile.parentPhone ?? "—"} />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard icon={Target} title="Achievements">
            <div className="grid grid-cols-2 gap-2 p-4">
              {[
                { label: "Chapters", value: completedChapters, icon: CheckCircle2, tone: "bg-success-bg text-success" },
                { label: "Topics", value: completedTopics, icon: Sparkles, tone: "bg-pale-peach text-primary" },
                { label: "Bookmarks", value: bookmarksCount, icon: Bookmark, tone: "bg-[#e8f1fb] text-[#2563a8]" },
                { label: "Day streak", value: profile.streakDays, icon: Flame, tone: "bg-accent-gold-bg text-accent-gold-dark" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border bg-white p-3 text-center"
                  >
                    <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl ${item.tone}`}>
                      <Icon size={17} />
                    </div>
                    <p className="mt-1.5 font-manrope text-[18px] font-extrabold text-text-primary">
                      {item.value}
                    </p>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-text-muted">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard icon={Target} title="Study settings">
            <ProfileSettings
              medium={profile.medium}
              studyGoalMinutes={profile.studyGoalMinutes}
              notificationsEnabled={profile.notificationsEnabled}
              language={profile.language}
            />
          </SectionCard>

          <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
              Account
            </p>
            <p className="mt-1 text-[11px] font-medium leading-5 text-text-secondary">
              Student accounts are issued by your school. Contact your class teacher to
              change your login email or class enrolment.
            </p>
            <Link
              href="/profile/edit"
              className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-border text-[11px] font-extrabold text-primary-dark hover:border-primary"
            >
              <Pencil size={14} /> Update profile details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
