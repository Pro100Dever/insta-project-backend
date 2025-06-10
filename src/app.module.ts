import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { MailModule } from "./auth/mail/mail.module";
import { ChatGateway } from "./modules/chat/chat.gateway";
import { ChatModule } from "./modules/chat/chat.module";
import { ChatService } from "./modules/chat/chat.service";
import { CommentModule } from "./modules/comment/comment.module";
import { FollowModule } from "./modules/follow/follow.module";
import { LikeModule } from "./modules/like/like.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { PostModule } from "./modules/post/post.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProfileModule } from "./modules/profile/profile.module";
import { UploadModule } from "./upload/upload.module";
import { UserModule } from "./modules/user/user.module";

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
    LikeModule,
    ChatModule,
  ],
  providers: [ChatService, ChatGateway],
})
export class AppModule {}
