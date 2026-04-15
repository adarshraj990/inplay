import { Router } from 'express';
import { SocialController } from '../controllers/SocialController';
import { authenticate } from '../middlewares/authenticate';

const socialController = new SocialController();
export const friendsRouter = Router();

// All routes require authentication
friendsRouter.use(authenticate);

friendsRouter.post('/request', socialController.sendRequest);
friendsRouter.patch('/respond', socialController.respondToRequest);
friendsRouter.get('/list', socialController.listFriends);
