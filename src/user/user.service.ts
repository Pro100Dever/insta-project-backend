import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  getUsers() {
    return this.prisma.user.findMany();
  }

  async createUser(name: string, email: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException("User with this email already exists");
    }

    return this.prisma.user.create({ data: { name, email } });
  }
}
