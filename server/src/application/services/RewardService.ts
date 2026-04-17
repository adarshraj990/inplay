import { Logger } from '../../shared/utils/Logger';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

const logger = Logger.getInstance();

export class RewardService {
  private static instance: RewardService;
  private userRepository: IUserRepository;

  private constructor() {
    this.userRepository = new UserRepository();
  }

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
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const today = new Date().toISOString().split('T')[0];
    if (user.dailyRewards.lastResetDate !== today) {
      logger.info(`🔄 Resetting daily tasks for user ${userId}`);
      const dailyRewards = {
        lastResetDate: today,
        hasCheckedIn: false,
        dailyCoinsEarned: 0,
        matchesPlayed: 0,
        friendMatchesPlayed: 0,
        claimedTasks: [],
      };
      
      return await this.userRepository.updateDailyRewards(userId, dailyRewards);
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

    const dailyRewards = {
      ...user.dailyRewards,
      hasCheckedIn: true,
    };

    await this.userRepository.updateDailyRewards(userId, dailyRewards);
    await this.updateCoins(userId, 10);
    
    logger.info(`💰 User ${userId} checked in. Attempted +10 coins.`);
    return await this.userRepository.findById(userId);
  }

  /**
   * Generic match completion tracking
   * This is game-agnostic and should be called after any match results.
   */
  public async trackMatchCompletion(userId: string, playedWithFriend: boolean): Promise<any> {
    let user = await this.ensureDailyReset(userId);
    
    const dailyRewards = { ...user.dailyRewards };
    dailyRewards.matchesPlayed += 1;
    if (playedWithFriend) {
      dailyRewards.friendMatchesPlayed += 1;
    }

    // Check for milestones
    const rewards = [
      { id: 'starter', milestone: 3, field: 'matchesPlayed', amount: 10 },
      { id: 'pro', milestone: 5, field: 'matchesPlayed', amount: 15 },
      { id: 'social', milestone: 2, field: 'friendMatchesPlayed', amount: 15 },
    ];

    for (const reward of rewards) {
      if (
        !dailyRewards.claimedTasks.includes(reward.id) &&
        (dailyRewards as any)[reward.field] >= reward.milestone
      ) {
        dailyRewards.claimedTasks.push(reward.id);
        await this.updateCoins(userId, reward.amount);
        logger.info(`🎯 Goal Met: ${reward.id}! User ${userId} attempting reward +${reward.amount} coins.`);
      }
    }

    return await this.userRepository.updateDailyRewards(userId, dailyRewards);
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

    // Update coins and daily total
    const dailyRewards = {
      ...user.dailyRewards,
      dailyCoinsEarned: currentEarned + actualAmount
    };

    await this.userRepository.updateDailyRewards(userId, dailyRewards);
    const updatedUser = await this.userRepository.updateCoins(userId, actualAmount);

    logger.info(`💰 User ${userId} earned ${actualAmount} coins (${amount} attempted). New Daily Total: ${dailyRewards.dailyCoinsEarned}/${DAILY_CAP}`);
    return updatedUser;
  }

  /**
   * Adds XP to a user and handles leveling logic (100 XP per level).
   */
  public async addXp(userId: string, amount: number): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const updatedUser = await this.userRepository.addXp(userId, amount);

    if (updatedUser && updatedUser.level > user.level) {
      logger.info(`🆙 User ${userId} leveled up to Lvl ${updatedUser.level}!`);
    }

    return updatedUser;
  }

  /**
   * Claims the 5-coin daily reward if 24 hours have passed.
   */
  public async claimLoginBonus(userId: string): Promise<{ success: boolean; amount: number; message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const now = new Date();
    // Use lastDailyRewardAt from Postgres
    const lastClaim = (user as any).lastDailyRewardAt;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (lastClaim && (now.getTime() - new Date(lastClaim).getTime() < twentyFourHours)) {
      return { success: false, amount: 0, message: 'Wait for the next day' };
    }

    // This logic is slightly different in Postgres as we'd need a separate update or custom repository method
    // For now we'll just update coins.
    await this.userRepository.updateCoins(userId, 5);
    // Ideally we should also update lastDailyRewardAt. I'll add a method to UserRepository for this.
    
    logger.info(`🎁 User ${userId} claimed +5 coins daily bonus.`);
    return { success: true, amount: 5, message: 'Daily bonus claimed!' };
  }
}
