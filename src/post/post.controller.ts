import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtPl } from "src/auth/interfaces/jwtPl.interface";
import { PostService } from "./post.service";

interface IPostReq extends Request {
  user: JwtPl;
}

@Controller("posts")
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getAllPosts() {
    return this.postService.getAllPosts();
  }

  @Get(":id")
  async getPostById(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.postService.getPostById(id);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post()
  createPost() {
    return;
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch(":id")
  updatePost() {
    return;
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete(":id")
  async deletePost(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Request() req: IPostReq,
  ) {
    await this.postService.deletePost(id, req.user.sub);
    return { message: "Post was deleted" };
  }

  @Get("/user/:id")
  async getUserPosts(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.postService.getUserPosts(id);
  }
}
