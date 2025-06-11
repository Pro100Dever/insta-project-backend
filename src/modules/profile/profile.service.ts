import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JwtPl } from "src/auth/interfaces/jwtPl.interface";
import { PrismaService } from "src/prisma/prisma.service";
import { UploadService } from "src/upload/upload.service";
import { IUpdateProfile } from "./interfaces/profile.interface";

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async findMe(userId: string) {
    if (!userId) {
      throw new Error("userId is required");
    }

    const myProfile = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        profile: {
          select: {
            photo: true,
            website: true,
            about: true,
          },
        },
      },
    });
    if (!myProfile) {
      throw new NotFoundException("User not found");
    }
    // Параллельно считаем статистику
    const [followersCount, followingCount, postsCount] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
      this.prisma.post.count({ where: { authorId: userId } }),
    ]);

    return {
      ...myProfile,
      followersCount,
      followingCount,
      postsCount,
    };
  }

  async update(user: JwtPl, dto: IUpdateProfile, mediaUrl: string | undefined) {
    const userId = user.sub;

    // Проверка существования пользователя
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) throw new NotFoundException("User not found");

    // Проверка уникальности username
    if (dto.username) {
      const usernameTaken = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });
      if (usernameTaken && usernameTaken.id !== userId) {
        throw new ConflictException("Username is already taken");
      }
    }

    if (dto.profile?.photo && mediaUrl) {
      await this.uploadService.deleteFile(dto.profile.photo);
    }
    // Обновляем пользователя и профиль одним запросом
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
        profile: dto.profile
          ? {
              update: {
                photo: mediaUrl ? mediaUrl : undefined,
                website: dto.profile.website,
                about: dto.profile.about,
              },
            }
          : undefined,
      },
    });

    // Параллельно считаем статистику
    const [followersCount, followingCount, postsCount] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
      this.prisma.post.count({ where: { authorId: userId } }),
    ]);

    // Получаем обновлённые данные пользователя с профилем
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        username: true,
        profile: {
          select: {
            photo: true,
            website: true,
            about: true,
          },
        },
      },
    });

    return {
      ...updatedUser,
      followersCount,
      followingCount,
      postsCount,
    };
  }

  async remove(user: JwtPl) {
    const userId = user.sub;
    await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
}
