import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtPl } from "src/auth/interfaces/jwtPl.interface";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { INotification } from "./interfaces/get-notification.dto";
import { NotificationService } from "./notification.service";

export interface INotiReq extends Request {
  user: JwtPl;
}

@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(AuthGuard("jwt"))
  @Get()
  async getMyNotifications(
    @CurrentUser() req: INotiReq,
  ): Promise<INotification[]> {
    return this.notificationService.getUserNotifications(req.user.sub);
  }

  @Patch(":id")
  async markAsRead(
    @Param("id", new ParseUUIDPipe()) notificationId: string,
    @Request() req: INotiReq,
  ) {
    const userId = req.user.sub;

    return await this.notificationService.markAllAsRead(notificationId, userId);
  }
}
