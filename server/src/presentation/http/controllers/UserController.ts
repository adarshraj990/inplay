import { Request, Response, NextFunction } from 'express';
import { MongoUserRepository } from '../../../infrastructure/repositories/UserRepository';
import { AuthenticatedRequest } from '../middlewares/authenticate';
import { AppConfig } from '../../../shared/config/AppConfig';
import { RewardService } from '../../../application/services/RewardService';

export class UserController {
  private userRepository: MongoUserRepository;

  constructor() {
    this.userRepository = new MongoUserRepository();
  }

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const user = await this.userRepository.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      res.json({ success: true, data: user });
    } catch (e) {
      next(e);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const updatedUser = await this.userRepository.update(userId, req.body);
      res.json({ success: true, data: updatedUser });
    } catch (e) {
      next(e);
    }
  };

  uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No image file provided' });
        return;
      }
      // Construct the URL to access the uploaded file
      // Typically `http://localhost:3000/uploads/avatars/filename.png`
      const config = AppConfig.getInstance();
      const serverUrl = config.nodeEnv === 'development' ? `http://localhost:${config.port}` : '';
      const avatarUrl = `${serverUrl}/uploads/avatars/${req.file.filename}`;
      
      const updatedUser = await this.userRepository.update(userId, { avatarUrl });
      res.json({ success: true, data: updatedUser, message: 'Avatar updated successfully' });
    } catch (e) {
      next(e);
    }
  };

  deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      await this.userRepository.delete(userId);
      res.json({ success: true, message: 'Account deleted successfully' });
    } catch (e) {
      next(e);
    }
  };

  searchUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query.q as string || '';
      const users = await this.userRepository.searchByUsername(query);
      res.json({ success: true, data: users });
    } catch (e) {
      next(e);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userRepository.findById(req.params.id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      res.json({ success: true, data: user });
    } catch (e) {
      next(e);
    }
  };

  getUserStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userRepository.findById(req.params.id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      res.json({ 
        success: true, 
        data: { level: user.level, xp: user.xp, coins: user.coins } 
      });
    } catch (e) {
      next(e);
    }
  };

  claimDailyReward = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const result = await RewardService.getInstance().claimLoginBonus(userId);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };
}
