import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtPl } from "src/auth/interfaces/jwtPl.interface";
import { UserService } from "./user.service";

interface IUserReq extends Request {
  user: JwtPl;
}

@Controller("users") // базовый путь для всего контроллера
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard("jwt"))
  @Get(":id")
  async getUserById(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Request() req: IUserReq,
  ) {
    return await this.userService.findById(id, req.user?.sub);
  }

  @Get()
  async searchUsers(
    @Query("search") search: string,
    @Query("limit") limit?: string,
  ) {
    if (!search) return [];
    const limitNum = limit ? parseInt(limit) : 10;
    return this.userService.searchUsers(search, limitNum);
  }
}
