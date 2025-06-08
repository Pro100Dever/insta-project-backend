import { Controller, Get, Param, Patch, Request } from "@nestjs/common";
import { JwtPl } from "src/auth/interfaces/jwtPl.interface";
import { NotificationService } from "./notification.service";

interface INotiReq extends Request {
  user: JwtPl;
}

@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@Request() req: INotiReq) {
    return this.notificationsService.getNotificationsForUser(req.user.sub);
  }
  @Patch(":id/read")
  async markAsRead(@Param("id") id: number, @Request() req: INotiReq) {
    // можно проверить, что уведомление принадлежит этому пользователю
    return this.notificationsService.markAsRead(id, req.user.sub);
  }
}
