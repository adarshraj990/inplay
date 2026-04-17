// src/domain/repositories/IUserRepository.ts — Repository interface (dependency inversion)
import { User, UserPublicProfile } from '../entities/User';

export interface CreateUserDTO {
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  gameUid: string;
}

export interface UpdateUserDTO {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  status?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByGameUid(gameUid: string): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: string, data: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
  searchByUsername(query: string, limit?: number): Promise<UserPublicProfile[]>;
  addXp(id: string, amount: number): Promise<User>;
  updateCoins(id: string, amount: number): Promise<User>;
  updateDailyRewards(id: string, dailyRewards: any): Promise<User>;
  findByIds(ids: string[]): Promise<User[]>;
}
