import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JwtPayload } from "src/auth/interfaces/jwtPayload.interface";
import { PrismaService } from "src/prisma/prisma.service";
import { IUpdateProfile } from "./interfaces/profile.interface";

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async findMe(user: JwtPayload) {
    const userId = user.sub;
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

  async update(user: JwtPayload, dto: IUpdateProfile) {
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

    // Обновляем пользователя и профиль одним запросом
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
        profile: dto.profile
          ? {
              update: {
                photo: dto.profile.photo,
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

  async remove(user: JwtPayload) {
    const userId = user.sub;
    await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
}
