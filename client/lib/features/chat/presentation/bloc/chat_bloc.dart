// lib/features/chat/presentation/bloc/chat_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../../core/network/socket_service.dart';
import '../../domain/repositories/i_chat_repository.dart';

// ── Message model ──────────────────────────────────────────────────────────────
class ChatMessage extends Equatable {
  final String id;
  final String roomId;
  final String senderId;
  final String senderName;
  final String? avatarUrl;
  final String content;
  final String type;
  final String? replyToId;
  final DateTime timestamp;

  const ChatMessage({
    required this.id,
    required this.roomId,
    required this.senderId,
    required this.senderName,
    this.avatarUrl,
    required this.content,
    required this.type,
    this.replyToId,
    required this.timestamp,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    final senderObj = json['senderId'] as Map<String, dynamic>?;
    return ChatMessage(
      id: json['id'] ?? json['_id']?.toString() ?? '',
      roomId: json['roomId'] ?? '',
      senderId: senderObj?['id'] ?? json['senderId'] ?? '',
      senderName: senderObj?['displayName'] ?? senderObj?['username'] ?? 'User',
      avatarUrl: senderObj?['avatarUrl'],
      content: json['content'] ?? '',
      type: json['type'] ?? 'text',
      replyToId: json['replyToId'],
      timestamp: DateTime.parse(json['createdAt'] ?? json['timestamp'] ?? DateTime.now().toIso8601String()),
    );
  }

  @override
  List<Object?> get props => [id];
}

// ── Events ──────────────────────────────────────────────────────────────────────
abstract class ChatEvent extends Equatable {
  const ChatEvent();
  @override
  List<Object?> get props => [];
}

class ChatJoinRoomEvent extends ChatEvent {
  final String roomId;
  const ChatJoinRoomEvent(this.roomId);
  @override List<Object?> get props => [roomId];
}

class ChatLeaveRoomEvent extends ChatEvent {
  final String roomId;
  const ChatLeaveRoomEvent(this.roomId);
  @override List<Object?> get props => [roomId];
}

class ChatSendMessageEvent extends ChatEvent {
  final String roomId;
  final String content;
  final String? replyToId;
  const ChatSendMessageEvent({required this.roomId, required this.content, this.replyToId});
  @override List<Object?> get props => [roomId, content];
}

class ChatMessageReceivedEvent extends ChatEvent {
  final ChatMessage message;
  const ChatMessageReceivedEvent(this.message);
  @override List<Object?> get props => [message];
}

class ChatTypingStartEvent extends ChatEvent {
  final String roomId;
  final String userId;
  const ChatTypingStartEvent({required this.roomId, required this.userId});
  @override List<Object?> get props => [roomId, userId];
}

class ChatTypingStopEvent extends ChatEvent {
  final String roomId;
  final String userId;
  const ChatTypingStopEvent({required this.roomId, required this.userId});
  @override List<Object?> get props => [roomId, userId];
}

// ── States ──────────────────────────────────────────────────────────────────────
class ChatState extends Equatable {
  final List<ChatMessage> messages;
  final bool isLoading;
  final Set<String> typingUserIds;
  final String? currentRoomId;
  final String? error;

  const ChatState({
    this.messages = const [],
    this.isLoading = false,
    this.typingUserIds = const {},
    this.currentRoomId,
    this.error,
  });

  ChatState copyWith({
    List<ChatMessage>? messages,
    bool? isLoading,
    Set<String>? typingUserIds,
    String? currentRoomId,
    String? error,
  }) {
    return ChatState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      typingUserIds: typingUserIds ?? this.typingUserIds,
      currentRoomId: currentRoomId ?? this.currentRoomId,
      error: error ?? this.error,
    );
  }

  @override
  List<Object?> get props => [messages, isLoading, typingUserIds, currentRoomId, error];
}

// ── BLoC ────────────────────────────────────────────────────────────────────────
class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final SocketService socketService;
  final IChatRepository chatRepository;

  ChatBloc({
    required this.socketService,
    required this.chatRepository,
  }) : super(const ChatState()) {
    on<ChatJoinRoomEvent>(_onJoinRoom);
    on<ChatLeaveRoomEvent>(_onLeaveRoom);
    on<ChatSendMessageEvent>(_onSendMessage);
    on<ChatMessageReceivedEvent>(_onMessageReceived);
    on<ChatTypingStartEvent>(_onTypingStart);
    on<ChatTypingStopEvent>(_onTypingStop);

    _listenToSocketEvents();
  }

  void _listenToSocketEvents() {
    socketService.chat.on('message:new', (data) {
      if (data != null && data['roomId'] == state.currentRoomId) {
        add(ChatMessageReceivedEvent(ChatMessage.fromJson(data)));
      }
    });

    socketService.chat.on('typing:user_started', (data) {
      if (data != null && data['roomId'] == state.currentRoomId) {
        add(ChatTypingStartEvent(
          roomId: data['roomId'],
          userId: data['userId'],
        ));
      }
    });

    socketService.chat.on('typing:user_stopped', (data) {
      if (data != null && data['roomId'] == state.currentRoomId) {
        add(ChatTypingStopEvent(
          roomId: data['roomId'],
          userId: data['userId'],
        ));
      }
    });
  }

  Future<void> _onJoinRoom(ChatJoinRoomEvent e, Emitter<ChatState> emit) async {
    emit(state.copyWith(currentRoomId: e.roomId, messages: [], isLoading: true, error: null));
    
    // 1. Join socket room
    socketService.joinRoom(e.roomId);
    
    // 2. Fetch history
    final result = await chatRepository.getMessageHistory(e.roomId);
    
    result.fold(
      (failure) => emit(state.copyWith(isLoading: false, error: failure.message)),
      (messages) => emit(state.copyWith(
        isLoading: false, 
        messages: messages.reversed.toList(), // Backend returns latest first
      )),
    );
  }

  Future<void> _onLeaveRoom(ChatLeaveRoomEvent e, Emitter<ChatState> emit) async {
    socketService.leaveRoom(e.roomId);
    emit(state.copyWith(currentRoomId: null, messages: [], typingUserIds: {}));
  }

  Future<void> _onSendMessage(ChatSendMessageEvent e, Emitter<ChatState> emit) async {
    socketService.sendMessage(
      roomId: e.roomId, 
      content: e.content, 
      replyToId: e.replyToId,
    );
  }

  Future<void> _onMessageReceived(ChatMessageReceivedEvent e, Emitter<ChatState> emit) async {
    // Avoid duplicates if socket sends back own message
    if (state.messages.any((m) => m.id == e.message.id)) return;
    emit(state.copyWith(messages: [...state.messages, e.message]));
  }

  Future<void> _onTypingStart(ChatTypingStartEvent e, Emitter<ChatState> emit) async {
    emit(state.copyWith(typingUserIds: {...state.typingUserIds, e.userId}));
  }

  Future<void> _onTypingStop(ChatTypingStopEvent e, Emitter<ChatState> emit) async {
    final updated = Set<String>.from(state.typingUserIds)..remove(e.userId);
    emit(state.copyWith(typingUserIds: updated));
  }
}
