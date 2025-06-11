import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtPl } from "src/auth/interfaces/jwtPl.interface";
import { getUserFromSocket } from "src/common/utils/socket-user";
import { ChatService } from "./chat.service";

interface SocketWithUser extends Socket {
  data: {
    user?: JwtPl;
    [key: string]: any;
  };
}

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server; // добавлен ! для инициализации позже

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(socket: Socket) {
    const user = await getUserFromSocket(socket, this.jwtService);
    if (user) {
      socket.data.user = user;
      socket.join(user.sub);
    } else {
      socket.disconnect();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleDisconnect(_socket: Socket) {
    // можно логировать дисконнекты
  }

  @SubscribeMessage("send_message")
  async handleSendMessage(
    @ConnectedSocket() socket: SocketWithUser,
    @MessageBody() body: { chatId: string; content: string },
  ) {
    const user = socket.data.user;
    if (!user) throw new Error("User not found on socket");

    const message = await this.chatService.sendMessage({
      chatId: body.chatId,
      senderId: user.sub,
      content: body.content,
    });

    this.server.to(message.chatId).emit("new_message", message);
    return message;
  }

  @SubscribeMessage("join_chat")
  async handleJoinChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    await socket.join(data.chatId);
  }

  @SubscribeMessage("create_chat")
  async handleCreateChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { otherUserId: string },
  ) {
    const user = socket.data.user as JwtPl;
    const chat = await this.chatService.createOneOnOneChat(
      user.sub,
      body.otherUserId,
    );
    return chat;
  }

  @SubscribeMessage("get_messages")
  async handleGetMessages(
    @MessageBody() data: { chatId: string; limit?: number; offset?: number },
  ) {
    const messages = await this.chatService.getMessages(
      data.chatId,
      data.limit ?? 50,
      data.offset ?? 0,
    );
    return messages;
  }

  @SubscribeMessage("mark_as_read")
  async handleMarkAsRead(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const user = socket.data.user as JwtPl;
    if (!user) return;

    await this.chatService.markMessagesAsRead(data.chatId, user.sub);

    // Можно отправить событие всем участникам, чтобы обновить состояние
    this.server
      .to(data.chatId)
      .emit("messages_read", { chatId: data.chatId, userId: user.sub });
  }
}
