import { Router } from 'express';
import { ReportController } from "../controllers/ReportController.js";
import { authenticate } from "../middlewares/authenticate.js";

const controller = new ReportController();
export const reportRouter = Router();

// All reporting routes are protected
reportRouter.use(authenticate);

reportRouter.post('/', controller.createReport);
