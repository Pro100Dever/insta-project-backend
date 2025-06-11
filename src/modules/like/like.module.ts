import { Module } from "@nestjs/common";
import { NotificationService } from "src/modules/notification/notification.service";
import { PrismaService } from "src/prisma/prisma.service";
import { LikeController } from "./like.controller";
import { LikeService } from "./like.service";

@Module({
  controllers: [LikeController],
  providers: [LikeService, PrismaService, NotificationService],
})
export class LikeModule {}
