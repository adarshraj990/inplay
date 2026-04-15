// lib/core/network/dio_client.dart — Dio HTTP client with interceptors
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/app_config.dart';
import '../errors/app_error.dart';

class DioClient {
  static DioClient? _instance;
  late final Dio dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  DioClient._() {
    dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.baseUrl,
        connectTimeout: Duration(milliseconds: AppConfig.connectionTimeoutMs),
        receiveTimeout: Duration(milliseconds: AppConfig.receiveTimeoutMs),
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      ),
    );

    dio.interceptors.addAll([
      _AuthInterceptor(_storage),
      _LoggingInterceptor(),
      _ErrorInterceptor(),
    ]);
  }

  static DioClient get instance {
    _instance ??= DioClient._();
    return _instance!;
  }

  Dio get client => dio;
}

// ── Auth Interceptor ──────────────────────────────────────────────────────────
class _AuthInterceptor extends Interceptor {
  final FlutterSecureStorage storage;
  const _AuthInterceptor(this.storage);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await storage.read(key: 'access_token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      // TODO: Implement token refresh logic
      await storage.delete(key: 'access_token');
    }
    handler.next(err);
  }
}

// ── Logging Interceptor ───────────────────────────────────────────────────────
class _LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (AppConfig.isDebug) {
      // ignore: avoid_print
      print('➡️  ${options.method} ${options.path}');
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (AppConfig.isDebug) {
      // ignore: avoid_print
      print('✅ ${response.statusCode} ${response.requestOptions.path}');
    }
    handler.next(response);
  }
}

// ── Error Interceptor ─────────────────────────────────────────────────────────
class _ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final AppError mapped;
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout) {
      mapped = NetworkError('Connection timed out. Check your internet.');
    } else if (err.response != null) {
      final status = err.response!.statusCode;
      final message = err.response?.data?['message'] ?? 'Unknown error';
      switch (status) {
        case 401:
          mapped = UnauthorizedError(message);
        case 403:
          mapped = ForbiddenError(message);
        case 404:
          mapped = NotFoundError(message);
        case 422:
          mapped = ValidationError(message);
        default:
          mapped = ServerError(message);
      }
    } else {
      mapped = NetworkError('No internet connection');
    }
    handler.reject(DioException(
      requestOptions: err.requestOptions,
      error: mapped,
      type: err.type,
    ));
  }
}
