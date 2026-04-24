import 'dotenv/config';

// src/index.ts — Indplay Server Entry Point
import 'reflect-metadata';
import { createApp } from "./app.js";
import { createSocketServer } from "./presentation/websocket/socketServer.js";
import { DatabaseService } from "./infrastructure/database/DatabaseService.js";
import { RedisService } from "./infrastructure/cache/RedisService.js";
import { Logger } from "./shared/utils/Logger.js";
import { AppConfig } from "./shared/config/AppConfig.js";
import http from 'http';

const logger = Logger.getInstance();

async function bootstrap(): Promise<void> {
  try {
    // ── Load configuration ───────────────────────────────
    const config = AppConfig.getInstance();
    logger.info(`🚀 Starting Indplay Server in ${config.nodeEnv} mode`);

    // ── Connect to Services (Strict Startup) ─────────────
    const db = DatabaseService.getInstance();
    await db.connect();
    logger.info('✅ Database connected successfully');

    const redis = RedisService.getInstance();
    await redis.connect();
    if (redis.isConnected) {
      logger.info('✅ Redis connected successfully');
    }

    // ── Initialize Express App ───────────────────────────
    const app = createApp();
    const httpServer = http.createServer(app);

    // ── Initialize Socket.io ─────────────────────────────
    const io = createSocketServer(httpServer);
    logger.info('✅ Socket.io server initialized');

    // ── Start Listening ──────────────────────────────────
    const port = config.port;
    const host = '0.0.0.0'; // Bind to all interfaces for Render/Docker

    httpServer.listen(port, host, () => {
      logger.info(`🟢 Indplay Server listening on http://${host}:${port}`);
      logger.info(`📡 WebSocket endpoint: ws://${host}:${port}`);
      logger.info(`📚 API Docs: http://${host}:${port}/api/docs`);

      // ── DB Keep-Alive Ping Service (Production Only) ─────
      if (config.nodeEnv === 'production') {
        logger.info('🛡️  Enabling Database Keep-Alive service (5m ping)');
        setInterval(async () => {
          try {
            const db = DatabaseService.getInstance();
            await db.healthCheck();
            logger.info('🛰️  Keep-Alive: Database ping successful');
          } catch (e) {
            logger.error('🛰️  Keep-Alive: Database ping failed', e);
          }
        }, 5 * 60 * 1000); // 5 minutes
      }

      // ── Self-Ping Keep-Awake Service (Production Only) ───
      if (config.nodeEnv === 'production') {
        const PING_URL = 'https://indplay-backend-v3-ghjr.onrender.com/ping';
        setInterval(async () => {
          try {
            const response = await fetch(PING_URL);
            if (response.ok) {
              logger.info('🛰️  Self-ping sent to stay awake: pong');
            } else {
              logger.warn(`🛰️  Self-ping failed with status: ${response.status}`);
            }
          } catch (e) {
            logger.error('🛰️  Self-ping error:', e);
          }
        }, 5 * 60 * 1000); // 5 minutes
      }
    });

    // ── Graceful Shutdown ────────────────────────────────
    const shutdown = async (signal: string) => {
      logger.info(`\n⚠️  ${signal} received – shutting down gracefully...`);
      httpServer.close(async () => {
        try {
          const db = DatabaseService.getInstance();
          const redis = RedisService.getInstance();
          await db.disconnect();
          await redis.disconnect();
        } catch (e) {
          logger.error('Error during shutdown:', e);
        }
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
