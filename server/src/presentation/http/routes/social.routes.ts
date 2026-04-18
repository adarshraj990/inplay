import { Router } from 'express';
import { SocialController } from '../controllers/SocialController';
import { authenticate } from '../middlewares/authenticate';

const controller = new SocialController();
export const socialRouter = Router();

// All social routes require authentication
socialRouter.use(authenticate);

// Friends & Relationships
socialRouter.get('/friends', controller.listFriends);
socialRouter.get('/friends/requests', controller.listPendingRequests);
socialRouter.post('/friends/request', controller.sendRequest);
socialRouter.patch('/friends/respond', controller.respondToRequest);
socialRouter.delete('/friends/:friendId', controller.unfriend);

// Blocking
socialRouter.post('/block/:userId', controller.blockUser);
socialRouter.delete('/unblock/:userId', controller.unblockUser);

// Stats & Notifications
socialRouter.get('/notifications/stats', controller.getNotificationStats);
