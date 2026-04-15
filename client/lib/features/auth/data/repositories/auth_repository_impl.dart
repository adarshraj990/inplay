// lib/features/auth/data/repositories/auth_repository_impl.dart

import 'dart:io';
import 'package:dartz/dartz.dart';
import '../../../../core/errors/app_error.dart';
import '../../domain/entities/auth_user.dart';
import '../../domain/repositories/i_auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';
import '../models/auth_user_model.dart';

class AuthRepositoryImpl implements IAuthRepository {
  final AuthRemoteDataSource remoteDataSource;

  AuthRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<AppError, AuthUser>> login(String email, String password) async {
    try {
      final user = await remoteDataSource.login(email, password);
      return Right(user);
    } on AppError catch (e) {
      return Left(e);
    } catch (e) {
      return Left(ServerError(e.toString()));
    }
  }

  @override
  Future<Either<AppError, AuthUser>> register(
      String username, String email, String password, String displayName) async {
    try {
      final user = await remoteDataSource.register(username, email, password, displayName);
      return Right(user);
    } on AppError catch (e) {
      return Left(e);
    } catch (e) {
      return Left(ServerError(e.toString()));
    }
  }

  @override
  Future<Either<AppError, AuthUser>> uploadAvatar(File imageFile) async {
    try {
      final user = await remoteDataSource.uploadAvatar(imageFile);
      return Right(user);
    } on AppError catch (e) {
      return Left(e);
    } catch (e) {
      return Left(ServerError(e.toString()));
    }
  }

  @override
  Future<Either<AppError, void>> logout() async {
    try {
      await remoteDataSource.logout();
      return const Right(null);
    } on AppError catch (e) {
      return Left(e);
    } catch (e) {
      return Left(ServerError(e.toString()));
    }
  }

  @override
  Future<Either<AppError, AuthUser>> checkAuthStatus() async {
    try {
      final user = await remoteDataSource.getProfile();
      return Right(user);
    } on AppError catch (e) {
      return Left(e);
    } catch (e) {
      return Left(ServerError(e.toString()));
    }
  }

  @override
  Future<Either<AppError, AuthUser?>> getCachedAuth() async {
    try {
      final cached = await remoteDataSource.getCachedAuth();
      if (cached != null && cached['user'] != null) {
        final user = AuthUserModel.fromJson(cached['user']);
        return Right(user);
      }
      return const Right(null);
    } catch (e) {
      return Left(ServerError(e.toString()));
    }
  }
}
