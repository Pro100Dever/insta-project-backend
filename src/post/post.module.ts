import { Module } from "@nestjs/common";
import { NotificationService } from "src/notification/notification.service";
import { PrismaService } from "src/prisma/prisma.service";
import { UploadService } from "src/upload/upload.service";
import { PostController } from "./post.controller";
import { PostService } from "./post.service";

@Module({
  controllers: [PostController],
  providers: [PostService, UploadService, PrismaService, NotificationService],
})
export class PostModule {}
