// src/presentation/http/routes/game.routes.ts
import { Router } from 'express';
import { GameController } from '../controllers/GameController';
import { authenticate } from '../middlewares/authenticate';

const controller = new GameController();
export const gameRouter = Router();

gameRouter.use(authenticate);

gameRouter.get('/sessions', controller.listSessions);
gameRouter.post('/sessions', controller.createSession);
gameRouter.get('/sessions/:sessionId', controller.getSession);
gameRouter.post('/sessions/:sessionId/start', controller.startSession);
gameRouter.post('/sessions/:sessionId/end', controller.endSession);
gameRouter.get('/leaderboard', controller.getLeaderboard);
gameRouter.get('/types', controller.getAvailableGameTypes);
