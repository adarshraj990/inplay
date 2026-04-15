// src/presentation/http/routes/room.routes.ts
import { Router } from 'express';
import { RoomController } from '../controllers/RoomController';
import { authenticate } from '../middlewares/authenticate';

const controller = new RoomController();
export const roomRouter = Router();

roomRouter.use(authenticate);

roomRouter.get('/', controller.listRooms);
roomRouter.post('/', controller.createRoom);
roomRouter.get('/:roomId', controller.getRoomById);
roomRouter.patch('/:roomId', controller.updateRoom);
roomRouter.delete('/:roomId', controller.deleteRoom);
roomRouter.post('/:roomId/join', controller.joinRoom);
roomRouter.post('/:roomId/leave', controller.leaveRoom);
roomRouter.get('/:roomId/members', controller.getMembers);
roomRouter.get('/:roomId/messages', controller.getMessages);
