// lib/features/auth/domain/entities/auth_user.dart

import 'package:equatable/equatable.dart';

class AuthUser extends Equatable {
  final String id;
  final String username;
  final String displayName;
  final String? avatarUrl;
  final String? bio;
  final String email;
  final int coins;
  final int xp;
  final String status;
  final int level;

  const AuthUser({
    required this.id,
    required this.username,
    required this.email,
    required this.displayName,
    this.avatarUrl,
    this.bio,
    this.coins = 0,
    this.xp = 0,
    required this.status,
    required this.level,
  });

  @override
  List<Object?> get props => [id, username, email, displayName, avatarUrl, bio, coins, xp, status, level];
}
