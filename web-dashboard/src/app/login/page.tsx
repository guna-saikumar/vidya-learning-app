import { BookOpen, GraduationCap, Lock, Mail } from "lucide-react";
import { loginAction } from "../actions";

export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen bg-[#f4ece6]">
      <section className="hidden w-[46%] flex-col justify-between bg-primary-dark p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <BookOpen size={24} className="text-primary-light" />
          </div>
          <div>
            <p className="font-manrope text-lg font-extrabold tracking-tight">
              Vidya Learning
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-light">
              AP SCERT Division
            </p>
          </div>
        </div>

        <div className="max-w-md">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary-light">
            Student portal
          </p>
          <h1 className="mt-3 font-manrope text-4xl font-extrabold leading-[1.15] tracking-tight">
            Your syllabus, progress and bookmarks — all in one place.
          </h1>
          <p className="mt-4 text-sm leading-6 text-primary-light">
            Sign in with the credentials issued by your school to access your class 6–10
            curriculum, track chapter progress and pick up exactly where you left off.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-semibold text-primary-light">
          <GraduationCap size={18} />
          <span>ZPHS Gajuwaka · Class 8 · Section A</span>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-border bg-white p-8 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pale-peach">
                <BookOpen size={22} className="text-primary" />
              </div>
              <div>
                <h2 className="font-manrope text-xl font-extrabold text-text-primary">
                  Sign in
                </h2>
                <p className="text-[11px] font-semibold text-text-muted">
                  Student accounts are issued by the school.
                </p>
              </div>
            </div>

            {error ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-[#f3b8b2] bg-error-bg px-4 py-3 text-[12px] font-semibold text-error"
              >
                {error}
              </div>
            ) : null}

            <form action={loginAction} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-text-secondary"
                >
                  Student email
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-soft-warm px-3 py-3 focus-within:border-primary focus-within:bg-white">
                  <Mail size={18} className="text-text-muted" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="student@vidya.test"
                    className="w-full bg-transparent text-sm font-semibold text-text-primary outline-none placeholder:text-text-placeholder"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-text-secondary"
                >
                  Password
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-soft-warm px-3 py-3 focus-within:border-primary focus-within:bg-white">
                  <Lock size={18} className="text-text-muted" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm font-semibold text-text-primary outline-none placeholder:text-text-placeholder"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center rounded-xl bg-primary font-manrope text-[14px] font-extrabold text-white transition-colors hover:bg-primary-dark"
              >
                Sign in as student
              </button>
            </form>

            <div className="mt-5 rounded-xl bg-surface-soft px-4 py-3 text-[10px] font-semibold leading-4 text-text-muted">
              Demo account: <span className="font-extrabold text-text-secondary">student@vidya.test</span>{" "}
              / <span className="font-extrabold text-text-secondary">StudentDemo1!</span>
            </div>

            <p className="mt-4 text-center text-[10px] font-semibold leading-4 text-text-muted">
              Forgot your password? Contact your school administrator.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
