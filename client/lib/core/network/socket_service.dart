// lib/core/network/socket_service.dart — Socket.io wrapper with namespaces
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/app_config.dart';

class SocketService {
  static SocketService? _instance;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  io.Socket? _chat;
  io.Socket? _game;
  io.Socket? _voice;
  io.Socket? _social;

  SocketService._();

  static SocketService get instance {
    _instance ??= SocketService._();
    return _instance!;
  }

  // ── Connect all namespaces ──────────────────────────────────
  Future<void> connectAll() async {
    final token = await _storage.read(key: 'access_token');
    final opts = io.OptionBuilder()
        .setTransports(['websocket'])
        .setAuth({'token': token})
        .enableAutoConnect()
        .enableReconnection()
        .setReconnectionAttempts(double.infinity.toInt())
        .setReconnectionDelay(1000)
        .build();

    _chat = io.io(AppConfig.wsChat, opts);
    _game = io.io(AppConfig.wsGame, opts);
    _voice = io.io(AppConfig.wsVoice, opts);
    _social = io.io(AppConfig.wsSocial, opts);

    _setupListeners();
  }

  void _setupListeners() {
    for (final socket in [_chat, _game, _voice, _social]) {
      socket?.onConnect((_) => print('🔌 Socket connected: ${socket.nsp}'));
      socket?.onDisconnect((_) => print('🔌 Socket disconnected: ${socket.nsp}'));
      socket?.onConnectError((e) => print('❌ Socket connect error: $e'));
    }
  }

  void disconnectAll() {
    _chat?.disconnect();
    _game?.disconnect();
    _voice?.disconnect();
    _social?.disconnect();
  }

  // ── Namespace accessors ─────────────────────────────────────
  io.Socket get chat => _chat!;
  io.Socket get game => _game!;
  io.Socket get voice => _voice!;
  io.Socket get social => _social!;

  // ── Chat helpers ────────────────────────────────────────────
  void joinRoom(String roomId) => _chat?.emit('room:join', {'roomId': roomId});
  void leaveRoom(String roomId) => _chat?.emit('room:leave', {'roomId': roomId});

  void sendMessage({
    required String roomId,
    required String content,
    String type = 'text',
    String? replyToId,
  }) {
    _chat?.emit('message:send', {
      'roomId': roomId,
      'content': content,
      'type': type,
      if (replyToId != null) 'replyToId': replyToId,
    });
  }

  void startTyping(String roomId) => _chat?.emit('typing:start', {'roomId': roomId});
  void stopTyping(String roomId) => _chat?.emit('typing:stop', {'roomId': roomId});

  // ── Game helpers ────────────────────────────────────────────
  void joinGameSession(String sessionId, String gameType) {
    _game?.emit('session:join', {'sessionId': sessionId, 'gameType': gameType});
  }

  void sendPlayerAction({
    required String sessionId,
    required String gameType,
    required Map<String, dynamic> action,
  }) {
    _game?.emit('player:action', {
      'sessionId': sessionId,
      'gameType': gameType,
      'action': action,
    });
  }

  // ── Social helpers ──────────────────────────────────────────
  void sendFriendRequest(String targetUserId) {
    _social?.emit('friend:request', {'targetUserId': targetUserId});
  }

  void inviteToRoom(String targetUserId, String roomId, String roomName) {
    _social?.emit('room:invite', {
      'targetUserId': targetUserId,
      'roomId': roomId,
      'roomName': roomName,
    });
  }
}
