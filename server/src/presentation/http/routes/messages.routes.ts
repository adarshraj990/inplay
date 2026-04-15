import { Router } from 'express';
import { SocialController } from '../controllers/SocialController';
import { authenticate } from '../middlewares/authenticate';

const socialController = new SocialController();
export const messagesRouter = Router();

// All routes require authentication
messagesRouter.use(authenticate);

messagesRouter.post('/send', socialController.sendMessage);
messagesRouter.get('/:userId', socialController.getChatHistory);
messagesRouter.delete('/:messageId', socialController.deleteMessage);
