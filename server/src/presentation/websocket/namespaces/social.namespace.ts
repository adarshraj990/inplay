// src/presentation/websocket/namespaces/social.namespace.ts
import { Server as SocketServer, Socket } from 'socket.io';
import { Logger } from '../../../shared/utils/Logger';

const logger = Logger.getInstance();

export function socialNamespace(io: SocketServer): void {
  const social = io.of('/social');

  social.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;
    socket.join(`user:${userId}`);
    logger.debug(`👥 [Social] User ${userId} connected`);

    // Broadcast online status to all others in the namespace
    socket.broadcast.emit('user:online', { userId });

    // ── Friend Request Events ───────────────────────────
    socket.on('friend:request', ({ targetUserId }: { targetUserId: string }) => {
      social.to(`user:${targetUserId}`).emit('friend:request_received', { fromUserId: userId });
    });

    socket.on('friend:accept', ({ targetUserId }: { targetUserId: string }) => {
      social.to(`user:${targetUserId}`).emit('friend:request_accepted', { byUserId: userId });
    });

    // ── Room Invite Events ──────────────────────────────
    socket.on('room:invite', ({ targetUserId, roomId, roomName }: {
      targetUserId: string;
      roomId: string;
      roomName: string;
    }) => {
      social.to(`user:${targetUserId}`).emit('room:invite_received', {
        fromUserId: userId,
        roomId,
        roomName,
        timestamp: new Date().toISOString(),
      });
    });

    // ── Status Events ───────────────────────────────────
    socket.on('status:update', ({ status }: { status: string }) => {
      socket.broadcast.emit('user:status_changed', { userId, status });
    });

    socket.on('notification:clear', ({ notificationId }: { notificationId: string }) => {
      social.to(`user:${userId}`).emit('notification:cleared', { notificationId });
    });

    socket.on('disconnect', () => {
      logger.debug(`👥 [Social] User ${userId} disconnected`);
      // Broadcast offline status
      social.emit('user:offline', { userId });
    });
  });
}
