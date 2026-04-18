import { Request, Response, NextFunction } from 'express';
import { SocialService } from '../../../application/services/SocialService';
import { AuthenticatedRequest } from '../middlewares/authenticate';

export class SocialController {
  private socialService: SocialService;

  constructor() {
    this.socialService = SocialService.getInstance();
  }

  sendRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const senderId = (req as AuthenticatedRequest).userId;
      const { receiverId } = req.body;
      const request = await this.socialService.sendFriendRequest(senderId, receiverId);
      res.status(201).json({ success: true, data: request });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  };

  respondToRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const receiverId = (req as AuthenticatedRequest).userId;
      const { requestId, status } = req.body;
      await this.socialService.respondToRequest(receiverId, requestId, status);
      res.json({ success: true, message: 'Response recorded' });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  };

  listFriends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const friends = await this.socialService.listFriends(userId);
      res.json({ success: true, data: friends });
    } catch (e) {
      next(e);
    }
  };

  listPendingRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const requests = await this.socialService.listPendingRequests(userId);
      res.json({ success: true, data: requests });
    } catch (e) {
      next(e);
    }
  };

  unfriend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { friendId } = req.params;
      await this.socialService.unfriend(userId, friendId);
      res.json({ success: true, message: 'Unfriended successfully' });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  };

  getNotificationStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const stats = await this.socialService.getNotificationStats(userId);
      res.json({ success: true, data: stats });
    } catch (e) {
      next(e);
    }
  };

  blockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const blockerId = (req as AuthenticatedRequest).userId;
      const { userId: blockedId } = req.params;
      const result = await this.socialService.blockUser(blockerId, blockedId);
      res.json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  };

  unblockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const blockerId = (req as AuthenticatedRequest).userId;
      const { userId: blockedId } = req.params;
      await this.socialService.unblockUser(blockerId, blockedId);
      res.json({ success: true, message: 'User unblocked' });
    } catch (e) {
      next(e);
    }
  };

  // ── Messages ─────────────────────────────────────────────────────────────

  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const senderId = (req as AuthenticatedRequest).userId;
      const { receiverId, content, roomId } = req.body;
      const message = await this.socialService.sendMessage(senderId, receiverId, content, roomId);
      res.status(201).json({ success: true, data: message });
    } catch (e) {
      next(e);
    }
  };

  getChatHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = (req as AuthenticatedRequest).userId;
      const { userId: otherUserId } = req.params;
      const messages = await this.socialService.getChatHistory(currentUserId, otherUserId);
      res.json({ success: true, data: messages });
    } catch (e) {
      next(e);
    }
  };

  deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = (req as AuthenticatedRequest).userId;
      const { messageId } = req.params;
      await this.socialService.deleteMessage(currentUserId, messageId);
      res.json({ success: true, message: 'Message deleted successfully' });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  };
}
