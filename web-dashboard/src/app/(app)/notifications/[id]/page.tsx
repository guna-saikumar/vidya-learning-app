import { ArrowLeft, ArrowRight, Bell } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getNotificationDetailData } from "@/lib/data";
import { formatDateTime } from "@/lib/strings";
import { NotificationReadMarker } from "@/components/NotificationReadMarker";
import { NotificationIcon } from "@/components/ui/NotificationIcon";

export const instant = false;

const routeFor = (actionRoute?: string | null) => {
  if (!actionRoute) return null;
  const value = actionRoute.toLowerCase();
  if (value === "learn") return "/learn";
  if (value === "progress") return "/my-learning";
  if (value === "bookmarks") return "/bookmarks";
  if (value === "profile") return "/profile";
  if (value === "notifications") return "/notifications";
  return null;
};

export default async function NotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data;
  try {
    data = await getNotificationDetailData(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { notification } = data;
  const actionHref = routeFor(notification.actionRoute);

  return (
    <div className="space-y-4">
      <NotificationReadMarker
        notificationId={notification.id}
        isRead={notification.isRead}
      />

      <Link
        href="/notifications"
        className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-text-muted hover:text-primary"
      >
        <ArrowLeft size={14} /> All notifications
      </Link>

      <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
        <div className="border-b border-border bg-surface-soft p-5 md:p-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pale-peach text-primary">
              <NotificationIcon icon={notification.icon} size={23} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-primary-dark ring-1 ring-border">
                  {notification.type}
                </span>
                <span className="text-[10px] font-bold text-text-muted">
                  {formatDateTime(notification.createdAt)}
                </span>
                {!notification.isRead ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-white">
                    Unread
                  </span>
                ) : null}
              </div>
              <h1 className="mt-2 font-manrope text-[22px] font-extrabold leading-7 tracking-tight text-text-primary md:text-[26px] md:leading-8">
                {notification.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5 md:p-6">
          <p className="text-[14px] font-semibold leading-6 text-text-primary">
            {notification.body}
          </p>
          <p className="whitespace-pre-line text-[13.5px] font-medium leading-7 text-text-secondary">
            {notification.detailedBody || notification.body}
          </p>

          {actionHref && notification.actionLabel ? (
            <Link
              href={actionHref}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[12px] font-extrabold text-white transition-colors hover:bg-primary-dark"
            >
              {notification.actionLabel} <ArrowRight size={15} />
            </Link>
          ) : null}
        </div>
      </article>

      <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
          More notifications
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href="/notifications"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-white px-3 text-[11px] font-extrabold text-primary-dark hover:border-primary"
          >
            <Bell size={14} /> Open notification centre
          </Link>
          <Link
            href="/learn"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-white px-3 text-[11px] font-extrabold text-text-secondary hover:border-primary hover:text-primary"
          >
            Continue learning <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
