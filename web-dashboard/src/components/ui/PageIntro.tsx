import type { ReactNode } from "react";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  badge?: ReactNode;
  description?: string;
  action?: ReactNode;
}

export function PageIntro({
  eyebrow,
  title,
  badge,
  description,
  action,
}: PageIntroProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
          {badge ? (
            <span className="rounded-full border border-border bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-primary-dark">
              {badge}
            </span>
          ) : null}
        </div>
        <h1 className="mt-1 font-manrope text-[24px] font-extrabold leading-8 tracking-tight text-text-primary md:text-[28px] md:leading-9">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-[13px] font-medium leading-5 text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
