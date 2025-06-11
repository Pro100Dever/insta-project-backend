import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtPl } from "src/auth/interfaces/jwtPl.interface";
import { CommentService } from "./comment.service";
import { CreateCommentDto } from "./dto/create-comment.dto";

interface ICommentReq extends Request {
  user: JwtPl;
}

@Controller("comments")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard("jwt"))
  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() body: CreateCommentDto, @Request() req: ICommentReq) {
    return this.commentService.createComment(
      req.user.sub,
      body.postId,
      body.text,
      body.parentId,
    );
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("/post/:postId")
  async getComments(
    @Param("postId", new ParseUUIDPipe()) postId: string,
    @Request() req: ICommentReq,
  ) {
    return this.commentService.getComments(postId, req.user.sub);
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch(":id")
  async update(
    @Param("id", new ParseUUIDPipe()) commentId: string,
    @Body("text") newText: string,
    @Request() req: ICommentReq,
  ) {
    return this.commentService.updateComment(commentId, req.user.sub, newText);
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete(":id")
  async delete(
    @Param("id", new ParseUUIDPipe()) commentId: string,
    @Request() req: ICommentReq,
  ) {
    await this.commentService.deleteComment(commentId, req.user.sub);
    return { message: "Post was deleted" };
  }
}
