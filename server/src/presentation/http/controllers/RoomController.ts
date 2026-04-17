// src/presentation/http/controllers/RoomController.ts
import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../../../infrastructure/database/DatabaseService';

export class RoomController {
  listRooms = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prisma = DatabaseService.getInstance().client;
      const rooms = await prisma.room.findMany({
        include: {
          owner: {
            select: {
              username: true,
              displayName: true,
              avatarUrl: true
            }
          },
          _count: {
            select: {
              members: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Map to a format the mobile app expects
      const formattedRooms = rooms.map(room => ({
        id: room.id,
        roomName: room.name,
        game: "Who is Spy?", // Defaulting for now as per schema
        host: room.owner.displayName || room.owner.username,
        players: room._count.members,
        maxPlayers: room.maxMembers,
        isLive: true
      }));

      res.json({ success: true, data: formattedRooms });
    } catch (e) {
      next(e);
    }
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
