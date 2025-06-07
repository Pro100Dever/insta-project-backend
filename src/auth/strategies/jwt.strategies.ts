import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";
import { JwtPl } from "../interfaces/jwtPl.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {
    super({
      // Извлекаем JWT из заголовка Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // не игнорируем просроченные токены
      secretOrKey: config.get<string>("JWT_SECRET", "default-secret"), // секретный ключ для проверки подписи
    });
  }

  // Метод validate вызывается если токен валиден
  validate(payload: JwtPl) {
    // payload — это данные из токена (например, userId и email)
    // Можно проверить пользователя в базе, но часто просто возвращаем payload
    return { userId: payload.sub, username: payload.username };
  }
}
