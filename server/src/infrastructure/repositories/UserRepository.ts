import { PrismaClient } from '@prisma/client';
import { DatabaseService } from "../database/DatabaseService.js";
import { IUserRepository, CreateUserDTO, UpdateUserDTO } from "../../domain/repositories/IUserRepository.js";
import { User, UserPublicProfile, UserStatus } from "../../domain/entities/User.js";

export class UserRepository implements IUserRepository {
  private get prisma() {
    return DatabaseService.getInstance().client;
  }

  constructor() {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? this.mapToDomain(user) : null;
  }

  async findByIds(ids: string[]): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
    });
    return users.map(u => this.mapToDomain(u));
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? this.mapToDomain(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    return user ? this.mapToDomain(user) : null;
  }

  async findByGameUid(gameUid: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { gameUid },
    });
    return user ? this.mapToDomain(user) : null;
  }

  async create(data: CreateUserDTO): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: {
          id: data.gameUid, // Assuming ID is same as gameUid or handled by Prisma, better-auth needs an ID
          username: data.username,
          email: data.email,
          emailVerified: false,
          name: data.displayName,
          image: null,
          displayName: data.displayName,
          gameUid: data.gameUid,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return this.mapToDomain(user);
    } catch (error) {
      console.error('[UserRepository.create Error]: Failed to create user.');
      console.error('[UserRepository.create Data]:', JSON.stringify({
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        gameUid: data.gameUid
      }, null, 2));
      throw error;
    }
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        displayName: data.displayName,
        image: data.image,
        bio: data.bio,
        status: data.status as any,
      },
    });
    return this.mapToDomain(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async searchByUsername(query: string, limit = 20): Promise<UserPublicProfile[]> {
    const users = await this.prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: limit,
      select: {
        id: true,
        gameUid: true,
        username: true,
        displayName: true,
        image: true,
        bio: true,
        status: true,
        level: true,
      },
    });
    
    return users.map(u => ({
      ...u,
      status: u.status as UserStatus,
    }));
  }

  async findOnlineUsers(limit = 20): Promise<UserPublicProfile[]> {
    const users = await this.prisma.user.findMany({
      where: {
        status: 'ONLINE',
      },
      take: limit,
      select: {
        id: true,
        gameUid: true,
        username: true,
        displayName: true,
        image: true,
        bio: true,
        status: true,
        level: true,
      },
    });
    
    return users.map(u => ({
      ...u,
      status: u.status as UserStatus,
    }));
  }

  async addXp(id: string, amount: number, tx?: any): Promise<User> {
    const prisma = tx || this.prisma;
    const user = await prisma.user.update({
      where: { id },
      data: {
        xp: { increment: amount },
      },
    });
    return this.mapToDomain(user);
  }

  async updateCoins(id: string, amount: number, tx?: any): Promise<User> {
    const prisma = tx || this.prisma;
    const user = await prisma.user.update({
      where: { id },
      data: {
        coins: { increment: amount },
      },
    });
    return this.mapToDomain(user);
  }

  async updateDailyRewards(id: string, dailyRewards: any, tx?: any): Promise<User> {
    const prisma = tx || this.prisma;
    const user = await prisma.user.update({
      where: { id },
      data: {
        dailyRewards: dailyRewards,
      },
    });
    return this.mapToDomain(user);
  }

  private mapToDomain(user: any): User {
    return {
      ...user,
      status: user.status as UserStatus,
      // Use persisted dailyRewards or fallback to default structure
      dailyRewards: (user.dailyRewards as any) || {
        lastResetDate: new Date().toISOString().split('T')[0],
        hasCheckedIn: false,
        dailyCoinsEarned: 0,
        matchesPlayed: 0,
        friendMatchesPlayed: 0,
        claimedTasks: [],
      },
    } as User;
  }
}


