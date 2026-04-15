// src/domain/entities/User.ts — Domain entity (pure, no ORM deps)
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  status: UserStatus;
  level: number;
  xp: number;
  coins: number;
  dailyRewards: {
    lastResetDate: string; // YYYY-MM-DD
    hasCheckedIn: boolean;
    dailyCoinsEarned: number;
    matchesPlayed: number;
    friendMatchesPlayed: number;
    claimedTasks: string[]; // ['starter', 'pro', 'social']
  };
  isVerified: boolean;
  lastSeenAt: Date | null;
  lastDailyRewardAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  AWAY = 'AWAY',
  IN_GAME = 'IN_GAME',
  BUSY = 'BUSY',
}

export interface UserPublicProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  status: UserStatus;
  level: number;
}
