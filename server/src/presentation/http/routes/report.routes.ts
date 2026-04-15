import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authenticate } from '../middlewares/authenticate';

const controller = new ReportController();
export const reportRouter = Router();

// All reporting routes are protected
reportRouter.use(authenticate);

reportRouter.post('/', controller.createReport);
