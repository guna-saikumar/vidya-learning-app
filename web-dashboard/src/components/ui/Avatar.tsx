import { resolveAssetUrl, initials } from "@/lib/strings";

interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-[11px] rounded-lg",
  md: "h-10 w-10 text-[13px] rounded-xl",
  lg: "h-14 w-14 text-[18px] rounded-2xl",
  xl: "h-20 w-20 text-[26px] rounded-[22px]",
};

export function Avatar({ name, src, size = "md", className = "" }: AvatarProps) {
  const resolved = resolveAssetUrl(src);

  if (resolved) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved}
        alt={name ? `${name}'s profile photo` : "Student profile photo"}
        className={`shrink-0 object-cover ring-1 ring-border ${SIZES[size]} ${className}`}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`flex shrink-0 items-center justify-center bg-primary font-manrope font-extrabold text-white ${SIZES[size]} ${className}`}
    >
      {initials(name)}
    </div>
  );
}
