import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type {
  CreateNotificationInput,
  NotificationListQuery,
} from "./notifications.schemas";

type NotificationRow = Prisma.NotificationGetPayload<object>;

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
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listMine(userId: string, query: NotificationListQuery) {
    const [rows, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: {
          userId,
          ...(query.unread === undefined
            ? {}
            : query.unread
              ? { readAt: null }
              : { readAt: { not: null } }),
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return { items: rows.map(toNotificationDto), unreadCount };
  }

  async markRead(userId: string, id: string) {
    const existing = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException({ error: "Notification not found" });
    }
    const row = existing.readAt
      ? existing
      : await this.prisma.notification.update({
          where: { id },
          data: { readAt: new Date() },
        });
    return toNotificationDto(row);
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: result.count };
  }

  /** `userId` → one student; `classId` → students in/assigned to the class; else all students. */
  async createAdmin(input: CreateNotificationInput) {
    let recipientIds: string[];

    if (input.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: input.userId },
        select: { id: true },
      });
      if (!user) throw new NotFoundException({ error: "User not found" });
      recipientIds = [user.id];
    } else if (input.classId) {
      const cls = await this.prisma.schoolClass.findUnique({
        where: { id: input.classId },
        select: { id: true },
      });
      if (!cls) throw new NotFoundException({ error: "Class not found" });
      const students = await this.prisma.user.findMany({
        where: {
          role: "STUDENT",
          OR: [
            { studentProfile: { activeClassId: input.classId } },
            { tasks: { some: { classId: input.classId } } },
          ],
        },
        select: { id: true },
      });
      recipientIds = students.map((s) => s.id);
    } else {
      const students = await this.prisma.user.findMany({
        where: { role: "STUDENT" },
        select: { id: true },
      });
      recipientIds = students.map((s) => s.id);
    }

    const result = await this.prisma.notification.createMany({
      data: recipientIds.map((userId) => ({
        userId,
        title: input.title,
        message: input.message,
        detailedBody: input.detailedBody,
        type: input.type,
        icon: input.icon,
        actionRoute: input.actionRoute,
        actionLabel: input.actionLabel,
      })),
    });
    return { created: result.count };
  }
}
