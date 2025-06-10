import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EntityType, NotificationType } from "generated/prisma";
import { NotificationService } from "src/modules/notification/notification.service";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async createComment(
    userId: string,
    postId: string,
    text: string,
    parentId?: string,
  ) {
    const chekPost = await this.prisma.post.findUnique({
      where: { id: postId },
    });
    if (!chekPost) throw new NotFoundException("Пост не найден");

    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId },
      });
      if (!parentComment)
        throw new NotFoundException("Родительский комментарий не найден");
    }
    // ... твоя текущая логика проверки поста и родительского комментария
    const comment = await this.prisma.comment.create({
      data: {
        authorId: userId,
        postId,
        text,
        parentId: parentId ?? null,
      },
      include: {
        author: {
          select: {
            username: true,
            profile: { select: { photo: true } },
          },
        },
      },
    });
    // Получаем автора поста, чтобы отправить уведомление
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    // Не отправляем уведомление если пользователь комментирует свой пост
    if (post && post.authorId !== userId) {
      await this.notificationService.createNotification({
        fromUserId: userId,
        toUserId: post.authorId,
        type: parentId ? NotificationType.REPLY : NotificationType.COMMENT,
        entityType: EntityType.COMMENT,
        entityId: comment.id,
      });
    }

    return comment;
  }

  async getComments(postId: string, currentUserId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException("Пост не найден");

    const comments = await this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: {
            username: true,
            profile: {
              select: { photo: true },
            },
          },
        },
        likes: {
          where: { userId: currentUserId },
          select: { id: true },
        },
      },
    });

    return comments.map((comment) => ({
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt,
      parentId: comment.parentId,
      author: {
        username: comment.author.username,
        photo: comment.author.profile?.photo || null,
      },
      likedByMe: comment.likes.length > 0,
    }));
  }

  async updateComment(commentId: string, userId: string, newText: string) {
    // Проверка, что комментарий принадлежит этому юзеру
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException("Комментарий не найден");
    if (comment.authorId !== userId)
      throw new ForbiddenException("Нет доступа");

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { text: newText },
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException("Комментарий не найден");
    if (comment.authorId !== userId)
      throw new ForbiddenException("Нет доступа");

    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
