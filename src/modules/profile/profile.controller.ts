import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtPl } from "src/auth/interfaces/jwtPl.interface";
import { UploadService } from "src/upload/upload.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ProfileService } from "./profile.service";

interface IProfileReq extends Request {
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
@Controller("profile")
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly uploadService: UploadService,
  ) {}

  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  async findMe(@Request() req: IProfileReq) {
    return this.profileService.findMe(req.user.sub);
  }

  @UseGuards(AuthGuard("jwt"))
  @UseInterceptors(FileInterceptor("file"))
  @Patch("me")
  @UsePipes(new ValidationPipe())
  async update(
    @Request() req: IProfileReq,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file: MulterFile,
  ) {
    const mediaUrl = await this.uploadService.uploadFile(file);
    return this.profileService.update(req.user, dto, mediaUrl);
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete("me")
  async remove(@Request() req: IProfileReq) {
    await this.profileService.remove(req.user);
    return { message: "You'r account was deleted" };
  }
}
