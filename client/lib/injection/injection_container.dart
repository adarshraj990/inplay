// lib/injection/injection_container.dart — GetIt DI setup
import 'package:get_it/get_it.dart';
import '../core/network/dio_client.dart';
import '../core/network/socket_service.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../features/auth/data/datasources/auth_remote_datasource.dart';
import '../features/auth/domain/repositories/i_auth_repository.dart';
import '../features/auth/data/repositories/auth_repository_impl.dart';
import '../features/auth/presentation/bloc/auth_bloc.dart';
import '../features/chat/presentation/bloc/chat_bloc.dart';
import '../features/gaming/presentation/bloc/game_bloc.dart';
import '../features/social/presentation/bloc/social_bloc.dart';

import '../features/chat/domain/repositories/i_chat_repository.dart';
import '../features/chat/data/repositories/chat_repository_impl.dart';
import '../features/social/domain/repositories/i_social_repository.dart';
import '../features/social/data/repositories/social_repository_impl.dart';

final sl = GetIt.instance;

Future<void> init() async {
  // ── Core / Storage ─────────────────────────────────────────
  sl.registerLazySingleton<DioClient>(() => DioClient.instance);
  sl.registerLazySingleton<SocketService>(() => SocketService.instance);
  sl.registerLazySingleton<FlutterSecureStorage>(() => const FlutterSecureStorage());

  // ── Data Sources ──────────────────────────────────────────
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(dioClient: sl(), secureStorage: sl()),
  );

  // ── Repositories ──────────────────────────────────────────
  sl.registerLazySingleton<IAuthRepository>(
    () => AuthRepositoryImpl(remoteDataSource: sl()),
  );
  sl.registerLazySingleton<IChatRepository>(
    () => ChatRepositoryImpl(dioClient: sl()),
  );
  sl.registerLazySingleton<ISocialRepository>(
    () => SocialRepositoryImpl(dioClient: sl()),
  );

  // ── BLoCs ─────────────────────────────────────────────────
  sl.registerFactory<AuthBloc>(() => AuthBloc(authRepository: sl()));
  sl.registerFactory<ChatBloc>(() => ChatBloc(socketService: sl(), chatRepository: sl()));
  sl.registerFactory<GameBloc>(() => GameBloc(socketService: sl()));
  sl.registerFactory<SocialBloc>(() => SocialBloc(socketService: sl(), socialRepository: sl()));
}
