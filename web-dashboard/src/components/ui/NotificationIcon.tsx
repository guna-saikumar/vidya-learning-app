import { Bell, GraduationCap, Megaphone, Trophy } from "lucide-react";

/** Maps the API's material icon names to a static Lucide component. */
export function NotificationIcon({
  icon,
  size = 19,
}: {
  icon: string;
  size?: number;
}) {
  if (icon === "campaign") return <Megaphone size={size} />;
  if (icon === "emoji-events") return <Trophy size={size} />;
  if (icon === "school") return <GraduationCap size={size} />;
  return <Bell size={size} />;
}
