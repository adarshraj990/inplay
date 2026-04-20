import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:indplay_client/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:indplay_client/features/auth/presentation/bloc/auth_state.dart';
import '../bloc/chat_bloc.dart';

class ChatRoomPage extends StatefulWidget {
  final String roomId;
  const ChatRoomPage({super.key, required this.roomId});

  @override
  State<ChatRoomPage> createState() => _ChatRoomPageState();
}

class _ChatRoomPageState extends State<ChatRoomPage> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    // Join room on enter
    context.read<ChatBloc>().add(ChatJoinRoomEvent(widget.roomId));
  }

  @override
  void dispose() {
    // Leave room on exit
    context.read<ChatBloc>().add(ChatLeaveRoomEvent(widget.roomId));
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _onSend() {
    final content = _messageController.text.trim();
    if (content.isNotEmpty) {
      context.read<ChatBloc>().add(ChatSendMessageEvent(
            roomId: widget.roomId,
            content: content,
          ));
      _messageController.clear();
      Future.delayed(const Duration(milliseconds: 100), _scrollToBottom);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF16161E),
        elevation: 1,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Room: ${widget.roomId}', style: const TextStyle(fontSize: 18, color: Colors.white)),
            BlocBuilder<ChatBloc, ChatState>(
              builder: (context, state) {
                if (state.typingUserIds.isNotEmpty) {
                  return const Text(
                    'Someone is typing...',
                    style: TextStyle(fontSize: 12, color: Color(0xFFA29BFE), fontStyle: FontStyle.italic),
                  );
                }
                return const Text('Online', style: TextStyle(fontSize: 12, color: Colors.greenAccent));
              },
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Message List
          Expanded(
            child: BlocConsumer<ChatBloc, ChatState>(
              listener: (context, state) {
                if (state.messages.isNotEmpty) {
                  _scrollToBottom();
                }
              },
              builder: (context, state) {
                if (state.isLoading && state.messages.isEmpty) {
                  return const Center(child: CircularProgressIndicator(color: Color(0xFF6C5CE7)));
                }

                if (state.error != null && state.messages.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, color: Colors.redAccent, size: 48),
                        Text(state.error!, style: const TextStyle(color: Colors.white54)),
                        TextButton(
                          onPressed: () => context.read<ChatBloc>().add(ChatJoinRoomEvent(widget.roomId)),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: state.messages.length,
                  itemBuilder: (context, index) {
                    final message = state.messages[index];
                    final authState = context.read<AuthBloc>().state;
                    final isMe = authState is AuthAuthenticated && authState.user.id == message.senderId;

                    return _MessageBubble(message: message, isMe: isMe);
                  },
                );
              },
            ),
          ),

          // Input Section
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Color(0xFF16161E),
        border: Border(top: BorderSide(color: Colors.white10)),
      ),
      child: SafeArea(
        child: Row(
          children: [
            IconButton(
              icon: const Icon(Icons.add_circle_outline, color: Colors.white54),
              onPressed: () {}, // Add media attachment logic later
            ),
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: TextField(
                  controller: _messageController,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    hintText: 'Type a message...',
                    hintStyle: TextStyle(color: Colors.white24),
                    border: InputBorder.none,
                  ),
                  onSubmitted: (_) => _onSend(),
                ),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: _onSend,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: const BoxDecoration(
                  color: Color(0xFF6C5CE7),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.send, color: Colors.white, size: 20),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final ChatMessage message;
  final bool isMe;

  const _MessageBubble({required this.message, required this.isMe});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) _buildAvatar(),
          const SizedBox(width: 8),
          Flexible(
            child: Column(
              crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                if (!isMe)
                  Padding(
                    padding: const EdgeInsets.only(left: 4, bottom: 4),
                    child: Text(
                      message.senderName,
                      style: const TextStyle(fontSize: 12, color: Colors.white54, fontWeight: FontWeight.bold),
                    ),
                  ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: isMe ? const Color(0xFF6C5CE7) : Colors.white.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(16),
                      topRight: const Radius.circular(16),
                      bottomLeft: Radius.circular(isMe ? 16 : 4),
                      bottomRight: Radius.circular(isMe ? 4 : 16),
                    ),
                  ),
                  child: Text(
                    message.content,
                    style: const TextStyle(color: Colors.white, fontSize: 15),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  timeago.format(message.timestamp),
                  style: const TextStyle(fontSize: 10, color: Colors.white24),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          if (isMe) _buildAvatar(),
        ],
      ),
    );
  }

  Widget _buildAvatar() {
    return CircleAvatar(
      radius: 16,
      backgroundColor: const Color(0xFF1A1A2E),
      backgroundImage: message.avatarUrl != null 
          ? CachedNetworkImageProvider(message.avatarUrl!) 
          : null,
      child: message.avatarUrl == null 
          ? const Icon(Icons.person, size: 16, color: Colors.white24) 
          : null,
    );
  }
}
