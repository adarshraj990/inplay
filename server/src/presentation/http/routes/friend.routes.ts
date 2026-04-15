// src/presentation/http/routes/friend.routes.ts
import { Router } from 'express';
import { FriendController } from '../controllers/FriendController';
import { authenticate } from '../middlewares/authenticate';

const controller = new FriendController();
export const friendRouter = Router();

friendRouter.use(authenticate);

friendRouter.get('/', controller.listFriends);
friendRouter.post('/request', controller.sendRequest);
friendRouter.post('/accept/:requestId', controller.acceptRequest);
friendRouter.post('/reject/:requestId', controller.rejectRequest);
friendRouter.delete('/unfriend/:friendId', controller.unfriend);
friendRouter.post('/block/:userId', controller.blockUser);
friendRouter.delete('/unblock/:userId', controller.unblockUser);
friendRouter.get('/requests', controller.listPendingRequests);
