// src/presentation/websocket/middlewares/socketAuth.ts
import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AppConfig } from '../../../shared/config/AppConfig';

export const verifySocketJWT = (
  socket: Socket,
  next: (err?: Error) => void,
): void => {
  const config = AppConfig.getInstance();
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    return next(new Error('WS_UNAUTHORIZED: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { sub: string };
    (socket as any).userId = decoded.sub;
    next();
  } catch {
    next(new Error('WS_UNAUTHORIZED: Invalid or expired token'));
  }
};
