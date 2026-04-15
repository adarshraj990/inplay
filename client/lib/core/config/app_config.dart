// lib/core/config/app_config.dart — App-wide configuration constants
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  AppConfig._();

  static String get baseUrl =>
      dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000/api/v1';

  static String get socketUrl =>
      dotenv.env['SOCKET_URL'] ?? 'http://localhost:3000';

  static String get wsChat => '$socketUrl/chat';
  static String get wsGame => '$socketUrl/game';
  static String get wsVoice => '$socketUrl/voice';
  static String get wsSocial => '$socketUrl/social';

  static int get connectionTimeoutMs => 15000;
  static int get receiveTimeoutMs => 30000;

  static bool get isDebug => const bool.fromEnvironment('dart.vm.product') == false;
}
