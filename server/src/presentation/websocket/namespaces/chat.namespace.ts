import { Server as SocketServer, Socket } from 'socket.io';
import { Logger } from '../../../shared/utils/Logger';

const logger = Logger.getInstance();

export interface ChatMessage {
  roomId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'gif' | 'voice_note';
  replyToId?: string;
  timestamp: string;
}

export function chatNamespace(io: SocketServer): void {
  const chat = io.of('/chat');

  chat.use((socket, next) => {
    // Namespace-level JWT is inherited from global middleware
    next();
  });

  chat.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;
    logger.debug(`💬 [Chat] User ${userId} connected`);

    // ── Join a room ────────────────────────────────────
    socket.on('room:join', async ({ roomId }: { roomId: string }) => {
      await socket.join(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('room:user_joined', { userId, roomId });
      logger.debug(`💬 User ${userId} joined room ${roomId}`);
    });

    // ── Leave a room ───────────────────────────────────
    socket.on('room:leave', async ({ roomId }: { roomId: string }) => {
      await socket.leave(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('room:user_left', { userId, roomId });
    });

    // ── Send message ───────────────────────────────────
    socket.on('message:send', async (data: any) => {
      try {
        // Broadcast only - persistence moved to /api/messages for private chats
        chat.to(`room:${data.roomId}`).emit('message:new', {
          roomId: data.roomId,
          senderId: userId,
          content: data.content,
          type: data.type || 'text',
          replyToId: data.replyToId,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        logger.error(`❌ Error broadcasting message:`, e);
      }
    });

    // ── Typing indicators ──────────────────────────────
    socket.on('typing:start', ({ roomId }: { roomId: string }) => {
      socket.to(`room:${roomId}`).emit('typing:user_started', { userId, roomId });
    });

    socket.on('typing:stop', ({ roomId }: { roomId: string }) => {
      socket.to(`room:${roomId}`).emit('typing:user_stopped', { userId, roomId });
    });

    // ── Read receipts ──────────────────────────────────
    socket.on('message:read', ({ messageId, roomId }: { messageId: string; roomId: string }) => {
      socket.to(`room:${roomId}`).emit('message:read_receipt', { userId, messageId });
    });

    // ── Reactions ─────────────────────────────────────
    socket.on('message:react', ({ messageId, roomId, emoji }: { messageId: string; roomId: string; emoji: string }) => {
      chat.to(`room:${roomId}`).emit('message:reaction', { userId, messageId, emoji });
    });

    socket.on('disconnect', () => {
      logger.debug(`💬 [Chat] User ${userId} disconnected`);
    });
  });
}
