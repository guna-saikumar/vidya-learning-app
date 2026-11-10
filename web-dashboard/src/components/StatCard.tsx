import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
}

export function StatCard({ label, value, note, icon: Icon }: StatCardProps) {
  return (
    <div className="group rounded-2xl border border-border bg-white p-4 shadow-sm transition-all hover:border-border-secondary hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-text-muted">
            {label}
          </p>
          <p className="mt-1 font-manrope text-[30px] font-extrabold leading-none text-text-primary">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-soft-warm text-primary transition-colors group-hover:bg-pale-peach">
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
      <p className="mt-3 text-[11px] font-semibold leading-4 text-text-secondary">
        {note}
      </p>
    </div>
  );
}
