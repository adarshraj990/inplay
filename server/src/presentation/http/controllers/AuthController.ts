import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../../application/services/AuthService';
import { AppError } from '../../../shared/errors/AppError';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response = await this.authService.register(req.body);
      res.status(201).json({ success: true, data: response });
    } catch (e) {
      next(e);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response = await this.authService.login(req.body);
      res.json({ success: true, data: response });
    } catch (e) {
      next(e);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response = await this.authService.refreshTokens(req.body.refreshToken);
      res.json({ success: true, data: response });
    } catch (e) {
      next(e);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Client clears token. If we had token blacklisting or Redis, we'd invalidate here.
    res.json({ success: true, message: 'Logged out successfully' });
  };

  forgotPassword = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.status(501).json({ success: false, message: 'Not implemented in this step' });
  };

  resetPassword = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.status(501).json({ success: false, message: 'Not implemented in this step' });
  };
}
