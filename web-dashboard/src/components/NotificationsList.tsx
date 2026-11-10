"use client";

import { Bell, CheckCheck, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/actions";
import type { NotificationItem } from "@/lib/types";
import { formatRelativeTime } from "@/lib/strings";
import { EmptyState } from "./ui/EmptyState";
import { NotificationIcon } from "./ui/NotificationIcon";

interface NotificationsListProps {
  notifications: NotificationItem[];
}

const toneFor = (type: string) => {
  if (type === "achievement") return "bg-accent-gold-bg text-accent-gold-dark";
  if (type === "announcement") return "bg-[#e8f1fb] text-[#2563a8]";
  return "bg-pale-peach text-primary";
};

export function NotificationsList({ notifications }: NotificationsListProps) {
  const router = useRouter();
  const [items, setItems] = useState(notifications);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const unread = items.filter((item) => !item.isRead).length;

  const open = (item: NotificationItem) => {
    setError(null);
    setBusyId(item.id);
    startTransition(async () => {
      if (!item.isRead) {
        const result = await markNotificationReadAction(item.id);
        if (!result.ok) {
          setError(result.error);
          setBusyId(null);
          return;
        }
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, isRead: true } : entry,
          ),
        );
      }
      router.push(`/notifications/${item.id}`);
    });
  };

  const markAll = () => {
    setError(null);
    setMarkingAll(true);
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      setMarkingAll(false);
      if (result.ok) {
        setItems((current) => current.map((entry) => ({ ...entry, isRead: true })));
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white shadow-card">
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="No notifications right now. Check back later for circulars and updates."
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-pale-peach px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary-dark">
            {unread > 0 ? `${unread} unread` : "All read"}
          </span>
          <span className="text-[11px] font-semibold text-text-muted">
            {items.length} notification{items.length === 1 ? "" : "s"}
          </span>
        </div>
        {unread > 0 ? (
          <button
            type="button"
            onClick={markAll}
            disabled={markingAll}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-primary/30 bg-pale-peach px-3 text-[11px] font-extrabold text-primary transition-colors hover:border-primary disabled:opacity-60"
          >
            {markingAll ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCheck size={14} />
            )}
            Mark all read
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-error/40 bg-error-bg px-4 py-3 text-[12px] font-semibold text-error">
          {error}
        </div>
      ) : null}

      <div className="space-y-2.5">
        {items.map((item) => {
          const busy = busyId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => open(item)}
              disabled={busy}
              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover disabled:opacity-70 ${
                item.isRead
                  ? "border-border bg-white"
                  : "border-border-accent bg-soft-warm"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneFor(
                  item.type,
                )}`}
              >
                <NotificationIcon icon={item.icon} size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`line-clamp-1 font-manrope text-[13px] font-extrabold ${
                      item.isRead ? "text-text-primary/70" : "text-text-primary"
                    }`}
                  >
                    {item.title}
                  </p>
                  {!item.isRead ? (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  ) : null}
                </div>
                <p className="mt-0.5 line-clamp-2 text-[12px] font-medium leading-4 text-text-secondary">
                  {item.body}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-text-muted">
                  <span>{formatRelativeTime(item.createdAt)}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em] ring-1 ring-border">
                    {item.type}
                  </span>
                </div>
              </div>

              {busy ? (
                <Loader2 size={16} className="mt-1 shrink-0 animate-spin text-primary" />
              ) : (
                <ChevronRight size={18} className="mt-1 shrink-0 text-text-muted" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-soft px-4 py-3 text-[11px] font-semibold text-text-secondary">
        <Sparkles size={14} className="shrink-0 text-primary" />
        Opening a notification marks it as read automatically.
      </div>
    </div>
  );
}
