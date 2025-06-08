import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
      },
    });
    if (!user) throw new NotFoundException("User not found");
    return user;
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
