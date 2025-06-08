import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UploadService } from "../upload/upload.service";
import { ICreatePost, IUpdatePost } from "./interfaces/post.interfaces";

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async getAllPosts(currentUserId: string) {
    const posts = await this.prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        text: true,
        mediaUrl: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                photo: true,
              },
            },
            followers: {
              where: {
                followerId: currentUserId,
              },
              select: { id: true },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          where: {
            userId: currentUserId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    return posts.map((post) => {
      const isLiked = post.likes.length > 0;
      const isFollowed = post.author.followers.length > 0;

      // убираем лишние поля
      const { likes, author, ...rest } = post;
      const { followers, ...cleanAuthor } = author;

      return {
        ...rest,
        isLiked,
        author: {
          ...cleanAuthor,
          isFollowed,
        },
      };
    });
  }

  async getPostById(id: string, currentUserId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id },
      select: {
        id: true,
        text: true,
        mediaUrl: true,
        createdAt: true,
        comments: {
          orderBy: {
            createdAt: "desc",
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
            id: true,
            username: true,
            profile: {
              select: {
                photo: true,
              },
            },
            followers: {
              where: {
                followerId: currentUserId,
              },
              select: { id: true },
            },
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
        likes: {
          where: {
            userId: currentUserId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    const isLiked = post.likes.length > 0;
    const isFollowed = post.author.followers.length > 0;

    const { likes, author, ...rest } = post;
    const { followers, ...cleanAuthor } = author;

    return {
      ...rest,
      isLiked,
      author: {
        ...cleanAuthor,
        isFollowed,
      },
    };
  }

  async createPost(data: ICreatePost) {
    const post = await this.prisma.post.findUnique({
      where: { id: data.authorId },
    });
    if (!post) {
      throw new NotFoundException("Пост не найден");
    }
    if (post.authorId !== data.authorId) {
      throw new ForbiddenException("Вы не можете удалить чужой пост");
    }
    return this.prisma.post.create({ data });
  }

  async updatePost(postId: string, postDto: IUpdatePost, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException("Пост не найден");
    }
    if (post.authorId !== userId) {
      throw new ForbiddenException("Вы не можете редактировать чужой пост");
    }
    if (
      postDto.mediaUrl &&
      post.mediaUrl &&
      post.mediaUrl !== postDto.mediaUrl
    ) {
      // удалить старый файл из облака
      await this.uploadService.deleteFile(post.mediaUrl);
    }
    return this.prisma.post.update({
      where: { id: postId },
      data: postDto,
    });
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
    await this.uploadService.deleteFile(post.mediaUrl);
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
