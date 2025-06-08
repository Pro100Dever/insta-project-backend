import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { MailModule } from "./auth/mail/mail.module";
import { FollowModule } from "./follow/follow.module";
import { PostModule } from "./post/post.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProfileModule } from "./profile/profile.module";
import { UploadModule } from "./upload/upload.module";
import { UserModule } from "./user/user.module";
import { NotificationModule } from './notification/notification.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    UserModule,
    PostModule,
    PrismaModule,
    ProfileModule,
    AuthModule,
    UploadModule,
    MailModule,
    ConfigModule.forRoot({
      isGlobal: true, // Доступен во всех модулях
    }),
    FollowModule,
    NotificationModule,
    CommentModule,
  ],
})
export class AppModule {}
