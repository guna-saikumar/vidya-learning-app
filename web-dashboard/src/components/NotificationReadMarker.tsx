"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { markNotificationReadAction } from "@/app/actions";

export function NotificationReadMarker({
  notificationId,
  isRead,
}: {
  notificationId: string;
  isRead: boolean;
}) {
  const router = useRouter();
  const fired = useRef(false);

  useEffect(() => {
    if (isRead || fired.current) return;
    fired.current = true;
    void markNotificationReadAction(notificationId).then((result) => {
      if (result.ok) router.refresh();
    });
  }, [isRead, notificationId, router]);

  return null;
}
