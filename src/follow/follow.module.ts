import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { FollowController } from "./follow.controller";
import { FollowService } from "./follow.service";

@Module({
  controllers: [FollowController],
  providers: [FollowService, PrismaService],
})
export class FollowModule {}
