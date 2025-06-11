import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtPl } from "src/auth/interfaces/jwtPl.interface";
import { ChatService } from "./chat.service";
import { CreateChatDto, SendMessageDto } from "./dto/create-chat.dto";

interface IChatReq extends Request {
  user: JwtPl;
}

@Controller("chats")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Создать чат с другим пользователем
  @UseGuards(AuthGuard("jwt"))
  @Post("create")
  @UsePipes(new ValidationPipe())
  async createChat(@Body() dto: CreateChatDto, @Request() req: IChatReq) {
    const userId = req.user.sub;
    return this.chatService.createOneOnOneChat(userId, dto.otherUserId);
  }

  // Получить все чаты пользователя
  @UseGuards(AuthGuard("jwt"))
  @Get()
  @UsePipes(new ValidationPipe())
  async getUserChats(@Request() req: IChatReq) {
    const userId = req.user.sub;
    return this.chatService.getUserChats(userId);
  }

  // Отправить сообщение в чат
  @UseGuards(AuthGuard("jwt"))
  @Post("message")
  @UsePipes(new ValidationPipe())
  async sendMessage(@Body() dto: SendMessageDto, @Request() req: IChatReq) {
    const senderId = req.user.sub;
    return this.chatService.sendMessage({
      chatId: dto.chatId,
      senderId,
      content: dto.content,
    });
  }

  // Получить сообщения чата с пагинацией
  @UseGuards(AuthGuard("jwt"))
  @Get(":chatId/messages")
  @UsePipes(new ValidationPipe())
  async getMessages(
    @Param("chatId", new ParseUUIDPipe()) chatId: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    return this.chatService.getMessages(chatId, limitNum, offsetNum);
  }

  // Пометить сообщения в чате прочитанными
  @UseGuards(AuthGuard("jwt"))
  @Post(":chatId/mark-read")
  @UsePipes(new ValidationPipe())
  async markMessagesAsRead(
    @Param("chatId", new ParseUUIDPipe()) chatId: string,
    @Request() req: IChatReq,
  ) {
    const userId = req.user.sub;
    await this.chatService.markMessagesAsRead(chatId, userId);
    return { success: true };
  }

  // Удалить сообщение (только своё)
  @UseGuards(AuthGuard("jwt"))
  @Delete("message/:messageId")
  @UsePipes(new ValidationPipe())
  async deleteMessage(
    @Param("messageId", new ParseUUIDPipe()) messageId: string,
    @Request() req: IChatReq,
  ) {
    const userId = req.user.sub;
    await this.chatService.deleteMessage(messageId, userId);
    return { success: true };
  }

  // Удалить чат для пользователя (мягкое удаление)
  @UseGuards(AuthGuard("jwt"))
  @Delete(":chatId")
  @UsePipes(new ValidationPipe())
  async deleteChatForUser(
    @Param("chatId", new ParseUUIDPipe()) chatId: string,
    @Request() req: IChatReq,
  ) {
    const userId = req.user.sub;
    await this.chatService.deleteChatForUser(chatId, userId);
    return { success: true };
  }
}
