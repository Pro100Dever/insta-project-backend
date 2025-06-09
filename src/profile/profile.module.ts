import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { PrismaService } from "src/prisma/prisma.service";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

@Module({
  imports: [PrismaModule],
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService],
})
export class ProfileModule {}
