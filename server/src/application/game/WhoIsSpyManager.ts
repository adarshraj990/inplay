import { Server as SocketServer } from 'socket.io';
import { Logger } from '../../shared/utils/Logger';
import { RewardService } from '../services/RewardService';
import { AgoraService } from '../services/AgoraService';
import { WordService } from '../services/game/WordService';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { User } from '../../domain/entities/User';

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
}

const logger = Logger.getInstance();

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

  constructor(sessionId: string, io: SocketServer) {
    this.sessionId = sessionId;
    this.io = io;
  }

  public static getOrCreate(sessionId: string, io: SocketServer): WhoIsSpyManager {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new WhoIsSpyManager(sessionId, io));
    }
    return this.sessions.get(sessionId)!;
  }

  public async joinLobby(userId: string): Promise<boolean> {
    if (this.players.length >= WhoIsSpyManager.MAX_PLAYERS) return false;
    if (this.players.find(p => p.userId === userId)) return true;

    const userRepository = new UserRepository();
    const user = await userRepository.findById(userId);

    this.players.push({
      userId,
      role: 'Citizen',
      word: '',
      isAlive: true,
      level: user?.level || 1,
      xp: user?.xp || 0,
      isReady: true, // Auto-ready for now as per simple lobby logic
    });

    this.emitState();

    if (this.players.length === WhoIsSpyManager.MAX_PLAYERS && this.phase === 'LOBBY') {
      this.startLobbyCountdown();
    }

    return true;
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
    const spyCount = playerCount >= 8 ? 2 : 1;
    
    const wordService = WordService.getInstance();
    const { citizenWord, spyWord } = wordService.getRandomPair();
    
    // Shuffle userIds to randomize role assignment
    const shuffledIds = [...userIds].sort(() => Math.random() - 0.5);
    const spies = shuffledIds.slice(0, spyCount);
    
    const userRepository = new UserRepository();
    const users = await userRepository.findByIds(userIds);
    const userMap = new Map<string, User>(users.map(u => [u.id.toString(), u]));
    const agora = AgoraService.getInstance();

    this.players = userIds.map((userId) => {
      const u = userMap.get(userId);
      const isSpy = spies.includes(userId);
      return {
        userId,
        role: isSpy ? 'Spy' : 'Citizen',
        word: isSpy ? spyWord : citizenWord,
        isAlive: true,
        agoraToken: agora.generateRtcToken(`spy_${this.sessionId}`, userId),
        level: u?.level || 1,
        xp: u?.xp || 0,
        isReady: true,
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
    // Find next alive player
    while (this.currentSpeakerIndex < this.players.length && !this.players[this.currentSpeakerIndex].isAlive) {
      this.currentSpeakerIndex++;
    }

    if (this.currentSpeakerIndex >= this.players.length) {
      this.startVotingPhase();
      return;
    }

    this.timer = 30;
    this.emitState();

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

    this.startTimer(() => {
      this.calculateResults();
    });
  }

  public castVote(voterId: string, targetId: string) {
    if (this.phase !== 'VOTING') return;
    this.votes[voterId] = targetId;
    
    // Check if everyone voted
    const aliveCount = this.players.filter(p => p.isAlive).length;
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
    let expelledId = '';
    for (const [id, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        expelledId = id;
      }
    }

    const expelledPlayer = this.players.find(p => p.userId === expelledId);
    let winner: 'Citizens' | 'Spy' | null = null;

    if (expelledPlayer) {
      expelledPlayer.isAlive = false;
      if (expelledPlayer.role === 'Spy') {
        winner = 'Citizens';
      }
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
      await this.awardPrizes(winner);
      
      // Auto-reset after 15 seconds
      this.startTimer(() => {
        this.resetToLobby();
      });
    } else {
      // Continue to next round
      this.startDiscussionPhase();
    }
  }

  private resetToLobby() {
    this.phase = 'LOBBY';
    this.timer = 0;
    this.votes = {};
    this.currentSpeakerIndex = -1;
    // Keep players in the list but reset their match-specific state
    this.players = this.players.map(p => ({
      userId: p.userId,
      role: 'Citizen',
      word: '',
      isAlive: true,
      level: p.level,
      xp: p.xp
    }));
    this.emitState();
    logger.info(`🔄 Session ${this.sessionId} reset to LOBBY automatically.`);
  }

  private async awardPrizes(winner: 'Citizens' | 'Spy') {
    const rewards = RewardService.getInstance();
    for (const player of this.players) {
      const isWinner = (winner === 'Citizens' && player.role === 'Citizen') || (winner === 'Spy' && player.role === 'Spy');
      
      // XP Logic: 10 base + 15 win
      const xpAmount = isWinner ? 25 : 10;
      await rewards.addXp(player.userId, xpAmount);

      if (isWinner) {
        const amount = player.role === 'Spy' ? 5 : 3;
        await rewards.updateCoins(player.userId, amount);
      }
    }
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
}
