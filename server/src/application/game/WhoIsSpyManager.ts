import { Server as SocketServer } from 'socket.io';
import { Logger } from "../../shared/utils/Logger.js";
import { RewardService } from "../services/RewardService.js";
import { AgoraService } from "../services/AgoraService.js";
import { WordService } from "../services/game/WordService.js";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";
import { GameSessionRepository } from "../../infrastructure/repositories/GameSessionRepository.js";
import { RoomService } from "../services/room/RoomService.js";
import { MatchmakingService } from "../services/matchmaking/MatchmakingService.js";
import { User } from "../../domain/entities/User.js";

const logger = Logger.getInstance();

export type GamePhase = 'LOBBY' | 'REVEAL' | 'DISCUSSION' | 'VOTING' | 'RESULT';

interface Player {
  userId: string;
  role: 'Citizen' | 'Spy';
  word: string;
  isAlive: boolean;
  level: number;
  xp: number;
  isReady: boolean;
  isOnline: boolean;
  agoraToken?: string;
}

export class WhoIsSpyManager {
  private static sessions: Map<string, WhoIsSpyManager> = new Map();
  private static readonly MAX_PLAYERS = 6;
  
  private sessionId: string;
  private players: Player[] = [];
  private phase: GamePhase = 'LOBBY';
  private currentSpeakerIndex: number = -1;
  private timer: number = 0;
  private io: SocketServer;
  private interval: NodeJS.Timeout | null = null;
  private votes: Record<string, string> = {}; // voterId -> targetId
  private gameSessionRepository: GameSessionRepository;
  public isPublic: boolean = false;

  constructor(sessionId: string, io: SocketServer) {
    this.sessionId = sessionId;
    this.io = io;
    this.gameSessionRepository = new GameSessionRepository();
  }

  public static getOrCreate(sessionId: string, io: SocketServer): WhoIsSpyManager {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new WhoIsSpyManager(sessionId, io));
    }
    const session = this.sessions.get(sessionId)!;
    session.cancelDestruction();
    return session;
  }

  public static destroySession(sessionId: string): void {
    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId)!;
      session.stopTimer();
      this.sessions.delete(sessionId);
      logger.info(`🧹 [Memory] Session ${sessionId} has been destroyed and cleared from memory.`);
    }
  }

  public static findOrCreateMatch(io: SocketServer): string {
    const matchmaking = MatchmakingService.getInstance();
    const existingLobbyId = matchmaking.findPublicLobby(this.sessions, this.MAX_PLAYERS);
    
    if (existingLobbyId) return existingLobbyId;

    const newId = `PUB_${Math.floor(1000 + Math.random() * 9000)}`;
    const manager = this.getOrCreate(newId, io);
    manager.isPublic = true;
    logger.info(`🆕 [Matchmaking] Created new public lobby: ${newId}`);
    return newId;
  }

  public getReservations(): number {
    return RoomService.getInstance().getReservations(this.sessionId);
  }

  public async joinLobby(userId: string): Promise<boolean> {
    // 1. Check if already in
    if (this.players.find(p => p.userId === userId)) return true;

    // 2. Sync Reservation check (Anti-Race Condition)
    const roomService = RoomService.getInstance();
    if (!roomService.reserveSlot(this.sessionId, userId, this.players.length)) {
      return false;
    }

    try {
      // 3. Async Data Fetch (Now protected by reservation)
      const userRepository = new UserRepository();
      const user = await userRepository.findById(userId);

      this.players.push({
        userId,
        role: 'Citizen',
        word: '',
        isAlive: true,
        level: user?.level || 1,
        xp: user?.xp || 0,
        isReady: true,
        isOnline: true,
      });

      this.emitState();

      if (this.players.length === WhoIsSpyManager.MAX_PLAYERS && this.phase === 'LOBBY') {
        this.startLobbyCountdown();
      }

      return true;
    } finally {
      // Always clear reservation as it's now officially in this.players
      roomService.clearReservation(this.sessionId, userId);
    }
  }

  public leaveLobby(userId: string) {
    this.players = this.players.filter(p => p.userId !== userId);
    
    // If we were counting down and someone left, reset
    if (this.phase === 'LOBBY' && this.timer > 0) {
      this.stopTimer();
      this.timer = 0;
      logger.info(`⏹️ Countdown aborted in session ${this.sessionId} - Player left.`);
    }

    this.emitState();
  }

  private startLobbyCountdown() {
    this.timer = 10;
    this.emitState();
    logger.info(`⏱️ Starting game countdown for session ${this.sessionId}`);

    this.startTimer(() => {
      logger.info(`🚀 Starting match for session ${this.sessionId}`);
      this.initGame(this.players.map(p => p.userId));
    });
  }

  private stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  public async initGame(userIds: string[]) {
    // ── 1. Determine Roles & Words ─────────────────────
    this.phase = 'REVEAL'; // Start reveal phase immediately
    const playerCount = userIds.length;
    if (playerCount < 4) {
      logger.warn(`🚫 Attempted to start game with only ${playerCount} players in ${this.sessionId}. Min 4 required.`);
      return;
    }
    const spyCount = playerCount >= 8 ? 2 : 1;
    
    const wordService = WordService.getInstance();
    const { citizenWord, spyWord } = wordService.getRandomPair();
    
    // Shuffle userIds to randomize role assignment
    const shuffledIds = [...userIds].sort(() => Math.random() - 0.5);
    const spies = shuffledIds.slice(0, spyCount);
    
    const userRepository = new UserRepository();
    const users = await userRepository.findByIds(userIds);
    const userMap = new Map<string, User>(users.map(u => [u.id.toString(), u]));

    this.players = userIds.map((userId) => {
      const u = userMap.get(userId);
      const isSpy = spies.includes(userId);
      return {
        userId,
        role: isSpy ? 'Spy' : 'Citizen',
        word: isSpy ? spyWord : citizenWord,
        isAlive: true,
        agoraToken: AgoraService.getInstance().generateRtcToken(`spy_${this.sessionId}`, userId),
        level: u?.level || 1,
        xp: u?.xp || 0,
        isReady: true,
        isOnline: true,
      };
    }) as any;

    // ── 2. Secure Private Emission ──────────────────────
    // Notify all clients to start reveal animation
    this.io.of('/game').to(`game:whoisspy:${this.sessionId}`).emit('game:start_reveal');

    // Send individual roles privately
    this.players.forEach(player => {
      this.io.of('/game').to(`user:${player.userId}`).emit('game:whoisspy:role_data', {
        role: player.role,
        word: player.word,
        agoraToken: (player as any).agoraToken
      });
    });

    logger.info(`🎭 Roles distributed for session ${this.sessionId}: ${spyCount} spy(ies) assigned.`);
    
    // Sync with DB
    await this.gameSessionRepository.updateStatus(this.sessionId, 'ACTIVE', {
      players: this.players.map(p => ({ userId: p.userId, role: p.role })),
      wordPair: { citizenWord, spyWord }
    });

    this.startRevealPhase();
  }

  private emitState() {
    this.io.of('/game').to(`game:whoisspy:${this.sessionId}`).emit('game:sync', {
      phase: this.phase,
      timer: this.timer,
      currentSpeakerId: this.players[this.currentSpeakerIndex]?.userId || null,
      players: this.players.map(p => ({ 
        userId: p.userId, 
        isAlive: p.isAlive,
        level: p.level,
        xp: p.xp
      })),
      channelName: `spy_${this.sessionId}`,
    });
  }

  public getPlayerToken(userId: string): string | null {
    const player = this.players.find(p => p.userId === userId);
    return (player as any)?.agoraToken || null;
  }

  private startRevealPhase() {
    this.phase = 'REVEAL';
    this.timer = 10;
    this.emitState();
    
    this.gameSessionRepository.updateStatus(this.sessionId, 'ACTIVE', { phase: 'REVEAL' });

    this.startTimer(() => {
      this.startDiscussionPhase();
    });
  }

  private startDiscussionPhase() {
    this.phase = 'DISCUSSION';
    this.currentSpeakerIndex = 0;
    this.nextTurn();
  }

  private nextTurn() {
    // Find next alive AND online player
    while (this.currentSpeakerIndex < this.players.length && (!this.players[this.currentSpeakerIndex].isAlive || !this.players[this.currentSpeakerIndex].isOnline)) {
      this.currentSpeakerIndex++;
    }

    if (this.currentSpeakerIndex >= this.players.length) {
      this.startVotingPhase();
      return;
    }

    const currentSpeaker = this.players[this.currentSpeakerIndex];
    this.timer = 30;
    this.emitState();
    
    // Explicit Turn Update for Frontend Highlighting
    this.io.of('/game').to(`game:whoisspy:${this.sessionId}`).emit('turn:update', {
      userId: currentSpeaker.userId,
      timer: this.timer
    });

    this.startTimer(() => {
      this.moveToNextPlayer();
    });
  }

  public skipTurn(userId: string) {
    if (this.phase !== 'DISCUSSION') return;
    const currentSpeaker = this.players[this.currentSpeakerIndex];
    if (currentSpeaker?.userId === userId) {
      logger.info(`⏩ Speaker ${userId} skipped their turn early.`);
      this.moveToNextPlayer();
    }
  }

  private moveToNextPlayer() {
    this.currentSpeakerIndex++;
    this.nextTurn();
  }

  private startVotingPhase() {
    this.phase = 'VOTING';
    this.timer = 20;
    this.emitState();
    
    this.gameSessionRepository.updateStatus(this.sessionId, 'ACTIVE', { phase: 'VOTING' });

    this.startTimer(() => {
      this.calculateResults();
    });
  }

  public castVote(voterId: string, targetId: string) {
    if (this.phase !== 'VOTING') return;
    
    // Validation: No self-voting
    if (voterId === targetId) {
      logger.warn(`🚫 User ${voterId} attempted to vote for themselves.`);
      return;
    }

    // Validation: Only one vote
    if (this.votes[voterId]) {
      logger.warn(`🚫 User ${voterId} attempted to vote twice.`);
      return;
    }

    this.votes[voterId] = targetId;
    
    // Check if everyone voted
    const alivePlayers = this.players.filter(p => p.isAlive);
    const aliveCount = alivePlayers.length;
    
    // Optional: Emit vote count update (count only, not IDs)
    this.io.of('/game').to(`game:whoisspy:${this.sessionId}`).emit('game:vote_cast', {
      count: Object.keys(this.votes).length,
      total: aliveCount
    });

    if (Object.keys(this.votes).length >= aliveCount) {
      this.calculateResults();
    }
  }

  private async calculateResults() {
    if (this.interval) clearInterval(this.interval);
    
    // Count votes
    const voteCounts: Record<string, number> = {};
    Object.values(this.votes).forEach(id => {
      voteCounts[id] = (voteCounts[id] || 0) + 1;
    });

    let maxVotes = 0;
    let candidates: string[] = [];

    for (const [id, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        candidates = [id];
      } else if (count === maxVotes) {
        candidates.push(id);
      }
    }

    let winner: 'Citizens' | 'Spy' | null = null;
    let expelledId = '';

    // Tie-breaking: No one expelled if there's a tie
    if (candidates.length === 1) {
      expelledId = candidates[0];
      const expelledPlayer = this.players.find(p => p.userId === expelledId);
      if (expelledPlayer) {
        expelledPlayer.isAlive = false;
        if (expelledPlayer.role === 'Spy') {
          winner = 'Citizens';
        }
      }
    } else {
      logger.info(`⚖️ Vote tie in session ${this.sessionId}. No one expelled.`);
      this.io.of('/game').to(`game:whoisspy:${this.sessionId}`).emit('game:vote_tie', { candidates });
    }

    // Check survival condition
    const alivePlayers = this.players.filter(p => p.isAlive);
    if (!winner && alivePlayers.length <= 2) {
      winner = 'Spy';
    }
    if (winner) {
      this.phase = 'RESULT';
      this.timer = 15;
      this.emitState();
      this.io.of('/game').to(`game:whoisspy:${this.sessionId}`).emit('game:game_over', { winner });
      
      // Update DB with winner
      await this.gameSessionRepository.setWinner(this.sessionId, winner);
      
      // Atomic Reward Awarding
      const rewards = RewardService.getInstance();
      await rewards.awardBulkPrizes(this.players, winner);
      
      // Auto-reset after 15 seconds
      this.startTimer(() => {
        this.resetToLobby();
        this.scheduleDestruction();
      });
    } else {
      // Continue to next round
      this.startDiscussionPhase();
    }
  }

  private destructionTimeout: NodeJS.Timeout | null = null;

  private scheduleDestruction() {
    this.cancelDestruction();
    this.destructionTimeout = setTimeout(() => {
      WhoIsSpyManager.destroySession(this.sessionId);
    }, 60000); // 1 minute delay
    logger.debug(`⌛ Session ${this.sessionId} scheduled for destruction in 60s.`);
  }

  private cancelDestruction() {
    if (this.destructionTimeout) {
      clearTimeout(this.destructionTimeout);
      this.destructionTimeout = null;
      logger.debug(`🛡️ Destruction cancelled for active session ${this.sessionId}.`);
    }
  }

  private resetToLobby() {
    this.phase = 'LOBBY';
    this.timer = 0;
    this.votes = {};
    this.currentSpeakerIndex = -1;
    // Keep players in the list but reset their match-specific state
    this.players = [
      ...this.players.map(p => ({
        userId: p.userId,
        role: 'Citizen' as const,
        word: 'Normal Word',
        isAlive: true,
        level: p.level || 5,
        xp: p.xp || 120,
        isReady: true,
        isOnline: true
      }))
    ];
    this.emitState();
    logger.info(`🔄 Session ${this.sessionId} reset to LOBBY automatically.`);
  }

  private async awardPrizes(_winner: 'Citizens' | 'Spy') {
    // Deprecated in favor of RewardService.awardBulkPrizes
    logger.warn('awardPrizes called. Use awardBulkPrizes for transaction safety.');
  }

  private startTimer(onComplete: () => void) {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.interval!);
        onComplete();
      } else {
        this.emitState();
      }
    }, 1000);
  }

  public getPlayerData(userId: string) {
    return this.players.find(p => p.userId === userId);
  }

  public handleDisconnect(userId: string) {
    const player = this.players.find(p => p.userId === userId);
    if (!player) return;

    if (this.phase === 'LOBBY') {
      this.leaveLobby(userId);
    } else {
      player.isOnline = false;
      logger.info(`🔌 Player ${userId} went offline in session ${this.sessionId}.`);
      
      // If it's their turn, skip it
      const currentSpeaker = this.players[this.currentSpeakerIndex];
      if (currentSpeaker?.userId === userId && this.phase === 'DISCUSSION') {
        logger.info(`⏩ Skipping offline speaker ${userId}.`);
        this.moveToNextPlayer();
      }
      
      this.emitState();
    }
  }
}
