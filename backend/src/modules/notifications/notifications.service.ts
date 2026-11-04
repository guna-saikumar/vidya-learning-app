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

  async listMine(userId: string, query: NotificationListQuery) {
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
