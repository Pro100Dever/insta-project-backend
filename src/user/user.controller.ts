import { Controller, Get, Param, ParseUUIDPipe, Query } from "@nestjs/common";

import { UserService } from "./user.service";

@Controller("users") // базовый путь для всего контроллера
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  async getUserById(@Param("id", new ParseUUIDPipe()) id: string) {
    return await this.userService.findById(id);
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
