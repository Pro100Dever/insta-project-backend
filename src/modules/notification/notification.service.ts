// src/notification/notification.service.ts
import { Injectable } from "@nestjs/common";
import { EntityType, NotificationType } from "generated/prisma";

import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createNotification(data: {
    fromUserId: string;
    toUserId: string;
    type: NotificationType;
    entityType: EntityType;
    entityId?: string;
  }) {
    if (data.fromUserId === data.toUserId) return null; // Не уведомлять самого себя

    return await this.prisma.notification.create({
      data,
    });
  }

  async getUserNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { toUserId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
            profile: { select: { photo: true } },
          },
        },
      },
    });
    return notifications.map((n) => ({
      id: n.id,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
      fromUser: {
        id: n.fromUser.id,
        username: n.fromUser.username,
        photo: n.fromUser.profile?.photo,
      },
      entityId: n.entityId ?? undefined,
      entityType: n.entityType ?? undefined,
    }));
  }

  async markAllAsRead(notificationId: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, toUserId: userId, isRead: false },
      data: { isRead: true },
    });
    return { message: "Notifications marked as read" };
  }
}
