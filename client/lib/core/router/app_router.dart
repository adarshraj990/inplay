// lib/core/router/app_router.dart — GoRouter navigation with guards
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/auth/presentation/bloc/auth_state.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/chat/presentation/pages/chat_room_page.dart';
import '../../features/gaming/presentation/pages/game_lobby_page.dart';
import '../../features/social/presentation/pages/friends_page.dart';
import '../../features/voice/presentation/pages/voice_channel_page.dart';
import '../../features/auth/presentation/pages/profile_page.dart';
// TODO: import home page shell

class AppRouter {
  AppRouter._();

  static final _rootNavigatorKey = GlobalKey<NavigatorState>();

  static final GoRouter router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/login',
    debugLogDiagnostics: true,

    redirect: (BuildContext context, GoRouterState state) {
      final authState = context.read<AuthBloc>().state;
      final isAuthenticated = authState is AuthAuthenticated;
      final isAuthRoute = state.matchedLocation.startsWith('/login') ||
          state.matchedLocation.startsWith('/register');

      if (!isAuthenticated && !isAuthRoute) return '/login';
      if (isAuthenticated && isAuthRoute) return '/home';
      return null;
    },

    routes: [
      // ── Auth Routes ──────────────────────────────────────
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (_, __) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (_, __) => const RegisterPage(),
      ),

      // ── Main Shell ───────────────────────────────────────
      GoRoute(
        path: '/home',
        name: 'home',
        builder: (_, __) => Scaffold(
          appBar: AppBar(
            title: const Text('WePlay'),
            actions: [
              Builder(
                builder: (context) => IconButton(
                  icon: const Icon(Icons.account_circle),
                  onPressed: () => context.goNamed('profile'),
                ),
              ),
            ],
          ),
          body: const Center(child: Text('Home — TODO: Add HomeShell')),
        ),
        routes: [
          // Chat
          GoRoute(
            path: 'room/:roomId',
            name: 'chat-room',
            builder: (_, state) => ChatRoomPage(
              roomId: state.pathParameters['roomId']!,
            ),
          ),
          // Lobby
          GoRoute(
            path: 'game/:sessionId',
            name: 'game-lobby',
            builder: (_, state) => GameLobbyPage(
              sessionId: state.pathParameters['sessionId']!,
            ),
          ),
          // Friends
          GoRoute(
            path: 'friends',
            name: 'friends',
            builder: (_, __) => const FriendsPage(),
          ),
          // Voice channel
          GoRoute(
            path: 'voice/:channelId',
            name: 'voice-channel',
            builder: (_, state) => VoiceChannelPage(
              channelId: state.pathParameters['channelId']!,
            ),
          ),
          // Profile
          GoRoute(
            path: 'profile',
            name: 'profile',
            builder: (_, __) => const ProfilePage(),
          ),
        ],
      ),
    ],

    errorBuilder: (_, state) => Scaffold(
      body: Center(
        child: Text('Route not found: ${state.uri}',
            style: const TextStyle(color: Colors.white)),
      ),
    ),
  );
}
