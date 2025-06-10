import { Injectable, NotFoundException } from "@nestjs/common";
import { EntityType, NotificationType } from "generated/prisma";
import { NotificationService } from "src/modules/notification/notification.service";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class LikeService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async likePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException("Пост не найден");
    }

    if (post.authorId !== userId) {
      await this.notificationService.createNotification({
        fromUserId: userId,
        toUserId: post.authorId,
        type: NotificationType.LIKE,
        entityType: EntityType.POST,
        entityId: postId,
      });
    }

    await this.prisma.like.create({
      data: { userId, postId },
    });
  }

  async unlikePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException("Пост не найден");
    }

    await this.prisma.like.delete({
      where: { userId_postId: { userId, postId } },
    });
  }

  async likeComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException("Комментарий не найден");
    }

    if (comment.authorId !== userId) {
      await this.notificationService.createNotification({
        fromUserId: userId,
        toUserId: comment.authorId,
        type: NotificationType.LIKE,
        entityType: EntityType.COMMENT,
        entityId: commentId,
      });
    }

    await this.prisma.commentLike.create({
      data: { userId, commentId },
    });
  }

  async unlikeComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException("Комментарий не найден");
    }

    await this.prisma.commentLike.delete({
      where: { userId_commentId: { userId, commentId } },
    });
  }
}
