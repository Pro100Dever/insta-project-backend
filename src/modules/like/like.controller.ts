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

@UseGuards(AuthGuard("jwt"))
@Controller("likes")
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post("post/:postId")
  async likePost(
    @Request() req: ILikeReq,
    @Param("postId", new ParseUUIDPipe()) postId: string,
  ) {
    return this.likeService.likePost(req.user.sub, postId);
  }

  @Delete("post/:postId")
  async unlikePost(
    @Request() req: ILikeReq,
    @Param("postId", new ParseUUIDPipe()) postId: string,
  ) {
    return this.likeService.unlikePost(req.user.sub, postId);
  }

  @Post("comment/:commentId")
  async likeComment(
    @Request() req: ILikeReq,
    @Param("commentId", new ParseUUIDPipe()) commentId: string,
  ) {
    return this.likeService.likeComment(req.user.sub, commentId);
  }

  @Delete("comment/:commentId")
  async unlikeComment(
    @Request() req: ILikeReq,
    @Param("commentId", new ParseUUIDPipe()) commentId: string,
  ) {
    return this.likeService.unlikeComment(req.user.sub, commentId);
  }
}
