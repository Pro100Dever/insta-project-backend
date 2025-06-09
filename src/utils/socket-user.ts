import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";
import { JwtPl } from "src/auth/interfaces/jwtPl.interface";

export async function getUserFromSocket(
  socket: Socket,
  jwtService: JwtService,
): Promise<JwtPl | null> {
  try {
    const authHeader = (socket.handshake.headers as Record<string, unknown>)[
      "authorization"
    ];
    const token =
      socket.handshake.auth?.token ||
      (typeof authHeader === "string" ? authHeader.split(" ")[1] : undefined);

    if (!token) return null;

    const payload = await jwtService.verifyAsync<JwtPl>(token as string);
    return payload;
  } catch {
    return null;
  }
}
