import 'package:dartz/dartz.dart';
import '../../../../core/errors/app_error.dart';
import '../../presentation/bloc/chat_bloc.dart';

abstract class IChatRepository {
  Future<Either<AppError, List<ChatMessage>>> getMessageHistory(
    String roomId, {
    int limit = 50,
    String? beforeTimestamp,
  });

  Future<Either<AppError, void>> markAsRead(String roomId);
}
