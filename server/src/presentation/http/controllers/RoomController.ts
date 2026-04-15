// src/presentation/http/controllers/RoomController.ts
import { Request, Response, NextFunction } from 'express';
export class RoomController {
  listRooms = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, data: [], message: 'listRooms — TODO' });
  };
  createRoom = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.status(201).json({ success: true, message: 'createRoom — TODO' });
  };
  getRoomById = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, message: 'getRoomById — TODO' });
  };
  updateRoom = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, message: 'updateRoom — TODO' });
  };
  deleteRoom = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, message: 'deleteRoom — TODO' });
  };
  joinRoom = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, message: 'joinRoom — TODO' });
  };
  leaveRoom = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, message: 'leaveRoom — TODO' });
  };
  getMembers = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, data: [], message: 'getMembers — TODO' });
  };
  getMessages = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, data: [], message: 'getMessages — TODO' });
  };
}
