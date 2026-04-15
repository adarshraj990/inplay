// lib/features/gaming/presentation/bloc/game_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../../core/network/socket_service.dart';

abstract class GameEvent extends Equatable {
  const GameEvent();
  @override List<Object?> get props => [];
}

class GameJoinSessionEvent extends GameEvent {
  final String sessionId;
  final String gameType;
  const GameJoinSessionEvent({required this.sessionId, required this.gameType});
  @override List<Object?> get props => [sessionId, gameType];
}

class GamePlayerActionEvent extends GameEvent {
  final String sessionId;
  final String gameType;
  final Map<String, dynamic> action;
  const GamePlayerActionEvent({
    required this.sessionId,
    required this.gameType,
    required this.action,
  });
  @override List<Object?> get props => [sessionId, action];
}

class GameStateUpdatedEvent extends GameEvent {
  final Map<String, dynamic> state;
  const GameStateUpdatedEvent(this.state);
  @override List<Object?> get props => [state];
}

class GameState extends Equatable {
  final String? sessionId;
  final String? gameType;
  final Map<String, dynamic>? gameState;
  final List<String> players;
  final bool isInGame;
  final String? error;

  const GameState({
    this.sessionId,
    this.gameType,
    this.gameState,
    this.players = const [],
    this.isInGame = false,
    this.error,
  });

  GameState copyWith({
    String? sessionId,
    String? gameType,
    Map<String, dynamic>? gameState,
    List<String>? players,
    bool? isInGame,
    String? error,
  }) {
    return GameState(
      sessionId: sessionId ?? this.sessionId,
      gameType: gameType ?? this.gameType,
      gameState: gameState ?? this.gameState,
      players: players ?? this.players,
      isInGame: isInGame ?? this.isInGame,
      error: error ?? this.error,
    );
  }

  @override
  List<Object?> get props => [sessionId, gameType, gameState, players, isInGame, error];
}

class GameBloc extends Bloc<GameEvent, GameState> {
  final SocketService socketService;

  GameBloc({required this.socketService}) : super(const GameState()) {
    on<GameJoinSessionEvent>(_onJoin);
    on<GamePlayerActionEvent>(_onAction);
    on<GameStateUpdatedEvent>(_onStateUpdated);
    _listenToSocketEvents();
  }

  void _listenToSocketEvents() {
    socketService.game.on('game:state_update', (data) {
      // TODO: add(GameStateUpdatedEvent(data['state']))
    });
    socketService.game.on('game:player_joined', (data) {
      // TODO: update player list
    });
  }

  Future<void> _onJoin(GameJoinSessionEvent e, Emitter<GameState> emit) async {
    socketService.joinGameSession(e.sessionId, e.gameType);
    emit(state.copyWith(sessionId: e.sessionId, gameType: e.gameType, isInGame: true));
  }

  Future<void> _onAction(GamePlayerActionEvent e, Emitter<GameState> emit) async {
    socketService.sendPlayerAction(
      sessionId: e.sessionId,
      gameType: e.gameType,
      action: e.action,
    );
  }

  Future<void> _onStateUpdated(GameStateUpdatedEvent e, Emitter<GameState> emit) async {
    emit(state.copyWith(gameState: e.state));
  }
}
