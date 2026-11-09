import { ArrowLeft, Save, Upload, UserRound } from "lucide-react";
import Link from "next/link";
import { updateProfileAction } from "@/app/actions";
import { getProfilePageData } from "@/lib/data";
import { PageIntro } from "@/components/ui/PageIntro";
import { Avatar } from "@/components/ui/Avatar";
import { SectionCard } from "@/components/ui/SectionCard";
import { RemoveAvatarButton } from "@/components/RemoveAvatarButton";

export const instant = false;

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-soft-warm px-3 text-[13px] font-semibold text-text-primary outline-none transition-colors focus:border-primary focus:bg-white";
const labelClass =
  "mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-secondary";

export default async function ProfileEditPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { profile, classes } = await getProfilePageData();

  return (
    <div className="space-y-4">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-text-muted hover:text-primary"
      >
        <ArrowLeft size={14} /> Back to profile
      </Link>

      <PageIntro
        eyebrow="Student account"
        title="Edit Profile"
        description="Keep your personal, academic and parent details up to date."
      />

      {error ? (
        <div className="rounded-xl border border-error/40 bg-error-bg px-4 py-3 text-[12px] font-semibold text-error">
          {error}
        </div>
      ) : null}

      <form action={updateProfileAction} className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SectionCard icon={UserRound} title="Personal details">
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="firstName">
                  First name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  required
                  maxLength={80}
                  defaultValue={profile.firstName ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="lastName">
                  Last name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  required
                  maxLength={80}
                  defaultValue={profile.lastName ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="gender">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  defaultValue={profile.gender ?? "MALE"}
                  className={inputClass}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="dob">
                  Date of birth
                </label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  defaultValue={profile.dob ?? profile.dateOfBirth ?? ""}
                  className={inputClass}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={UserRound} title="Location & school">
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="district">
                  District
                </label>
                <input
                  id="district"
                  name="district"
                  maxLength={120}
                  defaultValue={profile.district ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="location">
                  Village / city
                </label>
                <input
                  id="location"
                  name="location"
                  maxLength={120}
                  defaultValue={profile.villageCity ?? profile.location ?? ""}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="schoolName">
                  School name
                </label>
                <input
                  id="schoolName"
                  name="schoolName"
                  maxLength={200}
                  defaultValue={profile.schoolName ?? ""}
                  className={inputClass}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={UserRound} title="Academic details">
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="classId">
                  Class
                </label>
                <select
                  id="classId"
                  name="classId"
                  defaultValue={profile.classId ?? ""}
                  className={inputClass}
                >
                  <option value="">Keep current class</option>
                  {classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="section">
                  Section
                </label>
                <select
                  id="section"
                  name="section"
                  defaultValue={profile.section ?? "A"}
                  className={inputClass}
                >
                  {["A", "B", "C", "D"].map((value) => (
                    <option key={value} value={value}>
                      Section {value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="medium">
                  Medium
                </label>
                <select
                  id="medium"
                  name="medium"
                  defaultValue={(profile.medium ?? "ENGLISH").toUpperCase()}
                  className={inputClass}
                >
                  <option value="ENGLISH">English</option>
                  <option value="TELUGU">Telugu</option>
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="rollNumber">
                  Roll number
                </label>
                <input
                  id="rollNumber"
                  name="rollNumber"
                  maxLength={40}
                  defaultValue={profile.rollNumber ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="studyGoalMinutes">
                  Daily study goal (minutes)
                </label>
                <input
                  id="studyGoalMinutes"
                  name="studyGoalMinutes"
                  type="number"
                  min={1}
                  max={360}
                  defaultValue={profile.studyGoalMinutes ?? 30}
                  className={inputClass}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={UserRound} title="Parent & guardian details">
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="fatherName">
                  Father&apos;s name
                </label>
                <input
                  id="fatherName"
                  name="fatherName"
                  maxLength={120}
                  defaultValue={profile.fatherName ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="motherName">
                  Mother&apos;s name
                </label>
                <input
                  id="motherName"
                  name="motherName"
                  maxLength={120}
                  defaultValue={profile.motherName ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="parentPhone">
                  Parent mobile (10 digits)
                </label>
                <input
                  id="parentPhone"
                  name="parentPhone"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  defaultValue={profile.parentPhone ?? ""}
                  className={inputClass}
                />
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard icon={Upload} title="Profile photo">
            <div className="space-y-3 p-5">
              <div className="flex items-center gap-4">
                <Avatar name={profile.name} src={profile.avatarUrl} size="xl" />
                <div className="min-w-0">
                  <p className="font-manrope text-[13px] font-extrabold text-text-primary">
                    {profile.name}
                  </p>
                  <p className="text-[11px] font-medium text-text-secondary">
                    JPG, PNG, WEBP or GIF · max 5 MB
                  </p>
                </div>
              </div>
              <label className={labelClass} htmlFor="avatar">
                Upload new photo
              </label>
              <input
                id="avatar"
                name="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="block w-full cursor-pointer rounded-xl border border-dashed border-border-secondary bg-soft-warm px-3 py-3 text-[11px] font-semibold text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-[11px] file:font-extrabold file:text-white"
              />
              <RemoveAvatarButton hasAvatar={Boolean(profile.avatarUrl)} />
            </div>
          </SectionCard>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
              Save changes
            </p>
            <p className="mt-1 text-[11px] font-medium leading-5 text-text-secondary">
              Profile updates are saved to your student account and appear across the
              mobile app and dashboard.
            </p>
            <button
              type="submit"
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[12px] font-extrabold text-white transition-colors hover:bg-primary-dark"
            >
              <Save size={16} /> Save profile
            </button>
            <Link
              href="/profile"
              className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-xl border border-border text-[11px] font-extrabold text-text-secondary hover:border-primary hover:text-primary"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
