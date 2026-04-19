import { Router } from 'express';
import { RewardController } from "../controllers/RewardController.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();
const rewardController = new RewardController();

// All reward routes require authentication
router.use(authenticate);

router.get('/tasks', (req, res) => rewardController.getDailyTasks(req, res));
router.post('/check-in', (req, res) => rewardController.checkIn(req, res));
router.post('/simulate-match', (req, res) => rewardController.simulateMatch(req, res));

export default router;
