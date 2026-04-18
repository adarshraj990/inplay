import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../../../shared/errors/AppError';

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(300).optional(),
  avatarUrl: z.string().url().optional(),
  status: z.enum(['ONLINE', 'OFFLINE', 'AWAY', 'IN_GAME', 'BUSY']).optional(),
}).strict();

export const validateUpdateProfile = (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Only validate if body is not empty
    if (Object.keys(req.body).length > 0) {
      updateProfileSchema.parse(req.body);
    }
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return next(new AppError(message, 400));
    }
    next(error);
  }
};
