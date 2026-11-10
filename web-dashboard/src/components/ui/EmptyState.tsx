import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "px-5 py-10" : "px-6 py-16"
      }`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pale-peach">
        <Icon size={26} className="text-primary" />
      </div>
      <p className="mt-4 font-manrope text-[16px] font-extrabold text-text-primary">
        {title}
      </p>
      <p className="mt-1 max-w-sm text-[12px] font-medium leading-5 text-text-secondary">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
