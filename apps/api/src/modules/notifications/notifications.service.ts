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
  message: n.message,
  detailedBody: n.detailedBody,
  type: n.type,
  icon: n.icon,
  read: n.readAt !== null,
  readAt: n.readAt?.toISOString() ?? null,
  actionRoute: n.actionRoute,
  actionLabel: n.actionLabel,
  createdAt: n.createdAt.toISOString(),
});

@Injectable()
export class NotificationsService {
  constructor(@Inject(DbService) private readonly db: DbService) {}

  async listMine(userId: string, query: NotificationListQuery) {
    const readClause =
      query.unread === undefined
        ? ""
        : query.unread
          ? `AND "readAt" IS NULL`
          : `AND "readAt" IS NOT NULL`;

    const [rows, unread] = await Promise.all([
      this.db.query<NotificationRow>(
        `SELECT ${NOTIFICATION_COLUMNS} FROM "Notification"
          WHERE "userId" = $1 ${readClause}
          ORDER BY "createdAt" DESC`,
        [userId]
      ),
      this.db.queryOne<{ count: number }>(
        `SELECT COUNT(*)::int AS "count" FROM "Notification"
          WHERE "userId" = $1 AND "readAt" IS NULL`,
        [userId]
      ),
    ]);
    return {
      items: rows.rows.map(toNotificationDto),
      unreadCount: unread?.count ?? 0,
    };
  }

  async markRead(userId: string, id: string) {
    const existing = await this.db.queryOne<NotificationRow>(
      `SELECT ${NOTIFICATION_COLUMNS} FROM "Notification"
        WHERE "id" = $1 AND "userId" = $2`,
      [id, userId]
    );
    if (!existing) {
      throw new NotFoundException({ error: "Notification not found" });
    }
    if (existing.readAt) return toNotificationDto(existing);

    const row = await this.db.queryOne<NotificationRow>(
      `UPDATE "Notification" SET "readAt" = ${SQL_NOW_UTC}
        WHERE "id" = $1
        RETURNING ${NOTIFICATION_COLUMNS}`,
      [id]
    );
    return toNotificationDto(row ?? existing);
  }

  async markAllRead(userId: string) {
    const { rowCount } = await this.db.query(
      `UPDATE "Notification" SET "readAt" = ${SQL_NOW_UTC}
        WHERE "userId" = $1 AND "readAt" IS NULL`,
      [userId]
    );
    return { updated: rowCount };
  }
}
