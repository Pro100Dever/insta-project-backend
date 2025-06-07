import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local"; // это стратегия Passport для логина+пароля
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super(); // вызывает конструктор родителя, где можно указать настройки (например, имена полей)
  }

  // Метод validate вызывается Passport автоматически при попытке логина
  async validate(
    username: string,
    password: string,
  ): Promise<{ id: number; username: string } | null> {
    // Проверяем пользователя через сервис аутентификации
    const user = await this.authService.validateUser(username, password);

    // Если пользователь не найден или пароль не подходит — кидаем ошибку
    if (!user) {
      throw new UnauthorizedException("Invalid username or password");
    }

    // Если всё ок, возвращаем объект пользователя — он будет доступен дальше в req.user
    return user;
  }
}
