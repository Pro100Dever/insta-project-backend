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
import { JwtPl } from "src/auth/interfaces/jwtPl.interface";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ProfileService } from "./profile.service";

export interface IProfileReq extends Request {
  user: JwtPl;
}

@Controller("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  async findMe(@Request() req: IProfileReq) {
    return await this.profileService.findMe(req.user);
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch("me")
  @UsePipes(new ValidationPipe())
  async update(@Request() req: IProfileReq, @Body() dto: UpdateProfileDto) {
    return await this.profileService.update(req.user, dto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete("me")
  async remove(@Request() req: IProfileReq) {
    await this.profileService.remove(req.user);
    return { message: "You'r account was deleted" };
  }
}
