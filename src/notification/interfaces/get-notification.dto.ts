import { EntityType, NotificationType } from "generated/prisma";

export interface NotificationFromUser {
  id: string;
  username: string;
  photo?: string | null;
}

export interface INotification {
  id: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  fromUser: NotificationFromUser;
  entityId?: string | null;
  entityType?: EntityType;
}
