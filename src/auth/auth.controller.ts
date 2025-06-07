import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { CreateAuthDto, NewPassBodyDto } from "./dto/create-auth.dto";
import { IRegUser } from "./interfaces/jwtPayload.interface";

interface AuthReq extends Request {
  user: IRegUser;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/register")
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.CREATED) // 201 Created
  async registration(@Body() user: CreateAuthDto) {
    await this.authService.register(user);
    return { message: "Пользователь успешно зарегистрирован" };
  }

  @UseGuards(AuthGuard("local"))
  @Post("/login")
  login(@Request() req: AuthReq) {
    // req.user пришел из LocalStrategy.validate
    return this.authService.login(req.user);
  }

  @Post("reset-password-request")
  @UsePipes(new ValidationPipe())
  async resetPasswordRequest(@Body("email") email: string) {
    // Логика создания токена и отправки письма
    const token = await this.authService.generatePasswordResetToken(email); // Генерация токена
    await this.authService.sendResetPasswordEmail(email, token);

    return { message: "Ссылка для сброса пароля отправлена на ваш email" };
  }

  @Post("reset-password")
  @UsePipes(new ValidationPipe())
  async resetPassword(@Body() body: NewPassBodyDto) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
