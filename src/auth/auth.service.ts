import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service"; // предположим, у тебя есть PrismaService
import { CreateAuthDto } from "./dto/create-auth.dto";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {} // инжекция клиента Prisma

  async register(user: CreateAuthDto) {
    try {
      const { email, fullName, username } = user;

      // Проверяем, существует ли пользователь с таким email или username
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });
      if (existingUser) {
        throw new ConflictException(
          "Пользователь с таким email или username уже существует",
        );
      }

      const hashPas: string = await bcrypt.hash(user.password, 10);
      await this.prisma.user.create({
        data: {
          email,
          fullName,
          username,
          password: hashPas,
          profile: {
            create: {
              photo: null,
              website: null,
              about: null,
            },
          },
        },
      });
    } catch (error) {
      // Ловим любые ошибки, кроме конфликтов, и кидаем общий InternalServerError
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Ошибка при регистрации пользователя",
      );
    }
  }
}
