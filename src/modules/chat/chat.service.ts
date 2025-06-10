import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(data: {
    chatId: string;
    senderId: string;
    content: string;
  }) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: data.chatId },
    });
    if (!chat) throw new NotFoundException("Chat not found");

    const message = await this.prisma.message.create({
      data: {
        chatId: data.chatId,
        senderId: data.senderId,
        text: data.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profile: { select: { photo: true } },
          },
        },
      },
    });

    await this.prisma.chat.update({
      where: { id: data.chatId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  async getUserChats(userId: string) {
    return await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
            deletedAt: null,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profile: { select: { photo: true } },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });
  }

  async createOneOnOneChat(userId1: string, userId2: string) {
    // Проверяем, есть ли уже чат с этими двумя участниками
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: userId1, deletedAt: null } } },
          { participants: { some: { userId: userId2, deletedAt: null } } },
        ],
      },
      include: {
        participants: true,
        messages: true,
      },
    });

    if (existingChat) {
      return existingChat; // Возвращаем, если уже есть
    }

    // Если нет, создаем новый чат
    const chat = await this.prisma.chat.create({
      data: {
        participants: {
          createMany: {
            data: [{ userId: userId1 }, { userId: userId2 }],
          },
        },
        lastMessageAt: new Date(),
      },
      include: {
        participants: true,
      },
    });

    return chat;
  }

  async getMessages(chatId: string, limit = 50, offset = 0) {
    return this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profile: { select: { photo: true } },
          },
        },
      },
    });
  }

  async markMessagesAsRead(chatId: string, userId: string) {
    // Обновляем все сообщения в чате, которые не были прочитаны и отправлены не этим пользователем
    await this.prisma.message.updateMany({
      where: {
        chatId,
        isRead: false,
        NOT: { senderId: userId }, // не помечаем свои сообщения
      },
      data: { isRead: true },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException("Message not found");

    // Проверяем, что удаляет именно отправитель
    if (message.senderId !== userId) {
      throw new ForbiddenException("You can only delete your own messages");
    }

    await this.prisma.message.delete({
      where: { id: messageId },
    });
  }

  async deleteChatForUser(chatId: string, userId: string) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId,
          chatId,
        },
      },
    });

    if (!participant) throw new NotFoundException("Chat participant not found");

    await this.prisma.chatParticipant.update({
      where: {
        userId_chatId: {
          userId,
          chatId,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
