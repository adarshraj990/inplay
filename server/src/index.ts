import 'dotenv/config';

// src/index.ts — Indplay Server Entry Point
import 'reflect-metadata';
import { createApp } from './app';
import { createSocketServer } from './presentation/websocket/socketServer';
import { DatabaseService } from './infrastructure/database/DatabaseService';
import { RedisService } from './infrastructure/cache/RedisService';
import { Logger } from './shared/utils/Logger';
import { AppConfig } from './shared/config/AppConfig';
import http from 'http';

const logger = Logger.getInstance();

async function bootstrap(): Promise<void> {
  try {
    // ── Load configuration ───────────────────────────────
    const config = AppConfig.getInstance();
    logger.info(`🚀 Starting Indplay Server in ${config.nodeEnv} mode`);

    // ── Connect to Database ──────────────────────────────
    const db = DatabaseService.getInstance();
    await db.connect();

    // ── Connect to Redis ─────────────────────────────────
    const redis = RedisService.getInstance();
    await redis.connect();
    if (redis.isConnected) {
      logger.info('✅ Redis connected');
    }

    // ── Initialize Express App ───────────────────────────
    const app = createApp();
    const httpServer = http.createServer(app);

    // ── Initialize Socket.io ─────────────────────────────
    const io = createSocketServer(httpServer);
    logger.info('✅ Socket.io server initialized');

    // ── Start Listening ──────────────────────────────────
    const port = config.port;
    httpServer.listen(port, () => {
      logger.info(`🟢 Indplay Server listening on http://localhost:${port}`);
      logger.info(`📡 WebSocket endpoint: ws://localhost:${port}`);
      logger.info(`📚 API Docs: http://localhost:${port}/api/docs`);
    });

    // ── Graceful Shutdown ────────────────────────────────
    const shutdown = async (signal: string) => {
      logger.info(`\n⚠️  ${signal} received – shutting down gracefully...`);
      httpServer.close(async () => {
        await db.disconnect();
        await redis.disconnect();
        logger.info('👋 Server shutdown complete');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
