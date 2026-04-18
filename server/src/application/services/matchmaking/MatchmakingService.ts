import { Logger } from '../../../shared/utils/Logger';

const logger = Logger.getInstance();

export class MatchmakingService {
  private static instance: MatchmakingService;

  private constructor() {}

  public static getInstance(): MatchmakingService {
    if (!MatchmakingService.instance) {
      MatchmakingService.instance = new MatchmakingService();
    }
    return MatchmakingService.instance;
  }

  /**
   * Finds a suitable public lobby or suggests creating a new one.
   * Logic is loosely coupled to allow multiple game types.
   */
  public findPublicLobby(sessions: Map<string, any>, maxPlayers: number): string | null {
    for (const [id, manager] of sessions.entries()) {
      if (
        manager.isPublic && 
        manager.phase === 'LOBBY' && 
        (manager.players.length + (manager.getReservations ? manager.getReservations() : 0)) < maxPlayers
      ) {
        logger.info(`🔍 [Matchmaking] Found existing lobby: ${id}`);
        return id;
      }
    }
    return null;
  }
}
