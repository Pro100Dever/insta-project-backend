import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service"; // предположим, у тебя есть PrismaService
import { CreateAuthDto } from "./dto/create-auth.dto";
import { IRegUser } from "./interfaces/jwtPl.interface";
import { MailService } from "./mail/mail.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {} // инжекция клиента Prisma

  async register(user: CreateAuthDto) {
    const { email, fullName, username } = user;

    // Проверяем, существует ли пользователь с таким email или username
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (existingUser) {
      throw new ConflictException(
        "A user with this email or username already exists",
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
  }

  async validateUser(login: string, password: string) {
    // найти пользователя по email или username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: login }, { username: login }],
      },
      include: {
        profile: true, // чтобы получить фото
      },
    });

    if (!user) {
      throw new BadRequestException({ error: "Неправильный логин или пароль" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new BadRequestException({ error: "Неправильный логин или пароль" });
    }

    // Возвращаем пользовательские данные без пароля
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  login(user: IRegUser) {
    // Здесь генерируем JWT, например с помощью JwtService (из @nestjs/jwt)
    const payload = {
      username: user.username,
      email: user.email,
      sub: user.id,
    };
    const token = this.jwtService.sign(payload);
    return {
      message: "Login successful",
      access_token: token,
      user: {
        id: user.id,
        fullName: user.fullName,
        avatar: user.profile?.photo ?? null, // если в validateUser есть profile
      },
    };
  }

  async sendResetPasswordEmail(to: string, token: string) {
    await this.mailService.sendResetPasswordEmail(to, token);
  }

  async generatePasswordResetToken(email: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException("User with this email not found");
    }

    // Генерируем токен — 32 байта в hex, например
    const token = randomBytes(32).toString("hex");

    // Срок жизни токена — 1 час от текущего времени
    const expire = new Date(Date.now() + 3600 * 1000);

    // Сохраняем токен и время истечения в базе
    await this.prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExp: expire,
      },
    });

    return token;
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: {
          gt: new Date(), // проверяем, что токен не истек
        },
      },
    });

    if (!user) {
      throw new BadRequestException(
        "Password reset token is invalid or expired",
      );
    }

    const hashPas = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashPas,
        resetToken: null, // очищаем токен
        resetTokenExp: null,
      },
    });
    await this.mailService.confirmResetPasswordEmail(user.email);

    return { message: "Password successfully changed" };
  }
}
