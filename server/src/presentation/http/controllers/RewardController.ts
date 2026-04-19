import { Request, Response } from 'express';
import { RewardService } from "../../../application/services/RewardService.js";
import { Logger } from "../../../shared/utils/Logger.js";

const logger = Logger.getInstance();
const rewardService = RewardService.getInstance();

export class RewardController {
  
  public async getDailyTasks(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await rewardService.ensureDailyReset(userId);
      
      const tasks = [
        {
          id: 'check-in',
          title: 'Daily Check-in',
          description: 'Log in every day to earn rewards',
          reward: 10,
          current: user.dailyRewards.hasCheckedIn ? 1 : 0,
          target: 1,
          isClaimed: user.dailyRewards.hasCheckedIn,
        },
        {
          id: 'starter',
          title: 'Starter Gamer',
          description: 'Complete 3 matches in any game',
          reward: 10,
          current: user.dailyRewards.matchesPlayed,
          target: 3,
          isClaimed: user.dailyRewards.claimedTasks.includes('starter'),
        },
        {
          id: 'pro',
          title: 'Pro Gamer',
          description: 'Complete 5 matches in any game',
          reward: 15,
          current: user.dailyRewards.matchesPlayed,
          target: 5,
          isClaimed: user.dailyRewards.claimedTasks.includes('pro'),
        },
        {
          id: 'social',
          title: 'Social Gamer',
          description: 'Play 2 matches with friends',
          reward: 15,
          current: user.dailyRewards.friendMatchesPlayed,
          target: 2,
          isClaimed: user.dailyRewards.claimedTasks.includes('social'),
        }
      ];

      return res.status(200).json({
        tasks,
        dailyCoins: user.coins, 
        lastResetDate: user.dailyRewards.lastResetDate
      });
    } catch (error: any) {
      logger.error(`Error fetching daily tasks: ${error.message}`);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  public async checkIn(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await rewardService.checkIn(userId);
      return res.status(200).json({ 
        message: 'Checked in successfully!', 
        coins: user.coins,
        dailyRewards: user.dailyRewards
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * Internal test endpoint to simulate match completion
   */
  public async simulateMatch(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { withFriend } = req.body;
      const user = await rewardService.trackMatchCompletion(userId, withFriend);
      return res.status(200).json({ 
        message: 'Match recorded!', 
        coins: user.coins,
        dailyRewards: user.dailyRewards 
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
