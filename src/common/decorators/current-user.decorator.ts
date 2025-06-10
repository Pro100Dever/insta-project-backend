import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { INotiReq } from "src/modules/notification/notification.controller";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): INotiReq | null => {
    const request = ctx.switchToHttp().getRequest<INotiReq>();
    return request ?? null;
  },
);
