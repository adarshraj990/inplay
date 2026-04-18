// src/presentation/http/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate } from '../middlewares/authenticate';
import { validateUpdateProfile } from '../middlewares/user.validation';
import { avatarUpload } from '../../../shared/utils/fileUpload';

const controller = new UserController();
export const userRouter = Router();

// Protected routes (require valid JWT)
userRouter.use(authenticate);

userRouter.get('/me', controller.getProfile);
userRouter.patch('/me', validateUpdateProfile, controller.updateProfile);
userRouter.post('/me/avatar', avatarUpload.single('avatar'), controller.uploadAvatar);
userRouter.post('/me/daily-reward', controller.claimDailyReward);
userRouter.delete('/me', controller.deleteAccount);

userRouter.get('/search', controller.searchUsers);
userRouter.get('/online', controller.getOnlineUsers);
userRouter.get('/:id', controller.getUserById);
userRouter.get('/:id/stats', controller.getUserStats);
