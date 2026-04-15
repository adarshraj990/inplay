import { UserModel } from '../../infrastructure/database/schemas/UserSchema';
import { Logger } from '../../shared/utils/Logger';

const logger = Logger.getInstance();

export class RewardService {
  private static instance: RewardService;

  private constructor() {}

  public static getInstance(): RewardService {
    if (!RewardService.instance) {
      RewardService.instance = new RewardService();
    }
    return RewardService.instance;
  }

  /**
   * Ensures the user's daily stats are reset if it's a new day.
   */
  public async ensureDailyReset(userId: string): Promise<any> {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    const today = new Date().toISOString().split('T')[0];
    if (user.dailyRewards.lastResetDate !== today) {
      logger.info(`🔄 Resetting daily tasks for user ${userId}`);
      user.dailyRewards = {
        lastResetDate: today,
        hasCheckedIn: false,
        dailyCoinsEarned: 0,
        matchesPlayed: 0,
        friendMatchesPlayed: 0,
        claimedTasks: [],
      };
      await user.save();
    }
    return user;
  }

  /**
   * Processes daily check-in
   */
  public async checkIn(userId: string): Promise<any> {
    const user = await this.ensureDailyReset(userId);
    
    if (user.dailyRewards.hasCheckedIn) {
      throw new Error('Already checked in today');
    }

    user.dailyRewards.hasCheckedIn = true;
    await this.updateCoins(userId, 10);
    
    logger.info(`💰 User ${userId} checked in. Attempted +10 coins.`);
    return user;
  }

  /**
   * Generic match completion tracking
   * This is game-agnostic and should be called after any match results.
   */
  public async trackMatchCompletion(userId: string, playedWithFriend: boolean): Promise<any> {
    const user = await this.ensureDailyReset(userId);
    
    user.dailyRewards.matchesPlayed += 1;
    if (playedWithFriend) {
      user.dailyRewards.friendMatchesPlayed += 1;
    }

    // Check for milestones
    const rewards = [
      { id: 'starter', milestone: 3, field: 'matchesPlayed', amount: 10 },
      { id: 'pro', milestone: 5, field: 'matchesPlayed', amount: 15 },
      { id: 'social', milestone: 2, field: 'friendMatchesPlayed', amount: 15 },
    ];

    for (const reward of rewards) {
      if (
        !user.dailyRewards.claimedTasks.includes(reward.id) &&
        (user.dailyRewards as any)[reward.field] >= reward.milestone
      ) {
        user.dailyRewards.claimedTasks.push(reward.id);
        await this.updateCoins(userId, reward.amount);
        logger.info(`🎯 Goal Met: ${reward.id}! User ${userId} attempting reward +${reward.amount} coins.`);
      }
    }

    await user.save();
    return user;
  }

  /**
   * Directly updates user coins using atomic increment, respecting the 50-coin daily cap.
   */
  public async updateCoins(userId: string, amount: number): Promise<any> {
    const user = await this.ensureDailyReset(userId);
    const DAILY_CAP = 50;
    const currentEarned = user.dailyRewards.dailyCoinsEarned || 0;

    if (currentEarned >= DAILY_CAP) {
      logger.info(`🚫 Daily cap reached for user ${userId}. No more coins awarded today.`);
      return user;
    }

    // Calculate actual amount to add
    const actualAmount = Math.min(amount, DAILY_CAP - currentEarned);

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { 
        $inc: { 
          coins: actualAmount,
          "dailyRewards.dailyCoinsEarned": actualAmount 
        } 
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      logger.error(`❌ Failed to update coins for user ${userId}: User not found`);
      throw new Error('User not found');
    }

    logger.info(`💰 User ${userId} earned ${actualAmount} coins (${amount} attempted). New Daily Total: ${updatedUser.dailyRewards.dailyCoinsEarned}/${DAILY_CAP}`);
    return updatedUser;
  }

  /**
   * Adds XP to a user and handles leveling logic (100 XP per level).
   */
  public async addXp(userId: string, amount: number): Promise<any> {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    const newXp = (user.xp || 0) + amount;
    const newLevel = Math.floor(newXp / 100) + 1;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { 
        $set: { xp: newXp, level: newLevel }
      },
      { new: true }
    );

    if (updatedUser && updatedUser.level > user.level) {
      logger.info(`🆙 User ${userId} leveled up to Lvl ${updatedUser.level}!`);
    }

    return updatedUser;
  }

  /**
   * Claims the 5-coin daily reward if 24 hours have passed.
   */
  public async claimLoginBonus(userId: string): Promise<{ success: boolean; amount: number; message: string }> {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    const now = new Date();
    const lastClaim = user.lastDailyRewardAt;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (lastClaim && (now.getTime() - lastClaim.getTime() < twentyFourHours)) {
      return { success: false, amount: 0, message: 'Wait for the next day' };
    }

    await UserModel.findByIdAndUpdate(userId, {
      $inc: { coins: 5 },
      $set: { lastDailyRewardAt: now }
    });

    logger.info(`🎁 User ${userId} claimed +5 coins daily bonus.`);
    return { success: true, amount: 5, message: 'Daily bonus claimed!' };
  }
}
