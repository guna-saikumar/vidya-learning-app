"use client";

import { Bell, Check, Languages, Loader2, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  updateLanguageAction,
  updateMediumAction,
  updateNotificationsAction,
  updateStudyGoalAction,
} from "@/app/actions";

interface ProfileSettingsProps {
  medium: string | null;
  studyGoalMinutes: number | null;
  notificationsEnabled: boolean;
  language: string;
}

const GOALS = [15, 30, 45, 60, 90];

export function ProfileSettings({
  medium,
  studyGoalMinutes,
  notificationsEnabled,
  language,
}: ProfileSettingsProps) {
  const router = useRouter();
  const [currentMedium, setCurrentMedium] = useState(
    (medium ?? "ENGLISH").toUpperCase().includes("TELUGU") ? "TELUGU" : "ENGLISH",
  );
  const [goal, setGoal] = useState(studyGoalMinutes ?? 30);
  const [notifications, setNotifications] = useState(notificationsEnabled);
  const [lang, setLang] = useState<"en" | "te">(language === "te" ? "te" : "en");
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const run = (key: string, task: () => Promise<{ ok: boolean; error?: string }>) => {
    setPending(key);
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await task();
      setPending(null);
      if (result.ok) {
        setMessage("Saved");
        router.refresh();
      } else {
        setError(result.error ?? "Could not save");
      }
    });
  };

  const chooseMedium = (value: "ENGLISH" | "TELUGU") => {
    setCurrentMedium(value);
    run("medium", () => updateMediumAction(value));
  };

  const chooseGoal = (value: number) => {
    setGoal(value);
    run("goal", () => updateStudyGoalAction(value));
  };

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    run("notifications", () => updateNotificationsAction(next));
  };

  const chooseLanguage = (value: "en" | "te") => {
    setLang(value);
    run("language", () => updateLanguageAction(value));
  };

  return (
    <div className="divide-y divide-border">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pale-peach text-primary">
            <Languages size={17} />
          </div>
          <div>
            <p className="font-manrope text-[13px] font-extrabold text-text-primary">
              Study medium
            </p>
            <p className="text-[11px] font-medium text-text-secondary">
              Primary instruction language for new content.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-soft-warm p-1">
          {(["ENGLISH", "TELUGU"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => chooseMedium(value)}
              disabled={pending === "medium"}
              className={`inline-flex h-8 items-center gap-1 rounded-lg px-3 text-[10px] font-extrabold transition-colors ${
                currentMedium === value
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-primary-dark"
              }`}
            >
              {pending === "medium" && currentMedium === value ? (
                <Loader2 size={12} className="animate-spin" />
              ) : null}
              {value === "ENGLISH" ? "English" : "తెలుగు"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pale-peach text-primary">
            <Target size={17} />
          </div>
          <div>
            <p className="font-manrope text-[13px] font-extrabold text-text-primary">
              Daily study goal
            </p>
            <p className="text-[11px] font-medium text-text-secondary">
              Pick a target that fits your routine.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {GOALS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => chooseGoal(value)}
              disabled={pending === "goal"}
              className={`inline-flex h-8 items-center gap-1 rounded-full border px-3 text-[10px] font-extrabold transition-colors ${
                goal === value
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-text-secondary hover:border-primary hover:text-primary"
              }`}
            >
              {pending === "goal" && goal === value ? (
                <Loader2 size={12} className="animate-spin" />
              ) : null}
              {value} min
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pale-peach text-primary">
            <Bell size={17} />
          </div>
          <div>
            <p className="font-manrope text-[13px] font-extrabold text-text-primary">
              Notifications
            </p>
            <p className="text-[11px] font-medium text-text-secondary">
              Circulars, achievements and reminders.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={notifications}
          onClick={toggleNotifications}
          disabled={pending === "notifications"}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            notifications ? "bg-primary" : "bg-border-secondary"
          }`}
        >
          <span
            className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform ${
              notifications ? "translate-x-5.5" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pale-peach text-primary">
            <Check size={17} />
          </div>
          <div>
            <p className="font-manrope text-[13px] font-extrabold text-text-primary">
              App language
            </p>
            <p className="text-[11px] font-medium text-text-secondary">
              Interface labels and notification copy.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-soft-warm p-1">
          {(
            [
              { id: "en", label: "English" },
              { id: "te", label: "తెలుగు" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => chooseLanguage(item.id)}
              disabled={pending === "language"}
              className={`inline-flex h-8 items-center gap-1 rounded-lg px-3 text-[10px] font-extrabold transition-colors ${
                lang === item.id
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-primary-dark"
              }`}
            >
              {pending === "language" && lang === item.id ? (
                <Loader2 size={12} className="animate-spin" />
              ) : null}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {message ? (
        <p className="px-5 pb-4 text-[11px] font-bold text-success">{message}</p>
      ) : null}
      {error ? (
        <p className="px-5 pb-4 text-[11px] font-bold text-error">{error}</p>
      ) : null}
    </div>
  );
}
