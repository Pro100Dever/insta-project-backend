import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config"; // Для работы с переменными окружения и конфигурацией (например, секреты)
import { JwtModule } from "@nestjs/jwt"; // Модуль для работы с JWT (создание и проверка токенов)
import { PassportModule } from "@nestjs/passport"; // Модуль для интеграции Passport.js (авторизация и аутентификация)
import { AuthController } from "./auth.controller"; // Контроллер для роутов аутентификации (например, login)
import { AuthService } from "./auth.service"; // Сервис с логикой аутентификации (валидация пользователей, генерация токенов и т.п.)
import { MailService } from "./mail/mail.service";
import { JwtStrategy } from "./strategies/jwt.strategies"; // JWT стратегия для проверки JWT токенов
import { LocalStrategy } from "./strategies/local.strategies"; // Локальная стратегия для логина через username/password (если нужна)

@Module({
  imports: [
    // Настраиваем Passport с дефолтной стратегией "jwt"
    PassportModule.register({ defaultStrategy: "jwt" }),

    // Настраиваем модуль JWT асинхронно — чтобы получить секрет из конфигурации (например, из .env)
    JwtModule.registerAsync({
      imports: [ConfigModule], // Импортируем модуль конфигурации, чтобы ConfigService был доступен
      inject: [ConfigService], // Внедряем ConfigService в useFactory
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"), // Берем секретный ключ из конфигурации
        signOptions: { expiresIn: "1h" }, // Время жизни JWT токена — 1 час
      }),
    }),

    ConfigModule, // Импортируем ConfigModule чтобы иметь доступ к env переменным
  ],

  providers: [
    MailService,
    AuthService, // Сервис с логикой аутентификации
    JwtStrategy, // Стратегия проверки JWT токенов
    LocalStrategy, // Стратегия локальной аутентификации (если используется)
  ],

  controllers: [
    AuthController, // Контроллер для аутентификационных эндпоинтов (login, register и т.п.)
  ],

  exports: [
    AuthService, // Экспортируем сервис аутентификации, чтобы другие модули могли его использовать
  ],
})
export class AuthModule {}
