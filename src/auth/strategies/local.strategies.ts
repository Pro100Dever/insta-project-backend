import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local"; // это стратегия Passport для логина+пароля
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: "login" }); // вызывает конструктор родителя, где можно указать настройки (например, имена полей)
  }

  // Метод validate вызывается Passport автоматически при попытке логина
  async validate(login: string, password: string) {
    // Проверяем пользователя через сервис аутентификации
    const user = await this.authService.validateUser(login, password);

    // Если пользователь не найден или пароль не подходит — кидаем ошибку
    if (!user) {
      throw new UnauthorizedException("Invalid login or password");
    }

    // Если всё ок, возвращаем объект пользователя — он будет доступен дальше в req.user
    return user; // этот объект будет в req.user
  }
}
