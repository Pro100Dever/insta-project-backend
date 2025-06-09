import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPl } from "src/auth/interfaces/jwtPl.interface";
import { INotiReq } from "src/notification/notification.controller";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPl | null => {
    const request = ctx.switchToHttp().getRequest<INotiReq>();
    return request.user ?? null;
  },
);
