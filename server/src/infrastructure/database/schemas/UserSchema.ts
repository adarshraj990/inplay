import mongoose, { Schema } from 'mongoose';
import { User, UserStatus } from "../../../domain/entities/User.js";

export const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true },
    avatarUrl: { type: String, default: null },
    bio: { type: String, default: null },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.OFFLINE,
    },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    dailyRewards: {
      lastResetDate: { type: String, default: new Date().toISOString().split('T')[0] },
      hasCheckedIn: { type: Boolean, default: false },
      dailyCoinsEarned: { type: Number, default: 0 },
      matchesPlayed: { type: Number, default: 0 },
      friendMatchesPlayed: { type: Number, default: 0 },
      claimedTasks: { type: [String], default: [] },
    },
    isVerified: { type: Boolean, default: false },
    lastSeenAt: { type: Date, default: null },
    lastDailyRewardAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

userSchema.set('toJSON', {
  transform: (_, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const UserModel = mongoose.model<User>('User', userSchema);
