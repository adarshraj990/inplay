// src/presentation/http/controllers/FriendController.ts
import { Request, Response, NextFunction } from 'express';
export class FriendController {
  listFriends = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, data: [] });
  };
  sendRequest = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.status(201).json({ success: true, message: 'sendRequest — TODO' });
  };
  acceptRequest = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, message: 'acceptRequest — TODO' });
  };
  rejectRequest = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, message: 'rejectRequest — TODO' });
  };
  unfriend = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, message: 'unfriend — TODO' });
  };
  blockUser = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, message: 'blockUser — TODO' });
  };
  unblockUser = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, message: 'unblockUser — TODO' });
  };
  listPendingRequests = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, data: [] });
  };
}
