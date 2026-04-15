// lib/main.dart — Indplay Flutter Entry Point
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:firebase_core/firebase_core.dart';

import 'core/config/app_config.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'injection/injection_container.dart' as di;
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/chat/presentation/bloc/chat_bloc.dart';
import 'features/gaming/presentation/bloc/game_bloc.dart';
import 'features/social/presentation/bloc/social_bloc.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // ── System UI configuration ────────────────────────────────
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0A0A0F),
    ),
  );
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // ── Load environment variables ─────────────────────────────
  await dotenv.load(fileName: '.env');

  // ── Firebase initialization ────────────────────────────────
  await Firebase.initializeApp();

  // ── Dependency injection ───────────────────────────────────
  await di.init();

  runApp(const IndplayApp());
}

class IndplayApp extends StatelessWidget {
  const IndplayApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        // Global BLoCs — available throughout the entire app tree
        BlocProvider<AuthBloc>(
          create: (_) => di.sl<AuthBloc>()..add(AuthCheckStatusEvent()),
        ),
        BlocProvider<ChatBloc>(
          create: (_) => di.sl<ChatBloc>(),
        ),
        BlocProvider<GameBloc>(
          create: (_) => di.sl<GameBloc>(),
        ),
        BlocProvider<SocialBloc>(
          create: (_) => di.sl<SocialBloc>(),
        ),
      ],
      child: MaterialApp.router(
        title: 'Indplay',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        routerConfig: AppRouter.router,
      ),
    );
  }
}
