import { Router } from 'express';
import { SocialController } from "../controllers/SocialController.js";
import { authenticate } from "../middlewares/authenticate.js";

const socialController = new SocialController();
export const messagesRouter = Router();

// All routes require authentication
messagesRouter.use(authenticate);

messagesRouter.post('/send', socialController.sendMessage);
messagesRouter.get('/:userId', socialController.getChatHistory);
messagesRouter.delete('/:messageId', socialController.deleteMessage);
