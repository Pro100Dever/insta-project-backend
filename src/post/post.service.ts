import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}
  async getAllPosts() {
    return await this.prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        text: true,
        mediaUrl: true,
        createdAt: true,
        author: {
          select: {
            username: true,
            profile: {
              select: {
                photo: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }
  async getPostById(id: string) {
    const post = await this.prisma.post.findFirst({
      where: { id },
      select: {
        id: true,
        text: true,
        mediaUrl: true,
        createdAt: true,
        comments: {
          orderBy: {
            createdAt: "desc", // или "asc" — по возрастанию
          },
          select: {
            id: true,
            text: true,
            createdAt: true,
            author: {
              select: {
                username: true,
                profile: {
                  select: {
                    photo: true,
                  },
                },
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
        },
        author: {
          select: {
            username: true,
            profile: {
              select: {
                photo: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }
    // Проверить, что текущий пользователь — автор
    if (post.authorId !== userId) {
      throw new ForbiddenException("You are not allowed to delete this post");
    }
    await this.prisma.post.delete({ where: { id: postId } });
  }

  async getUserPosts(id: string) {
    const userPosts = await this.prisma.user.findUnique({
      where: { id },
      select: {
        posts: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            mediaUrl: true,
          },
        },
      },
    });
    return userPosts?.posts || [];
  }
}
