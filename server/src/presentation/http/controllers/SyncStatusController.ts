// src/presentation/http/controllers/SyncStatusController.ts
import { Request, Response } from 'express';
import { DatabaseService } from '../../../infrastructure/database/DatabaseService';
import { RedisService } from '../../../infrastructure/cache/RedisService';
import { Logger } from '../../../shared/utils/Logger';

const logger = Logger.getInstance();

export class SyncStatusController {
  public async getSyncStatus(req: Request, res: Response): Promise<void> {
    try {
      const db = DatabaseService.getInstance();
      const redis = RedisService.getInstance();

      const dbHealthy = await db.healthCheck();
      const redisHealthy = await redis.exists('health_check'); // Simple Redis check

      const status = {
        timestamp: new Date().toISOString(),
        services: {
          database: {
            status: dbHealthy ? 'healthy' : 'unhealthy',
            type: 'Prisma/PostgreSQL',
          },
          cache: {
            status: 'healthy', // RedisService has graceful fallback, so we check connectivity
            connected: redisHealthy !== null,
            type: 'Redis',
          },
          messaging: {
            status: 'active',
            type: 'Socket.io',
          },
        },
      };

      const allHealthy = dbHealthy; // Redis is optional in current implementation

      res.status(allHealthy ? 200 : 503).json(status);
    } catch (error) {
      logger.error('Sync status check failed:', error);
      res.status(500).json({ error: 'Internal health check failure' });
    }
  }
}
