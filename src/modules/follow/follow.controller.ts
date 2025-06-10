import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtPl } from "src/auth/interfaces/jwtPl.interface";
import { FollowService } from "./follow.service";

interface IFollowReq extends Request {
  user: JwtPl;
}

@Controller("follow")
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @UseGuards(AuthGuard("jwt"))
  @Post(":id/follow")
  async follow(
    @Param("id", new ParseUUIDPipe()) targetId: string,
    @Request() req: IFollowReq,
  ) {
    return this.followService.followUser(req.user.sub, targetId);
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete(":id/unfollow")
  async unfollowUser(
    @Param("id", new ParseUUIDPipe()) targetId: string,
    @Request() req: IFollowReq,
  ) {
    return this.followService.unfollowUser(req.user.sub, targetId);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get(":id/followers")
  async getFollowers(
    @Param("id", new ParseUUIDPipe()) userId: string,
    @Request() req: IFollowReq,
  ) {
    return this.followService.getFollowers(userId, req.user.sub);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get(":id/following")
  async getFollowing(
    @Param("id", new ParseUUIDPipe()) userId: string,
    @Request() req: IFollowReq,
  ) {
    return this.followService.getFollowing(userId, req.user.sub);
  }
}
