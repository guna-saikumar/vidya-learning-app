import { getNotificationsPageData } from "@/lib/data";
import { PageIntro } from "@/components/ui/PageIntro";
import { NotificationsList } from "@/components/NotificationsList";

export const instant = false;

export default async function NotificationsPage() {
  const { notifications, unreadCount } = await getNotificationsPageData();

  return (
    <div className="space-y-4">
      <PageIntro
        eyebrow="Circulars & notices"
        badge={unreadCount > 0 ? `${unreadCount} unread` : "All read"}
        title="Notifications"
        description="School circulars, achievement updates and platform announcements."
      />
      <NotificationsList notifications={notifications} />
    </div>
  );
}
