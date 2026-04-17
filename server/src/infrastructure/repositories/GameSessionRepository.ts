import { PrismaClient, GameStatus } from '@prisma/client';
import { DatabaseService } from '../database/DatabaseService';

export class GameSessionRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = DatabaseService.getInstance().client;
  }

  public async updateStatus(sessionId: string, status: string, state: any): Promise<void> {
    try {
      await this.prisma.gameSession.update({
        where: { id: sessionId },
        data: {
          status: status as GameStatus,
          state: state || {},
          startedAt: status === 'ACTIVE' ? new Date() : undefined,
        },
      });
    } catch (error) {
      // If session doesn't exist (in-memory only for now), we ignore or create
      console.error(`[GameSessionRepository] Failed to update session ${sessionId}:`, error);
    }
  }

  public async setWinner(sessionId: string, winnerId: string): Promise<void> {
    try {
      await this.prisma.gameSession.update({
        where: { id: sessionId },
        data: {
          winnerId,
          status: 'FINISHED',
          endedAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`[GameSessionRepository] Failed to set winner for session ${sessionId}:`, error);
    }
  }
}
