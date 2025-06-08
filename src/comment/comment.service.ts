import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async createComment(
    userId: string,
    postId: string,
    text: string,
    parentId?: string,
  ) {
    // Проверка, что пост существует
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException("Пост не найден");

    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId },
      });
      if (!parentComment)
        throw new NotFoundException("Родительский комментарий не найден");
      if (parentComment.postId !== postId)
        throw new BadRequestException(
          "Родительский комментарий относится к другому посту",
        );
    }

    return this.prisma.comment.create({
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
