// lib/features/auth/data/models/auth_user_model.dart

import '../../domain/entities/auth_user.dart';

class AuthUserModel extends AuthUser {
  const AuthUserModel({
    required super.id,
    required super.username,
    required super.email,
    required super.displayName,
    super.avatarUrl,
    super.bio,
    super.coins = 0,
    super.xp = 0,
    required super.status,
    required super.level,
  });

  factory AuthUserModel.fromJson(Map<String, dynamic> json) {
    return AuthUserModel(
      id: json['id'] as String? ?? json['_id']?.toString() ?? '',
      username: json['username'] as String? ?? '',
      email: json['email'] as String? ?? '',
      displayName: (json['displayName'] ?? json['username']) as String? ?? '',
      avatarUrl: json['avatarUrl'] as String?,
      bio: json['bio'] as String?,
      coins: json['coins'] as int? ?? 0,
      xp: json['xp'] as int? ?? 0,
      status: json['status'] as String? ?? 'offline',
      level: json['level'] as int? ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'displayName': displayName,
      'avatarUrl': avatarUrl,
      'bio': bio,
      'coins': coins,
      'xp': xp,
      'status': status,
      'level': level,
    };
  }
}
