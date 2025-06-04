import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class UserService {
  constructor(private readonly userS: PrismaService) {}

  getUsers() {
    return this.prisma.user.findMany();
  }

  createUser(name: string, email: string) {
    if (!name || !email) {
      throw new Error("Name and email are required");
    }
    return this.prisma.user.create({
      data: {
        name,
        email,
      },
    });
  }
}
