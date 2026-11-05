import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DbService, SQL_NOW_UTC } from "../../db/db.service";
import type { NotificationListQuery } from "./notifications.schemas";

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  detailedBody: string;
  type: string;
  icon: string;
  readAt: Date | null;
  actionRoute: string | null;
  actionLabel: string | null;
  createdAt: Date;
};

const NOTIFICATION_COLUMNS = `"id", "title", "message", "detailedBody", "type", "icon",
  "readAt", "actionRoute", "actionLabel", "createdAt"`;

export const toNotificationDto = (n: NotificationRow) => ({
  id: n.id,
  title: n.title,
  body: n.message,
  detailedBody: n.detailedBody,
  type: n.type,
  isRead: n.readAt !== null,
  createdAt: n.createdAt.toISOString(),
  icon: n.icon,
  actionRoute: n.actionRoute,
  actionLabel: n.actionLabel,
});

@Injectable()
export class NotificationsService {
  constructor(@Inject(DbService) private readonly db: DbService) {}

  private async ensureDefaults(userId: string) {
    const existing = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM "Notification" WHERE "userId" = $1`,
      [userId]
    );
    if (existing && parseInt(existing.count, 10) > 0) return;

    const defaults = [
      {
        id: `notif-welcome-${userId}`,
        title: "Welcome to Vidya",
        message: "Your learning journey starts here.",
        detailedBody:
          "Browse your class subjects, open a chapter and keep track of your progress.",
        type: "system",
        icon: "school",
        actionRoute: "Learn",
        actionLabel: "Start learning",
        readAt: null,
      },
      {
        id: `notif-streak-${userId}`,
        title: "Learning streak unlocked!",
        message: "You are on a roll — keep studying every day.",
        detailedBody: "Consistent daily study builds long-term understanding.",
        type: "achievement",
        icon: "emoji-events",
        actionRoute: "Progress",
        actionLabel: "View progress",
        readAt: null,
      },
      {
        id: `notif-announcement-${userId}`,
        title: "AP SCERT: new textbook content added",
        message: "Fresh chapter notes are now available in your curriculum.",
        detailedBody: "Open Learn to explore the latest chapters and sections.",
        type: "announcement",
        icon: "campaign",
        actionRoute: "Learn",
        actionLabel: "Open Learn",
        readAt: new Date(),
      },
    ];

    for (const d of defaults) {
      await this.db.query(
        `INSERT INTO "Notification"
           ("id", "userId", "title", "message", "detailedBody", "type", "icon",
            "actionRoute", "actionLabel", "readAt")
         VALUES ($1, $2, $3, $4, $5, $6::"NotificationType", $7, $8, $9, $10)
         ON CONFLICT ("id") DO NOTHING`,
        [d.id, userId, d.title, d.message, d.detailedBody, d.type, d.icon, d.actionRoute, d.actionLabel, d.readAt]
      );
    }
  }

  async listMine(userId: string, query: NotificationListQuery) {
    await this.ensureDefaults(userId);

    const readClause =
      query.unread === undefined
        ? ""
        : query.unread
          ? `AND "readAt" IS NULL`
          : `AND "readAt" IS NOT NULL`;

    const { rows } = await this.db.query<NotificationRow>(
      `SELECT ${NOTIFICATION_COLUMNS} FROM "Notification"
        WHERE "userId" = $1 ${readClause}
        ORDER BY "createdAt" DESC, "id" ASC`,
      [userId]
    );
    return rows.map(toNotificationDto);
  }

  async getMine(userId: string, id: string) {
    const row = await this.db.queryOne<NotificationRow>(
      `SELECT ${NOTIFICATION_COLUMNS} FROM "Notification"
        WHERE "id" = $1 AND "userId" = $2`,
      [id, userId]
    );
    if (!row) throw new NotFoundException({ error: "Notification not found" });
    return toNotificationDto(row);
  }

  async markRead(userId: string, id: string) {
    const { rowCount } = await this.db.query(
      `UPDATE "Notification"
          SET "readAt" = COALESCE("readAt", ${SQL_NOW_UTC})
        WHERE "id" = $1 AND "userId" = $2`,
      [id, userId]
    );
    if (rowCount === 0) {
      throw new NotFoundException({ error: "Notification not found" });
    }
    return { success: true };
  }

  async markAllRead(userId: string) {
    const { rowCount } = await this.db.query(
      `UPDATE "Notification" SET "readAt" = ${SQL_NOW_UTC}
        WHERE "userId" = $1 AND "readAt" IS NULL`,
      [userId]
    );
    return { success: true, markedCount: rowCount };
  }
}
