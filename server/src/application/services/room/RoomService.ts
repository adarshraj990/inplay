import { Logger } from '../../../shared/utils/Logger';

const logger = Logger.getInstance();

export interface RoomPlayer {
  userId: string;
  isReady: boolean;
  isOnline: boolean;
  isHost: boolean;
  level?: number;
  xp?: number;
}

export class RoomService {
  private static instance: RoomService;
  // sessionId -> Set of userIds currently "reserved" (sync check)
  private reservations: Map<string, Set<string>> = new Map();
  private maxPlayers = 6;

  private constructor() {}

  public static getInstance(): RoomService {
    if (!RoomService.instance) {
      RoomService.instance = new RoomService();
    }
    return RoomService.instance;
  }

  /**
   * Synchronously checks and reserves a slot to prevent race conditions.
   */
  public reserveSlot(sessionId: string, userId: string, currentCount: number): boolean {
    if (!this.reservations.has(sessionId)) {
      this.reservations.set(sessionId, new Set());
    }

    const reserved = this.reservations.get(sessionId)!;
    if (currentCount + reserved.size >= this.maxPlayers) {
      logger.warn(`🚫 [RoomService] Room ${sessionId} is full. Join rejected for ${userId}.`);
      return false;
    }

    reserved.add(userId);
    return true;
  }

  public clearReservation(sessionId: string, userId: string): void {
    this.reservations.get(sessionId)?.delete(userId);
  }

  public getReservations(sessionId: string): number {
    return this.reservations.get(sessionId)?.size || 0;
  }
}
