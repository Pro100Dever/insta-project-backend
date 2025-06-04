import { Controller, Get } from "@nestjs/common";
import { User } from "@prisma/client";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): User[] {
    return this.userService.getUsers();
  }
}
