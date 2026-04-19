import { DatabaseService } from "../../infrastructure/database/DatabaseService.js";
import { Logger } from "../../shared/utils/Logger.js";

const logger = Logger.getInstance();

export class SocialService {
  private static instance: SocialService;

  private constructor() {}

  public static getInstance(): SocialService {
    if (!SocialService.instance) {
      SocialService.instance = new SocialService();
    }
    return SocialService.instance;
  }

  private get prisma() {
    return DatabaseService.getInstance().client;
  }

  async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new Error('You cannot send a friend request to yourself');
    }

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: senderId, addresseeId: receiverId },
          { requesterId: receiverId, addresseeId: senderId }
        ]
      }
    });

    if (existing) {
      throw new Error('Friendship or request already exists');
    }

    return await this.prisma.friendship.create({
      data: {
        requesterId: senderId,
        addresseeId: receiverId,
        status: 'PENDING'
      }
    });
  }

  async respondToRequest(receiverId: string, requestId: string, status: 'ACCEPTED' | 'REJECTED') {
    const request = await this.prisma.friendship.updateMany({
      where: { id: requestId, addresseeId: receiverId },
      data: { status }
    });

    if (request.count === 0) {
      throw new Error('Friend request not found');
    }

    return true;
  }

  async listFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId, status: 'ACCEPTED' },
          { addresseeId: userId, status: 'ACCEPTED' }
        ]
      },
      include: {
        requester: {
          select: { id: true, username: true, displayName: true, image: true, status: true }
        },
        addressee: {
          select: { id: true, username: true, displayName: true, image: true, status: true }
        }
      }
    });

    return friendships.map(f => {
      return f.requesterId === userId ? (f as any).addressee : (f as any).requester;
    });
  }

  async listPendingRequests(userId: string) {
    return await this.prisma.friendship.findMany({
      where: { addresseeId: userId, status: 'PENDING' },
      include: {
        requester: {
          select: { id: true, username: true, displayName: true, image: true }
        }
      }
    });
  }

  async unfriend(userId: string, friendId: string) {
    const result = await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { requesterId: userId, addresseeId: friendId },
          { requesterId: friendId, addresseeId: userId }
        ]
      }
    });
    if (result.count === 0) throw new Error('Friendship not found');
    return true;
  }

  async getNotificationStats(userId: string) {
    const [pendingRequests, unreadNotifications] = await Promise.all([
      this.prisma.friendship.count({
        where: { addresseeId: userId, status: 'PENDING' }
      }),
      this.prisma.notification.count({
        where: { userId, isRead: false }
      })
    ]);

    return {
      total: pendingRequests + unreadNotifications,
      pendingRequests,
      unreadNotifications
    };
  }

  async blockUser(blockerId: string, blockedId: string) {
    return await this.prisma.blockedUser.upsert({
      where: {
        blockerId_blockedId: { blockerId, blockedId }
      },
      update: {},
      create: { blockerId, blockedId }
    });
  }

  async unblockUser(blockerId: string, blockedId: string) {
    return await this.prisma.blockedUser.deleteMany({
      where: { blockerId, blockedId }
    });
  }

  // ── Messages ─────────────────────────────────────────────────────────────

  async sendMessage(senderId: string, receiverId: string, content: string, roomId?: string) {
    return await this.prisma.message.create({
      data: {
        senderId,
        roomId: roomId || '', // Simplified for DMs
        content,
        type: 'TEXT'
      }
    });
  }

  async getChatHistory(currentUserId: string, otherUserId: string) {
    return await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId },
          { senderId: otherUserId }
        ]
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, image: true }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: 50
    });
  }

  async deleteMessage(currentUserId: string, messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) throw new Error('Message not found');
    if (message.senderId !== currentUserId) throw new Error('Unauthorized to delete this message');

    return await this.prisma.message.delete({
      where: { id: messageId }
    });
  }
}
