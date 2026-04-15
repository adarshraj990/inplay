// src/presentation/websocket/namespaces/voice.namespace.ts
// WebRTC signaling namespace — handles SDP offer/answer and ICE candidates
import { Server as SocketServer, Socket } from 'socket.io';
import { Logger } from '../../../shared/utils/Logger';

const logger = Logger.getInstance();

export function voiceNamespace(io: SocketServer): void {
  const voice = io.of('/voice');

  voice.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;
    logger.debug(`🎙️ [Voice] User ${userId} connected`);

    // Join voice channel
    socket.on('channel:join', ({ channelId }: { channelId: string }) => {
      socket.join(`voice:${channelId}`);
      socket.to(`voice:${channelId}`).emit('peer:joined', { userId, socketId: socket.id });
    });

    // WebRTC signaling — SDP offer
    socket.on('signal:offer', ({ targetSocketId, offer }: { targetSocketId: string; offer: RTCSessionDescriptionInit }) => {
      socket.to(targetSocketId).emit('signal:offer', { fromUserId: userId, fromSocketId: socket.id, offer });
    });

    // WebRTC signaling — SDP answer
    socket.on('signal:answer', ({ targetSocketId, answer }: { targetSocketId: string; answer: RTCSessionDescriptionInit }) => {
      socket.to(targetSocketId).emit('signal:answer', { fromUserId: userId, answer });
    });

    // ICE candidate exchange
    socket.on('signal:ice_candidate', ({ targetSocketId, candidate }: { targetSocketId: string; candidate: RTCIceCandidateInit }) => {
      socket.to(targetSocketId).emit('signal:ice_candidate', { fromSocketId: socket.id, candidate });
    });

    // Mute/unmute status
    socket.on('media:mute_toggle', ({ channelId, isMuted }: { channelId: string; isMuted: boolean }) => {
      socket.to(`voice:${channelId}`).emit('peer:mute_changed', { userId, isMuted });
    });

    // Leave voice channel
    socket.on('channel:leave', ({ channelId }: { channelId: string }) => {
      socket.leave(`voice:${channelId}`);
      socket.to(`voice:${channelId}`).emit('peer:left', { userId });
    });

    socket.on('disconnect', () => {
      logger.debug(`🎙️ [Voice] User ${userId} disconnected`);
    });
  });
}
