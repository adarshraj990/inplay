// src/presentation/http/middlewares/authenticate.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppConfig } from '../../../shared/config/AppConfig';
import { UnauthorizedError } from '../../../shared/errors/AppError';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const config = AppConfig.getInstance();
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No access token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { sub: string };
    (req as AuthenticatedRequest).userId = decoded.sub;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
};
