import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EntityType, NotificationType } from "generated/prisma";
import { NotificationService } from "src/modules/notification/notification.service";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class FollowService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException("Нельзя подписаться на самого себя");
    }

    const followerUser = await this.prisma.user.findUnique({
      where: { id: followerId },
    });
    if (!followerUser) {
      throw new NotFoundException(
        "Пользователь, который подписывается, не найден",
      );
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId },
    });
    if (!targetUser) {
      throw new NotFoundException("Пользователь не найден");
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    if (existingFollow) {
      throw new BadRequestException("Вы уже подписаны на этого пользователя");
    }

    await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    // Отправляем уведомления подписчикам

    await this.notificationService.createNotification({
      fromUserId: followerId,
      toUserId: followingId,
      type: NotificationType.FOLLOW,
      entityType: EntityType.NONE,
    });

    return { message: "Подписка оформлена" };
  }

  async unfollowUser(followerId: string, followingId: string) {
    try {
      await this.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });
      return { message: "Подписка отменена" };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      throw new BadRequestException("Вы не подписаны на этого пользователя");
    }
  }

  async getFollowers(userId: string, currentUserId: string) {
    // Получаем список подписчиков и проверяем, подписан ли на них currentUserId
    const followers = await this.prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            fullName: true,
            username: true,
            profile: { select: { photo: true } },
          },
        },
      },
    });

    // Получаем id всех подписчиков
    const followerIds = followers.map((f) => f.follower.id);

    // Получаем все подписки currentUserId на этих пользователей (чтобы понять, подписан ли)
    const currentUserFollowings = await this.prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: { in: followerIds },
      },
      select: { followingId: true },
    });

    const followingSet = new Set(
      currentUserFollowings.map((f) => f.followingId),
    );

    // Добавляем isFollowing в каждый объект
    return followers.map((f) => ({
      ...f.follower,
      isFollowing: followingSet.has(f.follower.id),
    }));
  }

  async getFollowing(userId: string, currentUserId: string) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            fullName: true,
            username: true,
            profile: { select: { photo: true } },
          },
        },
      },
    });

    const followingIds = following.map((f) => f.following.id);

    // Если смотрим свои подписки, можно пропустить проверку isFollowing,
    // т.к. мы сами на них подписаны
    if (userId === currentUserId) {
      return following.map((f) => ({
        ...f.following,
        isFollowing: true,
      }));
    }

    // Иначе проверяем, подписан ли currentUserId на этих пользователей
    const currentUserFollowings = await this.prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: { in: followingIds },
      },
      select: { followingId: true },
    });

    const followingSet = new Set(
      currentUserFollowings.map((f) => f.followingId),
    );

    return following.map((f) => ({
      ...f.following,
      isFollowing: followingSet.has(f.following.id),
    }));
  }
}
