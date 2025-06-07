import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateAuthDto } from "./dto/create-auth.dto";

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
}
