import 'package:dartz/dartz.dart';
import '../../../../core/errors/app_error.dart';
import '../../../../core/network/dio_client.dart';
import '../../domain/repositories/i_chat_repository.dart';
import '../../presentation/bloc/chat_bloc.dart';

class ChatRepositoryImpl implements IChatRepository {
  final DioClient dioClient;

  ChatRepositoryImpl({required this.dioClient});

  @override
  Future<Either<AppError, List<ChatMessage>>> getMessageHistory(
    String roomId, {
    int limit = 50,
    String? beforeTimestamp,
  }) async {
    try {
      final response = await dioClient.client.get(
        '/chat/$roomId/messages',
        queryParameters: {
          'limit': limit,
          if (beforeTimestamp != null) 'before': beforeTimestamp,
        },
      );

      final List data = response.data['data'];
      final messages = data.map((m) => _parseMessage(m)).toList();
      
      return Right(messages);
    } catch (e) {
      if (e is AppError) return Left(e);
      return Left(ServerError(e.toString()));
    }
  }

  @override
  Future<Either<AppError, void>> markAsRead(String roomId) async {
    try {
      await dioClient.client.post('/chat/$roomId/mark-read');
      return const Right(null);
    } catch (e) {
      if (e is AppError) return Left(e);
      return Left(ServerError(e.toString()));
    }
  }

  ChatMessage _parseMessage(Map<String, dynamic> json) {
    // Assuming backend returns populated senderId as search results does
    final senderObj = json['senderId'] as Map<String, dynamic>?;
    
    return ChatMessage(
      id: json['id'] ?? json['_id'].toString(),
      roomId: json['roomId'],
      senderId: senderObj?['id'] ?? json['senderId'],
      senderName: senderObj?['displayName'] ?? senderObj?['username'] ?? 'User',
      avatarUrl: senderObj?['avatarUrl'],
      content: json['content'],
      type: json['type'],
      replyToId: json['replyToId'],
      timestamp: DateTime.parse(json['createdAt']),
    );
  }
}
