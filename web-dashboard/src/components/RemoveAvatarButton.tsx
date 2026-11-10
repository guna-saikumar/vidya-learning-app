"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeAvatarAction } from "@/app/actions";

export function RemoveAvatarButton({ hasAvatar }: { hasAvatar: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!hasAvatar) return null;

  const onClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await removeAvatarAction();
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  };

  return (
    <div className="flex flex-col items-start">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#f0c9c5] bg-error-bg px-3 text-[11px] font-extrabold text-error hover:bg-[#f8e2e0] disabled:opacity-60"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        Remove photo
      </button>
      {error ? <p className="mt-1 text-[10px] font-bold text-error">{error}</p> : null}
    </div>
  );
}
