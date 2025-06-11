import { Module } from "@nestjs/common";
import { NotificationService } from "src/modules/notification/notification.service";
import { PrismaService } from "src/prisma/prisma.service";
import { FollowController } from "./follow.controller";
import { FollowService } from "./follow.service";

@Module({
  controllers: [FollowController],
  providers: [FollowService, PrismaService, NotificationService],
})
export class FollowModule {}
