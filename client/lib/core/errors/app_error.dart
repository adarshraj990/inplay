// lib/core/errors/app_error.dart — Typed error hierarchy (mirrors server)
abstract class AppError implements Exception {
  final String message;
  const AppError(this.message);

  @override
  String toString() => '$runtimeType: $message';
}

class NetworkError extends AppError {
  const NetworkError(super.message);
}

class UnauthorizedError extends AppError {
  const UnauthorizedError(super.message);
}

class ForbiddenError extends AppError {
  const ForbiddenError(super.message);
}

class NotFoundError extends AppError {
  const NotFoundError(super.message);
}

class ValidationError extends AppError {
  const ValidationError(super.message);
}

class ServerError extends AppError {
  const ServerError(super.message);
}

class CacheError extends AppError {
  const CacheError(super.message);
}
