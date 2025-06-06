import { Module } from "@nestjs/common";
import { PostModule } from "./post/post.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [UserModule, PostModule, PrismaModule],
})
export class AppModule {}
