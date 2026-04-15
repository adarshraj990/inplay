// lib/features/auth/presentation/bloc/auth_bloc.dart

import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/repositories/i_auth_repository.dart';
import 'auth_event.dart';
import 'auth_state.dart';
export 'auth_event.dart';
export 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final IAuthRepository authRepository;

  AuthBloc({required this.authRepository}) : super(AuthInitial()) {
    on<AuthCheckStatusEvent>(_onCheckStatus);
    on<AuthLoginEvent>(_onLogin);
    on<AuthRegisterEvent>(_onRegister);
    on<AuthLogoutEvent>(_onLogout);
    on<AuthUpdateAvatarEvent>(_onUpdateAvatar);
  }

  Future<void> _onCheckStatus(AuthCheckStatusEvent event, Emitter<AuthState> emit) async {
    // 1. Check local cache first for immediate "Stay Logged In" experience
    final cachedResult = await authRepository.getCachedAuth();
    cachedResult.fold(
      (_) => null,
      (user) {
        if (user != null) {
          emit(AuthAuthenticated(user));
        }
      },
    );

    // 2. Background sync with server to ensure session is still valid
    final result = await authRepository.checkAuthStatus();
    result.fold(
      (failure) {
        // If server says unauthorized, clear local state
        if (state is AuthAuthenticated) {
          emit(AuthUnauthenticated());
        }
      },
      (user) => emit(AuthAuthenticated(user)),
    );
  }

  Future<void> _onLogin(AuthLoginEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final result = await authRepository.login(event.email, event.password);
    result.fold(
      (failure) => emit(AuthFailure(failure.message)),
      (user) => emit(AuthAuthenticated(user)),
    );
  }

  Future<void> _onRegister(AuthRegisterEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final result = await authRepository.register(
      event.username,
      event.email,
      event.password,
      event.displayName,
    );

    await result.fold(
      (failure) async => emit(AuthFailure(failure.message)),
      (user) async {
        // Handle optional avatar upload right after registration
        if (event.avatarFile != null) {
          final avatarResult = await authRepository.uploadAvatar(event.avatarFile!);
          avatarResult.fold(
            (fetchFailure) => emit(AuthFailure(fetchFailure.message)),
            (updatedUser) => emit(AuthAuthenticated(updatedUser)),
          );
        } else {
          emit(AuthAuthenticated(user));
        }
      },
    );
  }

  Future<void> _onUpdateAvatar(AuthUpdateAvatarEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final result = await authRepository.uploadAvatar(event.avatarFile);
    result.fold(
      (failure) => emit(AuthFailure(failure.message)),
      (user) => emit(AuthAuthenticated(user)),
    );
  }

  Future<void> _onLogout(AuthLogoutEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    await authRepository.logout();
    emit(AuthUnauthenticated());
  }
}
