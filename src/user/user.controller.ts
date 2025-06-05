import { Controller, Get } from "@nestjs/common";

import { UserService } from "./user.service";

@Controller("user") // базовый путь для всего контроллера
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.getUsers();
  }
}
