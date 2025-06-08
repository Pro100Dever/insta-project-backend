import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MulterFile } from "./interfaces/upload-file.interface";
import { UploadService } from "./upload.service";

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(@UploadedFile() file?: MulterFile) {
    if (!file) {
      throw new BadRequestException("File is required");
    }
    const url = await this.uploadService.uploadFile(file);
    return { url };
  }
}
