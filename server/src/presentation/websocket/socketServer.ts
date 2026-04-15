// src/presentation/websocket/socketServer.ts — Socket.io configuration
import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { AppConfig } from '../../shared/config/AppConfig';
import { Logger } from '../../shared/utils/Logger';
import { RedisService } from '../../infrastructure/cache/RedisService';
import { verifySocketJWT } from './middlewares/socketAuth';
import { chatNamespace } from './namespaces/chat.namespace';
import { gameNamespace } from './namespaces/game.namespace';
import { voiceNamespace } from './namespaces/voice.namespace';
import { socialNamespace } from './namespaces/social.namespace';

const logger = Logger.getInstance();

export function createSocketServer(httpServer: HttpServer): SocketServer {
  const config = AppConfig.getInstance();

  const io = new SocketServer(httpServer, {
    cors: {
      origin: config.socketCorsOrigin.split(','),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 20000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });

  // ── JWT Authentication Middleware ────────────────────
  io.use(verifySocketJWT);

  // ── Main connection handler ──────────────────────────
  io.on('connection', async (socket: Socket) => {
    const userId = (socket as any).userId as string;
    logger.info(`🔌 User connected: ${userId} [${socket.id}]`);

    // Track presence
    const redis = RedisService.getInstance();
    await redis.setOnline(userId);
    socket.join(`user:${userId}`); // personal room

    socket.on('disconnect', async (reason) => {
      await redis.setOffline(userId);
      logger.info(`🔌 User disconnected: ${userId} — ${reason}`);
      io.emit('user:offline', { userId });
    });
  });

  // ── Namespaced handlers ──────────────────────────────
  chatNamespace(io);
  gameNamespace(io);
  voiceNamespace(io);
  socialNamespace(io);

  logger.info(`⚡ Socket.io namespaces: /chat, /game, /voice, /social`);
  return io;
}
