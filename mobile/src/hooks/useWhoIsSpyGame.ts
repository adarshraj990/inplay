import { useState, useEffect, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { VoiceService } from '../services/VoiceService';
import { SOCKET_URL } from '../config';

const SOCKET_URL_INTERNAL = `${SOCKET_URL}/game`; 

export type GamePhase = 'LOBBY' | 'REVEAL' | 'DISCUSSION' | 'VOTING' | 'RESULT';

interface GameState {
  phase: GamePhase;
  timer: number;
  currentSpeakerId: string | null;
  players: { userId: string; isAlive: boolean; level?: number; xp?: number }[];
  winner: 'Citizens' | 'Spy' | null;
  myRole: 'Citizen' | 'Spy' | null;
  myWord: string;
  agoraToken: string | null;
  channelName: string | null;
  voteStats: { count: number; total: number } | null;
}

export const useWhoIsSpyGame = (sessionId: string, userId: string) => {
  const [state, setState] = useState<GameState>({
    phase: 'LOBBY',
    timer: 0,
    currentSpeakerId: null,
    players: [],
    winner: null,
    myRole: null,
    myWord: '',
    agoraToken: null,
    channelName: null,
    voteStats: null,
  });

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 1. Initialize Socket
    const socket = io(SOCKET_URL_INTERNAL, {
      transports: ['websocket'],
      query: { userId },
    } as any);
    socketRef.current = socket;

    // 2. Join Session
    socket.emit('session:join', { sessionId, gameType: 'whoisspy' });

    // 3. Listeners
    socket.on('game:sync', (data: any) => {
      setState(prev => ({
        ...prev,
        phase: data.phase,
        timer: data.timer,
        currentSpeakerId: data.currentSpeakerId,
        players: data.players,
        // Clear game state if moving back to LOBBY
        myRole: data.phase === 'LOBBY' ? null : prev.myRole,
        myWord: data.phase === 'LOBBY' ? '' : prev.myWord,
        winner: data.phase === 'LOBBY' ? null : prev.winner,
        channelName: data.channelName || prev.channelName,
        voteStats: data.phase === 'VOTING' ? prev.voteStats : null,
      }));
    });

    socket.on('game:start_reveal', () => {
      setState(prev => ({ ...prev, phase: 'REVEAL' }));
    });

    socket.on('turn:update', (data: { userId: string, timer: number }) => {
      setState(prev => ({ ...prev, currentSpeakerId: data.userId, timer: data.timer }));
    });

    socket.on('game:vote_cast', (data: { count: number, total: number }) => {
      setState(prev => ({ ...prev, voteStats: data }));
    });

    socket.on('game:vote_tie', (data: { candidates: string[] }) => {
      // The server will already reset phase, but we can use this for UI
      setState(prev => ({ ...prev, timer: 5 }));
    });

    socket.on('game:whoisspy:role_data', (data: { role: 'Citizen' | 'Spy', word: string, agoraToken?: string }) => {
      setState(prev => ({ 
        ...prev, 
        myRole: data.role, 
        myWord: data.word,
        agoraToken: data.agoraToken || prev.agoraToken 
      }));
    });

    socket.on('game:game_over', (data: { winner: 'Citizens' | 'Spy' }) => {
      setState(prev => ({ ...prev, phase: 'RESULT', winner: data.winner }));
    });

    // 4. Cleanup
    return () => {
      console.log('🔌 Cleaning up WhoIsSpy socket listeners...');
      if (socket) {
        socket.off('game:sync');
        socket.off('game:whoisspy:role_data');
        socket.off('game:game_over');
        socket.off('game:start_reveal');
        socket.off('turn:update');
        socket.off('game:vote_cast');
        socket.disconnect();
      }
      socketRef.current = null;
      VoiceService.getInstance().leaveChannel();
    };
  }, [sessionId, userId]);

  // Actions
  const startGame = useCallback((userIds: string[]) => {
    socketRef.current?.emit('game:whoisspy:start', { sessionId, userIds });
  }, [sessionId]);

  const castVote = useCallback((targetId: string) => {
    socketRef.current?.emit('game:whoisspy:vote', { sessionId, targetId });
  }, [sessionId]);

  const fetchRole = useCallback(() => {
    socketRef.current?.emit('game:whoisspy:get_role', { sessionId });
  }, [sessionId]);

  // Auto-fetch role when phase changes to REVEAL
  useEffect(() => {
    if (state.phase === 'REVEAL' && !state.myRole) {
      fetchRole();
    }
  }, [state.phase, state.myRole, fetchRole]);

  const skipTurn = useCallback(() => {
    socketRef.current?.emit('game:whoisspy:skip_turn', { sessionId });
  }, [sessionId]);

  // Handle Agora Joining
  useEffect(() => {
    if (state.agoraToken && state.channelName) {
      // Deterministic UID from userId string
      const uid = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      VoiceService.getInstance().joinChannel(state.agoraToken, state.channelName, uid);
    }
  }, [state.agoraToken, state.channelName, userId]);

  // Handle Turn-based Muting
  useEffect(() => {
    if (state.phase === 'DISCUSSION') {
      const isMyTurn = state.currentSpeakerId === userId;
      VoiceService.getInstance().setMute(!isMyTurn);
    } else if (state.phase === 'RESULT') {
      VoiceService.getInstance().setMute(true);
      VoiceService.getInstance().leaveChannel();
    } else if (state.phase === 'LOBBY') {
      VoiceService.getInstance().setMute(true);
    }
  }, [state.phase, state.currentSpeakerId, userId]);

  return {
    ...state,
    startGame,
    castVote,
    skipTurn,
    simulateBots,
  };
};
