// src/presentation/http/controllers/SocialController.ts
import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../../../infrastructure/database/DatabaseService';
import { AuthenticatedRequest } from '../middlewares/authenticate';

export class SocialController {
  private get prisma() {
    return DatabaseService.getInstance().client;
  }

  // ── Friends ──────────────────────────────────────────────────────────────

  sendRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const senderId = (req as AuthenticatedRequest).userId;
      const { receiverId } = req.body;

      if (senderId === receiverId) {
        res.status(400).json({ success: false, message: 'You cannot send a friend request to yourself' });
        return;
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
        res.status(400).json({ success: false, message: 'Friendship or request already exists' });
        return;
      }

      const request = await this.prisma.friendship.create({
        data: {
          requesterId: senderId,
          addresseeId: receiverId,
          status: 'PENDING'
        }
      });

      res.status(201).json({ success: true, data: request });
    } catch (e) {
      next(e);
    }
  };

  respondToRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const receiverId = (req as AuthenticatedRequest).userId;
      const { requestId, status } = req.body;

      const request = await this.prisma.friendship.updateMany({
        where: { id: requestId, addresseeId: receiverId },
        data: { status }
      });

      if (request.count === 0) {
        res.status(404).json({ success: false, message: 'Friend request not found' });
        return;
      }

      res.json({ success: true, message: 'Response recorded' });
    } catch (e) {
      next(e);
    }
  };

  listFriends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;

      const friendships = await this.prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: userId, status: 'ACCEPTED' },
            { addresseeId: userId, status: 'ACCEPTED' }
          ]
        },
        include: {
          requester: {
            select: { id: true, username: true, displayName: true, avatarUrl: true, status: true }
          },
          addressee: {
            select: { id: true, username: true, displayName: true, avatarUrl: true, status: true }
          }
        }
      });

      const friends = friendships.map(f => {
        return f.requesterId === userId ? f.addressee : f.requester;
      });

      res.json({ success: true, data: friends });
    } catch (e) {
      next(e);
    }
  };

  // ── Messages ─────────────────────────────────────────────────────────────

  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const senderId = (req as AuthenticatedRequest).userId;
      const { receiverId, content, roomId } = req.body;

      const message = await this.prisma.message.create({
        data: {
          senderId,
          roomId, // Note: Direct messages might need a specific room or logic
          content,
          type: 'TEXT'
        }
      });

      res.status(201).json({ success: true, data: message });
    } catch (e) {
      next(e);
    }
  };

  getChatHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = (req as AuthenticatedRequest).userId;
      const { userId: otherUserId } = req.params;

      // This logic depends on how rooms are structured for DMs
      // For now, let's fetch messages where both are involved if they share a room
      const messages = await this.prisma.message.findMany({
        where: {
          OR: [
            { senderId: currentUserId },
            { senderId: otherUserId }
          ]
        },
        include: { sender: true },
        orderBy: { createdAt: 'asc' },
        take: 50
      });

      res.json({ success: true, data: messages });
    } catch (e) {
      next(e);
    }
  };

  deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = (req as AuthenticatedRequest).userId;
      const { messageId } = req.params;

      const message = await this.prisma.message.findUnique({
        where: { id: messageId }
      });

      if (!message) {
        res.status(404).json({ success: false, message: 'Message not found' });
        return;
      }

      if (message.senderId !== currentUserId) {
        res.status(403).json({ success: false, message: 'Unauthorized to delete this message' });
        return;
      }

      await this.prisma.message.delete({
        where: { id: messageId }
      });
      
      res.json({ success: true, message: 'Message deleted successfully' });
    } catch (e) {
      next(e);
    }
  };
}
