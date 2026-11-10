interface ProgressBarProps {
  percent: number;
  tone?: "primary" | "success" | "gold";
  size?: "sm" | "md" | "lg";
  label?: string;
  valueLabel?: string;
  className?: string;
}

const TONES: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  primary: "bg-gradient-to-r from-primary to-primary-dark",
  success: "bg-success",
  gold: "bg-accent-gold",
};

const SIZES: Record<NonNullable<ProgressBarProps["size"]>, string> = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-2.5",
};

export function ProgressBar({
  percent,
  tone = "primary",
  size = "md",
  label,
  valueLabel,
  className = "",
}: ProgressBarProps) {
  const value = Math.min(100, Math.max(0, Math.round(percent)));
  return (
    <div className={className}>
      {label || valueLabel ? (
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-muted">
          <span>{label}</span>
          <span>{valueLabel ?? `${value}%`}</span>
        </div>
      ) : null}
      <div className={`overflow-hidden rounded-full bg-border ${SIZES[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${TONES[tone]}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
