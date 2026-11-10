export const initials = (name?: string | null): string => {
  if (!name) return "VS";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "VS";
  const first = parts[0]?.[0] ?? "V";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];
  return `${first}${last ?? ""}`.toUpperCase();
};

export const formatIndianDate = (iso?: string | null): string => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (iso?: string | null): string => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Human relative time ("Just now", "3h ago", "2d ago"). */
export const formatRelativeTime = (iso?: string | null): string => {
  if (!iso) return "Just now";
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "Just now";
  const diff = Date.now() - time;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return formatIndianDate(iso);
};

/** Base URL for browser-visible API assets (avatars). */
export const publicApiUrl = (): string =>
  (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000").replace(/\/+$/, "");

export const resolveAssetUrl = (url?: string | null): string | null => {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${publicApiUrl()}${path}`;
};

export const formatDuration = (minutes?: number | null): string => {
  if (!minutes || minutes <= 0) return "—";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`;
};

export const formatHours = (hours?: number | null): string => {
  if (!hours || hours <= 0) return "—";
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours % 1 === 0 ? hours : hours.toFixed(1)} hrs`;
};

export const greeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const pct = (value: number): string =>
  `${Math.min(100, Math.max(0, Math.round(value)))}%`;

/** Build a query string while dropping empty values. */
export const withQuery = (
  base: string,
  params: Record<string, string | number | undefined | null>,
): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${base}?${query}` : base;
};
