interface ProgressRingProps {
  percent: number;
  size?: number;
  stroke?: number;
  label?: string;
  trackClassName?: string;
  barClassName?: string;
  valueClassName?: string;
  labelClassName?: string;
}

export function ProgressRing({
  percent,
  size = 96,
  stroke = 10,
  label = "Progress",
  trackClassName,
  barClassName,
  valueClassName = "text-text-primary",
  labelClassName = "text-text-muted",
}: ProgressRingProps) {
  const value = Math.min(100, Math.max(0, Math.round(percent)));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`${label}: ${value}%`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={stroke}
            className={trackClassName}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className={`transition-all duration-700 ${barClassName ?? ""}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-manrope font-extrabold leading-none ${valueClassName}`}
            style={{ fontSize: Math.max(12, Math.round(size * 0.19)) }}
          >
            {value}%
          </span>
          <span
            className={`mt-1 font-extrabold uppercase tracking-[0.14em] ${labelClassName}`}
            style={{ fontSize: Math.max(7, Math.round(size * 0.075)) }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
