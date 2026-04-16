import { Request, Response, NextFunction } from 'express';
import { FriendRequestModel, FriendRequestStatus } from '../../../infrastructure/database/schemas/FriendRequest';
import { MessageModel } from '../../../infrastructure/database/schemas/Message';
import { UserModel } from '../../../infrastructure/database/schemas/UserSchema';
import { AuthenticatedRequest } from '../middlewares/authenticate';
import mongoose from 'mongoose';

export class SocialController {
  // ── Friends ──────────────────────────────────────────────────────────────

  sendRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const senderId = (req as AuthenticatedRequest).userId;
      const { receiverId } = req.body;

      if (senderId === receiverId) {
        res.status(400).json({ success: false, message: 'You cannot send a friend request to yourself' });
        return;
      }

      // Check if request already exists
      const existingRequest = await FriendRequestModel.findOne({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId }
        ]
      });

      if (existingRequest) {
        res.status(400).json({ success: false, message: 'A friend request already exists between these users' });
        return;
      }

      const request = new FriendRequestModel({
        sender: senderId,
        receiver: receiverId,
        status: FriendRequestStatus.PENDING
      });

      await request.save();
      res.status(201).json({ success: true, data: request });
    } catch (e) {
      next(e);
    }
  };

  respondToRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const receiverId = (req as AuthenticatedRequest).userId;
      const { requestId, status } = req.body;

      if (!Object.values(FriendRequestStatus).includes(status) || status === FriendRequestStatus.PENDING) {
        res.status(400).json({ success: false, message: 'Invalid status response' });
        return;
      }

      const request = await FriendRequestModel.findOne({ _id: requestId, receiver: receiverId });

      if (!request) {
        res.status(404).json({ success: false, message: 'Friend request not found or not authorized' });
        return;
      }

      request.status = status;
      await request.save();

      res.json({ success: true, data: request });
    } catch (e) {
      next(e);
    }
  };

  listFriends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;

      const acceptedRequests = await FriendRequestModel.find({
        $or: [
          { sender: userId, status: FriendRequestStatus.ACCEPTED },
          { receiver: userId, status: FriendRequestStatus.ACCEPTED }
        ]
      }).populate('sender receiver', 'username displayName avatarUrl status');

      // Filter out the current user from the results
      const friends = acceptedRequests.map(req => {
        const sender = req.sender as any;
        const receiver = req.receiver as any;
        const senderId = sender._id?.toString() || sender.id;
        return senderId === userId ? receiver : sender;
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
      const { receiverId, content } = req.body;

      const message = new MessageModel({
        sender: senderId,
        receiver: receiverId,
        content
      });

      await message.save();
      res.status(201).json({ success: true, data: message });
    } catch (e) {
      next(e);
    }
  };

  getChatHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = (req as AuthenticatedRequest).userId;
      const { userId: otherUserId } = req.params;

      const messages = await MessageModel.find({
        $or: [
          { sender: currentUserId, receiver: otherUserId },
          { sender: otherUserId, receiver: currentUserId }
        ]
      }).sort({ createdAt: 1 }); // Oldest first for chat history

      res.json({ success: true, data: messages });
    } catch (e) {
      next(e);
    }
  };

  deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = (req as AuthenticatedRequest).userId;
      const { messageId } = req.params;

      const message = await MessageModel.findById(messageId);

      if (!message) {
        res.status(404).json({ success: false, message: 'Message not found' });
        return;
      }

      // Authorization check: Only the sender can delete the message
      if (message.sender.toString() !== currentUserId) {
        res.status(403).json({ success: false, message: 'Unauthorized to delete this message' });
        return;
      }

      await MessageModel.deleteOne({ _id: messageId });
      
      res.json({ success: true, message: 'Message deleted successfully' });
    } catch (e) {
      next(e);
    }
  };
}
