// lib/features/auth/data/datasources/auth_remote_datasource.dart

import 'dart:io';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../core/network/dio_client.dart';
import '../models/auth_user_model.dart';
import '../../../../core/errors/app_error.dart';

abstract class AuthRemoteDataSource {
  Future<AuthUserModel> login(String email, String password);
  Future<AuthUserModel> register(
      String username, String email, String password, String displayName);
  Future<AuthUserModel> uploadAvatar(File imageFile);
  Future<void> logout();
  Future<AuthUserModel> getProfile();
  Future<Map<String, dynamic>?> getCachedAuth();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final DioClient dioClient;
  final FlutterSecureStorage secureStorage;

  AuthRemoteDataSourceImpl({
    required this.dioClient,
    required this.secureStorage,
  });

  @override
  Future<AuthUserModel> login(String email, String password) async {
    final response = await dioClient.client.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    return _handleAuthResponse(response.data);
  }

  @override
  Future<AuthUserModel> register(
      String username, String email, String password, String displayName) async {
    final response = await dioClient.client.post('/auth/register', data: {
      'username': username,
      'email': email,
      'password': password,
      'displayName': displayName,
    });
    return _handleAuthResponse(response.data);
  }

  @override
  Future<AuthUserModel> uploadAvatar(File imageFile) async {
    String fileName = imageFile.path.split('/').last;
    FormData formData = FormData.fromMap({
      "avatar": await MultipartFile.fromFile(imageFile.path, filename: fileName),
    });
    
    final response = await dioClient.client.post(
      '/users/me/avatar',
      data: formData,
    );
    
    if (response.data['success'] == true) {
      return AuthUserModel.fromJson(response.data['data']);
    } else {
      throw ServerError(response.data['message'] ?? 'Failed to upload avatar');
    }
  }

  @override
  Future<void> logout() async {
    await dioClient.client.post('/auth/logout');
    await secureStorage.delete(key: 'access_token');
    await secureStorage.delete(key: 'refresh_token');
    await secureStorage.delete(key: 'cached_auth');
  }

  @override
  Future<Map<String, dynamic>?> getCachedAuth() async {
    final cached = await secureStorage.read(key: 'cached_auth');
    if (cached != null) {
      return Map<String, dynamic>.from(const JsonDecoder().convert(cached));
    }
    return null;
  }

  @override
  Future<AuthUserModel> getProfile() async {
    final response = await dioClient.client.get('/users/me');
    if (response.data['success'] == true) {
      return AuthUserModel.fromJson(response.data['data']);
    } else {
      throw ServerError(response.data['message'] ?? 'Failed to profile');
    }
  }

  Future<AuthUserModel> _handleAuthResponse(Map<String, dynamic> data) async {
    if (data['success'] == true) {
      final payload = data['data'];
      final accessToken = payload['accessToken'];
      final refreshToken = payload['refreshToken'];
      final userJson = payload['user'];

      await secureStorage.write(key: 'access_token', value: accessToken);
      await secureStorage.write(key: 'refresh_token', value: refreshToken);
      await secureStorage.write(
        key: 'cached_auth',
        value: const JsonEncoder().convert(payload),
      );

      return AuthUserModel.fromJson(userJson);
    } else {
      throw ServerError(data['message'] ?? 'Authentication failed');
    }
  }
}
