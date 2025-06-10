import { Module } from "@nestjs/common";
import { NotificationService } from "src/modules/notification/notification.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CommentController } from "./comment.controller";
import { CommentService } from "./comment.service";

@Module({
  controllers: [CommentController],
  providers: [CommentService, PrismaService, NotificationService],
})
export class CommentModule {}
