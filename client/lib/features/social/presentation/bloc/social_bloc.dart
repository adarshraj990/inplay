// lib/features/social/presentation/bloc/social_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:indplay_client/core/network/socket_service.dart';
import 'package:indplay_client/features/auth/domain/entities/auth_user.dart';
import 'package:indplay_client/features/social/domain/repositories/i_social_repository.dart';

// ── Events ──────────────────────────────────────────────────────────────────────
abstract class SocialEvent extends Equatable {
  const SocialEvent();
  @override List<Object?> get props => [];
}

class SocialFetchFriendsEvent extends SocialEvent {
  const SocialFetchFriendsEvent();
}

class SocialSendFriendRequestEvent extends SocialEvent {
  final String targetUserId;
  const SocialSendFriendRequestEvent(this.targetUserId);
  @override List<Object?> get props => [targetUserId];
}

class SocialFriendRequestReceivedEvent extends SocialEvent {
  final String fromUserId;
  const SocialFriendRequestReceivedEvent(this.fromUserId);
  @override List<Object?> get props => [fromUserId];
}

class SocialUserOnlineEvent extends SocialEvent {
  final String userId;
  const SocialUserOnlineEvent(this.userId);
  @override List<Object?> get props => [userId];
}

class SocialUserOfflineEvent extends SocialEvent {
  final String userId;
  const SocialUserOfflineEvent(this.userId);
  @override List<Object?> get props => [userId];
}

class SocialInviteToRoomEvent extends SocialEvent {
  final String targetUserId;
  final String roomId;
  final String roomName;
  const SocialInviteToRoomEvent({
    required this.targetUserId,
    required this.roomId,
    required this.roomName,
  });
  @override List<Object?> get props => [targetUserId, roomId];
}

// ── States ──────────────────────────────────────────────────────────────────────
class SocialState extends Equatable {
  final List<AuthUser> pendingRequests;
  final List<AuthUser> friends;
  final Set<String> onlineUserIds;
  final bool isLoading;
  final String? error;

  const SocialState({
    this.pendingRequests = const [],
    this.friends = const [],
    this.onlineUserIds = const {},
    this.isLoading = false,
    this.error,
  });

  SocialState copyWith({
    List<AuthUser>? pendingRequests,
    List<AuthUser>? friends,
    Set<String>? onlineUserIds,
    bool? isLoading,
    String? error,
  }) {
    return SocialState(
      pendingRequests: pendingRequests ?? this.pendingRequests,
      friends: friends ?? this.friends,
      onlineUserIds: onlineUserIds ?? this.onlineUserIds,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }

  @override
  List<Object?> get props => [pendingRequests, friends, onlineUserIds, isLoading, error];
}

// ── BLoC ────────────────────────────────────────────────────────────────────────
class SocialBloc extends Bloc<SocialEvent, SocialState> {
  final SocketService socketService;
  final ISocialRepository socialRepository;

  SocialBloc({
    required this.socketService,
    required this.socialRepository,
  }) : super(const SocialState()) {
    on<SocialFetchFriendsEvent>(_onFetchFriends);
    on<SocialSendFriendRequestEvent>(_onSendRequest);
    on<SocialFriendRequestReceivedEvent>(_onRequestReceived);
    on<SocialInviteToRoomEvent>(_onInviteToRoom);
    on<SocialUserOnlineEvent>(_onUserOnline);
    on<SocialUserOfflineEvent>(_onUserOffline);
    
    _listenToSocketEvents();
  }

  void _listenToSocketEvents() {
    socketService.social.on('friend:request_received', (data) {
      if (data != null) {
        add(const SocialFetchFriendsEvent()); // Refresh pending list
      }
    });

    socketService.social.on('user:online', (data) {
      if (data != null) {
        add(SocialUserOnlineEvent(data['userId'] as String));
      }
    });

    socketService.social.on('user:offline', (data) {
      if (data != null) {
        add(SocialUserOfflineEvent(data['userId'] as String));
      }
    });
  }

  Future<void> _onFetchFriends(SocialFetchFriendsEvent e, Emitter<SocialState> emit) async {
    emit(state.copyWith(isLoading: true, error: null));
    
    final friendsResult = await socialRepository.getFriends();
    final requestsResult = await socialRepository.getPendingRequests();
    
    friendsResult.fold(
      (failure) => emit(state.copyWith(isLoading: false, error: failure.message)),
      (friends) {
        requestsResult.fold(
          (failure) => emit(state.copyWith(isLoading: false, error: failure.message)),
          (requests) => emit(state.copyWith(
            isLoading: false,
            friends: friends,
            pendingRequests: requests,
          )),
        );
      },
    );
  }

  Future<void> _onSendRequest(SocialSendFriendRequestEvent e, Emitter<SocialState> emit) async {
    final result = await socialRepository.sendFriendRequest(e.targetUserId);
    result.fold(
      (failure) => emit(state.copyWith(error: failure.message)),
      (_) => null, // Socket will handle notifications
    );
  }

  Future<void> _onRequestReceived(SocialFriendRequestReceivedEvent e, Emitter<SocialState> emit) async {
    add(const SocialFetchFriendsEvent());
  }

  Future<void> _onInviteToRoom(SocialInviteToRoomEvent e, Emitter<SocialState> emit) async {
    socketService.inviteToRoom(e.targetUserId, e.roomId, e.roomName);
  }

  Future<void> _onUserOnline(SocialUserOnlineEvent e, Emitter<SocialState> emit) async {
    emit(state.copyWith(onlineUserIds: {...state.onlineUserIds, e.userId}));
  }

  Future<void> _onUserOffline(SocialUserOfflineEvent e, Emitter<SocialState> emit) async {
    final updated = Set<String>.from(state.onlineUserIds)..remove(e.userId);
    emit(state.copyWith(onlineUserIds: updated));
  }
}
