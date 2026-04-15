// lib/features/auth/presentation/bloc/auth_event.dart

import 'dart:io';
import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class AuthCheckStatusEvent extends AuthEvent {
  const AuthCheckStatusEvent();
}

class AuthLoginEvent extends AuthEvent {
  final String email;
  final String password;

  const AuthLoginEvent({required this.email, required this.password});

  @override
  List<Object?> get props => [email, password];
}

class AuthRegisterEvent extends AuthEvent {
  final String username;
  final String email;
  final String password;
  final String displayName;
  final File? avatarFile; // Avatar upload during registration logic

  const AuthRegisterEvent({
    required this.username,
    required this.email,
    required this.password,
    required this.displayName,
    this.avatarFile,
  });

  @override
  List<Object?> get props => [username, email, password, displayName, avatarFile];
}

class AuthLogoutEvent extends AuthEvent {
  const AuthLogoutEvent();
}

class AuthUpdateAvatarEvent extends AuthEvent {
  final File avatarFile;

  const AuthUpdateAvatarEvent(this.avatarFile);

  @override
  List<Object?> get props => [avatarFile];
}
