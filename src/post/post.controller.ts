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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtPl } from "src/auth/interfaces/jwtPl.interface";
import { UploadService } from "../upload/upload.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PostService } from "./post.service";

interface IPostReq extends Request {
  user: JwtPl;
}
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller("posts")
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly uploadService: UploadService,
  ) {}

  @UseGuards(AuthGuard("jwt"))
  @Get()
  async getAllPosts(@Request() req: IPostReq) {
    return this.postService.getAllPosts(req.user?.sub);
  }

  @Get(":id")
  async getPostById(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Request() req: IPostReq,
  ) {
    return this.postService.getPostById(id, req.user?.sub);
  }

  @UseGuards(AuthGuard("jwt"))
  @UseInterceptors(FileInterceptor("file"))
  @Post()
  async createPost(
    @Body() postDto: CreatePostDto,
    @Request() req: IPostReq,
    @UploadedFile() file: MulterFile,
  ) {
    const mediaUrl = await this.uploadService.uploadFile(file);
    return this.postService.createPost({
      ...postDto,
      mediaUrl,
      authorId: req.user.sub,
    });
  }

  @UseGuards(AuthGuard("jwt"))
  @UseInterceptors(FileInterceptor("file"))
  @Patch(":id")
  async updatePost(
    @UploadedFile() file: MulterFile,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() postDto: UpdatePostDto,
    @Request() req: IPostReq,
  ) {
    let mediaUrl: string | undefined;
    if (file) {
      mediaUrl = await this.uploadService.uploadFile(file);
    }
    return this.postService.updatePost(
      id,
      { ...postDto, ...(mediaUrl ? { mediaUrl } : {}) },
      req.user.sub,
    );
  }

  @UseGuards(AuthGuard("jwt"))
  @UseInterceptors(FileInterceptor("file"))
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
