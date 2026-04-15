import 'package:dartz/dartz.dart';
import 'package:indplay_client/core/errors/app_error.dart';
import 'package:indplay_client/core/network/dio_client.dart';
import 'package:indplay_client/features/auth/domain/entities/auth_user.dart';
import 'package:indplay_client/features/social/domain/repositories/i_social_repository.dart';

class SocialRepositoryImpl implements ISocialRepository {
  final DioClient dioClient;

  SocialRepositoryImpl({required this.dioClient});

  @override
  Future<Either<AppError, List<AuthUser>>> getFriends() async {
    try {
      final response = await dioClient.client.get('/friends');
      final List data = response.data['data'];
      return Right(data.map((u) => _parseUser(u)).toList());
    } catch (e) {
      if (e is AppError) return Left(e);
      return Left(ServerError(e.toString()));
    }
  }

  @override
  Future<Either<AppError, List<AuthUser>>> getPendingRequests() async {
    try {
      final response = await dioClient.client.get('/friends/requests');
      final List data = response.data['data'];
      return Right(data.map((u) => _parseUser(u)).toList());
    } catch (e) {
      if (e is AppError) return Left(e);
      return Left(ServerError(e.toString()));
    }
  }

  @override
  Future<Either<AppError, void>> sendFriendRequest(String targetUserId) async {
    try {
      await dioClient.client.post('/friends/request', data: {'targetUserId': targetUserId});
      return const Right(null);
    } catch (e) {
      if (e is AppError) return Left(e);
      return Left(ServerError(e.toString()));
    }
  }

  @override
  Future<Either<AppError, void>> acceptFriendRequest(String requestId) async {
    try {
      await dioClient.client.post('/friends/accept/$requestId');
      return const Right(null);
    } catch (e) {
      if (e is AppError) return Left(e);
      return Left(ServerError(e.toString()));
    }
  }

  @override
  Future<Either<AppError, void>> unfriend(String friendId) async {
    try {
      await dioClient.client.delete('/friends/unfriend/$friendId');
      return const Right(null);
    } catch (e) {
      if (e is AppError) return Left(e);
      return Left(ServerError(e.toString()));
    }
  }

  AuthUser _parseUser(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] ?? json['_id']?.toString() ?? '',
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      displayName: json['displayName'] ?? json['username'] ?? '',
      avatarUrl: json['avatarUrl'],
      bio: json['bio'],
      coins: json['coins'] ?? 0,
      xp: json['xp'] ?? 0,
      status: json['status'] ?? 'offline',
      level: json['level'] ?? 1,
    );
  }
}
