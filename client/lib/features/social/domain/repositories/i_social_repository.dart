import 'package:dartz/dartz.dart';
import 'package:indplay_client/core/errors/app_error.dart';
import 'package:indplay_client/features/auth/domain/entities/auth_user.dart';

abstract class ISocialRepository {
  Future<Either<AppError, List<AuthUser>>> getFriends();
  Future<Either<AppError, List<AuthUser>>> getPendingRequests();
  Future<Either<AppError, void>> sendFriendRequest(String targetUserId);
  Future<Either<AppError, void>> acceptFriendRequest(String requestId);
  Future<Either<AppError, void>> unfriend(String friendId);
}
