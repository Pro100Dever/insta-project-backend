import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtPayload } from "./../../dist/auth/interfaces/jwtPayload.interface.d";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { IProfile } from "./interfaces/profile.interface";
import { ProfileService } from "./profile.service";

interface AuthReq extends Request {
  user: JwtPayload; // или какой у тебя тип payload
}

@Controller("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  findMe(@Request() req: AuthReq): Promise<IProfile> {
    return this.profileService.findOne(req.user);
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch("me")
  @UsePipes(new ValidationPipe())
  update(
    @Request() req: AuthReq,
    @Body() dto: UpdateProfileDto,
  ): Promise<IProfile> {
    return this.profileService.update(req.user, dto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete("me")
  async remove(@Request() req: AuthReq) {
    await this.profileService.remove(req.user);
    return { message: "You'r account was deleted" };
  }
}
