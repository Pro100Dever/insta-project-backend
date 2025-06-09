import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(viewedUserId: string, currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: viewedUserId },
      select: {
        id: true,
        username: true,
        fullName: true,
        profile: {
          select: {
            photo: true,
            website: true,
            about: true,
          },
        },
        followers: {
          where: {
            followerId: currentUserId,
          },
          select: { id: true },
        },
      },
    });
    if (!user) throw new NotFoundException("User not found");

    const isFollowed: boolean = user.followers.length > 0;
    // удаляем followers из финального объекта
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { followers, ...rest } = user;

    return {
      ...rest,
      isFollowed,
    };
  }

  async searchUsers(search: string, limit = 10) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { fullName: { contains: search, mode: "insensitive" } },
        ],
      },
      take: limit,
      select: {
        id: true,
        username: true,
        fullName: true,
        profile: { select: { photo: true } },
      },
    });
  }
}
