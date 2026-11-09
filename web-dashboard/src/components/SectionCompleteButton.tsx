"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleSectionCompletedAction } from "@/app/actions";

interface SectionCompleteButtonProps {
  chapterId: string;
  sectionId: string;
  totalSections: number;
  initialCompleted: boolean;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function SectionCompleteButton({
  chapterId,
  sectionId,
  totalSections,
  initialCompleted,
  size = "md",
  showLabel = true,
}: SectionCompleteButtonProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await toggleSectionCompletedAction(
        chapterId,
        sectionId,
        totalSections,
        !completed,
      );
      if (result.ok) {
        setCompleted(!completed);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const iconSize = size === "sm" ? 15 : 17;

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={completed}
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl border font-extrabold transition-colors disabled:opacity-60 ${
          size === "sm" ? "h-8 px-2 text-[10px]" : "h-10 px-3 text-[11px]"
        } ${
          completed
            ? "border-success bg-success-bg text-success"
            : "border-border bg-white text-text-secondary hover:border-primary hover:text-primary"
        }`}
      >
        {pending ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : completed ? (
          <CheckCircle2 size={iconSize} />
        ) : (
          <Circle size={iconSize} />
        )}
        {showLabel ? <span>{completed ? "Completed" : "Mark done"}</span> : null}
      </button>
      {error ? (
        <span className="mt-1 max-w-[180px] text-right text-[10px] font-bold text-error">
          {error}
        </span>
      ) : null}
    </div>
  );
}
