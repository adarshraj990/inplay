import { Server as SocketServer, Socket } from 'socket.io';
import { Logger } from "../../../shared/utils/Logger.js";
import { WhoIsSpyManager } from "../../../application/game/WhoIsSpyManager.js";

const logger = Logger.getInstance();

export type GameEvent =
  | 'game:state_update'
  | 'game:player_action'
  | 'game:round_start'
  | 'game:round_end'
  | 'game:leaderboard_update'
  | 'game:player_joined'
  | 'game:player_left'
  | 'game:countdown';

/**
 * Game namespace — handles real-time mini-game events.
 * Each mini-game runs in its own socket room: `game:{gameType}:{sessionId}`
 * Adding a new mini-game only requires emitting the correct GameEvent types.
 */
export function gameNamespace(io: SocketServer): void {
  const game = io.of('/game');

  game.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;
    logger.debug(`🎮 [Game] User ${userId} connected`);

    // Ensure user is in their personal room within this namespace for private events
    socket.join(`user:${userId}`);

    // ── Join game lobby (WhoIsSpy specific) ────────────────
    socket.on('lobby:join', async ({ sessionId }: { sessionId: string }) => {
      const room = `game:whoisspy:${sessionId}`;
      const manager = WhoIsSpyManager.getOrCreate(sessionId, io);
      
      const joined = await manager.joinLobby(userId);
      if (joined) {
        (socket as any).sessionId = sessionId;
        socket.join(room);
        logger.debug(`🎮 User ${userId} joined lobby ${room}`);
      } else {
        socket.emit('error', { message: 'ROOM_FULL', code: 403 });
      }
    });

    // ── Global Matchmaking Queue (Quick Play) ──────────
    socket.on('lobby:quick_play', async () => {
      logger.info(`⚡ [Quick Play] Matchmaking request from ${userId}`);
      const sessionId = WhoIsSpyManager.findOrCreateMatch(io);
      const room = `game:whoisspy:${sessionId}`;
      
      const manager = WhoIsSpyManager.getOrCreate(sessionId, io);
      const joined = await manager.joinLobby(userId);
      
      if (joined) {
        (socket as any).sessionId = sessionId;
        socket.join(room);
        socket.emit('lobby:quick_play_success', { sessionId });
        logger.info(`🎮 [Quick Play] ${userId} assigned to ${sessionId}`);
      } else {
        socket.emit('error', { message: 'MATCHMAKING_ERROR' });
      }
    });

    // ── Leave lobby ─────────────────────────────────────
    socket.on('lobby:leave', ({ sessionId }: { sessionId: string }) => {
      const room = `game:whoisspy:${sessionId}`;
      const manager = WhoIsSpyManager.getOrCreate(sessionId, io);
      manager.leaveLobby(userId);
      socket.leave(room);
    });

    // ── Player action (agnostic — each mini-game defines its payload) ──
    socket.on('player:action', ({ sessionId, gameType, action }: {
      sessionId: string;
      gameType: string;
      action: Record<string, unknown>;
    }) => {
      const room = `game:${gameType}:${sessionId}`;
      // TODO: Route to specific GameEngine via GameSessionService
      game.to(room).emit('game:player_action', { userId, action, timestamp: Date.now() });
    });

    // ── Game state sync (host pushes canonical state) ──
    socket.on('state:sync', ({ sessionId, gameType, state }: {
      sessionId: string;
      gameType: string;
      state: unknown;
    }) => {
      const room = `game:${gameType}:${sessionId}`;
      game.to(room).emit('game:state_update', { state, timestamp: Date.now() });
    });

    // ── Leave session ──────────────────────────────────
    socket.on('session:leave', ({ sessionId, gameType }: { sessionId: string; gameType: string }) => {
      const room = `game:${gameType}:${sessionId}`;
      socket.leave(room);
      game.to(room).emit('game:player_left', { userId, sessionId });
    });

    // ── Global Emote/Expression System ──────────────────
    socket.on('expression:trigger', ({ sessionId, gameType, emoji }: {
      sessionId: string;
      gameType: string;
      emoji: string;
    }) => {
      const room = `game:${gameType}:${sessionId}`;
      game.to(room).emit('expression:broadcast', { userId, emoji, timestamp: Date.now() });
      logger.debug(`🎭 [Expression] ${userId} expressed ${emoji} in room ${room}`);
    });

    // ── Who Is Spy Specific Engine ─────────────────────
    socket.on('game:whoisspy:start', ({ sessionId, userIds }: { sessionId: string; userIds: string[] }) => {
      const manager = WhoIsSpyManager.getOrCreate(sessionId, io);
      manager.initGame(userIds);
      logger.info(`🎮 [WhoIsSpy] Game started in session ${sessionId}`);
    });

    socket.on('game:whoisspy:vote', ({ sessionId, targetId }: { sessionId: string; targetId: string }) => {
      const manager = WhoIsSpyManager.getOrCreate(sessionId, io);
      manager.castVote(userId, targetId);
    });

    socket.on('game:whoisspy:get_role', ({ sessionId }: { sessionId: string }) => {
      const manager = WhoIsSpyManager.getOrCreate(sessionId, io);
      const data = manager.getPlayerData(userId);
      if (data) {
        socket.emit('game:whoisspy:role_data', { 
          role: data.role, 
          word: data.word,
          agoraToken: (data as any).agoraToken 
        });
      }
    });

    socket.on('game:whoisspy:request_voice_token', ({ sessionId }: { sessionId: string }) => {
      const manager = WhoIsSpyManager.getOrCreate(sessionId, io);
      const token = manager.getPlayerToken(userId);
      if (token) {
        socket.emit('game:whoisspy:voice_token', { token, channelName: `spy_${sessionId}` });
      }
    });

    socket.on('game:whoisspy:skip_turn', ({ sessionId }: { sessionId: string }) => {
      const manager = WhoIsSpyManager.getOrCreate(sessionId, io);
      manager.skipTurn(userId);
    });

    socket.on('disconnect', () => {
      logger.debug(`🎮 [Game] User ${userId} disconnected`);
      const sessionId = (socket as any).sessionId;
      if (sessionId) {
        const manager = WhoIsSpyManager.getOrCreate(sessionId, io);
        manager.handleDisconnect(userId);
      }
    });
  });
}
