import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface SectionCardProps {
  icon?: LucideIcon;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "",
}: SectionCardProps) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-border bg-white shadow-card ${className}`}
    >
      {title || action ? (
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon ? (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pale-peach">
                <Icon size={17} className="text-primary" />
              </div>
            ) : null}
            <div className="min-w-0">
              <h2 className="truncate font-manrope text-[14px] font-extrabold text-text-primary">
                {title}
              </h2>
              {subtitle ? (
                <p className="truncate text-[11px] font-medium text-text-muted">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
