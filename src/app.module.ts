import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { PostModule } from "./post/post.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProfileModule } from "./profile/profile.module";
import { UploadModule } from "./upload/upload.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    UserModule,
    PostModule,
    PrismaModule,
    ProfileModule,
    AuthModule,
    UploadModule,
    ConfigModule.forRoot({
      isGlobal: true, // Доступен во всех модулях
    }),
  ],
})
export class AppModule {}
