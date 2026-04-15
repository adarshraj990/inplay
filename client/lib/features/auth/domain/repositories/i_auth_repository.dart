// lib/features/auth/domain/repositories/i_auth_repository.dart

import 'dart:io';
import 'package:dartz/dartz.dart';
import '../../../../core/errors/app_error.dart';
import '../entities/auth_user.dart';

abstract class IAuthRepository {
  Future<Either<AppError, AuthUser>> login(String email, String password);
  Future<Either<AppError, AuthUser>> register(
    String username,
    String email,
    String password,
    String displayName,
  );
  Future<Either<AppError, AuthUser>> uploadAvatar(File imageFile);
  Future<Either<AppError, void>> logout();
  Future<Either<AppError, AuthUser>> checkAuthStatus();
  Future<Either<AppError, AuthUser?>> getCachedAuth();
}
