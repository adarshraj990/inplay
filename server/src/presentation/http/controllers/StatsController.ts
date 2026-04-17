// src/presentation/http/controllers/StatsController.ts
import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../../../infrastructure/database/DatabaseService';

export class StatsController {
  getOverview = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prisma = DatabaseService.getInstance().client;

      // Count online users (any status that isn't OFFLINE)
      const onlineCount = await prisma.user.count({
        where: {
          status: {
            not: 'OFFLINE'
          }
        }
      });

      // Count active rooms
      const activeRoomsCount = await prisma.room.count();

      res.json({
        success: true,
        data: {
          onlineCount,
          activeRoomsCount,
          // You could add more global stats here
        }
      });
    } catch (e) {
      next(e);
    }
  };
}
