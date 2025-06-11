import {
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtPl } from "src/auth/interfaces/jwtPl.interface";
import { LikeService } from "./like.service";

interface ILikeReq extends Request {
  user: JwtPl;
}

@Controller("likes")
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @UseGuards(AuthGuard("jwt"))
  @Post("post/:postId")
  async likePost(
    @Request() req: ILikeReq,
    @Param("postId", new ParseUUIDPipe()) postId: string,
  ) {
    await this.likeService.likePost(req.user.sub, postId);
    return { message: "Post was liked" };
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete("post/:postId")
  async unlikePost(
    @Request() req: ILikeReq,
    @Param("postId", new ParseUUIDPipe()) postId: string,
  ) {
    await this.likeService.unlikePost(req.user.sub, postId);
    return { message: "Post was unliked" };
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("comment/:commentId")
  async likeComment(
    @Request() req: ILikeReq,
    @Param("commentId", new ParseUUIDPipe()) commentId: string,
  ) {
    await this.likeService.likeComment(req.user.sub, commentId);
    return { message: "Comment was liked" };
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete("comment/:commentId")
  async unlikeComment(
    @Request() req: ILikeReq,
    @Param("commentId", new ParseUUIDPipe()) commentId: string,
  ) {
    await this.likeService.unlikeComment(req.user.sub, commentId);
    return { message: "Comment was unliked" };
  }
}
