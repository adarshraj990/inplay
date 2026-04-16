import { Server as SocketServer } from 'socket.io';
import { Logger } from '../../shared/utils/Logger';
import { RewardService } from '../services/RewardService';
import { AgoraService } from '../services/AgoraService';
import { UserModel } from '../../infrastructure/database/schemas/UserSchema';
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
}

const WORD_BANK = [
  { wordA: 'Coffee', wordB: 'Tea' },
  { wordA: 'Marvel', wordB: 'DC' },
  { wordA: 'Pizza', wordB: 'Burger' },
  { wordA: 'Apple', wordB: 'Samsung' },
  { wordA: 'Discord', wordB: 'Slack' },
];

export class WhoIsSpyManager {
  private static sessions: Map<string, WhoIsSpyManager> = new Map();
  
  private sessionId: string;
  private players: Player[] = [];
  private phase: GamePhase = 'REVEAL';
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

  public async initGame(userIds: string[]) {
    // Reset all match state
    this.phase = 'LOBBY';
    const pair = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    const spyIndex = Math.floor(Math.random() * userIds.length);

    const agora = AgoraService.getInstance();
    
    // Fetch user levels from DB
    const users = await UserModel.find({ _id: { $in: userIds } });
    const userMap = new Map<string, User>(users.map(u => [u._id.toString(), u as unknown as User]));

    this.players = userIds.map((userId, index) => {
      const u = userMap.get(userId);
      return {
        userId,
        role: index === spyIndex ? 'Spy' : 'Citizen',
        word: index === spyIndex ? pair.wordB : pair.wordA,
        isAlive: true,
        agoraToken: agora.generateRtcToken(`spy_${this.sessionId}`, userId),
        level: u?.level || 1,
        xp: u?.xp || 0,
      };
    }) as any;

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
