import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class LikeService {
  constructor(private prisma: PrismaService) {}

  async likePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException("Пост не найден");
    }

    const exists = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (exists) {
      throw new BadRequestException("Вы уже лайкнули этот пост");
    }

    return this.prisma.like.create({
      data: { userId, postId },
    });
  }

  async unlikePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException("Пост не найден");
    }

    return this.prisma.like.delete({
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

    const exists = await this.prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });
    if (exists) {
      throw new BadRequestException("Вы уже лайкнули этот комментарий");
    }

    return this.prisma.commentLike.create({
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

    return this.prisma.commentLike.delete({
      where: { userId_commentId: { userId, commentId } },
    });
  }
}
