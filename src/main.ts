import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.enableCors({
    origin: "http://localhost:5173", // твой фронтенд
    credentials: true, // если используются куки / заголовки авторизации
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
